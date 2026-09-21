'use client';
// ============================================================================
// SearchBar — Amazon-style search with category dropdown & debounced suggestions
// ============================================================================
import React, { useState, useRef, useEffect, type FormEvent } from 'react';
import { Search, ArrowUpLeft, Tag, Layers } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SEARCH_CATEGORIES } from '@/lib/constants';
import { useDebounce } from '@/hooks/useDebounce';
import { getSearchSuggestions, type SearchSuggestion } from '@/services/searchService';

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState(searchParams.get('category') || 'all');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 200);

  // Sync input value if URL search param changes
  useEffect(() => {
    const q = searchParams.get('q');
    if (q !== null && q !== query) {
      setQuery(q);
    }
    const cat = searchParams.get('category');
    if (cat) {
      setCategory(cat);
    }
  }, [searchParams]);

  // Fetch suggestions on debounced query change
  useEffect(() => {
    let isCancelled = false;

    async function fetchSuggestions() {
      if (!debouncedQuery || debouncedQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      const res = await getSearchSuggestions(debouncedQuery, category);
      if (!isCancelled && res.success && res.data) {
        setSuggestions(res.data);
      }
    }

    fetchSuggestions();
    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery, category]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  function executeSearch(searchQuery: string, cat = category) {
    const q = searchQuery.trim();
    setIsOpen(false);
    if (!q) return;

    const params = new URLSearchParams();
    params.set('q', q);
    if (cat && cat !== 'all') {
      params.set('category', cat);
    }

    router.push(`/search?${params.toString()}`);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      handleSelectSuggestion(suggestions[activeIndex]);
    } else {
      executeSearch(query);
    }
  }

  function handleSelectSuggestion(suggestion: SearchSuggestion) {
    if (suggestion.type === 'product' && suggestion.slug) {
      setIsOpen(false);
      router.push(`/product/${suggestion.slug}`);
      return;
    }

    if (suggestion.type === 'category' && suggestion.categorySlug) {
      setIsOpen(false);
      router.push(`/category/${suggestion.categorySlug}`);
      return;
    }

    setQuery(suggestion.text);
    executeSearch(suggestion.text);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1,
      );
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <form
        onSubmit={handleSubmit}
        className="flex h-10 w-full overflow-hidden rounded ring-1 ring-transparent focus-within:ring-2 focus-within:ring-amazon-orange"
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
              h-full appearance-none rounded-l border-r border-gray-300
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
          <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 text-[9px]">
            ▼
          </span>
        </div>

        {/* Search input */}
        <input
          ref={inputRef}
          id="search-input"
          type="text"
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search Amazon"
          className="
            min-w-0 flex-1 border-0 bg-white px-3 text-sm text-gray-900
            placeholder:text-gray-400
            focus:outline-none
          "
          aria-label="Search"
          aria-expanded={isOpen && suggestions.length > 0}
          aria-autocomplete="list"
        />

        {/* Search button */}
        <button
          type="submit"
          id="search-submit-btn"
          className="
            flex items-center justify-center px-4
            bg-amazon-yellow hover:bg-amazon-yellow-dark
            rounded-r transition-colors duration-150 cursor-pointer
            focus:outline-none focus-visible:ring-2 focus-visible:ring-amazon-orange
          "
          aria-label="Submit search"
        >
          <Search size={19} className="text-amazon-dark" />
        </button>
      </form>

      {/* ── Suggestions Dropdown Overlay ── */}
      {isOpen && suggestions.length > 0 && (
        <div
          id="search-suggestions-dropdown"
          className="
            absolute left-0 right-0 top-full z-50 mt-1
            overflow-hidden rounded-md border border-gray-300
            bg-white shadow-xl
          "
          role="listbox"
        >
          {suggestions.map((suggestion, index) => {
            const isSelected = index === activeIndex;
            return (
              <div
                key={suggestion.text + index}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => handleSelectSuggestion(suggestion)}
                className={`
                  flex items-center justify-between px-4 py-2.5 text-sm cursor-pointer transition-colors
                  ${isSelected ? 'bg-gray-100 text-gray-900' : 'text-gray-800 hover:bg-gray-50'}
                `}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Search size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate font-normal">
                    {suggestion.text}
                  </span>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0 text-xs text-gray-400">
                  {suggestion.type === 'category' && (
                    <span className="inline-flex items-center gap-1 rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                      <Layers size={10} /> In Department
                    </span>
                  )}
                  {suggestion.type === 'brand' && (
                    <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-700">
                      <Tag size={10} /> Brand
                    </span>
                  )}
                  <ArrowUpLeft size={13} className="text-gray-300 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
