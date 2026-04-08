import React, { useEffect } from 'react';
import './IndustriesSection.css';
import img1 from "../Gallery/inustriesweserveimg/img1.jpg"
import img2 from "../Gallery/inustriesweserveimg/img2.png"
import img3 from "../Gallery/inustriesweserveimg/img3.png"
import img4 from "../Gallery/inustriesweserveimg/img4.jpg"
import img5 from "../Gallery/inustriesweserveimg/img5.png"


const IndustriesSection = () => {
  useEffect(() => {
    console.log('Image imports:', { img1, img2, img3, img4, img5 });
  }, []);

  // Company logos - you can replace these with actual logo URLs
  const companies = [
    { name: 'Sun Flag', logo: img1 },
    { name: 'Deslauriers', logo: img2 },
    { name: 'Paslode', logo: img3 },
    { name: 'Company 4', logo: img4 },
    { name: 'Company 5', logo: img5 },
  ];

  const handleImageError = (e, companyName) => {
    console.error(`Failed to load image for ${companyName}`, e.target.src);
    e.target.style.border = '2px solid red';
  };

  const handleImageLoad = (e, companyName) => {
    console.log(`Successfully loaded image for ${companyName}`, e.target.src);
    e.target.style.border = '2px solid green';
  };

  return (
    <section className="industries-section">
      <div className="industries-container">
        <h2 className="industries-title">
          Industries <span className="highlight">We Serve</span>
        </h2>
        <p className="industries-subtitle">
          Supplying precision engineering spares and manufacturing support to global industries.
        </p>

        <div className="marquee-container">
          <div className="marquee-content">
            {companies.map((company, index) => (
              <div key={index} className="company-logo">
                <img 
                  src={company.logo} 
                  alt={company.name}
                  onError={(e) => handleImageError(e, company.name)}
                  onLoad={(e) => handleImageLoad(e, company.name)}
                  style={{ minWidth: '50px', minHeight: '50px' }}
                />
              </div>
            ))}
            {/* Duplicate for seamless loop */}
            {companies.map((company, index) => (
              <div key={`duplicate-${index}`} className="company-logo">
                <img 
                  src={company.logo}
                  alt={company.name}
                  onError={(e) => handleImageError(e, company.name)}
                  onLoad={(e) => handleImageLoad(e, company.name)}
                  style={{ minWidth: '50px', minHeight: '50px' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndustriesSection;
