import React from 'react';
import { Link } from 'react-router-dom';
import homepageImage from '../assets/homepage.png';
import './AppHomePage.css';

const AppHomePage = () => {
  return (
    <div className="homepage">
      <div className="hero-image">
        <img 
          src={homepageImage} 
          alt="Influencer Sponsor Platform" 
        />
      </div>
      
      <div className="hero">
        <h1>Connect. Collaborate. Create.</h1>
        <p>The premier platform where influencers and brands come together to create amazing campaigns and build lasting partnerships.</p>
      </div>

      <div className="actions">
        <Link to="/brand-register" className="btn btn-primary">
          <i className="fas fa-building" style={{ marginRight: '8px' }}></i>
          Register as Brand
        </Link>
        <Link to="/influencer-register" className="btn btn-secondary">
          <i className="fas fa-star" style={{ marginRight: '8px' }}></i>
          Register as Influencer
        </Link>
        <Link to="/brand-login" className="btn btn-outline">
          <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }}></i>
          Brand Login
        </Link>
        <Link to="/influencer-login" className="btn btn-outline">
          <i className="fas fa-user" style={{ marginRight: '8px' }}></i>
          Influencer Login
        </Link>
        <Link to="/admin-login" className="btn btn-outline">
          <i className="fas fa-shield-alt" style={{ marginRight: '8px' }}></i>
          Admin Access
        </Link>
      </div>
    </div>
  );
};

export default AppHomePage;
