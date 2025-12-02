import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import CategoryModal from '../../components/CategoryModal';
import { toast } from 'react-toastify';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Folder,
  Hash,
  Package,
  Grid3x3,
  TrendingUp,
  Menu,
} from 'lucide-react';

const AdminCategoriesPage = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [productCounts, setProductCounts] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchProductCounts();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchQuery]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/categories');
      setCategories(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again later.');
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductCounts = async () => {
    try {
      const response = await axios.get('/api/products');
      const products = response.data.data || [];
      
      // Count products per category
      const counts = {};
      products.forEach((product) => {
        if (product.category) {
          counts[product.category] = (counts[product.category] || 0) + 1;
        }
      });
      
      setProductCounts(counts);
    } catch (err) {
      console.error('Error fetching product counts:', err);
    }
  };

  const filterCategories = () => {
    let filtered = [...categories];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().includes(query) ||
          category.slug?.toLowerCase().includes(query)
      );
    }

    setFilteredCategories(filtered);
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId, categoryName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/api/categories/${categoryId}`);
      toast.success('Category deleted successfully!');
      fetchCategories();
      fetchProductCounts(); // Refresh product counts
    } catch (err) {
      console.error('Error deleting category:', err);
      const errorMessage =
        err.response?.data?.message || 'Failed to delete category';
      toast.error(errorMessage);
    }
  };

  const handleModalSuccess = () => {
    fetchCategories();
    fetchProductCounts(); // Refresh product counts
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  // Calculate stats
  const totalCategories = categories.length;
  const categoriesWithProducts = Object.keys(productCounts).length;
  const totalProductsInCategories = Object.values(productCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#FFF5F7', fontFamily: "'Lato', sans-serif" }}>
      <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="lg:ml-64 flex-1 p-3 sm:p-4 md:p-6 w-full overflow-x-hidden">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden mb-4 p-2 rounded-lg bg-white shadow-md hover:bg-pink-50 transition-colors"
          style={{ color: '#B76E79' }}
        >
          <Menu className="h-6 w-6" />
        </button>
        {/* Enhanced Header Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#B76E79', background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Categories
              </h1>
              <p className="text-sm mt-2 font-medium" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>
                Manage product categories and store sections
              </p>
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
                    Total Categories
                  </p>
                  <p className="text-5xl font-extrabold bg-gradient-to-br from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    {totalCategories}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform">
                  <Grid3x3 className="text-white text-xl" />
                </div>
              </div>
              <div className="flex items-center text-xs font-medium mt-4 pt-4 border-t border-gray-100">
                <span className="text-blue-600 font-semibold">Store sections</span>
              </div>
            </div>
          </div>

          <div className="group relative rounded-2xl shadow-lg border p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF5F7 100%)', borderColor: '#FFB6C1', boxShadow: '0 10px 25px -5px rgba(255, 105, 180, 0.15)' }}>
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-2xl" style={{ backgroundColor: 'rgba(255, 105, 180, 0.2)' }}></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>
                    Active Categories
                  </p>
                  <p className="text-5xl font-extrabold" style={{ color: '#50C878', fontFamily: "'Playfair Display', serif" }}>
                    {categoriesWithProducts}
                  </p>
                </div>
                <div className="rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform" style={{ background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)' }}>
                  <Folder className="text-white text-xl" />
                </div>
              </div>
              <div className="flex items-center text-xs font-medium mt-4 pt-4 border-t" style={{ borderColor: '#FFB6C1' }}>
                <span className="font-semibold" style={{ color: '#50C878', fontFamily: "'Poppins', sans-serif" }}>With products</span>
              </div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-white via-purple-50/30 to-white rounded-2xl shadow-lg border border-purple-100/50 p-6 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Total Products
                  </p>
                  <p className="text-5xl font-extrabold bg-gradient-to-br from-purple-600 to-purple-700 bg-clip-text text-transparent">
                    {totalProductsInCategories}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-3 shadow-lg group-hover:scale-110 transition-transform">
                  <Package className="text-white text-xl" />
                </div>
              </div>
              <div className="flex items-center text-xs font-medium mt-4 pt-4 border-t border-gray-100">
                <span className="text-purple-600 font-semibold">Across all categories</span>
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
                placeholder="Search by name or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all hover:border-gray-300"
              />
            </div>

            {/* Add New Category Button */}
            <button
              onClick={handleAddCategory}
              className="flex items-center space-x-2 text-white px-6 py-3 rounded-2xl transition-all duration-200 ease-in-out font-semibold text-sm shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap w-full lg:w-auto justify-center"
              style={{ background: 'linear-gradient(135deg, #FF69B4 0%, #B76E79 100%)', fontFamily: "'Poppins', sans-serif" }}
            >
              <Plus className="h-5 w-5" />
              <span>Add New Category</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#FF69B4' }}></div>
            <p className="mt-4 text-gray-600 font-medium">Loading categories...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-2 border-red-400 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        ) : (
          <>
            {/* Enhanced Categories Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Image
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Slug
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Associated Products
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredCategories.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-16 text-center"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <div className="bg-gray-100 rounded-full p-6 mb-4">
                              <Folder className="h-12 w-12 text-gray-400" />
                            </div>
                            <p className="text-lg font-bold text-gray-700 mb-1">
                              {searchQuery
                                ? 'No categories match your search'
                                : 'No categories found'}
                            </p>
                            <p className="text-sm text-gray-500">
                              {searchQuery
                                ? 'Try adjusting your search'
                                : 'Start by adding your first category'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredCategories.map((category, index) => {
                        const productCount = productCounts[category.name] || 0;
                        return (
                          <tr
                            key={category._id}
                            onClick={() =>
                              navigate(
                                `/admin/categories/${encodeURIComponent(category.name)}`
                              )
                            }
                            className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all duration-200 cursor-pointer group"
                          >
                            {/* Enhanced Image */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md group-hover:shadow-lg transition-shadow">
                                {category.image ? (
                                  <img
                                    src={category.image}
                                    alt={category.name}
                                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <Folder className={`h-8 w-8 text-gray-400 ${category.image ? 'hidden' : ''}`} />
                              </div>
                            </td>

                            {/* Enhanced Name */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <p className="text-sm font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                  {category.name}
                                </p>
                                {category.description && (
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                    {category.description}
                                  </p>
                                )}
                              </div>
                            </td>

                            {/* Enhanced Slug */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <div className="bg-gray-100 rounded-lg p-1.5">
                                  <Hash className="h-4 w-4 text-gray-500" />
                                </div>
                                <span className="text-sm font-mono font-semibold text-gray-700 bg-gray-50 px-2 py-1 rounded">
                                  {category.slug || 'N/A'}
                                </span>
                              </div>
                            </td>

                            {/* Enhanced Associated Products */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <div className="bg-purple-100 rounded-lg p-1.5">
                                  <Package className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-gray-900">
                                    {productCount}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {productCount === 1 ? 'product' : 'products'}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Enhanced Action */}
                            <td
                              className="px-6 py-4 whitespace-nowrap text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => handleEditCategory(category)}
                                  className="p-2.5 bg-blue-50 rounded-xl hover:bg-blue-100 hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-110"
                                  title="Edit Category"
                                >
                                  <Edit className="h-4 w-4 text-blue-600" />
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeleteCategory(category._id, category.name)
                                  }
                                  className="p-2.5 bg-red-50 rounded-xl hover:bg-red-100 hover:shadow-md transition-all duration-200 ease-in-out transform hover:scale-110"
                                  title="Delete Category"
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
            </div>
          </>
        )}

        {/* Category Modal */}
        <CategoryModal
          category={editingCategory}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingCategory(null);
          }}
          onSuccess={handleModalSuccess}
        />
      </div>
    </div>
  );
};

export default AdminCategoriesPage;
