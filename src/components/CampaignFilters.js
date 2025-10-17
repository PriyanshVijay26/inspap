import React, { useState } from 'react';
import './CampaignFilters.css';

const CampaignFilters = ({ onFilterChange, onReset }) => {
  const [filters, setFilters] = useState({
    search: '',
    industry: '',
    minBudget: '',
    maxBudget: '',
    status: '',
    sortBy: 'newest'
  });

  const [isExpanded, setIsExpanded] = useState(false);

  const industries = [
    'Technology',
    'Fashion',
    'Food & Beverage',
    'Travel',
    'Health & Fitness',
    'Beauty & Cosmetics',
    'Gaming',
    'Education',
    'Finance',
    'Entertainment',
    'Sports',
    'Lifestyle'
  ];

  const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'budget-high', label: 'Highest Budget' },
    { value: 'budget-low', label: 'Lowest Budget' },
    { value: 'title-az', label: 'Title (A-Z)' },
    { value: 'title-za', label: 'Title (Z-A)' }
  ];

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      industry: '',
      minBudget: '',
      maxBudget: '',
      status: '',
      sortBy: 'newest'
    };
    setFilters(resetFilters);
    onReset();
    setIsExpanded(false);
  };

  const activeFilterCount = Object.values(filters).filter(val => val && val !== 'newest').length;

  return (
    <div className="campaign-filters">
      <div className="filters-header">
        <div className="filters-title">
          <i className="fas fa-filter"></i>
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="active-filters-badge">{activeFilterCount}</span>
          )}
        </div>
        <button 
          className="filters-toggle"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <i className="fas fa-chevron-up"></i>
              <span>Hide Filters</span>
            </>
          ) : (
            <>
              <i className="fas fa-chevron-down"></i>
              <span>Show Filters</span>
            </>
          )}
        </button>
      </div>

      <div className={`filters-content ${isExpanded ? 'expanded' : ''}`}>
        <div className="filters-grid">
          {/* Search */}
          <div className="filter-group filter-search">
            <label className="filter-label">
              <i className="fas fa-search"></i>
              Search
            </label>
            <input
              type="text"
              className="filter-input"
              placeholder="Search campaigns..."
              value={filters.search}
              onChange={(e) => handleChange('search', e.target.value)}
            />
          </div>

          {/* Industry */}
          <div className="filter-group">
            <label className="filter-label">
              <i className="fas fa-industry"></i>
              Industry
            </label>
            <select
              className="filter-select"
              value={filters.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
            >
              <option value="">All Industries</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>

          {/* Budget Range */}
          <div className="filter-group">
            <label className="filter-label">
              <i className="fas fa-dollar-sign"></i>
              Min Budget
            </label>
            <input
              type="number"
              className="filter-input"
              placeholder="Min"
              value={filters.minBudget}
              onChange={(e) => handleChange('minBudget', e.target.value)}
              min="0"
            />
          </div>

          <div className="filter-group">
            <label className="filter-label">
              <i className="fas fa-dollar-sign"></i>
              Max Budget
            </label>
            <input
              type="number"
              className="filter-input"
              placeholder="Max"
              value={filters.maxBudget}
              onChange={(e) => handleChange('maxBudget', e.target.value)}
              min="0"
            />
          </div>

          {/* Status */}
          <div className="filter-group">
            <label className="filter-label">
              <i className="fas fa-tasks"></i>
              Status
            </label>
            <select
              className="filter-select"
              value={filters.status}
              onChange={(e) => handleChange('status', e.target.value)}
            >
              <option value="">All Statuses</option>
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="filter-group">
            <label className="filter-label">
              <i className="fas fa-sort"></i>
              Sort By
            </label>
            <select
              className="filter-select"
              value={filters.sortBy}
              onChange={(e) => handleChange('sortBy', e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="filters-actions">
            <button className="btn-reset-filters" onClick={handleReset}>
              <i className="fas fa-redo"></i>
              Reset All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignFilters;

