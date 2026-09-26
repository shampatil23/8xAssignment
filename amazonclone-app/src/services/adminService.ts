// ============================================================================
// Admin Service — Platform Administration, Moderation, and Real-Time Analytics
// ============================================================================
import type {
  User as AppUser,
  UserRole,
  Product,
  Category,
  Order,
  OrderStatus,
  Review,
  ReturnRequest,
  Promotion,
  PlatformSettings,
  AdminDashboardStats,
  ApiResponse,
} from '@/types';
import {
  getAllUsersFromDB,
  updateUserStatusInDB,
  approveSellerAccount,
  rejectSellerAccount,
  getAllProducts,
  updateProduct,
  deleteProductFromDB,
  getAllCategories,
  saveCategory,
  deleteCategoryFromDB,
  getAllOrdersFromDB,
  updateOrderStatusInDB,
  getAllReviewsFromDB,
  updateReviewStatusInDB,
  adminDeleteReviewInDB,
  getAllReturnsFromDB,
  updateReturnStatusInDB,
  getPromotionsFromDB,
  savePromotionInDB,
  deletePromotionInDB,
  getPlatformSettingsFromDB,
  savePlatformSettingsInDB,
} from '@/lib/firebase/database';

// ── Dashboard Aggregations ──────────────────────────────────────────────────
export async function fetchAdminDashboardStats(): Promise<ApiResponse<AdminDashboardStats>> {
  try {
    const [users, products, orders, returns] = await Promise.all([
      getAllUsersFromDB(),
      getAllProducts(),
      getAllOrdersFromDB(),
      getAllReturnsFromDB(),
    ]);

    const totalUsers = users.length;
    const totalCustomers = users.filter((u) => u.role === 'customer').length;
    const totalSellers = users.filter((u) => u.role === 'seller').length;

    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.status === 'active').length;

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      (o) => o.status === 'placed' || o.status === 'confirmed' || o.status === 'processing' || o.status === 'pending',
    ).length;

    const totalReturns = returns.length;
    const pendingReturns = returns.filter(
      (r) => r.status === 'RETURN_REQUESTED' || r.status === 'RETURN_APPROVED' || r.status === 'REFUND_PENDING',
    ).length;

    // Platform Gross Merchandise Value (GMV) from non-cancelled orders
    const platformGMV = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const recentOrders = orders.slice(0, 8);
    const recentReturns = returns.slice(0, 8);
    const recentUsers = users.slice(0, 8);

    return {
      success: true,
      data: {
        totalUsers,
        totalCustomers,
        totalSellers,
        totalProducts,
        activeProducts,
        totalOrders,
        pendingOrders,
        totalReturns,
        pendingReturns,
        platformGMV: Number(platformGMV.toFixed(2)),
        recentOrders,
        recentReturns,
        recentUsers,
      },
    };
  } catch (error) {
    console.error('[adminService.fetchAdminDashboardStats] error:', error);
    return { success: false, error: 'Failed to aggregate admin dashboard statistics.' };
  }
}

// ── User Management ────────────────────────────────────────────────────────
export async function fetchAdminUsers(): Promise<ApiResponse<AppUser[]>> {
  try {
    const users = await getAllUsersFromDB();
    return { success: true, data: users };
  } catch (error) {
    console.error('[adminService.fetchAdminUsers] error:', error);
    return { success: false, error: 'Failed to load user accounts.' };
  }
}

export async function updateAdminUserStatus(
  uid: string,
  status: 'active' | 'suspended' | 'pending',
  role?: UserRole,
): Promise<ApiResponse<void>> {
  try {
    await updateUserStatusInDB(uid, status, role);
    return {
      success: true,
      message: `User account has been ${status === 'active' ? 'activated' : 'suspended'}.`,
    };
  } catch (error) {
    console.error('[adminService.updateAdminUserStatus] error:', error);
    return { success: false, error: 'Failed to update user status.' };
  }
}

// ── Seller Oversight ────────────────────────────────────────────────────────
export interface SellerOverview {
  user: AppUser;
  totalProducts: number;
  activeProducts: number;
  totalRevenue: number;
  totalOrders: number;
}

