import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFood } from '../context/FoodContext';
import './Dashboard.css';

const Dashboard = () => {
  const auth = useAuth() || {};
  const { user } = auth;
  const { getAllFood } = useFood() || {};
  const [recentFoods, setRecentFoods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    available: 0,
    reserved: 0,
    collected: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!getAllFood) return;
      
      try {
        setLoading(true);
        const response = await getAllFood({
          limit: 3,
          sort: '-createdAt'
        });
        
        if (response && response.data) {
          setRecentFoods(response.data);
          
          // Calculate stats
          const available = response.data.filter(food => food.status === 'available').length;
          const reserved = response.data.filter(food => food.status === 'reserved').length;
          const collected = response.data.filter(food => food.status === 'collected').length;
          
          setStats({ available, reserved, collected });
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getAllFood]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome to Your Dashboard</h1>
        <p>Hello, {user.name}!</p>
      </div>
      
      <div className="dashboard-content">
        <div className="dashboard-grid">
          <div className="dashboard-card user-info-card">
            <h2>Account Information</h2>
            <div className="user-info">
              <div className="info-item">
                <label>Name:</label>
                <span>{user.name}</span>
              </div>
              <div className="info-item">
                <label>Email:</label>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <label>Role:</label>
                <span className="user-role">{user.role}</span>
              </div>
              {user.phone && (
                <div className="info-item">
                  <label>Phone:</label>
                  <span>{user.phone}</span>
                </div>
              )}
              {user.location && (
                <div className="info-item">
                  <label>Location:</label>
                  <span>{user.location}</span>
                </div>
              )}
              <div className="info-item">
                <label>Joined:</label>
                <span>{user.createdAt ? formatDate(user.createdAt) : 'N/A'}</span>
              </div>
            </div>
            <div className="dashboard-actions">
              <Link to="/profile" className="dashboard-btn edit-btn">
                Edit Profile
              </Link>
            </div>
          </div>
          
          <div className="dashboard-card stats-card">
            <h2>Food Donation Stats</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-value">{stats.available}</div>
                <div className="stat-label">Available</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.reserved}</div>
                <div className="stat-label">Reserved</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{stats.collected}</div>
                <div className="stat-label">Collected</div>
              </div>
            </div>
            <div className="dashboard-actions">
              <Link to="/food" className="dashboard-btn">
                View All Listings
              </Link>
            </div>
          </div>
          
          <div className="dashboard-card wide-card">
            <div className="card-header">
              <h2>Recent Food Listings</h2>
              <Link to="/food" className="see-all-link">See All</Link>
            </div>
            
            {loading ? (
              <div className="dashboard-table-loading">Loading...</div>
            ) : recentFoods.length > 0 ? (
              <div className="dashboard-table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Posted</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentFoods.map(food => (
                      <tr key={food._id}>
                        <td>{food.title}</td>
                        <td>{food.location}</td>
                        <td>
                          <span className={`status-badge ${food.status}`}>
                            {food.status}
                          </span>
                        </td>
                        <td>{formatDate(food.createdAt)}</td>
                        <td>
                          <Link to={`/food/${food._id}`} className="table-action-btn">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="dashboard-empty">
                <p>No food listings found.</p>
                <Link to="/food" className="dashboard-btn">Browse Food Listings</Link>
              </div>
            )}
          </div>
          
          <div className="dashboard-card quick-links-card">
            <h2>Quick Links</h2>
            <div className="quick-links">
              <Link to="/food" className="quick-link">
                <span className="quick-link-icon">🍲</span>
                <span className="quick-link-text">Food Listings</span>
              </Link>
              <Link to="/food-waste-reduction" className="quick-link">
                <span className="quick-link-icon">♻️</span>
                <span className="quick-link-text">Reduce Waste</span>
              </Link>
              <Link to="/profile" className="quick-link">
                <span className="quick-link-icon">👤</span>
                <span className="quick-link-text">Profile</span>
              </Link>
              <Link to="/about" className="quick-link">
                <span className="quick-link-icon">ℹ️</span>
                <span className="quick-link-text">About Us</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 