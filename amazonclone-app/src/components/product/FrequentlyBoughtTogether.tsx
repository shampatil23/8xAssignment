'use client';
// ============================================================================
// FrequentlyBoughtTogether — Amazon-style bundle add-to-cart component
// ============================================================================
import React, { useState } from 'react';
import Image from 'next/image';
import { Plus, Check, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/hooks/useAuth';
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

// Sensible accessories based on current product category
function getComplementaryItems(product: Product): BundleItem[] {
  if (product.category === 'electronics' || product.category === 'computers') {
    return [
      {
        id: 'acc-anker-cable-6ft',
        title: 'Anker Premium Braided USB-C to USB-C Fast Charging Cable (6ft, 100W)',
        price: 16.99,
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
        category: 'accessories',
      },
      {
        id: 'acc-protective-sleeve',
        title: 'Amazon Basics Shockproof Electronics Protection Travel Case (Water-Resistant)',
        price: 24.50,
        image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&auto=format&fit=crop&q=80',
        category: 'accessories',
      },
    ];
  }

  if (product.category === 'fashion') {
    return [
      {
        id: 'acc-leather-care-kit',
        title: 'Premium All-Weather Leather & Fabric Protector Spray (12 oz)',
        price: 14.99,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=400&auto=format&fit=crop&q=80',
        category: 'fashion',
      },
      {
        id: 'acc-cotton-socks-3pk',
        title: 'Breathable Moisture-Wicking Cushioned Crew Socks (3 Pairs)',
        price: 12.99,
        image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=400&auto=format&fit=crop&q=80',
        category: 'fashion',
      },
    ];
  }

  // Generic fallback for home/books/other
  return [
    {
      id: 'acc-microfiber-cloths',
      title: 'AmazonCommercial Multi-Surface Microfiber Cleaning Cloths (12-Pack)',
      price: 11.99,
      image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&auto=format&fit=crop&q=80',
      category: 'home',
    },
    {
      id: 'acc-universal-adapter',
      title: 'Universal Compact Travel Power Adapter Surge Protector',
      price: 19.99,
      image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&auto=format&fit=crop&q=80',
      category: 'electronics',
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
  const [addedSuccess, setAddedSuccess] = useState(false);

  const accessories = getComplementaryItems(currentProduct);

  const mainItem: BundleItem = {
    id: currentProduct.id,
    title: currentProduct.title,
    price: currentPrice,
    image: currentProduct.images?.[0]?.url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
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
    // Keep at least one item selected
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

  const handleAddBundle = () => {
    if (!user) {
      if (onRequireAuth) {
        onRequireAuth();
        return;
      }
      window.location.href = `/auth/sign-in?redirect=/product/${currentProduct.slug}`;
      return;
    }

    // Add each selected item to cart
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
            brand: 'Amazon Basics',
            price: acc.price,
            stock: 50,
            images: [{ url: acc.image, alt: acc.title, isPrimary: true }],
            status: 'active',
            rating: 4.6,
            reviewCount: 420,
            isPrimeEligible: true,
            tags: ['accessories', acc.category],
            deliveryInfo: {
              isFreeDelivery: true,
              estimatedDays: 2,
              fastestDeliveryDate: 'Tomorrow, 8 PM',
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
    <section aria-labelledby="fbt-heading" className={`rounded-lg border border-gray-200 bg-white p-5 shadow-sm ${className}`}>
      <h2 id="fbt-heading" className="text-base font-bold text-gray-900 mb-4">
        Frequently bought together
      </h2>

      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 justify-between">
        {/* Product Images Strip with Plus signs */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {allItems.map((item, index) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <React.Fragment key={item.id}>
                {index > 0 && (
                  <span className="text-gray-400 font-bold text-lg select-none">
                    +
                  </span>
                )}
                <div
                  onClick={() => toggleItem(item.id)}
                  className={`relative h-20 w-20 sm:h-24 sm:w-24 rounded border p-1 bg-white cursor-pointer transition-all ${
                    isSelected
                      ? 'border-amazon-orange shadow-xs'
                      : 'border-gray-200 opacity-40 grayscale'
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
                    <div className="absolute -top-1.5 -right-1.5 bg-amazon-orange text-white rounded-full p-0.5 shadow-xs">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Bundle Price & Add to Cart button */}
        <div className="flex flex-col gap-2 min-w-[240px]">
          <div className="text-sm text-gray-700">
            Total price:{' '}
            <span className="text-xl font-bold text-[#b12704]">
              ${totalBundlePrice.toFixed(2)}
            </span>
          </div>

          <Button
            type="button"
            variant="cart"
            onClick={handleAddBundle}
            className="w-full sm:w-auto"
          >
            {addedSuccess ? (
              <span className="flex items-center gap-1.5 text-green-800">
                <Check size={16} strokeWidth={3} /> Added to Cart!
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <ShoppingCart size={16} /> Add all {selectedIds.length} to Cart
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Checkbox list with titles and prices */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
        {allItems.map((item, index) => {
          const isSelected = selectedIds.includes(item.id);
          return (
            <label
              key={item.id}
              className="flex items-start gap-2.5 text-xs text-gray-700 cursor-pointer select-none hover:text-gray-900"
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggleItem(item.id)}
                className="mt-0.5 rounded border-gray-300 text-amazon-orange focus:ring-amazon-orange cursor-pointer"
              />
              <span>
                <strong className="text-gray-900">
                  {index === 0 ? 'This item: ' : ''}
                </strong>
                {item.title} —{' '}
                <span className="font-bold text-[#b12704]">
                  ${item.price.toFixed(2)}
                </span>
              </span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
