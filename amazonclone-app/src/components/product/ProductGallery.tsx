'use client';
// ============================================================================
// ProductGallery — Amazon-style multi-image gallery with hover zoom & modal
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Maximize2, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import type { ProductImage } from '@/types';

interface ProductGalleryProps {
  images: ProductImage[];
  title: string;
  activeImageOverride?: string;
  className?: string;
}

export function ProductGallery({
  images,
  title,
  activeImageOverride,
  className = '',
}: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const safeImages: ProductImage[] =
    images && images.length > 0
      ? images
      : [
          {
            url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
            alt: title,
            isPrimary: true,
          },
        ];

  // If activeImageOverride is provided and matches an image in safeImages, select it
  useEffect(() => {
    if (activeImageOverride) {
      const matchIndex = safeImages.findIndex((img) => img.url === activeImageOverride);
      if (matchIndex >= 0) {
        setSelectedIndex(matchIndex);
      }
    }
  }, [activeImageOverride, safeImages]);

  const activeImage = safeImages[selectedIndex] || safeImages[0];

  // Mouse move handler for interactive zoom lens effect
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev + 1) % safeImages.length);
  };

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length);
  };

  return (
    <div className={`flex flex-col-reverse md:flex-row gap-4 ${className}`}>
      {/* ── Thumbnail Strip ── */}
      {safeImages.length > 1 && (
        <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 scrollbar-hide max-h-[500px]">
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

      {/* ── Main Active Preview Container ── */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
        className="group relative flex-1 flex items-center justify-center min-h-[360px] md:min-h-[480px] rounded-lg border border-gray-100 bg-white p-6 overflow-hidden cursor-crosshair"
      >
        <div className="relative h-[340px] md:h-[460px] w-full">
          <Image
            src={activeImage.url}
            alt={activeImage.alt || title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className={`object-contain transition-transform duration-150 ${
              isHovering ? 'scale-125' : 'scale-100'
            }`}
            style={
              isHovering
                ? {
                    transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                  }
                : undefined
            }
          />
        </div>

        {/* Hover zoom guide indicator */}
        <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-[11px] px-2 py-1 rounded flex items-center gap-1 pointer-events-none">
          <ZoomIn size={12} />
          <span>Roll over image to zoom in</span>
        </div>

        {/* Fullscreen Expand Button */}
        <button
          type="button"
          onClick={() => setIsZoomModalOpen(true)}
          className="absolute bottom-3 right-3 rounded-full bg-white/90 p-2 shadow-md border border-gray-200 text-gray-700 hover:bg-white hover:text-amazon-orange transition-all cursor-pointer"
          title="Click to expand high-resolution view"
          aria-label="Expand image"
        >
          <Maximize2 size={16} />
        </button>
      </div>

      {/* ── Fullscreen Lightbox Modal ── */}
      {isZoomModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 sm:p-8"
        >
          <button
            type="button"
            onClick={() => setIsZoomModalOpen(false)}
            className="absolute top-4 right-4 rounded-full bg-white/20 p-2.5 text-white hover:bg-white/40 transition-colors cursor-pointer"
            aria-label="Close image preview"
          >
            <X size={24} />
          </button>

          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/40 transition-colors cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white hover:bg-white/40 transition-colors cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          <div className="relative max-h-[85vh] max-w-[85vw] w-[800px] h-[650px] bg-white rounded-xl p-8 flex items-center justify-center shadow-2xl">
            <div className="relative w-full h-full">
              <Image
                src={activeImage.url}
                alt={activeImage.alt || title}
                fill
                sizes="85vw"
                className="object-contain"
              />
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-gray-900/80 text-white text-xs px-3 py-1 rounded-full">
              {selectedIndex + 1} / {safeImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
