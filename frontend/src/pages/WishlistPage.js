import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WishlistPage.css';
import Navbar from '../components/Navbar';
import { fetchProductById } from '../services/api';
import { getImageUrl } from '../config';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadWishlist();
  }, []);

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

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setWishlistItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleSendInquiry = (item) => {
    const attrs = item.product.attributes || item.product;
    const subject = `Product Inquiry: ${attrs.name}`;
    const body = `Hello,\n\nI am interested in the following product:\n\nProduct Name: ${attrs.name}\nQuantity: ${item.quantity}\n\nPlease provide more information, pricing, and availability.\n\nThank you.`;
    window.location.href = `mailto:sales@shreerajcorporation.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleSendAllInquiry = () => {
    if (wishlistItems.length === 0) return;
    
    const subject = `Product Inquiry - Multiple Items`;
    let body = `Hello,\n\nI am interested in the following products:\n\n`;
    
    wishlistItems.forEach((item, index) => {
      const attrs = item.product.attributes || item.product;
      body += `${index + 1}. Product: ${attrs.name}\n   Quantity: ${item.quantity}\n\n`;
    });
    
    body += `Please provide more information, pricing, and availability for these items.\n\nThank you.`;
    
    window.location.href = `mailto:sales@shreerajcorporation.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const clearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      localStorage.setItem('wishlist', JSON.stringify([]));
      setWishlistItems([]);
      window.dispatchEvent(new Event('wishlistUpdated'));
    }
  };

  if (loading) {
    return (
      <div className="wishlist-page">
        <Navbar />
        <div className="wishlist-container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <Navbar />
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1>My Wishlist</h1>
          {wishlistItems.length > 0 && (
            <button className="clear-btn" onClick={clearWishlist}>Clear All</button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <h2>Your wishlist is empty</h2>
            <a href="/categories" className="browse-btn">Browse Products</a>
          </div>
        ) : (
          <>
            <div className="wishlist-items">
              {wishlistItems.map((item) => {
                const attrs = item.product.attributes || item.product;
                const imagesData = attrs.images?.data || attrs.images || [];
                const imageUrl = imagesData.length > 0
                  ? (imagesData[0].attributes?.url || imagesData[0].url)
                  : null;
                const fullImageUrl = getImageUrl(imageUrl) || 'https://via.placeholder.com/120x120/f5f5f5/999?text=No+Image';
                
                const categoryName = attrs.category?.data?.attributes?.name || attrs.category?.name || 'Uncategorized';

                return (
                  <div key={item.id} className="wishlist-item">
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      ×
                    </button>

                    <div className="item-image" onClick={() => navigate(`/product/${item.id}`)}>
                      <img src={fullImageUrl} alt={attrs.name} />
                    </div>

                    <div className="item-info">
                      <h3 onClick={() => navigate(`/product/${item.id}`)}>{attrs.name}</h3>
                      <span className="item-category">{categoryName}</span>
                      <p className="item-desc">{attrs.description?.substring(0, 80)}{attrs.description?.length > 80 ? '...' : ''}</p>
                    </div>

                    <div className="item-actions">
                      <div className="quantity">
                        <label>Quantity:</label>
                        <div className="qty-controls">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                          <input 
                            type="number" 
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            min="1"
                          />
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>
                      </div>

                      <div className="action-btns">
                        <button className="view-btn" onClick={() => navigate(`/product/${item.id}`)}>
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="wishlist-footer">
              <span>{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist</span>
              <button className="inquiry-all-btn" onClick={handleSendAllInquiry}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Send Inquiry for All Items
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
