# 🔧 Fix Vercel Frontend API Connection

**Problem:** Frontend on Vercel shows 404 errors for all API calls (`/api/products`, `/api/categories`, etc.)

**Cause:** `vercel.json` had a placeholder backend URL instead of your actual Render backend URL.

---

## ✅ **Fix Applied**

Updated `client/vercel.json` to point to your Render backend:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://baobab-kiosk-backend.onrender.com/api/:path*"
    }
  ]
}
```

---

## 🚀 **Next Steps**

### Option 1: Auto-Redeploy (If Connected to GitHub)

If Vercel is connected to your GitHub repo, it will **auto-redeploy** after you push:
1. ✅ Changes have been committed and pushed
2. ✅ Vercel will detect the push
3. ✅ New deployment will start automatically
4. ⏳ Wait 2-3 minutes for deployment to complete

### Option 2: Manual Redeploy

If auto-deploy doesn't trigger:

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click on **"baobab-kiosk"** project

2. **Trigger Manual Deploy:**
   - Click **"Deployments"** tab
   - Click **"Redeploy"** on the latest deployment
   - Or click **"Deploy"** button

---

## ✅ **After Redeploy - Verify**

1. **Visit your frontend:**
   ```
   https://baobab-kiosk-nine.vercel.app
   ```

2. **Check Browser Console:**
   - Open DevTools (F12)
   - Go to **Console** tab
   - Should see **NO 404 errors** for `/api/products`, `/api/categories`, etc.

3. **Test Pages:**
   - Home page should load products
   - Products page should show products
   - Categories should load

---

## 🔍 **How It Works**

The `vercel.json` rewrite rule tells Vercel:
- When frontend requests `/api/products`
- **Proxy it to:** `https://baobab-kiosk-backend.onrender.com/api/products`
- Return the response to the frontend

This way, the frontend can use relative URLs like `/api/products` and Vercel handles the backend routing.

---

## ⚠️ **Alternative: Environment Variable Approach**

If you prefer using environment variables instead of rewrites:

1. **In Vercel Dashboard:**
   - Settings → Environment Variables
   - Add: `VITE_API_URL=https://baobab-kiosk-backend.onrender.com`

2. **Update frontend code** to use `VITE_API_URL` for all axios calls
   - More code changes needed
   - Current rewrite approach is simpler

---

## 🎯 **Current Status**

- ✅ `vercel.json` updated with Render backend URL
- ✅ Changes committed and pushed to GitHub
- ⏳ **Waiting for Vercel to redeploy** (should be automatic)
- ⏳ **After redeploy:** Frontend should connect to backend successfully

---

**Once Vercel redeploys, your frontend should work!** 🎉

