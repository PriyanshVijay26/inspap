import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';
import './BrandRegistration.css';

const BrandRegistration = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    name: '',
    website: '',
    contact_email: '',
    company_description: '',
    industry: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState(null);
  const [niches, setNiches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNiches = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/niches`);
        if (!response.ok) {
          throw new Error('Failed to fetch niches');
        }
        const data = await response.json();
        setNiches(data);
      } catch (error) {
        console.error('Error fetching niches:', error);
      }
    };
    fetchNiches();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onFileSelected = (event) => {
    setProfileImage(event.target.files[0]);
  };

  const registerBrand = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      if (profileImage) {
        formDataToSend.append('profile_image', profileImage);
      }

      const response = await fetch(`${API_BASE_URL}/register/brand`, {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed.');
      }

      // Successful registration
      navigate('/login');
    } catch (error) {
      setError(error.message || 'An error occurred during registration.');
    }
  };

  return (
    <div className="registration-page">
      <div className="registration-container">
        <div className="registration-card">
          <div className="registration-header">
            <h1 className="registration-title">Brand Registration</h1>
            <p className="registration-subtitle">
              Join our platform and connect with top influencers to grow your brand
            </p>
          </div>

          <form onSubmit={registerBrand} encType="multipart/form-data" className="registration-form">
            <div className="form-section">
              <h3 className="form-section-title">
                <i className="fas fa-user-circle"></i>
                Account Information
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="username">
                    <i className="fas fa-user"></i>
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">
                    <i className="fas fa-envelope"></i>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
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
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Create a strong password"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">
                <i className="fas fa-building"></i>
                Brand Information
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="name">
                    <i className="fas fa-tag"></i>
                    Brand Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your brand name"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="website">
                    <i className="fas fa-globe"></i>
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://yourbrand.com"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="contact_email">
                    <i className="fas fa-envelope-open"></i>
                    Contact Email
                  </label>
                  <input
                    type="email"
                    id="contact_email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleInputChange}
                    placeholder="Business contact email"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="industry">
                    <i className="fas fa-industry"></i>
                    Industry
                  </label>
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>Select your industry</option>
                    {niches.map(niche => (
                      <option key={niche.id} value={niche.name}>
                        {niche.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="company_description">
                  <i className="fas fa-align-left"></i>
                  Company Description
                </label>
                <textarea
                  id="company_description"
                  name="company_description"
                  value={formData.company_description}
                  onChange={handleInputChange}
                  placeholder="Tell us about your brand, mission, and what makes you unique..."
                  rows="4"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="profile_image">
                  <i className="fas fa-image"></i>
                  Brand Logo / Profile Image
                </label>
                <input
                  type="file"
                  id="profile_image"
                  onChange={onFileSelected}
                  accept="image/*"
                />
              </div>
            </div>

            <button type="submit" className="submit-button">
              <i className="fas fa-rocket"></i>
              Create Brand Account
            </button>

            {error && <div className="error">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default BrandRegistration;
