'use client';
// ============================================================================
// Seller Orders Page — /seller/orders
// Valenza Maison Partner Atelier Order Fulfillment Management
// ============================================================================
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ClipboardList,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Package,
  ArrowRight,
  Loader2,
  ChevronRight,
  ShieldCheck,
  User,
  MapPin,
  Gem,
  Crown,
  Sparkles,
} from 'lucide-react';
import { SellerLayout } from '@/components/seller/SellerLayout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchSellerOrders,
  updateFulfillmentStatus,
  ALLOWED_STATUS_TRANSITIONS,
  type SellerOrderRecord,
} from '@/services/sellerService';
import { formatPrice } from '@/lib/utils';
import type { OrderStatus } from '@/types';

type StatusFilter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered';

export default function SellerOrdersPage() {
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState<SellerOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetchSellerOrders(user.uid);
      if (res.success && res.data) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Failed to load seller orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user]);

  // Handle fulfillment progression
  const handleAdvanceStatus = async (orderId: string, nextStatus: OrderStatus) => {
    if (!user) return;
    setUpdatingId(orderId);
    setErrorMessage(null);

    try {
      const res = await updateFulfillmentStatus(user.uid, orderId, nextStatus, isAdmin);
      if (res.success) {
        setToastMessage(`Order #${orderId} advanced to ${nextStatus.toUpperCase()}`);
        setTimeout(() => setToastMessage(null), 3500);
        await loadOrders();
      } else {
        setErrorMessage(res.error || 'Failed to update order fulfillment status.');
      }
    } finally {
      setUpdatingId(null);
    }
  };

  // Filtered orders
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.order.id.toLowerCase().includes(q) ||
          r.order.shippingAddress.fullName.toLowerCase().includes(q) ||
          r.sellerItems.some((i) => i.title.toLowerCase().includes(q)),
      );
    }

    if (activeTab === 'all') return list;

    return list.filter((r) => {
      const st = r.order.status.toLowerCase();
      if (activeTab === 'pending') {
        return st === 'placed' || st === 'confirmed' || st === 'pending';
      }
      if (activeTab === 'processing') return st === 'processing';
      if (activeTab === 'shipped') return st === 'shipped' || st === 'out_for_delivery';
      if (activeTab === 'delivered') return st === 'delivered';
      return true;
    });
  }, [orders, searchQuery, activeTab]);

  return (
    <SellerLayout>
      <div className="space-y-6 text-[#141312] dark:text-[#f8f5ee]">
        
        {/* ── Top Header Banner ── */}
        <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 backdrop-blur-xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(26,23,20,0.03)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f6f1e6] dark:bg-[#1c2333] border border-[#d6be90]/40 dark:border-[#c5a059]/30 text-[10px] font-serif font-bold uppercase tracking-[0.24em] text-[#8a6827] dark:text-[#dfba73] mb-2.5 shadow-2xs">
                <Crown size={11} className="text-[#c5a059]" />
                <span>Atelier Orders &amp; Logistics</span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-[#141312] dark:text-[#f8f5ee]">
                Client Commissions &amp; Fulfillment
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#786b58] dark:text-[#9e978b] leading-relaxed max-w-2xl">
                Review client purchases containing your atelier pieces, manage insured logistics transit, and advance order fulfillment states.
              </p>
            </div>

            <div className="bg-[#fcfbf9] dark:bg-[#161b26] rounded-2xl p-4 border border-[#ede4d4] dark:border-[#232938] shrink-0 text-center sm:text-right">
              <span className="block text-[10px] uppercase font-serif font-semibold tracking-wider text-[#8a7b68] dark:text-[#8e98ac]">
                Active Orders
              </span>
              <span className="text-xl font-serif font-bold text-[#8a6827] dark:text-[#dfba73]">
                {orders.length} {orders.length === 1 ? 'Commission' : 'Commissions'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Toast Notifications ── */}
        {toastMessage && (
          <div className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-[#102415] p-4 flex items-center gap-3 text-emerald-900 dark:text-emerald-200 text-xs shadow-md animate-fade-in">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium flex-1">{toastMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-2xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-[#241012] p-4 flex items-center gap-3 text-red-900 dark:text-red-200 text-xs shadow-md">
            <AlertCircle size={16} className="shrink-0 text-red-600 dark:text-red-400" />
            <span className="font-medium flex-1">{errorMessage}</span>
          </div>
        )}

        {/* ── Search Bar & Status Tabs ── */}
        <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#121620]/90 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Commission ID, buyer name, or piece..."
              className="w-full rounded-2xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fdfcf9] dark:bg-[#161a25] pl-9 pr-4 py-2.5 text-xs text-[#141312] dark:text-[#f8f5ee] placeholder:text-[#9e978b] focus:border-[#c5a059] dark:focus:border-[#dfba73] focus:outline-none focus:ring-2 focus:ring-[#c5a059]/20 transition-all"
            />
            <Search size={14} className="absolute left-3 top-3 text-[#9e978b]" />
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(
              [
                { id: 'all', label: `All Commissions (${orders.length})` },
                { id: 'pending', label: 'Unfulfilled / Pending' },
                { id: 'processing', label: 'In Atelier Prep' },
                { id: 'shipped', label: 'Insured Transit' },
                { id: 'delivered', label: 'Delivered & Signed' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-serif tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#171513] to-[#25201a] dark:from-[#1b2230] dark:to-[#121620] text-[#dfba73] border border-[#c5a059]/50 shadow-xs font-bold'
                    : 'bg-[#f8f4ec] dark:bg-[#161b26] text-[#6d6356] dark:text-[#a0a6b5] hover:text-[#141312] dark:hover:text-[#f8f5ee] border border-transparent hover:border-[#dfd6c5] dark:hover:border-[#2f384d]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Orders Feed ── */}
        {loading ? (
          <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#121620] p-12 text-center text-xs text-[#786b58] dark:text-[#8e98ac] animate-pulse font-serif">
            Loading atelier commissions...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#121620] p-12 text-center shadow-xs text-xs text-[#786b58] dark:text-[#8e98ac]">
            <ClipboardList size={36} className="text-[#c5a059]/40 mx-auto mb-3" />
            <p className="font-serif font-bold text-base text-[#141312] dark:text-[#f8f5ee]">
              No Orders Found
            </p>
            <p className="mt-1 text-xs text-[#786b58] dark:text-[#8e98ac]">
              There are currently no customer orders matching your selected filter.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((rec) => {
              const order = rec.order;
              const currentStatus = order.status.toLowerCase();
              const allowedNextSteps = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
              const isUpdating = updatingId === order.id;

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#121620] overflow-hidden shadow-[0_6px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.35)] text-xs"
                >
                  {/* Order Card Header */}
                  <div className="bg-gradient-to-r from-[#faf7f2] to-[#f4eee4] dark:from-[#151924] dark:to-[#0f1219] p-5 border-b border-[#ebe2d1] dark:border-[#232938] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-5 sm:gap-8">
                      <div>
                        <span className="block text-[9.5px] uppercase font-serif font-bold tracking-wider text-[#8a7b68] dark:text-[#8e98ac]">
                          Date Placed
                        </span>
                        <span className="font-serif font-medium text-[#141312] dark:text-[#f8f5ee]">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[9.5px] uppercase font-serif font-bold tracking-wider text-[#8a7b68] dark:text-[#8e98ac]">
                          Commission ID
                        </span>
                        <span className="font-mono font-bold text-[#8a6827] dark:text-[#dfba73]">
                          {order.id}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[9.5px] uppercase font-serif font-bold tracking-wider text-[#8a7b68] dark:text-[#8e98ac]">
                          Private Client
                        </span>
                        <span className="font-medium text-[#141312] dark:text-[#f8f5ee]">
                          {order.shippingAddress.fullName}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[9.5px] uppercase font-serif font-bold tracking-wider text-[#8a7b68] dark:text-[#8e98ac]">
                          Transit Destination
                        </span>
                        <span className="text-[#6d6356] dark:text-[#a0a6b5]">
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </span>
                      </div>
                    </div>

                    {/* Status Pill & Order Total */}
                    <div className="flex items-center gap-3.5">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-serif font-bold uppercase tracking-wider ${
                          currentStatus === 'delivered'
                            ? 'bg-emerald-50 dark:bg-[#132816] text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : currentStatus === 'shipped' || currentStatus === 'out_for_delivery'
                            ? 'bg-[#f0e8d5] dark:bg-[#1e2738] text-[#8a6827] dark:text-[#dfba73] border border-[#d6be90]/60 dark:border-[#c5a059]/40'
                            : currentStatus === 'processing'
                            ? 'bg-amber-50 dark:bg-[#261d10] text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                            : 'bg-blue-50 dark:bg-[#101b2b] text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>

                      <div className="text-right">
                        <span className="text-sm font-serif font-bold text-[#141312] dark:text-[#f8f5ee]">
                          {formatPrice(rec.sellerTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items & Fulfillment Action */}
                  <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    {/* Products List */}
                    <div className="flex-1 space-y-3">
                      <p className="text-[10px] uppercase font-serif font-bold text-[#8a7b68] dark:text-[#8e98ac] tracking-widest flex items-center gap-1.5">
                        <Gem size={11} className="text-[#c5a059]" />
                        <span>Allocated Pieces ({rec.sellerItems.length}):</span>
                      </p>
                      <div className="space-y-2.5">
                        {rec.sellerItems.map((item) => (
                          <div key={item.productId} className="flex items-center gap-3.5">
                            <div className="h-13 w-13 rounded-xl border border-[#ede4d4] dark:border-[#232938] bg-[#fbf9f6] dark:bg-[#171c26] flex-shrink-0 relative overflow-hidden shadow-2xs">
                              <Image
                                src={item.image || '/images/placeholder-product.png'}
                                alt={item.title}
                                fill
                                sizes="52px"
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <Link
                                href={`/product/${item.productId}`}
                                className="font-serif font-medium text-xs text-[#141312] dark:text-[#f8f5ee] hover:text-[#8a6827] dark:hover:text-[#dfba73] transition-colors line-clamp-1"
                              >
                                {item.title}
                              </Link>
                              <div className="text-[11px] text-[#786b58] dark:text-[#9e978b] mt-0.5 font-sans">
                                Allocation: <strong className="text-[#141312] dark:text-[#f8f5ee]">{item.quantity}</strong> • {formatPrice(item.price)} each • Valuation: <strong className="text-[#8a6827] dark:text-[#dfba73]">{formatPrice(item.subtotal)}</strong>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Panel for legal transitions */}
                    <div className="w-full md:w-72 bg-[#faf7f2] dark:bg-[#161a25] rounded-2xl p-4 border border-[#ebe2d1] dark:border-[#262c3d] shrink-0">
                      <div className="flex items-center gap-1.5 text-[#8a6827] dark:text-[#dfba73] font-serif font-bold text-[10px] uppercase tracking-[0.2em] mb-2.5">
                        <Truck size={13} />
                        <span>Fulfillment Actions</span>
                      </div>

                      {allowedNextSteps.length === 0 ? (
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                          ✓ Delivery completed and verified with client signature.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {allowedNextSteps.map((nextStatus) => {
                            if (nextStatus === 'cancelled') return null;

                            return (
                              <button
                                key={nextStatus}
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleAdvanceStatus(order.id, nextStatus)}
                                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-[#c5a059] via-[#dfba73] to-[#9b7532] text-[#121110] font-serif text-[10px] font-bold uppercase tracking-wider hover:brightness-110 active:scale-98 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                {isUpdating ? (
                                  <Loader2 size={12} className="animate-spin" />
                                ) : (
                                  <>
                                    <span>Advance to {nextStatus.replace(/_/g, ' ')}</span>
                                    <ArrowRight size={11} strokeWidth={2.5} />
                                  </>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                      <p className="text-[9.5px] text-[#8a7b68] dark:text-[#7f889b] mt-2.5 text-center font-serif">
                        Valenza Insured Transit Protocol
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SellerLayout>
  );
}
