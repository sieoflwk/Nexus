import React, { useState } from 'react';
import './CandidatesView.css';

const CandidatesView = ({ 
  candidates, 
  onViewCandidate, 
  onUpdateStatus, 
  onDeleteCandidate,
  onShowAddModal
}) => {
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('appliedDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const getStatusText = (status) => {
    const statusMap = {
      'applied': 'Applied',
      'reviewing': 'Reviewing',
      'interview': 'Interview',
      'rejected': 'Rejected',
      'hired': 'Hired'
    };
    return statusMap[status] || status;
  };

  const getStageText = (status) => {
    const stageMap = {
      'applied': 'Application Review',
      'reviewing': 'Phone Screen',
      'interview': 'On-site Interview',
      'rejected': 'Rejected',
      'hired': 'Hired'
    };
    return stageMap[status] || status;
  };

  const getStatusIcon = (status) => {
    const iconMap = {
      'applied': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      'reviewing': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      'interview': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      'rejected': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      'hired': (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    };
    return iconMap[status] || (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    return `status-badge status-${status}`;
  };

  let filteredCandidates = candidates;

  // 필터 적용
  if (currentFilter !== 'all') {
    filteredCandidates = filteredCandidates.filter(c => c.status === currentFilter);
  }

  // 검색 적용
  if (searchQuery) {
    filteredCandidates = filteredCandidates.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.position.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // 정렬 적용
  filteredCandidates.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (sortBy === 'appliedDate') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleFilterChange = (status) => {
    setCurrentFilter(status);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M7 14l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    return sortOrder === 'asc' ? (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M7 14l5-5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ) : (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  };

  const getStatusCount = (status) => {
    return candidates.filter(c => c.status === status).length;
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await onUpdateStatus(id, status);
      // 성공적으로 업데이트됨
    } catch (error) {
      console.error('Status update failed:', error);
      // 에러 처리 (필요시 사용자에게 알림)
    }
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-title">All Candidates</h1>
        <p className="page-subtitle">
          Manage and track your recruitment pipeline
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{candidates.length}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{getStatusCount('applied')}</div>
            <div className="stat-label">Applied</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{getStatusCount('reviewing')}</div>
            <div className="stat-label">Reviewing</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{getStatusCount('interview')}</div>
            <div className="stat-label">Interview</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-value">{getStatusCount('hired')}</div>
            <div className="stat-label">Hired</div>
          </div>
        </div>
      </div>

      {/* 활성 필터 표시 */}
      {(currentFilter !== 'all' || searchQuery) && (
        <div className="status-filters">
          <div className="filter-summary">
            <span className="filter-label">Active Filters:</span>
            <span className="results-count">
              {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''} found
            </span>
          </div>
          <div className="active-filter-tags">
            {currentFilter !== 'all' && (
              <span className="filter-tag">
                <span className="filter-tag-icon">{getStatusIcon(currentFilter)}</span>
                {getStatusText(currentFilter)}
                <button 
                  className="remove-btn" 
                  onClick={() => handleFilterChange('all')}
                  aria-label="Remove status filter"
                >
                  ×
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="filter-tag">
                <span className="filter-tag-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                "{searchQuery}"
                <button 
                  className="remove-btn" 
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* 검색 및 컨트롤 */}
      <div className="controls">
        <div className="search-section">
          <div className="search-container">
            <span className="search-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search by name, email, or position..." 
              value={searchQuery}
              onChange={handleSearchChange}
              aria-label="Search candidates"
            />
            {searchQuery && (
              <button 
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        <div className="control-actions">
          <div className="filter-tabs">
            <button 
              className={`filter-tab ${currentFilter === 'all' ? 'active' : ''}`}
              onClick={() => handleFilterChange('all')}
            >
              <span className="filter-tab-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              All
              <span className="filter-tab-count">{candidates.length}</span>
            </button>
            <button 
              className={`filter-tab ${currentFilter === 'applied' ? 'active' : ''}`}
              onClick={() => handleFilterChange('applied')}
            >
              <span className="filter-tab-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Applied
              <span className="filter-tab-count">{getStatusCount('applied')}</span>
            </button>
            <button 
              className={`filter-tab ${currentFilter === 'reviewing' ? 'active' : ''}`}
              onClick={() => handleFilterChange('reviewing')}
            >
              <span className="filter-tab-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Reviewing
              <span className="filter-tab-count">{getStatusCount('reviewing')}</span>
            </button>
            <button 
              className={`filter-tab ${currentFilter === 'interview' ? 'active' : ''}`}
              onClick={() => handleFilterChange('interview')}
            >
              <span className="filter-tab-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Interview
              <span className="filter-tab-count">{getStatusCount('interview')}</span>
            </button>
            <button 
              className={`filter-tab ${currentFilter === 'rejected' ? 'active' : ''}`}
              onClick={() => handleFilterChange('rejected')}
            >
              <span className="filter-tab-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Rejected
              <span className="filter-tab-count">{getStatusCount('rejected')}</span>
            </button>
          </div>
          
          <div className="action-buttons-group">
            <button className="btn btn-outline btn-sm">
              <span className="btn-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Export
            </button>
            <button 
              className="btn btn-primary btn-sm"
              onClick={onShowAddModal}
            >
              <span className="btn-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Add Candidate
            </button>
          </div>
        </div>
      </div>

      {/* 지원자 테이블 */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th 
                className="sortable-header"
                onClick={() => handleSort('name')}
              >
                <div className="header-content">
                  <span>Candidate</span>
                  <span className="sort-icon">{getSortIcon('name')}</span>
                </div>
              </th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('position')}
              >
                <div className="header-content">
                  <span>Position</span>
                  <span className="sort-icon">{getSortIcon('position')}</span>
                </div>
              </th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('status')}
              >
                <div className="header-content">
                  <span>Status</span>
                  <span className="sort-icon">{getSortIcon('status')}</span>
                </div>
              </th>
              <th 
                className="sortable-header"
                onClick={() => handleSort('appliedDate')}
              >
                <div className="header-content">
                  <span>Applied</span>
                  <span className="sort-icon">{getSortIcon('appliedDate')}</span>
                </div>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.length === 0 ? (
              <tr>
                <td colSpan="5">
                  <div className="empty-state">
                    <div className="empty-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="empty-title">No candidates found</div>
                    <div className="empty-subtitle">
                      {searchQuery || currentFilter !== 'all' 
                        ? 'Try adjusting your search or filters'
                        : 'Add your first candidate to get started'
                      }
                    </div>
                    {searchQuery || currentFilter !== 'all' ? (
                      <button 
                        className="btn btn-outline"
                        onClick={() => {
                          setSearchQuery('');
                          setCurrentFilter('all');
                        }}
                      >
                        Clear all filters
                      </button>
                    ) : (
                      <button 
                        className="btn btn-primary"
                        onClick={onShowAddModal}
                      >
                        Add First Candidate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredCandidates.map(candidate => (
                <tr key={candidate.id} className="candidate-row">
                  <td>
                    <div className="candidate-info">
                      <div className="candidate-avatar">
                        {candidate.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="candidate-details">
                        <button 
                          className="candidate-name"
                          onClick={() => onViewCandidate(candidate)}
                        >
                          {candidate.name}
                        </button>
                        <div className="candidate-meta">
                          <span className="candidate-email">{candidate.email}</span>
                          {candidate.phone && (
                            <>
                              <span className="meta-separator">•</span>
                              <span className="candidate-phone">{candidate.phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="position-info">
                      <div className="position-title">{candidate.position}</div>
                      {candidate.experience && (
                        <div className="experience-badge">
                          {candidate.experience}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="status-cell">
                      <span className={getStatusBadgeClass(candidate.status)}>
                        <span className="status-icon">{getStatusIcon(candidate.status)}</span>
                        {getStatusText(candidate.status)}
                      </span>
                      <div className="stage-text">{getStageText(candidate.status)}</div>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <div className="date-value">{formatDate(candidate.appliedDate)}</div>
                      <div className="date-source">{candidate.source}</div>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn btn-outline btn-sm action-btn"
                        onClick={() => onViewCandidate(candidate)}
                        title="View details"
                      >
                        <span className="btn-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        View
                      </button>
                      <button 
                        className="btn btn-secondary btn-sm action-btn"
                        onClick={() => handleStatusUpdate(candidate.id, 'interview')}
                        title="Schedule interview"
                      >
                        <span className="btn-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        Interview
                      </button>
                      <button 
                        className="btn btn-danger btn-sm action-btn"
                        onClick={() => handleStatusUpdate(candidate.id, 'rejected')}
                        title="Reject candidate"
                      >
                        <span className="btn-icon">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CandidatesView;
