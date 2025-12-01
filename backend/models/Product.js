const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  images: {
    type: [String],
    default: []
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  addToCartCount: {
    type: Number,
    default: 0
  },
  totalSold: {
    type: Number,
    default: 0
  },
  costPrice: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Virtual to get primary image (backward compatibility)
productSchema.virtual('primaryImage').get(function() {
  if (this.images && this.images.length > 0) {
    return this.images[0];
  }
  return this.image || '';
});

// Ensure virtuals are included in JSON output
productSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);

