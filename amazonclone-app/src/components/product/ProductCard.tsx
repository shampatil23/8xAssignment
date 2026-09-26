'use client';
// ============================================================================
// ProductCard — Ultra-Luxury Editorial Showcase (Valenza Maison)
// Palette: Warm Ivory (#fdfcf9), Champagne Gold (#dfba73, #c5a059),
// Obsidian Noir (#12141a), Compact Proportions & Half-Size Streamlined Layout
// ============================================================================
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Heart,
  ChevronRight,
  Truck,
  ArrowRight,
  ShoppingBag,
  Star,
  StarHalf,
  CheckCircle2,
  Gem,
} from 'lucide-react';
import type { Product } from '@/types';
import { useCart } from '@/hooks/useCart';
import { useWishlist } from '@/hooks/useWishlist';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/context/LocationContext';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { country, convertPrice } = useLocation();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [addedNotice, setAddedNotice] = useState(false);

  const primaryImage =
    product.images?.find((img) => img.isPrimary) ||
    product.images?.[0] || {
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      alt: product.title,
    };

  const isOutOfStock = product.status === 'out_of_stock' || product.stock <= 0;
  const wishlisted = isWishlisted(product.id);
  const hasVariants = product.variants && product.variants.length > 0;

  // Localized pricing & discounts
  const localPrice = convertPrice(product.price);
  const localCompare = product.compareAtPrice
    ? convertPrice(product.compareAtPrice)
    : Math.round(localPrice * 1.32);
  const hasDiscount = localCompare > localPrice;
  const discountPercent =
    product.discountPercent ||
    (hasDiscount ? Math.round(((localCompare - localPrice) / localCompare) * 100) : 24);

  // Star ratings
  const clampedRating = Math.max(0, Math.min(5, product.rating || 4.8));
  const fullStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating % 1 >= 0.3 && clampedRating % 1 <= 0.8;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));
  const reviewCount = product.reviewCount || 31200;

  const brandName = product.brand || 'VALENZA ATELIER';
  const subtitle = product.categoryName || product.subcategory || 'Bespoke Architectural Engineering';

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push(`/auth/sign-in?redirect=/product/${product.slug}`);
      return;
    }

    if (hasVariants) {
      router.push(`/product/${product.slug}`);
      return;
    }

    await addItem(product, 1);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push(`/auth/sign-in?redirect=/product/${product.slug}`);
      return;
    }

    if (hasVariants) {
      router.push(`/product/${product.slug}`);
      return;
    }

    await addItem(product, 1);
    router.push('/checkout');
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push(`/auth/sign-in?redirect=/product/${product.slug}`);
      return;
    }

    await toggleWishlist(product);
  };

  return (
    <article
      className="group relative flex flex-col justify-between rounded-2xl sm:rounded-[24px] border border-[#ebdcc8]/80 dark:border-[#282d3d] bg-[#fbf9f5] dark:bg-[#121520] p-3 sm:p-4 shadow-[0_6px_24px_rgba(180,150,110,0.07)] dark:shadow-[0_6px_24px_rgba(0,0,0,0.45)] hover:shadow-[0_14px_35px_rgba(180,150,110,0.14)] dark:hover:shadow-[0_14px_35px_rgba(0,0,0,0.65)] hover:border-[#c5a059]/60 transition-all duration-300"
      id={`product-card-${product.id}`}
    >
      <div>
        {/* ── 1. Compact Product Photography Canvas (Half Size, Zero Outer Margin) ── */}
        <div className="relative mb-3 w-full h-36 sm:h-40 rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-b from-[#f5ede2]/80 via-[#f9f6f0] to-[#eee4d6]/90 dark:from-[#1b2030] dark:via-[#151926] dark:to-[#111420] border border-[#ebdcc9] dark:border-[#272d3f]">
          
          {/* Top-left: Maison Pick / Featured Badge */}
          {product.isBestSeller ? (
            <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#dfba73] to-[#c5a059] text-[#141210] font-bold text-[9px] uppercase tracking-wider shadow-xs">
              <Star size={9.5} className="fill-[#141210] text-[#141210]" />
              <span>MAISON PICK</span>
            </div>
          ) : product.isFeatured ? (
            <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#181a24]/90 backdrop-blur-md border border-[#dfba73]/40 text-[#dfba73] font-medium text-[9px] uppercase tracking-wider shadow-xs">
              <Gem size={9.5} className="text-[#dfba73]" />
              <span>FEATURED</span>
            </div>
          ) : null}

          {/* Top-right: Floating White Circular Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white/95 dark:bg-[#1a1e2d]/90 backdrop-blur-md border border-black/5 dark:border-white/10 shadow-xs flex items-center justify-center text-stone-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            aria-label={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart
              size={14}
              className={wishlisted ? 'fill-red-500 text-red-500' : ''}
            />
          </button>

          {/* Product Image Link (Fills Canvas Without Outer Margins) */}
          <Link
            href={`/product/${product.slug}`}
            className="block w-full h-full relative"
            aria-label={product.title}
          >
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.title}
              fill
              priority={priority}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
        </div>

        {/* ── 2. Brand Name Row ── */}
        <div className="flex items-center gap-1.5 mb-1 px-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
          <span className="font-serif text-[10.5px] font-bold tracking-[0.22em] uppercase text-[#73685a] dark:text-[#c4bcaf]">
            {brandName}
          </span>
        </div>

        {/* ── 3. Editorial Typography: Title & Subtitle ── */}
        <Link
          href={`/product/${product.slug}`}
          className="block font-sans text-sm sm:text-[15px] font-semibold text-[#141312] dark:text-[#faf7f2] leading-snug group-hover:text-[#8a6827] dark:group-hover:text-[#dfba73] transition-colors line-clamp-2 min-h-[2.5rem] mb-1"
          title={product.title}
        >
          {product.title}
        </Link>
        <p className="text-xs text-[#786f63] dark:text-[#9ea4b5] font-normal leading-snug line-clamp-1 mb-2.5">
          {subtitle}
        </p>

        {/* ── 4. Star Rating & Review Count ── */}
        <div className="flex items-center gap-1.5 text-xs mb-2.5">
          <div className="flex items-center text-[#dfba73]">
            {Array.from({ length: fullStars }).map((_, i) => (
              <Star key={`full-${i}`} size={13} className="fill-[#dfba73] text-[#dfba73]" />
            ))}
            {hasHalfStar && (
              <StarHalf size={13} className="fill-[#dfba73] text-[#dfba73]" />
            )}
            {Array.from({ length: emptyStars }).map((_, i) => (
              <Star key={`empty-${i}`} size={13} className="text-[#d8cfc4] dark:text-[#3e4458] fill-[#ede6dc] dark:fill-[#202534]" />
            ))}
          </div>
          <span className="font-bold text-[#141312] dark:text-[#faf7f2] text-xs ml-0.5">
            {clampedRating.toFixed(1)}
          </span>
          <span className="text-[#847b6f] dark:text-[#8c94a6] text-[11px]">
            ({reviewCount.toLocaleString()})
          </span>
        </div>

        {/* ── 5. Pricing & In-Stock Status ── */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            {discountPercent > 0 && (
              <span className="rounded-md bg-[#b91c1c] px-1.5 py-0.5 text-[10px] font-bold text-white shadow-2xs leading-none">
                -{discountPercent}%
              </span>
            )}
            <div className="flex flex-col">
              <span className="font-sans text-[16px] sm:text-[17px] font-bold text-[#121110] dark:text-[#faf7f2] leading-none tracking-tight tabular-nums">
                <span className="text-xs font-semibold mr-0.5 opacity-85">{country.symbol}</span>
                {Math.floor(localPrice).toLocaleString(country.locale)}
              </span>
              {hasDiscount && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] text-[#867e72] dark:text-[#7d8598] line-through leading-none tabular-nums">
                    {country.symbol}
                    {Math.floor(localCompare).toLocaleString(country.locale)}
                  </span>
                  <span className="text-[9px] text-[#867e72] dark:text-[#7d8598] leading-none">
                    List Price
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* In Stock Badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ebf7ef] dark:bg-[#132c1e] text-[#186a3b] dark:text-[#4ade80] text-[10px] font-semibold border border-[#bce2ca] dark:border-[#1e4830]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#186a3b] dark:bg-[#4ade80] animate-pulse" />
            <span>In Stock</span>
          </span>
        </div>

        {/* ── 6. Complimentary Dispatch Guarantee ── */}
        <div className="flex items-center justify-between px-0.5 py-1 text-xs text-[#5c5449] dark:text-[#9ea4b5] mb-3 border-t border-[#ede4d8]/70 dark:border-[#262b3c] pt-2">
          <div className="flex items-center gap-2">
            <Truck size={14} className="text-[#8a6827] dark:text-[#dfba73] shrink-0" />
            <div>
              <p className="text-[11px] font-medium text-[#141312] dark:text-[#faf7f2] leading-tight">
                {product.deliveryInfo?.isFreeDelivery
                  ? `Complimentary dispatch to ${country.name}`
                  : `Dispatch to ${country.name}`}
              </p>
              <p className="text-[10px] text-[#7d7467] dark:text-[#8d95a8] leading-tight mt-0.5">
                {product.deliveryInfo?.fastestDeliveryDate || 'Tomorrow, by 8:00 PM'}
              </p>
            </div>
          </div>
          <ChevronRight size={11} className="text-[#a89b88] dark:text-[#6e778e] shrink-0" />
        </div>
      </div>

      {/* ── 7. Luxury Action Buttons (Add to Bag & Buy Now) ── */}
      <div className="pt-1">
        {addedNotice ? (
          <div className="flex items-center justify-center gap-2 w-full rounded-full bg-[#185c37] text-white py-2.5 text-xs font-semibold shadow-md">
            <CheckCircle2 size={15} />
            <span>Added to Bag</span>
          </div>
        ) : isOutOfStock ? (
          <button
            type="button"
            disabled
            className="block w-full rounded-full bg-[#ede6db] dark:bg-[#1a1e2a] py-2.5 text-center text-xs font-medium text-[#9a9184] dark:text-[#636b7e] cursor-not-allowed border border-[#decaba] dark:border-[#2a2f42]"
          >
            Out of Stock
          </button>
        ) : hasVariants ? (
          <Link
            href={`/product/${product.slug}`}
            className="relative flex items-center justify-between w-full rounded-full bg-[#12141a] dark:bg-[#0c0e14] hover:bg-[#1c202a] text-white p-1 pl-4 sm:pl-5 border border-[#2b3042] hover:border-[#dfba73]/70 shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_24px_rgba(197,160,89,0.22)] transition-all duration-300 group cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={14} className="text-[#dfba73] group-hover:scale-110 transition-transform" />
              <span className="font-serif text-xs sm:text-[13px] font-semibold tracking-wider text-white">
                View Options
              </span>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-[#dfba73] to-[#c5a059] flex items-center justify-center text-[#121110] shadow-sm group-hover:translate-x-0.5 group-hover:scale-105 transition-all">
              <ArrowRight size={13} strokeWidth={2.5} className="text-[#121110]" />
            </div>
          </Link>
        ) : (
          <div className="flex items-center gap-2 w-full">
            {/* Quick Add to Bag Button */}
            <button
              type="button"
              onClick={handleQuickAdd}
              id={`add-bag-btn-${product.id}`}
              className="w-9 h-9 rounded-full border border-[#d6be90] dark:border-[#3a3222] bg-[#fbfaf8] dark:bg-[#161a25] hover:border-[#c5a059] hover:bg-[#f6efe1] dark:hover:bg-[#1f2536] text-[#8a6827] dark:text-[#dfba73] flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-2xs"
              title="Add to Shopping Bag"
              aria-label="Add to Bag"
            >
              <ShoppingBag size={14} />
            </button>

            {/* Buy Now Button */}
            <button
              type="button"
              onClick={handleBuyNow}
              id={`buy-now-btn-${product.id}`}
              className="flex-1 relative flex items-center justify-between rounded-full bg-gradient-to-r from-[#c5a059] via-[#d6be90] to-[#a88237] hover:brightness-105 text-[#0d0a06] p-1 pl-4 border border-[#b89047]/50 shadow-[0_2px_12px_rgba(197,160,89,0.25)] hover:shadow-[0_4px_18px_rgba(197,160,89,0.4)] transition-all duration-300 group cursor-pointer"
            >
              <span className="font-serif text-[11px] sm:text-xs uppercase tracking-[0.16em] font-bold text-[#0d0a06]">
                Buy Now
              </span>
              <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#0d0a06] text-[#dfba73] flex items-center justify-center shadow-xs group-hover:translate-x-0.5 transition-all">
                <ArrowRight size={11} strokeWidth={2.5} />
              </div>
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
