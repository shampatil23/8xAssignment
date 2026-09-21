// ============================================================================
// Firebase Realtime Database helpers
// User profiles are stored here under /users/{uid}
// ============================================================================
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  remove,
  onValue,
  type Database,
  type DataSnapshot,
} from 'firebase/database';
import { firebaseApp } from './config';
import type {
  User as AppUser,
  UserRole,
  Category,
  Product,
  Cart,
  Wishlist,
  Address,
  Order,
} from '@/types';
import { SEED_CATEGORIES, SEED_PRODUCTS } from './seedData';

let _db: Database | null = null;

export function getRTDB(): Database {
  if (!_db) {
    _db = getDatabase(firebaseApp);
  }
  return _db;
}

// ── Profile shape stored in RTDB ──────────────────────────────────────────
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  accountStatus: 'active' | 'suspended' | 'pending';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Create a brand-new user profile after registration ───────────────────
export async function createUserProfile(
  uid: string,
  data: Pick<UserProfile, 'email' | 'displayName'>,
): Promise<void> {
  const db = getRTDB();
  const now = new Date().toISOString();
  const profile: UserProfile = {
    uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: null,
    role: 'customer',          // default — never elevated from client
    accountStatus: 'active',
    emailVerified: false,
    createdAt: now,
    updatedAt: now,
  };
  await set(ref(db, `users/${uid}`), profile);
}

// ── Read a profile once ───────────────────────────────────────────────────
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getRTDB();
  const snap: DataSnapshot = await get(ref(db, `users/${uid}`));
  if (!snap.exists()) return null;
  return snap.val() as UserProfile;
}

