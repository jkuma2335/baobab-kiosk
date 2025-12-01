import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/Footer';
import { FaSearch } from 'react-icons/fa';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/categories');
      setCategories(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Failed to load categories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  // Count products per category
  const getProductCount = (categoryName) => {
    return products.filter((p) => p.category === categoryName).length;
  };

  // Filter categories by search
  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Category icons mapping
  const categoryIcons = {
    'Oils': '🫒',
    'Grains': '🌾',
    'Meat': '🍗',
    'Spices': '🌶️',
    'Hausa Koko': '🥣',
    'Beans': '🫘',
    'Powder': '🥄',
    'Fresh': '🔥',
    'default': '📦',
  };

  const getCategoryIcon = (categoryName) => {
    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (categoryName.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    return categoryIcons.default;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Browse Categories
            </h1>
            <p className="text-xl text-green-100 mb-8">
              Explore our wide range of product categories
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md mx-auto">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="container mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center max-w-md mx-auto">
            {error}
          </div>
        ) : filteredCategories.length > 0 ? (
          <>
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {searchQuery
                  ? `Search Results (${filteredCategories.length})`
                  : `All Categories (${filteredCategories.length})`}
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredCategories.map((category) => {
                const productCount = getProductCount(category.name);
                return (
                  <Link
                    key={category._id}
                    to={`/products?category=${encodeURIComponent(category.name)}`}
                    className="group bg-white rounded-2xl p-8 shadow-soft border-2 border-gray-200 hover:border-green-500 hover:shadow-large transition-all duration-500 transform hover:-translate-y-3 text-center overflow-hidden relative"
                  >
                    {/* Background gradient on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-green-50/0 to-green-50/0 group-hover:from-green-50/50 group-hover:to-transparent transition-all duration-500 rounded-2xl"></div>
                    {/* Category Image/Icon */}
                    <div className="mb-4 flex justify-center">
                      {category.image ? (
                        <div className="relative w-28 h-28 rounded-2xl overflow-hidden border-4 border-gray-100 group-hover:border-green-300 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-110">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `
                                <div class="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-5xl">
                                  ${getCategoryIcon(category.name)}
                                </div>
                              `;
                            }}
                          />
                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                      ) : (
                        <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-5xl group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300 shadow-lg group-hover:shadow-xl group-hover:scale-110 border-4 border-gray-100 group-hover:border-green-300">
                          {getCategoryIcon(category.name)}
                        </div>
                      )}
                    </div>

                    {/* Category Name */}
                    <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors">
                      {category.name}
                    </h3>

                    {/* Product Count */}
                    <p className="text-sm text-gray-600 mb-3">
                      {productCount} {productCount === 1 ? 'product' : 'products'}
                    </p>

                    {/* View Button */}
                    <div className="mt-4 inline-block px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-semibold group-hover:bg-green-600 group-hover:text-white transition-colors">
                      View Products →
                    </div>

                    {/* Description (if available) */}
                    {category.description && (
                      <p className="mt-3 text-xs text-gray-500 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-xl text-gray-600 mb-2">No categories found</p>
            <p className="text-gray-500 mb-6">
              {searchQuery
                ? 'Try a different search term'
                : 'No categories available at the moment'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* CTA Section */}
      {categories.length > 0 && (
        <div className="bg-green-50 py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Can't find what you're looking for?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Browse all our products or contact us for special orders
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/products"
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                View All Products
              </Link>
              <Link
                to="/"
                className="px-8 py-3 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default CategoriesPage;

