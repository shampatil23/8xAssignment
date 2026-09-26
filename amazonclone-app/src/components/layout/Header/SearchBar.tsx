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
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="
          flex items-center h-10 w-full overflow-hidden rounded-full
          border border-[#dcd4c3] dark:border-[#2f281a]
          bg-white/80 dark:bg-[#121620]/80 backdrop-blur-md
          shadow-[0_2px_10px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_14px_rgba(0,0,0,0.25)]
          focus-within:border-[#b89047] dark:focus-within:border-[#dfba73]
          focus-within:ring-2 focus-within:ring-[#c5a059]/25
          transition-all duration-300
        "
        role="search"
        aria-label="Search Valenza Maison"
      >
        {/* Subtle search icon prefix */}
        <div className="flex items-center pl-3.5 pr-1.5 text-[#9a7833] dark:text-[#dfba73] pointer-events-none">
          <Search size={15} />
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
          placeholder="Search timepieces, fine jewels, haute couture, ateliers..."
          className="
            min-w-0 flex-1 border-0 bg-transparent px-2 text-xs md:text-sm text-[#141312] dark:text-[#f8f5ee]
            placeholder:text-[#9a9184] dark:placeholder:text-[#7d776d]
            placeholder:font-serif placeholder:italic placeholder:tracking-wide
            focus:outline-none
          "
          aria-label="Search"
          aria-expanded={isOpen && suggestions.length > 0}
          aria-autocomplete="list"
        />

        {/* Gold Luxury Submit Button */}
        <button
          type="submit"
          id="search-submit-btn"
          className="
            mr-1 my-auto flex items-center justify-center h-7 px-3.5 rounded-full
            bg-gradient-to-r from-[#c5a059] via-[#dfba73] to-[#9b7532]
            text-[#121110] font-serif text-[10px] tracking-[0.16em] uppercase font-bold
            hover:brightness-110 transition-all duration-200 cursor-pointer shadow-xs
            focus:outline-none active:scale-95
          "
          aria-label="Submit search"
        >
          <span className="hidden sm:inline">Search</span>
          <Search size={12} className="sm:hidden stroke-[2.5]" />
        </button>
      </form>

      {/* ── Suggestions Dropdown Overlay ── */}
      {isOpen && suggestions.length > 0 && (
        <div
          id="search-suggestions-dropdown"
          className="
            absolute left-0 right-0 top-full z-50 mt-1.5
            overflow-hidden rounded-xl border border-[#dcd4c3] dark:border-[#382f1d]
            bg-[#faf9f6]/95 dark:bg-[#121620]/95 backdrop-blur-xl
            shadow-[0_12px_36px_rgba(0,0,0,0.12)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.5)]
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
                  flex items-center justify-between px-4 py-2.5 text-xs md:text-sm cursor-pointer transition-colors border-b border-[#f0ebe0]/60 dark:border-[#1d222e] last:border-0
                  ${isSelected 
                    ? 'bg-[#f0e8d5] dark:bg-[#1c2230] text-[#141312] dark:text-[#dfba73]' 
                    : 'text-[#38332d] dark:text-[#ddd6c8] hover:bg-[#f6f1e6] dark:hover:bg-[#181d28]'
                  }
                `}
              >
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <Search size={13} className="text-[#9a7833] dark:text-[#dfba73] flex-shrink-0" />
                  <span className="truncate font-sans">
                    {suggestion.text}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0 text-xs text-[#8a8277] dark:text-[#888175]">
                  {suggestion.type === 'category' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#f0e8d5] dark:bg-[#202737] border border-[#d6be90]/40 dark:border-[#c5a059]/30 px-2 py-0.5 text-[9px] font-serif uppercase tracking-wider text-[#8a6827] dark:text-[#dfba73]">
                      <Layers size={9} /> Department
                    </span>
                  )}
                  {suggestion.type === 'brand' && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#fdf5e6] dark:bg-[#232018] border border-[#c5a059]/40 px-2 py-0.5 text-[9px] font-serif uppercase tracking-wider text-[#9a7833] dark:text-[#e4c480]">
                      <Tag size={9} /> Maison
                    </span>
                  )}
                  <ArrowUpLeft size={12} className="text-[#a8a195] ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
