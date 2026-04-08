import React, { useState, useEffect } from 'react';
import { fetchCategories } from '../../services/api';
import { createCategory, updateCategory, deleteCategory } from '../../services/adminApi';
import './Manager.css';

const CategoriesManager = ({ onUpdate }) => {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'published'
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data || []);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await updateCategory(editingId, formData);
      } else {
        await createCategory(formData);
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', description: '', status: 'published' });
      loadCategories();
      onUpdate();
    } catch (error) {
      alert('Error saving category');
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description || '',
      status: 'published'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        loadCategories();
        onUpdate();
      } catch (error) {
        alert('Error deleting category');
      }
    }
  };

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Categories</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Category'}
        </button>
      </div>

      {showForm && (
        <form className="manager-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Category Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
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

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Update' : 'Create'} Category
            </button>
          </div>
        </form>
      )}

      <div className="manager-table">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td><strong>{category.name}</strong></td>
                <td>{category.description || '-'}</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(category)}>
                    Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(category.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {categories.length === 0 && (
          <div className="empty-state">No categories yet. Create your first one!</div>
        )}
      </div>
    </div>
  );
};

export default CategoriesManager;
