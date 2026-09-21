'use client';
// ============================================================================
// Product Details Page (PDP) — /product/[slug]
// Amazon 3-column layout: Gallery | Core Information & Variants | Buy Box
// ============================================================================
import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Truck,
  Lock,
  MapPin,
  Check,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductGallery } from '@/components/product/ProductGallery';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { ProductRating } from '@/components/product/ProductRating';
import { StockBadge } from '@/components/product/StockBadge';
import { VariantSelector } from '@/components/product/VariantSelector';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { fetchProductBySlug } from '@/services/productService';
import type { Product, ProductVariant } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  const { slug } = use(params);

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            setSelectedVariant(res.data.variants[0]);
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

  // Derived price and stock based on variant selection
  const currentPrice = selectedVariant?.price ?? product?.price ?? 0;
  const currentComparePrice =
    selectedVariant?.compareAtPrice ?? product?.compareAtPrice;
  const currentStock = selectedVariant?.stock ?? product?.stock ?? 0;
  const isOutOfStock =
    product?.status === 'out_of_stock' || currentStock <= 0;

  if (loading) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-screen-2xl px-4 py-8 animate-pulse">
          <div className="h-4 w-48 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 h-[450px] bg-gray-200 rounded-lg" />
            <div className="lg:col-span-4 space-y-4">
              <div className="h-8 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-1/3 bg-gray-200 rounded" />
              <div className="h-10 w-1/2 bg-gray-200 rounded" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>
            <div className="lg:col-span-3 h-[350px] bg-gray-200 rounded-lg" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !product) {
    return (
      <MainLayout>
        <div className="mx-auto max-w-screen-xl px-4 py-16">
          <EmptyState
            title="Looking for something?"
            description="We're sorry. The web address you entered is not a functioning page on our site."
            actionLabel="Return to Home"
            onAction={() => (window.location.href = '/')}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-screen-2xl px-4 py-6">
        {/* ── Breadcrumb ── */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-gray-500"
        >
          <Link href="/" className="hover:text-amazon-link hover:underline">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link
            href={`/category/${product.category}`}
            className="hover:text-amazon-link hover:underline capitalize"
          >
            {product.categoryName || product.category}
          </Link>
          <ChevronRight size={12} />
          <span className="line-clamp-1 max-w-xs sm:max-w-md font-medium text-gray-700">
            {product.title}
          </span>
        </nav>

        {/* ── 3-Column Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ── Col 1: Product Gallery (5 cols) ── */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <ProductGallery
              images={product.images}
              title={product.title}
            />
          </div>

          {/* ── Col 2: Product Core Information (4 cols) ── */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Brand */}
            {product.brand && (
              <div className="text-xs font-semibold text-amazon-link hover:underline cursor-pointer">
                Brand: {product.brand}
              </div>
            )}

            {/* Title */}
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 leading-snug">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 border-b pb-3">
              <ProductRating
                rating={product.rating}
                reviewCount={product.reviewCount}
                size="md"
              />
            </div>

            {/* Price section */}
            <div className="border-b pb-4">
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

            {/* Variant Selector */}
            {product.variants && product.variants.length > 0 && (
              <div className="border-b pb-4">
                <VariantSelector
                  variants={product.variants}
                  selectedVariantId={selectedVariant?.id}
                  onSelectVariant={(variant) => setSelectedVariant(variant)}
                />
              </div>
            )}

            {/* Key Features ("About this item") */}
            {product.features && product.features.length > 0 && (
              <div className="border-b pb-4">
                <h2 className="text-sm font-bold text-gray-900 mb-2">
                  About this item
                </h2>
                <ul className="list-disc list-outside ml-4 space-y-1 text-xs text-gray-700 leading-relaxed">
                  {product.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
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
            <div className="rounded-lg border border-gray-300 bg-white p-5 shadow-sm flex flex-col gap-4">
              {/* Buy box price */}
              <div>
                <PriceDisplay price={currentPrice} size="lg" showDiscount={false} />
              </div>

              {/* Delivery info */}
              {!isOutOfStock && product.deliveryInfo && (
                <div className="text-xs text-gray-700 flex flex-col gap-1 border-b pb-3">
                  <div className="flex items-start gap-1.5">
                    <Truck size={16} className="text-amazon-orange flex-shrink-0 mt-0.5" />
                    <div>
                      <p>
                        <span className="font-bold">
                          {product.deliveryInfo.isFreeDelivery
                            ? 'FREE delivery '
                            : 'Standard delivery '}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {product.deliveryInfo.fastestDeliveryDate}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-gray-500 mt-1">
                    <MapPin size={13} />
                    <span>Deliver to India</span>
                  </div>
                </div>
              )}

              {/* Stock Status */}
              <div>
                <StockBadge stock={currentStock} status={product.status} />
              </div>

              {/* Quantity selector (only when in stock) */}
              {!isOutOfStock && (
                <div className="flex items-center gap-2">
                  <label htmlFor="qty-select" className="text-xs font-semibold text-gray-700">
                    Quantity:
                  </label>
                  <select
                    id="qty-select"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="rounded border border-gray-300 bg-gray-50 px-2 py-1 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-amazon-orange cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5].slice(0, Math.min(5, currentStock)).map((q) => (
                      <option key={q} value={q}>
                        {q}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-1">
                <Button
                  id="add-to-cart-btn"
                  variant="cart"
                  fullWidth
                  disabled={isOutOfStock}
                  onClick={() => {
                    alert(`Added ${quantity} x "${product.title}" to cart! (Cart feature active in Phase 4)`);
                  }}
                >
                  {isOutOfStock ? 'Currently Unavailable' : 'Add to Cart'}
                </Button>

                <Button
                  id="buy-now-btn"
                  variant="buy-now"
                  fullWidth
                  disabled={isOutOfStock}
                  onClick={() => {
                    alert('Proceeding to buy now! (Checkout feature active in Phase 5)');
                  }}
                >
                  Buy Now
                </Button>
              </div>

              {/* Trust signals & Seller info */}
              <div className="border-t pt-3 flex flex-col gap-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Lock size={14} className="text-gray-400" />
                  <span>Secure transaction</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={14} className="text-gray-400" />
                  <span>
                    Ships from{' '}
                    <strong className="text-gray-900">Amazon Clone</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={14} className="text-gray-400" />
                  <span>30-day return policy</span>
                </div>
                <div className="mt-1 text-[11px] text-gray-500">
                  Sold by{' '}
                  <span className="text-amazon-link hover:underline cursor-pointer font-medium">
                    {product.seller?.name || product.sellerName || 'Amazon Clone Direct'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
