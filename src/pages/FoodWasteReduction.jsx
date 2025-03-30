import { useAuth } from '../context/AuthContext';
import './FoodWasteReduction.css';

const FoodWasteReduction = () => {
  const auth = useAuth() || {};
  const { user } = auth;

  // Sample data for demonstration purposes
  const wasteSavingTips = [
    {
      id: 1,
      title: 'Meal Planning',
      description: 'Plan your meals for the week and buy only what you need. Make a detailed shopping list and stick to it.',
      icon: '📝'
    },
    {
      id: 2,
      title: 'Proper Storage',
      description: 'Store fruits and vegetables properly. Some need refrigeration, others don\'t. Learn the best storage methods for different foods.',
      icon: '🧊'
    },
    {
      id: 3,
      title: 'Use Leftovers Creatively',
      description: 'Transform leftover food into new meals. Leftover vegetables can become soup, and day-old bread can become croutons or bread pudding.',
      icon: '♻️'
    },
    {
      id: 4,
      title: 'Understand Expiration Dates',
      description: '"Best before" doesn\'t mean "toxic after." Many foods are still perfectly safe to eat after their best-before date.',
      icon: '📅'
    },
    {
      id: 5,
      title: 'Freeze Excess Food',
      description: 'Freezing is a great way to preserve excess food. Many items can be frozen for months without losing quality.',
      icon: '❄️'
    },
    {
      id: 6,
      title: 'Compost Food Scraps',
      description: 'For unavoidable food waste, composting is better than sending it to landfill. It turns food waste into nutrient-rich soil.',
      icon: '🌱'
    }
  ];

  // Sample donation history data for demonstration
  const donationHistory = [
    {
      id: 1,
      date: '2023-11-15',
      type: 'Restaurant Leftovers',
      quantity: '5 kg',
      recipient: 'Sunshine Shelter Home'
    },
    {
      id: 2,
      date: '2023-11-20',
      type: 'Birthday Party Excess',
      quantity: '3 kg',
      recipient: 'Hope Foundation'
    },
    {
      id: 3,
      date: '2023-12-02',
      type: 'Corporate Event Food',
      quantity: '10 kg',
      recipient: 'Street Children Project'
    }
  ];

  return (
    <div className="foodwaste-container">
      <div className="foodwaste-header">
        <h1>Food Waste Reduction Center</h1>
        {user && <p>Welcome back, {user.name}!</p>}
      </div>

      <div className="foodwaste-content">
        <section className="waste-tips-section">
          <h2>Tips to Reduce Food Waste</h2>
          <div className="tips-grid">
            {wasteSavingTips.map(tip => (
              <div className="tip-card" key={tip.id}>
                <div className="tip-icon">{tip.icon}</div>
                <h3>{tip.title}</h3>
                <p>{tip.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="impact-section">
          <h2>Your Impact</h2>
          <div className="impact-stats">
            <div className="impact-card">
              <h3>Total Food Saved</h3>
              <div className="impact-number">18 kg</div>
              <p>That's equivalent to approximately 36 meals!</p>
            </div>
            <div className="impact-card">
              <h3>CO₂ Emissions Avoided</h3>
              <div className="impact-number">34 kg</div>
              <p>Equal to driving 138 km in an average car</p>
            </div>
            <div className="impact-card">
              <h3>Water Saved</h3>
              <div className="impact-number">5,400 L</div>
              <p>Enough to fill 27 bathtubs!</p>
            </div>
          </div>
        </section>

        <section className="donation-history-section">
          <h2>Your Donation History</h2>
          {donationHistory.length > 0 ? (
            <div className="donation-table-container">
              <table className="donation-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Recipient</th>
                  </tr>
                </thead>
                <tbody>
                  {donationHistory.map(donation => (
                    <tr key={donation.id}>
                      <td>{donation.date}</td>
                      <td>{donation.type}</td>
                      <td>{donation.quantity}</td>
                      <td>{donation.recipient}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-donations">You haven't made any donations yet. Get started today!</p>
          )}
          <button className="schedule-btn">Schedule a New Donation</button>
        </section>
      </div>
    </div>
  );
};

export default FoodWasteReduction; 