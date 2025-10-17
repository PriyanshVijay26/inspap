import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/api';
import './InfluencerRegistration.css';

const InfluencerRegistration = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    bio: '',
    niche: '',
    followers: '',
    facebook_link: '',
    instagram_link: '',
    twitter_link: '',
    youtube_link: '',
    date_of_birth: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [error, setError] = useState(null);
  const [niches, setNiches] = useState([]);
  const [maxDate, setMaxDate] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setMaxDateValue();
    fetchNiches();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const setMaxDateValue = () => {
    const today = new Date();
    today.setFullYear(today.getFullYear() - 5);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    setMaxDate(`${year}-${month}-${day}`);
  };

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

  const registerInfluencer = async (e) => {
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

      const response = await fetch(`${API_BASE_URL}/register/influencer`, {
        method: 'POST',
        body: formDataToSend
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed.');
      }

      const data = await response.json();
      console.log(data.message);

      // Redirect to the login page or home page
      navigate('/');
    } catch (error) {
      setError(error.message || 'An error occurred during registration.');
    }
  };

  return (
    <div className="registration-page">
      <div className="registration-container">
        <div className="registration-card">
          <div className="registration-header">
            <h1 className="registration-title">Influencer Registration</h1>
            <p className="registration-subtitle">
              Join our community of creators and start collaborating with amazing brands
            </p>
          </div>

          <form onSubmit={registerInfluencer} encType="multipart/form-data" className="registration-form">
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
                    placeholder="Choose a unique username"
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
                <div className="form-group">
                  <label htmlFor="date_of_birth">
                    <i className="fas fa-calendar-alt"></i>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="date_of_birth"
                    name="date_of_birth"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                    max={maxDate}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">
                <i className="fas fa-star"></i>
                Creator Profile
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="niche">
                    <i className="fas fa-hashtag"></i>
                    Content Niche
                  </label>
                  <select
                    id="niche"
                    name="niche"
                    value={formData.niche}
                    onChange={handleInputChange}
                  >
                    <option value="" disabled>Select your niche</option>
                    {niches.map(niche => (
                      <option key={niche.id} value={niche.name}>
                        {niche.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="followers">
                    <i className="fas fa-users"></i>
                    Total Followers
                  </label>
                  <input
                    type="number"
                    id="followers"
                    name="followers"
                    value={formData.followers}
                    onChange={handleInputChange}
                    placeholder="Combined followers across platforms"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="bio">
                  <i className="fas fa-align-left"></i>
                  Bio / About You
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell brands about yourself, your content style, and what makes you unique..."
                  rows="4"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="profile_image">
                  <i className="fas fa-image"></i>
                  Profile Picture
                </label>
                <input
                  type="file"
                  id="profile_image"
                  onChange={onFileSelected}
                  accept="image/*"
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">
                <i className="fas fa-share-alt"></i>
                Social Media Links
              </h3>
              <div className="social-links-grid">
                <div className="form-group">
                  <label htmlFor="instagram_link">
                    <i className="fab fa-instagram"></i>
                    Instagram
                  </label>
                  <input
                    type="url"
                    id="instagram_link"
                    name="instagram_link"
                    value={formData.instagram_link}
                    onChange={handleInputChange}
                    placeholder="https://instagram.com/yourusername"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="youtube_link">
                    <i className="fab fa-youtube"></i>
                    YouTube
                  </label>
                  <input
                    type="url"
                    id="youtube_link"
                    name="youtube_link"
                    value={formData.youtube_link}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/c/yourchannel"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="twitter_link">
                    <i className="fab fa-twitter"></i>
                    Twitter
                  </label>
                  <input
                    type="url"
                    id="twitter_link"
                    name="twitter_link"
                    value={formData.twitter_link}
                    onChange={handleInputChange}
                    placeholder="https://twitter.com/yourusername"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="facebook_link">
                    <i className="fab fa-facebook"></i>
                    Facebook
                  </label>
                  <input
                    type="url"
                    id="facebook_link"
                    name="facebook_link"
                    value={formData.facebook_link}
                    onChange={handleInputChange}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="submit-button">
              <i className="fas fa-star"></i>
              Create Influencer Account
            </button>

            {error && <div className="error">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default InfluencerRegistration;
