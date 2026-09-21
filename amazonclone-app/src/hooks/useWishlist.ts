'use client';
// ============================================================================
// useWishlist — convenient hook to consume WishlistContext
// ============================================================================
import { useWishlistContext } from '@/context/WishlistContext';

export function useWishlist() {
  return useWishlistContext();
}
