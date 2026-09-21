// ============================================================================
// Cloudinary image upload helper (client-side unsigned upload)
// Full implementation wired in Phase 5 (product management)
// ============================================================================
import { cloudinaryConfig } from './config';

export interface CloudinaryUploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export type UploadFolder = 'products' | 'avatars' | 'banners';

/**
 * Upload a file to Cloudinary using unsigned upload preset.
 * Returns the upload result including publicId and URLs.
 */
export async function uploadToCloudinary(
  file: File,
  folder: UploadFolder = 'products',
  onProgress?: (pct: number) => void,
): Promise<CloudinaryUploadResult> {
  const { cloudName, uploadPreset } = cloudinaryConfig;

  if (!cloudName) {
    throw new Error('Cloudinary cloud name is not configured.');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('folder', folder);

  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  // Use XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const result = JSON.parse(xhr.responseText);
        resolve({
          publicId: result.public_id,
          url: result.url,
          secureUrl: result.secure_url,
          width: result.width,
          height: result.height,
          format: result.format,
          bytes: result.bytes,
        });
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    };

    xhr.onerror = () => reject(new Error('Upload network error'));
    xhr.send(formData);
  });
}

/**
 * Delete an image from Cloudinary (requires server-side API secret).
 * This must be called from a Next.js API route or Server Action.
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const response = await fetch('/api/cloudinary/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId }),
  });

  if (!response.ok) {
    throw new Error('Failed to delete image from Cloudinary');
  }
}
