import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const loginAdmin = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5000/api/login/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed.');
      }

      const data = await response.json();
      // Store auth_token and roles in localStorage
      localStorage.setItem('auth_token', data.auth_token);
      localStorage.setItem('role', 'admin');

      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } catch (error) {
      setError(error.message || 'An error occurred during login.');
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Admin Access</h1>
          <p className="login-subtitle">Secure administrator portal</p>
        </div>
        
        <form onSubmit={loginAdmin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">
              <i className="fas fa-shield-alt"></i>
              Admin Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <i className="fas fa-key"></i>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
            />
          </div>
          
          <button type="submit" className="submit-button">
            <i className="fas fa-sign-in-alt" style={{ marginRight: '8px' }}></i>
            Access Dashboard
          </button>
          
          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
