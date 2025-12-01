# 🚀 Quick Deploy to Render.com

**Fastest way to deploy your backend (5 minutes)**

---

## Step 1: Sign Up (1 min)

1. Go to: **https://render.com**
2. Click **"Get Started for Free"**
3. Choose **"Sign up with GitHub"**
4. Authorize Render to access your GitHub

---

## Step 2: Create Web Service (2 min)

1. In Render dashboard, click **"New +"** (top right)
2. Select **"Web Service"**
3. Connect your repository:
   - Find: **`jkuma2335/baobab-kiosk`**
   - Click **"Connect"**

---

## Step 3: Configure Service (1 min)

Fill in the form:

```
Name: baobab-kiosk-backend
Region: Choose closest to you (e.g., "Oregon (US West)")
Branch: main
Root Directory: backend          ⚠️ CRITICAL: Must be "backend" (not empty!)
Runtime: Node
Build Command: npm install
Start Command: node server.js     ⚠️ Should NOT include "backend/" prefix
Plan: Free (or Starter for $7/month if you want)
```

**⚠️ IMPORTANT:** Make sure **Root Directory** is set to `backend` exactly. If you leave it empty, Render will look in the wrong place and you'll get a "Cannot find module" error.

---

## Step 3.5: Verify Root Directory ⚠️

**Before proceeding, double-check:**
- **Root Directory** field should say: `backend`
- **NOT** empty
- **NOT** `backend/`
- Just: `backend`

If you already created the service and got an error, see `RENDER_FIX.md` to fix it.

---

## Step 4: Add Environment Variables (1 min)

Click **"Advanced"** → **"Add Environment Variable"**

Add these **9 variables**:

```
MONGO_URI = mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/baobab-kiosk?retryWrites=true&w=majority

JWT_SECRET = [Generate using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"]

JWT_EXPIRES_IN = 7d

NODE_ENV = production

PORT = 5000

FRONTEND_URL = https://your-vercel-url.vercel.app

CLOUDINARY_CLOUD_NAME = your_cloud_name

CLOUDINARY_API_KEY = your_api_key

CLOUDINARY_API_SECRET = your_api_secret
```

**💡 Don't have these values?**
- `MONGO_URI`: Get from MongoDB Atlas (Step 2 in main guide)
- `JWT_SECRET`: Generate in terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `CLOUDINARY_*`: Get from Cloudinary dashboard (Step 3 in main guide)
- `FRONTEND_URL`: Use `http://localhost:5173` for now (update after Vercel deploy)

---

## Step 5: Deploy (30 seconds)

1. Scroll down
2. Click **"Create Web Service"**
3. Render will start building your app
4. Wait 2-3 minutes for build to complete

---

## Step 6: Get Your Backend URL

1. Once deployed, you'll see: **"Your service is live!"**
2. Copy the URL:
   ```
   https://baobab-kiosk-backend.onrender.com
   ```
3. **Test it:** Open the URL in a browser
   - Should see: `{"message":"API is running"}`

---

## Step 7: Update Frontend (after Vercel deploy)

1. Go to **Vercel Dashboard**
2. Your project → **Settings** → **Environment Variables**
3. Add/Update:
   ```
   VITE_API_URL = https://baobab-kiosk-backend.onrender.com
   ```
4. **Redeploy** frontend (Vercel will auto-redeploy)

---

## ⚠️ Important: Free Tier Limitations

Render's free tier has **one limitation**:

- **Service sleeps after 15 minutes** of inactivity
- First request after sleep takes ~30 seconds to wake up
- Subsequent requests are fast

**💡 Solution: Keep it awake**
- Use a free service like **cron-job.org** or **UptimeRobot**
- Set it to ping your backend URL every 14 minutes
- Or upgrade to **Starter plan** ($7/month) for always-on service

---

## ✅ Done!

Your backend is now live at:
- **URL:** `https://baobab-kiosk-backend.onrender.com`
- **API Test:** `https://baobab-kiosk-backend.onrender.com/api/products`

**Next Steps:**
1. Deploy frontend to Vercel (if not done)
2. Update `FRONTEND_URL` in Render
3. Update `VITE_API_URL` in Vercel
4. Test your full application!

---

**Need more details?** See `DEPLOY_ALTERNATIVES.md` for comparison with other services.

