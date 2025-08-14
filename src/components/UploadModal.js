import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import './Modal.css';
import './UploadModal.css';

const UploadModal = ({ onClose, onImportCandidates }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mappedHeaders, setMappedHeaders] = useState({});
  const [previewData, setPreviewData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('upload'); // upload, mapping, preview, success

  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  // 헤더 매핑 옵션들
  const headerOptions = {
    name: ['Name', 'Full Name', 'Candidate Name', 'First Name', 'Last Name', '이름'],
    email: ['Email', 'Email Address', 'E-mail', '이메일'],
    phone: ['Phone', 'Phone Number', 'Mobile', 'Contact', '전화번호'],
    position: ['Position', 'Job Title', 'Role', 'Title', '직책'],
    experience: ['Experience', 'Years', 'Level', 'Seniority', '경력'],
    status: ['Status', 'Stage', 'Phase', '상태'],
    appliedDate: ['Applied Date', 'Application Date', 'Date Applied', '신청일'],
    source: ['Source', 'Origin', 'Channel', '출처']
  };

  // 드래그 앤 드롭 이벤트 핸들러
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
    setFile(selectedFile);
    setError('');
    
    const fileName = selectedFile.name.toLowerCase();
    if (fileName.endsWith('.csv')) {
      setFileType('csv');
      processCSV(selectedFile);
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      setFileType('excel');
      processExcel(selectedFile);
    } else {
      setError('Unsupported file format. Please upload a CSV or Excel file.');
    }
  };

  const processCSV = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Error occurred while parsing CSV file.');
          return;
        }
        handleParsedData(results.data, results.meta.fields);
      }
    });
  };

  const processExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          setError('Excel file has insufficient data.');
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
        
        handleParsedData(dataRows, headers);
      } catch (error) {
        setError('Excel 파일을 처리하는 중 오류가 발생했습니다.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleParsedData = (data, fileHeaders) => {
    if (data.length === 0) {
      setError('No data found in file.');
      return;
    }
    
    setParsedData(data);
    setHeaders(fileHeaders);
    
    // 자동 헤더 매핑
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
    
    setMappedHeaders(autoMapping);
    setPreviewData(data.slice(0, 5)); // 처음 5개 행만 미리보기
    setStep('mapping');
  };

  const updateHeaderMapping = (fileHeader, mappedHeader) => {
    setMappedHeaders(prev => ({
      ...prev,
      [fileHeader]: mappedHeader
    }));
  };

  const validateMapping = () => {
    const requiredFields = ['name', 'email', 'position'];
    const mappedValues = Object.values(mappedHeaders);
    
    for (const field of requiredFields) {
      if (!mappedValues.includes(field)) {
        setError(`${field === 'name' ? 'Name' : field === 'email' ? 'Email' : 'Position'} field is not mapped.`);
        return false;
      }
    }
    
    return true;
  };

  const handlePreview = () => {
    if (!validateMapping()) return;
    
    const transformedData = parsedData.map(row => {
      const candidate = {};
      Object.entries(mappedHeaders).forEach(([fileHeader, mappedHeader]) => {
        if (mappedHeader && row[fileHeader] !== undefined) {
          candidate[mappedHeader] = row[fileHeader];
        }
      });
      
      // 기본값 설정
      candidate.id = Date.now() + Math.random();
      candidate.status = candidate.status || 'applied';
      candidate.appliedDate = candidate.appliedDate || new Date().toISOString().split('T')[0];
      candidate.source = candidate.source || 'File Import';
      
      return candidate;
    });
    
    setPreviewData(transformedData);
    setStep('preview');
  };

  const handleImport = async () => {
    if (!validateMapping()) return;
    
    setIsProcessing(true);
    
    try {
      const transformedData = parsedData.map(row => {
        const candidate = {};
        Object.entries(mappedHeaders).forEach(([fileHeader, mappedHeader]) => {
          if (mappedHeader && row[fileHeader] !== undefined) {
            candidate[mappedHeader] = row[fileHeader];
          }
        });
        
        // 기본값 설정
        candidate.id = Date.now() + Math.random();
        candidate.status = candidate.status || 'applied';
        candidate.appliedDate = candidate.appliedDate || new Date().toISOString().split('T')[0];
        candidate.source = candidate.source || 'File Import';
        
        return candidate;
      });
      
      await onImportCandidates(transformedData);
      setStep('success');
    } catch (error) {
              setError('Error occurred while importing data.');
    } finally {
      setIsProcessing(false);
    }
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
    setFile(null);
    setFileType('');
    setParsedData([]);
    setHeaders([]);
    setMappedHeaders({});
    setPreviewData([]);
    setError('');
    setStep('upload');
  };

  const renderUploadStep = () => (
    <div className="upload-step">
      <div className="upload-header">
        <h3>File Upload</h3>
        <p>Upload CSV or Excel files to import candidate information.</p>
      </div>
      
      <div className="template-section">
        <button 
          type="button" 
          className="btn btn-outline btn-sm"
          onClick={downloadTemplate}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Download Template
        </button>
        <span className="template-info">Download template in CSV or Excel format for reference.</span>
      </div>
      
      <div 
        ref={dropRef}
        className={`upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="upload-content">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="upload-icon">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h4>Drag and drop files here or click to select</h4>
          <p>Supports CSV (.csv) and Excel (.xlsx, .xls) files</p>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose File
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
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );

  const renderMappingStep = () => (
    <div className="mapping-step">
      <div className="mapping-header">
        <h3>Header Mapping</h3>
        <p>Map file columns to system fields. Required fields are Name, Email, and Position.</p>
      </div>
      
      <div className="mapping-grid">
        {headers.map(header => (
          <div key={header} className="mapping-row">
            <div className="file-header">
              <span className="header-label">File Column:</span>
              <span className="header-value">{header}</span>
            </div>
            <div className="mapping-select">
              <select
                value={mappedHeaders[header] || ''}
                onChange={(e) => updateHeaderMapping(header, e.target.value)}
              >
                <option value="">No Mapping</option>
                <option value="name">Name (Required)</option>
                <option value="email">Email (Required)</option>
                <option value="phone">Phone</option>
                <option value="position">Position (Required)</option>
                <option value="experience">Experience</option>
                <option value="status">Status</option>
                <option value="appliedDate">Applied Date</option>
                <option value="source">Source</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mapping-actions">
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={() => setStep('upload')}
        >
          Back
        </button>
        <button 
          type="button" 
          className="btn btn-primary"
          onClick={handlePreview}
        >
          Preview
        </button>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div className="preview-step">
      <div className="preview-header">
        <h3>Data Preview</h3>
        <p>Review the transformed data and proceed with import.</p>
      </div>
      
      <div className="preview-table">
        <table>
          <thead>
            <tr>
              {Object.values(mappedHeaders).filter(Boolean).map(header => (
                <th key={header}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, index) => (
              <tr key={index}>
                {Object.values(mappedHeaders).filter(Boolean).map(header => (
                  <td key={header}>{row[header] || '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="preview-info">
        <p>Total <strong>{parsedData.length}</strong> candidate data will be imported.</p>
      </div>
      
      <div className="preview-actions">
        <button 
          type="button" 
          className="btn btn-secondary"
          onClick={() => setStep('mapping')}
        >
          Back
        </button>
        <button 
          type="button" 
          className="btn btn-primary"
          onClick={handleImport}
          disabled={isProcessing}
        >
          {isProcessing ? 'Importing...' : 'Import'}
        </button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="success-step">
      <div className="success-content">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" className="success-icon">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M22 4L12 14.01l-3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h3>Import Complete!</h3>
        <p><strong>{parsedData.length}</strong> candidate data has been successfully imported.</p>
      </div>
      
      <div className="success-actions">
        <button 
          type="button" 
          className="btn btn-primary"
          onClick={onClose}
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
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <div className="modal-body">
          {step === 'upload' && renderUploadStep()}
          {step === 'mapping' && renderMappingStep()}
          {step === 'preview' && renderPreviewStep()}
          {step === 'success' && renderSuccessStep()}
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
