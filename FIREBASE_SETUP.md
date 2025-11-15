# Firebase Setup Instructions

This application requires Firebase configuration to work properly. Follow these steps to set up Firebase:

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Once created, click on the web icon (</>) to add a web app
4. Register your app and copy the Firebase configuration object

## 2. Configure Firebase in the Application

Open `src/lib/firebase.ts` and replace the placeholder values with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## 3. Enable Google Authentication

1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Google** provider
3. Enable it and add your support email
4. Save the changes

## 4. Set Up Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (for development) or **production mode** (for production)
4. Select a location for your database
5. Click **Enable**

### Firestore Security Rules (Production)

For production, update your Firestore rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cars/{carId} {
      // Anyone can read cars
      allow read: if true;
      
      // Only authenticated users can create/update/delete
      allow create, update, delete: if request.auth != null;
    }
  }
}
```

## 5. Set Up Firebase Storage

1. In Firebase Console, go to **Storage**
2. Click **Get started**
3. Choose security rules (start in test mode for development)
4. Click **Done**

### Storage Security Rules (Production)

For production, update your Storage rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /cars/{allPaths=**} {
      // Anyone can read
      allow read: if true;
      
      // Only authenticated users can write
      allow write: if request.auth != null;
    }
  }
}
```

## 6. Image Upload and Fallback System

The application implements an intelligent image upload system that supports both Firebase Storage and Cloudinary as storage providers.

### Configuration (via .env)

```
# Enable Firebase Storage as primary upload option
VITE_ENABLE_FIREBASE_STORAGE=true|false

# Cloudinary settings
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
VITE_CLOUDINARY_UPLOAD_URL=https://api.cloudinary.com/v1_1/{cloud_name}/image/upload
```

### How It Works

**When Firebase Storage is Enabled (Primary):**
1. Images are uploaded to Firebase Storage first
2. If Firebase quota is exceeded, the system automatically falls back to Cloudinary
3. User sees a warning toast notification about the fallback
4. Application continues seamlessly without user intervention

**When Firebase Storage is Disabled:**
1. All images are uploaded directly to Cloudinary
2. No fallback mechanism is triggered

### Image Processing Pipeline

Before upload to any storage provider:
1. **Compression**: Images are automatically compressed to reduce file size
   - Max dimensions: 2160px (configurable via `VITE_IMAGE_MAX_WIDTH` and `VITE_IMAGE_MAX_HEIGHT`)
   - Quality: Preserves quality while optimizing file size (configurable via `VITE_IMAGE_QUALITY`)
   - Max file size: ~2MB after compression (configurable via `VITE_IMAGE_MAX_SIZE`)

2. **Upload**: Compressed images are sent to the configured storage provider
3. **Storage**: Images are stored in `cars/{timestamp}_{filename}` path (Firebase) or using Cloudinary's default path

### Image Deletion

When a listing is deleted:
1. **Firebase Images**: Deleted from Firebase Storage using the stored path reference
2. **Cloudinary Images**: Deleted using the Cloudinary API with public_id extraction from the URL
3. **Database**: Car document removed from Firestore after image cleanup
4. **Status**: User receives confirmation when deletion is complete

## 7. Configure Admin Access

In `src/lib/firebase.ts`, add admin email addresses to the `ADMIN_EMAILS` array:

```typescript
export const ADMIN_EMAILS = [
  'your-admin-email@example.com',
  'another-admin@example.com',
];
```

Only users with these email addresses will have access to upload, edit, and delete car listings.

## 9. Test the Application

1. Run `pnpm install` to install dependencies
2. Run `pnpm run dev` to start the development server
3. Sign in with Google
4. If your email is in the admin list, you'll see the upload form in the dashboard
5. If not, you'll see "View Only Mode"

## 10. Troubleshooting

For proper image deletion from Cloudinary when listings are removed, you may need a backend service. See your backend configuration for:
- Setting up Cloudinary Admin API with API key and API secret
- Exposing a secure endpoint to delete resources by public_id

Alternatively, you can configure unsigned operations if your Cloudinary account supports resource deletion via API.

## 9. Test the Application

1. Run `pnpm install` to install dependencies
2. Run `pnpm run dev` to start the development server
3. Sign in with Google
4. If your email is in the admin list, you'll see the upload form in the dashboard
5. If not, you'll see "View Only Mode"

## Troubleshooting

### Authentication Issues
- Make sure Google Sign-in is enabled in Firebase Console
- Check that your Firebase configuration is correct
- Verify that the authorized domains include your deployment domain

### Firestore Issues
- Ensure Firestore is enabled in your Firebase project
- Check security rules allow the operations you're trying to perform
- Verify the collection name is "cars"

### Storage Issues
- Make sure Firebase Storage is enabled
- Check storage security rules
- Verify you have sufficient storage quota

## Production Deployment

Before deploying to production:

1. Update Firestore security rules to restrict write access
2. Update Storage security rules to restrict write access
3. Add your production domain to Firebase authorized domains
4. Consider implementing rate limiting and additional security measures
5. Review and update admin email list