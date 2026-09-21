// ============================================================================
// Cloudinary configuration
// ============================================================================

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? '',
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ?? '',
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? 'amazon_clone_products',
} as const;

/**
 * Build a Cloudinary URL with optional transformation string.
 *
 * @example
 * buildCloudinaryUrl('products/abc123', 'f_auto,q_auto,w_400')
 * // → https://res.cloudinary.com/<cloud>/image/upload/f_auto,q_auto,w_400/products/abc123
 */
export function buildCloudinaryUrl(
  publicId: string,
  transformations = 'f_auto,q_auto',
): string {
  const { cloudName } = cloudinaryConfig;
  if (!cloudName || !publicId) return '';
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformations}/${publicId}`;
}

/**
 * Common Cloudinary transformation presets.
 */
export const CLOUDINARY_TRANSFORMS = {
  productThumbnail: 'f_auto,q_auto,w_300,h_300,c_pad,b_white',
  productFull: 'f_auto,q_auto,w_800,h_800,c_pad,b_white',
  productCard: 'f_auto,q_auto,w_400,h_400,c_pad,b_white',
  avatar: 'f_auto,q_auto,w_120,h_120,c_fill,g_face,r_max',
  banner: 'f_auto,q_auto,w_1200,h_400,c_fill,g_auto',
} as const;

export type CloudinaryTransformKey = keyof typeof CLOUDINARY_TRANSFORMS;
