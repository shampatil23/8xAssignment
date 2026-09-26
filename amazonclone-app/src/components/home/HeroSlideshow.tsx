'use client';
// ============================================================================
// Valenza — Full-Screen Dynamic Luxury Hero Slideshow Powered by GSAP
// Dynamic: Real-time promotional banners & offers managed from Admin.
// Interactive: Entire banner is clickable, automatically applying promo codes
// and smoothly redirecting to the curated collection.
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { fetchHeroBanners } from '@/services/bannerService';
import type { HeroBanner } from '@/types';
import { DEFAULT_HERO_BANNERS } from '@/lib/firebase/database';
import { useCart } from '@/context/CartContext';

export function HeroSlideshow() {
  const router = useRouter();
  const { applyPromoCode } = useCart();

  const [slides, setSlides] = useState<HeroBanner[]>(DEFAULT_HERO_BANNERS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // GSAP animation references
  const containerRef = useRef<HTMLDivElement | null>(null);
  const slideLayersRef = useRef<(HTMLDivElement | null)[]>([]);
  const subtitleRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  // Load real-time dynamic offer banners from DB / local cache
  useEffect(() => {
    let isMounted = true;
    const loadBanners = async () => {
      try {
        const res = await fetchHeroBanners(true);
        if (isMounted && res.success && res.data && res.data.length > 0) {
          setSlides(res.data);
        }
      } catch (err) {
        console.warn('Could not load dynamic banners, using luxury defaults', err);
      }
    };
    loadBanners();
    return () => {
      isMounted = false;
    };
  }, []);

  const totalSlides = slides.length;

  // Auto-play timer
  useEffect(() => {
    if (isHovered || totalSlides <= 1) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % totalSlides);
    }, 7500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isHovered, totalSlides]);

  // Handle Banner Click & Auto-Apply Promo Code
  const handleBannerClick = (targetUrl?: string, offerCode?: string, e?: React.MouseEvent) => {
    // If targetUrl or offerCode is present
    if (offerCode) {
      applyPromoCode(offerCode);
      setToastMessage(`✨ Privilege Code ${offerCode} Applied!`);
      setTimeout(() => setToastMessage(null), 3000);
    }

    const destination = targetUrl || currentSlide.primaryHref || '/deals';
    const finalUrl =
      offerCode && !destination.includes('promo=')
        ? destination.includes('?')
          ? `${destination}&promo=${encodeURIComponent(offerCode)}`
          : `${destination}?promo=${encodeURIComponent(offerCode)}`
        : destination;

    router.push(finalUrl);
  };

  // GSAP Animation Trigger on Slide Change
  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // 1. Cross-fade & scale slide images
      slideLayersRef.current.forEach((layer, idx) => {
        if (!layer) return;
        if (idx === currentIndex) {
          gsap.fromTo(
            layer,
            { opacity: 0, scale: 1.06 },
            { opacity: 1, scale: 1.0, duration: 1.3, ease: 'power2.out', overwrite: 'auto' }
          );
        } else {
          gsap.to(layer, {
            opacity: 0,
            duration: 0.85,
            ease: 'power2.inOut',
            overwrite: 'auto',
          });
        }
      });

      // 2. Timeline for text & offer elements reveal
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      if (subtitleRef.current) {
        tl.fromTo(subtitleRef.current, { x: -20, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55 }, 0.08);
      }
      if (titleRef.current) {
        tl.fromTo(titleRef.current, { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65 }, 0.16);
      }
      if (descRef.current) {
        tl.fromTo(descRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, 0.25);
      }
      if (ctaRef.current) {
        tl.fromTo(ctaRef.current, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: 'back.out(1.2)' }, 0.35);
      }
    }, containerRef);

    return () => ctx.revert();
  }, [currentIndex, slides]);

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const currentSlide = slides[currentIndex] || slides[0] || DEFAULT_HERO_BANNERS[0];

  return (
    <section
      ref={containerRef}
      aria-label="Valenza Luxury Hero Showcase"
      onClick={(e) => handleBannerClick(currentSlide.primaryHref, currentSlide.offerCode, e)}
      className="relative w-full h-[calc(100vh-64px)] sm:h-[calc(100dvh-64px)] min-h-[600px] overflow-hidden select-none bg-[#faf9f6] dark:bg-[#0a0d14] shadow-[0_20px_50px_-10px_rgba(255,255,255,0.7)] dark:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.35)] transition-colors duration-300 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* ── Slide Background Images with GSAP Transition ── */}
      {slides.map((slide, index) => {
        const isCurrent = index === currentIndex;
        return (
          <div
            key={slide.id || index}
            ref={(el) => {
              slideLayersRef.current[index] = el;
            }}
            className={`absolute inset-0 w-full h-full ${
              isCurrent ? 'z-10' : 'z-0 pointer-events-none'
            }`}
            style={{ opacity: isCurrent ? 1 : 0 }}
          >
            <div
              className="w-full h-full bg-cover bg-center transition-all duration-700"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
          </div>
        );
      })}

      {/* ── Atmospheric Vignettes & Luxury Gradients ── */}
      {/* Deep radial vignette */}
      <div className="absolute inset-0 z-15 pointer-events-none shadow-[inset_0_0_140px_rgba(255,255,255,0.75)] dark:shadow-[inset_0_0_140px_rgba(0,0,0,0.92)] transition-shadow duration-300" />

      {/* Top soft shadow under sticky navbar */}
      <div className="absolute top-0 left-0 right-0 h-28 z-15 pointer-events-none bg-gradient-to-b from-white/90 via-white/45 to-transparent dark:from-[#0a0d14]/90 dark:via-[#0a0d14]/40 dark:to-transparent transition-all duration-300" />

      {/* Bottom shadow blend */}
      <div className="absolute bottom-0 left-0 right-0 h-44 sm:h-56 z-15 pointer-events-none bg-gradient-to-t from-[#faf9f6] via-[#faf9f6]/80 to-transparent dark:from-[#0a0d14] dark:via-[#0a0d14]/70 dark:to-transparent transition-all duration-300" />

      {/* Lateral gradient for copy legibility */}
      <div className="absolute inset-y-0 left-0 w-full md:w-3/5 z-15 pointer-events-none bg-gradient-to-r from-white/95 via-white/80 to-transparent dark:from-[#0a0d14]/95 dark:via-[#0a0d14]/80 dark:to-transparent transition-all duration-300" />

      {/* ── Floating Privilege Code Activation Toast ── */}
      {toastMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 px-5 py-2.5 rounded-full bg-[#141312]/90 dark:bg-black/90 backdrop-blur-xl border border-[#dfba73]/60 text-[#dfba73] text-xs font-serif font-semibold tracking-wider shadow-[0_8px_30px_rgba(197,160,89,0.35)] animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-2">
          <Sparkles size={14} className="text-[#dfba73] animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── Hero Foreground Content ── */}
      <div className="relative z-20 h-full max-w-screen-2xl mx-auto px-6 sm:px-12 md:px-16 flex flex-col justify-center pt-8 pb-8">
        {/* Center / Hero Copy */}
        <div className="max-w-3xl py-2 my-auto">
          
          {/* ── Subtitle Tagline ── */}
          {currentSlide.subtitle && (
            <div ref={subtitleRef} className="flex items-center gap-2.5 mb-3.5">
              <div className="h-px w-9 bg-gradient-to-r from-[#8a6827] dark:from-[#dfba73] to-transparent" />
              <span className="text-[11px] sm:text-xs font-serif font-bold tracking-[0.32em] uppercase text-[#8a6827] dark:text-[#dfba73]">
                {currentSlide.subtitle}
              </span>
            </div>
          )}

          {/* ── Main Title ── */}
          <h1
            ref={titleRef}
            className="font-serif text-3xl sm:text-5xl lg:text-6xl font-normal text-[#141312] dark:text-[#fbf9f4] leading-[1.12] tracking-tight mb-4"
          >
            {currentSlide.title}
          </h1>

          {/* ── Description ── */}
          {currentSlide.description && (
            <p
              ref={descRef}
              className="text-sm sm:text-base md:text-lg text-[#423b32] dark:text-[#cbd5e1] font-normal leading-relaxed max-w-2xl mb-7 drop-shadow-xs"
            >
              {currentSlide.description}
            </p>
          )}

          {/* ── Call to Actions (Luxurious Gold + Frosted Glass Dual Action) ── */}
          <div ref={ctaRef} className="flex flex-wrap items-center gap-4 mt-2">
            {/* Primary CTA Button */}
            <button
              type="button"
              id="hero-primary-cta-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleBannerClick(currentSlide.primaryHref, currentSlide.offerCode, e);
              }}
              className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-gradient-to-r from-[#c5a059] via-[#dfba73] to-[#aa8038] hover:brightness-110 text-[#121110] font-serif font-bold text-xs sm:text-[13px] tracking-[0.22em] uppercase shadow-[0_8px_25px_rgba(197,160,89,0.38)] hover:shadow-[0_12px_35px_rgba(197,160,89,0.6)] hover:scale-[1.03] active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <span className="font-serif tracking-[0.22em] font-bold">
                {currentSlide.primaryCta || 'Explore Collection'}
              </span>
              <ArrowRight size={15} className="text-[#121110] group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary Luxury Glass Button (View Offers) */}
            <button
              type="button"
              id="hero-secondary-cta-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleBannerClick(currentSlide.secondaryHref || '/deals', currentSlide.offerCode, e);
              }}
              className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full backdrop-blur-xl bg-white/70 hover:bg-white dark:bg-white/10 dark:hover:bg-white/20 border border-[#c5a059]/70 hover:border-[#dfba73] text-[#141312] dark:text-white hover:text-[#8a6827] dark:hover:text-[#dfba73] font-serif font-semibold text-xs sm:text-[13px] tracking-[0.22em] uppercase shadow-[0_4px_20px_rgba(197,160,89,0.12)] hover:shadow-[0_8px_30px_rgba(197,160,89,0.3)] hover:scale-[1.03] active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <span className="font-serif tracking-[0.22em] font-semibold">
                {currentSlide.secondaryCta &&
                !currentSlide.secondaryCta.toLowerCase().includes('private') &&
                !currentSlide.secondaryCta.toLowerCase().includes('viewing') &&
                !currentSlide.secondaryCta.toLowerCase().includes('access')
                  ? currentSlide.secondaryCta
                  : 'View Offers'}
              </span>
            </button>
          </div>
        </div>

        {/* ── Bottom Bar: Integrated Luxury Carousel Controls & Slide Indicators ── */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-between gap-4 pt-5 border-t border-black/10 dark:border-white/10 cursor-default"
        >
          {/* Left: Slide Counter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-serif tracking-[0.2em] font-semibold text-[#8a6827] dark:text-[#dfba73]">
              0{currentIndex + 1}
            </span>
            <span className="text-xs font-serif text-gray-400">/</span>
            <span className="text-xs font-serif text-gray-400 tracking-[0.15em]">
              0{totalSlides}
            </span>
          </div>

          {/* Right: Slide Controls & Progress Lines */}
          <div className="flex items-center gap-4">
            {/* Prev / Next Mini Controls */}
            {totalSlides > 1 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous Slide"
                  className="p-2 rounded-full bg-white/60 dark:bg-white/10 hover:bg-white dark:hover:bg-white/25 text-[#141312] dark:text-white border border-[#c5a059]/30 hover:border-[#c5a059] backdrop-blur-md shadow-xs transition-all duration-200 cursor-pointer active:scale-90"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next Slide"
                  className="p-2 rounded-full bg-white/60 dark:bg-white/10 hover:bg-white dark:hover:bg-white/25 text-[#141312] dark:text-white border border-[#c5a059]/30 hover:border-[#c5a059] backdrop-blur-md shadow-xs transition-all duration-200 cursor-pointer active:scale-90"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* Slide Progress Bars */}
            <div className="flex items-center gap-2">
              {slides.map((slide, index) => {
                const isActive = index === currentIndex;
                return (
                  <button
                    key={slide.id || index}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(index);
                    }}
                    aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                    className="group py-2 px-0.5 cursor-pointer focus:outline-none"
                  >
                    <div className="relative h-1.5 rounded-full overflow-hidden transition-all duration-500 bg-black/15 dark:bg-white/25 group-hover:bg-black/35 dark:group-hover:bg-white/45 w-8 sm:w-12">
                      {isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[#8a6827] to-[#dfba73] animate-[pulse_2s_infinite]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
