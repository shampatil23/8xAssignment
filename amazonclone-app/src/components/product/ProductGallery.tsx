'use client';
// ============================================================================
// ProductGallery — Valenza Maison Haute Horlogerie & Joaillerie Showcase
// Museum-grade gallery presentation with interactive zoom and lightbox
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Maximize2, X, ChevronLeft, ChevronRight, ZoomIn, Sparkles } from 'lucide-react';
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
            url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&auto=format&fit=crop&q=80',
            alt: title,
            isPrimary: true,
          },
        ];

  // If activeImageOverride matches an image in safeImages, select it
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
        <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 scrollbar-hide max-h-[520px]">
          {safeImages.map((img, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={img.url + index}
                type="button"
                onClick={() => setSelectedIndex(index)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={`relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border transition-all duration-200 bg-[#fbfaf8] dark:bg-[#161a25] ${
                  isSelected
                    ? 'border-[#c5a059] ring-2 ring-[#c5a059]/40 shadow-sm'
                    : 'border-[#ebe2d1] dark:border-[#222838] opacity-75 hover:opacity-100 hover:border-[#c5a059]/60'
                }`}
                aria-label={`View image ${index + 1} of ${safeImages.length}`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `${title} thumbnail ${index + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover p-1 transition-transform duration-300 hover:scale-105"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* ── Main Showcase Viewport ── */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onMouseMove={handleMouseMove}
        className="group relative flex-1 flex items-center justify-center min-h-[380px] md:min-h-[500px] rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 backdrop-blur-xl p-6 md:p-8 overflow-hidden cursor-crosshair shadow-[0_12px_40px_rgba(26,23,20,0.04)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.6)]"
      >
        {/* Ambient warm lighting */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#fbf8f2]/40 via-transparent to-[#f5ede0]/30 dark:from-[#161a25]/50 dark:to-transparent pointer-events-none" />

        <div className="relative h-[340px] md:h-[460px] w-full z-0">
          <Image
            src={activeImage.url}
            alt={activeImage.alt || title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className={`object-contain transition-transform duration-200 ${
              isHovering ? 'scale-[1.28]' : 'scale-100'
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
        <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-[#141312]/80 dark:bg-[#1f2533]/90 backdrop-blur-md text-[#f8f5ee] text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 pointer-events-none border border-[#c5a059]/30">
          <ZoomIn size={12} className="text-[#c5a059]" />
          <span>Interactive Atelier Zoom</span>
        </div>

        {/* Fullscreen Lightbox Button */}
        <button
          type="button"
          onClick={() => setIsZoomModalOpen(true)}
          className="absolute bottom-4 right-4 rounded-full bg-white/90 dark:bg-[#1a202c]/90 p-2.5 shadow-md border border-[#ebe2d1] dark:border-[#2f384d] text-[#615442] dark:text-[#c4b59d] hover:text-[#c5a059] hover:border-[#c5a059] transition-all cursor-pointer backdrop-blur-xs"
          title="Expand Masterpiece View"
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090d]/90 backdrop-blur-md p-4 sm:p-8 animate-fadeIn"
        >
          <button
            type="button"
            onClick={() => setIsZoomModalOpen(false)}
            className="absolute top-6 right-6 rounded-full bg-white/10 border border-white/20 p-3 text-white hover:bg-white/25 hover:border-[#c5a059] transition-colors cursor-pointer"
            aria-label="Close image preview"
          >
            <X size={20} />
          </button>

          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 border border-white/20 p-3.5 text-white hover:bg-white/25 hover:border-[#c5a059] transition-colors cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/10 border border-white/20 p-3.5 text-white hover:bg-white/25 hover:border-[#c5a059] transition-colors cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          <div className="relative max-h-[85vh] max-w-[85vw] w-[880px] h-[680px] bg-[#ffffff] dark:bg-[#12151f] rounded-3xl p-8 flex items-center justify-center shadow-2xl border border-[#ebe2d1] dark:border-[#262c3d]">
            <div className="relative w-full h-full">
              <Image
                src={activeImage.url}
                alt={activeImage.alt || title}
                fill
                sizes="85vw"
                className="object-contain"
              />
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#141312]/90 border border-[#c5a059]/40 text-[#f8f5ee] text-[11px] font-sans tracking-widest uppercase px-4 py-1.5 rounded-full shadow-lg">
              Allocation View {selectedIndex + 1} / {safeImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
