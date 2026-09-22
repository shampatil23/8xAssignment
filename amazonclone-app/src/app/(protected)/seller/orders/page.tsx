'use client';
// ============================================================================
// Seller Orders Page — /seller/orders
// Order fulfillment management adhering to Amazon lifecycle transitions
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

    if (activeTab === 'pending') {
      list = list.filter((r) =>
        ['placed', 'confirmed'].includes(r.order.status.toLowerCase()),
      );
    } else if (activeTab === 'processing') {
      list = list.filter((r) => r.order.status.toLowerCase() === 'processing');
    } else if (activeTab === 'shipped') {
      list = list.filter((r) =>
        ['shipped', 'out_for_delivery'].includes(r.order.status.toLowerCase()),
      );
    } else if (activeTab === 'delivered') {
      list = list.filter((r) => r.order.status.toLowerCase() === 'delivered');
    }

    return list;
  }, [orders, searchQuery, activeTab]);

  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* Toast alerts */}
        {toastMessage && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white shadow-xl animate-bounce">
            <CheckCircle2 size={18} strokeWidth={3} />
            <span>{toastMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Orders &amp; Fulfillment</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Review customer purchases containing your products and advance fulfillment status
            </p>
          </div>
        </div>

        {/* ── Search & Filter Controls ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-xs text-xs">
          <div className="relative flex-1 max-w-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, buyer name, or item..."
              className="w-full rounded-md border border-gray-300 pl-8 pr-3 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-amazon-orange focus:outline-none"
            />
            <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto">
            {(
              [
                { id: 'all', label: `All (${orders.length})` },
                { id: 'pending', label: 'Unshipped / Pending' },
                { id: 'processing', label: 'Processing' },
                { id: 'shipped', label: 'Shipped / In Transit' },
                { id: 'delivered', label: 'Delivered' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-amazon-dark text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Orders Feed ── */}
        {loading ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-xs text-gray-500 animate-pulse">
            Loading orders...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-xs text-xs text-gray-500">
            <ClipboardList size={36} className="text-gray-400 mx-auto mb-2" />
            <p className="font-bold text-sm text-gray-800">No orders found</p>
            <p className="mt-0.5">There are currently no customer orders matching this filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((rec) => {
              const order = rec.order;
              const currentStatus = order.status.toLowerCase();
              const allowedNextSteps = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
              const isUpdating = updatingId === order.id;

              return (
                <div
                  key={order.id}
                  className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-xs text-xs"
                >
                  {/* Order Header */}
                  <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-gray-400">
                          Order Placed
                        </span>
                        <span className="font-semibold text-gray-800">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] uppercase font-bold text-gray-400">
                          Order ID
                        </span>
                        <span className="font-mono font-bold text-gray-900">
                          {order.id}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] uppercase font-bold text-gray-400">
                          Buyer
                        </span>
                        <span className="font-semibold text-gray-800">
                          {order.shippingAddress.fullName}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] uppercase font-bold text-gray-400">
                          Destination
                        </span>
                        <span className="text-gray-600">
                          {order.shippingAddress.city}, {order.shippingAddress.state}
                        </span>
                      </div>
                    </div>

                    {/* Status Pill & Total */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          currentStatus === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : currentStatus === 'shipped' || currentStatus === 'out_for_delivery'
                            ? 'bg-[#ebf8fa] text-[#007185] border border-[#a2d8df]'
                            : currentStatus === 'processing'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>

                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">
                          {formatPrice(rec.sellerTotal)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items & Fulfillment Actions */}
                  <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    {/* Items belonging to seller */}
                    <div className="space-y-3 flex-1">
                      <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        Your Products in this Order ({rec.sellerItems.length}):
                      </p>
                      <div className="divide-y divide-gray-100">
                        {rec.sellerItems.map((item, idx) => (
                          <div key={idx} className="py-2 first:pt-0 flex items-center gap-3">
                            <div className="relative h-12 w-12 rounded border bg-white p-0.5 flex-shrink-0">
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="48px"
                                className="object-contain"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-gray-900 line-clamp-1">
                                {item.title}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                Qty: <strong className="text-gray-800">{item.quantity}</strong> · {formatPrice(item.price)} each · Subtotal: <strong className="text-gray-800">{formatPrice(item.subtotal)}</strong>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Fulfillment Lifecycle Controls */}
                    <div className="w-full md:w-64 flex flex-col gap-2 rounded-lg bg-gray-50 p-3.5 border border-gray-200">
                      <span className="font-bold text-gray-800 text-[11px] flex items-center gap-1.5">
                        <Truck size={14} className="text-amazon-orange" />
                        <span>Fulfillment Action</span>
                      </span>

                      {currentStatus === 'delivered' ? (
                        <div className="flex items-center gap-1.5 text-green-700 font-semibold text-[11px] pt-1">
                          <CheckCircle2 size={16} />
                          <span>Delivery Completed</span>
                        </div>
                      ) : allowedNextSteps.length === 0 ? (
                        <span className="text-gray-400 italic text-[11px]">
                          No further status updates required.
                        </span>
                      ) : (
                        <div className="space-y-1.5 pt-1">
                          {allowedNextSteps
                            .filter((step) => step !== 'cancelled')
                            .map((nextStep) => (
                              <Button
                                key={nextStep}
                                type="button"
                                variant="buy-now"
                                size="sm"
                                fullWidth
                                disabled={isUpdating}
                                onClick={() => handleAdvanceStatus(order.id, nextStep)}
                                className="text-xs font-bold py-1.5 flex items-center justify-center gap-1.5 shadow-xs"
                              >
                                {isUpdating ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <>
                                    <span>Mark as {nextStep.replace(/_/g, ' ').toUpperCase()}</span>
                                    <ArrowRight size={13} />
                                  </>
                                )}
                              </Button>
                            ))}
                        </div>
                      )}

                      <span className="text-[10px] text-gray-400 mt-1">
                        Est. Delivery: {order.estimatedDelivery || 'Standard'}
                      </span>
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
