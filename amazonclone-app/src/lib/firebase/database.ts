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
  onValue,
  type Database,
  type DataSnapshot,
} from 'firebase/database';
import { firebaseApp } from './config';
import type { User as AppUser, UserRole, Category, Product } from '@/types';
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
