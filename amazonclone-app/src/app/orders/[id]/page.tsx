'use client';
// ============================================================================
// Order Details & Tracking Page — /orders/[id]
// Valenza Maison Haute Horlogerie & Joaillerie Private Allocation Dossier
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
  Sparkles,
  Award,
  Crown,
  FileText,
  Printer,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/context/LocationContext';
import { getOrderById } from '@/services/orderService';
import {
  createCustomerReturn,
  fetchOrderReturns,
  progressReturnState,
  RETURN_REASONS,
  checkReturnEligibility,
} from '@/services/returnService';
import { getRecommendationsForHome } from '@/services/recommendationService';
import { formatPrice } from '@/lib/utils';
import type { Order, OrderItem, ReturnRequest, Product } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { country, convertPrice } = useLocation();

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
      alert(eligibility.reason || 'This piece is not eligible for salon return.');
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
        setNoticeMessage('Your salon exchange/return request has been submitted to the Atelier Concierge.');
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
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-10 animate-pulse">
          <div className="h-4 w-48 bg-[#ebe2d1] dark:bg-[#1f2533] rounded-full mb-8" />
          <div className="h-48 bg-[#ebe2d1]/50 dark:bg-[#161a25] rounded-3xl mb-8" />
          <div className="h-64 bg-[#ebe2d1]/50 dark:bg-[#161a25] rounded-3xl" />
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-screen-md px-4 py-20 text-center">
          <div className="w-14 h-14 rounded-full border border-[#d6be90] dark:border-[#c5a059]/40 bg-[#fbfaf8] dark:bg-[#161a25] flex items-center justify-center mx-auto mb-3">
            <Package size={24} className="text-[#9b8353] dark:text-[#d6be90]" />
          </div>
          <h1 className="font-serif text-2xl font-medium text-[#141312] dark:text-[#f8f5ee] mb-2">
            Allocation Dossier Not Found
          </h1>
          <p className="text-xs text-[#786b58] dark:text-[#9e978b] max-w-md mx-auto mb-6">
            We could not locate an active archive matching the requested allocation ID.
          </p>
          <button
            type="button"
            onClick={() => router.push('/orders')}
            className="px-6 py-3 rounded-xl font-sans text-xs uppercase tracking-wider font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] to-[#b89548] hover:brightness-105 shadow-md cursor-pointer"
          >
            Return to Allocations
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 py-6 sm:py-8 font-sans text-[#141312] dark:text-[#f8f5ee]">
        {/* Notice alert */}
        {noticeMessage && (
          <div className="fixed top-24 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-[#141312]/95 dark:bg-[#1f2533]/95 border border-[#c5a059]/40 backdrop-blur-md px-5 py-3.5 text-xs uppercase tracking-widest font-semibold text-[#f8f5ee] shadow-2xl transition-all animate-bounce">
            <Sparkles size={16} className="text-[#c5a059]" />
            <span>{noticeMessage}</span>
          </div>
        )}

        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-[#9b8353] dark:text-[#d6be90] hover:underline"
          >
            <ChevronLeft size={14} />
            Back to Client Allocations
          </Link>
        </div>

        {/* Page Heading & Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ebe2d1] dark:border-[#1e2433] pb-5 mb-8">
          <div>
            <span className="text-[10px] uppercase font-semibold tracking-[0.25em] text-[#9b8353] dark:text-[#d6be90] block mb-1">
              Atelier Dossier &amp; Transit Record
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-[#141312] dark:text-[#f8f5ee]">
              Allocation #{order.id}
            </h1>
            <p className="text-xs text-[#786b58] dark:text-[#9e978b] mt-1.5">
              Acquired on{' '}
              <strong className="text-[#141312] dark:text-[#f8f5ee] font-medium">
                {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </strong>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#f6efe1] dark:bg-[#1a2130] border border-[#e4d6bf] dark:border-[#2f384d] text-xs font-semibold text-[#786b58] dark:text-[#d6be90] uppercase tracking-wider">
              <Sparkles size={13} className="text-[#c5a059]" />
              {order.status}
            </span>
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] bg-white dark:bg-[#161a25] hover:border-[#c5a059] text-[#786b58] dark:text-[#c4b59d] cursor-pointer"
              title="Print Dossier"
            >
              <Printer size={16} />
            </button>
          </div>
        </div>

        {/* ── Return Active Banner ── */}
        {returns.length > 0 && (
          <div className="mb-8 rounded-3xl border border-[#e8dcce] dark:border-[#2f384d] bg-[#fcf8f0] dark:bg-[#1a2130] p-6 shadow-sm">
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
                      <RotateCcw size={18} className="text-[#c5a059]" />
                      <h2 className="font-serif text-sm font-medium text-[#141312] dark:text-[#f8f5ee]">
                        Salon Consultation for: {ret.itemTitle}
                      </h2>
                    </div>
                    <div className="text-xs">
                      <span className="font-serif font-semibold text-emerald-700 dark:text-emerald-400">
                        Refund Credit: {formatPrice(ret.refundAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-[#786b58] dark:text-[#9e978b]">
                    <p>
                      <strong>Reason:</strong> {ret.reason}
                    </p>
                    {ret.note && (
                      <p className="mt-1 italic">
                        &ldquo;{ret.note}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Visual Stepper */}
                  <div className="pt-2">
                    <div className="grid grid-cols-5 gap-2 text-[10px] text-center font-medium">
                      {stages.map((stage, idx) => (
                        <div key={stage} className="flex flex-col items-center">
                          <div
                            className={`h-2 w-full rounded-full mb-1.5 transition-colors ${
                              idx <= currentStageIdx ? 'bg-[#c5a059]' : 'bg-[#e5decb] dark:bg-[#283042]'
                            }`}
                          />
                          <span
                            className={
                              idx <= currentStageIdx ? 'text-[#9b8353] dark:text-[#d6be90] font-semibold' : 'text-[#a09585] dark:text-[#58647d]'
                            }
                          >
                            {stage === 'RETURN_REQUESTED'
                              ? 'Initiated'
                              : stage === 'RETURN_APPROVED'
                              ? 'Approved'
                              : stage === 'RETURNED'
                              ? 'Received'
                              : stage === 'REFUND_PENDING'
                              ? 'Processing'
                              : 'Settled'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Order Summary Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 p-6 sm:p-8 shadow-[0_12px_40px_rgba(26,23,20,0.04)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.6)] mb-10 text-xs">
          {/* Shipping Address */}
          <div>
            <div className="flex items-center gap-2 font-serif font-semibold text-[#9b8353] dark:text-[#d6be90] mb-3">
              <MapPin size={15} className="text-[#c5a059]" />
              <span>Destination Client</span>
            </div>
            <p className="font-semibold text-[#141312] dark:text-[#f8f5ee]">{order.shippingAddress.fullName}</p>
            <p className="text-[#615442] dark:text-[#b8af9f]">{order.shippingAddress.street}</p>
            <p className="text-[#615442] dark:text-[#b8af9f]">
              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.postalCode}
            </p>
            <p className="text-[#615442] dark:text-[#b8af9f]">{order.shippingAddress.country}</p>
            {order.shippingAddress.phone && (
              <p className="text-[#8e816e] dark:text-[#7e8aa2] mt-1.5">Secure Line: {order.shippingAddress.phone}</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <div className="flex items-center gap-2 font-serif font-semibold text-[#9b8353] dark:text-[#d6be90] mb-3">
              <CreditCard size={15} className="text-[#c5a059]" />
              <span>Settlement Protocol</span>
            </div>
            <p className="font-semibold capitalize text-[#141312] dark:text-[#f8f5ee]">
              {order.paymentMethod.type}
            </p>
            {order.paymentMethod.type === 'card' && (
              <p className="text-[#615442] dark:text-[#b8af9f]">
                {order.paymentMethod.brand} ending in {order.paymentMethod.last4}
              </p>
            )}
            {order.paymentMethod.type === 'upi' && (
              <p className="text-[#615442] dark:text-[#b8af9f]">UPI ID: {order.paymentMethod.upiId}</p>
            )}
            {order.paymentMethod.type === 'cod' && (
              <p className="text-[#615442] dark:text-[#b8af9f]">Vault Concierge Settlement</p>
            )}
          </div>

          {/* Order Summary Pricing */}
          <div>
            <div className="flex items-center gap-2 font-serif font-semibold text-[#9b8353] dark:text-[#d6be90] mb-3">
              <Award size={15} className="text-[#c5a059]" />
              <span>Valuation Summary</span>
            </div>
            <div className="space-y-1.5 text-[#786b58] dark:text-[#9e978b]">
              <div className="flex justify-between">
                <span>Pieces Subtotal:</span>
                <span className="font-serif font-medium text-[#141312] dark:text-[#f8f5ee]">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Insured Courier:</span>
                <span className="font-serif font-medium text-[#141312] dark:text-[#f8f5ee]">{formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between font-serif font-bold text-sm text-[#141312] dark:text-[#f8f5ee] border-t border-[#f0eae0] dark:border-[#1e2433] pt-2">
                <span>Grand Valuation:</span>
                <span className="text-[#9b8353] dark:text-[#d6be90]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Order Items ── */}
        <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 p-6 sm:p-8 shadow-[0_12px_40px_rgba(26,23,20,0.04)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.6)] mb-10">
          <h2 className="font-serif text-lg font-medium text-[#141312] dark:text-[#f8f5ee] mb-6 pb-3 border-b border-[#f0eae0] dark:border-[#1e2433]">
            Allocated Masterpieces ({order.items.length})
          </h2>

          <div className="divide-y divide-[#f0eae0] dark:divide-[#1e2433] space-y-5">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="pt-5 first:pt-0 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between"
              >
                <div className="flex gap-5 items-center flex-1">
                  <div className="relative h-24 w-24 rounded-2xl border border-[#ebe2d1] dark:border-[#262c3d] bg-[#fbfaf8] dark:bg-[#161a25] p-2 shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="96px"
                      className="object-contain p-1"
                    />
                  </div>

                  <div>
                    <h3 className="font-serif text-sm font-medium text-[#141312] dark:text-[#f8f5ee] line-clamp-2 max-w-lg">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#786b58] dark:text-[#9e978b] mt-1">
                      Quantity: <strong className="text-[#141312] dark:text-[#f8f5ee]">{item.quantity}</strong> · <span className="font-serif font-semibold">{formatPrice(item.price)} each</span>
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-[#9b8353] dark:text-[#d6be90] font-medium">
                      <Truck size={14} className="text-[#c5a059]" />
                      <span>Insured Dispatch: {order.estimatedDelivery || 'In 4-5 Business Days'}</span>
                    </div>
                  </div>
                </div>

                {/* Line Item Actions */}
                <div className="flex flex-col gap-2.5 w-full sm:w-52 text-xs">
                  <Link
                    href={`/product/${item.productId}`}
                    className="w-full rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b89548] text-[#12110f] py-2.5 text-center font-semibold uppercase tracking-wider text-[11px] shadow-sm hover:brightness-105 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Star size={13} />
                    <span>Client Appraisal</span>
                  </Link>

                  {order.status !== 'cancelled' && order.status !== 'REFUNDED' && (
                    <button
                      type="button"
                      onClick={() => handleOpenReturnModal(item)}
                      className="w-full rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] bg-white dark:bg-[#161a25] py-2 text-center font-medium text-[#786b58] dark:text-[#c4b59d] hover:border-[#c5a059] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <RotateCcw size={13} className="text-[#c5a059]" />
                      <span>Salon Consultation</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Return Request Modal ── */}
      {selectedItemForReturn && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-[#141312] dark:text-[#f8f5ee]"
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#12151f] p-6 sm:p-8 shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedItemForReturn(null)}
              className="absolute top-5 right-5 text-[#9a8d7a] hover:text-[#141312] dark:hover:text-[#f8f5ee] cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <RotateCcw size={18} className="text-[#c5a059]" />
              <h3 className="font-serif text-base font-medium">
                Salon Consultation &amp; Return Request
              </h3>
            </div>

            <div className="flex items-center gap-4 p-4 bg-[#fbfaf8] dark:bg-[#161a25] rounded-2xl border border-[#ebe2d1] dark:border-[#262c3d] mb-5">
              <div className="relative h-14 w-14 rounded-xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#12151f] p-1 shrink-0">
                <Image
                  src={selectedItemForReturn.image}
                  alt={selectedItemForReturn.title}
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </div>
              <div className="text-xs">
                <p className="font-serif font-medium line-clamp-1">
                  {selectedItemForReturn.title}
                </p>
                <p className="text-[#786b58] dark:text-[#9e978b] mt-0.5">
                  Refund credit valuation:{' '}
                  <strong className="font-serif text-[#9b8353] dark:text-[#d6be90]">
                    {formatPrice(selectedItemForReturn.price * selectedItemForReturn.quantity)}
                  </strong>
                </p>
              </div>
            </div>

            {returnError && (
              <div className="mb-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-900/50">
                {returnError}
              </div>
            )}

            <form onSubmit={handleConfirmReturn} className="space-y-4 text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#786b58] dark:text-[#c4b59d]">
                  Reason for Consultation / Return
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] bg-white dark:bg-[#161a25] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059]"
                  required
                >
                  {RETURN_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#786b58] dark:text-[#c4b59d]">
                  Bespoke Notes for Client Concierge (Optional)
                </label>
                <textarea
                  rows={3}
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="Provide any additional resizing or exchange preferences..."
                  className="w-full rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] bg-white dark:bg-[#161a25] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#f0eae0] dark:border-[#1e2433]">
                <button
                  type="button"
                  onClick={() => setSelectedItemForReturn(null)}
                  className="rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] px-5 py-2 text-xs font-semibold text-[#786b58] dark:text-[#c4b59d] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b89548] px-6 py-2 text-xs uppercase tracking-wider font-semibold text-[#12110f] shadow-sm hover:brightness-105 cursor-pointer disabled:opacity-50"
                >
                  {submittingReturn ? 'Submitting...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
