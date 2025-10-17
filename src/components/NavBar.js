import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import './NavBar.css';

const NavBar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const role = localStorage.getItem('role');
    setIsLoggedIn(token !== null);
    setUserRole(role || '');
    
    if (token) {
      fetchUserInfo();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:5000/api/user', {
        headers: { 'Authentication-Token': token }
      });
      if (response.ok) {
        const userData = await response.json();
        setUserName(userData.username || userData.name || 'User');
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setUserRole('');
    setUserName('');
    navigate('/');
  };

  const getDashboardLink = () => {
    switch(userRole) {
      case 'brand':
        return '/brand-dashboard';
      case 'influencer':
        return '/influencer-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/';
    }
  };

  const getRoleIcon = () => {
    switch(userRole) {
      case 'brand':
        return 'fa-building';
      case 'influencer':
        return 'fa-star';
      case 'admin':
        return 'fa-shield-alt';
      default:
        return 'fa-user';
    }
  };

  const getRoleDisplay = () => {
    if (userRole === 'brand') return 'Brand';
    if (userRole === 'influencer') return 'Influencer';
    if (userRole === 'admin') return 'Admin';
    return '';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-left">
          <Link to="/" className="navbar-logo-link">
            <img src="/logo.jpeg" alt="Logo" className="navbar-logo" />
          </Link>
          <Link to="/" className="navbar-brand">
            <i className="fas fa-handshake"></i>
            Influencer Sponsorship App
          </Link>
        </div>
        <div className="navbar-right">
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              {userRole && (
                <Link to={getDashboardLink()} className="navbar-dashboard-link">
                  <i className="fas fa-th-large"></i>
                  Dashboard
                </Link>
              )}
              <div className="navbar-user-info">
                <i className={`fas ${getRoleIcon()} navbar-user-icon`}></i>
                <div className="navbar-user-details">
                  <span className="navbar-user-name">{userName}</span>
                  {userRole && <span className="navbar-user-role">{getRoleDisplay()}</span>}
                </div>
              </div>
              <button onClick={logout} className="navbar-logout-btn">
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </>
          ) : (
            <Link to="/" className="navbar-login-link">
              <i className="fas fa-sign-in-alt"></i>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
