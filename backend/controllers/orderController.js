const mongoose = require('mongoose');
const Order = require('../models/Order');

// Generate order number in format: ORD-YYYYMMDD-XXXX
const generateOrderNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4 random digits
  return `ORD-${year}${month}${day}-${randomDigits}`;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const addOrderItems = async (req, res) => {
  try {
    const { userId, items, totalAmount, deliveryType, phone, address, customerName } =
      req.body;

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item',
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Total amount is required and must be greater than 0',
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required',
      });
    }

    if (deliveryType === 'delivery' && !address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required for delivery orders',
      });
    }

    // Generate unique order number
    let orderNumber;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      orderNumber = generateOrderNumber();
      const existingOrder = await Order.findOne({ orderNumber });
      if (!existingOrder) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate unique order number. Please try again.',
      });
    }

    // Create order
    const order = await Order.create({
      orderNumber,
      userId: userId || 'guest',
      items,
      totalAmount,
      originalAmount: req.body.originalAmount || totalAmount,
      discountAmount: req.body.discountAmount || 0,
      promoCode: req.body.promoCode || null,
      deliveryType,
      phone,
      customerName: customerName.trim(),
      address: deliveryType === 'delivery' ? address : '',
      status: 'pending',
      paymentStatus: 'pending',
    });

    // Increment promo code usage if applied
    if (req.body.promoCode) {
      try {
        const PromoCode = require('../models/PromoCode');
        const promoCode = await PromoCode.findOne({ code: req.body.promoCode.toUpperCase() });
        if (promoCode) {
          promoCode.usedCount += 1;
          await promoCode.save();
        }
      } catch (err) {
        console.error('Error incrementing promo code usage:', err);
        // Don't fail the order if promo code update fails
      }
    }

    // Update totalSold for each product in the order
    const Product = require('../models/Product');
    for (const item of items) {
      try {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { totalSold: item.quantity } },
          { new: true }
        );
      } catch (err) {
        console.error(`Error updating totalSold for product ${item.productId}:`, err);
        // Continue processing other products even if one fails
      }
    }

    // Log the saved order to verify customerName is saved
    console.log('Order created with customerName:', order.customerName);
    
    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message,
    });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Public (will add admin auth later)
const getOrders = async (req, res) => {
  try {
    // Fetch orders with populated product info
    // Note: userId populate will only work if userId is an ObjectId
    // For guest orders (string userId), it will remain as is
    const orders = await Order.find({})
      .populate({
        path: 'items.productId',
        select: 'name category unit image',
      })
      .sort({ createdAt: -1 }); // Sort by newest first

    // Manually populate userId for orders where it's an ObjectId
    const User = require('../models/User');
    const ordersWithUsers = await Promise.all(
      orders.map(async (order) => {
        const orderObj = order.toObject();
        
        // Check if userId is an ObjectId and try to populate
        if (
          order.userId &&
          typeof order.userId === 'object' &&
          order.userId.toString &&
          mongoose.Types.ObjectId.isValid(order.userId)
        ) {
          try {
            const user = await User.findById(order.userId).select(
              'name email phone'
            );
            if (user) {
              orderObj.userId = user;
            }
          } catch (err) {
            // If populate fails, keep original userId
          }
        }
        return orderObj;
      })
    );

    res.json({
      success: true,
      count: ordersWithUsers.length,
      data: ordersWithUsers,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message,
    });
  }
};

// @desc    Get single order by ID
// @route   GET /api/orders/:id
// @access  Public (will add admin auth later)
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id).populate({
      path: 'items.productId',
      select: 'name category unit image',
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const orderObj = order.toObject();

    // Manually populate userId if it's an ObjectId
    if (
      order.userId &&
      typeof order.userId === 'object' &&
      order.userId.toString &&
      mongoose.Types.ObjectId.isValid(order.userId)
    ) {
      try {
        const User = require('../models/User');
        const user = await User.findById(order.userId).select(
          'name email phone'
        );
        if (user) {
          orderObj.userId = user;
        }
      } catch (err) {
        // If populate fails, keep original userId
      }
    }

    res.json({
      success: true,
      data: orderObj,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message,
    });
  }
};

