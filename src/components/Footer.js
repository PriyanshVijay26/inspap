import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand">
              <img src="/logo.jpeg" alt="Logo" className="footer-logo" />
              <h3 className="footer-brand-name">Influencer Sponsorship App</h3>
            </div>
            <p className="footer-tagline">
              Connecting brands with influencers for successful collaborations
            </p>
            <div className="footer-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                <i className="fab fa-facebook"></i>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-link">
                <i className="fab fa-linkedin"></i>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">For Brands</h4>
            <ul className="footer-links">
              <li><Link to="/">Find Influencers</Link></li>
              <li><Link to="/brand-dashboard">Dashboard</Link></li>
              <li><Link to="/">Create Campaign</Link></li>
              <li><Link to="/">Pricing</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">For Influencers</h4>
            <ul className="footer-links">
              <li><Link to="/">Browse Campaigns</Link></li>
              <li><Link to="/influencer-dashboard">Dashboard</Link></li>
              <li><Link to="/">Submit Proposal</Link></li>
              <li><Link to="/">Resources</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">Company</h4>
            <ul className="footer-links">
              <li><Link to="/">About Us</Link></li>
              <li><Link to="/">Contact</Link></li>
              <li><Link to="/">Privacy Policy</Link></li>
              <li><Link to="/">Terms of Service</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-section-title">Contact Us</h4>
            <div className="footer-contact">
              <p>
                <i className="fas fa-envelope"></i>
                support@influencerapp.com
              </p>
              <p>
                <i className="fas fa-phone"></i>
                +1 (555) 123-4567
              </p>
              <p>
                <i className="fas fa-map-marker-alt"></i>
                123 Business St, Suite 100
              </p>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copyright">
            &copy; {currentYear} Influencer Sponsorship App. All rights reserved.
          </p>
          <div className="footer-bottom-links">
            <Link to="/">Privacy</Link>
            <Link to="/">Terms</Link>
            <Link to="/">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

