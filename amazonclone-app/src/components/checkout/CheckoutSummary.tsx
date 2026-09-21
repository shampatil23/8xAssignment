'use client';
// ============================================================================
// CheckoutSummary — Amazon-style Sticky Order Summary Sidebar
// ============================================================================
import React from 'react';
import { Lock, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Address, PaymentMethod } from '@/types';
import type { CheckoutTotals } from '@/services/checkoutService';

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
  return (
    <div
      className={`rounded-lg border border-gray-300 bg-white p-5 shadow-xs flex flex-col gap-4 sticky top-24 ${className}`}
    >
      {/* Primary Place Order CTA */}
      <Button
        id="place-order-btn"
        variant="buy-now"
        fullWidth
        disabled={disabled || isPlacingOrder}
        onClick={onPlaceOrder}
        className="py-2.5 font-bold flex items-center justify-center gap-2 shadow-xs text-sm"
      >
        {isPlacingOrder ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Processing your order...</span>
          </>
        ) : (
          <>
            <span>Place your order</span>
            <ArrowRight size={16} />
          </>
        )}
      </Button>

      {/* Conditions disclaimer */}
      <p className="text-[11px] text-gray-500 leading-tight text-center">
        By placing your order, you agree to Amazon Clone&apos;s{' '}
        <span className="text-amazon-link hover:underline cursor-pointer">
          conditions of use
        </span>{' '}
        and{' '}
        <span className="text-amazon-link hover:underline cursor-pointer">
          privacy notice
        </span>
        .
      </p>

      {/* Order Summary Financial Breakdown */}
      <div className="border-t border-gray-200 pt-3 space-y-2 text-xs text-gray-700">
        <h4 className="font-bold text-gray-900 text-sm mb-2">Order Summary</h4>

        <div className="flex justify-between">
          <span>Items ({totals.itemCount}):</span>
          <span className="font-medium text-gray-900">
            ${totals.subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex justify-between">
          <span>Shipping &amp; handling:</span>
          <span className="font-medium text-gray-900">
            {totals.shippingCost === 0 ? (
              <span className="text-green-700 font-bold uppercase text-[11px]">
                FREE
              </span>
            ) : (
              `$${totals.shippingCost.toFixed(2)}`
            )}
          </span>
        </div>

        {totals.discount > 0 && (
          <div className="flex justify-between text-green-700 font-semibold">
            <span>Promotion Applied:</span>
            <span>-${totals.discount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Estimated tax:</span>
          <span className="font-medium text-gray-900">
            ${totals.tax.toFixed(2)}
          </span>
        </div>

        {/* Final Order Total */}
        <div className="border-t border-gray-200 pt-3 flex justify-between items-baseline text-base font-bold text-[#b12704]">
          <span>Order total:</span>
          <span className="text-xl font-bold">${totals.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Selected Delivery & Payment Quick Overview */}
      {(selectedAddress || selectedPayment) && (
        <div className="border-t border-gray-100 pt-3 text-[11px] text-gray-600 space-y-1">
          {selectedAddress && (
            <p className="line-clamp-1">
              <strong className="text-gray-800">Ship to:</strong>{' '}
              {selectedAddress.fullName}, {selectedAddress.city}
            </p>
          )}
          {selectedPayment && (
            <p>
              <strong className="text-gray-800">Pay with:</strong>{' '}
              <span className="capitalize">{selectedPayment.type}</span>
              {selectedPayment.type === 'card' &&
                ` (Ending in ${selectedPayment.last4})`}
              {selectedPayment.type === 'upi' && ` (${selectedPayment.upiId})`}
            </p>
          )}
        </div>
      )}

      {/* Security Badge */}
      <div className="border-t border-gray-100 pt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
        <Lock size={14} className="text-gray-400" />
        <span>100% Safe &amp; Secure Checkout</span>
      </div>
    </div>
  );
}
