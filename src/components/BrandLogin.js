import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './BrandLogin.css';

const BrandLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/login/brand', {
        email: email,
        password: password
      });

      // Store the authentication token and role
      localStorage.setItem('auth_token', response.data.auth_token);
      localStorage.setItem('role', 'brand');

      // Redirect to the brand dashboard
      navigate('/brand-dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during login.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Brand Login</h1>
          <p className="login-subtitle">Welcome back! Sign in to your brand account</p>
        </div>
        
        <form onSubmit={login} className="login-form">
          <div className="form-group">
            <label htmlFor="email">
              <i className="fas fa-envelope"></i>
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <i className="fas fa-lock"></i>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <div style={{ textAlign: 'right', marginTop: '8px' }}>
              <Link to="/forgot-password" style={{ fontSize: '14px', color: 'var(--primary-color)', textDecoration: 'none', fontWeight: '500' }}>
                Forgot Password?
              </Link>
            </div>
          </div>
          
          <button type="submit" className="submit-button">
            <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }}></i>
            Sign In
          </button>
          
          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default BrandLogin;
