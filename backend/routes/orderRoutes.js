const express = require('express');
const router = express.Router();
const {
  addOrderItems,
  getOrders,
  getOrderById,
  getOrderByNumber,
  updateOrder,
  updateOrderStatus,
} = require('../controllers/orderController');

// GET /api/orders - Get all orders
router.get('/', getOrders);

// GET /api/orders/track/:orderNumber - Get order by order number (public tracking)
router.get('/track/:orderNumber', getOrderByNumber);

// GET /api/orders/:id - Get single order by ID
router.get('/:id', getOrderById);

// POST /api/orders - Create new order
router.post('/', addOrderItems);

// PUT /api/orders/:id - Update order (edit by customer)
router.put('/:id', updateOrder);

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', updateOrderStatus);

module.exports = router;

