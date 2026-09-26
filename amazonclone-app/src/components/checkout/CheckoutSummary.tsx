'use client';
// ============================================================================
// CheckoutSummary — Valenza Maison Private Client Settlement Summary
// ============================================================================
import React from 'react';
import { Lock, ShieldCheck, ArrowRight, Loader2, Award } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import type { Address, PaymentMethod } from '@/types';

interface CheckoutSummaryProps {
  totals: {
    subtotal: number;
    itemCount: number;
    shippingCost: number;
    tax: number;
    discount: number;
    total: number;
  };
  selectedAddress: Address | null;
  selectedPayment: PaymentMethod | null;
  onPlaceOrder: () => void;
  isPlacingOrder: boolean;
  disabled?: boolean;
  className?: string;
}

export function CheckoutSummary({
  totals,
  selectedAddress,
  selectedPayment,
  onPlaceOrder,
  isPlacingOrder,
  disabled = false,
  className = '',
}: CheckoutSummaryProps) {
  const { formatPrice } = useLocation();

  return (
    <div
      className={`rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 backdrop-blur-xl p-6 sm:p-7 shadow-[0_15px_40px_rgba(26,23,20,0.06)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col gap-5 sticky top-24 text-[#141312] dark:text-[#f8f5ee] ${className}`}
    >
      {/* Primary Place Order CTA */}
      <button
        id="place-order-btn"
        disabled={disabled || isPlacingOrder}
        onClick={onPlaceOrder}
        className="group w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-sans text-xs uppercase tracking-[0.18em] font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] via-[#d6be90] to-[#b89548] hover:brightness-105 active:scale-[0.99] transition-all shadow-[0_4px_16px_rgba(197,160,89,0.25)] hover:shadow-[0_6px_22px_rgba(197,160,89,0.35)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        {isPlacingOrder ? (
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-[#12110f]/30 border-t-[#12110f] rounded-full animate-spin" />
            <span>Processing Order...</span>
          </div>
        ) : (
          <>
            <span>Place Order</span>
            <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      {/* Conditions disclaimer */}
      <p className="text-[11px] text-[#8e816e] dark:text-[#7e8aa2] leading-relaxed text-center">
        By confirming, you acknowledge compliance with Valenza Maison&apos;s{' '}
        <span className="text-[#9b8353] dark:text-[#d6be90] hover:underline cursor-pointer">
          Confidentiality Charter
        </span>{' '}
        and{' '}
        <span className="text-[#9b8353] dark:text-[#d6be90] hover:underline cursor-pointer">
          Private Client Terms
        </span>
        .
      </p>

      {/* Order Summary Financial Breakdown */}
      <div className="border-t border-[#f0eae0] dark:border-[#1e2433] pt-4 space-y-2.5 text-xs text-[#615442] dark:text-[#b8af9f]">
        <h4 className="font-serif font-medium text-sm text-[#141312] dark:text-[#f8f5ee] mb-3">
          Order Summary
        </h4>

        <div className="flex justify-between">
          <span>Items ({totals.itemCount}):</span>
          <span className="font-serif font-medium text-[#141312] dark:text-[#f8f5ee]">
            {formatPrice(totals.subtotal)}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Insured Transit &amp; Handling:</span>
          <span className="font-serif font-medium text-[#141312] dark:text-[#f8f5ee]">
            {totals.shippingCost === 0 ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold uppercase text-[11px] tracking-wider">
                Complimentary
              </span>
            ) : (
              formatPrice(totals.shippingCost)
            )}
          </span>
        </div>

        {totals.discount > 0 && (
          <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-medium">
            <span>Privilège Benefit:</span>
            <span className="font-serif">-{formatPrice(totals.discount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Atelier Valuation Tax:</span>
          <span className="font-serif font-medium text-[#141312] dark:text-[#f8f5ee]">
            {formatPrice(totals.tax)}
          </span>
        </div>

        {/* Final Order Total */}
        <div className="border-t border-[#f0eae0] dark:border-[#1e2433] pt-3 flex justify-between items-baseline text-base">
          <span className="font-serif font-semibold text-[#141312] dark:text-[#f8f5ee]">Grand Total:</span>
          <span className="font-serif text-2xl font-light text-[#9b8353] dark:text-[#d6be90]">{formatPrice(totals.total)}</span>
        </div>
      </div>

      {/* Selected Delivery & Payment Quick Overview */}
      {(selectedAddress || selectedPayment) && (
        <div className="border-t border-[#f0eae0] dark:border-[#1e2433] pt-3 text-[11px] text-[#786b58] dark:text-[#9e978b] space-y-1.5">
          {selectedAddress && (
            <p className="line-clamp-1">
              <strong className="text-[#141312] dark:text-[#f8f5ee] font-medium">Destination:</strong>{' '}
              {selectedAddress.fullName}, {selectedAddress.city}
            </p>
          )}
          {selectedPayment && (
            <p>
              <strong className="text-[#141312] dark:text-[#f8f5ee] font-medium">Settlement:</strong>{' '}
              <span className="capitalize">{selectedPayment.type}</span>
              {selectedPayment.type === 'card' &&
                ` (Vault Account ending in **** ${selectedPayment.last4})`}
              {selectedPayment.type === 'upi' && ` (${selectedPayment.upiId})`}
            </p>
          )}
        </div>
      )}

      {/* Security Badge */}
      <div className="border-t border-[#f0eae0] dark:border-[#1e2433] pt-3 flex items-center justify-center gap-2 text-xs text-[#8e816e] dark:text-[#7e8aa2]">
        <Lock size={13} className="text-[#c5a059]" />
        <span>256-Bit Encrypted Vault Protocol</span>
      </div>
    </div>
  );
}
