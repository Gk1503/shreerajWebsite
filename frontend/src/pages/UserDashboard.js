import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserDashboard.css';
import { fetchProductById, fetchProducts, fetchCategories } from '../services/api';
import { getImageUrl } from '../config';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import companyLogo from '../Gallery/logo.png';

const UserDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [userInfo, setUserInfo] = useState(null);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProfile, setEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    companyName: '',
    companyAddress: '',
    phone: '',
    email: ''
  });
  const [clients, setClients] = useState([]);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [clientData, setClientData] = useState({
    name: '',
    address: '',
    preferredCourier: '',
    gstNumber: '',
    panNumber: '',
    visitingCard: null,
    contactPersons: [
      {
        name: '',
        phones: [''],
        emails: ['']
      }
    ]
  });
  const [quotations, setQuotations] = useState([]);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [quotationItems, setQuotationItems] = useState([]);
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
  const [selectedClient, setSelectedClient] = useState(null);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    loadWishlist();
    loadCategories();
    loadClients();
    loadQuotations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load products only when Products tab is active
  useEffect(() => {
    if (activeTab === 'products' && allProducts.length === 0) {
      loadAllProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadQuotations = () => {
    const savedQuotations = localStorage.getItem('quotations');
    if (savedQuotations) {
      setQuotations(JSON.parse(savedQuotations));
    }
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      filterProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const checkAuth = () => {
    const user = localStorage.getItem('userInfo');
    if (!user) {
      navigate('/user/login');
      return;
    }
    const userData = JSON.parse(user);
    setUserInfo(userData);
    setProfileData({
      companyName: userData.companyName || '',
      companyAddress: userData.companyAddress || '',
      phone: userData.phone || '',
      email: userData.email || ''
    });
  };

  const loadWishlist = async () => {
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
  };

  const loadAllProducts = async () => {
    // Only load if not already loaded
    if (allProducts.length > 0) {
      setFilteredProducts(allProducts);
      return;
    }
    
    setLoading(true);
    try {
      const products = await fetchProducts();
      setAllProducts(products);
      setFilteredProducts(products);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProductsByCategory = async (categoryId) => {
    setLoading(true);
    try {
      let products;
      if (categoryId === 'all') {
        // Use cached products if available
        if (allProducts.length > 0) {
          products = allProducts;
        } else {
          products = await fetchProducts();
          setAllProducts(products);
        }
      } else {
        products = await fetchProducts(categoryId);
      }
      setFilteredProducts(products);
    } catch (error) {
      console.error('Error loading products by category:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setSearchQuery(''); // Clear search when changing category
    loadProductsByCategory(categoryId);
  };

  const loadCategories = async () => {
    try {
      const cats = await fetchCategories();
      setCategories(cats);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const filterProducts = () => {
    // Only filter by search query, category filtering is done by API
    if (!searchQuery.trim()) {
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = (selectedCategory === 'all' ? allProducts : filteredProducts).filter(product => {
      const attrs = product.attributes || product;
      const name = attrs.name?.toLowerCase() || '';
      const description = attrs.description?.toLowerCase() || '';
      const categoryData = attrs.category?.data || attrs.category;
      const categoryAttrs = categoryData?.attributes || categoryData;
      const category = categoryAttrs?.name?.toLowerCase() || '';
      
      return name.includes(query) || description.includes(query) || category.includes(query);
    });
    
    setFilteredProducts(filtered);
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const addSelectedToQuotation = () => {
    if (selectedProducts.length === 0) {
      alert('Please select at least one product');
      return;
    }

    // Prepare quotation items with selected products
    const selectedProductsData = selectedProducts.map(id => {
      const product = allProducts.find(p => p.id === id || p._id === id);
      return {
        id: id,
        product: product,
        quantity: 1
      };
    });
    
    setQuotationItems(selectedProductsData);
    
    // Initialize prices for selected items
    const prices = {};
    selectedProducts.forEach(id => {
      prices[id] = 0;
    });
    setProductPrices(prices);
    
    // Pre-fill quotation data with user info
    setQuotationData({
      clientName: userInfo?.companyName || userInfo?.username || '',
      clientAddress: userInfo?.companyAddress || '',
      clientPhone: userInfo?.phone || '',
      clientEmail: userInfo?.email || '',
      gst: 18,
      discount: 0,
      deliveryCharges: 0,
      includeImages: true,
      includeSignature: true
    });
    
    setShowQuotationModal(true);
  };

  const updateQuotationQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setQuotationItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
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
    
    if (quotationItems.length === 0) {
      alert('No items selected for quotation');
      return;
    }
    
    const quotationNo = `SC/${Date.now().toString().slice(-6)}/25-26`;
    const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    // Function to draw header on each page
    const drawHeader = (pageNumber) => {
      // Orange vertical accent bar
      doc.setFillColor(255, 107, 53);
      doc.rect(8, 8, 4, 24, 'F');
      
      // Left side - Company Details
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 140, 0);
      doc.text('Weaving, Processing & Engineering Spares Suppliers', 16, 13);
      
      doc.setFontSize(9);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(50, 50, 80);
      doc.text("Gr.Floor, 'NIKUMBH' Complex, Opp. Tomato's Restaurant,", 16, 17.5);
      doc.text('Besides Goldleaf, Off C.G.Road, Ahmedabad-06.', 16, 21);
      doc.text('Tele    : +91 79 2640 9933', 16, 24.5);
      doc.text('Cell    : +91 99137 99333', 16, 28);
      
      doc.setTextColor(30, 30, 70);
      doc.text('E-mail : sales@shreerajcorporation.com', 16, 31.5);
      
      // Right side - Logo and Company Name
      const logoImg = new Image();
      logoImg.src = companyLogo;
      doc.addImage(logoImg, 'PNG', 152, 8, 20, 20);
      
      doc.setFontSize(15);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 128, 96);
      doc.text('SHREERAJ CORPORATION', 130, 31);
      
      // Horizontal line
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.line(8, 35, 205, 35);
      
      // Page number on subsequent pages
      if (pageNumber > 1) {
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Page ${pageNumber}`, 105, 40, { align: 'center' });
      }
    };
    
    // Draw initial header
    drawHeader(1);
    
    // QUOTATION Title (only on first page)
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('QUOTATION', 105, 42, { align: 'center' });
    
    // Left side - Client Details
    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('To:', 10, 50);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(cleanTextForPDF(quotationData.clientName), 10, 55);
    
    let leftY = 59;
    if (quotationData.clientAddress) {
      const cleanAddress = cleanTextForPDF(quotationData.clientAddress);
      const addressLines = doc.splitTextToSize(cleanAddress, 85);
      addressLines.slice(0, 2).forEach(line => {
        doc.text(line, 10, leftY);
        leftY += 4;
      });
    }
    
    if (quotationData.clientPhone) {
      doc.text(cleanTextForPDF(quotationData.clientPhone), 10, leftY);
      leftY += 4;
    }
    
    if (quotationData.clientEmail) {
      doc.text(cleanTextForPDF(quotationData.clientEmail), 10, leftY);
    }
    
    // Right side - Ref. No and Date
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('Ref. No:', 140, 50);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(quotationNo, 162, 50);
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('Date :', 140, 56);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text(date, 162, 56);
    
    if (quotationData.clientEmail) {
      doc.setFont(undefined, 'bold');
      doc.setFontSize(11);
      doc.text('Kind Attn.:', 140, 62);
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      const emailShort = cleanTextForPDF(quotationData.clientEmail).substring(0, 28);
      doc.text(emailShort, 162, 62);
    }
    
    // Dear Sir section
    doc.setFont(undefined, 'bold');
    doc.setFontSize(10);
    doc.text('Dear Sir,', 10, 74);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('With reference to your Verbal / Inquiry No.:', 10, 79);
    doc.setFont(undefined, 'bold');
    doc.text('OILSM/ENQ127A', 72, 79);
    
    doc.setFont(undefined, 'normal');
    doc.text('DT.', 170, 79);
    doc.line(178, 79, 205, 79);
    doc.text(date, 180, 79);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(10);
    doc.text('We are pleased to quote you the best rates as under :', 10, 84);
    
    // Products Table
    const tableData = [];
    const productImages = {};
    
    // Load images if needed
    if (quotationData.includeImages) {
      for (const item of quotationItems) {
        const attrs = item.product.attributes || item.product;
        const itemId = item.id || item._id;
        
        // Handle MongoDB image structure
        let imageUrl = null;
        if (attrs.images && Array.isArray(attrs.images)) {
          if (attrs.images.length > 0) {
            imageUrl = attrs.images[0].url;
          }
        } else if (attrs.images?.data) {
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
    
    quotationItems.forEach((item, index) => {
      const attrs = item.product.attributes || item.product;
      const price = parseFloat(productPrices[item.id] || 0);
      
      const cleanName = cleanTextForPDF(attrs.name);
      
      tableData.push([
        index + 1,
        cleanName,
        item.quantity,
        price > 0 ? price.toFixed(1) : '0.0',
        'Pc'
      ]);
    });
    
    const columnStyles = quotationData.includeImages ? {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 95, halign: 'left' },
      3: { cellWidth: 15, halign: 'center' },
      4: { cellWidth: 30, halign: 'center' },
      5: { cellWidth: 15, halign: 'center' }
    } : {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 120, halign: 'left' },
      2: { cellWidth: 15, halign: 'center' },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 15, halign: 'center' }
    };
    
    const tableHeaders = quotationData.includeImages 
      ? [['Sr. No.', 'Image', 'Item Name', 'QTY.', 'Rate', 'PER']]
      : [['Sr. No.', 'Item Name', 'QTY.', 'Rate', 'PER']];
    
    const tableDataWithImages = quotationData.includeImages
      ? tableData.map((row) => {
          return [row[0], '', row[1], row[2], row[3], row[4]];
        })
      : tableData;
    
    autoTable(doc, {
      startY: 88,
      margin: { left: 10, right: 10, top: 45, bottom: 40 },
      tableWidth: 195,
      head: tableHeaders,
      body: tableDataWithImages,
      theme: 'grid',
      showHead: 'everyPage',
      pageBreak: 'auto',
      rowPageBreak: 'avoid',
      headStyles: { 
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
        lineWidth: 0.3,
        lineColor: [180, 180, 180],
        halign: 'center',
        valign: 'middle',
        fontSize: 11,
        cellPadding: 3
      },
      styles: { 
        fontSize: 10,
        cellPadding: 3,
        lineWidth: 0.3,
        lineColor: [200, 200, 200],
        minCellHeight: quotationData.includeImages ? 24 : 11,
        valign: 'middle',
        textColor: [0, 0, 0],
        fontStyle: 'normal'
      },
      columnStyles: columnStyles,
      didDrawCell: (data) => {
        // Draw images in the Image column
        if (quotationData.includeImages && data.column.index === 1 && data.section === 'body') {
          try {
            const rowIndex = data.row.index;
            
            if (rowIndex >= 0 && rowIndex < quotationItems.length) {
              const item = quotationItems[rowIndex];
              if (!item) return;
              
              const itemId = item.id || item._id;
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
        
        // Draw rupee symbol in the Rate column
        const rateColumnIndex = quotationData.includeImages ? 4 : 3;
        if (data.column.index === rateColumnIndex && data.section === 'body') {
          try {
            const cellText = data.cell.text[0];
            if (cellText && cellText !== '') {
              // Clear the cell content first
              doc.setFillColor(255, 255, 255);
              doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
              
              // Redraw the border
              doc.setDrawColor(200, 200, 200);
              doc.setLineWidth(0.3);
              doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height);
              
              // Draw rupee symbol and amount
              doc.setTextColor(0, 0, 0);
              doc.setFontSize(10);
              doc.setFont(undefined, 'normal');
              
              const rupeeSymbol = 'Rs.';
              const amount = cellText;
              const fullText = `${rupeeSymbol} ${amount}`;
              
              // Calculate position for center alignment
              const textWidth = doc.getTextWidth(fullText);
              const xPos = data.cell.x + (data.cell.width - textWidth) / 2;
              const yPos = data.cell.y + data.cell.height / 2 + 3;
              
              doc.text(fullText, xPos, yPos);
            }
          } catch (error) {
            console.error('Error drawing rupee symbol:', error);
          }
        }
      },
      didDrawPage: (data) => {
        // Draw header on every page except the first
        if (data.pageNumber > 1) {
          drawHeader(data.pageNumber);
        }
      }
    });
    
    // Check if we're on the last page and have space for footer
    const finalY = doc.lastAutoTable.finalY;
    const pageHeight = doc.internal.pageSize.height;
    const footerHeight = 50; // Approximate height needed for footer
    
    // If not enough space on current page, add new page
    if (finalY + footerHeight > pageHeight - 20) {
      doc.addPage();
      drawHeader(doc.internal.getNumberOfPages());
    }
    
    // Footer sections
    let footerY = doc.lastAutoTable.finalY + 3;
    
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(10, footerY, 195, 9);
    
    doc.rect(10, footerY, 50, 9);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('GST  :', 11, footerY + 6);
    doc.setFont(undefined, 'normal');
    doc.text(`${quotationData.gst}%`, 24, footerY + 6);
    
    doc.rect(60, footerY, 95, 9);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text('Packing/Forwarding:', 61, footerY + 6);
    doc.setFont(undefined, 'normal');
    doc.text('ex works', 95, footerY + 6);
    
    doc.rect(155, footerY, 50, 9);
    
    footerY += 9;
    
    doc.rect(10, footerY, 195, 9);
    
    doc.rect(10, footerY, 50, 9);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text('Delivery  :', 11, footerY + 6);
    doc.setFont(undefined, 'normal');
    doc.text('7-15 days', 31, footerY + 6);
    
    doc.rect(60, footerY, 95, 9);
    
    doc.rect(155, footerY, 30, 9);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text('Payment:', 156, footerY + 6);
    
    doc.rect(185, footerY, 20, 9);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    doc.text('30 Days', 186, footerY + 6);
    
    footerY += 9;
    
    doc.rect(10, footerY, 195, 9);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text('Remarks  :', 11, footerY + 6);
    
    footerY += 9;
    
    doc.rect(10, footerY, 145, 22);
    doc.rect(155, footerY, 50, 22);
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(0, 0, 0);
    doc.text('N. B.: All quotations are subject to Market Fluctuations and Prior sale.', 11, footerY + 5);
    doc.text('Subject to Ahmedabad Jurisdiction.', 11, footerY + 10);
    doc.setFont(undefined, 'bold');
    doc.text('Validity 30 Days.', 75, footerY + 10);
    
    doc.setTextColor(255, 69, 0);
    doc.setFontSize(9);
    doc.text('Shreeraj Corporation GST NO. 24AEAPS1043P1ZF', 11, footerY + 16);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont(undefined, 'bold');
    doc.setFontSize(9);
    doc.text('For SHREERAJ CORPORATION', 156, footerY + 5);
    
    if (quotationData.includeSignature) {
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text('Vishal Shah', 165, footerY + 17);
    }
    
    // Add page numbers to all pages
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${totalPages}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
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
      productCount: quotationItems.length,
      products: quotationItems.map(item => ({
        name: (item.product.attributes || item.product).name,
        quantity: item.quantity
      })),
      createdAt: new Date().toISOString()
    };
    
    const savedQuotations = localStorage.getItem('quotations');
    const quotations = savedQuotations ? JSON.parse(savedQuotations) : [];
    quotations.unshift(quotationRecord);
    localStorage.setItem('quotations', JSON.stringify(quotations));
    
    // Reload quotations
    loadQuotations();
    
    setShowQuotationModal(false);
    setSelectedProducts([]);
    alert('Quotation generated successfully!');
  };

  const removeFromWishlist = (productId) => {
    const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
    const updated = wishlist.filter(id => id !== productId);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    
    setWishlistItems(prev => prev.filter(item => item.id !== productId));
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const updatedUser = { ...userInfo, ...profileData };
    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    setUserInfo(updatedUser);
    setEditProfile(false);
    alert('Profile updated successfully!');
  };

  const handleLogout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  const goToWebsite = () => {
    navigate('/');
  };

  // Client Management Functions
  const loadClients = () => {
    const savedClients = localStorage.getItem('clients');
    if (savedClients) {
      setClients(JSON.parse(savedClients));
    }
  };

  const openClientModal = (client = null) => {
    if (client) {
      setEditingClient(client);
      setClientData(client);
    } else {
      setEditingClient(null);
      setClientData({
        name: '',
        address: '',
        preferredCourier: '',
        gstNumber: '',
        panNumber: '',
        visitingCard: null,
        contactPersons: [
          {
            name: '',
            phones: [''],
            emails: ['']
          }
        ]
      });
    }
    setShowClientModal(true);
  };

  const closeClientModal = () => {
    setShowClientModal(false);
    setEditingClient(null);
  };

  const addContactPerson = () => {
    setClientData({
      ...clientData,
      contactPersons: [
        ...clientData.contactPersons,
        { name: '', phones: [''], emails: [''] }
      ]
    });
  };

  const removeContactPerson = (index) => {
    const updated = clientData.contactPersons.filter((_, i) => i !== index);
    setClientData({ ...clientData, contactPersons: updated });
  };

  const updateContactPerson = (index, field, value) => {
    const updated = [...clientData.contactPersons];
    updated[index][field] = value;
    setClientData({ ...clientData, contactPersons: updated });
  };

  const addPhone = (personIndex) => {
    const updated = [...clientData.contactPersons];
    updated[personIndex].phones.push('');
    setClientData({ ...clientData, contactPersons: updated });
  };

  const removePhone = (personIndex, phoneIndex) => {
    const updated = [...clientData.contactPersons];
    updated[personIndex].phones = updated[personIndex].phones.filter((_, i) => i !== phoneIndex);
    setClientData({ ...clientData, contactPersons: updated });
  };

  const updatePhone = (personIndex, phoneIndex, value) => {
    const updated = [...clientData.contactPersons];
    updated[personIndex].phones[phoneIndex] = value;
    setClientData({ ...clientData, contactPersons: updated });
  };

  const addEmail = (personIndex) => {
    const updated = [...clientData.contactPersons];
    updated[personIndex].emails.push('');
    setClientData({ ...clientData, contactPersons: updated });
  };

  const removeEmail = (personIndex, emailIndex) => {
    const updated = [...clientData.contactPersons];
    updated[personIndex].emails = updated[personIndex].emails.filter((_, i) => i !== emailIndex);
    setClientData({ ...clientData, contactPersons: updated });
  };

  const updateEmail = (personIndex, emailIndex, value) => {
    const updated = [...clientData.contactPersons];
    updated[personIndex].emails[emailIndex] = value;
    setClientData({ ...clientData, contactPersons: updated });
  };

  const handleVisitingCardUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 500KB)
      if (file.size > 500000) {
        alert('Image size should be less than 500KB. Please choose a smaller image.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress image by resizing
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 300;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to compressed base64
          const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
          setClientData({ ...clientData, visitingCard: compressedImage });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const saveClient = () => {
    if (!clientData.name.trim()) {
      alert('Please enter client name');
      return;
    }

    let updatedClients;
    if (editingClient) {
      updatedClients = clients.map(c => 
        c.id === editingClient.id ? { ...clientData, id: editingClient.id } : c
      );
    } else {
      const newClient = {
        ...clientData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      updatedClients = [...clients, newClient];
    }

    try {
      setClients(updatedClients);
      localStorage.setItem('clients', JSON.stringify(updatedClients));
      closeClientModal();
      alert(editingClient ? 'Client updated successfully!' : 'Client added successfully!');
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        alert('Storage limit exceeded. Please remove the visiting card image or delete some old clients.');
        // Revert the state change
        if (!editingClient) {
          setClients(clients);
        }
      } else {
        alert('Error saving client: ' + error.message);
      }
    }
  };

  const deleteClient = (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      const updated = clients.filter(c => c.id !== clientId);
      setClients(updated);
      localStorage.setItem('clients', JSON.stringify(updated));
    }
  };

  if (loading && activeTab === 'wishlist') {
    return (
      <div className="user-dashboard-page">
        <div className="dashboard-container">
          <div className="loading">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard-page">
      {/* Dashboard Header - No Navbar */}
      <div className="dashboard-top-bar">
        <div className="top-bar-left">
          <h2 className="dashboard-logo">SHREERAJ CORPORATION</h2>
          <span className="dashboard-subtitle">User Dashboard</span>
        </div>
        
        <div className="top-bar-right">
          <button className="btn-website" onClick={goToWebsite}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            Back to Website
          </button>
          
          <div className="user-info-top">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span>{userInfo?.username}</span>
          </div>
          
          <button className="btn-logout-top" onClick={handleLogout}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* Sidebar */}
          <div className="dashboard-sidebar">
            <nav className="sidebar-nav">
              <button 
                className={`nav-btn ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Products
              </button>

              <button 
                className={`nav-btn ${activeTab === 'clients' ? 'active' : ''}`}
                onClick={() => setActiveTab('clients')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
                Clients
              </button>

              <button 
                className={`nav-btn ${activeTab === 'quotations' ? 'active' : ''}`}
                onClick={() => setActiveTab('quotations')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Quotations
                {quotations.length > 0 && (
                  <span className="badge">{quotations.length}</span>
                )}
              </button>

              <button 
                className={`nav-btn ${activeTab === 'inquiry' ? 'active' : ''}`}
                onClick={() => setActiveTab('inquiry')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Inquiry
              </button>

              <button 
                className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                Profile
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="dashboard-main">
            {/* Products Tab */}
            {activeTab === 'products' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>Search & Select Products</h2>
                  {selectedProducts.length > 0 && (
                    <button 
                      className="btn-primary"
                      onClick={addSelectedToQuotation}
                    >
                      Add {selectedProducts.length} to Quotation
                    </button>
                  )}
                </div>

                <div className="search-section">
                  <div className="search-box">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search products by name, category, or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button className="clear-search" onClick={() => setSearchQuery('')}>×</button>
                    )}
                  </div>

                  <div className="filters-section">
                    <div className="filter-group">
                      <label>Filter by Category:</label>
                      <div className="category-filters">
                        <button 
                          className={`filter-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                          onClick={() => handleCategoryChange('all')}
                        >
                          All Products
                        </button>
                        {categories.map((category) => {
                          const categoryId = category._id || category.id;
                          const attrs = category.attributes || category;
                          return (
                            <button 
                              key={categoryId}
                              className={`filter-btn ${selectedCategory === categoryId ? 'active' : ''}`}
                              onClick={() => handleCategoryChange(categoryId)}
                            >
                              {attrs.name || category.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <p className="search-results-count">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                  </p>
                </div>

                {loading ? (
                  <div className="loading">Loading products...</div>
                ) : filteredProducts.length === 0 ? (
                  <div className="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <h3>No products found</h3>
                    <p>Try adjusting your search query</p>
                  </div>
                ) : (
                  <div className="products-grid">
                    {filteredProducts.map((product) => {
                      const attrs = product.attributes || product;
                      const imagesData = attrs.images?.data || attrs.images || [];
                      const imageUrl = imagesData.length > 0
                        ? (imagesData[0].attributes?.url || imagesData[0].url)
                        : null;
                      const fullImageUrl = getImageUrl(imageUrl) || 'https://via.placeholder.com/200';
                      const isSelected = selectedProducts.includes(product.id);

                      return (
                        <div key={product.id} className={`product-card ${isSelected ? 'selected' : ''}`}>
                          <div className="card-checkbox">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleProductSelection(product.id)}
                            />
                          </div>
                          <div className="card-image" onClick={() => navigate(`/product/${product.id}`)}>
                            <img src={fullImageUrl} alt={attrs.name} />
                          </div>
                          <div className="card-content">
                            <h3 onClick={() => navigate(`/product/${product.id}`)}>{attrs.name}</h3>
                            <p className="category">{attrs.category?.data?.attributes?.name || attrs.category?.name || 'Uncategorized'}</p>
                            <button 
                              className="btn-view"
                              onClick={() => navigate(`/product/${product.id}`)}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Clients Tab */}
            {activeTab === 'clients' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>My Clients</h2>
                  <button className="btn-primary" onClick={() => openClientModal()}>Add New Client</button>
                </div>

                {clients.length === 0 ? (
                  <div className="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <h3>No clients yet</h3>
                    <p>Add clients to manage your business relationships</p>
                    <button className="btn-primary" onClick={() => openClientModal()}>Add First Client</button>
                  </div>
                ) : (
                  <div className="clients-list">
                    {clients.map((client) => (
                      <div key={client.id} className="client-card">
                        <div className="client-header">
                          <h3>{client.name}</h3>
                          <div className="client-actions">
                            <button className="btn-edit" onClick={() => openClientModal(client)}>Edit</button>
                            <button className="btn-delete" onClick={() => deleteClient(client.id)}>Delete</button>
                          </div>
                        </div>
                        <div className="client-details">
                          <p><strong>Address:</strong> {client.address || 'N/A'}</p>
                          <p><strong>Preferred Courier:</strong> {client.preferredCourier || 'N/A'}</p>
                          <p><strong>GST:</strong> {client.gstNumber || 'N/A'}</p>
                          <p><strong>PAN:</strong> {client.panNumber || 'N/A'}</p>
                          <div className="contact-persons">
                            <strong>Contact Persons:</strong>
                            {client.contactPersons.map((person, idx) => (
                              <div key={idx} className="contact-person">
                                <p className="person-name">{person.name}</p>
                                <p>Phones: {person.phones.filter(p => p).join(', ') || 'N/A'}</p>
                                <p>Emails: {person.emails.filter(e => e).join(', ') || 'N/A'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Quotations Tab */}
            {activeTab === 'quotations' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>My Quotations</h2>
                  <button className="btn-primary" onClick={() => navigate('/quotation')}>
                    Create New Quotation
                  </button>
                </div>

                {quotations.length === 0 ? (
                  <div className="empty-state">
                    <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                    <h3>No quotations yet</h3>
                    <p>Create quotations from your wishlist items</p>
                    <button className="btn-primary" onClick={() => navigate('/quotation')}>
                      Create Quotation
                    </button>
                  </div>
                ) : (
                  <div className="quotations-list">
                    {quotations.map((quotation) => (
                      <div key={quotation.id} className="quotation-card">
                        <div className="quotation-header">
                          <div className="quotation-info">
                            <h3>{quotation.clientName}</h3>
                            <span className="quotation-number">#{quotation.quotationNumber}</span>
                          </div>
                          <span className="quotation-date">
                            {new Date(quotation.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="quotation-details">
                          <p><strong>Products:</strong> {quotation.productCount} items</p>
                          {quotation.clientAddress && (
                            <p><strong>Address:</strong> {quotation.clientAddress.substring(0, 60)}...</p>
                          )}
                          {quotation.clientEmail && (
                            <p><strong>Email:</strong> {quotation.clientEmail}</p>
                          )}
                          {quotation.clientPhone && (
                            <p><strong>Phone:</strong> {quotation.clientPhone}</p>
                          )}
                        </div>
                        <div className="quotation-footer">
                          <button className="btn-view-quotation">View Details</button>
                          <button className="btn-download-quotation">Download PDF</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Inquiry Tab */}
            {activeTab === 'inquiry' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>Inquiry History</h2>
                </div>

                <div className="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                  <h3>No inquiries sent</h3>
                  <p>Your inquiry history will appear here</p>
                </div>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="tab-content">
                <div className="tab-header">
                  <h2>My Profile</h2>
                  {!editProfile && (
                    <button 
                      className="btn-secondary"
                      onClick={() => setEditProfile(true)}
                    >
                      Edit Profile
                    </button>
                  )}
                </div>

                <div className="profile-content">
                  {editProfile ? (
                    <form className="profile-form" onSubmit={handleProfileUpdate}>
                      <div className="form-group">
                        <label>Username</label>
                        <input
                          type="text"
                          value={userInfo?.username || ''}
                          disabled
                          className="disabled-input"
                        />
                        <small>Username cannot be changed</small>
                      </div>

                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Company Name</label>
                        <input
                          type="text"
                          value={profileData.companyName}
                          onChange={(e) => setProfileData({...profileData, companyName: e.target.value})}
                          placeholder="Enter your company name"
                        />
                      </div>

                      <div className="form-group">
                        <label>Company Address</label>
                        <textarea
                          value={profileData.companyAddress}
                          onChange={(e) => setProfileData({...profileData, companyAddress: e.target.value})}
                          placeholder="Enter your company address"
                          rows="3"
                        />
                      </div>

                      <div className="form-group">
                        <label>Phone</label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          placeholder="Enter your phone number"
                        />
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="btn-primary">
                          Save Changes
                        </button>
                        <button 
                          type="button" 
                          className="btn-secondary"
                          onClick={() => setEditProfile(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="profile-view">
                      <div className="profile-item">
                        <label>Username</label>
                        <p>{userInfo?.username}</p>
                      </div>

                      <div className="profile-item">
                        <label>Email</label>
                        <p>{userInfo?.email}</p>
                      </div>

                      <div className="profile-item">
                        <label>Company Name</label>
                        <p>{userInfo?.companyName || 'Not provided'}</p>
                      </div>

                      <div className="profile-item">
                        <label>Company Address</label>
                        <p>{userInfo?.companyAddress || 'Not provided'}</p>
                      </div>

                      <div className="profile-item">
                        <label>Phone</label>
                        <p>{userInfo?.phone || 'Not provided'}</p>
                      </div>

                      <div className="profile-item">
                        <label>Account Type</label>
                        <p className="role-badge">{userInfo?.role || 'user'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quotation Modal */}
      {showQuotationModal && (
        <div className="modal-overlay" onClick={() => setShowQuotationModal(false)}>
          <div className="modal-content quotation-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Generate Quotation</h2>
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
                <h3>Selected Products & Pricing</h3>
                {quotationItems.map((item) => {
                  const attrs = item.product.attributes || item.product;
                  return (
                    <div key={item.id} className="quotation-product-row">
                      <div className="product-info-compact">
                        <span className="product-name">{attrs.name}</span>
                      </div>
                      <div className="product-controls">
                        <div className="qty-control-compact">
                          <label>Qty:</label>
                          <button onClick={() => updateQuotationQuantity(item.id, item.quantity - 1)}>-</button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuotationQuantity(item.id, parseInt(e.target.value) || 1)}
                            min="1"
                          />
                          <button onClick={() => updateQuotationQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>
                        <div className="price-input-compact">
                          <label>Price:</label>
                          <input
                            type="number"
                            value={productPrices[item.id] || ''}
                            onChange={(e) => setProductPrices({...productPrices, [item.id]: e.target.value})}
                            placeholder="₹"
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
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

      {/* Client Modal */}
      {showClientModal && (
        <div className="modal-overlay" onClick={closeClientModal}>
          <div className="modal-content client-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingClient ? 'Edit Client' : 'Add New Client'}</h2>
              <button className="modal-close" onClick={closeClientModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Client Name *</label>
                <input
                  type="text"
                  value={clientData.name}
                  onChange={(e) => setClientData({...clientData, name: e.target.value})}
                  placeholder="Enter client/company name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={clientData.address}
                  onChange={(e) => setClientData({...clientData, address: e.target.value})}
                  placeholder="Enter complete address"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Preferred Courier</label>
                  <input
                    type="text"
                    value={clientData.preferredCourier}
                    onChange={(e) => setClientData({...clientData, preferredCourier: e.target.value})}
                    placeholder="e.g., DHL, FedEx, Blue Dart"
                  />
                </div>

                <div className="form-group">
                  <label>GST Number</label>
                  <input
                    type="text"
                    value={clientData.gstNumber}
                    onChange={(e) => setClientData({...clientData, gstNumber: e.target.value})}
                    placeholder="Enter GST number"
                  />
                </div>

                <div className="form-group">
                  <label>PAN Number</label>
                  <input
                    type="text"
                    value={clientData.panNumber}
                    onChange={(e) => setClientData({...clientData, panNumber: e.target.value})}
                    placeholder="Enter PAN number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Visiting Card Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleVisitingCardUpload}
                />
                {clientData.visitingCard && (
                  <img src={clientData.visitingCard} alt="Visiting Card" className="visiting-card-preview" />
                )}
              </div>

              <div className="contact-persons-section">
                <div className="section-header">
                  <h3>Contact Persons</h3>
                  <button type="button" className="btn-add-small" onClick={addContactPerson}>+ Add Person</button>
                </div>

                {clientData.contactPersons.map((person, personIdx) => (
                  <div key={personIdx} className="contact-person-form">
                    <div className="person-header">
                      <h4>Contact Person {personIdx + 1}</h4>
                      {clientData.contactPersons.length > 1 && (
                        <button type="button" className="btn-remove-small" onClick={() => removeContactPerson(personIdx)}>Remove</button>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        value={person.name}
                        onChange={(e) => updateContactPerson(personIdx, 'name', e.target.value)}
                        placeholder="Contact person name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Phone Numbers</label>
                      {person.phones.map((phone, phoneIdx) => (
                        <div key={phoneIdx} className="input-with-action">
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => updatePhone(personIdx, phoneIdx, e.target.value)}
                            placeholder="Phone number"
                          />
                          {person.phones.length > 1 && (
                            <button type="button" className="btn-remove-inline" onClick={() => removePhone(personIdx, phoneIdx)}>×</button>
                          )}
                        </div>
                      ))}
                      <button type="button" className="btn-add-inline" onClick={() => addPhone(personIdx)}>+ Add Phone</button>
                    </div>

                    <div className="form-group">
                      <label>Email Addresses</label>
                      {person.emails.map((email, emailIdx) => (
                        <div key={emailIdx} className="input-with-action">
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => updateEmail(personIdx, emailIdx, e.target.value)}
                            placeholder="Email address"
                          />
                          {person.emails.length > 1 && (
                            <button type="button" className="btn-remove-inline" onClick={() => removeEmail(personIdx, emailIdx)}>×</button>
                          )}
                        </div>
                      ))}
                      <button type="button" className="btn-add-inline" onClick={() => addEmail(personIdx)}>+ Add Email</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-cancel" onClick={closeClientModal}>Cancel</button>
              <button className="btn-primary" onClick={saveClient}>
                {editingClient ? 'Update Client' : 'Save Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
