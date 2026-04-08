import React from 'react';
import './WelcomeSection.css';

const WelcomeSection = () => {
  return (
    <section className="welcome-section">
      <div className="welcome-container">
        <h2 className="welcome-title">
          Welcome to <span className="highlight">Shreeraj Corporation</span>
        </h2>
        
        <div className="welcome-content">
          <div className="welcome-image">
            <img 
              src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=700&fit=crop" 
              alt="Shreeraj Corporation Team" 
            />
          </div>
          
          <div className="welcome-text">
            <h3 className="section-heading">ABOUT US</h3>
            
            <p className="welcome-description">
              <span className="company-name">Shreeraj Corporation</span>, Established In <span className="highlight-text">1990</span> And Based In <span className="highlight-text">Ahmedabad, Gujarat</span>, Is A Trusted Dealer And Stockist Of <span className="highlight-text">Weaving, Processing, And Engineering Spares</span>. With Over Seven Decades Of Experience, We Have Built A Legacy Of Quality, Precision, And Dependable Service Across The <span className="highlight-text">Textile</span> And Industrial Sectors.
            </p>
            
            <p className="welcome-description">
              Operating Under Our <span className="highlight-text">Trade Brand @V-Safe</span>, We Are Known For Delivering Imported Grade Spares, Custom Engineered Components, And <span className="highlight-text">Cost-Effective</span> Import Substitutions With Quick Lead Times And <span className="highlight-text">Consistent Quality</span>.
            </p>
            
            <p className="welcome-description">
              Our Extensive Product Range Includes Spares For Renowned Machinery Brands Like <span className="highlight-text">Picanol, Tsudakoma, Dornier, Mumfort, Staubli, And Many Others</span>. Whether You're Looking For Standard Parts, Specialized Rollers, Or <span className="highlight-text">Custom-Made</span> Solutions From Samples Or Drawings, Shreeraj Corporation Ensures <span className="highlight-text">Performance</span> That Matches Your Expectations — Every Time.
            </p>
            
            <p className="welcome-description">
              Since <span className="highlight-text">1990</span>, We've Been More Than Just A Supplier — We're <span className="highlight-text">Your Reliable Partner</span> In Production.
            </p>
            
            <div className="welcome-buttons">
              <button className="btn-primary">Read More About Us</button>
              <button className="btn-secondary">Meet Our Team</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
