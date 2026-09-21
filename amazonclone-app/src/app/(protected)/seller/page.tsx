'use client';
// ============================================================================
// Seller Central — Main Dashboard Overview
// Real-time metrics computed directly from Firebase RTDB
// ============================================================================
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Package,
  Boxes,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  DollarSign,
  Truck,
  ShoppingCart,
} from 'lucide-react';
import { SellerLayout } from '@/components/seller/SellerLayout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchSellerAnalytics,
  fetchSellerOrders,
  type SellerOrderRecord,
} from '@/services/sellerService';
import type { SellerAnalyticsMetrics } from '@/types';

export default function SellerDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<SellerAnalyticsMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<SellerOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    async function loadDashboard() {
      setLoading(true);
      try {
        const [analyticsRes, ordersRes] = await Promise.all([
          fetchSellerAnalytics(user!.uid),
          fetchSellerOrders(user!.uid),
        ]);

        if (analyticsRes.success && analyticsRes.data) {
          setMetrics(analyticsRes.data);
        }
        if (ordersRes.success && ordersRes.data) {
          setRecentOrders(ordersRes.data.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load seller dashboard', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [user]);

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* ── Welcome & Top Actions Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Seller Dashboard
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Store performance overview for{' '}
              <strong className="text-gray-800 font-semibold">{user?.displayName}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/seller/products/new">
              <Button variant="buy-now" className="text-xs font-bold px-4 py-2 flex items-center gap-1.5 shadow-xs">
                <PlusCircle size={15} />
                <span>Add Product</span>
              </Button>
            </Link>
            <Link href="/seller/orders">
              <Button variant="secondary" className="text-xs font-semibold px-4 py-2">
                View Orders
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Low Stock Alert Banner (if applicable) ── */}
        {metrics && metrics.lowStockProducts > 0 && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-amber-900">
              <AlertTriangle size={20} className="text-amber-600 flex-shrink-0" />
              <div>
                <span className="font-bold">Low Inventory Warning: </span>
                <span>
                  You have <strong>{metrics.lowStockProducts}</strong> products with 5 or fewer items remaining.
                </span>
              </div>
            </div>
            <Link
              href="/seller/inventory"
              className="text-xs font-bold text-amazon-link hover:underline whitespace-nowrap"
            >
              Update stock in Inventory &rarr;
            </Link>
          </div>
        )}

        {/* ── KPI Metric Cards Grid ── */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-28 bg-white rounded-xl border border-gray-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
                <DollarSign size={18} className="text-green-600" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-extrabold text-gray-900">
                  ${(metrics?.totalRevenue || 0).toFixed(2)}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {metrics?.totalUnitsSold || 0} units sold
                </p>
              </div>
            </div>

            {/* Total Active Products */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Listings</span>
                <Package size={18} className="text-blue-600" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-extrabold text-gray-900">
                  {metrics?.activeProducts || 0}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  of {metrics?.totalProducts || 0} total listings
                </p>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Pending Orders</span>
                <Clock size={18} className="text-amber-500" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-extrabold text-gray-900">
                  {metrics?.pendingOrdersCount || 0}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Requires fulfillment
                </p>
              </div>
            </div>

            {/* Total Orders */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
                <Truck size={18} className="text-purple-600" />
              </div>
              <div className="mt-3">
                <p className="text-2xl font-extrabold text-gray-900">
                  {metrics?.totalOrders || 0}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Lifetime orders placed
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Recent Orders Strip ── */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-gray-900">Recent Customer Orders</h2>
              <p className="text-xs text-gray-500">Latest orders containing your products</p>
            </div>
            <Link
              href="/seller/orders"
              className="text-xs font-semibold text-amazon-link hover:underline flex items-center gap-1"
            >
              <span>View all orders</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500">
              No orders have been placed for your products yet. When customers make purchases, orders will appear here for fulfillment.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentOrders.map((rec) => (
                <div
                  key={rec.order.id}
                  className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gray-900">
                        {rec.order.id}
                      </span>
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 uppercase">
                        {rec.order.status}
                      </span>
                    </div>
                    <p className="text-gray-500 text-[11px]">
                      Customer: <strong className="text-gray-700">{rec.order.shippingAddress.fullName}</strong> ({rec.order.shippingAddress.city}, {rec.order.shippingAddress.state})
                    </p>
                    <p className="text-gray-400 text-[10px]">
                      {new Date(rec.order.createdAt).toLocaleDateString()} at{' '}
                      {new Date(rec.order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="block font-bold text-gray-900 text-sm">
                        ${rec.sellerTotal.toFixed(2)}
                      </span>
                      <span className="text-[11px] text-gray-500">
                        {rec.sellerItems.reduce((s, i) => s + i.quantity, 0)} items
                      </span>
                    </div>

                    <Link href="/seller/orders">
                      <Button variant="secondary" size="sm" className="text-xs px-3 py-1">
                        Fulfill
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Top Selling Products / Quick Stock Review ── */}
        {metrics && metrics.topProducts.length > 0 && (
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
              Top Products by Sales
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.topProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3 rounded-lg border border-gray-100 p-3 bg-gray-50/50"
                >
                  <div className="relative h-14 w-14 rounded border bg-white p-1 flex-shrink-0">
                    <Image
                      src={p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120'}
                      alt={p.title}
                      fill
                      sizes="56px"
                      className="object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="font-semibold text-gray-900 line-clamp-1">
                      {p.title}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {p.unitsSold} units sold · <strong className="text-green-700">${p.revenue.toFixed(2)}</strong>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      Stock: <span className={p.stock <= 5 ? 'text-red-600 font-bold' : 'text-gray-700 font-semibold'}>{p.stock} available</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
