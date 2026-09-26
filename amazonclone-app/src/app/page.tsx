'use client';
// ============================================================================
// Valenza Haute Maison — Home Page
// Palette: Warm Ivory (#faf9f6), Champagne Gold (#c5a059, #8a6827), Obsidian (#141312)
// Typography: Cinzel / serif for headings, Inter / sans for body text
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
import { ArrowRight, Award, Crown, Gem } from 'lucide-react';

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
      <div className="bg-[#faf9f6] dark:bg-[#0b0c10] min-h-screen text-[#141312] dark:text-[#f5f2eb] pb-24 transition-colors duration-300">

        {/* ── 1. Full-Screen Hero Slideshow ── */}
        <HeroSlideshow />

        {/* ── 2. Main Content Sections ── */}
        <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 pt-10 sm:pt-12">

          {/* ── Section: Curated Ateliers Category Grid ── */}
          <section aria-label="Curated Ateliers by Category">
            {/* Section Header */}
            <div className="flex items-end justify-between mb-6 sm:mb-8">
              <div>
                <p className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9b7832] dark:text-[#c5a059] mb-2 flex items-center gap-2">
                  <span className="inline-block w-5 h-px bg-[#c5a059]" />
                  CURATED ATELIERS
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#141312] dark:text-[#f5f2eb] tracking-tight">
                  Explore by Salon
                </h2>
              </div>
            </div>
            <QuadrantCategoryGrid />
          </section>

          {/* ── Gold Ornament Divider ── */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#c5a059]/30 to-transparent" />
            <div className="flex items-center gap-2 text-[#c5a059]/60">
              <span className="text-xs font-serif">✦</span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#c5a059]/30 to-transparent" />
          </div>

          {/* ── Section: Haute Horlogerie & Masterpieces ── */}
          <section aria-label="Haute Horlogerie & Curated Masterpieces">
            <div className="rounded-2xl sm:rounded-3xl border border-[#ebe4d6] dark:border-[#222030] bg-white dark:bg-[#111520] p-6 sm:p-8 lg:p-10 shadow-[0_4px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.5)]">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-7 sm:mb-9 gap-4 pb-5 border-b border-[#f0e8da] dark:border-[#1e2230]">
                <div>
                  <p className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9b7832] dark:text-[#c5a059] mb-2 flex items-center gap-2">
                    <Gem size={11} className="text-[#c5a059]" />
                    VALENZA SELECTION
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#141312] dark:text-[#f5f2eb] tracking-tight">
                    Haute Horlogerie &amp; Masterpieces
                  </h2>
                  <p className="font-sans text-xs sm:text-sm text-[#766e62] dark:text-[#9096a8] mt-1.5 leading-relaxed">
                    Celebrated Swiss complications, fine gems, and certified private reserves
                  </p>
                </div>
                <Link
                  href="/category/electronics"
                  className="inline-flex items-center gap-2 font-sans text-xs font-semibold text-[#8a6827] dark:text-[#dfba73] hover:text-[#b89047] dark:hover:text-[#f3d08c] uppercase tracking-[0.16em] transition-colors group shrink-0"
                >
                  <span>Explore Salon</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Product Grid — always 4 columns on lg, 2 on sm */}
              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {bestSellers.length > 0
                    ? bestSellers.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))
                    : products.slice(0, 4).map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                </div>
              )}
            </div>
          </section>

          {/* ── Section: Sculptural Acoustics & Precision Optics ── */}
          <section aria-label="Sculptural Acoustics & Precision Optics">
            <div className="rounded-2xl sm:rounded-3xl border border-[#ebe4d6] dark:border-[#222030] bg-white dark:bg-[#111520] p-6 sm:p-8 lg:p-10 shadow-[0_4px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.5)]">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-7 sm:mb-9 gap-4 pb-5 border-b border-[#f0e8da] dark:border-[#1e2230]">
                <div>
                  <p className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9b7832] dark:text-[#c5a059] mb-2 flex items-center gap-2">
                    <Award size={11} className="text-[#c5a059]" />
                    ACOUSTIC &amp; OPTICAL ARTISTRY
                  </p>
                  <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#141312] dark:text-[#f5f2eb] tracking-tight">
                    Sculptural Acoustics &amp; Precision Optics
                  </h2>
                  <p className="font-sans text-xs sm:text-sm text-[#766e62] dark:text-[#9096a8] mt-1.5 leading-relaxed">
                    Handcrafted brass audio drivers, vacuum valve amplifiers, and rangefinder optics
                  </p>
                </div>
                <Link
                  href="/category/computers"
                  className="inline-flex items-center gap-2 font-sans text-xs font-semibold text-[#8a6827] dark:text-[#dfba73] hover:text-[#b89047] dark:hover:text-[#f3d08c] uppercase tracking-[0.16em] transition-colors group shrink-0"
                >
                  <span>Explore Atelier</span>
                  <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {loading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {featuredTech.length > 0
                    ? featuredTech.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))
                    : products.slice(4, 8).map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                </div>
              )}
            </div>
          </section>

          {/* ── Section: Private Concierge Editorial Banner ── */}
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-[#e2d9c8] dark:border-[#26233a] bg-gradient-to-br from-[#fbf8f2] via-[#f6f0e6] to-[#f0e8d8] dark:from-[#13101a] dark:via-[#11131f] dark:to-[#0f101c] p-7 sm:p-10 lg:p-14 shadow-[0_8px_40px_rgba(197,160,89,0.08)] dark:shadow-[0_8px_40px_rgba(0,0,0,0.5)] flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Left Copy */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 dark:bg-[#1f1b2e]/70 border border-[#c5a059]/30 text-[#8a6827] dark:text-[#dfba73] text-[10px] font-sans font-semibold uppercase tracking-[0.24em] mb-4 backdrop-blur-sm">
                <Crown size={12} className="text-[#c5a059]" />
                <span>VALENZA PRIVATE CONCIERGE</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#141312] dark:text-[#f5f2eb] leading-tight mb-3">
                Bespoke Atelier Commission &amp; Private Stylist
              </h3>
              <p className="font-sans text-sm sm:text-base text-[#766e62] dark:text-[#9096a8] leading-relaxed">
                Connect with our master curators in Geneva, Paris, and Milan for bespoke timepieces, private gemstone acquisitions, or tailored wardrobe capsules.
              </p>
            </div>
            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/customer-service"
                className="px-7 py-3.5 rounded-full bg-gradient-to-r from-[#c5a059] via-[#dfba73] to-[#aa8038] hover:brightness-105 text-[#12110f] font-sans font-bold text-xs tracking-[0.18em] uppercase shadow-[0_4px_20px_rgba(197,160,89,0.3)] hover:shadow-[0_8px_30px_rgba(197,160,89,0.45)] transition-all cursor-pointer"
              >
                Request Stylist
              </Link>
              <Link
                href="/about"
                className="px-6 py-3.5 rounded-full bg-white dark:bg-[#1a1930] hover:bg-[#faf7f2] dark:hover:bg-[#22203a] border border-[#dcd4c0] dark:border-[#2e2b40] text-[#141312] dark:text-[#f5f2eb] hover:text-[#8a6827] dark:hover:text-[#dfba73] font-sans font-semibold text-xs tracking-[0.16em] uppercase transition-all shadow-xs cursor-pointer"
              >
                Maison Dossier
              </Link>
            </div>
          </div>

          {/* ── Section: Vault Allocations & Limited Editions ── */}
          {trendingDeals.length > 0 && (
            <section aria-label="Vault Allocations & Limited Editions">
              <div className="rounded-2xl sm:rounded-3xl border border-[#ebe4d6] dark:border-[#222030] bg-white dark:bg-[#111520] p-6 sm:p-8 lg:p-10 shadow-[0_4px_32px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-7 sm:mb-9 gap-4 pb-5 border-b border-[#f0e8da] dark:border-[#1e2230]">
                  <div>
                    <p className="font-sans text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.28em] text-[#9b7832] dark:text-[#c5a059] mb-2 flex items-center gap-2">
                      <Gem size={11} className="text-[#c5a059]" />
                      PRIVATE VAULT ALLOCATIONS
                    </p>
                    <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#141312] dark:text-[#f5f2eb] tracking-tight">
                      Vault Allocations &amp; Limited Editions
                    </h2>
                    <p className="font-sans text-xs sm:text-sm text-[#766e62] dark:text-[#9096a8] mt-1.5 leading-relaxed">
                      Rare millésime vintages, bespoke parures, and exclusive numbered commissions
                    </p>
                  </div>
                  <Link
                    href="/deals"
                    className="inline-flex items-center gap-2 font-sans text-xs font-semibold text-[#8a6827] dark:text-[#dfba73] hover:text-[#b89047] dark:hover:text-[#f3d08c] uppercase tracking-[0.16em] transition-colors group shrink-0"
                  >
                    <span>Explore Vault</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                  {trendingDeals.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Footer Ornament ── */}
          <div className="flex items-center gap-4 pb-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#c5a059]/20 to-transparent" />
            <span className="font-serif text-[10px] tracking-[0.4em] uppercase text-[#c5a059]/40">VALENZA</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[#c5a059]/20 to-transparent" />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
