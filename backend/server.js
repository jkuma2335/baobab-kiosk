require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

// Import security middleware
const {
  apiLimiter,
  authLimiter,
  orderLimiter,
  promoCodeLimiter,
  securityHeaders,
  noSqlInjectionProtection,
  sanitizeRequest,
  requestSizeLimit,
} = require('./middleware/securityMiddleware');
const { setCSRFCookie } = require('./middleware/csrfMiddleware');

// Import routes
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const dealRoutes = require('./routes/dealRoutes');
const promoCodeRoutes = require('./routes/promoCodeRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ==================== SECURITY MIDDLEWARE ====================

// 1. Security Headers (Helmet)
app.use(securityHeaders);

// 2. CORS Configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// 3. Cookie Parser (for CSRF tokens)
app.use(cookieParser());

// 4. Request Size Limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. NoSQL Injection Protection
app.use(noSqlInjectionProtection);

// 6. XSS Protection - Sanitize all inputs
app.use(sanitizeRequest);

// 7. CSRF Protection - Set cookie for double-submit pattern
app.use(setCSRFCookie);

// 8. General API Rate Limiting
app.use('/api/', apiLimiter);

// 9. Request size limit error handler
app.use(requestSizeLimit);

// ==================== MONGODB CONNECTION ====================

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    // Don't exit in production - let server start even if DB connection fails initially
    // Render needs the server to start quickly
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

// ==================== ROUTES ====================

// Authentication routes with strict rate limiting
app.use('/api/auth', authLimiter, authRoutes);

// Order routes with rate limiting
app.use('/api/orders', orderLimiter, orderRoutes);

// Promo code routes with rate limiting
app.use('/api/promo-codes', promoCodeLimiter, promoCodeRoutes);

// Other routes
app.use('/api/products', productRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/deals', dealRoutes);

// ==================== HEALTH CHECK ====================
// Render needs this to respond quickly to verify deployment

app.get('/', (req, res) => {
  res.json({ 
    message: 'API is running',
    security: 'All security middleware is active',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint for Render (responds immediately)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    uptime: process.uptime()
  });
});

// ==================== ERROR HANDLING ====================

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;

  res.status(err.status || 500).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ==================== START SERVER ====================

// Listen on 0.0.0.0 to accept connections from Render
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Security: All protections are active`);
  
  // Warn if JWT_SECRET is not properly configured
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'your-secret-key-change-in-production') {
    console.warn('⚠️  WARNING: JWT_SECRET is not configured. Please set a strong secret in your .env file.');
  } else if (process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  WARNING: JWT_SECRET should be at least 32 characters long for better security.');
  }
});
