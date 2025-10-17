import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', fullScreen = false, text = '' }) => {
  const spinnerContent = (
    <div className={`loading-spinner-wrapper ${fullScreen ? 'loading-spinner-fullscreen' : ''}`}>
      <div className={`loading-spinner loading-spinner-${size}`}>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
        <div className="spinner-ring"></div>
      </div>
      {text && <p className="loading-spinner-text">{text}</p>}
    </div>
  );

  return spinnerContent;
};

export default LoadingSpinner;

