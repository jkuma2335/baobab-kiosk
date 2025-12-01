const User = require('../models/User');
const { 
  trackLoginAttempt, 
  resetLoginAttempts, 
  isLockedOut,
  generateSecureToken,
  sanitizeAuthInput 
} = require('../middleware/authSecurityMiddleware');

// @desc    Authenticate user and get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIP = req.ip || req.connection.remoteAddress;

    // Check if IP is locked out
    const lockoutStatus = isLockedOut(clientIP);
    if (lockoutStatus.locked) {
      return res.status(429).json({
        success: false,
        message: `Too many login attempts. Please try again in ${lockoutStatus.remainingMinutes} minute(s).`,
      });
    }

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Sanitize input
    const sanitizedEmail = sanitizeAuthInput(email);

    // Track login attempt
    const canAttempt = trackLoginAttempt(clientIP);
    if (!canAttempt) {
      return res.status(429).json({
        success: false,
        message: 'Too many login attempts. Please try again in 15 minutes.',
      });
    }

    // Find user by email
    const user = await User.findOne({ email: sanitizedEmail });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Successful login - reset attempts and generate token
    resetLoginAttempts(clientIP);
    const token = generateSecureToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
        },
      },
    });
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({
      success: false,
      message: 'Error authenticating user',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
    });
  }
};

module.exports = {
  authUser,
};

