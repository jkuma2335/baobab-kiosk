import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import OrderDetailsModal from '../../components/OrderDetailsModal';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
  FaSearch,
  FaShoppingBag,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaChevronDown,
  FaHome,
  FaUser,
  FaDownload,
  FaPrint,
  FaFilter,
  FaBox,
  FaBoxOpen,
  FaTruck,
} from 'react-icons/fa';
import { 
  FiFilter, 
  FiChevronLeft, 
  FiChevronRight,
  FiTrendingUp,
  FiTrendingDown,
  FiUser,
  FiDollarSign,
  FiShoppingCart,
} from 'react-icons/fi';
import { 
  HiOutlineTruck,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineXCircle,
  HiOutlineCube,
} from 'react-icons/hi';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search and basic filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Advanced filters
  const [dateRange, setDateRange] = useState('all');
  const [paymentMethod, setPaymentMethod] = useState('all');
  const [customerType, setCustomerType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  
  // Period selector for stats
  const [period, setPeriod] = useState('thisWeek');
  
  // Selection and bulk actions
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  
  // UI states
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [hoveredCustomerId, setHoveredCustomerId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchQuery, statusFilter, dateRange, paymentMethod, customerType, sortBy]);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
  }, [searchQuery, statusFilter, dateRange, paymentMethod, customerType, sortBy]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/orders');
      setOrders(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again later.');
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    // Filter by date range
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          filtered = filtered.filter((order) => new Date(order.createdAt) >= filterDate);
          break;
        case 'thisWeek':
          filterDate.setDate(filterDate.getDate() - 7);
          filtered = filtered.filter((order) => new Date(order.createdAt) >= filterDate);
          break;
        case 'thisMonth':
          filterDate.setMonth(filterDate.getMonth() - 1);
          filtered = filtered.filter((order) => new Date(order.createdAt) >= filterDate);
          break;
      }
    }

    // Filter by payment method (based on paymentStatus and deliveryType)
    if (paymentMethod !== 'all') {
      filtered = filtered.filter((order) => {
        if (paymentMethod === 'cod') {
          return order.paymentStatus === 'pending' && order.deliveryType === 'delivery';
        }
        if (paymentMethod === 'paid') {
          return order.paymentStatus === 'completed';
        }
        if (paymentMethod === 'pending') {
          return order.paymentStatus === 'pending';
        }
        return true;
      });
    }

    // Filter by customer type
    if (customerType !== 'all') {
      filtered = filtered.filter((order) => {
        const isGuest = !order.userId || order.userId === 'guest' || (typeof order.userId === 'object' && !order.userId.name);
        return customerType === 'guest' ? isGuest : !isGuest;
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((order) => {
        const customerName = getCustomerName(order).toLowerCase();
        const orderNumber = order.orderNumber?.toLowerCase() || '';
        const phone = order.phone?.toLowerCase() || '';
        return (
          customerName.includes(query) ||
          orderNumber.includes(query) ||
          phone.includes(query)
        );
      });
    }

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'amountHigh':
          return b.totalAmount - a.totalAmount;
        case 'amountLow':
          return a.totalAmount - b.totalAmount;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  };

  // Calculate stats based on period
  const calculateStats = () => {
    const now = new Date();
    let startDate = new Date(0); // Beginning of time
    
    switch (period) {
      case 'thisWeek':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'all':
        startDate = new Date(0);
        break;
    }

    const periodOrders = orders.filter((o) => new Date(o.createdAt) >= startDate);
    
    const totalOrders = periodOrders.length;
    const newOrders = periodOrders.filter((o) => o.status === 'pending').length;
    const completedOrders = periodOrders.filter((o) => o.status === 'delivered').length;
    const cancelledOrders = periodOrders.filter((o) => o.status === 'cancelled').length;

    // Calculate percentage change (simplified)
    const allTimeTotal = orders.length;
    const change = totalOrders > 0 ? ((totalOrders / allTimeTotal) * 100) : 0;

    return {
      totalOrders,
      newOrders,
      completedOrders,
      cancelledOrders,
      change: period === 'all' ? '0%' : `+${Math.round(change)}%`,
    };
  };

  const stats = calculateStats();

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      toast.success(`Order status updated to ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`);
      fetchOrders();
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status');
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedOrders.length === 0) {
      toast.warning('Please select at least one order');
      return;
    }

    if (action === 'delivered' || action === 'processing') {
      try {
        const token = localStorage.getItem('token');
        const promises = selectedOrders.map((orderId) =>
          axios.put(
            `/api/orders/${orderId}/status`,
            { status: action },
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
          )
        );
        await Promise.all(promises);
        toast.success(`${selectedOrders.length} orders updated successfully`);
        fetchOrders();
        setSelectedOrders([]);
        setSelectAll(false);
      } catch (err) {
        console.error('Error updating orders:', err);
        toast.error('Failed to update orders');
      }
    } else if (action === 'export') {
      // Export to CSV
      exportToCSV(filteredOrders.filter((o) => selectedOrders.includes(o._id)));
    } else if (action === 'print') {
      // Print selected orders
      window.print();
    }
  };

  const exportToCSV = (ordersToExport) => {
    const headers = ['Order Number', 'Customer', 'Date', 'Amount', 'Status', 'Items'];
    const rows = ordersToExport.map((order) => [
      order.orderNumber,
      getCustomerName(order),
      formatDate(order.createdAt),
      `GHS ${order.totalAmount.toFixed(2)}`,
      order.status,
      order.items.length,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Orders exported successfully');
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const getCustomerName = (order) => {
    if (order.customerName && order.customerName.trim()) {
      return order.customerName.trim();
    }
    if (order.userId && typeof order.userId === 'object' && order.userId.name) {
      return order.userId.name;
    }
    return 'Guest Customer';
  };

  const getCustomerPhone = (order) => {
    if (order.userId && typeof order.userId === 'object' && order.userId.phone) {
      return order.userId.phone;
    }
    return order.phone || 'N/A';
  };

  const getCustomerEmail = (order) => {
    if (order.userId && typeof order.userId === 'object' && order.userId.email) {
      return order.userId.email;
    }
    return 'N/A';
  };

  const getFirstProductImage = (order) => {
    if (
      order.items &&
      order.items.length > 0 &&
      order.items[0].productId &&
      typeof order.items[0].productId === 'object' &&
      order.items[0].productId.image
    ) {
      return order.items[0].productId.image;
    }
    return null;
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'delivered':
        return {
          bg: 'bg-pink-50',
          text: 'text-pink-700',
          border: 'border-pink-200',
          icon: <HiOutlineCheckCircle className="h-3 w-3" />,
          color: '#50C878',
        };
      case 'pending':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
          icon: <HiOutlineClock className="h-3 w-3" />,
          color: 'bg-yellow-500',
        };
      case 'processing':
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200',
          icon: <HiOutlineCube className="h-3 w-3" />,
          color: 'bg-blue-500',
        };
      case 'shipped':
        return {
          bg: 'bg-purple-50',
          text: 'text-purple-700',
          border: 'border-purple-200',
          icon: <HiOutlineTruck className="h-3 w-3" />,
          color: 'bg-purple-500',
        };
      case 'cancelled':
        return {
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: <HiOutlineXCircle className="h-3 w-3" />,
          color: 'bg-red-500',
        };
      default:
        return {
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
          icon: <HiOutlineCube className="h-3 w-3" />,
          color: 'bg-gray-500',
        };
    }
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(paginatedOrders.map((order) => order._id));
    }
    setSelectAll(!selectAll);
  };

  const handleViewDetails = (orderId) => {
    setSelectedOrderId(orderId);
    setIsDetailsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOrderId(null);
  };

  const handleStatusUpdate = () => {
    fetchOrders();
  };

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Customer insights calculation
  const getCustomerInsights = (order) => {
    const customerOrders = orders.filter((o) => {
      const oPhone = getCustomerPhone(o);
      const orderPhone = getCustomerPhone(order);
      return oPhone === orderPhone && oPhone !== 'N/A';
    });
    
    const totalSpent = customerOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    
    return {
      orderCount: customerOrders.length,
      totalSpent: totalSpent.toFixed(2),
    };
  };

  if (loading) {
    return (
      <div className="flex min-h-screen" style={{ backgroundColor: '#FFF5F7' }}>
        <AdminSidebar />
        <div className="ml-64 flex-1 p-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#FF69B4' }}></div>
            <p className="mt-4" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#FFF5F7', fontFamily: "'Lato', sans-serif" }}>
      <AdminSidebar />
      <div className="ml-64 flex-1 p-6">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm bg-white/80 backdrop-blur-sm shadow-sm px-4 py-2.5 rounded-2xl border inline-block hover:shadow-md transition-shadow" style={{ color: '#4A4A4A', borderColor: '#FFB6C1', boxShadow: '0 4px 15px -5px rgba(255, 182, 193, 0.2)' }}>
            <Link to="/admin/dashboard" className="hover:transition-colors flex items-center font-medium" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }} onMouseEnter={(e) => e.target.style.color = '#FF69B4'} onMouseLeave={(e) => e.target.style.color = '#4A4A4A'}>
              <FaHome className="h-3.5 w-3.5 mr-1.5" />
              Home
            </Link>
            <span className="mx-1" style={{ color: '#FFB6C1' }}>/</span>
            <span className="font-semibold" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Orders List</span>
          </div>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#B76E79', background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Orders List
              </h1>
              <p className="text-sm mt-2 font-medium" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>
                Manage and track all customer orders in real-time
              </p>
            </div>
          </div>
        </div>

        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        ) : (
          <>
            {/* Stats Cards with Period Selector */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">Overview Statistics</h2>
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="text-sm font-medium bg-white border-2 border-gray-200 rounded-xl px-4 py-2 shadow-sm hover:border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all cursor-pointer"
                >
                  <option value="thisWeek">📅 This Week</option>
                  <option value="30days">📆 30 Days</option>
                  <option value="all">⏱️ All Time</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Total Orders */}
                <div className="group relative bg-gradient-to-br from-white via-blue-50/30 to-white rounded-2xl shadow-lg border border-blue-100/50 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Total Orders
                        </p>
                        <p className="text-5xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                          {stats.totalOrders}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform">
                        <FaShoppingBag className="text-white text-xl" />
                      </div>
                    </div>
                    <div className="flex items-center text-xs font-medium mt-4 pt-4 border-t border-gray-100">
                      <FiTrendingUp className="mr-1.5 h-4 w-4" style={{ color: '#50C878' }} />
                      <span className="font-bold" style={{ color: '#50C878', fontFamily: "'Poppins', sans-serif" }}>{stats.change}</span>
                      <span className="text-gray-500 ml-2">vs previous period</span>
                    </div>
                  </div>
                </div>

                {/* New Orders */}
                <div className="group relative bg-gradient-to-br from-white via-yellow-50/30 to-white rounded-2xl shadow-lg border border-yellow-100/50 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          New Orders
                        </p>
                        <p className="text-5xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                          {stats.newOrders}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform">
                        <FaClock className="text-white text-xl" />
                      </div>
                    </div>
                    <div className="flex items-center text-xs font-medium mt-4 pt-4 border-t border-gray-100">
                      <span className="px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full font-semibold">
                        Pending Review
                      </span>
                    </div>
                  </div>
                </div>

                {/* Completed Orders */}
                <div className="group relative bg-gradient-to-br from-white via-green-50/30 to-white rounded-2xl shadow-lg border border-green-100/50 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Completed
                        </p>
                        <p className="text-5xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                          {stats.completedOrders}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform">
                        <FaCheckCircle className="text-white text-xl" />
                      </div>
                    </div>
                    <div className="flex items-center text-xs font-medium mt-4 pt-4 border-t border-gray-100">
                      <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                        Successfully Delivered
                      </span>
                    </div>
                  </div>
                </div>

                {/* Cancelled Orders */}
                <div className="group relative bg-gradient-to-br from-white via-red-50/30 to-white rounded-2xl shadow-lg border border-red-100/50 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-red-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                          Cancelled
                        </p>
                        <p className="text-5xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                          {stats.cancelledOrders}
                        </p>
                      </div>
                      <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform">
                        <FaTimesCircle className="text-white text-xl" />
                      </div>
                    </div>
                    <div className="flex items-center text-xs font-medium mt-4 pt-4 border-t border-gray-100">
                      <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full font-semibold">
                        Cancelled
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Advanced Filter Bar */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-5 mb-6">
              <div className="flex items-center mb-4">
                <FiFilter className="text-gray-500 mr-2 h-5 w-5" />
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                  Filters & Search
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2 relative group">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm group-focus-within:text-green-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search by name, Order ID, phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm font-medium bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all placeholder-gray-400 hover:border-gray-300"
                  />
                </div>

                {/* Date Range */}
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-4 py-3 text-sm font-medium bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 cursor-pointer"
                >
                  <option value="all">📅 All Dates</option>
                  <option value="today">Today</option>
                  <option value="thisWeek">This Week</option>
                  <option value="thisMonth">This Month</option>
                </select>

                {/* Payment Method */}
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="px-4 py-3 text-sm font-medium bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 cursor-pointer"
                >
                  <option value="all">💰 All Payment</option>
                  <option value="paid">✅ Paid</option>
                  <option value="cod">💵 Cash on Delivery</option>
                  <option value="pending">⏳ Pending Payment</option>
                </select>

                {/* Customer Type */}
                <select
                  value={customerType}
                  onChange={(e) => setCustomerType(e.target.value)}
                  className="px-4 py-3 text-sm font-medium bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 cursor-pointer"
                >
                  <option value="all">👥 All Customers</option>
                  <option value="returning">🔄 Returning</option>
                  <option value="guest">👤 Guest</option>
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Status Filter */}
                <div className="relative group">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 text-sm font-medium bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 cursor-pointer appearance-none pr-10"
                  >
                    <option value="all">🏷️ All Status</option>
                    <option value="pending">⏳ Pending</option>
                    <option value="processing">⚙️ Processing</option>
                    <option value="shipped">🚚 Shipped</option>
                    <option value="delivered">✅ Delivered</option>
                    <option value="cancelled">❌ Cancelled</option>
                  </select>
                  <FiFilter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-gray-600 transition-colors" />
                </div>

                {/* Sort By */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 text-sm font-medium bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 cursor-pointer"
                >
                  <option value="newest">🆕 Sort: Newest First</option>
                  <option value="oldest">📜 Sort: Oldest First</option>
                  <option value="amountHigh">💰 Sort: Amount (High to Low)</option>
                  <option value="amountLow">💵 Sort: Amount (Low to High)</option>
                  <option value="status">🏷️ Sort: Status</option>
                </select>
              </div>
            </div>

            {/* Bulk Actions Bar */}
            {selectedOrders.length > 0 && (
              <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 border-2 border-green-200 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-lg animate-slideDown">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-600 rounded-full p-2">
                    <FaShoppingBag className="text-white h-4 w-4" />
                  </div>
                  <span className="text-sm font-bold text-green-900">
                    {selectedOrders.length} order{selectedOrders.length !== 1 ? 's' : ''} selected
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBulkAction('processing')}
                    className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
                  >
                    ⚙️ Mark as Processing
                  </button>
                  <button
                    onClick={() => handleBulkAction('delivered')}
                    className="px-4 py-2 text-xs font-bold bg-green-600 text-white rounded-xl hover:bg-green-700 hover:shadow-lg transition-all transform hover:scale-105 active:scale-95"
                  >
                    ✅ Mark as Delivered
                  </button>
                  <button
                    onClick={() => handleBulkAction('export')}
                    className="px-4 py-2 text-xs font-bold bg-gray-700 text-white rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center"
                  >
                    <FaDownload className="h-3 w-3 mr-1.5" />
                    Export CSV
                  </button>
                  <button
                    onClick={() => handleBulkAction('print')}
                    className="px-4 py-2 text-xs font-bold bg-gray-700 text-white rounded-xl hover:bg-gray-800 hover:shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center"
                  >
                    <FaPrint className="h-3 w-3 mr-1.5" />
                    Print
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOrders([]);
                      setSelectAll(false);
                    }}
                    className="px-4 py-2 text-xs font-bold bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 hover:shadow-md transition-all transform hover:scale-105 active:scale-95"
                  >
                    ✕ Clear
                  </button>
                </div>
              </div>
            )}

            {/* Orders Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-5 py-4 text-left w-12">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                          className="w-5 h-5 text-green-600 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 cursor-pointer transition-all"
                        />
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Order/Product Info
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-5 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-5 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {paginatedOrders.length === 0 ? (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-16 text-center"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <div className="bg-gray-100 rounded-full p-6 mb-4">
                              <FaBox className="h-12 w-12 text-gray-400" />
                            </div>
                            <p className="text-lg font-bold text-gray-700 mb-1">
                              {searchQuery || statusFilter !== 'all' || dateRange !== 'all'
                                ? 'No orders match your filters'
                                : 'No orders found'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {searchQuery || statusFilter !== 'all' || dateRange !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Start by creating your first order'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      paginatedOrders.map((order) => {
                        const firstProductImage = getFirstProductImage(order);
                        const itemCount = order.items?.length || 0;
                        const statusConfig = getStatusConfig(order.status);
                        const insights = getCustomerInsights(order);

                        return (
                          <tr
                            key={order._id}
                            className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-200 relative group border-l-4"
                            style={{ borderLeftColor: statusConfig.color }}
                          >
                            {/* Checkbox */}
                            <td className="px-5 py-4">
                              <input
                                type="checkbox"
                                checked={selectedOrders.includes(order._id)}
                                onChange={() => handleSelectOrder(order._id)}
                                className="w-5 h-5 text-green-600 border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 cursor-pointer transition-all hover:border-green-400"
                              />
                            </td>

                            {/* Order/Product Info */}
                            <td className="px-5 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                                  {firstProductImage ? (
                                    <img
                                      src={firstProductImage}
                                      alt="Product"
                                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <div className="text-gray-400 text-lg">📦</div>
                                  )}
                                </div>
                                <div>
                                  <Link
                                    to={`/track-order`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleViewDetails(order._id);
                                    }}
                                    className="text-sm font-extrabold text-gray-900 hover:text-green-600 transition-colors inline-flex items-center group"
                                  >
                                    {order.orderNumber}
                                    <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                                  </Link>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <p className="text-xs font-medium text-gray-500">
                                      {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                    </p>
                                    {itemCount > 1 && (
                                      <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full shadow-sm">
                                        {itemCount}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Customer */}
                            <td className="px-5 py-4 relative">
                              <div
                                className="flex items-center space-x-3 cursor-pointer group/customer"
                                onMouseEnter={() => setHoveredCustomerId(order._id)}
                                onMouseLeave={() => setHoveredCustomerId(null)}
                              >
                                <div className="relative">
                                  <img
                                    src={`https://i.pravatar.cc/150?u=${order._id}`}
                                    alt={getCustomerName(order)}
                                    className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 shadow-md group-hover/customer:border-green-400 group-hover/customer:shadow-lg transition-all"
                                    onError={(e) => {
                                      e.target.src = 'https://i.pravatar.cc/150?img=68';
                                    }}
                                  />
                                  {!order.userId || order.userId === 'guest' || (typeof order.userId === 'object' && !order.userId.name) ? (
                                    <span className="absolute -bottom-1 -right-1 bg-gray-400 rounded-full p-0.5">
                                      <FiUser className="h-2.5 w-2.5 text-white" />
                                    </span>
                                  ) : (
                                    <span className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                                      <FiUser className="h-2.5 w-2.5 text-white" />
                                    </span>
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-extrabold text-gray-900">
                                    {getCustomerName(order)}
                                  </p>
                                  <p className="text-xs font-medium text-gray-500">
                                    {getCustomerPhone(order)}
                                  </p>
                                </div>
                              </div>

                              {/* Customer Insights Popup */}
                              {hoveredCustomerId === order._id && (
                                <div className="absolute left-0 top-full mt-3 z-50 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl p-5 min-w-[240px] animate-fadeIn">
                                  <div className="space-y-3">
                                    <div className="pb-3 border-b border-gray-100">
                                      <p className="text-sm font-bold text-gray-900 mb-1">
                                        {getCustomerName(order)}
                                      </p>
                                      <div className="space-y-1">
                                        <p className="text-xs text-gray-600 flex items-center">
                                          <span className="mr-1">📧</span>
                                          {getCustomerEmail(order)}
                                        </p>
                                        <p className="text-xs text-gray-600 flex items-center">
                                          <span className="mr-1">📱</span>
                                          {getCustomerPhone(order)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex justify-between items-center bg-blue-50 px-3 py-2 rounded-lg">
                                        <span className="text-xs font-medium text-gray-700">Total Orders:</span>
                                        <span className="text-sm font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                                          {insights.orderCount}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center bg-green-50 px-3 py-2 rounded-lg">
                                        <span className="text-xs font-medium text-gray-700">Lifetime Value:</span>
                                        <span className="text-sm font-bold text-green-700">
                                          GHS {insights.totalSpent}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  {/* Arrow pointer */}
                                  <div className="absolute -top-2 left-6 w-4 h-4 bg-white border-l-2 border-t-2 border-gray-200 transform rotate-45"></div>
                                </div>
                              )}
                            </td>

                            {/* Date */}
                            <td className="px-5 py-4 text-sm font-medium text-gray-700 whitespace-nowrap">
                              <div className="flex items-center space-x-1">
                                <span className="text-gray-400">📅</span>
                                <span>{formatDate(order.createdAt)}</span>
                              </div>
                            </td>

                            {/* Amount */}
                            <td className="px-5 py-4">
                              <p className="text-base font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                GHS {order.totalAmount.toFixed(2)}
                              </p>
                              <p className="text-xs font-medium mt-1">
                                {order.paymentStatus === 'completed' ? (
                                  <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✅ Paid</span>
                                ) : order.paymentStatus === 'pending' && order.deliveryType === 'delivery' ? (
                                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">💵 Pay on Delivery</span>
                                ) : order.paymentStatus === 'pending' ? (
                                  <span className="text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">⏳ Pending</span>
                                ) : (
                                  <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full">❌ Failed</span>
                                )}
                              </p>
                            </td>

                            {/* Status */}
                            <td className="px-5 py-4">
                              <div className="relative inline-block">
                                <select
                                  value={order.status}
                                  onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                                  className={`appearance-none pl-9 pr-8 py-2 rounded-full text-xs font-bold border-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-green-500 transition-all hover:shadow-md ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
                                >
                                  <option value="pending">⏳ Pending</option>
                                  <option value="processing">⚙️ Processing</option>
                                  <option value="shipped">🚚 Shipped</option>
                                  <option value="delivered">✅ Delivered</option>
                                  <option value="cancelled">❌ Cancelled</option>
                                </select>
                                <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${statusConfig.text} pointer-events-none`}>
                                  {statusConfig.icon}
                                </span>
                                <FaChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs pointer-events-none opacity-60" />
                              </div>
                            </td>

                            {/* Action */}
                            <td className="px-5 py-4 text-center">
                              <button
                                onClick={() => handleViewDetails(order._id)}
                                className="px-4 py-2 text-xs font-bold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-green-400 hover:text-green-600 transition-all flex items-center space-x-1.5 mx-auto shadow-sm hover:shadow-md transform hover:scale-105 active:scale-95"
                                title="View Details"
                              >
                                <FaEye className="text-xs" />
                                <span>Details</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 p-5">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-semibold text-gray-700">Rows per page:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1.5 text-sm font-medium bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300 cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm font-medium text-gray-600">
                    Showing <span className="font-bold text-gray-900">{startIndex + 1}</span>-
                    <span className="font-bold text-gray-900">{Math.min(endIndex, filteredOrders.length)}</span> of{' '}
                    <span className="font-bold text-gray-900">{filteredOrders.length}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-green-400 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all disabled:hover:border-gray-200 disabled:hover:text-gray-400"
                  >
                    <FiChevronLeft className="h-5 w-5" />
                  </button>
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg transform scale-105'
                              : 'border-2 border-gray-200 hover:bg-gray-50 hover:border-green-400 hover:text-green-600'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2.5 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-green-400 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all disabled:hover:border-gray-200 disabled:hover:text-gray-400"
                  >
                    <FiChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Order Details Modal */}
        <OrderDetailsModal
          orderId={selectedOrderId}
          isOpen={isDetailsModalOpen}
          onClose={handleCloseModal}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </div>
  );
};

export default AdminOrdersPage;
