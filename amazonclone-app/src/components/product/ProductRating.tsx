'use client';
// ============================================================================
// ProductRating — Star rating display with numerical score and review count
// ============================================================================
import React from 'react';
import { Star, StarHalf } from 'lucide-react';

interface ProductRatingProps {
  rating: number; // 0.0 to 5.0
  reviewCount?: number;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  className?: string;
}

export function ProductRating({
  rating,
  reviewCount,
  size = 'md',
  showCount = true,
  className = '',
}: ProductRatingProps) {
  // Clamp rating between 0 and 5
  const clampedRating = Math.max(0, Math.min(5, rating));
  const fullStars = Math.floor(clampedRating);
  const hasHalfStar = clampedRating % 1 >= 0.3 && clampedRating % 1 <= 0.8;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalfStar ? 1 : 0));

  const starSize = {
    sm: 13,
    md: 16,
    lg: 20,
  }[size];

  const textClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Stars row */}
      <div
        className="flex items-center text-amber-500"
        aria-label={`${clampedRating} out of 5 stars`}
      >
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            size={starSize}
            className="fill-amber-400 text-amber-500"
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <StarHalf
            size={starSize}
            className="fill-amber-400 text-amber-500"
          />
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            size={starSize}
            className="text-gray-300 fill-gray-100"
          />
        ))}
      </div>

      {/* Numerical score and review count */}
      {showCount && (
        <div className={`flex items-center gap-1 text-amazon-link hover:underline hover:text-amazon-link-hover cursor-pointer ${textClasses}`}>
          <span className="font-semibold text-gray-800">{clampedRating.toFixed(1)}</span>
          {typeof reviewCount === 'number' && (
            <span className="text-gray-500">
              ({reviewCount.toLocaleString()})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
