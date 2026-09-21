'use client';
// ============================================================================
// SearchBar — Amazon-style search with category dropdown
// ============================================================================
import React, { useState, useRef, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SEARCH_CATEGORIES } from '@/lib/constants';

export function SearchBar() {
  const router = useRouter();
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const params = new URLSearchParams({ q });
    if (category !== 'all') params.set('cat', category);
    router.push(`/search?${params.toString()}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-10 flex-1 overflow-hidden rounded"
      role="search"
      aria-label="Search Amazon"
    >
      {/* Category dropdown */}
      <div className="relative flex-shrink-0">
        <select
          id="search-category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="
            h-full appearance-none rounded-l border-r border-gray-400
            bg-gray-100 pl-3 pr-7 text-xs text-gray-700
            hover:bg-gray-200 focus:outline-none cursor-pointer
          "
          aria-label="Search category"
        >
          {SEARCH_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {/* Chevron icon */}
        <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 text-[10px]">
          ▼
        </span>
      </div>

      {/* Search input */}
      <input
        ref={inputRef}
        id="search-input"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search Amazon"
        className="
          min-w-0 flex-1 border-0 bg-white px-4 text-sm text-gray-900
          placeholder:text-gray-400
          focus:outline-none
        "
        aria-label="Search"
      />

      {/* Search button */}
      <button
        type="submit"
        id="search-submit-btn"
        className="
          flex items-center justify-center px-4
          bg-amazon-yellow hover:bg-amazon-yellow-dark
          rounded-r transition-colors duration-150
          focus:outline-none focus-visible:ring-2 focus-visible:ring-amazon-orange
        "
        aria-label="Submit search"
      >
        <Search size={18} className="text-amazon-dark" />
      </button>
    </form>
  );
}
