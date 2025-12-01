import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import ProductForm from '../../components/ProductForm';
import { toast } from 'react-toastify';
import {
  Search,
  Plus,
  Filter,
  ChevronDown,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
  AlertCircle,
  CheckCircle2,
  Package,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  BarChart3,
  Grid,
  SortAsc,
  SortDesc,
} from 'lucide-react';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Stats from backend
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalSold: 0,
  });
  
  // Filter and Sort States - Load from localStorage if available
  const loadFiltersFromStorage = () => {
    try {
      const stored = localStorage.getItem('admin_products_filters');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading filters from localStorage:', error);
    }
    return {
      searchQuery: '',
      categoryFilter: 'all',
      sortBy: 'newest',
      currentPage: 1,
    };
  };

  const savedFilters = loadFiltersFromStorage();
  const [searchQuery, setSearchQuery] = useState(savedFilters.searchQuery);
  const [categoryFilter, setCategoryFilter] = useState(savedFilters.categoryFilter);
  const [sortBy, setSortBy] = useState(savedFilters.sortBy);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(savedFilters.currentPage);
  const [itemsPerPage] = useState(10);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    const filters = {
      searchQuery,
      categoryFilter,
      sortBy,
      currentPage,
    };
    localStorage.setItem('admin_products_filters', JSON.stringify(filters));
  }, [searchQuery, categoryFilter, sortBy, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [products, searchQuery, categoryFilter, sortBy]);

  // Fetch stats when products are loaded
  useEffect(() => {
    if (products.length > 0) {
      fetchStats();
    }
  }, [products.length]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products');
      setProducts(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products. Please try again later.');
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/analytics/advanced?dateRange=all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.success && response.data.data) {
        const analytics = response.data.data;
        setStats({
          totalRevenue: analytics.orderInsights?.totalGrossRevenue || 0,
          totalSold: products.reduce((sum, p) => sum + (p.totalSold || 0), 0),
        });
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Fallback to calculating from products if API fails
      const totalRevenue = products.reduce(
        (sum, product) => sum + product.price * (product.totalSold || 0),
        0
      );
      const totalSold = products.reduce(
        (sum, product) => sum + (product.totalSold || 0),
        0
      );
      setStats({ totalRevenue, totalSold });
    }
  };


  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filter by search query (name)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((product) => product.category === categoryFilter);
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'stock-low':
        filtered.sort((a, b) => a.stock - b.stock);
        break;
      case 'stock-high':
        filtered.sort((a, b) => b.stock - a.stock);
        break;
      case 'revenue-high':
        filtered.sort((a, b) => (b.price * (b.totalSold || 0)) - (a.price * (a.totalSold || 0)));
        break;
      case 'revenue-low':
        filtered.sort((a, b) => (a.price * (a.totalSold || 0)) - (b.price * (b.totalSold || 0)));
        break;
      case 'sales-high':
        filtered.sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0));
        break;
      case 'sales-low':
        filtered.sort((a, b) => (a.totalSold || 0) - (b.totalSold || 0));
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        break;
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page on filter/sort change
  };

  // Get unique categories
  const categories = ['all', ...new Set(products.map((p) => p.category).filter(Boolean))];

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = async (productId, productName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${productName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/api/products/${productId}`);
      toast.success('Product deleted successfully!');
      fetchProducts();
    } catch (err) {
      console.error('Error deleting product:', err);
      toast.error('Failed to delete product');
    }
  };

  const handleFormSuccess = () => {
    fetchProducts();
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  // Calculate stats
  const totalProducts = products.length;
  const totalRevenue = stats.totalRevenue;
  const totalSold = products.reduce(
    (sum, product) => sum + (product.totalSold || 0),
    0
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#FFF5F7', fontFamily: "'Lato', sans-serif" }}>
      <AdminSidebar />
      <div className="ml-64 flex-1 p-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#B76E79', background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Products
              </h1>
              <p className="text-sm mt-2 font-medium" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Manage your product inventory and details</p>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <div className="group relative bg-gradient-to-br from-white via-blue-50/30 to-white rounded-2xl shadow-lg border border-blue-100/50 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Total Products
                  </p>
                  <p className="text-5xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {totalProducts}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform">
                  <Package className="text-white text-xl" />
                </div>
              </div>
              <div className="flex items-center text-xs font-medium mt-4 pt-4 border-t border-gray-100">
                <span className="text-blue-600 font-semibold">Active inventory</span>
              </div>
            </div>
          </div>

          <div className="group relative rounded-2xl shadow-lg border p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%)', borderColor: '#FFB6C1', boxShadow: '0 10px 25px -5px rgba(255, 105, 180, 0.15)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl" style={{ backgroundColor: 'rgba(255, 105, 180, 0.2)' }}></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>
                    Total Revenue
                  </p>
                  <p className="text-5xl font-extrabold" style={{ color: '#50C878', fontFamily: "'Playfair Display', serif" }}>
                    GHS {totalRevenue.toFixed(2)}
                  </p>
                </div>
                <div className="rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)' }}>
                  <DollarSign className="text-white text-xl" />
                </div>
              </div>
              <div className="flex items-center text-xs font-medium mt-4 pt-4 border-t" style={{ borderColor: '#FFB6C1' }}>
                <TrendingUp className="mr-1.5 h-4 w-4" style={{ color: '#50C878' }} />
                <span className="font-semibold" style={{ color: '#50C878', fontFamily: "'Poppins', sans-serif" }}>From all orders</span>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-white via-purple-50/30 to-white rounded-2xl shadow-lg border border-purple-100/50 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Products Sold
                  </p>
                  <p className="text-5xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {totalSold}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform">
                  <ShoppingBag className="text-white text-xl" />
                </div>
              </div>
              <div className="flex items-center text-xs font-medium mt-4 pt-4 border-t border-gray-100">
                <span className="text-purple-600 font-semibold">Total units sold</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Control Center Toolbar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search Input */}
            <div className="flex-1 relative w-full lg:w-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search by name, category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 transition-all chic-select"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              />
            </div>

            {/* Category Filter Dropdown */}
            <div className="relative w-full lg:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="appearance-none border-2 rounded-2xl px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 cursor-pointer transition-all w-full lg:w-auto chic-select"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === 'all' ? '📦 All Categories' : category}
                  </option>
                ))}
              </select>
              <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            </div>

            {/* Sort Dropdown */}
            <div className="relative w-full lg:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none border-2 rounded-2xl px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 cursor-pointer transition-all w-full lg:w-auto chic-select"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <option value="newest">🆕 Newest First</option>
                <option value="price-low">💰 Price: Low to High</option>
                <option value="price-high">💰 Price: High to Low</option>
                <option value="stock-low">📦 Stock: Low to High</option>
                <option value="stock-high">📦 Stock: High to Low</option>
                <option value="revenue-high">📈 Revenue: High to Low</option>
                <option value="revenue-low">📈 Revenue: Low to High</option>
                <option value="sales-high">🔥 Sales: High to Low</option>
                <option value="sales-low">🔥 Sales: Low to High</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
            </div>

            {/* Add New Product Button */}
            <button
              onClick={handleAddProduct}
              className="flex items-center space-x-2 text-white px-6 py-3 rounded-2xl transition-all duration-200 ease-in-out font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap w-full lg:w-auto justify-center"
              style={{ background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)', fontFamily: "'Poppins', sans-serif" }}
            >
              <Plus className="h-5 w-5" />
              <span>Add New Product</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading products...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        ) : (
          <>
            {/* Enhanced Products Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Revenue
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Sales
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {currentProducts.length === 0 ? (
                      <tr>
                        <td
                          colSpan="8"
                          className="px-6 py-16 text-center"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <div className="bg-gray-100 rounded-full p-6 mb-4">
                              <Package className="h-12 w-12 text-gray-400" />
                            </div>
                            <p className="text-lg font-bold text-gray-700 mb-1">
                              {searchQuery || categoryFilter !== 'all'
                                ? 'No products match your filters'
                                : 'No products found'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {searchQuery || categoryFilter !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Start by adding your first product'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentProducts.map((product, index) => {
                        const productRevenue = product.price * (product.totalSold || 0);
                        return (
                          <tr
                            key={product._id}
                            className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-200 group"
                          >
                            {/* Product */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-4">
                                {/* Enhanced Image */}
                                <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                                  {product.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling?.classList.remove('hidden');
                                      }}
                                    />
                                  ) : null}
                                  <Package className={`h-8 w-8 text-gray-400 ${product.image ? 'hidden' : ''}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-2">
                                    <p className="text-sm font-bold text-gray-900 truncate">
                                      {product.name}
                                    </p>
                                    {product.featured && (
                                      <span
                                        className="inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 shadow-sm"
                                        title="Featured Product"
                                      >
                                        <Star className="h-3 w-3 fill-yellow-900" />
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs font-medium text-gray-500 mt-1">
                                    {product.category}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-base font-extrabold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                GHS {product.price.toFixed(2)}
                              </p>
                            </td>

                            {/* Revenue */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <p className="text-sm font-bold text-gray-900">
                                  GHS {productRevenue.toFixed(2)}
                                </p>
                                {productRevenue > 0 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                                    <TrendingUp className="h-3 w-3 mr-0.5" />
                                    {product.totalSold || 0}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Sales */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <BarChart3 className="h-4 w-4 text-blue-500" />
                                <p className="text-sm font-semibold text-gray-700">
                                  {product.totalSold || 0} units
                                </p>
                              </div>
                            </td>

                            {/* Stock */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <Package className="h-4 w-4 text-gray-400" />
                                <p className="text-base font-bold text-gray-900">
                                  {product.stock}
                                </p>
                              </div>
                            </td>

                            {/* Unit */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                                {product.unit || 'N/A'}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {product.stock === 0 ? (
                                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border-2 border-red-200">
                                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                                  <span>Out of Stock</span>
                                </span>
                              ) : product.stock < 10 ? (
                                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border-2 border-orange-200">
                                  <AlertCircle className="h-3.5 w-3.5" />
                                  <span>Low Stock</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border-2 border-green-200">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>In Stock</span>
                                </span>
                              )}
                            </td>

                            {/* Action */}
                            <td className="px-6 py-4 whitespace-nowrap text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleEditProduct(product)}
                                  className="p-2.5 bg-blue-50 rounded-xl hover:bg-blue-100 hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-110"
                                  title="Edit Product"
                                >
                                  <Edit className="h-4 w-4 text-blue-600" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteProduct(product._id, product.name)
                                  }
                                  className="p-2.5 bg-red-50 rounded-xl hover:bg-red-100 hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-110"
                                  title="Delete Product"
                                >
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Enhanced Pagination Footer */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t-2 border-gray-200 bg-gray-50/50 flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-700">
                    Showing <span className="font-bold text-gray-900">{indexOfFirstItem + 1}</span>-
                    <span className="font-bold text-gray-900">{Math.min(indexOfLastItem, filteredProducts.length)}</span> of{' '}
                    <span className="font-bold text-gray-900">{filteredProducts.length}</span> products
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`p-2.5 rounded-xl border-2 transition-all duration-200 ${
                        currentPage === 1
                          ? 'text-gray-400 cursor-not-allowed bg-gray-50 border-gray-200'
                          : 'text-gray-700 hover:bg-gray-100 border-gray-300 hover:border-green-400 hover:text-green-600'
                      }`}
                    >
                      <ChevronLeft className="h-5 w-5" />
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
                            onClick={() => paginate(pageNum)}
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
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`p-2.5 rounded-xl border-2 transition-all duration-200 ${
                        currentPage === totalPages
                          ? 'text-gray-400 cursor-not-allowed bg-gray-50 border-gray-200'
                          : 'text-gray-700 hover:bg-gray-100 border-gray-300 hover:border-green-400 hover:text-green-600'
                      }`}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Product Form Modal */}
        <ProductForm
          product={editingProduct}
          isOpen={isFormOpen}
          onClose={() => {
            setIsFormOpen(false);
            setEditingProduct(null);
          }}
          onSuccess={handleFormSuccess}
        />
      </div>
    </div>
  );
};

export default AdminProductsPage;
