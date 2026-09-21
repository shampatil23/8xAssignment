'use client';
// ============================================================================
// SearchFilters — Amazon-style left sidebar facet filtering
// ============================================================================
import React, { useState } from 'react';
import { Star, Check, X, RotateCcw } from 'lucide-react';
import type { SearchFacets, SearchParams } from '@/services/searchService';

interface SearchFiltersProps {
  facets: SearchFacets;
  appliedParams: SearchParams;
  onFilterChange: (newParams: Partial<SearchParams>) => void;
  onClearFilters: () => void;
  className?: string;
}

export function SearchFilters({
  facets,
  appliedParams,
  onFilterChange,
  onClearFilters,
  className = '',
}: SearchFiltersProps) {
  const [customMin, setCustomMin] = useState(
    appliedParams.minPrice ? appliedParams.minPrice.toString() : '',
  );
  const [customMax, setCustomMax] = useState(
    appliedParams.maxPrice ? appliedParams.maxPrice.toString() : '',
  );

  function handlePriceSubmit(e: React.FormEvent) {
    e.preventDefault();
    const min = customMin ? parseFloat(customMin) : undefined;
    const max = customMax ? parseFloat(customMax) : undefined;
    onFilterChange({
      minPrice: min && !isNaN(min) ? min : undefined,
      maxPrice: max && !isNaN(max) ? max : undefined,
      page: 1,
    });
  }

  const hasActiveFilters = Boolean(
    appliedParams.brand ||
    appliedParams.category ||
    appliedParams.minPrice ||
    appliedParams.maxPrice ||
    appliedParams.minRating ||
    appliedParams.inStockOnly ||
    appliedParams.isPrimeOnly,
  );

  return (
    <aside className={`flex flex-col gap-6 text-xs text-gray-800 ${className}`}>
      {/* Clear all filters */}
      {hasActiveFilters && (
        <div className="flex items-center justify-between border-b pb-3">
          <span className="font-bold text-gray-900">Active Filters</span>
          <button
            type="button"
            onClick={onClearFilters}
            className="flex items-center gap-1 font-semibold text-amazon-link hover:text-amazon-link-hover hover:underline"
          >
            <RotateCcw size={12} /> Clear all
          </button>
        </div>
      )}

      {/* ── 1. Category / Department ── */}
      {facets.categories.length > 0 && (
        <div className="border-b pb-5">
          <h3 className="font-bold text-sm text-gray-900 mb-2">Department</h3>
          <ul className="space-y-1.5">
            <li>
              <button
                type="button"
                onClick={() => onFilterChange({ category: undefined, page: 1 })}
                className={`text-left hover:text-amazon-link transition-colors ${
                  !appliedParams.category
                    ? 'font-bold text-amazon-orange'
                    : 'text-gray-700'
                }`}
              >
                All Departments
              </button>
            </li>
            {facets.categories.map((cat) => {
              const isSelected = appliedParams.category === cat.value;
              return (
                <li key={cat.value}>
                  <button
                    type="button"
                    onClick={() =>
                      onFilterChange({
                        category: isSelected ? undefined : cat.value,
                        page: 1,
                      })
                    }
                    className={`flex items-center justify-between w-full text-left hover:text-amazon-link transition-colors ${
                      isSelected
                        ? 'font-bold text-amazon-orange'
                        : 'text-gray-700'
                    }`}
                  >
                    <span className="truncate">{cat.label}</span>
                    <span className="text-gray-400 text-[11px] ml-1">
                      ({cat.count})
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── 2. Customer Reviews ── */}
      <div className="border-b pb-5">
        <h3 className="font-bold text-sm text-gray-900 mb-2">
          Customer Reviews
        </h3>
        <div className="space-y-2">
          {[4, 3, 2, 1].map((stars) => {
            const isSelected = appliedParams.minRating === stars;
            return (
              <button
                key={stars}
                type="button"
                onClick={() =>
                  onFilterChange({
                    minRating: isSelected ? undefined : stars,
                    page: 1,
                  })
                }
                className={`flex items-center gap-1.5 w-full text-left hover:text-amazon-link ${
                  isSelected ? 'font-bold text-amazon-orange' : 'text-gray-700'
                }`}
              >
                <div className="flex items-center text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={14}
                      className={
                        i < stars
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-gray-300 fill-gray-100'
                      }
                    />
                  ))}
                </div>
                <span>&amp; Up</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Brands ── */}
      {facets.brands.length > 0 && (
        <div className="border-b pb-5">
          <h3 className="font-bold text-sm text-gray-900 mb-2">Brands</h3>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {facets.brands.map((b) => {
              const isSelected =
                appliedParams.brand?.toLowerCase() === b.value.toLowerCase();
              return (
                <label
                  key={b.value}
                  className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-amazon-link select-none"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() =>
                      onFilterChange({
                        brand: isSelected ? undefined : b.value,
                        page: 1,
                      })
                    }
                    className="rounded border-gray-300 text-amazon-orange focus:ring-amazon-orange h-3.5 w-3.5 cursor-pointer"
                  />
                  <span className="truncate">{b.label}</span>
                  <span className="text-gray-400 text-[11px] ml-auto">
                    ({b.count})
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4. Price Filter ── */}
      <div className="border-b pb-5">
        <h3 className="font-bold text-sm text-gray-900 mb-2">Price</h3>

        {/* Quick price brackets */}
        <div className="space-y-1.5 mb-3">
          {[
            { label: 'Under $25', max: 25 },
            { label: '$25 to $50', min: 25, max: 50 },
            { label: '$50 to $100', min: 50, max: 100 },
            { label: '$100 to $300', min: 100, max: 300 },
            { label: '$300 & Above', min: 300 },
          ].map((bracket) => {
            const isMatch =
              appliedParams.minPrice === bracket.min &&
              appliedParams.maxPrice === bracket.max;
            return (
              <button
                key={bracket.label}
                type="button"
                onClick={() => {
                  onFilterChange({
                    minPrice: isMatch ? undefined : bracket.min,
                    maxPrice: isMatch ? undefined : bracket.max,
                    page: 1,
                  });
                  setCustomMin(bracket.min ? bracket.min.toString() : '');
                  setCustomMax(bracket.max ? bracket.max.toString() : '');
                }}
                className={`block w-full text-left hover:text-amazon-link ${
                  isMatch ? 'font-bold text-amazon-orange' : 'text-gray-700'
                }`}
              >
                {bracket.label}
              </button>
            );
          })}
        </div>

        {/* Custom Min / Max input */}
        <form onSubmit={handlePriceSubmit} className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <span className="absolute left-2 top-1.5 text-gray-400">$</span>
            <input
              type="number"
              placeholder="Min"
              min="0"
              value={customMin}
              onChange={(e) => setCustomMin(e.target.value)}
              className="w-full rounded border border-gray-300 py-1 pl-5 pr-1 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amazon-orange"
            />
          </div>
          <span className="text-gray-400">-</span>
          <div className="relative flex-1">
            <span className="absolute left-2 top-1.5 text-gray-400">$</span>
            <input
              type="number"
              placeholder="Max"
              min="0"
              value={customMax}
              onChange={(e) => setCustomMax(e.target.value)}
              className="w-full rounded border border-gray-300 py-1 pl-5 pr-1 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amazon-orange"
            />
          </div>
          <button
            type="submit"
            className="rounded border border-gray-400 bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-800 hover:bg-gray-100 cursor-pointer"
          >
            Go
          </button>
        </form>
      </div>

      {/* ── 5. Availability & Prime ── */}
      <div className="pb-2">
        <h3 className="font-bold text-sm text-gray-900 mb-2">Availability</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer text-gray-700 select-none">
            <input
              type="checkbox"
              checked={Boolean(appliedParams.inStockOnly)}
              onChange={(e) =>
                onFilterChange({
                  inStockOnly: e.target.checked || undefined,
                  page: 1,
                })
              }
              className="rounded border-gray-300 text-amazon-orange focus:ring-amazon-orange h-3.5 w-3.5 cursor-pointer"
            />
            <span>Include In Stock Only</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-gray-700 select-none">
            <input
              type="checkbox"
              checked={Boolean(appliedParams.isPrimeOnly)}
              onChange={(e) =>
                onFilterChange({
                  isPrimeOnly: e.target.checked || undefined,
                  page: 1,
                })
              }
              className="rounded border-gray-300 text-amazon-orange focus:ring-amazon-orange h-3.5 w-3.5 cursor-pointer"
            />
            <span className="inline-flex items-center gap-1 font-bold text-[#00a8e1] text-[11px]">
              <Check size={12} strokeWidth={3} /> prime
            </span>
          </label>
        </div>
      </div>
    </aside>
  );
}
