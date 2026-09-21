// ============================================================================
// Image Service — abstracts Cloudinary operations from UI (stub for Phase 5)
// ============================================================================
import type { ApiResponse } from '@/types';
import { buildCloudinaryUrl, CLOUDINARY_TRANSFORMS, type CloudinaryTransformKey } from '@/lib/cloudinary/config';

export interface ImageUploadResult {
  publicId: string;
  url: string;
  width: number;
  height: number;
}

/**
 * Upload a product image to Cloudinary.
 * Full implementation in Phase 5.
 */
export async function uploadProductImage(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<ApiResponse<ImageUploadResult>> {
  const { uploadToCloudinary } = await import('@/lib/cloudinary/upload');
  try {
    const result = await uploadToCloudinary(file, 'products', onProgress);
    return {
      success: true,
      data: {
        publicId: result.publicId,
        url: result.secureUrl,
        width: result.width,
        height: result.height,
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Upload a user avatar to Cloudinary.
 */
export async function uploadAvatar(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<ApiResponse<ImageUploadResult>> {
  const { uploadToCloudinary } = await import('@/lib/cloudinary/upload');
  try {
    const result = await uploadToCloudinary(file, 'avatars', onProgress);
    return {
      success: true,
      data: {
        publicId: result.publicId,
        url: result.secureUrl,
        width: result.width,
        height: result.height,
      },
    };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Get an optimised Cloudinary URL for a given publicId and preset.
 */
export function getImageUrl(
  publicId: string,
  preset: CloudinaryTransformKey = 'productCard',
): string {
  return buildCloudinaryUrl(publicId, CLOUDINARY_TRANSFORMS[preset]);
}
