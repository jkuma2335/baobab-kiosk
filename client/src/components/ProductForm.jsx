import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTimes } from 'react-icons/fa';

const ProductForm = ({ product, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    unit: '',
    stock: '',
    description: '',
    image: '',
    images: [],
    featured: false,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [uploadingImages, setUploadingImages] = useState({});

  // Fetch categories from API
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await axios.get('/api/categories');
      const categoryNames = (response.data.data || []).map((cat) => cat.name);
      setCategories(categoryNames);
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
      // Fallback to empty array
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (product) {
      // Editing mode - populate form with product data
      // Backward compatibility: use images array if exists, else use image field
      const productImages = (product.images && product.images.length > 0) 
        ? product.images 
        : (product.image ? [product.image] : []);
      
      setFormData({
        name: (product.name || '').toString(),
        category: (product.category || '').toString(),
        price: product.price ? product.price.toString() : '',
        unit: (product.unit || '').toString(),
        stock: product.stock !== undefined ? product.stock.toString() : '',
        description: (product.description || '').toString(),
        image: (product.image || '').toString(), // Keep for backward compat
        images: productImages,
        featured: product.featured === true,
      });
    } else {
      // Creating mode - reset form
      setFormData({
        name: '',
        category: '',
        price: '',
        unit: '',
        stock: '',
        description: '',
        image: '',
        images: [],
        featured: false,
      });
    }
    setImageFiles([]);
    setErrors({});
  }, [product, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file' && files && files.length > 0) {
      // Handle multiple files
      const newFiles = Array.from(files);
      setImageFiles((prev) => [...prev, ...newFiles]);
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
    
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleImageUpload = async (file, index = null) => {
    if (!file) return;

    const fileId = index !== null ? `file-${index}` : `file-${Date.now()}`;
    setUploadingImages((prev) => ({ ...prev, [fileId]: true }));

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('image', file);

      const token = localStorage.getItem('token');
      const response = await axios.post('/api/upload', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        const imageUrl = response.data.data.url;
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, imageUrl],
        }));
        
        // Remove uploaded file from pending files
        setImageFiles((prev) => prev.filter((f) => f !== file));
        toast.success('Image uploaded successfully!');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploadingImages((prev) => {
        const newState = { ...prev };
        delete newState[fileId];
        return newState;
      });
    }
  };

  const handleUploadAllImages = async () => {
    if (imageFiles.length === 0) {
      toast.error('Please select image files to upload');
      return;
    }

    // Upload all files sequentially
    for (const file of imageFiles) {
      await handleImageUpload(file);
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleRemovePendingFile = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name || !formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    if (!formData.unit || !formData.unit.trim()) {
      newErrors.unit = 'Unit is required';
    }

    if (formData.stock === '' || parseFloat(formData.stock) < 0) {
      newErrors.stock = 'Stock must be 0 or greater';
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
      // Use images array if available, otherwise fall back to single image for backward compatibility
      const images = formData.images && formData.images.length > 0 
        ? formData.images 
        : (formData.image ? [formData.image] : []);

      const payload = {
        name: (formData.name || '').trim(),
        category: formData.category || '',
        price: parseFloat(formData.price) || 0,
        unit: (formData.unit || '').trim(),
        stock: parseInt(formData.stock) || 0,
        description: (formData.description || '').trim(),
        image: images[0] || (formData.image || '').trim(), // Keep for backward compat
        images: images, // New images array
        featured: formData.featured || false,
      };

      if (product) {
        // Update existing product
        await axios.put(`/api/products/${product._id}`, payload);
        toast.success('Product updated successfully!');
      } else {
        // Create new product
        await axios.post('/api/products', payload);
        toast.success('Product created successfully!');
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error(
        error.response?.data?.message ||
          `Failed to ${product ? 'update' : 'create'} product`
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
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FaTimes className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-green-500'
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Category and Price */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category || ''}
                onChange={handleChange}
                disabled={loadingCategories}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.category
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                } ${loadingCategories ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {loadingCategories ? 'Loading categories...' : 'Select Category'}
                </option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price (GHS) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price || ''}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.price
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Unit and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="unit"
                value={formData.unit || ''}
                onChange={handleChange}
                placeholder="e.g., Bucket, Pack of 5"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.unit
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              {errors.unit && (
                <p className="text-red-500 text-sm mt-1">{errors.unit}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock || ''}
                onChange={handleChange}
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                  errors.stock
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:ring-green-500'
                }`}
              />
              {errors.stock && (
                <p className="text-red-500 text-sm mt-1">{errors.stock}</p>
              )}
            </div>
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
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Image Upload - Multiple Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Images (Multiple images supported)
            </label>
            
            {/* Existing Images Preview */}
            {formData.images && formData.images.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Current Images ({formData.images.length}):</p>
                <div className="flex flex-wrap gap-3">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Product image ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border-2 border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload Files */}
            <div className="mb-3">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">You can select multiple images at once</p>
              
              {/* Pending Files to Upload */}
              {imageFiles.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Pending uploads ({imageFiles.length}):</p>
                  <div className="space-y-2">
                    {imageFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => handleImageUpload(file, index)}
                            disabled={uploadingImages[`file-${index}`]}
                            className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:bg-gray-400"
                          >
                            {uploadingImages[`file-${index}`] ? 'Uploading...' : 'Upload'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemovePendingFile(index)}
                            className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <FaTimes className="text-xs" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleUploadAllImages}
                    className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                  >
                    Upload All ({imageFiles.length})
                  </button>
                </div>
              )}
            </div>

            {/* Or Image URL */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or add image URL</span>
              </div>
            </div>
            <div className="mt-3 flex space-x-2">
              <input
                type="url"
                name="image"
                value={formData.image || ''}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (formData.image) {
                    setFormData((prev) => ({
                      ...prev,
                      images: [...prev.images, prev.image],
                      image: '',
                    }));
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add URL
              </button>
            </div>
          </div>

          {/* Featured */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleChange}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">
              Featured Product
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
              {loading
                ? 'Saving...'
                : product
                ? 'Update Product'
                : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;

