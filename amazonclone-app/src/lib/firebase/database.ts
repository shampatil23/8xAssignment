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
  OrderStatus,
  Review,
  ReturnRequest,
  ProductQuestion,
  QuestionAnswer,
  Promotion,
  PlatformSettings,
  SellerApplication,
  Notification,
  SupportTicket,
  SupportMessage,
  SupportTicketStatus,
  UserPreferences,
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
  phoneNumber?: string | null;
  role: UserRole;
  accountStatus: 'active' | 'suspended' | 'pending';
  sellerApplication?: SellerApplication;
  preferences?: UserPreferences;
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

export async function setUserRole(uid: string, role: UserRole): Promise<void> {
  const db = getRTDB();
  await update(ref(db, `users/${uid}`), {
    role,
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
    phoneNumber: profile.phoneNumber ?? null,
    emailVerified: profile.emailVerified,
    role: profile.role,
    status: profile.accountStatus,
    sellerApplication: profile.sellerApplication,
    preferences: profile.preferences,
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

export async function deleteCategoryFromDB(categoryId: string): Promise<void> {
  const db = getRTDB();
  await remove(ref(db, `categories/${categoryId}`));
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
  const slug = categorySlug.toLowerCase();
  return all.filter((p) => {
    const pCat = p.category.toLowerCase();
    if (pCat === slug) return true;
    if (
      (slug === 'home-garden' || slug === 'home-kitchen') &&
      (pCat === 'home-garden' || pCat === 'home-kitchen')
    ) {
      return true;
    }
    if (
      (slug === 'sports' || slug === 'fitness') &&
      (pCat === 'sports' || pCat === 'fitness')
    ) {
      return true;
    }
    return false;
  });
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

export async function deleteProductFromDB(id: string): Promise<void> {
  const db = getRTDB();
  await remove(ref(db, `products/${id}`));
}

export async function getProductsBySellerFromDB(sellerId: string): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p) => p.sellerId === sellerId || p.seller?.id === sellerId);
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
// Helper: Recursively clean undefined values before RTDB set/update
// RTDB throws an uncatchable exception if any property is undefined.
// ============================================================================
export function cleanRTDBData<T>(obj: T): T {
  if (obj === undefined) {
    return null as unknown as T;
  }
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj
      .map(cleanRTDBData)
      .filter((item) => item !== undefined) as unknown as T;
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (value !== undefined) {
      result[key] = cleanRTDBData(value);
    }
  }
  return result as T;
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
  await set(ref(db, `users/${uid}/cart`), cleanRTDBData(cart));
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
  await set(ref(db, `users/${uid}/wishlist`), cleanRTDBData(wishlist));
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
    updates[`users/${uid}/addresses/${address.id}`] = cleanRTDBData(address);
    await update(ref(db), cleanRTDBData(updates));
  } else {
    await set(ref(db, `users/${uid}/addresses/${address.id}`), cleanRTDBData(address));
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
  const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const notifTime = new Date().toISOString();
  const orderNotif: Notification = {
    id: notifId,
    userId: order.userId,
    title: 'Order Confirmed',
    message: `Your order #${order.id.slice(-8).toUpperCase()} for ${order.items.length} item(s) has been placed successfully.`,
    type: 'order',
    link: `/orders/${order.id}`,
    read: false,
    orderId: order.id,
    createdAt: notifTime,
  };

  const updates: Record<string, any> = {
    [`orders/${order.id}`]: order,
    [`users/${order.userId}/orders/${order.id}`]: {
      id: order.id,
      createdAt: order.createdAt,
      total: order.total,
      status: order.status,
      itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
    },
    [`users/${order.userId}/notifications/${notifId}`]: orderNotif,
  };
  await update(ref(db), cleanRTDBData(updates));
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

export async function getAllOrdersFromDB(): Promise<Order[]> {
  const db = getRTDB();
  const snap = await get(ref(db, 'orders'));
  if (!snap.exists()) return [];
  const val = snap.val() as Record<string, Order>;
  const list = Object.values(val);
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
}

export async function updateOrderStatusInDB(orderId: string, status: OrderStatus): Promise<void> {
  const db = getRTDB();
  const order = await getOrder(orderId);
  if (!order) return;

  const now = new Date().toISOString();
  const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const statusMessages: Record<string, string> = {
    processing: `Order #${orderId.slice(-8).toUpperCase()} is now being processed and prepared for shipment.`,
    shipped: `Great news! Order #${orderId.slice(-8).toUpperCase()} has shipped and is on its way.`,
    out_for_delivery: `Order #${orderId.slice(-8).toUpperCase()} is out for delivery today!`,
    delivered: `Delivered: Package for order #${orderId.slice(-8).toUpperCase()} has arrived.`,
    cancelled: `Order #${orderId.slice(-8).toUpperCase()} has been cancelled.`,
  };

  const notifMsg =
    statusMessages[status] ||
    `Status updated for order #${orderId.slice(-8).toUpperCase()} to ${status}.`;
  const orderNotif: Notification = {
    id: notifId,
    userId: order.userId,
    title: `Order Status: ${status.replace(/_/g, ' ').toUpperCase()}`,
    message: notifMsg,
    type: 'order',
    link: `/orders/${orderId}`,
    read: false,
    orderId,
    createdAt: now,
  };

  const updates: Record<string, any> = {
    [`orders/${orderId}/status`]: status,
    [`orders/${orderId}/updatedAt`]: now,
    [`users/${order.userId}/orders/${orderId}/status`]: status,
    [`users/${order.userId}/notifications/${notifId}`]: orderNotif,
  };
  await update(ref(db), updates);
}

// ============================================================================
// Purchase Verification
// Check if user has an active/completed order containing the specified product
// ============================================================================
export async function hasUserPurchasedProduct(userId: string, productId: string): Promise<boolean> {
  const db = getRTDB();
  const orders = await getUserOrdersFromDB(userId);
  return orders.some((order) =>
    order.items.some((item) => item.productId === productId),
  );
}

// ============================================================================
// Product Reviews Operations (RTDB)
// Stored under reviews/${productId}/${reviewId}
// Indexed under users/${userId}/reviews/${productId}
// ============================================================================
export async function getProductReviews(productId: string): Promise<Review[]> {
  const db = getRTDB();
  const snap = await get(ref(db, `reviews/${productId}`));
  if (!snap.exists()) return [];
  const raw = snap.val() as Record<string, Review>;
  const list = Object.values(raw);
  // Sort newest first
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
}

export async function saveProductReview(
  review: Review,
): Promise<{ newRating: number; newCount: number }> {
  const db = getRTDB();
  const updates: Record<string, any> = {
    [`reviews/${review.productId}/${review.id}`]: review,
    [`users/${review.userId}/reviews/${review.productId}`]: review.id,
  };
  await update(ref(db), updates);

  // Recalculate average rating & count
  const allReviews = await getProductReviews(review.productId);
  const newCount = allReviews.length;
  const newRating =
    newCount > 0
      ? Number(
          (allReviews.reduce((sum, r) => sum + r.rating, 0) / newCount).toFixed(1),
        )
      : 5.0;

  await update(ref(db), {
    [`products/${review.productId}/rating`]: newRating,
    [`products/${review.productId}/reviewCount`]: newCount,
  });

  return { newRating, newCount };
}

export async function deleteProductReview(
  productId: string,
  reviewId: string,
  userId: string,
): Promise<{ newRating: number; newCount: number }> {
  const db = getRTDB();
  await remove(ref(db, `reviews/${productId}/${reviewId}`));
  await remove(ref(db, `users/${userId}/reviews/${productId}`));

  // Recalculate average rating & count
  const allReviews = await getProductReviews(productId);
  const newCount = allReviews.length;
  const newRating =
    newCount > 0
      ? Number(
          (allReviews.reduce((sum, r) => sum + r.rating, 0) / newCount).toFixed(1),
        )
      : 5.0;

  await update(ref(db), {
    [`products/${productId}/rating`]: newRating,
    [`products/${productId}/reviewCount`]: newCount,
  });

  return { newRating, newCount };
}

// ============================================================================
// Product Questions & Answers (RTDB)
// Stored under questions/${productId}/${questionId}
// ============================================================================
export async function getProductQuestions(productId: string): Promise<ProductQuestion[]> {
  const db = getRTDB();
  const snap = await get(ref(db, `questions/${productId}`));
  if (!snap.exists()) return [];
  const raw = snap.val() as Record<string, ProductQuestion>;
  const list = Object.values(raw);
  list.forEach((q) => {
    if (!q.answers) q.answers = [];
  });
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
}

export async function saveProductQuestion(question: ProductQuestion): Promise<void> {
  const db = getRTDB();
  await set(ref(db, `questions/${question.productId}/${question.id}`), question);
}

export async function addQuestionAnswer(
  productId: string,
  questionId: string,
  answer: QuestionAnswer,
): Promise<void> {
  const db = getRTDB();
  const snap = await get(ref(db, `questions/${productId}/${questionId}`));
  if (!snap.exists()) return;
  const q = snap.val() as ProductQuestion;
  const answers = q.answers || [];
  answers.push(answer);
  await update(ref(db, `questions/${productId}/${questionId}`), { answers });
}

// ============================================================================
// Returns & Refunds Operations (RTDB)
// Stored under returns/${returnId}
// Indexed under users/${userId}/returns/${returnId}
// ============================================================================
export async function saveReturnRequest(req: ReturnRequest): Promise<void> {
  const db = getRTDB();
  const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const returnNotif: Notification = {
    id: notifId,
    userId: req.userId,
    title: 'Return Request Received',
    message: `Return request received for "${req.itemTitle.slice(0, 35)}...". Refund amount: ₹${req.refundAmount.toLocaleString()}.`,
    type: 'return',
    link: `/orders?tab=returns`,
    read: false,
    orderId: req.orderId,
    returnId: req.id,
    createdAt: now,
  };

  const updates: Record<string, any> = {
    [`returns/${req.id}`]: req,
    [`users/${req.userId}/returns/${req.id}`]: req,
    [`orders/${req.orderId}/returns/${req.id}`]: req,
    [`orders/${req.orderId}/status`]: req.status,
    [`users/${req.userId}/orders/${req.orderId}/status`]: req.status,
    [`users/${req.userId}/notifications/${notifId}`]: returnNotif,
  };
  await update(ref(db), updates);
}

export async function getReturnRequestsByUser(userId: string): Promise<ReturnRequest[]> {
  const db = getRTDB();
  const snap = await get(ref(db, `users/${userId}/returns`));
  if (!snap.exists()) return [];
  const raw = snap.val() as Record<string, ReturnRequest>;
  const list = Object.values(raw);
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return list;
}

export async function getReturnRequestsByOrder(orderId: string): Promise<ReturnRequest[]> {
  const db = getRTDB();
  const snap = await get(ref(db, `orders/${orderId}/returns`));
  if (!snap.exists()) return [];
  const raw = snap.val() as Record<string, ReturnRequest>;
  return Object.values(raw);
}

export async function updateReturnStatusInDB(
  returnId: string,
  orderId: string,
  userId: string,
  status: ReturnRequest['status'],
): Promise<void> {
  const db = getRTDB();
  const now = new Date().toISOString();
  const notifId = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

  const returnLabels: Record<string, string> = {
    RETURN_APPROVED: 'Return approved! Please send the item back with original packaging.',
    RETURNED: 'Item received by fulfillment center. Processing inspection.',
    REFUND_PENDING: 'Refund has been initiated to your original payment method.',
    REFUNDED: 'Refund completed successfully! Funds should appear in your account soon.',
  };

  const returnNotif: Notification = {
    id: notifId,
    userId,
    title: `Return Update: ${status.replace(/_/g, ' ')}`,
    message: returnLabels[status] || `Your return request status is now ${status}.`,
    type: 'return',
    link: `/orders?tab=returns`,
    read: false,
    orderId,
    returnId,
    createdAt: now,
  };

  const updates: Record<string, any> = {
    [`returns/${returnId}/status`]: status,
    [`returns/${returnId}/updatedAt`]: now,
    [`users/${userId}/returns/${returnId}/status`]: status,
    [`users/${userId}/returns/${returnId}/updatedAt`]: now,
    [`orders/${orderId}/returns/${returnId}/status`]: status,
    [`orders/${orderId}/returns/${returnId}/updatedAt`]: now,
    [`orders/${orderId}/status`]: status,
    [`users/${userId}/orders/${orderId}/status`]: status,
    [`users/${userId}/notifications/${notifId}`]: returnNotif,
  };
  await update(ref(db), updates);
}

// ============================================================================
// Admin Operations (RTDB)
// ============================================================================

export async function getAllUsersFromDB(): Promise<AppUser[]> {
  const db = getRTDB();
  try {
    const snap = await get(ref(db, 'users'));
    if (!snap.exists()) return [];
    const val = snap.val() as Record<string, any>;
    return Object.entries(val).map(([uid, u]) => ({
      uid,
      email: u.email || null,
      displayName: u.displayName || 'Customer',
      photoURL: u.photoURL || null,
      phoneNumber: u.phoneNumber || null,
      emailVerified: Boolean(u.emailVerified),
      createdAt: u.createdAt || new Date().toISOString(),
      updatedAt: u.updatedAt || new Date().toISOString(),
      role: (u.role as UserRole) || 'customer',
      status: (u.status || u.accountStatus || 'active') as 'active' | 'suspended' | 'pending',
      sellerApplication: u.sellerApplication || undefined,
      addresses: u.addresses ? Object.values(u.addresses as Record<string, Address>) : [],
      defaultAddressId: u.defaultAddressId,
    }));
  } catch (err) {
    console.warn('[database.getAllUsersFromDB] failed:', err);
    return [];
  }
}

export async function updateUserStatusInDB(
  uid: string,
  status: 'active' | 'suspended' | 'pending',
  role?: UserRole,
): Promise<void> {
  const db = getRTDB();
  const updates: Record<string, any> = {
    [`users/${uid}/status`]: status,
    [`users/${uid}/accountStatus`]: status,
    [`users/${uid}/updatedAt`]: new Date().toISOString(),
  };
  if (role) {
    updates[`users/${uid}/role`] = role;
  }
  await update(ref(db), updates);
}

export async function applyForSellerAccount(
  uid: string,
  application: SellerApplication,
): Promise<void> {
  const db = getRTDB();
  const now = new Date().toISOString();
  await update(ref(db, `users/${uid}`), {
    role: 'seller',
    status: 'pending',
    accountStatus: 'pending',
    sellerApplication: application,
    updatedAt: now,
  });
}

export async function approveSellerAccount(uid: string): Promise<void> {
  const db = getRTDB();
  const now = new Date().toISOString();
  await update(ref(db, `users/${uid}`), {
    status: 'active',
    accountStatus: 'active',
    'sellerApplication/verificationStatus': 'approved',
    'sellerApplication/verifiedAt': now,
    updatedAt: now,
  });

  // Automatically activate any draft products created by this seller
  const allProducts = await getAllProducts();
  const sellerProducts = allProducts.filter(
    (p) => p.sellerId === uid || p.seller?.id === uid,
  );
  for (const p of sellerProducts) {
    if (p.status === 'draft') {
      await updateProduct(p.id, { status: 'active' });
    }
  }
}

export async function rejectSellerAccount(uid: string, reason?: string): Promise<void> {
  const db = getRTDB();
  const now = new Date().toISOString();
  await update(ref(db, `users/${uid}`), {
    status: 'suspended',
    accountStatus: 'suspended',
    'sellerApplication/verificationStatus': 'rejected',
    'sellerApplication/rejectionReason': reason || 'Verification declined by administrator.',
    updatedAt: now,
  });
}

export async function getAllReviewsFromDB(): Promise<Review[]> {
  const db = getRTDB();
  try {
    const snap = await get(ref(db, 'reviews'));
    if (!snap.exists()) return [];
    const val = snap.val() as Record<string, Record<string, Review>>;
    const allReviews: Review[] = [];
    Object.values(val).forEach((productReviews) => {
      if (productReviews && typeof productReviews === 'object') {
        Object.values(productReviews).forEach((rev) => {
          if (rev && rev.id) {
            allReviews.push(rev);
          }
        });
      }
    });
    allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return allReviews;
  } catch (err) {
    console.warn('[database.getAllReviewsFromDB] failed:', err);
    return [];
  }
}

export async function updateReviewStatusInDB(
  productId: string,
  reviewId: string,
  status: 'approved' | 'hidden' | 'flagged',
): Promise<void> {
  const db = getRTDB();
  await update(ref(db), {
    [`reviews/${productId}/${reviewId}/status`]: status,
  });
}

export async function adminDeleteReviewInDB(
  productId: string,
  reviewId: string,
): Promise<void> {
  const db = getRTDB();
  // Read review to find userId if needed
  const snap = await get(ref(db, `reviews/${productId}/${reviewId}`));
  if (snap.exists()) {
    const rev = snap.val() as Review;
    if (rev.userId) {
      await remove(ref(db, `users/${rev.userId}/reviews/${productId}`));
    }
  }
  await remove(ref(db, `reviews/${productId}/${reviewId}`));

  // Recalculate rating & reviewCount
  const allReviews = await getProductReviews(productId);
  const newCount = allReviews.length;
  const newRating =
    newCount > 0
      ? Number((allReviews.reduce((sum, r) => sum + r.rating, 0) / newCount).toFixed(1))
      : 5.0;

  await update(ref(db), {
    [`products/${productId}/rating`]: newRating,
    [`products/${productId}/reviewCount`]: newCount,
  });
}

export async function getAllReturnsFromDB(): Promise<ReturnRequest[]> {
  const db = getRTDB();
  try {
    const snap = await get(ref(db, 'returns'));
    if (!snap.exists()) return [];
    const raw = snap.val() as Record<string, ReturnRequest>;
    const list = Object.values(raw);
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    console.warn('[database.getAllReturnsFromDB] failed:', err);
    return [];
  }
}

export async function getPromotionsFromDB(): Promise<Promotion[]> {
  const db = getRTDB();
  try {
    const snap = await get(ref(db, 'promotions'));
    if (!snap.exists()) return [];
    const val = snap.val() as Record<string, Promotion>;
    const list = Object.values(val);
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    console.warn('[database.getPromotionsFromDB] failed:', err);
    return [];
  }
}

export async function savePromotionInDB(promo: Promotion): Promise<void> {
  const db = getRTDB();
  await set(ref(db, `promotions/${promo.id}`), promo);
}

export async function deletePromotionInDB(promoId: string): Promise<void> {
  const db = getRTDB();
  await remove(ref(db, `promotions/${promoId}`));
}

const DEFAULT_SETTINGS: PlatformSettings = {
  siteName: 'Amazon Clone',
  supportEmail: 'support@amazonclone.com',
  currency: 'USD',
  freeShippingThreshold: 35,
  standardShippingFee: 5.99,
  taxRatePercent: 8.25,
  maintenanceMode: false,
  allowNewRegistrations: true,
  autoApproveReviews: true,
  updatedAt: new Date().toISOString(),
};

export async function getPlatformSettingsFromDB(): Promise<PlatformSettings> {
  const db = getRTDB();
  try {
    const snap = await get(ref(db, 'settings/platform'));
    if (!snap.exists()) {
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...snap.val() };
  } catch (err) {
    console.warn('[database.getPlatformSettingsFromDB] failed:', err);
    return DEFAULT_SETTINGS;
  }
}

export async function savePlatformSettingsInDB(settings: PlatformSettings): Promise<void> {
  const db = getRTDB();
  await set(ref(db, 'settings/platform'), {
    ...settings,
    updatedAt: new Date().toISOString(),
  });
}

// ============================================================================
// User Profile Preferences & Contact
// ============================================================================
export async function updateUserPreferencesInDB(
  userId: string,
  preferences: UserPreferences,
): Promise<void> {
  const db = getRTDB();
  await update(ref(db, `users/${userId}`), {
    preferences,
    updatedAt: new Date().toISOString(),
  });
}

export async function updateUserPhoneInDB(
  userId: string,
  phoneNumber: string,
): Promise<void> {
  const db = getRTDB();
  await update(ref(db, `users/${userId}`), {
    phoneNumber,
    updatedAt: new Date().toISOString(),
  });
}

// ============================================================================
// Customer Notifications Operations (RTDB)
// Stored under users/${userId}/notifications/${notificationId}
// ============================================================================
export async function createNotification(
  userId: string,
  data: Omit<Notification, 'id' | 'createdAt' | 'userId'>,
): Promise<Notification> {
  const db = getRTDB();
  const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const notification: Notification = {
    ...data,
    id,
    userId,
    createdAt: new Date().toISOString(),
  };
  await set(ref(db, `users/${userId}/notifications/${id}`), notification);
  return notification;
}

export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const db = getRTDB();
  try {
    const snap = await get(ref(db, `users/${userId}/notifications`));
    if (!snap.exists()) return [];
    const val = snap.val() as Record<string, Notification>;
    const list = Object.values(val);
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  } catch (err) {
    console.warn('[database.getUserNotifications] failed:', err);
    return [];
  }
}

export function subscribeToUserNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void,
): () => void {
  const db = getRTDB();
  const notifsRef = ref(db, `users/${userId}/notifications`);
  const unsubscribe = onValue(notifsRef, (snap) => {
    if (!snap.exists()) {
      callback([]);
      return;
    }
    const val = snap.val() as Record<string, Notification>;
    const list = Object.values(val);
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    callback(list);
  });
  return unsubscribe;
}

