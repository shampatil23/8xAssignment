'use client';
// ============================================================================
// VariantSelector — Amazon-style variant picker (Color, Size, Storage, Format)
// ============================================================================
import React from 'react';
import type { ProductVariant } from '@/types';

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
  if (!variants || variants.length === 0) return null;

  const activeVariant =
    variants.find((v) => v.id === selectedVariantId) || variants[0];

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Style / Option:
          </span>
          <span className="text-sm font-bold text-gray-900">
            {activeVariant.title}
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {variants.map((v) => {
            const isSelected = v.id === activeVariant.id;
            const isOutOfStock = v.stock <= 0;
            const isLowStock = v.stock > 0 && v.stock <= 3;

            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onSelectVariant(v)}
                disabled={isOutOfStock}
                className={`relative flex flex-col items-start rounded-md border px-3 py-2 text-left transition-all ${
                  isSelected
                    ? 'border-amazon-orange bg-amber-50/40 ring-2 ring-amazon-orange shadow-xs'
                    : isOutOfStock
                    ? 'border-dashed border-gray-300 bg-gray-100/60 text-gray-400 opacity-60 cursor-not-allowed'
                    : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 cursor-pointer'
                }`}
                title={isOutOfStock ? 'This option is currently out of stock' : undefined}
              >
                <span className={`text-xs font-semibold ${isSelected ? 'text-amazon-orange font-bold' : 'text-gray-900'}`}>
                  {v.title}
                </span>
                <span className="text-xs text-gray-700 font-medium mt-0.5">
                  ${v.price.toFixed(2)}
                </span>
                {isOutOfStock ? (
                  <span className="text-[10px] text-red-600 font-semibold mt-0.5">
                    Unavailable
                  </span>
                ) : isLowStock ? (
                  <span className="text-[10px] text-[#b12704] font-medium mt-0.5">
                    Only {v.stock} left!
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
