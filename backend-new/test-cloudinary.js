/**
 * Test Cloudinary Connection
 * 
 * Run this script to verify your Cloudinary credentials are working
 * 
 * Usage: node test-cloudinary.js
 */

require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('\n🔍 Testing Cloudinary Connection...\n');

// Check if credentials are set
if (!process.env.CLOUDINARY_CLOUD_NAME || 
    process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name_here') {
  console.log('❌ CLOUDINARY_CLOUD_NAME not set in .env file');
  console.log('   Please add your Cloudinary credentials to backend-new/.env\n');
  process.exit(1);
}

if (!process.env.CLOUDINARY_API_KEY || 
    process.env.CLOUDINARY_API_KEY === 'your_api_key_here') {
  console.log('❌ CLOUDINARY_API_KEY not set in .env file');
  console.log('   Please add your Cloudinary credentials to backend-new/.env\n');
  process.exit(1);
}

if (!process.env.CLOUDINARY_API_SECRET || 
    process.env.CLOUDINARY_API_SECRET === 'your_api_secret_here') {
  console.log('❌ CLOUDINARY_API_SECRET not set in .env file');
  console.log('   Please add your Cloudinary credentials to backend-new/.env\n');
  process.exit(1);
}

console.log('✅ Credentials found in .env file');
console.log(`   Cloud Name: ${process.env.CLOUDINARY_CLOUD_NAME}`);
console.log(`   API Key: ${process.env.CLOUDINARY_API_KEY.substring(0, 5)}...`);
console.log(`   API Secret: ${process.env.CLOUDINARY_API_SECRET.substring(0, 5)}...\n`);

// Test API connection
cloudinary.api.ping()
  .then(result => {
    console.log('✅ Cloudinary connection successful!');
    console.log('   Status:', result.status);
    console.log('\n🎉 You can now use bulk upload!\n');
    
    // Get account details
    return cloudinary.api.usage();
  })
  .then(usage => {
    console.log('📊 Account Usage:');
    console.log(`   Storage: ${(usage.storage.usage / 1024 / 1024).toFixed(2)} MB used`);
    console.log(`   Bandwidth: ${(usage.bandwidth.usage / 1024 / 1024).toFixed(2)} MB used this month`);
    console.log(`   Resources: ${usage.resources} files\n`);
    
    console.log('✨ Everything is ready for bulk upload!');
    console.log('   Go to: http://localhost:3000/admin/dashboard');
    console.log('   Click: 📤 Bulk Upload tab\n');
  })
  .catch(error => {
    console.log('❌ Cloudinary connection failed!');
    console.log('   Error:', error.message || error);
    console.log('   Full error:', error);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your credentials are correct');
    console.log('   2. Make sure you copied all 3 values from Cloudinary dashboard');
    console.log('   3. No extra spaces in .env file');
    console.log('   4. Restart backend after updating .env\n');
    console.log('   Get credentials from: https://cloudinary.com/console\n');
  });
