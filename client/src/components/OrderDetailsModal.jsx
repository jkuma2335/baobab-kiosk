import { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { toast } from 'react-toastify';

const OrderDetailsModal = ({ orderId, isOpen, onClose, onStatusUpdate }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails();
    }
  }, [isOpen, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/orders/${orderId}`);
      setOrder(response.data.data);
    } catch (err) {
      console.error('Error fetching order details:', err);
      toast.error('Failed to load order details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      await axios.put(`/api/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated successfully');
      if (onStatusUpdate) {
        onStatusUpdate();
      }
      fetchOrderDetails(); // Refresh order details
    } catch (err) {
      console.error('Error updating order status:', err);
      toast.error('Failed to update order status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCustomerName = (order) => {
    // First check if customerName is saved directly on the order
    if (order?.customerName) {
      return order.customerName;
    }
    // Fallback to userId name if user is logged in
    if (order?.userId && typeof order.userId === 'object' && order.userId.name) {
      return order.userId.name;
    }
    return 'Guest Customer';
  };

  const getCustomerPhone = (order) => {
    if (order?.userId && typeof order.userId === 'object' && order.userId.phone) {
      return order.userId.phone;
    }
    return order?.phone || 'N/A';
  };

  const getCustomerEmail = (order) => {
    if (order?.userId && typeof order.userId === 'object' && order.userId.email) {
      return order.userId.email;
    }
    return 'N/A';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            Order Details
            {order && (
              <span className="ml-3 text-lg font-normal text-gray-500">
                {order.orderNumber}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="ml-3 text-gray-600">Loading order details...</p>
          </div>
        ) : order ? (
          <div className="p-6 space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Customer Information
                </h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium text-gray-600">Name:</span>{' '}
                    <span className="text-gray-900">{getCustomerName(order)}</span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Phone:</span>{' '}
                    <span className="text-gray-900">{getCustomerPhone(order)}</span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-600">Email:</span>{' '}
                    <span className="text-gray-900">{getCustomerEmail(order)}</span>
                  </p>
                </div>
              </div>

              {/* Order Status */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Order Status
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Status:
                    </span>
                    <span
                      className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeClass(
                        order.status
                      )}`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Payment Status:
                    </span>
                    <span className="ml-2 text-sm text-gray-900">
                      {order.paymentStatus.charAt(0).toUpperCase() +
                        order.paymentStatus.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      Delivery Type:
                    </span>
                    <span className="ml-2 text-sm text-gray-900">
                      {order.deliveryType.charAt(0).toUpperCase() +
                        order.deliveryType.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            {order.deliveryType === 'delivery' && order.address && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Delivery Address
                </h3>
                <p className="text-sm text-gray-900">{order.address}</p>
              </div>
            )}

            {/* Order Items */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Order Items
              </h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {order.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-3">
                            <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {item.productId &&
                              typeof item.productId === 'object' &&
                              item.productId.image ? (
                                <img
                                  src={item.productId.image}
                                  alt={
                                    item.productId.name || 'Product'
                                  }
                                  className="h-full w-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="text-gray-400 text-xl">🛒</div>
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.productId &&
                                typeof item.productId === 'object'
                                  ? item.productId.name
                                  : 'Product'}
                              </p>
                              {item.productId &&
                                typeof item.productId === 'object' &&
                                item.productId.category && (
                                  <p className="text-xs text-gray-500">
                                    {item.productId.category}
                                  </p>
                                )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          GHS {item.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                          GHS {(item.quantity * item.price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="3" className="px-4 py-3 text-sm font-semibold text-gray-700 text-right">
                        Total Amount:
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">
                        GHS {order.totalAmount.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Order Date */}
            <div className="text-sm text-gray-600">
              <p>
                <span className="font-medium">Order Date:</span>{' '}
                {format(new Date(order.createdAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>

            {/* Action Buttons */}
            {order.status === 'pending' && (
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleStatusUpdate('processing')}
                  disabled={updatingStatus}
                  className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingStatus ? 'Updating...' : 'Mark as Processing'}
                </button>
                <button
                  onClick={() => handleStatusUpdate('delivered')}
                  disabled={updatingStatus}
                  className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingStatus ? 'Updating...' : 'Mark as Delivered'}
                </button>
              </div>
            )}
            {order.status === 'processing' && (
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleStatusUpdate('shipped')}
                  disabled={updatingStatus}
                  className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingStatus ? 'Updating...' : 'Mark as Shipped'}
                </button>
                <button
                  onClick={() => handleStatusUpdate('delivered')}
                  disabled={updatingStatus}
                  className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingStatus ? 'Updating...' : 'Mark as Delivered'}
                </button>
              </div>
            )}
            {order.status === 'shipped' && (
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleStatusUpdate('delivered')}
                  disabled={updatingStatus}
                  className="px-4 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updatingStatus ? 'Updating...' : 'Mark as Delivered'}
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default OrderDetailsModal;

