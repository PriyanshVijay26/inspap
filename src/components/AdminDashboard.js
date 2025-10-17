import React, { useState, useEffect } from 'react';
import { authenticatedFetch } from '../utils/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [brandProfessionals, setBrandProfessionals] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [brandSearch, setBrandSearch] = useState('');
  const [influencerSearch, setInfluencerSearch] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    fetchBrandProfessionals();
    fetchInfluencers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchBrandProfessionals = async () => {
    try {
      const response = await authenticatedFetch('/admin/brand_professionals');
      
      if (response.ok) {
        const data = await response.json();
        setBrandProfessionals(data);
      } else {
        const errorData = await response.json();
        setErrorMessage(`Error fetching brand professionals: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching brand professionals:', error);
      setErrorMessage('Error fetching brand professionals');
    }
  };

  const fetchInfluencers = async () => {
    try {
      const response = await authenticatedFetch('/admin/influencer_professionals');
      
      if (response.ok) {
        const data = await response.json();
        setInfluencers(data);
      } else {
        const errorData = await response.json();
        setErrorMessage(`Error fetching influencers: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error fetching influencers:', error);
      setErrorMessage('Error fetching influencers');
    }
  };

  const verifyBrand = async (brandId) => {
    try {
      const response = await authenticatedFetch(`/admin/verify_brand/${brandId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        fetchBrandProfessionals(); // Refresh data
      } else {
        const errorData = await response.json();
        setErrorMessage(`Error verifying brand: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error verifying brand:', error);
      setErrorMessage('Error verifying brand');
    }
  };

  const activateUser = async (userId) => {
    try {
      const response = await authenticatedFetch(`/admin/activate_user/${userId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        fetchBrandProfessionals();
        fetchInfluencers();
      } else {
        const errorData = await response.json();
        setErrorMessage(`Error activating user: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error activating user:', error);
      setErrorMessage('Error activating user');
    }
  };

  const deactivateUser = async (userId) => {
    try {
      const response = await authenticatedFetch(`/admin/deactivate_user/${userId}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
        fetchBrandProfessionals();
        fetchInfluencers();
      } else {
        const errorData = await response.json();
        setErrorMessage(`Error deactivating user: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      setErrorMessage('Error deactivating user');
    }
  };

  const filteredBrandProfessionals = brandProfessionals.filter(brand =>
    brand.user?.username?.toLowerCase().includes(brandSearch.toLowerCase()) ||
    brand.name?.toLowerCase().includes(brandSearch.toLowerCase())
  );

  const filteredInfluencers = influencers.filter(influencer =>
    influencer.user?.username?.toLowerCase().includes(influencerSearch.toLowerCase()) ||
    influencer.niche?.toLowerCase().includes(influencerSearch.toLowerCase())
  );

  return (
    <div className="admin-dashboard-page">
      <div className="admin-dashboard-container">
        <div className="admin-header">
          <h1 className="admin-title">
            <i className="fas fa-shield-alt"></i>
            Admin Dashboard
          </h1>
          <p className="admin-subtitle">Manage brands and influencers across the platform</p>
        </div>

        {/* Brand Professionals Section */}
        <div className="admin-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <i className="fas fa-building"></i>
                Brand Professionals
                <span className="section-count">{filteredBrandProfessionals.length}</span>
              </h2>
            </div>
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                placeholder="Search by username or brand name..."
                className="search-input"
              />
            </div>
          </div>

          {filteredBrandProfessionals.length > 0 ? (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Brand Name</th>
                    <th>Website</th>
                    <th>Industry</th>
                    <th>Verified</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBrandProfessionals.map(brand => (
                    <tr key={brand.id}>
                      <td>
                        <i className="fas fa-user"></i> {brand.user?.username}
                      </td>
                      <td>{brand.name}</td>
                      <td>
                        {brand.website && (
                          <a 
                            href={brand.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            style={{ color: 'var(--primary-color)', textDecoration: 'none' }}
                          >
                            <i className="fas fa-external-link-alt"></i> {brand.website}
                          </a>
                        )}
                      </td>
                      <td>{brand.industry}</td>
                      <td>
                        {brand.verified ? (
                          <span className="badge badge-verified">
                            <i className="fas fa-circle"></i>
                            Verified
                          </span>
                        ) : (
                          <span className="badge badge-not-verified">
                            <i className="fas fa-circle"></i>
                            Pending
                          </span>
                        )}
                      </td>
                      <td>
                        {brand.active ? (
                          <span className="badge badge-active">
                            <i className="fas fa-circle"></i>
                            Active
                          </span>
                        ) : (
                          <span className="badge badge-inactive">
                            <i className="fas fa-circle"></i>
                            Inactive
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {!brand.verified && (
                            <button 
                              onClick={() => verifyBrand(brand.id)} 
                              className="action-btn btn-verify"
                            >
                              <i className="fas fa-check-circle"></i>
                              Verify
                            </button>
                          )}
                          {!brand.active ? (
                            <button 
                              onClick={() => activateUser(brand.user?.id)} 
                              className="action-btn btn-activate"
                            >
                              <i className="fas fa-toggle-on"></i>
                              Activate
                            </button>
                          ) : (
                            <button 
                              onClick={() => deactivateUser(brand.user?.id)} 
                              className="action-btn btn-deactivate"
                            >
                              <i className="fas fa-toggle-off"></i>
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-search"></i>
              <h3>No brands found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          )}
        </div>

        {/* Influencers Section */}
        <div className="admin-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <i className="fas fa-users"></i>
                Influencers
                <span className="section-count">{filteredInfluencers.length}</span>
              </h2>
            </div>
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                value={influencerSearch}
                onChange={(e) => setInfluencerSearch(e.target.value)}
                placeholder="Search by username or niche..."
                className="search-input"
              />
            </div>
          </div>

          {filteredInfluencers.length > 0 ? (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Niche</th>
                    <th>Followers</th>
                    <th>Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInfluencers.map(influencer => (
                    <tr key={influencer.id}>
                      <td>
                        <i className="fas fa-user"></i> {influencer.user?.username}
                      </td>
                      <td>
                        <i className="fas fa-tag"></i> {influencer.niche}
                      </td>
                      <td>
                        <i className="fas fa-heart"></i> {influencer.followers?.toLocaleString()}
                      </td>
                      <td>
                        {influencer.active ? (
                          <span className="badge badge-active">
                            <i className="fas fa-circle"></i>
                            Active
                          </span>
                        ) : (
                          <span className="badge badge-inactive">
                            <i className="fas fa-circle"></i>
                            Inactive
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          {!influencer.active ? (
                            <button 
                              onClick={() => activateUser(influencer.user?.id)} 
                              className="action-btn btn-activate"
                            >
                              <i className="fas fa-toggle-on"></i>
                              Activate
                            </button>
                          ) : (
                            <button 
                              onClick={() => deactivateUser(influencer.user?.id)} 
                              className="action-btn btn-deactivate"
                            >
                              <i className="fas fa-toggle-off"></i>
                              Deactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-search"></i>
              <h3>No influencers found</h3>
              <p>Try adjusting your search criteria</p>
            </div>
          )}
        </div>

        {errorMessage && (
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            {errorMessage}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
