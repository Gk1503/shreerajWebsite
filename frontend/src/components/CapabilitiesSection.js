import React from 'react';
import './CapabilitiesSection.css';

const CapabilitiesSection = () => {
  const capabilities = [
    {
      title: 'Weaving Spares',
      description: 'Comprehensive range of weaving machine spares for Picanol, Tsudakoma, Dornier, and other leading brands with precision engineering.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
          <line x1="15" y1="3" x2="15" y2="21"></line>
        </svg>
      )
    },
    {
      title: 'Processing Spares',
      description: 'High-quality processing equipment spares including rollers, bearings, and custom components for textile processing machinery.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M12 1v6m0 6v6m8.66-15.66l-4.24 4.24m-4.24 4.24l-4.24 4.24m15.66-4.24l-4.24-4.24m-4.24-4.24l-4.24-4.24"></path>
        </svg>
      )
    },
    {
      title: 'Engineering Components',
      description: 'Custom-engineered solutions from samples or drawings with quick lead times and cost-effective import substitutions.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
        </svg>
      )
    },
    {
      title: 'Import & Export',
      description: 'Trusted dealer and stockist delivering imported grade spares and custom engineered components across India and abroad.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </svg>
      )
    },
    {
      title: 'Quick Turnaround',
      description: 'Fast delivery and quick lead times ensuring your production never stops with our efficient supply chain management.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      )
    },
    {
      title: 'Quality Assurance',
      description: 'Consistent quality and performance that matches your expectations with rigorous testing and quality control processes.',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      )
    }
  ];

  return (
    <section className="capabilities-section">
      <div className="capabilities-container">
        <div className="capabilities-header">
          <h2 className="capabilities-title">
            Our <span className="highlight">Capabilities</span>
          </h2>
          <p className="capabilities-subtitle">
            Advanced manufacturing services designed for precision, speed, and production-ready performance.
          </p>
        </div>

        <div className="capabilities-grid">
          {capabilities.map((capability, index) => (
            <div key={index} className="capability-card">
              <div className="capability-icon-wrapper">
                <div className="capability-icon">{capability.icon}</div>
              </div>
              <div className="capability-content">
                <h3 className="capability-title">{capability.title}</h3>
                <p className="capability-description">{capability.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CapabilitiesSection;
