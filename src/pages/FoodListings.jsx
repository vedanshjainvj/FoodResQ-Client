import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useFood } from '../context/FoodContext';
import cloudinaryConfig from '../utils/cloudinaryConfig';
import './FoodListings.css';

const FoodListings = () => {
  const { foods, isLoading, error, getAllFood, pagination } = useFood() || {};
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState({
    status: '',
    expiryStatus: 'eatable',
    sort: '-createdAt'
  });
  const [recentFoods, setRecentFoods] = useState([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  
  // Use a ref to track if the initial load has happened
  const initialLoadRef = useRef(false);

  useEffect(() => {
    const fetchFoods = async () => {
      if (!getAllFood) return;
      
      try {
        await getAllFood({
          page: currentPage,
          limit: 6,
          status: filter.status,
          expiryStatus: filter.expiryStatus,
          sort: filter.sort
        });
        initialLoadRef.current = true;
      } catch (error) {
        console.error('Failed to fetch food listings:', error);
      }
    };

    // Only fetch if it's the first load or filter/page has changed
    if (!initialLoadRef.current || (initialLoadRef.current && (filter.status || filter.expiryStatus !== 'eatable' || filter.sort !== '-createdAt' || currentPage > 1))) {
      fetchFoods();
    }
  }, [getAllFood, currentPage, filter]);

  // Fetch recent foods separately (newest 3 regardless of status)
  useEffect(() => {
    const fetchRecentFoods = async () => {
      if (!getAllFood) return;
      
      try {
        setRecentLoading(true);
        const response = await getAllFood({
          limit: 3,
          sort: '-createdAt',
          expiryStatus: 'eatable' // Only show eatable food in recent section
        });
        
        if (response && response.data) {
          setRecentFoods(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch recent foods:', error);
      } finally {
        setRecentLoading(false);
      }
    };

    fetchRecentFoods();
  }, [getAllFood]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
    setCurrentPage(1); // Reset to first page on filter change
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);
    
    // Less than a minute
    if (seconds < 60) {
      return 'just now';
    }
    
    // Less than an hour
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    }
    
    // Less than a day
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
    
    // Less than a week
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    }
    
    // Format as date
    return formatDate(dateString);
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
      case 'reserved': return '⏱';
      case 'collected': return '✓';
      case 'partial': return '◑';
      default: return '•';
    }
  };

  const getExpiryStatusClass = (expiryStatus) => {
    switch(expiryStatus) {
      case 'eatable': return 'expiry-eatable';
      case 'spoiled': return 'expiry-spoiled';
      default: return '';
    }
  };

  const handleImageError = (event) => {
    event.target.src = '/images/default-food.svg';
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  return (
    <div className="food-listings-container">
      <div className="food-listings-header">
        <h1>Food Donations</h1>
        <p>Find and connect with food donors in your community</p>
      </div>

      {/* Recent Foods Section */}
      <div className="recent-foods-section">
        <div className="section-header">
          <h2>Recently Added</h2>
          <div className="section-line"></div>
        </div>
        
        {recentLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading recent listings...</p>
          </div>
        ) : recentFoods.length > 0 ? (
          <div className="recent-foods-grid">
            {recentFoods.map((food) => (
              <Link to={`/food/${food._id}`} className="recent-food-card" key={food._id}>
                <div className="recent-food-image-container">
                  <img 
                    src={food.image ? cloudinaryConfig.getTransformedUrl(food.image, 'thumbnail') : '/images/default-food.svg'} 
                    alt={food.title}
                    className="recent-food-image"
                    onError={handleImageError}
                  />
                  <div className={`recent-food-status ${getStatusClass(food.status)}`}>
                    <span className="status-icon">{getStatusIcon(food.status)}</span>
                    {food.status}
                  </div>
                  {food.expiryStatus === 'spoiled' && (
                    <div className="food-spoiled-badge">Spoiled</div>
                  )}
                </div>
                <div className="recent-food-content">
                  <h3 className="recent-food-title">{food.title}</h3>
                  <p className="recent-food-location">{food.location}</p>
                  <div className="recent-food-meta">
                    <span className="recent-food-date">Added {formatTimeAgo(food.createdAt)}</span>
                    <span className={`recent-food-expire ${isExpired(food.expiryDate) ? 'expired' : ''}`}>
                      {isExpired(food.expiryDate) ? 'Expired' : `Expires ${formatDate(food.expiryDate)}`}
                    </span>
                  </div>
                  <div className="recent-food-footer">
                    <span className="recent-food-quantity">{food.quantity}</span>
                    <span className="recent-food-view">View Details <span className="arrow-icon">→</span></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="food-listings-empty">
            <p>No recent food listings available.</p>
          </div>
        )}
      </div>

      <div className="food-listings-filters">
        <div className="filters-header">
          <h2 className="filter-title">All Food Listings</h2>
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="expiryStatus">
                <span className="filter-icon">🍽️</span>
                Food Quality:
              </label>
              <select
                id="expiryStatus"
                name="expiryStatus"
                value={filter.expiryStatus}
                onChange={handleFilterChange}
              >
                <option value="eatable">Eatable Only</option>
                <option value="spoiled">Spoiled Only</option>
                <option value="">All (Both)</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="status">
                <span className="filter-icon">🔍</span>
                Status:
              </label>
              <select
                id="status"
                name="status"
                value={filter.status}
                onChange={handleFilterChange}
              >
                <option value="">All</option>
                <option value="available">Available</option>
                <option value="partial">Partially Available</option>
                <option value="reserved">Reserved</option>
                <option value="collected">Collected</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort">
                <span className="filter-icon">↕️</span>
                Sort By:
              </label>
              <select
                id="sort"
                name="sort"
                value={filter.sort}
                onChange={handleFilterChange}
              >
                <option value="-createdAt">Newest First</option>
                <option value="createdAt">Oldest First</option>
                <option value="-expiryDate">Expiry Date (Soonest)</option>
                <option value="location">Location (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {error && <div className="food-listings-error">{error}</div>}

      {isLoading && !foods?.length ? (
        <div className="food-listings-loading">
          <div className="loading-spinner"></div>
          <p>Loading food listings...</p>
        </div>
      ) : foods?.length === 0 ? (
        <div className="food-listings-empty">
          <p>No food listings found. Please try different filters.</p>
        </div>
      ) : (
        <>
          <div className="food-listings-grid">
            {foods?.map((food) => (
              <div className="food-card" key={food._id}>
                <div className="food-card-image-container">
                  <img 
                    src={food.image ? cloudinaryConfig.getTransformedUrl(food.image, 'medium') : '/images/default-food.svg'} 
                    alt={food.title}
                    className="food-card-image"
                    onError={handleImageError}
                  />
                  <div className={`food-card-status ${getStatusClass(food.status)}`}>
                    <span className="status-icon">{getStatusIcon(food.status)}</span>
                    {food.status}
                  </div>
                  {food.expiryStatus === 'spoiled' && (
                    <div className="food-spoiled-badge">Spoiled</div>
                  )}
                  {isExpired(food.expiryDate) && (
                    <div className="food-expired-badge">Expired</div>
                  )}
                </div>
                <div className="food-card-header">
                  <h3>{food.title}</h3>
                  <p className="food-card-location">{food.location}</p>
                </div>
                <div className="food-card-body">
                  <p className="food-card-description">{food.description.substring(0, 100)}
                    {food.description.length > 100 ? '...' : ''}
                  </p>
                  <div className="food-card-details">
                    {food.status === 'partial' && (
                      <div className="food-detail">
                        <span className="detail-label">Remaining</span>
                        <span className="detail-value">
                          {food.remainingQuantity} / {food.quantity} {food.quantityUnit}
                          <span className="quantity-percentage">
                            ({((food.remainingQuantity / food.quantity) * 100).toFixed(0)}%)
                          </span>
                        </span>
                      </div>
                    )}
                    <div className="food-detail">
                      <span className="detail-label">Quantity</span>
                      <span className="detail-value">
                        {food.status === 'partial' ? food.quantity : food.quantity} {food.quantityUnit}
                      </span>
                    </div>
                    <div className="food-detail">
                      <span className="detail-label">Quality</span>
                      <span className={`detail-value ${getExpiryStatusClass(food.expiryStatus)}`}>
                        {food.expiryStatus === 'eatable' ? 'Eatable' : 'Spoiled'}
                      </span>
                    </div>
                    <div className="food-detail">
                      <span className="detail-label">Expires</span>
                      <span className="detail-value">
                        {formatDate(food.expiryDate)}
                        {isExpired(food.expiryDate) && (
                          <span className="expired-tag"> (Expired)</span>
                        )}
                      </span>
                    </div>
                    <div className="food-detail">
                      <span className="detail-label">Listed by</span>
                      <span>{food.createdBy.name}</span>
                    </div>
                    <div className="food-detail">
                      <span className="detail-label">Posted</span>
                      <span>{formatTimeAgo(food.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="food-card-footer">
                  <Link to={`/food/${food._id}`} className="food-card-btn">
                    View Details
                    <span className="btn-arrow">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {pagination && (
            <div className="food-listings-pagination">
              <button
                disabled={!pagination.prev}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="pagination-btn"
              >
                ← Previous
              </button>
              <span className="pagination-info">
                Page {currentPage} of {pagination.totalPages || 1}
              </span>
              <button
                disabled={!pagination.next}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="pagination-btn"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FoodListings; 