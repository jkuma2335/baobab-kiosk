const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dealType: {
    type: String,
    required: true,
    enum: ['bundle', 'mix', 'seasonal', 'flash'],
    default: 'bundle'
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discountedPrice: {
    type: Number,
    required: true,
    min: 0
  },
  savingsPercentage: {
    type: Number,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['hot', 'popular', 'new'],
    default: 'popular'
  },
  badgeText: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  // Optional: Link to specific products if needed
  productIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true
});

// Calculate savings percentage before saving
dealSchema.pre('save', function(next) {
  if (this.originalPrice > 0 && this.discountedPrice < this.originalPrice) {
    this.savingsPercentage = Math.round(
      ((this.originalPrice - this.discountedPrice) / this.originalPrice) * 100
    );
  }
  next();
});

module.exports = mongoose.model('Deal', dealSchema);

