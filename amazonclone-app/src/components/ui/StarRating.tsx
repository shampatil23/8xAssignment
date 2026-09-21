// ============================================================================
// StarRating — display-only star rating bar
// ============================================================================
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number; // 0–5
  reviewCount?: number;
  size?: number;
  showLabel?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  reviewCount,
  size = 14,
  showLabel = true,
  className = '',
}: StarRatingProps) {
  const stars = Array.from({ length: 5 }, (_, i) => {
    const filled = i < Math.floor(rating);
    const partial = !filled && i < rating;
    return { filled, partial };
  });

  return (
    <span
      className={['inline-flex items-center gap-1', className].filter(Boolean).join(' ')}
      aria-label={`Rated ${rating.toFixed(1)} out of 5${reviewCount != null ? `, ${reviewCount.toLocaleString()} reviews` : ''}`}
    >
      <span className="inline-flex">
        {stars.map((s, i) => (
          <Star
            key={i}
            size={size}
            className={
              s.filled
                ? 'text-amazon-orange fill-amazon-orange'
                : s.partial
                  ? 'text-amazon-orange fill-amazon-orange opacity-50'
                  : 'text-gray-300 fill-gray-200'
            }
          />
        ))}
      </span>
      {showLabel && (
        <span className="text-xs text-amazon-link hover:underline cursor-pointer">
          {reviewCount != null
            ? reviewCount.toLocaleString()
            : rating.toFixed(1)}
        </span>
      )}
    </span>
  );
}
