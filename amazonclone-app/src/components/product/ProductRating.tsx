'use client';
// ============================================================================
// ProductRating — Valenza Maison Star Rating Display
// Refined gold stars with serif rating scores and elegant client review count
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
    sm: 12,
    md: 15,
    lg: 18,
  }[size];

  const textClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size];

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Stars row */}
      <div
        className="flex items-center text-[#c5a059]"
        aria-label={`${clampedRating} out of 5 stars`}
      >
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star
            key={`full-${i}`}
            size={starSize}
            className="fill-[#c5a059] text-[#c5a059]"
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <StarHalf
            size={starSize}
            className="fill-[#c5a059] text-[#c5a059]"
          />
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star
            key={`empty-${i}`}
            size={starSize}
            className="text-[#dfd6c5] dark:text-[#32394d] fill-[#ede6d8] dark:fill-[#1e2433]"
          />
        ))}
      </div>

      {/* Numerical score and review count */}
      {showCount && (
        <div className={`flex items-center gap-1.5 ${textClasses}`}>
          <span className="font-serif font-medium text-[#141312] dark:text-[#f8f5ee]">
            {clampedRating.toFixed(1)}
          </span>
          {typeof reviewCount === 'number' && (
            <span className="text-xs text-[#8e816e] dark:text-[#8894ab] hover:text-[#c5a059] transition-colors cursor-pointer">
              ({reviewCount.toLocaleString()} Client Appraisals)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
