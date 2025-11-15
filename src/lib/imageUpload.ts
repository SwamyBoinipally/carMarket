import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, CLOUDINARY_CONFIG, UPLOAD_CONFIG } from './firebase';
import { compressImage } from './imageCompress';
import { toast } from 'sonner';

// Firebase Storage error codes that indicate quota/limit issues
const QUOTA_ERROR_CODES = [
  'storage/quota-exceeded',
  'storage/retry-limit-exceeded',
  'storage/unknown',
];

// Check if a Firebase error is a quota/limit error
function isQuotaError(error: unknown): boolean {
  const errorCode = (error as { code?: string })?.code;
  return QUOTA_ERROR_CODES.includes(errorCode);
}

// Upload image to Cloudinary
async function uploadToCloudinary(file: File, isPrimary: boolean = false): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);

  try {
    const response = await fetch(CLOUDINARY_CONFIG.uploadUrl, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Cloudinary upload failed: ${errorData.error?.message || 'Unknown error'}`
      );
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    throw new Error(
      `Failed to upload to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Upload image to Firebase Storage
async function uploadToFirebase(file: File): Promise<string> {
  const imageRef = ref(storage, `cars/${Date.now()}_${file.name}`);
  await uploadBytes(imageRef, file);
  const url = await getDownloadURL(imageRef);
  return url;
}

// Upload image with intelligent provider selection (Firebase or Cloudinary)
export async function uploadImageWithFallback(
  file: File,
  onFallback?: () => void
): Promise<string> {
  try {
    const compressedFile = await compressImage(file);

    // If Firebase Storage is disabled, use Cloudinary directly
    if (!UPLOAD_CONFIG.enableFirebaseStorage) {
      try {
        return await uploadToCloudinary(compressedFile, true);
      } catch (error) {
        throw error;
      }
    }

    // Firebase Storage is enabled: try Firebase first
    try {
      return await uploadToFirebase(compressedFile);
    } catch (error) {
      // Check if it's a quota error
      if (isQuotaError(error)) {
        // Show fallback toast notification
        toast.warning(
          'Firebase storage limit reached. Uploading via Cloudinary instead.',
          {
            duration: 4000,
          }
        );

        onFallback?.();
        return await uploadToCloudinary(compressedFile, false);
      }

      throw error;
    }
  } catch (error) {
    throw new Error(
      `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// Upload multiple images with intelligent provider selection
export async function uploadImagesWithFallback(
  files: File[],
  onFallback?: () => void
): Promise<string[]> {
  const imageUrls: string[] = [];

  for (const file of files) {
    try {
      const url = await uploadImageWithFallback(file, onFallback);
      imageUrls.push(url);
    } catch (error) {
      throw new Error(
        `Failed to upload image ${file.name}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  return imageUrls;
}

// Get current upload configuration status
export function getUploadConfig() {
  return {
    firebaseStorageEnabled: UPLOAD_CONFIG.enableFirebaseStorage,
    cloudinaryAsPrimary: UPLOAD_CONFIG.cloudinaryAsPrimary,
    primaryProvider: UPLOAD_CONFIG.enableFirebaseStorage ? 'Firebase' : 'Cloudinary',
    fallbackProvider: UPLOAD_CONFIG.enableFirebaseStorage ? 'Cloudinary' : 'None',
  };
}

// Detect image source (Cloudinary or Firebase Storage)
export function detectImageSource(url: string): {
  source: 'cloudinary' | 'firebase';
  publicId?: string;
  path?: string;
} {
  if (url.includes('cloudinary.com') || url.includes('res.cloudinary.com')) {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/);
    if (match && match[1]) {
      return {
        source: 'cloudinary',
        publicId: match[1],
      };
    }
    return {
      source: 'cloudinary',
    };
  }

  if (url.includes('firebasestorage.googleapis.com')) {
    const match = url.match(/\/o\/(.*?)\?/);
    if (match && match[1]) {
      return {
        source: 'firebase',
        path: decodeURIComponent(match[1]),
      };
    }
    return {
      source: 'firebase',
    };
  }

  return { source: 'firebase' };
}

// Delete image from Cloudinary using direct API call
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  try {
    const cloudName = CLOUDINARY_CONFIG.cloudName;
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
    const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      return;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const signatureString = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = await hashSHA1(signatureString);

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', apiKey);
    formData.append('signature', signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json();
    // Handle response silently
  } catch (error) {
    // Silently handle errors
  }
}

// Generate SHA-1 hash for Cloudinary API authentication
async function hashSHA1(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Delete image from Firebase Storage
export async function deleteFromFirebase(path: string): Promise<void> {
  try {
    const imageRef = ref(storage, path);
    await deleteObject(imageRef);
  } catch (error) {
    // Silently handle errors
  }
}

// Delete image from its source (Cloudinary or Firebase Storage)
export async function deleteImageByUrl(url: string): Promise<void> {
  try {
    const { source, publicId, path } = detectImageSource(url);

    if (source === 'cloudinary' && publicId) {
      await deleteFromCloudinary(publicId);
    } else if (source === 'firebase' && path) {
      await deleteFromFirebase(path);
    }
  } catch (error) {
    // Silently handle errors
  }
}

// Delete multiple images from their respective sources
export async function deleteImagesByUrls(urls: string[]): Promise<void> {
  const deletePromises = urls.map((url) => deleteImageByUrl(url));
  await Promise.all(deletePromises);
}

// Compare old and new image URLs to identify removed images
export function getDeletedImageUrls(
  originalUrls: string[],
  currentUrls: string[]
): string[] {
  return originalUrls.filter(
    (url) => !currentUrls.includes(url) && url.startsWith('https')
  );
}

// Handle image deletion when editing a listing
// originalImageUrls: original images from database before any changes
// currentImageUrls: images currently shown in UI (after user removed some)
// newUploadedUrls: newly uploaded image URLs
// Returns the final image URLs after cleanup and addition of new images
export async function handleImageUpdate(
  originalImageUrls: string[],
  currentImageUrls: string[],
  newUploadedUrls: string[]
): Promise<string[]> {
  const imagesToDelete = getDeletedImageUrls(originalImageUrls, currentImageUrls);
  
  // Delete removed images from cloud storage
  if (imagesToDelete.length > 0) {
    await deleteImagesByUrls(imagesToDelete);
  }

  // Return combined list of remaining images and newly uploaded images
  return [...currentImageUrls, ...newUploadedUrls];
}

