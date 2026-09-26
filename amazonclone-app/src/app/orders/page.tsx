'use client';
// ============================================================================
// Your Orders & Acquisitions Page — /orders
// Valenza Maison Haute Horlogerie & Joaillerie Private Client Allocations
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
  Archive,
  ChevronRight,
  Printer,
  Sparkles,
  Award,
  Crown,
  Lock,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
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

  // Load orders and returns
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
      alert(eligibility.reason || 'This piece is not eligible for salon return.');
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
        setNoticeMessage('Your salon exchange/return request has been submitted to the Atelier Concierge.');
        setTimeout(() => setNoticeMessage(null), 4000);
        await loadData();
      } else {
        setReturnError(res.error || 'Failed to submit return request.');
      }
    } finally {
      setSubmittingReturn(false);
    }
  };

  // Status progression helper for evaluation
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

  // Handle cancel order
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you wish to cancel this private allocation?')) return;
    const res = await cancelOrder(orderId);
    if (res.success) {
      setNoticeMessage('Allocation successfully cancelled.');
      setTimeout(() => setNoticeMessage(null), 3000);
      await loadData();
    } else {
      alert(res.error || 'Failed to cancel allocation.');
    }
  };

  // Archive order toggle
  const handleArchiveOrder = (orderId: string) => {
    setArchivedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) {
        next.delete(orderId);
        setNoticeMessage('Allocation restored to active records.');
      } else {
        next.add(orderId);
        setNoticeMessage('Allocation archived to private records.');
      }
      setTimeout(() => setNoticeMessage(null), 2500);
      return next;
    });
  };

  // Buy again handler
  const handleBuyAgain = (item: OrderItem) => {
    const productLike: Product = {
      id: item.productId,
      sku: item.productId,
      title: item.title,
      slug: item.productId,
      description: item.title,
      category: 'horlogerie',
      price: item.price,
      stock: 10,
      images: [{ url: item.image, alt: item.title, isPrimary: true }],
      status: 'active',
      rating: 5.0,
      reviewCount: 42,
      isPrimeEligible: true,
      tags: ['luxury', 'vault'],
      deliveryInfo: {
        isFreeDelivery: true,
        estimatedDays: 2,
        fastestDeliveryDate: 'Tomorrow, by 2 PM',
        standardDeliveryDate: 'in 2 days',
        shippingFee: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    addItem(productLike, 1);
    setNoticeMessage(`Added "${item.title}" to your Private Vault.`);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  // Filtered orders computation
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    // Tab filter
    if (activeTab === 'buy-again') {
      list = list.filter((o) => o.status === 'delivered');
    } else if (activeTab === 'not-shipped') {
      list = list.filter((o) => o.status === 'pending' || o.status === 'confirmed');
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
        <div className="mx-auto max-w-screen-md px-4 py-20 text-center">
          <div className="w-16 h-16 rounded-full border border-[#d6be90] dark:border-[#c5a059]/40 bg-[#ffffff] dark:bg-[#151922] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Crown size={28} className="text-[#c5a059]" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#141312] dark:text-[#f8f5ee] mb-2">
            Client Allocations &amp; Order Vault
          </h1>
          <p className="text-xs text-[#786b58] dark:text-[#9e978b] max-w-md mx-auto mb-6 leading-relaxed">
            Please sign in with your Maison credentials to review your acquisitions, track armored dispatches, and manage salon appraisals.
          </p>
          <button
            type="button"
            onClick={() => router.push('/auth/sign-in?redirect=/orders')}
            className="px-8 py-3.5 rounded-xl font-sans text-xs uppercase tracking-[0.18em] font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] via-[#d6be90] to-[#b89548] hover:brightness-105 transition-all shadow-md cursor-pointer"
          >
            Access Client Portal
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

        {/* Luxury Breadcrumbs */}
        <div className="text-[11px] uppercase tracking-[0.16em] font-medium text-[#786b58] dark:text-[#9e978b] mb-4 flex items-center gap-2">
          <Link href="/account" className="hover:text-[#c5a059] dark:hover:text-[#d6be90] transition-colors">
            Client Account
          </Link>
          <span className="text-[#dfd6c5] dark:text-[#2c3242]">◆</span>
          <span className="text-[#141312] dark:text-[#f8f5ee] font-semibold">Allocations &amp; Orders</span>
        </div>

        {/* Top Title & Search Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[10px] uppercase font-semibold tracking-[0.25em] text-[#9b8353] dark:text-[#d6be90] block mb-1">
              Valenza Maison Archives
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-[#141312] dark:text-[#f8f5ee]">
              Client Allocations
            </h1>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9a8d7a] dark:text-[#6e778b]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search allocations by piece or ID..."
                className="w-full rounded-xl border border-[#dfd6c5] dark:border-[#272d3e] bg-white/90 dark:bg-[#161a25] pl-10 pr-8 py-2.5 text-xs text-[#141312] dark:text-[#f8f5ee] placeholder:text-[#a09585] dark:placeholder:text-[#525d75] focus:outline-none focus:border-[#c5a059] focus:ring-2 focus:ring-[#c5a059]/20 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#9a8d7a] hover:text-[#141312]"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              type="button"
              className="px-5 py-2.5 rounded-xl font-sans text-xs uppercase tracking-[0.14em] font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] to-[#b89548] hover:brightness-105 shadow-xs cursor-pointer transition-all"
            >
              Filter
            </button>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center border-b border-[#ebe2d1] dark:border-[#1e2433] mb-6 text-xs font-medium gap-6 sm:gap-8 overflow-x-auto scrollbar-hide">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`pb-3 transition-all cursor-pointer whitespace-nowrap text-xs uppercase tracking-wider font-semibold border-b-2 ${
              activeTab === 'all'
                ? 'border-[#c5a059] text-[#9b8353] dark:text-[#e8d5b5]'
                : 'border-transparent text-[#786b58] dark:text-[#9e978b] hover:text-[#141312] dark:hover:text-[#f8f5ee]'
            }`}
          >
            All Acquisitions ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('buy-again')}
            className={`pb-3 transition-all cursor-pointer whitespace-nowrap text-xs uppercase tracking-wider font-semibold border-b-2 ${
              activeTab === 'buy-again'
                ? 'border-[#c5a059] text-[#9b8353] dark:text-[#e8d5b5]'
                : 'border-transparent text-[#786b58] dark:text-[#9e978b] hover:text-[#141312] dark:hover:text-[#f8f5ee]'
            }`}
          >
            Re-Acquire Piece
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('not-shipped')}
            className={`pb-3 transition-all cursor-pointer whitespace-nowrap text-xs uppercase tracking-wider font-semibold border-b-2 ${
              activeTab === 'not-shipped'
                ? 'border-[#c5a059] text-[#9b8353] dark:text-[#e8d5b5]'
                : 'border-transparent text-[#786b58] dark:text-[#9e978b] hover:text-[#141312] dark:hover:text-[#f8f5ee]'
            }`}
          >
            In Atelier Transit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('cancelled')}
            className={`pb-3 transition-all cursor-pointer whitespace-nowrap text-xs uppercase tracking-wider font-semibold border-b-2 ${
              activeTab === 'cancelled'
                ? 'border-[#c5a059] text-[#9b8353] dark:text-[#e8d5b5]'
                : 'border-transparent text-[#786b58] dark:text-[#9e978b] hover:text-[#141312] dark:hover:text-[#f8f5ee]'
            }`}
          >
            Cancelled Allocations
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('returns')}
            className={`pb-3 transition-all cursor-pointer whitespace-nowrap text-xs uppercase tracking-wider font-semibold border-b-2 ${
              activeTab === 'returns'
                ? 'border-[#c5a059] text-[#9b8353] dark:text-[#e8d5b5]'
                : 'border-transparent text-[#786b58] dark:text-[#9e978b] hover:text-[#141312] dark:hover:text-[#f8f5ee]'
            }`}
          >
            Salon Exchanges &amp; Returns ({returns.length})
          </button>
        </div>

        {/* Time Period Filter Dropdown Bar */}
        <div className="flex items-center gap-2.5 mb-6 text-xs text-[#141312] dark:text-[#f8f5ee]">
          <span className="font-semibold text-[#786b58] dark:text-[#9e978b]">
            {filteredOrders.length} allocation{filteredOrders.length !== 1 ? 's' : ''} placed in
          </span>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilterOption)}
            className="rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] bg-white dark:bg-[#161a25] px-3.5 py-1.5 text-xs font-semibold text-[#141312] dark:text-[#f8f5ee] cursor-pointer focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]"
          >
            <option value="3-months">Past 3 Months</option>
            <option value="30-days">Past 30 Days</option>
            <option value="6-months">Last 6 Months</option>
            <option value="2026">Year 2026</option>
            <option value="2025">Year 2025</option>
            <option value="archived">Archived Allocations</option>
          </select>
        </div>

        {/* Orders Feed */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((n) => (
              <div key={n} className="h-56 bg-[#ebe2d1]/50 dark:bg-[#161a25] rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] animate-pulse" />
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 p-12 text-center shadow-sm">
            <div className="w-14 h-14 rounded-full border border-[#d6be90] dark:border-[#c5a059]/40 bg-[#fbfaf8] dark:bg-[#161a25] flex items-center justify-center mx-auto mb-3">
              <Package size={26} className="text-[#9b8353] dark:text-[#d6be90]" />
            </div>
            <h3 className="font-serif text-lg font-medium text-[#141312] dark:text-[#f8f5ee] mb-1">
              No Allocations Found
            </h3>
            <p className="text-xs text-[#786b58] dark:text-[#9e978b] max-w-md mx-auto mb-6 leading-relaxed">
              No records match your active criteria. Explore our current Haute Horlogerie &amp; Joaillerie collections.
            </p>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-6 py-3 rounded-xl font-sans text-xs uppercase tracking-[0.16em] font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] to-[#b89548] hover:brightness-105 shadow-md transition-all cursor-pointer"
            >
              Explore Maison Salons
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const orderReturns = returns.filter((r) => r.orderId === order.id);
              const isArchived = archivedOrderIds.has(order.id);

              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 overflow-hidden shadow-[0_12px_40px_rgba(26,23,20,0.04)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.6)] hover:border-[#c5a059]/60 transition-all duration-300"
                >
                  {/* Order Header Bar */}
                  <div className="bg-[#fbfaf8] dark:bg-[#161a25] px-6 py-4 border-b border-[#f0eae0] dark:border-[#1e2433] flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex flex-wrap items-center gap-6 sm:gap-10">
                      {/* Order Placed */}
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-[#8e816e] dark:text-[#7e8aa2] tracking-wider">
                          Acquisition Date
                        </span>
                        <span className="font-serif font-medium text-[#141312] dark:text-[#f8f5ee]">
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Total */}
                      <div>
                        <span className="block text-[10px] uppercase font-semibold text-[#8e816e] dark:text-[#7e8aa2] tracking-wider">
                          Valuation Total
                        </span>
                        <span className="font-serif font-semibold text-[#9b8353] dark:text-[#d6be90] text-sm sm:text-base">
                          {formatPrice(order.total)}
                        </span>
                      </div>

                      {/* Ship To Popover */}
                      <div className="relative">
                        <span className="block text-[10px] uppercase font-semibold text-[#8e816e] dark:text-[#7e8aa2] tracking-wider">
                          Concierge Recipient
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setHoveredAddressOrderId(
                              hoveredAddressOrderId === order.id ? null : order.id
                            )
                          }
                          className="font-medium text-[#141312] dark:text-[#f8f5ee] hover:text-[#c5a059] dark:hover:text-[#d6be90] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>{order.shippingAddress.fullName}</span>
                          <ChevronDown size={12} className="text-[#c5a059]" />
                        </button>

                        {/* Address Hover Card */}
                        {hoveredAddressOrderId === order.id && (
                          <div className="absolute left-0 top-full mt-2 z-30 w-72 rounded-2xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#161a25] p-5 shadow-2xl text-xs space-y-1.5 text-[#141312] dark:text-[#f8f5ee] animate-in fade-in">
                            <div className="flex justify-between items-start pb-2 border-b border-[#f0eae0] dark:border-[#1e2433]">
                              <span className="font-serif font-semibold text-[#9b8353] dark:text-[#d6be90]">
                                Destination Address
                              </span>
                              <button
                                onClick={() => setHoveredAddressOrderId(null)}
                                className="text-[#9a8d7a] hover:text-[#141312]"
                              >
                                <X size={14} />
                              </button>
                            </div>
                            <p className="font-semibold">{order.shippingAddress.fullName}</p>
                            <p className="text-[#615442] dark:text-[#b8af9f]">{order.shippingAddress.street}</p>
                            <p className="text-[#615442] dark:text-[#b8af9f]">
                              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                              {order.shippingAddress.postalCode}
                            </p>
                            <p className="text-[#615442] dark:text-[#b8af9f]">{order.shippingAddress.country}</p>
                            {order.shippingAddress.phone && (
                              <p className="text-[#8e816e] dark:text-[#7e8aa2] pt-1">
                                Secure Line: {order.shippingAddress.phone}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order ID & Invoice Links */}
                    <div className="flex flex-col sm:items-end text-right">
                      <div className="flex items-center gap-1.5 text-[11px] text-[#8e816e] dark:text-[#7e8aa2]">
                        <span className="tracking-wider uppercase">ALLOCATION #</span>
                        <strong className="font-mono text-[#141312] dark:text-[#f8f5ee] tracking-tight">{order.id}</strong>
                      </div>

                      <div className="flex items-center gap-3 text-xs mt-1">
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-medium text-[#9b8353] dark:text-[#d6be90] hover:underline transition-colors"
                        >
                          View Allocation Details
                        </Link>
                        <span className="text-[#dfd6c5] dark:text-[#2c3242]">|</span>
                        <button
                          type="button"
                          onClick={() => setInvoiceOrder(order)}
                          className="font-medium text-[#9b8353] dark:text-[#d6be90] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Atelier Certificate</span>
                          <ChevronDown size={11} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Return Lifecycle Banner */}
                  {orderReturns.length > 0 && (
                    <div className="bg-[#fcf8f0] dark:bg-[#1a2130] px-6 py-4 border-b border-[#e8dcce] dark:border-[#2f384d] text-xs">
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
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-medium text-[#141312] dark:text-[#f8f5ee] flex items-center gap-2">
                                <RotateCcw size={15} className="text-[#c5a059]" />
                                <span>Salon Return Sequence:</span>
                                <span className="font-serif font-bold text-[#9b8353] dark:text-[#d6be90] uppercase">
                                  {ret.status.replace(/_/g, ' ')}
                                </span>
                              </span>
                              <span className="font-serif font-semibold text-emerald-700 dark:text-emerald-400">
                                Refund Credit: {formatPrice(ret.refundAmount)}
                              </span>
                            </div>

                            {/* Stepper Bar */}
                            <div className="grid grid-cols-5 gap-2 text-[10px] text-center font-medium pt-1">
                              {stages.map((stage, idx) => (
                                <div key={stage} className="flex flex-col items-center">
                                  <div
                                    className={`h-2 w-full rounded-full mb-1.5 transition-all ${
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
                        );
                      })}
                    </div>
                  )}

                  {/* Delivery Status Banner */}
                  <div className="px-6 pt-5 pb-1">
                    {order.status === 'cancelled' ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 text-xs font-semibold">
                        <X size={15} className="text-rose-600 shrink-0" />
                        <span>Allocation Cancelled</span>
                      </div>
                    ) : order.status === 'delivered' ? (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span>Delivered to Private Salon {order.estimatedDelivery || 'on schedule'}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f6efe1] dark:bg-[#1a2130] text-[#786b58] dark:text-[#d6be90] text-xs font-semibold">
                        <Truck size={15} className="text-[#c5a059] shrink-0" />
                        <span>Insured Armored Dispatch — Arriving {order.estimatedDelivery || 'in 4-5 Business Days'}</span>
                      </div>
                    )}
                  </div>

                  {/* Order Line Items */}
                  <div className="p-6 divide-y divide-[#f0eae0] dark:divide-[#1e2433]">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="py-5 first:pt-2 last:pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
                      >
                        {/* Item Details */}
                        <div className="flex gap-5 items-start flex-1 min-w-0">
                          <Link href={`/product/${item.productId}`} className="shrink-0">
                            <div className="relative h-28 w-28 rounded-2xl border border-[#ebe2d1] dark:border-[#262c3d] bg-[#fbfaf8] dark:bg-[#161a25] p-2 hover:border-[#c5a059] transition-all">
                              <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                sizes="112px"
                                className="object-contain p-1.5"
                              />
                            </div>
                          </Link>

                          <div className="space-y-1.5 min-w-0 flex-1">
                            <Link
                              href={`/product/${item.productId}`}
                              className="font-serif text-sm font-medium text-[#141312] dark:text-[#f8f5ee] hover:text-[#c5a059] dark:hover:text-[#d6be90] leading-snug line-clamp-2 block transition-colors"
                            >
                              {item.title}
                            </Link>

                            <p className="text-xs text-[#786b58] dark:text-[#9e978b]">
                              Quantity: {item.quantity} · Piece Valuation: <span className="font-serif font-semibold text-[#141312] dark:text-[#f8f5ee]">{formatPrice(item.price)}</span>
                            </p>

                            <div className="text-[11px] text-[#8e816e] dark:text-[#7e8aa2] space-y-0.5 pt-0.5">
                              <p>Curated by: <span className="text-[#141312] dark:text-[#f8f5ee] font-medium">Valenza Certified Atelier Partner</span></p>
                              <p>
                                {order.status === 'delivered'
                                  ? 'Salon appraisal period active'
                                  : 'Eligible for 30-Day Maison Exchange'}
                              </p>
                            </div>

                            {/* Buy Again Button */}
                            <div className="pt-2">
                              <button
                                type="button"
                                onClick={() => handleBuyAgain(item)}
                                className="inline-flex items-center gap-1.5 rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] bg-white dark:bg-[#161a25] hover:border-[#c5a059] px-3.5 py-1.5 text-xs font-semibold text-[#141312] dark:text-[#f8f5ee] shadow-xs cursor-pointer transition-all"
                              >
                                <RefreshCw size={12} className="text-[#c5a059]" />
                                <span>Re-Acquire Piece</span>
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Action Column */}
                        <div className="flex flex-col gap-2.5 w-full md:w-60 text-xs shrink-0">
                          {/* Track Package Button */}
                          {order.status !== 'cancelled' && (
                            <Link
                              href={`/orders/${order.id}`}
                              className="w-full rounded-xl bg-gradient-to-r from-[#c5a059] via-[#d6be90] to-[#b89548] text-[#12110f] py-2.5 text-center font-sans font-semibold text-xs uppercase tracking-wider shadow-sm hover:brightness-105 transition-all flex items-center justify-center gap-2"
                            >
                              <Truck size={14} />
                              <span>Track Armored Dispatch</span>
                            </Link>
                          )}

                          {/* Write a Product Review */}
                          <Link
                            href={`/product/${item.productId}`}
                            className="w-full rounded-xl bg-white dark:bg-[#161a25] hover:border-[#c5a059] text-[#141312] dark:text-[#f8f5ee] border border-[#dfd6c5] dark:border-[#2f384d] py-2 text-center font-medium shadow-xs transition-colors flex items-center justify-center gap-2"
                          >
                            <Star size={13} className="text-[#c5a059]" />
                            <span>Client Appraisal &amp; Review</span>
                          </Link>

                          {/* Return or Replace Items */}
                          {order.status !== 'cancelled' && order.status !== 'REFUNDED' && (
                            <button
                              type="button"
                              onClick={() => handleStartReturnModal(order, item)}
                              className="w-full rounded-xl bg-white dark:bg-[#161a25] hover:border-[#c5a059] text-[#786b58] dark:text-[#c4b59d] border border-[#dfd6c5] dark:border-[#2f384d] py-2 text-center font-medium shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <RotateCcw size={13} className="text-[#c5a059]" />
                              <span>Salon Exchange / Return</span>
                            </button>
                          )}

                          {/* Cancel Order Option */}
                          {(order.status === 'pending' || order.status === 'confirmed') && (
                            <button
                              type="button"
                              onClick={() => handleCancelOrder(order.id)}
                              className="w-full rounded-xl bg-rose-50/60 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 py-2 text-center font-medium shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
                            >
                              <X size={14} />
                              <span>Cancel Allocation</span>
                            </button>
                          )}

                          {/* Archive Order Toggle */}
                          <button
                            type="button"
                            onClick={() => handleArchiveOrder(order.id)}
                            className="w-full rounded-xl text-[#8e816e] dark:text-[#7e8aa2] hover:text-[#141312] dark:hover:text-[#f8f5ee] py-1 text-center font-normal transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-[11px]"
                          >
                            <Archive size={12} />
                            <span>{isArchived ? 'Unarchive Record' : 'Archive to Vault'}</span>
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

      {/* ── Atelier Certificate & Invoice Modal ── */}
      {invoiceOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-[#12151f] rounded-3xl shadow-2xl overflow-hidden border border-[#ebe2d1] dark:border-[#262c3d] max-h-[90vh] flex flex-col text-[#141312] dark:text-[#f8f5ee]">
            {/* Modal Header */}
            <div className="flex items-center justify-between bg-[#fbfaf8] dark:bg-[#161a25] px-6 py-5 border-b border-[#f0eae0] dark:border-[#1e2433]">
              <div className="flex items-center gap-2">
                <Crown size={18} className="text-[#c5a059]" />
                <h3 className="font-serif font-medium text-base">Atelier Certificate &amp; Valuation Invoice</h3>
              </div>
              <button
                onClick={() => setInvoiceOrder(null)}
                className="text-[#9a8d7a] hover:text-[#141312] dark:hover:text-[#f8f5ee] p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs">
              <div className="flex justify-between items-start border-b border-[#f0eae0] dark:border-[#1e2433] pb-5">
                <div>
                  <h2 className="font-serif text-2xl font-light tracking-[0.2em] text-[#141312] dark:text-[#f8f5ee]">
                    VALENZA
                  </h2>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#9b8353] dark:text-[#d6be90] font-medium">
                    Haute Maison de Luxe
                  </p>
                  <p className="text-[#8e816e] dark:text-[#7e8aa2] mt-2 font-mono">Allocation #{invoiceOrder.id}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#141312] dark:text-[#f8f5ee]">
                    Date: {new Date(invoiceOrder.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-[#8e816e] dark:text-[#7e8aa2] capitalize">Status: {invoiceOrder.status}</p>
                </div>
              </div>

              {/* Shipping & Payment Summary */}
              <div className="grid grid-cols-2 gap-4 bg-[#fbfaf8] dark:bg-[#161a25] p-5 rounded-2xl border border-[#ebe2d1] dark:border-[#262c3d]">
                <div>
                  <span className="font-serif font-semibold text-[#9b8353] dark:text-[#d6be90] block mb-1.5">
                    Destination Client
                  </span>
                  <p className="font-medium">{invoiceOrder.shippingAddress.fullName}</p>
                  <p className="text-[#615442] dark:text-[#b8af9f]">{invoiceOrder.shippingAddress.street}</p>
                  <p className="text-[#615442] dark:text-[#b8af9f]">
                    {invoiceOrder.shippingAddress.city}, {invoiceOrder.shippingAddress.state}{' '}
                    {invoiceOrder.shippingAddress.postalCode}
                  </p>
                  <p className="text-[#615442] dark:text-[#b8af9f]">{invoiceOrder.shippingAddress.country}</p>
                </div>

                <div>
                  <span className="font-serif font-semibold text-[#9b8353] dark:text-[#d6be90] block mb-1.5">
                    Settlement Protocol
                  </span>
                  <p className="uppercase font-semibold">{invoiceOrder.paymentMethod.type}</p>
                  {invoiceOrder.paymentMethod.last4 && (
                    <p className="text-[#615442] dark:text-[#b8af9f]">Vault Account ending in **** {invoiceOrder.paymentMethod.last4}</p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div>
                <span className="font-serif font-medium text-sm block mb-3">Allocated Masterpieces</span>
                <div className="rounded-2xl border border-[#ebe2d1] dark:border-[#262c3d] overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-[#fbfaf8] dark:bg-[#161a25] text-[#786b58] dark:text-[#a09a8e] text-[11px] uppercase tracking-wider font-semibold">
                      <tr>
                        <th className="p-3">Piece</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Valuation</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ebe2d1] dark:divide-[#262c3d]">
                      {invoiceOrder.items.map((item, i) => (
                        <tr key={i}>
                          <td className="p-3 font-medium">{item.title}</td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-right font-serif">{formatPrice(item.price)}</td>
                          <td className="p-3 text-right font-serif font-semibold">{formatPrice(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Breakdown */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-2 text-right border-t border-[#ebe2d1] dark:border-[#262c3d] pt-4">
                  <div className="flex justify-between text-[#786b58] dark:text-[#9e978b]">
                    <span>Atelier Subtotal:</span>
                    <span className="font-serif font-medium text-[#141312] dark:text-[#f8f5ee]">{formatPrice(invoiceOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#786b58] dark:text-[#9e978b]">
                    <span>Insured Transit:</span>
                    <span className="font-serif font-medium text-[#141312] dark:text-[#f8f5ee]">{formatPrice(invoiceOrder.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between font-serif font-bold text-base text-[#141312] dark:text-[#f8f5ee] border-t border-[#ebe2d1] dark:border-[#262c3d] pt-2">
                    <span>Grand Valuation:</span>
                    <span className="text-[#9b8353] dark:text-[#d6be90]">{formatPrice(invoiceOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-[#fbfaf8] dark:bg-[#161a25] px-6 py-4 border-t border-[#f0eae0] dark:border-[#1e2433] flex justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-5 py-2 rounded-xl bg-white dark:bg-[#12151f] border border-[#dfd6c5] dark:border-[#2f384d] text-xs font-semibold hover:border-[#c5a059] flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Printer size={14} className="text-[#c5a059]" />
                <span>Print Certificate</span>
              </button>
              <button
                type="button"
                onClick={() => setInvoiceOrder(null)}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b89548] text-[#12110f] text-xs font-semibold cursor-pointer shadow-sm hover:brightness-105"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Return Request Modal ── */}
      {selectedOrderForReturn && selectedItemForReturn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-[#12151f] shadow-2xl overflow-hidden border border-[#ebe2d1] dark:border-[#262c3d] text-[#141312] dark:text-[#f8f5ee]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#f0eae0] dark:border-[#1e2433] bg-[#fbfaf8] dark:bg-[#161a25] px-6 py-5">
              <h2 className="font-serif text-base font-medium flex items-center gap-2">
                <RotateCcw size={16} className="text-[#c5a059]" />
                Salon Exchange &amp; Return Request
              </h2>
              <button
                onClick={() => {
                  setSelectedOrderForReturn(null);
                  setSelectedItemForReturn(null);
                }}
                className="text-[#9a8d7a] hover:text-[#141312] dark:hover:text-[#f8f5ee] p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleConfirmReturn} className="p-6 space-y-5 text-xs">
              {returnError && (
                <div className="rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 p-3.5 text-rose-900 dark:text-rose-200 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-600 shrink-0" />
                  <span>{returnError}</span>
                </div>
              )}

              {/* Selected Item Preview */}
              <div className="flex gap-4 bg-[#fbfaf8] dark:bg-[#161a25] p-4 rounded-2xl border border-[#ebe2d1] dark:border-[#262c3d] items-center">
                <div className="relative h-16 w-16 rounded-xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#12151f] p-1 shrink-0">
                  <Image
                    src={selectedItemForReturn.image}
                    alt={selectedItemForReturn.title}
                    fill
                    sizes="64px"
                    className="object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-serif font-medium truncate">
                    {selectedItemForReturn.title}
                  </h4>
                  <p className="text-[#786b58] dark:text-[#9e978b] mt-0.5">
                    Allocation #{selectedOrderForReturn.id} · Valuation: <span className="font-serif font-semibold">{formatPrice(selectedItemForReturn.price * selectedItemForReturn.quantity)}</span>
                  </p>
                </div>
              </div>

              {/* Select Reason */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#786b58] dark:text-[#c4b59d]">
                  Reason for Salon Consultation / Return
                </label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] bg-white dark:bg-[#161a25] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]"
                >
                  {RETURN_REASONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional Comments */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#786b58] dark:text-[#c4b59d]">
                  Bespoke Notes for Client Concierge (Optional)
                </label>
                <textarea
                  rows={3}
                  value={returnNote}
                  onChange={(e) => setReturnNote(e.target.value)}
                  placeholder="Provide any additional details or resizing / exchange preferences..."
                  className="w-full rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] bg-white dark:bg-[#161a25] px-3.5 py-2.5 text-xs focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#c5a059]"
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
                  className="rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fbfaf8] dark:bg-[#161a25] px-5 py-2.5 font-semibold text-[#786b58] dark:text-[#c4b59d] hover:text-[#141312] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReturn}
                  className="rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b89548] px-6 py-2.5 font-semibold text-[#12110f] text-xs uppercase tracking-wider hover:brightness-105 transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {submittingReturn ? 'Transmitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
