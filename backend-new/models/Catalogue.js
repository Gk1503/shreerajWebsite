const mongoose = require('mongoose');

const catalogueSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  thumbnail: {
    url: String,
    filename: String
  },
  viewPdf: {
    url: String,
    filename: String
  },
  downloadPdf: {
    url: String,
    filename: String
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  pages: {
    type: Number,
    default: 0
  },
  fileSize: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['published', 'draft'],
    default: 'published'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Catalogue', catalogueSchema);
