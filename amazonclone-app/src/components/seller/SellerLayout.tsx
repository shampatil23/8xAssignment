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
        <header className="sticky top-0 z-40 bg-[#131921] text-white shadow-md">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
            {/* Left: Hamburger & Brand */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1 text-gray-300 hover:text-white cursor-pointer"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              <Link href="/seller" className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-amazon-orange text-amazon-dark font-extrabold text-sm">
                  <Store size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-sm leading-none tracking-tight">
                    amazon <span className="text-amazon-orange text-xs font-semibold">seller central</span>
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {user?.displayName || 'Merchant Partner'}
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 text-xs">
              <Link
                href="/"
                target="_blank"
                className="hidden sm:flex items-center gap-1 text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors"
                title="Open customer marketplace"
              >
                <span>Storefront</span>
                <ExternalLink size={12} />
              </Link>

              <span className="hidden sm:inline-block rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-400 border border-amber-500/30">
                SELLER
              </span>

              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1 text-gray-300 hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
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
            <div className="sticky top-20 rounded-xl border border-gray-200 bg-white p-3 shadow-xs">
              <div className="px-3 py-2 border-b border-gray-100 mb-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  Seller Navigation
                </p>
              </div>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const active = isCurrentActive(item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                        active
                          ? 'bg-amazon-orange text-white shadow-xs'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <span className={active ? 'text-white' : 'text-gray-500'}>
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 pt-4 border-t border-gray-100 px-3 text-[11px] text-gray-500 space-y-1">
                <div className="flex items-center gap-1 text-green-700 font-semibold">
                  <ShieldCheck size={14} />
                  <span>Verified Merchant</span>
                </div>
                <p className="text-[10px] text-gray-400">
                  Store ID: {user?.uid.slice(0, 12)}...
                </p>
              </div>
            </div>
          </aside>

          {/* ── Mobile Drawer Navigation ── */}
          {mobileMenuOpen && (
            <div className="lg:hidden fixed inset-0 z-50 flex">
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-2xs"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="relative w-64 max-w-xs bg-white h-full shadow-2xl p-4 flex flex-col justify-between z-10">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
                    <span className="font-bold text-sm text-gray-900">
                      Seller Menu
                    </span>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-gray-500 hover:text-gray-800"
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
                          className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold ${
                            active
                              ? 'bg-amazon-orange text-white'
                              : 'text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {item.icon}
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-2 text-xs font-semibold text-red-600 hover:underline"
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
