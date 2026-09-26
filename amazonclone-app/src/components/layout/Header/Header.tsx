'use client';
// ============================================================================
// Header — Valenza Haute Maison — Premium Luxury Navigation Bar
// Inspired by: Cartier, Hermès, Patek Philippe, LVMH
// ============================================================================
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Sun, Moon, User, Bell, Menu } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { MobileMenu } from './MobileMenu';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { useLocation } from '@/context/LocationContext';
import { useTheme } from '@/context/ThemeContext';

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { itemCount } = useCart();
  const { user, firebaseUser } = useAuth();
  const { unreadCount } = useNotifications();
  const { openLocationModal } = useLocation();

  const displayNameSource = user?.displayName || firebaseUser?.displayName || null;
  const firstName = displayNameSource?.split(' ')[0] ?? null;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? 'shadow-[0_2px_28px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.55)]'
            : 'shadow-none'
        }`}
      >
        {/* ── Thin gold accent bar at very top ── */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#c5a059] to-transparent opacity-70 dark:opacity-50" />

        {/* ── Main luxury navbar ── */}
        <div className="bg-[#fdfcf9]/97 dark:bg-[#090b12]/97 backdrop-blur-2xl border-b border-[#ede6d6]/60 dark:border-[#1f1a10]/60 px-4 sm:px-6 lg:px-10 py-3 transition-colors duration-300">
          <div className="max-w-[1680px] mx-auto flex items-center gap-4 md:gap-6 lg:gap-8">

            {/* ── Left: Hamburger Icon + Brand Logo ── */}
            <div className="flex items-center gap-4 shrink-0">
              {/* Hamburger Menu — 3 bars ONLY, no text */}
              <button
                id="header-departments-btn"
                type="button"
                onClick={() => setMenuOpen(true)}
                className="flex flex-col gap-[5px] p-2.5 rounded-lg hover:bg-[#f3ede0]/70 dark:hover:bg-[#1c1810]/70 text-[#7a591e] dark:text-[#dfba73] transition-all cursor-pointer group"
                aria-label="Open navigation menu"
              >
                <span className="block w-5 h-[1.5px] bg-current rounded-full transition-all group-hover:w-4" />
                <span className="block w-5 h-[1.5px] bg-current rounded-full" />
                <span className="block w-5 h-[1.5px] bg-current rounded-full transition-all group-hover:w-4" />
              </button>

              {/* Brand Logo — Inspired by Cartier/Hermès minimal wordmark */}
              <Link
                href="/"
                id="header-logo"
                className="flex items-center gap-3 group"
              >
                {/* Monogram Crest — Clean circular emblem */}
                <div className="relative flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[#c5a059] via-[#d6b870] to-[#9b7832] shadow-[0_2px_10px_rgba(197,160,89,0.3)] group-hover:shadow-[0_4px_18px_rgba(197,160,89,0.5)] transition-all shrink-0">
                  <span className="font-serif font-bold text-[#0d0a06] text-base tracking-wide select-none">V</span>
                </div>

                {/* Wordmark — Large, refined, Cinzel-style */}
                <div className="flex flex-col -gap-0.5">
                  <span
                    className="font-serif tracking-[0.32em] uppercase font-bold leading-none text-[#141312] dark:text-[#f5f0e8]"
                    style={{ fontSize: '18px', letterSpacing: '0.3em' }}
                  >
                    VALENZA
                  </span>
                  <span
                    className="font-sans tracking-[0.45em] uppercase text-[#9b7832] dark:text-[#c5a059] font-medium leading-tight"
                    style={{ fontSize: '7px', letterSpacing: '0.48em' }}
                  >
                    HAUTE MAISON
                  </span>
                </div>
              </Link>
            </div>

            {/* ── Center: Search Bar ── */}
            <div className="flex-1 min-w-0 max-w-2xl">
              <React.Suspense fallback={<div className="h-10 w-full bg-white/50 rounded-full" />}>
                <SearchBar />
              </React.Suspense>
            </div>

            {/* ── Right: Account | Notifications | Theme | Cart ── */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">

              {/* Hidden location button kept for functional compatibility */}
              <button
                id="header-location"
                type="button"
                onClick={openLocationModal}
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
              />
              <button
                id="header-language-btn"
                type="button"
                onClick={openLocationModal}
                className="hidden"
                aria-hidden="true"
                tabIndex={-1}
              />

              {/* Client Account */}
              <Link
                href={user ? '/account' : '/auth/sign-in'}
                id="header-account-link"
                className="flex items-center gap-2 px-2.5 sm:px-3 py-2 rounded-xl hover:bg-[#f5ede0]/60 dark:hover:bg-[#1c1810]/60 transition-all group"
                title={user ? 'Your Maison Account' : 'Client Sign In'}
              >
                <div className="w-7 h-7 rounded-full border border-[#d8c9b0] dark:border-[#3a2f1a] group-hover:border-[#c5a059] dark:group-hover:border-[#dfba73] flex items-center justify-center bg-[#f8f4ec] dark:bg-[#1a1812] text-[#8a6827] dark:text-[#dfba73] transition-colors shrink-0">
                  <User size={14} />
                </div>
                <div className="hidden lg:flex flex-col text-left">
                  <span className="text-[8px] uppercase tracking-[0.22em] text-[#9a8f7e] dark:text-[#6e6860] font-medium font-sans leading-none">
                    MAISON
                  </span>
                  <span className="text-[12px] font-serif font-semibold tracking-wide text-[#141312] dark:text-[#f0ebe2] group-hover:text-[#9a7833] dark:group-hover:text-[#dfba73] mt-0.5 leading-tight">
                    {firstName || 'Sign In'}
                  </span>
                </div>
              </Link>

              {/* Notifications */}
              {user && (
                <Link
                  href="/account/notifications"
                  id="header-notifications-link"
                  className="relative flex items-center justify-center w-9 h-9 rounded-xl hover:bg-[#f5ede0]/60 dark:hover:bg-[#1c1810]/60 text-[#8a6827] dark:text-[#dfba73] transition-all"
                  title="Notifications & Private Alerts"
                  aria-label={`Notifications, ${unreadCount} unread`}
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[13px] h-[13px] px-0.5 flex items-center justify-center rounded-full bg-gradient-to-r from-[#dfba73] to-[#a88237] text-[8px] font-black text-[#121110]">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              )}

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                id="header-theme-toggle-btn"
                className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-[#f5ede0]/60 dark:hover:bg-[#1c1810]/60 text-[#8a6827] dark:text-[#dfba73] transition-all cursor-pointer"
                title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun size={16} />
                ) : (
                  <Moon size={16} />
                )}
              </button>

              {/* Divider */}
              <div className="w-px h-6 bg-[#e0d5c0] dark:bg-[#2a2318] mx-1" />

              {/* Shopping Bag — Champagne gold CTA */}
              <Link
                href="/cart"
                id="header-cart-link"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] via-[#d6b870] to-[#a88237] hover:brightness-105 text-[#0d0a06] border border-[#b89047]/50 hover:border-[#c5a059] transition-all group shadow-[0_2px_12px_rgba(197,160,89,0.3)] hover:shadow-[0_4px_20px_rgba(197,160,89,0.45)] cursor-pointer shrink-0"
                aria-label={`Shopping bag, ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
              >
                <div className="relative flex items-center">
                  <ShoppingBag size={15} className="group-hover:scale-105 transition-transform" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2.5 -right-3 min-w-[16px] h-[16px] px-0.5 flex items-center justify-center rounded-full bg-[#0d0a06] text-[9px] font-black text-[#dfba73]">
                      {itemCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-serif text-[12px] tracking-[0.2em] uppercase font-bold ml-0.5">
                  BAG
                </span>
              </Link>
            </div>

          </div>
        </div>
      </header>

      {/* Slide-in Mobile/Desktop Menu */}
      {menuOpen && <MobileMenu onClose={() => setMenuOpen(false)} />}
    </>
  );
}
