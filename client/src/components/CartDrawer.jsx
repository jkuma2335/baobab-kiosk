import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaTimes, FaPlus, FaMinus, FaTrash, FaArrowRight } from 'react-icons/fa';

const CartDrawer = () => {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    getCartTotal,
  } = useCart();
  const navigate = useNavigate();
  const total = getCartTotal();

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      closeCart();
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity backdrop-blur-sm"
          onClick={handleBackdropClick}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-screen w-full max-w-md shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          background: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Header - Seamless Style */}
        <div className="flex items-center justify-between px-6 py-5 flex-shrink-0" style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.05)' }}>
          <h2 className="text-2xl font-bold" style={{ color: '#1F2937', fontFamily: "'Playfair Display', serif" }}>
            My Cart ({cartItems.length})
          </h2>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 hover:bg-red-100"
            style={{ backgroundColor: '#F3F4F6' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FEE2E2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F4F6';
            }}
          >
            <FaTimes className="text-base" style={{ color: '#6B7280' }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {cartItems.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-lg mb-4" style={{ color: '#4A4A4A', fontFamily: "'Poppins', sans-serif" }}>Your cart is empty</p>
              <button
                onClick={closeCart}
                className="px-6 py-3 rounded-2xl font-semibold transition-all duration-200"
                style={{ 
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  color: 'white',
                  fontFamily: "'Poppins', sans-serif",
                  boxShadow: '0 4px 14px 0 rgba(16, 185, 129, 0.39)'
                }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-start space-x-4 pb-5"
                  style={{ borderBottom: '1px dashed rgba(0, 0, 0, 0.08)' }}
                >
                  {/* Product Image */}
                  <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ borderRadius: '12px' }}>
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        style={{ borderRadius: '12px' }}
                      />
                    ) : (
                      <span className="text-gray-400 text-2xl">🛒</span>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold mb-1 truncate" style={{ color: '#1F2937', fontFamily: "'Poppins', sans-serif", fontSize: '15px' }}>
                      {item.name}
                    </h3>
                    <p className="text-base font-bold mb-3" style={{ color: '#10B981', fontFamily: "'Playfair Display', serif" }}>
                      GHS {item.price.toFixed(2)}
                    </p>
                    
                    {/* Pill Quantity Selector */}
                    <div className="flex items-center justify-between">
                      <div 
                        className="flex items-center justify-between rounded-full px-3 py-1.5"
                        style={{ 
                          backgroundColor: '#F3F4F6',
                          borderRadius: '50px',
                          width: '100px'
                        }}
                      >
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity - 1)
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                          style={{ color: '#4A4A4A' }}
                        >
                          <FaMinus className="text-xs" />
                        </button>
                        <span className="text-sm font-bold px-2" style={{ color: '#1F2937', fontFamily: "'Poppins', sans-serif" }}>
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item._id, item.quantity + 1)
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
                          style={{ color: '#4A4A4A' }}
                        >
                          <FaPlus className="text-xs" />
                        </button>
                      </div>

                      {/* Delete Button - Subtle */}
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="p-2 rounded-full transition-all duration-200"
                        style={{ color: '#9CA3AF' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#EF4444';
                          e.currentTarget.style.backgroundColor = '#FEE2E2';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#9CA3AF';
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        title="Remove item"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Premium Style */}
        {cartItems.length > 0 && (
          <div className="flex-shrink-0 px-6 py-6" style={{ borderTop: '2px dashed rgba(0, 0, 0, 0.1)', backgroundColor: 'rgba(249, 250, 251, 0.5)' }}>
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-semibold" style={{ color: '#1F2937', fontFamily: "'Poppins', sans-serif" }}>
                Subtotal:
              </span>
              <span className="text-2xl font-bold" style={{ color: '#10B981', fontFamily: "'Playfair Display', serif" }}>
                GHS {total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full text-white py-4 px-6 rounded-full font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
              style={{
                background: 'linear-gradient(90deg, #FF8C00 0%, #FFA500 100%)',
                borderRadius: '30px',
                boxShadow: '0 10px 20px -5px rgba(255, 140, 0, 0.4)',
                fontFamily: "'Poppins', sans-serif",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 12px 24px -5px rgba(255, 140, 0, 0.5)';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(255, 140, 0, 0.4)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Proceed to Checkout</span>
              <FaArrowRight className="text-sm" />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;

