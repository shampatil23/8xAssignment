'use client';
// ============================================================================
// SellerLayout — Valenza Maison Partner Atelier & Seller Central Shell
// Ultra-Luxury Design: Obsidian & Champagne Gold, Serif Typography, Glassmorphism
// Protected by AuthGuard for 'seller' and 'admin' roles
// ============================================================================
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Store,
  LayoutDashboard,
  Package,
  PlusCircle,
  Boxes,
  ClipboardList,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  Crown,
  Sparkles,
  Gem,
  Award,
} from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { fetchAdminSettings } from '@/services/adminService';

interface SellerLayoutProps {
  children: React.ReactNode;
}

export function SellerLayout({ children }: SellerLayoutProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchAdminSettings()
      .then((res) => {
        if (res.success && res.data?.currency && typeof window !== 'undefined') {
          localStorage.setItem('amazon_clone_platform_currency', res.data.currency);
        }
      })
      .catch(() => {});
  }, []);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/sign-in');
  };

  const navItems = [
    {
      name: 'Atelier Overview',
      href: '/seller',
      icon: <LayoutDashboard size={16} />,
      exact: true,
    },
    {
      name: 'Manage Catalog',
      href: '/seller/products',
      icon: <Package size={16} />,
      exact: false,
    },
    {
      name: 'Add New Masterpiece',
      href: '/seller/products/new',
      icon: <PlusCircle size={16} />,
      exact: true,
    },
    {
      name: 'Vault Inventory',
      href: '/seller/inventory',
      icon: <Boxes size={16} />,
      exact: true,
    },
    {
      name: 'Client Orders & Fulfillment',
      href: '/seller/orders',
      icon: <ClipboardList size={16} />,
      exact: false,
    },
    {
      name: 'Performance Analytics',
      href: '/seller/analytics',
      icon: <BarChart3 size={16} />,
      exact: true,
    },
    {
      name: 'Maison Atelier Settings',
      href: '/seller/settings',
      icon: <Settings size={16} />,
      exact: true,
    },
  ];

  const isCurrentActive = (item: (typeof navItems)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return (
      pathname.startsWith(item.href) &&
      (item.href !== '/seller/products' || pathname !== '/seller/products/new')
    );
  };

  return (
    <AuthGuard requiredRole={['seller', 'admin']}>
      <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0a0d14] text-[#141312] dark:text-[#f8f5ee] flex flex-col transition-colors duration-300">
        
        {/* ── Top Luxury Navigation Bar ── */}
        <header className="sticky top-0 z-40 bg-gradient-to-r from-[#171513] via-[#1f1a14] to-[#12100e] dark:from-[#0d1017] dark:via-[#151922] dark:to-[#0a0d14] text-white shadow-[0_4px_24px_rgba(0,0,0,0.3)] border-b border-[#c5a059]/30">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
            
            {/* Left: Mobile Toggle & Maison Brand */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <Link href="/seller" className="flex items-center gap-3 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-tr from-[#c5a059] to-[#dfba73] text-[#121110] font-serif font-bold text-sm shadow-md group-hover:scale-105 transition-transform">
                  <Crown size={18} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-semibold text-sm tracking-[0.14em] uppercase text-[#f8f5ee] group-hover:text-[#dfba73] transition-colors">
                      VALENZA <span className="text-[#dfba73] font-normal text-xs">ATELIER CENTRAL</span>
                    </span>
                    <span className="hidden sm:inline-block rounded-full border border-[#c5a059]/60 bg-[#c5a059]/20 px-2 py-0.5 text-[9px] font-serif font-bold text-[#dfba73] uppercase tracking-widest shadow-2xs">
                      Partner
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-300 truncate max-w-[240px] tracking-wide">
                    {user?.displayName || 'Merchant Partner'} • <span className="text-[#dfba73]">Valenza Privé</span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: Quick Atelier Actions */}
            <div className="flex items-center gap-3 text-xs">
              <Link
                href="/seller/products"
                className="hidden md:flex items-center gap-1.5 text-gray-300 hover:text-[#dfba73] px-3 py-1.5 rounded-full hover:bg-white/5 border border-transparent hover:border-[#c5a059]/30 transition-all font-serif text-[11px] tracking-wider uppercase"
                title="Manage Catalog"
              >
                <Package size={13} className="text-[#dfba73]" />
                <span>Catalog</span>
              </Link>

              <Link
                href="/seller/orders"
                className="hidden md:flex items-center gap-1.5 text-gray-300 hover:text-[#dfba73] px-3 py-1.5 rounded-full hover:bg-white/5 border border-transparent hover:border-[#c5a059]/30 transition-all font-serif text-[11px] tracking-wider uppercase"
                title="Manage Orders"
              >
                <ClipboardList size={13} className="text-[#dfba73]" />
                <span>Orders</span>
              </Link>

              <Link
                href="/"
                target="_blank"
                className="hidden sm:flex items-center gap-1.5 text-white/90 hover:text-white px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#2a241c] to-[#1c1813] hover:from-[#352e24] hover:to-[#241e18] border border-[#c5a059]/40 hover:border-[#dfba73] transition-all font-serif text-[11px] tracking-wider uppercase shadow-xs"
                title="Open client storefront"
              >
                <span>Storefront</span>
                <ExternalLink size={11} className="text-[#dfba73]" />
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-gray-300 hover:text-red-300 px-3 py-1.5 rounded-full bg-white/5 hover:bg-red-950/40 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer font-serif text-[11px] tracking-wider uppercase"
                title="Sign out of Atelier Central"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── Main Layout Body ── */}
        <div className="mx-auto flex max-w-7xl flex-1 w-full px-4 sm:px-6 py-8 gap-8">
          
          {/* ── Desktop Luxury Sidebar ── */}
          <aside className="hidden lg:block w-68 flex-shrink-0">
            <div className="sticky top-24 rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 backdrop-blur-xl p-4 shadow-[0_8px_32px_rgba(197,160,89,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              
              {/* Sidebar Header */}
              <div className="px-3 py-2.5 border-b border-[#f0eae0] dark:border-[#1e2433] mb-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Gem size={12} className="text-[#c5a059]" />
                  <p className="text-[10px] font-serif font-bold uppercase tracking-[0.24em] text-[#8a6827] dark:text-[#dfba73]">
                    Atelier Navigation
                  </p>
                </div>
                <Store size={13} className="text-[#c5a059]/60" />
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1.5">
                {navItems.map((item) => {
                  const active = isCurrentActive(item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs transition-all ${
                        active
                          ? 'bg-gradient-to-r from-[#f5ede0] to-[#fcf9f2] dark:from-[#1c2333] dark:to-[#161a26] text-[#8a6827] dark:text-[#dfba73] font-semibold border border-[#d6be90]/60 dark:border-[#c5a059]/40 shadow-xs'
                          : 'text-[#38332d] dark:text-[#ddd6c8] hover:bg-[#f6f1e6]/80 dark:hover:bg-[#181d28] hover:text-[#8a6827] dark:hover:text-[#dfba73] font-normal'
                      }`}
                    >
                      <span
                        className={`transition-transform duration-200 ${
                          active
                            ? 'text-[#8a6827] dark:text-[#dfba73] scale-110'
                            : 'text-[#8a8277] dark:text-[#7f889b] group-hover:text-[#8a6827] dark:group-hover:text-[#dfba73] group-hover:scale-105'
                        }`}
                      >
                        {item.icon}
                      </span>
                      <span className="truncate tracking-wide">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Merchant Credential Card */}
              <div className="mt-6 pt-4 border-t border-[#f0eae0] dark:border-[#1e2433] px-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#2e7d32] dark:text-[#66bb6a] font-serif text-[11px] font-bold tracking-wide">
                    <ShieldCheck size={14} className="text-[#2e7d32] dark:text-[#66bb6a]" />
                    <span>Verified Atelier</span>
                  </div>
                  <span className="text-[9px] font-serif tracking-widest uppercase bg-[#edf7ed] dark:bg-[#132816] text-[#1b5e20] dark:text-[#81c784] px-2 py-0.5 rounded-full border border-[#c8e6c9] dark:border-[#2e5933] font-bold">
                    ACTIVE
                  </span>
                </div>
                <div className="text-[10px] text-[#786b58] dark:text-[#8a94a6] font-mono truncate">
                  Atelier ID: {user?.uid.slice(0, 16)}...
                </div>
                <div className="flex items-center justify-between text-[11px] text-[#786b58] dark:text-[#9e978b] pt-1">
                  <span>Maison Appraisal:</span>
                  <span className="font-bold text-[#8a6827] dark:text-[#dfba73]">4.9 / 5.0 ★</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main Content Area ── */}
          <main className="min-w-0 flex-1">{children}</main>
        </div>

        {/* ── Mobile Slide-out Drawer ── */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-y-0 left-0 w-80 bg-[#faf9f6] dark:bg-[#11141c] p-6 shadow-2xl flex flex-col justify-between border-r border-[#ebe2d1] dark:border-[#262c3d]">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-[#f0eae0] dark:border-[#1e2433] mb-4">
                  <div className="flex items-center gap-2.5">
                    <Crown size={20} className="text-[#dfba73]" />
                    <span className="font-serif font-bold text-sm uppercase tracking-wider text-[#141312] dark:text-[#f8f5ee]">
                      Atelier Central
                    </span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded-full text-gray-500 hover:text-black dark:hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>

                <nav className="space-y-1.5">
                  {navItems.map((item) => {
                    const active = isCurrentActive(item);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-xs transition-all ${
                          active
                            ? 'bg-[#f5ede0] dark:bg-[#1c2333] text-[#8a6827] dark:text-[#dfba73] font-semibold border border-[#d6be90]/60'
                            : 'text-[#38332d] dark:text-[#ddd6c8]'
                        }`}
                      >
                        {item.icon}
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full py-2.5 rounded-full border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-xs font-serif tracking-wider uppercase hover:bg-red-50 dark:hover:bg-red-950/30 transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={13} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
