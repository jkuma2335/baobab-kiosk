import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { format } from 'date-fns';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  TrendingUp,
  Package,
  CheckCircle2,
  ArrowRight,
  BarChart3,
} from 'lucide-react';

// Animated Counter Component
const AnimatedCounter = ({ value, decimals = 0, prefix = '', suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 30;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step += 1;
      current = Math.min(increment * step, value);
      setDisplayValue(current);

      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toFixed(decimals).toLocaleString()}
      {suffix}
    </span>
  );
};

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/analytics', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStats(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return dateString;
    }
  };

  const formatTime = (dateString) => {
    try {
      return format(new Date(dateString), 'HH:mm');
    } catch {
      return '';
    }
  };

  const formatChartDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd');
    } catch {
      return dateString;
    }
  };

  const getCustomerName = (order) => {
    if (order.userId && typeof order.userId === 'object' && order.userId.name) {
      return order.userId.name;
    }
    return 'Guest Customer';
  };

  const getStatusBadge = (status) => {
    const config = {
      pending: {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: <Clock className="h-3 w-3" />,
      },
      processing: {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: <BarChart3 className="h-3 w-3" />,
      },
      delivered: {
        bg: 'bg-pink-50',
        text: 'text-pink-700',
        border: 'border-pink-200',
        icon: <CheckCircle2 className="h-3 w-3" />,
      },
      shipped: {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        icon: <Package className="h-3 w-3" />,
      },
      cancelled: {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        icon: <AlertTriangle className="h-3 w-3" />,
      },
    };

    const statusConfig = config[status] || config.pending;
    const displayStatus = status.charAt(0).toUpperCase() + status.slice(1);

    return (
      <span
        className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}
      >
        {statusConfig.icon}
        <span>{displayStatus}</span>
      </span>
    );
  };

  // Calculate average order value
  const averageOrderValue =
    stats && stats.orderCount > 0 ? stats.totalSales / stats.orderCount : 0;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#FFF5F7', fontFamily: "'Lato', sans-serif" }}>
      <AdminSidebar />
      <div className="ml-64 flex-1 p-6">
        {/* Enhanced Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#B76E79', background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Dashboard
          </h1>
          <p className="text-sm mt-2 font-medium" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>
            Overview of your store's performance
          </p>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#FF69B4' }}></div>
            <p className="mt-4 font-medium" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Loading dashboard...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        ) : stats ? (
          <>
            {/* Enhanced Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
              {/* Total Sales Card */}
              <div className="group relative rounded-2xl shadow-lg border p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%)', borderColor: '#FFB6C1', boxShadow: '0 10px 25px -5px rgba(255, 105, 180, 0.15)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl" style={{ backgroundColor: 'rgba(255, 105, 180, 0.2)' }}></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>
                        Total Sales
                      </p>
                      <p className="text-5xl font-extrabold" style={{ color: '#50C878', fontFamily: "'Playfair Display', serif" }}>
                        <AnimatedCounter
                          value={stats.totalSales}
                          decimals={2}
                          prefix="GHS "
                        />
                      </p>
                      <div className="mt-3 flex items-center text-xs font-medium">
                        <TrendingUp className="h-3 w-3 mr-1" style={{ color: '#50C878' }} />
                        <span className="font-semibold" style={{ color: '#50C878', fontFamily: "'Poppins', sans-serif" }}>
                          All-time revenue
                        </span>
                      </div>
                    </div>
                    <div className="rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)' }}>
                      <DollarSign className="text-white text-xl" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Total Orders Card */}
              <div className="group relative bg-gradient-to-br from-white via-blue-50/30 to-white rounded-2xl shadow-lg border border-blue-100/50 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Total Orders
                      </p>
                      <p className="text-5xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        <AnimatedCounter value={stats.orderCount} />
                      </p>
                      <div className="mt-3 flex items-center text-xs font-medium">
                        <span className="text-blue-600 font-semibold">
                          Avg: GHS {averageOrderValue.toFixed(2)} per order
                        </span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform">
                      <ShoppingBag className="text-white text-xl" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pending Orders Card */}
              <div className="group relative bg-gradient-to-br from-white via-yellow-50/30 to-white rounded-2xl shadow-lg border border-yellow-100/50 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Pending Orders
                      </p>
                      <p className="text-5xl font-extrabold bg-gradient-to-br from-yellow-600 to-yellow-700 bg-clip-text text-transparent">
                        <AnimatedCounter value={stats.pendingOrdersCount} />
                      </p>
                      <div className="mt-3 flex items-center text-xs font-medium">
                        <Clock className="h-3 w-3 text-yellow-600 mr-1" />
                        <span className="text-yellow-600 font-semibold">
                          Requires attention
                        </span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform">
                      <Clock className="text-white text-xl" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Grid Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">
              {/* Enhanced Sales Chart - Takes 2 columns */}
              <div className="lg:col-span-2 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border p-6" style={{ borderColor: '#FFB6C1', boxShadow: '0 10px 25px -5px rgba(255, 105, 180, 0.15)' }}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: '#4A4A4A', fontFamily: "'Playfair Display', serif" }}>Sales Over Time</h2>
                    <p className="text-sm mt-1" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Last 30 days performance</p>
                  </div>
                  <div className="rounded-xl p-2" style={{ backgroundColor: '#FFE4E9' }}>
                    <BarChart3 className="h-5 w-5" style={{ color: '#FF69B4' }} />
                  </div>
                </div>
                {stats.salesOverTime && stats.salesOverTime.length > 0 ? (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart
                      data={stats.salesOverTime.map((item) => ({
                        ...item,
                        date: formatChartDate(item.date),
                      }))}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        stroke="#9ca3af"
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: '#6b7280' }}
                        stroke="#9ca3af"
                        tickFormatter={(value) => `GHS ${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '0.75rem',
                          padding: '0.75rem',
                        }}
                        formatter={(value) => [`GHS ${value.toFixed(2)}`, 'Sales']}
                        labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: '1rem' }}
                        iconType="circle"
                      />
                      <Bar
                        dataKey="totalSales"
                        fill="url(#colorGradient)"
                        radius={[8, 8, 0, 0]}
                        name="Sales (GHS)"
                      />
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#FF69B4" stopOpacity={1} />
                          <stop offset="100%" stopColor="#B76E79" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[320px] flex flex-col items-center justify-center text-gray-500">
                    <BarChart3 className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm font-medium">No sales data available</p>
                  </div>
                )}
              </div>

              {/* Enhanced Low Stock Alert Panel - Takes 1 column */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border p-6" style={{ borderColor: '#FFB6C1', boxShadow: '0 10px 25px -5px rgba(255, 105, 180, 0.15)' }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="rounded-xl p-2" style={{ backgroundColor: '#FFE4E9' }}>
                      <AlertTriangle className="h-5 w-5" style={{ color: '#FF69B4' }} />
                    </div>
                    <h2 className="text-xl font-bold" style={{ color: '#4A4A4A', fontFamily: "'Playfair Display', serif" }}>Low Stock Alert</h2>
                  </div>
                </div>
                {stats.lowStockProducts && stats.lowStockProducts.length > 0 ? (
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {stats.lowStockProducts.map((product, index) => (
                      <div
                        key={index}
                        className="group flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200 hover:shadow-md transition-all hover:scale-[1.02]"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-red-500 rounded-lg p-2">
                            <Package className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-gray-900 block">
                              {product.name}
                            </span>
                            <span className="text-xs text-gray-600">
                              Running low
                            </span>
                          </div>
                        </div>
                        <div className="bg-red-600 text-white rounded-lg px-3 py-1.5">
                          <span className="text-sm font-extrabold">{product.stock}</span>
                          <span className="text-xs ml-1">left</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full p-6 mb-4" style={{ backgroundColor: '#FFE4E9' }}>
                      <CheckCircle2 className="h-12 w-12" style={{ color: '#50C878' }} />
                    </div>
                    <p className="text-gray-700 font-semibold mb-1">
                      All products are well stocked!
                    </p>
                    <p className="text-xs text-gray-500">
                      Your inventory is in good shape
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Recent Orders Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border overflow-hidden" style={{ borderColor: '#FFB6C1', boxShadow: '0 10px 25px -5px rgba(255, 105, 180, 0.15)' }}>
              <div className="p-6 border-b-2" style={{ borderColor: '#FFB6C1', background: 'linear-gradient(135deg, #FFF5F7 0%, transparent 100%)' }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: '#4A4A4A', fontFamily: "'Playfair Display', serif" }}>Recent Orders</h2>
                    <p className="text-sm mt-1" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>
                      Latest {stats.latestOrders?.length || 0} orders
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/admin/orders')}
                    className="flex items-center space-x-2 px-4 py-2 text-white rounded-2xl transition-all font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)', fontFamily: "'Poppins', sans-serif" }}
                  >
                    <span>View All</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Order Number
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {stats.latestOrders && stats.latestOrders.length > 0 ? (
                      stats.latestOrders.map((order) => (
                        <tr
                          key={order._id}
                          onClick={() => navigate(`/admin/orders`)}
                          className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-200 cursor-pointer group"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <div className="bg-gray-100 rounded-lg p-1.5">
                                <Package className="h-3.5 w-3.5 text-gray-600" />
                              </div>
                              <span className="text-sm font-bold font-mono text-gray-900 group-hover:text-green-600 transition-colors">
                                {order.orderNumber}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-semibold text-gray-700">
                              {getCustomerName(order)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                {formatDate(order.createdAt)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatTime(order.createdAt)}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                              GHS {order.totalAmount.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(order.status)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-16 text-center"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <div className="bg-gray-100 rounded-full p-6 mb-4">
                              <ShoppingBag className="h-12 w-12 text-gray-400" />
                            </div>
                            <p className="text-lg font-bold text-gray-700 mb-1">
                              No recent orders
                            </p>
                            <p className="text-sm text-gray-500">
                              Orders will appear here once customers start purchasing
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
