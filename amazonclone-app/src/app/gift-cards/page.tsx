'use client';
// ============================================================================
// Amazon Gift Cards Page — /gift-cards
// Purchase digital/physical gift cards, custom amounts, redemption and balance reload
// ============================================================================
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CreditCard,
  Mail,
  Gift,
  Printer,
  RotateCw,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Check,
  AlertCircle,
  ShoppingCart,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useLocation } from '@/context/LocationContext';
import { useCart } from '@/context/CartContext';

interface CardDesign {
  id: string;
  name: string;
  image: string;
  badge?: string;
}

const DESIGNS: CardDesign[] = [
  {
    id: 'design-classic',
    name: 'Amazon Classic Black',
    image: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?w=800&auto=format&fit=crop&q=80',
    badge: 'Popular',
  },
  {
    id: 'design-birthday',
    name: 'Birthday Confetti',
    image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80',
    badge: 'Celebration',
  },
  {
    id: 'design-thankyou',
    name: 'Thank You Floral',
    image: 'https://images.unsplash.com/photo-1508615039623-a25605d2b022?w=800&auto=format&fit=crop&q=80',
    badge: 'Appreciation',
  },
  {
    id: 'design-festive',
    name: 'Festive Lights & Sparkles',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop&q=80',
    badge: 'Holiday',
  },
];

