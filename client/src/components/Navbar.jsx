import { Link, useNavigate } from 'react-router-dom';
import { FaShoppingCart, FaUser, FaSearch, FaBox } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const Navbar = () => {
  const { toggleCart, itemCount } = useCart();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [products, setProducts] = useState([]);
  const searchRef = useRef(null);

  useEffect(() => {
    // Check if user is logged in
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      try {
        setUser(JSON.parse(userInfo));
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    }
    // Fetch products for search
    fetchProducts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() && products.length > 0) {
      const filtered = products
        .filter((p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .slice(0, 5);
      setSearchSuggestions(filtered);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery, products]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setProducts(response.data.data || response.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchExpanded(false);
    }
  };

  const popularSearches = ['Hausa Koko', 'Zomi Oil', 'Dawadawa', 'Guinea Fowl'];

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-soft sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="text-4xl group-hover:scale-110 transition-transform duration-300">🌾</div>
            <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
              Baobab Kiosk
            </h1>
          </Link>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-2xl mx-8 relative" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchExpanded(true)}
                  className={`w-full pl-10 pr-4 py-2 border-2 rounded-lg focus:outline-none focus:border-green-500 transition-all ${
                    isSearchExpanded
                      ? 'border-green-500 shadow-lg'
                      : 'border-gray-300'
                  }`}
                />
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </form>

            {/* Search Suggestions Dropdown */}
            {isSearchExpanded && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                {searchQuery.trim() && searchSuggestions.length > 0 ? (
                  <>
                    <div className="p-2 text-xs font-semibold text-gray-500 uppercase border-b">
                      Suggestions
                    </div>
                    {searchSuggestions.map((product) => (
                      <Link
                        key={product._id}
                        to={`/product/${product._id}`}
                        onClick={() => setIsSearchExpanded(false)}
                        className="flex items-center space-x-3 p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <span>🛒</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            GHS {product.price.toFixed(2)}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </>
                ) : searchQuery.trim() ? (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No products found
                  </div>
                ) : (
                  <>
                    <div className="p-2 text-xs font-semibold text-gray-500 uppercase border-b">
                      Popular Searches
                    </div>
                    <div className="p-3">
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((search) => (
                          <button
                            key={search}
                            onClick={() => {
                              setSearchQuery(search);
                              navigate(`/?search=${encodeURIComponent(search)}`);
                              setIsSearchExpanded(false);
                            }}
                            className="px-3 py-1 bg-gray-100 hover:bg-green-50 text-gray-700 rounded-full text-sm transition-colors"
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            {/* Cart */}
            <button
              onClick={toggleCart}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-colors group"
            >
              <FaShoppingCart className="text-xl text-gray-700 group-hover:text-green-600 transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs px-1.5 min-w-[20px] text-center font-semibold animate-pulse">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Track Your Orders */}
            <Link
              to="/track-order"
              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-full transition-colors group"
              title="Track Your Orders"
            >
              <FaBox className="text-xl text-gray-700 group-hover:text-green-600 transition-colors" />
              <span className="text-sm font-medium text-gray-700 hidden md:inline">
                Track Order
              </span>
            </Link>

            {/* Account / Login */}
            {user && user.isAdmin ? (
              <>
                <Link
                  to="/admin/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
                >
                  Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-full transition-colors group"
                title="Account"
              >
                <FaUser className="text-xl text-gray-700 group-hover:text-green-600 transition-colors" />
                <span className="text-sm font-medium text-gray-700 hidden md:inline">
                  {user ? user.name : 'Login'}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


