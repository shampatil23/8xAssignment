'use client';
// ============================================================================
// Wishlist Context — Customer Saved Items & Wishlist
// Persists with Firebase RTDB (users/${uid}/wishlist) and localStorage
// ============================================================================
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import type { Wishlist, WishlistItem, Product } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from './CartContext';
import { getWishlist, saveWishlistToDatabase } from '@/services/wishlistService';

interface WishlistState {
  wishlist: Wishlist | null;
  loading: boolean;
  error: string | null;
}

const initialState: WishlistState = {
  wishlist: null,
  loading: false,
  error: null,
};

type WishlistAction =
  | { type: 'SET_WISHLIST'; payload: Wishlist | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

function wishlistReducer(
  state: WishlistState,
  action: WishlistAction,
): WishlistState {
  switch (action.type) {
    case 'SET_WISHLIST':
      return { ...state, wishlist: action.payload, loading: false, error: null };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

export interface WishlistContextValue extends WishlistState {
  items: WishlistItem[];
  itemCount: number;
  isWishlisted: (productId: string) => boolean;
  addToWishlist: (product: Product) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<void>;
  toggleWishlist: (product: Product) => Promise<boolean>;
  moveToCart: (item: WishlistItem) => Promise<void>;
  clearWishlist: () => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);

function getStorageKey(uid?: string | null) {
  return uid ? `amazon_clone_wishlist_${uid}` : 'amazon_clone_wishlist_guest';
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { addItem } = useCart();
  const [state, dispatch] = useReducer(wishlistReducer, initialState);

  const syncWishlist = useCallback(
    async (newWishlist: Wishlist | null) => {
      dispatch({ type: 'SET_WISHLIST', payload: newWishlist });

      const storageKey = getStorageKey(user?.uid);
      try {
        if (newWishlist) {
          localStorage.setItem(storageKey, JSON.stringify(newWishlist));
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch (e) {
        console.warn('[WishlistContext] localStorage write failed', e);
      }

      if (user && newWishlist) {
        await saveWishlistToDatabase(user.uid, newWishlist);
      }
    },
    [user],
  );

  const loadWishlist = useCallback(async () => {
    if (authLoading) return;

    if (!user) {
      dispatch({ type: 'SET_WISHLIST', payload: null });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // 1. Try fetching from RTDB
      const remote = await getWishlist(user.uid);
      if (remote) {
        dispatch({ type: 'SET_WISHLIST', payload: remote });
        localStorage.setItem(getStorageKey(user.uid), JSON.stringify(remote));
        return;
      }

      // 2. Check localStorage
      const local = localStorage.getItem(getStorageKey(user.uid));
      if (local) {
        const parsed = JSON.parse(local) as Wishlist;
        dispatch({ type: 'SET_WISHLIST', payload: parsed });
        await saveWishlistToDatabase(user.uid, parsed);
        return;
      }

      // 3. New empty wishlist
      const emptyWishlist: Wishlist = {
        id: `wishlist-${user.uid}`,
        userId: user.uid,
        items: [],
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'SET_WISHLIST', payload: emptyWishlist });
      await saveWishlistToDatabase(user.uid, emptyWishlist);
    } catch (err) {
      console.error('[WishlistContext.loadWishlist] error:', err);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load wishlist' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user, authLoading]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const items: WishlistItem[] = state.wishlist?.items ?? [];
  const itemCount = items.length;

  const isWishlisted = useCallback(
    (productId: string) => {
      return items.some((item) => item.productId === productId);
    },
    [items],
  );

  const addToWishlist = useCallback(
    async (product: Product): Promise<boolean> => {
      if (!user) return false;

      const currentWishlist: Wishlist = state.wishlist || {
        id: `wishlist-${user.uid}`,
        userId: user.uid,
        items: [],
        updatedAt: new Date().toISOString(),
      };

      if (currentWishlist.items.some((i) => i.productId === product.id)) {
        return true;
      }

      const newItem: WishlistItem = {
        id: `wl-${product.id}`,
        productId: product.id,
        product,
        addedAt: new Date().toISOString(),
      };

      const updatedItems = [newItem, ...currentWishlist.items];
      const newWishlist: Wishlist = {
        ...currentWishlist,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      };

      await syncWishlist(newWishlist);
      return true;
    },
    [user, state.wishlist, syncWishlist],
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      if (!state.wishlist) return;

      const updatedItems = state.wishlist.items.filter(
        (i) => i.productId !== productId,
      );
      const newWishlist: Wishlist = {
        ...state.wishlist,
        items: updatedItems,
        updatedAt: new Date().toISOString(),
      };

      await syncWishlist(newWishlist);
    },
    [state.wishlist, syncWishlist],
  );

  const toggleWishlist = useCallback(
    async (product: Product): Promise<boolean> => {
      if (!user) return false;

      if (isWishlisted(product.id)) {
        await removeFromWishlist(product.id);
        return false;
      } else {
        await addToWishlist(product);
        return true;
      }
    },
    [user, isWishlisted, removeFromWishlist, addToWishlist],
  );

  const moveToCart = useCallback(
    async (item: WishlistItem) => {
      // Add product to cart
      await addItem(item.product, 1);
      // Remove from wishlist
      await removeFromWishlist(item.productId);
    },
    [addItem, removeFromWishlist],
  );

  const clearWishlist = useCallback(async () => {
    if (!state.wishlist) return;
    const newWishlist: Wishlist = {
      ...state.wishlist,
      items: [],
      updatedAt: new Date().toISOString(),
    };
    await syncWishlist(newWishlist);
  }, [state.wishlist, syncWishlist]);

  return (
    <WishlistContext.Provider
      value={{
        ...state,
        items,
        itemCount,
        isWishlisted,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        moveToCart,
        clearWishlist,
        refreshWishlist: loadWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlistContext(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) {
    throw new Error('useWishlistContext must be used inside <WishlistProvider>');
  }
  return ctx;
}

export const useWishlist = useWishlistContext;
