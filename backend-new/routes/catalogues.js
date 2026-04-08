const express = require('express');
const router = express.Router();
const Catalogue = require('../models/Catalogue');
const { auth, adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Get all catalogues (public)
router.get('/', async (req, res) => {
  try {
    const catalogues = await Catalogue.find({ status: 'published' }).populate('category', 'name');
    
    res.json({ 
      data: catalogues.map(c => ({
        id: c._id,
        name: c.name,
        description: c.description,
        thumbnail: c.thumbnail,
        viewPdf: c.viewPdf,
        downloadPdf: c.downloadPdf,
        category: c.category,
        pages: c.pages,
        fileSize: c.fileSize
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single catalogue (public)
router.get('/:id', async (req, res) => {
  try {
    const catalogue = await Catalogue.findById(req.params.id).populate('category', 'name');
    
    if (!catalogue) {
      return res.status(404).json({ message: 'Catalogue not found' });
    }
    
    res.json({ data: catalogue });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create catalogue (protected)
router.post('/', auth, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'viewPdf', maxCount: 1 },
  { name: 'downloadPdf', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Request body:', req.body);
    console.log('Request files:', req.files);
    
    const { name, description, category, pages, fileSize, status } = req.body;
    
    const catalogueData = { name, description, category, pages, fileSize, status };
    
    if (req.files && req.files.thumbnail) {
      catalogueData.thumbnail = {
        url: `/uploads/${req.files.thumbnail[0].filename}`,
        filename: req.files.thumbnail[0].filename
      };
    }
    
    if (req.files && req.files.viewPdf) {
      catalogueData.viewPdf = {
        url: `/uploads/${req.files.viewPdf[0].filename}`,
        filename: req.files.viewPdf[0].filename
      };
    }
    
    if (req.files && req.files.downloadPdf) {
      catalogueData.downloadPdf = {
        url: `/uploads/${req.files.downloadPdf[0].filename}`,
        filename: req.files.downloadPdf[0].filename
      };
    }
    
    const catalogue = new Catalogue(catalogueData);
    await catalogue.save();
    
    if (category) {
      await catalogue.populate('category', 'name');
    }
    
    res.status(201).json({ data: catalogue });
  } catch (error) {
    console.error('Error creating catalogue:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update catalogue (protected)
router.put('/:id', auth, upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'viewPdf', maxCount: 1 },
  { name: 'downloadPdf', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, description, category, pages, fileSize, status } = req.body;
    
    const updateData = { name, description, category, pages, fileSize, status };
    
    if (req.files.thumbnail) {
      updateData.thumbnail = {
        url: `/uploads/${req.files.thumbnail[0].filename}`,
        filename: req.files.thumbnail[0].filename
      };
    }
    
    if (req.files.viewPdf) {
      updateData.viewPdf = {
        url: `/uploads/${req.files.viewPdf[0].filename}`,
        filename: req.files.viewPdf[0].filename
      };
    }
    
    if (req.files.downloadPdf) {
      updateData.downloadPdf = {
        url: `/uploads/${req.files.downloadPdf[0].filename}`,
        filename: req.files.downloadPdf[0].filename
      };
    }
    
    const catalogue = await Catalogue.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('category', 'name');
    
    if (!catalogue) {
      return res.status(404).json({ message: 'Catalogue not found' });
    }
    
    res.json({ data: catalogue });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete catalogue (admin only)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const catalogue = await Catalogue.findByIdAndDelete(req.params.id);
    if (!catalogue) {
      return res.status(404).json({ message: 'Catalogue not found' });
    }
    res.json({ message: 'Catalogue deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
