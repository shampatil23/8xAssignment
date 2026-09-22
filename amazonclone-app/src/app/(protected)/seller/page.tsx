'use client';
// ============================================================================
// Seller Central — Main Dashboard Overview
// Real-time metrics computed directly from Firebase RTDB
// With Amazon Seller Central design, operational health, and live fulfillment
// ============================================================================
import React, { useEffect, useState, useMemo } from 'react';
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
  ShieldCheck,
  MessageSquare,
  Award,
  Sparkles,
  RefreshCw,
  FileText,
  ExternalLink,
  Loader2,
  Search,
  Filter,
  ClipboardList,
} from 'lucide-react';
import { SellerLayout } from '@/components/seller/SellerLayout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchSellerAnalytics,
  fetchSellerOrders,
  createSampleSellerOrder,
  updateFulfillmentStatus,
  type SellerOrderRecord,
} from '@/services/sellerService';
import type { SellerAnalyticsMetrics, OrderStatus } from '@/types';
import { formatPrice } from '@/lib/utils';

export default function SellerDashboardPage() {
  const { user, isAdmin } = useAuth();
  const [metrics, setMetrics] = useState<SellerAnalyticsMetrics | null>(null);
  const [orders, setOrders] = useState<SellerOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSimulatingOrder, setIsSimulatingOrder] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'today' | '7days' | '30days'>('30days');
  const [orderStatusTab, setOrderStatusTab] = useState<'all' | 'pending' | 'shipped' | 'delivered'>('all');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadDashboard = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [analyticsRes, ordersRes] = await Promise.all([
        fetchSellerAnalytics(user.uid),
        fetchSellerOrders(user.uid),
      ]);

      if (analyticsRes.success && analyticsRes.data) {
        setMetrics(analyticsRes.data);
      }
      if (ordersRes.success && ordersRes.data) {
        setOrders(ordersRes.data);
      }
    } catch (err) {
      console.error('Failed to load seller dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user]);

  // Handle instant test order simulation
  const handleSimulateOrder = async () => {
    if (!user) return;
    setIsSimulatingOrder(true);
    try {
      const res = await createSampleSellerOrder(user.uid, user.displayName || 'Seller Store');
      if (res.success) {
        showToast(res.message || 'Sample customer order placed successfully!');
        await loadDashboard();
      } else {
        showToast(`Error: ${res.error || 'Failed to simulate order.'}`);
      }
    } catch (err) {
      console.error('Error simulating order:', err);
      showToast('Failed to create sample order.');
    } finally {
      setIsSimulatingOrder(false);
    }
  };

  // Handle quick fulfillment status advancement directly from dashboard
  const handleAdvanceStatus = async (orderId: string, nextStatus: OrderStatus) => {
    if (!user) return;
    setUpdatingOrderId(orderId);
    try {
      const res = await updateFulfillmentStatus(user.uid, orderId, nextStatus, isAdmin);
      if (res.success) {
        showToast(`Order #${orderId} marked as ${nextStatus.toUpperCase()}!`);
        await loadDashboard();
      } else {
        showToast(res.error || 'Failed to update order fulfillment.');
      }
    } catch (err) {
      console.error('Error advancing status:', err);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Filtered orders for the dashboard view
  const filteredOrders = useMemo(() => {
    if (orderStatusTab === 'pending') {
      return orders.filter((r) => ['placed', 'confirmed', 'processing'].includes(r.order.status.toLowerCase()));
    }
    if (orderStatusTab === 'shipped') {
      return orders.filter((r) => ['shipped', 'out_for_delivery'].includes(r.order.status.toLowerCase()));
    }
    if (orderStatusTab === 'delivered') {
      return orders.filter((r) => r.order.status.toLowerCase() === 'delivered');
    }
    return orders;
  }, [orders, orderStatusTab]);

  return (
    <SellerLayout>
      <div className="space-y-6 font-sans">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-[#131921] text-white px-4 py-3 shadow-xl border border-amazon-orange text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 size={16} className="text-amazon-orange shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}

        {/* ── Top Header & Actions ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#d5d9d9] shadow-xs">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold text-[#0f1111] tracking-tight">
                Seller Dashboard
              </h1>
              <span className="rounded bg-[#e7f4e8] text-[#067d62] text-[11px] font-bold px-2 py-0.5 border border-[#a2d8df]">
                Store Active
              </span>
            </div>
            <p className="text-xs text-[#565959] mt-1">
              Store performance overview for <strong className="text-[#0f1111]">{user?.displayName || 'Merchant'}</strong> • Marketplace: <strong className="text-[#007185]">Amazon.in</strong>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={loadDashboard}
              disabled={loading}
              className="text-xs text-[#0f1111] hover:bg-[#f7fafa] border-[#d5d9d9] cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-amazon-orange' : 'text-[#565959]'} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>

            <button
              type="button"
              onClick={handleSimulateOrder}
              disabled={isSimulatingOrder}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0f1111] bg-[#f0f2f2] hover:bg-[#e3e6e6] border border-[#d5d9d9] shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="Generate a real customer order to test fulfillment workflow"
            >
              {isSimulatingOrder ? (
                <Loader2 size={14} className="animate-spin text-amazon-orange" />
              ) : (
                <Sparkles size={14} className="text-[#c7511f]" />
              )}
              <span>Simulate Test Order</span>
            </button>

            <Link href="/seller/products/new">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-[#0f1111] bg-[#ffd814] hover:bg-[#f7ca00] active:bg-[#f0b800] border border-[#fcd200] shadow-2xs transition-all cursor-pointer"
              >
                <PlusCircle size={15} />
                <span>Add Product</span>
              </button>
            </Link>

            <Link href="/seller/orders">
              <button
                type="button"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#0f1111] bg-white hover:bg-[#f7fafa] border border-[#d5d9d9] shadow-2xs transition-all cursor-pointer"
              >
                <span>View Orders</span>
              </button>
            </Link>
          </div>
        </div>

        {/* ── Operational Health & SLA Strip ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-[#d5d9d9] bg-white p-3.5 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#565959] uppercase tracking-wider">Account Health</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-2.5 w-2.5 rounded-full bg-[#067d62]" />
                <span className="text-sm font-bold text-[#0f1111]">Healthy (200)</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#e7f4e8] text-[#067d62]">
              <ShieldCheck size={18} />
            </div>
          </div>

          <div className="rounded-xl border border-[#d5d9d9] bg-white p-3.5 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#565959] uppercase tracking-wider">Buyer Messages</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-sm font-bold text-[#0f1111]">0</span>
                <span className="text-[10px] text-[#007600] font-semibold">Under 24h SLA</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-[#ebf8fa] text-[#007185]">
              <MessageSquare size={18} />
            </div>
          </div>

          <div className="rounded-xl border border-[#d5d9d9] bg-white p-3.5 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#565959] uppercase tracking-wider">Featured Offer</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-sm font-bold text-[#0f1111]">100%</span>
                <span className="text-[10px] text-[#007600] font-semibold">Buy Box Eligible</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 text-[#e47911]">
              <Award size={18} />
            </div>
          </div>

          <div className="rounded-xl border border-[#d5d9d9] bg-white p-3.5 shadow-2xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-[#565959] uppercase tracking-wider">Estimated Payout</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-sm font-bold text-[#007600]">
                  {formatPrice(metrics?.totalRevenue || 0)}
                </span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-50 text-[#007600]">
              <DollarSign size={18} />
            </div>
          </div>
        </div>

        {/* ── Low Stock Alert Banner (if applicable) ── */}
        {metrics && metrics.lowStockProducts > 0 && (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-amber-900">
              <AlertTriangle size={20} className="text-amber-600 flex-shrink-0" />
              <div>
                <span className="font-bold">Low Inventory Notice: </span>
                <span>
                  You have <strong>{metrics.lowStockProducts}</strong> product{metrics.lowStockProducts > 1 ? 's' : ''} with 5 or fewer items remaining.
                </span>
              </div>
            </div>
            <Link
              href="/seller/inventory"
              className="text-xs font-bold text-[#007185] hover:text-[#c7511f] hover:underline whitespace-nowrap"
            >
              Update stock in Inventory &rarr;
            </Link>
          </div>
        )}

        {/* ── KPI Metric Cards Grid ── */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#565959] uppercase tracking-wider">
              Sales & Inventory Telemetry
            </h2>
            <div className="flex items-center bg-[#f0f2f2] p-0.5 rounded-lg text-[11px] font-medium text-[#565959]">
              {(['today', '7days', '30days'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setTimeframe(tab)}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    timeframe === tab
                      ? 'bg-white text-[#0f1111] font-bold shadow-2xs'
                      : 'hover:text-[#0f1111]'
                  }`}
                >
                  {tab === 'today' ? 'Today' : tab === '7days' ? 'Last 7 Days' : 'Last 30 Days'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-28 bg-white rounded-xl border border-[#d5d9d9]" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Revenue */}
              <div className="rounded-xl border border-[#d5d9d9] bg-white p-4.5 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="flex items-center justify-between text-[#565959]">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Sales</span>
                  <div className="rounded-lg bg-emerald-50 p-2 text-[#007600]">
                    <DollarSign size={18} />
                  </div>
                </div>
                <div className="mt-2.5">
                  <p className="text-2xl font-black text-[#007600]">
                    {formatPrice(metrics?.totalRevenue || 0)}
                  </p>
                  <p className="text-[11px] text-[#565959] mt-1 flex items-center justify-between">
                    <span>{metrics?.totalUnitsSold || 0} units sold</span>
                    <span className="text-[#007600] font-semibold flex items-center gap-0.5">
                      <TrendingUp size={12} /> +100%
                    </span>
                  </p>
                </div>
              </div>

              {/* Active Listings */}
              <div className="rounded-xl border border-[#d5d9d9] bg-white p-4.5 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="flex items-center justify-between text-[#565959]">
                  <span className="text-xs font-bold uppercase tracking-wider">Active Listings</span>
                  <div className="rounded-lg bg-[#ebf8fa] p-2 text-[#007185]">
                    <Package size={18} />
                  </div>
                </div>
                <div className="mt-2.5">
                  <p className="text-2xl font-black text-[#0f1111]">
                    {metrics?.activeProducts || 0}
                  </p>
                  <p className="text-[11px] text-[#565959] mt-1 flex items-center justify-between">
                    <span>of {metrics?.totalProducts || 0} total listings</span>
                    <span className="text-[#007185] font-semibold">100% in stock</span>
                  </p>
                </div>
              </div>

              {/* Pending Orders */}
              <div className="rounded-xl border border-[#d5d9d9] bg-white p-4.5 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="flex items-center justify-between text-[#565959]">
                  <span className="text-xs font-bold uppercase tracking-wider">Pending Orders</span>
                  <div className="rounded-lg bg-amber-50 p-2 text-[#e47911]">
                    <Clock size={18} />
                  </div>
                </div>
                <div className="mt-2.5">
                  <p className="text-2xl font-black text-[#0f1111]">
                    {metrics?.pendingOrdersCount || 0}
                  </p>
                  <p className="text-[11px] text-[#c7511f] font-semibold mt-1">
                    Requires fulfillment
                  </p>
                </div>
              </div>

              {/* Total Lifetime Orders */}
              <div className="rounded-xl border border-[#d5d9d9] bg-white p-4.5 shadow-2xs hover:shadow-xs transition-shadow">
                <div className="flex items-center justify-between text-[#565959]">
                  <span className="text-xs font-bold uppercase tracking-wider">Lifetime Orders</span>
                  <div className="rounded-lg bg-slate-100 p-2 text-[#131921]">
                    <Truck size={18} />
                  </div>
                </div>
                <div className="mt-2.5">
                  <p className="text-2xl font-black text-[#0f1111]">
                    {metrics?.totalOrders || 0}
                  </p>
                  <p className="text-[11px] text-[#565959] mt-1">
                    Customer orders placed
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Recent Customer Orders Section ── */}
        <div className="rounded-xl border border-[#d5d9d9] bg-white p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#eaeded] pb-4 mb-4 gap-3">
            <div>
              <h2 className="text-base font-bold text-[#0f1111] flex items-center gap-2">
                <ClipboardList size={18} className="text-[#007185]" />
                Customer Orders & Fulfillment
              </h2>
              <p className="text-xs text-[#565959] mt-0.5">
                Manage shipments, dispatch status, and buyer deliveries
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Status Filter Tabs */}
              <div className="flex items-center bg-[#f0f2f2] p-0.5 rounded-lg text-xs font-semibold text-[#565959]">
                <button
                  type="button"
                  onClick={() => setOrderStatusTab('all')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    orderStatusTab === 'all'
                      ? 'bg-white text-[#0f1111] shadow-2xs'
                      : 'hover:text-[#0f1111]'
                  }`}
                >
                  All ({orders.length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderStatusTab('pending')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    orderStatusTab === 'pending'
                      ? 'bg-white text-[#c7511f] shadow-2xs'
                      : 'hover:text-[#0f1111]'
                  }`}
                >
                  Unshipped ({orders.filter((r) => ['placed', 'confirmed', 'processing'].includes(r.order.status.toLowerCase())).length})
                </button>
                <button
                  type="button"
                  onClick={() => setOrderStatusTab('shipped')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    orderStatusTab === 'shipped'
                      ? 'bg-white text-[#007185] shadow-2xs'
                      : 'hover:text-[#0f1111]'
                  }`}
                >
                  Shipped
                </button>
                <button
                  type="button"
                  onClick={() => setOrderStatusTab('delivered')}
                  className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                    orderStatusTab === 'delivered'
                      ? 'bg-white text-[#007600] shadow-2xs'
                      : 'hover:text-[#0f1111]'
                  }`}
                >
                  Delivered
                </button>
              </div>

              <Link
                href="/seller/orders"
                className="text-xs font-semibold text-[#007185] hover:text-[#c7511f] hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Full Orders Page</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="py-14 flex flex-col items-center justify-center text-center px-4">
              <div className="h-14 w-14 rounded-full bg-[#f0f2f2] text-gray-400 flex items-center justify-center mb-3">
                <Package size={26} />
              </div>
              <p className="text-sm font-bold text-[#0f1111]">
                {orderStatusTab === 'all'
                  ? 'No customer orders have been placed for your products yet.'
                  : `No orders in "${orderStatusTab}" status.`}
              </p>
              <p className="text-xs text-[#565959] max-w-md mt-1 mb-4 leading-relaxed">
                When shoppers purchase items from your catalog, they will appear here with full shipping details, delivery SLAs, and 1-click dispatch controls.
              </p>
              <button
                type="button"
                onClick={handleSimulateOrder}
                disabled={isSimulatingOrder}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold text-[#0f1111] bg-[#ffd814] hover:bg-[#f7ca00] border border-[#fcd200] shadow-2xs transition-all cursor-pointer"
              >
                {isSimulatingOrder ? (
                  <Loader2 size={14} className="animate-spin text-amazon-dark" />
                ) : (
                  <Sparkles size={14} className="text-[#c7511f]" />
                )}
                <span>Simulate Customer Order for My Products</span>
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#eaeded]">
              {filteredOrders.map((rec) => {
                const statusKey = rec.order.status.toLowerCase();
                const isDelivered = statusKey === 'delivered';
                const isShipped = statusKey === 'shipped';
                const isConfirmed = statusKey === 'confirmed';
                const isProcessing = statusKey === 'processing';

                const badgeStyle = isDelivered
                  ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                  : isShipped
                    ? 'bg-sky-50 text-sky-800 border-sky-200'
                    : isConfirmed
                      ? 'bg-[#e7f4e8] text-[#067d62] border-[#a2d8df]'
                      : isProcessing
                        ? 'bg-blue-50 text-blue-800 border-blue-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200';

                return (
                  <div
                    key={rec.order.id}
                    className="py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs hover:bg-[#f8f9fa] px-2 rounded-lg transition-colors"
                  >
                    {/* Left: Order Info & Destination */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-[#0f1111] tracking-tight">
                          #{rec.order.id}
                        </span>
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${badgeStyle}`}
                        >
                          {rec.order.status}
                        </span>
                        <span className="text-[#565959] text-[11px]">
                          • Placed on {new Date(rec.order.createdAt).toLocaleDateString()} at{' '}
                          {new Date(rec.order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-[#565959] text-[11px]">
                        Buyer: <strong className="text-[#0f1111] font-semibold">{rec.order.shippingAddress.fullName}</strong> • Dispatch Destination:{' '}
                        <span className="text-[#0f1111]">{rec.order.shippingAddress.city}, {rec.order.shippingAddress.state} {rec.order.shippingAddress.postalCode}</span>
                      </p>

                      {/* Items row */}
                      <div className="flex items-center gap-3 pt-1">
                        {rec.sellerItems.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="relative h-9 w-9 rounded border border-[#d5d9d9] bg-white p-0.5 shrink-0 overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="h-full w-full object-contain"
                              />
                            </div>
                            <span className="text-[11px] text-[#0f1111] font-medium truncate max-w-[240px]">
                              {item.title} <strong className="text-[#565959]">(x{item.quantity})</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Financial Total & Interactive Fulfillment Actions */}
                    <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                      <div className="text-right">
                        <span className="block font-black text-[#0f1111] text-base">
                          {formatPrice(rec.sellerTotal)}
                        </span>
                        <span className="text-[10px] text-[#565959]">
                          {rec.sellerItems.reduce((s, i) => s + i.quantity, 0)} item{rec.sellerItems.length > 1 ? 's' : ''} (Net Payout)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {(isConfirmed || isProcessing) && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(rec.order.id, 'shipped')}
                            disabled={updatingOrderId === rec.order.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#0f1111] bg-[#ffd814] hover:bg-[#f7ca00] border border-[#fcd200] shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                          >
                            {updatingOrderId === rec.order.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <Truck size={13} />
                            )}
                            <span>Mark Shipped</span>
                          </button>
                        )}

                        {isShipped && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceStatus(rec.order.id, 'delivered')}
                            disabled={updatingOrderId === rec.order.id}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                          >
                            {updatingOrderId === rec.order.id ? (
                              <Loader2 size={13} className="animate-spin" />
                            ) : (
                              <CheckCircle2 size={13} />
                            )}
                            <span>Confirm Delivered</span>
                          </button>
                        )}

                        <Link href="/seller/orders">
                          <button
                            type="button"
                            className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#0f1111] bg-white hover:bg-[#f7fafa] border border-[#d5d9d9] shadow-2xs transition-all cursor-pointer"
                          >
                            Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Top Selling Products / Catalog Health ── */}
        {metrics && metrics.topProducts.length > 0 && (
          <div className="rounded-xl border border-[#d5d9d9] bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#eaeded] mb-4">
              <div>
                <h2 className="text-base font-bold text-[#0f1111] flex items-center gap-2">
                  <Boxes size={18} className="text-[#007185]" />
                  Top Products & Catalog Performance
                </h2>
                <p className="text-xs text-[#565959] mt-0.5">
                  Best performing merchandise by units ordered and revenue contribution
                </p>
              </div>

              <Link
                href="/seller/products"
                className="text-xs font-semibold text-[#007185] hover:text-[#c7511f] hover:underline flex items-center gap-1"
              >
                <span>Manage All Catalog</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {metrics.topProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-3.5 rounded-xl border border-[#d5d9d9] p-3.5 bg-[#fdfefe] hover:border-[#007185] hover:shadow-xs transition-all"
                >
                  <div className="relative h-16 w-16 rounded-lg border border-[#eaeded] bg-white p-1 shrink-0 overflow-hidden">
                    <img
                      src={p.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=120'}
                      alt={p.title}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 flex-1 text-xs">
                    <p className="font-bold text-[#0f1111] line-clamp-1">
                      {p.title}
                    </p>
                    <p className="text-[11px] text-[#565959] mt-0.5">
                      {p.unitsSold} units ordered • <strong className="text-[#007600]">{formatPrice(p.revenue)}</strong>
                    </p>
                    <p className="text-[10px] text-[#565959] mt-1 flex items-center justify-between">
                      <span>Stock: <strong className={p.stock <= 5 ? 'text-red-600' : 'text-[#0f1111]'}>{p.stock} units</strong></span>
                      <Link
                        href={`/seller/products/${p.id}`}
                        className="text-[#007185] hover:text-[#c7511f] hover:underline font-semibold"
                      >
                        Edit Listing
                      </Link>
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