export async function fetchAdminSellers(): Promise<ApiResponse<SellerOverview[]>> {
  try {
    const [users, products, orders] = await Promise.all([
      getAllUsersFromDB(),
      getAllProducts(),
      getAllOrdersFromDB(),
    ]);

    const sellers = users.filter((u) => u.role === 'seller');

    const sellerOverviews: SellerOverview[] = sellers.map((seller) => {
      const sellerProducts = products.filter(
        (p) => p.sellerId === seller.uid || p.seller?.id === seller.uid,
      );
      const activeCount = sellerProducts.filter((p) => p.status === 'active').length;

      let sellerRevenue = 0;
      let sellerOrderCount = 0;

      orders.forEach((order) => {
        if (order.status === 'cancelled') return;
        const matchingItems = order.items.filter(
          (item) => item.sellerId === seller.uid,
        );
        if (matchingItems.length > 0) {
          sellerOrderCount++;
          sellerRevenue += matchingItems.reduce((acc, item) => acc + item.subtotal, 0);
        }
      });

      return {
        user: seller,
        totalProducts: sellerProducts.length,
        activeProducts: activeCount,
        totalRevenue: Number(sellerRevenue.toFixed(2)),
        totalOrders: sellerOrderCount,
      };
    });

    return { success: true, data: sellerOverviews };
  } catch (error) {
    console.error('[adminService.fetchAdminSellers] error:', error);
    return { success: false, error: 'Failed to retrieve seller accounts overview.' };
  }
}

export async function approveAdminSeller(sellerId: string): Promise<ApiResponse<void>> {
  try {
    await approveSellerAccount(sellerId);
    return {
      success: true,
      message: 'Merchant store approved and verified. Their products are now live in the marketplace.',
    };
  } catch (error) {
    console.error('[adminService.approveAdminSeller] error:', error);
    return { success: false, error: 'Failed to approve seller account.' };
  }
}

export async function rejectAdminSeller(sellerId: string, reason?: string): Promise<ApiResponse<void>> {
  try {
    await rejectSellerAccount(sellerId, reason);
    return {
      success: true,
      message: 'Seller application has been declined.',
    };
  } catch (error) {
    console.error('[adminService.rejectAdminSeller] error:', error);
    return { success: false, error: 'Failed to reject seller application.' };
  }
}

// ── Catalog & Products ──────────────────────────────────────────────────────
export async function fetchAdminProducts(): Promise<ApiResponse<Product[]>> {
  try {
    const products = await getAllProducts();
    return { success: true, data: products };
  } catch (error) {
    console.error('[adminService.fetchAdminProducts] error:', error);
    return { success: false, error: 'Failed to retrieve catalog products.' };
  }
}

export async function updateAdminProduct(
  productId: string,
  data: Partial<Product>,
): Promise<ApiResponse<void>> {
  try {
    await updateProduct(productId, data);
    return { success: true, message: 'Product updated successfully.' };
  } catch (error) {
    console.error('[adminService.updateAdminProduct] error:', error);
    return { success: false, error: 'Failed to update product.' };
  }
}

export async function deleteAdminProduct(productId: string): Promise<ApiResponse<void>> {
  try {
    await deleteProductFromDB(productId);
    return { success: true, message: 'Product listing deleted from marketplace.' };
  } catch (error) {
    console.error('[adminService.deleteAdminProduct] error:', error);
    return { success: false, error: 'Failed to delete product.' };
  }
}

// ── Categories Management ───────────────────────────────────────────────────
export async function fetchAdminCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const categories = await getAllCategories();
    return { success: true, data: categories };
  } catch (error) {
    console.error('[adminService.fetchAdminCategories] error:', error);
    return { success: false, error: 'Failed to load categories.' };
  }
}

export async function saveAdminCategory(category: Category): Promise<ApiResponse<void>> {
  try {
    if (!category.id || !category.name || !category.slug) {
      return { success: false, error: 'Category ID, name, and slug are required.' };
    }
    await saveCategory(category);
    return { success: true, message: 'Category saved successfully.' };
  } catch (error) {
    console.error('[adminService.saveAdminCategory] error:', error);
    return { success: false, error: 'Failed to save category.' };
  }
}

export async function deleteAdminCategory(categoryId: string): Promise<ApiResponse<void>> {
  try {
    await deleteCategoryFromDB(categoryId);
    return { success: true, message: 'Category removed successfully.' };
  } catch (error) {
    console.error('[adminService.deleteAdminCategory] error:', error);
    return { success: false, error: 'Failed to delete category.' };
  }
}

