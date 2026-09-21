// ============================================================================
// Shared TypeScript Types for Amazon Clone
// ============================================================================

// --- User Types ---
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  phoneNumber: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  role: UserRole;
  addresses: Address[];
  defaultAddressId?: string;
}

export type UserRole = 'customer' | 'admin' | 'seller';

export interface Address {
  id: string;
  fullName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault?: boolean;
}

// --- Product Types ---
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  category: string;
  subcategory?: string;
  brand?: string;
  images: ProductImage[];
  stock: number;
  sku?: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  features?: string[];
  specifications?: Record<string, string>;
  sellerId?: string;
  sellerName?: string;
  isFeatured?: boolean;
  isPrimeEligible?: boolean;
  isBestSeller?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  url: string;
  publicId?: string; // Cloudinary public ID
  alt: string;
  isPrimary?: boolean;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  rating: number;
  title: string;
  body: string;
  helpfulCount: number;
  verifiedPurchase: boolean;
  createdAt: string;
}

// --- Cart Types ---
export interface CartItem {
  id: string;
  productId: string;
  product: Pick<Product, 'id' | 'title' | 'price' | 'images' | 'stock' | 'isPrimeEligible' | 'brand'>;
  quantity: number;
  addedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  itemCount: number;
  updatedAt: string;
}

// --- Order Types ---
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  estimatedDelivery?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export interface PaymentMethod {
  type: 'card' | 'upi' | 'netbanking' | 'cod';
  last4?: string;
  brand?: string;
}

// --- Category Types ---
export interface Category {
  id: string;
  name: string;
  slug: string;
  image?: string;
  parentId?: string;
  children?: Category[];
}

// --- Search Types ---
export interface SearchFilters {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  isPrimeEligible?: boolean;
  sortBy?: SortOption;
}

export type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'newest'
  | 'best-seller';

// --- Pagination ---
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// --- API Response ---
export interface ApiResponse<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// --- UI State Types ---
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface UIState {
  loading: boolean;
  error: string | null;
}
