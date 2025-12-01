# 🚀 Deployment Guide - Baobab Kiosk

This guide will help you deploy your Baobab Kiosk online store to production.

## 📋 Prerequisites

1. **GitHub Account** - For version control and deployment
2. **Vercel Account** - For frontend hosting (free tier available)
3. **Railway Account** - For backend hosting (free tier available, or use Render)
4. **MongoDB Atlas Account** - For database (free tier available)
5. **Cloudinary Account** - For image hosting (free tier available)

---

## 🗄️ Step 1: Set Up MongoDB Atlas (Database)

1. **Create Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create Cluster**
   - Create a free M0 cluster
   - Choose a cloud provider and region closest to you

3. **Create Database User**
   - Go to "Database Access"
   - Create a new user with username/password
   - Save the credentials securely

4. **Whitelist IP Addresses**
   - Go to "Network Access"
   - Add IP: `0.0.0.0/0` (allows from anywhere - for production)
   - Or add specific IPs for better security

5. **Get Connection String**
   - Go to "Database" → "Connect"
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/baobab-kiosk?retryWrites=true&w=majority`

---

## ☁️ Step 2: Set Up Cloudinary (Image Storage)

1. **Create Account**
   - Go to [Cloudinary](https://cloudinary.com)
   - Sign up for a free account

2. **Get Credentials**
   - Go to Dashboard
   - Copy these values:
     - Cloud Name
     - API Key
     - API Secret

---

## 🎨 Step 3: Deploy Frontend to Vercel

### Option A: Deploy via Vercel Dashboard

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/baobab-kiosk.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Sign up/Login with GitHub
   - Click "New Project"
   - Import your GitHub repository

3. **Configure Project**
   - **Root Directory**: Set to `client`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Environment Variables** (Add in Vercel Dashboard)
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - You'll get a URL like: `https://baobab-kiosk.vercel.app`

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to client folder
cd client

# Deploy
vercel

# Follow the prompts
# Production? Yes
# Set environment variables when prompted
```

---

## ⚙️ Step 4: Deploy Backend to Railway

1. **Push Backend to GitHub**
   - Ensure your backend code is in a separate folder or repository

2. **Create Railway Account**
   - Go to [Railway](https://railway.app)
   - Sign up with GitHub

3. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository
   - Select the `backend` folder

4. **Set Environment Variables**
   Click on your project → Variables → Add these:

   ```
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/baobab-kiosk?retryWrites=true&w=majority
   JWT_SECRET=your-very-strong-secret-key-minimum-32-characters-long
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-frontend-url.vercel.app
   
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

5. **Generate Strong JWT Secret**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

6. **Deploy**
   - Railway will auto-detect Node.js and deploy
   - Wait for deployment (2-5 minutes)
   - Railway will provide a URL like: `https://baobab-kiosk-backend.railway.app`

7. **Get Backend URL**
   - Go to your Railway project
   - Click on the service
   - Copy the public URL
   - Update `vercel.json` with this URL

---

## 🔄 Step 5: Update Configuration Files

### Update `client/vercel.json`

Replace `your-backend-url.railway.app` with your actual Railway backend URL:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://YOUR_RAILWAY_URL.railway.app/api/:path*"
    }
  ]
}
```

### Update Railway Environment Variables

Add the frontend URL:

```
FRONTEND_URL=https://your-frontend-url.vercel.app
```

---

## 🧪 Step 6: Test Deployment

1. **Test Frontend**
   - Visit your Vercel URL
   - Check if the site loads

2. **Test Backend**
   - Visit `https://your-backend-url.railway.app`
   - Should see: `{"message":"API is running","security":"All security middleware is active"}`

3. **Test API Connection**
   - Visit `https://your-backend-url.railway.app/api/products`
   - Should see products JSON

---

## 🔒 Step 7: Security Checklist

- [ ] Set strong JWT_SECRET (32+ characters)
- [ ] MongoDB password is strong
- [ ] MongoDB network access is configured
- [ ] CORS is set to your frontend URL only
- [ ] Environment variables are set in both platforms
- [ ] HTTPS is enabled (automatic on Vercel/Railway)

---

## 🐛 Troubleshooting

### Frontend can't connect to backend

1. Check CORS settings in `backend/server.js`
2. Verify `FRONTEND_URL` in Railway matches your Vercel URL exactly
3. Check `vercel.json` rewrite rules

### Backend deployment fails

1. Check Railway logs for errors
2. Verify all environment variables are set
3. Check MongoDB connection string
4. Ensure PORT is set to 5000 or use Railway's PORT

### Images not uploading

1. Verify Cloudinary credentials in Railway
2. Check file size limits
3. Check Railway logs for upload errors

---

## 📝 Alternative Hosting Options

### Backend Alternatives:

**Render.com** (Similar to Railway):
1. Go to [Render](https://render.com)
2. Create new "Web Service"
3. Connect GitHub repo
4. Set build command: `npm install`
5. Set start command: `node server.js`
6. Add environment variables

**Heroku**:
1. Create Heroku app
2. Use Heroku CLI to deploy
3. Add MongoDB Atlas addon
4. Set environment variables

### Frontend Alternatives:

**Netlify**:
- Similar to Vercel
- Connect GitHub repo
- Set build settings
- Add environment variables

**GitHub Pages**:
- Good for static sites
- Requires additional setup for API calls

---

## 🔄 Continuous Deployment

Both Vercel and Railway automatically deploy when you push to GitHub:

1. Make changes locally
2. Commit: `git commit -m "Your changes"`
3. Push: `git push origin main`
4. Both platforms will auto-deploy

---

## 📊 Monitoring

### Vercel Analytics
- Enable in Vercel dashboard
- View page views, performance, etc.

### Railway Metrics
- View in Railway dashboard
- Monitor CPU, memory, requests

---

## 💰 Cost Estimate

**Free Tier:**
- Vercel: Free (hobby plan)
- Railway: $5 free credit/month (usually enough for small apps)
- MongoDB Atlas: Free (512MB)
- Cloudinary: Free (25GB storage, 25GB bandwidth/month)

**Total: ~$0-5/month** for small to medium traffic

---

## 📞 Support

If you encounter issues:
1. Check platform logs (Vercel/Railway dashboards)
2. Review error messages carefully
3. Verify all environment variables
4. Test API endpoints directly

---

**🎉 Congratulations! Your Baobab Kiosk is now live!**

Your site URLs:
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-backend.railway.app`