// @desc    Get order by order number
// @route   GET /api/orders/track/:orderNumber
// @access  Public
const getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    if (!orderNumber) {
      return res.status(400).json({
        success: false,
        message: 'Order number is required',
      });
    }

    const order = await Order.findOne({ orderNumber }).populate({
      path: 'items.productId',
      select: 'name category unit image',
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found. Please check your order number.',
      });
    }

    const orderObj = order.toObject();

    // Manually populate userId if it's an ObjectId
    if (
      order.userId &&
      typeof order.userId === 'object' &&
      order.userId.toString &&
      mongoose.Types.ObjectId.isValid(order.userId)
    ) {
      try {
        const User = require('../models/User');
        const user = await User.findById(order.userId).select(
          'name email phone'
        );
        if (user) {
          orderObj.userId = user;
        }
      } catch (err) {
        // If populate fails, keep original userId
      }
    }

    res.json({
      success: true,
      data: orderObj,
    });
  } catch (error) {
    console.error('Error fetching order by number:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message,
    });
  }
};

// @desc    Update order (edit by customer)
// @route   PUT /api/orders/:id
// @access  Public (customer can edit their own pending orders)
const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      items,
      deliveryType,
      phone,
      address,
      customerName,
      promoCode,
    } = req.body;

    // Find the order
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Only allow editing if order is still pending
    if (order.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Order can only be edited while it is pending. Please contact support if you need to make changes.',
      });
    }

    // Validation
    if (items && (!Array.isArray(items) || items.length === 0)) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item',
      });
    }

    if (deliveryType === 'delivery' && !address) {
      return res.status(400).json({
        success: false,
        message: 'Address is required for delivery orders',
      });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Phone number is required',
      });
    }

    if (!customerName || !customerName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required',
      });
    }

    // If items are being updated, recalculate totals
    let totalAmount = order.totalAmount;
    let originalAmount = order.originalAmount;
    let discountAmount = order.discountAmount;

    if (items) {
      // Calculate new original amount
      originalAmount = items.reduce((sum, item) => {
        return sum + (item.price * item.quantity);
      }, 0);

      // Recalculate promo code discount if promo code is provided or exists
      if (promoCode !== undefined) {
        if (promoCode) {
          try {
            const PromoCode = require('../models/PromoCode');
            const promo = await PromoCode.findOne({ code: promoCode.toUpperCase().trim() });
            
            if (promo && promo.isActive) {
              const validation = promo.isValid(originalAmount);
              if (validation.valid) {
                discountAmount = promo.calculateDiscount(originalAmount);
              } else {
                discountAmount = 0;
              }
            } else {
              discountAmount = 0;
            }
          } catch (err) {
            console.error('Error validating promo code:', err);
            discountAmount = 0;
          }
        } else {
          discountAmount = 0;
        }
      } else if (order.promoCode) {
        // Keep existing promo code if not explicitly changed
        try {
          const PromoCode = require('../models/PromoCode');
          const promo = await PromoCode.findOne({ code: order.promoCode.toUpperCase().trim() });
          
          if (promo && promo.isActive) {
            const validation = promo.isValid(originalAmount);
            if (validation.valid) {
              discountAmount = promo.calculateDiscount(originalAmount);
            } else {
              discountAmount = 0;
            }
          } else {
            discountAmount = 0;
          }
        } catch (err) {
          console.error('Error validating promo code:', err);
          discountAmount = 0;
        }
      }

      totalAmount = Math.max(0, originalAmount - discountAmount);
    }

    // Update order fields
    const updateData = {
      ...(items && { items }),
      ...(deliveryType && { deliveryType }),
      ...(phone && { phone: phone.trim() }),
      ...(address !== undefined && { address: deliveryType === 'delivery' ? address.trim() : '' }),
      ...(customerName && { customerName: customerName.trim() }),
      ...(items && { totalAmount, originalAmount, discountAmount }),
      ...(promoCode !== undefined && { promoCode: promoCode ? promoCode.toUpperCase().trim() : null }),
    };

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: 'items.productId',
      select: 'name category unit image',
    });

    res.json({
      success: true,
      message: 'Order updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    console.error('Error updating order:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating order',
      error: error.message,
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Public (will add admin auth later)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validation
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    // Validate status value
    const validStatuses = [
      'pending',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    // Find and update order
    const order = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message,
    });
  }
};

module.exports = {
  addOrderItems,
  getOrders,
  getOrderById,
  getOrderByNumber,
  updateOrder,
  updateOrderStatus,
};

