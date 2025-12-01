import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import {
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaTruck,
  FaDollarSign,
  FaShieldAlt,
  FaHeadset,
} from 'react-icons/fa';

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Featured products carousel
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [newArrivalsIndex, setNewArrivalsIndex] = useState(0);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchDeals();
  }, []);

  useEffect(() => {
    // Load recently viewed after products are loaded
    if (products.length > 0) {
      loadRecentlyViewed();
    }
  }, [products]);

  useEffect(() => {
    // Filter by search or category from URL
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    if (search || category) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/products');
      const data = response.data.data || response.data || [];
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchDeals = async () => {
    try {
      const response = await axios.get('/api/deals?active=true');
      setDeals(response.data.data || []);
    } catch (err) {
      console.error('Error fetching deals:', err);
    }
  };

  const loadRecentlyViewed = () => {
    const viewed = localStorage.getItem('recentlyViewed');
    if (viewed && products.length > 0) {
      try {
        const viewedIds = JSON.parse(viewed);
        const viewedProducts = products
          .filter((p) => viewedIds.includes(p._id))
          .slice(0, 6);
        setRecentlyViewed(viewedProducts);
      } catch (err) {
        console.error('Error loading recently viewed:', err);
      }
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Newsletter logic here
    alert('Thank you for subscribing!');
    setNewsletterEmail('');
  };

  // Filter products
  const searchQuery = searchParams.get('search') || '';
  const categoryQuery = searchParams.get('category') || '';

  let filteredProducts = products;
  if (searchQuery) {
    filteredProducts = products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  if (categoryQuery) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category === categoryQuery
    );
  }

  // Get featured products (highest sales or featured flag)
  const featuredProducts = products
    .filter((p) => p.featured || (p.totalSold && p.totalSold > 0))
    .sort((a, b) => (b.totalSold || 0) - (a.totalSold || 0))
    .slice(0, 8);

  // Get new arrivals (most recently added)
  const newArrivals = [...products]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  // Get recommended products (mix of popular and diverse categories)
  const recommendedProducts = products
    .filter((p) => p.totalSold > 0 || p.featured)
    .sort(() => Math.random() - 0.5)
    .slice(0, 6);

  // Category data with icons
  const categoryData = [
    { name: 'Oils & Spreads', icon: '🫒', slug: 'Oils' },
    { name: 'Grains & Flours', icon: '🌾', slug: 'Grains' },
    { name: 'Meat & Poultry', icon: '🍗', slug: 'Meat' },
    { name: 'Spices & Seasonings', icon: '🌶️', slug: 'Spices' },
    { name: 'Hausa Koko Mixes', icon: '🥣', slug: 'Hausa Koko' },
    { name: 'Beans & Legumes', icon: '🫘', slug: 'Beans' },
    { name: 'Powdered Foods', icon: '🥄', slug: 'Powder' },
    { name: 'Fresh & Smoked', icon: '🔥', slug: 'Fresh' },
  ];

  const testimonials = [
    {
      name: 'Aisha',
      location: 'Madina',
      text: 'The zomi oil was fresh and pure. Delivery came in just 2 hours!',
      rating: 5,
    },
    {
      name: 'Mohammed',
      location: 'Tamale',
      text: 'Best dawadawa I have ever bought. Very authentic Northern taste.',
      rating: 5,
    },
    {
      name: 'Fatima',
      location: 'Accra',
      text: 'The smoked guinea fowl was amazing! Will definitely order again.',
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden w-full max-w-full" style={{ backgroundColor: '#FAFAF9' }}>
      {/* Hero Section - Split Layout */}
      <section className="relative overflow-hidden w-full" style={{ 
        background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
        borderBottomLeftRadius: '50px',
        borderBottomRightRadius: '50px',
      }}>
        {/* Subtle SVG Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-green-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        
        <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-16 md:py-24 lg:py-32 relative z-10 max-w-full w-full">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left: Text Content */}
            <div className="flex-1 text-white animate-fade-in max-w-2xl">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight" style={{ 
                fontFamily: "'Playfair Display', serif",
                color: '#FFFFFF'
              }}>
                Fresh Local Foods
                <br />
                <span style={{ color: '#D1FAE5' }}>Delivered to Your Doorstep</span>
              </h1>
              <p className="text-xl md:text-2xl mb-10 leading-relaxed font-light" style={{ 
                color: '#D1FAE5',
                fontFamily: "'Lato', sans-serif"
              }}>
                From the Farm to your kitchen — fresh, organic and affordable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
                <Link
                  to="/products"
                  className="group relative bg-white text-green-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-green-50 transition-all duration-300 shadow-2xl hover:shadow-glow transform hover:-translate-y-1 hover:scale-105 overflow-hidden"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  <span className="relative z-10">Shop All Products</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
                <Link
                  to="/categories"
                  className="group bg-transparent border-2 border-white/90 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-white/10 hover:border-white backdrop-blur-sm transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Browse Categories
                </Link>
              </div>
            </div>

            {/* Right: Hero Image */}
            <div className="flex-1 flex justify-center lg:justify-end animate-fade-in">
              <div className="relative max-w-lg w-full">
                <div 
                  className="w-full aspect-square rounded-3xl overflow-hidden shadow-2xl"
                  style={{
                    filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.2))',
                    animation: 'float 6s ease-in-out infinite'
                  }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80"
                    alt="Fresh local foods from Northern Ghana"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80';
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0" style={{ height: '100px' }}>
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
            <path 
              d="M0,60 C300,100 600,20 900,60 C1050,80 1150,40 1200,60 L1200,120 L0,120 Z" 
              fill="#FAFAF9"
            />
          </svg>
        </div>
      </section>

      {/* Featured Categories - Circular Layout */}
      <section id="categories" className="py-20" style={{ backgroundColor: '#FAFAF9' }}>
        <div className="container mx-auto px-3 sm:px-4 max-w-full w-full">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ 
              fontFamily: "'Playfair Display', serif",
              color: '#065F46'
            }}>
              Shop by Category
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ 
              color: '#4A4A4A',
              fontFamily: "'Lato', sans-serif"
            }}>
              Explore our wide range of authentic Northern Ghana foods
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-6 md:gap-8">
            {categories.length > 0 ? (
              categories.map((category, index) => {
                // Get icon fallback
                const getIcon = (name) => {
                  if (name.toLowerCase().includes('oil')) return '🫒';
                  if (name.toLowerCase().includes('grain')) return '🌾';
                  if (name.toLowerCase().includes('meat') || name.toLowerCase().includes('protein')) return '🍗';
                  if (name.toLowerCase().includes('spice')) return '🌶️';
                  if (name.toLowerCase().includes('koko')) return '🥣';
                  if (name.toLowerCase().includes('bean')) return '🫘';
                  if (name.toLowerCase().includes('powder')) return '🥄';
                  if (name.toLowerCase().includes('fresh')) return '🔥';
                  return '📦';
                };

                return (
                  <Link
                    key={category._id}
                    to={`/products?category=${encodeURIComponent(category.name)}`}
                    className="group relative text-center overflow-hidden"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="relative z-10">
                      {/* Circular Image */}
                      {category.image ? (
                        <div className="mb-4 flex justify-center">
                          <div 
                            className="w-28 h-28 rounded-full overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl"
                            style={{
                              boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                              border: '4px solid white'
                            }}
                          >
                            <img
                              src={category.image}
                              alt={category.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center text-4xl rounded-full">${getIcon(category.name)}</div>`;
                              }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="mb-4 flex justify-center">
                          <div 
                            className="w-28 h-28 rounded-full flex items-center justify-center text-5xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl"
                            style={{
                              backgroundColor: '#F3F4F6',
              boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
              border: '4px solid white'
            }}
                          >
                            {getIcon(category.name)}
                          </div>
                        </div>
                      )}
                      <h3 className="text-sm font-bold transition-colors duration-300" style={{ 
                        color: '#065F46',
                        fontFamily: "'Poppins', sans-serif"
                      }} onMouseEnter={(e) => e.target.style.color = '#10B981'} onMouseLeave={(e) => e.target.style.color = '#065F46'}>
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                );
              })
            ) : (
              categoryData.map((cat, index) => (
                <Link
                  key={cat.slug}
                  to={`/products?category=${encodeURIComponent(cat.slug)}`}
                  className="group relative text-center overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative z-10">
                    {/* Circular Icon Container */}
                    <div className="mb-4 flex justify-center">
                      <div 
                        className="w-28 h-28 rounded-full flex items-center justify-center text-5xl transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl"
                        style={{
                          backgroundColor: '#F3F4F6',
                          boxShadow: '0 5px 20px rgba(0,0,0,0.1)',
                          border: '4px solid white'
                        }}
                      >
                        {cat.icon}
                      </div>
                    </div>
                    <h3 className="text-sm font-bold transition-colors duration-300" style={{ 
                      color: '#065F46',
                      fontFamily: "'Poppins', sans-serif"
                    }} onMouseEnter={(e) => e.target.style.color = '#10B981'} onMouseLeave={(e) => e.target.style.color = '#065F46'}>
                      {cat.name}
                    </h3>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="py-20" style={{ backgroundColor: '#FAFAF9' }}>
          <div className="container mx-auto px-3 sm:px-4 max-w-full w-full">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-2" style={{ 
                  fontFamily: "'Playfair Display', serif",
                  color: '#065F46'
                }}>
                  Featured Products
                </h2>
                <p className="text-lg" style={{ 
                  color: '#4A4A4A',
                  fontFamily: "'Lato', sans-serif"
                }}>Handpicked favorites from our collection</p>
              </div>
              <div className="hidden md:flex space-x-3">
                <button
                  onClick={() =>
                    setFeaturedIndex((prev) =>
                      prev > 0 ? prev - 1 : Math.floor(featuredProducts.length / 4) - 1
                    )
                  }
                  className="p-3 bg-white rounded-full shadow-medium hover:shadow-large hover:bg-green-50 transition-all duration-300 border border-gray-100 hover:scale-110"
                >
                  <FaChevronLeft className="text-gray-700 w-5 h-5" />
                </button>
                <button
                  onClick={() =>
                    setFeaturedIndex((prev) =>
                      prev < Math.floor(featuredProducts.length / 4) - 1
                        ? prev + 1
                        : 0
                    )
                  }
                  className="p-3 bg-white rounded-full shadow-medium hover:shadow-large hover:bg-green-50 transition-all duration-300 border border-gray-100 hover:scale-110"
                >
                  <FaChevronRight className="text-gray-700 w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-6 overflow-hidden">
              {featuredProducts
                .slice(featuredIndex * 4, (featuredIndex + 1) * 4)
                .map((product, index) => (
                  <div
                    key={product._id}
                    className="animate-scale-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <section className="py-20" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="container mx-auto px-3 sm:px-4 max-w-full w-full">
            <div className="mb-12">
              <div className="inline-block mb-4">
                <span className="px-4 py-2 rounded-full text-sm font-bold" style={{ 
                  backgroundColor: '#D1FAE5',
                  color: '#065F46',
                  fontFamily: "'Poppins', sans-serif"
                }}>
                  🆕 Just Added
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-3" style={{ 
                fontFamily: "'Playfair Display', serif",
                color: '#065F46'
              }}>
                New Arrivals
              </h2>
              <p className="text-lg" style={{ 
                color: '#4A4A4A',
                fontFamily: "'Lato', sans-serif"
              }}>
                Freshly added products - get them while they last!
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 md:gap-6">
              {newArrivals.map((product, index) => (
                <div
                  key={product._id}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Deals of the Week */}
      {deals.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-orange-50 via-red-50 to-orange-50 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-200/20 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12">
              <div className="mb-4 md:mb-0">
                <div className="inline-block mb-4">
                  <span className="px-4 py-2 bg-red-500 text-white rounded-full text-sm font-bold shadow-lg">
                    ⚡ Limited Time
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
                  Deals of the Week
                </h2>
                <p className="text-lg text-gray-600">Special offers and bundles</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {deals.slice(0, 6).map((deal, index) => {
                const getBadgeColor = (dealType) => {
                  switch (dealType) {
                    case 'bundle':
                      return 'bg-red-500';
                    case 'mix':
                      return 'bg-green-500';
                    case 'seasonal':
                      return 'bg-purple-500';
                    case 'flash':
                      return 'bg-orange-500';
                    default:
                      return 'bg-gray-500';
                  }
                };

                const getStatusIcon = (status) => {
                  switch (status) {
                    case 'hot':
                      return '🔥';
                    case 'popular':
                      return '⭐';
                    case 'new':
                      return '🎉';
                    default:
                      return '⭐';
                  }
                };

                return (
                  <div
                    key={deal._id}
                    className="group bg-white rounded-2xl shadow-large overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 border border-gray-100 animate-scale-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {deal.image && (
                      <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                        <img
                          src={deal.image}
                          alt={deal.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    )}
                    <div className="p-6 relative">
                      <div className="flex items-center justify-between mb-4">
                        <span
                          className={`${getBadgeColor(
                            deal.dealType
                          )} text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-md`}
                        >
                          {deal.badgeText || deal.dealType}
                        </span>
                        <span className="text-sm text-gray-600 font-medium flex items-center gap-1">
                          {getStatusIcon(deal.status)} {deal.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                        {deal.title}
                      </h3>
                      <div className="flex items-baseline flex-wrap gap-2 mb-4">
                        <span className="text-3xl font-extrabold text-green-600">
                          GHS {deal.discountedPrice.toFixed(2)}
                        </span>
                        <span className="text-lg text-gray-400 line-through">
                          GHS {deal.originalPrice.toFixed(2)}
                        </span>
                        {deal.savingsPercentage && (
                          <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-sm font-bold">
                            Save {deal.savingsPercentage}%
                          </span>
                        )}
                      </div>
                      {deal.description && (
                        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                          {deal.description}
                        </p>
                      )}
                      <button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3.5 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Shop by Region */}
      <section className="py-20 bg-gradient-to-br from-green-50 via-orange-50 to-green-50 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 right-10 w-64 h-64 bg-green-200 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-48 h-48 bg-orange-200 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-large overflow-hidden border border-white/50">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-10 md:p-14 lg:p-16 flex flex-col justify-center bg-gradient-to-br from-white to-green-50/30">
                <div className="mb-6">
                  <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-bold mb-4">
                    🌍 Authentic Northern Ghana
                  </span>
                </div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                  Shop Authentic Northern Ghana Foods
                </h2>
                <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                  Discover the rich flavors and traditions of Northern Ghana. From
                  traditional millet balls to smoked meats, we bring authentic
                  Northern cuisine to your doorstep.
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center justify-center bg-gradient-to-r from-green-600 to-green-500 text-white px-10 py-4 rounded-xl font-bold hover:from-green-700 hover:to-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 w-fit"
                >
                  Explore Our Products
                  <span className="ml-2">→</span>
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-3 p-6 md:p-8 bg-gradient-to-br from-gray-50 to-gray-100">
                {['🌾', '🥜', '🫒', '🔥', '🌶️', '🍗'].map((icon, i) => (
                  <div
                    key={i}
                    className="group aspect-square bg-white rounded-2xl flex items-center justify-center text-5xl shadow-soft hover:shadow-large transition-all duration-300 hover:-translate-y-2 hover:scale-110 border border-gray-100"
                  >
                    <span className="group-hover:scale-125 transition-transform duration-300">{icon}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Shop With Us - Glassmorphism Cards */}
      <section className="py-20" style={{ backgroundColor: '#FAFAF9' }}>
        <div className="container mx-auto px-3 sm:px-4 max-w-full w-full">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ 
              fontFamily: "'Playfair Display', serif",
              color: '#065F46'
            }}>
              Why Shop With Us
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ 
              color: '#4A4A4A',
              fontFamily: "'Lato', sans-serif"
            }}>
              We're committed to bringing you the freshest, most authentic local foods
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              {
                icon: <FaCheckCircle className="text-5xl text-green-600" />,
                title: 'Fresh & Authentic',
                text: 'Local Ingredients',
                color: 'green',
              },
              {
                icon: <FaTruck className="text-5xl text-blue-600" />,
                title: 'Same-Day Delivery',
                text: 'Selected Areas',
                color: 'blue',
              },
              {
                icon: <FaDollarSign className="text-5xl text-orange-600" />,
                title: 'Great Prices',
                text: 'Bulk Buyers',
                color: 'orange',
              },
              {
                icon: <FaShieldAlt className="text-5xl text-purple-600" />,
                title: '100% Halal',
                text: 'Products',
                color: 'purple',
              },
              {
                icon: <FaHeadset className="text-5xl text-green-600" />,
                title: 'Reliable Service',
                text: 'Fast Support',
                color: 'green',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="group text-center p-8 rounded-2xl hover:shadow-xl transition-all duration-500 hover:-translate-y-3"
                style={{ 
                  animationDelay: `${i * 100}ms`,
                  background: 'rgba(255, 255, 255, 0.85)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
                  borderRadius: '20px'
                }}
              >
                <div className="mb-5 flex justify-center transform group-hover:scale-110 transition-transform duration-300">
                  {item.icon}
                </div>
                <h3 className="font-bold mb-2 text-lg transition-colors" style={{ 
                  color: '#065F46',
                  fontFamily: "'Poppins', sans-serif"
                }} onMouseEnter={(e) => e.target.style.color = '#10B981'} onMouseLeave={(e) => e.target.style.color = '#065F46'}>
                  {item.title}
                </h3>
                <p className="text-sm font-medium" style={{ 
                  color: '#4A4A4A',
                  fontFamily: "'Lato', sans-serif"
                }}>{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16" style={{ backgroundColor: '#FAFAF9' }}>
        <div className="container mx-auto px-3 sm:px-4 max-w-full w-full">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ 
            fontFamily: "'Playfair Display', serif",
            color: '#065F46'
          }}>
            What Our Customers Say
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-shadow"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, j) => (
                    <span key={j} className="text-yellow-400 text-lg">
                      ⭐
                    </span>
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-green-600 font-bold">
                      {testimonial.name[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-gray-600">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recommended For You */}
      {recommendedProducts.length > 0 && (
        <section className="py-16" style={{ backgroundColor: '#FAFAF9' }}>
          <div className="container mx-auto px-3 sm:px-4 max-w-full w-full">
            <h2 className="text-3xl font-bold mb-8" style={{ 
              fontFamily: "'Playfair Display', serif",
              color: '#065F46'
            }}>
              Recommended For You
            </h2>
            <p className="mb-6" style={{ 
              color: '#4A4A4A',
              fontFamily: "'Lato', sans-serif"
            }}>
              Based on your browsing and popular trends
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {recommendedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <section className="py-16" style={{ backgroundColor: '#FFFFFF' }}>
          <div className="container mx-auto px-3 sm:px-4 max-w-full w-full">
            <h2 className="text-3xl font-bold mb-8" style={{ 
              fontFamily: "'Playfair Display', serif",
              color: '#065F46'
            }}>
              Recently Viewed
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {recentlyViewed.slice(0, 6).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="py-20 bg-gradient-to-br from-green-600 via-green-700 to-green-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        </div>
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-green-400/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
            Stay Updated with Fresh Stock & Deals
          </h2>
          <p className="text-green-50 mb-10 max-w-2xl mx-auto text-lg">
            Get updates on fresh stock, discounts & new arrivals delivered to
            your inbox.
          </p>
          <form
            onSubmit={handleNewsletterSubmit}
            className="max-w-lg mx-auto flex gap-3 bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20"
          >
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/90 font-medium"
              required
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-orange-600 px-10 py-4 rounded-xl font-bold hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Main Products Grid (if search/category filter) */}
      {(searchQuery || categoryQuery) && (
        <section className="py-16" style={{ backgroundColor: '#FAFAF9' }}>
          <div className="container mx-auto px-3 sm:px-4 max-w-full w-full">
            <h2 className="text-3xl font-bold mb-8" style={{ 
              fontFamily: "'Playfair Display', serif",
              color: '#065F46'
            }}>
              {searchQuery
                ? `Search Results for "${searchQuery}"`
                : `${categoryQuery} Products`}
              {' '}
              ({filteredProducts.length})
            </h2>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Loading products...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-gray-600 mb-2">No products found</p>
                <Link
                  to="/"
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  View All Products
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
