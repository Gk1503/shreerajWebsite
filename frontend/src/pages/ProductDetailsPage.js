import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetailsPage.css';
import Navbar from '../components/Navbar';
import { fetchProductById } from '../services/api';

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    loadProduct();
    checkWishlist();
  }, [productId]);

  const loadProduct = async () => {
    setLoading(true);
    const data = await fetchProductById(productId);
    setProduct(data);
    setLoading(false);
  };

  const checkWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    setIsInWishlist(wishlist.includes(productId));
  };

  const toggleWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    
    if (isInWishlist) {
      const updated = wishlist.filter(id => id !== productId);
      localStorage.setItem('wishlist', JSON.stringify(updated));
      setIsInWishlist(false);
    } else {
      wishlist.push(productId);
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      setIsInWishlist(true);
    }
    
    // Dispatch event to update navbar
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  if (loading) {
    return (
      <div className="product-details-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <Navbar />
        <div className="product-not-found">Product not found</div>
      </div>
    );
  }

  const attrs = product.attributes || product;
  
  // Get product images
  const imagesData = attrs.images?.data || attrs.images || [];
  const productImages = imagesData.length > 0 
    ? imagesData.map(img => {
        const imgAttrs = img.attributes || img;
        const url = imgAttrs.url;
        return url.startsWith('http') ? url : `http://localhost:5000${url}`;
      })
    : ['https://via.placeholder.com/800x800/ff6b35/ffffff?text=No+Image'];

  // Get category name
  const categoryName = attrs.category?.data?.attributes?.name || attrs.category?.name || 'Uncategorized';

  // Sample product specifications (you can add these fields to Strapi schema later)
  const specifications = [
    { label: 'Product Name', value: attrs.name },
    { label: 'Category', value: categoryName },
    { label: 'Brand', value: 'Shreeraj Corporation' },
    { label: 'Country of Origin', value: 'India' }
  ];

  const handleShareWhatsApp = () => {
    const text = `Check out ${attrs.name} from Shreeraj Corporation`;
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  const handleShareFacebook = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const handleShareInstagram = () => {
    // Instagram doesn't support direct sharing via URL, so we'll copy the link
    handleCopyLink();
    alert('Link copied! You can paste it in your Instagram post or story.');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => {
      setCopySuccess(false);
      setShowShareMenu(false);
    }, 2000);
  };

  return (
    <div className="product-details-page">
      <Navbar />
      <div className="product-details-container">
        <div className="product-gallery">
          <div className="main-image">
            <img src={productImages[selectedImage]} alt={attrs.name} />
            
            {/* Share Button with Dropdown */}
            <div 
              className="share-button-container"
              onMouseEnter={() => setShowShareMenu(true)}
              onMouseLeave={() => setShowShareMenu(false)}
            >
              <button className="share-icon-btn">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3"></circle>
                  <circle cx="6" cy="12" r="3"></circle>
                  <circle cx="18" cy="19" r="3"></circle>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                </svg>
              </button>
              
              {showShareMenu && (
                <div className="share-dropdown">
                  <button className="share-option whatsapp" onClick={handleShareWhatsApp}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    WhatsApp
                  </button>
                  <button className="share-option facebook" onClick={handleShareFacebook}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Facebook
                  </button>
                  <button className="share-option instagram" onClick={handleShareInstagram}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    Instagram
                  </button>
                  <button className="share-option copy" onClick={handleCopyLink}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    {copySuccess ? 'Copied!' : 'Copy Link'}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="thumbnail-images">
            {productImages.map((image, index) => (
              <div
                key={index}
                className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                onClick={() => setSelectedImage(index)}
              >
                <img src={image} alt={`${attrs.name} ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        <div className="product-info-section">
          <div className="product-header">
            <h1 className="product-title">{attrs.name}</h1>
            <p className="product-category-tag">{categoryName}</p>
          </div>

          <div className="product-description">
            <h2>Product Description</h2>
            <p>
              {attrs.description || `High-quality ${attrs.name} designed for industrial and textile applications. 
              This product is manufactured with precision engineering and meets international 
              quality standards. Ideal for weaving, processing, and engineering operations.`}
            </p>
            <p>
              Our {attrs.name} offers exceptional durability and performance, ensuring 
              long-lasting reliability in demanding environments. Trusted by leading textile 
              and industrial manufacturers across India.
            </p>
          </div>

          <div className="product-specifications">
            <h2>Technical Specifications</h2>
            <div className="specs-grid">
              {specifications.map((spec, index) => (
                <div key={index} className="spec-item">
                  <span className="spec-label">{spec.label}</span>
                  <span className="spec-value">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="contact-inquiry">
            <h3>Request a Quote</h3>
            <p>Interested in this product? Contact us for pricing and availability information.</p>
            <div className="action-buttons">
              <button 
                className={`wishlist-btn ${isInWishlist ? 'active' : ''}`}
                onClick={toggleWishlist}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isInWishlist ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </button>
              <a href="/contact" className="inquiry-btn">Contact Us</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
