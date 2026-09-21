'use client';
// ============================================================================
// ProductCard — Amazon-style product listing card
// ============================================================================
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check } from 'lucide-react';
import type { Product } from '@/types';
import { PriceDisplay } from './PriceDisplay';
import { ProductRating } from './ProductRating';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const primaryImage =
    product.images.find((img) => img.isPrimary) || product.images[0] || {
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      alt: product.title,
    };

  const isOutOfStock = product.status === 'out_of_stock' || product.stock <= 0;

  return (
    <div
      className="group relative flex flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 transition-all hover:shadow-lg hover:border-gray-300"
      id={`product-card-${product.id}`}
    >
      {/* Badges container */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1">
        {product.isBestSeller && (
          <span className="rounded-sm bg-[#e67a00] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
            #1 Best Seller
          </span>
        )}
        {product.isFeatured && !product.isBestSeller && (
          <span className="rounded-sm bg-amazon-dark px-2 py-0.5 text-[11px] font-medium tracking-wider text-white shadow-sm">
            Featured
          </span>
        )}
      </div>

      {/* Product Image */}
      <Link
        href={`/product/${product.slug}`}
        className="relative mb-3 flex h-52 w-full items-center justify-center overflow-hidden rounded bg-white p-2"
        aria-label={product.title}
      >
        <Image
          src={primaryImage.url}
          alt={primaryImage.alt || product.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between">
        <div>
          {/* Brand */}
          {product.brand && (
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
              {product.brand}
            </p>
          )}

          {/* Title */}
          <Link
            href={`/product/${product.slug}`}
            className="line-clamp-2 text-sm font-medium text-gray-900 group-hover:text-amazon-link transition-colors leading-snug mb-1.5"
            title={product.title}
          >
            {product.title}
          </Link>

          {/* Rating */}
          <div className="mb-2">
            <ProductRating
              rating={product.rating}
              reviewCount={product.reviewCount}
              size="sm"
            />
          </div>

          {/* Price */}
          <div className="mb-2">
            <PriceDisplay
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              size="md"
            />
          </div>

          {/* Prime Eligibility */}
          {product.isPrimeEligible && !isOutOfStock && (
            <div className="mb-2 flex items-center gap-1 text-xs">
              <span className="inline-flex items-center gap-0.5 rounded bg-[#00a8e1] px-1 py-0.2 font-extrabold italic text-white text-[10px]">
                <Check size={11} strokeWidth={3} /> prime
              </span>
              <span className="text-gray-500">One-Day</span>
            </div>
          )}

          {/* Delivery Promise */}
          {product.deliveryInfo && !isOutOfStock && (
            <p className="text-xs text-gray-600 mb-2">
              <span className="font-semibold text-gray-900">
                {product.deliveryInfo.isFreeDelivery ? 'FREE delivery ' : 'Delivery '}
              </span>
              <span>{product.deliveryInfo.fastestDeliveryDate}</span>
            </p>
          )}

          {/* Out of stock or low stock note */}
          {isOutOfStock ? (
            <p className="text-xs font-medium text-red-600 mt-1">
              Currently unavailable
            </p>
          ) : product.stock <= 5 ? (
            <p className="text-xs font-medium text-amber-700 mt-1">
              Only {product.stock} left in stock
            </p>
          ) : null}
        </div>

        {/* View Details button on mobile/desktop */}
        <div className="mt-3 border-t pt-2.5">
          <Link
            href={`/product/${product.slug}`}
            className="block w-full rounded bg-gray-50 py-1.5 text-center text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors border border-gray-200"
          >
            See Options &amp; Details
          </Link>
        </div>
      </div>
    </div>
  );
}
