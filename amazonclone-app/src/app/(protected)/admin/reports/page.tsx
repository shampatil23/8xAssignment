'use client';
// ============================================================================
// Admin Reports & Analytics — Platform Metrics, Financials, and Distribution
// ============================================================================
import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Users,
  Package,
  Layers,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { fetchPlatformAnalytics, type PlatformAnalyticsData } from '@/services/adminService';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';

export default function AdminReportsPage() {
  const [data, setData] = useState<PlatformAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    const res = await fetchPlatformAnalytics();
    if (res.success && res.data) {
      setData(res.data);
    } else {
      setError(res.error || 'Failed to aggregate platform analytics.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-purple-600" />
              Platform Analytics & Reports
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live executive summary across financial volume, sales performance, catalog velocity, and member growth.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalytics}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs text-slate-700"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Analytics</span>
          </Button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-800 text-xs">
            <AlertCircle size={18} className="shrink-0 text-red-600" />
            <span className="flex-1">{error}</span>
            <button
              onClick={loadAnalytics}
              className="font-bold underline hover:text-red-950 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Financial KPIs ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Gross Merchandise Value (GMV)</span>
              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600">
                <DollarSign size={18} />
              </div>
            </div>
            <p className="mt-2 text-3xl font-black text-emerald-700">
              {loading ? '—' : formatPrice(data?.gmv ?? 0)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Total sales revenue across all completed & processing orders
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Total Transactions</span>
              <div className="rounded-lg bg-purple-50 p-2 text-purple-600">
                <ShoppingBag size={18} />
              </div>
            </div>
            <p className="mt-2 text-3xl font-black text-slate-900">
              {loading ? '—' : data?.totalOrders ?? 0}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Cumulative customer orders placed
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span className="text-xs font-bold uppercase tracking-wider">Average Order Value (AOV)</span>
              <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                <TrendingUp size={18} />
              </div>
            </div>
            <p className="mt-2 text-3xl font-black text-blue-700">
              {loading ? '—' : formatPrice(data?.avgOrderValue ?? 0)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Average basket size per customer checkout
            </p>
          </div>
        </div>

        {/* ── Order Status & User Distribution ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status Breakdown */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <ShoppingBag size={16} className="text-purple-600" />
                Order Status Distribution
              </h2>

              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">Aggregating order statuses...</div>
              ) : !data?.statusBreakdown || Object.keys(data.statusBreakdown).length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">No orders recorded.</div>
              ) : (
                <div className="mt-4 space-y-3">
                  {Object.entries(data.statusBreakdown).map(([status, count]) => {
                    const percentage = data.totalOrders > 0 ? Math.round((count / data.totalOrders) * 100) : 0;
                    return (
                      <div key={status} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span className="capitalize">{status.replace('_', ' ')}</span>
                          <span>{count} orders ({percentage}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              status === 'delivered'
                                ? 'bg-emerald-500'
                                : status === 'shipped'
                                  ? 'bg-blue-500'
                                  : status === 'cancelled'
                                    ? 'bg-red-500'
                                    : 'bg-amber-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* User Base Growth & Roles */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
                <Users size={16} className="text-blue-600" />
                Platform Membership Distribution
              </h2>

              {loading ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading user distribution...</div>
              ) : (
                <div className="mt-4 space-y-3">
                  {data?.userRoleDistribution.map((item) => {
                    const totalUsers = data.userRoleDistribution.reduce((acc, i) => acc + i.count, 0);
                    const percentage = totalUsers > 0 ? Math.round((item.count / totalUsers) * 100) : 0;
                    return (
                      <div key={item.role} className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{item.role}</span>
                          <span>{item.count} accounts ({percentage}%)</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.role === 'Customers'
                                ? 'bg-blue-500'
                                : item.role === 'Sellers'
                                  ? 'bg-amber-500'
                                  : 'bg-purple-600'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Top Selling Products & Category Inventory ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Products */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Package size={16} className="text-amber-600" />
              Top Performing Products
            </h2>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading top products...</div>
            ) : !data?.topSellingProducts || data.topSellingProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No product sales yet.</div>
            ) : (
              <div className="mt-3 divide-y divide-slate-100">
                {data.topSellingProducts.map((p, idx) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="font-mono font-bold text-slate-400 w-4">#{idx + 1}</span>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate max-w-xs">{p.title}</p>
                        <p className="text-[10px] text-slate-400">{p.unitsSold} units sold</p>
                      </div>
                    </div>
                    <span className="font-black text-emerald-700">{formatPrice(p.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Inventory Breakdown */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Layers size={16} className="text-purple-600" />
              Category Inventory Breakdown
            </h2>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading category counts...</div>
            ) : !data?.categoryBreakdown || data.categoryBreakdown.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No categories found.</div>
            ) : (
              <div className="mt-3 divide-y divide-slate-100">
                {data.categoryBreakdown.map((cat) => (
                  <div key={cat.category} className="py-2.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{cat.category}</span>
                    <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                      {cat.count} product listings
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
