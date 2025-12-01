const mongoose = require('mongoose');

const promoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    uppercase: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  minPurchaseAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maxDiscountAmount: {
    type: Number,
    default: null // null means no limit
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  usageLimit: {
    type: Number,
    default: null // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  applicableTo: {
    type: String,
    enum: ['all', 'specific'],
    default: 'all'
  },
  categories: [{
    type: String
  }]
}, {
  timestamps: true
});

// Index for faster lookups (code index is already created by unique: true)
promoCodeSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Method to check if promo code is valid
promoCodeSchema.methods.isValid = function(totalAmount = 0) {
  const now = new Date();
  
  // Check if active
  if (!this.isActive) {
    return { valid: false, message: 'This promo code is not active' };
  }
  
  // Check if not expired
  if (this.endDate && now > this.endDate) {
    return { valid: false, message: 'This promo code has expired' };
  }
  
  // Check if not started
  if (this.startDate && now < this.startDate) {
    return { valid: false, message: 'This promo code is not yet active' };
  }
  
  // Check usage limit
  if (this.usageLimit && this.usedCount >= this.usageLimit) {
    return { valid: false, message: 'This promo code has reached its usage limit' };
  }
  
  // Check minimum purchase amount
  if (totalAmount < this.minPurchaseAmount) {
    return { valid: false, message: `Minimum purchase amount is GHS ${this.minPurchaseAmount.toFixed(2)}` };
  }
  
  return { valid: true, message: 'Valid promo code' };
};

// Method to calculate discount
promoCodeSchema.methods.calculateDiscount = function(totalAmount) {
  let discount = 0;
  
  if (this.discountType === 'percentage') {
    discount = (totalAmount * this.discountValue) / 100;
    
    // Apply max discount if set
    if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
      discount = this.maxDiscountAmount;
    }
  } else if (this.discountType === 'fixed') {
    discount = this.discountValue;
    
    // Don't discount more than the total
    if (discount > totalAmount) {
      discount = totalAmount;
    }
  }
  
  return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

module.exports = mongoose.model('PromoCode', promoCodeSchema);

