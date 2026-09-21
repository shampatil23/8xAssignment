// ============================================================================
// Review Service — Customer Reviews & Purchase-Verified Ratings
// ============================================================================
import type { Review, ApiResponse } from '@/types';
import {
  getProductReviews,
  saveProductReview,
  deleteProductReview,
  hasUserPurchasedProduct,
} from '@/lib/firebase/database';

export function calculateStarDistribution(reviews: Review[]): {
  stars: number;
  count: number;
  percentage: number;
}[] {
  const total = reviews.length;
  const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviews.forEach((r) => {
    const star = Math.min(5, Math.max(1, Math.round(r.rating))) as 1 | 2 | 3 | 4 | 5;
    counts[star] = (counts[star] || 0) + 1;
  });

  return [5, 4, 3, 2, 1].map((stars) => {
    const count = counts[stars as 1 | 2 | 3 | 4 | 5];
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return { stars, count, percentage };
  });
}

export async function fetchProductReviews(productId: string): Promise<Review[]> {
  try {
    return await getProductReviews(productId);
  } catch (error) {
    console.error('[reviewService.fetchProductReviews] error:', error);
    return [];
  }
}

export async function checkReviewEligibility(
  userId: string | null | undefined,
  productId: string,
): Promise<{ isEligible: boolean; reason?: string }> {
  if (!userId) {
    return {
      isEligible: false,
      reason: 'Please sign in to write a customer review.',
    };
  }

  try {
    const purchased = await hasUserPurchasedProduct(userId, productId);
    if (!purchased) {
      return {
        isEligible: false,
        reason: 'Only customers who have ordered this item are eligible to submit a verified review.',
      };
    }

    return { isEligible: true };
  } catch (error) {
    console.error('[reviewService.checkReviewEligibility] error:', error);
    return { isEligible: false, reason: 'Unable to verify purchase history.' };
  }
}

export async function submitReview(
  userId: string,
  userName: string,
  data: {
    productId: string;
    rating: number;
    title: string;
    body: string;
  },
): Promise<ApiResponse<Review>> {
  // 1. Validation checks
  if (!data.rating || data.rating < 1 || data.rating > 5) {
    return { success: false, error: 'Rating must be between 1 and 5 stars.' };
  }

  if (!data.title || data.title.trim().length < 3) {
    return { success: false, error: 'Review title must be at least 3 characters.' };
  }

  if (!data.body || data.body.trim().length < 10) {
    return { success: false, error: 'Review body must be at least 10 characters.' };
  }

  // 2. Purchase verification
  const eligibility = await checkReviewEligibility(userId, data.productId);
  if (!eligibility.isEligible) {
    return { success: false, error: eligibility.reason };
  }

  try {
    const reviewId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newReview: Review = {
      id: reviewId,
      productId: data.productId,
      userId,
      userName: userName || 'Amazon Customer',
      rating: data.rating,
      title: data.title.trim(),
      body: data.body.trim(),
      helpfulCount: 0,
      verifiedPurchase: true,
      createdAt: new Date().toISOString(),
    };

    await saveProductReview(newReview);

    return {
      success: true,
      data: newReview,
      message: 'Your review has been submitted successfully!',
    };
  } catch (error) {
    console.error('[reviewService.submitReview] error:', error);
    return { success: false, error: 'Failed to submit review. Please try again.' };
  }
}

export async function deleteReview(
  userId: string,
  reviewId: string,
  productId: string,
): Promise<ApiResponse<void>> {
  try {
    await deleteProductReview(productId, reviewId, userId);
    return {
      success: true,
      message: 'Review removed successfully.',
    };
  } catch (error) {
    console.error('[reviewService.deleteReview] error:', error);
    return { success: false, error: 'Failed to delete review.' };
  }
}
