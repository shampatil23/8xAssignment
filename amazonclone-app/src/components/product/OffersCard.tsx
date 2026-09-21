'use client';
// ============================================================================
// OffersCard — Amazon-style available offers carousel / cards
// ============================================================================
import React, { useState } from 'react';
import { Tag, CreditCard, Gift, ChevronRight } from 'lucide-react';

interface OffersCardProps {
  price: number;
  className?: string;
}

export function OffersCard({ price, className = '' }: OffersCardProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'bank' | 'emi'>('all');

  const offers = [
    {
      id: 'bank-1',
      category: 'bank',
      icon: CreditCard,
      badge: 'Bank Offer',
      title: 'Upto $50.00 discount on select Credit Cards',
      description: '10% Instant Discount up to $50 on Federal Bank Credit Card Non-EMI Trxn. Min purchase value $100.',
      terms: '3 offers available',
    },
    {
      id: 'partner-1',
      category: 'all',
      icon: Gift,
      badge: 'Partner Offers',
      title: 'Get GST invoice and save up to 28%',
      description: 'Save up to 28% on business purchases with GST invoice. Create a free Amazon Business account.',
      terms: '1 offer available',
    },
    {
      id: 'emi-1',
      category: 'emi',
      icon: Tag,
      badge: 'No Cost EMI',
      title: `No Cost EMI from $${Math.max(15, Math.round(price / 12))}/month`,
      description: 'Avail No Cost EMI on select cards for orders above $200. Check eligibility at checkout.',
      terms: 'EMI interest savings included',
    },
  ];

  const filteredOffers =
    activeTab === 'all'
      ? offers
      : offers.filter((o) => o.category === activeTab || o.category === 'all');

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between border-b pb-2 mb-3">
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-amazon-orange" />
          <h3 className="text-sm font-bold text-gray-900">Offers &amp; Promotions</h3>
        </div>
        <div className="flex gap-1 text-xs">
          {(['all', 'bank', 'emi'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`rounded px-2 py-0.5 capitalize transition-colors ${
                activeTab === tab
                  ? 'bg-amber-100 font-bold text-amber-900'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab === 'all' ? 'All' : tab.toUpperCase()}
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
              className="flex flex-col justify-between rounded-md border border-gray-200 p-3 hover:border-amazon-orange hover:shadow-xs transition-all bg-gray-50/50"
            >
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Icon size={14} className="text-amazon-orange flex-shrink-0" />
                  <span className="text-[11px] font-bold text-gray-900">{offer.badge}</span>
                </div>
                <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight">
                  {offer.title}
                </p>
                <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
                  {offer.description}
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-gray-200 flex items-center justify-between text-[11px] text-amazon-link font-medium">
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
