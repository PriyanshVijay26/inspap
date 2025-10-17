import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.css';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-content">
          <div className="not-found-animation">
            <div className="number-404">
              <span className="four">4</span>
              <span className="zero">
                <i className="fas fa-ghost"></i>
              </span>
              <span className="four">4</span>
            </div>
          </div>
          
          <h1 className="not-found-title">Oops! Page Not Found</h1>
          <p className="not-found-message">
            The page you're looking for seems to have vanished into thin air. 
            Don't worry, even the best explorers get lost sometimes!
          </p>

          <div className="not-found-suggestions">
            <p className="not-found-suggestions-title">Here are some helpful links instead:</p>
            <div className="not-found-links">
              <button onClick={() => navigate('/')} className="not-found-link">
                <i className="fas fa-home"></i>
                Go Home
              </button>
              <button onClick={() => navigate(-1)} className="not-found-link">
                <i className="fas fa-arrow-left"></i>
                Go Back
              </button>
              <button onClick={() => navigate('/brand-dashboard')} className="not-found-link">
                <i className="fas fa-th-large"></i>
                Dashboard
              </button>
            </div>
          </div>

          <div className="not-found-contact">
            <p>Still can't find what you're looking for?</p>
            <a href="mailto:support@influencerapp.com" className="not-found-contact-link">
              <i className="fas fa-envelope"></i>
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

