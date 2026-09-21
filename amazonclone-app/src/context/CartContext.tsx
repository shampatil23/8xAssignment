'use client';
// ============================================================================
// Cart Context — Global Shopping Cart & Saved For Later
// Persists with Firebase RTDB (users/${uid}/cart) and localStorage
// ============================================================================
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Cart, CartItem, Product, ProductVariant } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import {
  getCart,
  saveCartToDatabase,
  calculateCartTotals,
  validateCartStock,
} from '@/services/cartService';

// --- State ---
interface CartState {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
};

// --- Actions ---
type CartAction =
  | { type: 'SET_CART'; payload: Cart | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_CART' };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, cart: action.payload, loading: false, error: null };
    case 'CLEAR_CART':
      return { ...state, cart: null, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

// --- Context Value ---
export interface CartContextValue extends CartState {
  items: CartItem[];
  savedItems: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (
    product: Product,
    variantOrQty?: ProductVariant | null | number,
    maybeQty?: number,
  ) => Promise<{ success: boolean; message?: string }>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  saveForLater: (itemId: string) => Promise<void>;
  moveToCart: (itemId: string) => Promise<void>;
  removeSavedItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

function getStorageKey(uid?: string | null) {
  return uid ? `amazon_clone_cart_${uid}` : 'amazon_clone_cart_guest';
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Sync cart helper: updates state, localStorage, and Firebase RTDB
  const syncCart = useCallback(
    async (newCart: Cart | null) => {
      dispatch({ type: 'SET_CART', payload: newCart });

      const storageKey = getStorageKey(user?.uid);
      try {
        if (newCart) {
          localStorage.setItem(storageKey, JSON.stringify(newCart));
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch (e) {
        console.warn('[CartContext] localStorage write failed', e);
      }

      if (user && newCart) {
        await saveCartToDatabase(user.uid, newCart);
      }
    },
    [user],
  );

  // Load cart on auth change or mount
  const loadCart = useCallback(async () => {
    if (authLoading) return;

    if (!user) {
      // Signed out: do not maintain persistent guest cart
      dispatch({ type: 'SET_CART', payload: null });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // 1. Try fetching from Firebase RTDB
      const remoteCart = await getCart(user.uid);
      if (remoteCart) {
        dispatch({ type: 'SET_CART', payload: remoteCart });
        localStorage.setItem(getStorageKey(user.uid), JSON.stringify(remoteCart));
        return;
      }

      // 2. Fallback to localStorage for this user if remote not yet populated
      const local = localStorage.getItem(getStorageKey(user.uid));
      if (local) {
        const parsed = JSON.parse(local) as Cart;
        const { updatedCart } = await validateCartStock(parsed);
        dispatch({ type: 'SET_CART', payload: updatedCart });
        await saveCartToDatabase(user.uid, updatedCart);
        return;
      }

      // 3. New empty cart for user
      const emptyCart: Cart = {
        id: `cart-${user.uid}`,
        userId: user.uid,
        items: [],
        savedItems: [],
        subtotal: 0,
        itemCount: 0,
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'SET_CART', payload: emptyCart });
      await saveCartToDatabase(user.uid, emptyCart);
    } catch (err) {
      console.error('[CartContext.loadCart] error:', err);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load shopping cart' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user, authLoading]);

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Derived values
  const items: CartItem[] = state.cart?.items ?? [];
  const savedItems: CartItem[] = state.cart?.savedItems ?? [];
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );

  // --- Add Item ---
  const addItem = useCallback(
    async (
      product: Product,
      variantOrQty?: ProductVariant | null | number,
      maybeQty?: number,
    ): Promise<{ success: boolean; message?: string }> => {
      let variant: ProductVariant | null | undefined;
      let quantity = 1;

      if (typeof variantOrQty === 'number') {
        quantity = variantOrQty;
        variant = undefined;
      } else {
        variant = variantOrQty;
        quantity = typeof maybeQty === 'number' ? maybeQty : 1;
      }

      const availableStock = variant ? variant.stock : product.stock;
      if (availableStock <= 0 || product.status === 'out_of_stock') {
        return { success: false, message: 'This item is currently out of stock.' };
      }

      const currentCart: Cart = state.cart || {
        id: user ? `cart-${user.uid}` : 'cart-local',
        userId: user ? user.uid : 'guest',
        items: [],
        savedItems: [],
        subtotal: 0,
        itemCount: 0,
        updatedAt: new Date().toISOString(),
      };

      const itemId = variant ? `${product.id}-${variant.id}` : product.id;
      const itemTitle = variant ? `${product.title} (${variant.title})` : product.title;
      const itemPrice = variant?.price ?? product.price;
      const itemImages = variant?.image
        ? [{ url: variant.image, alt: itemTitle, isPrimary: true }, ...product.images]
        : product.images;

      const existingIndex = currentCart.items.findIndex((i) => i.id === itemId);
      let updatedItems: CartItem[];

      if (existingIndex >= 0) {
        const existingItem = currentCart.items[existingIndex];
        const newTotalQty = Math.min(availableStock, existingItem.quantity + quantity);
        updatedItems = [...currentCart.items];
        updatedItems[existingIndex] = {
          ...existingItem,
          quantity: newTotalQty,
          stockError:
            existingItem.quantity + quantity > availableStock
              ? `Maximum available stock reached (${availableStock}).`
              : undefined,
        };
      } else {
        const cappedQty = Math.min(availableStock, quantity);
        const newItem: CartItem = {
          id: itemId,
          productId: product.id,
          variantId: variant?.id,
          variantTitle: variant?.title,
          selectedVariant: variant || undefined,
          product: {
            id: product.id,
            title: itemTitle,
            price: itemPrice,
            images: itemImages,
            stock: availableStock,
            isPrimeEligible: product.isPrimeEligible,
            brand: product.brand,
            slug: product.slug,
            category: product.category,
            status: product.status,
          },
          quantity: cappedQty,
          addedAt: new Date().toISOString(),
          isAvailable: true,
        };
        updatedItems = [newItem, ...currentCart.items];
      }

      const totals = calculateCartTotals(updatedItems);
      const newCart: Cart = {
        ...currentCart,
        items: updatedItems,
        savedItems: currentCart.savedItems || [],
        subtotal: totals.subtotal,
        itemCount: totals.itemCount,
        updatedAt: new Date().toISOString(),
      };

      await syncCart(newCart);
      return { success: true };
    },
    [state.cart, user, syncCart],
  );

  // --- Update Quantity ---
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (!state.cart) return;

      if (quantity <= 0) {
        // Remove item if quantity set to 0
        const updatedItems = state.cart.items.filter((i) => i.id !== itemId);
        const totals = calculateCartTotals(updatedItems);
        const newCart: Cart = {
          ...state.cart,
          items: updatedItems,
          subtotal: totals.subtotal,
          itemCount: totals.itemCount,
          updatedAt: new Date().toISOString(),
        };
        await syncCart(newCart);
        return;
      }

      const updatedItems = state.cart.items.map((item) => {
        if (item.id !== itemId) return item;
        const maxStock = item.product.stock;
        const cappedQty = Math.min(maxStock, quantity);
        return {
          ...item,
          quantity: cappedQty,
          stockError:
            quantity > maxStock
              ? `Maximum available stock reached (${maxStock}).`
              : undefined,
        };
      });

      const totals = calculateCartTotals(updatedItems);
      const newCart: Cart = {
        ...state.cart,
        items: updatedItems,
        subtotal: totals.subtotal,
        itemCount: totals.itemCount,
        updatedAt: new Date().toISOString(),
      };
      await syncCart(newCart);
    },
    [state.cart, syncCart],
  );

  // --- Remove Item ---
  const removeItem = useCallback(
    async (itemId: string) => {
      if (!state.cart) return;
      const updatedItems = state.cart.items.filter((i) => i.id !== itemId);
      const totals = calculateCartTotals(updatedItems);
      const newCart: Cart = {
        ...state.cart,
        items: updatedItems,
        subtotal: totals.subtotal,
        itemCount: totals.itemCount,
        updatedAt: new Date().toISOString(),
      };
      await syncCart(newCart);
    },
    [state.cart, syncCart],
  );

  // --- Save For Later ---
  const saveForLater = useCallback(
    async (itemId: string) => {
      if (!state.cart) return;
      const targetItem = state.cart.items.find((i) => i.id === itemId);
      if (!targetItem) return;

      const remainingItems = state.cart.items.filter((i) => i.id !== itemId);
      const currentSaved = state.cart.savedItems || [];
      const updatedSaved = [targetItem, ...currentSaved.filter((i) => i.id !== itemId)];

      const totals = calculateCartTotals(remainingItems);
      const newCart: Cart = {
        ...state.cart,
        items: remainingItems,
        savedItems: updatedSaved,
        subtotal: totals.subtotal,
        itemCount: totals.itemCount,
        updatedAt: new Date().toISOString(),
      };
      await syncCart(newCart);
    },
    [state.cart, syncCart],
  );

  // --- Move Back To Cart ---
  const moveToCart = useCallback(
    async (itemId: string) => {
      if (!state.cart) return;
      const targetItem = (state.cart.savedItems || []).find((i) => i.id === itemId);
      if (!targetItem) return;

      const remainingSaved = (state.cart.savedItems || []).filter((i) => i.id !== itemId);
      const availableStock = targetItem.product.stock;

      // Cap to stock
      const cappedQty = Math.max(1, Math.min(availableStock, targetItem.quantity));
      const movedItem: CartItem = {
        ...targetItem,
        quantity: cappedQty,
      };

      const updatedItems = [movedItem, ...state.cart.items.filter((i) => i.id !== itemId)];
      const totals = calculateCartTotals(updatedItems);

      const newCart: Cart = {
        ...state.cart,
        items: updatedItems,
        savedItems: remainingSaved,
        subtotal: totals.subtotal,
        itemCount: totals.itemCount,
        updatedAt: new Date().toISOString(),
      };
      await syncCart(newCart);
    },
    [state.cart, syncCart],
  );

  // --- Remove Saved Item ---
  const removeSavedItem = useCallback(
    async (itemId: string) => {
      if (!state.cart) return;
      const remainingSaved = (state.cart.savedItems || []).filter((i) => i.id !== itemId);
      const newCart: Cart = {
        ...state.cart,
        savedItems: remainingSaved,
        updatedAt: new Date().toISOString(),
      };
      await syncCart(newCart);
    },
    [state.cart, syncCart],
  );

  // --- Clear Cart ---
  const clearCart = useCallback(async () => {
    if (!state.cart) return;
    const newCart: Cart = {
      ...state.cart,
      items: [],
      subtotal: 0,
      itemCount: 0,
      updatedAt: new Date().toISOString(),
    };
    await syncCart(newCart);
  }, [state.cart, syncCart]);

  return (
    <CartContext.Provider
      value={{
        ...state,
        items,
        savedItems,
        itemCount,
        subtotal,
        addItem,
        updateQuantity,
        removeItem,
        saveForLater,
        moveToCart,
        removeSavedItem,
        clearCart,
        refreshCart: loadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCartContext must be used inside <CartProvider>');
  }
  return ctx;
}

export const useCart = useCartContext;
