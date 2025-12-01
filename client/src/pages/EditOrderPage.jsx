import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import PromoCodeInput from '../components/PromoCodeInput';
import { ArrowLeft, Plus, Minus, Trash2, Save } from 'lucide-react';

const EditOrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  // Editable state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    deliveryType: 'delivery',
    address: '',
  });
  const [items, setItems] = useState([]);
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');

  useEffect(() => {
    fetchOrder();
    fetchProducts();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/orders/${id}`);
      const orderData = response.data.data;

      if (orderData.status !== 'pending') {
        toast.error('This order can no longer be edited. Only pending orders can be modified.');
        navigate(`/track-order`);
        return;
      }

      setOrder(orderData);
      setFormData({
        name: orderData.customerName || '',
        phone: orderData.phone || '',
        deliveryType: orderData.deliveryType || 'delivery',
        address: orderData.address || '',
      });

      // Initialize items with product data
      const initializedItems = orderData.items.map((item) => ({
        ...item,
        product: item.productId, // Already populated
      }));
      setItems(initializedItems);

      // Initialize promo code if exists
      if (orderData.promoCode) {
        setAppliedPromoCode({
          code: orderData.promoCode,
          discount: orderData.discountAmount || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to load order. Please try again.');
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/products');
      setAvailableProducts(response.data.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const revalidatePromoCode = async (baseTotal) => {
    if (!appliedPromoCode) return;
    
    try {
      const response = await axios.get(
        `/api/promo-codes/validate/${appliedPromoCode.code}?totalAmount=${baseTotal}`
      );
      if (response.data.success) {
        setAppliedPromoCode(response.data.data);
      } else {
        // Promo code no longer valid, remove it
        setAppliedPromoCode(null);
        toast.warning('Promo code is no longer valid with the updated order');
      }
    } catch (err) {
      // Promo code invalid, remove it
      setAppliedPromoCode(null);
      toast.warning('Promo code is no longer valid with the updated order');
    }
  };

  const updateItemQuantity = (index, delta) => {
    setItems((prevItems) => {
      const newItems = [...prevItems];
      const newQuantity = newItems[index].quantity + delta;
      
      if (newQuantity <= 0) {
        const updatedItems = newItems.filter((_, i) => i !== index);
        // Revalidate promo code after removing item
        if (appliedPromoCode && updatedItems.length > 0) {
          const newBaseTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          revalidatePromoCode(newBaseTotal);
        } else if (updatedItems.length === 0) {
          // No items left, remove promo code
          setAppliedPromoCode(null);
        }
        return updatedItems;
      }
      
      newItems[index].quantity = newQuantity;
      // Revalidate promo code after quantity change
      if (appliedPromoCode) {
        const newBaseTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        revalidatePromoCode(newBaseTotal);
      }
      return newItems;
    });
  };

  const removeItem = (index) => {
    setItems((prevItems) => {
      const updatedItems = prevItems.filter((_, i) => i !== index);
      // Revalidate promo code after removing item
      if (appliedPromoCode && updatedItems.length > 0) {
        const newBaseTotal = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        revalidatePromoCode(newBaseTotal);
      } else if (updatedItems.length === 0) {
        // No items left, remove promo code
        setAppliedPromoCode(null);
      }
      return updatedItems;
    });
  };

  const addProduct = () => {
    if (!selectedProduct) {
      toast.error('Please select a product');
      return;
    }

    const product = availableProducts.find((p) => p._id === selectedProduct);
    if (!product) return;

    // Check if product already exists in order
    const existingIndex = items.findIndex(
      (item) => {
        const itemProductId = typeof item.productId === 'object' ? item.productId._id : item.productId;
        return itemProductId === product._id;
      }
    );

    if (existingIndex >= 0) {
      // Increment quantity if product already exists
      updateItemQuantity(existingIndex, 1);
    } else {
      // Add new item
      setItems((prevItems) => {
        const newItems = [
          ...prevItems,
          {
            productId: product._id,
            product: product,
            quantity: 1,
            price: product.price,
          },
        ];
        // Revalidate promo code after adding item
        if (appliedPromoCode) {
          const newBaseTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
          revalidatePromoCode(newBaseTotal);
        }
        return newItems;
      });
    }

    setSelectedProduct('');
    setShowAddProduct(false);
    toast.success('Product added to order');
  };

  const calculateTotal = () => {
    const baseTotal = items.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);
    
    const discount = appliedPromoCode ? appliedPromoCode.discount : 0;
    return {
      baseTotal,
      discount,
      finalTotal: Math.max(0, baseTotal - discount),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    // Validation
    if (items.length === 0) {
      setError('Order must contain at least one item');
      setSaving(false);
      return;
    }

    if (!formData.name.trim()) {
      setError('Name is required');
      setSaving(false);
      return;
    }

    if (!formData.phone.trim()) {
      setError('Phone is required');
      setSaving(false);
      return;
    }

    if (formData.deliveryType === 'delivery' && !formData.address.trim()) {
      setError('Address is required for delivery');
      setSaving(false);
      return;
    }

    try {
      const totals = calculateTotal();
      
      const orderData = {
        items: items.map((item) => ({
          productId: typeof item.productId === 'object' ? item.productId._id : item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: totals.finalTotal,
        originalAmount: totals.baseTotal,
        discountAmount: totals.discount,
        promoCode: appliedPromoCode ? appliedPromoCode.code : null,
        deliveryType: formData.deliveryType,
        phone: formData.phone,
        customerName: formData.name,
        address: formData.deliveryType === 'delivery' ? formData.address : '',
      };

      const response = await axios.put(`/api/orders/${id}`, orderData);

      toast.success('Order updated successfully!');
      navigate(`/track-order`, {
        state: { orderNumber: response.data.data.orderNumber },
      });
    } catch (err) {
      console.error('Error updating order:', err);
      setError(
        err.response?.data?.message || 'Failed to update order. Please try again.'
      );
      toast.error('Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const totals = calculateTotal();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link
            to="/track-order"
            className="inline-block px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Track Order
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/track-order"
            className="inline-flex items-center text-green-600 hover:text-green-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Track Order
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Edit Order</h1>
          {order && (
            <p className="text-gray-600 mt-2">
              Order Number: <span className="font-mono font-semibold">{order.orderNumber}</span>
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {order && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Delivery Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Delivery Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Method <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="deliveryType"
                    value={formData.deliveryType}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="delivery">Delivery</option>
                    <option value="pickup">Pickup</option>
                  </select>
                </div>

                {formData.deliveryType === 'delivery' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleFormChange}
                      required
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Order Items</h2>
                <button
                  type="button"
                  onClick={() => setShowAddProduct(!showAddProduct)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </button>
              </div>

              {showAddProduct && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select a product...</option>
                    {availableProducts.map((product) => (
                      <option key={product._id} value={product._id}>
                        {product.name} - GHS {product.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addProduct}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      Add to Order
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddProduct(false);
                        setSelectedProduct('');
                      }}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {items.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No items in order</p>
                ) : (
                  items.map((item, index) => {
                    const product = item.product || item.productId;
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
                      >
                        {product?.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800">{product?.name || 'Unknown Product'}</h3>
                          <p className="text-sm text-gray-600">
                            GHS {item.price.toFixed(2)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(index, -1)}
                            className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-12 text-center font-semibold">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(index, 1)}
                            className="p-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-800">
                            GHS {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Promo Code & Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Promo Code & Summary
              </h2>

              <div className="mb-6">
                <PromoCodeInput
                  totalAmount={totals.baseTotal}
                  onApply={(promoData) => {
                    setAppliedPromoCode(promoData);
                  }}
                  appliedCode={appliedPromoCode}
                  onRemove={() => setAppliedPromoCode(null)}
                />
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal:</span>
                  <span>GHS {totals.baseTotal.toFixed(2)}</span>
                </div>
                
                {appliedPromoCode && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({appliedPromoCode.code}):</span>
                    <span className="font-semibold">
                      - GHS {totals.discount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-lg font-semibold text-gray-800">
                    Total:
                  </span>
                  <span className="text-xl font-bold text-green-600">
                    GHS {totals.finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/track-order')}
                className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 ${
                  saving
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                } text-white`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditOrderPage;

