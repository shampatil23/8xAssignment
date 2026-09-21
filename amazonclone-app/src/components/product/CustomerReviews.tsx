'use client';
// ============================================================================
// CustomerReviews — Amazon-style customer reviews section foundation
// ============================================================================
import React, { useState } from 'react';
import { Star, ThumbsUp, CheckCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

interface ReviewItem {
  id: string;
  author: string;
  avatar?: string;
  rating: number;
  title: string;
  date: string;
  verifiedPurchase: boolean;
  content: string;
  helpfulCount: number;
  variantInfo?: string;
}

interface CustomerReviewsProps {
  productTitle: string;
  rating: number;
  reviewCount: number;
  className?: string;
}

export function CustomerReviews({
  productTitle,
  rating,
  reviewCount,
  className = '',
}: CustomerReviewsProps) {
  const { user } = useAuth();
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});
  const [filterRating, setFilterRating] = useState<number | null>(null);

  // Approximate star breakdown based on average rating
  const breakdown = [
    { stars: 5, percentage: 70 },
    { stars: 4, percentage: 18 },
    { stars: 3, percentage: 6 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 3 },
  ];

  const sampleReviews: ReviewItem[] = [
    {
      id: 'rev-1',
      author: 'David M.',
      rating: 5,
      title: 'Exceeded all expectations! Solid build and premium performance.',
      date: 'Reviewed in the United States on August 14, 2026',
      verifiedPurchase: true,
      variantInfo: 'Color: Default | Verified Purchase',
      content:
        'I hesitated at first because of the price point, but after two weeks of heavy daily use, I am completely blown away. The build quality feels indestructible, setup took less than 3 minutes, and everyday performance is silky smooth. Delivery was right on time too.',
      helpfulCount: 34,
    },
    {
      id: 'rev-2',
      author: 'Sarah Jenkins',
      rating: 5,
      title: 'Best in its class by far. Highly recommend!',
      date: 'Reviewed in the United States on July 28, 2026',
      verifiedPurchase: true,
      variantInfo: 'Verified Purchase',
      content:
        'Fantastic product. Matches the description 100%. The packaging was pristine with the official Amazon tamper-proof tape. Battery life / durability holds up remarkably well under continuous workflow.',
      helpfulCount: 19,
    },
    {
      id: 'rev-3',
      author: 'Marcus Vance',
      rating: 4,
      title: 'Great overall value, minor learning curve initially',
      date: 'Reviewed in the United States on June 19, 2026',
      verifiedPurchase: true,
      variantInfo: 'Verified Purchase',
      content:
        'Solid 4 stars. Everything works as intended. Took a little bit to figure out all the custom settings out of the box, but once tuned, it runs like a dream. Would definitely buy again.',
      helpfulCount: 9,
    },
  ];

  const toggleHelpful = (reviewId: string) => {
    setHelpfulVotes((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const filteredReviews = filterRating
    ? sampleReviews.filter((r) => r.rating === filterRating)
    : sampleReviews;

  return (
    <section
      aria-labelledby="customer-reviews-heading"
      className={`rounded-lg border border-gray-200 bg-white p-6 shadow-sm ${className}`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ── Left Column: Rating breakdown (4 cols) ── */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-gray-200 pb-6 lg:pb-0 lg:pr-8">
          <h2
            id="customer-reviews-heading"
            className="text-xl font-bold text-gray-900 mb-2"
          >
            Customer Reviews
          </h2>

          {/* Average Rating */}
          <div className="flex items-center gap-2 mb-3">
            <div className="flex text-amber-500">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  size={20}
                  className={
                    s <= Math.round(rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>
            <span className="text-lg font-bold text-gray-900">
              {rating.toFixed(1)} out of 5
            </span>
          </div>

          <p className="text-xs text-gray-500 mb-6">
            {reviewCount.toLocaleString()} global ratings
          </p>

          {/* Breakdown progress bars */}
          <div className="space-y-2 mb-8">
            {breakdown.map((row) => (
              <button
                key={row.stars}
                type="button"
                onClick={() =>
                  setFilterRating(filterRating === row.stars ? null : row.stars)
                }
                className={`flex w-full items-center gap-3 text-xs text-amazon-link hover:underline transition-all ${
                  filterRating === row.stars ? 'font-bold' : ''
                }`}
              >
                <span className="w-12 text-left">{row.stars} star</span>
                <div className="h-4 flex-1 rounded bg-gray-200 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 transition-all duration-300"
                    style={{ width: `${row.percentage}%` }}
                  />
                </div>
                <span className="w-8 text-right text-gray-600">
                  {row.percentage}%
                </span>
              </button>
            ))}

            {filterRating && (
              <button
                type="button"
                onClick={() => setFilterRating(null)}
                className="text-xs text-amazon-link hover:underline mt-2 inline-block"
              >
                Clear filter (showing {filterRating}-star reviews)
              </button>
            )}
          </div>

          {/* Write a review foundation */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-sm font-bold text-gray-900 mb-1">
              Review this product
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Share your thoughts with other customers
            </p>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => {
                if (!user) {
                  window.location.href = `/auth/sign-in?redirect=${encodeURIComponent(
                    window.location.pathname
                  )}`;
                  return;
                }
                alert('Review submission modal will be activated in the Reviews module.');
              }}
            >
              Write a customer review
            </Button>
          </div>
        </div>

        {/* ── Right Column: Reviews List (8 cols) ── */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900">
              Top reviews from verified purchases
            </h3>
            <span className="text-xs text-gray-500">
              Showing {filteredReviews.length} of {sampleReviews.length} reviews
            </span>
          </div>

          <div className="divide-y divide-gray-100 space-y-6">
            {filteredReviews.map((rev) => {
              const hasVoted = helpfulVotes[rev.id];
              return (
                <div key={rev.id} className="pt-6 first:pt-0">
                  {/* Author line */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-8 w-8 rounded-full bg-gray-200 text-gray-600 font-bold flex items-center justify-center text-xs">
                      {rev.author.charAt(0)}
                    </div>
                    <span className="text-xs font-semibold text-gray-900">
                      {rev.author}
                    </span>
                  </div>

                  {/* Rating and Title */}
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={
                            s <= rev.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 leading-snug">
                      {rev.title}
                    </h4>
                  </div>

                  {/* Date */}
                  <p className="text-[11px] text-gray-500 mb-1">{rev.date}</p>

                  {/* Badges */}
                  {rev.verifiedPurchase && (
                    <p className="text-[11px] font-bold text-[#c45500] mb-2 flex items-center gap-1">
                      <ShieldCheck size={12} />
                      Verified Purchase
                    </p>
                  )}

                  {/* Content */}
                  <p className="text-xs text-gray-700 leading-relaxed mb-3">
                    {rev.content}
                  </p>

                  {/* Helpful feedback */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>
                      {rev.helpfulCount + (hasVoted ? 1 : 0)} people found this helpful
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleHelpful(rev.id)}
                      className={`rounded border px-3 py-1 text-xs transition-colors flex items-center gap-1 ${
                        hasVoted
                          ? 'border-green-600 bg-green-50 text-green-700 font-semibold'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <ThumbsUp size={12} />
                      {hasVoted ? 'Helpful!' : 'Helpful'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