export async function markNotificationAsRead(
  userId: string,
  notificationId: string,
): Promise<void> {
  const db = getRTDB();
  await update(ref(db, `users/${userId}/notifications/${notificationId}`), {
    read: true,
  });
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const db = getRTDB();
  const notifs = await getUserNotifications(userId);
  if (notifs.length === 0) return;
  const updates: Record<string, any> = {};
  notifs.forEach((n) => {
    if (!n.read) {
      updates[`users/${userId}/notifications/${n.id}/read`] = true;
    }
  });
  if (Object.keys(updates).length > 0) {
    await update(ref(db), updates);
  }
}

export async function deleteNotificationFromDB(
  userId: string,
  notificationId: string,
): Promise<void> {
  const db = getRTDB();
  await remove(ref(db, `users/${userId}/notifications/${notificationId}`));
}

// ============================================================================
// Customer Support & Help Ticket Operations (RTDB)
// Stored under supportTickets/${ticketId}
// Indexed under users/${userId}/supportTickets/${ticketId}
// ============================================================================
export async function createSupportTicketInDB(
  data: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'ticketNumber'>,
): Promise<SupportTicket> {
  const db = getRTDB();
  const id = `tck-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const ticketNumber = `CAS-${Math.floor(100000 + Math.random() * 900000)}`;
  const now = new Date().toISOString();

  const ticket: SupportTicket = {
    ...data,
    id,
    ticketNumber,
    createdAt: now,
    updatedAt: now,
  };

  const updates: Record<string, any> = {
    [`supportTickets/${id}`]: ticket,
    [`users/${data.userId}/supportTickets/${id}`]: {
      id,
      ticketNumber,
      subject: data.subject,
      topic: data.topic,
      status: data.status,
      createdAt: now,
      updatedAt: now,
    },
  };
  await update(ref(db), updates);

  // Send a confirmation notification to the customer
  await createNotification(data.userId, {
    title: 'Support Ticket Created',
    message: `Your support inquiry #${ticketNumber} ("${data.subject.slice(0, 30)}...") has been submitted. Our team will review it shortly.`,
    type: 'system',
    link: `/help?ticket=${id}`,
    read: false,
  });

  return ticket;
}

