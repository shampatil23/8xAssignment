'use client';
// ============================================================================
// SearchFilters — Valenza Maison Curated Facet & Atelier Refinements
// Palette: Warm Ivory (#faf9f6), Champagne Gold (#c5a059, #dfba73), Obsidian (#141312)
// ============================================================================
import React, { useState } from 'react';
import { Star, RotateCcw, MapPin, Check, Gem, ShieldCheck, Globe, Sliders } from 'lucide-react';
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
    <aside
      className={`rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 backdrop-blur-xl p-5 sm:p-6 shadow-[0_10px_35px_rgba(26,23,20,0.03)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)] flex flex-col gap-6 text-xs text-[#141312] dark:text-[#f8f5ee] ${className}`}
    >
      {/* Header / Active Filters Reset */}
      <div className="flex items-center justify-between border-b border-[#f0eae0] dark:border-[#1e2433] pb-4">
        <div className="flex items-center gap-2">
          <Sliders size={14} className="text-[#8a6827] dark:text-[#dfba73]" />
          <h2 className="font-serif text-sm font-semibold tracking-wide uppercase text-[#141312] dark:text-[#f8f5ee]">
            Refine Atelier
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-[#8a6827] dark:text-[#dfba73] hover:text-[#b89047] dark:hover:text-[#f3d08c] transition-colors cursor-pointer"
          >
            <RotateCcw size={11} /> Reset
          </button>
        )}
      </div>

      {/* ── 1. Category / Department ── */}
      {facets.categories.length > 0 && (
        <div className="border-b border-[#f0eae0] dark:border-[#1e2433] pb-5">
          <h3 className="font-serif text-[11px] uppercase tracking-[0.22em] font-semibold text-[#8a6827] dark:text-[#dfba73] mb-3">
            Salons &amp; Departments
          </h3>
          <ul className="space-y-2">
            <li>
              <button
                type="button"
                onClick={() => onFilterChange({ category: undefined, page: 1 })}
                className={`flex items-center justify-between w-full text-left py-1 px-2 rounded-xl transition-all cursor-pointer ${
                  !appliedParams.category
                    ? 'bg-[#f6efe1] dark:bg-[#1a2130] font-semibold text-[#8a6827] dark:text-[#dfba73]'
                    : 'text-[#6e6353] dark:text-[#a0a6b5] hover:text-[#141312] dark:hover:text-[#f8f5ee] hover:bg-[#faf7f2] dark:hover:bg-[#181d2a]'
                }`}
              >
                <span>All Salons</span>
                {!appliedParams.category && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
                )}
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
                    className={`flex items-center justify-between w-full text-left py-1 px-2 rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#f6efe1] dark:bg-[#1a2130] font-semibold text-[#8a6827] dark:text-[#dfba73]'
                        : 'text-[#6e6353] dark:text-[#a0a6b5] hover:text-[#141312] dark:hover:text-[#f8f5ee] hover:bg-[#faf7f2] dark:hover:bg-[#181d2a]'
                    }`}
                  >
                    <span className="truncate">{cat.label}</span>
                    <span className="text-[10px] font-mono text-[#9b8d7c] dark:text-[#6e778e] ml-2 px-1.5 py-0.5 rounded bg-[#f3ede1]/50 dark:bg-[#202738]/60">
                      {cat.count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── 2. Customer Reviews ── */}
      <div className="border-b border-[#f0eae0] dark:border-[#1e2433] pb-5">
        <h3 className="font-serif text-[11px] uppercase tracking-[0.22em] font-semibold text-[#8a6827] dark:text-[#dfba73] mb-3">
          Client Appraisals
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
                className={`flex items-center justify-between w-full text-left py-1.5 px-2 rounded-xl transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#f6efe1] dark:bg-[#1a2130] font-semibold text-[#8a6827] dark:text-[#dfba73]'
                    : 'text-[#6e6353] dark:text-[#a0a6b5] hover:text-[#141312] dark:hover:text-[#f8f5ee] hover:bg-[#faf7f2] dark:hover:bg-[#181d2a]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center text-[#dfba73]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={13}
                        className={
                          i < stars
                            ? 'fill-[#dfba73] text-[#dfba73]'
                            : 'text-[#d8cfc4] dark:text-[#383e50] fill-[#ede6dc] dark:fill-[#1e2433]'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xs ml-1 font-medium">&amp; Up</span>
                </div>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. Brands / Ateliers ── */}
      {facets.brands.length > 0 && (
        <div className="border-b border-[#f0eae0] dark:border-[#1e2433] pb-5">
          <h3 className="font-serif text-[11px] uppercase tracking-[0.22em] font-semibold text-[#8a6827] dark:text-[#dfba73] mb-3">
            Maison &amp; Ateliers
          </h3>
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {facets.brands.map((b) => {
              const isSelected =
                appliedParams.brand?.toLowerCase() === b.value.toLowerCase();
              return (
                <label
                  key={b.value}
                  className="flex items-center justify-between gap-2 py-1 px-1.5 rounded-lg cursor-pointer text-[#6e6353] dark:text-[#a0a6b5] hover:text-[#141312] dark:hover:text-[#f8f5ee] hover:bg-[#faf7f2] dark:hover:bg-[#181d2a] select-none transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        onFilterChange({
                          brand: isSelected ? undefined : b.value,
                          page: 1,
                        })
                      }
                      className="rounded border-[#dfd6c5] dark:border-[#383e50] text-[#c5a059] focus:ring-[#c5a059] h-3.5 w-3.5 cursor-pointer accent-[#c5a059]"
                    />
                    <span className="truncate text-xs font-medium">{b.label}</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#9b8d7c] dark:text-[#6e778e] shrink-0">
                    ({b.count})
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 4. Delivery & Location Concierge ── */}
      <div className="border-b border-[#f0eae0] dark:border-[#1e2433] pb-5">
        <h3 className="font-serif text-[11px] uppercase tracking-[0.22em] font-semibold text-[#8a6827] dark:text-[#dfba73] mb-3">
          Concierge Destination
        </h3>
        <div className="bg-[#fbfaf8] dark:bg-[#161a25] rounded-2xl p-3.5 border border-[#ebe2d1] dark:border-[#262c3d] space-y-2">
          <div className="flex items-center gap-2 text-xs text-[#141312] dark:text-[#f8f5ee]">
            <MapPin size={14} className="text-[#8a6827] dark:text-[#dfba73] shrink-0" />
            <span className="truncate">
              Shipping to <strong>{country.name}</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={openLocationModal}
            className="text-[11px] text-[#8a6827] dark:text-[#dfba73] font-semibold hover:underline block cursor-pointer transition-colors"
          >
            Change destination / currency ({country.symbol} {country.currency}) →
          </button>
        </div>
      </div>

      {/* ── 5. Price Filter ── */}
      <div className="border-b border-[#f0eae0] dark:border-[#1e2433] pb-5">
        <h3 className="font-serif text-[11px] uppercase tracking-[0.22em] font-semibold text-[#8a6827] dark:text-[#dfba73] mb-3">
          Valuation ({country.symbol})
        </h3>

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
                className={`flex items-center justify-between w-full text-left py-1 px-2 rounded-xl transition-all cursor-pointer ${
                  isMatch
                    ? 'bg-[#f6efe1] dark:bg-[#1a2130] font-semibold text-[#8a6827] dark:text-[#dfba73]'
                    : 'text-[#6e6353] dark:text-[#a0a6b5] hover:text-[#141312] dark:hover:text-[#f8f5ee] hover:bg-[#faf7f2] dark:hover:bg-[#181d2a]'
                }`}
              >
                <span>{bracket.label}</span>
                {isMatch && <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />}
              </button>
            );
          })}
        </div>

        {/* Custom Min / Max input with active currency symbol */}
        <form onSubmit={handlePriceSubmit} className="flex items-center gap-2 mt-2">
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-2 text-[#9b8d7c] text-[11px] font-semibold">
              {country.symbol}
            </span>
            <input
              type="number"
              placeholder="Min"
              min="0"
              value={customMin}
              onChange={(e) => setCustomMin(e.target.value)}
              className="w-full rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fbfaf8] dark:bg-[#161a25] py-1.5 pl-6 pr-2 text-xs text-[#141312] dark:text-[#f8f5ee] focus:outline-none focus:border-[#c5a059] dark:focus:border-[#dfba73]"
            />
          </div>
          <span className="text-[#a89b88] dark:text-[#6e778e]">—</span>
          <div className="relative flex-1">
            <span className="absolute left-2.5 top-2 text-[#9b8d7c] text-[11px] font-semibold">
              {country.symbol}
            </span>
            <input
              type="number"
              placeholder="Max"
              min="0"
              value={customMax}
              onChange={(e) => setCustomMax(e.target.value)}
              className="w-full rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] bg-[#fbfaf8] dark:bg-[#161a25] py-1.5 pl-6 pr-2 text-xs text-[#141312] dark:text-[#f8f5ee] focus:outline-none focus:border-[#c5a059] dark:focus:border-[#dfba73]"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl bg-gradient-to-r from-[#c5a059] to-[#a88237] text-[#0d0a06] px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider hover:brightness-105 transition-all shadow-xs cursor-pointer shrink-0"
          >
            Apply
          </button>
        </form>
      </div>

      {/* ── 6. Archival Status & Privileges ── */}
      <div className="space-y-3">
        <h3 className="font-serif text-[11px] uppercase tracking-[0.22em] font-semibold text-[#8a6827] dark:text-[#dfba73]">
          Maison Privileges
        </h3>
        <label className="flex items-center gap-2.5 cursor-pointer text-[#6e6353] dark:text-[#a0a6b5] hover:text-[#141312] dark:hover:text-[#f8f5ee] select-none transition-colors">
          <input
            type="checkbox"
            checked={Boolean(appliedParams.inStockOnly)}
            onChange={(e) =>
              onFilterChange({
                inStockOnly: e.target.checked || undefined,
                page: 1,
              })
            }
            className="rounded border-[#dfd6c5] dark:border-[#383e50] text-[#c5a059] focus:ring-[#c5a059] h-3.5 w-3.5 cursor-pointer accent-[#c5a059]"
          />
          <span className="text-xs font-medium">In Private Vault Only</span>
        </label>

        <label className="flex items-center gap-2.5 cursor-pointer text-[#6e6353] dark:text-[#a0a6b5] hover:text-[#141312] dark:hover:text-[#f8f5ee] select-none transition-colors">
          <input
            type="checkbox"
            checked={Boolean(appliedParams.isPrimeOnly)}
            onChange={(e) =>
              onFilterChange({
                isPrimeOnly: e.target.checked || undefined,
                page: 1,
              })
            }
            className="rounded border-[#dfd6c5] dark:border-[#383e50] text-[#c5a059] focus:ring-[#c5a059] h-3.5 w-3.5 cursor-pointer accent-[#c5a059]"
          />
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8a6827] dark:text-[#dfba73]">
            <Gem size={12} className="text-[#c5a059]" />
            <span>Valenza White-Glove Transit</span>
          </span>
        </label>
      </div>
    </aside>
  );
}
