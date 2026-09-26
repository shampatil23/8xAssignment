'use client';
// ============================================================================
// Valenza — Private Privileges & Curated Acquisitions (/deals)
// Luxury Showcase: High-jewelry / haute maison aesthetic, champagne gold tones,
// live exhibition countdown, refined department filters, and elegant product cards.
// ============================================================================
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Sparkles,
  Clock,
  ShoppingBag,
  Check,
  Tag,
  Flame,
  ArrowRight,
  ShieldCheck,
  SlidersHorizontal,
  ChevronRight,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductRating } from '@/components/product/ProductRating';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { getAllProducts } from '@/lib/firebase/database';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types';

type DealType = 'all' | 'lightning' | 'day' | 'under25' | 'best';

export default function TodaysDealsPage() {
  const { addItem } = useCart();
  const { country, convertPrice } = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [activeDealType, setActiveDealType] = useState<DealType>('all');
  const [addedId, setAddedId] = useState<string | null>(null);

  // Countdown timer for exhibition window
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 59, seconds: 29 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let mounted = true;
    getAllProducts()
      .then((items) => {
        if (mounted) {
          // Sort items with highest discount first
          const sorted = [...items].sort(
            (a, b) => (b.discountPercent || 0) - (a.discountPercent || 0),
          );
          setProducts(sorted);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to load deals products', err);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Filter products based on deal tabs and department
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (activeCategory !== 'all') {
        const cat = p.category?.toLowerCase() || '';
        if (activeCategory === 'home-kitchen' && !cat.includes('home') && !cat.includes('kitchen'))
          return false;
        if (activeCategory !== 'home-kitchen' && !cat.includes(activeCategory)) return false;
      }

      // Deal type filter
      if (activeDealType === 'lightning') {
        return (p.discountPercent || 0) >= 20 || p.stock < 15;
      }
      if (activeDealType === 'day') {
        return p.isFeatured || p.isBestSeller;
      }
      if (activeDealType === 'best') {
        return (p.discountPercent || 0) >= 30;
      }
      if (activeDealType === 'under25') {
        return convertPrice(p.price) <= (country.currency === 'INR' ? 2000 : 25);
      }

      return true;
    });
  }, [products, activeCategory, activeDealType, convertPrice, country.currency]);

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await addItem(product, 1);
    if (res.success) {
      setAddedId(product.id);
      setTimeout(() => setAddedId(null), 2500);
    }
  };

  const categories = [
    { id: 'all', name: 'All Curated Salons' },
    { id: 'electronics', name: 'Haute Horlogerie' },
    { id: 'beauty', name: 'High Joaillerie' },
    { id: 'fashion', name: 'Haute Couture' },
    { id: 'home-kitchen', name: 'Maison Sanctuary' },
    { id: 'computers', name: 'Sculptural Tech' },
    { id: 'sports', name: 'Grand Tourisme' },
    { id: 'books', name: 'Rare Editions' },
    { id: 'toys', name: 'Artisan Collectibles' },
  ];

  return (
    <MainLayout>
      <div className="bg-[#faf9f6] dark:bg-[#0a0d14] min-h-screen pb-20 text-[#141312] dark:text-gray-100 transition-colors duration-300">
        
        {/* ── Top Hero Banner (Obsidian & Champagne Gold Maison Aesthetic) ── */}
        <div className="relative bg-gradient-to-r from-[#0d1017] via-[#151922] to-[#0a0c10] text-white py-12 px-6 sm:px-12 border-b border-[#c5a059]/30 overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.3)]">
          {/* Subtle gold radial background glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#c5a059]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#dfba73]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#c5a059]/40 mb-3.5 shadow-xs">
                <Sparkles size={13} className="text-[#dfba73]" />
                <span className="text-[11px] font-serif font-semibold tracking-[0.24em] uppercase text-[#dfba73]">
                  Private Atelier Privileges • Salon 2026
                </span>
              </div>

              {/* Title */}
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-light text-white tracking-tight leading-[1.1] mb-2.5">
                Curated Privileges &amp; Limited Acquisitions
              </h1>

              {/* Subtitle */}
              <p className="text-gray-300 text-xs sm:text-sm font-normal leading-relaxed max-w-xl">
                Exclusive time-limited acquisitions, rare archival pieces, and seasonal private allocations curated with complimentary white-glove insured transit to {country.name}.
              </p>
            </div>

            {/* Countdown Clock Box */}
            <div className="flex items-center gap-4 bg-white/5 dark:bg-black/40 backdrop-blur-xl rounded-2xl p-4 sm:p-5 border border-[#c5a059]/35 shadow-[0_8px_30px_rgba(0,0,0,0.35)] shrink-0 self-start md:self-auto">
              <div className="p-2.5 rounded-xl bg-[#c5a059]/15 border border-[#c5a059]/30 text-[#dfba73]">
                <Clock size={22} className="animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] font-serif uppercase tracking-[0.2em] text-[#dfba73] block font-semibold mb-1">
                  Exhibition Window Closes In
                </span>
                <div className="flex items-center gap-1.5 text-xl sm:text-2xl font-mono font-bold text-white tracking-widest">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[#c5a059]">:</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[#c5a059]">:</span>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/15">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sticky Filter / Navigation Tabs Bar (Frosted Luxury) ── */}
        <div className="bg-white/85 dark:bg-[#0d1017]/90 backdrop-blur-xl border-b border-black/5 dark:border-[#c5a059]/20 sticky top-16 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            
            {/* Deal Type Filter Pills */}
            <div className="flex items-center gap-2.5 py-3.5 overflow-x-auto scrollbar-hide text-xs">
              <button
                onClick={() => setActiveDealType('all')}
                className={`px-4 py-2 rounded-full font-serif font-semibold transition-all whitespace-nowrap cursor-pointer uppercase tracking-[0.16em] text-[11px] sm:text-xs ${
                  activeDealType === 'all'
                    ? 'bg-gradient-to-r from-[#c5a059] via-[#dfba73] to-[#aa8038] text-[#121110] shadow-[0_4px_16px_rgba(197,160,89,0.35)] scale-[1.02]'
                    : 'bg-white/80 dark:bg-white/5 border border-[#c5a059]/30 text-gray-700 dark:text-gray-300 hover:border-[#c5a059] hover:bg-white dark:hover:bg-white/10'
                }`}
              >
                All Privileges ({products.length})
              </button>

              <button
                onClick={() => setActiveDealType('lightning')}
                className={`px-4 py-2 rounded-full font-serif font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 uppercase tracking-[0.16em] text-[11px] sm:text-xs ${
                  activeDealType === 'lightning'
                    ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white shadow-[0_4px_16px_rgba(217,119,6,0.35)] scale-[1.02]'
                    : 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-800 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
                }`}
              >
                <Flame size={13} className="fill-current text-amber-500 dark:text-amber-300" />
                Lightning Allocations
              </button>

              <button
                onClick={() => setActiveDealType('day')}
                className={`px-4 py-2 rounded-full font-serif font-semibold transition-all whitespace-nowrap cursor-pointer uppercase tracking-[0.16em] text-[11px] sm:text-xs ${
                  activeDealType === 'day'
                    ? 'bg-gradient-to-r from-[#c5a059] via-[#dfba73] to-[#aa8038] text-[#121110] shadow-[0_4px_16px_rgba(197,160,89,0.35)] scale-[1.02]'
                    : 'bg-white/80 dark:bg-white/5 border border-[#c5a059]/30 text-gray-700 dark:text-gray-300 hover:border-[#c5a059] hover:bg-white dark:hover:bg-white/10'
                }`}
              >
                Exhibition Highlight
              </button>

              <button
                onClick={() => setActiveDealType('best')}
                className={`px-4 py-2 rounded-full font-serif font-semibold transition-all whitespace-nowrap cursor-pointer uppercase tracking-[0.16em] text-[11px] sm:text-xs ${
                  activeDealType === 'best'
                    ? 'bg-gradient-to-r from-[#c5a059] via-[#dfba73] to-[#aa8038] text-[#121110] shadow-[0_4px_16px_rgba(197,160,89,0.35)] scale-[1.02]'
                    : 'bg-white/80 dark:bg-white/5 border border-[#c5a059]/30 text-gray-700 dark:text-gray-300 hover:border-[#c5a059] hover:bg-white dark:hover:bg-white/10'
                }`}
              >
                30%+ Privilege Tier
              </button>

              <button
                onClick={() => setActiveDealType('under25')}
                className={`px-4 py-2 rounded-full font-serif font-semibold transition-all whitespace-nowrap cursor-pointer uppercase tracking-[0.16em] text-[11px] sm:text-xs ${
                  activeDealType === 'under25'
                    ? 'bg-gradient-to-r from-[#c5a059] via-[#dfba73] to-[#aa8038] text-[#121110] shadow-[0_4px_16px_rgba(197,160,89,0.35)] scale-[1.02]'
                    : 'bg-white/80 dark:bg-white/5 border border-[#c5a059]/30 text-gray-700 dark:text-gray-300 hover:border-[#c5a059] hover:bg-white dark:hover:bg-white/10'
                }`}
              >
                Under {country.symbol}{country.currency === 'INR' ? '2,000' : '25'}
              </button>
            </div>

            {/* Department Categories Strip */}
            <div className="flex items-center gap-6 py-2.5 border-t border-black/5 dark:border-white/10 overflow-x-auto scrollbar-hide text-xs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`relative pb-2 font-serif transition-all whitespace-nowrap cursor-pointer text-xs tracking-wider ${
                    activeCategory === cat.id
                      ? 'text-[#8a6827] dark:text-[#dfba73] font-bold'
                      : 'text-gray-600 dark:text-gray-400 hover:text-[#8a6827] dark:hover:text-[#dfba73]'
                  }`}
                >
                  {cat.name}
                  {activeCategory === cat.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#8a6827] to-[#dfba73] rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Deals Grid ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">
          {/* Header Count and Breadcrumb */}
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-black/5 dark:border-white/10">
            <span className="text-xs font-serif uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
              Displaying <strong className="text-[#8a6827] dark:text-[#dfba73]">{filteredProducts.length}</strong> Curated Privileges
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-96 rounded-2xl bg-white dark:bg-[#12151e] animate-pulse border border-gray-200 dark:border-gray-800 p-4"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white dark:bg-[#12151e] rounded-2xl border border-[#c5a059]/30 p-12 text-center max-w-lg mx-auto my-12 shadow-sm">
              <Sparkles size={40} className="text-[#c5a059] mx-auto mb-3" />
              <h3 className="text-lg font-serif font-semibold text-gray-900 dark:text-white mb-1">
                No Acquisitions in This Category
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                All limited allocations in this category have been acquired or are under private viewing.
              </p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setActiveDealType('all');
                }}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#c5a059] to-[#dfba73] text-[#121110] font-serif font-bold text-xs uppercase tracking-[0.2em] shadow-md hover:brightness-105"
              >
                View All Privileges
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const discount =
                  product.discountPercent ||
                  (product.compareAtPrice
                    ? Math.round(
                        ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100,
                      )
                    : 25);
                const isClaimed = Math.floor(45 + (product.stock % 50));
                const comparePrice = product.compareAtPrice || product.price * 1.35;

                return (
                  <div
                    key={product.id}
                    className="group bg-white dark:bg-[#12151e] rounded-2xl border border-black/8 dark:border-[#c5a059]/25 hover:border-[#c5a059]/70 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_16px_40px_rgba(197,160,89,0.18)] transition-all duration-300 flex flex-col justify-between overflow-hidden relative hover:-translate-y-1"
                  >
                    {/* Top Deal Pill & Status */}
                    <div className="p-4 pb-0">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[#c5a059]/15 via-[#dfba73]/20 to-[#c5a059]/10 text-[#73521a] dark:text-[#dfba73] border border-[#c5a059]/35 text-[10px] font-serif font-bold tracking-[0.16em] uppercase px-2.5 py-1 rounded-full backdrop-blur-xs">
                          <Tag size={11} className="text-[#c5a059]" />
                          -{discount}% Privilege
                        </span>
                        <span className="text-[10px] font-serif font-semibold tracking-[0.15em] uppercase text-gray-400 dark:text-gray-400 truncate">
                          {product.isFeatured ? 'Salon Edition' : 'Private Reserve'}
                        </span>
                      </div>

                      {/* Product Image */}
                      <Link
                        href={`/product/${product.slug}`}
                        className="block relative h-48 w-full mb-3.5 overflow-hidden rounded-xl bg-gray-50 dark:bg-black/30 border border-black/5 dark:border-white/5"
                      >
                        <Image
                          src={
                            product.images?.[0]?.url ||
                            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'
                          }
                          alt={product.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                          className="object-contain p-3 group-hover:scale-106 transition-transform duration-500"
                        />
                      </Link>

                      {/* Brand Tag */}
                      <p className="text-[10px] font-serif uppercase tracking-[0.22em] text-[#8a6827] dark:text-[#dfba73] font-semibold mb-1 truncate">
                        {product.brand || 'VALENZA ATELIER'}
                      </p>

                      {/* Product Title */}
                      <Link
                        href={`/product/${product.slug}`}
                        className="block text-sm font-serif font-normal text-gray-900 dark:text-white hover:text-[#8a6827] dark:hover:text-[#dfba73] line-clamp-2 leading-snug transition-colors"
                        title={product.title}
                      >
                        {product.title}
                      </Link>

                      {/* Pricing Display */}
                      <div className="mt-3 flex items-baseline gap-2.5">
                        <span className="font-serif text-lg font-bold text-gray-900 dark:text-white">
                          {formatPrice(product.price, country.currency)}
                        </span>
                        <span className="font-serif text-xs text-gray-400 line-through">
                          {formatPrice(comparePrice, country.currency)}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="mt-2">
                        <ProductRating
                          rating={product.rating || 4.8}
                          reviewCount={product.reviewCount || 128}
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Bottom Progress & Add to Bag */}
                    <div className="p-4 pt-3 border-t border-black/5 dark:border-white/10 mt-3 bg-gray-50/50 dark:bg-black/20">
                      {/* Limited Allocation Progress Bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-[10px] font-serif uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                          <span>Allocated: {isClaimed}%</span>
                          <span className="text-[#8a6827] dark:text-[#dfba73] font-semibold">
                            Limited Stock
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#c5a059] to-[#dfba73] rounded-full transition-all duration-500"
                            style={{ width: `${isClaimed}%` }}
                          />
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, product)}
                        className={`w-full py-2.5 rounded-xl text-xs font-serif font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95 ${
                          addedId === product.id
                            ? 'bg-emerald-700 text-white'
                            : 'bg-gradient-to-r from-[#c5a059] via-[#dfba73] to-[#aa8038] hover:brightness-110 text-[#121110] shadow-[0_4px_15px_rgba(197,160,89,0.25)]'
                        }`}
                      >
                        {addedId === product.id ? (
                          <>
                            <Check size={14} />
                            <span>Reserved In Bag</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag size={14} className="text-[#121110]" />
                            <span>Acquire Item</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
