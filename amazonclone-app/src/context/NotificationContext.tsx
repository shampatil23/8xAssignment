'use client';
// ============================================================================
// NotificationContext — Real-time customer notification state & badges
// ============================================================================
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Notification } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import {
  subscribeNotifications,
  markAsRead as markAsReadService,
  markAllAsRead as markAllAsReadService,
  removeNotification as removeNotificationService,
  fetchNotifications,
} from '@/services/notificationService';

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  loading: true,
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  refresh: async () => {},
});

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // Subscribe to real-time RTDB notifications for this user
    const unsubscribe = subscribeNotifications(user.uid, (data) => {
      setNotifications(data || []);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id: string) => {
    if (!user) return;
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    await markAsReadService(user.uid, id);
  };

  const markAllAsRead = async () => {
    if (!user) return;
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await markAllAsReadService(user.uid);
  };

  const deleteNotification = async (id: string) => {
    if (!user) return;
    // Optimistic update
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    await removeNotificationService(user.uid, id);
  };

  const refresh = async () => {
    if (!user) return;
    const data = await fetchNotifications(user.uid);
    setNotifications(data);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  return useContext(NotificationContext);
}
