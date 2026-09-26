'use client';
// ============================================================================
// DeliveryOptions — Valenza Maison White-Glove Armored Courier Selection
// ============================================================================
import React from 'react';
import { Truck, Shield, Clock } from 'lucide-react';
import type { ShippingOption } from '@/types';
import { DEFAULT_SHIPPING_OPTIONS } from '@/services/checkoutService';
import { useLocation } from '@/context/LocationContext';

interface DeliveryOptionsProps {
  options?: ShippingOption[];
  selectedOptionId: string;
  onSelectOption: (option: ShippingOption) => void;
  subtotal: number;
  className?: string;
}

export function DeliveryOptions({
  options = DEFAULT_SHIPPING_OPTIONS,
  selectedOptionId,
  onSelectOption,
  subtotal,
  className = '',
}: DeliveryOptionsProps) {
  const { country, convertPrice } = useLocation();

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="font-serif text-sm font-medium text-[#141312] dark:text-[#f8f5ee] mb-3">
        Select Courier &amp; Transit Protocol
      </h3>

      <div className="space-y-3">
        {options.map((option) => {
          const isSelected = option.id === selectedOptionId;
          const isFreeStandard = option.id === 'ship-standard' && (subtotal >= 35 || option.price === 0);
          const effectivePrice = isFreeStandard ? 0 : option.price;
          const localPrice = convertPrice(effectivePrice);

          return (
            <label
              key={option.id}
              onClick={() => onSelectOption({ ...option, price: effectivePrice })}
              className={`flex items-start justify-between rounded-2xl border p-4 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-[#c5a059] bg-[#fdfbf7] dark:bg-[#1c2230] ring-2 ring-[#c5a059]/30 shadow-xs'
                  : 'border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#161a25] hover:border-[#c5a059]/60'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <input
                  type="radio"
                  name="delivery_option"
                  checked={isSelected}
                  onChange={() => onSelectOption({ ...option, price: effectivePrice })}
                  className="mt-1 h-4 w-4 text-[#c5a059] focus:ring-[#c5a059] border-[#dfd6c5] cursor-pointer accent-[#c5a059]"
                />

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-serif text-sm font-medium text-[#141312] dark:text-[#f8f5ee]">
                      {option.title}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9b8353] dark:text-[#d6be90] bg-[#f6efe1] dark:bg-[#1a2130] px-2.5 py-0.5 rounded-full border border-[#e4d6bf] dark:border-[#2f384d]">
                      <Clock size={11} className="text-[#c5a059]" />
                      <span>{option.estimatedDate}</span>
                    </span>
                  </div>

                  <p className="text-xs text-[#786b58] dark:text-[#9e978b] leading-relaxed">
                    {option.description}
                  </p>
                </div>
              </div>

              <div className="text-right pl-4">
                <span className="font-serif text-sm font-semibold text-[#141312] dark:text-[#f8f5ee]">
                  {effectivePrice === 0 ? (
                    <span className="text-emerald-700 dark:text-emerald-400 uppercase font-semibold text-xs tracking-wider">
                      Complimentary
                    </span>
                  ) : (
                    `${country.symbol}${Math.floor(localPrice).toLocaleString(country.locale)}`
                  )}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
