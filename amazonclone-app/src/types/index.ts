// ============================================================================
// Shared TypeScript Types for Amazon Clone
// ============================================================================

// --- User Types ---
export interface SellerApplication {
  storeName: string;
  businessEmail: string;
  phone?: string;
  category?: string;
  description?: string;
  appliedAt: string;
  verificationStatus: 'pending' | 'approved' | 'rejected';
  verifiedAt?: string;
  rejectionReason?: string;
}

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
  status?: 'active' | 'suspended' | 'pending';
  sellerApplication?: SellerApplication;
  addresses: Address[];
  defaultAddressId?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  language?: string;
  currency?: string;
  orderUpdates?: boolean;
  promotionalEmails?: boolean;
  securityAlerts?: boolean;
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
export type ProductStatus = 'active' | 'draft' | 'archived' | 'out_of_stock';

export interface ProductVariant {
  id: string;
  sku: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  image?: string;
  attributes: Record<string, string>; // e.g. { "Color": "Space Gray", "Storage": "256GB" }
}

export interface DeliveryInfo {
  isFreeDelivery: boolean;
  estimatedDays: number;
  fastestDeliveryDate: string; // e.g. "Tomorrow, 8 AM - 12 PM"
  standardDeliveryDate: string; // e.g. "Thursday, Oct 12"
  shippingFee?: number;
}

export interface SellerInfo {
  id: string;
  name: string;
  rating?: number;
}

export interface Product {
  id: string;
  sku: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  originalPrice?: number;
  compareAtPrice?: number;
  discountPercent?: number;
  category: string; // category slug
  categoryName?: string;
  subcategory?: string;
  brand?: string;
  images: ProductImage[];
  variants?: ProductVariant[];
  stock: number;
  status: ProductStatus;
  rating: number;
  reviewCount: number;
  tags: string[];
  features?: string[];
  specifications?: Record<string, string>;
  deliveryInfo: DeliveryInfo;
  seller?: SellerInfo;
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
  status?: 'approved' | 'hidden' | 'flagged';
  createdAt: string;
}

// --- Cart Types ---
export interface CartItem {
  id: string;
  productId: string;
  variantId?: string;
  variantTitle?: string;
  selectedVariant?: ProductVariant;
  product: Pick<
    Product,
    'id' | 'title' | 'price' | 'images' | 'stock' | 'isPrimeEligible' | 'brand' | 'slug' | 'status' | 'category'
  >;
  quantity: number;
  addedAt: string;
  isAvailable?: boolean;
  stockError?: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  savedItems?: CartItem[];
  subtotal: number;
  itemCount: number;
  updatedAt: string;
}

// --- Wishlist Types ---
export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
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
  sellerId?: string;
  title: string;
  image: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface SellerAnalyticsMetrics {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalOrders: number;
  totalUnitsSold: number;
  totalRevenue: number;
  pendingOrdersCount: number;
  topProducts: {
    id: string;
    title: string;
    image: string;
    unitsSold: number;
    revenue: number;
    stock: number;
  }[];
}

export interface SellerSettingsData {
  storeName: string;
  businessEmail: string;
  storeDescription?: string;
  phone?: string;
  standardDeliveryDays?: number;
  returnWindowDays?: number;
}

export type OrderStatus =
  | 'pending'
  | 'placed'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'RETURN_REQUESTED'
  | 'RETURN_APPROVED'
  | 'RETURNED'
  | 'REFUND_PENDING'
  | 'REFUNDED'
  | 'refunded';

export interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  productId: string;
  itemTitle: string;
  itemImage: string;
  quantity: number;
  refundAmount: number;
  reason: string;
  note?: string;
  status: 'RETURN_REQUESTED' | 'RETURN_APPROVED' | 'RETURNED' | 'REFUND_PENDING' | 'REFUNDED';
  createdAt: string;
  updatedAt: string;
}

export interface QuestionAnswer {
  id: string;
  text: string;
  authorName: string;
  authorRole: 'customer' | 'seller' | 'admin';
  createdAt: string;
}

export interface ProductQuestion {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  question: string;
  answers: QuestionAnswer[];
  createdAt: string;
}

export interface PaymentMethod {
  type: 'card' | 'upi' | 'netbanking' | 'cod' | 'razorpay';
  last4?: string;
  brand?: string;
  cardHolder?: string;
  expMonth?: string;
  expYear?: string;
  upiId?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
}

export interface ShippingOption {
  id: string;
  title: string;
  description: string;
  estimatedDate: string;
  price: number;
}

// --- Category Types ---
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  itemCount?: number;
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

// --- Admin & Platform Types ---
export interface Promotion {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageCount?: number;
  createdAt: string;
}

export interface PlatformSettings {
  siteName: string;
  supportEmail: string;
  currency: string;
  freeShippingThreshold: number;
  standardShippingFee: number;
  taxRatePercent: number;
  maintenanceMode: boolean;
  allowNewRegistrations: boolean;
  autoApproveReviews: boolean;
  updatedAt: string;
}

export interface AdminDashboardStats {
  totalUsers: number;
  totalCustomers: number;
  totalSellers: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalReturns: number;
  pendingReturns: number;
  platformGMV: number;
  recentOrders: Order[];
  recentReturns: ReturnRequest[];
  recentUsers: User[];
}

// --- Notification Types ---
export type NotificationType = 'order' | 'return' | 'promotion' | 'system' | 'security';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
  read: boolean;
  orderId?: string;
  returnId?: string;
  createdAt: string;
}

// --- Customer Support Types ---
export type SupportTopic =
  | 'orders'
  | 'delivery'
  | 'returns'
  | 'payments'
  | 'account'
  | 'seller'
  | 'other';

export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type SupportPriority = 'low' | 'medium' | 'high';

export interface SupportMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'support' | 'admin';
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userEmail: string;
  userName: string;
  topic: SupportTopic;
  subject: string;
  status: SupportTicketStatus;
  priority: SupportPriority;
  orderId?: string;
  messages: SupportMessage[];
  createdAt: string;
  updatedAt: string;
}

