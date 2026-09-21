'use client';
// ============================================================================
// DeliveryInfoCard — Amazon-style delivery information and trust guarantees
// Reusable across Product Details Page and Checkout
// ============================================================================
import React, { useState } from 'react';
import { Truck, MapPin, RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { DeliveryInfo } from '@/types';

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
  const [pincode, setPincode] = useState('110001');
  const [city, setCity] = useState('New Delhi');
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [tempPincode, setTempPincode] = useState(pincode);

  function handleSaveLocation(e: React.FormEvent) {
    e.preventDefault();
    if (tempPincode.trim().length >= 4) {
      setPincode(tempPincode.trim());
      setCity('Select Location');
      setIsEditingLocation(false);
    }
  }

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

  return (
    <div className={`flex flex-col gap-3 text-xs text-gray-700 ${className}`}>
      {/* ── Location Selector ── */}
      <div className="flex items-center gap-1.5 text-gray-600">
        <MapPin size={14} className="text-amazon-link flex-shrink-0" />
        {isEditingLocation ? (
          <form onSubmit={handleSaveLocation} className="flex items-center gap-1">
            <input
              type="text"
              value={tempPincode}
              onChange={(e) => setTempPincode(e.target.value)}
              placeholder="Enter Pincode"
              maxLength={6}
              className="w-24 rounded border border-gray-300 px-2 py-0.5 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amazon-orange"
            />
            <button
              type="submit"
              className="rounded bg-gray-100 px-2 py-0.5 text-[11px] font-semibold text-gray-800 hover:bg-gray-200"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={() => setIsEditingLocation(false)}
              className="text-[11px] text-gray-500 hover:underline"
            >
              Cancel
            </button>
          </form>
        ) : (
          <div className="flex items-center gap-1">
            <span>Deliver to</span>
            <button
              type="button"
              onClick={() => setIsEditingLocation(true)}
              className="font-semibold text-amazon-link hover:underline hover:text-amazon-link-hover"
            >
              {city} {pincode}
            </button>
          </div>
        )}
      </div>

      {/* ── Delivery Promises ── */}
      {deliveryInfo && (
        <div className="space-y-1.5 border-t border-gray-100 pt-2.5">
          <div className="flex items-start gap-2">
            <Truck size={16} className="text-amazon-orange flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-gray-900">
                <span className="font-bold text-gray-900">
                  {deliveryInfo.isFreeDelivery ? 'FREE delivery ' : 'Delivery '}
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