// ── Partial update (e.g. displayName, photoURL) ───────────────────────────
export async function updateUserProfile(
  uid: string,
  data: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'role'>>,
): Promise<void> {
  const db = getRTDB();
  await update(ref(db, `users/${uid}`), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

// ── Subscribe to profile changes (real-time) ─────────────────────────────
export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void,
): () => void {
  const db = getRTDB();
  const unsubscribe = onValue(ref(db, `users/${uid}`), (snap) => {
    callback(snap.exists() ? (snap.val() as UserProfile) : null);
  });
  return unsubscribe;
}

// ── Map RTDB profile + FirebaseUser → AppUser type ────────────────────────
export function profileToAppUser(profile: UserProfile): AppUser {
  return {
    uid: profile.uid,
    email: profile.email,
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    phoneNumber: null,
    emailVerified: profile.emailVerified,
    role: profile.role,
    addresses: [],
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

// ============================================================================
// Category RTDB operations (/categories/{id})
// ============================================================================

export async function getAllCategories(): Promise<Category[]> {
  const db = getRTDB();
  try {
    const snap: DataSnapshot = await get(ref(db, 'categories'));
    if (!snap.exists()) {
      // Auto-seed if categories are missing
      await seedCatalogData();
      return SEED_CATEGORIES;
    }
    const val = snap.val() as Record<string, Category>;
    return Object.values(val);
  } catch (err) {
    console.warn('[RTDB] getAllCategories failed, using fallback:', err);
    return SEED_CATEGORIES;
  }
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = await getAllCategories();
  return categories.find((c) => c.slug === slug) ?? null;
}

export async function saveCategory(category: Category): Promise<void> {
  const db = getRTDB();
  await set(ref(db, `categories/${category.id}`), category);
}

// ============================================================================
// Product RTDB operations (/products/{id})
// ============================================================================

export async function getAllProducts(): Promise<Product[]> {
  const db = getRTDB();
  try {
    const snap: DataSnapshot = await get(ref(db, 'products'));
    if (!snap.exists()) {
      // Auto-seed if products are missing
      await seedCatalogData();
      return SEED_PRODUCTS;
    }
    const val = snap.val() as Record<string, Product>;
    return Object.values(val);
  } catch (err) {
    console.warn('[RTDB] getAllProducts failed, using fallback:', err);
    return SEED_PRODUCTS;
  }
}

export async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.category === categorySlug);
}

export async function getProductById(id: string): Promise<Product | null> {
  const db = getRTDB();
  try {
    const snap: DataSnapshot = await get(ref(db, `products/${id}`));
    if (snap.exists()) return snap.val() as Product;
    // Fallback to seed list
    return SEED_PRODUCTS.find((p) => p.id === id) ?? null;
  } catch (err) {
    console.warn('[RTDB] getProductById failed, checking fallback:', err);
    return SEED_PRODUCTS.find((p) => p.id === id) ?? null;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const all = await getAllProducts();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function saveProduct(product: Product): Promise<void> {
  const db = getRTDB();
  await set(ref(db, `products/${product.id}`), {
    ...product,
    updatedAt: new Date().toISOString(),
  });
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id' | 'createdAt'>>,
): Promise<void> {
  const db = getRTDB();
  await update(ref(db, `products/${id}`), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

// ============================================================================
// Seed Catalog Data
// ============================================================================
export async function seedCatalogData(force = false): Promise<{
  categoriesCount: number;
  productsCount: number;
}> {
  const db = getRTDB();
  try {
    if (!force) {
      const snap = await get(ref(db, 'categories'));
      if (snap.exists() && Object.keys(snap.val() || {}).length > 0) {
        return {
          categoriesCount: Object.keys(snap.val()).length,
          productsCount: SEED_PRODUCTS.length,
        };
      }
    }

    // Write all seed categories
    const categoryUpdates: Record<string, Category> = {};
    for (const cat of SEED_CATEGORIES) {
      categoryUpdates[`categories/${cat.id}`] = cat;
    }
    await update(ref(db), categoryUpdates);

    // Write all seed products
    const productUpdates: Record<string, Product> = {};
    for (const prod of SEED_PRODUCTS) {
      productUpdates[`products/${prod.id}`] = prod;
    }
    await update(ref(db), productUpdates);

    return {
      categoriesCount: SEED_CATEGORIES.length,
      productsCount: SEED_PRODUCTS.length,
    };
  } catch (err) {
    console.error('[RTDB] Error seeding catalog data:', err);
    return {
      categoriesCount: SEED_CATEGORIES.length,
      productsCount: SEED_PRODUCTS.length,
    };
  }
}

// ============================================================================
// User Cart Operations (RTDB)
// Stored under users/${uid}/cart
// ============================================================================
export async function getUserCart(uid: string): Promise<Cart | null> {
  const db = getRTDB();
  const snap = await get(ref(db, `users/${uid}/cart`));
  if (!snap.exists()) return null;
  const cart = snap.val() as Cart;
  if (!cart.items) cart.items = [];
  if (!cart.savedItems) cart.savedItems = [];
  return cart;
}

export async function saveUserCart(uid: string, cart: Cart): Promise<void> {
  const db = getRTDB();
  await set(ref(db, `users/${uid}/cart`), cart);
}

// ============================================================================
// User Wishlist Operations (RTDB)
// Stored under users/${uid}/wishlist
// ============================================================================
export async function getUserWishlist(uid: string): Promise<Wishlist | null> {
  const db = getRTDB();
  const snap = await get(ref(db, `users/${uid}/wishlist`));
  if (!snap.exists()) return null;
  const wishlist = snap.val() as Wishlist;
  if (!wishlist.items) wishlist.items = [];
  return wishlist;
}

export async function saveUserWishlist(uid: string, wishlist: Wishlist): Promise<void> {
  const db = getRTDB();
  await set(ref(db, `users/${uid}/wishlist`), wishlist);
}

// ============================================================================
// User Address Operations (RTDB)
// Stored under users/${uid}/addresses/${addressId}
// ============================================================================
export async function getUserAddresses(uid: string): Promise<Address[]> {
  const db = getRTDB();
  const snap = await get(ref(db, `users/${uid}/addresses`));
  if (!snap.exists()) return [];
  const raw = snap.val() as Record<string, Address>;
  return Object.values(raw);
}

export async function saveUserAddress(uid: string, address: Address): Promise<void> {
  const db = getRTDB();
  // If this address is set as default, unset other defaults
  if (address.isDefault) {
    const addresses = await getUserAddresses(uid);
    const updates: Record<string, any> = {};
    addresses.forEach((addr) => {
      if (addr.id !== address.id && addr.isDefault) {
        updates[`users/${uid}/addresses/${addr.id}/isDefault`] = false;
      }
    });
    updates[`users/${uid}/addresses/${address.id}`] = address;
    await update(ref(db), updates);
  } else {
    await set(ref(db, `users/${uid}/addresses/${address.id}`), address);
  }
}

export async function deleteUserAddress(uid: string, addressId: string): Promise<void> {
  const db = getRTDB();
  await remove(ref(db, `users/${uid}/addresses/${addressId}`));
}

export async function setDefaultAddress(uid: string, addressId: string): Promise<void> {
  const db = getRTDB();
  const addresses = await getUserAddresses(uid);
  const updates: Record<string, any> = {};
  addresses.forEach((addr) => {
    updates[`users/${uid}/addresses/${addr.id}/isDefault`] = addr.id === addressId;
  });
  await update(ref(db), updates);
}

// ============================================================================
// Order Operations (RTDB)
// Stored under orders/${orderId} and indexed under users/${uid}/orders/${orderId}
// ============================================================================
export async function saveOrder(order: Order): Promise<void> {
  const db = getRTDB();
  const updates: Record<string, any> = {
    [`orders/${order.id}`]: order,
    [`users/${order.userId}/orders/${order.id}`]: {
      id: order.id,
      createdAt: order.createdAt,
      total: order.total,
      status: order.status,
      itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
    },
  };
  await update(ref(db), updates);
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const db = getRTDB();
  const snap = await get(ref(db, `orders/${orderId}`));
  if (!snap.exists()) return null;
  return snap.val() as Order;
}

export async function getUserOrdersFromDB(uid: string): Promise<Order[]> {
  const db = getRTDB();
  const snap = await get(ref(db, `users/${uid}/orders`));
  if (!snap.exists()) return [];
  const orderIndex = snap.val() as Record<string, any>;
  const orderIds = Object.keys(orderIndex);

  const fullOrders: Order[] = [];
  for (const id of orderIds) {
    const o = await getOrder(id);
    if (o) fullOrders.push(o);
  }

  // Sort newest first
  fullOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return fullOrders;
}

