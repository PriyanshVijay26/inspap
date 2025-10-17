import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from './ToastContainer';
import LoadingSpinner from './LoadingSpinner';
import { validators } from '../utils/validation';
import { API_BASE_URL } from '../utils/api';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState({});
  const { showSuccess, showError } = useToast();

  const validateEmail = () => {
    const error = validators.email(email);
    if (error) {
      setErrors({ email: error });
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setEmailSent(true);
        showSuccess('Password reset link sent to your email!');
      } else {
        const data = await response.json();
        showError(data.message || 'Failed to send reset email');
      }
    } catch (error) {
      showError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="forgot-password-page">
        <div className="forgot-password-container">
          <div className="forgot-password-card success-card">
            <div className="success-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h1>Check Your Email</h1>
            <p className="success-message">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="help-text">
              Please check your inbox and click the link to reset your password. 
              The link will expire in 1 hour.
            </p>
            <div className="action-buttons">
              <Link to="/" className="btn btn-primary">
                Back to Home
              </Link>
              <button onClick={() => setEmailSent(false)} className="btn btn-outline">
                Try Another Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          <div className="forgot-password-header">
            <div className="icon-wrapper">
              <i className="fas fa-key"></i>
            </div>
            <h1>Forgot Password?</h1>
            <p>No worries! Enter your email and we'll send you reset instructions.</p>
          </div>

          <form onSubmit={handleSubmit} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <i className="fas fa-envelope"></i>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors({});
                }}
                onBlur={validateEmail}
                disabled={isLoading}
              />
              {errors.email && (
                <span className="error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  {errors.email}
                </span>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="small" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane"></i>
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>

          <div className="forgot-password-footer">
            <p>
              Remember your password?{' '}
              <Link to="/brand-login" className="link-primary">
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

