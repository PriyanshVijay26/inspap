import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './InfluencerLogin.css';

const InfluencerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = await axios.post('http://localhost:5000/api/login/influencer', {
        email: email,
        password: password
      });

      // Store the authentication token and role
      localStorage.setItem('auth_token', response.data.auth_token);
      localStorage.setItem('role', 'influencer');

      // Redirect to the influencer dashboard
      navigate('/influencer-dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred during login.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Influencer Login</h1>
          <p className="login-subtitle">Welcome back! Sign in to your influencer account</p>
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
          </div>
          
          <button type="submit" className="submit-button">
            <i className="fas fa-star" style={{ marginRight: '8px' }}></i>
            Sign In
          </button>
          
          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default InfluencerLogin;
