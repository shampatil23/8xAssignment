'use client';
// ============================================================================
// Admin Dashboard — Real-time Platform Telemetry & Oversight
// ============================================================================
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Store,
  Package,
  ShoppingBag,
  RotateCcw,
  DollarSign,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { fetchAdminDashboardStats, fetchAdminSettings } from '@/services/adminService';
import type { AdminDashboardStats } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [platformCurrency, setPlatformCurrency] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('amazon_clone_platform_currency') || 'USD';
    }
    return 'USD';
  });

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    const [res, settingsRes] = await Promise.all([
      fetchAdminDashboardStats(),
      fetchAdminSettings(),
    ]);

    if (settingsRes.success && settingsRes.data?.currency) {
      setPlatformCurrency(settingsRes.data.currency);
      if (typeof window !== 'undefined') {
        localStorage.setItem('amazon_clone_platform_currency', settingsRes.data.currency);
      }
    }

    if (res.success && res.data) {
      setStats(res.data);
    } else {
      setError(res.error || 'Failed to load platform dashboard data.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStats();

    const handleCurrencyChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setPlatformCurrency(customEvent.detail);
      } else if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('amazon_clone_platform_currency');
        if (saved) setPlatformCurrency(saved);
      }
    };

    window.addEventListener('platform-currency-changed', handleCurrencyChange);
    window.addEventListener('storage', handleCurrencyChange);
    return () => {
      window.removeEventListener('platform-currency-changed', handleCurrencyChange);
      window.removeEventListener('storage', handleCurrencyChange);
    };
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-lg border border-[#d5d9d9] shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-[#0f1111] flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-[#e47911]" />
              Platform Overview
            </h1>
            <p className="text-xs text-[#565959] mt-1">
              Live marketplace telemetry, transactions, seller ecosystem, and operations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadStats}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs text-[#0f1111] hover:bg-[#f7fafa] border-[#d5d9d9] cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-amazon-orange' : 'text-[#565959]'} />
              <span>Refresh Metrics</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 flex items-center gap-3 text-red-900 text-xs">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span className="flex-1">{error}</span>
            <button
              onClick={loadStats}
              className="font-bold text-[#007185] underline hover:text-[#c7511f] cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── KPI Metric Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Users */}
          <div className="rounded-xl border border-[#d5d9d9] bg-white p-4.5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#565959] uppercase tracking-wider">Total Users</span>
              <div className="rounded-lg bg-[#ebf8fa] p-2 text-[#007185]">
                <Users size={18} />
              </div>
            </div>
            <p className="mt-2.5 text-2xl font-black text-[#0f1111]">
              {loading ? '—' : stats?.totalUsers ?? 0}
            </p>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#565959]">
              <span>{stats?.totalCustomers ?? 0} Customers</span>
              <span className="font-semibold text-[#007185]">{stats?.totalSellers ?? 0} Sellers</span>
            </div>
          </div>

          {/* Card 2: Products */}
          <div className="rounded-xl border border-[#d5d9d9] bg-white p-4.5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#565959] uppercase tracking-wider">Catalog Products</span>
              <div className="rounded-lg bg-amber-50 p-2 text-[#e47911]">
                <Package size={18} />
              </div>
            </div>
            <p className="mt-2.5 text-2xl font-black text-[#0f1111]">
              {loading ? '—' : stats?.totalProducts ?? 0}
            </p>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#565959]">
              <span className="text-[#007600] font-semibold">{stats?.activeProducts ?? 0} Active</span>
              <span>{(stats?.totalProducts ?? 0) - (stats?.activeProducts ?? 0)} Inactive</span>
            </div>
          </div>

          {/* Card 3: Orders */}
          <div className="rounded-xl border border-[#d5d9d9] bg-white p-4.5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#565959] uppercase tracking-wider">Total Orders</span>
              <div className="rounded-lg bg-slate-100 p-2 text-[#131921]">
                <ShoppingBag size={18} />
              </div>
            </div>
            <p className="mt-2.5 text-2xl font-black text-[#0f1111]">
              {loading ? '—' : stats?.totalOrders ?? 0}
            </p>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#565959]">
              <span className="text-[#c7511f] font-semibold">{stats?.pendingOrders ?? 0} Pending</span>
              <span>{(stats?.totalOrders ?? 0) - (stats?.pendingOrders ?? 0)} Completed</span>
            </div>
          </div>

          {/* Card 4: Platform GMV */}
          <div className="rounded-xl border border-[#d5d9d9] bg-white p-4.5 shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#565959] uppercase tracking-wider">Gross Volume (GMV)</span>
              <div className="rounded-lg bg-emerald-50 p-2 text-[#007600]">
                <DollarSign size={18} />
              </div>
            </div>
            <p className="mt-2.5 text-2xl font-black text-[#007600]">
              {loading ? '—' : formatPrice(stats?.platformGMV ?? 0, platformCurrency)}
            </p>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#565959]">
              <span>Returns: {stats?.totalReturns ?? 0}</span>
              <span className="text-[#007185] font-semibold">{stats?.pendingReturns ?? 0} In Queue</span>
            </div>
          </div>
        </div>

        {/* ── Quick Administrative Shortcuts ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/admin/users"
            className="flex items-center gap-3 rounded-xl border border-[#d5d9d9] bg-white p-3.5 hover:border-[#007185] hover:shadow-xs transition-all group"
          >
            <div className="rounded-lg bg-[#ebf8fa] p-2 text-[#007185] group-hover:bg-[#007185] group-hover:text-white transition-colors">
              <Users size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0f1111] group-hover:text-[#007185] transition-colors">Manage Users</p>
              <p className="text-[10px] text-[#565959]">Account status & roles</p>
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 rounded-xl border border-[#d5d9d9] bg-white p-3.5 hover:border-[#e77600] hover:shadow-xs transition-all group"
          >
            <div className="rounded-lg bg-amber-50 p-2 text-[#e47911] group-hover:bg-[#e47911] group-hover:text-white transition-colors">
              <Package size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0f1111] group-hover:text-[#c7511f] transition-colors">Catalog Oversight</p>
              <p className="text-[10px] text-[#565959]">Stock & publish status</p>
            </div>
          </Link>

          <Link
            href="/admin/reviews"
            className="flex items-center gap-3 rounded-xl border border-[#d5d9d9] bg-white p-3.5 hover:border-[#e77600] hover:shadow-xs transition-all group"
          >
            <div className="rounded-lg bg-orange-50 p-2 text-amazon-orange group-hover:bg-amazon-orange group-hover:text-white transition-colors">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0f1111] group-hover:text-[#c7511f] transition-colors">Moderate Reviews</p>
              <p className="text-[10px] text-[#565959]">Approve or hide ratings</p>
            </div>
          </Link>

          <Link
            href="/admin/returns"
            className="flex items-center gap-3 rounded-xl border border-[#d5d9d9] bg-white p-3.5 hover:border-[#007185] hover:shadow-xs transition-all group"
          >
            <div className="rounded-lg bg-slate-100 p-2 text-[#007185] group-hover:bg-[#007185] group-hover:text-white transition-colors">
              <RotateCcw size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0f1111] group-hover:text-[#007185] transition-colors">Returns Queue</p>
              <p className="text-[10px] text-[#565959]">Process refund requests</p>
            </div>
          </Link>
        </div>

        {/* ── Recent Activity Grids ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Recent Orders */}
          <div className="rounded-xl border border-[#d5d9d9] bg-white p-5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#eaeded] mb-3">
              <h2 className="text-sm font-bold text-[#0f1111] flex items-center gap-2">
                <ShoppingBag size={17} className="text-[#131921]" />
                Recent Orders
              </h2>
              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-[#007185] hover:text-[#c7511f] hover:underline flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded bg-[#eaeded] animate-pulse" />
                ))}
              </div>
            ) : !stats?.recentOrders || stats.recentOrders.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#565959]">
                No orders placed on platform yet.
              </div>
            ) : (
              <div className="divide-y divide-[#eaeded] flex-1">
                {stats.recentOrders.map((order) => {
                  const statusKey = order.status?.toLowerCase() || 'pending';
                  const isDelivered = statusKey === 'delivered';
                  const isShipped = statusKey === 'shipped';
                  const isConfirmed = statusKey === 'confirmed';
                  const isCancelled = statusKey === 'cancelled';

                  const badgeClass = isDelivered
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : isShipped
                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                      : isConfirmed
                        ? 'bg-[#e7f4e8] text-[#067d62] border-[#a2d8df]'
                        : isCancelled
                          ? 'bg-red-50 text-red-800 border-red-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200';

                  return (
                    <div
                      key={order.id}
                      className="py-3 px-1 flex items-center justify-between gap-3 text-xs hover:bg-[#f7fafa] rounded-md transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0f1111] font-mono tracking-tight">
                            #{order.id.slice(-8)}
                          </span>
                          <span
                            className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[#565959] text-[11px] truncate mt-0.5">
                          {order.items.length} item{order.items.length > 1 ? 's' : ''} • {order.shippingAddress?.fullName || 'Customer'}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="font-bold text-[#0f1111]">{formatPrice(order.total, platformCurrency)}</p>
                        <p className="text-[10px] text-[#565959]">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Column 2: Return Requests & Action Queue */}
          <div className="rounded-xl border border-[#d5d9d9] bg-white p-5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#eaeded] mb-3">
              <h2 className="text-sm font-bold text-[#0f1111] flex items-center gap-2">
                <RotateCcw size={17} className="text-[#007185]" />
                Returns & Refund Requests
              </h2>
              <Link
                href="/admin/returns"
                className="text-xs font-semibold text-[#007185] hover:text-[#c7511f] hover:underline flex items-center gap-1 transition-colors"
              >
                <span>View All ({stats?.pendingReturns ?? 0})</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded bg-[#eaeded] animate-pulse" />
                ))}
              </div>
            ) : !stats?.recentReturns || stats.recentReturns.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-center px-4 my-auto">
                <div className="h-12 w-12 rounded-full bg-[#e7f4e8] text-[#067d62] flex items-center justify-center mb-2.5 border border-[#a2d8df]">
                  <CheckCircle2 size={22} />
                </div>
                <p className="text-xs font-bold text-[#0f1111]">Returns Queue is Clear</p>
                <p className="text-[11px] text-[#565959] max-w-xs mt-1 leading-relaxed">
                  No active return or refund requests currently pending administrative review.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#eaeded] flex-1">
                {stats.recentReturns.map((req) => (
                  <div
                    key={req.id}
                    className="py-3 px-1 flex items-center justify-between gap-3 text-xs hover:bg-[#f7fafa] rounded-md transition-colors"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0f1111] truncate max-w-[180px]">
                          {req.itemTitle}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            req.status === 'REFUNDED'
                              ? 'bg-[#ebf8fa] text-[#007600] border border-[#a2d8df]'
                              : req.status === 'RETURN_APPROVED'
                                ? 'bg-blue-50 text-blue-800 border border-blue-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p className="text-[#565959] text-[11px] truncate mt-0.5">
                        Reason: {req.reason}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-[#0f1111]">{formatPrice(req.refundAmount, platformCurrency)}</p>
                      <Link
                        href="/admin/returns"
                        className="text-[10px] text-[#007185] hover:text-[#c7511f] hover:underline font-semibold"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── User Accounts Overview ── */}
        <div className="rounded-xl border border-[#d5d9d9] bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3.5 border-b border-[#eaeded] mb-3">
            <h2 className="text-sm font-bold text-[#0f1111] flex items-center gap-2">
              <Users size={17} className="text-[#007185]" />
              Recent Accounts
            </h2>
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-[#007185] hover:text-[#c7511f] hover:underline flex items-center gap-1 transition-colors"
            >
              <span>Manage All Users</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-[#565959]">Loading user accounts...</div>
          ) : !stats?.recentUsers || stats.recentUsers.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#565959]">No users found.</div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-[#eaeded]">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#d5d9d9] bg-[#f8f9fa] text-[#565959] font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4">Joined</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eaeded]">
                  {stats.recentUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-[#f7fafa] transition-colors">
                      <td className="py-3 px-4 font-medium text-[#0f1111]">
                        <div className="flex flex-col">
                          <span className="font-semibold text-[#0f1111]">{u.displayName || 'Customer'}</span>
                          <span className="text-[11px] text-[#565959]">{u.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                            u.role === 'admin'
                              ? 'bg-[#131921] text-amber-400 border border-amber-400/40'
                              : u.role === 'seller'
                                ? 'bg-amber-50 text-amber-900 border border-amber-300'
                                : 'bg-slate-100 text-slate-700 border border-slate-200 font-medium'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold ${
                            u.status === 'suspended' ? 'text-red-600' : 'text-[#067d62]'
                          }`}
                        >
                          <span
                            className={`h-2 w-2 rounded-full ${
                              u.status === 'suspended' ? 'bg-red-500' : 'bg-[#067d62]'
                            }`}
                          />
                          {u.status === 'suspended' ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#565959] text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/admin/users?q=${encodeURIComponent(u.email || u.uid)}`}
                          className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium text-[#0f1111] bg-white border border-[#d5d9d9] hover:bg-[#f7fafa] hover:border-[#a6a6a6] shadow-2xs transition-all cursor-pointer"
                        >
                          Inspect
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
