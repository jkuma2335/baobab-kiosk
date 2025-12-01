const express = require('express');
const router = express.Router();
const {
  getPromoCodes,
  validatePromoCode,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  incrementUsage
} = require('../controllers/promoCodeController');
// const { protect, admin } = require('../middleware/authMiddleware');

// GET /api/promo-codes - Get all promo codes (admin)
router.get('/', getPromoCodes);

// GET /api/promo-codes/validate/:code - Validate and get discount (public)
router.get('/validate/:code', validatePromoCode);

// POST /api/promo-codes - Create new promo code (admin)
router.post('/', createPromoCode);

// PUT /api/promo-codes/:id - Update promo code (admin)
router.put('/:id', updatePromoCode);

// DELETE /api/promo-codes/:id - Delete promo code (admin)
router.delete('/:id', deletePromoCode);

// PUT /api/promo-codes/:id/use - Increment usage count (public)
router.put('/:id/use', incrementUsage);

module.exports = router;

