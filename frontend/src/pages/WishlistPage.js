import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './WishlistPage.css';
import Navbar from '../components/Navbar';
import { fetchProductById } from '../services/api';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import companyLogo from '../Gallery/logo.png';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDownloadMenu, setShowDownloadMenu] = useState(null);
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
  const navigate = useNavigate();

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    setLoading(true);
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
    
    setWishlistItems(items.filter(item => item.product));
    setLoading(false);
  };

  const removeFromWishlist = (productId) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const updated = wishlist.filter(id => id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setWishlistItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleSendEmail = (item) => {
    const attrs = item.product.attributes || item.product;
    const subject = `Inquiry about ${attrs.name}`;
    const body = `Hello,\n\nI am interested in the following product:\n\nProduct: ${attrs.name}\nQuantity: ${item.quantity}\n\nPlease provide more information and pricing.\n\nThank you.`;
    window.location.href = `mailto:sales@shreeraj.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const openQuotationModal = (item = null) => {
    // Initialize prices for all items
    const prices = {};
    const itemsToQuote = item ? [item] : wishlistItems;
    itemsToQuote.forEach(i => {
      prices[i.id] = 0;
    });
    setProductPrices(prices);
    setShowQuotationModal(item || 'all');
  };

  const cleanTextForPDF = (text) => {
    if (!text) return '';
    // Replace special characters that don't render well in PDF
    return text
      .replace(/Å/g, 'A')  // Angstrom symbol
      .replace(/—/g, '-')  // Em dash
      .replace(/–/g, '-')  // En dash
      .replace(/'/g, "'")  // Smart quote
      .replace(/'/g, "'")  // Smart quote
      .replace(/"/g, '"')  // Smart quote
      .replace(/"/g, '"')  // Smart quote
      .replace(/…/g, '...')  // Ellipsis
      // eslint-disable-next-line no-control-regex
      .replace(/[^\x00-\x7F]/g, ''); // Remove any other non-ASCII characters
  };

  const generateQuotationPDF = async () => {
    const doc = new jsPDF();
    const itemsToQuote = showQuotationModal === 'all' ? wishlistItems : [showQuotationModal];
    
    // Orange vertical accent bar on left edge (only for left side details area)
    doc.setFillColor(255, 107, 53); // #FF6B35
    doc.rect(8, 8, 4, 20, 'F');
    
    // Left side - Company Details
    doc.setFontSize(9.5);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(255, 140, 0); // Orange
    doc.text('Weaving, Processing & Engineering Spares Suppliers', 16, 12);
    
    doc.setFontSize(7.5);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(50, 50, 80); // Darker Blue/Purple
    doc.text("Gr.Floor, 'NIKUMBH' Complex, Opp. Tomato's Restaurant,", 16, 15.5);
    doc.text('Besides Goldleaf, Off C.G.Road, Ahmedabad-06.', 16, 18);
    doc.text('Tele    : +91 79 2640 9933', 16, 20.5);
    doc.text('Cell    : +91 99137 99333', 16, 23);
    
    doc.setTextColor(30, 30, 70); // Even darker Blue for email
    doc.text('E-mail : sales@shreerajcorporation.com', 16, 25.5);
    
    // Right side - Logo on top, Company Name below
    const logoImg = new Image();
    logoImg.src = companyLogo;
    doc.addImage(logoImg, 'PNG', 152, 6, 18, 18);
    
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 128, 96); // Green #008060
    doc.text('SHREERAJ CORPORATION', 132, 27);
    
    // Horizontal line below header
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(8, 30, 205, 30);
    
    // QUOTATION Title
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('QUOTATION', 105, 36, { align: 'center' });
    
    // Quotation Details Section without boxes - clean layout
    const quotationNo = `SC/${Date.now().toString().slice(-6)}/25-26`;
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    // Left side - All Client Details (no boxes)
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
    
    // Right side - Ref. No and Date (no boxes)
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
    
    // Kind Attn section (optional, can be added if needed)
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
    
    // Reference line
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text('With reference to your Verbal / Inquiry No.:', 10, 68);
    doc.setFont(undefined, 'bold');
    doc.text('OILSM/ENQ127A', 72, 68);
    
    // DT. section on right
    doc.setFont(undefined, 'normal');
    doc.text('DT.', 170, 68);
    doc.line(178, 68, 205, 68);
    doc.text(date, 180, 68);
    
    // Quote line
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text('We are pleased to quote you the best rates as under :', 10, 72);
    
    // Products Table with Images
    const tableData = [];
    
    // Load product images if includeImages is true
    const productImages = {};
    if (quotationData.includeImages) {
      for (const item of itemsToQuote) {
        const attrs = item.product.attributes || item.product;
        const imagesData = attrs.images?.data || attrs.images || [];
        if (imagesData.length > 0) {
          const imageUrl = imagesData[0].attributes?.url || imagesData[0].url;
          const fullImageUrl = imageUrl
            ? (imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`)
            : null;
          
          if (fullImageUrl) {
            try {
              // Load image
              const img = new Image();
              img.crossOrigin = 'Anonymous';
              await new Promise((resolve, reject) => {
                img.onload = () => {
                  productImages[item.id] = img;
                  resolve();
                };
                img.onerror = () => resolve(); // Continue even if image fails
                img.src = fullImageUrl;
              });
            } catch (error) {
              console.error('Error loading image:', error);
            }
          }
        }
      }
    }
    
    itemsToQuote.forEach((item, index) => {
      const attrs = item.product.attributes || item.product;
      const price = parseFloat(productPrices[item.id] || 0);
      
      // Clean product name for PDF
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
    
    // Table column configuration matching reference image
    const columnStyles = quotationData.includeImages ? {
      0: { cellWidth: 10, halign: 'center' }, // NO.
      1: { cellWidth: 20, halign: 'center' }, // SR NO (Image)
      2: { cellWidth: 25, halign: 'center' }, // PART NO
      3: { cellWidth: 85, halign: 'center' }, // ITEM NAME
      4: { cellWidth: 12, halign: 'center' }, // QTY.
      5: { cellWidth: 28, halign: 'center' },  // RATE
      6: { cellWidth: 15, halign: 'center' }  // PER
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
      ? tableData.map((row, index) => {
          return [row[0], '', row[1], row[2], row[3], row[4], row[5]]; // Empty string for image placeholder
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
        // Add images to the image column (SR NO column)
        if (quotationData.includeImages && data.column.index === 1 && data.section === 'body') {
          const item = itemsToQuote[data.row.index];
          const img = productImages[item.id];
          if (img) {
            const cellX = data.cell.x + 1;
            const cellY = data.cell.y + 1;
            const cellWidth = data.cell.width - 2;
            const cellHeight = data.cell.height - 2;
            
            // Calculate aspect ratio
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
      }
    });
    
    // Footer sections after table
    let footerY = doc.lastAutoTable.finalY + 2;
    
    // GST, Packing/Forwarding row
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(10, footerY, 195, 8);
    
    // GST section
    doc.rect(10, footerY, 50, 8);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('GST  :', 11, footerY + 5.5);
    doc.setFont(undefined, 'normal');
    doc.text(`${quotationData.gst}%`, 24, footerY + 5.5);
    
    // Packing/Forwarding section
    doc.rect(60, footerY, 95, 8);
    doc.setFont(undefined, 'bold');
    doc.text('Packing/Forwarding:', 61, footerY + 5.5);
    doc.setFont(undefined, 'normal');
    doc.text('ex works', 95, footerY + 5.5);
    
    // Empty section on right
    doc.rect(155, footerY, 50, 8);
    
    footerY += 8;
    
    // Delivery, Payment row
    doc.rect(10, footerY, 195, 8);
    
    // Delivery section
    doc.rect(10, footerY, 50, 8);
    doc.setFont(undefined, 'bold');
    doc.text('Delivery  :', 11, footerY + 5.5);
    doc.setFont(undefined, 'normal');
    doc.text('7-15 days', 31, footerY + 5.5);
    
    // Empty middle section
    doc.rect(60, footerY, 95, 8);
    
    // Payment section
    doc.rect(155, footerY, 30, 8);
    doc.setFont(undefined, 'bold');
    doc.text('Payment:', 156, footerY + 5.5);
    
    doc.rect(185, footerY, 20, 8);
    doc.setFont(undefined, 'normal');
    doc.text('30 Days', 186, footerY + 5.5);
    
    footerY += 8;
    
    // Remarks section
    doc.rect(10, footerY, 195, 8);
    doc.setFont(undefined, 'bold');
    doc.text('Remarks  :', 11, footerY + 5.5);
    
    footerY += 8;
    
    // Notes and Signature section
    doc.rect(10, footerY, 145, 20);
    doc.rect(155, footerY, 50, 20);
    
    // Notes section
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(0, 0, 0);
    doc.text('N. B.: All quotations are subject to Market Fluctuations and Prior sale.', 11, footerY + 4);
    doc.text('Subject to Ahmedabad Jurisdiction.', 11, footerY + 8);
    doc.setFont(undefined, 'bold');
    doc.text('Validity 30 Days.', 75, footerY + 8);
    
    doc.setTextColor(255, 69, 0); // Orange/Red color
    doc.setFontSize(9.5);
    doc.text('Shreeraj Corporation GST NO. 24AEAPS1043P1ZF', 11, footerY + 14);
    
    // Signature section
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(8.5);
    doc.text('For SHREERAJ CORPORATION', 156, footerY + 4);
    
    // Add signature if included
    if (quotationData.includeSignature) {
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text('Vishal Shah', 165, footerY + 15);
    }
    
    // Save PDF
    const fileName = showQuotationModal === 'all' 
      ? `Quotation_SC_${Date.now().toString().slice(-6)}.pdf`
      : `Quotation_${itemsToQuote[0].product.attributes.name}_${Date.now().toString().slice(-6)}.pdf`;
    
    doc.save(fileName);
    
    setShowQuotationModal(false);
    setQuotationData({
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
  };

  const downloadExcel = async (item, type) => {
    if (type === 'client') {
      // Open quotation modal instead of direct Excel download
      openQuotationModal(item);
      return;
    }
    
    // Vendor format - Excel download
    const attrs = item.product.attributes || item.product;
    const categoryName = attrs.category?.data?.attributes?.name || attrs.category?.name || 'Uncategorized';
    
    // Get image URL
    const imagesData = attrs.images?.data || attrs.images || [];
    const imageUrl = imagesData.length > 0
      ? (imagesData[0].attributes?.url || imagesData[0].url)
      : null;
    const fullImageUrl = imageUrl
      ? (imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`)
      : '';

    // Vendor format - Detailed format for vendors
    const data = [
      ['PRODUCT INQUIRY - VENDOR QUOTATION REQUEST'],
      [''],
      ['Product Information'],
      ['Product Name', attrs.name],
      ['Category', categoryName],
      ['Quantity Required', item.quantity],
      ['Description', attrs.description || 'High-quality product'],
      [''],
      ['Vendor Details to Fill'],
      ['Unit Price', ''],
      ['Total Price', ''],
      ['Delivery Time', ''],
      ['Warranty Period', ''],
      ['Payment Terms', ''],
      [''],
      ['Client Information'],
      ['Company Name', 'SHREERAJ CORPORATION'],
      ['Contact Email', 'sales@shreeraj.com'],
      ['Contact Phone', '+91 93270 07508 | 7948449933'],
      [''],
      ['Product Image URL', fullImageUrl]
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 25 },
      { wch: 50 }
    ];

    // Merge cells for title
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vendor Quotation');
    XLSX.writeFile(wb, `${attrs.name}_Vendor.xlsx`);
    
    setShowDownloadMenu(null);
  };

  const downloadAllExcel = (type) => {
    if (type === 'client') {
      // Open quotation modal for all items
      openQuotationModal();
      return;
    }
    
    // Vendor format - Separate sheet for each product
    const wb = XLSX.utils.book_new();

    wishlistItems.forEach((item, index) => {
      const attrs = item.product.attributes || item.product;
      const categoryName = attrs.category?.data?.attributes?.name || attrs.category?.name || 'Uncategorized';
      
      const imagesData = attrs.images?.data || attrs.images || [];
      const imageUrl = imagesData.length > 0
        ? (imagesData[0].attributes?.url || imagesData[0].url)
        : null;
      const fullImageUrl = imageUrl
        ? (imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`)
        : '';

      const data = [
        ['PRODUCT INQUIRY - VENDOR QUOTATION REQUEST'],
        [''],
        ['Product Information'],
        ['Product Name', attrs.name],
        ['Category', categoryName],
        ['Quantity Required', item.quantity],
        ['Description', attrs.description || 'High-quality product'],
        [''],
        ['Vendor Details to Fill'],
        ['Unit Price', ''],
        ['Total Price', ''],
        ['Delivery Time', ''],
        ['Warranty Period', ''],
        ['Payment Terms', ''],
        [''],
        ['Client Information'],
        ['Company Name', 'SHREERAJ CORPORATION'],
        ['Contact Email', 'sales@shreeraj.com'],
        ['Contact Phone', '+91 93270 07508 | 7948449933'],
        [''],
        ['Product Image URL', fullImageUrl]
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      
      ws['!cols'] = [
        { wch: 25 },
        { wch: 50 }
      ];

      ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }
      ];

      const sheetName = `Product ${index + 1}`;
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    XLSX.writeFile(wb, `Wishlist_Vendor_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const clearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your entire wishlist?')) {
      localStorage.setItem('wishlist', JSON.stringify([]));
      setWishlistItems([]);
      window.dispatchEvent(new Event('wishlistUpdated'));
    }
  };

  if (loading) {
    return (
      <div className="wishlist-page">
        <Navbar />
        <div className="wishlist-container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <Navbar />
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1>My Wishlist</h1>
          {wishlistItems.length > 0 && (
            <button className="clear-btn" onClick={clearWishlist}>Clear All</button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist">
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <h2>Your wishlist is empty</h2>
            <a href="/categories" className="browse-btn">Browse Products</a>
          </div>
        ) : (
          <>
            <div className="wishlist-items">
              {wishlistItems.map((item) => {
                const attrs = item.product.attributes || item.product;
                const imagesData = attrs.images?.data || attrs.images || [];
                const imageUrl = imagesData.length > 0
                  ? (imagesData[0].attributes?.url || imagesData[0].url)
                  : null;
                const fullImageUrl = imageUrl
                  ? (imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`)
                  : 'https://via.placeholder.com/120x120/f5f5f5/999?text=No+Image';
                
                const categoryName = attrs.category?.data?.attributes?.name || attrs.category?.name || 'Uncategorized';

                return (
                  <div key={item.id} className="wishlist-item">
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      ×
                    </button>

                    <div className="item-image" onClick={() => navigate(`/product/${item.id}`)}>
                      <img src={fullImageUrl} alt={attrs.name} />
                    </div>

                    <div className="item-info">
                      <h3 onClick={() => navigate(`/product/${item.id}`)}>{attrs.name}</h3>
                      <span className="item-category">{categoryName}</span>
                      <p className="item-desc">{attrs.description?.substring(0, 80)}{attrs.description?.length > 80 ? '...' : ''}</p>
                    </div>

                    <div className="item-actions">
                      <div className="quantity">
                        <label>Quantity:</label>
                        <div className="qty-controls">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1}>-</button>
                          <input 
                            type="number" 
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            min="1"
                          />
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>
                      </div>

                      <div className="action-btns">
                        <button className="view-btn" onClick={() => navigate(`/product/${item.id}`)}>
                          View Details
                        </button>
                        <button className="send-btn" onClick={() => handleSendEmail(item)}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="22" y1="2" x2="11" y2="13"></line>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                          </svg>
                          Send
                        </button>
                        <div className="download-dropdown">
                          <button 
                            className="download-btn"
                            onClick={() => setShowDownloadMenu(showDownloadMenu === item.id ? null : item.id)}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                              <polyline points="7 10 12 15 17 10"></polyline>
                              <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            Download
                          </button>
                          {showDownloadMenu === item.id && (
                            <div className="download-menu">
                              <button onClick={() => downloadExcel(item, 'client')}>Client Format</button>
                              <button onClick={() => downloadExcel(item, 'vendor')}>Vendor Format</button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="wishlist-footer">
              <span>{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} in your wishlist</span>
              <div className="footer-actions">
                <div className="download-dropdown">
                  <button className="download-all-btn">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download All
                  </button>
                  <div className="download-menu">
                    <button onClick={() => downloadAllExcel('client')}>Client Format</button>
                    <button onClick={() => downloadAllExcel('vendor')}>Vendor Format</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Quotation Modal */}
      {showQuotationModal && (
        <div className="modal-overlay" onClick={() => setShowQuotationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Generate Quotation</h2>
              <button className="modal-close" onClick={() => setShowQuotationModal(false)}>×</button>
            </div>
            
            <div className="modal-body">
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
                {(showQuotationModal === 'all' ? wishlistItems : [showQuotationModal]).map((item) => {
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

export default WishlistPage;
