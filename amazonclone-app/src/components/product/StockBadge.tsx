'use client';
// ============================================================================
// StockBadge — Valenza Maison Allocation & Vault Availability Indicator
// ============================================================================
import React from 'react';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import type { ProductStatus } from '@/types';

interface StockBadgeProps {
  stock: number;
  status?: ProductStatus;
  className?: string;
}

export function StockBadge({ stock, status = 'active', className = '' }: StockBadgeProps) {
  if (status === 'out_of_stock' || stock <= 0) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4ece1] dark:bg-[#1a202c] border border-[#dfd6c5] dark:border-[#2f384d] text-xs text-[#786b58] dark:text-[#a09a8e] ${className}`}>
        <AlertCircle size={13} className="text-[#9b8353]" />
        <span className="font-semibold uppercase tracking-wider text-[10px]">Privately Allocated</span>
      </div>
    );
  }

  if (stock <= 5) {
    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs ${className}`}>
        <Clock size={13} className="text-[#c5a059]" />
        <span className="font-medium">Limited Allocation — Only {stock} pieces remaining</span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs ${className}`}>
      <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" />
      <span className="font-medium tracking-wide">Available in Maison Vault</span>
    </div>
  );
}
