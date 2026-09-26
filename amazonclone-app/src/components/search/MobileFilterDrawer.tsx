'use client';
// ============================================================================
// MobileFilterDrawer — Valenza Maison Slide-over Refinements Drawer
// ============================================================================
import React, { useEffect } from 'react';
import { X, Sliders } from 'lucide-react';
import { SearchFilters } from './SearchFilters';
import type { SearchFacets, SearchParams } from '@/services/searchService';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  facets: SearchFacets;
  appliedParams: SearchParams;
  totalResults: number;
  onFilterChange: (newParams: Partial<SearchParams>) => void;
  onClearFilters: () => void;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  facets,
  appliedParams,
  totalResults,
  onFilterChange,
  onClearFilters,
}: MobileFilterDrawerProps) {
  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKey);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className="relative ml-auto flex h-full w-full max-w-sm flex-col bg-[#faf9f6] dark:bg-[#10131c] text-[#141312] dark:text-[#f8f5ee] border-l border-[#ebe2d1] dark:border-[#262c3d] shadow-2xl animate-[slideInRight_0.25s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#f0eae0] dark:border-[#1e2433] px-6 py-4">
          <div className="flex items-center gap-2">
            <Sliders size={16} className="text-[#8a6827] dark:text-[#dfba73]" />
            <h2 className="font-serif text-sm font-semibold tracking-wide uppercase text-[#141312] dark:text-[#f8f5ee]">
              Refine Atelier
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-[#8a7b68] hover:text-[#141312] dark:hover:text-[#f8f5ee] hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close filters"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filters Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <SearchFilters
            facets={facets}
            appliedParams={appliedParams}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
            className="border-0 shadow-none p-0 bg-transparent dark:bg-transparent"
          />
        </div>

        {/* Footer */}
        <div className="border-t border-[#f0eae0] dark:border-[#1e2433] bg-[#faf9f6]/95 dark:bg-[#10131c]/95 p-4 sm:p-5 flex gap-3">
          <button
            type="button"
            onClick={onClearFilters}
            className="flex-1 py-3 rounded-xl border border-[#dfd6c5] dark:border-[#2f384d] text-xs uppercase tracking-wider font-semibold text-[#8a7b68] dark:text-[#a0a6b5] hover:text-[#141312] dark:hover:text-[#f8f5ee] transition-all cursor-pointer text-center"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#c5a059] to-[#a88237] text-[#0d0a06] text-xs uppercase tracking-wider font-bold hover:brightness-105 transition-all shadow-sm cursor-pointer text-center"
          >
            Show {totalResults} Pieces
          </button>
        </div>
      </div>
    </div>
  );
}

