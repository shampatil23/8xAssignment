'use client';
// ============================================================================
// Your Orders & Returns Page — /orders
// Authentic Amazon layout: Order History, Return Initiation, Invoice Modal,
// Buy Again, Delivery Steppers, Address Popover, and Time Period Filters.
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
  ChevronDown,
  Truck,
  RefreshCw,
  FileText,
  Share2,
  HelpCircle,
  Archive,
  ChevronRight,
  Printer,
  ExternalLink,
  MapPin,
  CreditCard,
  ShoppingCart,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { getUserOrders, cancelOrder } from '@/services/orderService';
import {
  createCustomerReturn,
  fetchUserReturns,
  progressReturnState,
  RETURN_REASONS,
  checkReturnEligibility,
} from '@/services/returnService';
import { formatPrice } from '@/lib/utils';
import type { Order, OrderItem, ReturnRequest, Product } from '@/types';

type OrderFilterTab = 'all' | 'buy-again' | 'not-shipped' | 'cancelled' | 'returns';
type TimeFilterOption = '3-months' | '30-days' | '6-months' | '2026' | '2025' | 'archived';

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { addItem } = useCart();

  const [orders, setOrders] = useState<Order[]>([]);
  const [returns, setReturns] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<OrderFilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilterOption>('3-months');

  // Popover & Modal States
  const [hoveredAddressOrderId, setHoveredAddressOrderId] = useState<string | null>(null);
  const [invoiceOrder, setInvoiceOrder] = useState<Order | null>(null);
  const [archivedOrderIds, setArchivedOrderIds] = useState<Set<string>>(new Set());

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
        getUserOrders(user.uid, 1, 100),
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

  // Status progression helper for evaluation / demo
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
      setNoticeMessage(`Return status updated to ${nextStage.replace(/_/g, ' ')}!`);
      setTimeout(() => setNoticeMessage(null), 3000);
      await loadData();
    }
  };

  // Cancel order handler
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await cancelOrder(orderId);
      if (res.success) {
        setNoticeMessage('Order has been cancelled successfully.');
        setTimeout(() => setNoticeMessage(null), 4000);
        await loadData();
      } else {
        alert(res.error || 'Failed to cancel order.');
      }
    } catch (err) {
      alert('Failed to cancel order.');
    }
  };

  // Archive order handler
  const handleArchiveOrder = (orderId: string) => {
    setArchivedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
    setNoticeMessage('Order archived status updated.');
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  // Buy item again
  const handleBuyAgain = async (item: OrderItem) => {
    try {
      const mockProduct: Product = {
        id: item.productId,
        title: item.title,
        sku: `SKU-${item.productId}`,
        slug: item.productId,
        status: 'active',
        price: item.price,
        images: [{ url: item.image, alt: item.title, isPrimary: true }],
        description: item.title,
        category: 'general',
        tags: ['order'],
        rating: 4.5,
        reviewCount: 10,
        stock: 99,
        brand: 'Amazon Clone',
        deliveryInfo: {
          isFreeDelivery: true,
          estimatedDays: 2,
          fastestDeliveryDate: 'Tomorrow',
          standardDeliveryDate: 'In 2-3 business days',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await addItem(mockProduct, 1);
      setNoticeMessage(`Added "${item.title.slice(0, 30)}..." to cart.`);
      setTimeout(() => setNoticeMessage(null), 3000);
    } catch {
      alert('Could not add item to cart.');
    }
  };

  // Filtered orders list calculation
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    // Tab Filtering
    if (activeTab === 'buy-again') {
      // Returns all completed/confirmed orders with items
      list = list.filter((o) => o.status !== 'cancelled');
    } else if (activeTab === 'not-shipped') {
      list = list.filter((o) => o.status === 'pending' || o.status === 'confirmed' || o.status === 'processing');
    } else if (activeTab === 'cancelled') {
      list = list.filter((o) => o.status === 'cancelled');
    } else if (activeTab === 'returns') {
      const returnOrderIds = new Set(returns.map((r) => r.orderId));
      list = list.filter(
        (o) =>
          returnOrderIds.has(o.id) ||
          o.status === 'RETURN_REQUESTED' ||
          o.status === 'RETURN_APPROVED' ||
          o.status === 'RETURNED' ||
          o.status === 'REFUND_PENDING' ||
          o.status === 'REFUNDED'
      );
    }

    // Time filter
    if (timeFilter === 'archived') {
      list = list.filter((o) => archivedOrderIds.has(o.id));
    } else {
      list = list.filter((o) => !archivedOrderIds.has(o.id));
      const now = new Date();
      if (timeFilter === '30-days') {
        const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        list = list.filter((o) => new Date(o.createdAt) >= past30);
      } else if (timeFilter === '3-months') {
        const past3m = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        list = list.filter((o) => new Date(o.createdAt) >= past3m);
      } else if (timeFilter === '6-months') {
        const past6m = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
        list = list.filter((o) => new Date(o.createdAt) >= past6m);
      } else if (timeFilter === '2026') {
        list = list.filter((o) => new Date(o.createdAt).getFullYear() === 2026);
      } else if (timeFilter === '2025') {
        list = list.filter((o) => new Date(o.createdAt).getFullYear() === 2025);
      }
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.items.some((i) => i.title.toLowerCase().includes(q))
      );
    }

    return list;
  }, [orders, returns, activeTab, timeFilter, searchQuery, archivedOrderIds]);

  // Auth gate
  if (!authLoading && !user) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-screen-md px-4 py-16 text-center">
          <Package size={48} className="text-gray-400 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Your Orders</h1>
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
      <div className="mx-auto max-w-screen-xl px-4 py-5 font-sans text-[#0f1111]">
        {/* Notice alert */}
        {noticeMessage && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-md bg-[#007600] px-4 py-3 text-xs font-bold text-white shadow-xl animate-in fade-in">
            <CheckCircle2 size={18} />
            <span>{noticeMessage}</span>
          </div>
        )}

        {/* Amazon Breadcrumbs */}
        <div className="text-xs text-[#565959] mb-3 flex items-center gap-1">
          <Link href="/account" className="hover:text-[#c7511f] hover:underline">
            Your Account
          </Link>
          <ChevronRight size={12} className="text-gray-400" />
          <span className="text-[#c7511f] font-bold">Your Orders</span>
        </div>

        {/* Top Title & Search Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-normal text-[#0f1111]">Your Orders</h1>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all orders by item or ID"
                className="w-full rounded-md border border-[#888c8c] pl-9 pr-3 py-1.5 text-xs text-[#0f1111] focus:outline-none focus:ring-1 focus:ring-[#e77600] focus:border-[#e77600]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="button"
              className="px-4 py-1.5 rounded-md bg-[#303538] hover:bg-[#23272a] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              Search Orders
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center border-b border-[#d5d9d9] mb-4 text-xs font-medium gap-8 overflow-x-auto scrollbar-hide">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`pb-2.5 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'all'
                ? 'border-[#e77600] font-bold text-[#0f1111]'
                : 'border-transparent text-[#565959] hover:text-[#0f1111] hover:border-gray-400'
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('buy-again')}
            className={`pb-2.5 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'buy-again'
                ? 'border-[#e77600] font-bold text-[#0f1111]'
                : 'border-transparent text-[#565959] hover:text-[#0f1111] hover:border-gray-400'
            }`}
          >
            Buy Again
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('not-shipped')}
            className={`pb-2.5 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'not-shipped'
                ? 'border-[#e77600] font-bold text-[#0f1111]'
                : 'border-transparent text-[#565959] hover:text-[#0f1111] hover:border-gray-400'
            }`}
          >
            Not Yet Shipped
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cancelled')}
            className={`pb-2.5 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'cancelled'
                ? 'border-[#e77600] font-bold text-[#0f1111]'
                : 'border-transparent text-[#565959] hover:text-[#0f1111] hover:border-gray-400'
            }`}
          >
            Cancelled Orders
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('returns')}
            className={`pb-2.5 transition-all cursor-pointer whitespace-nowrap border-b-2 ${
              activeTab === 'returns'
                ? 'border-[#e77600] font-bold text-[#0f1111]'
                : 'border-transparent text-[#565959] hover:text-[#0f1111] hover:border-gray-400'
            }`}
          >
            Returns &amp; Refunds ({returns.length})
          </button>
        </div>

        {/* Time Period Filter Dropdown Bar */}
        <div className="flex items-center gap-2 mb-6 text-xs text-[#0f1111]">
          <span className="font-semibold text-[#565959]">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} placed in
          </span>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilterOption)}
            className="rounded border border-[#d5d9d9] bg-[#f0f2f2] hover:bg-[#e3e6e6] px-3 py-1 text-xs font-semibold text-[#0f1111] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#e77600]"
          >
            <option value="3-months">past 3 months</option>
            <option value="30-days">past 30 days</option>
            <option value="6-months">last 6 months</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="archived">Archived Orders</option>
          </select>
        </div>

        {/* Orders Feed */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((n) => (
              <div key={n} className="h-48 bg-gray-100 rounded-lg border border-[#d5d9d9] animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-lg border border-[#d5d9d9] bg-white p-12 text-center shadow-xs">
            <Package size={44} className="text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#0f1111] mb-1">No orders found</h3>
            <p className="text-xs text-[#565959] max-w-md mx-auto mb-6">
              There are no orders matching your current filter selection. Try changing the time period or searching for a different keyword.
            </p>
            <Button type="button" variant="cart" onClick={() => router.push('/')} className="font-bold text-xs px-6 py-2">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const orderReturns = returns.filter((r) => r.orderId === order.id);
              const isArchived = archivedOrderIds.has(order.id);

              return (
                <div
                  key={order.id}
                  className="rounded-lg border border-[#d5d9d9] bg-white overflow-hidden shadow-2xs hover:shadow-xs transition-shadow"
                >
                  {/* Order Header Bar (Real Amazon Grey Bar) */}
                  <div className="bg-[#f6f6f6] px-5 py-3 border-b border-[#d5d9d9] flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex flex-wrap items-center gap-6 sm:gap-10">
                      {/* Order Placed */}
                      <div>
                        <span className="block text-[11px] uppercase text-[#565959] tracking-tight">
                          ORDER PLACED
                        </span>
                        <span className="font-normal text-[#0f1111]">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Total */}
                      <div>
                        <span className="block text-[11px] uppercase text-[#565959] tracking-tight">
                          TOTAL
                        </span>
                        <span className="font-bold text-[#0f1111]">
                          {formatPrice(order.total)}
                        </span>
                      </div>

                      {/* Ship To Popover */}
                      <div className="relative">
                        <span className="block text-[11px] uppercase text-[#565959] tracking-tight">
                          SHIP TO
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setHoveredAddressOrderId(
                              hoveredAddressOrderId === order.id ? null : order.id
                            )
                          }
                          className="font-normal text-[#007185] hover:text-[#c7511f] flex items-center gap-0.5 cursor-pointer hover:underline"
                        >
                          <span>{order.shippingAddress.fullName}</span>
                          <ChevronDown size={12} />
                        </button>

                        {/* Address Hover Card */}
                        {hoveredAddressOrderId === order.id && (
                          <div className="absolute left-0 top-full mt-2 z-30 w-64 rounded-md border border-[#d5d9d9] bg-white p-4 shadow-xl text-xs space-y-1 text-[#0f1111] animate-in fade-in">
                            <div className="flex justify-between items-start pb-1.5 border-b border-gray-100">
                              <span className="font-bold text-[#0f1111]">Shipping Address</span>
                              <button
                                onClick={() => setHoveredAddressOrderId(null)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <p className="font-bold">{order.shippingAddress.fullName}</p>
                            <p>{order.shippingAddress.street}</p>
                            <p>
                              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                              {order.shippingAddress.postalCode}
                            </p>
                            <p>{order.shippingAddress.country}</p>
                            {order.shippingAddress.phone && (
                              <p className="text-[#565959] pt-1">
                                Phone: {order.shippingAddress.phone}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order ID & Invoice Links */}
                    <div className="flex flex-col sm:items-end text-right">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#565959]">
                        <span>ORDER #</span>
                        <strong className="text-[#0f1111] font-mono">{order.id}</strong>
                      </div>

                      <div className="flex items-center gap-3 text-xs mt-0.5">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-[#007185] hover:text-[#c7511f] hover:underline"
                        >
                          View order details
                        </Link>
                        <span className="text-gray-300">|</span>
                        <button
                          type="button"
                          onClick={() => setInvoiceOrder(order)}
                          className="text-[#007185] hover:text-[#c7511f] hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Invoice</span>
                          <ChevronDown size={11} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Return Lifecycle Banner (If return active) */}
                  {orderReturns.length > 0 && (
                    <div className="bg-[#fff9e6] px-5 py-3.5 border-b border-[#ffe299] text-xs">
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
                          <div key={ret.id} className="space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-bold text-[#0f1111] flex items-center gap-1.5">
                                <RotateCcw size={15} className="text-[#e47911]" />
                                <span>Return Status:</span>
                                <span className="text-[#c7511f] font-bold uppercase">
                                  {ret.status.replace(/_/g, ' ')}
                                </span>
                              </span>
                              <span className="font-bold text-[#007600]">
                                Refund Amount: {formatPrice(ret.refundAmount)}
                              </span>
                            </div>

                            {/* Stepper Bar */}
                            <div className="grid grid-cols-5 gap-1.5 text-[10px] text-center font-semibold pt-1">
                              {stages.map((stage, idx) => (
                                <div key={stage} className="flex flex-col items-center">
                                  <div
                                    className={`h-2.5 w-full rounded-full mb-1 transition-all ${
                                      idx <= currentStageIdx ? 'bg-[#007600]' : 'bg-[#e7e7e7]'
                                    }`}
                                  />
                                  <span
                                    className={
                                      idx <= currentStageIdx ? 'text-[#007600] font-bold' : 'text-gray-400'
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

                            {/* Advance Status Demo Action */}
                            {currentStageIdx < stages.length - 1 && (
                              <div className="pt-1.5 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => handleAdvanceReturn(ret)}
                                  className="text-[11px] font-semibold text-[#007185] hover:text-[#c7511f] bg-white px-3 py-1 rounded border border-[#d5d9d9] hover:bg-[#f7fafa] transition-colors"
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

                  {/* Delivery Banner */}
                  <div className="px-5 pt-4 pb-1">
                    {order.status === 'cancelled' ? (
                      <div className="flex items-center gap-2 text-red-700 text-sm font-bold">
                        <X size={18} className="text-red-600 shrink-0" />
                        <span>Cancelled</span>
                      </div>
                    ) : order.status === 'delivered' ? (
                      <div className="flex items-center gap-2 text-[#007600] text-sm font-bold">
                        <CheckCircle2 size={18} className="shrink-0" />
                        <span>Delivered {order.estimatedDelivery || 'on schedule'}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[#0f1111] text-sm font-bold">
                        <Truck size={18} className="text-[#007600] shrink-0" />
                        <span>Arriving {order.estimatedDelivery || 'Tomorrow'}</span>
                      </div>
                    )}
                  </div>

                  {/* Order Line Items */}
                  <div className="p-5 divide-y divide-[#eaeded]">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-4 first:pt-1 last:pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                      >
                        {/* Item Details */}
                        <div className="flex gap-4 items-start flex-1 min-w-0">
                          <Link href={`/product/${item.productId}`} className="shrink-0">
                            <div className="relative h-24 w-24 rounded border border-[#d5d9d9] bg-white p-1.5 hover:opacity-90 transition-opacity">
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="96px"
                                className="object-contain p-1"
                              />
                            </div>
                          </Link>

                          <div className="space-y-1.5 min-w-0 flex-1">
                            <Link
                              href={`/product/${item.productId}`}
                              className="text-sm font-semibold text-[#007185] hover:text-[#c7511f] hover:underline leading-snug line-clamp-2 block"
                            >
                              {item.title}
                            </Link>

                            <p className="text-xs text-[#565959]">
                              Qty: {item.quantity} · Price: {formatPrice(item.price)}
                            </p>

                            <div className="text-[11px] text-[#565959] space-y-0.5">
                              <p>Sold by: <span className="text-[#0f1111] font-medium">Amazon Clone partner</span></p>
                              <p className="text-[#565959]">
                                {order.status === 'delivered'
                                  ? 'Return window closed'
                                  : 'Eligible for Return or Replacement'}
                              </p>
                            </div>

                            {/* Buy Again Button under item */}
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => handleBuyAgain(item)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200] px-3.5 py-1 text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                              >
                                <RefreshCw size={13} />
                                <span>Buy it again</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Stacked Action Column (Authentic Amazon Buttons) */}
                        <div className="flex flex-col gap-2 w-full md:w-56 text-xs shrink-0">
                          {/* Track Package Button */}
                          {order.status !== 'cancelled' && (
                            <Link
                              href={`/orders/${order.id}`}
                              className="w-full rounded-md bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] border border-[#fcd200] py-1.5 text-center font-medium shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Truck size={14} />
                              <span>Track package</span>
                            </Link>
                          )}

                          {/* Write a Product Review */}
                          <Link
                            href={`/product/${item.productId}`}
                            className="w-full rounded-md bg-white hover:bg-[#f7fafa] text-[#0f1111] border border-[#d5d9d9] py-1.5 text-center font-medium shadow-2xs transition-colors flex items-center justify-center gap-1.5"
                          >
                            <Star size={14} className="text-[#e47911]" />
                            <span>Write a product review</span>
                          </Link>

                          {/* Return or Replace Items */}
                          {order.status !== 'cancelled' && order.status !== 'REFUNDED' && (
                            <button
                              type="button"
                              onClick={() => handleStartReturnModal(order, item)}
                              className="w-full rounded-md bg-white hover:bg-[#f7fafa] text-[#0f1111] border border-[#d5d9d9] py-1.5 text-center font-medium shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <RotateCcw size={14} />
                              <span>Return or replace items</span>
                            </button>
                          )}

                          {/* Cancel Order Option (If pending/confirmed) */}
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(order.id)}
                              className="w-full rounded-md bg-white hover:bg-red-50 text-red-700 border border-red-300 py-1.5 text-center font-medium shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <X size={14} />
                              <span>Cancel order</span>
                            </button>
                          )}

                          {/* Archive Order Toggle */}
                          <button
                            type="button"
                            onClick={() => handleArchiveOrder(order.id)}
                            className="w-full rounded-md bg-white hover:bg-[#f7fafa] text-[#565959] hover:text-[#0f1111] border border-[#d5d9d9] py-1.5 text-center font-normal shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Archive size={13} />
                            <span>{isArchived ? 'Unarchive order' : 'Archive order'}</span>
                          </button>
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

      {/* ── Printable Invoice Modal ── */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[1px] p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-300 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-[#f0f2f2] px-6 py-4 border-b border-[#d5d9d9]">
              <div className="flex items-center gap-2">
                <FileText size={20} className="text-amazon-orange" />
                <h3 className="font-bold text-[#0f1111] text-base">Order Invoice Summary</h3>
              </div>
              <button
                onClick={() => setInvoiceOrder(null)}
                className="text-gray-500 hover:text-gray-800 p-1 rounded hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs text-[#0f1111]">
              <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                <div>
                  <h2 className="text-lg font-extrabold text-[#0f1111] tracking-tight">
                    amazon<span className="text-amazon-orange">.</span>clone
                  </h2>
                  <p className="text-[#565959]">Order Invoice #{invoiceOrder.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#0f1111]">
                    Order Date: {new Date(invoiceOrder.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-[#565959]">Status: {invoiceOrder.status}</p>
                </div>
              </div>

              {/* Shipping & Payment Summary */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
                <div>
                  <span className="font-bold text-[#0f1111] block mb-1">Shipping Address</span>
                  <p>{invoiceOrder.shippingAddress.fullName}</p>
                  <p>{invoiceOrder.shippingAddress.street}</p>
                  <p>
                    {invoiceOrder.shippingAddress.city}, {invoiceOrder.shippingAddress.state}{' '}
                    {invoiceOrder.shippingAddress.postalCode}
                  </p>
                  <p>{invoiceOrder.shippingAddress.country}</p>
                </div>

                <div>
                  <span className="font-bold text-[#0f1111] block mb-1">Payment Method</span>
                  <p className="uppercase font-semibold">{invoiceOrder.paymentMethod.type}</p>
                  {invoiceOrder.paymentMethod.last4 && (
                    <p className="text-[#565959]">Card ending in **** {invoiceOrder.paymentMethod.last4}</p>
                  )}
                  {invoiceOrder.paymentMethod.upiId && (
                    <p className="text-[#565959]">UPI ID: {invoiceOrder.paymentMethod.upiId}</p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div>
                <span className="font-bold text-[#0f1111] block mb-2 text-sm">Order Items</span>
                <table className="w-full text-left border border-gray-200 rounded-md overflow-hidden">
                  <thead className="bg-[#f0f2f2] text-gray-700 font-bold">
                    <tr>
                      <th className="p-2.5">Item</th>
                      <th className="p-2.5 text-center">Qty</th>
                      <th className="p-2.5 text-right">Price</th>
                      <th className="p-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoiceOrder.items.map((item, i) => (
                      <tr key={i}>
                        <td className="p-2.5 font-medium">{item.title}</td>
                        <td className="p-2.5 text-center">{item.quantity}</td>
                        <td className="p-2.5 text-right">{formatPrice(item.price)}</td>
                        <td className="p-2.5 text-right font-semibold">{formatPrice(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Breakdown */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-right border-t border-gray-200 pt-3">
                  <div className="flex justify-between">
                    <span className="text-[#565959]">Subtotal:</span>
                    <span>{formatPrice(invoiceOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#565959]">Shipping:</span>
                    <span>{formatPrice(invoiceOrder.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#565959]">Estimated Tax:</span>
                    <span>{formatPrice(invoiceOrder.tax)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-[#0f1111] border-t border-gray-300 pt-2">
                    <span>Grand Total:</span>
                    <span className="text-[#007600]">{formatPrice(invoiceOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#f0f2f2] px-6 py-3 border-t border-[#d5d9d9] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-1.5 rounded-md bg-white border border-[#d5d9d9] hover:bg-gray-100 text-xs font-semibold text-[#0f1111] flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} />
                <span>Print Invoice</span>
              </button>
              <button
                type="button"
                onClick={() => setInvoiceOrder(null)}
                className="px-4 py-1.5 rounded-md bg-[#ffd814] hover:bg-[#f7ca00] border border-[#fcd200] text-xs font-bold text-[#0f1111] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Return Request Modal ── */}
      {selectedOrderForReturn && selectedItemForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[1px] p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-lg bg-white shadow-2xl overflow-hidden border border-gray-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-5 py-3.5">
              <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <RotateCcw size={16} className="text-amazon-orange" />
                Return or Replace Item
              </h2>
              <button
                onClick={() => {
                  setSelectedOrderForReturn(null);
                  setSelectedItemForReturn(null);
                }}
                className="rounded p-1 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleConfirmReturn} className="p-5 space-y-4 text-xs text-gray-700">
              {returnError && (
                <div className="rounded border border-red-300 bg-red-50 p-3 text-red-900 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-600 shrink-0" />
                  <span>{returnError}</span>
                </div>
              )}

              {/* Selected Item Preview */}
              <div className="flex gap-3 bg-gray-50 p-3 rounded border border-gray-200 items-center">
                <div className="relative h-14 w-14 rounded border bg-white p-1 shrink-0">
                  <Image
                    src={selectedItemForReturn.image}
                    alt={selectedItemForReturn.title}
                    fill
                    sizes="56px"
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-gray-900 truncate">
                    {selectedItemForReturn.title}
                  </h4>
                  <p className="text-gray-500 mt-0.5">
                    Order #{selectedOrderForReturn.id} · Refund Value: {formatPrice(selectedItemForReturn.price * selectedItemForReturn.quantity)}
                  </p>
                </div>
              </div>

              {/* Select Reason */}
              <div>
                <label className="block font-bold text-gray-900 mb-1">
                  Why are you returning this item?
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amazon-orange"
                >
                  {RETURN_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional Comments */}
              <div>
                <label className="block font-bold text-gray-900 mb-1">
                  Comments (Optional)
                </label>
                <textarea
                  rows={3}
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="Provide any extra details about the issue..."
                  className="w-full rounded border border-gray-300 px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amazon-orange"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrderForReturn(null);
                    setSelectedItemForReturn(null);
                  }}
                  className="rounded border border-gray-300 bg-gray-100 px-4 py-1.5 font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="rounded bg-amazon-orange px-5 py-1.5 font-bold text-white hover:bg-amazon-orange-hover transition-colors shadow-xs"
                >
                  {submittingReturn ? 'Submitting...' : 'Submit Return Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
