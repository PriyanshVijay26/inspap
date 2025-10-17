import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from './ToastContainer';
import LoadingSpinner from './LoadingSpinner';
import ConfirmModal from './ConfirmModal';
import './CampaignProposals.css';

const CampaignProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [campaignDetails, setCampaignDetails] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, proposalId: null });
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchCampaignDetails(), fetchProposals()]);
      setIsLoading(false);
    };
    loadData();
  }, [campaignId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCampaignDetails = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:5000/api/campaigns/${campaignId}`, {
        headers: {
          'Authentication-Token': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCampaignDetails(data);
      } else {
        showError('Failed to load campaign details');
      }
    } catch (error) {
      showError('Error fetching campaign details');
    }
  };

  const fetchProposals = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:5000/api/campaigns/${campaignId}/proposals`, {
        headers: {
          'Authentication-Token': token
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProposals(data.proposals || data);
      } else {
        const errorData = await response.json();
        showError(`Error fetching proposals: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      showError(`Error fetching proposals: ${error.message}`);
    }
  };

  const acceptProposal = async (proposalId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:5000/api/campaigns/${campaignId}/proposals/${proposalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': token
        },
        body: JSON.stringify({
          action: 'accept'
        })
      });

      if (response.ok) {
        showSuccess('Proposal accepted successfully!');
        fetchProposals(); // Refresh proposals
      } else {
        const errorData = await response.json();
        showError(`Error accepting proposal: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      showError(`Error accepting proposal: ${error.message}`);
    }
  };

  const rejectProposal = async (proposalId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:5000/api/campaigns/${campaignId}/proposals/${proposalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': token
        },
        body: JSON.stringify({
          action: 'reject'
        })
      });

      if (response.ok) {
        showSuccess('Proposal rejected successfully!');
        fetchProposals(); // Refresh proposals
      } else {
        const errorData = await response.json();
        showError(`Error rejecting proposal: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      showError(`Error rejecting proposal: ${error.message}`);
    }
  };

  const negotiateProposal = async (proposalId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:5000/api/campaigns/${campaignId}/proposals/${proposalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-Token': token
        },
        body: JSON.stringify({
          action: 'negotiate'
        })
      });

      if (response.ok) {
        showSuccess('Proposal marked for negotiation!');
        fetchProposals(); // Refresh proposals
        // Open chat for this proposal
        openChat(proposalId);
      } else {
        const errorData = await response.json();
        showError(`Error negotiating proposal: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      showError(`Error negotiating proposal: ${error.message}`);
    }
  };

  const openChat = (proposalId) => {
    // Navigate to chat page for this proposal
    navigate(`/campaign/${campaignId}/proposals/${proposalId}/chat`);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      case 'pending': return 'status-pending';
      default: return 'status-pending';
    }
  };

  if (isLoading) {
    return <LoadingSpinner size="large" fullScreen text="Loading proposals..." />;
  }

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <button 
            onClick={() => navigate('/brand-dashboard')} 
            className="back-button"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>
          <h1 className="page-title">Campaign Proposals</h1>
          <p className="page-subtitle">Review and manage proposals from influencers</p>
        </div>

        {campaignDetails && (
          <div className="campaign-info-card">
            <div className="campaign-info-header">
              <h2 className="campaign-name">{campaignDetails.title}</h2>
              <div className="campaign-budget">
                <i className="fas fa-dollar-sign"></i>
                ${campaignDetails.budget}
              </div>
            </div>
            {campaignDetails.description && (
              <p className="campaign-description">{campaignDetails.description}</p>
            )}
          </div>
        )}

        <div className="proposals-section">
          <div className="section-header">
            <h2 className="section-title">
              <i className="fas fa-file-contract"></i>
              Influencer Proposals ({proposals.length})
            </h2>
          </div>

          {proposals.length > 0 ? (
            <div className="proposals-grid">
              {proposals.map(proposal => (
                <div key={proposal.id} className="proposal-card">
                  <div className="proposal-header">
                    <div className="influencer-info">
                      <h3 className="influencer-name">
                        <i className="fas fa-user"></i>
                        {proposal.influencer_name}
                      </h3>
                      <div className="proposal-bid">
                        <i className="fas fa-dollar-sign"></i>
                        ${proposal.bid_amount}
                      </div>
                    </div>
                    <span className={`proposal-status ${getStatusColor(proposal.status)}`}>
                      {proposal.status}
                    </span>
                  </div>

                  {proposal.status === 'pending' && (
                    <div className="proposal-actions">
                      <button 
                        onClick={() => acceptProposal(proposal.id)} 
                        className="btn btn-success"
                      >
                        <i className="fas fa-check"></i>
                        Accept
                      </button>
                      <button 
                        onClick={() => rejectProposal(proposal.id)} 
                        className="btn btn-outline-danger"
                      >
                        <i className="fas fa-times"></i>
                        Reject
                      </button>
                      <button 
                        onClick={() => negotiateProposal(proposal.id)} 
                        className="btn btn-outline"
                      >
                        <i className="fas fa-comments"></i>
                        Negotiate
                      </button>
                    </div>
                  )}

                  {proposal.status === 'accepted' && (
                    <div className="proposal-actions">
                      <button 
                        onClick={() => openChat(proposal.id)} 
                        className="btn btn-chat"
                      >
                        <i className="fas fa-comments"></i>
                        Open Chat
                      </button>
                    </div>
                  )}

                  {(proposal.status?.toLowerCase() === 'negotiate' || proposal.status?.toLowerCase() === 'negotiating') && (
                    <div className="proposal-actions">
                      <button 
                        onClick={() => acceptProposal(proposal.id)} 
                        className="btn btn-success"
                      >
                        <i className="fas fa-check"></i>
                        Accept
                      </button>
                      <button 
                        onClick={() => rejectProposal(proposal.id)} 
                        className="btn btn-outline-danger"
                      >
                        <i className="fas fa-times"></i>
                        Reject
                      </button>
                      <button 
                        onClick={() => openChat(proposal.id)} 
                        className="btn btn-chat"
                      >
                        <i className="fas fa-comments"></i>
                        Open Chat
                      </button>
                    </div>
                  )}

                  {proposal.status === 'rejected' && (
                    <div className="proposal-info">
                      <p className="rejected-message">
                        <i className="fas fa-times-circle"></i>
                        This proposal has been rejected
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-inbox"></i>
              <h3>No Proposals Yet</h3>
              <p>No influencers have submitted proposals for this campaign yet.</p>
              <p className="empty-subtitle">Check back later or promote your campaign to attract more influencers!</p>
            </div>
          )}
        </div>

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={() => setConfirmModal({ isOpen: false, action: null, proposalId: null })}
          onConfirm={() => {
            if (confirmModal.action === 'accept') acceptProposal(confirmModal.proposalId);
            else if (confirmModal.action === 'reject') rejectProposal(confirmModal.proposalId);
          }}
          title={confirmModal.action === 'accept' ? 'Accept Proposal' : 'Reject Proposal'}
          message={confirmModal.action === 'accept' 
            ? 'Are you sure you want to accept this proposal? This will start the campaign.' 
            : 'Are you sure you want to reject this proposal? This action cannot be undone.'}
          confirmText={confirmModal.action === 'accept' ? 'Yes, Accept' : 'Yes, Reject'}
          type={confirmModal.action === 'accept' ? 'success' : 'danger'}
        />
      </div>
    </div>
  );
};

export default CampaignProposals;
