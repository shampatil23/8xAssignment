// ============================================================================
// Wishlist Service — Business logic for Saved Items & Wishlist
// Handles Firebase RTDB persistence for authenticated customers
// ============================================================================
import type { Wishlist, WishlistItem, Product, ApiResponse } from '@/types';
import { getUserWishlist, saveUserWishlist } from '@/lib/firebase/database';

export async function getWishlist(userId: string): Promise<Wishlist | null> {
  try {
    const wishlist = await getUserWishlist(userId);
    if (!wishlist) return null;
    if (!wishlist.items) wishlist.items = [];
    return wishlist;
  } catch (error) {
    console.error('[wishlistService.getWishlist] error:', error);
    return null;
  }
}

export async function saveWishlistToDatabase(
  userId: string,
  wishlist: Wishlist,
): Promise<ApiResponse<Wishlist>> {
  try {
    await saveUserWishlist(userId, wishlist);
    return {
      success: true,
      data: wishlist,
    };
  } catch (error) {
    console.error('[wishlistService.saveWishlistToDatabase] error:', error);
    return {
      success: false,
      error: 'Failed to synchronize wishlist with database.',
    };
  }
}
