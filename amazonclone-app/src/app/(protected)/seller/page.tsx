'use client';
// ============================================================================
// Valenza Maison — Partner Atelier Central Dashboard
// Ultra-Luxury Interface: Obsidian, Champagne Gold, Real-time Analytics & Fulfillment
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
  Crown,
  Gem,
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
      console.error('Failed to load atelier dashboard', err);
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
        showToast(res.message || 'Sample client commission placed successfully!');
        await loadDashboard();
      } else {
        showToast(`Error: ${res.error || 'Failed to simulate order.'}`);
      }
    } catch (err) {
      showToast(`Error: ${(err as Error).message}`);
    } finally {
      setIsSimulatingOrder(false);
    }
  };

  // Handle quick fulfillment advance
  const handleAdvanceStatus = async (orderId: string, nextStatus: OrderStatus) => {
    if (!user) return;
    setUpdatingOrderId(orderId);
    try {
      const res = await updateFulfillmentStatus(user.uid, orderId, nextStatus, isAdmin);
      if (res.success) {
        showToast(`Commission #${orderId} marked as ${nextStatus.toUpperCase()}`);
        await loadDashboard();
      } else {
        showToast(`Error: ${res.error || 'Failed to update fulfillment state.'}`);
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
      <div className="space-y-7 text-[#141312] dark:text-[#f8f5ee]">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-[#141312] dark:bg-[#1c2230] text-[#f8f5ee] px-5 py-3.5 shadow-2xl border border-[#c5a059]/50 text-xs flex items-center gap-3 animate-fade-in">
            <CheckCircle2 size={16} className="text-[#dfba73] shrink-0" />
            <span className="font-serif font-medium">{toastMessage}</span>
          </div>
        )}

        {/* ── Top Header & Actions ── */}
        <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 backdrop-blur-xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(26,23,20,0.03)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)] flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f6f1e6] dark:bg-[#1c2333] border border-[#d6be90]/40 dark:border-[#c5a059]/30 text-[10px] font-serif font-bold uppercase tracking-[0.24em] text-[#8a6827] dark:text-[#dfba73] shadow-2xs">
                <Crown size={11} className="text-[#c5a059]" />
                <span>Atelier Overview</span>
              </div>
              <span className="rounded-full bg-emerald-50 dark:bg-[#132816] text-emerald-800 dark:text-emerald-300 text-[10px] font-serif font-bold px-2.5 py-0.5 border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
                Store Active
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#141312] dark:text-[#f8f5ee] tracking-tight mt-2">
              Maison Performance &amp; Analytics
            </h1>
            <p className="text-xs sm:text-sm text-[#786b58] dark:text-[#9e978b] mt-1 leading-relaxed">
              Atelier portfolio metrics for <strong className="font-serif text-[#141312] dark:text-[#f8f5ee]">{user?.displayName || 'Merchant Partner'}</strong> • Platform: <strong className="text-[#8a6827] dark:text-[#dfba73]">Valenza Privé</strong>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={loadDashboard}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-[#d6be90] dark:border-[#2f384d] bg-white dark:bg-[#161a25] text-xs font-serif tracking-wider uppercase font-semibold text-[#141312] dark:text-[#f8f5ee] hover:bg-[#faf7f2] dark:hover:bg-[#1e2433] transition-all cursor-pointer shadow-2xs"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin text-[#c5a059]' : 'text-[#8a7b68]'} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={handleSimulateOrder}
              disabled={isSimulatingOrder}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-serif tracking-wider uppercase font-semibold text-[#141312] dark:text-[#f8f5ee] bg-[#f8f4ec] dark:bg-[#1a202c] border border-[#dcd2bf] dark:border-[#382f1d] hover:border-[#c5a059] shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="Generate a sample customer order to test fulfillment workflow"
            >
              {isSimulatingOrder ? (
                <Loader2 size={13} className="animate-spin text-[#c5a059]" />
              ) : (
                <Sparkles size={13} className="text-[#c5a059]" />
              )}
              <span>Test Commission</span>
            </button>

            <Link href="/seller/products/new">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-serif tracking-widest uppercase font-bold text-[#121110] bg-gradient-to-r from-[#c5a059] via-[#dfba73] to-[#9b7532] hover:brightness-105 active:scale-98 border border-[#c5a059]/50 shadow-sm transition-all cursor-pointer"
              >
                <PlusCircle size={14} strokeWidth={2.2} />
                <span>Add Piece</span>
              </button>
            </Link>
          </div>
        </div>

        {/* ── Metric Stat Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Gross Revenue / Volume */}
          <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-serif uppercase tracking-[0.2em] font-bold text-[#8a7b68] dark:text-[#8e98ac]">
                Gross Valuation
              </span>
              <div className="w-8 h-8 rounded-full bg-[#f8f4ec] dark:bg-[#1c2333] text-[#8a6827] dark:text-[#dfba73] flex items-center justify-center">
                <DollarSign size={15} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-serif font-bold text-[#141312] dark:text-[#f8f5ee]">
                {loading ? '...' : formatPrice(metrics?.totalRevenue ?? 0)}
              </span>
              <span className="block text-[10px] text-[#786b58] dark:text-[#9e978b] mt-1 font-sans">
                Curated atelier transactions (30d)
              </span>
            </div>
          </div>

          {/* Card 2: Active Masterpieces in Vault */}
          <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-serif uppercase tracking-[0.2em] font-bold text-[#8a7b68] dark:text-[#8e98ac]">
                Active Catalog
              </span>
              <div className="w-8 h-8 rounded-full bg-[#f8f4ec] dark:bg-[#1c2333] text-[#8a6827] dark:text-[#dfba73] flex items-center justify-center">
                <Package size={15} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-serif font-bold text-[#141312] dark:text-[#f8f5ee]">
                {loading ? '...' : metrics?.activeProducts ?? 0}
              </span>
              <span className="block text-[10px] text-[#786b58] dark:text-[#9e978b] mt-1 font-sans">
                Allocated masterworks live in salons
              </span>
            </div>
          </div>

          {/* Card 3: Total Orders / Commissions */}
          <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-serif uppercase tracking-[0.2em] font-bold text-[#8a7b68] dark:text-[#8e98ac]">
                Commissions
              </span>
              <div className="w-8 h-8 rounded-full bg-[#f8f4ec] dark:bg-[#1c2333] text-[#8a6827] dark:text-[#dfba73] flex items-center justify-center">
                <ClipboardList size={15} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-serif font-bold text-[#141312] dark:text-[#f8f5ee]">
                {loading ? '...' : orders.length}
              </span>
              <span className="block text-[10px] text-[#786b58] dark:text-[#9e978b] mt-1 font-sans">
                {orders.filter((o) => o.order.status !== 'delivered').length} awaiting fulfillment
              </span>
            </div>
          </div>

          {/* Card 4: Atelier Health & Appraisal */}
          <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-serif uppercase tracking-[0.2em] font-bold text-[#8a7b68] dark:text-[#8e98ac]">
                Atelier Appraisal
              </span>
              <div className="w-8 h-8 rounded-full bg-[#f8f4ec] dark:bg-[#1c2333] text-[#8a6827] dark:text-[#dfba73] flex items-center justify-center">
                <Award size={15} />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-serif font-bold text-[#8a6827] dark:text-[#dfba73]">
                4.9 / 5.0 ★
              </span>
              <span className="block text-[10px] text-emerald-700 dark:text-emerald-400 mt-1 font-sans font-medium">
                Top Tier • Pristine SLA Rating
              </span>
            </div>
          </div>
        </div>

        {/* ── Recent Commissions & Fulfillment Pipeline ── */}
        <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0eae0] dark:border-[#1e2433]">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-light text-[#141312] dark:text-[#f8f5ee] tracking-tight">
                Recent Client Commissions
              </h2>
              <p className="text-xs text-[#786b58] dark:text-[#9e978b] mt-0.5">
                Real-time purchase orders requiring packaging and insured transit
              </p>
            </div>

            <Link href="/seller/orders">
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-serif font-bold tracking-wider uppercase text-[#8a6827] dark:text-[#dfba73] hover:underline cursor-pointer"
              >
                <span>View All Orders</span>
                <ArrowRight size={12} />
              </button>
            </Link>
          </div>

          {/* Orders Table */}
          {loading ? (
            <div className="py-12 text-center text-xs text-[#786b58] font-serif animate-pulse">
              Loading recent orders...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#786b58] dark:text-[#8e98ac]">
              No recent orders found. Use &quot;Test Commission&quot; above to simulate an incoming order.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#f0eae0] dark:border-[#1e2433] text-[10px] font-serif font-bold uppercase tracking-[0.16em] text-[#8a7b68] dark:text-[#8e98ac]">
                    <th className="pb-3 font-semibold">Commission ID</th>
                    <th className="pb-3 font-semibold">Buyer</th>
                    <th className="pb-3 font-semibold">Piece(s)</th>
                    <th className="pb-3 font-semibold">Valuation</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Fulfillment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5efe5] dark:divide-[#1a202c]">
                  {filteredOrders.slice(0, 5).map((rec) => {
                    const o = rec.order;
                    const st = o.status.toLowerCase();
                    return (
                      <tr key={o.id} className="hover:bg-[#faf7f2]/60 dark:hover:bg-[#161a25] transition-colors">
                        <td className="py-4 font-mono font-bold text-[#8a6827] dark:text-[#dfba73]">
                          {o.id}
                        </td>
                        <td className="py-4 font-medium text-[#141312] dark:text-[#f8f5ee]">
                          {o.shippingAddress.fullName}
                        </td>
                        <td className="py-4 text-[#6d6356] dark:text-[#a0a6b5] max-w-xs truncate">
                          {rec.sellerItems.map((i) => i.title).join(', ')}
                        </td>
                        <td className="py-4 font-serif font-bold text-[#141312] dark:text-[#f8f5ee]">
                          {formatPrice(rec.sellerTotal)}
                        </td>
                        <td className="py-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[9.5px] font-serif font-bold uppercase tracking-wider ${
                              st === 'delivered'
                                ? 'bg-emerald-50 dark:bg-[#132816] text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : st === 'shipped' || st === 'out_for_delivery'
                                ? 'bg-[#f0e8d5] dark:bg-[#1e2738] text-[#8a6827] dark:text-[#dfba73] border border-[#d6be90]/60'
                                : 'bg-amber-50 dark:bg-[#261d10] text-amber-800 dark:text-amber-300 border border-amber-200'
                            }`}
                          >
                            {o.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <Link href="/seller/orders">
                            <span className="text-[11px] font-serif font-semibold text-[#8a6827] dark:text-[#dfba73] hover:underline cursor-pointer">
                              Manage →
                            </span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </SellerLayout>
  );
}
