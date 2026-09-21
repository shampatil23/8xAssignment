'use client';
// ============================================================================
// Your Orders & Returns Page — /orders
// Amazon-style layout: Order History, Return Initiation, and Return Lifecycle
// ============================================================================
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Package,
  RotateCcw,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Star,
  Search,
  X,
  AlertTriangle,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { getUserOrders } from '@/services/orderService';
import {
  createCustomerReturn,
  fetchUserReturns,
  progressReturnState,
  RETURN_REASONS,
  checkReturnEligibility,
} from '@/services/returnService';
import type { Order, OrderItem, ReturnRequest } from '@/types';

type OrderFilterTab = 'all' | 'returns' | 'cancelled';

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Return request modal state
  const [selectedOrderForReturn, setSelectedOrderForReturn] = useState<Order | null>(null);
  const [selectedItemForReturn, setSelectedItemForReturn] = useState<OrderItem | null>(null);
  const [returnReason, setReturnReason] = useState<string>(RETURN_REASONS[0]);
  const [returnNote, setReturnNote] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Load orders and returns from RTDB
  const loadData = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [ordersRes, returnsRes] = await Promise.all([
        getUserOrders(user.uid, 1, 50),
        fetchUserReturns(user.uid),
      ]);
      setOrders(ordersRes.data || []);
      setReturns(returnsRes || []);
    } catch (err) {
      console.error('Failed to load orders/returns', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading]);

  // Handle return request submission
  const handleStartReturnModal = (order: Order, item: OrderItem) => {
    const eligibility = checkReturnEligibility(order, item.productId);
    if (!eligibility.isEligible) {
      alert(eligibility.reason || 'This item is not eligible for return.');
      return;
    }
    setSelectedOrderForReturn(order);
    setSelectedItemForReturn(item);
    setReturnReason(RETURN_REASONS[0]);
    setReturnNote('');
    setReturnError(null);
  };

  const handleConfirmReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedOrderForReturn || !selectedItemForReturn) return;

    setSubmittingReturn(true);
    setReturnError(null);
    try {
      const res = await createCustomerReturn(user.uid, {
        order: selectedOrderForReturn,
        item: selectedItemForReturn,
        reason: returnReason,
        quantity: selectedItemForReturn.quantity,
        note: returnNote,
      });

      if (res.success && res.data) {
        setSelectedOrderForReturn(null);
        setSelectedItemForReturn(null);
        setNoticeMessage('Your return request has been placed! Track its progress below.');
        setTimeout(() => setNoticeMessage(null), 4000);
        await loadData();
      } else {
        setReturnError(res.error || 'Failed to submit return request.');
      }
    } finally {
      setSubmittingReturn(false);
    }
  };

  // Demo status progression helper (simulates return approval/refund for evaluation)
  const handleAdvanceReturn = async (ret: ReturnRequest) => {
    if (!user) return;
    const stages: ReturnRequest['status'][] = [
      'RETURN_REQUESTED',
      'RETURN_APPROVED',
      'RETURNED',
      'REFUND_PENDING',
      'REFUNDED',
    ];
    const currentIndex = stages.indexOf(ret.status);
    if (currentIndex < stages.length - 1) {
      const nextStage = stages[currentIndex + 1];
      await progressReturnState(ret.id, ret.orderId, user.uid, nextStage);
      setNoticeMessage(`Return status updated to ${nextStage}!`);
      setTimeout(() => setNoticeMessage(null), 3000);
      await loadData();
    }
  };

  // Filtered orders
  const displayedOrders = useMemo(() => {
    let list = [...orders];

    if (activeTab === 'returns') {
      const returnOrderIds = new Set(returns.map((r) => r.orderId));
      list = list.filter(
        (o) =>
          returnOrderIds.has(o.id) ||
          o.status === 'RETURN_REQUESTED' ||
          o.status === 'RETURN_APPROVED' ||
          o.status === 'RETURNED' ||
          o.status === 'REFUND_PENDING' ||
          o.status === 'REFUNDED',
      );
    } else if (activeTab === 'cancelled') {
      list = list.filter((o) => o.status === 'cancelled');
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.items.some((i) => i.title.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [orders, returns, activeTab, searchQuery]);

  // Auth gate
  if (!authLoading && !user) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-screen-md px-4 py-16 text-center">
          <Package size={48} className="text-gray-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Your Orders
          </h1>
          <p className="text-xs text-gray-600 mb-6">
            Please sign in to view your order history, track deliveries, and manage returns.
          </p>
          <Button
            type="button"
            variant="buy-now"
            onClick={() => router.push('/auth/sign-in?redirect=/orders')}
            className="px-8 py-2 font-bold"
          >
            Sign in to your account
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-screen-xl px-4 py-6">
        {/* Notice alert */}
        {noticeMessage && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white shadow-xl animate-bounce">
            <CheckCircle2 size={18} strokeWidth={3} />
            <span>{noticeMessage}</span>
          </div>
        )}

        {/* Page Title & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Orders</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Review recent orders, check delivery status, and request returns
            </p>
          </div>

          {/* Search orders */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search all orders by item or ID"
              className="w-full rounded-md border border-gray-300 pl-8 pr-3 py-1.5 text-xs text-gray-900 focus:ring-1 focus:ring-amazon-orange focus:outline-none"
            />
            <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex border-b border-gray-200 mb-6 text-xs gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`pb-3 font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'all'
                ? 'border-amazon-orange text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('returns')}
            className={`pb-3 font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'returns'
                ? 'border-amazon-orange text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Returns &amp; Refunds ({returns.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cancelled')}
            className={`pb-3 font-semibold transition-colors cursor-pointer border-b-2 ${
              activeTab === 'cancelled'
                ? 'border-amazon-orange text-gray-900'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            Cancelled Orders
          </button>
        </div>

        {/* Orders Feed */}
        {loading ? (
          <div className="space-y-6 animate-pulse">
            {[1, 2].map((n) => (
              <div key={n} className="h-56 bg-gray-200 rounded-lg" />
            ))}
          </div>
        ) : displayedOrders.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-12 text-center shadow-xs">
            <Package size={40} className="text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-900 mb-1">
              No orders found
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
              Looks like you haven&apos;t placed any orders matching this filter yet.
            </p>
            <Button
              type="button"
              variant="cart"
              onClick={() => router.push('/')}
              className="font-bold text-xs"
            >
              Continue shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {displayedOrders.map((order) => {
              // Find if this order has returns associated
              const orderReturns = returns.filter((r) => r.orderId === order.id);

              return (
                <div
                  key={order.id}
                  className="rounded-lg border border-gray-300 bg-white overflow-hidden shadow-xs"
                >
                  {/* Order Header */}
                  <div className="bg-gray-50 p-4 border-b border-gray-300 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600">
                    <div className="flex flex-wrap gap-6 sm:gap-8">
                      <div>
                        <span className="block text-[11px] uppercase tracking-wider text-gray-500">
                          Order Placed
                        </span>
                        <span className="font-semibold text-gray-800">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[11px] uppercase tracking-wider text-gray-500">
                          Total
                        </span>
                        <span className="font-bold text-gray-900">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[11px] uppercase tracking-wider text-gray-500">
                          Ship To
                        </span>
                        <span className="font-semibold text-amazon-link hover:underline cursor-pointer">
                          {order.shippingAddress.fullName}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:items-end">
                      <span className="text-[11px] text-gray-500">
                        ORDER # <strong className="text-gray-900 font-mono">{order.id}</strong>
                      </span>
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-xs text-amazon-link hover:underline mt-0.5"
                      >
                        View order details
                      </Link>
                    </div>
                  </div>

                  {/* Return Lifecycle Status Stepper (if return active) */}
                  {orderReturns.length > 0 && (
                    <div className="bg-amber-50/50 p-4 border-b border-amber-200 text-xs">
                      {orderReturns.map((ret) => {
                        const stages: ReturnRequest['status'][] = [
                          'RETURN_REQUESTED',
                          'RETURN_APPROVED',
                          'RETURNED',
                          'REFUND_PENDING',
                          'REFUNDED',
                        ];
                        const currentStageIdx = stages.indexOf(ret.status);

                        return (
                          <div key={ret.id} className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-gray-900 flex items-center gap-1.5">
                                <RotateCcw size={14} className="text-amazon-orange" />
                                Return Status: <span className="text-amazon-orange uppercase">{ret.status.replace(/_/g, ' ')}</span>
                              </span>
                              <span className="font-bold text-green-700">
                                Refund Amount: ${ret.refundAmount.toFixed(2)}
                              </span>
                            </div>

                            {/* Stepper bar */}
                            <div className="grid grid-cols-5 gap-1 text-[10px] text-center font-semibold pt-1">
                              {stages.map((stage, idx) => (
                                <div key={stage} className="flex flex-col items-center">
                                  <div
                                    className={`h-2.5 w-full rounded-full mb-1 transition-colors ${
                                      idx <= currentStageIdx ? 'bg-green-600' : 'bg-gray-200'
                                    }`}
                                  />
                                  <span
                                    className={
                                      idx <= currentStageIdx ? 'text-green-800' : 'text-gray-400'
                                    }
                                  >
                                    {stage === 'RETURN_REQUESTED'
                                      ? 'Requested'
                                      : stage === 'RETURN_APPROVED'
                                      ? 'Approved'
                                      : stage === 'RETURNED'
                                      ? 'Returned'
                                      : stage === 'REFUND_PENDING'
                                      ? 'Processing'
                                      : 'Refunded'}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Demo Action: Advance Status */}
                            {currentStageIdx < stages.length - 1 && (
                              <div className="pt-2 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleAdvanceReturn(ret)}
                                  className="text-[11px] font-semibold text-amazon-link hover:underline bg-white px-2.5 py-1 rounded border border-gray-300"
                                >
                                  Advance to next status (Demo testing) →
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Order Items Body */}
                  <div className="p-5 divide-y divide-gray-100">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 justify-between items-start sm:items-center"
                      >
                        <div className="flex gap-4 items-center flex-1">
                          <div className="relative h-20 w-20 rounded border bg-white p-1 flex-shrink-0">
                            <Image
                              src={item.image}
                              alt={item.title}
                              fill
                              sizes="80px"
                              className="object-contain p-1"
                            />
                          </div>

                          <div className="space-y-1">
                            <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                              {item.title}
                            </h4>
                            <p className="text-xs text-gray-500">
                              Qty: {item.quantity} · Price: ${item.price.toFixed(2)}
                            </p>
                            <div className="flex items-center gap-2 pt-1 text-xs">
                              <span className="rounded bg-green-100 px-2 py-0.5 text-[11px] font-bold text-green-800">
                                {order.status === 'confirmed' ? 'Arriving on time' : order.status}
                              </span>
                              <span className="text-gray-500">
                                Est. Delivery: {order.estimatedDelivery || 'Tomorrow'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Order Item Actions */}
                        <div className="flex flex-col gap-2 w-full sm:w-48 text-xs">
                          {/* Write Review Action */}
                          <Link
                            href={`/product/${item.productId}`}
                            className="w-full rounded bg-amazon-yellow py-1.5 text-center font-semibold text-gray-900 hover:bg-amazon-yellow-hover border border-[#fcd200] shadow-2xs flex items-center justify-center gap-1.5"
                          >
                            <Star size={13} />
                            <span>Write a product review</span>
                          </Link>

                          {/* Return or Replace Action */}
                          {order.status !== 'cancelled' &&
                            order.status !== 'REFUNDED' && (
                              <button
                                type="button"
                                onClick={() => handleStartReturnModal(order, item)}
                                className="w-full rounded border border-gray-300 bg-white py-1.5 text-center font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <RotateCcw size={13} />
                                <span>Return or replace items</span>
                              </button>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Return Request Modal ── */}
      {selectedOrderForReturn && selectedItemForReturn && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4"
        >
          <div className="relative w-full max-w-lg rounded-xl border border-gray-300 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => {
                setSelectedOrderForReturn(null);
                setSelectedItemForReturn(null);
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 mb-2 text-amazon-orange">
              <RotateCcw size={20} />
              <h3 className="text-base font-bold text-gray-900">
                Choose a reason for return
              </h3>
            </div>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 mb-4">
              <div className="relative h-12 w-12 rounded border bg-white p-1 flex-shrink-0">
                <Image
                  src={selectedItemForReturn.image}
                  alt={selectedItemForReturn.title}
                  fill
                  sizes="48px"
                  className="object-contain"
                />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-gray-900 line-clamp-1">
                  {selectedItemForReturn.title}
                </p>
                <p className="text-gray-500">
                  Refund amount:{' '}
                  <strong className="text-green-700 font-bold">
                    ${(selectedItemForReturn.price * selectedItemForReturn.quantity).toFixed(2)}
                  </strong>
                </p>
              </div>
            </div>

            {returnError && (
              <div className="mb-4 rounded bg-red-50 p-2.5 text-xs text-red-700 border border-red-200">
                {returnError}
              </div>
            )}

            <form onSubmit={handleConfirmReturn} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Why are you returning this?
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-xs bg-white text-gray-900 focus:ring-1 focus:ring-amazon-orange focus:outline-none"
                  required
                >
                  {RETURN_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  Comments / Note (Optional)
                </label>
                <textarea
                  rows={3}
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="Provide any details about the issue"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-xs focus:ring-1 focus:ring-amazon-orange focus:outline-none"
                />
              </div>

              <div className="rounded-md bg-blue-50 p-3 text-[11px] text-blue-800 border border-blue-200">
                <p className="font-bold">Amazon Free Return Guarantee</p>
                <p className="mt-0.5">
                  A prepaid return label will be provided. The refund of{' '}
                  <strong>
                    ${(selectedItemForReturn.price * selectedItemForReturn.quantity).toFixed(2)}
                  </strong>{' '}
                  will be credited to your original payment method once received.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setSelectedOrderForReturn(null);
                    setSelectedItemForReturn(null);
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="buy-now"
                  disabled={submittingReturn}
                  className="text-xs font-bold px-5"
                >
                  {submittingReturn ? 'Submitting...' : 'Confirm Return'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
