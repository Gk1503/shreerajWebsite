import React, { useState, useEffect } from 'react';
import { fetchCategories } from '../../services/api';
import { createProduct } from '../../services/adminApi';
import './Manager.css';

const BulkProductUpload = ({ onUpdate, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [results, setResults] = useState([]);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data || []);
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const extractProductName = (filename) => {
    // Remove file extension and clean up the name
    return filename
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[-_]/g, ' ') // Replace dashes and underscores with spaces
      .replace(/\d+/g, '') // Remove numbers
      .trim();
  };

  const handleBulkUpload = async () => {
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }

    if (files.length === 0) {
      alert('Please select images to upload');
      return;
    }

    setUploading(true);
    setProgress({ current: 0, total: files.length });
    const uploadResults = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const productName = extractProductName(file.name);

      try {
        const formData = new FormData();
        formData.append('name', productName);
        formData.append('description', `High-quality ${productName} for industrial applications`);
        formData.append('category', selectedCategory);
        formData.append('status', 'published');
        formData.append('images', file);

        await createProduct(formData);
        
        uploadResults.push({
          filename: file.name,
          productName: productName,
          status: 'success'
        });
      } catch (error) {
        uploadResults.push({
          filename: file.name,
          productName: productName,
          status: 'error',
          error: error.message
        });
      }

      setProgress({ current: i + 1, total: files.length });
    }

    setResults(uploadResults);
    setUploading(false);
    onUpdate();
  };

  return (
    <div className="bulk-upload-modal">
      <div className="bulk-upload-content">
        <div className="bulk-upload-header">
          <h2>Bulk Product Upload</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="bulk-upload-body">
          {!uploading && results.length === 0 && (
            <>
              <div className="form-group">
                <label>Select Category *</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  required
                >
                  <option value="">Choose a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Product Images *</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <small>
                  Select multiple images. Product names will be extracted from filenames.
                  <br />
                  Example: "bearing-123.jpg" → Product name: "bearing"
                </small>
              </div>

              {files.length > 0 && (
                <div className="file-preview">
                  <h4>Selected Files ({files.length}):</h4>
                  <div className="file-list">
                    {files.slice(0, 10).map((file, index) => (
                      <div key={index} className="file-item">
                        <span className="file-name">{file.name}</span>
                        <span className="arrow">→</span>
                        <span className="product-name">{extractProductName(file.name)}</span>
                      </div>
                    ))}
                    {files.length > 10 && (
                      <div className="file-item">
                        <span>... and {files.length - 10} more files</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="form-actions">
                <button 
                  className="btn-primary" 
                  onClick={handleBulkUpload}
                  disabled={!selectedCategory || files.length === 0}
                >
                  Upload {files.length} Products
                </button>
                <button className="btn-secondary" onClick={onClose}>
                  Cancel
                </button>
              </div>
            </>
          )}

          {uploading && (
            <div className="upload-progress">
              <h3>Uploading Products...</h3>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(progress.current / progress.total) * 100}%` }}
                ></div>
              </div>
              <p>{progress.current} of {progress.total} uploaded</p>
            </div>
          )}

          {!uploading && results.length > 0 && (
            <div className="upload-results">
              <h3>Upload Complete!</h3>
              <div className="results-summary">
                <div className="success-count">
                  ✓ {results.filter(r => r.status === 'success').length} successful
                </div>
                <div className="error-count">
                  ✗ {results.filter(r => r.status === 'error').length} failed
                </div>
              </div>
              
              <div className="results-list">
                {results.map((result, index) => (
                  <div key={index} className={`result-item ${result.status}`}>
                    <span className="status-icon">
                      {result.status === 'success' ? '✓' : '✗'}
                    </span>
                    <span className="result-name">{result.productName}</span>
                    {result.status === 'error' && (
                      <span className="error-msg">{result.error}</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button className="btn-primary" onClick={onClose}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BulkProductUpload;
