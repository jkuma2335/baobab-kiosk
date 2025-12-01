import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Tag, X, Check, AlertCircle } from 'lucide-react';

const PromoCodeInput = ({ onApply, appliedCode, onRemove, totalAmount = 0 }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [shakeError, setShakeError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (appliedCode) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [appliedCode]);

  const triggerShake = () => {
    setShakeError(true);
    setTimeout(() => setShakeError(false), 500);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error('Please enter a promo code');
      return;
    }

    if (appliedCode && appliedCode.code === code.toUpperCase().trim()) {
      toast.info('This promo code is already applied');
      return;
    }

    setValidating(true);

    try {
      const response = await axios.get(
        `/api/promo-codes/validate/${code.toUpperCase().trim()}?totalAmount=${totalAmount}`
      );

      if (response.data.success) {
        onApply(response.data.data);
        toast.success('Promo code applied successfully!');
        setCode('');
      }
    } catch (error) {
      console.error('Error validating promo code:', error);
      toast.error(
        error.response?.data?.message || 'Invalid or expired promo code'
      );
      triggerShake();
    } finally {
      setValidating(false);
    }
  };

  if (appliedCode) {
    return (
      <div 
        className={`rounded-lg p-4 transition-all duration-300 ${
          showSuccess ? 'animate-fadeIn' : ''
        }`}
        style={{ 
          backgroundColor: '#e7f8ed', 
          border: '2px solid #38b85d',
          boxShadow: '0 2px 8px rgba(56, 184, 93, 0.15)'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="rounded-full p-2"
              style={{ backgroundColor: '#38b85d' }}
            >
              <Check className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4" style={{ color: '#38b85d' }} />
                <span 
                  className="font-bold font-mono"
                  style={{ color: '#059669', fontSize: '14px' }}
                >
                  {appliedCode.code}
                </span>
              </div>
              {appliedCode.description && (
                <p 
                  className="text-xs mt-1"
                  style={{ color: '#059669' }}
                >
                  {appliedCode.description}
                </p>
              )}
              <p 
                className="text-sm font-semibold mt-1"
                style={{ color: '#059669' }}
              >
                Discount: GHS {appliedCode.discount.toFixed(2)}
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="p-2 rounded-full transition-colors hover:bg-green-100"
            title="Remove promo code"
            style={{ color: '#059669' }}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleApply}>
      <label 
        className="block mb-2"
        style={{ fontSize: '14px', color: '#6c757d', fontWeight: 500 }}
      >
        Promo Code
      </label>
      <div 
        className={`flex rounded-lg border-2 transition-all duration-200 overflow-hidden ${
          shakeError ? 'animate-shake' : ''
        }`}
        style={{
          borderColor: '#e5e7eb',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}
      >
        <div className="flex-1 relative">
          <Tag 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5"
            style={{ color: '#9ca3af' }}
          />
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Enter promo code"
            className="w-full pl-10 pr-4 py-2.5 border-0 focus:outline-none font-mono"
            style={{ fontSize: '14px' }}
            disabled={validating}
          />
        </div>
        <button
          type="submit"
          disabled={validating || !code.trim()}
          className={`px-5 py-2.5 rounded-r-lg font-semibold transition-all duration-200 ${
            validating || !code.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
          style={{
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          {validating ? '...' : 'Apply'}
        </button>
      </div>
    </form>
  );
};

export default PromoCodeInput;