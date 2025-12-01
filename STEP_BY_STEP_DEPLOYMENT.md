# 🚀 Complete Step-by-Step Deployment Guide

This guide will walk you through deploying Baobab Kiosk from start to finish.

---

## 📋 Prerequisites Checklist

Before we start, make sure you have:
- [ ] GitHub account (you have: jkuma2335)
- [ ] Code pushed to GitHub (we'll do this first)
- [ ] All required accounts ready (we'll create them)

---

## STEP 1: Push Code to GitHub (5 minutes)

### 1.1 Open Terminal/PowerShell

Navigate to your project folder:
```powershell
cd "E:\Online store"
```

### 1.2 Initialize Git (if not done)

```powershell
# Check if git is initialized
git status
```

If you get "not a git repository", run:
```powershell
git init
git branch -M main
```

### 1.3 Add Remote Repository

```powershell
git remote add origin https://github.com/jkuma2335/baobab-kiosk.git
```

If you get "remote origin already exists", run this first:
```powershell
git remote remove origin
git remote add origin https://github.com/jkuma2335/baobab-kiosk.git
```

### 1.4 Add and Commit All Files

```powershell
# Add all files
git add .

# Commit
git commit -m "Initial commit: Baobab Kiosk ready for deployment"
```

### 1.5 Push to GitHub

```powershell
git push -u origin main
```

**If you get authentication errors:**
- Install GitHub CLI: https://cli.github.com/
- Run: `gh auth login`
- Then try `git push -u origin main` again

### 1.6 Verify

Visit: https://github.com/jkuma2335/baobab-kiosk
- ✅ You should see all your files

---

## STEP 2: Set Up MongoDB Atlas Database (10 minutes)

### 2.1 Create MongoDB Atlas Account

1. Go to: **https://www.mongodb.com/cloud/atlas/register**
2. Sign up with your email (free account)
3. Verify your email

### 2.2 Create a Free Cluster

1. Once logged in, click **"Build a Database"**
2. Choose **"FREE" (M0)** tier
3. Select Cloud Provider: **AWS**
4. Select Region: Choose closest to you (e.g., **N. Virginia (us-east-1)**)
5. Click **"Create"** (takes 3-5 minutes)

### 2.3 Create Database User

1. On the setup page, you'll see "Create Database User"
2. Choose **"Password"** authentication
3. Enter:
   - Username: `baobabadmin` (or your choice)
   - Password: Generate a strong password (save it!)
4. Click **"Create User"**

### 2.4 Configure Network Access

1. Click **"Add My Current IP Address"** (recommended)
2. OR click **"Allow Access from Anywhere"** for easier setup:
   - IP Address: `0.0.0.0/0`
   - Click **"Add IP Address"**

### 2.5 Get Connection String

1. Click **"Finish and Close"**
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Select Driver: **Node.js**, Version: **5.5 or later**
5. **Copy the connection string** - it looks like:
   ```
   mongodb+srv://baobabadmin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<password>`** with your actual database password
7. **Add database name** at the end:
   ```
   mongodb+srv://baobabadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/baobab-kiosk?retryWrites=true&w=majority
   ```
8. **Save this connection string** - you'll need it for Railway!

---

## STEP 3: Set Up Cloudinary (5 minutes)

### 3.1 Create Cloudinary Account

1. Go to: **https://cloudinary.com/users/register_free**
2. Sign up (free account)
3. Verify your email

### 3.2 Get Credentials

1. Once logged in, you'll see your **Dashboard**
2. Find the **Account Details** section
3. **Copy these three values** (you'll need them for Railway):

   ```
   Cloud Name: your_cloud_name_here
   API Key: 123456789012345
   API Secret: abcdefghijklmnopqrstuvwxyz123456
   ```

4. **Save these** - you'll add them to Railway environment variables

---

## STEP 4: Deploy Backend (15 minutes)

> **⚠️ Railway Limited Access Issue?**  
> If you see "Limited Access" on Railway (can only deploy databases), use an alternative:
> - **Render.com** (Recommended - Free tier available) → See `DEPLOY_ALTERNATIVES.md`
> - **Fly.io** (Best free tier - No sleep) → See `DEPLOY_ALTERNATIVES.md`
> - **DigitalOcean** ($5/month - Most reliable) → See `DEPLOY_ALTERNATIVES.md`

### Option A: Deploy to Railway

#### 4.1 Create Railway Account

1. Go to: **https://railway.app/**
2. Click **"Start a New Project"**
3. Choose **"Login with GitHub"**
4. Authorize Railway to access your GitHub account

### 4.2 Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Find and select: **`jkuma2335/baobab-kiosk`**
4. Railway will start importing

### 4.3 Configure Backend Settings

1. After import, Railway shows your project
2. Click on the **service** that was created
3. Go to **"Settings"** tab
4. Scroll to **"Root Directory"**
5. Click **"Change"** and set to: **`backend`**
6. Scroll to **"Build Command"** - leave default (Railway auto-detects)
7. Scroll to **"Start Command"** - should be: **`node server.js`**

### 4.4 Add Environment Variables

1. Click **"Variables"** tab
2. Click **"New Variable"** button
3. Add each variable one by one:

   **Variable 1:**
   - Name: `MONGO_URI`
   - Value: `mongodb+srv://baobabadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/baobab-kiosk?retryWrites=true&w=majority`
   - (Paste your MongoDB connection string from Step 2)

   **Variable 2:**
   - Name: `JWT_SECRET`
   - Value: Generate one now:
     ```powershell
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```
     - Copy the output and paste as value

   **Variable 3:**
   - Name: `JWT_EXPIRES_IN`
   - Value: `7d`

   **Variable 4:**
   - Name: `NODE_ENV`
   - Value: `production`

   **Variable 5:**
   - Name: `PORT`
   - Value: `5000`

   **Variable 6:**
   - Name: `FRONTEND_URL`
   - Value: `https://baobab-kiosk.vercel.app` (or your Vercel URL - we'll update this after frontend is deployed)
   - ⚠️ For now, use: `http://localhost:5173` (we'll update later)

   **Variable 7:**
   - Name: `CLOUDINARY_CLOUD_NAME`
   - Value: Your Cloudinary Cloud Name from Step 3

   **Variable 8:**
   - Name: `CLOUDINARY_API_KEY`
   - Value: Your Cloudinary API Key from Step 3

   **Variable 9:**
   - Name: `CLOUDINARY_API_SECRET`
   - Value: Your Cloudinary API Secret from Step 3

4. After adding all variables, Railway will **auto-redeploy**

### 4.5 Get Backend URL

1. Go to **"Settings"** tab
2. Scroll to **"Domains"** section
3. Railway automatically creates a domain like:
   ```
   https://baobab-kiosk-backend-production.up.railway.app
   ```
4. **Copy this URL** - you'll need it for Vercel!

### 4.6 Test Backend

1. Open the Railway URL in a new tab
2. You should see:
   ```json
   {"message":"API is running","security":"All security middleware is active"}
   ```
3. Test API: Add `/api/products` to the URL
   - Should see products JSON or empty array

✅ **Backend is now live on Railway!**

---

### Option B: Deploy to Render.com (⭐ Recommended Alternative)

> **See full guide:** `DEPLOY_ALTERNATIVES.md`

**Quick Steps:**
1. Go to: https://render.com → Sign up with GitHub
2. Click "New +" → "Web Service"
3. Connect repo: `jkuma2335/baobab-kiosk`
4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. Add all environment variables (same as Railway above)
6. Click "Create Web Service"
7. Copy the URL (e.g., `https://baobab-kiosk-backend.onrender.com`)

✅ **Backend is now live on Render!**

---

### Option C: Deploy to Fly.io (⭐ Best Free Tier - No Sleep)

> **See full guide:** `DEPLOY_ALTERNATIVES.md`

**Quick Steps:**
1. Install Fly CLI: `powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"`
2. Sign up: `fly auth signup`
3. Deploy: `cd backend` → `fly launch`
4. Set secrets: `fly secrets set MONGO_URI="..."` (for each variable)
5. Deploy: `fly deploy`
6. Get URL: `fly info`

✅ **Backend is now live on Fly.io!**

---

## STEP 5: Deploy Frontend to Vercel (10 minutes)

### 5.1 Create Vercel Account

1. Go to: **https://vercel.com/signup**
2. Click **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub

### 5.2 Import Project

1. Click **"Add New"** → **"Project"**
2. Find and select: **`Godson026/baobab-kiosk`**
3. Click **"Import"**

### 5.3 Configure Project Settings

**⚠️ IMPORTANT CONFIGURATION:**

1. **Project Name**: 
   - If you see "already exists" error, delete old project first or use: `baobab-kiosk-store`

2. **Framework Preset**: 
   - Select **"Vite"** from dropdown
   - (If Vite not shown, select "Other")

3. **Root Directory**: ⚠️ **CRITICAL**
   - Click **"Edit"** button
   - Change from `/` to **`client`**
   - This is ESSENTIAL - tells Vercel to deploy only the frontend

4. **Build and Output Settings**:
   - Build Command: `npm run build` (should auto-fill)
   - Output Directory: `dist` (should auto-fill)
   - Install Command: `npm install` (should auto-fill)

### 5.4 Add Environment Variables

1. Scroll down to **"Environment Variables"** section
2. Click **"Add"**
3. Add this variable:

   **Variable:**
   - Name: `VITE_API_URL`
   - Value: Your Railway backend URL from Step 4.5
     ```
     https://baobab-kiosk-backend-production.up.railway.app
     ```
   - Environments: Check all (Production, Preview, Development)

4. **DO NOT** add backend variables (MONGO_URI, JWT_SECRET, etc.) here!

### 5.5 Update vercel.json (Optional)

Before deploying, update `client/vercel.json`:
1. Open `client/vercel.json` in your editor
2. Replace `YOUR_BACKEND_URL.railway.app` with your actual Railway URL
3. Commit and push:
   ```powershell
   git add client/vercel.json
   git commit -m "Update Vercel config with backend URL"
   git push
   ```

### 5.6 Deploy

1. Click **"Deploy"** button
2. Wait 2-3 minutes for build to complete
3. Vercel will show: **"Congratulations! Your project has been deployed"**

### 5.7 Get Frontend URL

1. After deployment, Vercel shows your live URL:
   ```
   https://baobab-kiosk.vercel.app
   ```
2. **Copy this URL** - you'll need it for backend CORS!

### 5.8 Test Frontend

1. Visit your Vercel URL
2. ✅ You should see your Baobab Kiosk homepage
3. ⚠️ API calls might fail initially (CORS issue - we'll fix next)

---

## STEP 6: Connect Frontend and Backend (5 minutes)

### 6.1 Update Backend CORS (Railway)

1. Go back to **Railway Dashboard**
2. Open your backend service
3. Go to **"Variables"** tab
4. Find **`FRONTEND_URL`** variable
5. Click **"Edit"** (pencil icon)
6. Change value to your **Vercel URL**:
   ```
   https://baobab-kiosk.vercel.app
   ```
   (Use your actual Vercel URL)
7. Railway will auto-redeploy

### 6.2 Verify Connection

1. Wait 1-2 minutes for Railway redeploy
2. Visit your Vercel frontend URL
3. Try browsing products - should work now! ✅
4. Try adding to cart - should work! ✅

---

## STEP 7: Create Admin User (5 minutes)

### 7.1 Create User via MongoDB Atlas

1. Go to **MongoDB Atlas Dashboard**
2. Click **"Browse Collections"**
3. Click **"Add My Own Data"**
4. Database Name: `baobab-kiosk`
5. Collection Name: `users`
6. Click **"Create"**

### 7.2 Insert Admin User

1. Click **"Insert Document"**
2. Paste this (replace password hash with your own):

   ```json
   {
     "name": "Admin",
     "email": "admin@baobabkiosk.com",
     "password": "$2a$10$YOUR_BCTYPT_HASH_HERE",
     "phone": "+233123456789",
     "isAdmin": true,
     "createdAt": "2025-01-01T00:00:00.000Z",
     "updatedAt": "2025-01-01T00:00:00.000Z"
   }
   ```

3. **Generate password hash first:**
   - In your backend folder, create a quick script or use online bcrypt generator
   - Or use Node.js:
     ```javascript
     const bcrypt = require('bcryptjs');
     const hash = bcrypt.hashSync('your-admin-password', 10);
     console.log(hash);
     ```
4. Replace the password hash in the document
5. Click **"Insert"**

### 7.3 Login as Admin

1. Go to your Vercel frontend URL
2. Click **"Login"**
3. Use:
   - Email: `admin@baobabkiosk.com`
   - Password: Your admin password
4. ✅ You should be logged in and see the admin dashboard!

---

## STEP 8: Final Testing (5 minutes)

### Test Checklist:

- [ ] **Homepage loads** - ✅
- [ ] **Products display** - ✅
- [ ] **Product details page works** - ✅
- [ ] **Add to cart works** - ✅
- [ ] **Cart drawer opens** - ✅
- [ ] **Checkout page loads** - ✅
- [ ] **Admin login works** - ✅
- [ ] **Admin dashboard loads** - ✅
- [ ] **Can create product** - ✅
- [ ] **Can upload images** - ✅

---

## 🎉 Success! Your Site is Live!

### Your Live URLs:

- **Frontend**: `https://baobab-kiosk.vercel.app`
- **Backend API**: `https://baobab-kiosk-backend-production.up.railway.app`

### Admin Access:
- **Login URL**: `https://baobab-kiosk.vercel.app/login`
- **Email**: Your admin email
- **Password**: Your admin password

---

## 🔄 Making Changes (Future Updates)

### To Update Your Site:

1. Make changes locally
2. Commit:
   ```powershell
   git add .
   git commit -m "Your update message"
   git push origin main
   ```
3. **Vercel** and **Railway** will **auto-deploy** automatically! 🚀

---

## 🆘 Troubleshooting

### Backend won't start:
- Check Railway logs (Dashboard → Service → Deployments → View Logs)
- Verify all environment variables are set correctly
- Check MongoDB connection string

### Frontend can't connect to backend:
- Verify `VITE_API_URL` is set in Vercel
- Verify `FRONTEND_URL` in Railway matches Vercel URL exactly
- Check CORS settings in backend

### Images not uploading:
- Verify Cloudinary credentials in Railway
- Check file size limits
- Check Railway logs for errors

### Admin can't login:
- Verify user exists in MongoDB Atlas
- Check password hash is correct
- Check JWT_SECRET is set

---

## 📊 Monitoring

- **Vercel Dashboard**: https://vercel.com/dashboard
  - View deployments, analytics, logs

- **Railway Dashboard**: https://railway.app/dashboard
  - View deployments, logs, metrics

- **MongoDB Atlas**: https://cloud.mongodb.com
  - View database, collections, metrics

---

**Need help?** Check the deployment logs in Vercel/Railway dashboards!

**Congratulations! 🎉 Your Baobab Kiosk is now live on the internet!**
