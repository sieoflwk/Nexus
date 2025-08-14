import React, { useState, useRef, useEffect } from 'react';
import './Header.css';

const Header = ({ currentView, onViewChange, onShowAddModal, onShowUploadModal }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New candidate applied for Software Engineer', time: '2m ago', unread: true },
    { id: 2, message: 'Interview scheduled with Sarah Williams', time: '1h ago', unread: true },
    { id: 3, message: 'Report generated successfully', time: '3h ago', unread: false }
  ]);

  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getViewLabel = (view) => {
    const viewMap = {
      'dashboard': 'Dashboard',
      'candidates': 'Candidates', 
      'upload': 'Upload',
      'reports': 'Interview Guide'
    };
    return viewMap[view] || view;
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  // 모든 알림을 읽음 처리
  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, unread: false }))
    );
  };

  // 개별 알림을 읽음 처리
  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, unread: false } : notification
      )
    );
  };

  // 사용자 메뉴 액션들
  const handleUserAction = (action) => {
    switch (action) {
      case 'settings':
        console.log('Settings clicked');
        // TODO: 설정 모달 열기
        break;
      case 'team':
        console.log('Team Management clicked');
        // TODO: 팀 관리 모달 열기
        break;
      case 'help':
        console.log('Help & Support clicked');
        // TODO: 도움말 모달 열기
        break;
      case 'signout':
        console.log('Sign Out clicked');
        // TODO: 로그아웃 처리
        if (window.confirm('Are you sure you want to sign out?')) {
          // 로그아웃 로직
          window.location.reload();
        }
        break;
      default:
        break;
    }
    setShowUserMenu(false);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-title">Nexus</span>
              <span className="logo-subtitle">ATS Platform</span>
            </div>
          </div>
          
          <nav className="nav">
            {['dashboard', 'candidates', 'upload', 'reports'].map(view => (
              <button 
                key={view}
                className={`nav-item ${currentView === view ? 'active' : ''}`}
                onClick={() => onViewChange(view)}
              >
                <span className="nav-text">{getViewLabel(view)}</span>
                {currentView === view && <div className="nav-indicator" />}
              </button>
            ))}
          </nav>
        </div>

        <div className="header-right">
          <div className="header-actions">
            <button 
              className="btn btn-secondary btn-sm"
              onClick={onShowUploadModal}
              title="Import candidates"
            >
              Import
            </button>
            <button 
              className="btn btn-primary btn-sm"
              onClick={onShowAddModal}
              title="Add new candidate"
            >
              Add Candidate
            </button>
          </div>

          <div className="header-utilities">
            {/* 알림 버튼 */}
            <div className="notification-container" ref={notificationRef}>
              <button 
                className="utility-btn notification-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                title="Notifications"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>
              
              {/* 알림 드롭다운 */}
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <span>Recent Notifications</span>
                    {unreadCount > 0 && (
                      <button className="mark-all-read" onClick={markAllAsRead}>
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="notification-list">
                    {notifications.slice(0, 5).map(notification => (
                      <div 
                        key={notification.id} 
                        className={`notification-item ${notification.unread ? 'unread' : ''}`}
                        onClick={() => notification.unread && markAsRead(notification.id)}
                      >
                        <div className="notification-content">
                          <div className="notification-message">{notification.message}</div>
                          <div className="notification-time">{notification.time}</div>
                        </div>
                        {notification.unread && <div className="unread-dot" />}
                      </div>
                    ))}
                  </div>
                  {notifications.length === 0 && (
                    <div className="notification-empty">
                      <span>No notifications</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 사용자 메뉴 */}
            <div className="user-menu-container" ref={userMenuRef}>
              <button 
                className="utility-btn user-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
                title="User menu"
              >
                <div className="user-avatar">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="user-name">Admin User</span>
                <span className="dropdown-arrow">▼</span>
              </button>
              
              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-info">
                      <div className="user-avatar-large">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <div className="user-full-name">Admin User</div>
                        <div className="user-email">admin@company.com</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="dropdown-menu">
                    <button 
                      className="dropdown-item"
                      onClick={() => handleUserAction('settings')}
                    >
                      <span className="dropdown-text">Settings</span>
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={() => handleUserAction('team')}
                    >
                      <span className="dropdown-text">Team Management</span>
                    </button>
                    <button 
                      className="dropdown-item"
                      onClick={() => handleUserAction('help')}
                    >
                      <span className="dropdown-text">Help & Support</span>
                    </button>
                    <div className="dropdown-divider" />
                    <button 
                      className="dropdown-item"
                      onClick={() => handleUserAction('signout')}
                    >
                      <span className="dropdown-text">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
