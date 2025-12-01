const Order = require('../models/Order');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// @desc    Get dashboard statistics
// @route   GET /api/analytics
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Total Sales - Sum of totalAmount from all orders
    const totalSalesResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$totalAmount' },
        },
      },
    ]);
    const totalSales = totalSalesResult.length > 0 ? totalSalesResult[0].totalSales : 0;

    // Total Order Count
    const orderCount = await Order.countDocuments();

    // Pending Orders Count
    const pendingOrdersCount = await Order.countDocuments({ status: 'pending' });

    // Low Stock Products (stock < 10)
    const lowStockProducts = await Product.find({ stock: { $lt: 10 } })
      .select('name stock')
      .sort({ stock: 1 });

    // Latest 5 Orders with user info
    const User = require('../models/User');
    let latestOrders = await Order.find({})
      .populate({
        path: 'items.productId',
        select: 'name',
      })
      .sort({ createdAt: -1 })
      .limit(5);

    // Manually populate userId for orders where it's an ObjectId
    const latestOrdersWithUsers = await Promise.all(
      latestOrders.map(async (order) => {
        const orderObj = order.toObject();
        
        // Check if userId is an ObjectId and try to populate
        if (
          order.userId &&
          typeof order.userId === 'object' &&
          order.userId.toString &&
          mongoose.Types.ObjectId.isValid(order.userId)
        ) {
          try {
            const user = await User.findById(order.userId).select('name email phone');
            if (user) {
              orderObj.userId = user;
            }
          } catch (err) {
            // If populate fails, keep original userId
          }
        }
        return orderObj;
      })
    );

    // Sales Over Time - Group orders by date
    const salesOverTime = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
      {
        $limit: 30, // Last 30 days
      },
    ]);

    res.json({
      success: true,
      data: {
        totalSales,
        orderCount,
        pendingOrdersCount,
        lowStockProducts: lowStockProducts.map((product) => ({
          name: product.name,
          stock: product.stock,
        })),
        latestOrders: latestOrdersWithUsers,
        salesOverTime: salesOverTime.map((item) => ({
          date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
          totalSales: item.totalSales,
          orderCount: item.orderCount,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message,
    });
  }
};

// Helper function to get date range based on filter
const getDateRange = (dateRange, customStart, customEnd) => {
  const now = new Date();
  let startDate, endDate;

  switch (dateRange) {
    case 'today':
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'week':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'month':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case '30days':
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      break;
    case 'quarter':
      const quarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), quarter * 3, 1);
      endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59, 999);
      break;
    case 'year':
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    case 'custom':
      startDate = customStart ? new Date(customStart) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      endDate = customEnd ? new Date(customEnd) : new Date(now);
      break;
    default:
      // For 'all', return null to indicate no date filtering
      return { startDate: null, endDate: null };
  }

  return { startDate, endDate };
};

// Helper function to get comparison date range
const getComparisonDateRange = (dateRange, comparisonMode) => {
  const now = new Date();
  let startDate, endDate;

  if (comparisonMode === 'month') {
    // Previous month
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  } else if (comparisonMode === 'week') {
    // Previous week
    startDate = new Date(now);
    startDate.setDate(now.getDate() - 14);
    startDate.setHours(0, 0, 0, 0);
    endDate = new Date(now);
    endDate.setDate(now.getDate() - 7);
    endDate.setHours(23, 59, 59, 999);
  } else if (comparisonMode === 'year') {
    // Previous year
    startDate = new Date(now.getFullYear() - 1, 0, 1);
    endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
  }

  return { startDate, endDate };
};

