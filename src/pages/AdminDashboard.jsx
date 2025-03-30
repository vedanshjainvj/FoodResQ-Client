import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useFood } from '../context/FoodContext';
import { useAuth } from '../context/AuthContext';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { foods, isLoading, error, getAllFood, deleteFood, getFoodByUser } = useFood() || {};
  const auth = useAuth() || {};
  const { user } = auth;
  const fetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch food items created by the current user
    if (getFoodByUser && user && !fetchedRef.current) {
      getFoodByUser(user.id);
      fetchedRef.current = true;
    }
  }, [getFoodByUser, user]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this food listing?')) {
      try {
        await deleteFood(id);
      } catch (error) {
        console.error('Failed to delete food listing:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="admin-unauthorized">
        <h1>Unauthorized Access</h1>
        <p>You need admin privileges to access this page.</p>
        <Link to="/" className="back-link">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-dashboard-header">
        <h1>Your Food Listings</h1>
        <Link to="/admin/food/create" className="admin-add-btn">
          Add New Food Listing
        </Link>
      </div>

      <div className="admin-content">
        <div className="admin-section">
          <h2>Manage Your Food Listings</h2>
          <p className="admin-description">
            Create, edit or delete your food listings. Only your listings are displayed here.
          </p>

          {isLoading && <div className="admin-loading">Loading your food listings...</div>}
          {error && <div className="admin-error">{error}</div>}

          {!isLoading && foods?.length === 0 && (
            <div className="admin-empty">
              <p>You don't have any food listings yet. Add your first listing!</p>
              <Link to="/admin/food/create" className="admin-add-btn-small">
                Add Food Listing
              </Link>
            </div>
          )}

          {foods?.length > 0 && (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Location</th>
                    <th>Quantity</th>
                    <th>Remaining</th>
                    <th>Status</th>
                    <th>Expiry Date</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {foods.map((food) => (
                    <tr key={food._id}>
                      <td>{food.title}</td>
                      <td>{food.location}</td>
                      <td>{food.quantity} {food.quantityUnit}</td>
                      <td>{food.remainingQuantity} {food.quantityUnit}</td>
                      <td>
                        <span className={`status-badge ${food.status}`}>
                          {food.status}
                        </span>
                      </td>
                      <td>{formatDate(food.expiryDate)}</td>
                      <td>{formatDate(food.createdAt)}</td>
                      <td className="action-cell">
                        <Link
                          to={`/food/${food._id}`}
                          className="admin-action-btn view-btn"
                          title="View"
                        >
                          👁️
                        </Link>
                        <Link
                          to={`/admin/food/edit/${food._id}`}
                          className="admin-action-btn edit-btn"
                          title="Edit"
                        >
                          ✏️
                        </Link>
                        <button
                          onClick={() => handleDelete(food._id)}
                          className="admin-action-btn delete-btn"
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 