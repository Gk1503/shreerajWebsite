import React from 'react';
import './FeaturesSection.css';

const FeaturesSection = () => {
  const features = [
    {
      id: 1,
      icon: '🧵',
      title: 'Weaving Spares',
      description: 'Complete range of weaving machine parts and accessories for textile manufacturing'
    },
    {
      id: 2,
      icon: '⚙️',
      title: 'Processing Spares',
      description: 'High-quality processing equipment spares for efficient textile production'
    },
    {
      id: 3,
      icon: '🔩',
      title: 'Engineering Spares',
      description: 'Precision engineering components for industrial and manufacturing sectors'
    },
    {
      id: 4,
      icon: '📦',
      title: '4000+ Products',
      description: 'Extensive inventory with thousands of products ready for immediate delivery'
    },
    {
      id: 5,
      icon: '✅',
      title: 'Quality Assured',
      description: 'All products meet international quality standards and certifications'
    },
    {
      id: 6,
      icon: '🚚',
      title: 'Fast Delivery',
      description: 'Quick and reliable delivery across India with efficient logistics'
    }
  ];

  return (
    <section className="features-section">
      <div className="features-container">
        <div className="features-header">
          <h2 className="features-title">Why Choose Shreeraj Corporation</h2>
          <p className="features-subtitle">
            Your trusted partner for textile and engineering spares with unmatched quality and service
          </p>
        </div>
        
        <div className="features-grid">
          {features.map((feature) => (
            <div key={feature.id} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
