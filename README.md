# 🛒 Baobab Kiosk - Online Store

A modern, full-stack e-commerce platform for selling fresh local foods. Built with React, Node.js, Express, and MongoDB.

![Baobab Kiosk](https://img.shields.io/badge/Status-Live-success)
![React](https://img.shields.io/badge/React-19.2-blue)
![Node.js](https://img.shields.io/badge/Node.js-LTS-green)

## ✨ Features

- 🛍️ **Product Management** - Full CRUD operations with multiple images
- 🛒 **Shopping Cart** - Modern cart drawer with quantity management
- 📊 **Admin Dashboard** - Comprehensive analytics and order management
- 💳 **Order Tracking** - Real-time order status updates
- 🎟️ **Promo Codes** - Discount code system
- 📱 **Responsive Design** - Works on all devices
- 🔒 **Secure** - Protected against common web attacks
- 🖼️ **Image Gallery** - Multiple product images with thumbnails
- 📈 **Analytics** - Revenue tracking and sales insights
- 🎨 **Modern UI** - Beautiful, feminine, chic design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/jkuma2335/baobab-kiosk.git
   cd baobab-kiosk
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Set Up Environment Variables**

   Backend (`.env`):
   ```env
   MONGO_URI=mongodb://localhost:27017/baobab-kiosk
   JWT_SECRET=your-secret-key-minimum-32-characters
   PORT=5000
   FRONTEND_URL=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

5. **Run Development Servers**

   Terminal 1 (Backend):
   ```bash
   cd backend
   npm start
   ```

   Terminal 2 (Frontend):
   ```bash
   cd client
   npm run dev
   ```

6. **Visit the App**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 🌐 Deployment

See deployment guides:
- **[DEPLOY_RENDER_QUICK.md](DEPLOY_RENDER_QUICK.md)** - ⭐ Fastest way to deploy backend (5 min)
- **[DEPLOY_ALTERNATIVES.md](DEPLOY_ALTERNATIVES.md)** - All backend hosting options compared
- **[QUICK_DEPLOY.md](QUICK_DEPLOY.md)** - Complete 15-minute deployment guide
- **[STEP_BY_STEP_DEPLOYMENT.md](STEP_BY_STEP_DEPLOYMENT.md)** - Detailed step-by-step guide

### Recommended Hosting

**Frontend:**
- ✅ **Vercel** (Free) - Auto-deploy from GitHub

**Backend:**
- ✅ **Render.com** (⭐ Recommended - Free tier) - Easy setup, no CLI needed
- ✅ **Fly.io** (⭐ Best free tier - No sleep) - Always running, generous free tier
- ⚠️ **Railway** - Limited free tier (may only allow databases)
- 💰 **DigitalOcean** ($5/month) - Most reliable paid option

**Database:**
- ✅ **MongoDB Atlas** (Free M0 cluster)

**Images:**
- ✅ **Cloudinary** (Free tier - 25GB storage)

## 📁 Project Structure

```
baobab-kiosk/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context (Cart)
│   │   └── config/        # Configuration files
│   ├── public/
│   └── package.json
│
├── backend/               # Node.js backend
│   ├── controllers/       # Route controllers
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   └── server.js         # Entry point
│
├── DEPLOYMENT_GUIDE.md   # Detailed deployment guide
├── QUICK_DEPLOY.md       # Quick deployment guide
└── README.md            # This file
```

## 🔒 Security Features

- ✅ SQL/NoSQL Injection Protection
- ✅ XSS Protection
- ✅ CSRF Protection
- ✅ Rate Limiting
- ✅ Secure Headers (Helmet.js)
- ✅ JWT Authentication
- ✅ Password Hashing (bcrypt)
- ✅ Input Validation & Sanitization

See [SECURITY.md](SECURITY.md) for details.

## 🛠️ Tech Stack

### Frontend
- React 19.2
- Vite
- React Router
- Tailwind CSS
- Axios
- React Toastify
- Lucide Icons

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Cloudinary (Image upload)
- Helmet.js (Security)
- Express Rate Limit

## 📝 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id` - Update order

### Analytics
- `GET /api/analytics/advanced` - Advanced analytics (Admin)

See API documentation in backend routes for complete list.

## 👤 Admin Access

Create an admin user:
1. Use the seeder script, OR
2. Manually set `isAdmin: true` in MongoDB

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Icons by Lucide React
- Fonts by Google Fonts
- Images by Cloudinary

## 📧 Support

For support, email: godsonaidoo026@gmail.com

---

**Built with ❤️ by Apex Softwares**
