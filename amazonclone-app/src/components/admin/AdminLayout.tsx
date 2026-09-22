'use client';
// ============================================================================
// AdminLayout — Amazon Admin Console Shell & Sidebar
// Protected by AuthGuard for 'admin' role only
// ============================================================================
import React, { useState, useEffect } from 'react';
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
import { fetchAdminSettings } from '@/services/adminService';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchAdminSettings().then((res) => {
      if (res.success && res.data?.currency && typeof window !== 'undefined') {
        localStorage.setItem('amazon_clone_platform_currency', res.data.currency);
      }
    }).catch(() => {});
  }, []);

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
      <div className="min-h-screen bg-[#eaeded] flex flex-col font-sans">
        {/* ── Top Admin Navigation Bar ── */}
        <header className="sticky top-0 z-40 bg-[#131921] text-white shadow-md border-b border-gray-800">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
            {/* Left: Hamburger & Brand */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-1 text-gray-300 hover:text-white cursor-pointer"
                aria-label="Toggle Admin Menu"
              >
                {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>

              <Link href="/admin" className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded bg-amazon-orange text-[#131921] font-extrabold shadow-xs">
                  <ShieldCheck size={20} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm leading-none tracking-tight">
                      amazon <span className="text-amazon-orange text-xs font-semibold">admin central</span>
                    </span>
                    <span className="hidden sm:inline-block rounded bg-[#febd69] px-2 py-0.5 text-[10px] font-extrabold text-[#111827] uppercase tracking-wider shadow-2xs">
                      Console
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-300 truncate max-w-[200px]">
                    {user?.email}
                  </span>
                </div>
              </Link>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5 text-xs">
              <Link
                href="/seller"
                target="_blank"
                className="hidden md:flex items-center gap-1.5 text-gray-200 hover:text-white px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 border border-white/10 transition-colors font-medium"
                title="Open Seller Central"
              >
                <Store size={14} className="text-[#febd69]" />
                <span>Seller Portal</span>
              </Link>

              <Link
                href="/"
                target="_blank"
                className="hidden sm:flex items-center gap-1.5 text-gray-200 hover:text-white px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/15 border border-white/10 transition-colors font-medium"
                title="Open Storefront"
              >
                <span>Storefront</span>
                <ExternalLink size={12} className="text-gray-400" />
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-1.5 text-gray-300 hover:text-red-300 px-3 py-1.5 rounded-md bg-white/5 hover:bg-red-950/40 border border-white/10 hover:border-red-500/30 transition-all cursor-pointer font-medium"
                title="Sign out of Admin Console"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── Main Admin Container ── */}
        <div className="mx-auto flex max-w-7xl flex-1 w-full px-4 sm:px-6 py-6 gap-6">
          {/* ── Desktop Sidebar ── */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-20 rounded-xl border border-[#d5d9d9] bg-white p-3.5 shadow-xs">
              <div className="px-3 py-2 border-b border-gray-100 mb-2.5 flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#565959]">
                  Administration
                </p>
                <Lock size={12} className="text-gray-400" />
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

              <div className="mt-6 pt-4 border-t border-gray-100 px-3 text-[11px] text-gray-500 space-y-1">
                <div className="flex items-center gap-1.5 text-[#007185] font-semibold">
                  <ShieldCheck size={14} />
                  <span>Platform SuperAdmin</span>
                </div>
                <p className="text-[10px] text-gray-400 font-mono">
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
                  <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={20} className="text-amazon-orange" />
                      <span className="font-bold text-sm text-[#0f1111]">
                        Admin Menu
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
          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
