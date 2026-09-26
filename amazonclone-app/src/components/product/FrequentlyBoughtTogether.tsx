'use client';
// ============================================================================
// FrequentlyBoughtTogether — Valenza Maison Curated Complements & Atelier Suite
// ============================================================================
import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Check, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/context/LocationContext';
import type { Product } from '@/types';

interface BundleItem {
  id: string;
  title: string;
  price: number;
  image: string;
  category: string;
}

interface FrequentlyBoughtTogetherProps {
  currentProduct: Product;
  currentPrice: number;
  className?: string;
  onRequireAuth?: () => void;
}

// Luxury complementary accessories
function getComplementaryItems(product: Product): BundleItem[] {
  if (product.category === 'horlogerie' || product.category === 'electronics') {
    return [
      {
        id: 'acc-leather-watch-roll',
        title: 'Handcrafted Tuscan Calfskin Watch & Collector Travel Roll',
        price: 280,
        image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&auto=format&fit=crop&q=80',
        category: 'accessories',
      },
      {
        id: 'acc-swiss-polishing-cloth',
        title: 'Swiss Horology Microfiber Polishing Glove & Care Set',
        price: 95,
        image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&auto=format&fit=crop&q=80',
        category: 'accessories',
      },
    ];
  }

  if (product.category === 'leather' || product.category === 'fashion') {
    return [
      {
        id: 'acc-saphir-leather-balm',
        title: "Saphir Médaille d'Or Artisan Leather Preservation Crème",
        price: 85,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&auto=format&fit=crop&q=80',
        category: 'leather',
      },
      {
        id: 'acc-silk-twill-scarf',
        title: 'Pure Mulberry Silk Twill Protective Atelier Dust Wrap',
        price: 160,
        image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=400&auto=format&fit=crop&q=80',
        category: 'fashion',
      },
    ];
  }

  // Joaillerie / Vault Default
  return [
    {
      id: 'acc-gemological-loupe',
      title: 'Precision 10x Aplanatic Triplet Gemological Loupe & Case',
      price: 175,
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&auto=format&fit=crop&q=80',
      category: 'jewelry',
    },
    {
      id: 'acc-velvet-presentation-tray',
      title: 'Midnight Obsidian Velvet Valet Display & Inspection Tray',
      price: 120,
      image: 'https://images.unsplash.com/photo-1600003014755-ba31aa59c4b6?w=400&auto=format&fit=crop&q=80',
      category: 'jewelry',
    },
  ];
}

