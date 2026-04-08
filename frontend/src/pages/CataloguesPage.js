import React, { useState, useEffect } from 'react';
import './CataloguesPage.css';
import Navbar from '../components/Navbar';
import { fetchCatalogues } from '../services/api';

const CataloguesPage = () => {
  const [selectedCatalogue, setSelectedCatalogue] = useState(null);
  const [catalogues, setCatalogues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    loadCatalogues();
  }, []);

  const loadCatalogues = async () => {
    setLoading(true);
    const data = await fetchCatalogues();
    console.log('Catalogues data:', data);
    setCatalogues(data || []);
    setLoading(false);
  };

  const getFileUrl = (fileData) => {
    if (!fileData) return null;
    
    // MongoDB format: direct object with url property
    if (fileData.url) {
      return fileData.url;
    }
    
    // If it's already a string
    if (typeof fileData === 'string') {
      return fileData;
    }
    
    return null;
  };

  const handleView = (catalogue) => {
    console.log('Opening catalogue:', catalogue);
    setPdfLoading(true);
    setSelectedCatalogue(catalogue);
  };

  const handleDownload = async (catalogue) => {
    const downloadUrl = getFileUrl(catalogue.downloadPdf);
    
    console.log('Download URL:', downloadUrl);
    
    if (downloadUrl) {
      try {
        const fullUrl = downloadUrl.startsWith('http') ? downloadUrl : `http://localhost:5000${downloadUrl}`;
        
        // Fetch the file as a blob
        const response = await fetch(fullUrl);
        const blob = await response.blob();
        
        // Create a download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${catalogue.name || 'catalogue'}.pdf`;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download error:', error);
        alert('Failed to download the file. Please try again.');
      }
    } else {
      alert('Download file not available');
    }
  };

  const closeViewer = () => {
    setSelectedCatalogue(null);
    setPdfLoading(false);
  };

  if (loading) {
    return (
      <div className="catalogues-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="catalogues-page">
      <Navbar />
      
      <div className="catalogues-container">
        <div className="catalogues-header">
          <h1 className="catalogues-title">Product Catalogues</h1>
          <p className="catalogues-subtitle">
            Browse and download our comprehensive product catalogues. View online or download for offline reference.
          </p>
        </div>

        <div className="catalogues-grid">
          {catalogues && catalogues.length > 0 ? catalogues.map((catalogue) => {
            // Handle MongoDB data structure
            const thumbnailUrl = catalogue.thumbnail?.url
              ? `http://localhost:5000${catalogue.thumbnail.url}`
              : 'https://via.placeholder.com/300x400/ff6b35/ffffff?text=Catalogue';

            return (
              <div key={catalogue.id} className="catalogue-card">
                <div className="catalogue-thumbnail">
                  <img src={thumbnailUrl} alt={catalogue.name || 'Catalogue'} />
                  <div className="catalogue-overlay">
                    <button 
                      className="view-btn"
                      onClick={() => handleView(catalogue)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      View
                    </button>
                    <button 
                      className="download-btn"
                      onClick={() => handleDownload(catalogue)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download
                    </button>
                  </div>
                </div>
                <div className="catalogue-info">
                  <h3 className="catalogue-name">{catalogue.name || 'Untitled'}</h3>
                  <p className="catalogue-category">
                    {catalogue.category?.name || 'General'}
                  </p>
                </div>
              </div>
            );
          }) : null}
        </div>

        {(!catalogues || catalogues.length === 0) && !loading && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            No catalogues available yet.
          </div>
        )}
      </div>

      {/* PDF Viewer Modal */}
      {selectedCatalogue && (() => {
        const pdfUrl = getFileUrl(selectedCatalogue.viewPdf);
        const fullPdfUrl = pdfUrl 
          ? (pdfUrl.startsWith('http') ? pdfUrl : `http://localhost:5000${pdfUrl}`)
          : null;
        
        console.log('Selected catalogue:', selectedCatalogue);
        console.log('PDF URL:', pdfUrl);
        console.log('Full PDF URL:', fullPdfUrl);
        
        return (
        <div className="pdf-viewer-modal" onClick={closeViewer}>
          <div className="pdf-viewer-content" onClick={(e) => e.stopPropagation()}>
            <div className="pdf-viewer-header">
              <h2>{selectedCatalogue.name || 'Catalogue'}</h2>
              <div className="pdf-viewer-actions">
                <button 
                  className="download-modal-btn"
                  onClick={() => handleDownload(selectedCatalogue)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Download
                </button>
                <button className="close-btn" onClick={closeViewer}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            </div>
            <div className="pdf-viewer-body">
              {pdfLoading && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                  background: 'rgba(255, 255, 255, 0.9)',
                  padding: '2rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '50px',
                    height: '50px',
                    border: '5px solid #f3f3f3',
                    borderTop: '5px solid #ff6b35',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 1rem'
                  }}></div>
                  <p>Loading PDF...</p>
                </div>
              )}
              {fullPdfUrl ? (
                <iframe
                  src={`${fullPdfUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                  title={selectedCatalogue.name || 'Catalogue'}
                  className="pdf-iframe"
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    backgroundColor: '#525659'
                  }}
                  allow="fullscreen"
                  onLoad={() => setPdfLoading(false)}
                  onError={() => {
                    setPdfLoading(false);
                    console.error('Failed to load PDF');
                  }}
                />
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                  <p>PDF not available</p>
                  <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
                    Please ensure the viewPdf field is populated in Strapi.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
};

export default CataloguesPage;
