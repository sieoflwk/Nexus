import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import './DashboardView.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DashboardView = ({ candidates, onShowAddModal, onShowUploadModal, onViewChange }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const totalCandidates = candidates.length;
  const activeJobs = new Set(candidates.map(c => c.position)).size;
  const interviews = candidates.filter(c => c.status === 'interview').length;
  const hired = candidates.filter(c => c.status === 'hired').length;
  const applied = candidates.filter(c => c.status === 'applied').length;
  const reviewing = candidates.filter(c => c.status === 'reviewing').length;
  const rejected = candidates.filter(c => c.status === 'rejected').length;

  // 기간별 데이터 계산
  const getPeriodData = () => {
    const now = new Date();
    let startDate;
    
    switch (selectedPeriod) {
      case '7d':
        startDate = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
        break;
      case '30d':
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        break;
      case '90d':
        startDate = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));
        break;
      default:
        startDate = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    }

    const periodCandidates = candidates.filter(c => {
      const appliedDate = new Date(c.appliedDate);
      return appliedDate >= startDate;
    });

    return periodCandidates;
  };

  const periodCandidates = getPeriodData();

  // 최근 활동 데이터 - 실제 후보자 데이터 기반
  const generateRecentActivities = () => {
    const activities = [];
    let id = 1;

    // 최근 지원자들
    const recentCandidates = candidates
      .sort((a, b) => new Date(b.appliedDate) - new Date(a.appliedDate))
      .slice(0, 3);

    recentCandidates.forEach(candidate => {
      const appliedDate = new Date(candidate.appliedDate);
      const now = new Date();
      const diffTime = Math.abs(now - appliedDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let timeText;
      if (diffDays === 1) timeText = '1 day ago';
      else if (diffDays < 7) timeText = `${diffDays} days ago`;
      else timeText = `${Math.ceil(diffDays / 7)} weeks ago`;

      activities.push({
        id: id++,
        type: 'application',
        message: `New application from ${candidate.name}`,
        time: timeText,
        status: candidate.status,
        candidateId: candidate.id
      });
    });

    // 상태 변경된 후보자들
    const statusChangedCandidates = candidates
      .filter(c => c.status === 'interview' || c.status === 'hired' || c.status === 'rejected')
      .slice(0, 2);

    statusChangedCandidates.forEach(candidate => {
      const appliedDate = new Date(candidate.appliedDate);
      const now = new Date();
      const diffTime = Math.abs(now - appliedDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let timeText;
      if (diffDays === 1) timeText = '1 day ago';
      else if (diffDays < 7) timeText = `${diffDays} days ago`;
      else timeText = `${Math.ceil(diffDays / 7)} weeks ago`;

      let type, message;
      if (candidate.status === 'interview') {
        type = 'interview';
        message = `Interview scheduled with ${candidate.name}`;
      } else if (candidate.status === 'hired') {
        type = 'hired';
        message = `Congratulations! ${candidate.name} was hired`;
      } else if (candidate.status === 'rejected') {
        type = 'rejection';
        message = `${candidate.name} application rejected`;
      }

      activities.push({
        id: id++,
        type,
        message,
        time: timeText,
        status: candidate.status,
        candidateId: candidate.id
      });
    });

    return activities.sort((a, b) => {
      const aTime = a.time.includes('day') ? parseInt(a.time) : parseInt(a.time) * 7;
      const bTime = b.time.includes('day') ? parseInt(b.time) : parseInt(b.time) * 7;
      return aTime - bTime;
    }).slice(0, 5);
  };

  const recentActivities = generateRecentActivities();

  // 차트 데이터 - 기간별 지원자 추세
  const getApplicationTrendData = () => {
    const periodData = getPeriodData();
    const labels = [];
    const applicationData = [];
    const interviewData = [];

    if (selectedPeriod === '7d') {
      // 최근 7일
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        labels.push(dateStr);
        
        const dayCandidates = periodData.filter(c => {
          const appliedDate = new Date(c.appliedDate);
          return appliedDate.toDateString() === date.toDateString();
        });
        
        applicationData.push(dayCandidates.length);
        interviewData.push(dayCandidates.filter(c => c.status === 'interview').length);
      }
    } else if (selectedPeriod === '30d') {
      // 최근 30일 (주별)
      for (let i = 3; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - (i * 7));
        const dateStr = `Week ${4 - i}`;
        labels.push(dateStr);
        
        const weekCandidates = periodData.filter(c => {
          const appliedDate = new Date(c.appliedDate);
          const weekStart = new Date(date);
          const weekEnd = new Date(date.getTime() + (7 * 24 * 60 * 60 * 1000));
          return appliedDate >= weekStart && appliedDate < weekEnd;
        });
        
        applicationData.push(weekCandidates.length);
        interviewData.push(weekCandidates.filter(c => c.status === 'interview').length);
      }
    } else {
      // 최근 90일 (월별)
      for (let i = 2; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short' });
        labels.push(dateStr);
        
        const monthCandidates = periodData.filter(c => {
          const appliedDate = new Date(c.appliedDate);
          return appliedDate.getMonth() === date.getMonth() && 
                 appliedDate.getFullYear() === date.getFullYear();
        });
        
        applicationData.push(monthCandidates.length);
        interviewData.push(monthCandidates.filter(c => c.status === 'interview').length);
      }
    }

    return {
      labels,
      datasets: [
        {
          label: 'Applications',
          data: applicationData,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Interviews',
          data: interviewData,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
        }
      ]
    };
  };

  const applicationTrendData = getApplicationTrendData();

  // 차트 데이터 - 채용 파이프라인
  const pipelineData = {
    labels: ['Applied', 'Reviewing', 'Interview', 'Hired', 'Rejected'],
    datasets: [
      {
        data: [applied, reviewing, interviews, hired, rejected],
        backgroundColor: [
          '#dbeafe',
          '#fef3c7',
          '#d1fae5',
          '#e9d5ff',
          '#fee2e2'
        ],
        borderColor: [
          '#3b82f6',
          '#f59e0b',
          '#10b981',
          '#8b5cf6',
          '#ef4444'
        ],
        borderWidth: 2,
      }
    ]
  };

  // 차트 데이터 - 직책별 지원자 분포
  const positionData = {
    labels: ['Software Engineer', 'Frontend Developer', 'Copywriter', 'Chat Specialist'],
    datasets: [
      {
        label: 'Candidates',
        data: [
          candidates.filter(c => c.position === 'Software Engineer').length,
          candidates.filter(c => c.position === 'Frontend Developer').length,
          candidates.filter(c => c.position === 'Copywriter').length,
          candidates.filter(c => c.position === 'Chat Specialist').length,
        ],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
        ],
        borderWidth: 1,
      }
    ]
  };

  // 차트 옵션
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#374151',
          font: {
            size: 12
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: '#6b7280'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#374151',
          font: {
            size: 12
          }
        }
      }
    }
  };

  // 성과 지표 계산
  const timeToHire = candidates.filter(c => c.status === 'hired').length > 0 
    ? Math.round(candidates.filter(c => c.status === 'hired')
        .reduce((acc, c) => {
          const applied = new Date(c.appliedDate);
          const now = new Date();
          return acc + (now - applied);
        }, 0) / (candidates.filter(c => c.status === 'hired').length * (1000 * 60 * 60 * 24)))
    : 0;

  const conversionRate = totalCandidates > 0 ? Math.round((hired / totalCandidates) * 100) : 0;

  // Quick Actions 핸들러
  const handleQuickAction = (action) => {
    switch (action) {
      case 'addCandidate':
        if (onShowAddModal) onShowAddModal();
        break;
      case 'importCSV':
        if (onShowUploadModal) onShowUploadModal();
        break;
      case 'generateReport':
        if (onViewChange) onViewChange('reports');
        break;
      case 'scheduleInterview':
        if (onViewChange) onViewChange('candidates');
        break;
      case 'sendEmail':
        // TODO: 이메일 기능 구현
        console.log('Send Email functionality to be implemented');
        break;
      case 'settings':
        // TODO: 설정 기능 구현
        console.log('Settings functionality to be implemented');
        break;
      default:
        break;
    }
  };

  // Recent Activities View All 핸들러
  const handleViewAllActivities = () => {
    if (onViewChange) onViewChange('candidates');
  };

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Overview of your recruitment pipeline and performance metrics</p>
      </div>

      {/* 주요 메트릭 카드 */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-value">{totalCandidates}</div>
            <div className="metric-label">Total Candidates</div>
            <div className="metric-change positive">+12% from last month</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-value">{activeJobs}</div>
            <div className="metric-label">Active Jobs</div>
            <div className="metric-change positive">+3 new positions</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-value">{interviews}</div>
            <div className="metric-label">Interviews Scheduled</div>
            <div className="metric-change neutral">No change</div>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="metric-content">
            <div className="metric-value">{hired}</div>
            <div className="metric-label">Hired This Month</div>
            <div className="metric-change positive">+25% from last month</div>
          </div>
        </div>
      </div>

      {/* 성과 지표 */}
      <div className="performance-section">
        <div className="section-header">
          <h3>Performance Metrics</h3>
        </div>
        <div className="performance-grid">
          <div className="performance-card">
            <div className="performance-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="performance-content">
              <div className="performance-value">{timeToHire}</div>
              <div className="performance-label">Avg. Time to Hire (days)</div>
            </div>
          </div>
          
          <div className="performance-card">
            <div className="performance-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 20A6 6 0 0 0 6 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 10V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 10l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="performance-content">
              <div className="performance-value">{conversionRate}%</div>
              <div className="performance-label">Conversion Rate</div>
            </div>
          </div>
          
          <div className="performance-card">
            <div className="performance-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="performance-content">
              <div className="performance-value">85%</div>
              <div className="performance-label">Quality Score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics & Insights Section */}
      <div className="analytics-section">
        <div className="analytics-header">
          <h3>Analytics & Insights</h3>
          <div className="analytics-divider"></div>
        </div>
        
        <div className="charts-grid">
          <div className="chart-container">
            <div className="chart-header">
              <h4>Application Trends</h4>
              <div className="chart-controls">
                <select 
                  className="period-select" 
                  value={selectedPeriod} 
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
            </div>
            <div className="chart-wrapper">
              <Line data={applicationTrendData} options={chartOptions} />
            </div>
          </div>

          <div className="chart-container">
            <div className="chart-header">
              <h4>Pipeline Distribution</h4>
            </div>
            <div className="chart-wrapper">
              <Doughnut data={pipelineData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* 추가 차트 */}
      <div className="chart-section">
        <div className="section-header">
          <h3>Position Analysis</h3>
        </div>
        <div className="chart-container full-width">
          <div className="chart-wrapper">
            <Bar data={positionData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* 최근 활동 및 빠른 액션 */}
      <div className="dashboard-bottom">
        <div className="recent-activities-section">
          <div className="section-header">
            <h3>Recent Activities</h3>
          </div>
          <div className="activities-content">
            <div className="activities-list">
              {recentActivities.map(activity => (
                <div key={activity.id} className={`activity-item ${activity.status}`}>
                  <div className="activity-icon">
                    {activity.type === 'application' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {activity.type === 'interview' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {activity.type === 'status' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M1 4h22M1 8h22M1 12h22M1 16h22M1 20h22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {activity.type === 'hired' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <polyline points="20,6 9,17 4,12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                    {activity.type === 'rejection' && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div className="activity-content">
                    <div className="activity-message">{activity.message}</div>
                    <div className="activity-time">{activity.time}</div>
                  </div>
                  <div className={`activity-status status-${activity.status}`}>
                    {activity.status}
                  </div>
                </div>
              ))}
            </div>
            <div className="activities-footer">
              <button 
                className="btn btn-outline btn-sm"
                onClick={handleViewAllActivities}
              >
                View All
              </button>
            </div>
          </div>
        </div>

        <div className="quick-actions-section">
          <div className="section-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="actions-content">
            <div className="actions-grid">
              <button 
                className="quick-action-btn"
                onClick={() => handleQuickAction('addCandidate')}
              >
                <div className="action-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="action-text">Add Candidate</span>
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => handleQuickAction('importCSV')}
              >
                <div className="action-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="action-text">Import CSV</span>
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => handleQuickAction('generateReport')}
              >
                <div className="action-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="action-text">Generate Report</span>
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => handleQuickAction('scheduleInterview')}
              >
                <div className="action-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="action-text">Schedule Interview</span>
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => handleQuickAction('sendEmail')}
              >
                <div className="action-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="action-text">Send Email</span>
              </button>
              <button 
                className="quick-action-btn"
                onClick={() => handleQuickAction('settings')}
              >
                <div className="action-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09A1.65 1.65 0 0 0 19.4 15z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="action-text">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 알림 및 팁 */}
      <div className="tips-section">
        <div className="section-header">
          <h3>Tips & Insights</h3>
        </div>
        <div className="tips-grid">
          <div className="tip-card">
            <div className="tip-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="tip-content">
              <h4>Pro Tip</h4>
              <p>Use the advanced search filters to quickly find candidates by skills, experience level, or location.</p>
            </div>
          </div>
          
          <div className="tip-card">
            <div className="tip-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M18 20A6 6 0 0 0 6 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 10V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 10l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="tip-content">
              <h4>Performance Insight</h4>
              <p>Your conversion rate is above industry average. Keep up the great work!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
