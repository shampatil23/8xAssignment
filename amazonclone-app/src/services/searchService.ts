// ============================================================================
// Search Service — Amazon-Style Product Discovery & Filtering
// Operates on Firebase RTDB products with scoring, faceting, and suggestions
// ============================================================================
import type { Product, ApiResponse } from '@/types';
import { getAllProducts, getAllCategories } from '@/lib/firebase/database';

export type SearchSortOption =
  | 'relevance'
  | 'price-asc'
  | 'price-desc'
  | 'rating'
  | 'newest';

export interface SearchParams {
  query?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStockOnly?: boolean;
  isPrimeOnly?: boolean;
  sortBy?: SearchSortOption;
  page?: number;
  pageSize?: number;
}

export interface SearchFacetOption {
  value: string;
  label: string;
  count: number;
}

export interface SearchFacets {
  categories: SearchFacetOption[];
  brands: SearchFacetOption[];
  minPrice: number;
  maxPrice: number;
  ratingCounts: { minRating: number; count: number }[];
}

export interface SearchResultData {
  products: Product[];
  totalResults: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
  facets: SearchFacets;
  appliedParams: SearchParams;
}

export interface SearchSuggestion {
  text: string;
  type: 'product' | 'brand' | 'category';
  slug?: string;
  categorySlug?: string;
}

// ── Calculate keyword relevance score for a product ──────────────────────
function calculateRelevanceScore(product: Product, queryTokens: string[]): number {
  if (queryTokens.length === 0) return 1;

  let score = 0;
  const titleLower = product.title.toLowerCase();
  const descLower = product.description.toLowerCase();
  const brandLower = (product.brand ?? '').toLowerCase();
  const catLower = (product.categoryName ?? product.category).toLowerCase();
  const tagsLower = (product.tags ?? []).map((t) => t.toLowerCase());

  const fullQuery = queryTokens.join(' ');

  // Exact phrase match in title
  if (titleLower.includes(fullQuery)) {
    score += 120;
  }
  if (brandLower.includes(fullQuery)) {
    score += 80;
  }
  if (catLower.includes(fullQuery)) {
    score += 60;
  }

  // Token-by-token scoring
  for (const token of queryTokens) {
    if (titleLower.includes(token)) score += 30;
    if (brandLower.includes(token)) score += 25;
    if (catLower.includes(token)) score += 20;
    if (tagsLower.some((t) => t.includes(token))) score += 15;
    if (descLower.includes(token)) score += 5;
  }

  // Popularity boost
  if (product.isBestSeller) score += 15;
  if (product.isFeatured) score += 10;
  if (product.rating >= 4.7) score += 5;

  return score;
}

