const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAdvancedAnalytics,
  getCategoryDetails,
} = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

// GET /api/analytics - Get dashboard statistics (Protected, Admin only)
router.get('/', protect, admin, getDashboardStats);

// GET /api/analytics/advanced - Get advanced analytics (Protected, Admin only)
router.get('/advanced', protect, admin, getAdvancedAnalytics);

// GET /api/analytics/category/:categoryName - Get category details (Protected, Admin only)
router.get('/category/:categoryName', protect, admin, getCategoryDetails);

module.exports = router;

