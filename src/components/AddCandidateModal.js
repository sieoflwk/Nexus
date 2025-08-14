import React, { useState, useEffect } from 'react';
import './Modal.css';

const AddCandidateModal = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    status: 'applied',
    source: 'Manual Entry'
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 모달이 열렸을 때 body 스크롤 방지
    document.body.classList.add('modal-open');
    
    // 컴포넌트가 언마운트될 때 body 클래스 제거
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }
    
    if (formData.phone && !/^[+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/[\s\-()]/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      // Success - modal will be closed by parent
    } catch (error) {
      console.error('Error adding candidate:', error);
      // Handle error if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="modal add-candidate-modal" onKeyDown={handleKeyDown}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">
            <span className="modal-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
            Add New Candidate
          </h3>
          <button 
            className="close-btn" 
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Full Name <span className="required">*</span>
              </label>
              <input 
                type="text" 
                className={`form-input ${errors.name ? 'error' : ''}`}
                name="name" 
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter candidate's full name"
                disabled={isSubmitting}
                autoFocus
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Email Address <span className="required">*</span>
              </label>
              <input 
                type="email" 
                className={`form-input ${errors.email ? 'error' : ''}`}
                name="email" 
                value={formData.email}
                onChange={handleChange}
                placeholder="candidate@email.com"
                disabled={isSubmitting}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="tel" 
                className={`form-input ${errors.phone ? 'error' : ''}`}
                name="phone" 
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 123-4567"
                disabled={isSubmitting}
              />
              {errors.phone && <div className="error-message">{errors.phone}</div>}
            </div>
            
            <div className="form-group">
              <label className="form-label">
                Job Title <span className="required">*</span>
              </label>
              <input 
                type="text" 
                className={`form-input ${errors.position ? 'error' : ''}`}
                name="position" 
                value={formData.position}
                onChange={handleChange}
                placeholder="e.g., Software Engineer"
                disabled={isSubmitting}
              />
              {errors.position && <div className="error-message">{errors.position}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Experience Level</label>
              <input 
                type="text" 
                className="form-input"
                name="experience" 
                value={formData.experience}
                onChange={handleChange}
                placeholder="e.g., 3 years, Senior level"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Initial Status</label>
              <select 
                className="form-select"
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="applied">Applied</option>
                <option value="reviewing">Reviewing</option>
                <option value="interview">Interview</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Source</label>
              <select 
                className="form-select"
                name="source"
                value={formData.source}
                onChange={handleChange}
                disabled={isSubmitting}
              >
                <option value="Manual Entry">Manual Entry</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Indeed">Indeed</option>
                <option value="Company Website">Company Website</option>
                <option value="Referral">Referral</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Custom Source</label>
              <input 
                type="text" 
                className="form-input"
                name="source" 
                value={formData.source === 'Other' ? '' : formData.source}
                onChange={(e) => {
                  if (formData.source === 'Other') {
                    setFormData(prev => ({
                      ...prev,
                      source: e.target.value
                    }));
                  }
                }}
                placeholder="Enter custom source"
                disabled={isSubmitting || formData.source !== 'Other'}
              />
            </div>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Adding...
                </>
              ) : (
                <>
                  <span className="btn-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </span>
                  Add Candidate
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCandidateModal;
