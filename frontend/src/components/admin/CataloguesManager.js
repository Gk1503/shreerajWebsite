import React, { useState, useEffect } from 'react';
import { fetchCategories, fetchCatalogues } from '../../services/api';
import { createCatalogue, updateCatalogue, deleteCatalogue } from '../../services/adminApi';
import { getImageUrl } from '../../config';
import './Manager.css';

const CataloguesManager = ({ onUpdate }) => {
  const [catalogues, setCatalogues] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    status: 'published'
  });
  const [files, setFiles] = useState({
    thumbnail: null,
    viewPdf: null,
    downloadPdf: null
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [cataloguesData, categoriesData] = await Promise.all([
      fetchCatalogues(),
      fetchCategories()
    ]);
    setCatalogues(cataloguesData || []);
    setCategories(categoriesData || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name) {
      alert('Please enter a catalogue name');
      return;
    }
    
    if (!editingId && (!files.viewPdf || !files.downloadPdf)) {
      alert('Please upload both View PDF and Download PDF');
      return;
    }
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    if (formData.category) {
      formDataToSend.append('category', formData.category);
    }
    formDataToSend.append('status', formData.status);
    
    if (files.thumbnail) formDataToSend.append('thumbnail', files.thumbnail);
    if (files.viewPdf) formDataToSend.append('viewPdf', files.viewPdf);
    if (files.downloadPdf) formDataToSend.append('downloadPdf', files.downloadPdf);

    try {
      let result;
      if (editingId) {
        result = await updateCatalogue(editingId, formDataToSend);
      } else {
        result = await createCatalogue(formDataToSend);
      }
      
      console.log('Catalogue saved:', result);
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', description: '', category: '', status: 'published' });
      setFiles({ thumbnail: null, viewPdf: null, downloadPdf: null });
      loadData();
      onUpdate();
      
      alert('Catalogue saved successfully!');
    } catch (error) {
      console.error('Error saving catalogue:', error);
      alert('Error saving catalogue: ' + (error.message || 'Unknown error'));
    }
  };

  const handleEdit = (catalogue) => {
    setEditingId(catalogue.id);
    setFormData({
      name: catalogue.name,
      description: catalogue.description || '',
      category: catalogue.category?.id || '',
      status: 'published'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this catalogue?')) {
      try {
        await deleteCatalogue(id);
        loadData();
        onUpdate();
      } catch (error) {
        alert('Error deleting catalogue');
      }
    }
  };

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Catalogues</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Catalogue'}
        </button>
      </div>

      {showForm && (
        <form className="manager-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Catalogue Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select Category (Optional)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Thumbnail Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFiles({ ...files, thumbnail: e.target.files[0] })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>View PDF (for preview) *</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFiles({ ...files, viewPdf: e.target.files[0] })}
                required={!editingId}
              />
            </div>
            
            <div className="form-group">
              <label>Download PDF (with watermark) *</label>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFiles({ ...files, downloadPdf: e.target.files[0] })}
                required={!editingId}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Update' : 'Create'} Catalogue
            </button>
          </div>
        </form>
      )}

      <div className="manager-table">
        <table>
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {catalogues.map((catalogue) => (
              <tr key={catalogue.id}>
                <td>
                  {catalogue.thumbnail?.url ? (
                    <img 
                      src={getImageUrl(catalogue.thumbnail.url)} 
                      alt={catalogue.name}
                      style={{ width: '50px', height: '70px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  ) : (
                    <div style={{ width: '50px', height: '70px', background: '#eee', borderRadius: '4px' }}></div>
                  )}
                </td>
                <td><strong>{catalogue.name}</strong></td>
                <td>{catalogue.category?.name || '-'}</td>
                <td>{catalogue.description?.substring(0, 50) || '-'}...</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(catalogue)}>
                    Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(catalogue.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {catalogues.length === 0 && (
          <div className="empty-state">No catalogues yet. Create your first one!</div>
        )}
      </div>
    </div>
  );
};

export default CataloguesManager;
