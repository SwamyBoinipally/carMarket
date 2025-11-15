import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google Provider to always show account selection
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Admin email list - Add admin emails here
export const ADMIN_EMAILS = [
  'brandium.digital@gmail.com',
  //'Koppulachandramouli@gmail.com',
  'swamy.boinipally@gmail.com'
  
];

// Toggle upload restriction: when true, only emails in ADMIN_EMAILS can create/update car listings.
// Set to false to allow any authenticated user to add vehicles.
export const ADMIN_ONLY_UPLOADS = false;

// Cloudinary Configuration
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
  uploadUrl: import.meta.env.VITE_CLOUDINARY_UPLOAD_URL,
};

// Image Upload Configuration
// Controls whether Firebase Storage is used as primary upload option
// When true: Try Firebase first, fallback to Cloudinary on errors
// When false: Use Cloudinary directly as primary storage
export const UPLOAD_CONFIG = {
  enableFirebaseStorage: import.meta.env.VITE_ENABLE_FIREBASE_STORAGE === 'true',
  cloudinaryAsPrimary: import.meta.env.VITE_ENABLE_FIREBASE_STORAGE !== 'true',
};

// Image Compression Configuration
// Defines compression parameters for images before upload
export const COMPRESSION_CONFIG = {
  maxWidth: parseInt(import.meta.env.VITE_IMAGE_MAX_WIDTH || '2160', 10),
  maxHeight: parseInt(import.meta.env.VITE_IMAGE_MAX_HEIGHT || '2160', 10),
  quality: parseFloat(import.meta.env.VITE_IMAGE_QUALITY || '1.0'),
  maxFileSize: parseInt(import.meta.env.VITE_IMAGE_MAX_SIZE || String(2 * 1024 * 1024), 10),
};
