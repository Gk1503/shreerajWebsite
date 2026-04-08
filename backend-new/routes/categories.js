const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');
const { auth, adminAuth } = require('../middleware/auth');

// Get all categories (public)
router.get('/', async (req, res) => {
  try {
    const populate = req.query.populate;
    let query = Category.find({ status: 'published' });

    if (populate && populate.includes('products')) {
      const categories = await query;
      const categoriesWithProducts = await Promise.all(
        categories.map(async (category) => {
          const products = await Product.find({ 
            category: category._id, 
            status: 'published' 
          }).select('name slug images');
          
          return {
            id: category._id,
            name: category.name,
            slug: category.slug,
            description: category.description,
            products: products.map(p => ({
              id: p._id,
              name: p.name,
              slug: p.slug,
              images: p.images
            }))
          };
        })
      );
      return res.json({ data: categoriesWithProducts });
    }

    const categories = await query;
    res.json({ 
      data: categories.map(cat => ({
        id: cat._id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single category (public)
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ data: category });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create category (protected)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const category = new Category({ name, description, status });
    await category.save();
    res.status(201).json({ data: category });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update category (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, status },
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    res.json({ data: category });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete category (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
