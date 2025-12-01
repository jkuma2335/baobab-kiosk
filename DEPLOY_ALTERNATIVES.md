# 🚀 Alternative Backend Deployment Options

Since Railway has "Limited Access" (can only deploy databases), here are **better alternatives** for deploying your backend:

---

## 🎯 **Recommended Options (Free Tier Available)**

### ✅ **Option 1: Render.com** (⭐ **BEST FREE OPTION**)

**Why Render?**
- ✅ **Free tier** available (with some limitations)
- ✅ Auto-deploy from GitHub
- ✅ SSL certificates included
- ✅ Easy environment variable management
- ✅ Better free tier than Railway

**Setup Steps:**

1. **Sign Up**
   - Go to: https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `jkuma2335/baobab-kiosk`

3. **Configure Service**
   ```
   Name: baobab-kiosk-backend
   Region: Choose closest to you
   Branch: main
   Root Directory: backend
   Environment: Node
   Build Command: npm install
   Start Command: node server.js
   Plan: Free (or Starter for $7/month)
   ```

4. **Add Environment Variables**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/baobab-kiosk?retryWrites=true&w=majority
   JWT_SECRET=your-jwt-secret-here
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   PORT=5000
   FRONTEND_URL=https://your-vercel-url.vercel.app
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

5. **Generate JWT Secret** (if needed)
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

6. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy automatically
   - **Copy the URL** (e.g., `https://baobab-kiosk-backend.onrender.com`)

7. **Update Frontend**
   - Go to Vercel → Settings → Environment Variables
   - Add/Update: `VITE_API_URL=https://baobab-kiosk-backend.onrender.com`
   - Redeploy frontend

**⚠️ Free Tier Limitations:**
- Service sleeps after 15 minutes of inactivity (wakes up on first request)
- Slower cold starts (~30 seconds)
- 750 hours/month limit

**💡 Tip:** Use a cron job service (like cron-job.org) to ping your backend every 14 minutes to keep it awake.

---

### ✅ **Option 2: Fly.io** (⭐ **EXCELLENT FREE TIER**)

**Why Fly.io?**
- ✅ **Generous free tier** (3 shared-cpu VMs, 3GB persistent storage)
- ✅ No sleep on free tier (always running)
- ✅ Global edge network
- ✅ Fast deployments

**Setup Steps:**

1. **Install Fly CLI**
   ```powershell
   # Windows (PowerShell)
   powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
   ```

2. **Sign Up**
   ```bash
   fly auth signup
   ```

3. **Create App**
   ```bash
   cd backend
   fly launch
   ```
   - Follow prompts:
     - App name: `baobab-kiosk-backend` (or your choice)
     - Region: Choose closest
     - PostgreSQL? **No** (we use MongoDB Atlas)
     - Redis? **No**

4. **Configure Environment Variables**
   ```bash
   fly secrets set MONGO_URI="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/baobab-kiosk?retryWrites=true&w=majority"
   fly secrets set JWT_SECRET="your-jwt-secret-here"
   fly secrets set JWT_EXPIRES_IN="7d"
   fly secrets set NODE_ENV="production"
   fly secrets set PORT="5000"
   fly secrets set FRONTEND_URL="https://your-vercel-url.vercel.app"
   fly secrets set CLOUDINARY_CLOUD_NAME="your_cloud_name"
   fly secrets set CLOUDINARY_API_KEY="your_api_key"
   fly secrets set CLOUDINARY_API_SECRET="your_api_secret"
   ```

5. **Deploy**
   ```bash
   fly deploy
   ```

6. **Get URL**
   ```bash
   fly info
   ```
   - Your app will be at: `https://baobab-kiosk-backend.fly.dev`

---

### ✅ **Option 3: DigitalOcean App Platform** (⭐ **RELIABLE, $5/MONTH**)

**Why DigitalOcean?**
- ✅ Very reliable ($5/month)
- ✅ No sleep time
- ✅ Auto-deploy from GitHub
- ✅ Great documentation

**Setup Steps:**

