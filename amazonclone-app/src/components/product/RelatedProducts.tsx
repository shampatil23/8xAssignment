'use client';
// ============================================================================
// RelatedProducts — Related & Recommended products carousel / grid
// ============================================================================
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchProducts } from '@/services/productService';
import type { Product } from '@/types';

interface RelatedProductsProps {
  category: string;
  currentProductId: string;
  className?: string;
}

export function RelatedProducts({
  category,
  currentProductId,
  className = '',
}: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadRelated() {
      try {
        const res = await fetchProducts({ category });
        if (!isMounted) return;
        if (res.success && res.data) {
          setProducts(res.data.filter((p) => p.id !== currentProductId).slice(0, 8));
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
  }, [category, currentProductId]);

  if (loading) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-white p-5 ${className}`}>
        <div className="h-5 w-48 bg-gray-200 rounded mb-4 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-56 bg-gray-100 rounded-md animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section
      aria-labelledby="related-products-heading"
      className={`rounded-lg border border-gray-200 bg-white p-5 shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 id="related-products-heading" className="text-base font-bold text-gray-900">
          Customers also viewed these items
        </h2>
        <span className="text-xs text-gray-500">
          Page 1 of 1 ({products.length} recommendations)
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {products.map((p) => {
          const mainImg = p.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500';
          return (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="group flex flex-col justify-between rounded-lg border border-gray-200 p-3 hover:shadow-md transition-all bg-white hover:border-gray-300"
            >
              <div>
                <div className="relative h-36 w-full rounded bg-white overflow-hidden mb-3">
                  <Image
                    src={mainImg}
                    alt={p.title}
                    fill
                    sizes="(max-width: 640px) 50vw, 25vw"
                    className="object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                  />
                </div>

                <h3 className="text-xs text-amazon-link font-medium line-clamp-2 leading-snug group-hover:underline">
                  {p.title}
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-600">
                  <div className="flex text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        className={
                          s <= Math.round(p.rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-amazon-link">
                    {p.reviewCount}
                  </span>
                </div>

                {/* Price */}
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-xs font-normal text-gray-600">$</span>
                  <span className="text-base font-bold text-gray-900">
                    {p.price.toFixed(2)}
                  </span>
                  {p.compareAtPrice && p.compareAtPrice > p.price && (
                    <span className="text-xs text-gray-500 line-through">
                      ${p.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                {p.isPrimeEligible && (
                  <div className="mt-1 flex items-center gap-1 text-[11px] text-[#00a8e1] font-bold italic">
                    <Check size={12} strokeWidth={3} /> prime
                  </div>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                {p.deliveryInfo?.isFreeDelivery ? 'FREE delivery' : 'Standard delivery'}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
