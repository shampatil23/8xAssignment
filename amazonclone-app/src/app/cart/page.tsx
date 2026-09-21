'use client';
// ============================================================================
// Shopping Cart Page — /cart
// Amazon-style layout: Main Items List + Saved For Later + Sticky Order Summary
// ============================================================================
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Trash2,
  Bookmark,
  Plus,
  Minus,
  Lock,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import type { CartItem } from '@/types';

const FREE_SHIPPING_THRESHOLD = 35.0;

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    savedItems,
    itemCount,
    subtotal,
    loading,
    updateQuantity,
    removeItem,
    saveForLater,
    moveToCart,
    removeSavedItem,
    clearCart,
  } = useCart();

  const [isGift, setIsGift] = useState(false);
  const [movingItemId, setMovingItemId] = useState<string | null>(null);

  const amountNeededForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal,
  );
  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD && items.length > 0;

  // Handle Proceed to Checkout
  const handleProceedToCheckout = () => {
    if (!user) {
      router.push('/auth/sign-in?redirect=/cart');
      return;
    }

    if (items.length === 0) return;

    // Check if any items are out of stock
    const hasOutOfStock = items.some((i) => i.isAvailable === false || i.product.stock <= 0);
    if (hasOutOfStock) {
      alert('Please remove or save for later any out-of-stock items before checking out.');
      return;
    }

    alert('Proceeding to checkout! (Full checkout active in upcoming phase)');
  };

  // ── Loading Skeleton ──
  if (loading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-screen-2xl px-4 py-8 animate-pulse">
          <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-36 bg-gray-200 rounded-lg" />
              <div className="h-36 bg-gray-200 rounded-lg" />
            </div>
            <div className="lg:col-span-4 h-64 bg-gray-200 rounded-lg" />
          </div>
        </div>
      </MainLayout>
    );
  }

  // ── Empty Cart State ──
  if (items.length === 0 && savedItems.length === 0) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-screen-xl px-4 py-12">
          <div className="rounded-xl border border-gray-200 bg-white p-8 md:p-12 shadow-xs text-center flex flex-col items-center">
            <div className="h-24 w-24 rounded-full bg-amber-50 flex items-center justify-center text-amazon-orange mb-5">
              <ShoppingBag size={48} strokeWidth={1.5} />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Your Amazon Cart is empty
            </h1>

            {!user ? (
              <div className="max-w-md space-y-4 mt-2">
                <p className="text-sm text-gray-600">
                  Sign in to see items you may have added to your account or continue shopping to discover today&apos;s deals.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button
                    type="button"
                    variant="buy-now"
                    onClick={() => router.push('/auth/sign-in?redirect=/cart')}
                    className="px-6 py-2.5 font-bold"
                  >
                    Sign in to your account
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => router.push('/auth/sign-up')}
                    className="px-6 py-2.5"
                  >
                    Sign up now
                  </Button>
                </div>
              </div>
            ) : (
              <div className="max-w-md space-y-4 mt-2">
                <p className="text-sm text-gray-600">
                  Your shopping cart is currently waiting for products. Check out our curated catalog and exclusive Prime deals!
                </p>
                <Button
                  type="button"
                  variant="cart"
                  onClick={() => router.push('/')}
                  className="px-8 py-2.5 font-bold"
                >
                  Continue shopping
                </Button>
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-screen-2xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ── Left Column: Cart Items (8 cols) ── */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="rounded-lg border border-gray-200 bg-white p-5 md:p-6 shadow-xs">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
                  <span className="text-xs text-gray-500">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
                  </span>
                </div>
                <div className="text-xs text-gray-500 text-right hidden sm:block">
                  Price
                </div>
              </div>

              {/* Items List */}
              {items.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  You have no active items in your cart. Check your saved for later section below.
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {items.map((item) => {
                    const imgUrl =
                      item.product.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';
                    const isOutOfStock =
                      item.isAvailable === false || item.product.stock <= 0;
                    const isLowStock =
                      item.product.stock > 0 && item.product.stock <= 3;

                    return (
                      <div
                        key={item.id}
                        className={`py-5 flex flex-col sm:flex-row gap-4 justify-between transition-colors ${
                          isOutOfStock ? 'bg-red-50/30 -mx-4 px-4 rounded-md' : ''
                        }`}
                      >
                        {/* Thumbnail & Product Details */}
                        <div className="flex gap-4 flex-1">
                          <Link
                            href={item.product.slug ? `/product/${item.product.slug}` : '/'}
                            className="relative h-28 w-28 sm:h-32 sm:w-32 flex-shrink-0 rounded border border-gray-100 bg-white p-2 hover:opacity-90"
                          >
                            <Image
                              src={imgUrl}
                              alt={item.product.title}
                              fill
                              sizes="128px"
                              className="object-contain p-1"
                            />
                          </Link>

                          <div className="flex flex-col flex-1 gap-1">
                            <Link
                              href={item.product.slug ? `/product/${item.product.slug}` : '/'}
                              className="text-sm sm:text-base font-medium text-gray-900 hover:text-amazon-link line-clamp-2 leading-snug"
                            >
                              {item.product.title}
                            </Link>

                            {/* Variant Info */}
                            {item.variantTitle && (
                              <div className="text-xs text-gray-600 font-medium">
                                Option: <span className="font-bold text-gray-800">{item.variantTitle}</span>
                              </div>
                            )}

                            {/* Stock Status Badge */}
                            {isOutOfStock ? (
                              <span className="text-xs font-bold text-red-600 flex items-center gap-1">
                                <AlertTriangle size={13} />
                                Currently out of stock
                              </span>
                            ) : isLowStock ? (
                              <span className="text-xs font-semibold text-[#b12704]">
                                Only {item.product.stock} left in stock - order soon.
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-green-700">
                                In Stock
                              </span>
                            )}

                            {/* Stock Error warning notice */}
                            {item.stockError && (
                              <span className="text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block w-fit mt-0.5">
                                {item.stockError}
                              </span>
                            )}

                            {/* Prime & Free Shipping badge */}
                            {item.product.isPrimeEligible && !isOutOfStock && (
                              <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                                <span className="inline-flex items-center gap-0.5 rounded bg-[#00a8e1] px-1 py-0.2 font-extrabold italic text-white text-[10px]">
                                  <Check size={10} strokeWidth={3} /> prime
                                </span>
                                <span>Eligible for FREE Shipping</span>
                              </div>
                            )}

                            {/* Action Buttons row */}
                            <div className="mt-3 flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
                              {/* Quantity Pill Controls */}
                              <div className="flex items-center rounded-lg border border-gray-300 bg-gray-50 shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="px-2.5 py-1 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent rounded-l-lg transition-colors cursor-pointer"
                                  title="Decrease quantity"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus size={13} />
                                </button>
                                <span className="px-3 py-1 font-bold text-gray-900 text-xs min-w-[28px] text-center bg-white">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.stock || isOutOfStock}
                                  className="px-2.5 py-1 text-gray-600 hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-transparent rounded-r-lg transition-colors cursor-pointer"
                                  title="Increase quantity"
                                  aria-label="Increase quantity"
                                >
                                  <Plus size={13} />
                                </button>
                              </div>

                              <span className="text-gray-300">|</span>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="text-amazon-link hover:underline hover:text-amazon-link-hover cursor-pointer"
                              >
                                Delete
                              </button>

                              <span className="text-gray-300">|</span>

                              {/* Save for later */}
                              <button
                                type="button"
                                onClick={() => saveForLater(item.id)}
                                className="text-amazon-link hover:underline hover:text-amazon-link-hover cursor-pointer"
                              >
                                Save for later
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Line Item Price */}
                        <div className="text-right sm:pl-4">
                          <div className="text-base sm:text-lg font-bold text-gray-900">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-[11px] text-gray-500">
                              (${item.product.price.toFixed(2)} each)
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Subtotal row */}
              {items.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end text-sm sm:text-base text-gray-900">
                  <span>
                    Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):{' '}
                    <strong className="text-lg font-bold text-gray-900">
                      ${subtotal.toFixed(2)}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {/* ── Saved For Later Section ── */}
            {savedItems.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-5 md:p-6 shadow-xs">
                <div className="border-b border-gray-200 pb-3 mb-4">
                  <h2 className="text-lg font-bold text-gray-900">
                    Saved for later ({savedItems.length} {savedItems.length === 1 ? 'item' : 'items'})
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {savedItems.map((item) => {
                    const imgUrl =
                      item.product.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';
                    const isOutOfStock = item.product.stock <= 0;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col justify-between rounded-lg border border-gray-200 p-4 bg-white hover:border-gray-300 transition-all"
                      >
                        <div className="flex gap-3">
                          <Link
                            href={item.product.slug ? `/product/${item.product.slug}` : '/'}
                            className="relative h-20 w-20 flex-shrink-0 rounded border border-gray-100 bg-white p-1"
                          >
                            <Image
                              src={imgUrl}
                              alt={item.product.title}
                              fill
                              sizes="80px"
                              className="object-contain p-1"
                            />
                          </Link>

                          <div className="flex-1 min-w-0">
                            <Link
                              href={item.product.slug ? `/product/${item.product.slug}` : '/'}
                              className="text-xs font-semibold text-gray-900 hover:text-amazon-link line-clamp-2 leading-snug"
                            >
                              {item.product.title}
                            </Link>
                            {item.variantTitle && (
                              <div className="text-[11px] text-gray-500 mt-0.5">
                                {item.variantTitle}
                              </div>
                            )}
                            <div className="text-sm font-bold text-[#b12704] mt-1">
                              ${item.product.price.toFixed(2)}
                            </div>
                            <div className="text-[11px] font-medium text-gray-500">
                              {isOutOfStock ? (
                                <span className="text-red-600">Out of Stock</span>
                              ) : (
                                <span className="text-green-700">In Stock</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-3 text-xs">
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={isOutOfStock}
                            onClick={() => moveToCart(item.id)}
                            className="text-xs px-3 py-1 font-semibold flex-1"
                          >
                            Move to cart
                          </Button>
                          <button
                            type="button"
                            onClick={() => removeSavedItem(item.id)}
                            className="text-amazon-link hover:underline text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Order Summary (4 cols) ── */}
          <div className="lg:col-span-4">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-xs flex flex-col gap-4 sticky top-24">
              {/* Free Shipping Progress */}
              <div className="rounded-md bg-gray-50 p-3.5 border border-gray-100 text-xs text-gray-700">
                {qualifiesForFreeShipping ? (
                  <div className="flex items-start gap-2 text-green-700 font-medium">
                    <CheckCircle2 size={18} className="flex-shrink-0 text-green-600" />
                    <span>
                      Your order qualifies for <strong>FREE Shipping</strong>! Select this option at checkout.
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-800">
                      Add{' '}
                      <strong className="text-[#b12704]">
                        ${amountNeededForFreeShipping.toFixed(2)}
                      </strong>{' '}
                      of eligible items to get <strong>FREE Shipping</strong>.
                    </p>
                    {/* Progress bar */}
                    <div className="mt-2 h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full bg-amazon-orange transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Subtotal Display */}
              <div className="text-base sm:text-lg text-gray-900">
                Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):{' '}
                <span className="font-bold text-xl text-gray-900">
                  ${subtotal.toFixed(2)}
                </span>
              </div>

              {/* Gift Checkbox */}
              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="rounded border-gray-300 text-amazon-orange focus:ring-amazon-orange cursor-pointer"
                />
                <span>This order contains a gift</span>
              </label>

              {/* Proceed to Checkout Button */}
              <Button
                id="proceed-to-checkout-btn"
                variant="buy-now"
                fullWidth
                disabled={items.length === 0}
                onClick={handleProceedToCheckout}
                className="py-2.5 font-bold flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Proceed to checkout</span>
                <ArrowRight size={16} />
              </Button>

              {/* EMI Note */}
              <div className="border-t border-gray-100 pt-3 text-[11px] text-gray-500">
                EMI Available on select bank credit cards. You can choose EMI option on the payment page.
              </div>

              {/* Security & Trust */}
              <div className="border-t border-gray-100 pt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
                <Lock size={14} className="text-gray-400" />
                <span>100% Safe &amp; Secure Payments</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
