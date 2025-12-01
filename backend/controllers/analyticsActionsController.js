const Product = require('../models/Product');

// @desc    Record a product view
// @route   PUT /api/products/:id/view
// @access  Public
const recordView = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'View recorded',
      data: { views: product.views },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error recording view',
      error: error.message,
    });
  }
};

// @desc    Record an add to cart action
// @route   PUT /api/products/:id/add-to-cart
// @access  Public
const recordAddToCart = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndUpdate(
      id,
      { $inc: { addToCartCount: 1 } },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Add to cart recorded',
      data: { addToCartCount: product.addToCartCount },
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error recording add to cart',
      error: error.message,
    });
  }
};

module.exports = {
  recordView,
  recordAddToCart,
};

