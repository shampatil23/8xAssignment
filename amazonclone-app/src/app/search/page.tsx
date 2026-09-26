'use client';
// ============================================================================
// Search Results Page — /search
// Valenza Maison Haute Horlogerie & Joaillerie Curated Catalog Search
// ============================================================================
import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  SearchX,
  Gem,
  RotateCcw,
  ChevronDown,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
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
      label: `Salon: ${category}`,
      onRemove: () => updateQueryParams({ category: undefined, page: 1 }),
    });
  }
  if (brand) {
    activeTags.push({
      label: `Maison: ${brand}`,
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
      label: 'Vault Stock Only',
      onRemove: () => updateQueryParams({ inStockOnly: undefined, page: 1 }),
    });
  }
  if (isPrimeOnly) {
    activeTags.push({
      label: 'White-Glove Courier',
      onRemove: () => updateQueryParams({ isPrimeOnly: undefined, page: 1 }),
    });
  }

  return (
    <MainLayout>
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 py-6 sm:py-8 text-[#141312] dark:text-[#f8f5ee]">
        {/* ── Breadcrumb ── */}
        <div className="text-[11px] uppercase tracking-[0.16em] font-medium text-[#786b58] dark:text-[#9e978b] mb-4 flex items-center gap-2">
          <Link href="/" className="hover:text-[#c5a059] dark:hover:text-[#d6be90] transition-colors">
            Maison
          </Link>
          <span className="text-[#dfd6c5] dark:text-[#2c3242]">◆</span>
          <span className="text-[#141312] dark:text-[#f8f5ee] font-semibold">Salon Search</span>
          {query && (
            <>
              <span className="text-[#dfd6c5] dark:text-[#2c3242]">◆</span>
              <span className="text-[#8a6827] dark:text-[#dfba73] font-serif">&quot;{query}&quot;</span>
            </>
          )}
        </div>

        {/* ── Editorial Header Banner ── */}
        <div className="mb-6 rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 backdrop-blur-xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(26,23,20,0.03)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase font-semibold tracking-[0.25em] text-[#9b8353] dark:text-[#d6be90] block mb-1.5 flex items-center gap-1.5">
                <Gem size={11} className="text-[#c5a059]" />
                Valenza Curated Search Results
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-[#141312] dark:text-[#f8f5ee]">
                {query ? (
                  <>
                    Catalog Allocations for <span className="italic font-normal">&quot;{query}&quot;</span>
                  </>
                ) : (
                  'All Maison Masterpieces & Catalog'
                )}
              </h1>
              <p className="text-xs sm:text-sm text-[#786b58] dark:text-[#9e978b] mt-1">
                {loading ? (
                  'Scanning private vaults and salon reserves...'
                ) : totalResults > 0 ? (
                  <>
                    Showing{' '}
                    <strong className="text-[#141312] dark:text-[#f8f5ee]">
                      {Math.min((page - 1) * 12 + 1, totalResults)}–{Math.min(page * 12, totalResults)}
                    </strong>{' '}
                    of <strong className="text-[#141312] dark:text-[#f8f5ee]">{totalResults}</strong> curated creations
                  </>
                ) : (
                  'No private vault creations matched your search criteria.'
                )}
              </p>
            </div>

            {/* Sort & Mobile Controls */}
            <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
              {/* Mobile Filter Button */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="md:hidden inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#ebe2d1] dark:border-[#2f384d] bg-[#fbfaf8] dark:bg-[#161a25] text-xs font-semibold uppercase tracking-wider text-[#141312] dark:text-[#f8f5ee] shadow-xs cursor-pointer hover:border-[#c5a059] transition-all"
              >
                <SlidersHorizontal size={14} className="text-[#c5a059]" />
                <span>Filters {activeTags.length > 0 && `(${activeTags.length})`}</span>
              </button>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold text-[#8a7b68] dark:text-[#8e98ac] hidden sm:inline">
                  Sort:
                </span>
                <div className="relative">
                  <select
                    id="search-sort-select"
                    value={sortBy}
                    onChange={(e) =>
                      updateQueryParams({
                        sortBy: e.target.value as SearchSortOption,
                        page: 1,
                      })
                    }
                    className="appearance-none rounded-xl border border-[#ebe2d1] dark:border-[#2f384d] bg-[#fbfaf8] dark:bg-[#161a25] pl-3.5 pr-8 py-2 text-xs font-semibold text-[#141312] dark:text-[#f8f5ee] focus:outline-none focus:border-[#c5a059] dark:focus:border-[#dfba73] cursor-pointer shadow-xs transition-all"
                  >
                    <option value="relevance">Maison Curated / Featured</option>
                    <option value="price-asc">Valuation: Low to High</option>
                    <option value="price-desc">Valuation: High to Low</option>
                    <option value="rating">Client Appraisals</option>
                    <option value="newest">Newest Atelier Arrivals</option>
                  </select>
                  <ChevronDown
                    size={13}
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a7b68] dark:text-[#8e98ac]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Active Filter Badges ── */}
          {activeTags.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[#f0eae0] dark:border-[#1e2433] flex flex-wrap items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8a7b68] dark:text-[#8e98ac] mr-1">
                Active Refinements:
              </span>
              {activeTags.map((tag) => (
                <span
                  key={tag.label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#e2d5c0] dark:border-[#383020] bg-[#f8f4ec] dark:bg-[#1c1810] px-3 py-1 text-xs font-medium text-[#8a6827] dark:text-[#dfba73] shadow-xs"
                >
                  <span>{tag.label}</span>
                  <button
                    type="button"
                    onClick={tag.onRemove}
                    className="rounded-full hover:bg-black/5 dark:hover:bg-white/10 p-0.5 text-[#8a6827] dark:text-[#dfba73] cursor-pointer transition-colors"
                    aria-label={`Remove filter ${tag.label}`}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="inline-flex items-center gap-1 text-xs uppercase tracking-wider font-semibold text-[#8a6827] dark:text-[#dfba73] hover:underline ml-2 cursor-pointer transition-colors"
              >
                <RotateCcw size={11} /> Reset All
              </button>
            </div>
          )}
        </div>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
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
              <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 p-12 text-center shadow-[0_10px_35px_rgba(26,23,20,0.03)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
                <div className="h-16 w-16 mx-auto rounded-full bg-[#fbfaf8] dark:bg-[#161a25] border border-[#e2d5c0] dark:border-[#383020] flex items-center justify-center text-[#c5a059] mb-4 shadow-sm">
                  <SearchX size={28} />
                </div>
                <span className="text-[10px] uppercase font-semibold tracking-[0.25em] text-[#9b8353] dark:text-[#d6be90] block mb-1">
                  Private Salon Archive
                </span>
                <h2 className="font-serif text-xl sm:text-2xl font-light text-[#141312] dark:text-[#f8f5ee] mb-2">
                  No allocations found for &quot;{query}&quot;
                </h2>
                <p className="text-xs sm:text-sm text-[#786b58] dark:text-[#9e978b] max-w-md mx-auto mb-6 leading-relaxed">
                  Try refining your search keyword, exploring our Haute Horlogerie &amp; Joaillerie salons, or resetting active filters.
                </p>
                {activeTags.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="px-6 py-3 rounded-xl font-sans text-xs uppercase tracking-[0.16em] font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] via-[#d6be90] to-[#b89548] hover:brightness-105 shadow-md cursor-pointer transition-all"
                  >
                    Reset All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                  {products.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>

                {/* ── Luxury Pagination ── */}
                {totalPages > 1 && (
                  <div className="mt-12 flex items-center justify-center gap-2 border-t border-[#f0eae0] dark:border-[#1e2433] pt-8">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => updateQueryParams({ page: page - 1 })}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#ebe2d1] dark:border-[#2f384d] bg-[#fbfaf8] dark:bg-[#161a25] text-xs font-semibold uppercase tracking-wider text-[#141312] dark:text-[#f8f5ee] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#c5a059] cursor-pointer transition-all shadow-xs"
                    >
                      <ChevronLeft size={14} /> Previous
                    </button>

                    <div className="flex items-center gap-1.5 mx-2">
                      {Array.from({ length: totalPages }).map((_, i) => {
                        const pageNum = i + 1;
                        const isCurrent = pageNum === page;
                        return (
                          <button
                            key={pageNum}
                            type="button"
                            onClick={() => updateQueryParams({ page: pageNum })}
                            className={`h-9 w-9 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                              isCurrent
                                ? 'bg-gradient-to-r from-[#c5a059] to-[#a88237] text-[#0d0a06] shadow-sm'
                                : 'border border-[#ebe2d1] dark:border-[#2f384d] bg-[#fbfaf8] dark:bg-[#161a25] text-[#141312] dark:text-[#f8f5ee] hover:border-[#c5a059]'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => updateQueryParams({ page: page + 1 })}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#ebe2d1] dark:border-[#2f384d] bg-[#fbfaf8] dark:bg-[#161a25] text-xs font-semibold uppercase tracking-wider text-[#141312] dark:text-[#f8f5ee] disabled:opacity-40 disabled:cursor-not-allowed hover:border-[#c5a059] cursor-pointer transition-all shadow-xs"
                    >
                      Next <ChevronRight size={14} />
                    </button>
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
            <div className="h-6 w-48 bg-[#ebe2d1] dark:bg-[#1f2533] rounded-full animate-pulse mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

