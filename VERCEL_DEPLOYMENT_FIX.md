# 🔧 Vercel Deployment Fix

## Issue: Project Already Exists

You're seeing: **"Project 'baobab-kiosk' already exists, please use a new name."**

### Solution Options:

#### Option 1: Delete Existing Project (Recommended)

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Find the existing "baobab-kiosk" project
3. Click on it → Settings → Scroll down → Delete Project
4. Then try importing again

#### Option 2: Use Different Project Name

1. In the import screen, change the Project Name to:
   - `baobab-kiosk-frontend` or
   - `baobab-kiosk-store` or
   - `baobab-kiosk-client`

---

## ⚠️ Important: Configure for Frontend Only

**You're deploying the FRONTEND only to Vercel!**

### Correct Vercel Configuration:

1. **Repository**: Select `cursorai053-ship-it/baobab-kiosk`

2. **Framework Preset**: 
   - Select "Vite" (or "Other" if Vite not available)

3. **Root Directory**: ⚠️ **CRITICAL** ⚠️
   - Click "Edit" next to Root Directory
   - Set to: `client`
   - This tells Vercel to only deploy the frontend folder

4. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Environment Variables** (Add these):
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```
   (You'll update this AFTER deploying backend)

6. **Deploy**: Click Deploy

---

## 📝 Step-by-Step: Correct Vercel Setup

### Step 1: Import Project

1. Go to: https://vercel.com/new
2. Select: **Import Git Repository**
3. Choose: `cursorai053-ship-it/baobab-kiosk`
4. If project exists, delete old one first (see Option 1 above)

### Step 2: Configure Project Settings

**⚠️ CRITICAL CONFIGURATION:**

1. **Project Name**: `baobab-kiosk` (or delete old one first)

2. **Framework Preset**: 
   - Choose **"Vite"** from dropdown

3. **Root Directory**: 
   - Click **"Edit"** button
   - Change from `/` to **`client`**
   - This is ESSENTIAL!

4. **Build and Output Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Step 3: Environment Variables

For now, leave environment variables empty (you'll add backend URL later).

**DO NOT** add backend environment variables like:
- ❌ `MONGO_URI` (this is for backend only)
- ❌ `JWT_SECRET` (this is for backend only)
- ❌ `CLOUDINARY_*` (this is for backend only)

**Only add frontend variables:**
- ✅ `VITE_API_URL` (add this AFTER backend is deployed)

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Vercel will provide you a URL like: `https://baobab-kiosk.vercel.app`

---

## 🎯 What Gets Deployed Where

### Vercel (Frontend Only):
- ✅ `client/` folder
- ✅ React app
- ✅ Static files

### Railway/Render (Backend Only):
- ✅ `backend/` folder
- ✅ Node.js/Express API
- ✅ Database connections

---

## 🔄 After Frontend Deployment

1. **Save your Vercel URL**: `https://your-app.vercel.app`

2. **Deploy Backend to Railway**:
   - See `QUICK_DEPLOY.md` or `DEPLOYMENT_GUIDE.md`
   - Root directory: `backend`

3. **Get Backend URL**: Railway will give you a URL

4. **Update Frontend Environment Variable**:
   - Go back to Vercel Dashboard
   - Your Project → Settings → Environment Variables
   - Add: `VITE_API_URL=https://your-backend.railway.app`
   - Redeploy

---

## ❌ Common Mistakes to Avoid

1. ❌ Deploying entire repo to Vercel (use `client/` folder only)
2. ❌ Adding backend env vars to Vercel (they belong in Railway)
3. ❌ Not setting Root Directory to `client`
4. ❌ Deploying backend to Vercel (use Railway/Render instead)

---

## ✅ Quick Checklist

- [ ] Delete old "baobab-kiosk" project in Vercel (if exists)
- [ ] Import repository: `cursorai053-ship-it/baobab-kiosk`
- [ ] Set Root Directory to: `client`
- [ ] Framework: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Deploy!

---

**Next Step**: After Vercel deployment, deploy backend to Railway!
