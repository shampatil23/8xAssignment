'use client';
// ============================================================================
// SellerLayout — Amazon Seller Central Dashboard Shell & Sidebar
// Protected by AuthGuard for 'seller' and 'admin' roles
// ============================================================================
import React, { useState } from 'react';
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
  Bell,
} from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/Button';

interface SellerLayoutProps {
  children: React.ReactNode;
}

export function SellerLayout({ children }: SellerLayoutProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/sign-in');
  };

  const navItems = [
    {
      name: 'Dashboard',
      href: '/seller',
      icon: <LayoutDashboard size={18} />,
      exact: true,
    },
    {
      name: 'Manage Products',
      href: '/seller/products',
      icon: <Package size={18} />,
      exact: false,
    },
    {
      name: 'Add Product',
      href: '/seller/products/new',
      icon: <PlusCircle size={18} />,
      exact: true,
    },
    {
      name: 'Inventory Health',
      href: '/seller/inventory',
      icon: <Boxes size={18} />,
      exact: true,
    },
    {
      name: 'Manage Orders',
      href: '/seller/orders',
      icon: <ClipboardList size={18} />,
      exact: false,
    },
    {
      name: 'Sales Analytics',
      href: '/seller/analytics',
      icon: <BarChart3 size={18} />,
      exact: true,
    },
    {
      name: 'Store Settings',
      href: '/seller/settings',
      icon: <Settings size={18} />,
      exact: true,
    },
  ];

  const isCurrentActive = (item: (typeof navItems)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href) && (item.href !== '/seller/products' || pathname !== '/seller/products/new');
  };

  return (
    <AuthGuard requiredRole={['seller', 'admin']}>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* ── Top Seller Navigation Bar ── */}
        <header className="sticky top-0 z-40 bg-[#131921] text-white shadow-md border-b border-gray-800">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
            {/* Left: Hamburger, Brand & Store Indicator */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1 text-gray-300 hover:text-white cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              <Link href="/seller" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-amazon-orange text-[#131921] font-extrabold text-sm shadow-xs">
                  <Store size={18} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm leading-none tracking-tight">
                      amazon <span className="text-amazon-orange text-xs font-semibold">seller central</span>
                    </span>
                    <span className="hidden sm:inline-block rounded bg-[#febd69] px-2 py-0.5 text-[10px] font-extrabold text-[#111827] uppercase tracking-wider shadow-2xs">
                      Seller
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-300 truncate max-w-[200px]">
                    {user?.displayName || 'Merchant Partner'} • <span className="text-[#febd69]">Amazon.in</span>
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5 text-xs">
              <Link
                href="/seller/products"
                className="hidden md:flex items-center gap-1 text-gray-300 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors font-medium"
                title="Manage Catalog"
              >
                <Package size={14} className="text-[#febd69]" />
                <span>Catalog</span>
              </Link>

              <Link
                href="/seller/orders"
                className="hidden md:flex items-center gap-1 text-gray-300 hover:text-white px-2.5 py-1.5 rounded-md hover:bg-white/10 transition-colors font-medium"
                title="Manage Orders"
              >
                <ClipboardList size={14} className="text-emerald-400" />
                <span>Orders</span>
              </Link>

              <Link
                href="/"
                target="_blank"
                className="hidden sm:flex items-center gap-1.5 text-gray-200 hover:text-white px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 border border-white/10 transition-colors font-medium"
                title="Open customer marketplace"
              >
                <span>Storefront</span>
                <ExternalLink size={12} className="text-gray-400" />
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-gray-300 hover:text-red-300 px-3 py-1.5 rounded-md bg-white/5 hover:bg-red-950/40 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer font-medium"
                title="Sign out of Seller Central"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── Main Layout Body ── */}
        <div className="mx-auto flex max-w-7xl flex-1 w-full px-4 sm:px-6 py-6 gap-6">
          {/* ── Desktop Sidebar ── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20 rounded-xl border border-[#d5d9d9] bg-white p-3.5 shadow-xs">
              <div className="px-3 py-2 border-b border-gray-100 mb-2.5 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#565959]">
                  Seller Central
                </p>
                <Store size={13} className="text-gray-400" />
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const active = isCurrentActive(item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center gap-3 rounded-md px-3 py-2.5 text-xs transition-all ${
                        active
                          ? 'bg-[#ebf8fa] text-[#007185] font-bold border-l-4 border-[#007185] pl-2.5 shadow-2xs'
                          : 'text-[#0f1111] hover:bg-[#f7fafa] hover:text-[#007185] font-medium'
                      }`}
                    >
                      <span className={`transition-colors ${active ? 'text-[#007185]' : 'text-gray-500 group-hover:text-[#007185]'}`}>
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 pt-4 border-t border-gray-100 px-3 text-[11px] text-gray-500 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#007600] font-bold">
                    <ShieldCheck size={14} />
                    <span>Verified Merchant</span>
                  </div>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
                    Healthy
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  Store ID: {user?.uid.slice(0, 12)}...
                </div>
                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1 border-t border-gray-50">
                  <span>Feedback Rating:</span>
                  <span className="font-bold text-[#0f1111]">4.9 / 5.0 ★</span>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Mobile Drawer Navigation ── */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="relative w-72 max-w-xs bg-white h-full shadow-2xl p-4 flex flex-col justify-between z-10">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
                    <div className="flex items-center gap-2">
                      <Store size={20} className="text-amazon-orange" />
                      <span className="font-bold text-sm text-[#0f1111]">
                        Seller Menu
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-gray-500 hover:text-gray-800 p-1"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <nav className="space-y-1">
                    {navItems.map((item) => {
                      const active = isCurrentActive(item);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-xs font-semibold ${
                            active
                              ? 'bg-[#ebf8fa] text-[#007185] border-l-4 border-[#007185] pl-2.5 shadow-2xs'
                              : 'text-[#0f1111] hover:bg-gray-100 hover:text-[#007185]'
                          }`}
                        >
                          <span className={active ? 'text-[#007185]' : 'text-gray-500'}>
                            {item.icon}
                          </span>
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center justify-between text-xs text-gray-600 hover:text-[#0f1111] py-1"
                  >
                    <span>Storefront</span>
                    <ExternalLink size={14} />
                  </Link>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 text-xs font-semibold text-red-600 hover:underline py-1"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Content Area ── */}
          <main className="flex-1 min-w-0 space-y-4">
            {user?.status === 'pending' && (
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-xs flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900">
                  <p className="font-bold">Seller Verification Pending Admin Approval</p>
                  <p className="mt-0.5 text-amber-800 leading-relaxed">
                    Your seller store application is currently in the Amazon Admin verification queue. You can prepare and manage your catalog in draft mode; listings will automatically become officially active in the marketplace once approved by an administrator.
                  </p>
                </div>
              </div>
            )}
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
