import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from './ToastContainer';
import LoadingSpinner from './LoadingSpinner';
import './Profile.css';

const BrandProfile = () => {
  const { brandId } = useParams();
  const navigate = useNavigate();
  const { showError } = useToast();
  const [brand, setBrand] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalBudget: 0,
    totalInfluencers: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBrandProfile();
  }, [brandId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBrandProfile = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Fetch brand details
      const brandResponse = await fetch(`http://localhost:5000/api/brands/${brandId}`, {
        headers: { 'Authentication-Token': token }
      });

      if (brandResponse.ok) {
        const brandData = await brandResponse.json();
        setBrand(brandData);
        
        // Fetch brand's campaigns
        const campaignsResponse = await fetch(`http://localhost:5000/api/brands/${brandId}/campaigns`, {
          headers: { 'Authentication-Token': token }
        });

        if (campaignsResponse.ok) {
          const campaignsData = await campaignsResponse.json();
          setCampaigns(campaignsData.campaigns || []);
          
          // Calculate stats
          const total = campaignsData.campaigns?.length || 0;
          const active = campaignsData.campaigns?.filter(c => c.status === 'active').length || 0;
          const totalBudget = campaignsData.campaigns?.reduce((sum, c) => sum + (c.budget || 0), 0) || 0;
          
          setStats({
            totalCampaigns: total,
            activeCampaigns: active,
            totalBudget: totalBudget,
            totalInfluencers: 0 // Would need separate API call
          });
        }
      } else {
        showError('Failed to load brand profile');
      }
    } catch (error) {
      showError('Error loading brand profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="large" fullScreen text="Loading profile..." />;
  }

  if (!brand) {
    return (
      <div className="profile-error">
        <i className="fas fa-exclamation-circle"></i>
        <h2>Brand not found</h2>
        <button onClick={() => navigate(-1)} className="btn btn-primary">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Header */}
        <div className="profile-header">
          <button onClick={() => navigate(-1)} className="back-button">
            <i className="fas fa-arrow-left"></i>
            Back
          </button>
        </div>

        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-banner">
            <div className="profile-banner-bg"></div>
          </div>
          
          <div className="profile-info">
            <div className="profile-avatar">
              <i className="fas fa-building"></i>
            </div>
            
            <div className="profile-details">
              <h1 className="profile-name">{brand.name}</h1>
              <p className="profile-username">@{brand.user?.username}</p>
              
              <div className="profile-meta">
                {brand.industry && (
                  <span className="profile-tag">
                    <i className="fas fa-industry"></i>
                    {brand.industry}
                  </span>
                )}
                {brand.verified && (
                  <span className="profile-verified">
                    <i className="fas fa-check-circle"></i>
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-value">{stats.totalCampaigns}</div>
              <div className="stat-label">Total Campaigns</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{stats.activeCampaigns}</div>
              <div className="stat-label">Active Campaigns</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">${stats.totalBudget.toLocaleString()}</div>
              <div className="stat-label">Total Budget</div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="profile-section">
          <h2 className="section-title">
            <i className="fas fa-info-circle"></i>
            About
          </h2>
          <div className="section-content">
            <div className="info-grid">
              {brand.website && (
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-globe"></i>
                    Website
                  </div>
                  <a href={brand.website} target="_blank" rel="noopener noreferrer" className="info-value link">
                    {brand.website}
                  </a>
                </div>
              )}
              {brand.industry && (
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-industry"></i>
                    Industry
                  </div>
                  <div className="info-value">{brand.industry}</div>
                </div>
              )}
              {brand.user?.email && (
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-envelope"></i>
                    Email
                  </div>
                  <div className="info-value">{brand.user.email}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Campaigns Section */}
        <div className="profile-section">
          <h2 className="section-title">
            <i className="fas fa-bullhorn"></i>
            Campaigns ({campaigns.length})
          </h2>
          {campaigns.length > 0 ? (
            <div className="campaigns-grid">
              {campaigns.slice(0, 6).map(campaign => (
                <div key={campaign.id} className="campaign-mini-card">
                  <h3 className="campaign-title">{campaign.title}</h3>
                  <div className="campaign-budget">${campaign.budget}</div>
                  <div className="campaign-status">
                    <span className={`status-badge status-${campaign.status}`}>
                      {campaign.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-small">
              <i className="fas fa-inbox"></i>
              <p>No campaigns yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrandProfile;

