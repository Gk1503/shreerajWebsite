import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, getUser } from '../services/authService';
import { fetchCategories, fetchProducts, fetchCatalogues } from '../services/api';
import CategoriesManager from '../components/admin/CategoriesManager';
import ProductsManager from '../components/admin/ProductsManager';
import CataloguesManager from '../components/admin/CataloguesManager';
import BulkUploadProducts from '../components/admin/BulkUploadProducts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [stats, setStats] = useState({ categories: 0, products: 0, catalogues: 0 });
  const navigate = useNavigate();
  const user = getUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/admin/login');
      return;
    }
    loadStats();
  }, [navigate]);

  const loadStats = async () => {
    const [categories, products, catalogues] = await Promise.all([
      fetchCategories(),
      fetchProducts(),
      fetchCatalogues()
    ]);
    
    setStats({
      categories: categories?.length || 0,
      products: products?.length || 0,
      catalogues: catalogues?.length || 0
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <p>{user?.username}</p>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={activeTab === 'categories' ? 'active' : ''}
            onClick={() => setActiveTab('categories')}
          >
            📁 Categories
          </button>
          <button 
            className={activeTab === 'products' ? 'active' : ''}
            onClick={() => setActiveTab('products')}
          >
            📦 Products
          </button>
          <button 
            className={activeTab === 'bulk-upload' ? 'active' : ''}
            onClick={() => setActiveTab('bulk-upload')}
          >
            📤 Bulk Upload
          </button>
          <button 
            className={activeTab === 'catalogues' ? 'active' : ''}
            onClick={() => setActiveTab('catalogues')}
          >
            📄 Catalogues
          </button>
        </nav>
        
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </aside>

      <main className="admin-content">
        <div className="content-header">
          <h1>Dashboard</h1>
          <div className="stats-cards">
            <div className="stat-card">
              <h3>{stats.categories}</h3>
              <p>Categories</p>
            </div>
            <div className="stat-card">
              <h3>{stats.products}</h3>
              <p>Products</p>
            </div>
            <div className="stat-card">
              <h3>{stats.catalogues}</h3>
              <p>Catalogues</p>
            </div>
          </div>
        </div>

        <div className="content-body">
          {activeTab === 'categories' && <CategoriesManager onUpdate={loadStats} />}
          {activeTab === 'products' && <ProductsManager onUpdate={loadStats} />}
          {activeTab === 'bulk-upload' && <BulkUploadProducts onComplete={loadStats} />}
          {activeTab === 'catalogues' && <CataloguesManager onUpdate={loadStats} />}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
