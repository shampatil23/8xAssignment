// ============================================================================
// Seller Service — Seller Central Catalog, Inventory, Fulfillment & Analytics
// Enforces seller data isolation and Amazon-compliant fulfillment lifecycles
// ============================================================================
import type {
  Product,
  Order,
  OrderItem,
  OrderStatus,
  ProductStatus,
  ApiResponse,
  SellerAnalyticsMetrics,
  SellerSettingsData,
} from '@/types';
import {
  getProductById,
  saveProduct,
  updateProduct,
  deleteProductFromDB,
  getProductsBySellerFromDB,
  getAllOrdersFromDB,
  getOrder,
  updateOrderStatusInDB,
  updateUserProfile,
  getUserProfile,
} from '@/lib/firebase/database';
import { slugify } from '@/lib/utils';

// Legal forward order fulfillment transitions
export const ALLOWED_STATUS_TRANSITIONS: Record<string, OrderStatus[]> = {
  placed: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['out_for_delivery', 'delivered'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
};

// ── Products Management ──────────────────────────────────────────────────

export async function fetchSellerProducts(sellerId: string): Promise<ApiResponse<Product[]>> {
  try {
    const products = await getProductsBySellerFromDB(sellerId);
    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error('[sellerService.fetchSellerProducts] error:', error);
    return {
      success: false,
      error: 'Failed to retrieve your product catalog.',
    };
  }
}

export async function fetchSellerProductById(
  sellerId: string,
  productId: string,
  isAdmin = false,
): Promise<ApiResponse<Product>> {
  try {
    const product = await getProductById(productId);
    if (!product) {
      return { success: false, error: 'Product not found.' };
    }

    const isOwner =
      product.sellerId === sellerId ||
      product.seller?.id === sellerId ||
      isAdmin;

    if (!isOwner) {
      return {
        success: false,
        error: 'Unauthorized: You do not have permission to access this product.',
      };
    }

    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error('[sellerService.fetchSellerProductById] error:', error);
    return { success: false, error: 'Failed to retrieve product details.' };
  }
}

export async function createSellerProduct(
  sellerId: string,
  sellerName: string,
  data: Partial<Product>,
): Promise<ApiResponse<Product>> {
  try {
    if (!data.title || data.title.trim().length === 0) {
      return { success: false, error: 'Product title is required.' };
    }
    if (typeof data.price !== 'number' || data.price <= 0) {
      return { success: false, error: 'Please enter a valid price greater than $0.' };
    }
    if (typeof data.stock !== 'number' || data.stock < 0) {
      return { success: false, error: 'Please enter a valid stock quantity (0 or greater).' };
    }
    if (!data.category || data.category.trim().length === 0) {
      return { success: false, error: 'Please select a product category.' };
    }

    const timestamp = Date.now();
    const id = `prod-seller-${timestamp}-${Math.random().toString(36).substring(2, 6)}`;
    const slug = `${slugify(data.title)}-${id.slice(-6)}`;
    const sku = data.sku?.trim() || `SKU-${timestamp.toString().slice(-6)}`;

    // Calculate discount percent if compareAtPrice is provided
    let discountPercent = 0;
    if (data.compareAtPrice && data.compareAtPrice > data.price) {
      discountPercent = Math.round(
        ((data.compareAtPrice - data.price) / data.compareAtPrice) * 100,
      );
    }

    // Check if seller account is pending admin verification
    const { getUserProfile } = await import('@/lib/firebase/database');
    const profile = await getUserProfile(sellerId);
    const isPendingSeller = profile?.accountStatus === 'pending';

    const initialStatus: ProductStatus = isPendingSeller
      ? 'draft'
      : (data.status || (data.stock <= 0 ? 'out_of_stock' : 'active'));

    const newProduct: Product = {
      id,
      sku,
      title: data.title.trim(),
      slug,
      description: data.description?.trim() || '',
      price: Number(data.price.toFixed(2)),
      compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice.toFixed(2)) : undefined,
      discountPercent,
      category: data.category,
      categoryName: data.categoryName,
      brand: data.brand?.trim() || sellerName,
      images: data.images && data.images.length > 0 ? data.images : [
        {
          url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
          alt: data.title.trim(),
          isPrimary: true,
        },
      ],
      variants: data.variants || [],
      stock: data.stock,
      status: initialStatus,
      rating: 5.0,
      reviewCount: 0,
      tags: data.tags || [data.category],
      features: data.features || [],
      specifications: data.specifications || {},
      deliveryInfo: data.deliveryInfo || {
        isFreeDelivery: true,
        estimatedDays: 2,
        fastestDeliveryDate: 'Tomorrow, 8 AM - 12 PM',
        standardDeliveryDate: 'In 2-3 business days',
      },
      seller: {
        id: sellerId,
        name: sellerName,
        rating: 4.8,
      },
      sellerId,
      sellerName,
      isPrimeEligible: data.isPrimeEligible ?? true,
      isFeatured: data.isFeatured ?? false,
      isBestSeller: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveProduct(newProduct);

    return {
      success: true,
      data: newProduct,
      message: isPendingSeller
        ? 'Product saved as draft! It will automatically be officially published once your seller account is verified by Admin.'
        : 'Product created and published to marketplace.',
    };
  } catch (error) {
    console.error('[sellerService.createSellerProduct] error:', error);
    return { success: false, error: 'Failed to create product listing.' };
  }
}

export async function updateSellerProduct(
  sellerId: string,
  productId: string,
  data: Partial<Product>,
  isAdmin = false,
): Promise<ApiResponse<void>> {
  try {
    const existingRes = await fetchSellerProductById(sellerId, productId, isAdmin);
    if (!existingRes.success || !existingRes.data) {
      return { success: false, error: existingRes.error || 'Product not found.' };
    }

    const updates: Partial<Product> = { ...data };

    // Recalculate discount if pricing changed
    const effectivePrice = typeof updates.price === 'number' ? updates.price : existingRes.data.price;
    const effectiveCompare = updates.compareAtPrice !== undefined ? updates.compareAtPrice : existingRes.data.compareAtPrice;
    if (effectiveCompare && effectiveCompare > effectivePrice) {
      updates.discountPercent = Math.round(((effectiveCompare - effectivePrice) / effectiveCompare) * 100);
    } else {
      updates.discountPercent = 0;
    }

    // Auto-update out-of-stock status if stock reaches 0
    if (typeof updates.stock === 'number') {
      if (updates.stock <= 0 && (!updates.status || updates.status === 'active')) {
        updates.status = 'out_of_stock';
      } else if (updates.stock > 0 && updates.status === 'out_of_stock') {
        updates.status = 'active';
      }
    }

    await updateProduct(productId, updates);

    return {
      success: true,
      message: 'Product updated successfully.',
    };
  } catch (error) {
    console.error('[sellerService.updateSellerProduct] error:', error);
    return { success: false, error: 'Failed to update product.' };
  }
}

export async function deleteSellerProduct(
  sellerId: string,
  productId: string,
  isAdmin = false,
): Promise<ApiResponse<void>> {
  try {
    const existingRes = await fetchSellerProductById(sellerId, productId, isAdmin);
    if (!existingRes.success || !existingRes.data) {
      return { success: false, error: existingRes.error || 'Product not found.' };
    }

    await deleteProductFromDB(productId);

    return {
      success: true,
      message: 'Product deleted from marketplace.',
    };
  } catch (error) {
    console.error('[sellerService.deleteSellerProduct] error:', error);
    return { success: false, error: 'Failed to delete product.' };
  }
}

export async function updateSellerStock(
  sellerId: string,
  productId: string,
  newStock: number,
  isAdmin = false,
): Promise<ApiResponse<void>> {
  if (newStock < 0) {
    return { success: false, error: 'Stock quantity cannot be negative.' };
  }

  const newStatus: ProductStatus = newStock === 0 ? 'out_of_stock' : 'active';
  return updateSellerProduct(sellerId, productId, { stock: newStock, status: newStatus }, isAdmin);
}

export async function toggleProductStatus(
  sellerId: string,
  productId: string,
  status: ProductStatus,
  isAdmin = false,
): Promise<ApiResponse<void>> {
  return updateSellerProduct(sellerId, productId, { status }, isAdmin);
}

// ── Orders & Fulfillment Management ──────────────────────────────────────

export interface SellerOrderRecord {
  order: Order;
  sellerItems: OrderItem[];
  sellerTotal: number;
}

export async function fetchSellerOrders(sellerId: string): Promise<ApiResponse<SellerOrderRecord[]>> {
  try {
    const allOrders = await getAllOrdersFromDB();
    const sellerProducts = await getProductsBySellerFromDB(sellerId);
    const sellerProductIds = new Set(sellerProducts.map((p) => p.id));

    const records: SellerOrderRecord[] = [];

    for (const order of allOrders) {
      // Find items in order that belong to this seller
      const matchingItems = order.items.filter(
        (item) =>
          item.sellerId === sellerId ||
          sellerProductIds.has(item.productId),
      );

      if (matchingItems.length > 0) {
        const sellerTotal = matchingItems.reduce((sum, i) => sum + i.subtotal, 0);
        records.push({
          order,
          sellerItems: matchingItems,
          sellerTotal,
        });
      }
    }

    return {
      success: true,
      data: records,
    };
  } catch (error) {
    console.error('[sellerService.fetchSellerOrders] error:', error);
    return {
      success: false,
      error: 'Failed to retrieve seller orders.',
    };
  }
}

export async function updateFulfillmentStatus(
  sellerId: string,
  orderId: string,
  nextStatus: OrderStatus,
  isAdmin = false,
): Promise<ApiResponse<void>> {
  try {
    const order = await getOrder(orderId);
    if (!order) {
      return { success: false, error: 'Order not found.' };
    }

    // Verify seller ownership of at least one item
    if (!isAdmin) {
      const sellerProducts = await getProductsBySellerFromDB(sellerId);
      const sellerProductIds = new Set(sellerProducts.map((p) => p.id));
      const hasSellerItem = order.items.some(
        (i) => i.sellerId === sellerId || sellerProductIds.has(i.productId),
      );
      if (!hasSellerItem) {
        return {
          success: false,
          error: 'Unauthorized: This order does not contain items from your store.',
        };
      }
    }

    // Validate legal status transition
    const currentStatus = order.status.toLowerCase();
    const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(nextStatus) && !isAdmin) {
      return {
        success: false,
        error: `Invalid status transition from "${order.status}" to "${nextStatus}". Allowed transitions: ${allowed.join(', ') || 'None'}.`,
      };
    }

    await updateOrderStatusInDB(orderId, nextStatus);

    return {
      success: true,
      message: `Order #${orderId} fulfillment status updated to ${nextStatus}.`,
    };
  } catch (error) {
    console.error('[sellerService.updateFulfillmentStatus] error:', error);
    return { success: false, error: 'Failed to update order fulfillment status.' };
  }
}

