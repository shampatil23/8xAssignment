'use client';
// ============================================================================
// Sell on Amazon — Merchant Onboarding, Registration & Verification Portal
// Accessible at /sell
// ============================================================================
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Store,
  ShieldCheck,
  TrendingUp,
  Package,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  Tag,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { registerSeller, applyCurrentCustomerAsSeller, loginWithEmail } from '@/services/authService';
import { Button } from '@/components/ui/Button';

export default function SellPage() {
  const { user, isSeller, isAdmin } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'register' | 'login'>('register');

  // Customer applying to seller state
  const [existingStoreName, setExistingStoreName] = useState('');
  const [existingPhone, setExistingPhone] = useState('');
  const [existingCategory, setExistingCategory] = useState('electronics');
  const [existingDesc, setExistingDesc] = useState('');

  // Unauthenticated Registration state
  const [regName, setRegName] = useState('');
  const [regStoreName, setRegStoreName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCategory, setRegCategory] = useState('electronics');
  const [regDesc, setRegDesc] = useState('');

  // Unauthenticated Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Statuses
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 1. Handle Logged-In Customer applying to become seller
  const handleExistingApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!existingStoreName.trim()) {
      setError('Please enter a store name.');
      return;
    }

    setLoading(true);
    setError(null);
    const res = await applyCurrentCustomerAsSeller(user.uid, {
      storeName: existingStoreName.trim(),
      businessEmail: user.email || '',
      phone: existingPhone.trim() || undefined,
      category: existingCategory,
      description: existingDesc.trim() || undefined,
    });

    if (res.success) {
      setSuccessMessage(
        'Your seller application has been submitted to Amazon Admin for review. Once verified, your listings will automatically become live in the marketplace!',
      );
      setTimeout(() => {
        window.location.reload();
      }, 2500);
    } else {
      setError(res.error || 'Failed to submit application.');
    }
    setLoading(false);
  };

  // 2. Handle New Seller Registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regStoreName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Please fill out all required fields.');
      return;
    }
    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    const res = await registerSeller({
      displayName: regName.trim(),
      storeName: regStoreName.trim(),
      email: regEmail.trim().toLowerCase(),
      password: regPassword,
      phone: regPhone.trim() || undefined,
      category: regCategory,
      description: regDesc.trim() || undefined,
    });

    if (res.success) {
      setSuccessMessage(
        'Seller account created! Your merchant store has been forwarded to Amazon Admin for verification. Once approved, your products will be officially listed in the marketplace.',
      );
      setTimeout(() => {
        router.push('/seller');
      }, 2500);
    } else {
      setError(res.error || 'Failed to create seller account.');
    }
    setLoading(false);
  };

  // 3. Handle Seller Sign-In
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError(null);
    const res = await loginWithEmail({
      email: loginEmail.trim().toLowerCase(),
      password: loginPassword,
    });

    if (res.success) {
      router.push('/seller');
    } else {
      setError(res.error || 'Invalid credentials.');
    }
    setLoading(false);
  };

  const isPendingVerification =
    user?.role === 'seller' &&
    (user?.status === 'pending' || user?.sellerApplication?.verificationStatus === 'pending');

  const isApprovedSeller =
    (user?.role === 'seller' || user?.role === 'admin') &&
    user?.status !== 'pending' &&
    user?.sellerApplication?.verificationStatus !== 'pending';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* ── Sell on Amazon Hero Header ── */}
      <section className="bg-gradient-to-r from-[#131921] via-[#1a232f] to-[#232f3e] text-white py-14 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
              <Store size={14} />
              <span>Amazon Merchant Partner Network</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Sell on Amazon. <br />
              <span className="text-amazon-orange">Grow your business with us.</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Become a verified merchant partner. List products, reach millions of active shoppers, manage your orders, and build your brand with Amazon Clone.
            </p>
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={16} /> Fast Admin Verification
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={16} /> Cloudinary Product Gallery
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={16} /> Real-Time Analytics
              </span>
            </div>
          </div>

          {/* Mini Stat Card */}
          <div className="hidden lg:block w-72 rounded-2xl bg-white/10 backdrop-blur-md p-6 border border-white/15 text-white shadow-xl space-y-4">
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Merchant Impact
            </p>
            <div>
              <p className="text-3xl font-black">60%+</p>
              <p className="text-xs text-slate-300 mt-0.5">Of marketplace sales are from independent sellers</p>
            </div>
            <div className="pt-3 border-t border-white/10">
              <p className="text-xl font-bold">24-48 Hours</p>
              <p className="text-xs text-slate-300 mt-0.5">Average administrator review & verification turnaround</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Interactive Portal ── */}
      <section className="mx-auto max-w-6xl w-full px-4 sm:px-6 py-10 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Why Sell on Amazon Features */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
                How Becoming an Amazon Seller Works
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Create & Apply</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Register with your business store name and product category. Your application is securely submitted to the admin platform.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Admin Review & Verification</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Amazon administrators review your merchant information to ensure marketplace catalog quality and compliance.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Officially Listed</h3>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                      Upon approval by admin, your seller products are officially activated and visible to millions of customers across search and browse!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <Package className="h-6 w-6 text-amazon-orange mb-2" />
                <h4 className="text-xs font-bold text-slate-900">Multi-Image Media</h4>
                <p className="text-[11px] text-slate-500 mt-1">Upload high-res product photos powered by Cloudinary CDN.</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                <TrendingUp className="h-6 w-6 text-emerald-600 mb-2" />
                <h4 className="text-xs font-bold text-slate-900">Fulfillment Pipeline</h4>
                <p className="text-[11px] text-slate-500 mt-1">Easily update shipping states from confirmed to delivered.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Registration & Application Form */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-md">
              {/* Notifications */}
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 flex items-center gap-3 text-red-800 text-xs">
                  <AlertCircle size={18} className="shrink-0 text-red-600" />
                  <span className="flex-1">{error}</span>
                  <button onClick={() => setError(null)} className="text-red-600 hover:text-red-950">
                    &times;
                  </button>
                </div>
              )}

              {successMessage && (
                <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center gap-3 text-emerald-900 text-xs">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                  <span className="flex-1 leading-relaxed">{successMessage}</span>
                </div>
              )}

              {/* ── State A: Logged-in and Verified Seller ── */}
              {isApprovedSeller && (
                <div className="text-center py-6 space-y-4">
                  <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <ShieldCheck size={36} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    You are a Verified Amazon Seller!
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Your merchant account ({user?.email}) is active and in good standing. Your listings are officially active on the marketplace.
                  </p>
                  <div className="pt-2">
                    <Link href="/seller">
                      <Button variant="buy-now" size="md" className="px-6 font-bold shadow-xs">
                        Open Seller Central &rarr;
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* ── State B: Logged-in and Verification Pending ── */}
              {isPendingVerification && (
                <div className="text-center py-6 space-y-4">
                  <div className="mx-auto h-16 w-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Clock size={36} />
                  </div>
                  <div className="space-y-1">
                    <span className="rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-[11px] font-bold uppercase tracking-wider">
                      Review Pending
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-2">
                      Application Awaiting Verification
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                    Your application for store <strong>&quot;{user?.sellerApplication?.storeName || user?.displayName}&quot;</strong> has been received and is in the admin verification queue.
                  </p>
                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-left text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Registered Email:</span>
                      <span className="font-semibold text-slate-800">{user?.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Applied Date:</span>
                      <span className="font-semibold text-slate-800">
                        {user?.sellerApplication?.appliedAt
                          ? new Date(user.sellerApplication.appliedAt).toLocaleDateString()
                          : 'Recently'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Listing Status:</span>
                      <span className="text-amber-700 font-bold">Pending Admin Approval</span>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link href="/seller">
                      <Button variant="outline" size="md" className="px-6 text-xs text-slate-700">
                        Manage Draft Catalog in Seller Central
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* ── State C: Logged-in Customer applying to become Seller ── */}
              {user && user.role === 'customer' && !isPendingVerification && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Apply to Sell with Your Current Account
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Logged in as <strong>{user.email}</strong>. Fill out your store details to apply for seller verification.
                    </p>
                  </div>

                  <form onSubmit={handleExistingApply} className="space-y-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Store / Brand Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={existingStoreName}
                        onChange={(e) => setExistingStoreName(e.target.value)}
                        placeholder="e.g. Apex Electronics Co."
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-purple-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Primary Product Category <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={existingCategory}
                        onChange={(e) => setExistingCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:border-purple-500 focus:outline-hidden"
                      >
                        <option value="electronics">Electronics & Gadgets</option>
                        <option value="fashion">Fashion & Apparel</option>
                        <option value="home-kitchen">Home & Kitchen</option>
                        <option value="books">Books & Media</option>
                        <option value="beauty">Beauty & Personal Care</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Contact Phone Number</label>
                      <input
                        type="tel"
                        value={existingPhone}
                        onChange={(e) => setExistingPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-purple-500 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Store Description</label>
                      <textarea
                        rows={3}
                        value={existingDesc}
                        onChange={(e) => setExistingDesc(e.target.value)}
                        placeholder="Tell us about the products you intend to sell on Amazon Clone..."
                        className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:border-purple-500 focus:outline-hidden resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="buy-now"
                      size="md"
                      isLoading={loading}
                      className="w-full font-bold shadow-xs"
                    >
                      Submit Seller Application &rarr;
                    </Button>
                  </form>
                </div>
              )}

              {/* ── State D: Unauthenticated Visitor (Tabs for Register vs Login) ── */}
              {!user && (
                <div>
                  {/* Tab Selector */}
                  <div className="flex border-b border-slate-200 mb-6">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('register');
                        setError(null);
                      }}
                      className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'register'
                          ? 'border-amazon-orange text-slate-900'
                          : 'border-transparent text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      Create Seller Account
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('login');
                        setError(null);
                      }}
                      className={`flex-1 pb-3 text-sm font-bold text-center border-b-2 transition-colors cursor-pointer ${
                        activeTab === 'login'
                          ? 'border-amazon-orange text-slate-900'
                          : 'border-transparent text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      Seller Sign In
                    </button>
                  </div>

                  {/* Register Form */}
                  {activeTab === 'register' && (
                    <form onSubmit={handleRegister} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Your Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="John Doe"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-purple-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Store / Business Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={regStoreName}
                            onChange={(e) => setRegStoreName(e.target.value)}
                            placeholder="Apex Storefront"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-purple-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Business Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="seller@apexstore.com"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-purple-500 focus:outline-hidden"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">
                            Password <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-purple-500 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                          <input
                            type="tel"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-purple-500 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Primary Category</label>
                        <select
                          value={regCategory}
                          onChange={(e) => setRegCategory(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white"
                        >
                          <option value="electronics">Electronics & Accessories</option>
                          <option value="fashion">Clothing & Shoes</option>
                          <option value="home-kitchen">Home & Kitchen</option>
                          <option value="books">Books</option>
                          <option value="beauty">Beauty & Personal Care</option>
                        </select>
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Store Description</label>
                        <textarea
                          rows={2}
                          value={regDesc}
                          onChange={(e) => setRegDesc(e.target.value)}
                          placeholder="Brief summary of your products..."
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 resize-none"
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="buy-now"
                        size="md"
                        isLoading={loading}
                        className="w-full font-bold shadow-xs mt-2"
                      >
                        Register & Apply for Verification &rarr;
                      </Button>

                      <p className="text-[11px] text-slate-400 text-center mt-2">
                        By registering, you agree to Amazon Clone Merchant Terms of Service.
                      </p>
                    </form>
                  )}

                  {/* Sign In Form */}
                  {activeTab === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-4 text-xs">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Seller Account Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="merchant@example.com"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-purple-500 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">
                          Password <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-purple-500 focus:outline-hidden"
                        />
                      </div>

                      <Button
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={loading}
                        className="w-full font-bold shadow-xs bg-amber-400 hover:bg-amber-500 text-slate-900 border-amber-500"
                      >
                        Sign In to Seller Central
                      </Button>

                      <p className="text-[11px] text-slate-500 text-center">
                        Need a seller account?{' '}
                        <button
                          type="button"
                          onClick={() => setActiveTab('register')}
                          className="text-purple-600 font-bold hover:underline"
                        >
                          Create one now
                        </button>
                      </p>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
