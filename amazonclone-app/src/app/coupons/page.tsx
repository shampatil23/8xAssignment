'use client';
// ============================================================================
// Amazon Coupons Page — /coupons
// Clip digital coupons to save automatically at checkout
// ============================================================================
import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Tag,
  Check,
  Scissors,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  Percent,
  Search,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { useLocation } from '@/context/LocationContext';
import { getAllProducts } from '@/lib/firebase/database';
import type { Product } from '@/types';

interface CouponItem {
  id: string;
  productId: string;
  product: Product;
  discountType: 'percent' | 'fixed';
  discountValue: number; // e.g. 15% or 10 USD
  category: string;
  expiresIn: string;
}

const STORAGE_CLIPPED_COUPONS = 'amazon_clone_clipped_coupons';

export default function CouponsPage() {
  const { country, convertPrice, formatPrice } = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [clippedIds, setClippedIds] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [onlyClipped, setOnlyClipped] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Load clipped coupons from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_CLIPPED_COUPONS);
      if (stored) setClippedIds(JSON.parse(stored));
    } catch {}
  }, []);

  // Fetch products to generate coupons from live catalog
  useEffect(() => {
    getAllProducts()
      .then((items) => {
        setProducts(items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const coupons: CouponItem[] = useMemo(() => {
    return products.slice(0, 24).map((p, idx) => {
      const isPercent = idx % 2 === 0;
      const discountValue = isPercent ? (idx % 3 === 0 ? 25 : 15) : Math.max(5, Math.round(p.price * 0.15));
      return {
        id: `coupon-${p.id}`,
        productId: p.id,
        product: p,
        discountType: isPercent ? 'percent' : 'fixed',
        discountValue,
        category: p.category || 'general',
        expiresIn: `${(idx % 5) + 2} days left`,
      };
    });
  }, [products]);

  const toggleClip = (couponId: string) => {
    setClippedIds((prev) => {
      const next = prev.includes(couponId)
        ? prev.filter((id) => id !== couponId)
        : [...prev, couponId];
      try {
        localStorage.setItem(STORAGE_CLIPPED_COUPONS, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      if (onlyClipped && !clippedIds.includes(c.id)) return false;
      if (activeCategory !== 'all') {
        const cat = c.category.toLowerCase();
        if (activeCategory === 'home-kitchen' && !cat.includes('home') && !cat.includes('kitchen')) return false;
        if (activeCategory !== 'home-kitchen' && !cat.includes(activeCategory)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!c.product.title.toLowerCase().includes(q) && !c.product.brand?.toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [coupons, onlyClipped, clippedIds, activeCategory, searchQuery]);

  const categories = [
    { id: 'all', name: 'Curated Salons' },
    { id: 'electronics', name: 'Haute Horlogerie' },
    { id: 'beauty', name: 'High Joaillerie' },
    { id: 'fashion', name: 'Haute Couture' },
    { id: 'home-garden', name: 'Maison Living' },
    { id: 'computers', name: 'Sculptural Tech' },
    { id: 'sports', name: 'Grand Tourisme' },
  ];

  return (
    <MainLayout>
      <div className="bg-[#f7f8f8] min-h-screen pb-16">
        {/* ── Top Header Banner ── */}
        <div className="bg-gradient-to-r from-[#007185] via-[#004e5d] to-[#002f38] text-white py-8 px-4 sm:px-8 border-b border-gray-700">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-teal-300 font-bold text-xs uppercase tracking-wider mb-1">
                <Scissors size={16} />
                <span>Amazon Digital Coupons</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Clip Coupons &amp; Save Extra
              </h1>
              <p className="text-gray-200 text-xs sm:text-sm mt-1 max-w-xl">
                Clip your favorite coupons below. Discounts are applied automatically at checkout on eligible orders in {country.name}.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-lg p-3.5 border border-white/20 text-xs self-start md:self-auto flex items-center gap-3">
              <Tag size={24} className="text-teal-300 shrink-0" />
              <div>
                <span className="block font-semibold text-gray-200">Your Clipped Coupons</span>
                <span className="text-base font-extrabold text-white">
                  {clippedIds.length} {clippedIds.length === 1 ? 'Coupon' : 'Coupons'} Ready to Use
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter Bar ── */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-20 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3">
              {/* Category Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full font-medium transition-all whitespace-nowrap cursor-pointer ${
                      activeCategory === cat.id
                        ? 'bg-[#007185] text-white font-bold'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Clipped Checkbox & Search */}
              <div className="flex items-center gap-4 text-xs shrink-0">
                <label className="flex items-center gap-1.5 cursor-pointer text-gray-700 font-medium select-none">
                  <input
                    type="checkbox"
                    checked={onlyClipped}
                    onChange={(e) => setOnlyClipped(e.target.checked)}
                    className="rounded text-[#007185] focus:ring-[#007185] h-3.5 w-3.5 cursor-pointer"
                  />
                  <span>Show Clipped Only ({clippedIds.length})</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* ── Coupons Grid ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-gray-600 font-medium">
              Showing <strong>{filteredCoupons.length}</strong> available coupons
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="h-64 rounded bg-white animate-pulse border border-gray-200 p-3" />
              ))}
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center max-w-lg mx-auto my-8">
              <Tag size={36} className="text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-gray-900 mb-1">No coupons found</h3>
              <p className="text-xs text-gray-500 mb-4">
                {onlyClipped
                  ? "You haven't clipped any coupons yet. Browse all coupons to start saving!"
                  : 'Try selecting another department or resetting filters.'}
              </p>
              <button
                onClick={() => {
                  setOnlyClipped(false);
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="bg-amazon-orange text-gray-900 px-4 py-1.5 rounded font-semibold text-xs hover:bg-[#e68a00]"
              >
                View All Coupons
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredCoupons.map((coupon) => {
                const isClipped = clippedIds.includes(coupon.id);
                const couponText =
                  coupon.discountType === 'percent'
                    ? `Save ${coupon.discountValue}%`
                    : `Save ${formatPrice(coupon.discountValue)}`;

                return (
                  <div
                    key={coupon.id}
                    className={`bg-white rounded-md border transition-all flex flex-col justify-between overflow-hidden shadow-xs relative ${
                      isClipped
                        ? 'border-green-600 ring-1 ring-green-600 bg-green-50/20'
                        : 'border-gray-200 hover:shadow-md'
                    }`}
                  >
                    {/* Top Coupon Ribbon */}
                    <div className="bg-green-700 text-white px-2.5 py-1 text-center font-bold text-xs tracking-tight flex items-center justify-center gap-1">
                      <Percent size={12} />
                      <span>{couponText}</span>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between">
                      {/* Product Image */}
                      <Link
                        href={`/product/${coupon.product.slug}`}
                        className="block relative h-32 w-full mb-2 bg-gray-50 rounded overflow-hidden"
                      >
                        <Image
                          src={coupon.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'}
                          alt={coupon.product.title}
                          fill
                          sizes="(max-width: 768px) 50vw, 16vw"
                          className="object-contain p-2 hover:scale-105 transition-transform duration-300"
                        />
                      </Link>

                      {/* Title & Brand */}
                      <div>
                        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block truncate">
                          {coupon.product.brand || 'Amazon'}
                        </span>
                        <Link
                          href={`/product/${coupon.product.slug}`}
                          className="text-xs text-gray-800 hover:text-amazon-link line-clamp-2 leading-tight font-medium"
                          title={coupon.product.title}
                        >
                          {coupon.product.title}
                        </Link>
                      </div>

                      {/* Price Display */}
                      <div className="mt-2">
                        <PriceDisplay price={coupon.product.price} size="sm" showDiscount={false} />
                        <span className="text-[10px] text-gray-400 block mt-0.5">{coupon.expiresIn}</span>
                      </div>
                    </div>

                    {/* Clip Button */}
                    <div className="p-3 pt-0">
                      <button
                        type="button"
                        onClick={() => toggleClip(coupon.id)}
                        className={`w-full py-1.5 px-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                          isClipped
                            ? 'bg-green-700 text-white hover:bg-green-800'
                            : 'bg-amazon-yellow hover:bg-[#f7ca00] text-gray-900 border border-[#fcd200]'
                        }`}
                      >
                        {isClipped ? (
                          <>
                            <Check size={14} />
                            <span>Coupon Clipped</span>
                          </>
                        ) : (
                          <>
                            <Scissors size={13} />
                            <span>Clip Coupon</span>
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
