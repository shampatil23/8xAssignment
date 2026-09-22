'use client';
// ============================================================================
// Header — Amazon-style top header bar
// Logo | Location | SearchBar | Language | Account | Returns | Cart
// ============================================================================
import React from 'react';
import Link from 'next/link';
import { MapPin, Globe, ChevronDown, ShoppingCart, Bell } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { NavBar } from './NavBar';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useLocation } from '@/context/LocationContext';

export function Header() {
  const { itemCount } = useCart();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const { country, postalCode, selectedAddress, openLocationModal } = useLocation();

  const firstName = user?.displayName?.split(' ')[0] ?? null;

  return (
    <header className="sticky top-0 z-30 w-full shadow-md">
      {/* ── Top bar ── */}
      <div className="bg-amazon-dark flex items-center gap-2 px-3 py-2 md:px-4">

        {/* Logo */}
        <Link
          href="/"
          id="header-logo"
          className="flex flex-shrink-0 items-center gap-0.5 px-2 py-1 rounded hover:ring-1 hover:ring-white transition-all"
        >
          <span className="font-extrabold text-white text-xl tracking-tight leading-none">
            amazon<span className="text-amazon-orange">.</span>
            <span className="text-xs align-super">clone</span>
          </span>
        </Link>

        {/* Deliver to (hidden on xs) */}
        <button
          type="button"
          onClick={openLocationModal}
          id="header-location"
          className="hidden sm:flex flex-col flex-shrink-0 px-2 py-1 rounded hover:ring-1 hover:ring-white transition-all text-left cursor-pointer"
          title="Change delivery location"
        >
          <span className="text-gray-300 text-[10px] leading-tight truncate max-w-[130px]">
            {selectedAddress ? `Deliver to ${selectedAddress.fullName.split(' ')[0]}` : 'Deliver to'}
          </span>
          <span className="text-white text-xs font-bold flex items-center gap-0.5 truncate max-w-[130px]">
            <MapPin size={11} className="text-white shrink-0" />
            <span className="truncate">{selectedAddress ? `${selectedAddress.city} ${postalCode || ''}` : country.name}</span>
          </span>
        </button>

        {/* Search bar — takes remaining space */}
        <div className="flex-1 min-w-0">
          <React.Suspense fallback={<div className="h-10 w-full bg-white rounded" />}>
            <SearchBar />
          </React.Suspense>
        </div>

        {/* Language & Currency selector */}
        <button
          id="header-language-btn"
          type="button"
          onClick={openLocationModal}
          className="hidden md:flex flex-col flex-shrink-0 items-start px-2 py-1 rounded hover:ring-1 hover:ring-white transition-all cursor-pointer text-left"
          aria-label="Change currency and location"
          title={`Active currency: ${country.name} (${country.currency} - ${country.symbol})`}
        >
          <span className="text-gray-300 text-[9px] leading-none uppercase">{country.currency}</span>
          <span className="text-white text-xs font-bold flex items-center gap-0.5">
            <span className="mr-0.5 text-[11px]">{country.flag}</span>
            <span>{country.symbol}</span>
            <ChevronDown size={10} />
          </span>
        </button>

        {/* Account */}
        <Link
          href={user ? '/account' : '/auth/sign-in'}
          id="header-account-link"
          className="flex flex-col flex-shrink-0 px-2 py-1 rounded hover:ring-1 hover:ring-white transition-all"
        >
          <span className="text-gray-300 text-[10px] leading-tight">
            {firstName ? `Hello, ${firstName}` : 'Hello, sign in'}
          </span>
          <span className="text-white text-xs font-bold flex items-center gap-0.5">
            Account &amp; Lists <ChevronDown size={10} />
          </span>
        </Link>

        {/* Returns & Orders (hidden on mobile) */}
        <Link
          href="/orders"
          id="header-orders-link"
          className="hidden sm:flex flex-col flex-shrink-0 px-2 py-1 rounded hover:ring-1 hover:ring-white transition-all"
        >
          <span className="text-gray-300 text-[10px] leading-tight">Returns</span>
          <span className="text-white text-xs font-bold">&amp; Orders</span>
        </Link>

        {/* Notifications */}
        {user && (
          <Link
            href="/account/notifications"
            id="header-notifications-link"
            className="flex flex-col items-center justify-center flex-shrink-0 px-2 py-1 rounded hover:ring-1 hover:ring-white transition-all relative text-white"
            title="Notifications & Alerts"
            aria-label={`Notifications, ${unreadCount} unread`}
          >
            <div className="relative">
              <Bell size={20} className="text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-[16px] h-[16px] px-1 flex items-center justify-center rounded-full bg-amazon-orange text-[10px] font-bold text-white shadow-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>
            <span className="text-[10px] text-gray-300 leading-none mt-0.5 hidden md:block">
              Alerts
            </span>
          </Link>
        )}

        {/* Cart */}
        <Link
          href="/cart"
          id="header-cart-link"
          className="flex flex-shrink-0 items-end gap-1 px-2 py-1 rounded hover:ring-1 hover:ring-white transition-all"
          aria-label={`Shopping cart, ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
        >
          <div className="relative">
            <ShoppingCart size={28} className="text-white" />
            <span
              className="
                absolute -top-1 left-4
                min-w-[18px] h-[18px] px-0.5
                flex items-center justify-center
                rounded-full bg-amazon-orange
                text-[11px] font-bold text-white
              "
            >
              {itemCount}
            </span>
          </div>
          <span className="hidden sm:block text-white text-xs font-bold pb-0.5">Cart</span>
        </Link>
      </div>

      {/* ── Nav bar ── */}
      <NavBar />
    </header>
  );
}
