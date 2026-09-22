'use client';
// ============================================================================
// Amazon Clone — Home Page
// Hero slideshow (home1.png) + Multi-quadrant category cards (home2.png) + Live Catalog
// ============================================================================
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { HeroSlideshow } from '@/components/home/HeroSlideshow';
import { QuadrantCategoryGrid } from '@/components/home/QuadrantCategoryGrid';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { fetchProducts } from '@/services/productService';
import type { Product } from '@/types';

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      setLoading(true);
      try {
        const prodRes = await fetchProducts();
        if (!isMounted) return;
        if (prodRes.success && prodRes.data) {
          setProducts(prodRes.data);
        }
      } catch (err) {
        console.error('[HomePage] failed to load catalog:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const featuredTech = products
    .filter((p) => p.category === 'electronics' || p.category === 'computers')
    .slice(0, 4);
  const trendingDeals = products
    .filter((p) => (p.discountPercent ?? 0) > 10 || p.isPrimeEligible)
    .slice(0, 4);

  return (
    <MainLayout>
      <div className="bg-[#eaeded] min-h-screen pb-16">
        <div className="mx-auto max-w-screen-2xl px-3 sm:px-4 pt-3 sm:pt-4">
          {/* ── 1. Hero Slideshow (matching home1.png) ── */}
          <HeroSlideshow />

          {/* ── 2. Quadrant Category Grid (matching home2.png) ── */}
          <QuadrantCategoryGrid />

          {/* ── 3. Today's Best Sellers ── */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs mb-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900">
                  Today&apos;s Best Sellers
                </h2>
                <p className="text-xs text-gray-500">
                  Top customer favorites and highest-rated products
                </p>
              </div>
              <Link
                href="/category/electronics"
                className="text-xs font-bold text-amazon-link hover:underline hover:text-amazon-link-hover"
              >
                See all &rarr;
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                {bestSellers.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

          {/* ── 4. Featured Tech & Workstation Essentials ── */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs mb-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-gray-900">
                  Featured Tech &amp; Workstation Essentials
                </h2>
                <p className="text-xs text-gray-500">
                  High-performance computing, audio gear, and peripherals
                </p>
              </div>
              <Link
                href="/category/computers"
                className="text-xs font-bold text-amazon-link hover:underline hover:text-amazon-link-hover"
              >
                Explore Computers &rarr;
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                {featuredTech.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

          {/* ── 5. Trending Deals & Customer Favorites ── */}
          {trendingDeals.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-xs mb-8">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-gray-900">
                    Trending Deals &amp; Prime Picks
                  </h2>
                  <p className="text-xs text-gray-500">
                    Discounted merchandise with lightning-fast delivery
                  </p>
                </div>
                <Link
                  href="/deals"
                  className="text-xs font-bold text-amazon-link hover:underline hover:text-amazon-link-hover"
                >
                  View all deals &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                {trendingDeals.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
