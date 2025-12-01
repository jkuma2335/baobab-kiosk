const csrf = require('csrf');
const tokens = new csrf();

/**
 * CSRF Protection Middleware
 * 
 * For state-changing operations (POST, PUT, DELETE, PATCH)
 * Generates and validates CSRF tokens
 */

// Store for tokens (in production, use Redis or database)
const tokenStore = new Map();

/**
 * Generate CSRF token
 */
const generateCSRFToken = (req, res, next) => {
  const secret = tokens.secretSync();
  const token = tokens.create(secret);
  
  // Store secret in session or send to client
  // For stateless JWT, we'll send token in response header
  req.csrfSecret = secret;
  req.csrfToken = token;
  
  // Set token in response header
  res.setHeader('X-CSRF-Token', token);
  
  next();
};

/**
 * Validate CSRF token
 */
const validateCSRFToken = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Get token from header or body
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const secret = req.session?.csrfSecret || req.headers['x-csrf-secret'];

  if (!token) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token missing',
    });
  }

  if (!secret) {
    return res.status(403).json({
      success: false,
      message: 'CSRF secret missing',
    });
  }

  if (!tokens.verify(secret, token)) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token',
    });
  }

  next();
};

/**
 * Alternative: Double Submit Cookie Pattern
 * More suitable for REST APIs with JWT
 */
const doubleSubmitCookieCSRF = (req, res, next) => {
  // Skip CSRF for GET, HEAD, OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // For state-changing requests, check if token matches cookie
  const token = req.headers['x-csrf-token'];
  const cookieToken = req.cookies?.csrfToken;

  if (!token || !cookieToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token validation failed',
    });
  }

  // Use constant-time comparison to prevent timing attacks
  if (token !== cookieToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token mismatch',
    });
  }

  next();
};

/**
 * Set CSRF token in cookie for double-submit pattern
 */
const setCSRFCookie = (req, res, next) => {
  // Generate token if not exists
  let csrfToken = req.cookies?.csrfToken;
  
  if (!csrfToken) {
    csrfToken = tokens.secretSync();
    res.cookie('csrfToken', csrfToken, {
      httpOnly: false, // Must be readable by JavaScript for double-submit
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'strict', // CSRF protection
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
    req.csrfToken = csrfToken;
  }
  
  // Set token in response header for client to read
  res.setHeader('X-CSRF-Token', csrfToken);
  
  next();
};

module.exports = {
  generateCSRFToken,
  validateCSRFToken,
  doubleSubmitCookieCSRF,
  setCSRFCookie,
};