// @desc    Get advanced analytics with detailed insights
// @route   GET /api/analytics/advanced
// @access  Private/Admin
const getAdvancedAnalytics = async (req, res) => {
  try {
    // Extract query parameters
    const {
      dateRange = 'all',
      customStart,
      customEnd,
      categoryFilter,
      productFilter,
      locationFilter,
      channelFilter,
      comparisonMode,
    } = req.query;

    // Get date range
    const { startDate, endDate } = getDateRange(dateRange, customStart, customEnd);

    // Build filter for orders
    const orderFilter = {};
    if (dateRange !== 'all' && startDate && endDate) {
      orderFilter.createdAt = {
        $gte: startDate,
        $lte: endDate,
      };
    }
    if (channelFilter && channelFilter !== 'all') {
      orderFilter.deliveryType = channelFilter;
    }
    if (locationFilter && locationFilter !== 'all') {
      orderFilter.address = { $regex: locationFilter, $options: 'i' };
    }

    // 1. Product Performance
    let productFilterQuery = {};
    if (categoryFilter && categoryFilter !== 'all') {
      productFilterQuery.category = categoryFilter;
    }
    if (productFilter && productFilter !== 'all') {
      productFilterQuery._id = productFilter;
    }

    const products = await Product.find(productFilterQuery);
    const now = new Date();

    // If date range is set, we need to calculate product performance based on orders in that date range
    // Get product sales from orders in the date range
    const productSalesInRange = {};
    if (dateRange !== 'all') {
      const ordersForProductPerformance = await Order.find(orderFilter).lean();
      ordersForProductPerformance.forEach((order) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item) => {
            // Handle both populated and non-populated productId
            let productId;
            if (item.productId) {
              productId = item.productId._id ? item.productId._id.toString() : item.productId.toString();
            }
            if (productId) {
              if (!productSalesInRange[productId]) {
                productSalesInRange[productId] = {
                  quantity: 0,
                  revenue: 0,
                };
              }
              productSalesInRange[productId].quantity += item.quantity || 0;
              productSalesInRange[productId].revenue += (item.price || 0) * (item.quantity || 0);
            }
          });
        }
      });
    }

    const productPerformance = products
      .map((product) => {
        const views = product.views || 0;
        // If date range is filtered, use sales from that range only
        const productIdStr = product._id.toString();
        const salesData = productSalesInRange[productIdStr];
        const totalSold = dateRange !== 'all' && salesData ? salesData.quantity : (product.totalSold || 0);
        const addToCartCount = product.addToCartCount || 0;
        const conversionRate =
          views > 0 ? ((totalSold / views) * 100).toFixed(2) : 0;
        const revenueGenerated = dateRange !== 'all' && salesData ? salesData.revenue : (totalSold * product.price);

        return {
          _id: product._id,
          name: product.name,
          category: product.category,
          image: product.image,
          views: views,
          addToCartCount: addToCartCount,
          totalSold: totalSold,
          price: product.price,
          conversionRate: parseFloat(conversionRate),
          revenueGenerated: revenueGenerated,
        };
      })
      .sort((a, b) => b.revenueGenerated - a.revenueGenerated); // Sort by highest revenue

    // 2. Inventory Health
    const inventoryHealth = products.map((product) => {
      const createdAt = new Date(product.createdAt);
      const daysSinceCreated = Math.max(
        1,
        Math.floor((now - createdAt) / (1000 * 60 * 60 * 24))
      );
      const totalSold = product.totalSold || 0;
      const stock = product.stock || 0;

      // Calculate average daily sales
      const averageDailySales = daysSinceCreated > 0 ? totalSold / daysSinceCreated : 0;

      // Calculate days until stockout
      const daysUntilStockout =
        averageDailySales > 0 ? stock / averageDailySales : Infinity;

      // Determine risk level
      let riskLevel = 'Normal';
      let alerts = [];

      if (daysUntilStockout < 7 && stock > 0) {
        riskLevel = 'High Risk';
        alerts.push('Low stock - reorder soon');
      }

      if (totalSold === 0 && daysSinceCreated > 30) {
        riskLevel = 'Overstock';
        alerts.push('No sales in over 30 days');
      }

      if (stock === 0 && totalSold > 0) {
        alerts.push('Out of stock');
      }

      return {
        _id: product._id,
        name: product.name,
        category: product.category,
        stock: stock,
        totalSold: totalSold,
        averageDailySales: parseFloat(averageDailySales.toFixed(2)),
        daysSinceCreated: daysSinceCreated,
        daysUntilStockout:
          daysUntilStockout === Infinity
            ? null
            : parseFloat(daysUntilStockout.toFixed(2)),
        riskLevel: riskLevel,
        alerts: alerts,
      };
    });

    // 3. Sales Trends - Filter orders based on query params
    const orders = await Order.find(orderFilter).populate({
      path: 'items.productId',
      select: 'category',
    });

    // Peak Hours - Group orders by hour
    const hourCounts = {};
    orders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const peakHours = Object.entries(hourCounts)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        orderCount: count,
      }))
      .sort((a, b) => b.orderCount - a.orderCount);

    // Top Categories - Group by category from products in orders
    const categoryCounts = {};
    const categoryRevenue = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.productId && item.productId.category) {
          const category = item.productId.category;
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
          categoryRevenue[category] =
            (categoryRevenue[category] || 0) + item.price * item.quantity;
        }
      });
    });

    const topCategories = Object.entries(categoryCounts)
      .map(([category, count]) => ({
        category: category,
        orderCount: count,
        totalRevenue: categoryRevenue[category] || 0,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    // 4. Order Insights - Use filtered orders
    const totalOrders = await Order.countDocuments(orderFilter);
    const deliveredOrders = await Order.countDocuments({ ...orderFilter, status: 'delivered' });
    const pendingOrders = await Order.countDocuments({ ...orderFilter, status: 'pending' });

    // Get unique customers count
    const uniqueCustomersResult = await Order.aggregate([
      { $match: orderFilter },
      {
        $group: {
          _id: {
            $ifNull: ['$userId', '$phone'],
          },
        },
      },
      {
        $count: 'uniqueCustomers',
      },
    ]);
    const uniqueCustomers = uniqueCustomersResult.length > 0 ? uniqueCustomersResult[0].uniqueCustomers : 0;

    const deliveryPerformance =
      totalOrders > 0
        ? parseFloat(((deliveredOrders / totalOrders) * 100).toFixed(2))
        : 0;

    const totalGrossRevenueResult = await Order.aggregate([
      { $match: orderFilter },
      {
        $group: {
          _id: null,
          totalGrossRevenue: { $sum: '$totalAmount' },
          totalOriginalAmount: { $sum: { $ifNull: ['$originalAmount', '$totalAmount'] } },
          totalDiscountAmount: { $sum: { $ifNull: ['$discountAmount', 0] } },
        },
      },
    ]);
    const totalGrossRevenue =
      totalGrossRevenueResult.length > 0
        ? totalGrossRevenueResult[0].totalGrossRevenue
        : 0;
    const totalOriginalAmount =
      totalGrossRevenueResult.length > 0
        ? totalGrossRevenueResult[0].totalOriginalAmount || totalGrossRevenue
        : totalGrossRevenue;
    const totalDiscountAmount =
      totalGrossRevenueResult.length > 0
        ? totalGrossRevenueResult[0].totalDiscountAmount || 0
        : 0;
    const netRevenue = totalOriginalAmount - totalDiscountAmount;

    // Order status breakdown - Use filtered orders
    const statusBreakdown = await Order.aggregate([
      { $match: orderFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    // Top Delivery Locations - Extract from order addresses (use filtered orders)
    const deliveryLocationFilter = {
      ...orderFilter,
      deliveryType: 'delivery',
      address: { $exists: true, $ne: '' },
    };
    const deliveryOrders = await Order.find(deliveryLocationFilter).select('address');

    // Count addresses (simple string matching - can be enhanced with geocoding)
    const locationCounts = {};
    deliveryOrders.forEach((order) => {
      if (order.address) {
        // Extract key location terms (e.g., first part of address)
        const addressParts = order.address.split(',').map((s) => s.trim());
        const locationKey = addressParts[0] || order.address.substring(0, 30);
        locationCounts[locationKey] = (locationCounts[locationKey] || 0) + 1;
      }
    });

    const topDeliveryLocations = Object.entries(locationCounts)
      .map(([location, count]) => ({
        location: location,
        count: count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 locations

    // Daily Revenue and Orders Trend (last 30 days or selected range)
    const daysToShow = dateRange === 'today' ? 1 : dateRange === 'week' ? 7 : dateRange === '30days' ? 30 : 30;
    const trendStartDate = dateRange === 'all' || !startDate
      ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      : new Date(Math.max(startDate.getTime(), now.getTime() - daysToShow * 24 * 60 * 60 * 1000));
    
    const trendFilter = {
      ...orderFilter,
      createdAt: { $gte: trendStartDate },
    };
    
    const dailyTrend = await Order.aggregate([
      {
        $match: trendFilter,
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' },
          },
          revenue: { $sum: '$totalAmount' },
          orders: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
    ]);

    // Format daily trend data
    const revenueTrendData = dailyTrend.map((item) => {
      const date = new Date(item._id.year, item._id.month - 1, item._id.day);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: item.revenue || 0,
        orders: item.orders || 0,
      };
    });

    // Calculate average revenue per day
    let avgRevenuePerDay = 0;
    if (dateRange !== 'all' && startDate && endDate) {
      const daysDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      avgRevenuePerDay = daysDiff > 0 ? totalGrossRevenue / daysDiff : 0;
    } else {
      // For 'all' date range, calculate based on all orders or default to 30 days
      const oldestOrder = await Order.findOne().sort({ createdAt: 1 }).select('createdAt');
      if (oldestOrder && oldestOrder.createdAt) {
        const daysSinceFirstOrder = Math.max(1, Math.ceil((now.getTime() - new Date(oldestOrder.createdAt).getTime()) / (1000 * 60 * 60 * 24)));
        avgRevenuePerDay = daysSinceFirstOrder > 0 ? totalGrossRevenue / daysSinceFirstOrder : 0;
      } else {
        avgRevenuePerDay = totalGrossRevenue / 30; // Default to 30 days if no orders
      }
    }

    // Comparison data
    let comparisonData = null;
    if (comparisonMode && comparisonMode !== 'none' && startDate && endDate) {
      const { startDate: compStart, endDate: compEnd } = getComparisonDateRange(dateRange, comparisonMode);
      if (compStart && compEnd) {
        const compOrderFilter = {
          createdAt: {
            $gte: compStart,
            $lte: compEnd,
          },
        };
        // Apply channel filter if set
        if (channelFilter && channelFilter !== 'all') {
          compOrderFilter.deliveryType = channelFilter;
        }
        if (locationFilter && locationFilter !== 'all') {
          compOrderFilter.address = { $regex: locationFilter, $options: 'i' };
        }

        const compRevenueResult = await Order.aggregate([
          { $match: compOrderFilter },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$totalAmount' },
            },
          },
        ]);
        const compOrdersCount = await Order.countDocuments(compOrderFilter);
        const compUniqueCustomersResult = await Order.aggregate([
          { $match: compOrderFilter },
          {
            $group: {
              _id: {
                $ifNull: ['$userId', '$phone'],
              },
            },
          },
          {
            $count: 'uniqueCustomers',
          },
        ]);

        comparisonData = {
          previousRevenue: compRevenueResult.length > 0 ? compRevenueResult[0].totalRevenue : 0,
          previousOrders: compOrdersCount,
          previousCustomers: compUniqueCustomersResult.length > 0 ? compUniqueCustomersResult[0].uniqueCustomers : 0,
        };
      }
    }

    // Calculate revenue growth
    let revenueGrowth = 0;
    if (comparisonData && comparisonData.previousRevenue > 0) {
      revenueGrowth = ((totalGrossRevenue - comparisonData.previousRevenue) / comparisonData.previousRevenue) * 100;
    }

    res.json({
      success: true,
      data: {
        productPerformance: productPerformance,
        inventoryHealth: inventoryHealth,
        salesTrends: {
          peakHours: peakHours,
          topCategories: topCategories,
          revenueTrend: revenueTrendData,
          ordersTrend: revenueTrendData.map(item => ({ date: item.date, orders: item.orders })),
        },
        orderInsights: {
          deliveryPerformance: deliveryPerformance,
          totalGrossRevenue: totalGrossRevenue,
          totalOriginalAmount: totalOriginalAmount,
          totalDiscountAmount: totalDiscountAmount,
          netRevenue: netRevenue,
          totalOrders: totalOrders,
          deliveredOrders: deliveredOrders,
          pendingOrders: pendingOrders,
          uniqueCustomers: uniqueCustomers,
          avgRevenuePerDay: avgRevenuePerDay,
          revenueGrowth: revenueGrowth,
          statusBreakdown: statusBreakdown.map((item) => ({
            status: item._id,
            count: item.count,
          })),
          topDeliveryLocations: topDeliveryLocations,
        },
        comparison: comparisonData,
      },
    });
  } catch (error) {
    console.error('Error fetching advanced analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching advanced analytics',
      error: error.message,
    });
  }
};

// @desc    Get category details and analytics
// @route   GET /api/analytics/category/:categoryName
// @access  Private/Admin
const getCategoryDetails = async (req, res) => {
  try {
    const { categoryName } = req.params;

    if (!categoryName) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    // 1. Find all products matching this category
    const categoryProducts = await Product.find({ category: categoryName });

    if (categoryProducts.length === 0) {
      return res.json({
        success: true,
        data: {
          categoryName,
          categoryRevenue: 0,
          totalInventoryValue: 0,
          salesVelocity: 0,
          topProducts: [],
          performanceScore: 0,
          productCount: 0,
        },
      });
    }

    // 2. Calculate Category Revenue: Sum of (price * totalSold)
    let categoryRevenue = 0;
    let totalInventoryValue = 0;
    let salesVelocity = 0;

    const productsWithRevenue = categoryProducts.map((product) => {
      const totalSold = product.totalSold || 0;
      const stock = product.stock || 0;
      const price = product.price || 0;

      const revenue = price * totalSold;
      const inventoryValue = price * stock;

      categoryRevenue += revenue;
      totalInventoryValue += inventoryValue;
      salesVelocity += totalSold;

      return {
        _id: product._id,
        name: product.name,
        category: product.category,
        price: price,
        stock: stock,
        totalSold: totalSold,
        revenue: revenue,
        inventoryValue: inventoryValue,
        image: product.image,
      };
    });

    // 3. Sort products by revenue and get top 3
    const topProducts = productsWithRevenue
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3)
      .map((product) => ({
        _id: product._id,
        name: product.name,
        price: product.price,
        totalSold: product.totalSold,
        revenue: product.revenue,
        image: product.image,
      }));

    // 4. Calculate Performance Score: (Category Revenue / Store Total Revenue) * 100
    // Get total store revenue from orders
    const totalStoreRevenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalStoreRevenue: { $sum: '$totalAmount' },
        },
      },
    ]);

    const totalStoreRevenue =
      totalStoreRevenueResult.length > 0
        ? totalStoreRevenueResult[0].totalStoreRevenue
        : 0;

    // Calculate performance score, handling division by zero
    let performanceScore = 0;
    if (totalStoreRevenue > 0 && categoryRevenue > 0) {
      performanceScore = parseFloat(
        ((categoryRevenue / totalStoreRevenue) * 100).toFixed(2)
      );
    }

    // Ensure all values are numbers (not NaN)
    categoryRevenue = categoryRevenue || 0;
    totalInventoryValue = totalInventoryValue || 0;
    salesVelocity = salesVelocity || 0;
    performanceScore = isNaN(performanceScore) ? 0 : performanceScore;

    res.json({
      success: true,
      data: {
        categoryName,
        categoryRevenue: parseFloat(categoryRevenue.toFixed(2)),
        totalInventoryValue: parseFloat(totalInventoryValue.toFixed(2)),
        salesVelocity: Math.round(salesVelocity),
        topProducts,
        performanceScore,
        productCount: categoryProducts.length,
      },
    });
  } catch (error) {
    console.error('Error fetching category details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category details',
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStats,
  getAdvancedAnalytics,
  getCategoryDetails,
};

