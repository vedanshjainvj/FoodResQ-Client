import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFood } from '../context/FoodContext';
import cloudinaryConfig from '../utils/cloudinaryConfig';
import FoodWastageStats from '../components/FoodWastageStats';
import DonationOpportunities from '../components/DonationOpportunities';
import './Home.css';

const Home = () => {
  const auth = useAuth() || {};
  const { isAuthenticated, user } = auth;
  const { getAllFood } = useFood() || {};
  const [featuredFoods, setFeaturedFoods] = useState([]);
  const [recentFoods, setRecentFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentLoading, setRecentLoading] = useState(false);
  const [foodCount, setFoodCount] = useState(0);

  // Fetch available foods
  useEffect(() => {
    const fetchFeaturedFoods = async () => {
      if (!getAllFood) return;
      
      try {
        setLoading(true);
        const response = await getAllFood({
          limit: 6,
          status: 'available',
          sort: '-createdAt'
        });
        
        if (response && response.data) {
          setFeaturedFoods(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch featured foods:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedFoods();
  }, [getAllFood]);

  // Fetch recent foods regardless of status
  useEffect(() => {
    const fetchRecentFoods = async () => {
      if (!getAllFood) return;
      
      try {
        setRecentLoading(true);
        const response = await getAllFood({
          limit: 4,
          sort: '-createdAt'
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

  // Fetch food count
  useEffect(() => {
    const fetchFoodCount = async () => {
      if (!getAllFood) return;
      
      try {
        const response = await getAllFood({
          count: true
        });
        
        if (response && response.data) {
          setFoodCount(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch food count:', error);
      }
    };

    fetchFoodCount();
  }, [getAllFood]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} ${days === 1 ? 'day' : 'days'} ago`;
    } else {
      return formatDate(dateString);
    }
  };

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'available': return 'status-available';
      case 'reserved': return 'status-reserved';
      case 'collected': return 'status-collected';
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

  const handleImageError = (event) => {
    event.target.src = '/images/default-food.svg';
  };

  const getDashboardLink = () => {
    if (!user) return '/dashboard';
    return user.role === 'admin' ? '/admin' : '/dashboard';
  };

  return (
    <div className="home-container">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Reduce Food Waste, Feed Communities</h1>
          <p className="hero-subtitle">
            Join our mission to eliminate hunger by connecting surplus food with those who need it most. Together, we can build a world where good food is shared, not wasted.
          </p>
          <div className="hero-buttons">
            <Link to="/food" className="btn-primary">
              Find Food <span className="btn-icon">→</span>
            </Link>
            <Link to="/about" className="btn-secondary">
              Our Mission
            </Link>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-value">{foodCount || '0'}</div>
              <div className="stat-label">Food Items Shared</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">40%</div>
              <div className="stat-label">Less Food Waste</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">100+</div>
              <div className="stat-label">Community Members</div>
            </div>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/banner.jpg" alt="Sharing food" className="main-image" />
          <div className="image-overlay">
            <div className="impact-badge">
              <span className="impact-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
                </svg>
              </span>
              <span className="impact-text">Making an Impact</span>
            </div>
          </div>
        </div>
      </section>

      <section className="food-wastage-section">
        <div className="section-header">
          <h2>Food Wastage Statistics</h2>
          <p>Together we can make a difference in reducing food waste and hunger</p>
        </div>
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor" />
              </svg>
            </div>
            <h3>1.3 Billion Tons</h3>
            <p>Food wasted globally each year while millions go hungry</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17H7V10H9V17ZM13 17H11V7H13V17ZM17 17H15V13H17V17Z" fill="currentColor" />
              </svg>
            </div>
            <h3>30-40%</h3>
            <p>Of the food supply in the United States goes to waste</p>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 6L18.29 8.29L13.41 13.17L9.41 9.17L2 16.59L3.41 18L9.41 12L13.41 16L19.71 9.71L22 12V6H16Z" fill="currentColor" />
              </svg>
            </div>
            <h3>8%</h3>
            <p>Of global greenhouse gas emissions come from food waste</p>
          </div>
        </div>
      </section>
      
      {/* Recent Activities Section */}
      {recentFoods.length > 0 && (
        <section className="recent-activities-section">
          <div className="section-header">
            <h2>Recent Food Listings</h2>
            <p>Latest food items shared by our community members</p>
          </div>
          
          {recentLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading recent activities...</p>
            </div>
          ) : (
            <div className="recent-activities-grid">
              {recentFoods.map(food => (
                <Link to={`/food/${food._id}`} key={food._id} className="food-card">
                  <div className="card-image-container">
                    <img 
                      src={food.image ? cloudinaryConfig.getTransformedUrl(food.image, 'thumbnail') : '/images/default-food.svg'} 
                      alt={food.title}
                      className="card-image"
                      onError={handleImageError}
                    />
                    <div className={`card-status ${getStatusClass(food.status)}`}>
                      <span className="status-icon">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          {food.status === 'available' ? (
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          ) : food.status === 'reserved' ? (
                            <path d="M12 8V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          ) : (
                            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          )}
                        </svg>
                      </span>
                      {food.status}
                    </div>
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{food.title}</h3>
                    <div className="card-location">
                      <span className="location-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      {food.location}
                    </div>
                    <div className="card-details">
                      <div className="detail-item">
                        <span className="detail-label">Quantity</span>
                        <span className="detail-value">{food.quantity}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Posted</span>
                        <span className="detail-value">{formatTimeAgo(food.createdAt)}</span>
                      </div>
                    </div>
                    {isExpired(food.expiryDate) && (
                      <div className="expired-badge">
                        <span className="expired-icon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 9V13M12 17H12.01M12 6L19.2 19H4.8L12 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        Expired on {formatDate(food.expiryDate)}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="view-more-container">
            <Link to="/food" className="view-more-btn">
              View All Food Listings
              <span className="view-more-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </Link>
          </div>
        </section>
      )}
      
      {/* Available Foods */}
      {featuredFoods.length > 0 && (
        <section className="available-foods-section">
          <div className="section-header">
            <h2>Available Food</h2>
            <p>Food items ready for collection and redistribution</p>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading available foods...</p>
            </div>
          ) : (
            <div className="featured-foods-grid">
              {featuredFoods.map(food => (
                <Link to={`/food/${food._id}`} key={food._id} className="food-card">
                  <div className="card-image-container">
                    <img 
                      src={food.image ? cloudinaryConfig.getTransformedUrl(food.image, 'medium') : '/images/default-food.svg'} 
                      alt={food.title}
                      className="card-image"
                      onError={handleImageError}
                    />
                    {isExpired(food.expiryDate) && (
                      <div className="card-badge expired-badge">
                        <span className="badge-icon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 9V13M12 17H12.01M12 6L19.2 19H4.8L12 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        Expired
                      </div>
                    )}
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{food.title}</h3>
                    <div className="card-location">
                      <span className="location-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      {food.location}
                    </div>
                    <div className="card-details">
                      <div className="detail-item">
                        <span className="detail-label">Quantity</span>
                        <span className="detail-value">{food.quantity}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Expires</span>
                        <span className={`detail-value ${isExpired(food.expiryDate) ? 'expired-text' : ''}`}>
                          {formatDate(food.expiryDate)}
                        </span>
                      </div>
                    </div>
                    {food.description && (
                      <div className="card-description">{food.description}</div>
                    )}
                  </div>
                  <div className="card-footer">
                    <span className="card-posted">Posted {formatTimeAgo(food.createdAt)}</span>
                    <span className="card-view">View Details</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="view-more-container">
            <Link to="/food" className="view-more-btn">
              Browse All Available Food
              <span className="view-more-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </Link>
          </div>
        </section>
      )}
      
      <FoodWastageStats />
      
      <DonationOpportunities />
      
      <div className="features-section">
        <div className="section-header">
          <h2>How It Works</h2>
          <p>Simple steps to share and reduce food waste in your community</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="feature-title">Register & Connect</h3>
            <p className="feature-description">Create an account and specify whether you're a donor or a recipient organization.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 14H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 14H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 14H16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 18H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 18H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 18H16.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="feature-title">Schedule Donations</h3>
            <p className="feature-description">List available food, quantity, and pickup times, or browse available donations near you.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 3H1V16H16V3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 8H20L23 11V16H16V8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.5 21C6.88071 21 8 19.8807 8 18.5C8 17.1193 6.88071 16 5.5 16C4.11929 16 3 17.1193 3 18.5C3 19.8807 4.11929 21 5.5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.5 21C19.8807 21 21 19.8807 21 18.5C21 17.1193 19.8807 16 18.5 16C17.1193 16 16 17.1193 16 18.5C16 19.8807 17.1193 21 18.5 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="feature-title">Pickup & Delivery</h3>
            <p className="feature-description">Our network coordinates the logistics to ensure food reaches those who need it while it's fresh.</p>
          </div>
        </div>
        
        <div className="view-more-container">
          <Link to="/about" className="view-more-btn">
            Learn More About Our Mission
            <span className="view-more-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 