'use client';
// ============================================================================
// StockBadge — Amazon-style stock availability indicator
// ============================================================================
import React from 'react';
import type { ProductStatus } from '@/types';

interface StockBadgeProps {
  stock: number;
  status?: ProductStatus;
  className?: string;
}

export function StockBadge({ stock, status = 'active', className = '' }: StockBadgeProps) {
  if (status === 'out_of_stock' || stock <= 0) {
    return (
      <span className={`text-sm font-semibold text-red-700 ${className}`}>
        Currently unavailable.
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className={`text-sm font-medium text-amber-700 ${className}`}>
        Only {stock} left in stock - order soon.
      </span>
    );
  }

  return (
    <span className={`text-sm font-medium text-green-700 ${className}`}>
      In Stock
    </span>
  );
}
