'use client';
// ============================================================================
// Today's Deals Page — /deals
// Amazon-style daily discounts, Lightning Deals with progress bars & countdowns
// ============================================================================
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Flame,
  Clock,
  Sparkles,
  Percent,
  Check,
  ShoppingCart,
  Filter,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { ProductRating } from '@/components/product/ProductRating';
import { useCart } from '@/context/CartContext';
import { useLocation } from '@/context/LocationContext';
import { getAllProducts } from '@/lib/firebase/database';
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

  // Countdown timer for deals
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 42, seconds: 18 });

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
          const sorted = [...items].sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
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
        if (activeCategory === 'home-kitchen' && !cat.includes('home') && !cat.includes('kitchen')) return false;
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

      // 'all' shows all products with a discount or promotion
      return true;
    });
  }, [products, activeCategory, activeDealType, convertPrice, country.currency]);

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await addItem(product, 1);
    if (res.success) {
      setAddedId(product.id);
      setTimeout(() => setAddedId(null), 2000);
    }
  };

  const categories = [
    { id: 'all', name: 'All Departments' },
    { id: 'electronics', name: 'Electronics' },
    { id: 'computers', name: 'Computers' },
    { id: 'fashion', name: 'Fashion' },
    { id: 'home-kitchen', name: 'Home & Kitchen' },
    { id: 'beauty', name: 'Beauty' },
    { id: 'toys', name: 'Toys & Games' },
    { id: 'sports', name: 'Sports & Outdoors' },
    { id: 'books', name: 'Books' },
  ];

  return (
    <MainLayout>
      <div className="bg-[#f7f8f8] min-h-screen pb-16">
        {/* ── Top Hero Banner ── */}
        <div className="bg-gradient-to-r from-[#131921] via-[#1e293b] to-[#0f172a] text-white py-8 px-4 sm:px-8 border-b border-gray-700">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                <Flame size={16} className="fill-amber-400" />
                <span>Today&apos;s Featured Promotions</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Today&apos;s Deals &amp; Lightning Discounts
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm mt-1 max-w-xl">
                Great savings updated every 24 hours. Enjoy extra savings on top brands with fast Prime delivery to {country.name}.
              </p>
            </div>

            {/* Countdown Clock Box */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-lg p-3.5 border border-white/20 self-start md:self-auto">
              <Clock size={20} className="text-amber-400 shrink-0" />
              <div>
                <span className="text-[11px] text-gray-300 block uppercase tracking-wider font-semibold">
                  Deals Refresh In
                </span>
                <div className="text-lg font-extrabold font-mono text-white tracking-widest">
                  {String(timeLeft.hours).padStart(2, '0')}:
                  {String(timeLeft.minutes).padStart(2, '0')}:
                  {String(timeLeft.seconds).padStart(2, '0')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter / Navigation Tabs Bar ── */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-20 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {/* Deal Type Pills */}
            <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide text-xs">
              <button
                onClick={() => setActiveDealType('all')}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeDealType === 'all'
                    ? 'bg-amazon-dark text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Deals ({products.length})
              </button>
              <button
                onClick={() => setActiveDealType('lightning')}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1 ${
                  activeDealType === 'lightning'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                }`}
              >
                <Flame size={13} className="fill-current" />
                Lightning Deals
              </button>
              <button
                onClick={() => setActiveDealType('day')}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeDealType === 'day'
                    ? 'bg-amazon-orange text-gray-900 shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Deal of the Day
              </button>
              <button
                onClick={() => setActiveDealType('best')}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeDealType === 'best'
                    ? 'bg-amazon-dark text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                30% Off or More
              </button>
              <button
                onClick={() => setActiveDealType('under25')}
                className={`px-3.5 py-1.5 rounded-full font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  activeDealType === 'under25'
                    ? 'bg-amazon-dark text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Under {country.symbol}{country.currency === 'INR' ? '2,000' : '25'}
              </button>
            </div>

            {/* Department Categories Strip */}
            <div className="flex items-center gap-4 py-2 border-t border-gray-100 overflow-x-auto scrollbar-hide text-xs text-gray-600">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`pb-1 border-b-2 font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    activeCategory === cat.id
                      ? 'border-amazon-orange text-amazon-orange font-bold'
                      : 'border-transparent text-gray-600 hover:text-amazon-link'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Deals Grid ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-500 font-medium">
              Showing <strong>{filteredProducts.length}</strong> deals
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="h-72 rounded bg-white animate-pulse border border-gray-200 p-3" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center max-w-lg mx-auto my-8">
              <Sparkles size={36} className="text-amazon-orange mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900 mb-1">No deals match this filter</h3>
              <p className="text-xs text-gray-500 mb-4">Try selecting another department or view all deals.</p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setActiveDealType('all');
                }}
                className="bg-amazon-orange text-gray-900 px-4 py-1.5 rounded font-semibold text-xs hover:bg-[#e68a00]"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredProducts.map((product) => {
                const discount = product.discountPercent || (product.compareAtPrice ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 15);
                const isClaimed = Math.floor(45 + (product.stock % 50));

                return (
                  <div
                    key={product.id}
                    className="group bg-white rounded-md border border-gray-200 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative"
                  >
                    {/* Top Deal Pill */}
                    <div className="p-3 pb-0">
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="bg-[#cc0c39] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Up to {discount}% off
                        </span>
                        <span className="text-[#cc0c39] text-[10px] font-bold uppercase truncate">
                          {product.isFeatured ? 'Deal of the day' : 'Limited time deal'}
                        </span>
                      </div>

                      {/* Product Image */}
                      <Link href={`/product/${product.slug}`} className="block relative h-40 w-full mb-3 overflow-hidden rounded bg-gray-50">
                        <Image
                          src={product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'}
                          alt={product.title}
                          fill
                          sizes="(max-width: 768px) 50vw, 20vw"
                          className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Price Display */}
                      <PriceDisplay
                        price={product.price}
                        compareAtPrice={product.compareAtPrice || product.price * 1.25}
                        size="sm"
                      />

                      {/* Product Title */}
                      <Link
                        href={`/product/${product.slug}`}
                        className="block mt-2 text-xs text-gray-800 hover:text-amazon-link line-clamp-2 leading-snug group-hover:underline"
                        title={product.title}
                      >
                        {product.title}
                      </Link>

                      {/* Rating */}
                      <div className="mt-1.5">
                        <ProductRating rating={product.rating} reviewCount={product.reviewCount} size="sm" />
                      </div>
                    </div>

                    {/* Bottom Progress & Add to Cart */}
                    <div className="p-3 pt-2">
                      {/* Lightning Deal Progress Bar */}
                      <div className="mb-2.5">
                        <div className="flex items-center justify-between text-[10px] text-gray-500 mb-0.5">
                          <span>{isClaimed}% claimed</span>
                          <span className="text-red-700 font-semibold">Ends soon</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-amazon-orange rounded-full" style={{ width: `${isClaimed}%` }} />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleAddToCart(e, product)}
                        className={`w-full py-1.5 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                          addedId === product.id
                            ? 'bg-green-700 text-white'
                            : 'bg-amazon-yellow hover:bg-[#f7ca00] text-gray-900 border border-[#fcd200]'
                        }`}
                      >
                        {addedId === product.id ? (
                          <>
                            <Check size={14} />
                            <span>Added to Cart</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart size={13} />
                            <span>Add to Cart</span>
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
