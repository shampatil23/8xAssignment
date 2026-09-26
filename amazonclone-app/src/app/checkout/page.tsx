'use client';
// ============================================================================
// Checkout Page — /checkout
// Valenza Maison Haute Horlogerie & Joaillerie Private Settlement Portal
// ============================================================================
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Lock,
  ShoppingCart,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Truck,
  CreditCard,
  MapPin,
  ArrowRight,
  RotateCcw,
  Check,
  Star,
  Crown,
  ShoppingBag,
} from 'lucide-react';
import { getRecommendationsForHome } from '@/services/recommendationService';
import type { Product } from '@/types';
import { AddressManager } from '@/components/checkout/AddressManager';
import { DeliveryOptions } from '@/components/checkout/DeliveryOptions';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { CheckoutSummary } from '@/components/checkout/CheckoutSummary';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  removeAddress,
} from '@/services/addressService';
import {
  DEFAULT_SHIPPING_OPTIONS,
  calculateCheckoutTotals,
  placeOrder,
} from '@/services/checkoutService';
import { formatPrice } from '@/lib/utils';
import type { Address, PaymentMethod, ShippingOption, Order } from '@/types';

type CheckoutStep = 'address' | 'delivery' | 'payment' | 'review';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, items, subtotal, itemCount, clearCart, appliedPromoCode, appliedDiscountPercent } = useCart();
  const { country } = useLocation();

  // Saved addresses state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addressesLoading, setAddressesLoading] = useState(true);

  // Checkout flow states
  const [activeStep, setActiveStep] = useState<CheckoutStep>('address');
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption>(
    DEFAULT_SHIPPING_OPTIONS[0],
  );
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>({
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    cardHolder: user?.displayName || 'Privé Client',
  });

  // Submission & Confirmation state
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);
  const [confirmationRecs, setConfirmationRecs] = useState<Product[]>([]);

  useEffect(() => {
    if (confirmedOrder) {
      getRecommendationsForHome(4).then((recs) => setConfirmationRecs(recs));
    }
  }, [confirmedOrder]);

  // Load customer addresses from RTDB
  useEffect(() => {
    let isMounted = true;

    async function loadUserAddresses() {
      if (!user) {
        setAddressesLoading(false);
        return;
      }

      setAddressesLoading(true);
      try {
        const list = await fetchAddresses(user.uid);
        if (!isMounted) return;

        setAddresses(list);
        const defaultAddr = list.find((a) => a.isDefault) || list[0] || null;
        setSelectedAddress(defaultAddr);

        if (defaultAddr) {
          setActiveStep('delivery');
        }
      } catch (err) {
        console.error('Failed to load customer addresses', err);
      } finally {
        if (isMounted) setAddressesLoading(false);
      }
    }

    if (!authLoading) {
      loadUserAddresses();
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  // Financial totals calculation
  const totals = useMemo(() => {
    const discount = appliedPromoCode ? (subtotal * appliedDiscountPercent) / 100 : 0;
    return calculateCheckoutTotals(cart, selectedShipping, discount);
  }, [cart, selectedShipping, appliedPromoCode, appliedDiscountPercent, subtotal]);

  // Auth Protection check
  if (!authLoading && !user && !confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0b0c10] flex flex-col items-center justify-center p-4 text-[#141312] dark:text-[#f8f5ee]">
        <div className="max-w-md w-full rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 p-8 shadow-[0_12px_40px_rgba(26,23,20,0.06)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.6)] text-center">
          <div className="h-16 w-16 rounded-full border border-[#d6be90] dark:border-[#c5a059]/40 bg-[#fbfaf8] dark:bg-[#161a25] text-[#c5a059] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <Lock size={28} />
          </div>
          <span className="text-[10px] uppercase font-semibold tracking-[0.25em] text-[#9b8353] dark:text-[#d6be90] block mb-1">
            Private Client Portal
          </span>
          <h1 className="font-serif text-2xl font-light mb-2">
            Sign In to Complete Settlement
          </h1>
          <p className="text-xs text-[#786b58] dark:text-[#9e978b] mb-6 leading-relaxed">
            Please authenticate to access your saved destination residences, private settlement protocols, and confirm your acquisition.
          </p>
          <button
            type="button"
            onClick={() => router.push('/auth/sign-in?redirect=/checkout')}
            className="w-full py-3.5 rounded-xl font-sans text-xs uppercase tracking-[0.18em] font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] via-[#d6be90] to-[#b89548] hover:brightness-105 shadow-md cursor-pointer transition-all"
          >
            Access Client Account
          </button>
        </div>
      </div>
    );
  }

  // Address operations
  const handleAddAddress = async (data: Omit<Address, 'id'>) => {
    if (!user) return false;
    const res = await addAddress(user.uid, data);
    if (res.success && res.data) {
      setAddresses((prev) => [...prev, res.data!]);
      setSelectedAddress(res.data);
      return true;
    }
    return false;
  };

  const handleUpdateAddress = async (addr: Address) => {
    if (!user) return false;
    const res = await updateAddress(user.uid, addr);
    if (res.success && res.data) {
      setAddresses((prev) => prev.map((a) => (a.id === addr.id ? res.data! : a)));
      if (selectedAddress?.id === addr.id) setSelectedAddress(res.data);
      return true;
    }
    return false;
  };

  const handleDeleteAddress = async (id: string) => {
    if (!user) return false;
    const res = await removeAddress(user.uid, id);
    if (res.success) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      if (selectedAddress?.id === id) {
        setSelectedAddress(addresses.find((a) => a.id !== id) || null);
      }
      return true;
    }
    return false;
  };

  // Place Order handler
  const handlePlaceOrder = async () => {
    setOrderError(null);

    if (!user || !cart || !selectedAddress) {
      setOrderError('Please select a destination residence to proceed.');
      setActiveStep('address');
      return;
    }

    setIsPlacingOrder(true);
    try {
      const res = await placeOrder(
        user.uid,
        cart,
        selectedAddress,
        selectedShipping,
        selectedPayment,
      );

      if (res.success && res.data) {
        setConfirmedOrder(res.data);
        clearCart();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setOrderError(res.error || 'Failed to place order. Please review your cart.');
      }
    } catch (err) {
      setOrderError((err as Error).message);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // ── Success / Order Confirmation View ──
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0b0c10] pb-20 text-[#141312] dark:text-[#f8f5ee]">
        {/* Luxury Checkout Header */}
        <header className="bg-white/95 dark:bg-[#12151f]/95 border-b border-[#ebe2d1] dark:border-[#262c3d] py-4 px-6 backdrop-blur-md sticky top-0 z-30 shadow-xs">
          <div className="mx-auto max-w-screen-xl flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full border border-[#d6be90] dark:border-[#c5a059]/40 bg-[#ffffff] dark:bg-[#161a25] flex items-center justify-center">
                <span className="font-serif text-sm font-bold text-[#9b8353] dark:text-[#d6be90]">V</span>
              </div>
              <span className="font-serif text-lg font-light tracking-[0.2em] text-[#141312] dark:text-[#f8f5ee]">
                VALENZA
              </span>
            </Link>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#9b8353] dark:text-[#d6be90]">
              <ShieldCheck size={16} className="text-[#c5a059]" />
              <span>Allocation Confirmed</span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-screen-lg px-4 sm:px-6 py-10">
          <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 p-8 md:p-10 shadow-[0_15px_40px_rgba(26,23,20,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            {/* Confirmation Banner */}
            <div className="flex items-start gap-5 border-b border-[#f0eae0] dark:border-[#1e2433] pb-8">
              <div className="rounded-2xl bg-[#f6efe1] dark:bg-[#1a2130] p-3.5 text-[#c5a059] border border-[#e4d6bf] dark:border-[#2f384d] mt-1 shadow-sm">
                <CheckCircle2 size={36} />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-semibold tracking-[0.25em] text-[#9b8353] dark:text-[#d6be90]">
                  Valenza Maison Privée
                </span>
                <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-[#141312] dark:text-[#f8f5ee]">
                  Acquisition Confirmed, Welcome.
                </h1>
                <p className="text-xs text-[#786b58] dark:text-[#9e978b] leading-relaxed">
                  Confidential certificate of acquisition and courier tracking dispatched to{' '}
                  <strong className="text-[#141312] dark:text-[#f8f5ee]">{user?.email}</strong>.
                </p>
                <p className="text-xs text-[#8e816e] dark:text-[#7e8aa2] pt-1 font-mono">
                  Allocation ID: <strong className="text-[#141312] dark:text-[#f8f5ee]">{confirmedOrder.id}</strong>
                </p>
              </div>
            </div>

            {/* Delivery & Address Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-b border-[#f0eae0] dark:border-[#1e2433] text-xs">
              <div>
                <h3 className="font-serif font-semibold text-[#9b8353] dark:text-[#d6be90] mb-2">
                  Destination Residence
                </h3>
                <p className="font-semibold">{confirmedOrder.shippingAddress.fullName}</p>
                <p className="text-[#615442] dark:text-[#b8af9f]">{confirmedOrder.shippingAddress.street}</p>
                <p className="text-[#615442] dark:text-[#b8af9f]">
                  {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state}{' '}
                  {confirmedOrder.shippingAddress.postalCode}
                </p>
                <p className="text-[#615442] dark:text-[#b8af9f]">{confirmedOrder.shippingAddress.country}</p>
              </div>

              <div>
                <h3 className="font-serif font-semibold text-[#9b8353] dark:text-[#d6be90] mb-2">
                  Settlement Protocol
                </h3>
                <p className="font-semibold capitalize">
                  {confirmedOrder.paymentMethod.type}
                </p>
                {confirmedOrder.paymentMethod.type === 'card' && (
                  <p className="text-[#615442] dark:text-[#b8af9f]">
                    Vault Account ending in {confirmedOrder.paymentMethod.last4}
                  </p>
                )}
                {confirmedOrder.paymentMethod.type === 'upi' && (
                  <p className="text-[#615442] dark:text-[#b8af9f]">UPI ID: {confirmedOrder.paymentMethod.upiId}</p>
                )}
                {confirmedOrder.paymentMethod.type === 'cod' && (
                  <p className="text-[#615442] dark:text-[#b8af9f]">Vault Concierge Settlement</p>
                )}
              </div>

              <div>
                <h3 className="font-serif font-semibold text-[#9b8353] dark:text-[#d6be90] mb-2">
                  Valuation Breakdown
                </h3>
                <div className="space-y-1.5 text-[#615442] dark:text-[#b8af9f]">
                  <div className="flex justify-between">
                    <span>Pieces Subtotal:</span>
                    <span className="font-serif font-medium text-[#141312] dark:text-[#f8f5ee]">{formatPrice(confirmedOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insured Transit:</span>
                    <span className="font-serif font-medium text-[#141312] dark:text-[#f8f5ee]">{formatPrice(confirmedOrder.shippingCost)}</span>
                  </div>
                  <div className="flex justify-between font-serif font-bold text-sm text-[#141312] dark:text-[#f8f5ee] border-t border-[#f0eae0] dark:border-[#1e2433] pt-2">
                    <span>Grand Valuation:</span>
                    <span className="text-[#9b8353] dark:text-[#d6be90]">{formatPrice(confirmedOrder.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchased Items Recap */}
            <div className="py-8">
              <h3 className="font-serif font-medium text-base mb-5">
                Allocated Masterpieces ({confirmedOrder.items.length})
              </h3>
              <div className="divide-y divide-[#f0eae0] dark:divide-[#1e2433]">
                {confirmedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 rounded-2xl border border-[#ebe2d1] dark:border-[#262c3d] bg-[#fbfaf8] dark:bg-[#161a25] p-1.5 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="64px"
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <p className="font-serif text-xs font-medium line-clamp-1 max-w-md">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-[#786b58] dark:text-[#9e978b] mt-0.5">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-serif font-semibold text-sm">
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions CTA */}
            <div className="pt-6 border-t border-[#f0eae0] dark:border-[#1e2433] flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-6 py-3 rounded-xl font-sans text-xs uppercase tracking-[0.16em] font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] to-[#b89548] hover:brightness-105 shadow-md cursor-pointer transition-all"
              >
                Continue Exploring Salons
              </button>
              <button
                type="button"
                onClick={() => router.push(`/orders/${confirmedOrder.id}`)}
                className="px-6 py-3 rounded-xl font-sans text-xs uppercase tracking-[0.16em] font-semibold text-[#786b58] dark:text-[#c4b59d] border border-[#dfd6c5] dark:border-[#2f384d] hover:border-[#c5a059] cursor-pointer transition-all"
              >
                View Allocation Dossier
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Empty Cart State during Checkout ──
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0b0c10] flex flex-col items-center justify-center p-4 text-[#141312] dark:text-[#f8f5ee]">
        <div className="max-w-md w-full rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 p-8 shadow-[0_12px_40px_rgba(26,23,20,0.06)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.6)] text-center">
          <div className="h-16 w-16 rounded-full border border-[#d6be90] dark:border-[#c5a059]/40 bg-[#fbfaf8] dark:bg-[#161a25] text-[#c5a059] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <ShoppingBag size={28} />
          </div>
          <h1 className="font-serif text-2xl font-light mb-2">
            Acquisition Bag is Empty
          </h1>
          <p className="text-xs text-[#786b58] dark:text-[#9e978b] mb-6">
            There are no reserved pieces in your bag ready for settlement.
          </p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full py-3.5 rounded-xl font-sans text-xs uppercase tracking-[0.18em] font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] to-[#b89548] hover:brightness-105 shadow-md cursor-pointer transition-all"
          >
            Explore Maison Salons
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f6] dark:bg-[#0b0c10] pb-24 text-[#141312] dark:text-[#f8f5ee]">
      {/* ── Luxury Checkout Header ── */}
      <header className="bg-white/95 dark:bg-[#12151f]/95 border-b border-[#ebe2d1] dark:border-[#262c3d] py-4 px-6 backdrop-blur-md sticky top-0 z-30 shadow-xs">
        <div className="mx-auto max-w-screen-xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border border-[#d6be90] dark:border-[#c5a059]/40 bg-[#ffffff] dark:bg-[#161a25] flex items-center justify-center shadow-xs">
              <span className="font-serif text-sm font-bold text-[#9b8353] dark:text-[#d6be90]">V</span>
            </div>
            <div>
              <span className="font-serif text-lg font-light tracking-[0.2em] text-[#141312] dark:text-[#f8f5ee] block leading-none">
                VALENZA
              </span>
              <span className="text-[8px] uppercase tracking-[0.3em] text-[#9b8353] dark:text-[#c5a059] font-medium">
                Haute Maison
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-[#786b58] dark:text-[#c4b59d]">
            <Lock size={14} className="text-[#c5a059]" />
            <span>Encrypted Settlement Portal</span>
          </div>

          <Link
            href="/cart"
            className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-[#9b8353] dark:text-[#d6be90] hover:underline transition-colors"
          >
            <ShoppingBag size={18} />
            <span className="hidden sm:inline">Bag ({itemCount})</span>
          </Link>
        </div>
      </header>

      {/* ── Main Checkout Container ── */}
      <main className="mx-auto max-w-screen-xl px-4 sm:px-6 py-8">
        {/* Error Alert */}
        {orderError && (
          <div className="mb-8 flex items-start gap-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-900 dark:text-rose-200 border border-rose-200 dark:border-rose-900/50">
            <AlertTriangle size={18} className="text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold uppercase tracking-wider">Settlement Verification Required</p>
              <p className="mt-0.5">{orderError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Left Column: Checkout Accordion Steps (8 cols) ── */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* ── STEP 1: Delivery Address ── */}
            <section
              aria-labelledby="step-address-heading"
              className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 p-6 sm:p-7 shadow-[0_12px_40px_rgba(26,23,20,0.04)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center justify-between border-b border-[#f0eae0] dark:border-[#1e2433] pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#141312] dark:bg-[#1f2533] border border-[#c5a059]/40 text-xs font-serif font-bold text-[#d6be90]">
                    1
                  </span>
                  <h2
                    id="step-address-heading"
                    className="font-serif text-base font-medium text-[#141312] dark:text-[#f8f5ee]"
                  >
                    Destination Residence &amp; Client Protocol
                  </h2>
                </div>

                {activeStep !== 'address' && selectedAddress && (
                  <button
                    type="button"
                    onClick={() => setActiveStep('address')}
                    className="text-xs uppercase tracking-wider font-semibold text-[#9b8353] dark:text-[#d6be90] hover:underline cursor-pointer"
                  >
                    Modify
                  </button>
                )}
              </div>

              {activeStep === 'address' ? (
                <div>
                  <AddressManager
                    addresses={addresses}
                    selectedAddressId={selectedAddress?.id}
                    onSelectAddress={(addr) => {
                      setSelectedAddress(addr);
                      setActiveStep('delivery');
                    }}
                    onAddAddress={handleAddAddress}
                    onUpdateAddress={handleUpdateAddress}
                    onDeleteAddress={handleDeleteAddress}
                  />

                  {selectedAddress && (
                    <div className="mt-5 pt-4 border-t border-[#f0eae0] dark:border-[#1e2433] flex justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveStep('delivery')}
                        className="px-6 py-2.5 rounded-xl font-sans text-xs uppercase tracking-wider font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] to-[#b89548] hover:brightness-105 shadow-sm cursor-pointer"
                      >
                        Confirm Destination
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                selectedAddress && (
                  <div className="pl-10 text-xs text-[#615442] dark:text-[#b8af9f] leading-relaxed">
                    <p className="font-semibold text-[#141312] dark:text-[#f8f5ee]">
                      {selectedAddress.fullName}
                    </p>
                    <p>{selectedAddress.street}</p>
                    <p>
                      {selectedAddress.city}, {selectedAddress.state}{' '}
                      {selectedAddress.postalCode}
                    </p>
                    <p>{selectedAddress.country}</p>
                    <p className="text-[#8e816e] dark:text-[#7e8aa2] mt-1">Secure Line: {selectedAddress.phone}</p>
                  </div>
                )
              )}
            </section>

            {/* ── STEP 2: Delivery Speed / Shipping Option ── */}
            <section
              aria-labelledby="step-shipping-heading"
              className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 p-6 sm:p-7 shadow-[0_12px_40px_rgba(26,23,20,0.04)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center justify-between border-b border-[#f0eae0] dark:border-[#1e2433] pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#141312] dark:bg-[#1f2533] border border-[#c5a059]/40 text-xs font-serif font-bold text-[#d6be90]">
                    2
                  </span>
                  <h2
                    id="step-shipping-heading"
                    className="font-serif text-base font-medium text-[#141312] dark:text-[#f8f5ee]"
                  >
                    White-Glove Armored Courier &amp; Dispatch Speed
                  </h2>
                </div>

                {activeStep !== 'delivery' && (
                  <button
                    type="button"
                    onClick={() => setActiveStep('delivery')}
                    className="text-xs uppercase tracking-wider font-semibold text-[#9b8353] dark:text-[#d6be90] hover:underline cursor-pointer"
                  >
                    Modify
                  </button>
                )}
              </div>

              {activeStep === 'delivery' ? (
                <div>
                  <DeliveryOptions
                    selectedOptionId={selectedShipping.id}
                    onSelectOption={(opt) => setSelectedShipping(opt)}
                    subtotal={subtotal}
                  />

                  <div className="mt-5 pt-4 border-t border-[#f0eae0] dark:border-[#1e2433] flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveStep('payment')}
                      className="px-6 py-2.5 rounded-xl font-sans text-xs uppercase tracking-wider font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] to-[#b89548] hover:brightness-105 shadow-sm cursor-pointer"
                    >
                      Proceed to Settlement Protocol
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pl-10 text-xs text-[#615442] dark:text-[#b8af9f]">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-semibold text-[#141312] dark:text-[#f8f5ee]">
                      {selectedShipping.title}
                    </span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      ({selectedShipping.estimatedDate})
                    </span>
                  </div>
                  <p className="text-[#8e816e] dark:text-[#7e8aa2] text-[11px] mt-0.5">
                    {totals.shippingCost === 0
                      ? 'Complimentary Insured White-Glove Transit'
                      : `$${totals.shippingCost.toFixed(2)} Armored Dispatch`}
                  </p>
                </div>
              )}
            </section>

            {/* ── STEP 3: Payment Method ── */}
            <section
              aria-labelledby="step-payment-heading"
              className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 p-6 sm:p-7 shadow-[0_12px_40px_rgba(26,23,20,0.04)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center justify-between border-b border-[#f0eae0] dark:border-[#1e2433] pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#141312] dark:bg-[#1f2533] border border-[#c5a059]/40 text-xs font-serif font-bold text-[#d6be90]">
                    3
                  </span>
                  <h2
                    id="step-payment-heading"
                    className="font-serif text-base font-medium text-[#141312] dark:text-[#f8f5ee]"
                  >
                    Confidential Settlement Protocol
                  </h2>
                </div>

                {activeStep !== 'payment' && (
                  <button
                    type="button"
                    onClick={() => setActiveStep('payment')}
                    className="text-xs uppercase tracking-wider font-semibold text-[#9b8353] dark:text-[#d6be90] hover:underline cursor-pointer"
                  >
                    Modify
                  </button>
                )}
              </div>

              {activeStep === 'payment' ? (
                <div>
                  <PaymentMethodSelector
                    selectedPayment={selectedPayment}
                    onSelectPayment={(p) => setSelectedPayment(p)}
                    orderAmount={totals.total}
                  />

                  <div className="mt-5 pt-4 border-t border-[#f0eae0] dark:border-[#1e2433] flex justify-end">
                    <button
                      type="button"
                      onClick={() => setActiveStep('review')}
                      className="px-6 py-2.5 rounded-xl font-sans text-xs uppercase tracking-wider font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] to-[#b89548] hover:brightness-105 shadow-sm cursor-pointer"
                    >
                      Review Masterpiece Allocation
                    </button>
                  </div>
                </div>
              ) : (
                <div className="pl-10 text-xs text-[#615442] dark:text-[#b8af9f]">
                  <p className="font-serif font-semibold capitalize text-[#141312] dark:text-[#f8f5ee]">
                    {selectedPayment.type}
                  </p>
                  {selectedPayment.type === 'card' && (
                    <p className="text-[#8e816e] dark:text-[#7e8aa2]">
                      Vault Account ending in **** {selectedPayment.last4}
                    </p>
                  )}
                  {selectedPayment.type === 'upi' && (
                    <p className="text-[#8e816e] dark:text-[#7e8aa2]">UPI: {selectedPayment.upiId}</p>
                  )}
                  {selectedPayment.type === 'cod' && (
                    <p className="text-[#8e816e] dark:text-[#7e8aa2]">Vault Concierge Settlement</p>
                  )}
                </div>
              )}
            </section>

            {/* ── STEP 4: Review Items and Delivery ── */}
            <section
              aria-labelledby="step-review-heading"
              className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 p-6 sm:p-7 shadow-[0_12px_40px_rgba(26,23,20,0.04)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.6)]"
            >
              <div className="flex items-center gap-3 border-b border-[#f0eae0] dark:border-[#1e2433] pb-4 mb-5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#141312] dark:bg-[#1f2533] border border-[#c5a059]/40 text-xs font-serif font-bold text-[#d6be90]">
                  4
                </span>
                <h2
                  id="step-review-heading"
                  className="font-serif text-base font-medium text-[#141312] dark:text-[#f8f5ee]"
                >
                  Masterpiece Review &amp; Allocation Dossier
                </h2>
              </div>

              <div className="divide-y divide-[#f0eae0] dark:divide-[#1e2433]">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="py-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative h-16 w-16 rounded-2xl border border-[#ebe2d1] dark:border-[#262c3d] bg-[#fbfaf8] dark:bg-[#161a25] p-1.5 flex-shrink-0">
                        <Image
                          src={item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=300'}
                          alt={item.product.title}
                          fill
                          sizes="64px"
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <p className="font-serif text-xs font-medium line-clamp-1 max-w-md">
                          {item.product.title}
                        </p>
                        <p className="text-[11px] text-[#786b58] dark:text-[#9e978b] mt-0.5">
                          Quantity: {item.quantity} · {item.variantTitle || 'Standard Spec'}
                        </p>
                      </div>
                    </div>
                    <span className="font-serif font-semibold text-sm">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* ── Right Column: Order Summary (4 cols) ── */}
          <div className="lg:col-span-4">
            <CheckoutSummary
              totals={totals}
              selectedAddress={selectedAddress}
              selectedPayment={selectedPayment}
              onPlaceOrder={handlePlaceOrder}
              isPlacingOrder={isPlacingOrder}
              disabled={!selectedAddress}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
