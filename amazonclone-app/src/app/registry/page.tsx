'use client';
// ============================================================================
// Amazon Registry & Gift Lists Page — /registry
// Wedding, Baby, Birthday, and Custom Gift Lists with interactive search & creation
// ============================================================================
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Gift,
  Heart,
  Baby,
  Cake,
  Search,
  CheckCircle2,
  Calendar,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  ArrowRight,
  Plus,
} from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from '@/context/LocationContext';

interface SampleRegistry {
  id: string;
  type: 'wedding' | 'baby' | 'birthday';
  title: string;
  registrant: string;
  coRegistrant?: string;
  eventDate: string;
  location: string;
  itemCount: number;
  image: string;
}

const SAMPLE_REGISTRIES: SampleRegistry[] = [
  {
    id: 'reg-1',
    type: 'wedding',
    title: 'Priya & Rahul’s Wedding Registry',
    registrant: 'Priya Sharma',
    coRegistrant: 'Rahul Verma',
    eventDate: 'December 18, 2026',
    location: 'Mumbai, Maharashtra',
    itemCount: 42,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'reg-2',
    type: 'baby',
    title: 'Welcoming Baby Aarav',
    registrant: 'Ananya Deshmukh',
    eventDate: 'November 05, 2026',
    location: 'Pune, Maharashtra',
    itemCount: 28,
    image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'reg-3',
    type: 'birthday',
    title: 'Kabir’s 10th Birthday Wishlist',
    registrant: 'Kabir Mehta',
    eventDate: 'October 24, 2026',
    location: 'Bangalore, Karnataka',
    itemCount: 15,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80',
  },
];

