import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './BrandDashboard.css';

const BrandDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const baseURL = 'http://localhost:5000';

  useEffect(() => {
    fetchUserData();
    fetchCampaigns();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${baseURL}/api/user`, {
        headers: {
          'Authentication-Token': token
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        const errorData = await response.json();
        setErrorMessage(`Error fetching user data: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      setErrorMessage(`Error fetching user data: ${error.message}`);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${baseURL}/api/campaigns`, {
        headers: {
          'Authentication-Token': token
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || data);
      }
    } catch (error) {
      setErrorMessage('Error fetching campaigns');
    }
  };

  const createCampaign = () => {
    navigate('/create-campaign');
  };

  const editCampaign = (campaignId) => {
    navigate(`/update-campaign/${campaignId}`);
  };

  const deleteCampaign = async (campaignId) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${baseURL}/api/campaigns/${campaignId}`, {
          method: 'DELETE',
          headers: {
            'Authentication-Token': token
          }
        });
        
        if (response.ok) {
          fetchCampaigns(); // Refresh campaigns list
        }
      } catch (error) {
        setErrorMessage('Error deleting campaign');
      }
    }
  };

  const profileImageURL = userData?.profile_image 
    ? `${baseURL}/${userData.profile_image}` 
    : null;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Brand Dashboard</h1>
        </div>

        {userData && (
          <div className="brand-info">
            <div className="profile-section">
              {profileImageURL && (
                <img src={profileImageURL} alt="Brand Logo" className="profile-image" />
              )}
            </div>
            
            <div className="brand-details">
              <h2 className="brand-name">Welcome, {userData.name}</h2>
              <p>
                <i className="fas fa-envelope"></i>
                {userData.email}
              </p>
              <p>
                <i className="fas fa-envelope-open"></i>
                {userData.contact_email}
              </p>
              <p>
                <i className="fas fa-globe"></i>
                <a href={userData.website} target="_blank" rel="noopener noreferrer">
                  {userData.website}
                </a>
              </p>
            </div>
            
            <button onClick={createCampaign} className="create-campaign-button">
              <i className="fas fa-plus"></i>
              Create New Campaign
            </button>
          </div>
        )}

        <div className="campaigns-section">
          <h2 className="section-title">
            <i className="fas fa-bullhorn"></i>
            Your Campaigns
          </h2>
          
          {campaigns.length > 0 ? (
            <ul id="campaign-list">
              {campaigns.map(campaign => (
                <li key={campaign.id} className="campaign-card">
                  <div className="campaign-header">
                    <h3 className="campaign-title">{campaign.title}</h3>
                    <span className={`campaign-status ${campaign.private ? 'private-label' : 'public-label'}`}>
                      <i className={`fas ${campaign.private ? 'fa-lock' : 'fa-globe'}`}></i>
                      {campaign.private ? 'Private' : 'Public'}
                    </span>
                  </div>
                  
                  <p className="campaign-description">{campaign.description}</p>
                  
                  <div className="campaign-actions">
                    <button onClick={() => editCampaign(campaign.id)} className="btn-edit">
                      <i className="fas fa-edit"></i>
                      Edit
                    </button>
                    <button onClick={() => deleteCampaign(campaign.id)} className="btn-delete">
                      <i className="fas fa-trash"></i>
                      Delete
                    </button>
                    <Link to={`/campaign/${campaign.id}/proposals`} className="btn-proposals">
                      <i className="fas fa-eye"></i>
                      View Proposals
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <div className="empty-state-content">
                <i className="fas fa-bullhorn" style={{ fontSize: '4rem', color: 'var(--gray-400)', marginBottom: 'var(--spacing-4)' }}></i>
                <h3 style={{ color: 'var(--gray-600)', marginBottom: 'var(--spacing-2)' }}>No campaigns yet</h3>
                <p style={{ color: 'var(--gray-500)', marginBottom: 'var(--spacing-6)' }}>Create your first campaign to start connecting with influencers</p>
                <button onClick={createCampaign} className="create-campaign-button">
                  <i className="fas fa-plus"></i>
                  Create Your First Campaign
                </button>
              </div>
            </div>
          )}
        </div>

        {errorMessage && <div className="error">{errorMessage}</div>}
      </div>
    </div>
  );
};

export default BrandDashboard;
