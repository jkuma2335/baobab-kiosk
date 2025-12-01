const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  items: {
    type: [orderItemSchema],
    required: true
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  originalAmount: {
    type: Number,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  promoCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  deliveryType: {
    type: String,
    required: true,
    enum: ['delivery', 'pickup'],
    default: 'delivery'
  },
  address: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  customerName: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);

