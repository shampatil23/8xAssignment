'use client';
// ============================================================================
// ProductGallery — Amazon-style multi-image gallery with thumbnail switcher
// ============================================================================
import React, { useState } from 'react';
import Image from 'next/image';
import type { ProductImage } from '@/types';

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
  className?: string;
}

export function ProductGallery({ images, title, className = '' }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const safeImages = images.length > 0 ? images : [
    {
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
      alt: title,
      isPrimary: true,
    },
  ];

  const activeImage = safeImages[selectedIndex] || safeImages[0];

  return (
    <div className={`flex flex-col-reverse md:flex-row gap-4 ${className}`}>
      {/* Thumbnail strip */}
      {safeImages.length > 1 && (
        <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 scrollbar-hide">
          {safeImages.map((img, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={img.url + index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`relative h-14 w-14 flex-shrink-0 cursor-pointer overflow-hidden rounded border-2 bg-white transition-all ${
                  isSelected
                    ? 'border-amazon-orange ring-2 ring-amazon-orange/30'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                aria-label={`View image ${index + 1} of ${safeImages.length}`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `${title} thumbnail ${index + 1}`}
                  fill
                  sizes="56px"
                  className="object-contain p-1"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main active preview container */}
      <div className="relative flex-1 flex items-center justify-center min-h-[350px] md:min-h-[460px] rounded-lg border border-gray-100 bg-white p-6">
        <div className="relative h-[340px] md:h-[450px] w-full">
          <Image
            src={activeImage.url}
            alt={activeImage.alt || title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-contain transition-opacity duration-200"
          />
        </div>
      </div>
    </div>
  );
}