export default function GiftCardsPage() {
  const { country, convertPrice } = useLocation();
  const { addItem } = useCart();

  const isINR = country.currency === 'INR';
  const presetAmounts = isINR ? [500, 1000, 2000, 5000] : [25, 50, 100, 250];

  const [selectedDesign, setSelectedDesign] = useState<CardDesign>(DESIGNS[0]);
  const [selectedAmount, setSelectedAmount] = useState<number>(presetAmounts[1]);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState<'egift' | 'physical' | 'print'>('egift');

  // Recipient fields
  const [recipientEmail, setRecipientEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('Hope you enjoy this gift card! Happy shopping.');
  const [senderName, setSenderName] = useState('');

  // Redeem box state
  const [claimCode, setClaimCode] = useState('');
  const [redeemedNotice, setRedeemedNotice] = useState<string | null>(null);
  const [addedNotice, setAddedNotice] = useState(false);

  const effectiveAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleAddGiftCardToCart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (effectiveAmount <= 0) return;

    // Convert local currency amount to base USD price for catalog cart
    const basePriceUsd = effectiveAmount / country.rate;

    const pseudoProduct = {
      id: `gc-${Date.now()}`,
      sku: `GC-${deliveryType.toUpperCase()}-${effectiveAmount}`,
      title: `Amazon ${selectedDesign.name} eGift Card (${country.symbol}${effectiveAmount.toLocaleString()})`,
      slug: 'amazon-egift-card',
      description: `Amazon Gift Card delivered to ${recipientEmail || 'you'} with message: "${message}"`,
      price: basePriceUsd,
      originalPrice: basePriceUsd,
      category: 'gift-cards',
      categoryName: 'Gift Cards',
      brand: 'Amazon',
      stock: 999,
      status: 'active' as const,
      rating: 4.9,
      reviewCount: 84920,
      isPrimeEligible: true,
      images: [{ url: selectedDesign.image, alt: selectedDesign.name, isPrimary: true }],
      tags: ['gift card', 'egift', 'voucher'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const res = await addItem(pseudoProduct as any, 1);
    if (res.success) {
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 4000);
    }
  };

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimCode.trim()) return;
    const bonus = isINR ? '₹1,000' : '$25.00';
    setRedeemedNotice(`Success! Claim Code ${claimCode.toUpperCase()} verified. ${bonus} has been added to your Amazon Pay Balance.`);
    setClaimCode('');
  };

  return (
    <MainLayout>
      <div className="bg-[#f7f8f8] min-h-screen pb-20">
        {/* ── Top Hero Banner ── */}
        <div className="bg-gradient-to-r from-[#131921] via-[#1f2937] to-[#111827] text-white py-10 px-4 sm:px-8 border-b border-gray-700">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
                <CreditCard size={16} />
                <span>The Gift of Endless Possibilities</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Amazon Gift Cards &amp; Top-Ups
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm mt-2 max-w-xl">
                No expiration dates. No extra fees. Redeemable across millions of products with instant delivery to {country.name}.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-xs self-start md:self-auto space-y-2">
              <span className="font-bold text-amber-400 block uppercase tracking-wider">
                Why Amazon Gift Cards?
              </span>
              <ul className="text-gray-200 space-y-1 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <Check size={13} className="text-green-400 shrink-0" /> Never expires
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={13} className="text-green-400 shrink-0" /> Works with all Prime benefits &amp; deals
                </li>
                <li className="flex items-center gap-1.5">
                  <Check size={13} className="text-green-400 shrink-0" /> Immediate delivery via email or print
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ── Main Layout: Customizer + Redemption Card ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Interactive Customizer (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-lg border border-gray-200 p-6 md:p-8 shadow-xs">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Customize Your Gift Card</h2>

            {addedNotice && (
              <div className="mb-6 p-3.5 bg-green-50 border border-green-300 rounded text-xs text-green-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-green-600" />
                  <span>
                    <strong>Gift Card added to your shopping cart!</strong>
                  </span>
                </div>
                <Link href="/cart" className="font-bold underline hover:text-green-950">
                  View Cart
                </Link>
              </div>
            )}

            <form onSubmit={handleAddGiftCardToCart} className="space-y-6 text-xs text-gray-700">
              {/* Step 1: Format Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-2">
                  1. Select Delivery Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('egift')}
                    className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      deliveryType === 'egift'
                        ? 'border-[#007185] bg-[#f0f8ff] ring-1 ring-[#007185]'
                        : 'border-gray-200 hover:border-gray-400 bg-white'
                    }`}
                  >
                    <Mail size={18} className="text-[#007185] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-gray-900 block">eGift Card</span>
                      <span className="text-[11px] text-gray-500">Delivered via Email</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('physical')}
                    className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      deliveryType === 'physical'
                        ? 'border-[#007185] bg-[#f0f8ff] ring-1 ring-[#007185]'
                        : 'border-gray-200 hover:border-gray-400 bg-white'
                    }`}
                  >
                    <Gift size={18} className="text-[#007185] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-gray-900 block">Gift Box</span>
                      <span className="text-[11px] text-gray-500">Free Next-Day delivery</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeliveryType('print')}
                    className={`p-3 rounded-lg border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                      deliveryType === 'print'
                        ? 'border-[#007185] bg-[#f0f8ff] ring-1 ring-[#007185]'
                        : 'border-gray-200 hover:border-gray-400 bg-white'
                    }`}
                  >
                    <Printer size={18} className="text-[#007185] mt-0.5 shrink-0" />
                    <div>
                      <span className="font-bold text-gray-900 block">Print at Home</span>
                      <span className="text-[11px] text-gray-500">Instant PDF download</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 2: Choose Design */}
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-2">
                  2. Choose a Card Design
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DESIGNS.map((design) => {
                    const isSelected = selectedDesign.id === design.id;
                    return (
                      <div
                        key={design.id}
                        onClick={() => setSelectedDesign(design)}
                        className={`rounded-lg overflow-hidden border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-amazon-orange ring-2 ring-amazon-orange shadow-md'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div className="relative h-24 w-full bg-gray-100">
                          <Image
                            src={design.image}
                            alt={design.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="p-2 bg-gray-50 text-center">
                          <span className="font-bold text-[11px] text-gray-800 block truncate">
                            {design.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Choose Amount */}
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-2">
                  3. Select Amount ({country.symbol} {country.currency})
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {presetAmounts.map((amt) => {
                    const isSelected = !customAmount && selectedAmount === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(amt);
                          setCustomAmount('');
                        }}
                        className={`px-4 py-2 rounded-md font-bold text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amazon-orange text-gray-950 border border-[#e68a00] shadow-xs'
                            : 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {country.symbol}
                        {amt.toLocaleString()}
                      </button>
                    );
                  })}

                  {/* Custom input */}
                  <div className="relative w-32">
                    <span className="absolute left-2.5 top-2 text-gray-500 text-xs font-bold">
                      {country.symbol}
                    </span>
                    <input
                      type="number"
                      placeholder="Other"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-full rounded border border-gray-300 py-1.5 pl-6 pr-2 text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-amazon-orange"
                    />
                  </div>
                </div>
              </div>

              {/* Step 4: Recipient Details */}
              <div className="space-y-3 border-t border-gray-200 pt-4">
                <label className="block text-xs font-bold text-gray-900">
                  4. Recipient Details
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">To (Email)</label>
                    <input
                      type="email"
                      required
                      placeholder="recipient@example.com"
                      value={recipientEmail}
                      onChange={(e) => setRecipientEmail(e.target.value)}
                      className="w-full rounded border border-gray-300 p-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amazon-orange"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-600 mb-1">Recipient Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Sham Patil"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      className="w-full rounded border border-gray-300 p-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amazon-orange"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-gray-600 mb-1">Gift Message (250 chars max)</label>
                  <textarea
                    rows={2}
                    maxLength={250}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded border border-gray-300 p-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amazon-orange"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-gray-500 text-xs block">Total Price:</span>
                  <span className="text-xl font-extrabold text-gray-900">
                    {country.symbol}{effectiveAmount.toLocaleString()} {country.currency}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={effectiveAmount <= 0}
                  className="bg-amazon-yellow hover:bg-[#f7ca00] text-gray-950 font-bold px-8 py-2.5 rounded-md text-xs sm:text-sm border border-[#fcd200] shadow-sm transition-all cursor-pointer flex items-center gap-2"
                >
                  <ShoppingCart size={16} />
                  <span>Add Gift Card to Cart</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Card Preview & Redeem Box (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Live Card Preview */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-3">
                Live Card Preview
              </span>

              <div className="relative rounded-xl overflow-hidden shadow-lg border border-gray-800 aspect-[1.6/1] bg-gradient-to-tr from-gray-900 to-gray-800 text-white p-5 flex flex-col justify-between">
                <Image
                  src={selectedDesign.image}
                  alt={selectedDesign.name}
                  fill
                  className="object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="font-extrabold tracking-tight text-white text-lg">
                    amazon<span className="text-amazon-orange">.</span>
                    <span className="text-xs align-super">gift</span>
                  </span>
                  <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">
                    {deliveryType}
                  </span>
                </div>

                <div className="relative z-10 space-y-1">
                  <span className="text-2xl font-black text-amber-400 block tracking-tight">
                    {country.symbol}{effectiveAmount.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-gray-200 block truncate">
                    For: {recipientName || recipientEmail || 'Valued Customer'}
                  </span>
                </div>
              </div>
            </div>

            {/* Redeem a Gift Card Box */}
            <div className="bg-white rounded-lg border border-gray-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <RotateCw size={16} className="text-amazon-orange" />
                <h3 className="font-bold text-sm text-gray-900">Redeem a Gift Card</h3>
              </div>
              <p className="text-xs text-gray-600 mb-3">
                Have a claim code? Enter it below to credit funds directly to your Amazon Pay Balance.
              </p>

              {redeemedNotice && (
                <div className="mb-3 p-2.5 bg-green-50 border border-green-300 rounded text-xs text-green-800">
                  {redeemedNotice}
                </div>
              )}

              <form onSubmit={handleRedeem} className="space-y-2">
                <input
                  type="text"
                  value={claimCode}
                  onChange={(e) => setClaimCode(e.target.value)}
                  placeholder="e.g. AMZN-9284-8821"
                  className="w-full rounded border border-gray-300 p-2 text-xs font-mono uppercase text-gray-900 focus:outline-none focus:ring-1 focus:ring-amazon-orange"
                />
                <button
                  type="submit"
                  className="w-full bg-amazon-orange hover:bg-[#e68a00] text-gray-950 font-bold py-2 rounded text-xs transition-colors cursor-pointer"
                >
                  Apply to Balance
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
