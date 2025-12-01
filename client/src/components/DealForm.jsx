import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { X } from 'lucide-react';

const DealForm = ({ deal, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dealType: 'bundle',
    originalPrice: '',
    discountedPrice: '',
    status: 'popular',
    badgeText: '',
    image: '',
    isActive: true,
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || '',
        description: deal.description || '',
        dealType: deal.dealType || 'bundle',
        originalPrice: deal.originalPrice?.toString() || '',
        discountedPrice: deal.discountedPrice?.toString() || '',
        status: deal.status || 'popular',
        badgeText: deal.badgeText || '',
        image: deal.image || '',
        isActive: deal.isActive !== undefined ? deal.isActive : true,
        startDate: deal.startDate
          ? new Date(deal.startDate).toISOString().split('T')[0]
          : '',
        endDate: deal.endDate
          ? new Date(deal.endDate).toISOString().split('T')[0]
          : '',
      });
      setImagePreview(deal.image || '');
    } else {
      setFormData({
        title: '',
        description: '',
        dealType: 'bundle',
        originalPrice: '',
        discountedPrice: '',
        status: 'popular',
        badgeText: '',
        image: '',
        isActive: true,
        startDate: '',
        endDate: '',
      });
      setImagePreview('');
    }
    setImageFile(null);
    setErrors({});
  }, [deal, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file' && files && files[0]) {
      const file = files[0];
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast.error('Please select an image file');
      return;
    }

    setUploadingImage(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', imageFile);

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setFormData({ ...formData, image: response.data.data.url });
        toast.success('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title || !formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.originalPrice || parseFloat(formData.originalPrice) <= 0) {
      newErrors.originalPrice = 'Original price must be greater than 0';
    }

    if (!formData.discountedPrice || parseFloat(formData.discountedPrice) <= 0) {
      newErrors.discountedPrice = 'Discounted price must be greater than 0';
    }

    if (
      formData.originalPrice &&
      formData.discountedPrice &&
      parseFloat(formData.discountedPrice) >= parseFloat(formData.originalPrice)
    ) {
      newErrors.discountedPrice = 'Discounted price must be less than original price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: (formData.description || '').trim(),
        dealType: formData.dealType,
        originalPrice: parseFloat(formData.originalPrice),
        discountedPrice: parseFloat(formData.discountedPrice),
        status: formData.status,
        badgeText: (formData.badgeText || formData.dealType || 'Deal').trim(),
        image: (formData.image || '').trim(),
        isActive: formData.isActive,
        startDate: formData.startDate || new Date().toISOString(),
        endDate: formData.endDate || null,
      };

      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (deal) {
        await axios.put(`/api/deals/${deal._id}`, payload, config);
        toast.success('Deal updated successfully!');
      } else {
        await axios.post('/api/deals', payload, config);
        toast.success('Deal created successfully!');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving deal:', error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${deal ? 'update' : 'create'} deal`
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">
            {deal ? 'Edit Deal' : 'Create New Deal'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deal Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title || ''}
              onChange={handleChange}
              placeholder="e.g., Guinea Fowl + Rice Combo"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.title
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-green-500'
              }`}
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows="2"
              placeholder="e.g., Smoked guinea fowl (whole) + 5kg local rice"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Deal Type and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deal Type <span className="text-red-500">*</span>
              </label>
              <select
                name="dealType"
                value={formData.dealType || 'bundle'}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="bundle">Bundle Deal</option>
                <option value="mix">Mix Deal</option>
                <option value="seasonal">Seasonal</option>
                <option value="flash">Flash Sale</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status Badge
              </label>
              <select
                name="status"
                value={formData.status || 'popular'}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="hot">🔥 Hot</option>
                <option value="popular">⭐ Popular</option>
                <option value="new">🎉 New</option>
              </select>
            </div>
          </div>

          {/* Badge Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Badge Text
            </label>
            <input
              type="text"
              name="badgeText"
              value={formData.badgeText || ''}
              onChange={handleChange}
              placeholder="Leave empty to use Deal Type"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Text shown on the colored badge (e.g., "Bundle Deal", "Limited Time")
            </p>
          </div>

          {/* Prices */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Original Price (GHS) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="originalPrice"
                value={formData.originalPrice || ''}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.originalPrice
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              {errors.originalPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.originalPrice}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discounted Price (GHS) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="discountedPrice"
                value={formData.discountedPrice || ''}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.discountedPrice
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              {errors.discountedPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.discountedPrice}</p>
              )}
              {formData.originalPrice &&
                formData.discountedPrice &&
                parseFloat(formData.discountedPrice) < parseFloat(formData.originalPrice) && (
                  <p className="text-green-600 text-sm mt-1">
                    Save{' '}
                    {Math.round(
                      ((parseFloat(formData.originalPrice) -
                        parseFloat(formData.discountedPrice)) /
                        parseFloat(formData.originalPrice)) *
                        100
                    )}
                    %
                  </p>
                )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate || ''}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deal Image
            </label>

            {(imagePreview || formData.image) && (
              <div className="mb-3">
                <img
                  src={imagePreview || formData.image}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
              </div>
            )}

            <div className="mb-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              {imageFile && (
                <button
                  type="button"
                  onClick={handleImageUpload}
                  disabled={uploadingImage}
                  className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                >
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </button>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or enter URL</span>
              </div>
            </div>
            <input
              type="url"
              name="image"
              value={formData.image || ''}
              onChange={handleChange}
              placeholder="https://example.com/deal-image.jpg"
              className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive || false}
              onChange={handleChange}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Active (Show on homepage)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              } text-white`}
            >
              {loading ? 'Saving...' : deal ? 'Update Deal' : 'Create Deal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DealForm;

