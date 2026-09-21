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
import { fetchAdminDashboardStats } from '@/services/adminService';
import type { AdminDashboardStats } from '@/types';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchAdminDashboardStats();
    if (res.success && res.data) {
      setStats(res.data);
    } else {
      setError(res.error || 'Failed to load platform dashboard data.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-purple-600" />
              Platform Overview
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live marketplace telemetry, transactions, seller ecosystem, and operations.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadStats}
              disabled={loading}
              className="inline-flex items-center gap-1.5 text-xs text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Metrics</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-800 text-xs">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span className="flex-1">{error}</span>
            <button
              onClick={loadStats}
              className="font-bold underline hover:text-red-950 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── KPI Metric Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Users */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <Users size={18} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {loading ? '—' : stats?.totalUsers ?? 0}
            </p>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>{stats?.totalCustomers ?? 0} Customers</span>
              <span className="font-semibold text-blue-600">{stats?.totalSellers ?? 0} Sellers</span>
            </div>
          </div>

          {/* Card 2: Products */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catalog Products</span>
              <div className="rounded-lg bg-amber-50 p-2 text-amber-600">
                <Package size={18} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {loading ? '—' : stats?.totalProducts ?? 0}
            </p>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-emerald-700 font-semibold">{stats?.activeProducts ?? 0} Active</span>
              <span>{(stats?.totalProducts ?? 0) - (stats?.activeProducts ?? 0)} Inactive</span>
            </div>
          </div>

          {/* Card 3: Orders */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Orders</span>
              <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                <ShoppingBag size={18} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-slate-900">
              {loading ? '—' : stats?.totalOrders ?? 0}
            </p>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span className="text-purple-700 font-semibold">{stats?.pendingOrders ?? 0} Pending</span>
              <span>{(stats?.totalOrders ?? 0) - (stats?.pendingOrders ?? 0)} Completed</span>
            </div>
          </div>

          {/* Card 4: Platform GMV */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Volume (GMV)</span>
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <DollarSign size={18} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-black text-emerald-700">
              {loading ? '—' : formatPrice(stats?.platformGMV ?? 0)}
            </p>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
              <span>Returns: {stats?.totalReturns ?? 0}</span>
              <span className="text-red-600 font-semibold">{stats?.pendingReturns ?? 0} In Queue</span>
            </div>
          </div>
        </div>

        {/* ── Quick Administrative Shortcuts ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/admin/users"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 hover:border-purple-300 hover:shadow-xs transition-all group"
          >
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Users size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Manage Users</p>
              <p className="text-[10px] text-slate-500">Account status & roles</p>
            </div>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 hover:border-purple-300 hover:shadow-xs transition-all group"
          >
            <div className="rounded-lg bg-amber-50 p-2 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Package size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Catalog Oversight</p>
              <p className="text-[10px] text-slate-500">Stock & publish status</p>
            </div>
          </Link>

          <Link
            href="/admin/reviews"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 hover:border-purple-300 hover:shadow-xs transition-all group"
          >
            <div className="rounded-lg bg-purple-50 p-2 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Moderate Reviews</p>
              <p className="text-[10px] text-slate-500">Approve or hide ratings</p>
            </div>
          </Link>

          <Link
            href="/admin/returns"
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 hover:border-purple-300 hover:shadow-xs transition-all group"
          >
            <div className="rounded-lg bg-red-50 p-2 text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
              <RotateCcw size={16} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800">Returns Queue</p>
              <p className="text-[10px] text-slate-500">Process refund requests</p>
            </div>
          </Link>
        </div>

        {/* ── Recent Activity Grids ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Column 1: Recent Orders */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag size={16} className="text-purple-600" />
                Recent Orders
              </h2>
              <Link
                href="/admin/orders"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : !stats?.recentOrders || stats.recentOrders.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No orders placed on platform yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 flex-1">
                {stats.recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-mono">
                          #{order.id.slice(-8)}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            order.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : order.status === 'shipped'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] truncate mt-0.5">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''} • {order.shippingAddress?.fullName || 'Customer'}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-slate-900">{formatPrice(order.total)}</p>
                      <p className="text-[10px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column 2: Return Requests & Action Queue */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw size={16} className="text-red-600" />
                Returns & Refund Requests
              </h2>
              <Link
                href="/admin/returns"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <span>View All ({stats?.pendingReturns ?? 0})</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : !stats?.recentReturns || stats.recentReturns.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No active return or refund requests.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 flex-1">
                {stats.recentReturns.map((req) => (
                  <div
                    key={req.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 truncate max-w-[180px]">
                          {req.itemTitle}
                        </span>
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            req.status === 'REFUNDED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : req.status === 'RETURN_APPROVED'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {req.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] truncate mt-0.5">
                        Reason: {req.reason}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-bold text-slate-900">{formatPrice(req.refundAmount)}</p>
                      <Link
                        href="/admin/returns"
                        className="text-[10px] text-purple-600 hover:underline font-semibold"
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
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users size={16} className="text-blue-600" />
              Recent Accounts
            </h2>
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <span>Manage All Users</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="py-4 text-center text-xs text-slate-400">Loading user accounts...</div>
          ) : !stats?.recentUsers || stats.recentUsers.length === 0 ? (
            <div className="py-4 text-center text-xs text-slate-400">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2">User</th>
                    <th className="py-2">Role</th>
                    <th className="py-2">Account Status</th>
                    <th className="py-2">Joined</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recentUsers.map((u) => (
                    <tr key={u.uid} className="hover:bg-slate-50/70">
                      <td className="py-2.5 font-medium text-slate-900">
                        <div className="flex flex-col">
                          <span className="font-semibold">{u.displayName || 'Customer'}</span>
                          <span className="text-[11px] text-slate-400">{u.email}</span>
                        </div>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : u.role === 'seller'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-semibold ${
                            u.status === 'suspended' ? 'text-red-600' : 'text-emerald-600'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              u.status === 'suspended' ? 'bg-red-500' : 'bg-emerald-500'
                            }`}
                          />
                          {u.status === 'suspended' ? 'Suspended' : 'Active'}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-500 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 text-right">
                        <Link
                          href={`/admin/users?q=${encodeURIComponent(u.email || u.uid)}`}
                          className="text-purple-600 hover:text-purple-800 font-semibold text-[11px]"
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