export default function RegistryPage() {
  const { user } = useAuth();
  const { country } = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'wedding' | 'baby' | 'birthday'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createdNotice, setCreatedNotice] = useState(false);

  // New registry form
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('wedding');
  const [newDate, setNewDate] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const handleCreateRegistry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setShowCreateModal(false);
    setCreatedNotice(true);
    setTimeout(() => setCreatedNotice(false), 5000);
  };

  const filteredRegistries = SAMPLE_REGISTRIES.filter((r) => {
    if (selectedType !== 'all' && r.type !== selectedType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.registrant.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <MainLayout>
      <div className="bg-[#f7f8f8] min-h-screen pb-20">
        {/* ── Hero Banner ── */}
        <div className="bg-gradient-to-r from-[#232f3e] via-[#1a232f] to-[#0f172a] text-white py-12 px-4 sm:px-8 border-b border-gray-700">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">
                <Gift size={16} />
                <span>Celebrate Life&apos;s Big Moments</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Amazon Registry &amp; Gift Lists
              </h1>
              <p className="text-gray-300 text-sm mt-2 leading-relaxed">
                Whether you’re getting married, expecting a baby, or celebrating a milestone, create and share your dream wishlist with friends &amp; family across {country.name}.
              </p>

              <div className="flex items-center gap-3 pt-5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="bg-amazon-orange hover:bg-[#e68a00] text-gray-950 font-bold px-6 py-2.5 rounded-md text-sm shadow-md transition-all cursor-pointer flex items-center gap-2"
                >
                  <Plus size={16} />
                  <span>Create a Registry</span>
                </button>

                <a
                  href="#find-registry"
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold px-5 py-2.5 rounded-md text-sm border border-white/20 backdrop-blur-md transition-colors"
                >
                  Find a Registry
                </a>
              </div>
            </div>

            {/* Quick Stats or Promo Box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 max-w-sm space-y-3">
              <span className="text-amber-400 font-extrabold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} /> Registry Perks
              </span>
              <ul className="text-xs text-gray-200 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                  <span>Up to <strong>15% completion discount</strong> on remaining items</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                  <span><strong>365-day returns</strong> on eligible gifts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-green-400 shrink-0" />
                  <span>Automatic Thank-You list tracking</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Success Notice if Created */}
        {createdNotice && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
            <div className="bg-green-50 border border-green-300 text-green-800 p-4 rounded-md flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-600" />
                <span>
                  <strong>Registry created successfully!</strong> You can now add products directly from any product page.
                </span>
              </div>
              <Link href="/wishlist" className="font-bold underline hover:text-green-950">
                View your list
              </Link>
            </div>
          </div>
        )}

        {/* ── Registry Types Grid ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Explore Registry Types</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Wedding */}
            <div
              onClick={() => {
                setNewType('wedding');
                setShowCreateModal(true);
              }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?w=600&auto=format&fit=crop&q=80"
                  alt="Wedding Registry"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white flex items-center gap-2">
                  <Heart size={20} className="text-pink-400 fill-pink-400" />
                  <span className="font-bold text-base">Wedding Registry</span>
                </div>
              </div>
              <div className="p-4 text-xs text-gray-600">
                <p>Everything you need for your new beginning together, from cookware to smart home essentials.</p>
                <span className="mt-3 text-amazon-link font-bold inline-flex items-center gap-1 group-hover:underline">
                  Create wedding registry <ArrowRight size={12} />
                </span>
              </div>
            </div>

            {/* Baby */}
            <div
              onClick={() => {
                setNewType('baby');
                setShowCreateModal(true);
              }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&auto=format&fit=crop&q=80"
                  alt="Baby Registry"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white flex items-center gap-2">
                  <Baby size={20} className="text-amber-300" />
                  <span className="font-bold text-base">Baby Registry</span>
                </div>
              </div>
              <div className="p-4 text-xs text-gray-600">
                <p>Welcome your little one with nursery items, strollers, toys, and newborn health essentials.</p>
                <span className="mt-3 text-amazon-link font-bold inline-flex items-center gap-1 group-hover:underline">
                  Create baby registry <ArrowRight size={12} />
                </span>
              </div>
            </div>

            {/* Birthday */}
            <div
              onClick={() => {
                setNewType('birthday');
                setShowCreateModal(true);
              }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80"
                  alt="Birthday Gift List"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white flex items-center gap-2">
                  <Cake size={20} className="text-yellow-300" />
                  <span className="font-bold text-base">Birthday Gift List</span>
                </div>
              </div>
              <div className="p-4 text-xs text-gray-600">
                <p>Make birthdays unforgettable. Curate items you or your kids have had your eyes on all year.</p>
                <span className="mt-3 text-amazon-link font-bold inline-flex items-center gap-1 group-hover:underline">
                  Create birthday list <ArrowRight size={12} />
                </span>
              </div>
            </div>

            {/* Custom List */}
            <div
              onClick={() => {
                setNewType('custom');
                setShowCreateModal(true);
              }}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1513151233558-d860c5398176?w=600&auto=format&fit=crop&q=80"
                  alt="Custom Gift List"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-3 left-3 text-white flex items-center gap-2">
                  <Gift size={20} className="text-teal-300" />
                  <span className="font-bold text-base">Custom Celebration</span>
                </div>
              </div>
              <div className="p-4 text-xs text-gray-600">
                <p>Housewarming, retirement, anniversaries, or holiday wishlists. Perfect for any special occasion.</p>
                <span className="mt-3 text-amazon-link font-bold inline-flex items-center gap-1 group-hover:underline">
                  Create custom list <ArrowRight size={12} />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Find a Registry Section ── */}
        <div id="find-registry" className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6 md:p-8 shadow-xs">
            <div className="max-w-2xl mb-6">
              <h2 className="text-xl font-bold text-gray-900">Find a Registry or Gift List</h2>
              <p className="text-xs text-gray-500 mt-1">
                Search for friends and family by registrant name or event location to send them the perfect gift.
              </p>
            </div>

            {/* Search Input Bar */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 max-w-2xl mb-8">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter registrant name or city (e.g. Priya or Mumbai)..."
                  className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-3 text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-amazon-orange"
                />
              </div>
              <button
                type="submit"
                className="bg-amazon-orange hover:bg-[#e68a00] text-gray-900 font-bold px-6 py-2 rounded-md text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
              >
                Search
              </button>
            </form>

            {/* Sample Search Results */}
            <div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-3">
                Featured Registries
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredRegistries.map((reg) => (
                  <div
                    key={reg.id}
                    className="border border-gray-200 rounded-md p-4 hover:border-gray-400 transition-all bg-gray-50/50 flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-bold text-amazon-orange tracking-wider">
                        {reg.type} registry
                      </span>
                      <h3 className="font-bold text-sm text-gray-900 mt-0.5">{reg.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">Registrant: <strong>{reg.registrant}</strong></p>
                      <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mt-2">
                        <Calendar size={13} />
                        <span>{reg.eventDate} · {reg.location}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                      <span className="text-gray-500">{reg.itemCount} items listed</span>
                      <Link
                        href="/wishlist"
                        className="text-amazon-link font-semibold hover:underline flex items-center gap-1"
                      >
                        View Registry <ArrowRight size={12} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Create Registry Modal ── */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-lg bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
              <div className="flex items-center justify-between bg-gray-50 border-b border-gray-200 px-6 py-4">
                <h3 className="text-base font-bold text-gray-900">Create a New Registry</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-700 font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateRegistry} className="p-6 space-y-4 text-xs text-gray-700">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">Registry Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Sham &amp; Priya's Wedding Registry"
                    className="w-full rounded border border-gray-300 p-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amazon-orange"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Occasion Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full rounded border border-gray-300 p-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amazon-orange cursor-pointer"
                    >
                      <option value="wedding">Wedding Registry</option>
                      <option value="baby">Baby Registry</option>
                      <option value="birthday">Birthday Gift List</option>
                      <option value="custom">Custom Celebration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-800 mb-1">Event Date</label>
                    <input
                      type="date"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full rounded border border-gray-300 p-2 text-xs text-gray-900 focus:outline-none focus:ring-1 focus:ring-amazon-orange"
                    />
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded border border-amber-200 text-amber-900 space-y-1">
                  <span className="font-bold block">Privacy &amp; Sharing:</span>
                  <p>Your registry will be discoverable by guests using your name and event location.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded bg-amazon-orange text-gray-900 font-bold hover:bg-[#e68a00] shadow-xs cursor-pointer"
                  >
                    Save &amp; Start Adding Gifts
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
