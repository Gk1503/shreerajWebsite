const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const path = require('path');

// Bulk upload products from multiple images
router.post('/', auth, upload.array('images', 100), async (req, res) => {
  try {
    const { category } = req.body;
    
    console.log('Received category:', category);
    console.log('Category type:', typeof category);
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    
    if (!category) {
      return res.status(400).json({ message: 'Category is required' });
    }
    
    const createdProducts = [];
    const failedProducts = [];
    
    for (const file of req.files) {
      try {
        // Extract product name from filename (remove extension)
        const productName = path.parse(file.originalname).name
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize words
        
        // Create product
        const product = new Product({
          name: productName,
          description: `High-quality ${productName}`,
          category: category,
          images: [{
            url: file.path, // Cloudinary URL
            filename: file.filename
          }],
          status: 'published'
        });
        
        await product.save();
        createdProducts.push(product);
      } catch (error) {
        console.error(`Failed to create product from ${file.originalname}:`, error.message);
        failedProducts.push({
          filename: file.originalname,
          error: error.message
        });
      }
    }
    
    const response = {
      message: `Successfully created ${createdProducts.length} products`,
      data: createdProducts,
      total: req.files.length,
      success: createdProducts.length,
      failed: failedProducts.length
    };
    
    if (failedProducts.length > 0) {
      response.failedProducts = failedProducts;
      response.message += `, ${failedProducts.length} failed`;
    }
    
    res.status(201).json(response);
  } catch (error) {
    console.error('Bulk upload error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
