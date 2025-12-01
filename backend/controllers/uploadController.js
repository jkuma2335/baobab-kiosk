const cloudinary = require('../config/cloudinary');
const { Readable } = require('stream');

// @desc    Upload image to Cloudinary
// @route   POST /api/upload
// @access  Private/Admin (add auth middleware later)
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    // Convert buffer to stream for Cloudinary
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'baobab-kiosk', // Folder in Cloudinary
        resource_type: 'image',
        transformation: [
          {
            width: 1000,
            height: 1000,
            crop: 'limit',
            quality: 'auto',
            fetch_format: 'auto',
          },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          return res.status(500).json({
            success: false,
            message: 'Error uploading image to Cloudinary',
            error: error.message,
          });
        }

        res.json({
          success: true,
          message: 'Image uploaded successfully',
          data: {
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
          },
        });
      }
    );

    // Pipe the buffer to the stream
    const bufferStream = new Readable();
    bufferStream.push(req.file.buffer);
    bufferStream.push(null);
    bufferStream.pipe(stream);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading image',
      error: error.message,
    });
  }
};

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/:publicId
// @access  Private/Admin
const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required',
      });
    }

    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: 'Image deleted successfully',
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Image not found',
      });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message,
    });
  }
};

module.exports = {
  uploadImage,
  deleteImage,
};

