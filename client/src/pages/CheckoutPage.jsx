import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import PromoCodeInput from '../components/PromoCodeInput';
import { User, Phone, MapPin, Truck, Store, CheckCircle2, AlertCircle } from 'lucide-react';

const CHECKOUT_FORM_STORAGE_KEY = 'baobab_kiosk_checkout_form';
const PROMO_CODE_STORAGE_KEY = 'baobab_kiosk_promo_code';

// Load checkout form from localStorage
const loadCheckoutFormFromStorage = () => {
  try {
    const stored = localStorage.getItem(CHECKOUT_FORM_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading checkout form from localStorage:', error);
  }
  return {
    name: '',
    phone: '',
    deliveryType: 'delivery',
    address: '',
  };
};

// Save checkout form to localStorage
const saveCheckoutFormToStorage = (formData) => {
  try {
    localStorage.setItem(CHECKOUT_FORM_STORAGE_KEY, JSON.stringify(formData));
  } catch (error) {
    console.error('Error saving checkout form to localStorage:', error);
  }
};

// Load promo code from localStorage
const loadPromoCodeFromStorage = () => {
  try {
    const stored = localStorage.getItem(PROMO_CODE_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading promo code from localStorage:', error);
  }
  return null;
};

// Save promo code to localStorage
const savePromoCodeToStorage = (promoCode) => {
  try {
    if (promoCode) {
      localStorage.setItem(PROMO_CODE_STORAGE_KEY, JSON.stringify(promoCode));
    } else {
      localStorage.removeItem(PROMO_CODE_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Error saving promo code to localStorage:', error);
  }
};

const CheckoutPage = () => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const baseTotal = getCartTotal();

  // Initialize form data from localStorage
  const [formData, setFormData] = useState(loadCheckoutFormFromStorage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [shakePromo, setShakePromo] = useState(false);
  // Initialize promo code from localStorage
  const [appliedPromoCode, setAppliedPromoCode] = useState(() => loadPromoCodeFromStorage());

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    saveCheckoutFormToStorage(formData);
  }, [formData]);

  // Save promo code to localStorage whenever it changes
  useEffect(() => {
    savePromoCodeToStorage(appliedPromoCode);
  }, [appliedPromoCode]);

  // Calculate final total with promo code discount
  const discount = appliedPromoCode ? appliedPromoCode.discount : 0;
  const finalTotal = Math.max(0, baseTotal - discount);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleDeliveryTypeChange = (type) => {
    setFormData({
      ...formData,
      deliveryType: type,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.name.trim()) {
      setError('Name is required');
      setLoading(false);
      return;
    }

    if (!formData.phone.trim()) {
      setError('Phone is required');
      setLoading(false);
      return;
    }

    if (formData.deliveryType === 'delivery' && !formData.address.trim()) {
      setError('Address is required for delivery');
      setLoading(false);
      return;
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty');
      setLoading(false);
      return;
    }

    try {
      // Prepare order data
      const orderData = {
        userId: 'guest', // Will be updated when auth is implemented
        items: cartItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: finalTotal,
        originalAmount: baseTotal,
        discountAmount: discount,
        promoCode: appliedPromoCode ? appliedPromoCode.code : null,
        deliveryType: formData.deliveryType,
        phone: formData.phone,
        customerName: formData.name,
        address: formData.deliveryType === 'delivery' ? formData.address : '',
      };

      const response = await axios.post('/api/orders', orderData);

      // Clear cart, form data, and promo code after successful order
      clearCart();
      localStorage.removeItem(CHECKOUT_FORM_STORAGE_KEY);
      localStorage.removeItem(PROMO_CODE_STORAGE_KEY);
      setFormData({
        name: '',
        phone: '',
        deliveryType: 'delivery',
        address: '',
      });
      setAppliedPromoCode(null);
      
      navigate(`/order-success/${response.data.data._id}`, {
        state: { orderNumber: response.data.data.orderNumber },
      });
    } catch (err) {
      console.error('Error placing order:', err);
      setError(
        err.response?.data?.message || 'Failed to place order. Please try again.'
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden w-full max-w-full" style={{ backgroundColor: '#f9fafb', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl w-full">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6" style={{ color: '#1f2937', fontFamily: 'Poppins, sans-serif', fontWeight: 700 }}>
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
          {/* Checkout Form - 60% width */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8">
              <h2 
                className="mb-4 sm:mb-6 text-lg sm:text-xl md:text-2xl" 
                style={{ 
                  fontWeight: 700, 
                  color: '#1f2937',
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                Delivery Information
              </h2>

              {error && (
                <div className="mb-4 p-4 rounded-lg flex items-center space-x-2 animate-slideDown" style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5' }}>
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name Field */}
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-2"
                    style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}
                  >
                    Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5"
                      style={{ color: focusedField === 'name' ? '#38b85d' : '#9ca3af' }}
                    />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full pl-12 pr-4 py-2.5 rounded-lg border transition-all duration-200"
                      style={{
                        borderColor: focusedField === 'name' ? '#38b85d' : '#e5e7eb',
                        outline: 'none',
                        boxShadow: focusedField === 'name' ? '0 0 0 3px rgba(56, 184, 93, 0.1)' : 'none',
                        fontSize: '15px'
                      }}
                    />
                  </div>
                </div>

                {/* Phone Field */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block mb-2"
                    style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}
                  >
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone 
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5"
                      style={{ color: focusedField === 'phone' ? '#38b85d' : '#9ca3af' }}
                    />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="w-full pl-12 pr-4 py-2.5 rounded-lg border transition-all duration-200"
                      style={{
                        borderColor: focusedField === 'phone' ? '#38b85d' : '#e5e7eb',
                        outline: 'none',
                        boxShadow: focusedField === 'phone' ? '0 0 0 3px rgba(56, 184, 93, 0.1)' : 'none',
                        fontSize: '15px'
                      }}
                    />
                  </div>
                </div>

                {/* Delivery Method Cards */}
                <div>
                  <label
                    className="block mb-3"
                    style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}
                  >
                    Delivery Method <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleDeliveryTypeChange('delivery')}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                        formData.deliveryType === 'delivery'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      style={{
                        boxShadow: formData.deliveryType === 'delivery' ? '0 4px 12px rgba(56, 184, 93, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                      <Truck 
                        className={`h-6 w-6 ${formData.deliveryType === 'delivery' ? 'text-green-600' : 'text-gray-400'}`}
                      />
                      <div className="text-left">
                        <div 
                          className="font-semibold"
                          style={{ 
                            color: formData.deliveryType === 'delivery' ? '#38b85d' : '#6c757d',
                            fontSize: '15px'
                          }}
                        >
                          🚚 Delivery
                        </div>
                        <div 
                          className="text-xs mt-0.5"
                          style={{ color: '#9ca3af' }}
                        >
                          To your address
                        </div>
                      </div>
                      {formData.deliveryType === 'delivery' && (
                        <CheckCircle2 className="h-5 w-5 text-green-600 ml-auto" />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeliveryTypeChange('pickup')}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 flex items-center space-x-3 ${
                        formData.deliveryType === 'pickup'
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                      style={{
                        boxShadow: formData.deliveryType === 'pickup' ? '0 4px 12px rgba(56, 184, 93, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)'
                      }}
                    >
                      <Store 
                        className={`h-6 w-6 ${formData.deliveryType === 'pickup' ? 'text-green-600' : 'text-gray-400'}`}
                      />
                      <div className="text-left">
                        <div 
                          className="font-semibold"
                          style={{ 
                            color: formData.deliveryType === 'pickup' ? '#38b85d' : '#6c757d',
                            fontSize: '15px'
                          }}
                        >
                          🏬 Pickup
                        </div>
                        <div 
                          className="text-xs mt-0.5"
                          style={{ color: '#9ca3af' }}
                        >
                          From our store
                        </div>
                      </div>
                      {formData.deliveryType === 'pickup' && (
                        <CheckCircle2 className="h-5 w-5 text-green-600 ml-auto" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Address Field */}
                {formData.deliveryType === 'delivery' && (
                  <div className="animate-fadeIn">
                    <label
                      htmlFor="address"
                      className="block mb-2"
                      style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}
                    >
                      Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin 
                        className="absolute left-4 top-4 h-5 w-5"
                        style={{ color: focusedField === 'address' ? '#38b85d' : '#9ca3af' }}
                      />
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        onFocus={() => setFocusedField('address')}
                        onBlur={() => setFocusedField(null)}
                        required={formData.deliveryType === 'delivery'}
                        rows="3"
                        className="w-full pl-12 pr-4 py-2.5 rounded-lg border resize-none transition-all duration-200"
                        style={{
                          borderColor: focusedField === 'address' ? '#38b85d' : '#e5e7eb',
                          outline: 'none',
                          boxShadow: focusedField === 'address' ? '0 0 0 3px rgba(56, 184, 93, 0.1)' : 'none',
                          fontSize: '15px'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Place Order Button - Sticky on Mobile */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50" style={{ boxShadow: '0 -4px 12px rgba(0,0,0,0.1)' }}>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform ${
                      loading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'active:scale-[0.98]'
                    }`}
                    style={{
                      backgroundColor: loading ? '#9ca3af' : '#38b85d',
                      boxShadow: loading ? 'none' : '0 4px 12px rgba(56, 184, 93, 0.3)',
                      fontSize: '16px',
                      fontWeight: 600
                    }}
                  >
                    {loading ? 'Placing Order...' : 'Place Order'}
                  </button>
                </div>

                {/* Desktop Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`hidden lg:block w-full py-4 px-6 rounded-xl font-semibold text-white transition-all duration-200 transform ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                  style={{
                    backgroundColor: loading ? '#9ca3af' : '#38b85d',
                    boxShadow: loading ? 'none' : '0 4px 12px rgba(56, 184, 93, 0.3)',
                    fontSize: '16px',
                    fontWeight: 600,
                    marginTop: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.target.style.backgroundColor = '#2ecc71';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading) {
                      e.target.style.backgroundColor = '#38b85d';
                    }
                  }}
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </button>
              </form>
            </div>
            {/* Spacer for mobile sticky button */}
            <div className="lg:hidden h-20"></div>
          </div>

          {/* Order Summary - 35% width */}
          <div className="lg:col-span-5">
            <div 
              className="rounded-xl shadow-sm p-6 sticky top-4"
              style={{ 
                backgroundColor: '#fafafa',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}
            >
              <h2 
                className="mb-6"
                style={{ 
                  fontSize: '22px', 
                  fontWeight: 700, 
                  color: '#1f2937',
                  fontFamily: 'Poppins, sans-serif'
                }}
              >
                Order Summary
              </h2>

              {/* Promo Code Section */}
              <div className="mb-6 pb-6" style={{ borderBottom: '1px solid #e5e7eb' }}>
                <PromoCodeInput
                  totalAmount={baseTotal}
                  onApply={(promoData) => {
                    setAppliedPromoCode(promoData);
                  }}
                  appliedCode={appliedPromoCode}
                  onRemove={() => setAppliedPromoCode(null)}
                />
              </div>

              {/* Items List */}
              <div className="space-y-4 mb-6">
                {cartItems.map((item, index) => (
                  <div
                    key={item._id}
                    className="flex items-center space-x-3 pb-4 transition-all duration-200 hover:transform hover:scale-[1.02]"
                    style={{
                      borderBottom: index < cartItems.length - 1 ? '1px solid #e5e7eb' : 'none'
                    }}
                  >
                    {/* Product Thumbnail */}
                    <div 
                      className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: '#f3f4f6' }}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400 text-lg">🛒</span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <p 
                        className="font-medium truncate"
                        style={{ color: '#1f2937', fontSize: '14px' }}
                      >
                        {item.name}
                      </p>
                      <p 
                        className="text-sm"
                        style={{ color: '#6c757d' }}
                      >
                        Qty: {item.quantity}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p 
                        className="font-semibold"
                        style={{ color: '#1f2937', fontSize: '15px' }}
                      >
                        GHS {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-3 pt-4" style={{ borderTop: '1px solid #e5e7eb' }}>
                <div className="flex justify-between text-sm" style={{ color: '#6c757d' }}>
                  <span>Subtotal:</span>
                  <span>GHS {baseTotal.toFixed(2)}</span>
                </div>
                
                {appliedPromoCode && (
                  <div className="flex justify-between text-sm" style={{ color: '#38b85d' }}>
                    <span>Discount ({appliedPromoCode.code}):</span>
                    <span className="font-semibold">
                      - GHS {discount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div 
                  className="flex justify-between items-center pt-3 mt-3"
                  style={{ 
                    borderTop: '2px solid #e5e7eb',
                    backgroundColor: '#e7f8ed',
                    marginLeft: '-24px',
                    marginRight: '-24px',
                    paddingLeft: '24px',
                    paddingRight: '24px',
                    paddingTop: '16px',
                    paddingBottom: '16px',
                    borderRadius: '0 0 12px 12px'
                  }}
                >
                  <span 
                    className="font-bold"
                    style={{ color: '#1f2937', fontSize: '18px' }}
                  >
                    Total:
                  </span>
                  <span 
                    className="font-bold"
                    style={{ color: '#38b85d', fontSize: '20px' }}
                  >
                    GHS {finalTotal.toFixed(2)}
                  </span>
                </div>
                
                {appliedPromoCode && (
                  <p 
                    className="text-xs mt-2 text-center animate-fadeIn"
                    style={{ color: '#38b85d', fontWeight: 500 }}
                  >
                    You saved GHS {discount.toFixed(2)}! 🎉
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;