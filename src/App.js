import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import CandidatesView from './components/CandidatesView';
import UploadView from './components/UploadView';
import ReportsView from './components/ReportsView';
import AddCandidateModal from './components/AddCandidateModal';
import UploadModal from './components/UploadModal';
import ViewCandidateModal from './components/ViewCandidateModal';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('candidates');
  const [candidates, setCandidates] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  useEffect(() => {
    const savedCandidates = JSON.parse(localStorage.getItem('ats_candidates')) || [];
    if (savedCandidates.length === 0) {
      setCandidates(getSampleData());
    } else {
      setCandidates(savedCandidates);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('ats_candidates', JSON.stringify(candidates));
  }, [candidates]);

  const getSampleData = () => {
    return [
      {
        id: 1,
        name: 'Andre Koch',
        email: 'andre.koch@contractor.com',
        phone: '+1-555-0123',
        position: 'Software Engineer',
        experience: '5 years',
        status: 'interview',
        appliedDate: '2025-08-10',
        source: 'Sample Data'
      },
      {
        id: 2,
        name: 'Sarah Williams',
        email: 'sarah.williams@email.com',
        phone: '+1-555-0456',
        position: 'Copywriter',
        experience: '3 years',
        status: 'reviewing',
        appliedDate: '2025-08-12',
        source: 'Sample Data'
      },
      {
        id: 3,
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+1-555-0789',
        position: 'Chat Specialist',
        experience: '2 years',
        status: 'applied',
        appliedDate: '2025-08-14',
        source: 'Sample Data'
      },
      {
        id: 4,
        name: 'Yvonne Alvarez',
        email: 'yvonne.alvarez@self-employed.com',
        phone: '+1-555-0321',
        position: 'Software Engineer',
        experience: '7 years',
        status: 'rejected',
        appliedDate: '2025-03-25',
        source: 'Sample Data'
      },
      {
        id: 5,
        name: 'Lilah Hill',
        email: 'lilah.hill@email.com',
        phone: '+1-555-0654',
        position: 'Software Engineer',
        experience: '4 years',
        status: 'applied',
        appliedDate: '2025-08-13',
        source: 'Sample Data'
      },
      {
        id: 6,
        name: 'David Park',
        email: 'david.park@email.com',
        phone: '+1-555-0987',
        position: 'Frontend Developer',
        experience: '6 years',
        status: 'interview',
        appliedDate: '2025-08-11',
        source: 'Sample Data'
      }
    ];
  };

  const addCandidate = (candidateData) => {
    const newCandidate = {
      ...candidateData,
      id: Date.now(),
      appliedDate: new Date().toISOString().split('T')[0],
      source: candidateData.source || 'Manual Entry'
    };
    setCandidates(prev => [...prev, newCandidate]);
    setShowAddModal(false);
  };

  const updateCandidateStatus = (id, status) => {
    setCandidates(prev => 
      prev.map(candidate => 
        candidate.id === id ? { ...candidate, status } : candidate
      )
    );
  };

  const deleteCandidate = (id) => {
    if (window.confirm('Are you sure you want to reject this candidate?')) {
      updateCandidateStatus(id, 'rejected');
    }
  };

  const permanentDeleteCandidate = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this candidate? This action cannot be undone.')) {
      setCandidates(prev => prev.filter(candidate => candidate.id !== id));
      setShowViewModal(false);
    }
  };

  const viewCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setShowViewModal(true);
  };

  const importCandidates = async (newCandidates) => {
    // 중복 이메일 체크
    const existingEmails = new Set(candidates.map(c => c.email.toLowerCase()));
    const duplicates = newCandidates.filter(c => existingEmails.has(c.email.toLowerCase()));
    
    if (duplicates.length > 0) {
      const duplicateEmails = duplicates.map(c => c.email).join(', ');
      if (!window.confirm(`다음 이메일이 이미 존재합니다: ${duplicateEmails}\n계속 진행하시겠습니까?`)) {
        return;
      }
    }
    
    // 새로운 candidates 추가
    setCandidates(prev => [...prev, ...newCandidates]);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <DashboardView 
            candidates={candidates}
            onShowAddModal={() => setShowAddModal(true)}
            onShowUploadModal={() => setShowUploadModal(true)}
            onViewChange={setCurrentView}
          />
        );
      case 'candidates':
        return (
          <CandidatesView 
            candidates={candidates}
            onViewCandidate={viewCandidate}
            onUpdateStatus={updateCandidateStatus}
            onDeleteCandidate={deleteCandidate}
            onShowAddModal={() => setShowAddModal(true)}
          />
        );
      case 'upload':
        return <UploadView onImportCandidates={importCandidates} onViewChange={setCurrentView} />;
      case 'reports':
        return <ReportsView />;
      default:
        return <CandidatesView 
          candidates={candidates}
          onViewCandidate={viewCandidate}
          onUpdateStatus={updateCandidateStatus}
          onDeleteCandidate={deleteCandidate}
          onShowAddModal={() => setShowAddModal(true)}
        />;
    }
  };

  return (
    <div className="App">
      <Header 
        currentView={currentView}
        onViewChange={setCurrentView}
        onShowAddModal={() => setShowAddModal(true)}
        onShowUploadModal={() => setShowUploadModal(true)}
      />
      
      <main className="main-container">
        {renderView()}
      </main>

      {showAddModal && (
        <AddCandidateModal 
          onClose={() => setShowAddModal(false)}
          onSubmit={addCandidate}
        />
      )}

      {showUploadModal && (
        <UploadModal 
          onClose={() => setShowUploadModal(false)}
          onImportCandidates={importCandidates}
        />
      )}

      {showViewModal && selectedCandidate && (
        <ViewCandidateModal 
          candidate={selectedCandidate}
          onClose={() => setShowViewModal(false)}
          onUpdateStatus={updateCandidateStatus}
          onDelete={permanentDeleteCandidate}
        />
      )}
    </div>
  );
}

export default App;
