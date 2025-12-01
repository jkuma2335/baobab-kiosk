const express = require('express');
const router = express.Router();
const upload = require('../utils/upload');
const { uploadImage, deleteImage } = require('../controllers/uploadController');
// const { protect, admin } = require('../middleware/authMiddleware');

// POST /api/upload - Upload single image
router.post('/', upload.single('image'), uploadImage);

// DELETE /api/upload/:publicId - Delete image
router.delete('/:publicId', deleteImage);

module.exports = router;

