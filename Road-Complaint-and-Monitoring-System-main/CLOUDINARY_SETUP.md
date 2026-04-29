# Cloudinary Image Storage Setup Guide

## Overview
This guide walks you through setting up Cloudinary for image uploads in the Road Complaint System. Cloudinary handles image storage and delivery, eliminating the need for local file management.

## Step 1: Create a Cloudinary Account

1. Visit [Cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. After signing in, you'll see your dashboard with your **Cloud Name**, **API Key**, and **API Secret**

## Step 2: Configure Backend

### Files Modified:
- `backend/package.json` - Added cloudinary package
- `backend/config/cloudinary.js` - New Cloudinary configuration
- `backend/routes/complaintRoutes.js` - Updated upload endpoint

### Update Environment Variables

Add these to your `.env` file in the backend folder:

```
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**Where to find these values:**
- Login to Cloudinary Dashboard
- Go to Settings → Account
- Copy the values and paste them into your .env file

## Step 3: Install Dependencies

Run this in the backend folder:

```bash
npm install cloudinary
```

## Step 4: How It Works

### Image Upload Flow:

1. **User uploads complaint** with image
2. **Multer captures** the file in memory (not written to disk)
3. **Cloudinary processes** the image and stores it in the cloud
4. **Secure URL returned** and stored in MongoDB
5. **Frontend displays** image using the Cloudinary URL

### Key Changes in complaintRoutes.js:

- **Before**: Images saved locally to `/uploads/` folder
- **After**: Images uploaded to Cloudinary cloud
- **Storage**: Changed from `diskStorage` to `memoryStorage`
- **Database**: Now stores Cloudinary URL instead of filename

## Step 5: Verify Setup

1. Start the backend server:
   ```bash
   cd backend
   npm start
   ```

2. Test image upload:
   - Go to Upload Complaint page
   - Select an image and submit
   - Check if image appears in the complaint detail view
   - Login to Cloudinary → Media Library to verify the image is stored

## Benefits of Cloudinary

✓ **No local storage needed** - Images stored in the cloud
✓ **Automatic optimization** - Images automatically compressed and optimized
✓ **Scalability** - Can handle unlimited images
✓ **CDN delivery** - Images served from nearest server globally
✓ **Additional features** - Resize, crop, and transform images on-the-fly
✓ **Free tier** - 25 GB of storage available

## Troubleshooting

### "Cloudinary credentials not configured"
- Ensure `.env` file has all three Cloudinary variables
- Restart the backend server after updating `.env`

### Image upload fails
- Check browser console for error details
- Verify Cloudinary credentials are correct
- Ensure image file size is under 100MB (Cloudinary free tier limit)

### Images not displaying
- Check that Cloudinary URL is being stored in database
- Verify Cloudinary account is active
- Check browser Network tab for image URL response

## Optional: Cloudinary Dashboard Features

Once images are uploaded, you can:
- **Organize** images by folder
- **Set up transformations** for different image sizes
- **Configure delivery** optimization settings
- **Monitor** storage and bandwidth usage
- **Create derived images** for different use cases

## Next Steps

1. Configure production Cloudinary account for live deployment
2. Set up image transformations (e.g., thumbnails for listings)
3. Monitor storage usage in Cloudinary dashboard
4. Consider image moderation settings for safety

---

For more details, visit [Cloudinary Documentation](https://cloudinary.com/documentation)
