import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-logo">
            <h2>FoodResQ</h2>
            <p>Reducing food waste, one donation at a time</p>
          </div>
          
          <div className="footer-nav">
            <div className="footer-nav-section">
              <h3>Navigate</h3>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/food">Food Listings</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/food-waste-reduction">Reduce Waste</Link></li>
              </ul>
            </div>
            
            <div className="footer-nav-section">
              <h3>Account</h3>
              <ul>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
                <li><Link to="/profile">My Profile</Link></li>
                <li><Link to="/dashboard">Dashboard</Link></li>
              </ul>
            </div>
            
            <div className="footer-nav-section">
              <h3>Support</h3>
              <ul>
                <li><a href="mailto:contact@foodresq.org">Contact Us</a></li>
                <li><Link to="/about#faq">FAQ</Link></li>
                <li><Link to="/privacy-policy">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-social">
          <h3>Connect With Us</h3>
          <div className="social-icons">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <i className="fa-brands fa-facebook-f"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <i className="fa-brands fa-twitter"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <i className="fa-brands fa-instagram"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <i className="fa-brands fa-linkedin-in"></i>
            </a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {currentYear} FoodResQ. All rights reserved.</p>
          <p>Made with <i className="fa-solid fa-heart" style={{ color: '#e91e63' }}></i> to reduce food waste and fight hunger</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 