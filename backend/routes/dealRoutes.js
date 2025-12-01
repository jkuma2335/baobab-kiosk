const express = require('express');
const router = express.Router();
const {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal
} = require('../controllers/dealController');
// const { protect, admin } = require('../middleware/authMiddleware');

// GET /api/deals - Get all deals (public for homepage)
router.get('/', getDeals);

// GET /api/deals/:id - Get single deal
router.get('/:id', getDealById);

// POST /api/deals - Create new deal (admin only)
router.post('/', createDeal);

// PUT /api/deals/:id - Update deal (admin only)
router.put('/:id', updateDeal);

// DELETE /api/deals/:id - Delete deal (admin only)
router.delete('/:id', deleteDeal);

module.exports = router;

