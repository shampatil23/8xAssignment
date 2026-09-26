'use client';
// ============================================================================
// Shopping Cart / Private Vault Page — /cart
// Valenza Maison Haute Horlogerie & Joaillerie Private Acquisition Bag
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
  Gem,
  Gift,
  Crown,
  Star,
  Award,
  RotateCcw,
  Tag,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/context/LocationContext';
import { getRecommendationsForCart } from '@/services/recommendationService';
import type { CartItem, Product } from '@/types';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { country, formatPrice } = useLocation();
  const {
    items,
    savedItems,
    itemCount,
    subtotal,
    appliedPromoCode,
    appliedDiscountPercent,
    removePromoCode,
    loading,
    updateQuantity,
    removeItem,
    saveForLater,
    moveToCart,
    removeSavedItem,
    clearCart,
  } = useCart();

  const [isGift, setIsGift] = useState(false);
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  React.useEffect(() => {
    let isMounted = true;
    async function loadRecs() {
      try {
        const recs = await getRecommendationsForCart({ items } as any, 4);
        if (isMounted) setRecommendations(recs);
      } catch (err) {
        console.error('Failed to load cart recommendations', err);
      }
    }
    loadRecs();
    return () => {
      isMounted = false;
    };
  }, [items]);

  const freeShippingThresholdUsd = country.freeShippingThreshold / country.rate;
  const amountNeededForFreeShipping = Math.max(
    0,
    freeShippingThresholdUsd - subtotal,
  );
  const qualifiesForFreeShipping = subtotal >= freeShippingThresholdUsd && items.length > 0;

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
      alert('Please remove or save for later any allocated items that are currently unavailable before proceeding.');
      return;
    }

    router.push('/checkout');
  };

  // ── Loading Skeleton ──
  if (loading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 py-10 animate-pulse">
          <div className="h-4 w-48 bg-[#ebe2d1] dark:bg-[#1f2533] rounded-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-6">
              <div className="h-48 bg-[#ebe2d1]/50 dark:bg-[#161a25] rounded-3xl" />
              <div className="h-48 bg-[#ebe2d1]/50 dark:bg-[#161a25] rounded-3xl" />
            </div>
            <div className="lg:col-span-4 h-72 bg-[#ebe2d1]/50 dark:bg-[#161a25] rounded-3xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  // ── Empty Cart State ──
  if (items.length === 0 && savedItems.length === 0) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-screen-xl px-4 py-20">
          <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 p-10 md:p-16 shadow-[0_12px_40px_rgba(26,23,20,0.04)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.6)] text-center flex flex-col items-center">
            <div className="h-20 w-20 rounded-full border border-[#d6be90] dark:border-[#c5a059]/40 bg-[#fbfaf8] dark:bg-[#161a25] flex items-center justify-center text-[#c5a059] mb-6 shadow-sm">
              <ShoppingBag size={36} strokeWidth={1.5} />
            </div>

            <span className="text-[10px] uppercase font-semibold tracking-[0.25em] text-[#9b8353] dark:text-[#d6be90] block mb-1">
              Private Client Bag
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#141312] dark:text-[#f8f5ee] mb-2">
              Your Shopping Bag is Empty
            </h1>

            {!user ? (
              <div className="max-w-md space-y-5 mt-2">
                <p className="text-xs text-[#786b58] dark:text-[#9e978b] leading-relaxed">
                  Sign in to view pieces previously allocated to your salon or explore current Haute Horlogerie &amp; Joaillerie masterworks.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => router.push('/auth/sign-in?redirect=/cart')}
                    className="px-6 py-3 rounded-xl font-sans text-xs uppercase tracking-[0.16em] font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] via-[#d6be90] to-[#b89548] hover:brightness-105 shadow-md cursor-pointer transition-all"
                  >
                    Client Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/auth/sign-up')}
                    className="px-6 py-3 rounded-xl font-sans text-xs uppercase tracking-[0.16em] font-semibold text-[#786b58] dark:text-[#c4b59d] border border-[#dfd6c5] dark:border-[#2f384d] hover:border-[#c5a059] cursor-pointer transition-all"
                  >
                    Request Membership
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-md space-y-5 mt-2">
                <p className="text-xs text-[#786b58] dark:text-[#9e978b] leading-relaxed">
                  Your private vault is currently awaiting allocations. Discover our curated Haute Horlogerie salons and bespoke allocations.
                </p>
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="px-8 py-3.5 rounded-xl font-sans text-xs uppercase tracking-[0.16em] font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] via-[#d6be90] to-[#b89548] hover:brightness-105 shadow-md cursor-pointer transition-all"
                >
                  Explore Maison Salons
                </button>
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 py-6 sm:py-8 text-[#141312] dark:text-[#f8f5ee]">
        {/* Breadcrumb */}
        <div className="text-[11px] uppercase tracking-[0.16em] font-medium text-[#786b58] dark:text-[#9e978b] mb-6 flex items-center gap-2">
          <Link href="/" className="hover:text-[#c5a059] dark:hover:text-[#d6be90] transition-colors">
            Maison
          </Link>
          <span className="text-[#dfd6c5] dark:text-[#2c3242]">◆</span>
          <span className="text-[#141312] dark:text-[#f8f5ee] font-semibold">Shopping Bag</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Left Column: Cart Items (8 cols) ── */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 backdrop-blur-xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(26,23,20,0.04)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.6)]">
              <div className="flex items-center justify-between border-b border-[#f0eae0] dark:border-[#1e2433] pb-4 mb-6">
                <div>
                  <span className="text-[10px] uppercase font-semibold tracking-[0.25em] text-[#9b8353] dark:text-[#d6be90] block mb-1">
                    Selected Items
                  </span>
                  <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-[#141312] dark:text-[#f8f5ee]">
                    Shopping Bag
                  </h1>
                  <span className="text-xs text-[#786b58] dark:text-[#9e978b] mt-0.5 block">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} in your bag
                  </span>
                </div>
                <div className="text-[11px] uppercase tracking-wider font-semibold text-[#8e816e] dark:text-[#7e8aa2] text-right hidden sm:block">
                  Price
                </div>
              </div>

              {/* Items List */}
              {items.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#786b58] dark:text-[#9e978b]">
                  No active items in your bag. Review your saved pieces below.
                </div>
              ) : (
                <div className="divide-y divide-[#f0eae0] dark:divide-[#1e2433]">
                  {items.map((item) => {
                    const imgUrl =
                      item.product.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400';
                    const isOutOfStock =
                      item.isAvailable === false || item.product.stock <= 0;
                    const isLowStock =
                      item.product.stock > 0 && item.product.stock <= 3;

                    return (
                      <div
                        key={item.id}
                        className={`py-6 flex flex-col sm:flex-row gap-5 justify-between transition-colors ${
                          isOutOfStock ? 'bg-rose-50/20 -mx-4 px-4 rounded-2xl' : ''
                        }`}
                      >
                        {/* Thumbnail & Product Details */}
                        <div className="flex gap-5 flex-1">
                          <Link
                            href={item.product.slug ? `/product/${item.product.slug}` : '/'}
                            className="relative h-28 w-28 sm:h-32 sm:w-32 flex-shrink-0 rounded-2xl border border-[#ebe2d1] dark:border-[#262c3d] bg-[#fbfaf8] dark:bg-[#161a25] p-2 hover:border-[#c5a059] transition-all"
                          >
                            <Image
                              src={imgUrl}
                              alt={item.product.title}
                              fill
                              sizes="128px"
                              className="object-contain p-1.5"
                            />
                          </Link>

                          <div className="flex flex-col flex-1 gap-1.5 min-w-0">
                            <Link
                              href={item.product.slug ? `/product/${item.product.slug}` : '/'}
                              className="font-serif text-sm sm:text-base font-medium text-[#141312] dark:text-[#f8f5ee] hover:text-[#c5a059] dark:hover:text-[#d6be90] line-clamp-2 leading-snug transition-colors"
                            >
                              {item.product.title}
                            </Link>

                            {/* Variant Info */}
                            {item.variantTitle && (
                              <div className="text-xs text-[#786b58] dark:text-[#9e978b]">
                                Spec: <span className="font-semibold text-[#141312] dark:text-[#f8f5ee]">{item.variantTitle}</span>
                              </div>
                            )}

                            {/* Stock Status Badge */}
                            <div className="pt-0.5">
                              {isOutOfStock ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[11px] font-semibold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                                  <AlertTriangle size={12} />
                                  Currently Allocated / Unavailable
                                </span>
                              ) : isLowStock ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-[11px] font-semibold text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/40">
                                  Limited: Only {item.product.stock} in Atelier
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                                  <Check size={11} /> Available in Maison Vault
                                </span>
                              )}
                            </div>

                            {/* White Glove Courier badge */}
                            {item.product.isPrimeEligible && !isOutOfStock && (
                              <div className="flex items-center gap-1.5 text-xs text-[#786b58] dark:text-[#d6be90] mt-0.5">
                                <Gem size={12} className="text-[#c5a059]" />
                                <span className="font-sans text-[11px] uppercase tracking-wider font-semibold">
                                  Valenza White Glove Insured Transit
                                </span>
                              </div>
                            )}

                            {/* Action Buttons row */}
                            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs">
                              {/* Quantity Pill Controls */}
                              <div className="flex items-center rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fbfaf8] dark:bg-[#161a25] shadow-xs">
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="px-3 py-1.5 text-[#786b58] dark:text-[#c4b59d] hover:text-[#141312] dark:hover:text-[#f8f5ee] disabled:opacity-30 rounded-l-xl transition-colors cursor-pointer"
                                  title="Decrease allocation quantity"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="px-3 py-1.5 font-serif font-semibold text-[#141312] dark:text-[#f8f5ee] text-xs min-w-[32px] text-center bg-white dark:bg-[#12151f]">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  disabled={item.quantity >= item.product.stock || isOutOfStock}
                                  className="px-3 py-1.5 text-[#786b58] dark:text-[#c4b59d] hover:text-[#141312] dark:hover:text-[#f8f5ee] disabled:opacity-30 rounded-r-xl transition-colors cursor-pointer"
                                  title="Increase allocation quantity"
                                  aria-label="Increase quantity"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>

                              <span className="text-[#dfd6c5] dark:text-[#2c3242]">◆</span>

                              {/* Delete */}
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="text-xs font-semibold uppercase tracking-wider text-[#9b8353] dark:text-[#d6be90] hover:text-[#7d673b] dark:hover:text-[#f3e5ca] hover:underline cursor-pointer transition-colors"
                              >
                                Remove Piece
                              </button>

                              <span className="text-[#dfd6c5] dark:text-[#2c3242]">◆</span>

                              {/* Save for later */}
                              <button
                                type="button"
                                onClick={() => saveForLater(item.id)}
                                className="text-xs font-semibold uppercase tracking-wider text-[#9b8353] dark:text-[#d6be90] hover:text-[#7d673b] dark:hover:text-[#f3e5ca] hover:underline cursor-pointer transition-colors"
                              >
                                Save to Wishlist
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Line Item Price */}
                        <div className="text-right sm:pl-4">
                          <div className="font-serif text-lg sm:text-xl font-semibold text-[#141312] dark:text-[#f8f5ee]">
                            {formatPrice(item.product.price * item.quantity)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-[11px] text-[#8e816e] dark:text-[#7e8aa2] mt-0.5">
                              ({formatPrice(item.product.price)} each)
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
                <div className="mt-6 pt-5 border-t border-[#f0eae0] dark:border-[#1e2433] flex justify-end text-sm sm:text-base">
                  <span className="text-[#786b58] dark:text-[#9e978b]">
                    Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):{' '}
                    <strong className="font-serif text-xl sm:text-2xl font-semibold text-[#141312] dark:text-[#f8f5ee] ml-1">
                      {formatPrice(subtotal)}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            {/* ── Saved For Later Section ── */}
            {savedItems.length > 0 && (
              <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 p-6 sm:p-8 shadow-[0_12px_40px_rgba(26,23,20,0.04)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.6)]">
                <div className="border-b border-[#f0eae0] dark:border-[#1e2433] pb-3 mb-5 flex items-center justify-between">
                  <h2 className="font-serif text-lg sm:text-xl font-light text-[#141312] dark:text-[#f8f5ee]">
                    Archived Pieces ({savedItems.length})
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {savedItems.map((item) => {
                    const imgUrl =
                      item.product.images?.[0]?.url ||
                      'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=300';
                    const isOutOfStock = item.product.stock <= 0;

                    return (
                      <div
                        key={item.id}
                        className="flex flex-col justify-between rounded-2xl border border-[#ebe2d1] dark:border-[#262c3d] p-4 bg-[#fbfaf8] dark:bg-[#161a25]/80 hover:border-[#c5a059] transition-all"
                      >
                        <div className="flex gap-4">
                          <Link
                            href={item.product.slug ? `/product/${item.product.slug}` : '/'}
                            className="relative h-20 w-20 flex-shrink-0 rounded-xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#12151f] p-1.5"
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
                              className="font-serif text-xs font-medium text-[#141312] dark:text-[#f8f5ee] hover:text-[#c5a059] line-clamp-2 leading-snug transition-colors"
                            >
                              {item.product.title}
                            </Link>
                            {item.variantTitle && (
                              <div className="text-[11px] text-[#786b58] dark:text-[#9e978b] mt-0.5">
                                {item.variantTitle}
                              </div>
                            )}
                            <div className="font-serif text-sm font-semibold text-[#141312] dark:text-[#f8f5ee] mt-1">
                              {formatPrice(item.product.price)}
                            </div>
                            <div className="text-[11px] font-medium text-[#8e816e] dark:text-[#7e8aa2]">
                              {isOutOfStock ? (
                                <span className="text-rose-600">Currently Unavailable</span>
                              ) : (
                                <span className="text-emerald-700 dark:text-emerald-400">Available in Vault</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-[#f0eae0] dark:border-[#1e2433] flex items-center gap-3 text-xs">
                          <button
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => moveToCart(item.id)}
                            className="text-xs uppercase tracking-wider font-semibold py-2 px-4 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b89548] text-[#12110f] flex-1 text-center hover:brightness-105 transition-all disabled:opacity-40 cursor-pointer shadow-xs"
                          >
                            Transfer to Bag
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSavedItem(item.id)}
                            className="text-xs uppercase tracking-wider font-semibold text-[#8e816e] hover:text-[#141312] dark:hover:text-[#f8f5ee] px-2 cursor-pointer"
                          >
                            Remove
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
            <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 backdrop-blur-xl p-6 sm:p-7 shadow-[0_15px_40px_rgba(26,23,20,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-5 sticky top-24">
              
              {/* Complimentary Insured Transit Banner */}
              <div className="rounded-2xl bg-[#fbfaf8] dark:bg-[#161a25] p-4 border border-[#ebe2d1] dark:border-[#262c3d] text-xs text-[#786b58] dark:text-[#b8af9f]">
                {qualifiesForFreeShipping ? (
                  <div className="flex items-start gap-2.5 text-emerald-800 dark:text-emerald-300 font-medium">
                    <CheckCircle2 size={18} className="flex-shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    <span>
                      Your acquisition qualifies for <strong>Complimentary Insured White-Glove Transit</strong>.
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="text-[#141312] dark:text-[#f8f5ee] leading-snug">
                      Add{' '}
                      <strong className="font-serif text-[#9b8353] dark:text-[#d6be90]">
                        {formatPrice(amountNeededForFreeShipping)}
                      </strong>{' '}
                      of archival pieces for <strong>Complimentary Armored Courier</strong>.
                    </p>
                    {/* Progress bar in champagne gold */}
                    <div className="mt-2.5 h-2 w-full rounded-full bg-[#ebe2d1] dark:bg-[#283042] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#c5a059] to-[#b89548] transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (subtotal / freeShippingThresholdUsd) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Active Privilege Code Card */}
              {appliedPromoCode && (
                <div className="rounded-2xl bg-[#c5a059]/10 dark:bg-[#dfba73]/15 p-3.5 border border-[#c5a059]/40 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag size={15} className="text-[#c5a059]" />
                    <div>
                      <p className="font-serif font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[11px]">
                        Privilege Code: {appliedPromoCode}
                      </p>
                      <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                        {appliedDiscountPercent}% Exhibition Privilege Applied (-{formatPrice((subtotal * appliedDiscountPercent) / 100)})
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removePromoCode}
                    className="text-[10px] uppercase font-bold text-gray-400 hover:text-red-500 cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Subtotal Display */}
              <div>
                <span className="text-[10px] uppercase font-semibold tracking-widest text-[#9b8353] dark:text-[#d6be90] block mb-1">
                  Estimated Total {appliedPromoCode ? '(Privilege Applied)' : ''}
                </span>
                <div className="flex items-baseline gap-2">
                  <div className="font-serif text-2xl sm:text-3xl font-light text-[#141312] dark:text-[#f8f5ee]">
                    {formatPrice(
                      appliedPromoCode
                        ? subtotal * (1 - appliedDiscountPercent / 100)
                        : subtotal,
                    )}
                  </div>
                  {appliedPromoCode && (
                    <span className="font-serif text-xs text-gray-400 line-through">
                      {formatPrice(subtotal)}
                    </span>
                  )}
                </div>
              </div>

              {/* Gift Presentation Checkbox */}
              <label className="flex items-center gap-2.5 text-xs text-[#615442] dark:text-[#c4b59d] cursor-pointer select-none border-t border-[#f0eae0] dark:border-[#1e2433] pt-4">
                <input
                  type="checkbox"
                  checked={isGift}
                  onChange={(e) => setIsGift(e.target.checked)}
                  className="rounded border-[#c5a059] text-[#c5a059] focus:ring-[#c5a059] cursor-pointer accent-[#c5a059]"
                />
                <span className="flex items-center gap-1.5">
                  <Gift size={13} className="text-[#c5a059]" />
                  <span>Include Bespoke Maison Wax-Sealed Presentation Box</span>
                </span>
              </label>

              {/* Proceed to Checkout Button */}
              <button
                id="proceed-to-checkout-btn"
                disabled={items.length === 0}
                onClick={handleProceedToCheckout}
                className="group w-full inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl font-sans text-xs uppercase tracking-[0.18em] font-bold text-[#0d0a06] bg-gradient-to-r from-[#c5a059] via-[#d6b870] to-[#a88237] hover:brightness-105 active:scale-[0.99] transition-all shadow-[0_4px_18px_rgba(197,160,89,0.3)] hover:shadow-[0_6px_24px_rgba(197,160,89,0.45)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer border border-[#b89047]/40"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Financing Note */}
              <div className="border-t border-[#f0eae0] dark:border-[#1e2433] pt-3 text-[11px] text-[#8e816e] dark:text-[#7e8aa2] text-center">
                Private Wealth Centurion &amp; 0% 12-Month Salon Financing available at settlement.
              </div>

              {/* Security & Trust */}
              <div className="border-t border-[#f0eae0] dark:border-[#1e2433] pt-3 flex items-center justify-center gap-2 text-xs text-[#8e816e] dark:text-[#7e8aa2]">
                <Lock size={13} className="text-[#c5a059]" />
                <span>256-Bit Encrypted Vault Protocol</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Recommendations Section ── */}
        {recommendations.length > 0 && (
          <div className="mt-16 rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 backdrop-blur-xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(26,23,20,0.03)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.6)]">
            <div className="flex items-center gap-2 mb-6 pb-3 border-b border-[#f0eae0] dark:border-[#1e2433]">
              <Gem className="w-4 h-4 text-[#c5a059]" />
              <h2 className="font-serif text-lg sm:text-xl font-light text-[#141312] dark:text-[#f8f5ee]">
                Maison Curations &amp; Recommended Companions
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {recommendations.map((p) => {
                const img =
                  p.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=300';
                return (
                  <Link
                    key={p.id}
                    href={`/product/${p.slug}`}
                    className="group flex flex-col justify-between rounded-2xl border border-[#ebe2d1] dark:border-[#262c3d] p-4 hover:border-[#c5a059] hover:shadow-md transition-all bg-[#fbfaf8] dark:bg-[#161a25]/80"
                  >
                    <div>
                      <div className="relative h-40 w-full rounded-xl bg-white dark:bg-[#12151f] overflow-hidden mb-3 border border-[#f0eae0] dark:border-[#1e2433]">
                        <Image
                          src={img}
                          alt={p.title}
                          fill
                          sizes="180px"
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      
                      {p.brand && (
                        <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#9b8353] dark:text-[#d6be90] block mb-1">
                          {p.brand}
                        </span>
                      )}

                      <h3 className="font-serif text-xs font-medium text-[#141312] dark:text-[#f8f5ee] group-hover:text-[#c5a059] line-clamp-2 leading-snug transition-colors">
                        {p.title}
                      </h3>

                      <div className="mt-2 flex items-center gap-1.5 text-xs text-[#c5a059]">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={11}
                              className={
                                s <= Math.round(p.rating)
                                  ? 'fill-[#c5a059] text-[#c5a059]'
                                  : 'text-[#dfd6c5] dark:text-[#32394d]'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-[#8e816e] dark:text-[#7e8aa2]">({p.reviewCount})</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#f0eae0] dark:border-[#1e2433] flex items-center justify-between">
                      <span className="font-serif text-sm font-semibold text-[#141312] dark:text-[#f8f5ee]">
                        {formatPrice(p.price)}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-[#9b8353] dark:text-[#d6be90] font-medium">
                        Explore →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
