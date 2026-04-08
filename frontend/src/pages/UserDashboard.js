import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';
import { fetchProductById } from '../services/api';
import { getImageUrl } from '../config';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('wishlist');
  const [userInfo, setUserInfo] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProfile, setEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    companyName: '',
    companyAddress: '',
    phone: '',
    email: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadWishlist();
  }, []);

  const checkAuth = () => {
    const user = localStorage.getItem('userInfo');
    if (!user) {
      navigate('/user/login');
      return;
    }
    const userData = JSON.parse(user);
    setUserInfo(userData);
    setProfileData({
      companyName: userData.companyName || '',
      companyAddress: userData.companyAddress || '',
      phone: userData.phone || '',
      email: userData.email || ''
    });
  };

  const loadWishlist = async () => {
    setLoading(true);
    const wishlistIds = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    const items = await Promise.all(
      wishlistIds.map(async (id) => {
        const product = await fetchProductById(id);
        return {
          id,
          product,
          quantity: 1
        };
      })
    );
    
    setWishlistItems(items.filter(item => item.product));
    setLoading(false);
  };

  const removeFromWishlist = (productId) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const updated = wishlist.filter(id => id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const updatedUser = { ...userInfo, ...profileData };
    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    setUserInfo(updatedUser);
    setEditProfile(false);
    alert('Profile updated successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const goToWebsite = () => {
    navigate('/');
  };

  if (loading && activeTab === 'wishlist') {
    return (
      <div className="user-dashboard-page">
        <div className="dashboard-container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard-page">
      {/* Dashboard Header - No Navbar */}
      <div className="dashboard-top-bar">
        <div className="top-bar-left">
          <h2 className="dashboard-logo">SHREERAJ CORPORATION</h2>
          <span className="dashboard-subtitle">User Dashboard</span>
        </div>
        
        <div className="top-bar-right">
          <button className="btn-website" onClick={goToWebsite}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Back to Website
          </button>
          
          <div className="user-info-top">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>{userInfo?.username}</span>
          </div>
          
          <button className="btn-logout-top" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* Sidebar */}
          <div className="dashboard-sidebar">
            <nav className="sidebar-nav">
              <button 
                className={`nav-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
                onClick={() => setActiveTab('wishlist')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                My Wishlist
                {wishlistItems.length > 0 && (
                  <span className="badge">{wishlistItems.length}</span>
                )}
              </button>

              <button 
                className={`nav-btn ${activeTab === 'quotations' ? 'active' : ''}`}
                onClick={() => setActiveTab('quotations')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Quotations
              </button>

              <button 
                className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Profile
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="dashboard-main">
            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>My Wishlist</h2>
                  {wishlistItems.length > 0 && (
                    <button 
                      className="btn-primary"
                      onClick={() => navigate('/wishlist')}
                    >
                      Generate Quotation
                    </button>
                  )}
                </div>

                {wishlistItems.length === 0 ? (
                  <div className="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <h3>Your wishlist is empty</h3>
                    <p>Start adding products to create quotations</p>
                    <button className="btn-primary" onClick={() => navigate('/categories')}>
                      Browse Products
                    </button>
                  </div>
                ) : (
                  <div className="wishlist-grid">
                    {wishlistItems.map((item) => {
                      const attrs = item.product.attributes || item.product;
                      const imagesData = attrs.images?.data || attrs.images || [];
                      const imageUrl = imagesData.length > 0
                        ? (imagesData[0].attributes?.url || imagesData[0].url)
                        : null;
                      const fullImageUrl = getImageUrl(imageUrl) || 'https://via.placeholder.com/200';

                      return (
                        <div key={item.id} className="wishlist-card">
                          <button 
                            className="remove-btn"
                            onClick={() => removeFromWishlist(item.id)}
                          >
                            ×
                          </button>
                          <div className="card-image" onClick={() => navigate(`/product/${item.id}`)}>
                            <img src={fullImageUrl} alt={attrs.name} />
                          </div>
                          <div className="card-content">
                            <h3 onClick={() => navigate(`/product/${item.id}`)}>{attrs.name}</h3>
                            <p className="category">{attrs.category?.data?.attributes?.name || attrs.category?.name || 'Uncategorized'}</p>
                            <button 
                              className="btn-view"
                              onClick={() => navigate(`/product/${item.id}`)}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Quotations Tab */}
            {activeTab === 'quotations' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>My Quotations</h2>
                  {wishlistItems.length > 0 && (
                    <button 
                      className="btn-primary"
                      onClick={() => navigate('/wishlist')}
                    >
                      Create New Quotation
                    </button>
                  )}
                </div>

                <div className="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <h3>No quotations yet</h3>
                  <p>Create quotations from your wishlist items</p>
                  {wishlistItems.length > 0 ? (
                    <button className="btn-primary" onClick={() => navigate('/wishlist')}>
                      Create Quotation
                    </button>
                  ) : (
                    <button className="btn-primary" onClick={() => navigate('/categories')}>
                      Browse Products
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>My Profile</h2>
                  {!editProfile && (
                    <button 
                      className="btn-secondary"
                      onClick={() => setEditProfile(true)}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                <div className="profile-content">
                  {editProfile ? (
                    <form className="profile-form" onSubmit={handleProfileUpdate}>
                      <div className="form-group">
                        <label>Username</label>
                        <input
                          type="text"
                          value={userInfo?.username || ''}
                          disabled
                          className="disabled-input"
                        />
                        <small>Username cannot be changed</small>
                      </div>

                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Company Name</label>
                        <input
                          type="text"
                          value={profileData.companyName}
                          onChange={(e) => setProfileData({...profileData, companyName: e.target.value})}
                          placeholder="Enter your company name"
                        />
                      </div>

                      <div className="form-group">
                        <label>Company Address</label>
                        <textarea
                          value={profileData.companyAddress}
                          onChange={(e) => setProfileData({...profileData, companyAddress: e.target.value})}
                          placeholder="Enter your company address"
                          rows="3"
                        />
                      </div>

                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="btn-primary">
                          Save Changes
                        </button>
                        <button 
                          type="button" 
                          className="btn-secondary"
                          onClick={() => setEditProfile(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="profile-view">
                      <div className="profile-item">
                        <label>Username</label>
                        <p>{userInfo?.username}</p>
                      </div>

                      <div className="profile-item">
                        <label>Email</label>
                        <p>{userInfo?.email}</p>
                      </div>

                      <div className="profile-item">
                        <label>Company Name</label>
                        <p>{userInfo?.companyName || 'Not provided'}</p>
                      </div>

                      <div className="profile-item">
                        <label>Company Address</label>
                        <p>{userInfo?.companyAddress || 'Not provided'}</p>
                      </div>

                      <div className="profile-item">
                        <label>Phone</label>
                        <p>{userInfo?.phone || 'Not provided'}</p>
                      </div>

                      <div className="profile-item">
                        <label>Account Type</label>
                        <p className="role-badge">{userInfo?.role || 'user'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
