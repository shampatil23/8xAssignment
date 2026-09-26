'use client';
// ============================================================================
// VariantSelector — Valenza Maison Bespoke Options & Swatches
// ============================================================================
import React from 'react';
import type { ProductVariant } from '@/types';
import { useLocation } from '@/context/LocationContext';

interface VariantSelectorProps {
  variants: ProductVariant[];
  selectedVariantId?: string;
  onSelectVariant: (variant: ProductVariant) => void;
  className?: string;
}

export function VariantSelector({
  variants,
  selectedVariantId,
  onSelectVariant,
  className = '',
}: VariantSelectorProps) {
  const { country, convertPrice } = useLocation();
  if (!variants || variants.length === 0) return null;

  const activeVariant =
    variants.find((v) => v.id === selectedVariantId) || variants[0];

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div>
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#786b58] dark:text-[#a89c89]">
            Selected Edition / Atelier Spec:
          </span>
          <span className="text-xs font-semibold text-[#141312] dark:text-[#f8f5ee]">
            {activeVariant.title}
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {variants.map((v) => {
            const isSelected = v.id === activeVariant.id;
            const isOutOfStock = v.stock <= 0;
            const isLowStock = v.stock > 0 && v.stock <= 3;
            const localPrice = convertPrice(v.price);

            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectVariant(v)}
                disabled={isOutOfStock}
                className={`relative flex flex-col items-start rounded-2xl border px-4 py-2.5 text-left transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-[#c5a059] bg-[#fdfbf7] dark:bg-[#1c2230] ring-2 ring-[#c5a059]/30 shadow-xs'
                    : isOutOfStock
                    ? 'border-dashed border-[#ebe2d1] dark:border-[#222838] bg-[#f5f1e8]/50 dark:bg-[#12151f]/50 text-[#9e9382] opacity-50 cursor-not-allowed'
                    : 'border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#161a25] hover:border-[#c5a059]/60 hover:shadow-sm'
                }`}
                title={isOutOfStock ? 'This allocation is currently reserved' : undefined}
              >
                <span className={`text-xs font-semibold ${isSelected ? 'text-[#9b8353] dark:text-[#e8d5b5]' : 'text-[#141312] dark:text-[#f8f5ee]'}`}>
                  {v.title}
                </span>
                <span className="text-xs font-serif font-medium text-[#615442] dark:text-[#c4b59d] mt-0.5">
                  {country.symbol}{Math.floor(localPrice).toLocaleString(country.locale)}
                </span>
                {isOutOfStock ? (
                  <span className="text-[10px] uppercase tracking-wider text-[#9e9382] font-semibold mt-0.5">
                    Vault Reserved
                  </span>
                ) : isLowStock ? (
                  <span className="text-[10px] uppercase tracking-wider text-[#b8860b] font-semibold mt-0.5">
                    Only {v.stock} in Atelier
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
