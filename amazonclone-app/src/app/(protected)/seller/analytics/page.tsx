'use client';
// ============================================================================
// Seller Analytics Page — /seller/analytics
// Performance metrics, revenue, unit sales, and top selling products
// ============================================================================
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Package,
  ShoppingBag,
  Award,
  Boxes,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { SellerLayout } from '@/components/seller/SellerLayout';
import { useAuth } from '@/hooks/useAuth';
import { fetchSellerAnalytics } from '@/services/sellerService';
import type { SellerAnalyticsMetrics } from '@/types';

export default function SellerAnalyticsPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SellerAnalyticsMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      setLoading(true);
      try {
        const res = await fetchSellerAnalytics(user!.uid);
        if (res.success && res.data) {
          setMetrics(res.data);
        }
      } catch (err) {
        console.error('Failed to load seller analytics', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const avgOrderValue =
    metrics && metrics.totalOrders > 0
      ? metrics.totalRevenue / metrics.totalOrders
      : 0;

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* ── Page Header ── */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Sales &amp; Performance Analytics</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time financial performance, product sales velocity, and inventory statistics
          </p>
        </div>

        {/* ── Core KPI Cards ── */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-28 bg-white rounded-xl border border-gray-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Sales Revenue */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase">Total Sales</span>
                <DollarSign size={18} className="text-green-600" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">
                ${(metrics?.totalRevenue || 0).toFixed(2)}
              </p>
              <p className="text-[11px] text-green-700 font-semibold mt-1 flex items-center gap-0.5">
                <ArrowUpRight size={13} />
                <span>Gross marketplace revenue</span>
              </p>
            </div>

            {/* Total Units Sold */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase">Units Sold</span>
                <ShoppingBag size={18} className="text-blue-600" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">
                {metrics?.totalUnitsSold || 0}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Across {metrics?.totalOrders || 0} orders
              </p>
            </div>

            {/* Average Order Value */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase">Avg Order Value</span>
                <TrendingUp size={18} className="text-amazon-orange" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">
                ${avgOrderValue.toFixed(2)}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                Per customer transaction
              </p>
            </div>

            {/* Active Products */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-gray-500 mb-2">
                <span className="text-xs font-semibold uppercase">Catalog Health</span>
                <Package size={18} className="text-amber-500" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">
                {metrics?.activeProducts || 0}
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                {metrics?.outOfStockProducts || 0} out of stock · {metrics?.lowStockProducts || 0} low stock
              </p>
            </div>
          </div>
        )}

        {/* ── Top Selling Products Leaderboard ── */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
            <Award size={18} className="text-amazon-orange" />
            <div>
              <h2 className="text-base font-bold text-gray-900">Top Performing Products</h2>
              <p className="text-xs text-gray-500">Ranked by unit sales volume and generated revenue</p>
            </div>
          </div>

          {!metrics || metrics.topProducts.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500">
              No sales data recorded yet. Once orders are placed, product performance rankings will be visualized here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-50 text-gray-600 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Rank</th>
                    <th className="px-4 py-2.5 text-left">Product</th>
                    <th className="px-4 py-2.5 text-center">Units Sold</th>
                    <th className="px-4 py-2.5 text-right">Revenue Generated</th>
                    <th className="px-4 py-2.5 text-center">Stock Remaining</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {metrics.topProducts.map((prod, idx) => (
                    <tr key={prod.id} className="hover:bg-gray-50/60">
                      <td className="px-4 py-3 font-bold text-gray-700">
                        #{idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded border bg-white p-0.5 flex-shrink-0">
                            <Image
                              src={prod.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'}
                              alt={prod.title}
                              fill
                              sizes="40px"
                              className="object-contain"
                            />
                          </div>
                          <span className="font-semibold text-gray-900 line-clamp-1 max-w-sm">
                            {prod.title}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-gray-900">
                        {prod.unitsSold}
                      </td>
                      <td className="px-4 py-3 text-right font-extrabold text-green-700">
                        ${prod.revenue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            prod.stock <= 0
                              ? 'bg-red-100 text-red-700'
                              : prod.stock <= 5
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {prod.stock} left
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
}
