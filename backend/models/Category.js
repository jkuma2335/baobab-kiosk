const mongoose = require('mongoose');

// Helper function to generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
};

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Generate slug before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = generateSlug(this.name);
  }
  next();
});

// Generate slug before updating
categorySchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update && update.name) {
    // Handle both $set and direct update
    if (update.$set) {
      update.$set.slug = generateSlug(update.$set.name || update.name);
    } else {
      update.slug = generateSlug(update.name);
    }
  }
  next();
});

module.exports = mongoose.model('Category', categorySchema);

