'use client';
// ============================================================================
// PriceDisplay — Amazon-style price typography
// Displays currency symbol as superscript, dollar amount in bold,
// and cents as superscript, with optional list price and discount badge.
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
      dollars: 'text-base font-bold',
      cents: 'text-xs top-0',
      compare: 'text-xs',
      badge: 'text-xs px-1.5 py-0.5',
    },
    md: {
      symbol: 'text-xs -top-1',
      dollars: 'text-xl font-bold',
      cents: 'text-xs -top-1',
      compare: 'text-xs',
      badge: 'text-xs px-2 py-0.5',
    },
    lg: {
      symbol: 'text-sm -top-1.5',
      dollars: 'text-2xl font-bold',
      cents: 'text-sm -top-1.5',
      compare: 'text-sm',
      badge: 'text-sm px-2.5 py-1',
    },
    xl: {
      symbol: 'text-base -top-2',
      dollars: 'text-3xl font-extrabold',
      cents: 'text-base -top-2',
      compare: 'text-sm',
      badge: 'text-sm font-semibold px-2.5 py-1',
    },
  }[size];

  return (
    <div className={`flex flex-col gap-0.5 ${className}`}>
      <div className="flex items-baseline gap-2 flex-wrap">
        {/* Discount badge if on sale */}
        {showDiscount && hasDiscount && discountPercent > 0 && (
          <span
            className={`rounded bg-red-700 font-medium text-white ${sizeClasses.badge}`}
          >
            -{discountPercent}%
          </span>
        )}

        {/* Main price with Amazon superscript styling */}
        <div className="flex items-start text-gray-900 leading-none">
          <span className={`relative font-medium mr-0.5 ${sizeClasses.symbol}`}>
            {country.symbol}
          </span>
          <span className={sizeClasses.dollars}>{intPart.toLocaleString(country.locale)}</span>
          {decPart && (
            <span className={`relative font-medium ${sizeClasses.cents}`}>{decPart}</span>
          )}
        </div>
      </div>

      {/* Compare at / List price */}
      {hasDiscount && localCompare && (
        <div className={`text-gray-500 ${sizeClasses.compare}`}>
          <span>List Price: </span>
          <span className="line-through">
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
