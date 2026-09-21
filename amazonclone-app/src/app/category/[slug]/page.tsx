'use client';
// ============================================================================
// Category Products Page — /category/[slug]
// ============================================================================
import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ChevronRight, Filter, SlidersHorizontal } from 'lucide-react';
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
      <div className="mx-auto max-w-screen-2xl px-4 py-6">
        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-xs text-gray-500">
          <Link href="/" className="hover:text-amazon-link hover:underline">
            Home
          </Link>
          <ChevronRight size={12} />
          <span className="font-semibold text-gray-800">
            {category?.name || slug}
          </span>
        </nav>

        {/* ── Category Header Banner ── */}
        <div className="mb-6 rounded-lg bg-white border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {category?.name || slug}
              </h1>
              {category?.description && (
                <p className="mt-1.5 text-sm text-gray-600 max-w-2xl">
                  {category.description}
                </p>
              )}
            </div>
            <div className="text-xs text-gray-500 font-medium whitespace-nowrap">
              {loading
                ? 'Loading results...'
                : `${displayedProducts.length} ${displayedProducts.length === 1 ? 'result' : 'results'}`}
            </div>
          </div>

          {/* ── Quick Filter Bar ── */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="rounded border-gray-300 text-amazon-orange focus:ring-amazon-orange h-4 w-4"
                />
                In Stock Only
              </label>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-amazon-orange cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Avg. Customer Review</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Products Grid ── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="Unable to load products"
            description={error}
            actionLabel="Try Again"
            onAction={() => window.location.reload()}
          />
        ) : displayedProducts.length === 0 ? (
          <EmptyState
            title="No products found in this category"
            description="We couldn't find any products matching your selected criteria."
            actionLabel="View All Products"
            onAction={() => {
              setInStockOnly(false);
              setSortBy('featured');
            }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
