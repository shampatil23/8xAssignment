// ============================================================================
// Cart Service — business logic layer (stub, implemented in Phase 4)
// ============================================================================
import type { Cart, CartItem, ApiResponse } from '@/types';

export async function getCart(userId: string): Promise<Cart | null> {
  // TODO Phase 4: fetch cart from Firestore
  console.log('[cartService] getCart called', userId);
  return null;
}

export async function addToCart(
  userId: string,
  productId: string,
  quantity = 1,
): Promise<ApiResponse<Cart>> {
  // TODO Phase 4: add item to Firestore cart
  console.log('[cartService] addToCart called', { userId, productId, quantity });
  return { success: false, error: 'Not implemented yet' };
}

export async function updateCartItem(
  userId: string,
  itemId: string,
  quantity: number,
): Promise<ApiResponse<Cart>> {
  // TODO Phase 4: update item quantity in Firestore cart
  console.log('[cartService] updateCartItem called', { userId, itemId, quantity });
  return { success: false, error: 'Not implemented yet' };
}

export async function removeFromCart(
  userId: string,
  itemId: string,
): Promise<ApiResponse<Cart>> {
  // TODO Phase 4: remove item from Firestore cart
  console.log('[cartService] removeFromCart called', { userId, itemId });
  return { success: false, error: 'Not implemented yet' };
}

export async function clearCart(userId: string): Promise<ApiResponse> {
  // TODO Phase 4: clear all items from cart
  console.log('[cartService] clearCart called', userId);
  return { success: false, error: 'Not implemented yet' };
}

export function calculateCartTotals(items: CartItem[]): {
  subtotal: number;
  itemCount: number;
} {
  return items.reduce(
    (acc, item) => ({
      subtotal: acc.subtotal + item.product.price * item.quantity,
      itemCount: acc.itemCount + item.quantity,
    }),
    { subtotal: 0, itemCount: 0 },
  );
}
