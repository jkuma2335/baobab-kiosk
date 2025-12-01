const express = require('express');
const router = express.Router();
const {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  seedInitialCategories
} = require('../controllers/categoryController');

// GET /api/categories - Get all categories
router.get('/', getCategories);

// GET /api/categories/seed - Seed categories from existing products
router.post('/seed', seedInitialCategories);

// GET /api/categories/:id - Get single category by ID
router.get('/:id', getCategoryById);

// POST /api/categories - Create a new category
router.post('/', createCategory);

// PUT /api/categories/:id - Update a category
router.put('/:id', updateCategory);

// DELETE /api/categories/:id - Delete a category
router.delete('/:id', deleteCategory);

module.exports = router;