// ── Analytics ────────────────────────────────────────────────────────────

export async function fetchSellerAnalytics(
  sellerId: string,
): Promise<ApiResponse<SellerAnalyticsMetrics>> {
  try {
    const [products, ordersRes] = await Promise.all([
      getProductsBySellerFromDB(sellerId),
      fetchSellerOrders(sellerId),
    ]);

    const activeProducts = products.filter((p) => p.status === 'active').length;
    const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
    const outOfStockProducts = products.filter((p) => p.stock <= 0 || p.status === 'out_of_stock').length;

    const orders = ordersRes.data || [];
    const totalOrders = orders.length;

    let totalUnitsSold = 0;
    let totalRevenue = 0;
    let pendingOrdersCount = 0;

    const productSalesMap: Record<
      string,
      { title: string; image: string; units: number; revenue: number; stock: number }
    > = {};

    // Populate initial product list in sales map
    for (const p of products) {
      productSalesMap[p.id] = {
        title: p.title,
        image: p.images?.[0]?.url || '',
        units: 0,
        revenue: 0,
        stock: p.stock,
      };
    }

    for (const record of orders) {
      if (['placed', 'confirmed', 'processing'].includes(record.order.status.toLowerCase())) {
        pendingOrdersCount++;
      }

      for (const item of record.sellerItems) {
        totalUnitsSold += item.quantity;
        totalRevenue += item.subtotal;

        if (productSalesMap[item.productId]) {
          productSalesMap[item.productId].units += item.quantity;
          productSalesMap[item.productId].revenue += item.subtotal;
        } else {
          productSalesMap[item.productId] = {
            title: item.title,
            image: item.image,
            units: item.quantity,
            revenue: item.subtotal,
            stock: 0,
          };
        }
      }
    }

    const topProducts = Object.entries(productSalesMap)
      .map(([id, info]) => ({
        id,
        title: info.title,
        image: info.image,
        unitsSold: info.units,
        revenue: Number(info.revenue.toFixed(2)),
        stock: info.stock,
      }))
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, 5);

    return {
      success: true,
      data: {
        totalProducts: products.length,
        activeProducts,
        lowStockProducts,
        outOfStockProducts,
        totalOrders,
        totalUnitsSold,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        pendingOrdersCount,
        topProducts,
      },
    };
  } catch (error) {
    console.error('[sellerService.fetchSellerAnalytics] error:', error);
    return {
      success: false,
      error: 'Failed to compute seller analytics.',
    };
  }
}

// ── Seller Profile & Settings ────────────────────────────────────────────

export async function updateSellerSettings(
  sellerId: string,
  settings: SellerSettingsData,
): Promise<ApiResponse<void>> {
  try {
    await updateUserProfile(sellerId, {
      displayName: settings.storeName,
    });
    return {
      success: true,
      message: 'Store settings saved successfully.',
    };
  } catch (error) {
    console.error('[sellerService.updateSellerSettings] error:', error);
    return {
      success: false,
      error: 'Failed to update store settings.',
    };
  }
}
