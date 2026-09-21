// ============================================================================
// Order Service — business logic layer (stub, implemented in Phase 4)
// ============================================================================
import type { Order, ApiResponse, PaginatedResponse } from '@/types';

export async function createOrder(
  userId: string,
  data: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
): Promise<ApiResponse<Order>> {
  // TODO Phase 4: create order in Firestore, clear cart, send email
  console.log('[orderService] createOrder called', { userId, data });
  return { success: false, error: 'Not implemented yet' };
}

export async function getOrderById(
  orderId: string,
): Promise<Order | null> {
  // TODO Phase 4: fetch single order
  console.log('[orderService] getOrderById called', orderId);
  return null;
}

export async function getUserOrders(
  userId: string,
  page = 1,
  pageSize = 10,
): Promise<PaginatedResponse<Order>> {
  // TODO Phase 4: fetch paginated user orders
  console.log('[orderService] getUserOrders called', { userId, page, pageSize });
  return { data: [], total: 0, page, pageSize, hasMore: false };
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
): Promise<ApiResponse<Order>> {
  // TODO Phase 5 (admin): update order status
  console.log('[orderService] updateOrderStatus called', { orderId, status });
  return { success: false, error: 'Not implemented yet' };
}

export async function cancelOrder(orderId: string): Promise<ApiResponse> {
  // TODO Phase 4: cancel an order
  console.log('[orderService] cancelOrder called', orderId);
  return { success: false, error: 'Not implemented yet' };
}
