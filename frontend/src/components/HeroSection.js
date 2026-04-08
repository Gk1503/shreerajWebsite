import React from 'react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <section className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <h1 className="hero-title">
            India's Leading <span className="highlight">Textile & Engineering</span> Spares Supplier
          </h1>
          <p className="hero-subtitle">
            Trusted dealer and stockist of Weaving, Processing, and Engineering Spares serving textile and industrial sectors with precision, quality, and unmatched service.
          </p>
          <div className="hero-features">
            <div className="feature-item">
              <span className="feature-dot"></span>
              <span>4000+ Products</span>
            </div>
            <div className="feature-item">
              <span className="feature-dot"></span>
              <span>50+ Catalogs</span>
            </div>
            <div className="feature-item">
              <span className="feature-dot"></span>
              <span>Trusted Quality</span>
            </div>
          </div>
          <div className="hero-buttons">
            <a href="/catalogues" className="btn btn-primary">View Catalogs</a>
            <a href="/categories" className="btn btn-secondary">Browse Products</a>
          </div>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=600&fit=crop" alt="Engineering Spares" className="hero-img" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
