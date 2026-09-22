'use client';
// ============================================================================
// Your Account Hub — Amazon Clone Customer Account Dashboard
// ============================================================================
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  ShieldCheck,
  MapPin,
  Heart,
  RotateCcw,
  Bell,
  HelpCircle,
  UserCheck,
  Store,
  Sliders,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/Button';
import { setUserRole } from '@/lib/firebase/database';

export default function AccountPage() {
  const { user, signOut, isSeller, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/auth/sign-in');
  }

  const roleBadgeColor = {
    customer: 'bg-blue-100 text-blue-800 border-blue-200',
    seller: 'bg-amber-100 text-amber-800 border-amber-200',
    admin: 'bg-[#131921] text-white border-gray-700',
  }[user?.role ?? 'customer'];

  const accountCards = [
    {
      title: 'Your Orders',
      description: 'Track, return, cancel orders, or buy things again',
      icon: <Package className="h-8 w-8 text-amazon-orange" />,
      href: '/orders',
    },
    {
      title: 'Login & Security',
      description: 'Edit name, mobile number, email, and password',
      icon: <ShieldCheck className="h-8 w-8 text-amazon-orange" />,
      href: '/account/security',
    },
    {
      title: 'Your Addresses',
      description: 'Edit delivery addresses for orders and gifts',
      icon: <MapPin className="h-8 w-8 text-amazon-orange" />,
      href: '/account/addresses',
    },
    {
      title: 'Your Wishlist',
      description: 'View saved items, move items to cart, or remove',
      icon: <Heart className="h-8 w-8 text-amazon-orange" />,
      href: '/wishlist',
    },
    {
      title: 'Returns & Refunds',
      description: 'Track return requests, inspection, and refund status',
      icon: <RotateCcw className="h-8 w-8 text-amazon-orange" />,
      href: '/orders?tab=returns',
    },
    {
      title: 'Message Center',
      description: 'View alerts, order progress, and system updates',
      icon: (
        <div className="relative">
          <Bell className="h-8 w-8 text-amazon-orange" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amazon-orange text-[10px] font-bold text-white shadow-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      ),
      href: '/account/notifications',
      badge: unreadCount > 0 ? `${unreadCount} new` : undefined,
    },
    {
      title: 'Customer Service & Help',
      description: 'Browse FAQs, submit inquiries, and track ticket status',
      icon: <HelpCircle className="h-8 w-8 text-amazon-orange" />,
      href: '/help',
    },
    {
      title: 'Profile & Preferences',
      description: 'Manage profile picture, display name, and preferences',
      icon: <UserCheck className="h-8 w-8 text-amazon-orange" />,
      href: '/account/profile',
    },
    ...(isSeller || isAdmin
      ? [
          {
            title: 'Seller Portal',
            description: 'Manage your catalog, inventory, and order fulfillments',
            icon: <Store className="h-8 w-8 text-amazon-orange" />,
            href: '/seller',
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            title: 'Admin Central',
            description: 'Platform management, users, catalog, reviews & analytics',
            icon: <Sliders className="h-8 w-8 text-amazon-orange" />,
            href: '/admin',
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header banner */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-600 border border-gray-200 overflow-hidden">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Account'}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon size={32} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.displayName || 'Your Account'}
              </h1>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${roleBadgeColor}`}
              >
                {user?.role ?? 'customer'}
              </span>

              {/* Development Role Switcher */}
              <select
                value={user?.role ?? 'customer'}
                onChange={async (e) => {
                  if (!user) return;
                  const newRole = e.target.value as 'customer' | 'seller' | 'admin';
                  await setUserRole(user.uid, newRole);
                  window.location.reload();
                }}
                className="text-[11px] font-bold rounded border border-gray-300 bg-white px-2 py-1 text-gray-700 hover:border-gray-400 focus:outline-hidden cursor-pointer"
                title="Switch role for testing"
              >
                <option value="customer">Role: Customer</option>
                <option value="seller">Role: Seller</option>
                <option value="admin">Role: Admin</option>
              </select>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {user?.email}
              {user?.phoneNumber && <span className="ml-2">| {user.phoneNumber}</span>}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="flex items-center gap-2 self-start sm:self-auto cursor-pointer text-gray-700 hover:bg-gray-100"
        >
          <LogOut size={16} />
          Sign out
        </Button>
      </div>

      {/* Grid of account cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {accountCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-xs transition-all hover:bg-gray-50 hover:shadow-md hover:border-gray-300 relative group"
          >
            <div className="flex-shrink-0">{card.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900 group-hover:text-amazon-link transition-colors">
                  {card.title}
                </h2>
                {card.badge && (
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">
                    {card.badge}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                {card.description}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Seller Onboarding Banner (for customer accounts) ── */}
      {user?.role === 'customer' && (
        <div className="mt-10 rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Store className="h-8 w-8 text-amazon-orange flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Start Selling on Amazon Clone
              </h3>
              <p className="text-xs text-gray-600 mt-1 max-w-xl">
                Become a registered merchant partner today. Submit your business credentials, list products, manage inventory in real time, and reach millions of shoppers.
              </p>
            </div>
          </div>

          <Link
            href="/sell"
            className="inline-flex items-center rounded bg-amazon-yellow hover:bg-amazon-yellow-hover px-5 py-2.5 text-xs font-bold text-gray-900 whitespace-nowrap shadow-xs transition-all"
          >
            Open Seller Portal &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
