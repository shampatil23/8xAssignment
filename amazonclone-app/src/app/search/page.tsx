'use client';
// ============================================================================
// Search Results Page — /search
// ============================================================================
import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  SearchX,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { SearchFilters } from '@/components/search/SearchFilters';
import { MobileFilterDrawer } from '@/components/search/MobileFilterDrawer';
import {
  searchProducts,
  type SearchParams,
  type SearchResultData,
  type SearchSortOption,
} from '@/services/searchService';

function SearchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse search params from URL
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || undefined;
  const brand = searchParams.get('brand') || undefined;
  const minPrice = searchParams.get('minPrice')
    ? parseFloat(searchParams.get('minPrice')!)
    : undefined;
  const maxPrice = searchParams.get('maxPrice')
    ? parseFloat(searchParams.get('maxPrice')!)
    : undefined;
  const minRating = searchParams.get('rating')
    ? parseFloat(searchParams.get('rating')!)
    : undefined;
  const inStockOnly = searchParams.get('inStock') === 'true';
  const isPrimeOnly = searchParams.get('prime') === 'true';
  const sortBy = (searchParams.get('sort') as SearchSortOption) || 'relevance';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const appliedParams: SearchParams = {
    query,
    category,
    brand,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    isPrimeOnly,
    sortBy,
    page,
    pageSize: 12,
  };

  const [resultData, setResultData] = useState<SearchResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch search results on URL query changes
  useEffect(() => {
    let isMounted = true;

    async function executeSearch() {
      setLoading(true);
      setError(null);
      try {
        const res = await searchProducts(appliedParams);
        if (!isMounted) return;

        if (res.success && res.data) {
          setResultData(res.data);
        } else {
          setError(res.error ?? 'Failed to perform search');
        }
      } catch (err) {
        if (isMounted) setError((err as Error).message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    executeSearch();
    return () => {
      isMounted = false;
    };
  }, [
    query,
    category,
    brand,
    minPrice,
    maxPrice,
    minRating,
    inStockOnly,
    isPrimeOnly,
    sortBy,
    page,
  ]);

  // Update URL search parameters
  function updateQueryParams(newParams: Partial<SearchParams>) {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      const urlKey =
        key === 'query'
          ? 'q'
          : key === 'minRating'
          ? 'rating'
          : key === 'inStockOnly'
          ? 'inStock'
          : key === 'isPrimeOnly'
          ? 'prime'
          : key === 'sortBy'
          ? 'sort'
          : key;

      if (value === undefined || value === null || value === '' || value === false) {
        params.delete(urlKey);
      } else {
        params.set(urlKey, String(value));
      }
    });

    router.push(`/search?${params.toString()}`);
  }

  function handleClearAllFilters() {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    router.push(`/search?${params.toString()}`);
  }

  const products = resultData?.products ?? [];
  const totalResults = resultData?.totalResults ?? 0;
  const totalPages = resultData?.totalPages ?? 1;

  // Active filter tags for quick removal
  const activeTags: { label: string; onRemove: () => void }[] = [];
  if (category) {
    activeTags.push({
      label: `Department: ${category}`,
      onRemove: () => updateQueryParams({ category: undefined, page: 1 }),
    });
  }
  if (brand) {
    activeTags.push({
      label: `Brand: ${brand}`,
      onRemove: () => updateQueryParams({ brand: undefined, page: 1 }),
    });
  }
  if (minPrice || maxPrice) {
    activeTags.push({
      label: `$${minPrice ?? 0} - $${maxPrice ?? 'Above'}`,
      onRemove: () =>
        updateQueryParams({ minPrice: undefined, maxPrice: undefined, page: 1 }),
    });
  }
  if (minRating) {
    activeTags.push({
      label: `${minRating}★ & Up`,
      onRemove: () => updateQueryParams({ minRating: undefined, page: 1 }),
    });
  }
  if (inStockOnly) {
    activeTags.push({
      label: 'In Stock Only',
      onRemove: () => updateQueryParams({ inStockOnly: undefined, page: 1 }),
    });
  }
  if (isPrimeOnly) {
    activeTags.push({
      label: 'Prime',
      onRemove: () => updateQueryParams({ isPrimeOnly: undefined, page: 1 }),
    });
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-screen-2xl px-4 py-4">
        {/* ── Top Bar: Results Count & Sort Dropdown ── */}
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b pb-3">
          <div>
            <p className="text-xs md:text-sm text-gray-700">
              {loading ? (
                'Searching...'
              ) : totalResults > 0 ? (
                <>
                  <span className="font-semibold text-gray-900">
                    {Math.min((page - 1) * 12 + 1, totalResults)}-
                    {Math.min(page * 12, totalResults)}
                  </span>{' '}
                  of <span className="font-semibold text-gray-900">{totalResults}</span>{' '}
                  results{' '}
                  {query && (
                    <>
                      for{' '}
                      <span className="font-bold text-amazon-orange">
                        &quot;{query}&quot;
                      </span>
                    </>
                  )}
                </>
              ) : (
                <>
                  No results{' '}
                  {query && (
                    <>
                      for{' '}
                      <span className="font-bold text-amazon-orange">
                        &quot;{query}&quot;
                      </span>
                    </>
                  )}
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Mobile Filter Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileFilterOpen(true)}
              className="md:hidden flex items-center gap-1.5 text-xs py-1"
            >
              <SlidersHorizontal size={14} />
              Filters {activeTags.length > 0 && `(${activeTags.length})`}
            </Button>

            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-gray-500 whitespace-nowrap hidden sm:inline">
                Sort by:
              </span>
              <select
                id="search-sort-select"
                value={sortBy}
                onChange={(e) =>
                  updateQueryParams({
                    sortBy: e.target.value as SearchSortOption,
                    page: 1,
                  })
                }
                className="rounded border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-amazon-orange cursor-pointer"
              >
                <option value="relevance">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Avg. Customer Review</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        {/* ── Active Filter Badges ── */}
        {activeTags.length > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">Active filters:</span>
            {activeTags.map((tag) => (
              <span
                key={tag.label}
                className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-0.5 text-xs text-gray-700 shadow-sm"
              >
                {tag.label}
                <button
                  type="button"
                  onClick={tag.onRemove}
                  className="rounded-full hover:bg-gray-100 p-0.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label={`Remove filter ${tag.label}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="text-xs font-semibold text-amazon-link hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {/* ── Main Content Grid: Sidebar + Product Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Desktop Filter Sidebar (3 cols) */}
          <div className="hidden md:block md:col-span-3 lg:col-span-3 sticky top-24">
            {resultData && (
              <SearchFilters
                facets={resultData.facets}
                appliedParams={appliedParams}
                onFilterChange={updateQueryParams}
                onClearFilters={handleClearAllFilters}
              />
            )}
          </div>

          {/* Product Results (9 cols) */}
          <div className="md:col-span-9 lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <EmptyState
                title="Search Error"
                description={error}
                actionLabel="Try Again"
                onAction={() => window.location.reload()}
              />
            ) : products.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
                <SearchX className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  No results found for &quot;{query}&quot;
                </h2>
                <p className="text-sm text-gray-600 max-w-md mx-auto mb-6 leading-relaxed">
                  Try checking your spelling, using more general keywords, or clearing some of your active filters.
                </p>
                {activeTags.length > 0 && (
                  <Button variant="primary" size="sm" onClick={handleClearAllFilters}>
                    Clear All Filters
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {products.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>

                {/* ── Pagination ── */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2 border-t pt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => updateQueryParams({ page: page - 1 })}
                      className="inline-flex items-center gap-1"
                    >
                      <ChevronLeft size={16} /> Previous
                    </Button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const pageNum = i + 1;
                        const isCurrent = pageNum === page;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => updateQueryParams({ page: pageNum })}
                            className={`h-8 w-8 rounded border text-xs font-semibold transition-colors cursor-pointer ${
                              isCurrent
                                ? 'border-amazon-orange bg-amber-50 text-amazon-dark font-bold ring-1 ring-amazon-orange'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => updateQueryParams({ page: page + 1 })}
                      className="inline-flex items-center gap-1"
                    >
                      Next <ChevronRight size={16} />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Mobile Filter Drawer ── */}
        {resultData && (
          <MobileFilterDrawer
            isOpen={mobileFilterOpen}
            onClose={() => setMobileFilterOpen(false)}
            facets={resultData.facets}
            appliedParams={appliedParams}
            totalResults={totalResults}
            onFilterChange={updateQueryParams}
            onClearFilters={handleClearAllFilters}
          />
        )}
      </div>
    </MainLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <MainLayout>
          <div className="mx-auto max-w-screen-2xl px-4 py-8">
            <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </MainLayout>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
