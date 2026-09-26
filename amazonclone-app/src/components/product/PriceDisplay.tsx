'use client';
// ============================================================================
// PriceDisplay — Valenza Maison Editorial Luxury Price Typography
// Displays champagne gold currency symbol, refined serif figures,
// and elegant strikethrough list price with luxury discount badge.
// ============================================================================
import React from 'react';
import { useLocation } from '@/context/LocationContext';

interface PriceDisplayProps {
  price: number;
  compareAtPrice?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDiscount?: boolean;
  className?: string;
}

export function PriceDisplay({
  price,
  compareAtPrice,
  size = 'md',
  showDiscount = true,
  className = '',
}: PriceDisplayProps) {
  const { country, convertPrice } = useLocation();

  const localPrice = convertPrice(price);
  const isNoDecimalsCurrency = country.currency === 'INR' || country.currency === 'JPY';

  const intPart = Math.floor(localPrice);
  const decPart = !isNoDecimalsCurrency
    ? Math.round((localPrice - intPart) * 100)
        .toString()
        .padStart(2, '0')
    : '';

  const localCompare = compareAtPrice ? convertPrice(compareAtPrice) : undefined;
  const hasDiscount = localCompare && localCompare > localPrice;
  const discountPercent = hasDiscount
    ? Math.round(((localCompare - localPrice) / localCompare) * 100)
    : 0;

  const sizeClasses = {
    sm: {
      symbol: 'text-xs top-0',
      dollars: 'text-sm sm:text-base font-semibold',
      cents: 'text-[11px] top-0',
      compare: 'text-[11px]',
      badge: 'text-[10px] px-2 py-0.5',
    },
    md: {
      symbol: 'text-sm -top-0.5',
      dollars: 'text-lg sm:text-xl font-medium',
      cents: 'text-xs -top-0.5',
      compare: 'text-xs',
      badge: 'text-[11px] px-2.5 py-0.5',
    },
    lg: {
      symbol: 'text-base -top-1',
      dollars: 'text-2xl sm:text-3xl font-light tracking-tight',
      cents: 'text-sm -top-1',
      compare: 'text-xs sm:text-sm',
      badge: 'text-xs px-3 py-1',
    },
    xl: {
      symbol: 'text-lg sm:text-xl -top-1.5',
      dollars: 'text-3xl sm:text-4xl font-light tracking-tight',
      cents: 'text-base -top-1.5',
      compare: 'text-sm',
      badge: 'text-xs font-semibold px-3 py-1',
    },
  }[size];

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <div className="flex items-baseline gap-2.5 flex-wrap">
        {/* Luxury Discount Badge */}
        {showDiscount && hasDiscount && discountPercent > 0 && (
          <span
            className={`rounded-full bg-[#181613] text-[#d6be90] border border-[#c5a059]/40 dark:bg-[#1a202c] dark:text-[#f0dcb0] font-sans font-semibold tracking-wider uppercase shadow-xs ${sizeClasses.badge}`}
          >
            -{discountPercent}% Privilège
          </span>
        )}

        {/* Main Price in Editorial Serif with Champagne Gold Symbol */}
        <div className="flex items-start text-[#141312] dark:text-[#f8f5ee] leading-none font-serif">
          <span className={`relative font-sans font-medium text-[#9b8353] dark:text-[#d6be90] mr-1 ${sizeClasses.symbol}`}>
            {country.symbol}
          </span>
          <span className={`${sizeClasses.dollars} text-[#141312] dark:text-[#f8f5ee]`}>
            {intPart.toLocaleString(country.locale)}
          </span>
          {decPart && (
            <span className={`relative font-sans text-[#786b58] dark:text-[#c4b59d] ml-0.5 ${sizeClasses.cents}`}>
              .{decPart}
            </span>
          )}
        </div>
      </div>

      {/* Compare at / List Price */}
      {hasDiscount && localCompare && (
        <div className={`text-[#8e816e] dark:text-[#8d98ae] tracking-wide flex items-center gap-1.5 ${sizeClasses.compare}`}>
          <span className="uppercase text-[10px] tracking-widest text-[#a89c89]">Atelier Value:</span>
          <span className="line-through font-serif decoration-[#c5a059]/50">
            {country.symbol}
            {isNoDecimalsCurrency
              ? localCompare.toLocaleString(country.locale)
              : localCompare.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
