// Simple API configuration - just the base URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper function to make authenticated requests
export const authenticatedFetch = async (endpoint, options = {}) => {
  const token = localStorage.getItem('auth_token');
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authentication-Token': token,
      ...options.headers
    }
  };

  return fetch(url, { ...defaultOptions, ...options });
};

// For direct fetch calls (if needed)
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
