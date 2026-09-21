// ============================================================================
// Return & Refund Service — Customer Returns and Refund Lifecycle
// ============================================================================
import type { Order, OrderItem, ReturnRequest, ApiResponse } from '@/types';
import {
  saveReturnRequest,
  getReturnRequestsByUser,
  getReturnRequestsByOrder,
  updateReturnStatusInDB,
} from '@/lib/firebase/database';

export const RETURN_REASONS = [
  'Damaged or defective item',
  'Wrong item was sent',
  'Item not as described or pictured',
  'Arrived too late',
  'Better price available',
  'No longer needed / Ordered by mistake',
] as const;

export function checkReturnEligibility(
  order: Order,
  productId: string,
): { isEligible: boolean; reason?: string } {
  // Ineligible statuses
  if (order.status === 'cancelled') {
    return { isEligible: false, reason: 'Cancelled orders cannot be returned.' };
  }
  if (order.status === 'REFUNDED' || order.status === 'refunded') {
    return { isEligible: false, reason: 'This order has already been refunded.' };
  }

  // 30-day return policy check
  const orderDate = new Date(order.createdAt).getTime();
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  if (Date.now() - orderDate > thirtyDaysMs) {
    return {
      isEligible: false,
      reason: 'The 30-day return window for this order has expired.',
    };
  }

  // Check product is actually in the order
  const item = order.items.find((i) => i.productId === productId);
  if (!item) {
    return {
      isEligible: false,
      reason: 'Specified product does not belong to this order.',
    };
  }

  return { isEligible: true };
}

export async function createCustomerReturn(
  userId: string,
  data: {
    order: Order;
    item: OrderItem;
    reason: string;
    quantity: number;
    note?: string;
  },
): Promise<ApiResponse<ReturnRequest>> {
  const eligibility = checkReturnEligibility(data.order, data.item.productId);
  if (!eligibility.isEligible) {
    return { success: false, error: eligibility.reason };
  }

  if (!data.reason || data.reason.trim().length === 0) {
    return { success: false, error: 'Please select a reason for your return.' };
  }

  try {
    const returnId = `ret-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const refundAmount = Number((data.item.price * data.quantity).toFixed(2));

    const newReturn: ReturnRequest = {
      id: returnId,
      orderId: data.order.id,
      userId,
      productId: data.item.productId,
      itemTitle: data.item.title,
      itemImage: data.item.image,
      quantity: data.quantity,
      refundAmount,
      reason: data.reason,
      note: data.note?.trim(),
      status: 'RETURN_REQUESTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveReturnRequest(newReturn);

    return {
      success: true,
      data: newReturn,
      message: 'Your return request has been submitted.',
    };
  } catch (error) {
    console.error('[returnService.createCustomerReturn] error:', error);
    return {
      success: false,
      error: 'Failed to submit return request.',
    };
  }
}

export async function fetchUserReturns(userId: string): Promise<ReturnRequest[]> {
  try {
    return await getReturnRequestsByUser(userId);
  } catch (error) {
    console.error('[returnService.fetchUserReturns] error:', error);
    return [];
  }
}

export async function fetchOrderReturns(orderId: string): Promise<ReturnRequest[]> {
  try {
    return await getReturnRequestsByOrder(orderId);
  } catch (error) {
    console.error('[returnService.fetchOrderReturns] error:', error);
    return [];
  }
}

/**
 * Progress return / refund lifecycle for demo evaluation:
 * RETURN_REQUESTED → RETURN_APPROVED → RETURNED → REFUND_PENDING → REFUNDED
 */
export async function progressReturnState(
  returnId: string,
  orderId: string,
  userId: string,
  nextStatus: ReturnRequest['status'],
): Promise<ApiResponse<void>> {
  try {
    await updateReturnStatusInDB(returnId, orderId, userId, nextStatus);
    return {
      success: true,
      message: `Return status updated to ${nextStatus}`,
    };
  } catch (error) {
    console.error('[returnService.progressReturnState] error:', error);
    return {
      success: false,
      error: 'Failed to update return status.',
    };
  }
}
