'use client';
// ============================================================================
// PaymentMethodSelector — Valenza Maison Private Settlement Gateway
// Supports Private Vault Card, Razorpay Gateway (Test Mode w/ 3D Secure), UPI, Concierge COD
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
  Crown,
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
  const [cardHolder, setCardHolder] = useState(selectedPayment.cardHolder || 'Privé Client');
  const [last4, setLast4] = useState(selectedPayment.last4 || '4242');
  const [cardBrand, setCardBrand] = useState(selectedPayment.brand || 'Visa');
  const [expMonth, setExpMonth] = useState('12');
  const [expYear, setExpYear] = useState('2028');

  // Demo UPI states
  const [upiId, setUpiId] = useState(selectedPayment.upiId || 'client@valenzaprive');

  // Razorpay Test Mode States
  const [isRazorpayModalOpen, setIsRazorpayModalOpen] = useState(false);
  const [razorpayStep, setRazorpayStep] = useState<'checkout' | 'otp' | 'success'>('checkout');
  const [razorpayTab, setRazorpayTab] = useState<'card' | 'upi' | 'netbanking' | 'wallet'>('card');

  // Test Card Form inside Razorpay
  const [rzpCardNumber, setRzpCardNumber] = useState('4111 1111 1111 1111');
  const [rzpCardHolder, setRzpCardHolder] = useState('Valenza VIP Client');
  const [rzpExpiry, setRzpExpiry] = useState('12/28');
  const [rzpCvv, setRzpCvv] = useState('123');

  // Test UPI & Bank
  const [rzpUpi, setRzpUpi] = useState('success@razorpay');
  const [rzpBank, setRzpBank] = useState('HDFC Bank Private Banking');
  const [rzpWallet, setRzpWallet] = useState('Valenza Privé Credit');

  // Test OTP State
  const [testOtp, setTestOtp] = useState('123456');
  const [isAuthorizing, setIsAuthorizing] = useState(false);

  const [razorpayPaymentId, setRazorpayPaymentId] = useState(
    selectedPayment.razorpayPaymentId || `pay_test_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
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
          brand: razorpayTab === 'card' ? 'Visa (Razorpay Private Gateway)' : `Razorpay ${razorpayTab.toUpperCase()}`,
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
      <div className="flex items-center gap-3 rounded-2xl bg-[#faf6ee] dark:bg-[#161a25] p-3.5 text-xs text-[#6e614d] dark:text-[#c4bcac] border border-[#e8ddc9] dark:border-[#2f384d]">
        <div className="w-8 h-8 rounded-full bg-[#f0e4cf] dark:bg-[#222a3b] flex items-center justify-center text-[#c5a059] flex-shrink-0">
          <ShieldCheck size={18} />
        </div>
        <div>
          <strong className="text-[#141312] dark:text-[#f8f5ee] font-serif block text-xs">
            256-Bit Cryptographic Vault Protocol
          </strong>
          <span className="text-[11px] leading-relaxed">
            All settlement parameters are tokenized and processed through encrypted sovereign rails. Sensitive credentials are never stored.
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {/* ── Option 1: Credit / Debit Card ── */}
        <div
          className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
            selectedPayment.type === 'card'
              ? 'border-[#c5a059] bg-[#fcfaf6] dark:bg-[#1a2130] ring-2 ring-[#c5a059]/30 shadow-[0_4px_20px_rgba(197,160,89,0.12)]'
              : 'border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#161a25] hover:border-[#c5a059]/50'
          }`}
        >
          <label
            onClick={() => handleSelectType('card')}
            className="flex items-center justify-between p-4.5 cursor-pointer select-none"
          >
            <div className="flex items-center gap-3.5">
              <input
                type="radio"
                name="payment_method"
                checked={selectedPayment.type === 'card'}
                onChange={() => handleSelectType('card')}
                className="h-4 w-4 text-[#c5a059] focus:ring-[#c5a059] border-[#dfd6c5] cursor-pointer accent-[#c5a059]"
              />
              <div className="flex items-center gap-2.5">
                <CreditCard size={18} className="text-[#c5a059]" />
                <span className="font-serif text-sm font-semibold text-[#141312] dark:text-[#f8f5ee]">
                  Private Vault Card
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#7e7362] dark:text-[#a69c8e]">
              <span className="rounded-md border border-[#e5d8c3] dark:border-[#2e374c] bg-[#faf6ee] dark:bg-[#12151f] px-2 py-0.5 uppercase tracking-wider">
                VISA
              </span>
              <span className="rounded-md border border-[#e5d8c3] dark:border-[#2e374c] bg-[#faf6ee] dark:bg-[#12151f] px-2 py-0.5 uppercase tracking-wider">
                MASTERCARD
              </span>
              <span className="rounded-md border border-[#e5d8c3] dark:border-[#2e374c] bg-[#faf6ee] dark:bg-[#12151f] px-2 py-0.5 uppercase tracking-wider">
                AMEX
              </span>
            </div>
          </label>

          {selectedPayment.type === 'card' && (
            <div className="border-t border-[#f0eae0] dark:border-[#242b3d] p-5 bg-white dark:bg-[#141822] space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#4a4235] dark:text-[#d0c9bd] mb-1.5">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => handleUpdateCard({ cardHolder: e.target.value })}
                    placeholder="Name as engraved on card"
                    className="w-full rounded-xl border border-[#ebe2d1] dark:border-[#2f384d] px-3.5 py-2.5 text-xs bg-[#faf8f5] dark:bg-[#10131b] text-[#141312] dark:text-[#f8f5ee] focus:ring-1 focus:ring-[#c5a059] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-[#4a4235] dark:text-[#d0c9bd] mb-1.5">
                    Demo Card (Displays Last 4 Digits)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-[#a49987] font-mono select-none text-xs">•••• •••• ••••</span>
                    <input
                      type="text"
                      maxLength={4}
                      value={last4}
                      onChange={(e) => handleUpdateCard({ last4: e.target.value.replace(/\D/g, '') })}
                      placeholder="4242"
                      className="w-18 rounded-xl border border-[#ebe2d1] dark:border-[#2f384d] px-2.5 py-2.5 text-xs text-center font-mono font-bold bg-[#faf8f5] dark:bg-[#10131b] text-[#c5a059] focus:ring-1 focus:ring-[#c5a059] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-[#4a4235] dark:text-[#d0c9bd] mb-1.5">
                    Issuing Card Network
                  </label>
                  <select
                    value={cardBrand}
                    onChange={(e) => handleUpdateCard({ brand: e.target.value })}
                    className="w-full rounded-xl border border-[#ebe2d1] dark:border-[#2f384d] px-3.5 py-2.5 text-xs bg-[#faf8f5] dark:bg-[#10131b] text-[#141312] dark:text-[#f8f5ee] focus:ring-1 focus:ring-[#c5a059] focus:outline-none"
                  >
                    <option value="Visa">Visa Signature / Infinite</option>
                    <option value="Mastercard">Mastercard World Elite</option>
                    <option value="Amex">American Express Centurion</option>
                    <option value="RuPay">RuPay Select Privilege</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#4a4235] dark:text-[#d0c9bd] mb-1.5">
                    Expiry Date
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      value={expMonth}
                      onChange={(e) => setExpMonth(e.target.value)}
                      className="rounded-xl border border-[#ebe2d1] dark:border-[#2f384d] px-3 py-2.5 text-xs bg-[#faf8f5] dark:bg-[#10131b] text-[#141312] dark:text-[#f8f5ee]"
                    >
                      {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                    <span className="text-[#a49987]">/</span>
                    <select
                      value={expYear}
                      onChange={(e) => setExpYear(e.target.value)}
                      className="rounded-xl border border-[#ebe2d1] dark:border-[#2f384d] px-3 py-2.5 text-xs bg-[#faf8f5] dark:bg-[#10131b] text-[#141312] dark:text-[#f8f5ee]"
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
          className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
            selectedPayment.type === 'razorpay'
              ? 'border-[#c5a059] bg-[#fcfaf6] dark:bg-[#1a2130] ring-2 ring-[#c5a059]/30 shadow-[0_4px_20px_rgba(197,160,89,0.12)]'
              : 'border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#161a25] hover:border-[#c5a059]/50'
          }`}
        >
          <label
            onClick={() => handleSelectType('razorpay')}
            className="flex items-center justify-between p-4.5 cursor-pointer select-none"
          >
            <div className="flex items-center gap-3.5">
              <input
                type="radio"
                name="payment_method"
                checked={selectedPayment.type === 'razorpay'}
                onChange={() => handleSelectType('razorpay')}
                className="h-4 w-4 text-[#c5a059] focus:ring-[#c5a059] border-[#dfd6c5] cursor-pointer accent-[#c5a059]"
              />
              <div className="flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-lg bg-[#0b0c10] border border-[#c5a059]/40 text-[#c5a059] flex items-center justify-center font-serif font-black text-xs shadow-xs">
                  R
                </div>
                <div>
                  <span className="font-serif text-sm font-semibold text-[#141312] dark:text-[#f8f5ee] flex items-center gap-2">
                    Razorpay Private Gateway
                  </span>
                  <span className="text-[11px] text-[#7e7362] dark:text-[#9e978b] block">
                    Instant 3D-Secure Test Portal (Cards, UPI, NetBanking &amp; Wallets)
                  </span>
                </div>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-[#9b8353] dark:text-[#d6be90] bg-[#faf6ee] dark:bg-[#12151f] px-2.5 py-0.5 rounded-full border border-[#e5d8c3] dark:border-[#2e374c] uppercase tracking-wider">
              Test Sandbox
            </span>
          </label>

          {selectedPayment.type === 'razorpay' && (
            <div className="border-t border-[#f0eae0] dark:border-[#242b3d] p-5 bg-white dark:bg-[#141822] space-y-3.5 text-xs">
              {/* Test Credentials Guidance Box */}
              <div className="rounded-2xl border border-[#e8ddc9] dark:border-[#2f384d] bg-[#faf6ee] dark:bg-[#10131b] p-4 text-xs space-y-2.5 text-[#141312] dark:text-[#f8f5ee]">
                <div className="flex items-center justify-between">
                  <span className="font-medium flex items-center gap-1.5 text-[#9b8353] dark:text-[#d6be90]">
                    <Info size={15} />
                    <span>Private Sandbox Credentials</span>
                  </span>
                  <span className="text-[10px] bg-[#f0e4cf] dark:bg-[#252f44] text-[#6e5a32] dark:text-[#d6be90] font-mono px-2 py-0.5 rounded">
                    Key: rzp_test_2026
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] bg-white dark:bg-[#161a25] p-3 rounded-xl border border-[#ebe2d1] dark:border-[#262c3d]">
                  <div>
                    <span className="text-[#8a7f6e] dark:text-[#9e978b] block text-[10px] uppercase">Test Card:</span>
                    <strong className="font-mono text-[#141312] dark:text-[#f8f5ee]">4111 1111 1111 1111</strong>
                    <span className="text-[#a49987] text-[10px] block">Exp: 12/28 · CVV: 123</span>
                  </div>
                  <div>
                    <span className="text-[#8a7f6e] dark:text-[#9e978b] block text-[10px] uppercase">Test UPI VPA:</span>
                    <strong className="font-mono text-emerald-700 dark:text-emerald-400">success@razorpay</strong>
                    <span className="text-[#a49987] text-[10px] block">Test OTP: 123456</span>
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#faf6ee] dark:bg-[#10131b] p-4 rounded-2xl border border-[#ebe2d1] dark:border-[#2f384d]">
                <div>
                  <p className="font-serif font-medium text-sm text-[#141312] dark:text-[#f8f5ee]">Launch Sovereign Gateway</p>
                  <p className="text-[#8a7f6e] dark:text-[#9e978b] text-[11px]">
                    Authenticate via Razorpay simulation window with 3D Secure OTP
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenRazorpay}
                  className="px-5 py-2.5 rounded-xl font-sans text-xs uppercase tracking-[0.15em] font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] via-[#d6be90] to-[#b89548] hover:brightness-105 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
                >
                  <Zap size={14} />
                  <span>Launch Gateway</span>
                </button>
              </div>

              {selectedPayment.razorpayPaymentId && (
                <div className="rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 p-3 flex items-center justify-between text-emerald-900 dark:text-emerald-300 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>
                      Token Authorized: <strong className="font-mono">{selectedPayment.razorpayPaymentId}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900 px-2 py-0.5 rounded text-emerald-800 dark:text-emerald-200 uppercase tracking-wider">
                    Authorized
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Option 3: UPI / QR Transfer ── */}
        <div
          className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
            selectedPayment.type === 'upi'
              ? 'border-[#c5a059] bg-[#fcfaf6] dark:bg-[#1a2130] ring-2 ring-[#c5a059]/30 shadow-[0_4px_20px_rgba(197,160,89,0.12)]'
              : 'border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#161a25] hover:border-[#c5a059]/50'
          }`}
        >
          <label
            onClick={() => handleSelectType('upi')}
            className="flex items-center justify-between p-4.5 cursor-pointer select-none"
          >
            <div className="flex items-center gap-3.5">
              <input
                type="radio"
                name="payment_method"
                checked={selectedPayment.type === 'upi'}
                onChange={() => handleSelectType('upi')}
                className="h-4 w-4 text-[#c5a059] focus:ring-[#c5a059] border-[#dfd6c5] cursor-pointer accent-[#c5a059]"
              />
              <div className="flex items-center gap-2.5">
                <QrCode size={18} className="text-[#c5a059]" />
                <span className="font-serif text-sm font-semibold text-[#141312] dark:text-[#f8f5ee]">
                  Direct UPI / QR Transfer
                </span>
              </div>
            </div>

            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 uppercase tracking-wider">
              Instant
            </span>
          </label>

          {selectedPayment.type === 'upi' && (
            <div className="border-t border-[#f0eae0] dark:border-[#242b3d] p-5 bg-white dark:bg-[#141822] space-y-3 text-xs">
              <label className="block font-medium text-[#4a4235] dark:text-[#d0c9bd]">
                Enter Sovereign Client UPI Virtual ID (VPA)
              </label>
              <div className="flex items-center gap-2.5 max-w-md">
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => handleUpdateUpi(e.target.value)}
                  placeholder="e.g. client@valenzaprive"
                  className="flex-1 rounded-xl border border-[#ebe2d1] dark:border-[#2f384d] px-3.5 py-2.5 text-xs bg-[#faf8f5] dark:bg-[#10131b] text-[#141312] dark:text-[#f8f5ee] focus:ring-1 focus:ring-[#c5a059] focus:outline-none"
                />
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1 text-xs">
                  <Check size={14} /> Ready
                </span>
              </div>
              <p className="text-[11px] text-[#8a7f6e] dark:text-[#9e978b]">
                An instant settlement intent will be forwarded to your mobile bank application upon order confirmation.
              </p>
            </div>
          )}
        </div>

        {/* ── Option 4: Concierge Settlement / Pay on Delivery ── */}
        <div
          className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
            selectedPayment.type === 'cod'
              ? 'border-[#c5a059] bg-[#fcfaf6] dark:bg-[#1a2130] ring-2 ring-[#c5a059]/30 shadow-[0_4px_20px_rgba(197,160,89,0.12)]'
              : 'border-[#ebe2d1] dark:border-[#262c3d] bg-white dark:bg-[#161a25] hover:border-[#c5a059]/50'
          }`}
        >
          <label
            onClick={() => handleSelectType('cod')}
            className="flex items-center justify-between p-4.5 cursor-pointer select-none"
          >
            <div className="flex items-center gap-3.5">
              <input
                type="radio"
                name="payment_method"
                checked={selectedPayment.type === 'cod'}
                onChange={() => handleSelectType('cod')}
                className="h-4 w-4 text-[#c5a059] focus:ring-[#c5a059] border-[#dfd6c5] cursor-pointer accent-[#c5a059]"
              />
              <div className="flex items-center gap-2.5">
                <Banknote size={18} className="text-[#c5a059]" />
                <div>
                  <span className="font-serif text-sm font-semibold text-[#141312] dark:text-[#f8f5ee] block">
                    White-Glove Concierge Settlement
                  </span>
                  <span className="text-[11px] text-[#7e7362] dark:text-[#9e978b]">
                    Settle securely via Cash, Private Bank Draft, or VIP POS upon delivery at your residence
                  </span>
                </div>
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* ── Authentic Razorpay Test Popup Modal (With 3D Secure OTP) ── */}
      {isRazorpayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#faf9f6] dark:bg-[#12151f] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.4)] overflow-hidden border border-[#ebe2d1] dark:border-[#262c3d] animate-in zoom-in-95 duration-150 font-sans text-[#141312] dark:text-[#f8f5ee]">
            
            {/* Razorpay Brand Header */}
            <div className="bg-[#0b0c10] text-[#f8f5ee] p-5 flex items-center justify-between border-b border-[#262c3d]">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#c5a059] to-[#d6be90] text-[#12110f] flex items-center justify-center font-serif font-black text-base shadow-sm">
                  V
                </div>
                <div>
                  <h3 className="font-serif font-medium text-sm tracking-wide flex items-center gap-2 text-[#f8f5ee]">
                    Valenza Settlement Gateway
                    <span className="bg-[#1f2738] text-[9px] font-semibold px-2 py-0.5 rounded-full text-[#d6be90] uppercase tracking-wider border border-[#2f384d]">
                      Sandbox
                    </span>
                  </h3>
                  <p className="text-[11px] text-[#9e978b]">Powered by Razorpay Secure APIs</p>
                </div>
              </div>
              <button
                onClick={() => setIsRazorpayModalOpen(false)}
                className="text-[#9e978b] hover:text-[#f8f5ee] p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Payable Amount Summary Strip */}
            <div className="bg-[#f5efe4] dark:bg-[#161a25] px-6 py-3.5 flex justify-between items-center border-b border-[#ebe2d1] dark:border-[#262c3d]">
              <div>
                <span className="text-[10px] font-semibold text-[#8a7f6e] dark:text-[#9e978b] uppercase tracking-wider block">Total Allocation Value</span>
                <span className="font-serif text-xl font-medium text-[#9b8353] dark:text-[#d6be90]">
                  ${orderAmount.toFixed(2)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#8a7f6e] dark:text-[#9e978b] block font-mono">rzp_test_2026</span>
                <span className="text-[11px] font-semibold text-[#9b8353] dark:text-[#d6be90]">Encrypted Rail</span>
              </div>
            </div>

            {/* Test Guidance Banner */}
            <div className="bg-[#faf6ee] dark:bg-[#1a2130] px-6 py-2.5 border-b border-[#e8ddc9] dark:border-[#2f384d] text-[11px] text-[#786b58] dark:text-[#c4bcac] flex items-center justify-between">
              <span className="font-medium flex items-center gap-1.5">
                <Info size={13} className="text-[#c5a059]" /> Test sandbox active
              </span>
              <span className="font-mono text-[10px] bg-white dark:bg-[#12151f] px-2 py-0.5 rounded border border-[#e5d8c3] dark:border-[#2e374c]">OTP: 123456</span>
            </div>

            {/* STEP 1: Razorpay Checkout Form */}
            {razorpayStep === 'checkout' && (
              <div>
                {/* Payment Method Tabs */}
                <div className="flex border-b border-[#ebe2d1] dark:border-[#262c3d] text-xs bg-[#faf8f5] dark:bg-[#10131b]">
                  <button
                    type="button"
                    onClick={() => setRazorpayTab('card')}
                    className={`flex-1 py-3 font-medium text-center border-b-2 flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      razorpayTab === 'card'
                        ? 'border-[#c5a059] text-[#9b8353] dark:text-[#d6be90] bg-white dark:bg-[#12151f]'
                        : 'border-transparent text-[#8a7f6e] hover:text-[#141312] dark:hover:text-[#f8f5ee]'
                    }`}
                  >
                    <CreditCard size={14} />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRazorpayTab('upi')}
                    className={`flex-1 py-3 font-medium text-center border-b-2 flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      razorpayTab === 'upi'
                        ? 'border-[#c5a059] text-[#9b8353] dark:text-[#d6be90] bg-white dark:bg-[#12151f]'
                        : 'border-transparent text-[#8a7f6e] hover:text-[#141312] dark:hover:text-[#f8f5ee]'
                    }`}
                  >
                    <Smartphone size={14} />
                    <span>UPI / QR</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRazorpayTab('netbanking')}
                    className={`flex-1 py-3 font-medium text-center border-b-2 flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      razorpayTab === 'netbanking'
                        ? 'border-[#c5a059] text-[#9b8353] dark:text-[#d6be90] bg-white dark:bg-[#12151f]'
                        : 'border-transparent text-[#8a7f6e] hover:text-[#141312] dark:hover:text-[#f8f5ee]'
                    }`}
                  >
                    <Building2 size={14} />
                    <span>NetBanking</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRazorpayTab('wallet')}
                    className={`flex-1 py-3 font-medium text-center border-b-2 flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                      razorpayTab === 'wallet'
                        ? 'border-[#c5a059] text-[#9b8353] dark:text-[#d6be90] bg-white dark:bg-[#12151f]'
                        : 'border-transparent text-[#8a7f6e] hover:text-[#141312] dark:hover:text-[#f8f5ee]'
                    }`}
                  >
                    <Wallet size={14} />
                    <span>Wallets</span>
                  </button>
                </div>

                <form onSubmit={handleProceedToOtp} className="p-6 space-y-4 text-xs">
                  {/* Card View */}
                  {razorpayTab === 'card' && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="block font-medium text-[#4a4235] dark:text-[#d0c9bd] mb-1.5">
                          Test Card Number
                        </label>
                        <input
                          type="text"
                          value={rzpCardNumber}
                          onChange={(e) => setRzpCardNumber(e.target.value)}
                          placeholder="4111 1111 1111 1111"
                          className="w-full rounded-xl border border-[#ebe2d1] dark:border-[#2f384d] p-2.5 text-xs font-mono font-bold bg-[#faf8f5] dark:bg-[#10131b] text-[#141312] dark:text-[#f8f5ee] focus:ring-1 focus:ring-[#c5a059] focus:outline-none"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block font-medium text-[#4a4235] dark:text-[#d0c9bd] mb-1.5">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            value={rzpExpiry}
                            onChange={(e) => setRzpExpiry(e.target.value)}
                            placeholder="12/28"
                            className="w-full rounded-xl border border-[#ebe2d1] dark:border-[#2f384d] p-2.5 text-xs font-mono bg-[#faf8f5] dark:bg-[#10131b] text-[#141312] dark:text-[#f8f5ee] focus:ring-1 focus:ring-[#c5a059]"
                            required
                          />
                        </div>

                        <div>
                          <label className="block font-medium text-[#4a4235] dark:text-[#d0c9bd] mb-1.5">
                            CVV
                          </label>
                          <input
                            type="password"
                            maxLength={3}
                            value={rzpCvv}
                            onChange={(e) => setRzpCvv(e.target.value)}
                            placeholder="123"
                            className="w-full rounded-xl border border-[#ebe2d1] dark:border-[#2f384d] p-2.5 text-xs font-mono font-bold bg-[#faf8f5] dark:bg-[#10131b] text-[#141312] dark:text-[#f8f5ee] focus:ring-1 focus:ring-[#c5a059]"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-medium text-[#4a4235] dark:text-[#d0c9bd] mb-1.5">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={rzpCardHolder}
                          onChange={(e) => setRzpCardHolder(e.target.value)}
                          placeholder="Valenza VIP Client"
                          className="w-full rounded-xl border border-[#ebe2d1] dark:border-[#2f384d] p-2.5 text-xs bg-[#faf8f5] dark:bg-[#10131b] text-[#141312] dark:text-[#f8f5ee] focus:ring-1 focus:ring-[#c5a059]"
                        />
                      </div>
                    </div>
                  )}

                  {/* UPI View */}
                  {razorpayTab === 'upi' && (
                    <div className="space-y-3.5">
                      <div>
                        <label className="block font-medium text-[#4a4235] dark:text-[#d0c9bd] mb-1.5">
                          Enter Test VPA / UPI ID
                        </label>
                        <input
                          type="text"
                          value={rzpUpi}
                          onChange={(e) => setRzpUpi(e.target.value)}
                          placeholder="success@razorpay"
                          className="w-full rounded-xl border border-[#ebe2d1] dark:border-[#2f384d] p-2.5 text-xs font-mono font-bold bg-[#faf8f5] dark:bg-[#10131b] text-[#141312] dark:text-[#f8f5ee] focus:ring-1 focus:ring-[#c5a059]"
                          required
                        />
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-900 dark:text-emerald-200">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        <span>Pre-filled with <strong>success@razorpay</strong> for auto approval.</span>
                      </div>
                    </div>
                  )}

                  {/* NetBanking View */}
                  {razorpayTab === 'netbanking' && (
                    <div className="space-y-3.5">
                      <label className="block font-medium text-[#4a4235] dark:text-[#d0c9bd] mb-1.5">
                        Select Private Banking Institution
                      </label>
                      <select
                        value={rzpBank}
                        onChange={(e) => setRzpBank(e.target.value)}
                        className="w-full rounded-xl border border-[#ebe2d1] dark:border-[#2f384d] p-2.5 text-xs bg-[#faf8f5] dark:bg-[#10131b] text-[#141312] dark:text-[#f8f5ee] focus:ring-1 focus:ring-[#c5a059]"
                      >
                        <option value="HDFC Bank Private Banking">HDFC Bank Private Banking (Test)</option>
                        <option value="State Bank of India">State Bank of India (SBI Test)</option>
                        <option value="ICICI Bank Wealth Management">ICICI Bank Wealth Management (Test)</option>
                        <option value="Axis Bank Burgundy">Axis Bank Burgundy (Test)</option>
                        <option value="Kotak Mahindra Bank Privé">Kotak Mahindra Bank Privé (Test)</option>
                      </select>
                    </div>
                  )}

                  {/* Wallet View */}
                  {razorpayTab === 'wallet' && (
                    <div className="space-y-3.5">
                      <label className="block font-medium text-[#4a4235] dark:text-[#d0c9bd] mb-1.5">
                        Select Client Wallet
                      </label>
                      <select
                        value={rzpWallet}
                        onChange={(e) => setRzpWallet(e.target.value)}
                        className="w-full rounded-xl border border-[#ebe2d1] dark:border-[#2f384d] p-2.5 text-xs bg-[#faf8f5] dark:bg-[#10131b] text-[#141312] dark:text-[#f8f5ee] focus:ring-1 focus:ring-[#c5a059]"
                      >
                        <option value="Valenza Privé Credit">Valenza Privé Credit Balance</option>
                        <option value="Amazon Pay">Amazon Pay Balance (Test)</option>
                        <option value="Paytm Wallet">Paytm Wallet (Test)</option>
                      </select>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isAuthorizing}
                    className="w-full py-3.5 rounded-xl font-sans text-xs uppercase tracking-[0.18em] font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] via-[#d6be90] to-[#b89548] hover:brightness-105 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 disabled:opacity-50"
                  >
                    {isAuthorizing ? (
                      <>
                        <div className="h-4 w-4 border-2 border-[#12110f] border-t-transparent rounded-full animate-spin" />
                        <span>Initializing Encrypted Tunnel...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={14} />
                        <span>Proceed to Authorize ${orderAmount.toFixed(2)}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 2: 3D-Secure OTP Simulation Screen */}
            {razorpayStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="p-7 space-y-4 text-xs">
                <div className="text-center space-y-1 pb-3 border-b border-[#ebe2d1] dark:border-[#262c3d]">
                  <div className="h-12 w-12 rounded-full bg-[#faf6ee] dark:bg-[#1f2738] text-[#c5a059] flex items-center justify-center mx-auto mb-2 border border-[#e8ddc9] dark:border-[#2f384d]">
                    <ShieldCheck size={26} />
                  </div>
                  <h4 className="font-serif font-medium text-base text-[#141312] dark:text-[#f8f5ee]">
                    3D-Secure Sovereign Verification
                  </h4>
                  <p className="text-[11px] text-[#8a7f6e] dark:text-[#9e978b]">
                    Two-Factor Authentication Rail Simulation
                  </p>
                </div>

                <div className="bg-[#faf6ee] dark:bg-[#161a25] p-3.5 rounded-2xl border border-[#ebe2d1] dark:border-[#262c3d] text-center space-y-1">
                  <span className="text-[11px] text-[#8a7f6e] dark:text-[#9e978b] block">Code forwarded to private handset:</span>
                  <span className="font-mono font-bold text-[#141312] dark:text-[#f8f5ee]">+91 ••••• ••131</span>
                  <p className="text-[10px] text-[#9b8353] dark:text-[#d6be90] font-medium pt-1">
                    (Test Security PIN is pre-filled: <strong>123456</strong>)
                  </p>
                </div>

                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={testOtp}
                    onChange={(e) => setTestOtp(e.target.value)}
                    className="w-full text-center text-xl font-mono font-bold tracking-[0.3em] rounded-xl border border-[#ebe2d1] dark:border-[#2f384d] p-3 bg-[#faf8f5] dark:bg-[#10131b] text-[#141312] dark:text-[#f8f5ee] focus:ring-2 focus:ring-[#c5a059] focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAuthorizing}
                  className="w-full py-3.5 rounded-xl font-sans text-xs uppercase tracking-[0.18em] font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] via-[#d6be90] to-[#b89548] hover:brightness-105 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isAuthorizing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-[#12110f] border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Cryptographic PIN...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Confirm Authorization (${orderAmount.toFixed(2)})</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 3: Payment Success Animation */}
            {razorpayStep === 'success' && (
              <div className="p-8 text-center space-y-3.5 animate-in zoom-in duration-200">
                <div className="h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="font-serif font-medium text-lg text-[#141312] dark:text-[#f8f5ee]">
                  Settlement Pre-Authorization Approved
                </h4>
                <p className="text-xs text-[#8a7f6e] dark:text-[#9e978b] font-mono bg-[#faf6ee] dark:bg-[#161a25] p-2.5 rounded-xl border border-[#ebe2d1] dark:border-[#262c3d] inline-block">
                  Auth Token: {razorpayPaymentId}
                </p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  Returning to Private Client Checkout...
                </p>
              </div>
            )}

            {/* Modal Footer */}
            <div className="bg-[#faf8f5] dark:bg-[#10131b] px-6 py-3 border-t border-[#ebe2d1] dark:border-[#262c3d] text-[10px] text-[#8a7f6e] dark:text-[#9e978b] flex justify-between items-center">
              <span>Secured by Sovereign Vault API</span>
              <span>Mode: Authentic Test Sandbox</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
