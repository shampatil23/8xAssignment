// ============================================================================
// Order Service — Order Retrieval, Cancellation, and Status Updates
// ============================================================================
import type { Order, ApiResponse, PaginatedResponse } from '@/types';
import {
  getUserOrdersFromDB,
  getOrder,
  updateOrderStatusInDB,
} from '@/lib/firebase/database';

export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    return await getOrder(orderId);
  } catch (error) {
    console.error('[orderService.getOrderById] error:', error);
    return null;
  }
}

export async function getUserOrders(
  userId: string,
  page = 1,
  pageSize = 10,
): Promise<PaginatedResponse<Order>> {
  try {
    const all = await getUserOrdersFromDB(userId);
    const start = (page - 1) * pageSize;
    const paginated = all.slice(start, start + pageSize);

    return {
      data: paginated,
      total: all.length,
      page,
      pageSize,
      hasMore: start + pageSize < all.length,
    };
  } catch (error) {
    console.error('[orderService.getUserOrders] error:', error);
    return { data: [], total: 0, page, pageSize, hasMore: false };
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
): Promise<ApiResponse<Order>> {
  try {
    await updateOrderStatusInDB(orderId, status);
    const updated = await getOrder(orderId);
    return {
      success: true,
      data: updated || undefined,
      message: `Order status updated to ${status}`,
    };
  } catch (error) {
    console.error('[orderService.updateOrderStatus] error:', error);
    return { success: false, error: 'Failed to update order status.' };
  }
}

export async function cancelOrder(orderId: string): Promise<ApiResponse<void>> {
  try {
    const order = await getOrder(orderId);
    if (!order) return { success: false, error: 'Order not found.' };

    if (order.status === 'delivered' || order.status === 'shipped') {
      return {
        success: false,
        error: 'Shipped or delivered orders cannot be cancelled directly. Please initiate a return request instead.',
      };
    }

    await updateOrderStatusInDB(orderId, 'cancelled');
    return {
      success: true,
      message: 'Order has been cancelled.',
    };
  } catch (error) {
    console.error('[orderService.cancelOrder] error:', error);
    return { success: false, error: 'Failed to cancel order.' };
  }
}
