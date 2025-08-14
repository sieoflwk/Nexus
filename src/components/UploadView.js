import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import './UploadView.css';

const UploadView = ({ onImportCandidates, onViewChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileType, setFileType] = useState('');
  const [parsedData, setParsedData] = useState([]);
  // const [headers, setHeaders] = useState([]); // 사용하지 않는 변수 주석 처리
  // const [mappedHeaders, setMappedHeaders] = useState({}); // 사용하지 않는 변수 주석 처리
  // const [previewData, setPreviewData] = useState([]); // 사용하지 않는 변수 주석 처리
  // const [isProcessing, setIsProcessing] = useState(false); // 사용하지 않는 변수 주석 처리
  // const [error, setError] = useState(''); // 사용하지 않는 변수 주석 처리
  // const [file, setFile] = useState(null); // 사용하지 않는 변수 주석 처리
  const [step, setStep] = useState('upload'); // upload, mapping, preview, success
  const [showModal, setShowModal] = useState(false);

  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  // Header mapping options
  const headerOptions = {
    name: ['Name', 'Full Name', 'Candidate Name', 'First Name', 'Last Name'],
    email: ['Email', 'Email Address', 'E-mail'],
    phone: ['Phone', 'Phone Number', 'Mobile', 'Contact'],
    position: ['Position', 'Job Title', 'Role', 'Title'],
    experience: ['Experience', 'Years', 'Level', 'Seniority'],
    status: ['Status', 'Stage', 'Phase'],
    appliedDate: ['Applied Date', 'Application Date', 'Date Applied'],
    source: ['Source', 'Origin', 'Channel']
  };

  // Drag and drop event handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    console.log('handleFile called with:', selectedFile);
    // setFile(selectedFile); // 사용하지 않는 함수 호출 주석 처리
    // setError(''); // 사용하지 않는 함수 호출 주석 처리
    
    const fileName = selectedFile.name.toLowerCase();
    console.log('File name:', fileName);
    
    if (fileName.endsWith('.csv')) {
      console.log('Processing CSV file');
      setFileType('csv');
      processCSV(selectedFile);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      console.log('Processing Excel file');
      setFileType('excel');
      processExcel(selectedFile);
    } else {
      console.log('Unsupported file type');
      // setError('Unsupported file format. Please upload a CSV or Excel file.'); // 사용하지 않는 함수 호출 주석 처리
    }
  };

  const processCSV = (file) => {
    console.log('processCSV called');
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        console.log('CSV parsing complete:', results);
        if (results.errors.length > 0) {
          console.log('CSV parsing errors:', results.errors);
          // setError('Error occurred while parsing CSV file.'); // 사용하지 않는 함수 호출 주석 처리
          return;
        }
        handleParsedData(results.data, results.meta.fields);
      }
    });
  };

  const processExcel = (file) => {
    console.log('processExcel called');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        console.log('Excel file read successfully');
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        console.log('Excel parsed data:', jsonData);
        
        if (jsonData.length < 2) {
          console.log('Excel file has insufficient data');
          // setError('Excel file has insufficient data.'); // 사용하지 않는 함수 호출 주석 처리
          return;
        }
        
        const headers = jsonData[0];
        const dataRows = jsonData.slice(1).map(row => {
          const obj = {};
          headers.forEach((header, index) => {
            obj[header] = row[index] || '';
          });
          return obj;
        });
        
        console.log('Excel processed data:', { headers, dataRows });
        handleParsedData(dataRows, headers);
      } catch (error) {
        console.error('Excel processing error:', error);
        // setError('Error occurred while processing Excel file.'); // 사용하지 않는 함수 호출 주석 처리
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleParsedData = (data, fileHeaders) => {
    console.log('handleParsedData called with:', { data, fileHeaders });
    
    if (data.length === 0) {
      console.log('No data found in file');
      // setError('No data found in file.'); // 사용하지 않는 함수 호출 주석 처리
      return;
    }
    
    setParsedData(data);
    // setHeaders(fileHeaders); // 사용하지 않는 함수 호출 주석 처리
    
    // Auto header mapping
    const autoMapping = {};
    fileHeaders.forEach(header => {
      for (const [key, options] of Object.entries(headerOptions)) {
        if (options.some(option => 
          header.toLowerCase().includes(option.toLowerCase()) ||
          option.toLowerCase().includes(header.toLowerCase())
        )) {
          autoMapping[header] = key;
          break;
        }
      }
    });
    
    // Add missing fields with default values
    const requiredFields = ['name', 'email', 'position'];
    const optionalFields = ['phone', 'experience', 'status', 'appliedDate', 'source'];
    
    // Ensure required fields are mapped
    requiredFields.forEach(field => {
      if (!Object.values(autoMapping).includes(field)) {
        const defaultHeader = field === 'name' ? 'Full Name' : 
                             field === 'email' ? 'Email' : 'Job Title';
        autoMapping[defaultHeader] = field;
      }
    });
    
    // Add optional fields with defaults
    optionalFields.forEach(field => {
      if (!Object.values(autoMapping).includes(field)) {
        const defaultHeader = field === 'phone' ? 'Phone' :
                             field === 'experience' ? 'Experience' :
                             field === 'status' ? 'Status' :
                             field === 'appliedDate' ? 'Applied Date' :
                             'Source';
        autoMapping[defaultHeader] = field;
      }
    });
    
    console.log('Enhanced auto mapping result:', autoMapping);
    
    // setMappedHeaders(autoMapping); // 사용하지 않는 함수 호출 주석 처리
    
    // Auto-import functionality - directly process and import data
    const transformedData = data.map(row => {
      const candidate = {};
      
      // Extract data from mapped headers
      Object.entries(autoMapping).forEach(([fileHeader, mappedHeader]) => {
        if (mappedHeader && row[fileHeader] !== undefined) {
          candidate[mappedHeader] = row[fileHeader];
        }
      });
      
      // Set default values for all fields
      candidate.id = Date.now() + Math.random();
      candidate.name = candidate.name || 'N/A';
      candidate.email = candidate.email || 'N/A';
      candidate.phone = candidate.phone || 'N/A';
      candidate.position = candidate.position || 'N/A';
      candidate.experience = candidate.experience || 'N/A';
      candidate.status = candidate.status || 'Applied';
      candidate.appliedDate = candidate.appliedDate || new Date().toISOString().split('T')[0];
      candidate.source = candidate.source || 'File Import';
      
      return candidate;
    });
    
    // setPreviewData(transformedData); // 사용하지 않는 함수 호출 주석 처리
    
    // Auto-import the data
    if (onImportCandidates) {
      onImportCandidates(transformedData);
    }
    
    // Show success step directly
    setStep('success');
    setShowModal(true);
    
    // Auto-navigate to candidates page after 2 seconds
    setTimeout(() => {
      if (onViewChange) {
        onViewChange('candidates');
      }
    }, 2000);
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Full Name': 'John Doe',
        'Email': 'john.doe@email.com',
        'Phone': '+1 (555) 123-4567',
        'Job Title': 'Software Engineer',
        'Experience': '3 years',
        'Status': 'Applied',
        'Applied Date': '2025-01-15',
        'Source': 'LinkedIn'
      },
      {
        'Full Name': 'Jane Smith',
        'Email': 'jane.smith@email.com',
        'Phone': '+1 (555) 987-6543',
        'Job Title': 'Product Manager',
        'Experience': '5 years',
        'Status': 'Reviewing',
        'Applied Date': '2025-01-16',
        'Source': 'Company Website'
      }
    ];
    
    if (fileType === 'csv') {
      const csv = Papa.unparse(templateData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'candidates_template.csv';
      link.click();
    } else {
      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Candidates');
      XLSX.writeFile(wb, 'candidates_template.xlsx');
    }
  };

  const resetModal = () => {
    // setFile(null); // 사용하지 않는 함수 호출 주석 처리
    setFileType('');
    setParsedData([]);
    // setHeaders([]); // 사용하지 않는 함수 호출 주석 처리
    // setMappedHeaders({}); // 사용하지 않는 함수 호출 주석 처리
    // setPreviewData([]); // 사용하지 않는 함수 호출 주석 처리
    // setError(''); // 사용하지 않는 함수 호출 주석 처리
    setStep('upload');
    setShowModal(false);
  };

  const renderSuccessStep = () => (
    <div className="success-step">
      <div className="success-content">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="success-icon">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h3>Import Complete!</h3>
        <p><strong>{parsedData.length}</strong> candidate data has been successfully imported.</p>
        <p className="auto-navigate-hint">You will be redirected to Candidates page in 2 seconds...</p>
      </div>
      
      <div className="success-actions">
        <button 
          type="button" 
          className="btn btn-primary"
          onClick={() => {
            resetModal();
            if (onViewChange) {
              onViewChange('candidates');
            }
          }}
        >
          Done
        </button>
        <button 
          type="button" 
          className="btn btn-outline"
          onClick={resetModal}
        >
          Import Another File
        </button>
      </div>
    </div>
  );

  return (
    <div className="view">
      <div className="page-header">
        <h1 className="page-title">Import Candidates</h1>
        <p className="page-subtitle">Upload CSV or Excel files to import candidates</p>
      </div>

      <div 
        ref={dropRef}
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-title">Drop files here to upload</div>
        <div className="upload-subtitle">Support CSV and Excel files</div>
        <div className="upload-actions">
          <button 
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose Files
          </button>
          <button 
            className="btn btn-outline"
            onClick={downloadTemplate}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Download Template
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          style={{ display: 'none' }}
        />
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal">
          <div className="modal-content upload-modal">
            <div className="modal-header">
              <h3 className="modal-title">
                <span className="modal-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
                Import Candidate Data
              </h3>
              <button 
                className="close-btn" 
                onClick={resetModal}
                aria-label="Close modal"
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {step === 'success' && renderSuccessStep()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadView;
