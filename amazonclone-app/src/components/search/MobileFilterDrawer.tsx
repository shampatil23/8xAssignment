'use client';
// ============================================================================
// MobileFilterDrawer — Slide-over drawer for filters on mobile viewport
// ============================================================================
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { SearchFilters } from './SearchFilters';
import type { SearchFacets, SearchParams } from '@/services/searchService';
import { Button } from '@/components/ui/Button';

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
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white shadow-2xl animate-[slideInRight_0.2s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-base font-bold text-gray-900">Filters</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
            aria-label="Close filters"
          >
            <X size={20} />
          </button>
        </div>

        {/* Filters Body */}
        <div className="flex-1 overflow-y-auto p-4">
          <SearchFilters
            facets={facets}
            appliedParams={appliedParams}
            onFilterChange={onFilterChange}
            onClearFilters={onClearFilters}
          />
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClearFilters}
            className="flex-1"
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
            className="flex-1"
          >
            See {totalResults} Results
          </Button>
        </div>
      </div>
    </div>
  );
}