export async function getUserSupportTicketsFromDB(userId: string): Promise<SupportTicket[]> {
  const db = getRTDB();
  try {
    const snap = await get(ref(db, `users/${userId}/supportTickets`));
    if (!snap.exists()) return [];
    const index = snap.val() as Record<string, any>;
    const ticketIds = Object.keys(index);

    const fullTickets: SupportTicket[] = [];
    for (const tid of ticketIds) {
      const tSnap = await get(ref(db, `supportTickets/${tid}`));
      if (tSnap.exists()) {
        const ticket = tSnap.val() as SupportTicket;
        if (!ticket.messages) ticket.messages = [];
        fullTickets.push(ticket);
      }
    }

    fullTickets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return fullTickets;
  } catch (err) {
    console.warn('[database.getUserSupportTicketsFromDB] failed:', err);
    return [];
  }
}

export async function getSupportTicketByIdFromDB(ticketId: string): Promise<SupportTicket | null> {
  const db = getRTDB();
  const snap = await get(ref(db, `supportTickets/${ticketId}`));
  if (!snap.exists()) return null;
  const ticket = snap.val() as SupportTicket;
  if (!ticket.messages) ticket.messages = [];
  return ticket;
}

export async function addSupportMessageInDB(
  ticketId: string,
  data: Omit<SupportMessage, 'id' | 'createdAt'>,
): Promise<SupportMessage> {
  const db = getRTDB();
  const ticket = await getSupportTicketByIdFromDB(ticketId);
  if (!ticket) throw new Error('Ticket not found');

  const now = new Date().toISOString();
  const msgId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const message: SupportMessage = {
    ...data,
    id: msgId,
    createdAt: now,
  };

  const updatedMessages = [...(ticket.messages || []), message];

  const updates: Record<string, any> = {
    [`supportTickets/${ticketId}/messages`]: updatedMessages,
    [`supportTickets/${ticketId}/updatedAt`]: now,
    [`users/${ticket.userId}/supportTickets/${ticketId}/updatedAt`]: now,
  };
  await update(ref(db), updates);

  return message;
}

export async function updateSupportTicketStatusInDB(
  ticketId: string,
  status: SupportTicketStatus,
): Promise<void> {
  const db = getRTDB();
  const ticket = await getSupportTicketByIdFromDB(ticketId);
  if (!ticket) return;

  const now = new Date().toISOString();
  const updates: Record<string, any> = {
    [`supportTickets/${ticketId}/status`]: status,
    [`supportTickets/${ticketId}/updatedAt`]: now,
    [`users/${ticket.userId}/supportTickets/${ticketId}/status`]: status,
    [`users/${ticket.userId}/supportTickets/${ticketId}/updatedAt`]: now,
  };
  await update(ref(db), updates);

  // Notify customer of status change
  await createNotification(ticket.userId, {
    title: `Support Ticket Updated: #${ticket.ticketNumber}`,
    message: `Your inquiry status is now ${status.replace('_', ' ').toUpperCase()}.`,
    type: 'system',
    link: `/help?ticket=${ticketId}`,
    read: false,
  });
}



