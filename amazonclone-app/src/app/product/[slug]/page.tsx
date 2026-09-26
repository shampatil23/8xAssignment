'use client';
// ============================================================================
// Product Details Page — /product/[slug]
// Valenza Haute Maison — Luxury Product Experience
// ============================================================================
import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Lock,
  Heart,
  Share2,
  Check,
  AlertTriangle,
  ShoppingBag,
  Gem,
  Award,
  Crown,
  Truck,
  Star,
  Package,
  Info,
  Minus,
  Plus,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductGallery } from '@/components/product/ProductGallery';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { ProductRating } from '@/components/product/ProductRating';
import { StockBadge } from '@/components/product/StockBadge';
import { VariantSelector } from '@/components/product/VariantSelector';
import { DeliveryInfoCard } from '@/components/product/DeliveryInfoCard';
import { FrequentlyBoughtTogether } from '@/components/product/FrequentlyBoughtTogether';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { ProductQA } from '@/components/product/ProductQA';
import { CustomerReviews } from '@/components/product/CustomerReviews';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { fetchProductBySlug } from '@/services/productService';
import type { Product, ProductVariant } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

// ── Tab type for Info Tabs ────────────────────────────────────────────────
type InfoTab = 'details' | 'specs' | 'delivery';

export default function ProductDetailPage({ params }: PageProps) {
  const { slug } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useCart();
  const { isWishlisted: checkIsWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<InfoTab>('details');

  // Interaction feedback states
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warn' } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const isWishlisted = product ? checkIsWishlisted(product.id) : false;

  useEffect(() => {
    let isMounted = true;
    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchProductBySlug(slug);
        if (!isMounted) return;
        if (res.success && res.data) {
          setProduct(res.data);
          if (res.data.variants && res.data.variants.length > 0) {
            const defaultVar = res.data.variants.find((v) => v.stock > 0) || res.data.variants[0];
            setSelectedVariant(defaultVar);
          }
        } else {
          setError(res.error ?? 'Product not found');
        }
      } catch (err) {
        if (isMounted) setError((err as Error).message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProduct();
    return () => { isMounted = false; };
  }, [slug]);

  // Derived state
  const currentPrice = selectedVariant?.price ?? product?.price ?? 0;
  const currentComparePrice = selectedVariant?.compareAtPrice ?? product?.compareAtPrice;
  const currentStock = selectedVariant ? selectedVariant.stock : (product?.stock ?? 0);
  const isOutOfStock = product?.status === 'out_of_stock' || currentStock <= 0;
  const maxAvailableQty = Math.max(1, Math.min(10, currentStock));
  const discount = currentComparePrice && currentComparePrice > currentPrice
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : null;

  // Clamp quantity when variant changes
  useEffect(() => {
    if (quantity > maxAvailableQty && maxAvailableQty > 0) setQuantity(maxAvailableQty);
  }, [maxAvailableQty, quantity]);

  const showToast = (text: string, type: 'success' | 'warn' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddToCart = () => {
    if (!user) {
      showToast('Please sign in to add items to your bag.', 'warn');
      setTimeout(() => router.push(`/auth/sign-in?redirect=/product/${slug}`), 1200);
      return;
    }
    if (!product || isOutOfStock) return;
    addItem(product, selectedVariant, quantity);
    showToast(`Added "${product.title}" to your bag.`);
  };

  const handleBuyNow = () => {
    if (!user) {
      showToast('Please sign in to continue with checkout.', 'warn');
      setTimeout(() => router.push(`/auth/sign-in?redirect=/product/${slug}`), 1200);
      return;
    }
    if (!product || isOutOfStock) return;
    addItem(product, selectedVariant, quantity);
    router.push('/checkout');
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      showToast('Please sign in to save items to your wishlist.', 'warn');
      setTimeout(() => router.push(`/auth/sign-in?redirect=/product/${slug}`), 1200);
      return;
    }
    if (!product) return;
    const added = await toggleWishlist(product);
    showToast(added ? `Saved "${product.title}" to wishlist.` : `Removed from wishlist.`);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // ── Loading Skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 py-10 animate-pulse">
          <div className="h-4 w-48 bg-[#ebe2d1] dark:bg-[#1f2533] rounded-full mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 h-[520px] bg-[#ebe2d1]/60 dark:bg-[#1c2230] rounded-3xl" />
            <div className="lg:col-span-4 space-y-4">
              <div className="h-5 w-24 bg-[#ebe2d1]/60 dark:bg-[#1c2230] rounded-xl" />
              <div className="h-9 w-3/4 bg-[#ebe2d1]/60 dark:bg-[#1c2230] rounded-xl" />
              <div className="h-4 w-1/3 bg-[#ebe2d1]/60 dark:bg-[#1c2230] rounded-xl" />
              <div className="h-14 w-1/2 bg-[#ebe2d1]/60 dark:bg-[#1c2230] rounded-xl" />
              <div className="h-28 bg-[#ebe2d1]/60 dark:bg-[#1c2230] rounded-2xl" />
              <div className="h-40 bg-[#ebe2d1]/60 dark:bg-[#1c2230] rounded-2xl" />
            </div>
            <div className="lg:col-span-3 h-[440px] bg-[#ebe2d1]/60 dark:bg-[#1c2230] rounded-3xl" />
          </div>
        </div>
      </MainLayout>
    );
  }

  // ── Not Found / Error ─────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-screen-xl px-4 py-20">
          <EmptyState
            title="Product Not Available"
            description="Sorry, we couldn't find this product. It may have been moved or sold out."
            actionLabel="Back to Home"
            onAction={() => router.push('/')}
          />
        </div>
      </MainLayout>
    );
  }

  const infoTabs: { key: InfoTab; label: string; icon: React.ReactNode }[] = [
    { key: 'details', label: 'Details', icon: <Info size={13} /> },
    { key: 'specs', label: 'Specs', icon: <Package size={13} /> },
    { key: 'delivery', label: 'Delivery', icon: <Truck size={13} /> },
  ];

  return (
    <MainLayout>
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 py-6 sm:py-8 pb-28 lg:pb-14 text-[#141312] dark:text-[#f8f5ee]">

        {/* ── Toast ───────────────────────────────────────────────────────── */}
        {toastMessage && (
          <div
            className={`fixed top-[72px] right-5 z-50 flex items-center gap-2.5 rounded-2xl backdrop-blur-md px-5 py-3.5 text-xs font-semibold uppercase tracking-widest shadow-2xl border transition-all ${
              toastMessage.type === 'success'
                ? 'bg-[#141312]/95 border-[#c5a059]/40 text-[#f8f5ee]'
                : 'bg-[#9b8353]/95 border-[#e4d6bf] text-white'
            }`}
          >
            {toastMessage.type === 'success' ? (
              <Gem size={15} className="text-[#c5a059] shrink-0" />
            ) : (
              <AlertTriangle size={15} className="shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-[11px] uppercase tracking-[0.14em] font-medium text-[#786b58] dark:text-[#9e978b] mb-6"
        >
          <Link href="/" className="hover:text-[#c5a059] transition-colors">Home</Link>
          <ChevronRight size={11} className="text-[#c5a059]/60" />
          <Link
            href={`/search?category=${encodeURIComponent(product.category)}`}
            className="hover:text-[#c5a059] capitalize transition-colors"
          >
            {product.categoryName || product.category}
          </Link>
          <ChevronRight size={11} className="text-[#c5a059]/60" />
          <span className="line-clamp-1 max-w-xs sm:max-w-md font-semibold text-[#141312] dark:text-[#f8f5ee]">
            {product.title}
          </span>
        </nav>

        {/* ── Main 3-Column Grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

          {/* ── Col 1: Gallery (5 cols) ──────────────────────────────────── */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <ProductGallery
              images={product.images}
              title={product.title}
              activeImageOverride={selectedVariant?.image}
            />
            {/* Quick action row under gallery */}
            <div className="flex items-center justify-between mt-4 px-1">
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold text-[#786b58] dark:text-[#9e978b] hover:text-[#c5a059] dark:hover:text-[#dfba73] transition-colors cursor-pointer"
              >
                {copiedLink ? <Check size={13} className="text-emerald-500" /> : <Share2 size={13} />}
                {copiedLink ? 'Copied!' : 'Share'}
              </button>
              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-semibold transition-colors cursor-pointer ${
                  isWishlisted
                    ? 'text-[#c5a059]'
                    : 'text-[#786b58] dark:text-[#9e978b] hover:text-[#c5a059]'
                }`}
              >
                <Heart
                  size={13}
                  className={isWishlisted ? 'fill-[#c5a059] text-[#c5a059]' : ''}
                />
                {isWishlisted ? 'Saved' : 'Save'}
              </button>
            </div>
          </div>

          {/* ── Col 2: Product Info (4 cols) ─────────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col gap-5">

            {/* Brand */}
            {product.brand && (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#9b8353] dark:text-[#d6be90]">
                <Crown size={12} className="text-[#c5a059]" />
                <span>{product.brand}</span>
              </div>
            )}

            {/* Title */}
            <h1 className="font-serif text-2xl sm:text-[28px] font-light leading-snug tracking-tight text-[#141312] dark:text-[#f8f5ee]">
              {product.title}
            </h1>

            {/* Rating Row */}
            <div className="flex items-center gap-3 flex-wrap">
              <ProductRating rating={product.rating} reviewCount={product.reviewCount} size="md" />
              {product.reviewCount > 0 && (
                <a
                  href="#reviews-section"
                  className="text-[11px] text-[#9b8353] dark:text-[#d6be90] underline underline-offset-2 hover:text-[#7d673b] transition-colors"
                >
                  Read all reviews
                </a>
              )}
            </div>

            {/* Price Block */}
            <div className="rounded-2xl bg-[#fdf9f4] dark:bg-[#12151f] border border-[#ebe2d1] dark:border-[#262c3d] px-4 py-4 flex items-end gap-4">
              <PriceDisplay price={currentPrice} compareAtPrice={currentComparePrice} size="xl" />
              {discount && (
                <span className="mb-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  {discount}% off
                </span>
              )}
            </div>

            {/* Prime / White Glove Badge */}
            {product.isPrimeEligible && !isOutOfStock && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f6efe1] dark:bg-[#1a2130] border border-[#e4d6bf] dark:border-[#2f384d] text-xs">
                <Gem size={12} className="text-[#c5a059]" />
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#786b58] dark:text-[#d6be90]">
                  Free White-Glove Delivery Included
                </span>
              </div>
            )}

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="border-t border-[#f0eae0] dark:border-[#1e2433] pt-4">
                <VariantSelector
                  variants={product.variants}
                  selectedVariantId={selectedVariant?.id}
                  onSelectVariant={(variant) => setSelectedVariant(variant)}
                />
              </div>
            )}

            {/* ── Info Tabs: Details / Specs / Delivery ────────────────── */}
            <div className="border-t border-[#f0eae0] dark:border-[#1e2433] pt-4">
              {/* Tab Switcher */}
              <div className="flex gap-1 mb-4 bg-[#f5f0e8] dark:bg-[#161a25] rounded-xl p-1">
                {infoTabs.map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                      activeTab === tab.key
                        ? 'bg-white dark:bg-[#12151f] text-[#c5a059] shadow-sm border border-[#ebe2d1] dark:border-[#262c3d]'
                        : 'text-[#786b58] dark:text-[#9e978b] hover:text-[#141312] dark:hover:text-[#f8f5ee]'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  {product.description && (
                    <p className="text-xs text-[#615442] dark:text-[#b8af9f] leading-relaxed">
                      {product.description}
                    </p>
                  )}
                  {product.features && product.features.length > 0 && (
                    <ul className="space-y-2 text-xs text-[#615442] dark:text-[#b8af9f]">
                      {product.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <span className="text-[#c5a059] mt-0.5 text-[10px]">◆</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!product.description && (!product.features || product.features.length === 0) && (
                    <p className="text-xs text-[#a09585] dark:text-[#6e778b] italic">
                      No additional details available.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'specs' && (
                <div>
                  {product.specifications && Object.keys(product.specifications).length > 0 ? (
                    <div className="rounded-2xl border border-[#ebe2d1] dark:border-[#262c3d] overflow-hidden text-xs">
                      <table className="min-w-full divide-y divide-[#ebe2d1] dark:divide-[#262c3d]">
                        <tbody className="divide-y divide-[#ebe2d1] dark:divide-[#262c3d] bg-white dark:bg-[#12151f]">
                          {Object.entries(product.specifications).map(([key, value]) => (
                            <tr key={key} className="even:bg-[#fdfcf9] dark:even:bg-[#161a25]">
                              <td className="px-4 py-2.5 font-semibold text-[#786b58] dark:text-[#a09a8e] w-2/5 text-[11px] uppercase tracking-wider">
                                {key}
                              </td>
                              <td className="px-4 py-2.5 text-[#141312] dark:text-[#f8f5ee]">
                                {value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-xs text-[#a09585] dark:text-[#6e778b] italic">
                      No specifications listed.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'delivery' && (
                <DeliveryInfoCard deliveryInfo={product.deliveryInfo} isOutOfStock={isOutOfStock} />
              )}
            </div>

            {/* Trust Badges Row */}
            <div className="grid grid-cols-3 gap-2 border-t border-[#f0eae0] dark:border-[#1e2433] pt-4">
              {[
                { icon: <Lock size={14} className="text-[#c5a059]" />, text: 'Secure Checkout' },
                { icon: <RotateCcw size={14} className="text-[#c5a059]" />, text: '30-Day Returns' },
                { icon: <ShieldCheck size={14} className="text-[#c5a059]" />, text: 'Authenticity Cert.' },
              ].map((badge) => (
                <div key={badge.text} className="flex flex-col items-center gap-1.5 text-center px-2 py-2.5 rounded-xl border border-[#ebe2d1] dark:border-[#1e2433] bg-[#fbfaf8] dark:bg-[#161a25]">
                  {badge.icon}
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-[#786b58] dark:text-[#9e978b] leading-tight">
                    {badge.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Col 3: Buy Box (3 cols) ──────────────────────────────────── */}
          <div className="lg:col-span-3">
            <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/98 dark:bg-[#12151f]/98 backdrop-blur-xl p-5 sm:p-6 shadow-[0_15px_40px_rgba(26,23,20,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-4 sticky top-24">

              {/* Price Summary */}
              <div className="pb-3 border-b border-[#f0eae0] dark:border-[#1e2433]">
                <p className="text-[10px] uppercase font-semibold tracking-widest text-[#9b8353] dark:text-[#d6be90] mb-1.5">
                  Your Price
                </p>
                <PriceDisplay price={currentPrice} size="lg" showDiscount={false} />
                {discount && (
                  <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    You save {discount}%
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <StockBadge stock={currentStock} status={product.status} />

              {/* Quantity Selector */}
              {!isOutOfStock && (
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#786b58] dark:text-[#a89c89]">
                    Quantity
                  </span>
                  <div className="flex items-center gap-2 rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] overflow-hidden">
                    <button
                      type="button"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-[#786b58] dark:text-[#a09a8e] hover:text-[#c5a059] hover:bg-[#f6efe1] dark:hover:bg-[#1a1810] disabled:opacity-30 transition-all cursor-pointer"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-[#141312] dark:text-[#f8f5ee]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      disabled={quantity >= maxAvailableQty}
                      onClick={() => setQuantity((q) => Math.min(maxAvailableQty, q + 1))}
                      className="px-3 py-1.5 text-[#786b58] dark:text-[#a09a8e] hover:text-[#c5a059] hover:bg-[#f6efe1] dark:hover:bg-[#1a1810] disabled:opacity-30 transition-all cursor-pointer"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-col gap-2.5 pt-1">
                {/* Buy Now — Primary Gold CTA */}
                <button
                  id="buy-now-btn"
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-sans text-[11px] uppercase tracking-[0.18em] font-bold text-[#0d0a06] bg-gradient-to-r from-[#c5a059] via-[#d6be90] to-[#b89548] hover:brightness-105 active:scale-[0.99] transition-all shadow-[0_4px_16px_rgba(197,160,89,0.3)] hover:shadow-[0_6px_22px_rgba(197,160,89,0.45)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Gem size={14} />
                  <span>{isOutOfStock ? 'Out of Stock' : 'Buy Now'}</span>
                </button>

                {/* Add to Bag — Secondary outline */}
                <button
                  id="add-to-cart-btn"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl font-sans text-[11px] uppercase tracking-[0.18em] font-semibold text-[#141312] dark:text-[#f8f5ee] bg-white dark:bg-[#1c2230] border border-[#c5a059]/60 dark:border-[#c5a059]/40 hover:border-[#c5a059] hover:bg-[#fdf6e8] dark:hover:bg-[#1e2030] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ShoppingBag size={14} />
                  <span>{isOutOfStock ? 'Unavailable' : 'Add to Bag'}</span>
                </button>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={handleToggleWishlist}
                  className={`w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-sans text-[11px] uppercase tracking-wider font-semibold transition-all cursor-pointer border ${
                    isWishlisted
                      ? 'border-[#c5a059]/50 bg-[#fdf6e8] dark:bg-[#1a1810] text-[#c5a059]'
                      : 'border-[#ebe2d1] dark:border-[#262c3d] bg-transparent text-[#786b58] dark:text-[#9e978b] hover:text-[#c5a059] hover:border-[#c5a059]/50'
                  }`}
                >
                  <Heart size={13} className={isWishlisted ? 'fill-[#c5a059]' : ''} />
                  {isWishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
                </button>
              </div>

              {/* Delivery Summary */}
              <div className="border-t border-[#f0eae0] dark:border-[#1e2433] pt-3 space-y-2 text-xs text-[#786b58] dark:text-[#a09a8e]">
                <div className="flex items-start gap-2">
                  <Truck size={13} className="text-[#c5a059] mt-0.5 shrink-0" />
                  <span>Free white-glove delivery on orders over $99</span>
                </div>
                <div className="flex items-start gap-2">
                  <RotateCcw size={13} className="text-[#c5a059] mt-0.5 shrink-0" />
                  <span>Easy 30-day returns &amp; exchanges</span>
                </div>
                <div className="flex items-start gap-2">
                  <Award size={13} className="text-[#c5a059] mt-0.5 shrink-0" />
                  <span>
                    Certified by{' '}
                    <strong className="text-[#141312] dark:text-[#f8f5ee]">Valenza Maison</strong>
                  </span>
                </div>
              </div>

              {/* Seller Info */}
              {product.sellerName && (
                <div className="rounded-xl bg-[#fdf9f4] dark:bg-[#161a25] border border-[#ebe2d1] dark:border-[#262c3d] px-3 py-2.5 text-xs">
                  <p className="text-[10px] uppercase tracking-wider text-[#9b8353] dark:text-[#d6be90] mb-0.5 font-semibold">
                    Sold by
                  </p>
                  <p className="font-semibold text-[#141312] dark:text-[#f8f5ee]">{product.sellerName}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Frequently Bought Together ─────────────────────────────────── */}
        <div className="mt-16">
          <FrequentlyBoughtTogether
            currentProduct={product}
            currentPrice={currentPrice}
            onRequireAuth={() => {
              showToast('Please sign in to add bundles to your bag.', 'warn');
              setTimeout(() => router.push(`/auth/sign-in?redirect=/product/${slug}`), 1200);
            }}
          />
        </div>

        {/* ── Related Products ───────────────────────────────────────────── */}
        <div className="mt-16">
          <RelatedProducts
            product={product}
            category={product.category}
            currentProductId={product.id}
          />
        </div>

        {/* ── Q&A Section ────────────────────────────────────────────────── */}
        <div className="mt-16">
          <ProductQA productId={product.id} productTitle={product.title} />
        </div>

        {/* ── Customer Reviews ───────────────────────────────────────────── */}
        <div className="mt-16" id="reviews-section">
          <CustomerReviews
            productId={product.id}
            productTitle={product.title}
            rating={product.rating}
            reviewCount={product.reviewCount}
            onRatingUpdated={(newRating, newCount) => {
              setProduct((prev) =>
                prev ? { ...prev, rating: newRating, reviewCount: newCount } : null,
              );
            }}
          />
        </div>
      </div>

      {/* ── Mobile Sticky Buy Bar ──────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/96 dark:bg-[#12151f]/96 backdrop-blur-md border-t border-[#ebe2d1] dark:border-[#262c3d] px-4 py-3 lg:hidden flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-[#786b58] dark:text-[#a09a8e] line-clamp-1 max-w-[130px] font-medium">
            {product.title}
          </span>
          <span className="text-sm font-serif font-semibold text-[#141312] dark:text-[#f8f5ee]">
            ${currentPrice.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="text-[11px] uppercase tracking-wider font-semibold px-4 py-2.5 rounded-xl border border-[#c5a059]/60 text-[#141312] dark:text-[#f8f5ee] bg-white dark:bg-[#1c2230] cursor-pointer disabled:opacity-50"
          >
            Add to Bag
          </button>
          <button
            disabled={isOutOfStock}
            onClick={handleBuyNow}
            className="text-[11px] uppercase tracking-wider font-bold px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#b89548] text-[#0d0a06] cursor-pointer disabled:opacity-50 shadow-[0_2px_10px_rgba(197,160,89,0.35)]"
          >
            Buy Now
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
