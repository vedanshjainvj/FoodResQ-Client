import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, isLoading, error } = useAuth() || {};
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        location: user.location || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else if (!isLoading) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

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

  const validateForm = () => {
    const errors = {};
    
    // Name validation
    if (isEditing && !formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    // Email validation
    if (isEditing && !formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (isEditing && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    // Password validation
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        errors.currentPassword = 'Current password is required to set a new password';
      }
      if (formData.newPassword.length < 6) {
        errors.newPassword = 'Password must be at least 6 characters';
      }
      if (formData.newPassword !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSuccessMessage('');
    
    if (!validateForm()) {
      return;
    }
    
    // Create update object with only changed fields
    const updateData = {};
    if (formData.name !== user.name) updateData.name = formData.name;
    if (formData.email !== user.email) updateData.email = formData.email;
    if (formData.phone !== user.phone) updateData.phone = formData.phone;
    if (formData.location !== user.location) updateData.location = formData.location;
    
    // Only include password fields if new password was entered
    if (formData.newPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword;
    }
    
    try {
      await updateProfile(updateData);
      setSuccessMessage('Profile updated successfully');
      setIsEditing(false);
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setSubmitError(error.response?.data?.error || 'Failed to update profile');
    }
  };

  if (isLoading) {
    return <div className="profile-loading">Loading user profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>User Profile</h1>
        {!isEditing && (
          <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
            Edit Profile
          </button>
        )}
      </div>

      <div className="profile-content">
        {submitError && <div className="profile-error">{submitError}</div>}
        {successMessage && <div className="profile-success">{successMessage}</div>}
        
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h2>Personal Information</h2>
            
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className={`form-control ${formErrors.name ? 'error' : ''}`}
              />
              {formErrors.name && <div className="field-error">{formErrors.name}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className={`form-control ${formErrors.email ? 'error' : ''}`}
              />
              {formErrors.email && <div className="field-error">{formErrors.email}</div>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone (Optional)</label>
                <input
                  type="text"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-control"
                />
              </div>

              <div className="form-group">
                <label htmlFor="location">Location (Optional)</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="form-control"
                  placeholder="e.g., Mumbai, Maharashtra"
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="form-section">
              <h2>Change Password (Optional)</h2>
              
              <div className="form-group">
                <label htmlFor="currentPassword">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={`form-control ${formErrors.currentPassword ? 'error' : ''}`}
                />
                {formErrors.currentPassword && (
                  <div className="field-error">{formErrors.currentPassword}</div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`form-control ${formErrors.newPassword ? 'error' : ''}`}
                  />
                  {formErrors.newPassword && (
                    <div className="field-error">{formErrors.newPassword}</div>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`form-control ${formErrors.confirmPassword ? 'error' : ''}`}
                  />
                  {formErrors.confirmPassword && (
                    <div className="field-error">{formErrors.confirmPassword}</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {isEditing && (
            <div className="profile-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    location: user.location || '',
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                  setFormErrors({});
                }}
              >
                Cancel
              </button>
              <button type="submit" className="btn-save" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>

        <div className="profile-info">
          <div className="profile-metadata">
            <span className="profile-label">Account Type:</span>
            <span className="profile-value">{user?.role === 'admin' ? 'Administrator' : 'User'}</span>
          </div>
          <div className="profile-metadata">
            <span className="profile-label">Joined:</span>
            <span className="profile-value">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 