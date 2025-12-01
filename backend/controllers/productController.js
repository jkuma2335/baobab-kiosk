const Product = require('../models/Product');

// @desc    Get all products (with optional keyword search and category filter)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { keyword, category } = req.query;
    
    // Build query object
    const query = {};
    
    // If keyword is provided, search by name (case-insensitive)
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }
    
    // If category is provided, filter by category
    if (category) {
      query.category = category;
    }
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Public (will add admin auth later)
const createProduct = async (req, res) => {
  try {
    const { name, category, price, unit, description, image, images, stock, featured } = req.body;
    
    // Validate required fields
    if (!name || !category || !price || !unit) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, category, price, and unit'
      });
    }
    
    // Handle images array (backward compatible with single image)
    let productImages = [];
    if (images && Array.isArray(images) && images.length > 0) {
      productImages = images;
    } else if (image) {
      productImages = [image];
    }
    
    // Primary image is first image in array (or single image field for backward compat)
    const primaryImage = productImages.length > 0 ? productImages[0] : image || '';
    
    const product = await Product.create({
      name,
      category,
      price,
      unit,
      description,
      image: primaryImage, // Keep for backward compatibility
      images: productImages, // New images array
      stock: stock || 0,
      featured: featured || false
    });
    
    res.status(201).json({
      success: true,
      data: product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Public (will add admin auth later)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Public (will add admin auth later)
const updateProduct = async (req, res) => {
  try {
    const { name, category, price, unit, description, image, images, stock, featured } = req.body;

    // Find product by ID
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update product fields (only update fields that are provided)
    if (name !== undefined) product.name = name;
    if (category !== undefined) product.category = category;
    if (price !== undefined) product.price = price;
    if (unit !== undefined) product.unit = unit;
    if (description !== undefined) product.description = description;
    if (stock !== undefined) product.stock = stock;
    if (featured !== undefined) product.featured = featured;
    
    // Handle images array
    if (images !== undefined) {
      if (Array.isArray(images) && images.length > 0) {
        product.images = images;
        // Update primary image to first image in array
        product.image = images[0];
      } else {
        product.images = [];
      }
    } else if (image !== undefined) {
      // Backward compatibility: if only image is provided, update both
      product.image = image;
      // If images array exists and image matches first, keep it; otherwise add/update
      if (product.images && product.images.length > 0 && product.images[0] === image) {
        // No change needed
      } else if (image) {
        product.images = [image];
      }
    }

    // Validate updated data
    if (product.name && !product.name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Product name cannot be empty'
      });
    }

    if (product.price !== undefined && product.price < 0) {
      return res.status(400).json({
        success: false,
        message: 'Price cannot be negative'
      });
    }

    if (product.stock !== undefined && product.stock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock cannot be negative'
      });
    }

    // Save the updated product
    const updatedProduct = await product.save();

    res.json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  deleteProduct,
  updateProduct
};

