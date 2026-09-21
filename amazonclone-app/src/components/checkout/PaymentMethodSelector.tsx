'use client';
// ============================================================================
// PaymentMethodSelector — Demo Payment Flow (Card, UPI, COD)
// Strictly collects ONLY non-sensitive demo tokens — NO card numbers/CVVs/PINs
// ============================================================================
import React, { useState } from 'react';
import { CreditCard, QrCode, Banknote, ShieldCheck, Lock, Check } from 'lucide-react';
import type { PaymentMethod } from '@/types';

interface PaymentMethodSelectorProps {
  selectedPayment: PaymentMethod;
  onSelectPayment: (payment: PaymentMethod) => void;
  className?: string;
}

export function PaymentMethodSelector({
  selectedPayment,
  onSelectPayment,
  className = '',
}: PaymentMethodSelectorProps) {
  // Demo card form states
  const [cardHolder, setCardHolder] = useState(selectedPayment.cardHolder || 'Customer Name');
  const [last4, setLast4] = useState(selectedPayment.last4 || '4242');
  const [cardBrand, setCardBrand] = useState(selectedPayment.brand || 'Visa');
  const [expMonth, setExpMonth] = useState('12');
  const [expYear, setExpYear] = useState('2028');

  // Demo UPI states
  const [upiId, setUpiId] = useState(selectedPayment.upiId || 'customer@okhdfcbank');

  const handleSelectType = (type: PaymentMethod['type']) => {
    if (type === 'card') {
      onSelectPayment({
        type: 'card',
        brand: cardBrand,
        last4,
        cardHolder,
        expMonth,
        expYear,
      });
    } else if (type === 'upi') {
      onSelectPayment({
        type: 'upi',
        upiId,
      });
    } else {
      onSelectPayment({
        type: 'cod',
      });
    }
  };

  const handleUpdateCard = (updates: {
    cardHolder?: string;
    last4?: string;
    brand?: string;
  }) => {
    const newHolder = updates.cardHolder ?? cardHolder;
    const newLast4 = updates.last4 ?? last4;
    const newBrand = updates.brand ?? cardBrand;

    if (updates.cardHolder !== undefined) setCardHolder(newHolder);
    if (updates.last4 !== undefined) setLast4(newLast4);
    if (updates.brand !== undefined) setCardBrand(newBrand);

    onSelectPayment({
      type: 'card',
      brand: newBrand,
      last4: newLast4,
      cardHolder: newHolder,
      expMonth,
      expYear,
    });
  };

  const handleUpdateUpi = (val: string) => {
    setUpiId(val);
    onSelectPayment({
      type: 'upi',
      upiId: val,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Security Guarantee Banner */}
      <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-xs text-green-800 border border-green-200">
        <ShieldCheck size={18} className="text-green-600 flex-shrink-0" />
        <span>
          <strong>Amazon 256-Bit SSL Encryption</strong>: Sensitive payment credentials (full card numbers, CVVs, UPI PINs) are strictly never collected or stored.
        </span>
      </div>

      <div className="space-y-3">
        {/* ── Option 1: Credit / Debit Card ── */}
        <div
          className={`rounded-lg border transition-all ${
            selectedPayment.type === 'card'
              ? 'border-amazon-orange bg-amber-50/20 ring-2 ring-amazon-orange'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <label
            onClick={() => handleSelectType('card')}
            className="flex items-center justify-between p-4 cursor-pointer select-none"
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="payment_method"
                checked={selectedPayment.type === 'card'}
                onChange={() => handleSelectType('card')}
                className="h-4 w-4 text-amazon-orange focus:ring-amazon-orange border-gray-300 cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-gray-700" />
                <span className="text-sm font-bold text-gray-900">
                  Credit or Debit Card
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-semibold text-gray-500">
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px]">VISA</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px]">Mastercard</span>
              <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px]">RuPay</span>
            </div>
          </label>

          {selectedPayment.type === 'card' && (
            <div className="border-t border-gray-200 p-4 bg-white space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-800 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => handleUpdateCard({ cardHolder: e.target.value })}
                    placeholder="Name on card"
                    className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs focus:ring-1 focus:ring-amazon-orange focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-800 mb-1">
                    Demo Card (Displays Last 4 Digits)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 font-mono select-none">•••• •••• ••••</span>
                    <input
                      type="text"
                      maxLength={4}
                      value={last4}
                      onChange={(e) => handleUpdateCard({ last4: e.target.value.replace(/\D/g, '') })}
                      placeholder="4242"
                      className="w-16 rounded border border-gray-300 px-2 py-1.5 text-xs text-center font-mono font-bold focus:ring-1 focus:ring-amazon-orange focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-gray-800 mb-1">
                    Card Network
                  </label>
                  <select
                    value={cardBrand}
                    onChange={(e) => handleUpdateCard({ brand: e.target.value })}
                    className="w-full rounded border border-gray-300 px-3 py-1.5 text-xs bg-white focus:ring-1 focus:ring-amazon-orange focus:outline-none"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="RuPay">RuPay</option>
                    <option value="Amex">American Express</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-800 mb-1">
                    Expiration
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={expMonth}
                      onChange={(e) => setExpMonth(e.target.value)}
                      className="rounded border border-gray-300 px-2 py-1.5 text-xs bg-white"
                    >
                      {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <span>/</span>
                    <select
                      value={expYear}
                      onChange={(e) => setExpYear(e.target.value)}
                      className="rounded border border-gray-300 px-2 py-1.5 text-xs bg-white"
                    >
                      {['2026', '2027', '2028', '2029', '2030', '2031'].map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Option 2: UPI ── */}
        <div
          className={`rounded-lg border transition-all ${
            selectedPayment.type === 'upi'
              ? 'border-amazon-orange bg-amber-50/20 ring-2 ring-amazon-orange'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <label
            onClick={() => handleSelectType('upi')}
            className="flex items-center justify-between p-4 cursor-pointer select-none"
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="payment_method"
                checked={selectedPayment.type === 'upi'}
                onChange={() => handleSelectType('upi')}
                className="h-4 w-4 text-amazon-orange focus:ring-amazon-orange border-gray-300 cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <QrCode size={18} className="text-gray-700" />
                <span className="text-sm font-bold text-gray-900">
                  UPI / QR (Google Pay, PhonePe, Paytm)
                </span>
              </div>
            </div>

            <span className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200">
              Instant
            </span>
          </label>

          {selectedPayment.type === 'upi' && (
            <div className="border-t border-gray-200 p-4 bg-white space-y-2 text-xs">
              <label className="block font-semibold text-gray-800">
                Enter your UPI ID (VPA)
              </label>
              <div className="flex items-center gap-2 max-w-sm">
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => handleUpdateUpi(e.target.value)}
                  placeholder="e.g. name@okhdfcbank"
                  className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-xs focus:ring-1 focus:ring-amazon-orange focus:outline-none"
                />
                <span className="text-green-700 font-bold flex items-center gap-1 text-[11px]">
                  <Check size={14} /> Verified
                </span>
              </div>
              <p className="text-[11px] text-gray-500">
                A payment request will be sent to your UPI app upon placing the order.
              </p>
            </div>
          )}
        </div>

        {/* ── Option 3: Cash on Delivery (COD) ── */}
        <div
          className={`rounded-lg border transition-all ${
            selectedPayment.type === 'cod'
              ? 'border-amazon-orange bg-amber-50/20 ring-2 ring-amazon-orange'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <label
            onClick={() => handleSelectType('cod')}
            className="flex items-center justify-between p-4 cursor-pointer select-none"
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="payment_method"
                checked={selectedPayment.type === 'cod'}
                onChange={() => handleSelectType('cod')}
                className="h-4 w-4 text-amazon-orange focus:ring-amazon-orange border-gray-300 cursor-pointer"
              />
              <div className="flex items-center gap-2">
                <Banknote size={18} className="text-gray-700" />
                <div>
                  <span className="text-sm font-bold text-gray-900 block">
                    Cash on Delivery / Pay on Delivery
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Pay with Cash or UPI QR at your doorstep
                  </span>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
