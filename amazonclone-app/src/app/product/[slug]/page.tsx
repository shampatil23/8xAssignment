'use client';
// ============================================================================
// Product Details Page (PDP) — /product/[slug]
// Amazon 3-Column Experience + Mobile Sticky Bar + Full Feature Integration
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
  ShoppingCart,
  Zap,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductGallery } from '@/components/product/ProductGallery';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { ProductRating } from '@/components/product/ProductRating';
import { StockBadge } from '@/components/product/StockBadge';
import { VariantSelector } from '@/components/product/VariantSelector';
import { DeliveryInfoCard } from '@/components/product/DeliveryInfoCard';
import { OffersCard } from '@/components/product/OffersCard';
import { FrequentlyBoughtTogether } from '@/components/product/FrequentlyBoughtTogether';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { CustomerReviews } from '@/components/product/CustomerReviews';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/hooks/useWishlist';
import { fetchProductBySlug } from '@/services/productService';
import type { Product, ProductVariant } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

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

  // Interaction feedback states
  const [cartSuccessMessage, setCartSuccessMessage] = useState<string | null>(null);
  const [authPromptMessage, setAuthPromptMessage] = useState<string | null>(null);
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
          // Set initial variant if present
          if (res.data.variants && res.data.variants.length > 0) {
            // Pick first in-stock variant, or default to first
            const defaultVar =
              res.data.variants.find((v) => v.stock > 0) || res.data.variants[0];
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
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Derived state
  const currentPrice = selectedVariant?.price ?? product?.price ?? 0;
  const currentComparePrice =
    selectedVariant?.compareAtPrice ?? product?.compareAtPrice;
  const currentStock = selectedVariant ? selectedVariant.stock : (product?.stock ?? 0);
  const isOutOfStock =
    product?.status === 'out_of_stock' || currentStock <= 0;
  const maxAvailableQty = Math.max(1, Math.min(10, currentStock));

  // Reset quantity if current selected qty exceeds newly selected variant stock
  useEffect(() => {
    if (quantity > maxAvailableQty && maxAvailableQty > 0) {
      setQuantity(maxAvailableQty);
    }
  }, [maxAvailableQty, quantity]);

  // Handle Add to Cart with Auth state check
  const handleAddToCart = () => {
    if (!user) {
      setAuthPromptMessage('Please sign in to add items to your cart.');
      setTimeout(() => {
        router.push(`/auth/sign-in?redirect=/product/${slug}`);
      }, 1200);
      return;
    }

    if (!product || isOutOfStock) return;

    addItem(product, selectedVariant, quantity);
    setCartSuccessMessage(`Added ${quantity} x "${product.title}" to your cart!`);
    setTimeout(() => setCartSuccessMessage(null), 4000);
  };

  // Handle Buy Now with Auth state check
  const handleBuyNow = () => {
    if (!user) {
      setAuthPromptMessage('Please sign in to proceed with direct checkout.');
      setTimeout(() => {
        router.push(`/auth/sign-in?redirect=/product/${slug}`);
      }, 1200);
      return;
    }

    if (!product || isOutOfStock) return;

    addItem(product, selectedVariant, quantity);
    router.push('/checkout');
  };

  // Wishlist handler
  const handleToggleWishlist = async () => {
    if (!user) {
      setAuthPromptMessage('Please sign in to save items to your Wishlist.');
      setTimeout(() => {
        router.push(`/auth/sign-in?redirect=/product/${slug}`);
      }, 1200);
      return;
    }

    if (!product) return;
    const added = await toggleWishlist(product);
    setCartSuccessMessage(
      added
        ? `Added "${product.title}" to your Wishlist!`
        : `Removed "${product.title}" from your Wishlist.`,
    );
    setTimeout(() => setCartSuccessMessage(null), 3000);
  };

  // Share handler
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // ── Loading Skeleton ──
  if (loading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-screen-2xl px-4 py-8 animate-pulse">
          <div className="h-4 w-48 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 h-[460px] bg-gray-200 rounded-lg" />
            <div className="lg:col-span-4 space-y-4">
              <div className="h-8 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-1/3 bg-gray-200 rounded" />
              <div className="h-10 w-1/2 bg-gray-200 rounded" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
            <div className="lg:col-span-3 h-[380px] bg-gray-200 rounded-lg" />
          </div>
        </div>
      </MainLayout>
    );
  }

  // ── Not Found / Error State ──
  if (error || !product) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-screen-xl px-4 py-16">
          <EmptyState
            title="Looking for something?"
            description="We're sorry. The web address you entered does not match an active product on our site."
            actionLabel="Return to Home"
            onAction={() => router.push('/')}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-screen-2xl px-4 py-4 sm:py-6 pb-24 lg:pb-12">
        {/* ── Toast Notifications ── */}
        {cartSuccessMessage && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-lg bg-green-700 px-4 py-3 text-sm font-semibold text-white shadow-xl transition-all animate-bounce">
            <Check size={18} strokeWidth={3} />
            <span>{cartSuccessMessage}</span>
          </div>
        )}

        {authPromptMessage && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-xl transition-all">
            <AlertTriangle size={18} />
            <span>{authPromptMessage}</span>
          </div>
        )}

        {/* ── Breadcrumb & Top Utilities ── */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500"
          >
            <Link href="/" className="hover:text-amazon-link hover:underline">
              Home
            </Link>
            <ChevronRight size={12} />
            <Link
              href={`/search?category=${encodeURIComponent(product.category)}`}
              className="hover:text-amazon-link hover:underline capitalize"
            >
              {product.categoryName || product.category}
            </Link>
            <ChevronRight size={12} />
            <span className="line-clamp-1 max-w-xs sm:max-w-md font-medium text-gray-700">
              {product.title}
            </span>
          </nav>

          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1 text-gray-600 hover:text-amazon-link cursor-pointer"
              title="Share product link"
            >
              <Share2 size={14} />
              <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
            </button>
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`flex items-center gap-1 cursor-pointer transition-colors ${
                isWishlisted
                  ? 'text-red-600 font-bold'
                  : 'text-gray-600 hover:text-red-600'
              }`}
              title="Add to Wishlist"
            >
              <Heart
                size={14}
                className={isWishlisted ? 'fill-red-600' : ''}
              />
              <span>{isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>
        </div>

        {/* ── 3-Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Col 1: Product Gallery (5 cols) ── */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <ProductGallery
              images={product.images}
              title={product.title}
              activeImageOverride={selectedVariant?.image}
            />
          </div>

          {/* ── Col 2: Product Core Information & Variants (4 cols) ── */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Brand */}
            {product.brand && (
              <div className="text-xs font-semibold text-amazon-link hover:underline cursor-pointer">
                Brand: {product.brand}
              </div>
            )}

            {/* Title */}
            <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 leading-snug">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
              <ProductRating
                rating={product.rating}
                reviewCount={product.reviewCount}
                size="md"
              />
            </div>

            {/* Price & Discount */}
            <div className="border-b border-gray-100 pb-4">
              <PriceDisplay
                price={currentPrice}
                compareAtPrice={currentComparePrice}
                size="xl"
              />

              {product.isPrimeEligible && !isOutOfStock && (
                <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-700">
                  <span className="inline-flex items-center gap-0.5 rounded bg-[#00a8e1] px-1.5 py-0.5 font-extrabold italic text-white text-[11px]">
                    <Check size={12} strokeWidth={3} /> prime
                  </span>
                  <span>Free Returns &amp; Fast Delivery</span>
                </div>
              )}
            </div>

            {/* Available Offers Carousel / Cards */}
            <OffersCard price={currentPrice} />

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="border-b border-gray-100 pb-4">
                <VariantSelector
                  variants={product.variants}
                  selectedVariantId={selectedVariant?.id}
                  onSelectVariant={(variant) => {
                    setSelectedVariant(variant);
                  }}
                />
              </div>
            )}

            {/* Key Features ("About this item") */}
            {product.features && product.features.length > 0 && (
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-sm font-bold text-gray-900 mb-2">
                  About this item
                </h2>
                <ul className="list-disc list-outside ml-4 space-y-1.5 text-xs text-gray-700 leading-relaxed">
                  {product.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-sm font-bold text-gray-900 mb-2">
                  Product Description
                </h2>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Specifications Table */}
            {product.specifications &&
              Object.keys(product.specifications).length > 0 && (
                <div>
                  <h2 className="text-sm font-bold text-gray-900 mb-2">
                    Product Specifications
                  </h2>
                  <div className="rounded border border-gray-200 overflow-hidden text-xs">
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="divide-y divide-gray-200 bg-white">
                        {Object.entries(product.specifications).map(
                          ([key, value]) => (
                            <tr key={key} className="even:bg-gray-50">
                              <td className="px-3 py-2 font-semibold text-gray-600 w-1/3">
                                {key}
                              </td>
                              <td className="px-3 py-2 text-gray-900">
                                {value}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
          </div>

          {/* ── Col 3: Buy Box (3 cols) ── */}
          <div className="lg:col-span-3">
            <div className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm flex flex-col gap-4 sticky top-24">
              {/* Buy box price */}
              <div>
                <PriceDisplay price={currentPrice} size="lg" showDiscount={false} />
              </div>

              {/* Delivery Info Component */}
              <DeliveryInfoCard
                deliveryInfo={product.deliveryInfo}
                isOutOfStock={isOutOfStock}
              />

              {/* Stock Status */}
              <div>
                <StockBadge stock={currentStock} status={product.status} />
              </div>

              {/* Quantity selector (capped by currentStock) */}
              {!isOutOfStock && (
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="qty-select"
                    className="text-xs font-semibold text-gray-700"
                  >
                    Quantity:
                  </label>
                  <select
                    id="qty-select"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="rounded border border-gray-300 bg-gray-50 px-2 py-1 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-amazon-orange cursor-pointer"
                  >
                    {Array.from({ length: maxAvailableQty }, (_, i) => i + 1).map(
                      (q) => (
                        <option key={q} value={q}>
                          {q}
                        </option>
                      )
                    )}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-1">
                <Button
                  id="add-to-cart-btn"
                  variant="cart"
                  fullWidth
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={16} />
                  <span>
                    {isOutOfStock ? 'Currently Unavailable' : 'Add to Cart'}
                  </span>
                </Button>

                <Button
                  id="buy-now-btn"
                  variant="buy-now"
                  fullWidth
                  disabled={isOutOfStock}
                  onClick={handleBuyNow}
                  className="flex items-center justify-center gap-2"
                >
                  <Zap size={16} />
                  <span>Buy Now</span>
                </Button>
              </div>

              {/* Trust Signals & Seller Info */}
              <div className="border-t border-gray-100 pt-3 flex flex-col gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-gray-400" />
                  <span>Secure transaction</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-gray-400" />
                  <span>
                    Ships from{' '}
                    <strong className="text-gray-900">Amazon Clone Direct</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={14} className="text-gray-400" />
                  <span>30-day return policy</span>
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  Sold by{' '}
                  <span className="text-amazon-link hover:underline cursor-pointer font-medium">
                    {product.seller?.name || product.sellerName || 'Amazon Certified Seller'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Frequently Bought Together Section ── */}
        <div className="mt-12">
          <FrequentlyBoughtTogether
            currentProduct={product}
            currentPrice={currentPrice}
            onRequireAuth={() => {
              setAuthPromptMessage('Please sign in to add bundles to your cart.');
              setTimeout(() => {
                router.push(`/auth/sign-in?redirect=/product/${slug}`);
              }, 1200);
            }}
          />
        </div>

        {/* ── Related Products Carousel / Grid ── */}
        <div className="mt-12">
          <RelatedProducts
            category={product.category}
            currentProductId={product.id}
          />
        </div>

        {/* ── Customer Reviews Section Foundation ── */}
        <div className="mt-12">
          <CustomerReviews
            productTitle={product.title}
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
        </div>
      </div>

      {/* ── Mobile Sticky Purchase Action Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-300 p-3 lg:hidden flex items-center justify-between gap-3 shadow-2xl">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500 line-clamp-1 max-w-[120px]">
            {product.title}
          </span>
          <span className="text-base font-bold text-[#b12704]">
            ${currentPrice.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <Button
            variant="cart"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className="text-xs px-3 py-2 flex-1 max-w-[140px]"
          >
            {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
          </Button>
          <Button
            variant="buy-now"
            disabled={isOutOfStock}
            onClick={handleBuyNow}
            className="text-xs px-3 py-2 flex-1 max-w-[120px]"
          >
            Buy Now
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
