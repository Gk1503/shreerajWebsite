import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuotationPage.css';
import { fetchProductById } from '../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import companyLogo from '../Gallery/logo.png';
import { getImageUrl } from '../config';

const QuotationPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [quotationData, setQuotationData] = useState({
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    gst: 18,
    discount: 0,
    deliveryCharges: 0,
    includeImages: true,
    includeSignature: true
  });
  const [productPrices, setProductPrices] = useState({});
  const [userInfo, setUserInfo] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadWishlist();
    loadClients();
  }, []);

  const loadClients = () => {
    const savedClients = localStorage.getItem('clients');
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    }
  };

  const filterClients = () => {
    if (!clientSearchQuery.trim()) return clients;
    
    const query = clientSearchQuery.toLowerCase();
    return clients.filter(client => 
      client.name.toLowerCase().includes(query) ||
      client.address?.toLowerCase().includes(query) ||
      client.gstNumber?.toLowerCase().includes(query)
    );
  };

  const selectClient = (client) => {
    setSelectedClient(client);
    setClientSearchQuery(client.name);
    setShowClientDropdown(false);
    
    // Auto-fill client details
    const primaryContact = client.contactPersons && client.contactPersons.length > 0 
      ? client.contactPersons[0] 
      : null;
    
    setQuotationData({
      ...quotationData,
      clientName: client.name,
      clientAddress: client.address || '',
      clientPhone: primaryContact?.phones?.[0] || '',
      clientEmail: primaryContact?.emails?.[0] || ''
    });
  };

  const clearClientSelection = () => {
    setSelectedClient(null);
    setClientSearchQuery('');
    setQuotationData({
      ...quotationData,
      clientName: userInfo?.companyName || userInfo?.username || '',
      clientAddress: userInfo?.companyAddress || '',
      clientPhone: userInfo?.phone || '',
      clientEmail: userInfo?.email || ''
    });
  };

  const checkAuth = () => {
    const user = localStorage.getItem('userInfo');
    if (!user) {
      navigate('/user/login');
      return;
    }
    const userData = JSON.parse(user);
    setUserInfo(userData);
    
    // Pre-fill quotation data with user info
    setQuotationData(prev => ({
      ...prev,
      clientName: userData.companyName || userData.username || '',
      clientAddress: userData.companyAddress || '',
      clientPhone: userData.phone || '',
      clientEmail: userData.email || ''
    }));
  };

  const loadWishlist = async () => {
    setLoading(true);
    
    // First check sessionStorage for products selected from dashboard
    const quotationProducts = sessionStorage.getItem('quotationProducts');
    
    if (quotationProducts) {
      // Load from sessionStorage (products selected from dashboard)
      const items = JSON.parse(quotationProducts);
      setWishlistItems(items);
      // Select all items by default
      setSelectedItems(items.map(item => item.id));
      // Clear sessionStorage after loading
      sessionStorage.removeItem('quotationProducts');
    } else {
      // Fallback to wishlist if no sessionStorage data
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
      
      const loadedItems = items.filter(item => item.product);
      setWishlistItems(loadedItems);
      // Select all items by default
      setSelectedItems(loadedItems.map(item => item.id));
    }
    
    setLoading(false);
  };

  const toggleItemSelection = (productId) => {
    setSelectedItems(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setWishlistItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const openQuotationModal = () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one product');
      return;
    }
    
    // Initialize prices for selected items
    const prices = {};
    selectedItems.forEach(id => {
      prices[id] = 0;
    });
    setProductPrices(prices);
    setShowQuotationModal(true);
  };

  const cleanTextForPDF = (text) => {
    if (!text) return '';
    return text
      .replace(/Å/g, 'A')
      .replace(/—/g, '-')
      .replace(/–/g, '-')
      .replace(/'/g, "'")
      .replace(/'/g, "'")
      .replace(/"/g, '"')
      .replace(/"/g, '"')
      .replace(/…/g, '...')
      // eslint-disable-next-line no-control-regex
      .replace(/[^\x00-\x7F]/g, '');
  };

  const generateQuotationPDF = async () => {
    const doc = new jsPDF();
    const itemsToQuote = wishlistItems.filter(item => selectedItems.includes(item.id));
    
    console.log('Items to quote:', itemsToQuote);
    console.log('Selected items:', selectedItems);
    
    if (itemsToQuote.length === 0) {
      alert('No items selected for quotation');
      return;
    }
    
    // Orange vertical accent bar
    doc.setFillColor(255, 107, 53);
    doc.rect(8, 8, 4, 20, 'F');
    
    // Left side - Company Details
    doc.setFontSize(9.5);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 140, 0);
    doc.text('Weaving, Processing & Engineering Spares Suppliers', 16, 12);
    
    doc.setFontSize(7.5);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(50, 50, 80);
    doc.text("Gr.Floor, 'NIKUMBH' Complex, Opp. Tomato's Restaurant,", 16, 15.5);
    doc.text('Besides Goldleaf, Off C.G.Road, Ahmedabad-06.', 16, 18);
    doc.text('Tele    : +91 79 2640 9933', 16, 20.5);
    doc.text('Cell    : +91 99137 99333', 16, 23);
    
    doc.setTextColor(30, 30, 70);
    doc.text('E-mail : sales@shreerajcorporation.com', 16, 25.5);
    
    // Right side - Logo and Company Name
    const logoImg = new Image();
    logoImg.src = companyLogo;
    doc.addImage(logoImg, 'PNG', 152, 6, 18, 18);
    
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 128, 96);
    doc.text('SHREERAJ CORPORATION', 132, 27);
    
    // Horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(8, 30, 205, 30);
    
    // QUOTATION Title
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('QUOTATION', 105, 36, { align: 'center' });
    
    // Quotation Details
    const quotationNo = `SC/${Date.now().toString().slice(-6)}/25-26`;
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    // Left side - Client Details
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('To:', 10, 42);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9.5);
    doc.text(cleanTextForPDF(quotationData.clientName), 10, 46);
    
    let leftY = 49.5;
    if (quotationData.clientAddress) {
      const cleanAddress = cleanTextForPDF(quotationData.clientAddress);
      const addressLines = doc.splitTextToSize(cleanAddress, 85);
      addressLines.slice(0, 2).forEach(line => {
        doc.text(line, 10, leftY);
        leftY += 3.2;
      });
    }
    
    if (quotationData.clientPhone) {
      doc.text(cleanTextForPDF(quotationData.clientPhone), 10, leftY);
      leftY += 3.2;
    }
    
    if (quotationData.clientEmail) {
      doc.text(cleanTextForPDF(quotationData.clientEmail), 10, leftY);
    }
    
    // Right side - Ref. No and Date
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('Ref. No:', 140, 42);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9.5);
    doc.text(quotationNo, 162, 42);
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('Date :', 140, 48);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9.5);
    doc.text(date, 162, 48);
    
    if (quotationData.clientEmail) {
      doc.setFont(undefined, 'bold');
      doc.setFontSize(10);
      doc.text('Kind Attn.:', 140, 54);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(9.5);
      const emailShort = cleanTextForPDF(quotationData.clientEmail).substring(0, 28);
      doc.text(emailShort, 162, 54);
    }
    
    // Dear Sir section
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9.5);
    doc.text('Dear Sir,', 10, 64);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text('With reference to your Verbal / Inquiry No.:', 10, 68);
    doc.setFont(undefined, 'bold');
    doc.text('OILSM/ENQ127A', 72, 68);
    
    doc.setFont(undefined, 'normal');
    doc.text('DT.', 170, 68);
    doc.line(178, 68, 205, 68);
    doc.text(date, 180, 68);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text('We are pleased to quote you the best rates as under :', 10, 72);
    
    // Products Table
    const tableData = [];
    const productImages = {};
    
    // Load images if needed
    if (quotationData.includeImages) {
      for (const item of itemsToQuote) {
        const attrs = item.product.attributes || item.product;
        const itemId = item.id || item._id;
        
        // Handle MongoDB image structure
        let imageUrl = null;
        if (attrs.images && Array.isArray(attrs.images)) {
          if (attrs.images.length > 0) {
            // MongoDB structure: images is array of {url, filename}
            imageUrl = attrs.images[0].url;
          }
        } else if (attrs.images?.data) {
          // Strapi structure
          const firstImage = attrs.images.data[0];
          imageUrl = firstImage.attributes?.url || firstImage.url;
        }
        
        if (imageUrl) {
          try {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            await new Promise((resolve) => {
              img.onload = () => {
                productImages[itemId] = img;
                resolve();
              };
              img.onerror = () => resolve();
              img.src = imageUrl;
            });
          } catch (error) {
            console.error('Error loading image:', error);
          }
        }
      }
    }
    
    itemsToQuote.forEach((item, index) => {
      const attrs = item.product.attributes || item.product;
      const price = parseFloat(productPrices[item.id] || 0);
      
      const cleanName = cleanTextForPDF(attrs.name);
      const partNo = attrs.partNumber || attrs.sku || '';
      
      tableData.push([
        index + 1,
        partNo,
        cleanName,
        item.quantity,
        price > 0 ? price.toFixed(1) : '0.0',
        'Pc'
      ]);
    });
    
    const columnStyles = quotationData.includeImages ? {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 25, halign: 'center' },
      3: { cellWidth: 85, halign: 'center' },
      4: { cellWidth: 12, halign: 'center' },
      5: { cellWidth: 28, halign: 'center' },
      6: { cellWidth: 15, halign: 'center' }
    } : {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 110, halign: 'center' },
      3: { cellWidth: 12, halign: 'center' },
      4: { cellWidth: 28, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' }
    };
    
    const tableHeaders = quotationData.includeImages 
      ? [['NO.', 'SR\nNO', 'PART NO.', 'ITEM NAME', 'QTY.', 'RATE', 'PER']]
      : [['NO.', 'SR\nNO', 'ITEM NAME', 'QTY.', 'RATE', 'PER']];
    
    const tableDataWithImages = quotationData.includeImages
      ? tableData.map((row) => {
          return [row[0], '', row[1], row[2], row[3], row[4], row[5]];
        })
      : tableData;
    
    autoTable(doc, {
      startY: 75,
      margin: { left: 10, right: 10 },
      tableWidth: 195,
      head: tableHeaders,
      body: tableDataWithImages,
      theme: 'grid',
      headStyles: { 
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineWidth: 0.8,
        lineColor: [0, 0, 0],
        halign: 'center',
        valign: 'middle',
        fontSize: 9.5
      },
      styles: { 
        fontSize: 8.5,
        cellPadding: 2,
        lineWidth: 0.5,
        lineColor: [0, 0, 0],
        minCellHeight: quotationData.includeImages ? 22 : 9,
        valign: 'middle',
        textColor: [0, 0, 0],
        fontStyle: 'bold'
      },
      columnStyles: columnStyles,
      didDrawCell: (data) => {
        if (quotationData.includeImages && data.column.index === 1 && data.section === 'body') {
          try {
            const rowIndex = data.row.index;
            console.log('Drawing cell for row:', rowIndex, 'Total items:', itemsToQuote.length);
            
            if (rowIndex >= 0 && rowIndex < itemsToQuote.length) {
              const item = itemsToQuote[rowIndex];
              if (!item) {
                console.error('Item is undefined at index:', rowIndex);
                return;
              }
              
              const itemId = item.id || item._id;
              console.log('Item ID:', itemId, 'Available images:', Object.keys(productImages));
              
              const img = productImages[itemId];
              if (img) {
                const cellX = data.cell.x + 1;
                const cellY = data.cell.y + 1;
                const cellWidth = data.cell.width - 2;
                const cellHeight = data.cell.height - 2;
                
                const imgAspect = img.width / img.height;
                let imgWidth = cellWidth;
                let imgHeight = cellWidth / imgAspect;
                
                if (imgHeight > cellHeight) {
                  imgHeight = cellHeight;
                  imgWidth = cellHeight * imgAspect;
                }
                
                const imgX = cellX + (cellWidth - imgWidth) / 2;
                const imgY = cellY + (cellHeight - imgHeight) / 2;
                
                doc.addImage(img, 'JPEG', imgX, imgY, imgWidth, imgHeight);
              }
            }
          } catch (error) {
            console.error('Error in didDrawCell:', error);
          }
        }
      }
    });
    
    // Footer sections
    let footerY = doc.lastAutoTable.finalY + 2;
    
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(10, footerY, 195, 8);
    
    doc.rect(10, footerY, 50, 8);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('GST  :', 11, footerY + 5.5);
    doc.setFont(undefined, 'normal');
    doc.text(`${quotationData.gst}%`, 24, footerY + 5.5);
    
    doc.rect(60, footerY, 95, 8);
    doc.setFont(undefined, 'bold');
    doc.text('Packing/Forwarding:', 61, footerY + 5.5);
    doc.setFont(undefined, 'normal');
    doc.text('ex works', 95, footerY + 5.5);
    
    doc.rect(155, footerY, 50, 8);
    
    footerY += 8;
    
    doc.rect(10, footerY, 195, 8);
    
    doc.rect(10, footerY, 50, 8);
    doc.setFont(undefined, 'bold');
    doc.text('Delivery  :', 11, footerY + 5.5);
    doc.setFont(undefined, 'normal');
    doc.text('7-15 days', 31, footerY + 5.5);
    
    doc.rect(60, footerY, 95, 8);
    
    doc.rect(155, footerY, 30, 8);
    doc.setFont(undefined, 'bold');
    doc.text('Payment:', 156, footerY + 5.5);
    
    doc.rect(185, footerY, 20, 8);
    doc.setFont(undefined, 'normal');
    doc.text('30 Days', 186, footerY + 5.5);
    
    footerY += 8;
    
    doc.rect(10, footerY, 195, 8);
    doc.setFont(undefined, 'bold');
    doc.text('Remarks  :', 11, footerY + 5.5);
    
    footerY += 8;
    
    doc.rect(10, footerY, 145, 20);
    doc.rect(155, footerY, 50, 20);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(0, 0, 0);
    doc.text('N. B.: All quotations are subject to Market Fluctuations and Prior sale.', 11, footerY + 4);
    doc.text('Subject to Ahmedabad Jurisdiction.', 11, footerY + 8);
    doc.setFont(undefined, 'bold');
    doc.text('Validity 30 Days.', 75, footerY + 8);
    
    doc.setTextColor(255, 69, 0);
    doc.setFontSize(9.5);
    doc.text('Shreeraj Corporation GST NO. 24AEAPS1043P1ZF', 11, footerY + 14);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(8.5);
    doc.text('For SHREERAJ CORPORATION', 156, footerY + 4);
    
    if (quotationData.includeSignature) {
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text('Vishal Shah', 165, footerY + 15);
    }
    
    const fileName = `Quotation_SC_${Date.now().toString().slice(-6)}.pdf`;
    doc.save(fileName);
    
    // Save quotation to localStorage
    const quotationRecord = {
      id: Date.now().toString(),
      quotationNumber: quotationNo,
      clientName: quotationData.clientName,
      clientAddress: quotationData.clientAddress,
      clientPhone: quotationData.clientPhone,
      clientEmail: quotationData.clientEmail,
      productCount: itemsToQuote.length,
      products: itemsToQuote.map(item => ({
        name: (item.product.attributes || item.product).name,
        quantity: item.quantity
      })),
      createdAt: new Date().toISOString()
    };
    
    const savedQuotations = localStorage.getItem('quotations');
    const quotations = savedQuotations ? JSON.parse(savedQuotations) : [];
    quotations.unshift(quotationRecord); // Add to beginning
    localStorage.setItem('quotations', JSON.stringify(quotations));
    
    setShowQuotationModal(false);
    alert('Quotation generated successfully!');
  };

  const goBack = () => {
    navigate('/user/dashboard');
  };

  if (loading) {
    return (
      <div className="quotation-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="quotation-page">
      {/* Top Bar */}
      <div className="quotation-top-bar">
        <button className="btn-back" onClick={goBack}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Dashboard
        </button>
        <h1>Prepare Quotation</h1>
        <div className="user-info-small">
          <span>{userInfo?.username}</span>
        </div>
      </div>

      <div className="quotation-container">
        <div className="quotation-header">
          <h2>Select Products for Quotation</h2>
          <div className="header-actions">
            <span className="selected-count">{selectedItems.length} of {wishlistItems.length} selected</span>
            <button 
              className="btn-generate"
              onClick={openQuotationModal}
              disabled={selectedItems.length === 0}
            >
              Generate Quotation PDF
            </button>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="empty-state">
            <h3>No products selected</h3>
            <p>Select products from the dashboard to create quotations</p>
            <button className="btn-primary" onClick={() => navigate('/user/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="products-list">
            {wishlistItems.map((item) => {
              const product = item.product;
              const attrs = product.attributes || product;
              
              // Debug logging
              console.log('Product:', attrs.name);
              console.log('Images data:', attrs.images);
              
              // Handle MongoDB image structure
              let imageUrl = null;
              if (attrs.images && Array.isArray(attrs.images)) {
                if (attrs.images.length > 0) {
                  // MongoDB structure: images is array of {url, filename}
                  imageUrl = attrs.images[0].url;
                  console.log('MongoDB image URL:', imageUrl);
                }
              } else if (attrs.images?.data) {
                // Strapi structure
                const firstImage = attrs.images.data[0];
                imageUrl = firstImage.attributes?.url || firstImage.url;
                console.log('Strapi image URL:', imageUrl);
              }
              
              const fullImageUrl = imageUrl || 'https://via.placeholder.com/100?text=No+Image';
              console.log('Final image URL:', fullImageUrl);
              
              const isSelected = selectedItems.includes(item.id);
              
              const categoryData = attrs.category?.data || attrs.category;
              const categoryName = categoryData?.attributes?.name || categoryData?.name || 'Uncategorized';

              return (
                <div key={item.id} className={`product-item ${isSelected ? 'selected' : ''}`}>
                  <div className="product-checkbox">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleItemSelection(item.id)}
                    />
                  </div>
                  <img 
                    src={fullImageUrl} 
                    alt={attrs.name} 
                    className="product-image"
                    onError={(e) => {
                      console.error('Image failed to load:', fullImageUrl);
                      e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                    }}
                  />
                  <div className="product-info">
                    <h3>{attrs.name}</h3>
                    <p className="category">{categoryName}</p>
                  </div>
                  <div className="product-quantity">
                    <label>Qty:</label>
                    <div className="qty-controls">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                      <input 
                        type="number" 
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        min="1"
                      />
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quotation Modal */}
      {showQuotationModal && (
        <div className="modal-overlay" onClick={() => setShowQuotationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Quotation Details</h2>
              <button className="modal-close" onClick={() => setShowQuotationModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
              {/* Client Selector */}
              <div className="form-group client-selector">
                <label>Select Client (Optional)</label>
                <div className="client-search-wrapper">
                  <input
                    type="text"
                    value={clientSearchQuery}
                    onChange={(e) => {
                      setClientSearchQuery(e.target.value);
                      setShowClientDropdown(true);
                    }}
                    onFocus={() => setShowClientDropdown(true)}
                    placeholder="Search clients by name, address, or GST..."
                    className="client-search-input"
                  />
                  {selectedClient && (
                    <button 
                      className="clear-client-btn"
                      onClick={clearClientSelection}
                      type="button"
                    >
                      ×
                    </button>
                  )}
                  
                  {showClientDropdown && clients.length > 0 && (
                    <div className="client-dropdown">
                      {filterClients().length > 0 ? (
                        filterClients().map((client) => (
                          <div 
                            key={client.id} 
                            className="client-option"
                            onClick={() => selectClient(client)}
                          >
                            <div className="client-option-name">{client.name}</div>
                            <div className="client-option-details">
                              {client.address && <span>{client.address.substring(0, 50)}...</span>}
                              {client.gstNumber && <span className="gst-badge">GST: {client.gstNumber}</span>}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="no-clients">No clients found</div>
                      )}
                    </div>
                  )}
                </div>
                {clients.length === 0 && (
                  <small className="helper-text">No clients saved. Add clients from the Clients tab.</small>
                )}
              </div>

              <div className="form-group">
                <label>Client Name *</label>
                <input
                  type="text"
                  value={quotationData.clientName}
                  onChange={(e) => setQuotationData({...quotationData, clientName: e.target.value})}
                  placeholder="Enter client name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Client Address</label>
                <textarea
                  value={quotationData.clientAddress}
                  onChange={(e) => setQuotationData({...quotationData, clientAddress: e.target.value})}
                  placeholder="Enter client address"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={quotationData.clientPhone}
                    onChange={(e) => setQuotationData({...quotationData, clientPhone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={quotationData.clientEmail}
                    onChange={(e) => setQuotationData({...quotationData, clientEmail: e.target.value})}
                    placeholder="Enter email"
                  />
                </div>
              </div>

              <div className="products-pricing">
                <h3>Product Pricing</h3>
                {wishlistItems.filter(item => selectedItems.includes(item.id)).map((item) => {
                  const attrs = item.product.attributes || item.product;
                  return (
                    <div key={item.id} className="price-row">
                      <span className="product-name">{attrs.name} (Qty: {item.quantity})</span>
                      <input
                        type="number"
                        value={productPrices[item.id] || ''}
                        onChange={(e) => setProductPrices({...productPrices, [item.id]: e.target.value})}
                        placeholder="Unit Price (₹)"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  );
                })}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>GST (%)</label>
                  <input
                    type="number"
                    value={quotationData.gst}
                    onChange={(e) => setQuotationData({...quotationData, gst: e.target.value})}
                    min="0"
                    max="100"
                  />
                </div>

                <div className="form-group">
                  <label>Discount (%)</label>
                  <input
                    type="number"
                    value={quotationData.discount}
                    onChange={(e) => setQuotationData({...quotationData, discount: e.target.value})}
                    min="0"
                    max="100"
                  />
                </div>

                <div className="form-group">
                  <label>Delivery Charges (₹)</label>
                  <input
                    type="number"
                    value={quotationData.deliveryCharges}
                    onChange={(e) => setQuotationData({...quotationData, deliveryCharges: e.target.value})}
                    min="0"
                  />
                </div>
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={quotationData.includeImages}
                    onChange={(e) => setQuotationData({...quotationData, includeImages: e.target.checked})}
                  />
                  Include Product Images
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={quotationData.includeSignature}
                    onChange={(e) => setQuotationData({...quotationData, includeSignature: e.target.checked})}
                  />
                  Include Signature
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowQuotationModal(false)}>
                Cancel
              </button>
              <button 
                className="btn-generate" 
                onClick={generateQuotationPDF}
                disabled={!quotationData.clientName}
              >
                Generate PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotationPage;