// ── Search & Filter Products ─────────────────────────────────────────────
export async function searchProducts(
  params: SearchParams = {},
): Promise<ApiResponse<SearchResultData>> {
  try {
    const allProducts = await getAllProducts();

    const query = (params.query ?? '').trim().toLowerCase();
    const queryTokens = query
      ? query.split(/\s+/).filter((t) => t.length > 0)
      : [];

    // 1. Initial Filtering by Keyword & Category
    let matchedProducts = allProducts.filter((product) => {
      // Category filter
      if (params.category && params.category !== 'all') {
        const target = params.category.toLowerCase();
        const pCat = product.category.toLowerCase();
        const pCatName = (product.categoryName ?? '').toLowerCase();
        const catMatch =
          pCat === target ||
          pCatName === target ||
          ((target === 'home-garden' || target === 'home-kitchen') &&
            (pCat === 'home-garden' || pCat === 'home-kitchen')) ||
          ((target === 'sports' || target === 'fitness') &&
            (pCat === 'sports' || pCat === 'fitness'));
        if (!catMatch) return false;
      }

      // Keyword match
      if (queryTokens.length > 0) {
        const titleLower = product.title.toLowerCase();
        const descLower = product.description.toLowerCase();
        const brandLower = (product.brand ?? '').toLowerCase();
        const catLower = (product.categoryName ?? product.category).toLowerCase();
        const tagsLower = (product.tags ?? []).map((t) => t.toLowerCase());

        // At least one token must match
        const matchesAny = queryTokens.some(
          (tok) =>
            titleLower.includes(tok) ||
            brandLower.includes(tok) ||
            catLower.includes(tok) ||
            descLower.includes(tok) ||
            tagsLower.some((tag) => tag.includes(tok)),
        );

        if (!matchesAny) return false;
      }

      return true;
    });

    // 2. Compute Facets based on matched candidates before narrow filters
    const categoryCounts: Record<string, { label: string; count: number }> = {};
    const brandCounts: Record<string, number> = {};
    let minPriceFound = Infinity;
    let maxPriceFound = 0;

    for (const p of matchedProducts) {
      // Categories
      const catKey = p.category;
      const catLabel = p.categoryName || catKey;
      if (!categoryCounts[catKey]) {
        categoryCounts[catKey] = { label: catLabel, count: 0 };
      }
      categoryCounts[catKey].count += 1;

      // Brands
      if (p.brand) {
        brandCounts[p.brand] = (brandCounts[p.brand] ?? 0) + 1;
      }

      // Price extremes
      if (p.price < minPriceFound) minPriceFound = p.price;
      if (p.price > maxPriceFound) maxPriceFound = p.price;
    }

    const facets: SearchFacets = {
      categories: Object.entries(categoryCounts).map(([value, { label, count }]) => ({
        value,
        label,
        count,
      })),
      brands: Object.entries(brandCounts).map(([value, count]) => ({
        value,
        label: value,
        count,
      })),
      minPrice: minPriceFound === Infinity ? 0 : Math.floor(minPriceFound),
      maxPrice: maxPriceFound === 0 ? 1000 : Math.ceil(maxPriceFound),
      ratingCounts: [4, 3, 2, 1].map((minRating) => ({
        minRating,
        count: matchedProducts.filter((p) => p.rating >= minRating).length,
      })),
    };

    // 3. Narrowing Filters
    if (params.brand) {
      matchedProducts = matchedProducts.filter(
        (p) => p.brand?.toLowerCase() === params.brand?.toLowerCase(),
      );
    }

    if (typeof params.minPrice === 'number' && !isNaN(params.minPrice)) {
      matchedProducts = matchedProducts.filter((p) => p.price >= params.minPrice!);
    }

    if (typeof params.maxPrice === 'number' && !isNaN(params.maxPrice)) {
      matchedProducts = matchedProducts.filter((p) => p.price <= params.maxPrice!);
    }

    if (typeof params.minRating === 'number' && !isNaN(params.minRating)) {
      matchedProducts = matchedProducts.filter((p) => p.rating >= params.minRating!);
    }

    if (params.inStockOnly) {
      matchedProducts = matchedProducts.filter((p) => p.stock > 0 && p.status === 'active');
    }

    if (params.isPrimeOnly) {
      matchedProducts = matchedProducts.filter((p) => p.isPrimeEligible);
    }

    // 4. Sorting
    const sortBy = params.sortBy ?? 'relevance';
    if (sortBy === 'price-asc') {
      matchedProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      matchedProducts.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      matchedProducts.sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        return b.reviewCount - a.reviewCount;
      });
    } else if (sortBy === 'newest') {
      matchedProducts.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else {
      // 'relevance'
      matchedProducts.sort((a, b) => {
        const scoreA = calculateRelevanceScore(a, queryTokens);
        const scoreB = calculateRelevanceScore(b, queryTokens);
        return scoreB - scoreA;
      });
    }

    // 5. Pagination
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.max(1, params.pageSize ?? 12);
    const totalResults = matchedProducts.length;
    const totalPages = Math.ceil(totalResults / pageSize);
    const startIndex = (page - 1) * pageSize;
    const paginatedProducts = matchedProducts.slice(startIndex, startIndex + pageSize);

    return {
      success: true,
      data: {
        products: paginatedProducts,
        totalResults,
        page,
        pageSize,
        totalPages,
        hasMore: page < totalPages,
        facets,
        appliedParams: params,
      },
    };
  } catch (error) {
    console.error('[searchService.searchProducts] error:', error);
    return {
      success: false,
      error: 'Failed to search catalog. Please try again.',
    };
  }
}

// ── Search Suggestions ───────────────────────────────────────────────────
export async function getSearchSuggestions(
  query: string,
  category?: string,
): Promise<ApiResponse<SearchSuggestion[]>> {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery || cleanQuery.length < 2) {
    return { success: true, data: [] };
  }

  try {
    const [products, categories] = await Promise.all([
      getAllProducts(),
      getAllCategories(),
    ]);

    const suggestions: SearchSuggestion[] = [];
    const seenTexts = new Set<string>();

    // 1. Check matching categories
    for (const cat of categories) {
      if (cat.name.toLowerCase().includes(cleanQuery)) {
        if (!seenTexts.has(cat.name.toLowerCase())) {
          seenTexts.add(cat.name.toLowerCase());
          suggestions.push({
            text: cat.name,
            type: 'category',
            categorySlug: cat.slug,
          });
        }
      }
    }

    // 2. Check matching brands
    const brands = Array.from(new Set(products.map((p) => p.brand).filter(Boolean))) as string[];
    for (const brand of brands) {
      if (brand.toLowerCase().includes(cleanQuery)) {
        if (!seenTexts.has(brand.toLowerCase())) {
          seenTexts.add(brand.toLowerCase());
          suggestions.push({
            text: brand,
            type: 'brand',
          });
        }
      }
    }

    // 3. Check matching product titles
    const filteredProducts = category && category !== 'all'
      ? products.filter((p) => p.category === category)
      : products;

    for (const prod of filteredProducts) {
      if (prod.title.toLowerCase().includes(cleanQuery)) {
        if (!seenTexts.has(prod.title.toLowerCase())) {
          seenTexts.add(prod.title.toLowerCase());
          suggestions.push({
            text: prod.title,
            type: 'product',
            slug: prod.slug,
          });
        }
      }
      if (suggestions.length >= 8) break;
    }

    return {
      success: true,
      data: suggestions.slice(0, 8),
    };
  } catch (error) {
    console.error('[searchService.getSearchSuggestions] error:', error);
    return {
      success: true,
      data: [],
    };
  }
}
