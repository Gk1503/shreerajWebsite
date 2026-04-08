import React, { useState, useEffect } from 'react';
import { API_URL } from '../../config';
import './Manager.css';

const BulkUploadProducts = ({ onComplete }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const result = await response.json();
      console.log('Loaded categories:', result.data);
      setCategories(result.data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleBulkUpload = async () => {
    if (!selectedCategory) {
      alert('Please select a category');
      return;
    }

    if (selectedFiles.length === 0) {
      alert('Please select images to upload');
      return;
    }

    console.log('Selected category ID:', selectedCategory);
    console.log('Selected category type:', typeof selectedCategory);

    setUploading(true);
    setProgress({ current: 0, total: selectedFiles.length });

    const formData = new FormData();
    formData.append('category', selectedCategory);
    
    console.log('FormData category:', formData.get('category'));
    
    selectedFiles.forEach((file) => {
      formData.append('images', file);
    });

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        const successMsg = result.failed > 0 
          ? `Success! Created ${result.success} products. ${result.failed} failed (likely duplicates).`
          : `Success! Created ${result.success} products`;
        
        alert(successMsg);
        
        if (result.failedProducts && result.failedProducts.length > 0) {
          console.log('Failed products:', result.failedProducts);
        }
        
        setSelectedFiles([]);
        setSelectedCategory('');
        if (onComplete) onComplete();
      } else {
        alert('Error: ' + result.message);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload products');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Bulk Upload Products</h2>
      </div>

      <div className="manager-form">
        <div className="bulk-upload-info">
          <h3>📦 How it works:</h3>
          <ul>
            <li>Select a category for all products</li>
            <li>Choose multiple images (up to 100 at once)</li>
            <li>Product name will be the image filename</li>
            <li>Images will be uploaded to Cloudinary</li>
            <li>You can edit products later</li>
          </ul>
        </div>

        <div className="form-group">
          <label>Select Category *</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              console.log('Selected value:', e.target.value);
              console.log('Selected option:', e.target.options[e.target.selectedIndex]);
              setSelectedCategory(e.target.value);
            }}
            disabled={uploading}
          >
            <option value="">Choose a category...</option>
            {categories.map((cat) => {
              const catId = cat.id || cat._id;
              console.log('Rendering category:', cat.name, 'with ID:', catId);
              return (
                <option key={catId} value={catId}>
                  {cat.name}
                </option>
              );
            })}
          </select>
          {selectedCategory && (
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
              Selected ID: {selectedCategory}
            </p>
          )}
        </div>

        <div className="form-group">
          <label>Select Images *</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          {selectedFiles.length > 0 && (
            <p style={{ marginTop: '0.5rem', color: '#666' }}>
              {selectedFiles.length} files selected
            </p>
          )}
        </div>

        {selectedFiles.length > 0 && (
          <div className="preview-grid">
            <h4>Preview ({selectedFiles.length} images):</h4>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
              gap: '1rem',
              maxHeight: '300px',
              overflow: 'auto',
              padding: '1rem',
              background: '#f8f9fa',
              borderRadius: '8px'
            }}>
              {selectedFiles.slice(0, 20).map((file, index) => (
                <div key={index} style={{ textAlign: 'center' }}>
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt={file.name}
                    style={{ 
                      width: '100px', 
                      height: '100px', 
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                  <p style={{ 
                    fontSize: '0.75rem', 
                    marginTop: '0.25rem',
                    wordBreak: 'break-word'
                  }}>
                    {file.name.substring(0, 15)}...
                  </p>
                </div>
              ))}
              {selectedFiles.length > 20 && (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.9rem',
                  color: '#666'
                }}>
                  +{selectedFiles.length - 20} more
                </div>
              )}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button 
            className="btn-primary" 
            onClick={handleBulkUpload}
            disabled={uploading || !selectedCategory || selectedFiles.length === 0}
            style={{ 
              opacity: uploading ? 0.6 : 1,
              cursor: uploading ? 'not-allowed' : 'pointer'
            }}
          >
            {uploading ? `Uploading... (${progress.current}/${progress.total})` : `Upload ${selectedFiles.length} Products`}
          </button>
        </div>

        {uploading && (
          <div style={{ 
            marginTop: '1rem', 
            padding: '1rem', 
            background: '#e3f2fd',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <p>⏳ Uploading to Cloudinary and creating products...</p>
            <p style={{ fontSize: '0.9rem', color: '#666' }}>This may take a few moments</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkUploadProducts;
