import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import './CategoriesPage.css';
import Navbar from '../components/Navbar';
import { fetchCategories, fetchProducts } from '../services/api';

const CategoriesPage = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const searchParam = searchParams.get('search');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const PRODUCTS_PER_PAGE = 20;

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (categoryParam && categories.length > 0) {
      const category = categories.find(cat => {
        const attrs = cat.attributes || cat;
        return attrs.name === categoryParam;
      });
      if (category) {
        setSelectedCategory(category.id);
        loadProducts(category.id);
      }
    }
  }, [categoryParam, categories]);

  useEffect(() => {
    // Handle search query
    if (searchParam) {
      filterProductsBySearch(searchParam);
    } else {
      setFilteredProducts(products);
    }
    setCurrentPage(1); // Reset to first page
  }, [searchParam, products]);

  useEffect(() => {
    // Update displayed products based on current page
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    setDisplayedProducts(filteredProducts.slice(startIndex, endIndex));
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [filteredProducts, currentPage]);

  const loadData = async () => {
    setLoading(true);
    const categoriesData = await fetchCategories();
    const productsData = await fetchProducts();
    setCategories(categoriesData);
    setProducts(productsData);
    setFilteredProducts(productsData);
    setLoading(false);
  };

  const loadProducts = async (categoryId) => {
    setLoading(true);
    const productsData = categoryId === 'All' 
      ? await fetchProducts() 
      : await fetchProducts(categoryId);
    setProducts(productsData);
    setFilteredProducts(productsData);
    setLoading(false);
  };

  const filterProductsBySearch = (query) => {
    if (!query.trim()) {
      setFilteredProducts(products);
      return;
    }

    const searchTerm = query.toLowerCase();
    const filtered = products.filter(product => {
      const attrs = product.attributes || product;
      const name = attrs.name?.toLowerCase() || '';
      const description = attrs.description?.toLowerCase() || '';
      const categoryName = attrs.category?.name?.toLowerCase() || '';
      
      return name.includes(searchTerm) || 
             description.includes(searchTerm) || 
             categoryName.includes(searchTerm);
    });

    setFilteredProducts(filtered);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1); // Reset to first page
    loadProducts(categoryId);
  };

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  const categoryList = [
    { id: 'All', name: 'All' },
    ...(categories || []).map(cat => {
      const attrs = cat.attributes || cat;
      return { id: cat.id, name: attrs.name };
    })
  ];

  const selectedCategoryName = searchParam 
    ? `Search Results for "${searchParam}"`
    : selectedCategory === 'All' 
      ? 'All Products' 
      : (() => {
          const cat = categories.find(c => c.id === selectedCategory);
          const attrs = cat?.attributes || cat;
          return attrs?.name || 'All Products';
        })();

  if (loading) {
    return (
      <div className="categories-page">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '4rem' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div className="categories-page">
      <Navbar />
      <div className="categories-container">
        <aside className="categories-sidebar">
          <h2 className="sidebar-title">Categories</h2>
          <ul className="category-list">
            {categoryList.map((category) => (
              <li key={category.id}>
                <button
                  className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category.id)}
                >
                  {category.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="products-section">
          <div className="products-header">
            <h1 className="products-title">{selectedCategoryName}</h1>
            <p className="products-count">
              {filteredProducts.length} Products {totalPages > 1 && `(Page ${currentPage} of ${totalPages})`}
            </p>
          </div>

          <div className="products-grid">
            {displayedProducts && displayedProducts.length > 0 ? displayedProducts.map((product) => {
              const attrs = product.attributes || product;
              
              // Handle Cloudinary URLs (start with http) or local URLs
              let imageUrl = 'https://via.placeholder.com/300';
              if (attrs.images && attrs.images.length > 0) {
                const imgUrl = attrs.images[0].url;
                imageUrl = imgUrl.startsWith('http') ? imgUrl : `http://localhost:5000${imgUrl}`;
              }
              
              const categoryName = attrs.category?.data?.attributes?.name || attrs.category?.name || 'Uncategorized';
              
              return (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={imageUrl} alt={attrs.name} />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{attrs.name}</h3>
                    <p className="product-category">{categoryName}</p>
                    <Link to={`/product/${product.id}`} className="view-details-btn">
                      View Details
                    </Link>
                  </div>
                </div>
              );
            }) : null}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-container">
              <button 
                className="pagination-arrow"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              
              {getPageNumbers().map((page, index) => (
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                    onClick={() => goToPage(page)}
                  >
                    {page}
                  </button>
                )
              ))}
              
              <button 
                className="pagination-arrow"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </div>
          )}

          {(!filteredProducts || filteredProducts.length === 0) && !loading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
              {searchParam 
                ? `No products found for "${searchParam}". Try different keywords.`
                : 'No products found in this category.'}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CategoriesPage;
