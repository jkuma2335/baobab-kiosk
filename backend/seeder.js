/**
 * SEEDER WARNING:
 * 
 * ⚠️ Running this seeder will:
 * - DELETE ALL existing products from the database
 * - DELETE ALL existing users from the database
 * - Create new sample products
 * - Create a new admin user (admin@northernfoods.com / password: 123456)
 * 
 * Only run this in development or when you want to reset your database!
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Product = require('./models/Product');
const User = require('./models/User');

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB Connected');
    seedProducts();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Sample products data
const products = [
  {
    name: 'Spicy Hausa Koko Paste',
    category: 'Grains',
    price: 25,
    unit: 'Bucket',
    description: 'Authentic spicy Hausa koko paste, perfect for your morning porridge',
    stock: 50,
    featured: true
  },
  {
    name: 'Millet Fula Balls',
    category: 'Dairy/Grains',
    price: 15,
    unit: 'Pack of 5',
    description: 'Traditional millet and dairy balls from the Fula community',
    stock: 100,
    featured: true
  },
  {
    name: 'Zomi Palm Oil',
    category: 'Oils',
    price: 60,
    unit: '1 Liter',
    description: 'Pure, unrefined palm oil for authentic Northern Ghana cooking',
    stock: 20,
    featured: false
  },
  {
    name: 'Dawadawa Condiment',
    category: 'Spices',
    price: 10,
    unit: 'Bag',
    description: 'Traditional fermented locust bean condiment for rich, umami flavor',
    stock: 200,
    featured: true
  },
  {
    name: 'Smoked Guinea Fowl',
    category: 'Meats',
    price: 85,
    unit: 'Whole',
    description: 'Premium smoked guinea fowl, tender and flavorful',
    stock: 15,
    featured: false
  },
  {
    name: 'Tuo Zaafi Flour',
    category: 'Grains',
    price: 30,
    unit: 'Bag',
    description: 'Fine maize flour for making authentic Tuo Zaafi',
    stock: 75,
    featured: false
  },
  {
    name: 'Groundnut Paste',
    category: 'Oils',
    price: 35,
    unit: '500g Jar',
    description: 'Smooth, creamy groundnut paste perfect for soups and stews',
    stock: 60,
    featured: false
  },
  {
    name: 'Dried Okro',
    category: 'Vegetables',
    price: 12,
    unit: 'Bundle',
    description: 'Sun-dried okra for traditional soups and stews',
    stock: 90,
    featured: false
  }
];

// Seed function
const seedProducts = async () => {
  try {
    console.log('⚠️  WARNING: This will reset all products and users!');
    console.log('Starting seed process...\n');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Existing products cleared');

    // Insert new products
    await Product.insertMany(products);
    console.log('Products imported!');

    // Clear existing users and create admin user
    await User.deleteMany({});
    console.log('Existing users cleared');

    // Create admin user
    const hashedPassword = bcrypt.hashSync('123456', 10);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@northernfoods.com',
      password: hashedPassword,
      phone: '0244123456',
      isAdmin: true,
    });
    console.log(`Admin user created: ${adminUser.email}`);

    console.log('Data Imported!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