export function FrequentlyBoughtTogether({
  currentProduct,
  currentPrice,
  className = '',
  onRequireAuth,
}: FrequentlyBoughtTogetherProps) {
  const { addItem } = useCart();
  const { user } = useAuth();
  const { country, convertPrice } = useLocation();
  const [addedSuccess, setAddedSuccess] = useState(false);

  const accessories = getComplementaryItems(currentProduct);

  const mainItem: BundleItem = {
    id: currentProduct.id,
    title: currentProduct.title,
    price: currentPrice,
    image: currentProduct.images?.[0]?.url || 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400',
    category: currentProduct.category,
  };

  const allItems = [mainItem, ...accessories];

  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([
    mainItem.id,
    accessories[0].id,
    accessories[1].id,
  ]);

  const toggleItem = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter((item) => item !== id));
      }
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const totalBundlePrice = allItems
    .filter((item) => selectedIds.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);

  const localBundlePrice = convertPrice(totalBundlePrice);

  const handleAddBundle = () => {
    if (!user) {
      if (onRequireAuth) {
        onRequireAuth();
        return;
      }
      window.location.href = `/auth/sign-in?redirect=/product/${currentProduct.slug}`;
      return;
    }

    if (selectedIds.includes(mainItem.id)) {
      addItem(currentProduct, 1);
    }

    accessories.forEach((acc) => {
      if (selectedIds.includes(acc.id)) {
        addItem(
          {
            id: acc.id,
            sku: acc.id,
            title: acc.title,
            slug: acc.id,
            description: acc.title,
            category: acc.category,
            brand: 'Valenza Atelier Accessories',
            price: acc.price,
            stock: 50,
            images: [{ url: acc.image, alt: acc.title, isPrimary: true }],
            status: 'active',
            rating: 4.9,
            reviewCount: 88,
            isPrimeEligible: true,
            tags: ['accessories', acc.category],
            deliveryInfo: {
              isFreeDelivery: true,
              estimatedDays: 2,
              fastestDeliveryDate: 'Tomorrow, by 2 PM',
              standardDeliveryDate: 'in 2 days',
              shippingFee: 0,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          1
        );
      }
    });

    setAddedSuccess(true);
    setTimeout(() => setAddedSuccess(false), 3500);
  };

  return (
    <section 
      aria-labelledby="fbt-heading" 
      className={`rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 backdrop-blur-xl p-6 sm:p-8 shadow-[0_12px_40px_rgba(26,23,20,0.03)] dark:shadow-[0_16px_45px_rgba(0,0,0,0.6)] ${className}`}
    >
      <div className="flex items-center gap-2 mb-6 pb-3 border-b border-[#f2ede4] dark:border-[#1e2433]">
        <Sparkles className="w-4 h-4 text-[#c5a059]" />
        <h2 id="fbt-heading" className="font-serif text-lg sm:text-xl font-light tracking-tight text-[#141312] dark:text-[#f8f5ee]">
          Curated Complements &amp; Atelier Suite
        </h2>
      </div>

      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 justify-between">
        {/* Product Images Strip with Plus signs */}
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          {allItems.map((item, index) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <React.Fragment key={item.id}>
                {index > 0 && (
                  <span className="text-[#c5a059] font-serif text-xl select-none">
                    +
                  </span>
                )}
                <div
                  onClick={() => toggleItem(item.id)}
                  className={`relative h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border p-2 bg-[#fbfaf8] dark:bg-[#161a25] cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#c5a059] ring-2 ring-[#c5a059]/30 shadow-sm'
                      : 'border-[#ebe2d1] dark:border-[#222838] opacity-40 grayscale'
                  }`}
                >
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="96px"
                    className="object-contain p-1"
                  />
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 bg-[#c5a059] text-[#12110f] rounded-full p-0.5 shadow-sm">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Bundle Price & Add to Cart button */}
        <div className="flex flex-col gap-3 min-w-[260px]">
          <div className="text-xs text-[#786b58] dark:text-[#9e978b]">
            Suite Valuation:{' '}
            <span className="font-serif text-xl sm:text-2xl font-medium text-[#141312] dark:text-[#f8f5ee] ml-1">
              {country.symbol}{Math.floor(localBundlePrice).toLocaleString(country.locale)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddBundle}
            className="group w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-sans text-xs uppercase tracking-[0.16em] font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] via-[#d6be90] to-[#b89548] hover:brightness-105 active:scale-[0.99] transition-all shadow-[0_4px_16px_rgba(197,160,89,0.25)] cursor-pointer"
          >
            {addedSuccess ? (
              <span className="flex items-center gap-1.5 text-[#12110f]">
                <Check size={15} strokeWidth={3} /> Added to Bag!
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <ShoppingBag size={15} /> Add Bundle to Bag ({selectedIds.length})
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Checkbox list with titles and prices */}
      <div className="mt-6 pt-5 border-t border-[#f2ede4] dark:border-[#1e2433] flex flex-col gap-3">
        {allItems.map((item, index) => {
          const isSelected = selectedIds.includes(item.id);
          const itemLocalPrice = convertPrice(item.price);
          return (
            <label
              key={item.id}
              className="flex items-start gap-3 text-xs text-[#615442] dark:text-[#b8af9f] cursor-pointer select-none hover:text-[#141312] dark:hover:text-[#f8f5ee] transition-colors"
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleItem(item.id)}
                className="mt-0.5 rounded border-[#c5a059] text-[#c5a059] focus:ring-[#c5a059] cursor-pointer accent-[#c5a059]"
              />
              <span>
                <strong className="text-[#141312] dark:text-[#f8f5ee] font-medium">
                  {index === 0 ? 'Featured Piece: ' : ''}
                </strong>
                {item.title} —{' '}
                <span className="font-serif font-semibold text-[#9b8353] dark:text-[#d6be90]">
                  {country.symbol}{Math.floor(itemLocalPrice).toLocaleString(country.locale)}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
