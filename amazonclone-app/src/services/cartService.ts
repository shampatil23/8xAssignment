// ============================================================================
// Cart Service — Business logic for Shopping Cart & Saved For Later
// Handles totals, stock validation, and Firebase RTDB persistence
// ============================================================================
import type { Cart, CartItem, Product, ProductVariant, ApiResponse } from '@/types';
import { getUserCart, saveUserCart, getAllProducts } from '@/lib/firebase/database';

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

/**
 * Validates cart items against live catalog inventory.
 * Automatically caps quantities that exceed available stock and flags out-of-stock items.
 */
export async function validateCartStock(cart: Cart): Promise<{
  updatedCart: Cart;
  hasStockChanges: boolean;
}> {
  try {
    const liveProducts = await getAllProducts();
    const productMap = new Map<string, Product>();
    liveProducts.forEach((p) => productMap.set(p.id, p));

    let hasStockChanges = false;

    const validatedItems = cart.items.map((item) => {
      const liveProduct = productMap.get(item.productId);

      if (!liveProduct || liveProduct.status === 'out_of_stock' || liveProduct.stock <= 0) {
        if (item.isAvailable !== false) hasStockChanges = true;
        return {
          ...item,
          isAvailable: false,
          stockError: 'This item is currently out of stock.',
        };
      }

      // Check variant stock if applicable
      let availableStock = liveProduct.stock;
      if (item.variantId && liveProduct.variants) {
        const variant = liveProduct.variants.find((v) => v.id === item.variantId);
        if (variant) {
          availableStock = variant.stock;
        }
      }

      if (availableStock <= 0) {
        if (item.isAvailable !== false) hasStockChanges = true;
        return {
          ...item,
          isAvailable: false,
          stockError: 'Selected option is out of stock.',
        };
      }

      // If item quantity exceeds stock, cap it to available stock
      if (item.quantity > availableStock) {
        hasStockChanges = true;
        return {
          ...item,
          quantity: availableStock,
          isAvailable: true,
          stockError: `Quantity adjusted to maximum available stock (${availableStock}).`,
          product: {
            ...item.product,
            stock: availableStock,
          },
        };
      }

      return {
        ...item,
        isAvailable: true,
        stockError: undefined,
        product: {
          ...item.product,
          price: item.product.price, // keep synced
          stock: availableStock,
        },
      };
    });

    const { subtotal, itemCount } = calculateCartTotals(validatedItems);

    return {
      updatedCart: {
        ...cart,
        items: validatedItems,
        subtotal,
        itemCount,
        updatedAt: new Date().toISOString(),
      },
      hasStockChanges,
    };
  } catch (err) {
    console.error('[cartService.validateCartStock] error:', err);
    return { updatedCart: cart, hasStockChanges: false };
  }
}

/**
 * Fetch cart from Firebase RTDB and run inventory validation
 */
export async function getCart(userId: string): Promise<Cart | null> {
  try {
    const rawCart = await getUserCart(userId);
    if (!rawCart) return null;

    const { updatedCart, hasStockChanges } = await validateCartStock(rawCart);
    if (hasStockChanges) {
      await saveUserCart(userId, updatedCart);
    }
    return updatedCart;
  } catch (error) {
    console.error('[cartService.getCart] error:', error);
    return null;
  }
}

/**
 * Persist cart to Firebase RTDB for an authenticated user
 */
export async function saveCartToDatabase(
  userId: string,
  cart: Cart,
): Promise<ApiResponse<Cart>> {
  try {
    await saveUserCart(userId, cart);
    return {
      success: true,
      data: cart,
    };
  } catch (error) {
    console.error('[cartService.saveCartToDatabase] error:', error);
    return {
      success: false,
      error: 'Failed to synchronize cart with database.',
    };
  }
}