1. **Sign Up**
   - Go to: https://cloud.digitalocean.com
   - Sign up (get $200 credit for 60 days)

2. **Create App**
   - Click "Create" → "Apps"
   - Connect GitHub repository: `jkuma2335/baobab-kiosk`

3. **Configure**
   ```
   Source: backend folder
   Type: Web Service
   Build Command: npm install
   Run Command: node server.js
   HTTP Port: 5000
   ```

4. **Add Environment Variables**
   - Same as Render.com above

5. **Choose Plan**
   - **Basic Plan:** $5/month (recommended)
   - Or **Professional Plan:** $12/month

6. **Deploy**
   - Click "Create Resources"
   - Your app will be at: `https://baobab-kiosk-backend-xxxxx.ondigitalocean.app`

---

### ✅ **Option 4: Cyclic.sh** (⭐ **SERVERLESS, FREE**)

**Why Cyclic?**
- ✅ **Free tier** (perfect for small apps)
- ✅ Serverless (pay per request)
- ✅ Auto-deploy from GitHub
- ✅ Easy setup

**Setup Steps:**

1. **Sign Up**
   - Go to: https://cyclic.sh
   - Sign up with GitHub

2. **Deploy App**
   - Click "Deploy Now"
   - Select repository: `jkuma2335/baobab-kiosk`
   - Root Directory: `backend`

3. **Add Environment Variables**
   - Dashboard → Environment Variables
   - Add all variables (same as Render)

4. **Deploy**
   - Cyclic auto-deploys
   - Your app will be at: `https://baobab-kiosk-backend.cyclic.app`

---

### ✅ **Option 5: Heroku** (⭐ **POPULAR, PAID**)

**Why Heroku?**
- ⚠️ No longer has free tier (now $5-7/month)
- ✅ Very reliable
- ✅ Great tooling
- ✅ Easy PostgreSQL/MongoDB add-ons

**Setup Steps:**

1. **Sign Up**
   - Go to: https://heroku.com
   - Sign up

2. **Install Heroku CLI**
   ```powershell
   # Download from: https://devcenter.heroku.com/articles/heroku-cli
   ```

3. **Login**
   ```bash
   heroku login
   ```

4. **Create App**
   ```bash
   cd backend
   heroku create baobab-kiosk-backend
   ```

5. **Configure**
   ```bash
   heroku config:set MONGO_URI="mongodb+srv://..."
   heroku config:set JWT_SECRET="..."
   # ... (all other env vars)
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

---

## 📊 **Comparison Table**

| Service | Free Tier | Sleep Time | Best For |
|---------|-----------|------------|----------|
| **Render.com** | ✅ Yes | 15 min | Small projects, testing |
| **Fly.io** | ✅ Yes | ❌ No | Production-ready free tier |
| **Cyclic.sh** | ✅ Yes | ❌ No | Serverless apps |
| **DigitalOcean** | ❌ No ($5/mo) | ❌ No | Professional projects |
| **Heroku** | ❌ No ($7/mo) | ❌ No | Enterprise apps |

---

## 🎯 **My Recommendation**

For your Baobab Kiosk project:

1. **Best Free Option:** **Render.com** or **Fly.io**
   - Render is easier to set up (web dashboard)
   - Fly.io has better free tier (no sleep)

2. **Best Paid Option:** **DigitalOcean App Platform** ($5/month)
   - Most reliable
   - Great performance

---

## 🚀 **Quick Start: Deploy to Render.com (Recommended)**

1. Go to: https://render.com → Sign up with GitHub

2. Click "New +" → "Web Service"

3. Connect repo: `jkuma2335/baobab-kiosk`

4. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`

5. Add all environment variables

6. Click "Create Web Service"

7. **Done!** Copy the URL and update your Vercel frontend.

---

## 📝 **Next Steps After Deploying Backend**

1. ✅ Test backend URL: `https://your-backend-url/` (should see API message)
2. ✅ Update Vercel environment variable: `VITE_API_URL`
3. ✅ Redeploy frontend
4. ✅ Test full application

---

**Need help?** Each service has excellent documentation. Just search "how to deploy Node.js to [service name]".

