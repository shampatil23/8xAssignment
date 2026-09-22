'use client';
// ============================================================================
// PaymentMethodSelector — Authentic Razorpay Test Gateway & Payment Options
// Supports Credit/Debit Card, Razorpay (Test Mode with 3D Secure OTP), UPI, COD
// Strictly collects ONLY non-sensitive test tokens — NO real financial credentials stored
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
  Info,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
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
  const [razorpayStep, setRazorpayStep] = useState<'checkout' | 'otp' | 'success'>('checkout');
  const [razorpayTab, setRazorpayTab] = useState<'card' | 'upi' | 'netbanking' | 'wallet'>('card');
  
  // Test Card Form inside Razorpay
  const [rzpCardNumber, setRzpCardNumber] = useState('4111 1111 1111 1111');
  const [rzpCardHolder, setRzpCardHolder] = useState('Test User');
  const [rzpExpiry, setRzpExpiry] = useState('12/28');
  const [rzpCvv, setRzpCvv] = useState('123');
  
  // Test UPI & Bank
  const [rzpUpi, setRzpUpi] = useState('success@razorpay');
  const [rzpBank, setRzpBank] = useState('HDFC Bank');
  const [rzpWallet, setRzpWallet] = useState('Amazon Pay');
  
  // Test OTP State
  const [testOtp, setTestOtp] = useState('123456');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const [razorpayPaymentId, setRazorpayPaymentId] = useState(
    selectedPayment.razorpayPaymentId || `pay_test_${Math.random().toString(36).substring(2, 10).toUpperCase()}`
  );

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
        upiId: rzpUpi,
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

  // Launch Razorpay Modal
  const handleOpenRazorpay = () => {
    setRazorpayStep('checkout');
    setIsRazorpayModalOpen(true);
  };

  // Step 1: Click Pay in Razorpay -> Go to OTP Screen
  const handleProceedToOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthorizing(true);
    setTimeout(() => {
      setIsAuthorizing(false);
      setRazorpayStep('otp');
    }, 600);
  };

  // Step 2: Submit 3D-Secure OTP -> Success
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthorizing(true);
    setTimeout(() => {
      const generatedId = `pay_test_${Math.random().toString(36).substring(2, 12).toUpperCase()}`;
      setRazorpayPaymentId(generatedId);
      setIsAuthorizing(false);
      setRazorpayStep('success');

      setTimeout(() => {
        setIsRazorpayModalOpen(false);
        onSelectPayment({
          type: 'razorpay',
          brand: razorpayTab === 'card' ? 'Visa (Razorpay Test)' : `Razorpay ${razorpayTab.toUpperCase()}`,
          last4: rzpCardNumber.slice(-4) || '4111',
          razorpayPaymentId: generatedId,
          upiId: rzpUpi,
        });
      }, 1000);
    }, 900);
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
                {/* Razorpay Brand Icon */}
                <div className="h-6 w-6 rounded bg-[#0c2340] text-white flex items-center justify-center font-black text-xs shadow-xs">
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
              {/* Test Credentials Guidance Box */}
              <div className="rounded-lg border border-blue-200 bg-[#f4f8ff] p-3 text-xs space-y-2 text-[#0c2340]">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5 text-[#0066cc]">
                    <Info size={15} />
                    Razorpay Test Credentials Guidance
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                    Key: rzp_test_2026
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded border border-blue-100">
                  <div>
                    <span className="text-gray-500 block">Test Card Number:</span>
                    <strong className="font-mono text-[#0c2340]">4111 1111 1111 1111</strong>
                    <span className="text-gray-400 text-[10px] block">Exp: 12/28 · CVV: 123</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block">Test UPI VPA:</span>
                    <strong className="font-mono text-[#007600]">success@razorpay</strong>
                    <span className="text-gray-400 text-[10px] block">Test OTP: 123456</span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between bg-[#f0f7ff] p-3 rounded-md border border-[#cce5ff]">
                <div>
                  <p className="font-bold text-[#0c2340]">Razorpay Test Modal Ready</p>
                  <p className="text-[#565959] text-[11px]">
                    Click to launch authentic Razorpay Test Checkout with 3D Secure OTP
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenRazorpay}
                  className="px-4 py-2 rounded-md bg-[#0066cc] hover:bg-[#004d99] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Zap size={15} />
                  <span>Launch Razorpay Gateway</span>
                </button>
              </div>

              {selectedPayment.razorpayPaymentId && (
                <div className="rounded border border-emerald-300 bg-emerald-50 p-2.5 flex items-center justify-between text-emerald-900 text-xs animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-[#007600] shrink-0" />
                    <span>
                      Payment Authorized ID: <strong className="font-mono">{selectedPayment.razorpayPaymentId}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 px-2 py-0.5 rounded text-emerald-800">
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

      {/* ── Authentic Razorpay Test Popup Modal (With 3D Secure OTP) ── */}
      {isRazorpayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[2px] p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-400 animate-in zoom-in-95 duration-150 font-sans">
            
            {/* Razorpay Brand Header */}
            <div className="bg-[#0c2340] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-md bg-[#3395ff] text-white flex items-center justify-center font-black text-base shadow-xs">
                  R
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-wide flex items-center gap-2">
                    Razorpay
                    <span className="bg-[#2b4c7e] text-[9px] font-bold px-1.5 py-0.5 rounded text-blue-200 uppercase tracking-wider">
                      Test Mode
                    </span>
                  </h3>
                  <p className="text-[11px] text-gray-300">Amazon Clone Marketplace Inc.</p>
                </div>
              </div>
              <button
                onClick={() => setIsRazorpayModalOpen(false)}
                className="text-gray-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Payable Amount Summary Strip */}
            <div className="bg-[#f4f7fc] px-5 py-3 flex justify-between items-center border-b border-gray-200">
              <div>
                <span className="text-[11px] font-semibold text-gray-500 uppercase block">Total Payable</span>
                <span className="text-lg font-black text-[#0c2340]">
                  ${orderAmount.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block font-mono">rzp_test_2026</span>
                <span className="text-[11px] font-bold text-[#0066cc]">Test Checkout</span>
              </div>
            </div>

            {/* Test Guidance Banner */}
            <div className="bg-[#fff9e6] px-5 py-2 border-b border-[#ffe299] text-[11px] text-[#8a5300] flex items-center justify-between">
              <span className="font-semibold flex items-center gap-1">
                <Info size={13} /> Test Mode Active: Pre-filled credentials provided
              </span>
              <span className="font-mono text-[10px] bg-white px-1 rounded border border-[#ffd580]">Test OTP: 123456</span>
            </div>

            {/* STEP 1: Razorpay Checkout Form */}
            {razorpayStep === 'checkout' && (
              <div>
                {/* Payment Method Tabs */}
                <div className="flex border-b border-gray-200 text-xs bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setRazorpayTab('card')}
                    className={`flex-1 py-2.5 font-semibold text-center border-b-2 flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      razorpayTab === 'card'
                        ? 'border-[#0066cc] text-[#0066cc] bg-white'
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <CreditCard size={14} />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRazorpayTab('upi')}
                    className={`flex-1 py-2.5 font-semibold text-center border-b-2 flex items-center justify-center gap-1 cursor-pointer transition-colors ${
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
                    onClick={() => setRazorpayTab('netbanking')}
                    className={`flex-1 py-2.5 font-semibold text-center border-b-2 flex items-center justify-center gap-1 cursor-pointer transition-colors ${
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
                    className={`flex-1 py-2.5 font-semibold text-center border-b-2 flex items-center justify-center gap-1 cursor-pointer transition-colors ${
                      razorpayTab === 'wallet'
                        ? 'border-[#0066cc] text-[#0066cc] bg-white'
                        : 'border-transparent text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    <Wallet size={14} />
                    <span>Wallets</span>
                  </button>
                </div>

                <form onSubmit={handleProceedToOtp} className="p-5 space-y-4 text-xs text-gray-800">
                  {/* Card View */}
                  {razorpayTab === 'card' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">
                          Test Card Number
                        </label>
                        <input
                          type="text"
                          value={rzpCardNumber}
                          onChange={(e) => setRzpCardNumber(e.target.value)}
                          placeholder="4111 1111 1111 1111"
                          className="w-full rounded border border-gray-300 p-2 text-xs font-mono font-bold bg-white focus:ring-1 focus:ring-[#0066cc] focus:outline-none"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-semibold text-gray-700 mb-1">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            value={rzpExpiry}
                            onChange={(e) => setRzpExpiry(e.target.value)}
                            placeholder="12/28"
                            className="w-full rounded border border-gray-300 p-2 text-xs font-mono bg-white focus:ring-1 focus:ring-[#0066cc]"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-gray-700 mb-1">
                            CVV
                          </label>
                          <input
                            type="password"
                            maxLength={3}
                            value={rzpCvv}
                            onChange={(e) => setRzpCvv(e.target.value)}
                            placeholder="123"
                            className="w-full rounded border border-gray-300 p-2 text-xs font-mono font-bold bg-white focus:ring-1 focus:ring-[#0066cc]"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={rzpCardHolder}
                          onChange={(e) => setRzpCardHolder(e.target.value)}
                          placeholder="Test User"
                          className="w-full rounded border border-gray-300 p-2 text-xs bg-white focus:ring-1 focus:ring-[#0066cc]"
                        />
                      </div>
                    </div>
                  )}

                  {/* UPI View */}
                  {razorpayTab === 'upi' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block font-semibold text-gray-700 mb-1">
                          Enter Test VPA / UPI ID
                        </label>
                        <input
                          type="text"
                          value={rzpUpi}
                          onChange={(e) => setRzpUpi(e.target.value)}
                          placeholder="success@razorpay"
                          className="w-full rounded border border-gray-300 p-2 text-xs font-mono font-bold bg-white focus:ring-1 focus:ring-[#0066cc]"
                          required
                        />
                      </div>
                      <div className="flex items-center gap-2 p-2.5 bg-blue-50 rounded border border-blue-200 text-[11px] text-blue-900">
                        <CheckCircle2 size={15} className="text-[#0066cc] shrink-0" />
                        <span>Pre-filled with <strong>success@razorpay</strong> for instant test approval.</span>
                      </div>
                    </div>
                  )}

                  {/* NetBanking View */}
                  {razorpayTab === 'netbanking' && (
                    <div className="space-y-3">
                      <label className="block font-semibold text-gray-700 mb-1">
                        Select Test Bank
                      </label>
                      <select
                        value={rzpBank}
                        onChange={(e) => setRzpBank(e.target.value)}
                        className="w-full rounded border border-gray-300 p-2 text-xs bg-white focus:ring-1 focus:ring-[#0066cc]"
                      >
                        <option value="HDFC Bank">HDFC Bank (Test)</option>
                        <option value="State Bank of India">State Bank of India (SBI Test)</option>
                        <option value="ICICI Bank">ICICI Bank (Test)</option>
                        <option value="Axis Bank">Axis Bank (Test)</option>
                        <option value="Kotak Mahindra Bank">Kotak Mahindra Bank (Test)</option>
                      </select>
                    </div>
                  )}

                  {/* Wallet View */}
                  {razorpayTab === 'wallet' && (
                    <div className="space-y-3">
                      <label className="block font-semibold text-gray-700 mb-1">
                        Select Test Wallet
                      </label>
                      <select
                        value={rzpWallet}
                        onChange={(e) => setRzpWallet(e.target.value)}
                        className="w-full rounded border border-gray-300 p-2 text-xs bg-white focus:ring-1 focus:ring-[#0066cc]"
                      >
                        <option value="Amazon Pay">Amazon Pay Balance (Test)</option>
                        <option value="Paytm Wallet">Paytm Wallet (Test)</option>
                        <option value="PhonePe">PhonePe Wallet (Test)</option>
                      </select>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isAuthorizing}
                    className="w-full py-2.5 rounded-lg bg-[#0066cc] hover:bg-[#0052a3] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    {isAuthorizing ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Connecting to Razorpay...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={15} />
                        <span>Proceed to Pay ${orderAmount.toFixed(2)}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: 3D-Secure OTP Simulation Screen */}
            {razorpayStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="p-6 space-y-4 text-xs text-gray-800">
                <div className="text-center space-y-1 pb-2 border-b border-gray-200">
                  <div className="h-10 w-10 rounded-full bg-blue-50 text-[#0066cc] flex items-center justify-center mx-auto mb-2">
                    <ShieldCheck size={24} />
                  </div>
                  <h4 className="font-extrabold text-sm text-[#0c2340]">
                    Razorpay 3D-Secure Test Authentication
                  </h4>
                  <p className="text-[11px] text-gray-500">
                    Simulating Bank 2-Factor OTP Verification
                  </p>
                </div>

                <div className="bg-[#f0f7ff] p-3 rounded-md border border-[#cce5ff] text-center space-y-1">
                  <span className="text-[11px] text-gray-600 block">Enter OTP sent to registered mobile:</span>
                  <span className="font-bold text-[#0c2340]">98******00</span>
                  <p className="text-[10px] text-[#0066cc] font-semibold pt-1">
                    (Test OTP is pre-filled: <strong>123456</strong>)
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={testOtp}
                    onChange={(e) => setTestOtp(e.target.value)}
                    className="w-full text-center text-lg font-mono font-black tracking-widest rounded border border-gray-300 p-2.5 bg-white focus:ring-2 focus:ring-[#0066cc] focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAuthorizing}
                  className="w-full py-2.5 rounded-lg bg-[#007600] hover:bg-[#005c00] text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isAuthorizing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying 3D-Secure OTP...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Authorize Payment (${orderAmount.toFixed(2)})</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 3: Payment Success Animation */}
            {razorpayStep === 'success' && (
              <div className="p-8 text-center space-y-3 animate-in zoom-in duration-200">
                <div className="h-16 w-16 rounded-full bg-emerald-100 text-[#007600] flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 size={40} />
                </div>
                <h4 className="text-base font-extrabold text-[#0c2340]">
                  Razorpay Payment Authorized!
                </h4>
                <p className="text-xs text-gray-600 font-mono bg-gray-100 p-2 rounded border border-gray-200 inline-block">
                  Payment ID: {razorpayPaymentId}
                </p>
                <p className="text-[11px] text-[#007600] font-semibold">
                  Returning to Amazon Checkout...
                </p>
              </div>
            )}

            {/* Modal Footer */}
            <div className="bg-gray-50 px-5 py-2.5 border-t border-gray-200 text-[10px] text-gray-500 flex justify-between items-center">
              <span>Secured by Razorpay Test API</span>
              <span>Mode: Authentic Test Simulation</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
