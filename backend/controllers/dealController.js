const Deal = require('../models/Deal');

// @desc    Get all deals
// @route   GET /api/deals
// @access  Public (for homepage display)
const getDeals = async (req, res) => {
  try {
    const { active } = req.query;
    
    let query = {};
    if (active === 'true') {
      query.isActive = true;
      // Also filter by date if endDate is set
      query.$or = [
        { endDate: { $exists: false } },
        { endDate: null },
        { endDate: { $gte: new Date() } }
      ];
    }

    const deals = await Deal.find(query)
      .populate('productIds', 'name image price')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: deals.length,
      data: deals
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching deals',
      error: error.message
    });
  }
};

// @desc    Get single deal by ID
// @route   GET /api/deals/:id
// @access  Public
const getDealById = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id)
      .populate('productIds', 'name image price');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    res.json({
      success: true,
      data: deal
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid deal ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching deal',
      error: error.message
    });
  }
};

// @desc    Create a new deal
// @route   POST /api/deals
// @access  Private/Admin
const createDeal = async (req, res) => {
  try {
    const {
      title,
      description,
      dealType,
      originalPrice,
      discountedPrice,
      status,
      badgeText,
      image,
      isActive,
      startDate,
      endDate,
      productIds
    } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Deal title is required'
      });
    }

    if (!originalPrice || originalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Original price must be greater than 0'
      });
    }

    if (!discountedPrice || discountedPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Discounted price must be greater than 0'
      });
    }

    if (discountedPrice >= originalPrice) {
      return res.status(400).json({
        success: false,
        message: 'Discounted price must be less than original price'
      });
    }

    const deal = await Deal.create({
      title,
      description,
      dealType: dealType || 'bundle',
      originalPrice,
      discountedPrice,
      status: status || 'popular',
      badgeText: badgeText || dealType || 'Deal',
      image,
      isActive: isActive !== undefined ? isActive : true,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      productIds: productIds || []
    });

    res.status(201).json({
      success: true,
      data: deal
    });
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating deal',
      error: error.message
    });
  }
};

// @desc    Update a deal
// @route   PUT /api/deals/:id
// @access  Private/Admin
const updateDeal = async (req, res) => {
  try {
    const {
      title,
      description,
      dealType,
      originalPrice,
      discountedPrice,
      status,
      badgeText,
      image,
      isActive,
      startDate,
      endDate,
      productIds
    } = req.body;

    const deal = await Deal.findById(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    // Validate prices if provided
    const finalOriginalPrice = originalPrice !== undefined ? originalPrice : deal.originalPrice;
    const finalDiscountedPrice = discountedPrice !== undefined ? discountedPrice : deal.discountedPrice;

    if (finalDiscountedPrice >= finalOriginalPrice) {
      return res.status(400).json({
        success: false,
        message: 'Discounted price must be less than original price'
      });
    }

    // Update deal
    deal.title = title !== undefined ? title : deal.title;
    deal.description = description !== undefined ? description : deal.description;
    deal.dealType = dealType !== undefined ? dealType : deal.dealType;
    deal.originalPrice = finalOriginalPrice;
    deal.discountedPrice = finalDiscountedPrice;
    deal.status = status !== undefined ? status : deal.status;
    deal.badgeText = badgeText !== undefined ? badgeText : deal.badgeText;
    deal.image = image !== undefined ? image : deal.image;
    deal.isActive = isActive !== undefined ? isActive : deal.isActive;
    deal.startDate = startDate ? new Date(startDate) : deal.startDate;
    deal.endDate = endDate !== undefined ? (endDate ? new Date(endDate) : null) : deal.endDate;
    deal.productIds = productIds !== undefined ? productIds : deal.productIds;

    await deal.save();

    res.json({
      success: true,
      data: deal
    });
  } catch (error) {
    console.error('Error updating deal:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid deal ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating deal',
      error: error.message
    });
  }
};

// @desc    Delete a deal
// @route   DELETE /api/deals/:id
// @access  Private/Admin
const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    res.json({
      success: true,
      message: 'Deal deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting deal:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid deal ID'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error deleting deal',
      error: error.message
    });
  }
};

module.exports = {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal
};

