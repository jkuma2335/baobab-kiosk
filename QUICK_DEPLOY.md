# 🚀 Quick Deployment Guide

## Fast Track: Deploy in 15 Minutes

### 1. Prepare Your Code (2 min)

```bash
# Make sure you're in the project root
cd "E:\Online store"

# Initialize git if not already done
git init
git add .
git commit -m "Prepare for deployment"
```

### 2. Push to GitHub (3 min)

1. Go to [GitHub](https://github.com/new)
2. Create a new repository: `baobab-kiosk`
3. Copy the commands GitHub shows you
4. Run in your terminal:

```bash
git remote add origin https://github.com/YOUR_USERNAME/baobab-kiosk.git
git branch -M main
git push -u origin main
```

### 3. Deploy Frontend - Vercel (3 min)

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up" → Use GitHub
3. Click "Add New" → "Project"
4. Import your repository
5. **Configure:**
   - Framework: Vite
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Click "Deploy"
7. **Save the URL** (e.g., `https://baobab-kiosk.vercel.app`)

### 4. Set Up MongoDB Atlas (3 min)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up (free)
3. Create a cluster (free M0)
4. Create database user (save username/password)
5. Network Access → Add IP: `0.0.0.0/0`
6. Database → Connect → Copy connection string
   - Replace `<password>` with your password

### 5. Set Up Cloudinary (2 min)

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up (free)
3. Dashboard → Copy:
   - Cloud Name
   - API Key
   - API Secret

### 6. Deploy Backend - Render.com (⭐ Recommended) or Railway (4 min)

> **⚠️ Railway has "Limited Access"?** Use Render.com instead (see `DEPLOY_RENDER_QUICK.md`)

#### Option A: Render.com (⭐ Recommended - Free tier)

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect repository: `jkuma2335/baobab-kiosk`
5. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
6. **Add Environment Variables:**

```
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/baobab-kiosk?retryWrites=true&w=majority
JWT_SECRET=paste-your-generated-secret-here
JWT_EXPIRES_IN=7d
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-vercel-url.vercel.app
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

7. **Generate JWT Secret:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

8. Render will auto-deploy. **Copy the public URL** (e.g., `https://baobab-kiosk-backend.onrender.com`)

#### Option B: Railway (If you have access)

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. New Project → Deploy from GitHub
4. Select your repository
5. Set root directory to: `backend`
6. **Add Environment Variables:** (same as above)
7. Railway will auto-deploy. **Copy the public URL**

### 7. Update Frontend Config (1 min)

1. Go back to Vercel dashboard
2. Your project → Settings → Environment Variables
3. Add:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
   (or `.railway.app` if using Railway)
4. Redeploy (Vercel will auto-redeploy)

### 8. Update Backend CORS (1 min)

1. Go to Render/Railway dashboard
2. Your service → Environment Variables
3. Update `FRONTEND_URL` to your Vercel URL
4. Service will auto-redeploy

---

## ✅ Verify Deployment

1. **Frontend:** Visit your Vercel URL
2. **Backend:** Visit your backend URL (e.g., `https://your-backend-url.onrender.com`)
   - Should see: `{"message":"API is running"}`
3. **API Test:** Visit `https://your-backend-url.onrender.com/api/products`
   - Should see products JSON

---

## 🎯 Your Live URLs

- **Frontend:** `https://your-app.vercel.app`
- **Backend:** `https://your-backend.onrender.com` (or `.railway.app` if using Railway)

---

## 📝 Next Steps

1. Test your site thoroughly
2. Add your first admin user (via seeder or API)
3. Configure custom domain (optional)
4. Set up monitoring

**Need help?** Check `DEPLOYMENT_GUIDE.md` for detailed instructions.
