# Security Quick Start Guide

## 🚀 Quick Setup

### 1. Set Your JWT Secret

**CRITICAL:** Generate a strong JWT secret before running in production:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add to your `.env` file:
```env
JWT_SECRET=<generated-secret-here>
JWT_EXPIRES_IN=7d
```

### 2. All Security Features Are Active

The following protections are **automatically enabled**:

✅ **NoSQL Injection Protection** - All routes protected
✅ **XSS Protection** - All inputs sanitized
✅ **CSRF Protection** - Cookies automatically set
✅ **Rate Limiting** - Applied to all endpoints
✅ **Security Headers** - Helmet.js configured
✅ **Login Protection** - 5 attempts max, 15min lockout

### 3. Frontend Integration

#### CSRF Token (Optional for JWT APIs)

The server automatically sets a CSRF cookie. For state-changing requests (POST, PUT, DELETE), you can include it:

```javascript
// Read token from cookie
const csrfToken = document.cookie
  .split('; ')
  .find(row => row.startsWith('csrfToken='))
  ?.split('=')[1];

// Include in requests
axios.post('/api/orders', data, {
  headers: {
    'X-CSRF-Token': csrfToken
  }
});
```

**Note:** For JWT-based APIs, CSRF protection is optional but recommended.

#### Rate Limiting

If you hit rate limits, you'll receive:
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

#### Authentication

Login attempts are limited:
- **5 attempts** per 15 minutes per IP
- Lockout message: `"Too many login attempts, please try again after 15 minutes."`

### 4. Testing Security

#### Test Rate Limiting
```bash
# Send 100+ requests quickly
for i in {1..101}; do curl http://localhost:5000/api/products; done
```

#### Test XSS Protection
```bash
# Try XSS in query parameter
curl "http://localhost:5000/api/products?search=<script>alert('xss')</script>"
# Script tags should be removed
```

#### Test NoSQL Injection
```bash
# Try MongoDB operator injection
curl -X POST http://localhost:5000/api/products/search \
  -H "Content-Type: application/json" \
  -d '{"name":{"$ne":null}}'
# Operators should be sanitized
```

### 5. Common Issues

**Issue:** "JWT_SECRET is not properly configured"
- **Solution:** Set a strong JWT_SECRET in your `.env` file (minimum 32 characters)

**Issue:** Rate limit errors
- **Solution:** This is working as intended. Reduce request frequency or contact admin.

**Issue:** CSRF token errors
- **Solution:** For JWT-based APIs, CSRF is optional. You can disable CSRF validation for API routes if needed.

## 📊 Security Status

Check server startup logs:
```
Server is running on port 5000
Security: All protections are active
```

If you see warnings about JWT_SECRET, fix it immediately!

## 🔗 See Full Documentation

See `SECURITY.md` for complete security documentation.

