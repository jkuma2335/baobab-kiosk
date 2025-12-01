const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Track login attempts per IP
const loginAttempts = new Map();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

/**
 * Track failed login attempts
 */
const trackLoginAttempt = (ip) => {
  const attempts = loginAttempts.get(ip) || { count: 0, lockUntil: null };
  
  // Check if locked out
  if (attempts.lockUntil && attempts.lockUntil > Date.now()) {
    return false; // Still locked
  }

  // Reset if lockout expired
  if (attempts.lockUntil && attempts.lockUntil <= Date.now()) {
    attempts.count = 0;
    attempts.lockUntil = null;
  }

  attempts.count += 1;

  // Lock account after max attempts
  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    attempts.lockUntil = Date.now() + LOCKOUT_TIME;
    loginAttempts.set(ip, attempts);
    return false; // Locked
  }

  loginAttempts.set(ip, attempts);
  return true; // Not locked
};

/**
 * Reset login attempts on successful login
 */
const resetLoginAttempts = (ip) => {
  loginAttempts.delete(ip);
};

/**
 * Check if IP is locked out
 */
const isLockedOut = (ip) => {
  const attempts = loginAttempts.get(ip);
  if (!attempts) return false;

  if (attempts.lockUntil && attempts.lockUntil > Date.now()) {
    const remainingTime = Math.ceil((attempts.lockUntil - Date.now()) / 1000 / 60);
    return {
      locked: true,
      remainingMinutes: remainingTime,
    };
  }

  return { locked: false };
};

/**
 * Enhanced JWT token verification with better error handling
 */
const verifyToken = (token) => {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret || jwtSecret === 'your-secret-key-change-in-production') {
    throw new Error('JWT_SECRET is not properly configured. Please set a strong secret in your .env file.');
  }

  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long for security.');
  }

  try {
    return jwt.verify(token, jwtSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

/**
 * Validate password strength
 */
const validatePasswordStrength = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Secure token generation
 */
const generateSecureToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET;
  
  if (!jwtSecret || jwtSecret === 'your-secret-key-change-in-production') {
    throw new Error('JWT_SECRET must be configured');
  }

  if (jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
  }

  // Generate token with shorter expiry for better security
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign(
    { id: userId },
    jwtSecret,
    { 
      expiresIn,
      algorithm: 'HS256', // Explicitly specify algorithm
    }
  );
};

/**
 * Sanitize user input for authentication
 */
const sanitizeAuthInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .toLowerCase() // For emails
    .replace(/[<>]/g, '') // Remove potential script tags
    .slice(0, 255); // Limit length
};

module.exports = {
  trackLoginAttempt,
  resetLoginAttempts,
  isLockedOut,
  verifyToken,
  validatePasswordStrength,
  generateSecureToken,
  sanitizeAuthInput,
  MAX_LOGIN_ATTEMPTS,
  LOCKOUT_TIME,
};
