'use client';
// ============================================================================
// DeliveryOptions — Amazon-style Delivery Speed / Shipping Selection
// ============================================================================
import React from 'react';
import { Truck, Zap, Clock } from 'lucide-react';
import type { ShippingOption } from '@/types';
import { DEFAULT_SHIPPING_OPTIONS } from '@/services/checkoutService';

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
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-bold text-gray-900 mb-2">
        Choose a delivery speed
      </h3>

      <div className="space-y-2.5">
        {options.map((option) => {
          const isSelected = option.id === selectedOptionId;
          const isFreeStandard = option.id === 'ship-standard' && (subtotal >= 35 || option.price === 0);
          const effectivePrice = isFreeStandard ? 0 : option.price;

          return (
            <label
              key={option.id}
              onClick={() => onSelectOption({ ...option, price: effectivePrice })}
              className={`flex items-start justify-between rounded-lg border p-3.5 cursor-pointer transition-all ${
                isSelected
                  ? 'border-amazon-orange bg-amber-50/30 ring-2 ring-amazon-orange shadow-xs'
                  : 'border-gray-300 bg-white hover:border-gray-400'
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="delivery_option"
                  checked={isSelected}
                  onChange={() => onSelectOption({ ...option, price: effectivePrice })}
                  className="mt-0.5 h-4 w-4 text-amazon-orange focus:ring-amazon-orange border-gray-300 cursor-pointer"
                />

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">
                      {option.title}
                    </span>
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
                      {option.estimatedDate}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {option.description}
                  </p>
                </div>
              </div>

              <div className="text-right pl-3">
                <span className="text-sm font-bold text-gray-900">
                  {effectivePrice === 0 ? (
                    <span className="text-green-700 uppercase font-bold text-xs">
                      FREE
                    </span>
                  ) : (
                    `$${effectivePrice.toFixed(2)}`
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
