'use client';
// ============================================================================
// Customer Message Center & Notifications — /account/notifications
// ============================================================================
import React, { useState } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ArrowLeft,
  Bell,
  Package,
  RotateCcw,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { sendSystemNotification } from '@/services/notificationService';
import type { NotificationType } from '@/types';

export default function AccountNotificationsPage() {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState<'all' | 'order' | 'return' | 'promotion' | 'unread'>('all');
  const [testSending, setTestSending] = useState(false);

  // Filtered list
  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notif.read;
    if (activeTab === 'order') return notif.type === 'order';
    if (activeTab === 'return') return notif.type === 'return';
    if (activeTab === 'promotion') return notif.type === 'promotion' || notif.type === 'system';
    return true;
  });

  const getNotifIcon = (type: NotificationType) => {
    switch (type) {
      case 'order':
        return <Package className="h-5 w-5 text-blue-600" />;
      case 'return':
        return <RotateCcw className="h-5 w-5 text-amber-600" />;
      case 'promotion':
        return <Tag className="h-5 w-5 text-green-600" />;
      case 'security':
        return <ShieldCheck className="h-5 w-5 text-purple-600" />;
      case 'system':
      default:
        return <Bell className="h-5 w-5 text-amazon-orange" />;
    }
  };

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin} min ago`;
      if (diffMin < 1440) return `${Math.floor(diffMin / 60)} hours ago`;
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const handleSendTestNotification = async () => {
    if (!user) return;
    setTestSending(true);
    await sendSystemNotification(user.uid, {
      title: 'Deal Alert: 25% Off Electronics Today!',
      message: 'Exclusive limited-time discount voucher applied to your customer account.',
      type: 'promotion',
      link: '/deals',
    });
    setTestSending(false);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-gray-500">
        <Link href="/account" className="hover:text-amazon-link hover:underline">
          Your Account
        </Link>
        <ChevronRight size={12} />
        <span className="font-semibold text-gray-800">Message Center &amp; Notifications</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Message Center</h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-amazon-orange px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time delivery progress, return tracking, and promotional notifications.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSendTestNotification}
            disabled={testSending}
            className="flex items-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 shadow-xs cursor-pointer"
            title="Dispatch a test notification to test real-time alerts"
          >
            <Sparkles size={13} className="text-amazon-orange" />
            <span>{testSending ? 'Sending...' : 'Send Test Alert'}</span>
          </button>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 rounded bg-amazon-yellow px-3 py-1.5 text-xs font-bold text-gray-900 hover:bg-amazon-yellow-hover shadow-xs cursor-pointer"
            >
              <CheckCircle2 size={14} />
              <span>Mark all as read</span>
            </button>
          )}

          <Link
            href="/account"
            className="text-xs text-amazon-link hover:underline flex items-center gap-1"
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-2 mb-6 overflow-x-auto scrollbar-hide text-xs">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`rounded-full px-3.5 py-1.5 font-bold transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-amazon-dark text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('unread')}
          className={`rounded-full px-3.5 py-1.5 font-bold transition-all cursor-pointer ${
            activeTab === 'unread'
              ? 'bg-amazon-dark text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('order')}
          className={`rounded-full px-3.5 py-1.5 font-bold transition-all cursor-pointer ${
            activeTab === 'order'
              ? 'bg-amazon-dark text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Orders ({notifications.filter((n) => n.type === 'order').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('return')}
          className={`rounded-full px-3.5 py-1.5 font-bold transition-all cursor-pointer ${
            activeTab === 'return'
              ? 'bg-amazon-dark text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Returns ({notifications.filter((n) => n.type === 'return').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('promotion')}
          className={`rounded-full px-3.5 py-1.5 font-bold transition-all cursor-pointer ${
            activeTab === 'promotion'
              ? 'bg-amazon-dark text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Promotions &amp; System ({notifications.filter((n) => n.type === 'promotion' || n.type === 'system').length})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 px-4 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 text-amazon-orange">
            <Bell size={32} />
          </div>
          <h2 className="text-base font-bold text-gray-900">
            {activeTab === 'unread' ? 'No unread messages' : 'You have no messages right now'}
          </h2>
          <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
            When you place orders, request returns, or receive exclusive offers, they will appear here in your message center.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              href="/"
              className="rounded bg-amazon-yellow px-5 py-2 text-xs font-bold text-gray-900 hover:bg-amazon-yellow-hover shadow-xs"
            >
              Continue Shopping
            </Link>
            <button
              type="button"
              onClick={handleSendTestNotification}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs"
            >
              Trigger Test Alert
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              className={`rounded-lg border p-4 transition-all flex items-start gap-4 ${
                !notif.read
                  ? 'border-amazon-orange/30 bg-orange-50/20 shadow-xs ring-1 ring-amazon-orange/10'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Type Icon */}
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 border border-gray-200 mt-0.5">
                {getNotifIcon(notif.type)}
              </div>

              {/* Message Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    {!notif.read && (
                      <span
                        className="h-2 w-2 rounded-full bg-amazon-orange flex-shrink-0"
                        title="Unread"
                      />
                    )}
                    <span>{notif.title}</span>
                  </h2>
                  <span className="text-[11px] text-gray-400 whitespace-nowrap flex-shrink-0">
                    {formatTimestamp(notif.createdAt)}
                  </span>
                </div>

                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {notif.message}
                </p>

                {/* Actions */}
                <div className="mt-3 flex items-center gap-3">
                  {notif.link && (
                    <Link
                      href={notif.link}
                      onClick={() => !notif.read && markAsRead(notif.id)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-amazon-link hover:underline"
                    >
                      <span>View details</span>
                      <ExternalLink size={11} />
                    </Link>
                  )}

                  {!notif.read && (
                    <button
                      type="button"
                      onClick={() => markAsRead(notif.id)}
                      className="text-xs text-gray-500 hover:text-gray-800 hover:underline cursor-pointer"
                    >
                      Mark as read
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteNotification(notif.id)}
                    className="text-xs text-gray-400 hover:text-red-600 ml-auto p-1 cursor-pointer"
                    title="Delete message"
                    aria-label="Delete message"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
