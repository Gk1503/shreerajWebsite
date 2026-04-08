const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { status: 'published' };
    
    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter).populate('category', 'name slug');
    
    res.json({ 
      data: products.map(p => ({
        id: p._id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        images: p.images,
        category: p.category,
        specifications: Object.fromEntries(p.specifications)
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ 
      data: {
        id: product._id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        images: product.images,
        category: product.category,
        specifications: Object.fromEntries(product.specifications)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create product (protected)
router.post('/', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, category, specifications, status } = req.body;
    
    const images = req.files ? req.files.map(file => ({
      url: file.path, // Cloudinary URL
      filename: file.filename
    })) : [];

    const product = new Product({
      name,
      description,
      category,
      images,
      specifications: specifications ? JSON.parse(specifications) : {},
      status
    });
    
    await product.save();
    await product.populate('category', 'name slug');
    
    res.status(201).json({ data: product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update product (protected)
router.put('/:id', auth, upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, category, specifications, status } = req.body;
    
    const updateData = { name, description, category, status };
    
    if (req.files && req.files.length > 0) {
      updateData.images = req.files.map(file => ({
        url: file.path, // Cloudinary URL
        filename: file.filename
      }));
    }
    
    if (specifications) {
      updateData.specifications = JSON.parse(specifications);
    }
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json({ data: product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete product (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
