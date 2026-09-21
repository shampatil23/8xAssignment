'use client';
// ============================================================================
// useCart — convenient hook to consume CartContext
// ============================================================================
import { useCartContext } from '@/context/CartContext';

export function useCart() {
  return useCartContext();
}
