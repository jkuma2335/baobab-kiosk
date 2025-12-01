import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import {
  FaSearch,
  FaCheckCircle,
  FaClock,
  FaTruck,
  FaBox,
  FaTimesCircle,
} from 'react-icons/fa';

const TrackOrderPage = () => {
  const [orderNumber, setOrderNumber] = useState('');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      setError('Please enter an order number');
      return;
    }

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const response = await axios.get(
        `/api/orders/track/${encodeURIComponent(orderNumber.trim())}`
      );
      
      if (response.data.success) {
        setOrder(response.data.data);
        toast.success('Order found!');
      }
    } catch (err) {
      console.error('Error tracking order:', err);
      setError(
        err.response?.data?.message || 'Order not found. Please check your order number.'
      );
      toast.error('Order not found');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <FaCheckCircle className="text-green-600 text-2xl" />;
      case 'shipped':
        return <FaTruck className="text-blue-600 text-2xl" />;
      case 'processing':
        return <FaBox className="text-orange-600 text-2xl" />;
      case 'cancelled':
        return <FaTimesCircle className="text-red-600 text-2xl" />;
      default:
        return <FaClock className="text-yellow-600 text-2xl" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'processing':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
    } catch {
      return dateString;
    }
  };

  const getCustomerName = (order) => {
    if (order?.customerName && order.customerName.trim()) {
      return order.customerName.trim();
    }
    if (order?.userId && typeof order.userId === 'object' && order.userId.name) {
      return order.userId.name;
    }
    return 'Guest Customer';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8 md:py-12 px-3 sm:px-4 overflow-x-hidden w-full max-w-full">
      <div className="container mx-auto max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2">Track Your Order</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Enter your order number to check the status of your order
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6 sm:mb-8">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Number
              </label>
              <input
                type="text"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                placeholder="e.g., ORD-20251127-1234"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 text-sm sm:text-base md:text-lg font-mono"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <FaSearch />
                <span>{loading ? 'Searching...' : 'Track Order'}</span>
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Order Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2">Order #{order.orderNumber}</h2>
                  <p className="text-sm sm:text-base text-green-100">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="mt-4 md:mt-0 flex items-center space-x-3">
                  {getStatusIcon(order.status)}
                  <div>
                    <div
                      className={`px-4 py-2 rounded-full border-2 font-semibold ${getStatusColor(
                        order.status
                      )} bg-white`}
                    >
                      {getStatusText(order.status)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Info */}
            <div className="p-4 sm:p-6 grid md:grid-cols-2 gap-4 sm:gap-6">
              {/* Customer Info */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                  Customer Information
                </h3>
                <div className="space-y-2 text-sm sm:text-base text-gray-600">
                  <p>
                    <span className="font-medium">Name:</span> {getCustomerName(order)}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span> {order.phone}
                  </p>
                  {order.deliveryType === 'delivery' && order.address && (
                    <p>
                      <span className="font-medium">Address:</span> {order.address}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Delivery Type:</span>{' '}
                    <span className="capitalize">{order.deliveryType}</span>
                  </p>
                </div>
              </div>

              {/* Order Summary */}
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm sm:text-base text-gray-600">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-bold text-green-600 text-xl">
                      GHS {order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Items:</span>
                    <span className="font-medium">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status:</span>
                    <span className={`capitalize font-medium ${
                      order.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Order Items</h3>
              <div className="space-y-3 sm:space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    {/* Product Image */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.productId?.image ? (
                        <img
                          src={item.productId.image}
                          alt={item.productId.name || 'Product'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl">📦</span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <h4 className="font-semibold text-sm sm:text-base text-gray-800 truncate">
                        {item.productId?.name || 'Product'}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {item.productId?.category || 'Category'} •{' '}
                        {item.productId?.unit || 'Unit'}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500">
                        Quantity: {item.quantity} × GHS {item.price.toFixed(2)}
                      </p>
                    </div>

                    {/* Subtotal */}
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <p className="font-bold text-base sm:text-lg text-gray-800">
                        GHS {(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t pt-4 sm:pt-6">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                {order.status === 'pending' && (
                  <Link
                    to={`/edit-order/${order._id}`}
                    className="flex-1 text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Edit Order
                  </Link>
                )}
                <Link
                  to="/"
                  className="flex-1 text-center px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Continue Shopping
                </Link>
                <button
                  onClick={() => {
                    setOrder(null);
                    setOrderNumber('');
                    setError('');
                  }}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Track Another Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        {!order && !loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <p className="text-gray-700 mb-2">
              <strong>Can't find your order number?</strong>
            </p>
            <p className="text-sm text-gray-600">
              Check your order confirmation email or the order success page after checkout.
              Your order number looks like: <code className="bg-white px-2 py-1 rounded">ORD-YYYYMMDD-XXXX</code>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackOrderPage;

