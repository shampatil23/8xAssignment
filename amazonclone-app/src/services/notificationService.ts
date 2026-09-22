// ============================================================================
// Notification Service — Customer Notification Center & Real-time Alerts
// ============================================================================
import type { Notification, NotificationType, ApiResponse } from '@/types';
import {
  getUserNotifications,
  subscribeToUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotificationFromDB,
  createNotification,
} from '@/lib/firebase/database';

export async function fetchNotifications(userId: string): Promise<Notification[]> {
  try {
    return await getUserNotifications(userId);
  } catch (error) {
    console.error('[notificationService.fetchNotifications] error:', error);
    return [];
  }
}

export function subscribeNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void,
): () => void {
  return subscribeToUserNotifications(userId, callback);
}

export async function markAsRead(
  userId: string,
  notificationId: string,
): Promise<ApiResponse> {
  try {
    await markNotificationAsRead(userId, notificationId);
    return { success: true };
  } catch (error) {
    console.error('[notificationService.markAsRead] error:', error);
    return { success: false, error: 'Failed to mark notification as read.' };
  }
}

export async function markAllAsRead(userId: string): Promise<ApiResponse> {
  try {
    await markAllNotificationsAsRead(userId);
    return { success: true };
  } catch (error) {
    console.error('[notificationService.markAllAsRead] error:', error);
    return { success: false, error: 'Failed to mark all notifications as read.' };
  }
}

export async function removeNotification(
  userId: string,
  notificationId: string,
): Promise<ApiResponse> {
  try {
    await deleteNotificationFromDB(userId, notificationId);
    return { success: true };
  } catch (error) {
    console.error('[notificationService.removeNotification] error:', error);
    return { success: false, error: 'Failed to delete notification.' };
  }
}

export async function sendSystemNotification(
  userId: string,
  data: {
    title: string;
    message: string;
    type?: NotificationType;
    link?: string;
    orderId?: string;
  },
): Promise<ApiResponse<Notification>> {
  try {
    const notif = await createNotification(userId, {
      title: data.title,
      message: data.message,
      type: data.type || 'system',
      link: data.link,
      read: false,
      orderId: data.orderId,
    });
    return { success: true, data: notif };
  } catch (error) {
    console.error('[notificationService.sendSystemNotification] error:', error);
    return { success: false, error: 'Failed to dispatch notification.' };
  }
}
