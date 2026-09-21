'use client';
// ============================================================================
// Wishlist Page — /wishlist
// Customer Saved Wishlist with Move to Cart & RTDB persistence
// ============================================================================
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Heart,
  ShoppingCart,
  Trash2,
  Star,
  Check,
  AlertTriangle,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useWishlist } from '@/hooks/useWishlist';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import type { WishlistItem } from '@/types';

export default function WishlistPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, loading, removeFromWishlist, moveToCart } = useWishlist();
  const { addItem } = useCart();

  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddToCart = async (item: WishlistItem) => {
    if (!user) {
      router.push('/auth/sign-in?redirect=/wishlist');
      return;
    }
    await addItem(item.product, 1);
    showNotification(`Added "${item.product.title}" to your cart!`);
  };

  const handleMoveToCart = async (item: WishlistItem) => {
    if (!user) {
      router.push('/auth/sign-in?redirect=/wishlist');
      return;
    }
    await moveToCart(item);
    showNotification(`Moved "${item.product.title}" to your cart!`);
  };

  const handleRemove = async (productId: string, title: string) => {
    await removeFromWishlist(productId);
    showNotification(`Removed "${title}" from your wishlist.`);
  };

  // ── Signed Out State ──
  if (!user && !loading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-screen-xl px-4 py-16">
          <div className="rounded-xl border border-gray-200 bg-white p-8 md:p-12 shadow-xs text-center flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
              <Heart size={40} className="fill-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Your Wishlist
            </h1>
            <p className="text-sm text-gray-600 max-w-md mb-6">
              Sign in to view your saved items, access price drops, and manage your personalized shopping lists.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="button"
                variant="buy-now"
                onClick={() => router.push('/auth/sign-in?redirect=/wishlist')}
                className="px-8 py-2.5 font-bold"
              >
                Sign in to your account
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/auth/sign-up')}
                className="px-8 py-2.5"
              >
                Create an account
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // ── Loading Skeleton ──
  if (loading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-screen-2xl px-4 py-8 animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-36 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  // ── Empty Wishlist State ──
  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-screen-xl px-4 py-16">
          <div className="rounded-xl border border-gray-200 bg-white p-8 md:p-12 shadow-xs text-center flex flex-col items-center">
            <div className="h-20 w-20 rounded-full bg-red-50 flex items-center justify-center text-red-400 mb-4">
              <Heart size={40} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Your Wishlist is empty
            </h1>
            <p className="text-sm text-gray-600 max-w-md mb-6">
              Explore products you love and click the heart icon to save them for later or share with family and friends.
            </p>
            <Button
              type="button"
              variant="cart"
              onClick={() => router.push('/')}
              className="px-8 py-2.5 font-bold"
            >
              Explore today&apos;s deals
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-screen-2xl px-4 py-6">
        {/* Toast feedback */}
        {notification && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white shadow-xl animate-bounce">
            <Check size={18} strokeWidth={3} />
            <span>{notification}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Your Wishlist</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Default List · {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>

          <Link
            href="/"
            className="flex items-center gap-1 text-xs text-amazon-link hover:underline"
          >
            <ArrowLeft size={14} />
            <span>Continue shopping</span>
          </Link>
        </div>

        {/* Wishlist Items List */}
        <div className="divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white shadow-xs">
          {items.map((item) => {
            const product = item.product;
            const imgUrl =
              product.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300';
            const isOutOfStock =
              product.status === 'out_of_stock' || product.stock <= 0;

            return (
              <div
                key={item.id}
                className="p-5 flex flex-col sm:flex-row gap-5 justify-between items-start sm:items-center hover:bg-gray-50/50 transition-colors"
              >
                {/* Product Preview */}
                <div className="flex gap-4 flex-1">
                  <Link
                    href={`/product/${product.slug}`}
                    className="relative h-24 w-24 sm:h-28 sm:w-28 flex-shrink-0 rounded border border-gray-100 bg-white p-2"
                  >
                    <Image
                      src={imgUrl}
                      alt={product.title}
                      fill
                      sizes="112px"
                      className="object-contain p-1"
                    />
                  </Link>

                  <div className="flex flex-col gap-1 flex-1">
                    <Link
                      href={`/product/${product.slug}`}
                      className="text-sm sm:text-base font-semibold text-gray-900 hover:text-amazon-link line-clamp-2 leading-snug"
                    >
                      {product.title}
                    </Link>

                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center gap-1 text-xs text-gray-600">
                        <div className="flex text-amber-500">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              size={12}
                              className={
                                s <= Math.round(product.rating || 0)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-300'
                              }
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-amazon-link">
                          {product.reviewCount || 0}
                        </span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-base sm:text-lg font-bold text-[#b12704]">
                        ${product.price.toFixed(2)}
                      </span>
                      {product.compareAtPrice &&
                        product.compareAtPrice > product.price && (
                          <span className="text-xs text-gray-500 line-through">
                            ${product.compareAtPrice.toFixed(2)}
                          </span>
                        )}
                    </div>

                    {/* Stock Status */}
                    <div className="text-xs mt-0.5">
                      {isOutOfStock ? (
                        <span className="font-semibold text-red-600 flex items-center gap-1">
                          <AlertTriangle size={12} />
                          Currently out of stock
                        </span>
                      ) : (
                        <span className="font-medium text-green-700">
                          In Stock
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2.5 w-full sm:w-auto justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0">
                  <Button
                    type="button"
                    variant="cart"
                    disabled={isOutOfStock}
                    onClick={() => handleMoveToCart(item)}
                    className="text-xs px-4 py-2 font-semibold flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <ShoppingCart size={14} />
                    <span>Move to Cart</span>
                  </Button>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.productId, product.title)}
                    className="text-xs text-amazon-link hover:underline hover:text-amazon-link-hover flex items-center gap-1"
                  >
                    <Trash2 size={12} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </MainLayout>
  );
}
