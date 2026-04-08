import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';
import companylogo from "../Gallery/logo.png";
import { fetchCategories, fetchProducts } from '../services/api';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
    loadProducts();
    loadSearchHistory();
    updateWishlistCount();
    checkUserAuth();
    
    // Listen for wishlist updates
    window.addEventListener('wishlistUpdated', updateWishlistCount);
    return () => window.removeEventListener('wishlistUpdated', updateWishlistCount);
  }, []);

  const checkUserAuth = () => {
    const user = localStorage.getItem('userInfo');
    if (user) {
      setUserInfo(JSON.parse(user));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    setUserInfo(null);
    navigate('/');
  };

  const updateWishlistCount = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setWishlistCount(wishlist.length);
  };

  const toggleProductSelection = (productId, e) => {
    e.stopPropagation();
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const addSelectedToWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const updatedWishlist = [...new Set([...wishlist, ...selectedProducts])];
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    setSelectedProducts([]);
    updateWishlistCount();
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const isInWishlist = (productId) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    return wishlist.includes(productId);
  };

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Search as user types
    if (searchQuery.trim().length > 0) {
      performSearch(searchQuery);
      setShowSearchDropdown(true);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  }, [searchQuery]);

  const loadCategories = async () => {
    const data = await fetchCategories();
    setCategories(data || []);
  };

  const loadProducts = async () => {
    const data = await fetchProducts();
    setAllProducts(data || []);
  };

  const loadSearchHistory = () => {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history);
  };

  const saveToSearchHistory = (query) => {
    if (!query.trim()) return;
    
    let history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    // Remove if already exists
    history = history.filter(item => item.toLowerCase() !== query.toLowerCase());
    // Add to beginning
    history.unshift(query);
    // Keep only last 10 searches
    history = history.slice(0, 10);
    
    localStorage.setItem('searchHistory', JSON.stringify(history));
    setSearchHistory(history);
  };

  const clearSearchHistory = () => {
    localStorage.removeItem('searchHistory');
    setSearchHistory([]);
  };

  const performSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTerm = query.toLowerCase();
    const results = allProducts.filter(product => {
      const attrs = product.attributes || product;
      const name = attrs.name?.toLowerCase() || '';
      const description = attrs.description?.toLowerCase() || '';
      const categoryName = attrs.category?.name?.toLowerCase() || '';
      
      return name.includes(searchTerm) || 
             description.includes(searchTerm) || 
             categoryName.includes(searchTerm);
    });

    setSearchResults(results.slice(0, 8)); // Show max 8 results
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveToSearchHistory(searchQuery);
      navigate(`/categories?search=${encodeURIComponent(searchQuery)}`);
      setShowSearchDropdown(false);
      setSearchQuery('');
    }
  };

  const handleSearchResultClick = (productId) => {
    saveToSearchHistory(searchQuery);
    navigate(`/product/${productId}`);
    setShowSearchDropdown(false);
    setSearchQuery('');
  };

  const handleHistoryClick = (query) => {
    setSearchQuery(query);
    performSearch(query);
  };


  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <strong key={index} style={{ color: '#ff6b35' }}>{part}</strong>
        : part
    );
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Company Info */}
        <div className="navbar-brand">
          <div className="logo-container">
            <img src={companylogo} alt="Company Logo" className="company-logo" />
          </div>
          <div className="company-info">
            <h1 className="company-name">SHREERAJ CORPORATION</h1>
            <p className="company-subtitle">Engineering Spares Exports and Suppliers</p>
            <div className="company-contact">
              <span className="contact-phone">+91 93270 07508 | 7948449933</span>
              <span className="contact-separator">|</span>
              <span className="contact-email">sales@shreeraj.com</span>
            </div>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="menu-toggle" onClick={toggleMenu}>
          <span className={`hamburger ${isMenuOpen ? 'active' : ''}`}></span>
        </button>

        {/* Navigation Items */}
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-items">
            <li><a href="/" className="nav-link">Home</a></li>
            <li><a href="/about" className="nav-link">About Us</a></li>
            <li 
              className="nav-item-with-dropdown"
              onMouseEnter={() => setIsCategoriesOpen(true)}
              onMouseLeave={() => setIsCategoriesOpen(false)}
            >
              <a href="/categories" className="nav-link">Categories</a>
              
              {/* Mega Dropdown */}
              {isCategoriesOpen && (
                <div className="mega-dropdown">
                  <div className="mega-dropdown-content">
                    {categories.map((category) => {
                      const attrs = category.attributes || category;
                      const products = attrs.products?.data || attrs.products || [];
                      
                      return (
                        <div key={category.id} className="category-column">
                          <h3 className="category-title">{attrs.name}</h3>
                          <ul className="product-list">
                            {products.slice(0, 3).map((product) => {
                              const productAttrs = product.attributes || product;
                              return (
                                <li key={product.id}>
                                  <a href={`/product/${product.id}`} className="product-link">
                                    {productAttrs.name}
                                  </a>
                                </li>
                              );
                            })}
                            {products.length > 3 && (
                              <li>
                                <a href={`/categories?category=${attrs.name}`} className="more-link">
                                  More ({products.length - 3}+) →
                                </a>
                              </li>
                            )}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </li>
            <li><a href="/catalogues" className="nav-link">Catalogues</a></li>
            <li><a href="/contact" className="nav-link">Contact Us</a></li>
          </ul>

          {/* Search Bar */}
          <div className="search-container" ref={searchRef}>
            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="text"
                className="search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim() || searchHistory.length > 0) {
                    setShowSearchDropdown(true);
                  }
                }}
              />
              <button type="submit" className="search-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </form>

            {/* Search Dropdown */}
            {showSearchDropdown && (
              <div className="search-dropdown">
                {/* Search Results */}
                {searchQuery.trim() && searchResults.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-header">
                      <span>Products ({searchResults.length})</span>
                      {selectedProducts.length > 0 && (
                        <button 
                          className="add-to-wishlist-btn"
                          onClick={addSelectedToWishlist}
                        >
                          Add {selectedProducts.length} to Wishlist
                        </button>
                      )}
                    </div>
                    {searchResults.map((product) => {
                      const attrs = product.attributes || product;
                      const imageUrl = attrs.images?.[0]?.url 
                        ? (attrs.images[0].url.startsWith('http') ? attrs.images[0].url : `http://localhost:5000${attrs.images[0].url}`)
                        : 'https://via.placeholder.com/50';
                      const inWishlist = isInWishlist(product.id);
                      
                      return (
                        <div 
                          key={product.id} 
                          className="search-result-item"
                        >
                          <input 
                            type="checkbox"
                            className="search-result-checkbox"
                            checked={selectedProducts.includes(product.id) || inWishlist}
                            disabled={inWishlist}
                            onChange={(e) => toggleProductSelection(product.id, e)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <img 
                            src={imageUrl} 
                            alt={attrs.name} 
                            className="search-result-image"
                            onClick={() => handleSearchResultClick(product.id)}
                          />
                          <div 
                            className="search-result-info"
                            onClick={() => handleSearchResultClick(product.id)}
                          >
                            <div className="search-result-name">
                              {highlightMatch(attrs.name, searchQuery)}
                            </div>
                            <div className="search-result-category">
                              {attrs.category?.name || 'Uncategorized'}
                            </div>
                          </div>
                          {inWishlist && (
                            <span className="in-wishlist-badge">In Wishlist</span>
                          )}
                        </div>
                      );
                    })}
                    <div className="search-view-all" onClick={handleSearch}>
                      View all results for "{searchQuery}" →
                    </div>
                  </div>
                )}

                {/* No Results */}
                {searchQuery.trim() && searchResults.length === 0 && (
                  <div className="search-no-results">
                    <p>No products found for "{searchQuery}"</p>
                    <small>Try different keywords</small>
                  </div>
                )}

                {/* Search History */}
                {!searchQuery.trim() && searchHistory.length > 0 && (
                  <div className="search-section">
                    <div className="search-section-header">
                      <span>Recent Searches</span>
                      <button 
                        className="clear-history-btn"
                        onClick={clearSearchHistory}
                      >
                        Clear
                      </button>
                    </div>
                    {searchHistory.map((query, index) => (
                      <div 
                        key={index} 
                        className="search-history-item"
                        onClick={() => handleHistoryClick(query)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>{query}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Wishlist Icon */}
          <a href="/wishlist" className="wishlist-icon-link">
            <div className="wishlist-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              {wishlistCount > 0 && (
                <span className="wishlist-badge">{wishlistCount}</span>
              )}
            </div>
          </a>

          {/* User Account - Only show if logged in */}
          {userInfo && (
            <div className="user-account">
              <a href="/user/dashboard" className="user-info">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="user-name">{userInfo.username}</span>
              </a>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
