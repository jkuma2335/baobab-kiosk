const PromoCode = require('../models/PromoCode');

// @desc    Get all promo codes
// @route   GET /api/promo-codes
// @access  Private/Admin
const getPromoCodes = async (req, res) => {
  try {
    const promoCodes = await PromoCode.find({})
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: promoCodes.length,
      data: promoCodes
    });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching promo codes',
      error: error.message
    });
  }
};

// @desc    Get single promo code by code
// @route   GET /api/promo-codes/validate/:code
// @access  Public (for checkout)
const validatePromoCode = async (req, res) => {
  try {
    const { code } = req.params;
    const { totalAmount } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required'
      });
    }

    const promoCode = await PromoCode.findOne({ 
      code: code.toUpperCase().trim() 
    });

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    const total = parseFloat(totalAmount) || 0;
    const validation = promoCode.isValid(total);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.message,
        data: null
      });
    }

    const discount = promoCode.calculateDiscount(total);
    const finalAmount = total - discount;

    res.json({
      success: true,
      message: validation.message,
      data: {
        code: promoCode.code,
        description: promoCode.description,
        discountType: promoCode.discountType,
        discountValue: promoCode.discountValue,
        discount: discount,
        originalAmount: total,
        finalAmount: finalAmount
      }
    });
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating promo code',
      error: error.message
    });
  }
};

// @desc    Create a new promo code
// @route   POST /api/promo-codes
// @access  Private/Admin
const createPromoCode = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      isActive,
      applicableTo,
      categories
    } = req.body;

    // Validation
    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Promo code is required'
      });
    }

    if (!discountValue || discountValue <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Discount value must be greater than 0'
      });
    }

    if (discountType === 'percentage' && discountValue > 100) {
      return res.status(400).json({
        success: false,
        message: 'Percentage discount cannot exceed 100%'
      });
    }

    // Check if code already exists
    const existingCode = await PromoCode.findOne({ 
      code: code.toUpperCase().trim() 
    });
    
    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: 'Promo code already exists'
      });
    }

    const promoCode = await PromoCode.create({
      code: code.toUpperCase().trim(),
      description: description || '',
      discountType: discountType || 'percentage',
      discountValue,
      minPurchaseAmount: minPurchaseAmount || 0,
      maxDiscountAmount: maxDiscountAmount || null,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      usageLimit: usageLimit || null,
      isActive: isActive !== undefined ? isActive : true,
      applicableTo: applicableTo || 'all',
      categories: categories || []
    });

    res.status(201).json({
      success: true,
      data: promoCode
    });
  } catch (error) {
    console.error('Error creating promo code:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Promo code already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating promo code',
      error: error.message
    });
  }
};

// @desc    Update a promo code
// @route   PUT /api/promo-codes/:id
// @access  Private/Admin
const updatePromoCode = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      minPurchaseAmount,
      maxDiscountAmount,
      startDate,
      endDate,
      usageLimit,
      isActive,
      applicableTo,
      categories
    } = req.body;

    const promoCode = await PromoCode.findById(req.params.id);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    // Check if code already exists (if changed)
    if (code && code.toUpperCase().trim() !== promoCode.code) {
      const existingCode = await PromoCode.findOne({ 
        code: code.toUpperCase().trim() 
      });
      
      if (existingCode) {
        return res.status(400).json({
          success: false,
          message: 'Promo code already exists'
        });
      }
      promoCode.code = code.toUpperCase().trim();
    }

    // Validate discount value
    if (discountValue !== undefined) {
      if (discountValue <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Discount value must be greater than 0'
        });
      }
      
      if (discountType === 'percentage' && discountValue > 100) {
        return res.status(400).json({
          success: false,
          message: 'Percentage discount cannot exceed 100%'
        });
      }
      promoCode.discountValue = discountValue;
    }

    // Update fields
    if (description !== undefined) promoCode.description = description;
    if (discountType !== undefined) promoCode.discountType = discountType;
    if (minPurchaseAmount !== undefined) promoCode.minPurchaseAmount = minPurchaseAmount;
    if (maxDiscountAmount !== undefined) promoCode.maxDiscountAmount = maxDiscountAmount;
    if (startDate !== undefined) promoCode.startDate = startDate ? new Date(startDate) : new Date();
    if (endDate !== undefined) promoCode.endDate = endDate ? new Date(endDate) : null;
    if (usageLimit !== undefined) promoCode.usageLimit = usageLimit;
    if (isActive !== undefined) promoCode.isActive = isActive;
    if (applicableTo !== undefined) promoCode.applicableTo = applicableTo;
    if (categories !== undefined) promoCode.categories = categories;

    await promoCode.save();

    res.json({
      success: true,
      data: promoCode
    });
  } catch (error) {
    console.error('Error updating promo code:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Promo code already exists'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating promo code',
      error: error.message
    });
  }
};

// @desc    Delete a promo code
// @route   DELETE /api/promo-codes/:id
// @access  Private/Admin
const deletePromoCode = async (req, res) => {
  try {
    const promoCode = await PromoCode.findByIdAndDelete(req.params.id);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    res.json({
      success: true,
      message: 'Promo code deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid promo code ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error deleting promo code',
      error: error.message
    });
  }
};

// @desc    Increment usage count
// @route   PUT /api/promo-codes/:id/use
// @access  Public (called after successful order)
const incrementUsage = async (req, res) => {
  try {
    const promoCode = await PromoCode.findById(req.params.id);

    if (!promoCode) {
      return res.status(404).json({
        success: false,
        message: 'Promo code not found'
      });
    }

    promoCode.usedCount += 1;
    await promoCode.save();

    res.json({
      success: true,
      data: promoCode
    });
  } catch (error) {
    console.error('Error incrementing promo code usage:', error);
    res.status(500).json({
      success: false,
      message: 'Error incrementing usage',
      error: error.message
    });
  }
};

module.exports = {
  getPromoCodes,
  validatePromoCode,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  incrementUsage
};

