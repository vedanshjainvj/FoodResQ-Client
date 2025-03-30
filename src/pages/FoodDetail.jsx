import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFood } from '../context/FoodContext';
import { useAuth } from '../context/AuthContext';
import cloudinaryConfig from '../utils/cloudinaryConfig';
import './FoodDetail.css';

const FoodDetail = () => {
  const { id } = useParams();
  const { food, isLoading, error, getFood, deleteFood, updateFood, acceptFood } = useFood() || {};
  const auth = useAuth() || {};
  const { user } = auth;
  const navigate = useNavigate();
  const fetchedRef = useRef(false);
  const [isReserving, setIsReserving] = useState(false);
  const [reserveSuccess, setReserveSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [requestedQuantity, setRequestedQuantity] = useState(1);
  const [acceptError, setAcceptError] = useState('');
  const [acceptSuccess, setAcceptSuccess] = useState('');

  useEffect(() => {
    if (id && getFood && !fetchedRef.current) {
      getFood(id);
      fetchedRef.current = true;
    }
  }, [getFood, id]);

  // Close image modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowImageModal(false);
      }
    };

    if (showImageModal) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showImageModal]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this food listing?')) {
      try {
        await deleteFood(id);
        navigate('/food');
      } catch (error) {
        console.error('Failed to delete food listing:', error);
      }
    }
  };

  const handleReserve = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/food/${id}`, message: 'Please login to reserve food' } });
      return;
    }

    setIsReserving(true);
    try {
      await updateFood(id, { status: 'reserved' });
      setReserveSuccess(true);
      // Refetch the food data to update the UI
      await getFood(id);
    } catch (error) {
      console.error('Failed to reserve food:', error);
    } finally {
      setIsReserving(false);
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'available': return 'status-available';
      case 'reserved': return 'status-reserved';
      case 'collected': return 'status-collected';
      case 'partial': return 'status-partial';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'available': return '✓';
      case 'reserved': return '⌛';
      case 'collected': return '✅';
      default: return '';
    }
  };

  // Handle image error and show fallback
  const handleImageError = () => {
    setImageError(true);
  };

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Open image modal with larger image
  const handleImageClick = () => {
    if (food.image && !imageError) {
      setShowImageModal(true);
    }
  };

  const handleAcceptClick = () => {
    if (!auth.isAuthenticated) {
      navigate('/login', { state: { from: `/food/${id}` } });
      return;
    }
    
    // Open the modal
    setAcceptModalOpen(true);
  };

  const handleAcceptSubmit = async (e) => {
    e.preventDefault();
    setAcceptError('');
    setAcceptSuccess('');
    
    try {
      if (requestedQuantity <= 0) {
        setAcceptError('Please enter a quantity greater than 0');
        return;
      }
      
      if (requestedQuantity > food.remainingQuantity) {
        setAcceptError(`Cannot accept more than the remaining quantity (${food.remainingQuantity} ${food.quantityUnit})`);
        return;
      }
      
      const response = await acceptFood(id, requestedQuantity);
      setAcceptSuccess(`Successfully accepted ${requestedQuantity} ${food.quantityUnit} of ${food.title}`);
      
      // Close the modal after a delay
      setTimeout(() => {
        setAcceptModalOpen(false);
        setAcceptSuccess('');
        // Refetch the food data to update the UI
        getFood(id);
      }, 2000);
    } catch (error) {
      console.error('Accept food error:', error);
      setAcceptError(error?.response?.data?.error || 'Error accepting food');
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setRequestedQuantity(value);
    }
  };

  if (isLoading) {
    return (
      <div className="food-detail-loading">
        <div className="loading-spinner"></div>
        <p>Loading food details...</p>
      </div>
    );
  }

  if (error) {
    return <div className="food-detail-error">{error}</div>;
  }

  if (!food) {
    return <div className="food-detail-error">Food listing not found</div>;
  }

  const isAdmin = user && user.role === 'admin';
  const isAvailable = food.status === 'available';
  const isExpired = new Date(food.expiryDate) < new Date();

  // Get image URL with transformations if needed
  const imageUrl = food.image && !imageError 
    ? cloudinaryConfig.getTransformedUrl(food.image, 'large') 
    : '/images/default-food.jpg';

  return (
    <div className="food-detail-container">
      <div className="food-detail-header">
        <Link to="/food" className="food-detail-back">
          <span className="back-icon">←</span> Back to Listings
        </Link>
        <div className={`food-detail-status ${getStatusClass(food.status)}`}>
          <span className="status-icon">{getStatusIcon(food.status)}</span>
          {food.status}
        </div>
      </div>

      <div className="food-detail-content">
        <div className="food-detail-grid">
          {/* Left column - Image */}
          <div className="food-detail-image-container">
            {food.image && !imageError ? (
              <>
                <div className={`image-overlay ${imageLoaded ? 'loaded' : ''}`}>
                  <div className="zoom-icon" title="Click to enlarge">🔍</div>
                </div>
                <img 
                  src={imageUrl}
                  alt={food.title}
                  className={`food-detail-image ${imageLoaded ? 'loaded' : ''}`}
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                  onClick={handleImageClick}
                />
                {!imageLoaded && (
                  <div className="image-loading">
                    <div className="loading-spinner"></div>
                  </div>
                )}
              </>
            ) : (
              <div className="food-detail-no-image">
                <div className="no-image-icon">🍽️</div>
                <p>No image available</p>
              </div>
            )}
          </div>

          {/* Right column - Info */}
          <div className="food-detail-info">
            <h1>{food.title}</h1>
            <p className="food-detail-location">{food.location}</p>
            
            <div className="food-detail-meta">
              <div className="food-meta-item">
                <span className="meta-label">Listed by:</span>
                <span>{food.createdBy?.name || 'Anonymous'}</span>
              </div>
              <div className="food-meta-item">
                <span className="meta-label">Listed on:</span>
                <span>{formatDate(food.createdAt)}</span>
              </div>
            </div>

            <div className="food-detail-section">
              <h2>Description</h2>
              <p>{food.description}</p>
            </div>

            <div className="food-detail-section">
              <h2>Details</h2>
              <div className="food-details-grid">
                <div className="food-detail-item">
                  <span className="detail-label">Total Quantity:</span>
                  <span>{food.quantity} {food.quantityUnit}</span>
                </div>
                <div className="food-detail-item">
                  <span className="detail-label">Remaining:</span>
                  <span className="remaining-quantity">
                    {food.remainingQuantity} {food.quantityUnit}
                    {food.remainingQuantity < food.quantity && (
                      <span className="quantity-status">
                        ({((food.remainingQuantity / food.quantity) * 100).toFixed(0)}% left)
                      </span>
                    )}
                  </span>
                </div>
                <div className="food-detail-item">
                  <span className="detail-label">Expiry Date:</span>
                  <span className={isExpired ? 'expired-date' : ''}>
                    {formatDate(food.expiryDate)}
                    {isExpired && <span className="expiry-note"> (Expired)</span>}
                  </span>
                </div>
                <div className="food-detail-item">
                  <span className="detail-label">Status:</span>
                  <span className={`detail-status ${getStatusClass(food.status)}`}>{food.status}</span>
                </div>
              </div>
            </div>

            {(food.status === 'available' || food.status === 'partial') && !isExpired && auth.isAuthenticated && 
              food.createdBy?._id !== user?.id && (
              <div className="food-detail-actions">
                <button 
                  className="food-action-btn primary-btn"
                  onClick={handleAcceptClick}
                >
                  Accept Food
                </button>
                {food.status === 'partial' && (
                  <button 
                    className="food-action-btn reserve-btn"
                    onClick={handleReserve}
                    disabled={isReserving}
                  >
                    {isReserving ? 'Processing...' : 'Reserve Remaining'}
                  </button>
                )}
              </div>
            )}

            {food.transactions && food.transactions.length > 0 && (
              <div className="food-detail-section transactions-section">
                <h2>Transaction History</h2>
                <div className="transactions-list">
                  {food.transactions.map((transaction, index) => (
                    <div key={index} className="transaction-item">
                      <div className="transaction-user">
                        <span className="user-icon">👤</span>
                        {transaction.userName}
                      </div>
                      <div className="transaction-details">
                        <span className="transaction-quantity">
                          {transaction.quantity} {food.quantityUnit}
                        </span>
                        <span className="transaction-date">
                          {formatDate(transaction.takenAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isAvailable && isExpired && (
              <div className="food-expired-message">
                <span className="expired-icon">⚠️</span>
                This food listing has expired and is no longer available for reservation.
              </div>
            )}

            {reserveSuccess && (
              <div className="food-reservation-success">
                <span className="success-icon">✓</span>
                Food reserved successfully! The donor will contact you soon.
              </div>
            )}

            {isAdmin && (
              <div className="food-admin-actions">
                <Link to={`/admin/food/edit/${food._id}`} className="admin-btn edit-btn">
                  <span className="btn-icon">✏️</span> Edit Listing
                </Link>
                <button onClick={handleDelete} className="admin-btn delete-btn">
                  <span className="btn-icon">🗑️</span> Delete Listing
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="image-modal" onClick={() => setShowImageModal(false)}>
          <div className="modal-content">
            <span className="close-modal" title="Close">&times;</span>
            <img 
              src={imageUrl} 
              alt={food.title} 
              className="modal-image"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="modal-caption">{food.title}</div>
          </div>
        </div>
      )}

      {/* Accept Food Modal */}
      {acceptModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Accept Food</h3>
              <button className="close-btn" onClick={() => setAcceptModalOpen(false)}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            
            <div className="modal-body">
              <p className="modal-message">
                How much of "{food.title}" would you like to accept?
              </p>
              
              <div className="available-info">
                <span className="info-label">Available:</span>
                <span className="info-value">{food.remainingQuantity} {food.quantityUnit}</span>
              </div>
              
              <form onSubmit={handleAcceptSubmit} className="accept-form">
                <div className="form-group">
                  <label htmlFor="quantity">Quantity to Accept:</label>
                  <div className="quantity-input">
                    <input
                      type="number"
                      id="quantity"
                      min="0.1"
                      max={food.remainingQuantity}
                      step="0.1"
                      value={requestedQuantity}
                      onChange={handleQuantityChange}
                    />
                    <span className="unit">{food.quantityUnit}</span>
                  </div>
                </div>
                
                {acceptError && <div className="error-message">{acceptError}</div>}
                {acceptSuccess && <div className="success-message">{acceptSuccess}</div>}
                
                <div className="form-actions">
                  <button 
                    type="button" 
                    className="cancel-btn"
                    onClick={() => setAcceptModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isLoading || requestedQuantity <= 0 || requestedQuantity > food.remainingQuantity}
                  >
                    {isLoading ? 'Processing...' : 'Accept Food'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodDetail; 