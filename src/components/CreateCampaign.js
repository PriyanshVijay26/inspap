import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../utils/api';
import './CreateCampaign.css';

const CreateCampaign = () => {
  const [campaignData, setCampaignData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    budget: '',
    campaign_goals: '',
    target_audience: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const today = new Date().toISOString().split('T')[0];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCampaignData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createCampaign = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await authenticatedFetch('/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignData)
      });

      if (response.ok) {
        navigate('/brand-dashboard');
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.message || 'Error creating campaign');
      }
    } catch (error) {
      setErrorMessage('Error creating campaign');
    }
  };

  const minEndDate = campaignData.start_date || today;

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">Create New Campaign</h1>
          <p className="page-subtitle">Launch your next influencer marketing campaign</p>
        </div>

        <div className="form-card">
          <form onSubmit={createCampaign} className="campaign-form">
            <div className="form-section">
              <h3 className="form-section-title">
                <i className="fas fa-info-circle"></i>
                Campaign Details
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="title">
                    <i className="fas fa-tag"></i>
                    Campaign Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={campaignData.title}
                    onChange={handleInputChange}
                    placeholder="Enter a compelling campaign title"
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="budget">
                    <i className="fas fa-dollar-sign"></i>
                    Budget ($)
                  </label>
                  <input
                    type="number"
                    id="budget"
                    name="budget"
                    value={campaignData.budget}
                    onChange={handleInputChange}
                    placeholder="Enter campaign budget"
                    min="1"
                    required
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">
                  <i className="fas fa-align-left"></i>
                  Campaign Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={campaignData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your campaign objectives, requirements, and what you're looking for in influencers..."
                  required
                  className="form-textarea"
                  rows="4"
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">
                <i className="fas fa-calendar-alt"></i>
                Campaign Timeline
              </h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="start_date">
                    <i className="fas fa-play"></i>
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={campaignData.start_date}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    min={today}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="end_date">
                    <i className="fas fa-stop"></i>
                    End Date
                  </label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={campaignData.end_date}
                    onChange={handleInputChange}
                    required
                    className="form-input"
                    min={minEndDate}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="form-section-title">
                <i className="fas fa-bullseye"></i>
                Campaign Strategy
              </h3>
              <div className="form-group">
                <label htmlFor="campaign_goals">
                  <i className="fas fa-target"></i>
                  Campaign Goals
                </label>
                <textarea
                  id="campaign_goals"
                  name="campaign_goals"
                  value={campaignData.campaign_goals}
                  onChange={handleInputChange}
                  placeholder="What do you want to achieve? (e.g., brand awareness, product launch, sales increase...)"
                  required
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label htmlFor="target_audience">
                  <i className="fas fa-users"></i>
                  Target Audience
                </label>
                <textarea
                  id="target_audience"
                  name="target_audience"
                  value={campaignData.target_audience}
                  onChange={handleInputChange}
                  placeholder="Describe your ideal audience (demographics, interests, behaviors...)"
                  required
                  className="form-textarea"
                  rows="3"
                />
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => navigate('/brand-dashboard')} 
                className="btn btn-outline"
              >
                <i className="fas fa-arrow-left"></i>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <i className="fas fa-rocket"></i>
                Create Campaign
              </button>
            </div>
          </form>

          {errorMessage && <div className="error">{errorMessage}</div>}
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
