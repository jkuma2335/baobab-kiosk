# ✅ Deployment Checklist

Print this or keep it open while deploying. Check off each item as you complete it.

## 📦 Preparation

- [ ] Code is ready and working locally
- [ ] All features tested locally
- [ ] Git repository initialized
- [ ] Code pushed to GitHub: https://github.com/cursorai053-ship-it/baobab-kiosk

## 🗄️ MongoDB Atlas Setup

- [ ] Account created at mongodb.com/cloud/atlas
- [ ] Free M0 cluster created
- [ ] Database user created (username & password saved)
- [ ] Network access configured (0.0.0.0/0 or specific IPs)
- [ ] Connection string obtained and saved
- [ ] Connection string has password replaced and database name added

## ☁️ Cloudinary Setup

- [ ] Account created at cloudinary.com
- [ ] Cloud Name copied and saved
- [ ] API Key copied and saved
- [ ] API Secret copied and saved

## ⚙️ Backend Deployment (Railway)

- [ ] Railway account created (railway.app)
- [ ] GitHub repository connected
- [ ] New project created
- [ ] Root directory set to: `backend`
- [ ] Environment variables added:
  - [ ] MONGO_URI
  - [ ] JWT_SECRET (32+ characters)
  - [ ] JWT_EXPIRES_IN
  - [ ] NODE_ENV=production
  - [ ] PORT=5000
  - [ ] FRONTEND_URL (initial: localhost)
  - [ ] CLOUDINARY_CLOUD_NAME
  - [ ] CLOUDINARY_API_KEY
  - [ ] CLOUDINARY_API_SECRET
- [ ] Backend deployed successfully
- [ ] Backend URL obtained and saved
- [ ] Backend tested: https://your-backend.railway.app shows API message
- [ ] API endpoint tested: /api/products works

## 🎨 Frontend Deployment (Vercel)

- [ ] Vercel account created (vercel.com)
- [ ] GitHub repository connected
- [ ] Project imported
- [ ] Root directory set to: `client` ⚠️ CRITICAL
- [ ] Framework preset: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Environment variable added:
  - [ ] VITE_API_URL (Railway backend URL)
- [ ] Frontend deployed successfully
- [ ] Frontend URL obtained and saved
- [ ] Frontend tested: Homepage loads

## 🔗 Connect Frontend & Backend

- [ ] Backend FRONTEND_URL updated to Vercel URL
- [ ] Backend redeployed
- [ ] Frontend can load products ✅
- [ ] Frontend can add to cart ✅
- [ ] API calls working ✅

## 👤 Admin Setup

- [ ] MongoDB Atlas database created: `baobab-kiosk`
- [ ] Users collection created
- [ ] Admin user inserted with:
  - [ ] Email
  - [ ] Password (bcrypt hashed)
  - [ ] isAdmin: true
- [ ] Admin can login ✅
- [ ] Admin dashboard accessible ✅

## 🧪 Final Testing

- [ ] Homepage displays correctly
- [ ] Products page loads and shows products
- [ ] Product detail page works
- [ ] Add to cart functionality works
- [ ] Cart drawer opens and shows items
- [ ] Checkout page loads
- [ ] Order creation works
- [ ] Admin login works
- [ ] Admin dashboard loads
- [ ] Can create product in admin
- [ ] Can upload product images
- [ ] Can view orders in admin
- [ ] Analytics page loads

## 📝 URLs Saved

- [ ] Frontend URL: _________________________
- [ ] Backend URL: _________________________
- [ ] Admin Email: _________________________
- [ ] Admin Password: _________________________

## 🔄 Future Updates

- [ ] Understand that pushing to GitHub auto-deploys
- [ ] Know where to find deployment logs
- [ ] Know how to update environment variables

---

**✅ All checked? Your site is live and ready! 🎉**
