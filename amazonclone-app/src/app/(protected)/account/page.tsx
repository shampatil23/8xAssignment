'use client';
// ============================================================================
// Your Account Hub — Valenza Maison Privée Client Dashboard
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
  Crown,
  Sparkles,
  Award,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { setUserRole } from '@/lib/firebase/database';

export default function AccountPage() {
  const { user, firebaseUser, signOut, isSeller, isAdmin } = useAuth();
  const { unreadCount } = useNotifications();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push('/auth/sign-in');
  }

  const roleLabel = {
    customer: 'Privé Client',
    seller: 'Atelier Merchant',
    admin: 'Maison Curator',
  }[user?.role ?? 'customer'];

  const accountCards = [
    {
      title: 'Private Allocations & Orders',
      description: 'Track armored dispatches, historical acquisitions, and certificates',
      icon: <Package className="h-6 w-6 text-[#c5a059]" />,
      href: '/orders',
    },
    {
      title: 'Client Security & Passkeys',
      description: 'Manage confidential passkeys, verified email, and vault encryption',
      icon: <ShieldCheck className="h-6 w-6 text-[#c5a059]" />,
      href: '/account/security',
    },
    {
      title: 'Residences & Delivery Destinations',
      description: 'Manage white-glove courier destinations and private residences',
      icon: <MapPin className="h-6 w-6 text-[#c5a059]" />,
      href: '/account/addresses',
    },
    {
      title: 'Curated Wishlist & Vault',
      description: 'Review saved masterpieces, archival pieces, and vault allocations',
      icon: <Heart className="h-6 w-6 text-[#c5a059]" />,
      href: '/wishlist',
    },
    {
      title: 'Salon Exchanges & Returns',
      description: 'Manage bespoke inspection consultations, certificates, and refunds',
      icon: <RotateCcw className="h-6 w-6 text-[#c5a059]" />,
      href: '/orders?tab=returns',
    },
    {
      title: 'Concierge Communications',
      description: 'Direct communications from your private advisor and atelier alerts',
      icon: (
        <div className="relative">
          <Bell className="h-6 w-6 text-[#c5a059]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#c5a059] text-[9px] font-bold text-[#12110f] shadow-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      ),
      href: '/account/notifications',
      badge: unreadCount > 0 ? `${unreadCount} new` : undefined,
    },
    {
      title: 'Atelier Inquiries & Client Help',
      description: 'Bespoke assistance, appraisal inquiries, and client services',
      icon: <HelpCircle className="h-6 w-6 text-[#c5a059]" />,
      href: '/help',
    },
    {
      title: 'Client Dossier & Preferences',
      description: 'Manage your private profile, sizing preferences, and salon taste',
      icon: <UserCheck className="h-6 w-6 text-[#c5a059]" />,
      href: '/account/profile',
    },
    ...(isSeller || isAdmin
      ? [
          {
            title: 'Atelier Partner Portal',
            description: 'Manage your certified inventory, horlogerie listings, and allocations',
            icon: <Store className="h-6 w-6 text-[#c5a059]" />,
            href: '/seller',
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            title: 'Maison Curator Administration',
            description: 'Platform management, vault curation, catalog, and atelier analytics',
            icon: <Sliders className="h-6 w-6 text-[#c5a059]" />,
            href: '/admin',
          },
        ]
      : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-10 text-[#141312] dark:text-[#f8f5ee]">
      {/* Client Identity & Header Banner */}
      <div className="mb-10 rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 backdrop-blur-xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(26,23,20,0.04)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.6)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {/* Avatar with Gold Ring */}
          <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full border-2 border-[#c5a059] bg-[#fbfaf8] dark:bg-[#161a25] text-[#9b8353] dark:text-[#d6be90] shadow-md overflow-hidden">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || 'Client Account'}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserIcon size={36} />
            )}
            <div className="absolute bottom-0 right-0 p-1 bg-[#c5a059] rounded-full text-[#12110f]">
              <Crown size={10} />
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-[#141312] dark:text-[#f8f5ee]">
                {user?.displayName || firebaseUser?.displayName || 'Welcome'}
              </h1>
              
              {/* Membership Tier Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f6efe1] dark:bg-[#1a2130] border border-[#e4d6bf] dark:border-[#2f384d] text-[10px] uppercase font-semibold tracking-[0.2em] text-[#9b8353] dark:text-[#d6be90]">
                <Sparkles size={11} className="text-[#c5a059]" />
                <span>{roleLabel}</span>
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
                className="text-[10px] font-semibold uppercase tracking-wider rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] bg-white dark:bg-[#161a25] px-2.5 py-1 text-[#786b58] dark:text-[#c4b59d] hover:border-[#c5a059] focus:outline-none cursor-pointer"
                title="Switch client status for demonstration"
              >
                <option value="customer">Status: Privé Client</option>
                <option value="seller">Status: Atelier Merchant</option>
                <option value="admin">Status: Maison Curator</option>
              </select>
            </div>

            <p className="text-xs text-[#786b58] dark:text-[#9e978b] mt-1 flex items-center gap-2">
              <span>{user?.email}</span>
              {user?.phoneNumber && (
                <>
                  <span className="text-[#dfd6c5] dark:text-[#2c3242]">◆</span>
                  <span>{user.phoneNumber}</span>
                </>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] bg-white dark:bg-[#161a25] hover:border-[#c5a059] hover:text-[#c5a059] text-xs font-semibold uppercase tracking-wider text-[#786b58] dark:text-[#c4b59d] transition-all self-start md:self-auto cursor-pointer shadow-xs"
        >
          <LogOut size={14} />
          <span>Exit Salon</span>
        </button>
      </div>

      {/* Grid of Haute Maison Account Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 sm:gap-6">
        {accountCards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            className="group relative flex flex-col justify-between rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 p-6 shadow-[0_12px_40px_rgba(26,23,20,0.03)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.6)] hover:border-[#c5a059] hover:shadow-[0_16px_45px_rgba(197,160,89,0.12)] transition-all duration-300"
          >
            <div>
              {/* Icon Container */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#f0eae0] dark:border-[#1e2433] bg-[#fbfaf8] dark:bg-[#161a25] shadow-inner group-hover:border-[#c5a059] transition-colors">
                  {card.icon}
                </div>
                {card.badge && (
                  <span className="rounded-full bg-[#c5a059]/15 border border-[#c5a059]/40 px-2.5 py-0.5 text-[10px] font-semibold text-[#9b8353] dark:text-[#f0dcb0]">
                    {card.badge}
                  </span>
                )}
              </div>

              <h2 className="font-serif text-base font-medium text-[#141312] dark:text-[#f8f5ee] group-hover:text-[#c5a059] transition-colors">
                {card.title}
              </h2>
              <p className="mt-1.5 text-xs text-[#786b58] dark:text-[#9e978b] leading-relaxed">
                {card.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-[#f2ede4] dark:border-[#1d2332] flex items-center justify-between text-[11px] uppercase tracking-wider text-[#9b8353] dark:text-[#d6be90] font-semibold">
              <span>Access Portal</span>
              <ChevronRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* ── Atelier Merchant Invitation Banner ── */}
      {user?.role === 'customer' && (
        <div className="mt-12 rounded-3xl border border-[#d6be90] dark:border-[#c5a059]/40 bg-gradient-to-r from-[#fbf8f2] via-[#faf5eb] to-[#f4ebe0] dark:from-[#161a25] dark:via-[#191f2c] dark:to-[#131720] p-8 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-white dark:bg-[#12151f] border border-[#d6be90] flex items-center justify-center text-[#c5a059] shrink-0 mt-1 shadow-sm">
              <Store size={24} />
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-[0.25em] text-[#9b8353] dark:text-[#d6be90] block mb-1">
                Atelier Partnership
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-light text-[#141312] dark:text-[#f8f5ee]">
                Join the Valenza Haute Atelier Guild
              </h3>
              <p className="text-xs text-[#786b58] dark:text-[#9e978b] mt-1.5 max-w-xl leading-relaxed">
                Become an accredited Maison merchant partner. Present handcrafted horlogerie, high joaillerie, and artisanal rarities to our international private clientele.
              </p>
            </div>
          </div>

          <Link
            href="/sell"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#c5a059] via-[#d6be90] to-[#b89548] px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#12110f] whitespace-nowrap shadow-md hover:brightness-105 transition-all cursor-pointer"
          >
            <span>Request Atelier Accreditation</span>
            <ChevronRight size={14} />
          </Link>
        </div>
      )}
    </div>
  );
}
