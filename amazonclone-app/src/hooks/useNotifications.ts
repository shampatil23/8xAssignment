'use client';
// ============================================================================
// useNotifications — convenient hook to access real-time notifications & badge
// ============================================================================
import { useNotificationContext } from '@/context/NotificationContext';

export function useNotifications() {
  return useNotificationContext();
}
