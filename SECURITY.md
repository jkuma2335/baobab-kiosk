# Security Implementation Guide

This document outlines all the security measures implemented to protect the Baobab Kiosk online store from common web attacks.

## 🛡️ Implemented Security Protections

### 1. SQL/NoSQL Injection Protection ✅

**Status:** Fully Protected

- **Middleware:** `express-mongo-sanitize`
- **Location:** Applied globally in `server.js`
- **Protection:** 
  - Removes MongoDB operators (`$`, `.`) from user input
  - Replaces dangerous characters with safe alternatives
  - Logs injection attempts for monitoring

**Example Attack Prevented:**
```javascript
// Before protection (VULNERABLE):
// POST /api/products/search
// { "name": { "$ne": null } } // Could return all products

// After protection (SAFE):
// Dangerous operators are sanitized: { "name": "_ne": null }
```

### 2. Cross-Site Scripting (XSS) Protection ✅

**Status:** Fully Protected

**Multiple Layers:**
1. **Input Sanitization** - Removes script tags and event handlers
2. **Content Security Policy (CSP)** - Via Helmet.js
3. **Output Encoding** - All user input is sanitized before processing

**Middleware:** Custom `sanitizeRequest` middleware

**What's Protected:**
- Query parameters
- Request body
- URL parameters
- All string inputs are sanitized

**Example Attack Prevented:**
```javascript
// XSS Attempt:
// <script>alert('XSS')</script>
// <img src=x onerror="alert('XSS')">

// After Sanitization:
// Script tags and event handlers are removed
```

### 3. Cross-Site Request Forgery (CSRF) Protection ✅

**Status:** Implemented

**Method:** Double Submit Cookie Pattern

**How It Works:**
1. Server sets a CSRF token in a cookie
2. Client must send the same token in a header (`X-CSRF-Token`)
3. Server validates that cookie and header tokens match

**Implementation:**
- Cookie: `csrfToken` (accessible to JavaScript)
- Header: `X-CSRF-Token` (sent with each request)
- SameSite: `strict` (prevents cross-site cookie access)

**Note:** For REST APIs using JWT, CSRF protection is optional but recommended for state-changing operations.

### 4. Broken Authentication Protection ✅

**Status:** Fully Protected

**Implemented Features:**

#### a. Strong JWT Token Security
- **Minimum Secret Length:** 32 characters (enforced)
- **Secure Algorithm:** HS256 (explicitly specified)
- **Token Expiry:** Configurable via `JWT_EXPIRES_IN`
- **Validation:** Enhanced error handling

#### b. Login Attempt Tracking
- **Max Attempts:** 5 per IP address
- **Lockout Duration:** 15 minutes
- **Reset:** Automatic on successful login

#### c. Password Security
- **Minimum Length:** 8 characters
- **Requirements:**
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character

#### d. Input Sanitization for Auth
- Email normalization (lowercase)
- Trimming and length limits
- Script tag removal

### 5. Rate Limiting ✅

**Status:** Fully Protected

**Multiple Rate Limiters:**

1. **General API Limiter**
   - Limit: 100 requests per 15 minutes per IP
   - Applied to: All `/api/*` routes

2. **Authentication Limiter**
   - Limit: 5 requests per 15 minutes per IP
   - Applied to: `/api/auth/*` routes
   - Skips successful requests

3. **Order Creation Limiter**
   - Limit: 10 orders per hour per IP
   - Applied to: `/api/orders` POST requests

4. **Promo Code Limiter**
   - Limit: 20 validations per 15 minutes per IP
   - Applied to: `/api/promo-codes/*` routes

### 6. Security Headers (Helmet.js) ✅

**Status:** Fully Configured

**Headers Set:**
- **Content-Security-Policy** - Prevents XSS attacks
- **X-Content-Type-Options** - Prevents MIME sniffing
- **X-Frame-Options** - Prevents clickjacking
- **X-XSS-Protection** - Additional XSS protection
- **Strict-Transport-Security (HSTS)** - Forces HTTPS
- **Referrer-Policy** - Controls referrer information

### 7. Request Size Limits ✅

**Status:** Protected

- **JSON Limit:** 10MB
- **URL Encoded Limit:** 10MB
- **File Upload:** 5MB (via multer)

### 8. CORS Configuration ✅

**Status:** Configured

- **Allowed Origins:** Configured via `FRONTEND_URL` environment variable
- **Credentials:** Enabled for authentication
- **Methods:** GET, POST, PUT, DELETE, PATCH, OPTIONS
- **Headers:** Content-Type, Authorization, X-CSRF-Token

## 🔧 Configuration

### Environment Variables Required

```env
# JWT Configuration
JWT_SECRET=your-very-strong-secret-key-minimum-32-characters-long
JWT_EXPIRES_IN=7d

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Node Environment
NODE_ENV=production
```

### Important: JWT_SECRET

⚠️ **CRITICAL:** The JWT_SECRET must:
- Be at least 32 characters long
- Be a random, unpredictable string
- Never be committed to version control
- Be different for each environment (dev, staging, production)

**Generate a strong secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📋 Security Checklist

- [x] NoSQL Injection Protection
- [x] XSS Protection (Input Sanitization + CSP)
- [x] CSRF Protection
- [x] Rate Limiting
- [x] Security Headers
- [x] Strong Authentication
- [x] Login Attempt Tracking
- [x] Request Size Limits
- [x] CORS Configuration
- [x] Input Validation
- [x] Error Handling (No sensitive data leakage)

## 🚨 Security Best Practices

### For Developers

1. **Never trust user input** - Always validate and sanitize
2. **Use parameterized queries** - Mongoose handles this, but be careful with raw queries
3. **Keep dependencies updated** - Regularly run `npm audit`
4. **Use HTTPS in production** - Never transmit sensitive data over HTTP
5. **Implement proper logging** - Log security events for monitoring

### For Deployment

1. **Set strong environment variables** - Never use defaults in production
2. **Enable HTTPS** - Use SSL/TLS certificates
3. **Set secure cookie flags** - `secure`, `httpOnly`, `sameSite`
4. **Monitor logs** - Watch for suspicious activity
5. **Regular backups** - Protect against data loss

## 🔍 Monitoring & Alerts

### What to Monitor

1. **Failed Login Attempts** - Multiple failures from same IP
2. **Rate Limit Violations** - May indicate automated attacks
3. **Injection Attempts** - Sanitization warnings in logs
4. **Unusual Request Patterns** - Large payloads, suspicious endpoints

### Log Locations

- Failed login attempts are logged via `console.warn`
- Injection attempts are logged in `noSqlInjectionProtection`
- Rate limit violations return 429 status codes

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MongoDB Security Checklist](https://www.mongodb.com/docs/manual/administration/security-checklist/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

## 🆘 Security Incident Response

If you suspect a security breach:

1. **Immediately** change all secrets (JWT_SECRET, database passwords)
2. **Review** logs for suspicious activity
3. **Assess** potential data exposure
4. **Notify** affected users if personal data was compromised
5. **Document** the incident and response

---

**Last Updated:** $(date)
**Security Status:** ✅ All Critical Protections Active

