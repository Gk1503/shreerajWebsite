import React from 'react';
import './StatsSection.css';

const StatsSection = () => {
  const stats = [
    {
      number: '1,280+',
      label: 'Spares & Components Available'
    },
    {
      number: '232+',
      label: 'Satisfied Clients Across India & Abroad'
    },
    {
      number: '35+',
      label: 'Years Of Excellence Since 1990'
    },
    {
      number: '82%',
      label: 'Repeat Happy Customer Rate'
    }
  ];

  return (
    <section className="stats-section">
      <div className="stats-container">
        <p className="stats-subtitle">Numbers That Make Us</p>
        <h2 className="stats-title">#1 India's Leading Textile & Processing Spares Supplier</h2>
        
        <div className="stats-grid">
          {stats.map((stat, index) => (
            <div key={index} className="stat-card">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
