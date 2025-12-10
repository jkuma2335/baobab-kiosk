import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import { toast } from 'react-toastify';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  LabelList,
} from 'recharts';
import {
  FaChartLine,
  FaWarehouse,
  FaShoppingCart,
  FaExclamationTriangle,
  FaBoxOpen,
  FaSearch,
  FaArrowUp,
  FaArrowDown,
  FaDownload,
  FaFileExcel,
  FaFilePdf,
  FaFilter,
  FaDollarSign,
  FaUsers,
  FaBox,
  FaTruck,
  FaChartBar,
  FaClock,
} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

const COLORS = ['#FF69B4', '#B76E79', '#E6E6FA', '#FFB6C1', '#FFC0CB', '#DDA0DD', '#F0E68C', '#FFD700'];
const CATEGORY_ICONS = {
  'Oils': '🫒',
  'Grains': '🌾',
  'Meat': '🍗',
  'Spices': '🌶️',
  'Hausa Koko': '🥣',
  'Beans': '🫘',
  'Powder': '🥄',
  'Fresh': '🔥',
  'Grains & Flours': '🌾',
  'default': '📦',
};

// Custom Label for Pie Chart
const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, value, orderCount }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <g>
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <text
        x={x}
        y={y + 15}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={10}
      >
        {`${orderCount || 0} orders`}
      </text>
    </g>
  );
};

// Animated Counter Component
const AnimatedCounter = ({ value, duration = 2000, decimals = 2, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(value);

  useEffect(() => {
    let startTime = null;
    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(countRef.current * easeOutQuart);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(countRef.current);
      }
    };
    requestAnimationFrame(animate);
    countRef.current = value;
  }, [value, duration]);

  return (
    <span>
      {prefix}
      {typeof count === 'number' ? count.toFixed(decimals) : count}
      {suffix}
    </span>
  );
};

const DetailedAnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState('sales');
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [dateRange, setDateRange] = useState('30days');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');

  // Comparison
  const [comparisonMode, setComparisonMode] = useState('none'); // none, month, week, year

  // Data for filters
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);

  // Product Performance Table State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: 'revenueGenerated',
    direction: 'desc',
  });

  useEffect(() => {
    fetchAdvancedAnalytics();
    fetchCategories();
    fetchProducts();
  }, [dateRange, categoryFilter, productFilter, locationFilter, channelFilter, comparisonMode]);

  useEffect(() => {
    if (analytics?.orderInsights?.topDeliveryLocations) {
      setLocations(['all', ...analytics.orderInsights.topDeliveryLocations.map(l => l.location)]);
    }
  }, [analytics]);

  const fetchAdvancedAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (dateRange) params.append('dateRange', dateRange);
      if (categoryFilter && categoryFilter !== 'all') params.append('categoryFilter', categoryFilter);
      if (productFilter && productFilter !== 'all') {
        const productId = typeof productFilter === 'object' ? productFilter.id : productFilter;
        params.append('productFilter', productId);
      }
      if (locationFilter && locationFilter !== 'all') params.append('locationFilter', locationFilter);
      if (channelFilter && channelFilter !== 'all') params.append('channelFilter', channelFilter);
      if (comparisonMode && comparisonMode !== 'none') params.append('comparisonMode', comparisonMode);

      const response = await axios.get(`/api/analytics/advanced?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setAnalytics(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching advanced analytics:', err);
      setError('Failed to load advanced analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(['all', ...(response.data.data || []).map(c => c.name)]);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(['all', ...(response.data.data || []).map(p => ({ id: p._id, name: p.name }))]);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Sort function for product performance table
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = () => {
    if (!analytics?.productPerformance) return [];

    let filtered = analytics.productPerformance.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (categoryFilter !== 'all') {
      filtered = filtered.filter((product) => product.category === categoryFilter);
    }

    if (productFilter !== 'all') {
      const productId = typeof productFilter === 'object' ? productFilter.id : productFilter;
      filtered = filtered.filter((product) => product._id === productId);
    }

    const sorted = [...filtered].sort((a, b) => {
      const aVal = a[sortConfig.key] || 0;
      const bVal = b[sortConfig.key] || 0;

      if (sortConfig.direction === 'asc') {
        return aVal > bVal ? 1 : -1;
      }
      return aVal < bVal ? 1 : -1;
    });

    return sorted;
  };

  // Calculate comparison data
  const calculateComparison = (currentValue, previousValue) => {
    if (!previousValue || previousValue === 0) return { percent: 0, isPositive: true };
    const percent = ((currentValue - previousValue) / previousValue) * 100;
    return {
      percent: Math.abs(percent).toFixed(1),
      isPositive: percent >= 0,
    };
  };

  // Get comparison data from backend
  const getComparisonData = () => {
    return analytics?.comparison || null;
  };

  // Filter inventory health data
  const restockAlerts = analytics?.inventoryHealth?.filter(
    (item) => item.riskLevel === 'High Risk' || (item.daysUntilStockout && item.daysUntilStockout < 7)
  ) || [];

  const deadStock = analytics?.inventoryHealth?.filter(
    (item) => item.riskLevel === 'Overstock'
  ) || [];

  const outOfStock = analytics?.inventoryHealth?.filter(
    (item) => item.stock === 0 && item.totalSold > 0
  ) || [];

  const topMovers = analytics?.productPerformance
    ?.slice(0, 10)
    .filter((p) => p.totalSold > 0)
    .map((p) => ({
      name: p.name,
      totalSold: p.totalSold,
      revenueGenerated: p.revenueGenerated,
    })) || [];

  // Top products by revenue
  const topProductsByRevenue = analytics?.productPerformance
    ?.slice(0, 5)
    .filter((p) => p.revenueGenerated > 0) || [];

  // Top products by quantity
  const topProductsByQuantity = [...(analytics?.productPerformance || [])]
    .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
    .slice(0, 5)
    .filter((p) => p.totalSold > 0) || [];

  // Slow moving products (low sales velocity)
  const slowMovingProducts = analytics?.inventoryHealth
    ?.filter((item) => item.totalSold === 0 && item.daysSinceCreated > 30)
    .slice(0, 5) || [];

  // Calculate stats for Sales & Orders tab
  const totalRevenue = analytics?.orderInsights?.totalGrossRevenue || 0;
  const totalOrders = analytics?.orderInsights?.totalOrders || 0;
  const totalCustomers = analytics?.orderInsights?.uniqueCustomers || 0;
  const averageOrderValue =
    totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const cancelledOrders =
    analytics?.orderInsights?.statusBreakdown?.find(
      (s) => s.status?.toLowerCase() === 'cancelled'
    )?.count || 0;

  const cancellationRate =
    totalOrders > 0
      ? ((cancelledOrders / totalOrders) * 100).toFixed(2)
      : 0;

  const deliveredOrders =
    analytics?.orderInsights?.statusBreakdown?.find(
      (s) => s.status?.toLowerCase() === 'delivered'
    )?.count || 0;

  // Revenue metrics
  const grossRevenue = analytics?.orderInsights?.totalGrossRevenue || 0;
  const netRevenue = analytics?.orderInsights?.netRevenue || grossRevenue;
  const revenueGrowth = analytics?.orderInsights?.revenueGrowth || 0;
  const avgRevenuePerDay = analytics?.orderInsights?.avgRevenuePerDay || 0;

  // Prepare data for charts
  const categoryPieData = (analytics?.salesTrends?.topCategories || []).map((cat, index) => ({
    name: cat.category,
    value: cat.totalRevenue,
    orderCount: cat.orderCount,
    icon: CATEGORY_ICONS[cat.category] || CATEGORY_ICONS.default,
  }));

  const peakHoursData = (analytics?.salesTrends?.peakHours || []).map((peak) => {
    const hour = peak.hour;
    let timeOfDay = '';
    if (hour >= 6 && hour < 12) timeOfDay = 'Morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'Afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'Evening';
    else timeOfDay = 'Night';

    return {
      hour: `${hour.toString().padStart(2, '0')}:00`,
      hourNum: hour,
      orders: peak.orderCount,
      timeOfDay,
    };
  });

  // Get trend data from backend
  const revenueTrendData = analytics?.salesTrends?.revenueTrend || [];
  const ordersTrendData = analytics?.salesTrends?.ordersTrend || [];

  // Get top delivery locations from analytics data
  const topDeliveryLocations =
    analytics?.orderInsights?.topDeliveryLocations || [];

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? (
      <FaArrowUp className="inline ml-1 text-xs" />
    ) : (
      <FaArrowDown className="inline ml-1 text-xs" />
    );
  };

  // Export functions
  const prepareExportData = () => {
    const timestamp = format(new Date(), 'yyyy-MM-dd_HH-mm-ss');
    const filters = {
      dateRange: dateRange,
      categoryFilter: categoryFilter !== 'all' ? categoryFilter : 'All Categories',
      productFilter: productFilter !== 'all' ? (typeof productFilter === 'object' ? productFilter.name : productFilter) : 'All Products',
      locationFilter: locationFilter !== 'all' ? locationFilter : 'All Locations',
      channelFilter: channelFilter !== 'all' ? channelFilter : 'All Channels',
      comparisonMode: comparisonMode !== 'none' ? comparisonMode : 'None',
    };

    return {
      timestamp,
      filters,
      summary: {
        totalRevenue: totalRevenue,
        totalOrders: totalOrders,
        totalCustomers: totalCustomers,
        averageOrderValue: averageOrderValue,
        grossRevenue: grossRevenue,
        netRevenue: netRevenue,
        revenueGrowth: revenueGrowth,
        avgRevenuePerDay: avgRevenuePerDay,
      },
      productPerformance: sortedProducts(),
      inventoryHealth: {
        restockAlerts: restockAlerts,
        deadStock: deadStock,
        outOfStock: outOfStock,
        topMovers: topMovers,
      },
      salesTrends: {
        revenueTrend: revenueTrendData,
        ordersTrend: ordersTrendData,
        categoryData: categoryPieData,
        peakHours: peakHoursData,
        topLocations: topDeliveryLocations,
      },
      orderInsights: {
        deliveredOrders: deliveredOrders,
        cancelledOrders: cancelledOrders,
        cancellationRate: cancellationRate,
        statusBreakdown: analytics?.orderInsights?.statusBreakdown || [],
      },
    };
  };

  const handleExportCSV = () => {
    try {
      const exportData = prepareExportData();
      const csvRows = [];

      // Header
      csvRows.push(['BAOBAB KIOSK - ADVANCED ANALYTICS REPORT']);
      csvRows.push(['Generated:', format(new Date(), 'yyyy-MM-dd HH:mm:ss')]);
      csvRows.push(['']);

      // Filters
      csvRows.push(['FILTERS']);
      csvRows.push(['Date Range:', exportData.filters.dateRange]);
      csvRows.push(['Category:', exportData.filters.categoryFilter]);
      csvRows.push(['Product:', exportData.filters.productFilter]);
      csvRows.push(['Location:', exportData.filters.locationFilter]);
      csvRows.push(['Channel:', exportData.filters.channelFilter]);
      csvRows.push(['Comparison:', exportData.filters.comparisonMode]);
      csvRows.push(['']);

      // Summary
      csvRows.push(['SUMMARY']);
      csvRows.push(['Total Revenue', `GHS ${exportData.summary.totalRevenue.toFixed(2)}`]);
      csvRows.push(['Total Orders', exportData.summary.totalOrders]);
      csvRows.push(['Total Customers', exportData.summary.totalCustomers]);
      csvRows.push(['Average Order Value', `GHS ${exportData.summary.averageOrderValue.toFixed(2)}`]);
      csvRows.push(['Gross Revenue', `GHS ${exportData.summary.grossRevenue.toFixed(2)}`]);
      csvRows.push(['Net Revenue', `GHS ${exportData.summary.netRevenue.toFixed(2)}`]);
      csvRows.push(['Revenue Growth', `${exportData.summary.revenueGrowth.toFixed(2)}%`]);
      csvRows.push(['Average Revenue/Day', `GHS ${exportData.summary.avgRevenuePerDay.toFixed(2)}`]);
      csvRows.push(['']);

      // Product Performance
      csvRows.push(['PRODUCT PERFORMANCE']);
      csvRows.push(['Product Name', 'Category', 'Price', 'Views', 'Add to Cart', 'Total Sold', 'Conversion Rate (%)', 'Revenue Generated']);
      exportData.productPerformance.forEach((product) => {
        csvRows.push([
          product.name,
          product.category,
          `GHS ${product.price.toFixed(2)}`,
          product.views || 0,
          product.addToCartCount || 0,
          product.totalSold || 0,
          product.conversionRate.toFixed(2),
          `GHS ${product.revenueGenerated.toFixed(2)}`,
        ]);
      });
      csvRows.push(['']);

      // Sales Trends
      csvRows.push(['SALES TRENDS - REVENUE BY DATE']);
      csvRows.push(['Date', 'Revenue', 'Orders']);
      exportData.salesTrends.revenueTrend.forEach((item) => {
        csvRows.push([item.date, `GHS ${item.revenue.toFixed(2)}`, item.orders || 0]);
      });
      csvRows.push(['']);

      csvRows.push(['SALES BY CATEGORY']);
      csvRows.push(['Category', 'Revenue', 'Order Count', 'Percentage']);
      exportData.salesTrends.categoryData.forEach((cat) => {
        const percentage = exportData.summary.totalRevenue > 0 
          ? ((cat.value / exportData.summary.totalRevenue) * 100).toFixed(2)
          : '0.00';
        csvRows.push([
          cat.name,
          `GHS ${cat.value.toFixed(2)}`,
          cat.orderCount || 0,
          `${percentage}%`,
        ]);
      });

      // Convert to CSV string
      const csvContent = csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics-report_${exportData.timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV export completed successfully!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV');
    }
  };

  const handleExportExcel = () => {
    try {
      const exportData = prepareExportData();
      const workbook = XLSX.utils.book_new();

      // Summary Sheet
      const summaryData = [
        ['BAOBAB KIOSK - ADVANCED ANALYTICS REPORT'],
        ['Generated:', format(new Date(), 'yyyy-MM-dd HH:mm:ss')],
        [''],
        ['FILTERS'],
        ['Date Range', exportData.filters.dateRange],
        ['Category', exportData.filters.categoryFilter],
        ['Product', exportData.filters.productFilter],
        ['Location', exportData.filters.locationFilter],
        ['Channel', exportData.filters.channelFilter],
        ['Comparison', exportData.filters.comparisonMode],
        [''],
        ['SUMMARY'],
        ['Metric', 'Value'],
        ['Total Revenue', exportData.summary.totalRevenue],
        ['Total Orders', exportData.summary.totalOrders],
        ['Total Customers', exportData.summary.totalCustomers],
        ['Average Order Value', exportData.summary.averageOrderValue],
        ['Gross Revenue', exportData.summary.grossRevenue],
        ['Net Revenue', exportData.summary.netRevenue],
        ['Revenue Growth (%)', exportData.summary.revenueGrowth],
        ['Average Revenue/Day', exportData.summary.avgRevenuePerDay],
      ];
      const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

      // Product Performance Sheet
      const productData = [
        ['Product Name', 'Category', 'Price', 'Views', 'Add to Cart', 'Total Sold', 'Conversion Rate (%)', 'Revenue Generated'],
        ...exportData.productPerformance.map((p) => [
          p.name,
          p.category,
          p.price,
          p.views || 0,
          p.addToCartCount || 0,
          p.totalSold || 0,
          p.conversionRate,
          p.revenueGenerated,
        ]),
      ];
      const productSheet = XLSX.utils.aoa_to_sheet(productData);
      XLSX.utils.book_append_sheet(workbook, productSheet, 'Product Performance');

      // Sales Trends Sheet
      const trendsData = [
        ['Date', 'Revenue', 'Orders'],
        ...exportData.salesTrends.revenueTrend.map((item) => [
          item.date,
          item.revenue,
          item.orders || 0,
        ]),
      ];
      const trendsSheet = XLSX.utils.aoa_to_sheet(trendsData);
      XLSX.utils.book_append_sheet(workbook, trendsSheet, 'Sales Trends');

      // Category Performance Sheet
      const categoryData = [
        ['Category', 'Revenue', 'Order Count', 'Percentage (%)'],
        ...exportData.salesTrends.categoryData.map((cat) => {
          const percentage = exportData.summary.totalRevenue > 0 
            ? ((cat.value / exportData.summary.totalRevenue) * 100).toFixed(2)
            : '0.00';
          return [
            cat.name,
            cat.value,
            cat.orderCount || 0,
            parseFloat(percentage),
          ];
        }),
      ];
      const categorySheet = XLSX.utils.aoa_to_sheet(categoryData);
      XLSX.utils.book_append_sheet(workbook, categorySheet, 'Category Performance');

      // Inventory Health Sheet
      const inventoryData = [
        ['Type', 'Product Name', 'Stock', 'Total Sold', 'Days Until Stockout', 'Risk Level'],
        ...exportData.inventoryHealth.restockAlerts.map((item) => [
          'Restock Alert',
          item.name,
          item.stock,
          item.totalSold || 0,
          item.daysUntilStockout || 'N/A',
          item.riskLevel,
        ]),
        ...exportData.inventoryHealth.outOfStock.map((item) => [
          'Out of Stock',
          item.name,
          0,
          item.totalSold || 0,
          'N/A',
          'Critical',
        ]),
      ];
      if (inventoryData.length > 1) {
        const inventorySheet = XLSX.utils.aoa_to_sheet(inventoryData);
        XLSX.utils.book_append_sheet(workbook, inventorySheet, 'Inventory Health');
      }

      // Write file
      XLSX.writeFile(workbook, `analytics-report_${exportData.timestamp}.xlsx`);
      toast.success('Excel export completed successfully!');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Failed to export Excel file');
    }
  };

  const handleExportPDF = () => {
    try {
      const exportData = prepareExportData();
      const doc = new jsPDF('p', 'mm', 'a4');
      let yPosition = 20;

      // Header
      doc.setFontSize(18);
      doc.setTextColor(22, 163, 74); // Green color
      doc.text('BAOBAB KIOSK', 20, yPosition);
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Advanced Analytics Report', 20, yPosition + 7);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 20, yPosition + 14);
      yPosition += 25;

      // Filters
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined, 'bold');
      doc.text('Filters Applied', 20, yPosition);
      yPosition += 7;
      doc.setFont(undefined, 'normal');
      doc.setFontSize(10);
      doc.text(`Date Range: ${exportData.filters.dateRange}`, 20, yPosition);
      yPosition += 5;
      doc.text(`Category: ${exportData.filters.categoryFilter}`, 20, yPosition);
      yPosition += 5;
      doc.text(`Location: ${exportData.filters.locationFilter}`, 20, yPosition);
      yPosition += 10;

      // Summary
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Summary', 20, yPosition);
      yPosition += 7;
      
      const summaryTableData = [
        ['Metric', 'Value'],
        ['Total Revenue', `GHS ${exportData.summary.totalRevenue.toFixed(2)}`],
        ['Total Orders', exportData.summary.totalOrders.toString()],
        ['Total Customers', exportData.summary.totalCustomers.toString()],
        ['Average Order Value', `GHS ${exportData.summary.averageOrderValue.toFixed(2)}`],
        ['Gross Revenue', `GHS ${exportData.summary.grossRevenue.toFixed(2)}`],
        ['Net Revenue', `GHS ${exportData.summary.netRevenue.toFixed(2)}`],
        ['Revenue Growth', `${exportData.summary.revenueGrowth.toFixed(2)}%`],
      ];
      
      doc.autoTable({
        startY: yPosition,
        head: [summaryTableData[0]],
        body: summaryTableData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74], textColor: 255 },
        styles: { fontSize: 10 },
      });
      yPosition = doc.lastAutoTable.finalY + 15;

      // Product Performance (Top 10)
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Top 10 Products by Revenue', 20, yPosition);
      yPosition += 7;

      const topProducts = exportData.productPerformance.slice(0, 10);
      const productTableData = [
        ['Product', 'Category', 'Sold', 'Revenue'],
        ...topProducts.map((p) => [
          p.name.substring(0, 30),
          p.category.substring(0, 20),
          (p.totalSold || 0).toString(),
          `GHS ${p.revenueGenerated.toFixed(2)}`,
        ]),
      ];

      doc.autoTable({
        startY: yPosition,
        head: [productTableData[0]],
        body: productTableData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74], textColor: 255 },
        styles: { fontSize: 8 },
      });
      yPosition = doc.lastAutoTable.finalY + 15;

      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      // Category Performance
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Sales by Category', 20, yPosition);
      yPosition += 7;

      const categoryTableData = [
        ['Category', 'Revenue', 'Orders'],
        ...exportData.salesTrends.categoryData.map((cat) => [
          cat.name,
          `GHS ${cat.value.toFixed(2)}`,
          (cat.orderCount || 0).toString(),
        ]),
      ];

      doc.autoTable({
        startY: yPosition,
        head: [categoryTableData[0]],
        body: categoryTableData.slice(1),
        theme: 'striped',
        headStyles: { fillColor: [22, 163, 74], textColor: 255 },
        styles: { fontSize: 10 },
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${pageCount} - Baobab Kiosk Analytics Report`,
          105,
          285,
          { align: 'center' }
        );
      }

      // Save the PDF
      doc.save(`analytics-report_${exportData.timestamp}.pdf`);
      toast.success('PDF export completed successfully!');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  const comparisonData = getComparisonData();

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#FFF5F7', fontFamily: "'Lato', sans-serif" }}>
      <AdminSidebar />
      <div className="ml-64 flex-1 p-6">
        {/* Header with Export Buttons */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#B76E79', background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Advanced Analytics
            </h1>
            <p className="mt-2 font-medium" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Deep insights into your store performance</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-white border-2 rounded-2xl hover:bg-pink-50 transition-all flex items-center space-x-2"
              style={{ borderColor: '#FFB6C1', boxShadow: '0 4px 15px -5px rgba(255, 182, 193, 0.3)', fontFamily: "'Poppins', sans-serif", color: '#4A4A4A' }}
            >
              <FaDownload className="h-4 w-4" style={{ color: '#FF69B4' }} />
              <span className="text-sm font-medium">CSV</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="px-4 py-2 bg-white border-2 rounded-2xl hover:bg-pink-50 transition-all flex items-center space-x-2"
              style={{ borderColor: '#FFB6C1', boxShadow: '0 4px 15px -5px rgba(255, 182, 193, 0.3)', fontFamily: "'Poppins', sans-serif", color: '#4A4A4A' }}
            >
              <FaFileExcel className="h-4 w-4" style={{ color: '#FF69B4' }} />
              <span className="text-sm font-medium">Excel</span>
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-white border-2 rounded-2xl hover:bg-pink-50 transition-all flex items-center space-x-2"
              style={{ borderColor: '#FFB6C1', boxShadow: '0 4px 15px -5px rgba(255, 182, 193, 0.3)', fontFamily: "'Poppins', sans-serif", color: '#4A4A4A' }}
            >
              <FaFilePdf className="h-4 w-4" style={{ color: '#FF69B4' }} />
              <span className="text-sm font-medium">PDF</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#FF69B4' }}></div>
            <p className="mt-4" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Loading analytics...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl" style={{ fontFamily: "'Poppins', sans-serif" }}>
            {error}
          </div>
        ) : analytics ? (
          <>
            {/* Totals Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="rounded-2xl shadow-lg border p-6" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%)', borderColor: '#FFB6C1', boxShadow: '0 10px 25px -5px rgba(255, 105, 180, 0.15)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Total Revenue</span>
                  <FaDollarSign className="text-xl" style={{ color: '#FF69B4' }} />
                </div>
                <p className="text-3xl font-extrabold" style={{ color: '#50C878', fontFamily: "'Playfair Display', serif" }}>
                  <AnimatedCounter value={totalRevenue} decimals={0} prefix="GHS " />
                </p>
                <p className="text-xs mt-1" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>{totalOrders} orders</p>
              </div>
              <div className="rounded-2xl shadow-lg border p-6" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%)', borderColor: '#E6E6FA', boxShadow: '0 10px 25px -5px rgba(230, 230, 250, 0.2)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Total Orders</span>
                  <FaShoppingCart className="text-xl" style={{ color: '#B76E79' }} />
                </div>
                <p className="text-3xl font-extrabold" style={{ color: '#B76E79', fontFamily: "'Playfair Display', serif" }}>
                  <AnimatedCounter value={totalOrders} decimals={0} />
                </p>
                <p className="text-xs mt-1" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>{deliveredOrders} delivered</p>
              </div>
              <div className="rounded-2xl shadow-lg border p-6" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%)', borderColor: '#FFC0CB', boxShadow: '0 10px 25px -5px rgba(255, 192, 203, 0.15)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Total Customers</span>
                  <FaUsers className="text-xl" style={{ color: '#E6E6FA' }} />
                </div>
                <p className="text-3xl font-extrabold" style={{ color: '#D4AF37', fontFamily: "'Playfair Display', serif" }}>
                  <AnimatedCounter value={totalCustomers} decimals={0} />
                </p>
                <p className="text-xs mt-1" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Approximate count</p>
              </div>
              <div className="rounded-2xl shadow-lg border p-6" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%)', borderColor: '#FFB6C1', boxShadow: '0 10px 25px -5px rgba(255, 105, 180, 0.15)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Avg Order Value</span>
                  <FaChartBar className="text-xl" style={{ color: '#FF69B4' }} />
                </div>
                <p className="text-3xl font-extrabold" style={{ color: '#50C878', fontFamily: "'Playfair Display', serif" }}>
                  <AnimatedCounter value={averageOrderValue} prefix="GHS " />
                </p>
                <p className="text-xs mt-1" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Per order</p>
              </div>
            </div>

            {/* Filters & Comparison Bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border p-5 mb-6" style={{ borderColor: '#FFB6C1', boxShadow: '0 10px 25px -5px rgba(255, 105, 180, 0.15)' }}>
              <div className="flex items-center mb-4">
                <FaFilter className="mr-2 h-5 w-5" style={{ color: '#FF69B4' }} />
                <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Filters & Comparison</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                {/* Date Range */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Date Range</label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-medium chic-select cursor-pointer"
                  >
                    <option value="today">📅 Today</option>
                    <option value="week">📅 This Week</option>
                    <option value="month">📅 This Month</option>
                    <option value="30days">📅 Last 30 Days</option>
                    <option value="quarter">📅 This Quarter</option>
                    <option value="year">📅 This Year</option>
                    <option value="custom">📅 Custom Range</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-medium chic-select cursor-pointer"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? '📦 All Categories' : `${CATEGORY_ICONS[cat] || '📦'} ${cat}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Filter */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Product</label>
                  <select
                    value={typeof productFilter === 'object' ? productFilter.id : productFilter}
                    onChange={(e) => {
                      const product = products.find(p => (typeof p === 'object' ? p.id : p) === e.target.value);
                      setProductFilter(product || e.target.value);
                    }}
                    className="w-full px-3 py-2 text-sm font-medium chic-select cursor-pointer"
                  >
                    {products.map((prod) => {
                      const id = typeof prod === 'object' ? prod.id : prod;
                      const name = typeof prod === 'object' ? prod.name : 'All Products';
                      return (
                        <option key={id} value={id}>
                          {id === 'all' ? '📦 All Products' : name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Location Filter */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Location</label>
                  <select
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-medium chic-select cursor-pointer"
                  >
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc === 'all' ? '📍 All Locations' : `📍 ${loc}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Channel Filter */}
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Channel</label>
                  <select
                    value={channelFilter}
                    onChange={(e) => setChannelFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-medium chic-select cursor-pointer"
                  >
                    <option value="all">🛍️ All Channels</option>
                    <option value="storefront">🏪 Storefront</option>
                    <option value="delivery">🚚 Delivery</option>
                  </select>
                </div>
              </div>

              {/* Comparison Toggle */}
              <div className="flex items-center space-x-4 pt-4 border-t" style={{ borderColor: '#FFB6C1' }}>
                <label className="text-xs font-medium" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Comparison:</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setComparisonMode('none')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                      comparisonMode === 'none' ? 'chic-button-active' : 'chic-button-inactive'
                    }`}
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    None
                  </button>
                  <button
                    onClick={() => setComparisonMode('week')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                      comparisonMode === 'week' ? 'chic-button-active' : 'chic-button-inactive'
                    }`}
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    This Week vs Last Week
                  </button>
                  <button
                    onClick={() => setComparisonMode('month')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                      comparisonMode === 'month' ? 'chic-button-active' : 'chic-button-inactive'
                    }`}
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    This Month vs Last Month
                  </button>
                  <button
                    onClick={() => setComparisonMode('year')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                      comparisonMode === 'year' ? 'chic-button-active' : 'chic-button-inactive'
                    }`}
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    Year over Year
                  </button>
                </div>
              </div>
            </div>

            {/* Revenue Metrics Section */}
            {activeTab === 'sales' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="rounded-2xl shadow-lg border p-5" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%)', borderColor: '#FFB6C1', boxShadow: '0 10px 25px -5px rgba(255, 105, 180, 0.15)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Gross Revenue</span>
                    <FaDollarSign style={{ color: '#FF69B4' }} />
                  </div>
                  <p className="text-2xl font-extrabold" style={{ color: '#50C878', fontFamily: "'Playfair Display', serif" }}>
                    <AnimatedCounter value={grossRevenue} decimals={0} prefix="GHS " />
                  </p>
                  {comparisonData && (
                    <div className="mt-2 flex items-center text-xs">
                      <FaArrowUp style={{ color: calculateComparison(grossRevenue, comparisonData.previousRevenue).isPositive ? '#50C878' : '#FF69B4' }} className="mr-1" />
                      <span style={{ color: calculateComparison(grossRevenue, comparisonData.previousRevenue).isPositive ? '#50C878' : '#FF69B4', fontFamily: "'Poppins', sans-serif" }}>
                        {calculateComparison(grossRevenue, comparisonData.previousRevenue).percent}%
                      </span>
                      <span className="ml-1" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>vs previous</span>
                    </div>
                  )}
                </div>
                <div className="rounded-2xl shadow-lg border p-5" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%)', borderColor: '#E6E6FA', boxShadow: '0 10px 25px -5px rgba(230, 230, 250, 0.2)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Net Revenue</span>
                    <FaDollarSign style={{ color: '#B76E79' }} />
                  </div>
                  <p className="text-2xl font-extrabold" style={{ color: '#50C878', fontFamily: "'Playfair Display', serif" }}>
                    <AnimatedCounter value={netRevenue} decimals={0} prefix="GHS " />
                  </p>
                </div>
                <div className="rounded-2xl shadow-lg border p-5" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%)', borderColor: '#FFC0CB', boxShadow: '0 10px 25px -5px rgba(255, 192, 203, 0.15)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Revenue Growth</span>
                    <FaChartLine style={{ color: '#FF69B4' }} />
                  </div>
                  <p className="text-2xl font-extrabold" style={{ color: '#D4AF37', fontFamily: "'Playfair Display', serif" }}>{revenueGrowth}%</p>
                  <p className="text-xs mt-1" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Period growth</p>
                </div>
                <div className="rounded-2xl shadow-lg border p-5" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%)', borderColor: '#FFB6C1', boxShadow: '0 10px 25px -5px rgba(255, 105, 180, 0.15)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold uppercase" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Avg Revenue/Day</span>
                    <FaChartBar style={{ color: '#FF69B4' }} />
                  </div>
                  <p className="text-2xl font-extrabold" style={{ color: '#50C878', fontFamily: "'Playfair Display', serif" }}>
                    <AnimatedCounter value={avgRevenuePerDay} prefix="GHS " />
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Daily average</p>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border mb-6" style={{ borderColor: '#FFB6C1', boxShadow: '0 10px 25px -5px rgba(255, 105, 180, 0.15)' }}>
              <div className="border-b" style={{ borderColor: '#FFB6C1' }}>
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  <button
                    onClick={() => setActiveTab('sales')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center space-x-2 transition-all ${
                      activeTab === 'sales'
                        ? ''
                        : 'border-transparent hover:border-pink-200'
                    }`}
                    style={activeTab === 'sales' ? { borderColor: '#FF69B4', color: '#FF69B4', fontFamily: "'Poppins', sans-serif" } : { color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}
                  >
                    <FaShoppingCart />
                    <span>Sales & Orders</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center space-x-2 transition-all ${
                      activeTab === 'products'
                        ? ''
                        : 'border-transparent hover:border-pink-200'
                    }`}
                    style={activeTab === 'products' ? { borderColor: '#FF69B4', color: '#FF69B4', fontFamily: "'Poppins', sans-serif" } : { color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}
                  >
                    <FaChartLine />
                    <span>Product Insights</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className={`whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-sm flex items-center space-x-2 transition-all ${
                      activeTab === 'inventory'
                        ? ''
                        : 'border-transparent hover:border-pink-200'
                    }`}
                    style={activeTab === 'inventory' ? { borderColor: '#FF69B4', color: '#FF69B4', fontFamily: "'Poppins', sans-serif" } : { color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}
                  >
                    <FaWarehouse />
                    <span>Inventory Intelligence</span>
                  </button>
                </nav>
              </div>
            </div>

            {/* Tab 1: Sales & Orders */}
            {activeTab === 'sales' && (
              <div className="space-y-6">
                {/* Enhanced KPI Cards with Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-lg border border-blue-100 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-gray-600 text-sm font-semibold mb-1">Average Order Value</h3>
                        <p className="text-4xl font-extrabold text-gray-900">
                          <AnimatedCounter value={averageOrderValue} prefix="GHS " />
                        </p>
                      </div>
                      <div className="bg-blue-100 rounded-2xl p-4">
                        <FaDollarSign className="text-blue-600 text-2xl" />
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p>📊 Total orders this period: <span className="font-bold">{totalOrders}</span></p>
                      <p>💰 Total revenue: <span className="font-bold">GHS {totalRevenue.toFixed(2)}</span></p>
                    </div>
                    {comparisonData && comparisonData.previousOrders > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center">
                        {(() => {
                          const prevAOV = comparisonData.previousRevenue / comparisonData.previousOrders;
                          const comp = calculateComparison(averageOrderValue, prevAOV);
                          return (
                            <>
                              {comp.isPositive ? (
                                <FaArrowUp className="mr-1" style={{ color: '#50C878' }} />
                              ) : (
                                <FaArrowDown className="text-red-600 mr-1" />
                              )}
                              <span className="text-xs font-bold" style={{ color: comp.isPositive ? '#50C878' : '#FF69B4', fontFamily: "'Poppins', sans-serif" }}>
                                {comp.percent}% from {comparisonMode === 'month' ? 'last month' : comparisonMode === 'week' ? 'last week' : 'previous period'}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  <div className="bg-gradient-to-br from-white to-red-50 rounded-2xl shadow-lg border border-red-100 p-6">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-gray-600 text-sm font-semibold mb-1">Cancellation Rate</h3>
                        <p className="text-4xl font-extrabold text-gray-900">{cancellationRate}%</p>
                      </div>
                      <div className="bg-red-100 rounded-2xl p-4">
                        <FaExclamationTriangle className="text-red-600 text-2xl" />
                      </div>
                    </div>
                    <div className="space-y-1 text-xs text-gray-600">
                      <p>❌ Cancelled orders: <span className="font-bold">{cancelledOrders}</span></p>
                      <p>✅ Total orders: <span className="font-bold">{totalOrders}</span></p>
                    </div>
                  </div>
                </div>

                {/* Trend Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Revenue Trend */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <FaChartLine className="mr-2" style={{ color: '#FF69B4' }} />
                      Revenue Trend (Last 30 Days)
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={revenueTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value) => [`GHS ${value.toFixed(2)}`, 'Revenue']}
                          contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#FF69B4"
                          strokeWidth={3}
                          dot={{ fill: '#FF69B4', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Orders Trend */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <FaShoppingCart className="mr-2 text-blue-600" />
                      Daily Orders Trend
                    </h2>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={ordersTrendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value) => [value, 'Orders']}
                          contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="orders"
                          stroke="#2563eb"
                          strokeWidth={3}
                          dot={{ fill: '#2563eb', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Enhanced Pie Chart - Sales by Category */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <FaChartBar className="mr-2 text-purple-600" />
                      Sales by Category
                    </h2>
                    {categoryPieData.length > 0 ? (
                      <div className="space-y-4">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={categoryPieData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={(entry) => CustomLabel({ ...entry, orderCount: entry.orderCount })}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              animationBegin={0}
                              animationDuration={1000}
                            >
                              {categoryPieData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip
                              formatter={(value, name, props) => [
                                `GHS ${value.toFixed(2)} | ${props.payload.orderCount || 0} orders`,
                                props.payload.name
                              ]}
                              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Category Legend */}
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {categoryPieData.map((cat, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                              />
                              <span className="font-medium">{cat.icon} {cat.name}</span>
                              <span className="text-gray-500">({cat.orderCount || 0})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-500">
                        No category data available
                      </div>
                    )}
                  </div>

                  {/* Enhanced Bar Chart - Peak Order Hours */}
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                      <FaClock className="mr-2 text-orange-600" />
                      Peak Order Hours
                    </h2>
                    {peakHoursData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={peakHoursData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="hour"
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Time of Day', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis
                            tick={{ fontSize: 12 }}
                            label={{ value: 'Orders', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip
                            formatter={(value, name, props) => [
                              `${value} orders`,
                              `${props.payload.timeOfDay} (${props.payload.hour})`
                            ]}
                            contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                          />
                          <Bar dataKey="orders" fill="#FF69B4" name="Orders" radius={[8, 8, 0, 0]}>
                            <LabelList dataKey="orders" position="top" fontSize={11} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-gray-500">
                        No peak hours data available
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Delivery Locations */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                    <FaTruck className="mr-2 text-blue-600" />
                    Top Delivery Locations
                  </h2>
                  {topDeliveryLocations.length > 0 ? (
                    <div className="space-y-3">
                      {topDeliveryLocations.map((location, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-4">
                            <span className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-bold text-gray-900">{location.location}</p>
                              <p className="text-xs text-gray-500">Delivery location</p>
                            </div>
                          </div>
                          <span className="text-gray-900 font-bold text-lg">
                            {location.count} {location.count === 1 ? 'delivery' : 'deliveries'}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No delivery location data available
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Product Insights */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                {/* Top Products by Revenue */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <FaArrowUp className="mr-2" style={{ color: '#FF69B4' }} />
                      Top Products by Revenue
                    </h2>
                  </div>
                  {topProductsByRevenue.length > 0 ? (
                    <div className="space-y-3">
                      {topProductsByRevenue.map((product, index) => (
                        <div
                          key={product._id}
                          className="flex items-center justify-between p-4 rounded-2xl hover:shadow-md transition-shadow"
                          style={{ background: 'linear-gradient(135deg, #FFF5F7 0%, #FFFFFF 100%)', border: '1px solid #FFB6C1', boxShadow: '0 4px 15px -5px rgba(255, 105, 180, 0.1)' }}
                        >
                          <div className="flex items-center space-x-4">
                            <span className="text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg" style={{ background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)', fontFamily: "'Poppins', sans-serif" }}>
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-bold text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg" style={{ color: '#50C878', fontFamily: "'Playfair Display', serif" }}>
                              GHS {product.revenueGenerated.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">{product.totalSold} units sold</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No revenue data available</p>
                  )}
                </div>

                {/* Top Products by Quantity */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <FaBox className="mr-2 text-blue-600" />
                      Top Products by Quantity Sold
                    </h2>
                  </div>
                  {topProductsByQuantity.length > 0 ? (
                    <div className="space-y-3">
                      {topProductsByQuantity.map((product, index) => (
                        <div
                          key={product._id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-white rounded-xl border border-blue-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-4">
                            <span className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-bold text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-500">{product.category}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-blue-600 text-lg">{product.totalSold} units</p>
                            <p className="text-xs text-gray-500">GHS {product.revenueGenerated.toFixed(2)} revenue</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No quantity data available</p>
                  )}
                </div>

                {/* Slow Moving Products */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                      <FaExclamationTriangle className="mr-2 text-yellow-600" />
                      Slow Moving Products
                    </h2>
                  </div>
                  {slowMovingProducts.length > 0 ? (
                    <div className="space-y-3">
                      {slowMovingProducts.map((product, index) => (
                        <div
                          key={product._id}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-white rounded-xl border border-yellow-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center space-x-4">
                            <span className="bg-yellow-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-bold text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-500">No sales in {product.daysSinceCreated} days</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-gray-600 text-lg">{product.stock} in stock</p>
                            <p className="text-xs text-gray-500">Consider promotion</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No slow-moving products found</p>
                  )}
                </div>

                {/* Out of Stock Alerts */}
                {outOfStock.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <FaExclamationTriangle className="mr-2 text-red-600" />
                        Out of Stock Alerts
                      </h2>
                      <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
                        {outOfStock.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {outOfStock.map((item) => (
                        <div
                          key={item._id}
                          className="border-2 border-red-200 bg-red-50 rounded-xl p-4"
                        >
                          <h3 className="font-bold text-gray-800 mb-2">{item.name}</h3>
                          <p className="text-sm text-red-700 font-semibold">⚠️ Out of Stock</p>
                          <p className="text-xs text-gray-600 mt-1">{item.totalSold} units sold previously</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Product Performance Table */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800">Product Performance</h2>
                      <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Image
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('name')}
                          >
                            Name <SortIcon columnKey="name" />
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('views')}
                          >
                            Views <SortIcon columnKey="views" />
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('totalSold')}
                          >
                            Sales Count <SortIcon columnKey="totalSold" />
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('conversionRate')}
                          >
                            Conv Rate (%) <SortIcon columnKey="conversionRate" />
                          </th>
                          <th
                            className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleSort('revenueGenerated')}
                          >
                            Revenue <SortIcon columnKey="revenueGenerated" />
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {sortedProducts().length > 0 ? (
                          sortedProducts().map((product) => (
                            <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden shadow-md">
                                  {product.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="h-full w-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling?.classList.remove('hidden');
                                      }}
                                    />
                                  ) : null}
                                  <div className={`text-gray-400 text-xl ${product.image ? 'hidden' : ''}`}>
                                    🛒
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {product.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {product.views || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                {product.totalSold || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    product.conversionRate > 5
                                      ? 'bg-green-100 text-green-800'
                                      : product.conversionRate > 2
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {product.conversionRate.toFixed(2)}%
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                GHS {product.revenueGenerated.toFixed(2)}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="6"
                              className="px-6 py-8 text-center text-gray-500"
                            >
                              No products found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Inventory Intelligence */}
            {activeTab === 'inventory' && (
              <div className="space-y-6">
                {/* Restock Alerts */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FaExclamationTriangle className="text-red-600 text-2xl" />
                    <h2 className="text-xl font-bold text-gray-800">Restock Alerts</h2>
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
                      {restockAlerts.length}
                    </span>
                  </div>
                  {restockAlerts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {restockAlerts.map((item) => (
                        <div
                          key={item._id}
                          className="border-2 border-red-200 bg-gradient-to-br from-red-50 to-white rounded-xl p-4 hover:shadow-lg transition-shadow"
                        >
                          <h3 className="font-bold text-gray-800 mb-2">{item.name}</h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-semibold">Stock:</span> {item.stock} units
                            </p>
                            <p>
                              <span className="font-semibold">Days until stockout:</span>{' '}
                              {item.daysUntilStockout
                                ? item.daysUntilStockout.toFixed(1)
                                : 'N/A'}
                            </p>
                            <p>
                              <span className="font-semibold">Avg daily sales:</span>{' '}
                              {item.averageDailySales}
                            </p>
                            {item.alerts.length > 0 && (
                              <div className="mt-2">
                                {item.alerts.map((alert, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block bg-red-200 text-red-800 text-xs font-semibold px-2 py-1 rounded-full mr-1 mb-1"
                                  >
                                    {alert}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      ✅ No restock alerts! All products are well stocked.
                    </p>
                  )}
                </div>

                {/* Dead Stock */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FaBoxOpen className="text-gray-600 text-2xl" />
                    <h2 className="text-xl font-bold text-gray-800">Dead Stock</h2>
                    <span className="bg-gray-100 text-gray-800 text-xs font-bold px-3 py-1 rounded-full">
                      {deadStock.length}
                    </span>
                  </div>
                  {deadStock.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {deadStock.map((item) => (
                        <div
                          key={item._id}
                          className="border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 hover:shadow-lg transition-shadow"
                        >
                          <h3 className="font-bold text-gray-800 mb-2">{item.name}</h3>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              <span className="font-semibold">Stock:</span> {item.stock} units
                            </p>
                            <p>
                              <span className="font-semibold">Days since created:</span>{' '}
                              {item.daysSinceCreated}
                            </p>
                            <p>
                              <span className="font-semibold">Total sold:</span> {item.totalSold}
                            </p>
                            {item.alerts.length > 0 && (
                              <div className="mt-2">
                                {item.alerts.map((alert, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block bg-gray-200 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full mr-1 mb-1"
                                  >
                                    {alert}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      ✅ No dead stock identified. All products are moving!
                    </p>
                  )}
                </div>

                {/* Top Movers */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-green-200 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <FaArrowUp className="text-green-600 text-2xl" />
                    <h2 className="text-xl font-bold text-gray-800">Top Movers</h2>
                  </div>
                  {topMovers.length > 0 ? (
                    <div className="space-y-3">
                      {topMovers.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-white rounded-xl border border-green-200 hover:shadow-lg transition-shadow"
                        >
                          <div className="flex items-center space-x-4">
                            <span className="text-white rounded-full w-10 h-10 flex items-center justify-center font-bold shadow-lg" style={{ background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)', fontFamily: "'Poppins', sans-serif" }}>
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-bold text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-600">
                                {item.totalSold} units sold
                              </p>
                            </div>
                          </div>
                          <p className="font-bold text-green-600 text-lg">
                            GHS {item.revenueGenerated.toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No sales data available</p>
                  )}
                </div>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default DetailedAnalyticsPage;
