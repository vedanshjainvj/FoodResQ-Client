import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useFood } from '../context/FoodContext';
import { useAuth } from '../context/AuthContext';
import cloudinaryConfig from '../utils/cloudinaryConfig';
import './FoodForm.css';

const FoodForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { food, isLoading, error, getFood, createFood, updateFood } = useFood() || {};
  const auth = useAuth() || {};
  const { user } = auth;
  const isEditMode = !!id;
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    location: '',
    expiryDate: '',
    status: 'available',
    image: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    // If editing, fetch the food data
    if (isEditMode && getFood) {
      const fetchFoodData = async () => {
        try {
          const response = await getFood(id);
          // Format date to YYYY-MM-DD for input field
          const expiryDate = new Date(response.data.expiryDate)
            .toISOString()
            .split('T')[0];
          
          setFormData({
            title: response.data.title,
            description: response.data.description,
            quantity: response.data.quantity,
            location: response.data.location,
            expiryDate,
            status: response.data.status,
            image: response.data.image || ''
          });
        } catch (error) {
          console.error('Failed to fetch food data:', error);
          setSubmitError('Failed to load food data. Please try again.');
        }
      };

      fetchFoodData();
    }
  }, [isEditMode, id, getFood, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // File validation
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      setFormErrors({
        ...formErrors,
        image: 'Please upload a valid image (JPEG, PNG, or WebP)'
      });
      return;
    }
    
    if (file.size > maxSize) {
      setFormErrors({
        ...formErrors,
        image: 'Image size must be less than 5MB'
      });
      return;
    }
    
    setImageFile(file);
    setFormErrors({
      ...formErrors,
      image: ''
    });
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const uploadImageToCloudinary = async () => {
    if (!imageFile) return null;
    
    // If local images are enabled, return the data URL directly
    if (cloudinaryConfig.useLocalImages) {
      try {
        const dataUrl = await cloudinaryConfig.getLocalImageUrl(imageFile);
        return dataUrl;
      } catch (error) {
        console.error('Error creating local image URL:', error);
        setFormErrors({
          ...formErrors,
          image: 'Failed to process image. Please try again.'
        });
        return null;
      }
    }
    
    // Otherwise try uploading to Cloudinary
    try {
      setUploadingImage(true);
      
      // Create form data for upload
      const data = new FormData();
      data.append('file', imageFile);
      data.append('upload_preset', cloudinaryConfig.uploadPreset);
      data.append('cloud_name', cloudinaryConfig.cloudName);
      
      // Use XHR for upload progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.open('POST', cloudinaryConfig.getUploadUrl());
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded * 100) / event.total);
            setUploadProgress(progress);
          }
        };
        
        xhr.onload = async () => {
          if (xhr.status === 200) {
            const response = JSON.parse(xhr.responseText);
            resolve(response.secure_url);
          } else {
            console.warn('Cloudinary upload failed, falling back to local storage');
            // Fallback to local image if Cloudinary fails
            try {
              const dataUrl = await cloudinaryConfig.getLocalImageUrl(imageFile);
              resolve(dataUrl);
            } catch (error) {
              reject(new Error('Image upload failed'));
            }
          }
        };
        
        xhr.onerror = async () => {
          console.warn('Cloudinary upload failed with network error, falling back to local storage');
          // Fallback to local image if Cloudinary fails
          try {
            const dataUrl = await cloudinaryConfig.getLocalImageUrl(imageFile);
            resolve(dataUrl);
          } catch (error) {
            reject(new Error('Image upload failed'));
          }
        };
        
        xhr.send(data);
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      // Try local fallback as last resort
      try {
        console.warn('Attempting local fallback after error');
        const dataUrl = await cloudinaryConfig.getLocalImageUrl(imageFile);
        return dataUrl;
      } catch (localError) {
        setFormErrors({
          ...formErrors,
          image: 'Failed to upload image. Please try again.'
        });
        return null;
      }
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const validateForm = () => {
    const errors = {};
    // Required fields
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.quantity.trim()) errors.quantity = 'Quantity is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.expiryDate) errors.expiryDate = 'Expiry date is required';
    
    // Title length
    if (formData.title.length > 100) {
      errors.title = 'Title must be less than 100 characters';
    }
    
    // Description length
    if (formData.description.length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }
    
    // Expiry date validation - must be in the future
    if (formData.expiryDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expiry = new Date(formData.expiryDate);
      if (expiry < today) {
        errors.expiryDate = 'Expiry date must be in the future';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccess('');
    
    if (!validateForm()) {
      // Scroll to the first error
      const firstError = document.querySelector('.field-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    try {
      // Upload image if a new file was selected
      let imageUrl = formData.image;
      if (imageFile) {
        imageUrl = await uploadImageToCloudinary();
        if (!imageUrl && formErrors.image) {
          // If image upload failed and there's an error, return
          return;
        }
      }
      
      // Update form data with image URL
      const updatedData = {
        ...formData,
        image: imageUrl
      };
      
      if (isEditMode) {
        await updateFood(id, updatedData);
        setSuccess('Food listing updated successfully!');
        setTimeout(() => {
          navigate(`/food/${id}`);
        }, 1500);
      } else {
        const response = await createFood(updatedData);
        setSuccess('Food listing created successfully!');
        setTimeout(() => {
          navigate(`/food/${response.data._id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(error.response?.data?.error || 'Failed to save food listing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (isLoading && isEditMode) {
    return (
      <div className="food-form-loading">
        <div className="loading-spinner"></div>
        <p>Loading food data...</p>
      </div>
    );
  }

  return (
    <div className="food-form-container">
      <div className="food-form-header">
        <div className="header-content">
          <h1>{isEditMode ? 'Edit Food Listing' : 'Add New Food Listing'}</h1>
          <p className="header-description">
            {isEditMode 
              ? 'Update the details of your food listing to ensure accurate information.' 
              : 'Complete the form below to add a new food listing for donation.'}
          </p>
        </div>
        <Link to="/admin" className="food-form-back">
          <span className="back-icon">←</span> Back
        </Link>
      </div>

      <div className="food-form-content">
        {submitError && (
          <div className="form-error-message">
            <span className="error-icon">⚠️</span> {submitError}
          </div>
        )}
        
        {success && (
          <div className="form-success-message">
            <span className="success-icon">✓</span> {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="food-form">
          <div className="form-section">
            <h2 className="section-title info-icon">Basic Information</h2>
            
            <div className="form-group">
              <label htmlFor="title">Title <span className="required">*</span></label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={formErrors.title ? 'form-control error' : 'form-control'}
                placeholder="Enter food listing title"
              />
              {formErrors.title && <div className="field-error">{formErrors.title}</div>}
              <div className="char-counter">{formData.title.length}/100</div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description <span className="required">*</span></label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={formErrors.description ? 'form-control error' : 'form-control'}
                placeholder="Describe the food, quantity, condition, and pickup instructions"
                rows="4"
              ></textarea>
              {formErrors.description && <div className="field-error">{formErrors.description}</div>}
              <div className="char-counter">{formData.description.length}/500</div>
              <div className="help-text">Provide useful details to help recipients determine if the food meets their needs.</div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title quantity-icon">Quantity & Location</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity">Quantity <span className="required">*</span></label>
                <input
                  type="text"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className={formErrors.quantity ? 'form-control error' : 'form-control'}
                  placeholder="e.g., 5 kg, 10 boxes"
                />
                {formErrors.quantity && <div className="field-error">{formErrors.quantity}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="location">Location <span className="required">*</span></label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={formErrors.location ? 'form-control error' : 'form-control'}
                  placeholder="Enter pickup location"
                />
                {formErrors.location && <div className="field-error">{formErrors.location}</div>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title status-icon">Status & Expiry</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="expiryDate">Expiry Date <span className="required">*</span></label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  className={formErrors.expiryDate ? 'form-control error' : 'form-control'}
                />
                {formErrors.expiryDate && <div className="field-error">{formErrors.expiryDate}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="form-control"
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="collected">Collected</option>
                </select>
                
                <div className="status-indicator">
                  <div className={`status-color ${formData.status}`}></div>
                  <span className="status-text">{formData.status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title image-icon">Food Image</h2>
            
            <div className="form-group">
              <label htmlFor="image">Upload Image</label>
              <div className="image-upload-container" onClick={handleBrowseClick}>
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleImageChange}
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className={formErrors.image ? 'form-control file-input error' : 'form-control file-input'}
                  ref={fileInputRef}
                />
                <div className="upload-area">
                  <div className="upload-icon">📷</div>
                  <div className="upload-text">
                    <strong>Drag & drop an image here</strong>
                    <span>or</span>
                  </div>
                  <div className="file-upload-button">
                    <span>Choose File</span>
                  </div>
                  {imageFile && <div className="file-name">{imageFile.name}</div>}
                </div>
              </div>
              {formErrors.image && <div className="field-error">{formErrors.image}</div>}
              
              {uploadingImage && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">{uploadProgress}% Uploaded</div>
                </div>
              )}
              
              <div className="image-preview-container">
                {imagePreview ? (
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="image-preview" 
                  />
                ) : formData.image ? (
                  <div className="existing-image">
                    <img 
                      src={cloudinaryConfig.getTransformedUrl(formData.image, 'medium') || formData.image} 
                      alt="Current" 
                      className="image-preview" 
                    />
                    <div className="image-caption">Current Image</div>
                  </div>
                ) : (
                  <div className="no-image">
                    No image selected
                  </div>
                )}
              </div>
              
              <div className="help-text">Recommended: JPEG or PNG, max 5MB.</div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/admin')} className="btn-cancel">
              <span className="btn-icon">←</span> Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={isLoading || uploadingImage}>
              {isLoading || uploadingImage ? (
                <>
                  <span className="spinner"></span> Saving...
                </>
              ) : isEditMode ? (
                <>
                  <span className="btn-icon">✓</span> Update
                </>
              ) : (
                <>
                  <span className="btn-icon">+</span> Create
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FoodForm; 