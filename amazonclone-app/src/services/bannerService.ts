// ============================================================================
// Banner Service — Dynamic Hero Banners, Luxury Offers & Cloudinary Media
// ============================================================================
import type { HeroBanner, ApiResponse } from '@/types';
import {
  getHeroBannersFromDB,
  saveHeroBannerInDB,
  deleteHeroBannerInDB,
  reorderHeroBannersInDB,
  DEFAULT_HERO_BANNERS,
} from '@/lib/firebase/database';
import { uploadBannerImage, type ImageUploadResult } from './imageService';

/**
 * Fetch all hero banners & offers.
 * If `onlyActive` is true, returns only active slides suitable for customer storefront.
 */
export async function fetchHeroBanners(
  onlyActive = false,
): Promise<ApiResponse<HeroBanner[]>> {
  try {
    const banners = await getHeroBannersFromDB();
    const result = onlyActive
      ? banners.filter((b) => b.isActive !== false)
      : banners;
    return {
      success: true,
      data: result.length > 0 ? result : DEFAULT_HERO_BANNERS,
    };
  } catch (error) {
    console.error('[bannerService.fetchHeroBanners] error:', error);
    return {
      success: true,
      data: DEFAULT_HERO_BANNERS,
      message: 'Loaded default hero banners due to network state.',
    };
  }
}

/**
 * Save or update a hero banner / promotional offer in DB.
 */
export async function saveHeroBanner(
  banner: HeroBanner,
): Promise<ApiResponse<HeroBanner>> {
  try {
    const payload: HeroBanner = {
      ...banner,
      updatedAt: new Date().toISOString(),
    };
    await saveHeroBannerInDB(payload);
    return {
      success: true,
      data: payload,
      message: 'Banner saved successfully.',
    };
  } catch (error) {
    console.error('[bannerService.saveHeroBanner] error:', error);
    return {
      success: false,
      error: (error as Error).message || 'Failed to save banner.',
    };
  }
}

/**
 * Delete a hero banner / promotional offer from DB.
 */
export async function deleteHeroBanner(
  bannerId: string,
): Promise<ApiResponse<void>> {
  try {
    await deleteHeroBannerInDB(bannerId);
    return {
      success: true,
      message: 'Banner removed successfully.',
    };
  } catch (error) {
    console.error('[bannerService.deleteHeroBanner] error:', error);
    return {
      success: false,
      error: (error as Error).message || 'Failed to delete banner.',
    };
  }
}

/**
 * Reorder hero banners.
 */
export async function reorderHeroBanners(
  bannerIds: string[],
): Promise<ApiResponse<void>> {
  try {
    await reorderHeroBannersInDB(bannerIds);
    return {
      success: true,
      message: 'Banners reordered successfully.',
    };
  } catch (error) {
    console.error('[bannerService.reorderHeroBanners] error:', error);
    return {
      success: false,
      error: (error as Error).message || 'Failed to reorder banners.',
    };
  }
}

/**
 * Upload an image for a hero banner to Cloudinary.
 */
export async function uploadHeroBannerImage(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<ApiResponse<ImageUploadResult>> {
  return uploadBannerImage(file, onProgress);
}
