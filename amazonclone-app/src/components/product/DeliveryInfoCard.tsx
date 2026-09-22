'use client';
// ============================================================================
// DeliveryInfoCard — Amazon-style delivery information and trust guarantees
// Reusable across Product Details Page and Checkout
// ============================================================================
import React from 'react';
import { Truck, MapPin, RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { DeliveryInfo } from '@/types';
import { useLocation } from '@/context/LocationContext';

interface DeliveryInfoCardProps {
  deliveryInfo?: DeliveryInfo;
  isOutOfStock?: boolean;
  className?: string;
}

export function DeliveryInfoCard({
  deliveryInfo,
  isOutOfStock = false,
  className = '',
}: DeliveryInfoCardProps) {
  const { country, postalCode, selectedAddress, openLocationModal } = useLocation();

  if (isOutOfStock) {
    return (
      <div className={`rounded border border-gray-200 bg-gray-50 p-3.5 text-xs text-gray-500 ${className}`}>
        <p className="font-medium text-gray-700">Delivery Information</p>
        <p className="mt-1">
          Delivery dates and options will be displayed once the item is back in stock.
        </p>
      </div>
    );
  }

  const destinationLabel = selectedAddress
    ? `${selectedAddress.city} ${postalCode || ''}`
    : `${country.name} ${postalCode || ''}`;

  return (
    <div className={`flex flex-col gap-3 text-xs text-gray-700 ${className}`}>
      {/* ── Location Selector ── */}
      <div className="flex items-center gap-1.5 text-gray-600">
        <MapPin size={14} className="text-amazon-link flex-shrink-0" />
        <div className="flex items-center gap-1">
          <span>Deliver to</span>
          <button
            type="button"
            onClick={openLocationModal}
            className="font-semibold text-amazon-link hover:underline hover:text-amazon-link-hover cursor-pointer"
            title="Change delivery address or country"
          >
            {destinationLabel}
          </button>
        </div>
      </div>

      {/* ── Delivery Promises ── */}
      {deliveryInfo && (
        <div className="space-y-1.5 border-t border-gray-100 pt-2.5">
          <div className="flex items-start gap-2">
            <Truck size={16} className="text-amazon-orange flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-900">
                <span className="font-bold text-gray-900">
                  {deliveryInfo.isFreeDelivery ? `FREE delivery to ${country.name} ` : `Delivery to ${country.name} `}
                </span>
                <span className="font-semibold text-gray-900">
                  {deliveryInfo.fastestDeliveryDate}
                </span>
                .
              </p>
              <p className="text-[11px] text-gray-500">
                Order within <span className="font-semibold text-green-700">4 hrs 15 mins</span>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-6 text-[11px] text-gray-500">
            <span>Or standard delivery:</span>
            <span className="font-medium text-gray-800">
              {deliveryInfo.standardDeliveryDate}
            </span>
          </div>
        </div>
      )}

      {/* ── Amazon 4-Pillar Trust Strip ── */}
      <div className="grid grid-cols-4 gap-1.5 border-t border-gray-100 pt-3 text-center text-[10px] text-amazon-link">
        <div className="flex flex-col items-center gap-1 hover:underline cursor-pointer">
          <RotateCcw size={18} className="text-gray-600" />
          <span>30 days Replacement</span>
        </div>
        <div className="flex flex-col items-center gap-1 hover:underline cursor-pointer">
          <Truck size={18} className="text-gray-600" />
          <span>Free Delivery</span>
        </div>
        <div className="flex flex-col items-center gap-1 hover:underline cursor-pointer">
          <CheckCircle2 size={18} className="text-gray-600" />
          <span>Amazon Delivered</span>
        </div>
        <div className="flex flex-col items-center gap-1 hover:underline cursor-pointer">
          <ShieldCheck size={18} className="text-gray-600" />
          <span>Secure Transaction</span>
        </div>
      </div>
    </div>
  );
}
