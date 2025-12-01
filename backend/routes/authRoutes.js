const express = require('express');
const router = express.Router();
const { authUser } = require('../controllers/authController');

// POST /api/auth/login - Authenticate user and get token
router.post('/login', authUser);

module.exports = router;

