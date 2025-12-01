import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';

const ProductCard = ({ product, showBadges = true }) => {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  const isLowStock = product.stock > 0 && product.stock < 10;
  const isPopular = product.featured || (product.totalSold && product.totalSold > 10);

  return (
    <Link
      to={`/product/${product._id}`}
      className="group block bg-white overflow-hidden transition-all duration-300 transform hover:-translate-y-1"
      style={{
        borderRadius: '20px',
        boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
        e.currentTarget.style.transform = 'translateY(-5px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.05)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Product Image with Overlay Badges */}
      <div className="relative w-full h-64 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center overflow-hidden">
        {(() => {
          // Get primary image (backward compatible: use images array first, then image field)
          const primaryImage = (product.images && product.images.length > 0) 
            ? product.images[0] 
            : product.image;
          
          return primaryImage && !imageError ? (
            <>
              <img
                src={primaryImage}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                style={{ borderRadius: '20px 20px 0 0' }}
                onError={() => setImageError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </>
          ) : (
            <div className="text-gray-300 text-7xl group-hover:scale-110 transition-transform duration-500">🌾</div>
          );
        })()}
        
        {/* Badges Overlay */}
        {showBadges && (
          <div className="absolute top-3 left-3 flex flex-col space-y-2 z-10">
            {isPopular && (
              <span className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm border border-yellow-300">
                🔥 Popular
              </span>
            )}
            {isLowStock && (
              <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm border border-orange-400">
                ⚠️ Low Stock
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm border border-red-400">
                Out of Stock
              </span>
            )}
          </div>
        )}

        {/* Icon Button - Shopping Cart */}
        {product.stock > 0 && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-4 right-4 w-12 h-12 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 opacity-0 group-hover:opacity-100 z-10"
            style={{ boxShadow: '0 4px 14px 0 rgba(255, 140, 0, 0.39)' }}
          >
            <FaShoppingCart className="text-lg" />
          </button>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5">
        <h3 className="text-base font-bold mb-2 line-clamp-2 transition-colors duration-300 min-h-[3rem]" style={{ 
          color: '#065F46',
          fontFamily: "'Poppins', sans-serif"
        }} onMouseEnter={(e) => e.target.style.color = '#10B981'} onMouseLeave={(e) => e.target.style.color = '#065F46'}>
          {product.name}
        </h3>
        <p className="text-xs mb-3 font-medium uppercase tracking-wide" style={{ 
          color: '#6B7280',
          fontFamily: "'Lato', sans-serif"
        }}>
          {product.category}
        </p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-extrabold" style={{ 
              color: '#10B981',
              fontFamily: "'Playfair Display', serif"
            }}>
              GHS {product.price.toFixed(2)}
            </span>
            <span className="text-xs ml-1 font-medium" style={{ 
              color: '#9CA3AF',
              fontFamily: "'Lato', sans-serif"
            }}>/{product.unit}</span>
          </div>
          {product.stock > 0 && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold" style={{ 
              backgroundColor: '#D1FAE5',
              color: '#065F46',
              fontFamily: "'Poppins', sans-serif"
            }}>
              ✓ In Stock
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;

