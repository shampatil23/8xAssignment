// ============================================================================
// Recommendation Service — Deterministic Marketplace Recommendations
// Signals: Same Category, Same Brand, Similar Price (+/- 35%), Non-duplicate
// ============================================================================
import type { Product, Cart } from '@/types';
import { getAllProducts, getProductsByCategory } from '@/lib/firebase/database';

export async function getRecommendationsForProduct(
  currentProduct: Product,
  limit = 4,
): Promise<Product[]> {
  try {
    const allProducts = await getAllProducts();

    // 1. Exclude current product and out of stock items
    const candidates = allProducts.filter(
      (p) => p.id !== currentProduct.id && p.status !== 'out_of_stock',
    );

    // 2. Score candidates deterministically based on multi-signal matching
    const scored = candidates.map((p) => {
      let score = 0;

      // Same category (+50 points)
      if (p.category === currentProduct.category) score += 50;

      // Same brand (+30 points)
      if (
        p.brand &&
        currentProduct.brand &&
        p.brand.toLowerCase() === currentProduct.brand.toLowerCase()
      ) {
        score += 30;
      }

      // Similar price range within 35% (+20 points)
      const priceRatio = p.price / (currentProduct.price || 1);
      if (priceRatio >= 0.65 && priceRatio <= 1.35) score += 20;

      // Rating boost
      score += (p.rating || 4.5) * 2;

      return { product: p, score };
    });

    // Sort highest score first
    scored.sort((a, b) => b.score - a.score);

    const results = scored.slice(0, limit).map((s) => s.product);

    // Fallback if not enough results
    if (results.length < limit) {
      const remaining = candidates
        .filter((c) => !results.some((r) => r.id === c.id))
        .slice(0, limit - results.length);
      return [...results, ...remaining];
    }

    return results;
  } catch (error) {
    console.error('[recommendationService.getRecommendationsForProduct] error:', error);
    return [];
  }
}

export async function getRecommendationsForCart(
  cart: Cart | null,
  limit = 4,
): Promise<Product[]> {
  try {
    const allProducts = await getAllProducts();
    const cartProductIds = new Set(cart?.items.map((i) => i.productId) || []);

    // Filter out items already in cart
    const candidates = allProducts.filter(
      (p) => !cartProductIds.has(p.id) && p.status !== 'out_of_stock',
    );

    // Prioritize categories currently in cart
    const cartCategories = new Set(
      cart?.items.map((i) => (i.product as any)?.category).filter(Boolean) || [],
    );

    candidates.sort((a, b) => {
      const aInCat = cartCategories.has(a.category) ? 1 : 0;
      const bInCat = cartCategories.has(b.category) ? 1 : 0;
      if (bInCat !== aInCat) return bInCat - aInCat;
      return (b.reviewCount || 0) - (a.reviewCount || 0);
    });

    return candidates.slice(0, limit);
  } catch (error) {
    console.error('[recommendationService.getRecommendationsForCart] error:', error);
    return [];
  }
}

export async function getRecommendationsForHome(limit = 8): Promise<Product[]> {
  try {
    const allProducts = await getAllProducts();
    const active = allProducts.filter((p) => p.status === 'active');
    // Featured & Best Sellers first
    active.sort((a, b) => {
      const aScore = (a.isBestSeller ? 2 : 0) + (a.isFeatured ? 1 : 0);
      const bScore = (b.isBestSeller ? 2 : 0) + (b.isFeatured ? 1 : 0);
      return bScore - aScore;
    });
    return active.slice(0, limit);
  } catch (error) {
    console.error('[recommendationService.getRecommendationsForHome] error:', error);
    return [];
  }
}
