'use client';
// ============================================================================
// Account Hub page
// ============================================================================
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  ShieldCheck,
  MapPin,
  Store,
  Sliders,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

export default function AccountPage() {
  const { user, signOut, isSeller, isAdmin } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/auth/sign-in');
  }

  const roleBadgeColor = {
    customer: 'bg-blue-100 text-blue-800 border-blue-200',
    seller: 'bg-amber-100 text-amber-800 border-amber-200',
    admin: 'bg-purple-100 text-purple-800 border-purple-200',
  }[user?.role ?? 'customer'];

  const accountCards = [
    {
      title: 'Your Orders',
      description: 'Track, return, or buy things again',
      icon: <Package className="h-8 w-8 text-amazon-orange" />,
      href: '/orders',
    },
    {
      title: 'Login & Security',
      description: 'Edit name, mobile number, and password',
      icon: <ShieldCheck className="h-8 w-8 text-amazon-orange" />,
      href: '#',
    },
    {
      title: 'Your Addresses',
      description: 'Edit addresses for orders and gifts',
      icon: <MapPin className="h-8 w-8 text-amazon-orange" />,
      href: '#',
    },
    ...(isSeller || isAdmin
      ? [
          {
            title: 'Seller Portal',
            description: 'Manage your inventory, listings, and orders',
            icon: <Store className="h-8 w-8 text-amazon-orange" />,
            href: '/seller',
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            title: 'Admin Dashboard',
            description: 'Platform management, users, analytics',
            icon: <Sliders className="h-8 w-8 text-amazon-orange" />,
            href: '/admin',
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header banner */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-600 border border-gray-200">
            <UserIcon size={32} />
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
            </div>
            <p className="text-sm text-gray-500">{user?.email}</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
          className="flex items-center gap-2 self-start sm:self-auto"
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
            className="flex items-start gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-all hover:bg-gray-50 hover:shadow-md"
          >
            <div className="flex-shrink-0">{card.icon}</div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">{card.title}</h2>
              <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                {card.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
