'use client';
// ============================================================================
// PaymentMethodSelector — Demo & Razorpay Test Payment Flow
// Supports Card, Razorpay (Test Mode), UPI, and COD
// Strictly collects ONLY non-sensitive test tokens — NO actual credentials stored
// ============================================================================
import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Banknote,
  ShieldCheck,
  Lock,
  Check,
  Zap,
  Building2,
  Wallet,
  Smartphone,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import type { PaymentMethod } from '@/types';

interface PaymentMethodSelectorProps {
  selectedPayment: PaymentMethod;
  onSelectPayment: (payment: PaymentMethod) => void;
  className?: string;
  orderAmount?: number;
}

export function PaymentMethodSelector({
  selectedPayment,
  onSelectPayment,
  className = '',
  orderAmount = 262.49,
}: PaymentMethodSelectorProps) {
  // Demo card form states
  const [cardHolder, setCardHolder] = useState(selectedPayment.cardHolder || 'Customer Name');
  const [last4, setLast4] = useState(selectedPayment.last4 || '4242');
  const [cardBrand, setCardBrand] = useState(selectedPayment.brand || 'Visa');
  const [expMonth, setExpMonth] = useState('12');
  const [expYear, setExpYear] = useState('2028');

  // Demo UPI states
  const [upiId, setUpiId] = useState(selectedPayment.upiId || 'customer@okhdfcbank');

  // Razorpay Test Mode States
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [razorpayTab, setRazorpayTab] = useState<'card' | 'upi' | 'netbanking' | 'wallet'>('upi');
  const [razorpayTestCard, setRazorpayTestCard] = useState('4111 1111 1111 1111');
  const [razorpayTestUpi, setRazorpayTestUpi] = useState('success@razorpay');
  const [razorpayBank, setRazorpayBank] = useState('HDFC Bank');
  const [razorpayWallet, setRazorpayWallet] = useState('Amazon Pay');
  const [razorpayPaymentId, setRazorpayPaymentId] = useState(
    selectedPayment.razorpayPaymentId || `pay_test_${Math.random().toString(36).substring(2, 10)}`
  );
  const [isRazorpaySimulating, setIsRazorpaySimulating] = useState(false);

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
    } else if (type === 'razorpay') {
      onSelectPayment({
        type: 'razorpay',
        brand: 'Razorpay Test',
        last4: '4111',
        razorpayPaymentId: razorpayPaymentId,
        upiId: razorpayTestUpi,
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

  // Simulate Razorpay Test Payment Success
  const handleSimulateRazorpaySuccess = () => {
    setIsRazorpaySimulating(true);
    setTimeout(() => {
      const generatedId = `pay_test_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
      setRazorpayPaymentId(generatedId);
      setIsRazorpaySimulating(false);
      setIsRazorpayModalOpen(false);

      onSelectPayment({
        type: 'razorpay',
        brand: razorpayTab === 'card' ? 'Visa (Razorpay Test)' : `Razorpay ${razorpayTab.toUpperCase()}`,
        last4: razorpayTab === 'card' ? '4111' : '9999',
        razorpayPaymentId: generatedId,
        upiId: razorpayTestUpi,
      });
    }, 1200);
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

        {/* ── Option 2: Razorpay Payment Gateway (Test Mode) ── */}
        <div
          className={`rounded-lg border transition-all ${
            selectedPayment.type === 'razorpay'
              ? 'border-[#0066cc] bg-[#f0f7ff] ring-2 ring-[#0066cc]'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <label
            onClick={() => handleSelectType('razorpay')}
            className="flex items-center justify-between p-4 cursor-pointer select-none"
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="payment_method"
                checked={selectedPayment.type === 'razorpay'}
                onChange={() => handleSelectType('razorpay')}
                className="h-4 w-4 text-[#0066cc] focus:ring-[#0066cc] border-gray-300 cursor-pointer"
              />
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded bg-[#0c2340] text-white flex items-center justify-center font-black text-xs">
                  R
                </div>
                <div>
                  <span className="text-sm font-bold text-[#0c2340] flex items-center gap-2">
                    Razorpay Payment Gateway
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    Pay securely via Razorpay Test Gateway (UPI, Cards, NetBanking, Wallets)
                  </span>
                </div>
              </div>
            </div>

            <span className="text-[10px] font-bold text-[#0066cc] bg-[#e6f2ff] px-2 py-0.5 rounded border border-[#b3d7ff] uppercase tracking-wider">
              TEST MODE
            </span>
          </label>

          {selectedPayment.type === 'razorpay' && (
            <div className="border-t border-[#b3d7ff] p-4 bg-white space-y-3 text-xs">
              <div className="flex items-center justify-between bg-[#f0f7ff] p-3 rounded-md border border-[#cce5ff]">
                <div>
                  <p className="font-bold text-[#0c2340]">Razorpay Test Environment Active</p>
                  <p className="text-[#565959] text-[11px]">
                    Key ID: <code className="bg-white px-1 rounded border border-gray-300 font-mono text-[10px]">rzp_test_amazon_clone_2026</code>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRazorpayModalOpen(true)}
                  className="px-3 py-1.5 rounded-md bg-[#0066cc] hover:bg-[#004d99] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap size={14} />
                  <span>Launch Razorpay Gateway</span>
                </button>
              </div>

              {selectedPayment.razorpayPaymentId && (
                <div className="rounded border border-emerald-300 bg-emerald-50 p-2.5 flex items-center justify-between text-emerald-900 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#007600] shrink-0" />
                    <span>
                      Payment Authorized ID: <strong className="font-mono">{selectedPayment.razorpayPaymentId}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-800">
                    TEST APPROVED
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Option 3: UPI / QR (Google Pay, PhonePe, Paytm) ── */}
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

        {/* ── Option 4: Cash on Delivery (COD) ── */}
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

      {/* ── Interactive Razorpay Test Modal ── */}
      {isRazorpayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-[1px] p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-300 animate-in zoom-in-95 duration-150">
            {/* Razorpay Brand Header */}
            <div className="bg-[#0c2340] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-7 w-7 rounded bg-[#3395ff] text-white flex items-center justify-center font-black text-sm shadow-xs">
                  R
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
                    Razorpay
                    <span className="bg-[#2b4c7e] text-[9px] font-bold px-1.5 py-0.5 rounded text-blue-200 uppercase">
                      Test Checkout
                    </span>
                  </h3>
                  <p className="text-[10px] text-gray-300">Amazon Clone Marketplace</p>
                </div>
              </div>
              <button
                onClick={() => setIsRazorpayModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Order Amount Bar */}
            <div className="bg-[#f2f4f8] px-5 py-3 flex justify-between items-center border-b border-gray-200">
              <span className="text-xs font-semibold text-gray-600">Total Payable Amount</span>
              <span className="text-base font-extrabold text-[#0c2340]">
                ${orderAmount.toFixed(2)}
              </span>
            </div>

            {/* Razorpay Method Tabs */}
            <div className="flex border-b border-gray-200 text-xs bg-gray-50">
              <button
                type="button"
                onClick={() => setRazorpayTab('upi')}
                className={`flex-1 py-2.5 font-semibold text-center border-b-2 flex items-center justify-center gap-1 cursor-pointer ${
                  razorpayTab === 'upi'
                    ? 'border-[#0066cc] text-[#0066cc] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Smartphone size={14} />
                <span>UPI / QR</span>
              </button>
              <button
                type="button"
                onClick={() => setRazorpayTab('card')}
                className={`flex-1 py-2.5 font-semibold text-center border-b-2 flex items-center justify-center gap-1 cursor-pointer ${
                  razorpayTab === 'card'
                    ? 'border-[#0066cc] text-[#0066cc] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <CreditCard size={14} />
                <span>Cards</span>
              </button>
              <button
                type="button"
                onClick={() => setRazorpayTab('netbanking')}
                className={`flex-1 py-2.5 font-semibold text-center border-b-2 flex items-center justify-center gap-1 cursor-pointer ${
                  razorpayTab === 'netbanking'
                    ? 'border-[#0066cc] text-[#0066cc] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Building2 size={14} />
                <span>NetBanking</span>
              </button>
              <button
                type="button"
                onClick={() => setRazorpayTab('wallet')}
                className={`flex-1 py-2.5 font-semibold text-center border-b-2 flex items-center justify-center gap-1 cursor-pointer ${
                  razorpayTab === 'wallet'
                    ? 'border-[#0066cc] text-[#0066cc] bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                <Wallet size={14} />
                <span>Wallets</span>
              </button>
            </div>

            {/* Tab Details Form */}
            <div className="p-5 space-y-4 text-xs text-gray-800">
              {razorpayTab === 'upi' && (
                <div className="space-y-3">
                  <label className="block font-bold text-gray-900">Select Test UPI ID</label>
                  <select
                    value={razorpayTestUpi}
                    onChange={(e) => setRazorpayTestUpi(e.target.value)}
                    className="w-full rounded border border-gray-300 p-2 text-xs bg-white focus:ring-1 focus:ring-[#0066cc] focus:outline-none"
                  >
                    <option value="success@razorpay">success@razorpay (Instant Success)</option>
                    <option value="googlepay@razorpay">googlepay@razorpay (Google Pay Test)</option>
                    <option value="phonepe@razorpay">phonepe@razorpay (PhonePe Test)</option>
                  </select>
                  <p className="text-[11px] text-gray-500">
                    Simulates instant Razorpay UPI collect authorization.
                  </p>
                </div>
              )}

              {razorpayTab === 'card' && (
                <div className="space-y-3">
                  <label className="block font-bold text-gray-900">Test Card Number</label>
                  <input
                    type="text"
                    value={razorpayTestCard}
                    onChange={(e) => setRazorpayTestCard(e.target.value)}
                    className="w-full rounded border border-gray-300 p-2 text-xs font-mono font-bold bg-gray-50 text-gray-900"
                    readOnly
                  />
                  <div className="flex gap-2 text-[11px] text-gray-500">
                    <span>Expiry: <strong>12/28</strong></span>
                    <span>•</span>
                    <span>CVV: <strong>123</strong></span>
                  </div>
                </div>
              )}

              {razorpayTab === 'netbanking' && (
                <div className="space-y-3">
                  <label className="block font-bold text-gray-900">Select Popular Test Bank</label>
                  <select
                    value={razorpayBank}
                    onChange={(e) => setRazorpayBank(e.target.value)}
                    className="w-full rounded border border-gray-300 p-2 text-xs bg-white"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                  </select>
                </div>
              )}

              {razorpayTab === 'wallet' && (
                <div className="space-y-3">
                  <label className="block font-bold text-gray-900">Select Test Wallet</label>
                  <select
                    value={razorpayWallet}
                    onChange={(e) => setRazorpayWallet(e.target.value)}
                    className="w-full rounded border border-gray-300 p-2 text-xs bg-white"
                  >
                    <option value="Amazon Pay">Amazon Pay</option>
                    <option value="Paytm">Paytm</option>
                    <option value="PhonePe">PhonePe Wallet</option>
                  </select>
                </div>
              )}

              {/* Action Button */}
              <button
                type="button"
                onClick={handleSimulateRazorpaySuccess}
                disabled={isRazorpaySimulating}
                className="w-full py-2.5 rounded-lg bg-[#3395ff] hover:bg-[#0077ff] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isRazorpaySimulating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing Razorpay Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>Pay ${orderAmount.toFixed(2)} (Test Success)</span>
                  </>
                )}
              </button>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-5 py-2.5 border-t border-gray-200 text-[10px] text-gray-500 flex justify-between items-center">
              <span>Secured by Razorpay Test API</span>
              <span>Mode: Simulated 2026</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
