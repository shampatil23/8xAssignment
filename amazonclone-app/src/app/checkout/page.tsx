'use client';
// ============================================================================
// Checkout Page — /checkout
// Amazon-style 2-Column Accordion: Address → Delivery → Payment → Review
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
} from 'lucide-react';
import { getRecommendationsForHome } from '@/services/recommendationService';
import type { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { AddressManager } from '@/components/checkout/AddressManager';
import { DeliveryOptions } from '@/components/checkout/DeliveryOptions';
import { PaymentMethodSelector } from '@/components/checkout/PaymentMethodSelector';
import { CheckoutSummary } from '@/components/checkout/CheckoutSummary';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/context/CartContext';
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
  validateOrderPlacement,
} from '@/services/checkoutService';
import type { Address, PaymentMethod, ShippingOption, Order } from '@/types';

type CheckoutStep = 'address' | 'delivery' | 'payment' | 'review';

export default function CheckoutPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { cart, items, subtotal, itemCount, clearCart } = useCart();

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
    cardHolder: user?.displayName || 'Customer',
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
        // Default selected address: either isDefault or first one
        const defaultAddr = list.find((a) => a.isDefault) || list[0] || null;
        setSelectedAddress(defaultAddr);

        // If addresses already exist, we can start with review or address collapsed
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
    return calculateCheckoutTotals(cart, selectedShipping);
  }, [cart, selectedShipping]);

  // Auth Protection check
  if (!authLoading && !user && !confirmedOrder) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full rounded-xl border border-gray-200 bg-white p-8 shadow-xs text-center">
          <div className="h-16 w-16 rounded-full bg-amber-50 text-amazon-orange flex items-center justify-center mx-auto mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Sign in to continue checkout
          </h1>
          <p className="text-xs text-gray-600 mb-6 leading-relaxed">
            Please sign in to access your saved delivery addresses, payment methods, and review your order.
          </p>
          <Button
            type="button"
            variant="buy-now"
            fullWidth
            onClick={() => router.push('/auth/sign-in?redirect=/checkout')}
            className="py-2.5 font-bold"
          >
            Sign in to your account
          </Button>
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
      setActiveStep('delivery');
      return true;
    } else {
      setOrderError(res.error || 'Failed to add address');
      return false;
    }
  };

  const handleUpdateAddress = async (address: Address) => {
    if (!user) return false;
    const res = await updateAddress(user.uid, address);
    if (res.success) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === address.id ? address : a)),
      );
      if (selectedAddress?.id === address.id) {
        setSelectedAddress(address);
      }
      return true;
    }
    return false;
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user) return false;
    const res = await removeAddress(user.uid, addressId);
    if (res.success) {
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      if (selectedAddress?.id === addressId) {
        const remaining = addresses.filter((a) => a.id !== addressId);
        setSelectedAddress(remaining[0] || null);
      }
      return true;
    }
    return false;
  };

  // Place Order handler
  const handlePlaceOrder = async () => {
    setOrderError(null);

    if (!user || !cart || !selectedAddress) {
      setOrderError('Please select a delivery address to proceed.');
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
      <div className="min-h-screen bg-gray-100/60 pb-16">
        {/* Minimal Checkout Header */}
        <header className="bg-amazon-dark border-b border-gray-700 py-3 px-4 shadow-sm">
          <div className="mx-auto max-w-screen-xl flex items-center justify-between">
            <Link href="/" className="flex items-center gap-1">
              <span className="font-extrabold text-white text-xl tracking-tight leading-none">
                amazon<span className="text-amazon-orange">.</span>
                <span className="text-xs align-super">clone</span>
              </span>
            </Link>
            <div className="flex items-center gap-1.5 text-white text-sm font-semibold">
              <ShieldCheck size={18} className="text-green-400" />
              <span>Order Confirmed</span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-screen-lg px-4 py-8">
          <div className="rounded-xl border border-gray-200 bg-white p-6 md:p-8 shadow-xs">
            {/* Green confirmation banner */}
            <div className="flex items-start gap-4 border-b border-gray-200 pb-6">
              <div className="rounded-full bg-green-100 p-2 text-green-700 mt-1">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-gray-900">
                  Order placed, thank you!
                </h1>
                <p className="text-xs text-gray-600">
                  Confirmation has been sent to{' '}
                  <strong className="text-gray-900">{user?.email}</strong>.
                </p>
                <p className="text-xs text-gray-500 pt-1">
                  Order ID: <strong className="text-gray-900 font-mono">{confirmedOrder.id}</strong>
                </p>
              </div>
            </div>

            {/* Delivery & Address Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-gray-200 text-xs">
              <div>
                <h3 className="font-bold text-gray-900 uppercase text-[11px] mb-2 text-gray-500">
                  Shipping Address
                </h3>
                <p className="font-bold text-gray-900">{confirmedOrder.shippingAddress.fullName}</p>
                <p className="text-gray-700">{confirmedOrder.shippingAddress.street}</p>
                <p className="text-gray-700">
                  {confirmedOrder.shippingAddress.city}, {confirmedOrder.shippingAddress.state}{' '}
                  {confirmedOrder.shippingAddress.postalCode}
                </p>
                <p className="text-gray-700">{confirmedOrder.shippingAddress.country}</p>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 uppercase text-[11px] mb-2 text-gray-500">
                  Payment Method
                </h3>
                <p className="font-bold text-gray-900 capitalize">
                  {confirmedOrder.paymentMethod.type}
                </p>
                {confirmedOrder.paymentMethod.type === 'card' && (
                  <p className="text-gray-700">
                    {confirmedOrder.paymentMethod.brand} ending in {confirmedOrder.paymentMethod.last4}
                  </p>
                )}
                {confirmedOrder.paymentMethod.type === 'upi' && (
                  <p className="text-gray-700">UPI: {confirmedOrder.paymentMethod.upiId}</p>
                )}
                {confirmedOrder.paymentMethod.type === 'cod' && (
                  <p className="text-gray-700">Pay on Delivery</p>
                )}
              </div>

              <div>
                <h3 className="font-bold text-gray-900 uppercase text-[11px] mb-2 text-gray-500">
                  Order Summary
                </h3>
                <div className="space-y-1 text-gray-700">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span>${confirmedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>${confirmedOrder.shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-900 border-t pt-1 text-sm">
                    <span>Total Paid:</span>
                    <span className="text-[#b12704]">${confirmedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchased Items Recap */}
            <div className="py-6">
              <h3 className="font-bold text-gray-900 text-sm mb-4">
                Items in this shipment ({confirmedOrder.items.length})
              </h3>
              <div className="divide-y divide-gray-100">
                {confirmedOrder.items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-16 w-16 rounded border bg-white p-1 flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="64px"
                          className="object-contain p-1"
                        />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-900 line-clamp-1 max-w-md">
                          {item.title}
                        </p>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-900">
                      ${item.subtotal.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions CTA */}
            <div className="pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="cart"
                onClick={() => router.push('/')}
                className="font-bold"
              >
                Continue Shopping
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push(`/orders/${confirmedOrder.id}`)}
                className="font-bold"
              >
                View Order &amp; Returns
              </Button>
            </div>

            {/* Recommendations Strip */}
            {confirmationRecs.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-bold text-gray-900 text-sm mb-4">
                  Recommended based on your purchase
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {confirmationRecs.map((p) => {
                    const img =
                      p.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';
                    return (
                      <Link
                        key={p.id}
                        href={`/product/${p.slug}`}
                        className="group flex flex-col justify-between rounded-lg border border-gray-200 p-3 hover:border-gray-300 hover:shadow-xs transition-all bg-white"
                      >
                        <div>
                          <div className="relative h-24 w-full rounded bg-white overflow-hidden mb-2">
                            <Image
                              src={img}
                              alt={p.title}
                              fill
                              sizes="120px"
                              className="object-contain p-1 group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <h4 className="text-xs font-medium text-amazon-link group-hover:underline line-clamp-2">
                            {p.title}
                          </h4>
                          <div className="mt-1 flex items-center gap-1 text-xs text-amber-500">
                            <Star size={11} className="fill-amber-400 text-amber-400" />
                            <span className="text-gray-700 font-bold">{p.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="mt-2 pt-1 border-t border-gray-100 text-xs font-bold text-gray-900">
                          ${p.price.toFixed(2)}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ── Empty Cart State during Checkout ──
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full rounded-xl border border-gray-200 bg-white p-8 shadow-xs text-center">
          <div className="h-16 w-16 rounded-full bg-amber-50 text-amazon-orange flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={32} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Your Cart is empty
          </h1>
          <p className="text-xs text-gray-600 mb-6">
            There are no items in your shopping cart to checkout.
          </p>
          <Button
            type="button"
            variant="cart"
            fullWidth
            onClick={() => router.push('/')}
            className="font-bold"
          >
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100/60 pb-20">
      {/* ── Minimalist Amazon Checkout Header ── */}
      <header className="bg-amazon-dark border-b border-gray-700 py-3 px-4 shadow-sm sticky top-0 z-30">
        <div className="mx-auto max-w-screen-xl flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1">
            <span className="font-extrabold text-white text-xl tracking-tight leading-none">
              amazon<span className="text-amazon-orange">.</span>
              <span className="text-xs align-super">clone</span>
            </span>
          </Link>

          <div className="flex items-center gap-1 text-white text-sm md:text-base font-semibold">
            <Lock size={16} className="text-gray-300" />
            <span>Secure checkout</span>
          </div>

          <Link
            href="/cart"
            className="flex items-center gap-1 text-white text-xs font-semibold hover:text-amazon-orange transition-colors"
          >
            <ShoppingCart size={20} />
            <span className="hidden sm:inline">Cart ({itemCount})</span>
          </Link>
        </div>
      </header>

      {/* ── Main Checkout Container ── */}
      <main className="mx-auto max-w-screen-xl px-4 py-6">
        {/* Error Alert */}
        {orderError && (
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-red-50 p-4 text-xs text-red-800 border border-red-200">
            <AlertTriangle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Please check your order details</p>
              <p className="mt-0.5">{orderError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Left Column: Checkout Accordion Steps (8 cols) ── */}
          <div className="lg:col-span-8 space-y-4">
            {/* ── STEP 1: Delivery Address ── */}
            <section
              aria-labelledby="step-address-heading"
              className="rounded-lg border border-gray-300 bg-white p-5 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amazon-dark text-xs font-bold text-white">
                    1
                  </span>
                  <h2
                    id="step-address-heading"
                    className="text-base font-bold text-gray-900"
                  >
                    Delivery address
                  </h2>
                </div>

                {activeStep !== 'address' && selectedAddress && (
                  <button
                    type="button"
                    onClick={() => setActiveStep('address')}
                    className="text-xs font-semibold text-amazon-link hover:underline cursor-pointer"
                  >
                    Change
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
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                      <Button
                        type="button"
                        variant="buy-now"
                        onClick={() => setActiveStep('delivery')}
                        className="px-6 py-2 text-xs font-bold"
                      >
                        Use this address
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                selectedAddress && (
                  <div className="pl-8 text-xs text-gray-700 leading-relaxed">
                    <p className="font-bold text-gray-900">
                      {selectedAddress.fullName}
                    </p>
                    <p>{selectedAddress.street}</p>
                    <p>
                      {selectedAddress.city}, {selectedAddress.state}{' '}
                      {selectedAddress.postalCode}
                    </p>
                    <p>{selectedAddress.country}</p>
                    <p className="text-gray-500 mt-1">Phone: {selectedAddress.phone}</p>
                  </div>
                )
              )}
            </section>

            {/* ── STEP 2: Delivery Speed / Shipping Option ── */}
            <section
              aria-labelledby="step-shipping-heading"
              className="rounded-lg border border-gray-300 bg-white p-5 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amazon-dark text-xs font-bold text-white">
                    2
                  </span>
                  <h2
                    id="step-shipping-heading"
                    className="text-base font-bold text-gray-900"
                  >
                    Delivery options
                  </h2>
                </div>

                {activeStep !== 'delivery' && (
                  <button
                    type="button"
                    onClick={() => setActiveStep('delivery')}
                    className="text-xs font-semibold text-amazon-link hover:underline cursor-pointer"
                  >
                    Change
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

                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                    <Button
                      type="button"
                      variant="buy-now"
                      onClick={() => setActiveStep('payment')}
                      className="px-6 py-2 text-xs font-bold"
                    >
                      Continue to payment
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pl-8 text-xs text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                      {selectedShipping.title}
                    </span>
                    <span className="text-green-700 font-semibold">
                      ({selectedShipping.estimatedDate})
                    </span>
                  </div>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    {totals.shippingCost === 0
                      ? 'FREE Shipping'
                      : `$${totals.shippingCost.toFixed(2)} delivery charge`}
                  </p>
                </div>
              )}
            </section>

            {/* ── STEP 3: Payment Method ── */}
            <section
              aria-labelledby="step-payment-heading"
              className="rounded-lg border border-gray-300 bg-white p-5 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amazon-dark text-xs font-bold text-white">
                    3
                  </span>
                  <h2
                    id="step-payment-heading"
                    className="text-base font-bold text-gray-900"
                  >
                    Payment method
                  </h2>
                </div>

                {activeStep !== 'payment' && (
                  <button
                    type="button"
                    onClick={() => setActiveStep('payment')}
                    className="text-xs font-semibold text-amazon-link hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                )}
              </div>

              {activeStep === 'payment' ? (
                <div>
                  <PaymentMethodSelector
                    selectedPayment={selectedPayment}
                    onSelectPayment={(p) => setSelectedPayment(p)}
                  />

                  <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end">
                    <Button
                      type="button"
                      variant="buy-now"
                      onClick={() => setActiveStep('review')}
                      className="px-6 py-2 text-xs font-bold"
                    >
                      Use this payment method
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="pl-8 text-xs text-gray-700">
                  <span className="font-bold text-gray-900 capitalize">
                    {selectedPayment.type}
                  </span>
                  {selectedPayment.type === 'card' && (
                    <span className="text-gray-600">
                      {' '}
                      ({selectedPayment.brand} ending in {selectedPayment.last4})
                    </span>
                  )}
                  {selectedPayment.type === 'upi' && (
                    <span className="text-gray-600"> ({selectedPayment.upiId})</span>
                  )}
                </div>
              )}
            </section>

            {/* ── STEP 4: Review Items and Delivery ── */}
            <section
              aria-labelledby="step-review-heading"
              className="rounded-lg border border-gray-300 bg-white p-5 shadow-xs"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amazon-dark text-xs font-bold text-white">
                    4
                  </span>
                  <h2
                    id="step-review-heading"
                    className="text-base font-bold text-gray-900"
                  >
                    Review items and delivery
                  </h2>
                </div>

                <Link
                  href="/cart"
                  className="text-xs font-semibold text-amazon-link hover:underline"
                >
                  Edit Cart
                </Link>
              </div>

              {/* Items Summary Strip */}
              <div className="divide-y divide-gray-100 space-y-4">
                {items.map((item) => {
                  const imgUrl =
                    item.product.images?.[0]?.url ||
                    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';

                  return (
                    <div
                      key={item.id}
                      className="pt-4 first:pt-0 flex gap-4 items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative h-16 w-16 rounded border bg-white p-1 flex-shrink-0">
                          <Image
                            src={imgUrl}
                            alt={item.product.title}
                            fill
                            sizes="64px"
                            className="object-contain p-1"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900 line-clamp-2 max-w-sm">
                            {item.product.title}
                          </p>
                          {item.variantTitle && (
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Option: {item.variantTitle}
                            </p>
                          )}
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Qty: <strong className="text-gray-800">{item.quantity}</strong> · ${item.product.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery notice */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-700 bg-gray-50 p-3 rounded-md">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-amazon-orange" />
                  <span>
                    Guaranteed delivery date:{' '}
                    <strong className="text-green-700">{selectedShipping.estimatedDate}</strong>
                  </span>
                </div>
                <span className="font-semibold text-gray-900">
                  {totals.shippingCost === 0 ? 'FREE' : `$${totals.shippingCost.toFixed(2)}`}
                </span>
              </div>
            </section>
          </div>

          {/* ── Right Column: Order Summary Sidebar (4 cols) ── */}
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
