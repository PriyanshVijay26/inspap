import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useToast } from './ToastContainer';
import LoadingSpinner from './LoadingSpinner';
import { validators, getPasswordStrength } from '../utils/validation';
import './ResetPassword.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ strength: 0, text: '', color: '' });
  const [tokenValid, setTokenValid] = useState(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      showError('Invalid reset link');
      navigate('/forgot-password');
      return;
    }
    verifyToken();
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const verifyToken = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/verify-reset-token?token=${token}`);
      if (response.ok) {
        setTokenValid(true);
      } else {
        setTokenValid(false);
        showError('This reset link has expired or is invalid');
      }
    } catch (error) {
      setTokenValid(false);
      showError('Error verifying reset link');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: null }));

    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }
  };

  const validate = () => {
    const newErrors = {};

    const passwordError = validators.password(formData.password);
    if (passwordError) newErrors.password = passwordError;

    const confirmError = validators.confirmPassword(formData.password, formData.confirmPassword);
    if (confirmError) newErrors.confirmPassword = confirmError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
      });

      if (response.ok) {
        showSuccess('Password reset successfully!');
        setTimeout(() => {
          navigate('/brand-login');
        }, 2000);
      } else {
        const data = await response.json();
        showError(data.message || 'Failed to reset password');
      }
    } catch (error) {
      showError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (tokenValid === null) {
    return <LoadingSpinner size="large" fullScreen text="Verifying reset link..." />;
  }

  if (tokenValid === false) {
    return (
      <div className="reset-password-page">
        <div className="reset-password-container">
          <div className="reset-password-card error-card">
            <div className="error-icon">
              <i className="fas fa-times-circle"></i>
            </div>
            <h1>Invalid Reset Link</h1>
            <p>This password reset link has expired or is invalid.</p>
            <Link to="/forgot-password" className="btn btn-primary">
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="reset-password-page">
      <div className="reset-password-container">
        <div className="reset-password-card">
          <div className="reset-password-header">
            <div className="icon-wrapper">
              <i className="fas fa-lock"></i>
            </div>
            <h1>Reset Password</h1>
            <p>Enter your new password below</p>
          </div>

          <form onSubmit={handleSubmit} className="reset-password-form">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <i className="fas fa-key"></i>
                New Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className={`form-input ${errors.password ? 'input-error' : ''}`}
                  placeholder="Enter new password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-bar-container">
                    <div 
                      className="strength-bar" 
                      style={{ 
                        width: `${(passwordStrength.strength / 6) * 100}%`,
                        backgroundColor: passwordStrength.color 
                      }}
                    ></div>
                  </div>
                  <span className="strength-text" style={{ color: passwordStrength.color }}>
                    {passwordStrength.text}
                  </span>
                </div>
              )}
              {errors.password && (
                <span className="error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  {errors.password}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <i className="fas fa-check-circle"></i>
                Confirm Password
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="Confirm new password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  <i className={`fas ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="error-message">
                  <i className="fas fa-exclamation-circle"></i>
                  {errors.confirmPassword}
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
                  <span>Resetting Password...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i>
                  <span>Reset Password</span>
                </>
              )}
            </button>
          </form>

          <div className="reset-password-footer">
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

export default ResetPassword;