// ── Global Orders Management ────────────────────────────────────────────────
export async function fetchAdminOrders(): Promise<ApiResponse<Order[]>> {
  try {
    const orders = await getAllOrdersFromDB();
    return { success: true, data: orders };
  } catch (error) {
    console.error('[adminService.fetchAdminOrders] error:', error);
    return { success: false, error: 'Failed to retrieve orders.' };
  }
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: OrderStatus,
): Promise<ApiResponse<void>> {
  try {
    await updateOrderStatusInDB(orderId, status);
    return { success: true, message: `Order #${orderId} marked as ${status}.` };
  } catch (error) {
    console.error('[adminService.updateAdminOrderStatus] error:', error);
    return { success: false, error: 'Failed to update order status.' };
  }
}

// ── Review Moderation ───────────────────────────────────────────────────────
export async function fetchAdminReviews(): Promise<ApiResponse<Review[]>> {
  try {
    const reviews = await getAllReviewsFromDB();
    return { success: true, data: reviews };
  } catch (error) {
    console.error('[adminService.fetchAdminReviews] error:', error);
    return { success: false, error: 'Failed to retrieve reviews for moderation.' };
  }
}

export async function moderateAdminReview(
  productId: string,
  reviewId: string,
  status: 'approved' | 'hidden' | 'flagged',
): Promise<ApiResponse<void>> {
  try {
    await updateReviewStatusInDB(productId, reviewId, status);
    return { success: true, message: `Review moderation status set to ${status}.` };
  } catch (error) {
    console.error('[adminService.moderateAdminReview] error:', error);
    return { success: false, error: 'Failed to update review moderation state.' };
  }
}

export async function removeAdminReview(
  productId: string,
  reviewId: string,
): Promise<ApiResponse<void>> {
  try {
    await adminDeleteReviewInDB(productId, reviewId);
    return { success: true, message: 'Review permanently purged.' };
  } catch (error) {
    console.error('[adminService.removeAdminReview] error:', error);
    return { success: false, error: 'Failed to remove review.' };
  }
}

// ── Returns & Refunds ───────────────────────────────────────────────────────
export async function fetchAdminReturns(): Promise<ApiResponse<ReturnRequest[]>> {
  try {
    const returns = await getAllReturnsFromDB();
    return { success: true, data: returns };
  } catch (error) {
    console.error('[adminService.fetchAdminReturns] error:', error);
    return { success: false, error: 'Failed to retrieve return requests.' };
  }
}

export async function processAdminReturn(
  returnId: string,
  orderId: string,
  userId: string,
  status: ReturnRequest['status'],
): Promise<ApiResponse<void>> {
  try {
    await updateReturnStatusInDB(returnId, orderId, userId, status);
    return { success: true, message: `Return request transitioned to ${status}.` };
  } catch (error) {
    console.error('[adminService.processAdminReturn] error:', error);
    return { success: false, error: 'Failed to process return request state.' };
  }
}

// ── Promotions ──────────────────────────────────────────────────────────────
export async function fetchAdminPromotions(): Promise<ApiResponse<Promotion[]>> {
  try {
    const promotions = await getPromotionsFromDB();
    return { success: true, data: promotions };
  } catch (error) {
    console.error('[adminService.fetchAdminPromotions] error:', error);
    return { success: false, error: 'Failed to load promotions.' };
  }
}

export async function saveAdminPromotion(promo: Promotion): Promise<ApiResponse<void>> {
  try {
    if (!promo.code || !promo.discountValue) {
      return { success: false, error: 'Promo code and discount value are required.' };
    }
    await savePromotionInDB(promo);
    return { success: true, message: 'Promotion saved successfully.' };
  } catch (error) {
    console.error('[adminService.saveAdminPromotion] error:', error);
    return { success: false, error: 'Failed to save promotion.' };
  }
}

export async function deleteAdminPromotion(promoId: string): Promise<ApiResponse<void>> {
  try {
    await deletePromotionInDB(promoId);
    return { success: true, message: 'Promotion deleted.' };
  } catch (error) {
    console.error('[adminService.deleteAdminPromotion] error:', error);
    return { success: false, error: 'Failed to delete promotion.' };
  }
}

