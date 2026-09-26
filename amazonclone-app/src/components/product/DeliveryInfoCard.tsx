'use client';
// ============================================================================
// DeliveryInfoCard — Valenza Maison White Glove Atelier Services & Guarantees
// Luxury insured transit, private concierge dispatch, and 4-pillar atelier assurances
// ============================================================================
import React from 'react';
import { Truck, MapPin, RotateCcw, ShieldCheck, Award, Lock, Sparkles } from 'lucide-react';
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
      <div className={`rounded-2xl border border-[#ebe2d1] dark:border-[#262c3d] bg-[#fbfaf8] dark:bg-[#161a25] p-4 text-xs text-[#786b58] dark:text-[#9e978b] ${className}`}>
        <p className="font-semibold uppercase tracking-wider text-[11px] text-[#9b8353] dark:text-[#d6be90]">
          Private Vault Allocation
        </p>
        <p className="mt-1 text-xs">
          This piece is currently committed. Contact your Maison Client Advisor to request next allocation availability.
        </p>
      </div>
    );
  }

  const destinationLabel = selectedAddress
    ? `${selectedAddress.city} ${postalCode || ''}`
    : `${country.name} ${postalCode || ''}`;

  return (
    <div className={`flex flex-col gap-3 text-xs text-[#615442] dark:text-[#b8af9f] ${className}`}>
      {/* ── Location Selector ── */}
      <div className="flex items-center gap-2 text-xs">
        <MapPin size={15} className="text-[#c5a059] flex-shrink-0" />
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[#8e816e] dark:text-[#7e8aa2]">Deliver to:</span>
          <button
            type="button"
            onClick={openLocationModal}
            className="font-semibold text-[#141312] dark:text-[#f8f5ee] hover:text-[#c5a059] dark:hover:text-[#d6be90] underline underline-offset-2 decoration-[#c5a059]/40 cursor-pointer transition-colors"
            title="Change destination or country"
          >
            {destinationLabel}
          </button>
        </div>
      </div>

      {/* ── Delivery Promises ── */}
      {deliveryInfo && (
        <div className="space-y-1.5 border-t border-[#f0eae0] dark:border-[#1e2433] pt-3">
          <div className="flex items-start gap-2.5">
            <Truck size={16} className="text-[#c5a059] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#141312] dark:text-[#f8f5ee] font-medium leading-snug">
                <span className="font-semibold text-[#9b8353] dark:text-[#d6be90]">
                  {deliveryInfo.isFreeDelivery ? 'Complimentary Insured Courier ' : 'Express Insured Dispatch '}
                </span>
                to {country.name}:{' '}
                <span className="font-semibold">
                  {deliveryInfo.fastestDeliveryDate}
                </span>
              </p>
              <p className="text-[11px] text-[#8e816e] dark:text-[#7e8aa2] mt-0.5">
                White-glove armored signature release required upon delivery.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Maison 4-Pillar Atelier Guarantees ── */}
      <div className="grid grid-cols-4 gap-2 border-t border-[#f0eae0] dark:border-[#1e2433] pt-3 text-center text-[10px]">
        <div className="flex flex-col items-center gap-1.5 p-1.5 rounded-xl hover:bg-[#f5ede0]/40 dark:hover:bg-[#1f2637]/40 transition-colors">
          <Award size={16} className="text-[#9b8353] dark:text-[#d6be90]" />
          <span className="leading-tight font-medium text-[#615442] dark:text-[#c4b59d]">
            Atelier Certified
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5 p-1.5 rounded-xl hover:bg-[#f5ede0]/40 dark:hover:bg-[#1f2637]/40 transition-colors">
          <Truck size={16} className="text-[#9b8353] dark:text-[#d6be90]" />
          <span className="leading-tight font-medium text-[#615442] dark:text-[#c4b59d]">
            Insured Transit
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5 p-1.5 rounded-xl hover:bg-[#f5ede0]/40 dark:hover:bg-[#1f2637]/40 transition-colors">
          <RotateCcw size={16} className="text-[#9b8353] dark:text-[#d6be90]" />
          <span className="leading-tight font-medium text-[#615442] dark:text-[#c4b59d]">
            30-Day Salon
          </span>
        </div>
        <div className="flex flex-col items-center gap-1.5 p-1.5 rounded-xl hover:bg-[#f5ede0]/40 dark:hover:bg-[#1f2637]/40 transition-colors">
          <ShieldCheck size={16} className="text-[#9b8353] dark:text-[#d6be90]" />
          <span className="leading-tight font-medium text-[#615442] dark:text-[#c4b59d]">
            Vault Encrypted
          </span>
        </div>
      </div>
    </div>
  );
}
