import pica from 'pica';

/**
 * Image compression configuration
 * These can be overridden via environment variables
 */
export interface CompressionConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  maxFileSize: number; // in bytes
}

/**
 * Default compression configuration
 * Max resolution: 2160px (keeping aspect ratio)
 * Quality: 1.0 (100% - maximum quality for excellent visual output)
 * Max file size: 2MB
 */
const DEFAULT_COMPRESSION_CONFIG: CompressionConfig = {
  maxWidth: 2160,
  maxHeight: 2160,
  quality: 1.0,
  maxFileSize: 2 * 1024 * 1024, // 2MB
};

/**
 * Get compression configuration from environment or use defaults
 */
export function getCompressionConfig(): CompressionConfig {
  return {
    maxWidth: parseInt(import.meta.env.VITE_IMAGE_MAX_WIDTH || '2160', 10),
    maxHeight: parseInt(import.meta.env.VITE_IMAGE_MAX_HEIGHT || '2160', 10),
    quality: parseFloat(import.meta.env.VITE_IMAGE_QUALITY || '1.0'),
    maxFileSize: parseInt(import.meta.env.VITE_IMAGE_MAX_SIZE || String(2 * 1024 * 1024), 10),
  };
}

/**
 * Calculates new dimensions maintaining aspect ratio within max bounds
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  // If image is smaller than max dimensions, keep original size
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  // Calculate aspect ratio
  const aspectRatio = width / height;

  // Scale down based on which dimension exceeds the limit
  if (width > maxWidth) {
    width = maxWidth;
    height = Math.round(width / aspectRatio);
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = Math.round(height * aspectRatio);
  }

  return { width, height };
}

/**
 * Compress image while maintaining aspect ratio and quality
 *
 * @param file - The image file to compress
 * @param config - Optional compression configuration
 * @returns Promise resolving to compressed File object
 */
export async function compressImage(
  file: File,
  config?: Partial<CompressionConfig>
): Promise<File> {
  const finalConfig = { ...getCompressionConfig(), ...config };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (event) => {
      try {
        const img = new Image();
        img.onload = async () => {
          try {
            // Calculate new dimensions
            const { width, height } = calculateDimensions(
              img.width,
              img.height,
              finalConfig.maxWidth,
              finalConfig.maxHeight
            );

            // Create canvas for resizing
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            // Use pica for high-quality resizing
            const picaInstance = pica();
            await picaInstance.resize(img, canvas);

            // Compress using canvas toBlob
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error('Failed to compress image'));
                  return;
                }

                // Check if compressed size exceeds max file size
                if (blob.size > finalConfig.maxFileSize) {
                  // Try with lower quality
                  const quality = finalConfig.quality * 0.8; // Reduce quality further
                  canvas.toBlob(
                    (fallbackBlob) => {
                      if (!fallbackBlob) {
                        reject(new Error('Failed to compress image to desired file size'));
                        return;
                      }

                      const compressedFile = new File(
                        [fallbackBlob],
                        file.name,
                        { type: 'image/jpeg', lastModified: Date.now() }
                      );

                      resolve(compressedFile);
                    },
                    'image/jpeg',
                    quality
                  );
                } else {
                  const compressedFile = new File(
                    [blob],
                    file.name,
                    { type: 'image/jpeg', lastModified: Date.now() }
                  );

                  resolve(compressedFile);
                }
              },
              'image/jpeg',
              finalConfig.quality
            );
          } catch (error) {
            reject(error);
          }
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };

        img.src = event.target?.result as string;
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Compress multiple images in batch
 *
 * @param files - Array of image files to compress
 * @param config - Optional compression configuration
 * @param onProgress - Optional callback for progress updates
 * @returns Promise resolving to array of compressed files
 */
export async function compressImages(
  files: File[],
  config?: Partial<CompressionConfig>,
  onProgress?: (current: number, total: number) => void
): Promise<File[]> {
  const compressedFiles: File[] = [];

  for (let i = 0; i < files.length; i++) {
    try {
      const compressed = await compressImage(files[i], config);
      compressedFiles.push(compressed);
      onProgress?.(i + 1, files.length);
    } catch (error) {
      console.error(`[Compress] Failed to compress ${files[i].name}:`, error);
      throw new Error(
        `Failed to compress image ${files[i].name}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }

  return compressedFiles;
}

/**
 * Get human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Calculate compression ratio
 */
export function getCompressionRatio(originalSize: number, compressedSize: number): number {
  if (originalSize === 0) return 0;
  return Math.round(((originalSize - compressedSize) / originalSize) * 100);
}
