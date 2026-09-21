'use client';
// ============================================================================
// AdminLayout — Amazon Admin Console Shell & Sidebar
// Protected by AuthGuard for 'admin' role only
// ============================================================================
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  Store,
  Package,
  Layers,
  ClipboardList,
  MessageSquare,
  RotateCcw,
  Tag,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Lock,
} from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useAuth } from '@/hooks/useAuth';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
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
      href: '/admin',
      icon: <LayoutDashboard size={18} />,
      exact: true,
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: <Users size={18} />,
      exact: false,
    },
    {
      name: 'Sellers',
      href: '/admin/sellers',
      icon: <Store size={18} />,
      exact: false,
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: <Package size={18} />,
      exact: false,
    },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: <Layers size={18} />,
      exact: false,
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: <ClipboardList size={18} />,
      exact: false,
    },
    {
      name: 'Reviews',
      href: '/admin/reviews',
      icon: <MessageSquare size={18} />,
      exact: false,
    },
    {
      name: 'Returns / Refunds',
      href: '/admin/returns',
      icon: <RotateCcw size={18} />,
      exact: false,
    },
    {
      name: 'Promotions',
      href: '/admin/promotions',
      icon: <Tag size={18} />,
      exact: false,
    },
    {
      name: 'Reports / Analytics',
      href: '/admin/reports',
      icon: <BarChart3 size={18} />,
      exact: false,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: <Settings size={18} />,
      exact: false,
    },
  ];

  const isCurrentActive = (item: (typeof navItems)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-slate-100 flex flex-col">
        {/* ── Top Admin Navigation Bar ── */}
        <header className="sticky top-0 z-40 bg-[#0f172a] text-white border-b border-slate-800 shadow-md">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
            {/* Left: Hamburger & Brand */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1 text-slate-400 hover:text-white cursor-pointer"
                aria-label="Toggle Admin Menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              <Link href="/admin" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-purple-600 text-white font-extrabold shadow-sm">
                  <ShieldCheck size={20} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm leading-none tracking-tight">
                      amazon <span className="text-purple-400 text-xs font-semibold">admin central</span>
                    </span>
                    <span className="hidden sm:inline-block rounded bg-purple-500/20 px-1.5 py-0.5 text-[10px] font-bold text-purple-300 border border-purple-500/30 uppercase tracking-wider">
                      Console
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 truncate max-w-[200px]">
                    {user?.email}
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 text-xs">
              <Link
                href="/seller"
                target="_blank"
                className="hidden md:flex items-center gap-1 text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 transition-colors"
                title="Open Seller Central"
              >
                <Store size={13} />
                <span>Seller Portal</span>
              </Link>

              <Link
                href="/"
                target="_blank"
                className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-white px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700 transition-colors"
                title="Open Storefront"
              >
                <span>Storefront</span>
                <ExternalLink size={12} />
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-red-300 hover:text-red-200 px-2.5 py-1 rounded bg-red-950/40 hover:bg-red-900/50 border border-red-900/50 transition-colors cursor-pointer"
                title="Sign out of Admin Console"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── Main Admin Container ── */}
        <div className="mx-auto flex max-w-7xl flex-1 w-full px-4 sm:px-6 py-6 gap-6">
          {/* ── Desktop Sidebar ── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
              <div className="px-3 py-2 border-b border-slate-100 mb-2 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Administration
                </p>
                <Lock size={12} className="text-slate-400" />
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
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span className={active ? 'text-white' : 'text-slate-500'}>
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 pt-4 border-t border-slate-100 px-3 text-[11px] text-slate-500 space-y-1">
                <div className="flex items-center gap-1.5 text-purple-700 font-semibold">
                  <ShieldCheck size={14} />
                  <span>Platform SuperAdmin</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">
                  UID: {user?.uid.slice(0, 14)}...
                </p>
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
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={20} className="text-purple-600" />
                      <span className="font-bold text-sm text-slate-900">
                        Admin Menu
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-slate-500 hover:text-slate-800 p-1"
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
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {item.icon}
                          <span>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 py-1"
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
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
