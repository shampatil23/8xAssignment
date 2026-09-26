'use client';
// ============================================================================
// Category Products Page — /category/[slug]
// Valenza Maison Haute Horlogerie, Joaillerie & Living Salons
// ============================================================================
import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ChevronRight, Gem, ChevronDown } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductCard } from '@/components/product/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { fetchCategoryBySlug } from '@/services/categoryService';
import { fetchProducts } from '@/services/productService';
import type { Category, Product } from '@/types';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: PageProps) {
  const { slug } = use(params);

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [catRes, prodRes] = await Promise.all([
          fetchCategoryBySlug(slug),
          fetchProducts({ category: slug }),
        ]);

        if (!isMounted) return;

        if (catRes.success && catRes.data) {
          setCategory(catRes.data);
        } else {
          // Generate readable title from slug as fallback
          const formattedName = slug
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          setCategory({
            id: `cat-${slug}`,
            name: formattedName,
            slug,
          });
        }

        if (prodRes.success && prodRes.data) {
          setProducts(prodRes.data);
        } else {
          setError(prodRes.error ?? 'Failed to load products');
        }
      } catch (err) {
        if (isMounted) setError((err as Error).message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Apply in-memory sort and stock filtering
  const displayedProducts = products
    .filter((p) => (!inStockOnly ? true : p.stock > 0 && p.status === 'active'))
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // 'featured' keeps original order
    });

  return (
    <MainLayout>
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 py-6 sm:py-8 text-[#141312] dark:text-[#f8f5ee]">
        {/* ── Breadcrumb ── */}
        <div className="text-[11px] uppercase tracking-[0.16em] font-medium text-[#786b58] dark:text-[#9e978b] mb-4 flex items-center gap-2">
          <Link href="/" className="hover:text-[#c5a059] dark:hover:text-[#d6be90] transition-colors">
            Maison
          </Link>
          <span className="text-[#dfd6c5] dark:text-[#2c3242]">◆</span>
          <span className="text-[#141312] dark:text-[#f8f5ee] font-semibold">Salons</span>
          <span className="text-[#dfd6c5] dark:text-[#2c3242]">◆</span>
          <span className="text-[#8a6827] dark:text-[#dfba73]">
            {category?.name || slug}
          </span>
        </div>

        {/* ── Category Header Banner ── */}
        <div className="mb-8 rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 backdrop-blur-xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(26,23,20,0.03)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-[0.25em] text-[#9b8353] dark:text-[#d6be90] block mb-1.5 flex items-center gap-1.5">
                <Gem size={11} className="text-[#c5a059]" />
                Maison Salon Exhibition
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-[#141312] dark:text-[#f8f5ee]">
                {category?.name || slug}
              </h1>
              {category?.description && (
                <p className="mt-1.5 text-xs sm:text-sm text-[#786b58] dark:text-[#9e978b] max-w-2xl leading-relaxed">
                  {category.description}
                </p>
              )}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#8a7b68] dark:text-[#8e98ac] shrink-0">
              {loading
                ? 'Allocating catalog...'
                : `${displayedProducts.length} ${displayedProducts.length === 1 ? 'Masterpiece' : 'Masterpieces'}`}
            </div>
          </div>

          {/* ── Quick Filter Bar ── */}
          <div className="mt-6 pt-5 flex flex-wrap items-center justify-between gap-4 border-t border-[#f0eae0] dark:border-[#1e2433]">
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold uppercase tracking-wider text-[#6e6353] dark:text-[#a0a6b5] select-none hover:text-[#141312] dark:hover:text-[#f8f5ee] transition-colors">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-[#dfd6c5] dark:border-[#383e50] text-[#c5a059] focus:ring-[#c5a059] h-3.5 w-3.5 cursor-pointer accent-[#c5a059]"
                />
                <span>Private Vault In Stock</span>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#8a7b68] dark:text-[#8e98ac] hidden sm:inline">
                Sort:
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="appearance-none rounded-xl border border-[#ebe2d1] dark:border-[#2f384d] bg-[#fbfaf8] dark:bg-[#161a25] pl-3.5 pr-8 py-2 text-xs font-semibold text-[#141312] dark:text-[#f8f5ee] focus:outline-none focus:border-[#c5a059] dark:focus:border-[#dfba73] cursor-pointer shadow-xs transition-all"
                >
                  <option value="featured">Maison Featured</option>
                  <option value="price-asc">Valuation: Low to High</option>
                  <option value="price-desc">Valuation: High to Low</option>
                  <option value="rating">Client Appraisals</option>
                </select>
                <ChevronDown
                  size={13}
                  className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a7b68] dark:text-[#8e98ac]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Products Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="Unable to load salon products"
            description={error}
            actionLabel="Try Again"
            onAction={() => window.location.reload()}
          />
        ) : displayedProducts.length === 0 ? (
          <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 p-12 text-center shadow-sm">
            <span className="text-[10px] uppercase font-semibold tracking-[0.25em] text-[#9b8353] dark:text-[#d6be90] block mb-1">
              Salon Reserve
            </span>
            <h2 className="font-serif text-xl sm:text-2xl font-light text-[#141312] dark:text-[#f8f5ee] mb-2">
              No Pieces Currently Available
            </h2>
            <p className="text-xs sm:text-sm text-[#786b58] dark:text-[#9e978b] max-w-md mx-auto mb-6">
              We couldn&apos;t find any active allocations matching your selected filter criteria.
            </p>
            <button
              type="button"
              onClick={() => {
                setInStockOnly(false);
                setSortBy('featured');
              }}
              className="px-6 py-3 rounded-xl font-sans text-xs uppercase tracking-[0.16em] font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] via-[#d6be90] to-[#b89548] hover:brightness-105 shadow-md cursor-pointer transition-all"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {displayedProducts.map((product, idx) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={idx < 4}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

