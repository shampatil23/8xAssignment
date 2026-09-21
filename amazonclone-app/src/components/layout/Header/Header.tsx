'use client';
// ============================================================================
// Header — Amazon-style top header bar
// Logo | Location | SearchBar | Language | Account | Returns | Cart
// ============================================================================
import React from 'react';
import Link from 'next/link';
import { MapPin, Globe, ChevronDown, ShoppingCart } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { NavBar } from './NavBar';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { itemCount } = useCart();
  const { user } = useAuth();

  const firstName = user?.displayName?.split(' ')[0] ?? null;

  return (
    <header className="sticky top-0 z-30 w-full shadow-md">
      {/* ── Top bar ── */}
      <div className="bg-amazon-dark flex items-center gap-2 px-3 py-2 md:px-4">

        {/* Logo */}
        <Link
          href="/"
          id="header-logo"
          className="flex-shrink-0 rounded p-1 hover:ring-1 hover:ring-white transition-all"
          aria-label="Amazon Clone home"
        >
          {/* Text logo — replace with SVG in production */}
          <span className="font-extrabold text-white text-xl tracking-tight leading-none">
            amazon<span className="text-amazon-orange">.</span>
            <span className="text-xs align-super">clone</span>
          </span>
        </Link>

        {/* Deliver to (hidden on xs) */}
        <Link
          href="/account/addresses"
          id="header-location"
          className="hidden sm:flex flex-col flex-shrink-0 px-2 py-1 rounded hover:ring-1 hover:ring-white transition-all"
        >
          <span className="text-gray-300 text-[10px] leading-tight">Deliver to</span>
          <span className="text-white text-xs font-bold flex items-center gap-0.5">
            <MapPin size={11} className="text-white" />
            India
          </span>
        </Link>

        {/* Search bar — takes remaining space */}
        <div className="flex-1 min-w-0">
          <SearchBar />
        </div>

        {/* Language selector (hidden on mobile) */}
        <button
          id="header-language-btn"
          className="hidden md:flex flex-col flex-shrink-0 items-start px-2 py-1 rounded hover:ring-1 hover:ring-white transition-all"
          aria-label="Change language"
        >
          <span className="text-white text-xs font-bold flex items-center gap-0.5">
            <Globe size={13} />
            EN <ChevronDown size={10} />
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
