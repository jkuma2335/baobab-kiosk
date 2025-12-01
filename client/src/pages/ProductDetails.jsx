import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { FaArrowLeft, FaHome, FaChevronRight, FaWhatsapp, FaFacebook, FaTwitter, FaShare, FaCheckCircle, FaTruck, FaShieldAlt } from 'react-icons/fa';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { toast } from 'react-toastify';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [imageZoom, setImageZoom] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data.data);
      setError(null);

      // Track product view after 1 second to avoid counting accidental instant bounces
      setTimeout(() => {
        axios.put(`/api/products/${id}/view`).catch((err) => {
          console.error('Error tracking view:', err);
        });
      }, 1000);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      // Add product with quantity
      // Note: addToCart increments quantity if item already exists in cart
      // So we call it once per desired quantity
      for (let i = 0; i < quantity; i++) {
        addToCart(product);
      }
      // Show summary toast after all items are added
      setTimeout(() => {
        toast.success(`${quantity} ${quantity === 1 ? 'item' : 'items'} added to cart!`, {
          position: 'bottom-right',
          autoClose: 2000,
        });
      }, 50);
      setQuantity(1); // Reset quantity
    }
  };

  const handleQuantityChange = (change) => {
    setQuantity((prev) => {
      const newQuantity = prev + change;
      if (newQuantity < 1) return 1;
      if (product && newQuantity > product.stock) return product.stock;
      return newQuantity;
    });
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = `Check out ${product?.name} at Baobab Kiosk!`;
    
    let shareUrl = '';
    switch (platform) {
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      default:
        // Copy to clipboard
        navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard!');
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4" style={{ color: '#555' }}>Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
        <div className="text-center">
          <p className="text-xl mb-4" style={{ color: '#555' }}>{error || 'Product not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="font-semibold transition-colors"
            style={{ color: '#2ecc71' }}
            onMouseEnter={(e) => e.target.style.color = '#27ae60'}
            onMouseLeave={(e) => e.target.style.color = '#2ecc71'}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden w-full max-w-full" style={{ backgroundColor: '#f9fafb', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl w-full">
        {/* Breadcrumb Navigation */}
        <nav className="mb-4 sm:mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm flex-wrap" style={{ color: '#888' }}>
            <li>
              <Link to="/" className="hover:text-green-600 transition-colors flex items-center">
                <FaHome className="mr-1" />
                Home
              </Link>
            </li>
            <li>
              <FaChevronRight className="mx-2 text-xs" />
            </li>
            <li>
              <Link 
                to={`/products?category=${encodeURIComponent(product.category)}`}
                className="hover:text-green-600 transition-colors capitalize"
              >
                {product.category}
              </Link>
            </li>
            <li>
              <FaChevronRight className="mx-2 text-xs" />
            </li>
            <li className="text-gray-800 font-medium" style={{ color: '#1a1a1a' }}>
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-10 p-4 sm:p-5 lg:p-8">
            {/* Product Image Gallery */}
            <div className="flex flex-col space-y-4">
              {/* Main Image */}
              <div 
                className="relative w-full overflow-hidden min-h-[250px] sm:min-h-[400px]"
                style={{
                  borderRadius: '14px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  border: '1px solid #f0f0f0',
                  backgroundColor: '#fafafa'
                }}
                onMouseEnter={() => setImageZoom(true)}
                onMouseLeave={() => setImageZoom(false)}
              >
                {(() => {
                  // Get all available images (backward compatible)
                  const allImages = (product.images && product.images.length > 0) 
                    ? product.images 
                    : (product.image ? [product.image] : []);
                  
                  const currentImage = allImages[selectedImageIndex];
                  
                  return currentImage ? (
                    <img
                      src={currentImage}
                      alt={product.name}
                      className="w-full h-full object-contain transition-transform duration-500 p-2.5 sm:p-5 min-h-[250px] sm:min-h-[400px]"
                      style={{
                        transform: imageZoom ? 'scale(1.1)' : 'scale(1)'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center min-h-[250px] sm:min-h-[400px]">
                      <div className="text-gray-400 text-6xl">🛒</div>
                    </div>
                  );
                })()}
              </div>

              {/* Image Thumbnails */}
              {(() => {
                const allImages = (product.images && product.images.length > 0) 
                  ? product.images 
                  : (product.image ? [product.image] : []);
                
                if (allImages.length <= 1) return null;
                
                return (
                  <div className="flex space-x-3 overflow-x-auto pb-2">
                    {allImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                          selectedImageIndex === index 
                            ? 'border-green-500 ring-2 ring-green-200' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          width: '80px',
                          height: '80px',
                          backgroundColor: '#fafafa'
                        }}
                      >
                        <img
                          src={img}
                          alt={`${product.name} - View ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Product Info */}
            <div className="flex flex-col space-y-6">
              {/* Title */}
              <div>
                <h1 
                  className="mb-3 text-xl sm:text-2xl md:text-3xl"
                  style={{ 
                    fontWeight: 700, 
                    color: '#1a1a1a',
                    fontFamily: 'Poppins, sans-serif',
                    lineHeight: '1.2'
                  }}
                >
                  {product.name}
                </h1>
                
                {/* Category Badge */}
                <div className="inline-flex items-center px-4 py-1.5 mb-4" style={{
                  backgroundColor: '#e7f8ed',
                  color: '#2ecc71',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  {product.category}
                </div>
                
                {product.featured && (
                  <span className="inline-flex items-center px-3 py-1 ml-2 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                    ⭐ Featured
                  </span>
                )}
              </div>

              {/* Price */}
              <div>
                <p 
                  className="mb-1 text-2xl sm:text-3xl md:text-4xl"
                  style={{ 
                    fontWeight: 700, 
                    color: '#2ecc71',
                    fontFamily: 'Poppins, sans-serif'
                  }}
                >
                  GHS {product.price.toFixed(2)}
                </p>
                <p style={{ fontSize: '14px', color: '#888', fontWeight: 500 }}>
                  per {product.unit}
                </p>
              </div>

              {/* Stock Badge */}
              <div className="flex items-center space-x-2">
                {product.stock > 0 ? (
                  <div className="inline-flex items-center px-4 py-2 rounded-full" style={{
                    backgroundColor: '#e7f8ed',
                    color: '#2ecc71'
                  }}>
                    <span style={{ fontSize: '12px', marginRight: '6px' }}>●</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>
                      In Stock – {product.stock} available
                    </span>
                  </div>
                ) : (
                  <div className="inline-flex items-center px-4 py-2 rounded-full bg-red-100 text-red-600">
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Trust Icons */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-6 py-2">
                <div className="flex items-center space-x-2" style={{ color: '#555' }}>
                  <FaCheckCircle className="text-green-600 text-sm sm:text-base" />
                  <span className="text-xs sm:text-sm" style={{ fontWeight: 500 }}>100% Authentic</span>
                </div>
                <div className="flex items-center space-x-2" style={{ color: '#555' }}>
                  <FaTruck className="text-green-600 text-sm sm:text-base" />
                  <span className="text-xs sm:text-sm" style={{ fontWeight: 500 }}>Fast Delivery</span>
                </div>
                <div className="flex items-center space-x-2" style={{ color: '#555' }}>
                  <FaShieldAlt className="text-green-600 text-sm sm:text-base" />
                  <span className="text-xs sm:text-sm" style={{ fontWeight: 500 }}>Secure Payment</span>
                </div>
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="flex items-center space-x-4">
                  <span style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a' }}>Quantity:</span>
                  <div className="flex items-center border rounded-full overflow-hidden" style={{
                    borderColor: '#e5e7eb',
                    backgroundColor: '#f3f4f6'
                  }}>
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 sm:p-2.5 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ borderRadius: '50% 0 0 50%' }}
                    >
                      <Minus className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: '#1a1a1a' }} />
                    </button>
                    <span 
                      className="px-4 sm:px-6 py-2 font-semibold"
                      style={{ 
                        minWidth: '50px', 
                        textAlign: 'center',
                        color: '#1a1a1a',
                        fontSize: '14px'
                      }}
                    >
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      className="p-2 sm:p-2.5 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ borderRadius: '0 50% 50% 0' }}
                    >
                      <Plus className="h-3 w-3 sm:h-4 sm:w-4" style={{ color: '#1a1a1a' }} />
                    </button>
                  </div>
                </div>
              )}

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full flex items-center justify-center space-x-2 font-semibold text-white transition-all duration-200 transform ${
                  product.stock > 0
                    ? 'hover:scale-[1.02] active:scale-[0.98]'
                    : 'cursor-not-allowed'
                }`}
                className="h-12 sm:h-[54px] text-sm sm:text-base"
                style={{
                  backgroundColor: product.stock > 0 ? '#FF8C00' : '#9ca3af',
                  borderRadius: '12px',
                  fontWeight: 600,
                  boxShadow: product.stock > 0 ? '0 4px 12px rgba(255, 128, 0, 0.25)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (product.stock > 0) {
                    e.target.style.backgroundColor = '#FF7700';
                  }
                }}
                onMouseLeave={(e) => {
                  if (product.stock > 0) {
                    e.target.style.backgroundColor = '#FF8C00';
                  }
                }}
              >
                <ShoppingCart className="h-5 w-5" />
                <span>{product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
              </button>

              {/* Share Buttons */}
              <div className="flex items-center space-x-3 pt-4 border-t" style={{ borderColor: '#e5e7eb' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#555' }}>Share:</span>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="p-2 rounded-full hover:bg-green-50 transition-colors"
                  style={{ color: '#25D366' }}
                  aria-label="Share on WhatsApp"
                >
                  <FaWhatsapp className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  className="p-2 rounded-full hover:bg-blue-50 transition-colors"
                  style={{ color: '#1877F2' }}
                  aria-label="Share on Facebook"
                >
                  <FaFacebook className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="p-2 rounded-full hover:bg-blue-50 transition-colors"
                  style={{ color: '#1DA1F2' }}
                  aria-label="Share on Twitter"
                >
                  <FaTwitter className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleShare('copy')}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                  style={{ color: '#555' }}
                  aria-label="Copy link"
                >
                  <FaShare className="h-5 w-5" />
                </button>
              </div>

              {/* Description */}
              {product.description && (
                <div className="pt-4">
                  <h3 
                    className="mb-3"
                    style={{ 
                      fontSize: '18px', 
                      fontWeight: 700, 
                      color: '#1a1a1a',
                      fontFamily: 'Poppins, sans-serif'
                    }}
                  >
                    Description
                  </h3>
                  <p 
                    style={{ 
                      color: '#4a4a4a',
                      lineHeight: '1.6',
                      fontSize: '15px'
                    }}
                  >
                    {product.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;