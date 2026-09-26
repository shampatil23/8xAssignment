'use client';
// ============================================================================
// OffersCard — Valenza Maison Private Client Privileges & Atelier Financing
// ============================================================================
import React, { useState } from 'react';
import { Sparkles, CreditCard, Landmark, ChevronRight, Shield } from 'lucide-react';

interface OffersCardProps {
  price: number;
  className?: string;
}

export function OffersCard({ price, className = '' }: OffersCardProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'bank' | 'emi'>('all');

  const offers = [
    {
      id: 'privilege-1',
      category: 'bank',
      icon: CreditCard,
      badge: 'Private Wealth Privilège',
      title: 'Complimentary Valuation & Atelier Credit',
      description: 'Acquisitions made with select Private Wealth & Centurion cards receive bespoke insurance appraisal documentation.',
      terms: 'Centurion & Private Banking',
    },
    {
      id: 'privilege-2',
      category: 'all',
      icon: Landmark,
      badge: 'Family Office & Corporate',
      title: 'Bespoke Valuation & VAT/GST Invoicing',
      description: 'Dedicated corporate acquisition portal with institutional certificates and structured VAT export handling.',
      terms: 'Maison Corporate Concierge',
    },
    {
      id: 'privilege-3',
      category: 'emi',
      icon: Sparkles,
      badge: '0% Salon Installments',
      title: `Bespoke Allocation from $${Math.max(150, Math.round(price / 12)).toLocaleString()}/month`,
      description: 'Exclusive 12-month interest-free salon allocation financing through our premier private banking partners.',
      terms: 'Vault Allocation Plan',
    },
  ];

  const filteredOffers =
    activeTab === 'all'
      ? offers
      : offers.filter((o) => o.category === activeTab || o.category === 'all');

  return (
    <div className={`rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-[#ffffff]/90 dark:bg-[#12151f]/90 backdrop-blur-xl p-5 shadow-[0_10px_30px_rgba(26,23,20,0.03)] dark:shadow-[0_15px_35px_rgba(0,0,0,0.5)] ${className}`}>
      <div className="flex items-center justify-between border-b border-[#f2ede4] dark:border-[#1e2433] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[#c5a059]" />
          <h3 className="font-serif text-sm font-medium tracking-tight text-[#141312] dark:text-[#f8f5ee]">
            Maison Privileges &amp; Financing
          </h3>
        </div>
        <div className="flex gap-1.5 text-xs">
          {(['all', 'bank', 'emi'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-wider font-semibold transition-all cursor-pointer ${
                activeTab === tab
                  ? 'bg-[#141312] text-[#d6be90] dark:bg-[#1f2533] dark:text-[#f3e5ca] shadow-xs'
                  : 'text-[#786b58] dark:text-[#7e8aa2] hover:text-[#141312] dark:hover:text-[#f8f5ee]'
              }`}
            >
              {tab === 'all' ? 'All' : tab === 'bank' ? 'Private Wealth' : 'Salon 0%'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {filteredOffers.map((offer) => {
          const Icon = offer.icon;
          return (
            <div
              key={offer.id}
              className="flex flex-col justify-between rounded-2xl border border-[#ebe2d1] dark:border-[#262c3d] p-3.5 hover:border-[#c5a059] dark:hover:border-[#c5a059]/60 hover:shadow-md transition-all bg-[#fbfaf8] dark:bg-[#161a25]/80"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon size={14} className="text-[#c5a059] flex-shrink-0" />
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#9b8353] dark:text-[#d6be90]">
                    {offer.badge}
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#141312] dark:text-[#f8f5ee] line-clamp-2 leading-snug">
                  {offer.title}
                </p>
                <p className="text-[11px] text-[#786b58] dark:text-[#9e978b] mt-1 line-clamp-2 leading-relaxed">
                  {offer.description}
                </p>
              </div>
              <div className="mt-3 pt-2 border-t border-[#f0eae0] dark:border-[#1e2433] flex items-center justify-between text-[10px] uppercase tracking-wider text-[#9b8353] dark:text-[#d6be90] font-medium">
                <span>{offer.terms}</span>
                <ChevronRight size={12} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
