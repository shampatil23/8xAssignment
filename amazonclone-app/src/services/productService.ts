// ============================================================================
// Product Service — business logic layer (stub, implemented in Phase 3)
// ============================================================================
import type { Product, SearchFilters, PaginatedResponse, ApiResponse } from '@/types';

export async function getProducts(
  filters?: SearchFilters,
  page = 1,
  pageSize = 24,
): Promise<PaginatedResponse<Product>> {
  // TODO Phase 3: query Firestore with filters, pagination
  console.log('[productService] getProducts called', { filters, page, pageSize });
  return { data: [], total: 0, page, pageSize, hasMore: false };
}

export async function getProductById(id: string): Promise<Product | null> {
  // TODO Phase 3: fetch single product from Firestore
  console.log('[productService] getProductById called', id);
  return null;
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  // TODO Phase 3: query isFeatured === true
  console.log('[productService] getFeaturedProducts called', limit);
  return [];
}

export async function getProductsByCategory(
  category: string,
  limit = 24,
): Promise<Product[]> {
  // TODO Phase 3: query by category
  console.log('[productService] getProductsByCategory called', { category, limit });
  return [];
}

export async function searchProducts(
  query: string,
  filters?: SearchFilters,
): Promise<PaginatedResponse<Product>> {
  // TODO Phase 3: implement Firestore text search / Algolia
  console.log('[productService] searchProducts called', { query, filters });
  return { data: [], total: 0, page: 1, pageSize: 24, hasMore: false };
}

export async function createProduct(
  data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<ApiResponse<Product>> {
  // TODO Phase 5: admin product creation
  console.log('[productService] createProduct called', data);
  return { success: false, error: 'Not implemented yet' };
}

export async function updateProduct(
  id: string,
  data: Partial<Product>,
): Promise<ApiResponse<Product>> {
  // TODO Phase 5: admin product update
  console.log('[productService] updateProduct called', { id, data });
  return { success: false, error: 'Not implemented yet' };
}

export async function deleteProduct(id: string): Promise<ApiResponse> {
  // TODO Phase 5: admin product delete
  console.log('[productService] deleteProduct called', id);
  return { success: false, error: 'Not implemented yet' };
}
