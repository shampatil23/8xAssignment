// ============================================================================
// Product Service
// Handles fetching, filtering, and updating products from Firebase RTDB
// ============================================================================
import type { Product, ApiResponse, ProductStatus } from '@/types';
import {
  getAllProducts,
  getProductsByCategory,
  getProductById,
  getProductBySlug,
  saveProduct as dbSaveProduct,
  updateProduct as dbUpdateProduct,
  seedCatalogData,
} from '@/lib/firebase/database';

export interface ProductFilters {
  category?: string;
  status?: ProductStatus;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
}

export async function fetchProducts(
  filters?: ProductFilters,
): Promise<ApiResponse<Product[]>> {
  try {
    let products: Product[];

    if (filters?.category) {
      products = await getProductsByCategory(filters.category);
    } else {
      products = await getAllProducts();
    }

    // Apply optional client-side filters
    if (filters) {
      if (filters.status) {
        products = products.filter((p) => p.status === filters.status);
      }
      if (filters.brand) {
        products = products.filter(
          (p) => p.brand?.toLowerCase() === filters.brand?.toLowerCase(),
        );
      }
      if (typeof filters.minPrice === 'number') {
        products = products.filter((p) => p.price >= filters.minPrice!);
      }
      if (typeof filters.maxPrice === 'number') {
        products = products.filter((p) => p.price <= filters.maxPrice!);
      }
      if (filters.inStockOnly) {
        products = products.filter((p) => p.stock > 0 && p.status === 'active');
      }
    }

    return {
      success: true,
      data: products,
    };
  } catch (error) {
    console.error('[productService.fetchProducts] error:', error);
    return {
      success: false,
      error: 'Failed to retrieve products. Please try again.',
    };
  }
}

export async function fetchProductBySlug(
  slug: string,
): Promise<ApiResponse<Product>> {
  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      return {
        success: false,
        error: `Product "${slug}" was not found.`,
      };
    }
    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error(`[productService.fetchProductBySlug] error for "${slug}":`, error);
    return {
      success: false,
      error: 'Failed to retrieve product details.',
    };
  }
}

export async function fetchProductById(
  id: string,
): Promise<ApiResponse<Product>> {
  try {
    const product = await getProductById(id);
    if (!product) {
      return {
        success: false,
        error: `Product with ID "${id}" was not found.`,
      };
    }
    return {
      success: true,
      data: product,
    };
  } catch (error) {
    console.error(`[productService.fetchProductById] error for "${id}":`, error);
    return {
      success: false,
      error: 'Failed to retrieve product by ID.',
    };
  }
}

export async function createProduct(
  product: Product,
): Promise<ApiResponse<Product>> {
  try {
    await dbSaveProduct(product);
    return {
      success: true,
      data: product,
      message: 'Product created successfully',
    };
  } catch (error) {
    console.error('[productService.createProduct] error:', error);
    return {
      success: false,
      error: 'Failed to create product in catalog.',
    };
  }
}

export async function updateProduct(
  id: string,
  data: Partial<Product>,
): Promise<ApiResponse<void>> {
  try {
    await dbUpdateProduct(id, data);
    return {
      success: true,
      message: 'Product updated successfully',
    };
  } catch (error) {
    console.error(`[productService.updateProduct] error for "${id}":`, error);
    return {
      success: false,
      error: 'Failed to update product.',
    };
  }
}

export async function seedCatalog(
  force = false,
): Promise<ApiResponse<{ categoriesCount: number; productsCount: number }>> {
  try {
    const result = await seedCatalogData(force);
    return {
      success: true,
      data: result,
      message: `Seeded ${result.categoriesCount} categories and ${result.productsCount} products.`,
    };
  } catch (error) {
    console.error('[productService.seedCatalog] error:', error);
    return {
      success: false,
      error: 'Failed to seed catalog data.',
    };
  }
}
