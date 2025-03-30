import { Link } from 'react-router-dom';
import './About.css';

const About = () => {
  return (
    <div className="about-container">
      <div className="about-header">
        <h1>About Our Mission</h1>
        <p>Fighting food waste and hunger in India, one meal at a time</p>
      </div>
      
      <div className="about-content container">
        <section className="about-section">
          <h2>Our Story</h2>
          <p>
            Founded in 2023, our platform began with a simple question: Why do we waste so much food when so many go hungry?
            The contradiction was stark - restaurants, events, and households throwing away perfectly good food while millions struggle to find their next meal.
          </p>
          <p>
            We started by connecting a few local restaurants with nearby shelters, and from there, our network grew.
            Today, we're proud to work with hundreds of food donors and recipient organizations across India,
            redistributing what would have been wasted to those who need it most.
          </p>
        </section>
        
        <section className="about-section">
          <h2>The Problem We're Solving</h2>
          
          <div className="problem-grid">
            <div className="problem-card">
              <h3>Food Wastage</h3>
              <p>
                India wastes approximately 68.7 million tons of food every year,
                worth about ₹92,000 crores. This happens at farms, processing facilities,
                distribution, retail, and in our homes.
              </p>
            </div>
            
            <div className="problem-card">
              <h3>Hunger Crisis</h3>
              <p>
                Despite being one of the world's largest food producers,
                India is home to 194 million undernourished people -
                about 14% of our population struggles with hunger daily.
              </p>
            </div>
            
            <div className="problem-card">
              <h3>Environmental Impact</h3>
              <p>
                Food waste in landfills produces methane, a greenhouse gas 25 times
                more potent than CO2. Food waste accounts for 8-10% of global
                greenhouse gas emissions.
              </p>
            </div>
          </div>
        </section>
        
        <section className="about-section">
          <h2>Our Approach</h2>
          <ul className="approach-list">
            <li>
              <strong>Connect:</strong> We create efficient connections between food donors and recipients through our platform.
            </li>
            <li>
              <strong>Collect:</strong> Our network of volunteers and delivery partners ensures timely collection of excess food.
            </li>
            <li>
              <strong>Distribute:</strong> We ensure food is quickly distributed to those who need it most while maintaining quality and safety.
            </li>
            <li>
              <strong>Educate:</strong> We spread awareness about reducing food waste through community programs and partnerships.
            </li>
          </ul>
        </section>
        
        <section className="about-section about-join">
          <h2>Join Our Movement</h2>
          <p>
            Whether you're a restaurant owner, event manager, or concerned citizen,
            you can make a difference. Join us in our mission to reduce food waste and hunger in India.
          </p>
          <div className="about-buttons">
            <Link to="/register" className="about-btn primary-btn">Sign Up</Link>
            <Link to="/login" className="about-btn secondary-btn">Login</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About; 