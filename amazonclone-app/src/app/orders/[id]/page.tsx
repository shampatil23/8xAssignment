'use client';
// ============================================================================
// Order Details Page — /orders/[id]
// Amazon-style layout: Order Information, Status, Return & Refund Tracking
// ============================================================================
import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  Package,
  Star,
  X,
  Truck,
  ShieldCheck,
  CreditCard,
  MapPin,
  Clock,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { getOrderById } from '@/services/orderService';
import {
  createCustomerReturn,
  fetchOrderReturns,
  progressReturnState,
  RETURN_REASONS,
  checkReturnEligibility,
} from '@/services/returnService';
import { getRecommendationsForHome } from '@/services/recommendationService';
import type { Order, OrderItem, ReturnRequest, Product } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [order, setOrder] = useState<Order | null>(null);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Return request modal state
  const [selectedItemForReturn, setSelectedItemForReturn] = useState<OrderItem | null>(null);
  const [returnReason, setReturnReason] = useState<string>(RETURN_REASONS[0]);
  const [returnNote, setReturnNote] = useState('');
  const [submittingReturn, setSubmittingReturn] = useState(false);
  const [returnError, setReturnError] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const loadOrderData = async () => {
    setLoading(true);
    try {
      const [orderData, returnList, recs] = await Promise.all([
        getOrderById(id),
        fetchOrderReturns(id),
        getRecommendationsForHome(4),
      ]);
      setOrder(orderData);
      setReturns(returnList);
      setRecommendations(recs);
    } catch (err) {
      console.error('Failed to load order details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      loadOrderData();
    }
  }, [id, authLoading]);

  // Handle Return Initiation
  const handleOpenReturnModal = (item: OrderItem) => {
    if (!order) return;
    const eligibility = checkReturnEligibility(order, item.productId);
    if (!eligibility.isEligible) {
      alert(eligibility.reason || 'This item is not eligible for return.');
      return;
    }
    setSelectedItemForReturn(item);
    setReturnReason(RETURN_REASONS[0]);
    setReturnNote('');
    setReturnError(null);
  };

  const handleConfirmReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !order || !selectedItemForReturn) return;

    setSubmittingReturn(true);
    setReturnError(null);
    try {
      const res = await createCustomerReturn(user.uid, {
        order,
        item: selectedItemForReturn,
        reason: returnReason,
        quantity: selectedItemForReturn.quantity,
        note: returnNote,
      });

      if (res.success && res.data) {
        setSelectedItemForReturn(null);
        setNoticeMessage('Your return request has been placed! Track its progress below.');
        setTimeout(() => setNoticeMessage(null), 4000);
        await loadOrderData();
      } else {
        setReturnError(res.error || 'Failed to submit return request.');
      }
    } finally {
      setSubmittingReturn(false);
    }
  };

  // Advance Return Status Demo Workflow
  const handleAdvanceReturn = async (ret: ReturnRequest) => {
    if (!user || !order) return;
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
      await progressReturnState(ret.id, order.id, user.uid, nextStage);
      setNoticeMessage(`Return status updated to ${nextStage}!`);
      setTimeout(() => setNoticeMessage(null), 3000);
      await loadOrderData();
    }
  };

  if (loading || authLoading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-screen-xl px-4 py-8 animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
          <div className="h-44 bg-gray-200 rounded-lg mb-6" />
          <div className="h-64 bg-gray-200 rounded-lg" />
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-screen-md px-4 py-16 text-center">
          <Package size={48} className="text-gray-400 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Order Not Found</h1>
          <p className="text-xs text-gray-600 mb-6">
            We couldn&apos;t find an order matching the requested identifier.
          </p>
          <Button
            type="button"
            variant="cart"
            onClick={() => router.push('/orders')}
            className="text-xs font-bold px-6 py-2"
          >
            Back to Your Orders
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

        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1 text-xs text-amazon-link hover:underline font-medium"
          >
            <ChevronLeft size={14} />
            Back to Your Orders
          </Link>
        </div>

        {/* Page Heading & Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-xs text-gray-500 mt-1">
              Ordered on{' '}
              <strong className="text-gray-700">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </strong>{' '}
              | Order # <strong className="font-mono text-gray-800">{order.id}</strong>
            </p>
          </div>

          <div className="text-xs">
            <span className="rounded bg-green-100 px-2.5 py-1 font-bold text-green-800 uppercase">
              {order.status}
            </span>
          </div>
        </div>

        {/* ── Return / Refund Active Banner (if any) ── */}
        {returns.length > 0 && (
          <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-5 shadow-xs">
            {returns.map((ret) => {
              const stages: ReturnRequest['status'][] = [
                'RETURN_REQUESTED',
                'RETURN_APPROVED',
                'RETURNED',
                'REFUND_PENDING',
                'REFUNDED',
              ];
              const currentStageIdx = stages.indexOf(ret.status);

              return (
                <div key={ret.id} className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <RotateCcw size={18} className="text-amazon-orange" />
                      <h2 className="text-sm font-bold text-gray-900">
                        Return Request for: {ret.itemTitle}
                      </h2>
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-green-800">
                        Refund Amount: ${ret.refundAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-700">
                    <p>
                      <strong>Reason:</strong> {ret.reason}
                    </p>
                    {ret.note && (
                      <p className="mt-0.5 text-gray-600 italic">
                        &ldquo;{ret.note}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Visual Stepper */}
                  <div className="pt-2">
                    <div className="grid grid-cols-5 gap-1 text-[11px] text-center font-semibold">
                      {stages.map((stage, idx) => (
                        <div key={stage} className="flex flex-col items-center">
                          <div
                            className={`h-2.5 w-full rounded-full mb-1 transition-colors ${
                              idx <= currentStageIdx ? 'bg-green-600' : 'bg-gray-200'
                            }`}
                          />
                          <span
                            className={
                              idx <= currentStageIdx ? 'text-green-800 font-bold' : 'text-gray-400'
                            }
                          >
                            {stage === 'RETURN_REQUESTED'
                              ? 'Requested'
                              : stage === 'RETURN_APPROVED'
                              ? 'Approved'
                              : stage === 'RETURNED'
                              ? 'Returned'
                              : stage === 'REFUND_PENDING'
                              ? 'Refund Pending'
                              : 'Refunded'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Demo advance return status */}
                  {currentStageIdx < stages.length - 1 && (
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleAdvanceReturn(ret)}
                        className="text-xs font-semibold text-amazon-link hover:underline bg-white px-3 py-1.5 rounded border border-gray-300"
                      >
                        Advance status for demo testing →
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Order Summary Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-lg border border-gray-200 bg-white p-5 shadow-xs mb-8 text-xs">
          {/* Shipping Address */}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-gray-900 mb-2">
              <MapPin size={14} className="text-gray-500" />
              <span>Shipping Address</span>
            </div>
            <p className="font-semibold text-gray-900">{order.shippingAddress.fullName}</p>
            <p className="text-gray-600">{order.shippingAddress.street}</p>
            <p className="text-gray-600">
              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.postalCode}
            </p>
            <p className="text-gray-600">{order.shippingAddress.country}</p>
            {order.shippingAddress.phone && (
              <p className="text-gray-500 mt-1">Phone: {order.shippingAddress.phone}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-gray-900 mb-2">
              <CreditCard size={14} className="text-gray-500" />
              <span>Payment Method</span>
            </div>
            <p className="font-semibold text-gray-900 capitalize">
              {order.paymentMethod.type}
            </p>
            {order.paymentMethod.type === 'card' && (
              <p className="text-gray-600">
                {order.paymentMethod.brand} ending in {order.paymentMethod.last4}
              </p>
            )}
            {order.paymentMethod.type === 'upi' && (
              <p className="text-gray-600">UPI ID: {order.paymentMethod.upiId}</p>
            )}
            {order.paymentMethod.type === 'cod' && (
              <p className="text-gray-600">Cash on Delivery</p>
            )}
          </div>

          {/* Order Summary Pricing */}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-gray-900 mb-2">
              <ShieldCheck size={14} className="text-gray-500" />
              <span>Order Summary</span>
            </div>
            <div className="space-y-1 text-gray-600">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>${order.shippingCost.toFixed(2)}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between">
                  <span>Estimated Tax:</span>
                  <span>${order.tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-1 text-sm">
                <span>Grand Total:</span>
                <span className="text-[#b12704]">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Order Items ── */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs mb-8">
          <h2 className="text-base font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Items Ordered ({order.items.length})
          </h2>

          <div className="divide-y divide-gray-100 space-y-4">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="pt-4 first:pt-0 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
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

                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 max-w-lg">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Quantity: <strong className="text-gray-800">{item.quantity}</strong> · ${item.price.toFixed(2)} each
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-green-700">
                      <Truck size={14} />
                      <span>Estimated Delivery: {order.estimatedDelivery || 'Standard'}</span>
                    </div>
                  </div>
                </div>

                {/* Line Item Actions */}
                <div className="flex flex-col gap-2 w-full sm:w-48 text-xs">
                  <Link
                    href={`/product/${item.productId}`}
                    className="w-full rounded bg-amazon-yellow py-1.5 text-center font-semibold text-gray-900 hover:bg-amazon-yellow-hover border border-[#fcd200] flex items-center justify-center gap-1.5"
                  >
                    <Star size={13} />
                    <span>Write a product review</span>
                  </Link>

                  {order.status !== 'cancelled' && order.status !== 'REFUNDED' && (
                    <button
                      type="button"
                      onClick={() => handleOpenReturnModal(item)}
                      className="w-full rounded border border-gray-300 bg-white py-1.5 text-center font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw size={13} />
                      <span>Return or replace</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Recommendations: Based on your order ── */}
        {recommendations.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 mb-4">
              Recommended based on this purchase
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {recommendations.map((p) => {
                const img = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';
                return (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    className="group flex flex-col justify-between rounded-lg border border-gray-200 p-3 hover:border-gray-300 hover:shadow-xs transition-all bg-white"
                  >
                    <div>
                      <div className="relative h-28 w-full rounded bg-white overflow-hidden mb-2">
                        <Image
                          src={img}
                          alt={p.title}
                          fill
                          sizes="150px"
                          className="object-contain p-1 group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <h3 className="text-xs font-medium text-amazon-link group-hover:underline line-clamp-2">
                        {p.title}
                      </h3>
                      <div className="mt-1 flex items-center gap-1 text-xs text-amber-500">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span className="text-gray-700 font-bold">{p.rating.toFixed(1)}</span>
                        <span className="text-gray-400">({p.reviewCount})</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-1 border-t border-gray-100 text-sm font-bold text-gray-900">
                      ${p.price.toFixed(2)}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Return Request Modal ── */}
      {selectedItemForReturn && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-2xs p-4"
        >
          <div className="relative w-full max-w-lg rounded-xl border border-gray-300 bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedItemForReturn(null)}
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
                  onClick={() => setSelectedItemForReturn(null)}
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
