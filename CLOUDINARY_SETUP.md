# Cloudinary Setup Guide

## Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com](https://cloudinary.com)
2. Sign up for a free account (or log in if you already have one)
3. Once logged in, you'll be taken to your Dashboard

## Step 2: Get Your Cloudinary Credentials

1. In your Cloudinary Dashboard, you'll see your **Account Details**
2. You need to copy these three values:
   - **Cloud Name** (e.g., `dxyz123abc`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

## Step 3: Add Credentials to Your Backend .env File

1. Open your `backend/.env` file
2. Add the following three lines with your actual Cloudinary credentials:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Example:**
```env
CLOUDINARY_CLOUD_NAME=dxyz123abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

## Step 4: Restart Your Backend Server

After adding the credentials, restart your backend server:

```bash
cd backend
npm start
```

## How It Works

- **Image Upload Endpoint**: `POST /api/upload`
  - Accepts a single image file (max 5MB)
  - Uploads to Cloudinary in the `baobab-kiosk` folder
  - Returns the secure URL of the uploaded image

- **Image Delete Endpoint**: `DELETE /api/upload/:publicId`
  - Deletes an image from Cloudinary using its public ID

## Using Image Upload in Forms

### Product Form
1. Click "Add New Product" or "Edit Product"
2. In the "Product Image" section:
   - **Option 1**: Click "Choose File" to select an image from your computer, then click "Upload Image"
   - **Option 2**: Enter an image URL directly in the URL field

### Category Form
1. Click "Add New Category" or "Edit Category"
2. In the "Category Image" section:
   - **Option 1**: Click "Choose File" to select an image from your computer, then click "Upload Image"
   - **Option 2**: Enter an image URL directly in the URL field

## Supported Image Formats

- JPEG/JPG
- PNG
- GIF
- WebP

## Image Optimization

All uploaded images are automatically:
- Optimized for web delivery
- Resized to a maximum of 1000x1000 pixels
- Converted to the best format for the browser
- Stored securely on Cloudinary's CDN

## Troubleshooting

### "Error uploading image to Cloudinary"
- Check that your `.env` file has the correct credentials
- Make sure you've restarted the backend server after adding credentials
- Verify your Cloudinary account is active

### "Only image files are allowed!"
- Make sure you're selecting an image file (JPEG, PNG, GIF, or WebP)
- Check that the file size is under 5MB

### "No file uploaded"
- Make sure you've selected a file before clicking "Upload Image"

## Security Note

The upload endpoints are currently public. For production, you should:
1. Add authentication middleware to protect the upload routes
2. Uncomment the `protect` and `admin` middleware in `backend/routes/uploadRoutes.js`

