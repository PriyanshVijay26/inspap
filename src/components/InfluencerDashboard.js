import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch, API_BASE_URL } from '../utils/api';
import './InfluencerDashboard.css';

const InfluencerDashboard = () => {
  const [influencer, setInfluencer] = useState({});
  const [campaigns, setCampaigns] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [bidAmount, setBidAmount] = useState('');
  const [proposalDetails, setProposalDetails] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchInfluencerData();
    fetchCampaigns();
    fetchProposals();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchInfluencerData = async () => {
    try {
      const response = await authenticatedFetch('/user');
      
      if (response.ok) {
        const data = await response.json();
        setInfluencer(data);
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
      const response = await authenticatedFetch('/influencer-campaigns');
      
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      } else {
        const errorData = await response.json();
        setErrorMessage(`Error fetching campaigns: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      setErrorMessage(`Error fetching campaigns: ${error.message}`);
    }
  };

  const fetchProposals = async () => {
    try {
      const response = await authenticatedFetch('/proposals');
      
      if (response.ok) {
        const data = await response.json();
        setProposals(data.proposals || data);
      } else {
        const errorData = await response.json();
        setErrorMessage(`Error fetching proposals: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      setErrorMessage(`Error fetching proposals: ${error.message}`);
    }
  };

  const openModal = (campaign) => {
    setSelectedCampaign(campaign);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCampaign(null);
    setBidAmount('');
    setProposalDetails('');
  };

  const createAdRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await authenticatedFetch(`/campaigns/${selectedCampaign.id}/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          proposal_details: proposalDetails || `I would like to collaborate on your campaign "${selectedCampaign.title}" for $${bidAmount}.`,
          bid_amount: bidAmount
        })
      });

      if (response.ok) {
        closeModal();
        fetchProposals(); // Refresh proposals
        setErrorMessage(''); // Clear any previous errors
      } else {
        const errorData = await response.json();
        setErrorMessage(`Error creating proposal: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      setErrorMessage(`Error creating proposal: ${error.message}`);
    }
  };

  const profileImageURL = influencer?.profile_image
    ? `${API_BASE_URL}/${influencer.profile_image}`
    : null;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Influencer Dashboard</h1>
        </div>

        {influencer && (
          <div className="influencer-info">
            <div className="profile-section">
              {profileImageURL && (
                <img src={profileImageURL} alt="Influencer Profile" className="profile-image" />
              )}
            </div>
            
            <div className="influencer-details">
              <h2 className="influencer-name">Welcome, {influencer.username}!</h2>
              <p><i className="fas fa-envelope"></i> {influencer.email}</p>
              {influencer.bio && <p><i className="fas fa-info-circle"></i> {influencer.bio}</p>}
              {influencer.niche && <p><i className="fas fa-hashtag"></i> {influencer.niche}</p>}
              {influencer.followers && <p><i className="fas fa-users"></i> {influencer.followers} followers</p>}
            </div>
          </div>
        )}

        <div className="campaigns-section">
          <h2 className="section-title">
            <i className="fas fa-bullhorn"></i>
            Available Campaigns
          </h2>
          <div className="campaign-grid">
            {campaigns.map(campaign => (
              <div key={campaign.id} className="campaign-card">
                <div className="campaign-header">
                  <div className="campaign-info">
                    <h3 className="campaign-title">{campaign.title}</h3>
                    {campaign.brand_name && (
                      <p className="campaign-brand">
                        <i className="fas fa-building"></i>
                        {campaign.brand_name}
                      </p>
                    )}
                  </div>
                  <span className="campaign-budget">${campaign.budget}</span>
                </div>
                <p className="campaign-description">{campaign.description}</p>
                <div className="campaign-actions">
                  <button onClick={() => openModal(campaign)} className="btn btn-secondary">
                    <i className="fas fa-paper-plane"></i>
                    Create Proposal
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="proposals-section">
          <h2 className="section-title">
            <i className="fas fa-file-contract"></i>
            Your Proposals
          </h2>
          {proposals.length > 0 ? (
            <div className="proposals-grid">
              {proposals.map(proposal => (
                <div key={proposal.id} className="proposal-card">
                  <div className="proposal-header">
                    <h4 className="proposal-campaign">{proposal.campaign_title}</h4>
                    <span className={`proposal-status status-${proposal.status?.toLowerCase()}`}>
                      {proposal.status}
                    </span>
                  </div>
                  <div className="proposal-details">
                    <p><i className="fas fa-dollar-sign"></i> Bid Amount: ${proposal.bid_amount}</p>
                    {(proposal.status?.toLowerCase() === 'accepted' || proposal.status?.toLowerCase() === 'negotiate' || proposal.status?.toLowerCase() === 'negotiating') && (
                      <div className="proposal-actions">
                        <button 
                          onClick={() => navigate(`/campaign/${proposal.campaign_id}/proposals/${proposal.id}/chat`)}
                          className="btn btn-chat"
                        >
                          <i className="fas fa-comments"></i>
                          Open Chat
                        </button>
                      </div>
                    )}
                    {proposal.status?.toLowerCase() === 'pending' && (
                      <div className="proposal-actions">
                        <p className="proposal-pending-note">
                          <i className="fas fa-info-circle"></i>
                          Waiting for brand response. Chat will be available once negotiation starts.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-inbox"></i>
              <p>You haven't submitted any proposals yet.</p>
              <p className="empty-subtitle">Browse available campaigns above to get started!</p>
            </div>
          )}
        </div>

        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h2>Create Proposal</h2>
                <button className="modal-close" onClick={closeModal}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="campaign-info">
                  <h3>{selectedCampaign?.title}</h3>
                  <p>{selectedCampaign?.description}</p>
                </div>
                <form onSubmit={createAdRequest} className="proposal-form">
                  <div className="form-group">
                    <label htmlFor="proposal_details">
                      <i className="fas fa-comment"></i>
                      Proposal Message
                    </label>
                    <textarea
                      id="proposal_details"
                      className="form-input"
                      value={proposalDetails}
                      onChange={(e) => setProposalDetails(e.target.value)}
                      placeholder={`Tell the brand why you're perfect for "${selectedCampaign?.title}" campaign...`}
                      rows="4"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="bid_amount">
                      <i className="fas fa-dollar-sign"></i>
                      Your Bid Amount
                    </label>
                    <input
                      type="number"
                      id="bid_amount"
                      className="form-input"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="Enter your bid amount"
                      min="1"
                      required
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="button" onClick={closeModal} className="btn btn-outline">
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-secondary">
                      <i className="fas fa-paper-plane"></i>
                      Submit Proposal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {errorMessage && <div className="error">{errorMessage}</div>}
      </div>
    </div>
  );
};

export default InfluencerDashboard;
