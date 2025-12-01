const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
  updateProduct
} = require('../controllers/productController');
const {
  recordView,
  recordAddToCart
} = require('../controllers/analyticsActionsController');

// GET /api/products - Get all products (with optional keyword and category filters)
router.get('/', getProducts);

// POST /api/products - Create a new product
router.post('/', createProduct);

// GET /api/products/:id - Get single product by ID
router.get('/:id', getProductById);

// PUT /api/products/:id/view - Record product view
router.put('/:id/view', recordView);

// PUT /api/products/:id/add-to-cart - Record add to cart action
router.put('/:id/add-to-cart', recordAddToCart);

// PUT /api/products/:id - Update a product
router.put('/:id', updateProduct);

// DELETE /api/products/:id - Delete a product
router.delete('/:id', deleteProduct);

module.exports = router;

