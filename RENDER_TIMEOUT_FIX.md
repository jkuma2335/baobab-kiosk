# 🔧 Fix Render.com Timeout Issue

**Problem:** Deployment shows "Timed Out" even though server starts successfully.

**Logs show:**
- ✅ Server is running on port 5000
- ✅ MongoDB Connected
- ❌ ==> Timed Out (after ~2 minutes)

---

## ✅ **Fixes Applied**

### 1. **Removed Deprecated MongoDB Options**
- Removed `useNewUrlParser` and `useUnifiedTopology`
- These are no longer needed in MongoDB Driver 4.0+

### 2. **Added Health Check Endpoint**
- Added `/health` endpoint for Render health checks
- Responds immediately without waiting for DB

### 3. **Server Listening on 0.0.0.0**
- Explicitly set server to listen on `0.0.0.0` (all interfaces)
- This ensures Render can reach the server

### 4. **Fixed Duplicate Index Warning**
- Removed duplicate `code` index in PromoCode model
- Mongoose `unique: true` already creates the index

### 5. **Better Error Handling**
- Server won't exit on DB connection failure in production
- Allows server to start even if DB connection is delayed

---

## 🚀 **Next Steps**

1. **Commit and Push Changes:**
   ```bash
   git add .
   git commit -m "Fix: Render deployment timeout and MongoDB warnings"
   git push origin main
   ```

2. **Render Will Auto-Redeploy:**
   - Go to Render dashboard
   - Watch the new deployment
   - Should complete successfully now

3. **Verify Deployment:**
   - Visit: `https://baobab-kiosk-backend.onrender.com`
   - Should see: `{"message":"API is running",...}`
   - Visit: `https://baobab-kiosk-backend.onrender.com/health`
   - Should see: `{"status":"healthy","uptime":...}`

---

## ⚠️ **If Still Timing Out**

### Option 1: Add Render Health Check URL (Recommended)

In Render Dashboard → Settings → **Health Check Path:**
- Set to: `/health`
- This tells Render to ping this endpoint

### Option 2: Increase Timeout (if needed)

1. Render Dashboard → Settings → **Advanced**
2. Look for health check timeout settings
3. Increase if needed (default should be fine)

---

## 📋 **What Changed**

**Files Modified:**
- `backend/server.js`:
  - Removed deprecated MongoDB options
  - Added `/health` endpoint
  - Changed `app.listen()` to listen on `0.0.0.0`
  - Better error handling for DB connection

- `backend/models/PromoCode.js`:
  - Removed duplicate index definition
  - Fixed Mongoose warning

---

## ✅ **Expected Result**

After redeploy, you should see:
- ✅ Build completes
- ✅ Server starts on port 5000
- ✅ MongoDB connects (or retries if delayed)
- ✅ Deployment succeeds (no timeout)
- ✅ Service shows "Live" status

---

**The key fix:** Server now responds immediately to health checks at `/health`, so Render knows the service is ready even if MongoDB connection takes time.

