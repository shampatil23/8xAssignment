'use client';
// ============================================================================
// Quadrant Category Grid — Ultra-Luxury Editorial 2×2 Ateliers
// Palette: Warm Ivory (#fcfbf9), Champagne Gold (#c5a059, #dfba73), Charcoal Noir (#171513)
// Connected dynamically to live database & seller catalog
// ============================================================================
import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Headphones,
  Shirt,
  Watch,
  Gem,
  ShoppingBag,
  Armchair,
  Flame,
  ArrowRight,
  BookOpen,
  Award,
  Sparkles,
  Layers,
} from 'lucide-react';
import { fetchProducts } from '@/services/productService';
import type { Product } from '@/types';

interface SalonSectionConfig {
  id: string;
  categorySlug: string;
  kicker: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  fallbackItems: {
    id: string;
    name: string;
    image: string;
    href: string;
  }[];
}

const SALON_SECTIONS: SalonSectionConfig[] = [
  // ── Card 1: Luxury Watches & Timepieces ──
  {
    id: 'horlogerie',
    categorySlug: 'electronics',
    kicker: 'SWISS MANUFACTURE',
    title: 'Haute Horlogerie',
    subtitle: 'Grand complications, perpetual calendars, and tourbillons.',
    icon: Watch,
    fallbackItems: [
      {
        id: 'fb-watch-1',
        name: 'Tourbillon Edition',
        image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&auto=format&fit=crop&q=85',
        href: '/category/electronics',
      },
      {
        id: 'fb-watch-2',
        name: 'Chronograph Calibre',
        image: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=600&auto=format&fit=crop&q=85',
        href: '/category/electronics',
      },
      {
        id: 'fb-watch-3',
        name: 'Royal Oak Skeleton',
        image: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&auto=format&fit=crop&q=85',
        href: '/category/electronics',
      },
      {
        id: 'fb-watch-4',
        name: 'Traditionnelle Complication',
        image: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600&auto=format&fit=crop&q=85',
        href: '/category/electronics',
      },
    ],
  },

  // ── Card 2: Fine Jewelry & Fragrances ──
  {
    id: 'high-jewelry',
    categorySlug: 'beauty',
    kicker: 'PRECIOUS ATELIERS',
    title: 'High Joaillerie & Fragrance',
    subtitle: 'Flawless diamonds, royal emeralds, and Grasse extraits.',
    icon: Gem,
    fallbackItems: [
      {
        id: 'fb-jewel-1',
        name: 'Solitaire Diamonds',
        image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&auto=format&fit=crop&q=85',
        href: '/category/beauty',
      },
      {
        id: 'fb-jewel-2',
        name: 'Colombian Emeralds',
        image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=85',
        href: '/category/beauty',
      },
      {
        id: 'fb-jewel-3',
        name: 'Grasse Rose Extrait',
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=600&auto=format&fit=crop&q=85',
        href: '/category/beauty',
      },
      {
        id: 'fb-jewel-4',
        name: 'Panthère Gold Ring',
        image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=85',
        href: '/category/beauty',
      },
    ],
  },

  // ── Card 3: Fashion & Haute Couture ──
  {
    id: 'couture',
    categorySlug: 'fashion',
    kicker: 'PARISIAN EDITIONS',
    title: 'Haute Couture & Leather',
    subtitle: 'Handcrafted steamer trunks, exotics, and silk tailoring.',
    icon: ShoppingBag,
    fallbackItems: [
      {
        id: 'fb-fashion-1',
        name: 'Cabin Steamer Trunk',
        image: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=600&auto=format&fit=crop&q=85',
        href: '/category/fashion',
      },
      {
        id: 'fb-fashion-2',
        name: 'Togo Calfskin Bag',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=85',
        href: '/category/fashion',
      },
      {
        id: 'fb-fashion-3',
        name: 'Caviar Classic Flap',
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&auto=format&fit=crop&q=85',
        href: '/category/fashion',
      },
      {
        id: 'fb-fashion-4',
        name: 'Vicuña Overcoat',
        image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=85',
        href: '/category/fashion',
      },
    ],
  },

  // ── Card 4: Home & Sanctuary Living ──
  {
    id: 'sanctuary-living',
    categorySlug: 'home-garden',
    kicker: 'SANCTUARY OBJECTS',
    title: 'Maison Living & Art',
    subtitle: 'Murano blown glass, statuary marble, and gilded bronzes.',
    icon: Armchair,
    fallbackItems: [
      {
        id: 'fb-home-1',
        name: 'Murano Glass Vase',
        image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&auto=format&fit=crop&q=85',
        href: '/category/home-garden',
      },
      {
        id: 'fb-home-2',
        name: 'Carrara Marble Table',
        image: 'https://images.unsplash.com/photo-1540177656454-3f6c4547bed1?w=600&auto=format&fit=crop&q=85',
        href: '/category/home-garden',
      },
      {
        id: 'fb-home-3',
        name: 'Crystal Chandelier',
        image: 'https://images.unsplash.com/photo-1546379045-bfd4808b24d0?w=600&auto=format&fit=crop&q=85',
        href: '/category/home-garden',
      },
      {
        id: 'fb-home-4',
        name: 'Heritage Leather Chair',
        image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=85',
        href: '/category/home-garden',
      },
    ],
  },

  // ── Card 5: Electronics & Premium Audio ──
  {
    id: 'sculptural-audio',
    categorySlug: 'computers',
    kicker: 'ACOUSTIC ARTISTRY',
    title: 'Sculptural Audio & Tech',
    subtitle: 'Valve amplifiers, marble turntables, and titanium drivers.',
    icon: Headphones,
    fallbackItems: [
      {
        id: 'fb-audio-1',
        name: 'Sound Center',
        image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&auto=format&fit=crop&q=85',
        href: '/category/computers',
      },
      {
        id: 'fb-audio-2',
        name: 'Vacuum Tube Amp',
        image: 'https://images.unsplash.com/photo-1767808452633-58fa8d05bf9d?w=600&auto=format&fit=crop&q=85',
        href: '/category/computers',
      },
      {
        id: 'fb-audio-3',
        name: 'Vinyl Turntable',
        image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&auto=format&fit=crop&q=85',
        href: '/category/computers',
      },
      {
        id: 'fb-audio-4',
        name: 'Leica Rangefinder',
        image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=85',
        href: '/category/computers',
      },
    ],
  },

  // ── Card 6: Rare Folios & Heritage Archives (Replaces Wine Section) ──
  {
    id: 'rare-editions',
    categorySlug: 'books',
    kicker: 'HERITAGE ARCHIVES',
    title: 'Rare Folios & Editions',
    subtitle: 'First-edition literature, handcrafted bindings, and archival masterworks.',
    icon: BookOpen,
    fallbackItems: [
      {
        id: 'fb-book-1',
        name: 'Gatsby First Edition',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=85',
        href: '/category/books',
      },
      {
        id: 'fb-book-2',
        name: 'Assouline Horology',
        image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=85',
        href: '/category/books',
      },
      {
        id: 'fb-book-3',
        name: 'Shakespeare First Folio',
        image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=600&auto=format&fit=crop&q=85',
        href: '/category/books',
      },
      {
        id: 'fb-book-4',
        name: 'Audubon Elephant Folio',
        image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=85',
        href: '/category/books',
      },
    ],
  },
];

