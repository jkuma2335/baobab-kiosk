import { useParams, useLocation, Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const OrderSuccessPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const orderNumber = location.state?.orderNumber || 'N/A';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <FaCheckCircle className="text-green-600 text-6xl mx-auto mb-4" />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Order Placed Successfully!
        </h1>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-6">
          <p className="text-sm text-gray-600 mb-2">Order Number</p>
          <p className="text-2xl font-bold text-green-600">{orderNumber}</p>
        </div>

        <p className="text-gray-600 mb-6">
          Keep your order number for Payment reference.
        </p>

        <div className="space-y-3">
          <Link
            to="/"
            className="block w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            to="/cart"
            className="block w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            View Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;

