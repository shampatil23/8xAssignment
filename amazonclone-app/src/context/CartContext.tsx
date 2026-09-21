'use client';
// ============================================================================
// Cart Context — global cart state (stub, fully implemented in Phase 4)
// ============================================================================
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  type ReactNode,
} from 'react';
import type { Cart, CartItem } from '@/types';

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
  | { type: 'SET_CART'; payload: Cart }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_CART':
      return { ...state, cart: action.payload, loading: false, error: null };
    case 'CLEAR_CART':
      return { ...state, cart: null, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

// --- Context ---
interface CartContextValue extends CartState {
  itemCount: number;
  subtotal: number;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Derived values
  const items: CartItem[] = state.cart?.items ?? [];
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0,
  );

  // Stubs — Phase 4 will wire these to cartService
  const addItem = useCallback(async (productId: string, quantity = 1) => {
    // TODO Phase 4
    console.log('[CartContext] addItem', { productId, quantity });
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    // TODO Phase 4
    console.log('[CartContext] removeItem', itemId);
  }, []);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    // TODO Phase 4
    console.log('[CartContext] updateQuantity', { itemId, quantity });
  }, []);

  const clearCart = useCallback(async () => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  return (
    <CartContext.Provider
      value={{
        ...state,
        itemCount,
        subtotal,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
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
