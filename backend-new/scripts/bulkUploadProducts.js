const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const Category = require('../models/Category');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

/**
 * Bulk upload products from a folder structure
 * 
 * Expected folder structure:
 * products/
 *   ├── category1/
 *   │   ├── product1.jpg
 *   │   ├── product2.jpg
 *   ├── category2/
 *   │   ├── product3.jpg
 * 
 * OR from a CSV file:
 * products.csv with columns: name, category, image_path, description
 */

async function bulkUploadFromFolder(folderPath) {
  try {
    const categories = fs.readdirSync(folderPath);
    
    for (const categoryName of categories) {
      const categoryPath = path.join(folderPath, categoryName);
      
      if (!fs.statSync(categoryPath).isDirectory()) continue;
      
      // Find or create category
      let category = await Category.findOne({ name: categoryName });
      if (!category) {
        category = await Category.create({
          name: categoryName,
          description: `${categoryName} products`,
          status: 'published'
        });
        console.log(`Created category: ${categoryName}`);
      }
      
      // Get all images in category folder
      const files = fs.readdirSync(categoryPath);
      const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
      
      console.log(`Found ${imageFiles.length} images in ${categoryName}`);
      
      for (const imageFile of imageFiles) {
        const imagePath = path.join(categoryPath, imageFile);
        const productName = path.parse(imageFile).name.replace(/[-_]/g, ' ');
        
        // Copy image to uploads folder
        const uploadPath = path.join(__dirname, '../uploads', imageFile);
        fs.copyFileSync(imagePath, uploadPath);
        
        // Create product
        const product = await Product.create({
          name: productName,
          description: `High-quality ${productName}`,
          category: category._id,
          images: [{
            url: `/uploads/${imageFile}`,
            filename: imageFile
          }],
          status: 'published'
        });
        
        console.log(`Created product: ${productName}`);
      }
    }
    
    console.log('Bulk upload completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

async function bulkUploadFromCSV(csvPath) {
  try {
    const csv = fs.readFileSync(csvPath, 'utf-8');
    const lines = csv.split('\n').slice(1); // Skip header
    
    for (const line of lines) {
      if (!line.trim()) continue;
      
      const [name, categoryName, imagePath, description] = line.split(',').map(s => s.trim());
      
      // Find or create category
      let category = await Category.findOne({ name: categoryName });
      if (!category) {
        category = await Category.create({
          name: categoryName,
          description: `${categoryName} products`,
          status: 'published'
        });
      }
      
      // Copy image to uploads folder
      const imageFile = path.basename(imagePath);
      const uploadPath = path.join(__dirname, '../uploads', imageFile);
      
      if (fs.existsSync(imagePath)) {
        fs.copyFileSync(imagePath, uploadPath);
      }
      
      // Create product
      await Product.create({
        name,
        description: description || `High-quality ${name}`,
        category: category._id,
        images: [{
          url: `/uploads/${imageFile}`,
          filename: imageFile
        }],
        status: 'published'
      });
      
      console.log(`Created product: ${name}`);
    }
    
    console.log('CSV import completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Usage
const args = process.argv.slice(2);
const mode = args[0]; // 'folder' or 'csv'
const sourcePath = args[1];

if (!mode || !sourcePath) {
  console.log('Usage:');
  console.log('  node bulkUploadProducts.js folder /path/to/products/folder');
  console.log('  node bulkUploadProducts.js csv /path/to/products.csv');
  process.exit(1);
}

if (mode === 'folder') {
  bulkUploadFromFolder(sourcePath);
} else if (mode === 'csv') {
  bulkUploadFromCSV(sourcePath);
} else {
  console.log('Invalid mode. Use "folder" or "csv"');
  process.exit(1);
}
