import { Link } from 'react-router-dom';
import './DonationOpportunities.css';

const DonationOpportunities = () => {
  return (
    <section className="donation-section">
      <div className="container">
        <h2 className="donation-title">How You Can Help</h2>
        <p className="donation-description">
          Your excess food can feed someone in need. Join our mission to reduce food waste and fight hunger in India.
        </p>
        
        <div className="donation-grid">
          <div className="donation-card">
            <div className="donation-icon">🍱</div>
            <h3 className="donation-card-title">Restaurant Partners</h3>
            <p className="donation-card-text">
              Restaurants can donate excess food at the end of the day instead of throwing it away.
              We ensure it reaches people in need while it's still fresh.
            </p>
            <Link to="/register" className="donation-link">Join as Partner</Link>
          </div>
          
          <div className="donation-card">
            <div className="donation-icon">🏠</div>
            <h3 className="donation-card-title">Household Donations</h3>
            <p className="donation-card-text">
              Got extra food from a party or event? Schedule a pickup and we'll
              ensure your food helps those who need it most.
            </p>
            <Link to="/dashboard" className="donation-link">Schedule Pickup</Link>
          </div>
          
          <div className="donation-card">
            <div className="donation-icon">🏢</div>
            <h3 className="donation-card-title">Corporate Events</h3>
            <p className="donation-card-text">
              Planning a corporate event? Partner with us to manage leftover food
              and turn potential waste into meals for the hungry.
            </p>
            <Link to="/register" className="donation-link">Corporate Signup</Link>
          </div>
        </div>
        
        <div className="donation-cta">
          <h3 className="donation-cta-title">Ready to Make a Difference?</h3>
          <p className="donation-cta-text">
            Join thousands of donors who have already helped provide over 1 million meals.
          </p>
          <Link to="/register" className="donation-cta-button">Get Started</Link>
        </div>
      </div>
    </section>
  );
};

export default DonationOpportunities; 