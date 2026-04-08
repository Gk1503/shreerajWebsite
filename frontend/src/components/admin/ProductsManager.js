import React, { useState, useEffect } from 'react';
import { fetchCategories, fetchProducts } from '../../services/api';
import { createProduct, updateProduct, deleteProduct } from '../../services/adminApi';
import './Manager.css';

const ProductsManager = ({ onUpdate }) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    status: 'published'
  });
  const [images, setImages] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchQuery, selectedCategoryFilter]);

  const loadData = async () => {
    const [productsData, categoriesData] = await Promise.all([
      fetchProducts(),
      fetchCategories()
    ]);
    console.log('Loaded products:', productsData?.length);
    console.log('Sample product:', productsData?.[0]);
    console.log('Loaded categories:', categoriesData?.length);
    console.log('Sample category:', categoriesData?.[0]);
    setProducts(productsData || []);
    setCategories(categoriesData || []);
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.category?.name?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategoryFilter) {
      filtered = filtered.filter(product => {
        // Handle both _id and id formats
        const productCategoryId = product.category?._id || product.category?.id;
        return productCategoryId === selectedCategoryFilter;
      });
    }

    console.log('Filtered products:', filtered.length, 'from', products.length);
    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategoryFilter('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('status', formData.status);
    
    images.forEach((image) => {
      formDataToSend.append('images', image);
    });

    try {
      if (editingId) {
        await updateProduct(editingId, formDataToSend);
      } else {
        await createProduct(formDataToSend);
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', description: '', category: '', status: 'published' });
      setImages([]);
      loadData();
      onUpdate();
    } catch (error) {
      alert('Error saving product');
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category?.id || '',
      status: 'published'
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        loadData();
        onUpdate();
      } catch (error) {
        alert('Error deleting product');
      }
    }
  };

  const handleImageChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Products</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Product'}
        </button>
      </div>

      {/* Filter and Search Section */}
      <div className="filter-section">
        <div className="filter-row">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search products by name, description, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </div>

          <div className="filter-group">
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {(searchQuery || selectedCategoryFilter) && (
            <button className="btn-clear-filters" onClick={clearFilters}>
              Clear Filters
            </button>
          )}
        </div>

        <div className="filter-results">
          <span>Showing {filteredProducts.length} of {products.length} products</span>
        </div>
      </div>

      {showForm && (
        <form className="manager-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Select Category</option>
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
              rows="4"
            />
          </div>

          <div className="form-group">
            <label>Product Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
            />
            <small>You can select multiple images</small>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? 'Update' : 'Create'} Product
            </button>
          </div>
        </form>
      )}

      <div className="manager-table">
        <table>
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td>
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0].url.startsWith('http') ? product.images[0].url : `http://localhost:5000${product.images[0].url}`} 
                      alt={product.name}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                  ) : (
                    <div style={{ width: '50px', height: '50px', background: '#eee', borderRadius: '4px' }}></div>
                  )}
                </td>
                <td><strong>{product.name}</strong></td>
                <td>{product.category?.name || '-'}</td>
                <td>{product.description?.substring(0, 50) || '-'}...</td>
                <td>
                  <button className="btn-edit" onClick={() => handleEdit(product)}>
                    Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(product.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredProducts.length === 0 && products.length > 0 && (
          <div className="empty-state">No products match your filters. Try adjusting your search.</div>
        )}
        
        {products.length === 0 && (
          <div className="empty-state">No products yet. Create your first one!</div>
        )}
      </div>
    </div>
  );
};

export default ProductsManager;
