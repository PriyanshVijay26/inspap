import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from './ToastContainer';
import LoadingSpinner from './LoadingSpinner';
import { authenticatedFetch } from '../utils/api';
import './Profile.css';

const InfluencerProfile = () => {
  const { influencerId } = useParams();
  const navigate = useNavigate();
  const { showError } = useToast();
  const [influencer, setInfluencer] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInfluencerProfile();
  }, [influencerId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchInfluencerProfile = async () => {
    try {
      // Fetch influencer details
      const response = await authenticatedFetch(`/influencers/${influencerId}`);

      if (response.ok) {
        const data = await response.json();
        setInfluencer(data);

        // Fetch proposals (if available)
        try {
          const proposalsResponse = await authenticatedFetch(`/influencers/${influencerId}/proposals`);
          if (proposalsResponse.ok) {
            const proposalsData = await proposalsResponse.json();
            setProposals(proposalsData.proposals || []);
          }
        } catch (err) {
          console.log('Proposals not available');
        }
      } else {
        showError('Failed to load influencer profile');
      }
    } catch (error) {
      showError('Error loading influencer profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="large" fullScreen text="Loading profile..." />;
  }

  if (!influencer) {
    return (
      <div className="profile-error">
        <i className="fas fa-exclamation-circle"></i>
        <h2>Influencer not found</h2>
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
            <div className="profile-banner-bg influencer-banner"></div>
          </div>
          
          <div className="profile-info">
            <div className="profile-avatar influencer-avatar">
              <i className="fas fa-user"></i>
            </div>
            
            <div className="profile-details">
              <h1 className="profile-name">{influencer.user?.username || 'Influencer'}</h1>
              <p className="profile-username">@{influencer.user?.username}</p>
              
              <div className="profile-meta">
                {influencer.niche && (
                  <span className="profile-tag">
                    <i className="fas fa-tag"></i>
                    {influencer.niche}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-value">
                {influencer.followers ? influencer.followers.toLocaleString() : '0'}
              </div>
              <div className="stat-label">Followers</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{proposals.length}</div>
              <div className="stat-label">Proposals</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">
                {proposals.filter(p => p.status === 'accepted').length}
              </div>
              <div className="stat-label">Accepted</div>
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
            {influencer.bio && (
              <p className="bio-text">{influencer.bio}</p>
            )}
            
            <div className="info-grid">
              {influencer.niche && (
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-tag"></i>
                    Niche
                  </div>
                  <div className="info-value">{influencer.niche}</div>
                </div>
              )}
              {influencer.followers && (
                <div className="info-item">
                  <div className="info-label">
                    <i className="fas fa-users"></i>
                    Followers
                  </div>
                  <div className="info-value">{influencer.followers.toLocaleString()}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Social Links */}
        {(influencer.facebook_link || influencer.instagram_link || influencer.twitter_link || influencer.youtube_link) && (
          <div className="profile-section">
            <h2 className="section-title">
              <i className="fas fa-share-alt"></i>
              Social Media
            </h2>
            <div className="social-links">
              {influencer.facebook_link && (
                <a href={influencer.facebook_link} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                  <i className="fab fa-facebook"></i>
                  <span>Facebook</span>
                </a>
              )}
              {influencer.instagram_link && (
                <a href={influencer.instagram_link} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                  <i className="fab fa-instagram"></i>
                  <span>Instagram</span>
                </a>
              )}
              {influencer.twitter_link && (
                <a href={influencer.twitter_link} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                  <i className="fab fa-twitter"></i>
                  <span>Twitter</span>
                </a>
              )}
              {influencer.youtube_link && (
                <a href={influencer.youtube_link} target="_blank" rel="noopener noreferrer" className="social-link youtube">
                  <i className="fab fa-youtube"></i>
                  <span>YouTube</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Recent Proposals */}
        {proposals.length > 0 && (
          <div className="profile-section">
            <h2 className="section-title">
              <i className="fas fa-file-alt"></i>
              Recent Proposals ({proposals.length})
            </h2>
            <div className="proposals-list">
              {proposals.slice(0, 5).map(proposal => (
                <div key={proposal.id} className="proposal-mini-card">
                  <div className="proposal-info">
                    <h4>Campaign #{proposal.campaign_id}</h4>
                    <div className="proposal-bid">${proposal.bid_amount}</div>
                  </div>
                  <span className={`status-badge status-${proposal.status}`}>
                    {proposal.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfluencerProfile;

