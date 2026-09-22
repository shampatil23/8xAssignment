'use client';
// ============================================================================
// SearchFilters — Amazon-style left sidebar facet filtering
// ============================================================================
import React, { useState } from 'react';
import { Star, Check, X, RotateCcw, MapPin } from 'lucide-react';
import type { SearchFacets, SearchParams } from '@/services/searchService';
import { useLocation } from '@/context/LocationContext';

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
  const { country, openLocationModal } = useLocation();

  // Convert applied base USD prices to local currency for display in custom input
  const initialLocalMin = appliedParams.minPrice
    ? Math.round(appliedParams.minPrice * country.rate).toString()
    : '';
  const initialLocalMax = appliedParams.maxPrice
    ? Math.round(appliedParams.maxPrice * country.rate).toString()
    : '';

  const [customMin, setCustomMin] = useState(initialLocalMin);
  const [customMax, setCustomMax] = useState(initialLocalMax);

  function handlePriceSubmit(e: React.FormEvent) {
    e.preventDefault();
    const rawMin = customMin ? parseFloat(customMin) : undefined;
    const rawMax = customMax ? parseFloat(customMax) : undefined;

    // Convert local currency input back to base USD for catalog querying
    const baseMin = rawMin && !isNaN(rawMin) ? Math.round(rawMin / country.rate) : undefined;
    const baseMax = rawMax && !isNaN(rawMax) ? Math.round(rawMax / country.rate) : undefined;

    onFilterChange({
      minPrice: baseMin,
      maxPrice: baseMax,
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

      {/* ── 4. Delivery & Location ── */}
      <div className="border-b pb-5">
        <h3 className="font-bold text-sm text-gray-900 mb-2">Delivery &amp; Location</h3>
        <div className="bg-gray-50 rounded p-2.5 border border-gray-200 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-800">
            <MapPin size={13} className="text-amazon-orange shrink-0" />
            <span className="truncate">Shipping to <strong>{country.name}</strong></span>
          </div>
          <button
            type="button"
            onClick={openLocationModal}
            className="text-[11px] text-amazon-link font-medium hover:underline block"
          >
            Change destination / currency ({country.symbol})
          </button>
        </div>
      </div>

      {/* ── 5. Price Filter ── */}
      <div className="border-b pb-5">
        <h3 className="font-bold text-sm text-gray-900 mb-2">Price ({country.symbol} {country.currency})</h3>

        {/* Quick price brackets based on selected country */}
        <div className="space-y-1.5 mb-3">
          {country.priceBrackets.map((bracket) => {
            const baseMin = bracket.min ? Math.round(bracket.min / country.rate) : undefined;
            const baseMax = bracket.max ? Math.round(bracket.max / country.rate) : undefined;
            const isMatch =
              appliedParams.minPrice === baseMin &&
              appliedParams.maxPrice === baseMax;
            return (
              <button
                key={bracket.label}
                type="button"
                onClick={() => {
                  onFilterChange({
                    minPrice: isMatch ? undefined : baseMin,
                    maxPrice: isMatch ? undefined : baseMax,
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

        {/* Custom Min / Max input with active currency symbol */}
        <form onSubmit={handlePriceSubmit} className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <span className="absolute left-1.5 top-1.5 text-gray-500 text-[11px] font-medium">{country.symbol}</span>
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
            <span className="absolute left-1.5 top-1.5 text-gray-500 text-[11px] font-medium">{country.symbol}</span>
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
