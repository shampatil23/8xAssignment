'use client';
// ============================================================================
// RelatedProducts — Valenza Maison Curations & Alternative Masterpieces
// ============================================================================
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Sparkles, Crown } from 'lucide-react';
import { fetchProducts } from '@/services/productService';
import { getRecommendationsForProduct } from '@/services/recommendationService';
import { useLocation } from '@/context/LocationContext';
import type { Product } from '@/types';

interface RelatedProductsProps {
  product?: Product;
  category: string;
  currentProductId: string;
  className?: string;
}

export function RelatedProducts({
  product,
  category,
  currentProductId,
  className = '',
}: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { country, convertPrice } = useLocation();

  useEffect(() => {
    let isMounted = true;
    async function loadRelated() {
      try {
        if (product) {
          const recs = await getRecommendationsForProduct(product, 8);
          if (isMounted) setProducts(recs);
        } else {
          const res = await fetchProducts({ category });
          if (!isMounted) return;
          if (res.success && res.data) {
            setProducts(res.data.filter((p) => p.id !== currentProductId).slice(0, 8));
          }
        }
      } catch (err) {
        console.error('Failed to load related products', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadRelated();
    return () => {
      isMounted = false;
    };
  }, [product, category, currentProductId]);

  if (loading) {
    return (
      <div className={`rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#12151f]/90 p-6 sm:p-8 ${className}`}>
        <div className="h-5 w-48 bg-[#ebe2d1] dark:bg-[#1f2533] rounded-full mb-6 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 bg-[#fbfaf8] dark:bg-[#161a25] rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section
      aria-labelledby="related-products-heading"
      className={`rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 backdrop-blur-xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(26,23,20,0.03)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.6)] ${className}`}
    >
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#f2ede4] dark:border-[#1e2433]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#c5a059]" />
          <h2 id="related-products-heading" className="font-serif text-lg sm:text-xl font-light tracking-tight text-[#141312] dark:text-[#f8f5ee]">
            Maison Curations &amp; Alternative Masterpieces
          </h2>
        </div>
        <span className="text-[10px] uppercase tracking-widest text-[#9b8353] dark:text-[#d6be90] font-semibold">
          {products.length} Curated Pieces
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {products.map((p) => {
          const mainImg = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500';
          const localPrice = convertPrice(p.price);

          return (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-[#ebe2d1] dark:border-[#262c3d] p-4 hover:border-[#c5a059] hover:shadow-[0_10px_30px_rgba(197,160,89,0.12)] transition-all bg-[#fbfaf8] dark:bg-[#161a25]/80"
            >
              <div>
                <div className="relative h-44 w-full rounded-xl bg-white dark:bg-[#12151f] overflow-hidden mb-3 border border-[#f2ede4] dark:border-[#1e2433]">
                  <Image
                    src={mainImg}
                    alt={p.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {p.brand && (
                  <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-[#9b8353] dark:text-[#d6be90] block mb-1">
                    {p.brand}
                  </span>
                )}

                <h3 className="font-serif text-xs font-medium text-[#141312] dark:text-[#f8f5ee] line-clamp-2 leading-snug group-hover:text-[#c5a059] transition-colors">
                  {p.title}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1.5 mt-2 text-xs">
                  <div className="flex text-[#c5a059]">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={11}
                        className={
                          s <= Math.round(p.rating)
                            ? 'fill-[#c5a059] text-[#c5a059]'
                            : 'text-[#dfd6c5] dark:text-[#32394d]'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-[#8e816e] dark:text-[#7e8aa2]">
                    ({p.reviewCount})
                  </span>
                </div>

                {/* Price */}
                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-serif text-base font-semibold text-[#141312] dark:text-[#f8f5ee]">
                    {country.symbol}{Math.floor(localPrice).toLocaleString(country.locale)}
                  </span>
                </div>
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-[#f0eae0] dark:border-[#1e2433] flex items-center justify-between text-[10px] uppercase tracking-wider text-[#9b8353] dark:text-[#d6be90] font-medium">
                <span>Insured Dispatch</span>
                <span>Explore →</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