export function QuadrantCategoryGrid() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadCatalog() {
      try {
        const res = await fetchProducts();
        if (isMounted && res.success && res.data) {
          setProducts(res.data);
        }
      } catch (err) {
        console.warn('[QuadrantCategoryGrid] live catalog fetch error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCatalog();
    return () => {
      isMounted = false;
    };
  }, []);

  // Group products dynamically by category
  const categorizedItems = useMemo(() => {
    return SALON_SECTIONS.map((section) => {
      // Find all live active products in this category
      const matching = products.filter((p) => {
        if (p.status !== 'active') return false;
        const cat = p.category?.toLowerCase() || '';
        const target = section.categorySlug.toLowerCase();
        if (cat === target) return true;
        if ((target === 'home-garden' || target === 'home-kitchen') && (cat === 'home-garden' || cat === 'home-kitchen')) {
          return true;
        }
        if ((target === 'electronics' || target === 'watches') && (cat === 'electronics' || cat === 'watches')) {
          return true;
        }
        return false;
      });

      // Map live products to grid items
      const liveItems = matching.slice(0, 4).map((p) => {
        // Shorten long title cleanly for 2x2 grid tile
        const shortName = p.title.length > 26 ? `${p.title.slice(0, 24)}...` : p.title;
        const imgUrl =
          p.images && p.images.length > 0 && p.images[0].url
            ? p.images[0].url
            : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600';

        return {
          id: p.id,
          name: shortName,
          image: imgUrl,
          href: `/product/${p.slug}`,
          brand: p.brand,
          price: p.price,
          isLiveSellerItem: true,
        };
      });

      // If fewer than 4 live items, fill remaining slots with curated high-res fallbacks
      const remainingSlots = 4 - liveItems.length;
      const combined =
        remainingSlots > 0
          ? [...liveItems, ...section.fallbackItems.slice(0, remainingSlots)]
          : liveItems;

      return {
        ...section,
        items: combined,
        itemCount: matching.length,
      };
    });
  }, [products]);

  const renderSectionCard = (section: (typeof categorizedItems)[0]) => {
    const SectionIcon = section.icon;
    const headerHref = `/category/${section.categorySlug}`;

    return (
      <div
        key={section.id}
        className="
          rounded-[24px] sm:rounded-[28px]
          border border-[#ebe2d1] dark:border-[#2a2418]
          bg-[#fcfbf9] dark:bg-[#11141c]
          p-4 sm:p-5
          shadow-[0_8px_24px_rgba(197,160,89,0.06)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.45)]
          hover:shadow-[0_14px_32px_rgba(197,160,89,0.12)] dark:hover:shadow-[0_14px_32px_rgba(0,0,0,0.65)]
          hover:border-[#c5a059]/60 dark:hover:border-[#dfba73]/40
          transition-all duration-300 flex flex-col justify-between group/card
        "
      >
        {/* ── Top Header Section ── */}
        <div className="mb-3">
          {/* Kicker + Circle Arrow button row */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-sans text-[9.5px] sm:text-[10px] font-semibold tracking-[0.22em] uppercase text-[#9b7835] dark:text-[#dfba73] block">
                {section.kicker}
              </span>
              <Link href={headerHref} className="group/headtitle block mt-0.5">
                <h3 className="font-serif text-lg sm:text-xl md:text-[22px] font-normal tracking-tight text-[#141312] dark:text-[#f8f5ee] leading-tight group-hover/headtitle:text-[#8a6827] dark:group-hover/headtitle:text-[#dfba73] transition-colors">
                  {section.title}
                </h3>
              </Link>
            </div>

            {/* Header Right Circle Arrow Button */}
            <Link
              href={headerHref}
              className="
                w-7 h-7 sm:w-8 sm:h-8 rounded-full
                border border-[#dcd2bf] dark:border-[#382f1d]
                hover:border-[#b89047] dark:hover:border-[#dfba73]
                bg-[#f8f4ec] dark:bg-[#171c26]
                text-[#8a6827] dark:text-[#dfba73]
                flex items-center justify-center shrink-0
                hover:bg-[#8a6827] hover:text-white dark:hover:bg-[#dfba73] dark:hover:text-[#121110]
                shadow-xs hover:scale-105 transition-all
              "
              aria-label={`Explore ${section.title}`}
            >
              <ArrowRight size={13} strokeWidth={2} />
            </Link>
          </div>

          {/* Subtitle */}
          <p className="text-[11px] sm:text-xs text-[#787166] dark:text-[#9ea3b0] font-sans font-normal mt-1 leading-relaxed line-clamp-1">
            {section.subtitle}
          </p>
        </div>

        {/* ── 2×2 Sub-items Product Cards Grid (Real Products from Sellers & Catalog) ── */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 my-auto">
          {section.items.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className="
                group/item flex flex-col rounded-[16px] sm:rounded-[18px] overflow-hidden
                border border-[#ede4d4] dark:border-[#282218]
                bg-white dark:bg-[#141722]
                hover:border-[#c5a059] dark:hover:border-[#dfba73]
                shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:shadow-[0_6px_18px_rgba(197,160,89,0.1)]
                transition-all duration-300 cursor-pointer
              "
            >
              {/* Image Box with Floating Category Icon */}
              <div className="relative w-full h-22 sm:h-24 md:h-26 lg:h-28 overflow-hidden bg-[#f5efe5]/70 dark:bg-[#191e2b]/70">
                {/* Floating Luxury Circular Icon Badge on Top-Left */}
                <div
                  className="
                    absolute top-2 left-2 z-10
                    w-6 h-6 rounded-full
                    bg-black/45 backdrop-blur-md border border-white/30
                    text-white flex items-center justify-center shadow-xs
                  "
                >
                  <SectionIcon size={11} className="text-white/95" />
                </div>

                {/* Product Image with Graceful Error Fallback */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover/item:scale-108 transition-transform duration-500 ease-out"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop&q=80';
                  }}
                />
              </div>

              {/* Bottom Label Bar with Sub-item Arrow */}
              <div
                className="
                  flex items-center justify-between px-2.5 sm:px-3 py-1.5 sm:py-2
                  bg-[#faf7f1] dark:bg-[#151924]
                  border-t border-[#ede4d4] dark:border-[#232938]
                "
              >
                <span
                  className="
                    font-serif text-[11px] sm:text-xs font-medium
                    text-[#181614] dark:text-[#f8f5ee]
                    group-hover/item:text-[#8a6827] dark:group-hover/item:text-[#dfba73]
                    transition-colors truncate pr-1
                  "
                  title={item.name}
                >
                  {item.name}
                </span>

                <div
                  className="
                    w-5 h-5 rounded-full
                    border border-[#d8ccb8] dark:border-[#382f1d]
                    bg-[#f8f4ec] dark:bg-[#1b212f]
                    text-[#8a6827] dark:text-[#dfba73]
                    flex items-center justify-center shrink-0
                    group-hover/item:bg-[#8a6827] group-hover/item:text-white
                    dark:group-hover/item:bg-[#dfba73] dark:group-hover/item:text-[#121110]
                    transition-all
                  "
                >
                  <ArrowRight size={10} strokeWidth={2.4} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Strong Dark-Gold "EXPLORE COLLECTION" CTA Pill ── */}
        <Link
          href={headerHref}
          className="
            mt-3.5 w-full py-2.5 sm:py-3 px-4 sm:px-5 rounded-full
            bg-gradient-to-r from-[#171513] via-[#201b16] to-[#12100e]
            dark:from-[#0d1017] dark:via-[#161b26] dark:to-[#090b10]
            border border-[#c5a059]/50 hover:border-[#dfba73]
            shadow-md hover:shadow-lg flex items-center justify-between group transition-all
          "
        >
          <div className="flex items-center gap-1.5">
            <Gem size={12} className="text-[#dfba73] opacity-80 group-hover:opacity-100 transition-opacity" />
            <span className="font-serif tracking-[0.18em] text-[10px] sm:text-[11px] uppercase font-bold text-[#dfba73] group-hover:text-[#fae5b6] transition-colors">
              EXPLORE {section.title}
            </span>
          </div>

          {/* Right Gold Shimmer Arrow Circle */}
          <div
            className="
              w-6.5 h-6.5 sm:w-7 sm:h-7 rounded-full
              bg-gradient-to-tr from-[#c5a059] to-[#ebd29b]
              text-[#121110] flex items-center justify-center
              shadow-xs group-hover:translate-x-1 group-hover:scale-105 transition-all shrink-0
            "
          >
            <ArrowRight size={12} strokeWidth={2.5} />
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
      {categorizedItems.map((section) => renderSectionCard(section))}
    </div>
  );
}
