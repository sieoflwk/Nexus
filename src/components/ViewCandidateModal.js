import React, { useState, useEffect } from 'react';
import './Modal.css';

const ViewCandidateModal = ({ candidate, onClose, onUpdateStatus, onDelete }) => {
  const [currentStatus, setCurrentStatus] = useState(candidate.status);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setCurrentStatus(candidate.status);
    
    // 모달이 열렸을 때 body 스크롤 방지
    document.body.classList.add('modal-open');
    
    // 컴포넌트가 언마운트될 때 body 클래스 제거
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [candidate.status]);

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

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setCurrentStatus(newStatus);
    setIsUpdating(true);

    try {
      await onUpdateStatus(candidate.id, newStatus);
    } catch (error) {
      console.error('Status update failed:', error);
      setCurrentStatus(candidate.status);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      'applied': 'status-applied',
      'reviewing': 'status-reviewing',
      'interview': 'status-interview',
      'rejected': 'status-rejected',
      'hired': 'status-hired'
    };
    return statusMap[status] || 'status-applied';
  };

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

  return (
    <div className="modal view-candidate-modal" onKeyDown={handleKeyDown}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            <span className="modal-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Candidate Details
          </h3>
          <button
            className="close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="candidate-header">
            <div className="candidate-avatar-large">
              {candidate.name.charAt(0).toUpperCase()}
            </div>
            <div className="candidate-info-large">
              <h4 className="candidate-name-large">{candidate.name}</h4>
              <p className="candidate-email-large">{candidate.email}</p>
              <span className={`status-badge-large ${getStatusBadgeClass(currentStatus)}`}>
                {getStatusText(currentStatus)}
              </span>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={candidate.name}
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={candidate.email}
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                value={candidate.phone || 'Not provided'}
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">Position</label>
              <input
                type="text"
                className="form-input"
                value={candidate.position}
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">Experience</label>
              <input
                type="text"
                className="form-input"
                value={candidate.experience || 'Not specified'}
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">Applied Date</label>
              <input
                type="text"
                className="form-input"
                value={formatDate(candidate.appliedDate)}
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">Source</label>
              <input
                type="text"
                className="form-input"
                value={candidate.source || 'Not specified'}
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label">Current Status</label>
              <select
                className={`form-select ${isUpdating ? 'updating' : ''}`}
                value={currentStatus}
                onChange={handleStatusChange}
                disabled={isUpdating}
              >
                <option value="applied">Applied</option>
                <option value="reviewing">Reviewing</option>
                <option value="interview">Interview</option>
                <option value="rejected">Rejected</option>
                <option value="hired">Hired</option>
              </select>
              {isUpdating && <span className="updating-indicator">Updating...</span>}
            </div>
          </div>

          <div className="form-actions">
            <button
              className="btn btn-danger"
              onClick={() => onDelete(candidate.id)}
              title="Permanently delete this candidate"
            >
              <span className="btn-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              Delete Permanently
            </button>
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCandidateModal;
