# 🔧 Fix Render.com Deployment Error

**Error:** `Cannot find module '/opt/render/project/src/server.js'`

**Cause:** Root Directory not set correctly in Render dashboard.

---

## ✅ **Quick Fix (2 minutes)**

### Step 1: Go to Render Dashboard

1. Go to: https://dashboard.render.com
2. Click on **"baobab-kiosk-backend"** service
3. Go to **"Settings"** tab (left sidebar)

### Step 2: Fix Root Directory

1. Scroll down to **"Build & Deploy"** section
2. Find **"Root Directory"** field
3. Change it to: `backend`
4. Click **"Save Changes"**

### Step 3: Verify Start Command

In the same section, make sure:
- **Start Command:** `node server.js`

### Step 4: Verify Build Command

Make sure:
- **Build Command:** `npm install`

### Step 5: Redeploy

1. Click **"Manual Deploy"** button (top right)
2. Select **"Deploy latest commit"**
3. Wait for deployment to complete

---

## ✅ **Expected Configuration**

Your Render settings should be:

```
Name: baobab-kiosk-backend
Environment: Node
Root Directory: backend          ← THIS IS CRITICAL!
Build Command: npm install
Start Command: node server.js    ← Should NOT include "backend/"
Region: (your preferred region)
Branch: main
Plan: Free
```

---

## 🔍 **Verify in Settings**

Go to **Settings** → **Build & Deploy** and confirm:

- ✅ **Root Directory:** `backend` (NOT empty, NOT `backend/`, just `backend`)
- ✅ **Build Command:** `npm install`
- ✅ **Start Command:** `node server.js`

---

## ❌ **Common Mistakes**

| Wrong | Correct |
|-------|---------|
| Root Directory: (empty) | Root Directory: `backend` |
| Root Directory: `backend/` | Root Directory: `backend` |
| Start Command: `node backend/server.js` | Start Command: `node server.js` |
| Build Command: `cd backend && npm install` | Build Command: `npm install` |

---

## 🚀 **After Fix**

Once you update the Root Directory and redeploy, you should see:

✅ Build completes successfully
✅ Server starts with: "Server running on port 5000"
✅ API accessible at: `https://baobab-kiosk-backend.onrender.com`

---

## 📸 **Where to Find Root Directory Setting**

1. Dashboard → **baobab-kiosk-backend** → **Settings** tab
2. Scroll to **"Build & Deploy"** section
3. Look for **"Root Directory"** field
4. Enter: `backend`

---

**Need help?** The key issue is that Render needs to know where your backend code is. Setting Root Directory to `backend` tells Render to run all commands from that folder.

