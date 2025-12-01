const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Create a new category
// @route   POST /api/categories
// @access  Public (will add admin auth later)
const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ 
      name: name.trim() 
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || '',
      image: image?.trim() || ''
    });

    res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    
    // Handle duplicate key error (unique constraint)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name or slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
};

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({})
      .sort({ name: 1 }) // Sort alphabetically by name
      .select('-__v');

    res.json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// @desc    Get single category by ID
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Public (will add admin auth later)
const updateCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const updateData = {};
    if (name) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (image !== undefined) updateData.image = image.trim();

    // Check if updating name and it conflicts with existing category
    if (name) {
      const existingCategory = await Category.findOne({ 
        name: name.trim(),
        _id: { $ne: req.params.id } // Exclude current category
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name or slug already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Public (will add admin auth later)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if any products are using this category
    const productsWithCategory = await Product.countDocuments({
      category: category.name
    });

    if (productsWithCategory > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${productsWithCategory} product(s) are using this category. Please update or remove those products first.`
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully',
      data: {}
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};

// @desc    Seed initial categories from existing products
// @route   POST /api/categories/seed
// @access  Public (will add admin auth later)
const seedInitialCategories = async (req, res) => {
  try {
    // Get all unique category names from existing products
    const products = await Product.find({}).select('category');
    const uniqueCategories = [...new Set(products.map(p => p.category).filter(Boolean))];

    if (uniqueCategories.length === 0) {
      return res.json({
        success: true,
        message: 'No categories found in existing products',
        data: {
          created: 0,
          skipped: 0,
          categories: []
        }
      });
    }

    const results = {
      created: 0,
      skipped: 0,
      categories: []
    };

    // Create Category entries for each unique category name
    for (const categoryName of uniqueCategories) {
      // Check if category already exists
      const existingCategory = await Category.findOne({ name: categoryName });

      if (existingCategory) {
        results.skipped++;
        results.categories.push({
          name: categoryName,
          status: 'skipped',
          reason: 'Already exists'
        });
        continue;
      }

      try {
        const newCategory = await Category.create({
          name: categoryName,
          description: `${categoryName} products`,
          image: ''
        });

        results.created++;
        results.categories.push({
          name: categoryName,
          slug: newCategory.slug,
          status: 'created',
          id: newCategory._id
        });
      } catch (error) {
        console.error(`Error creating category "${categoryName}":`, error);
        results.skipped++;
        results.categories.push({
          name: categoryName,
          status: 'error',
          reason: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Seeding completed. Created: ${results.created}, Skipped: ${results.skipped}`,
      data: results
    });
  } catch (error) {
    console.error('Error seeding categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding categories',
      error: error.message
    });
  }
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  seedInitialCategories
};

