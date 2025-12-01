# 🔧 Render.com Troubleshooting Guide

Common errors and fixes for Render deployment.

---

## ❌ Error: "Cannot find module '/opt/render/project/src/server.js'"

### Problem:
Render is looking for `server.js` in the wrong location.

### Solution:
**Set Root Directory in Render Settings:**

1. Go to Render Dashboard → Your Service → **Settings**
2. Scroll to **"Build & Deploy"** section
3. Find **"Root Directory"** field
4. Enter: `backend`
5. Click **"Save Changes"**
6. Go to **"Events"** → Click **"Manual Deploy"** → **"Deploy latest commit"**

**Correct Configuration:**
```
Root Directory: backend          ← Must be set!
Build Command: npm install
Start Command: node server.js    ← No "backend/" prefix needed
```

---

## ❌ Error: "npm: command not found" or "node: command not found"

### Problem:
Runtime environment not set correctly.

### Solution:
1. Go to **Settings** → **Build & Deploy**
2. Make sure **"Environment"** is set to: **Node**
3. Render should auto-detect, but verify it says "Node"

---

## ❌ Error: "PORT is not defined" or connection refused

### Problem:
Environment variables not set or PORT variable missing.

### Solution:
1. Go to **Settings** → **Environment Variables**
2. Make sure you have:
   ```
   PORT=5000
   NODE_ENV=production
   ```
3. Click **"Save Changes"**
4. Service will auto-redeploy

---

## ❌ Error: "MongoNetworkError" or database connection failed

### Problem:
- MongoDB Atlas IP whitelist doesn't include Render IPs
- Wrong MONGO_URI
- Missing environment variables

### Solution:

1. **Check MongoDB Atlas:**
   - Go to MongoDB Atlas → Network Access
   - Make sure you have: `0.0.0.0/0` (allows all IPs)
   - Or add Render's IP ranges (they change, so use 0.0.0.0/0 for now)

2. **Verify MONGO_URI:**
   - Go to Render → Settings → Environment Variables
   - Check `MONGO_URI` format:
     ```
     mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/baobab-kiosk?retryWrites=true&w=majority
     ```
   - Make sure password is URL-encoded (replace special characters)

3. **Redeploy:**
   - Settings → Save Changes → Auto-redeploy

---

## ❌ Error: Service sleeps after 15 minutes (free tier)

### Problem:
Render's free tier spins down services after 15 minutes of inactivity.

### Solution:

**Option 1: Use a cron service (Free)**
1. Sign up at: https://cron-job.org (free)
2. Create a new cron job:
   - URL: `https://your-backend.onrender.com`
   - Schedule: Every 14 minutes
3. This keeps your service awake

**Option 2: Upgrade to Starter ($7/month)**
- Always-on service
- No sleep time
- Better for production

---

## ❌ Error: Build succeeds but app crashes on start

### Problem:
- Missing environment variables
- Port conflict
- Code error

### Solution:

1. **Check Logs:**
   - Go to **Logs** tab
   - Look for error messages
   - Common issues:
     - Missing `JWT_SECRET`
     - Missing `MONGO_URI`
     - Missing `CLOUDINARY_*` variables

2. **Verify Environment Variables:**
   - Settings → Environment Variables
   - Make sure ALL required variables are set:
     ```
     MONGO_URI=...
     JWT_SECRET=...
     JWT_EXPIRES_IN=7d
     NODE_ENV=production
     PORT=5000
     FRONTEND_URL=...
     CLOUDINARY_CLOUD_NAME=...
     CLOUDINARY_API_KEY=...
     CLOUDINARY_API_SECRET=...
     ```

3. **Check Start Command:**
   - Should be: `node server.js`
   - NOT: `npm start` (unless package.json has proper start script)

---

## ❌ Error: CORS errors from frontend

### Problem:
`FRONTEND_URL` not set or incorrect in backend.

### Solution:
1. Go to Render → Settings → Environment Variables
2. Set `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Save and redeploy

---

## ❌ Error: "Cannot read property 'x' of undefined" in code

### Problem:
Code error or missing dependency.

### Solution:
1. **Test locally first:**
   ```bash
   cd backend
   npm install
   node server.js
   ```
2. **Check Logs** in Render for specific error
3. **Verify all dependencies** are in `package.json`
4. **Check Node version** - Render uses Node 18+ by default

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Root Directory is set to `backend`
- [ ] Build Command: `npm install`
- [ ] Start Command: `node server.js`
- [ ] All 9 environment variables are set
- [ ] Service shows "Live" status
- [ ] Visit service URL - should see `{"message":"API is running"}`
- [ ] Test `/api/products` endpoint

---

## 🆘 Still Having Issues?

1. **Check Render Logs:**
   - Go to **Logs** tab
   - Look for specific error messages
   - Copy error and search Google

2. **Test Locally:**
   - Make sure it works locally first
   - Use same Node version as Render

3. **Render Support:**
   - Render dashboard → Contact Support
   - They're usually very responsive

4. **Check Documentation:**
   - Render docs: https://render.com/docs
   - Our guide: `DEPLOY_RENDER_QUICK.md`

---

**Most Common Issue:** Root Directory not set. Always verify this first!