// ── Platform Settings ───────────────────────────────────────────────────────
export async function fetchAdminSettings(): Promise<ApiResponse<PlatformSettings>> {
  try {
    const settings = await getPlatformSettingsFromDB();
    return { success: true, data: settings };
  } catch (error) {
    console.error('[adminService.fetchAdminSettings] error:', error);
    return { success: false, error: 'Failed to load platform settings.' };
  }
}

export async function saveAdminSettings(settings: PlatformSettings): Promise<ApiResponse<void>> {
  try {
    await savePlatformSettingsInDB(settings);
    return { success: true, message: 'Platform settings saved successfully.' };
  } catch (error) {
    console.error('[adminService.saveAdminSettings] error:', error);
    return { success: false, error: 'Failed to save settings.' };
  }
}

// ── Analytics & Reporting Metrics ───────────────────────────────────────────
export interface PlatformAnalyticsData {
  gmv: number;
  totalOrders: number;
  avgOrderValue: number;
  statusBreakdown: Record<string, number>;
  categoryBreakdown: { category: string; count: number; value: number }[];
  topSellingProducts: { id: string; title: string; unitsSold: number; revenue: number }[];
  userRoleDistribution: { role: string; count: number }[];
}

export async function fetchPlatformAnalytics(): Promise<ApiResponse<PlatformAnalyticsData>> {
  try {
    const [users, products, orders, categories] = await Promise.all([
      getAllUsersFromDB(),
      getAllProducts(),
      getAllOrdersFromDB(),
      getAllCategories(),
    ]);

    const nonCancelledOrders = orders.filter((o) => o.status !== 'cancelled');
    const gmv = nonCancelledOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const avgOrderValue = nonCancelledOrders.length > 0 ? gmv / nonCancelledOrders.length : 0;

    // Order status breakdown
    const statusBreakdown: Record<string, number> = {};
    orders.forEach((o) => {
      statusBreakdown[o.status] = (statusBreakdown[o.status] || 0) + 1;
    });

    // Top selling products & Category breakdown
    const productSalesMap: Record<string, { title: string; unitsSold: number; revenue: number }> = {};
    const catValueMap: Record<string, { count: number; value: number }> = {};

    categories.forEach((cat) => {
      catValueMap[cat.slug] = { count: 0, value: 0 };
    });

    products.forEach((p) => {
      if (catValueMap[p.category]) {
        catValueMap[p.category].count += 1;
      }
    });

    nonCancelledOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (!productSalesMap[item.productId]) {
          productSalesMap[item.productId] = {
            title: item.title,
            unitsSold: 0,
            revenue: 0,
          };
        }
        productSalesMap[item.productId].unitsSold += item.quantity;
        productSalesMap[item.productId].revenue += item.subtotal;
      });
    });

    const topSellingProducts = Object.entries(productSalesMap)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 6);

    const categoryBreakdown = Object.entries(catValueMap).map(([slug, data]) => {
      const cat = categories.find((c) => c.slug === slug);
      return {
        category: cat?.name || slug,
        count: data.count,
        value: Number(data.value.toFixed(2)),
      };
    });

    // User roles
    const userRoleDistribution = [
      { role: 'Customers', count: users.filter((u) => u.role === 'customer').length },
      { role: 'Sellers', count: users.filter((u) => u.role === 'seller').length },
      { role: 'Admins', count: users.filter((u) => u.role === 'admin').length },
    ];

    return {
      success: true,
      data: {
        gmv: Number(gmv.toFixed(2)),
        totalOrders: orders.length,
        avgOrderValue: Number(avgOrderValue.toFixed(2)),
        statusBreakdown,
        categoryBreakdown,
        topSellingProducts,
        userRoleDistribution,
      },
    };
  } catch (error) {
    console.error('[adminService.fetchPlatformAnalytics] error:', error);
    return { success: false, error: 'Failed to aggregate platform analytics.' };
  }
}

// ── Hero Banners & Promotional Offers Re-exports ───────────────────────────
export {
  fetchHeroBanners,
  saveHeroBanner,
  deleteHeroBanner,
  reorderHeroBanners,
  uploadHeroBannerImage,
} from './bannerService';

