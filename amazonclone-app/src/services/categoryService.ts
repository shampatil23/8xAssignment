// ============================================================================
// Category Service
// Handles fetching and querying categories from Firebase RTDB
// ============================================================================
import type { Category, ApiResponse } from '@/types';
import { getAllCategories, getCategoryBySlug } from '@/lib/firebase/database';

export async function fetchCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const categories = await getAllCategories();
    return {
      success: true,
      data: categories,
    };
  } catch (error) {
    console.error('[categoryService.fetchCategories] error:', error);
    return {
      success: false,
      error: 'Failed to load categories. Please try again.',
    };
  }
}

export async function fetchCategoryBySlug(
  slug: string,
): Promise<ApiResponse<Category>> {
  try {
    const category = await getCategoryBySlug(slug);
    if (!category) {
      return {
        success: false,
        error: `Category "${slug}" not found.`,
      };
    }
    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.error(`[categoryService.fetchCategoryBySlug] error for "${slug}":`, error);
    return {
      success: false,
      error: 'Failed to load category details.',
    };
  }
}
