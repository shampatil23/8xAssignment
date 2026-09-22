'use client';
// ============================================================================
// Hero Slideshow Component — matching home1.png
// Multi-card horizontal carousel with vibrant category cards, titles & images
// ============================================================================
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroCard {
  id: string;
  title: string;
  bgColor: string;
  image: string;
  href: string;
  alt: string;
}

const SLIDES: HeroCard[][] = [
  // Slide 1 (Matching home1.png)
  [
    {
      id: 'kitchen',
      title: 'Shop kitchen must-haves',
      bgColor: '#d7e6e3',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
      href: '/search?category=home-garden&q=kitchen',
      alt: 'Kitchen appliances and must-haves',
    },
    {
      id: 'beauty',
      title: 'Shop all things beauty',
      bgColor: '#fcdbd1',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop&q=80',
      href: '/category/beauty',
      alt: 'Beauty products, cosmetics and brushes',
    },
    {
      id: 'fashion',
      title: 'Start looking sharp',
      bgColor: '#ded3c7',
      image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=600&auto=format&fit=crop&q=80',
      href: '/category/fashion',
      alt: 'Fashion clothing rack and outfits',
    },
    {
      id: 'toys',
      title: 'Toys for little ones',
      bgColor: '#cce3f7',
      image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=600&auto=format&fit=crop&q=80',
      href: '/category/toys',
      alt: 'Toys, teddy bears and games for kids',
    },
  ],
  // Slide 2
  [
    {
      id: 'tech',
      title: 'Score the top tech & audio',
      bgColor: '#e2e8f0',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80',
      href: '/category/electronics',
      alt: 'Top tech and audio gear',
    },
    {
      id: 'home',
      title: 'Fantastic finds for Home',
      bgColor: '#e8dfd8',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&auto=format&fit=crop&q=80',
      href: '/category/home-garden',
      alt: 'Home furniture, living room decor and comfort',
    },
    {
      id: 'fitness',
      title: 'Gear up to get fit',
      bgColor: '#fdecd2',
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
      href: '/category/sports',
      alt: 'Fitness, workouts and athletic gear',
    },
    {
      id: 'gaming',
      title: 'Level up your gaming setup',
      bgColor: '#e2dbf6',
      image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=600&auto=format&fit=crop&q=80',
      href: '/search?q=gaming',
      alt: 'Gaming consoles, controllers and accessories',
    },
  ],
];

export function HeroSlideshow() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const totalSlides = SLIDES.length;

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered, totalSlides]);

  const handlePrev = () => {
    setCurrentSlideIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % totalSlides);
  };

  return (
    <div
      className="relative w-full overflow-hidden mb-6 group select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides Container */}
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentSlideIndex * 100}%)` }}
      >
        {SLIDES.map((slideCards, slideIdx) => (
          <div
            key={slideIdx}
            className="w-full flex-shrink-0 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 px-1"
          >
            {slideCards.map((card) => (
              <Link
                key={card.id}
                href={card.href}
                className="group/card flex flex-col justify-between rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 h-[380px] sm:h-[420px] md:h-[460px] cursor-pointer"
                style={{ backgroundColor: card.bgColor }}
              >
                {/* Title */}
                <div className="p-4 sm:p-5">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 leading-tight tracking-tight group-hover/card:text-amazon-link transition-colors">
                    {card.title}
                  </h2>
                </div>

                {/* Image */}
                <div className="relative w-full h-[240px] sm:h-[280px] md:h-[310px] overflow-hidden flex items-end justify-center">
                  <img
                    src={card.image}
                    alt={card.alt}
                    className="w-full h-full object-cover object-center group-hover/card:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {/* Navigation Buttons (Authentic pure white pill matching home1.png) */}
      {currentSlideIndex > 0 && (
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous slide"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex h-24 w-10 sm:w-12 items-center justify-center rounded-r-lg bg-white hover:bg-[#f7fafa] text-[#0f1111] shadow-[0_2px_12px_rgba(0,0,0,0.18)] hover:shadow-[0_4px_18px_rgba(0,0,0,0.25)] border-y border-r border-[#d5d9d9] hover:border-[#a6a6a6] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#007185]"
        >
          <ChevronLeft size={28} strokeWidth={2.5} />
        </button>
      )}

      {currentSlideIndex < totalSlides - 1 && (
        <button
          type="button"
          onClick={handleNext}
          aria-label="Next slide"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex h-24 w-10 sm:w-12 items-center justify-center rounded-l-lg bg-white hover:bg-[#f7fafa] text-[#0f1111] shadow-[0_2px_12px_rgba(0,0,0,0.18)] hover:shadow-[0_4px_18px_rgba(0,0,0,0.25)] border-y border-l border-[#d5d9d9] hover:border-[#a6a6a6] transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#007185]"
        >
          <ChevronRight size={28} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
}
