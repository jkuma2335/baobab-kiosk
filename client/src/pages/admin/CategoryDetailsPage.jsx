import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import CategoryModal from '../../components/CategoryModal';
import { toast } from 'react-toastify';
import {
  DollarSign,
  Package,
  TrendingUp,
  Edit,
  ArrowLeft,
  Package2,
  AlertCircle,
  CheckCircle2,
  Menu,
} from 'lucide-react';

const CategoryDetailsPage = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const decodedCategoryName = decodeURIComponent(categoryName);

  const [categoryData, setCategoryData] = useState(null);
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchCategoryDetails();
    fetchProducts();
    fetchCategoryInfo();
  }, [decodedCategoryName]);

  const fetchCategoryDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `/api/analytics/category/${encodeURIComponent(decodedCategoryName)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCategoryData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching category details:', err);
      setError('Failed to load category analytics');
      toast.error('Failed to load category analytics');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `/api/products?category=${encodeURIComponent(decodedCategoryName)}`
      );
      setProducts(response.data.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchCategoryInfo = async () => {
    try {
      const response = await axios.get('/api/categories');
      const categories = response.data.data || [];
      const foundCategory = categories.find(
        (cat) => cat.name === decodedCategoryName
      );
      setCategory(foundCategory || null);
    } catch (err) {
      console.error('Error fetching category info:', err);
    }
  };

  const handleEditCategory = () => {
    if (category) {
      setIsModalOpen(true);
    }
  };

  const handleModalSuccess = () => {
    fetchCategoryInfo();
    fetchCategoryDetails(); // Refresh analytics
  };

  const getStatusBadge = (stock) => {
    if (stock === 0) {
      return (
        <div className="flex items-center space-x-1.5">
          <div className="h-2 w-2 rounded-full bg-red-500"></div>
          <span className="text-sm font-medium text-red-600">Out of Stock</span>
        </div>
      );
    } else if (stock < 10) {
      return (
        <div className="flex items-center space-x-1.5">
          <AlertCircle className="h-4 w-4 text-orange-500" />
          <span className="text-sm font-medium text-orange-600">Low Stock</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-1.5">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-green-600">In Stock</span>
        </div>
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="lg:ml-64 flex-1 p-3 sm:p-4 md:p-6 lg:p-8 w-full overflow-x-hidden">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden mb-4 p-2 rounded-lg bg-white shadow-md hover:bg-pink-50 transition-colors"
          style={{ color: '#B76E79' }}
        >
          <Menu className="h-6 w-6" />
        </button>
        {/* Header with Back Button */}
        <div className="mb-8">
          <Link
            to="/admin/categories"
            className="inline-flex items-center space-x-2 text-sm text-gray-600 hover:text-green-600 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Categories</span>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                {decodedCategoryName}
              </h1>
              <p className="text-sm text-gray-600">
                Category analytics and product management
              </p>
            </div>
            {category && (
              <button
                onClick={handleEditCategory}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 ease-in-out font-medium"
              >
                <Edit className="h-4 w-4" />
                <span>Edit Category</span>
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading category details...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        ) : categoryData ? (
          <>
            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Category Revenue */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-green-100 rounded-lg p-3">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Category Revenue
                </p>
                <p className="text-3xl font-bold text-gray-800 mb-1">
                  GHS {categoryData.categoryRevenue.toFixed(2)}
                </p>
                {categoryData.performanceScore > 0 && (
                  <p className="text-xs text-gray-500">
                    {categoryData.performanceScore.toFixed(1)}% of total store
                    revenue
                  </p>
                )}
              </div>

              {/* Inventory Value */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Inventory Value
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  GHS {categoryData.totalInventoryValue.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">Current stock value</p>
              </div>

              {/* Sales Volume */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-purple-100 rounded-lg p-3">
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Sales Volume
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {categoryData.salesVelocity} units
                </p>
                <p className="text-xs text-gray-500">Total items sold</p>
              </div>
            </div>

            {/* Middle Section - Products Table and Top Performers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Products Table - 2/3 width */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Products in this Category ({products.length})
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {products.length === 0 ? (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-6 py-12 text-center text-gray-500 text-sm"
                          >
                            No products found in this category
                          </td>
                        </tr>
                      ) : (
                        products.map((product, index) => (
                          <tr
                            key={product._id}
                            className={`transition-all duration-200 ease-in-out ${
                              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            } hover:bg-gray-100`}
                          >
                            {/* Product */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-3">
                                <div className="h-[70px] w-[70px] rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                                  {product.image ? (
                                    <img
                                      src={product.image}
                                      alt={product.name}
                                      className="h-full w-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  ) : (
                                    <Package2 className="h-8 w-8 text-gray-400" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {product.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {product.unit}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm font-semibold text-gray-900">
                                GHS {product.price.toFixed(2)}
                              </p>
                            </td>

                            {/* Revenue */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm font-semibold text-gray-900">
                                GHS{' '}
                                {(product.price * (product.totalSold || 0)).toFixed(2)}
                              </p>
                            </td>

                            {/* Stock */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm font-semibold text-gray-900">
                                {product.stock}
                              </p>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(product.stock)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top Performers - 1/3 width */}
              <div className="lg:col-span-1 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Top Performers
                </h2>
                {categoryData.topProducts && categoryData.topProducts.length > 0 ? (
                  <div className="space-y-4">
                    {                        categoryData.topProducts.map((product, index) => (
                      <div
                        key={product._id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-all duration-200 ease-in-out"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-16 w-16 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <Package2 className="h-6 w-6 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-xs font-bold text-gray-400">
                                #{index + 1}
                              </span>
                              <p className="text-sm font-semibold text-gray-900 truncate">
                                {product.name}
                              </p>
                            </div>
                            <p className="text-xs font-bold text-green-600">
                              GHS {product.revenue.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {product.totalSold} sold
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No sales data available yet
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}

        {/* Category Modal */}
        <CategoryModal
          category={category}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
          }}
          onSuccess={handleModalSuccess}
        />
      </div>
    </div>
  );
};

export default CategoryDetailsPage;

