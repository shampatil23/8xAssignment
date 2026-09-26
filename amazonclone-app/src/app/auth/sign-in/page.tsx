'use client';
// ============================================================================
// Sign-In page — Horizontal Clean Luxury Layout (Accessible Medium English)
// ============================================================================
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Package,
  Headphones,
} from 'lucide-react';
import { InlineError } from '@/components/ui/ErrorState';
import { loginWithEmail } from '@/services/authService';

function SignInContent() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get('redirect') ?? '/account';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await loginWithEmail({ email, password });
    setLoading(false);
    if (result.success) {
      router.push(redirectTo);
    } else {
      setError(result.error ?? 'Invalid email or password. Please try again.');
    }
  }

  return (
    <div className="w-full max-w-4xl">
      {/* Horizontal Card */}
      <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/95 dark:bg-[#12151f]/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(26,23,20,0.07)] dark:shadow-[0_25px_80px_rgba(0,0,0,0.8)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all duration-300">
        
        {/* ── Left Column: Brand Showcase (5 cols) ── */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#0c0f17] via-[#131927] to-[#080a10] text-[#f8fafc] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-[#1e2538]">
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-[#c5a059]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-[#dfba73]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo */}
          <div className="relative z-10">
            <Link 
              href="/"
              className="inline-flex items-center gap-3 group transition-transform duration-300 hover:scale-[1.01]"
            >
              <div className="w-10 h-10 rounded-full border border-[#c5a059]/60 bg-[#161c2d] flex items-center justify-center shadow-md group-hover:border-[#dfba73] transition-all">
                <span className="font-serif text-lg font-bold tracking-widest text-[#dfba73]">
                  V
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif tracking-[0.22em] text-lg font-normal text-[#f8fafc]">
                  VALENZA
                </span>
                <span className="text-[8px] uppercase tracking-[0.3em] text-[#c5a059] font-medium">
                  Haute Maison
                </span>
              </div>
            </Link>
          </div>

          {/* Middle: Clear Benefits */}
          <div className="my-8 sm:my-10 relative z-10 space-y-6">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#c5a059] mb-1.5 flex items-center gap-1.5">
                <Sparkles size={12} className="text-[#dfba73]" />
                <span>Welcome to Valenza</span>
              </p>
              <h2 className="font-serif text-xl sm:text-2xl font-light text-[#f8fafc] leading-snug">
                Discover luxury watches, fine jewelry & premium fashion.
              </h2>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-[#cbd5e1]">
                <div className="w-6 h-6 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#dfba73] flex-shrink-0">
                  <CheckCircle2 size={12} />
                </div>
                <span>100% Genuine & Certified Products</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#cbd5e1]">
                <div className="w-6 h-6 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#dfba73] flex-shrink-0">
                  <Package size={12} />
                </div>
                <span>Insured Global Shipping & Fast Delivery</span>
              </div>

              <div className="flex items-center gap-3 text-xs text-[#cbd5e1]">
                <div className="w-6 h-6 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/40 flex items-center justify-center text-[#dfba73] flex-shrink-0">
                  <Headphones size={12} />
                </div>
                <span>24/7 Dedicated Customer Support</span>
              </div>
            </div>
          </div>

          {/* Bottom Note */}
          <div className="relative z-10 pt-4 border-t border-[#1e2538]">
            <p className="font-serif italic text-xs text-[#94a3b8] leading-relaxed">
              &ldquo;Exceptional quality and elegance with every single order.&rdquo;
            </p>
          </div>
        </div>

        {/* ── Right Column: Sign In Form (7 cols) ── */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-center">
          
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#f2ede4] dark:border-[#1d2332]">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f6efe1] dark:bg-[#1f2433] border border-[#e4d6bf] dark:border-[#2d354a]">
              <Sparkles className="w-3 h-3 text-[#c5a059]" />
              <span className="text-[10px] uppercase font-semibold tracking-[0.18em] text-[#9b8353] dark:text-[#d6be90]">
                Customer Account
              </span>
            </div>
            <span className="text-[10px] tracking-wider uppercase text-[#9e9382] dark:text-[#727d95]">
              Secure Sign In
            </span>
          </div>

          <div className="mb-6">
            <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-[#141312] dark:text-[#f8f5ee] mb-1.5">
              Sign In to Your Account
            </h1>
            <p className="text-xs text-[#786b58] dark:text-[#9e978b] leading-relaxed">
              Welcome back! Please enter your email and password to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Email input */}
            <div className="flex flex-col gap-1.5">
              <label 
                htmlFor="signin-email" 
                className="text-xs font-semibold text-[#42392c] dark:text-[#d4c9b8]"
              >
                Email Address <span className="text-[#c5a059]">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#9a8d7a] dark:text-[#6e778b] pointer-events-none">
                  <Mail size={16} />
                </span>
                <input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                  autoComplete="email"
                  autoFocus
                  className="w-full rounded-xl border border-[#dfd6c5] dark:border-[#272d3e] bg-[#fbfaf8] dark:bg-[#161a25] pl-10 pr-4 py-2.5 text-sm text-[#141312] dark:text-[#f5f2eb] placeholder:text-[#a09585] dark:placeholder:text-[#525d75] focus:outline-none focus:border-[#c5a059] focus:ring-2 focus:ring-[#c5a059]/20 transition-all"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label 
                  htmlFor="signin-password" 
                  className="text-xs font-semibold text-[#42392c] dark:text-[#d4c9b8]"
                >
                  Password <span className="text-[#c5a059]">*</span>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-[#9b8353] dark:text-[#d6be90] hover:text-[#7d673b] dark:hover:text-[#f3e5ca] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-[#9a8d7a] dark:text-[#6e778b] pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  id="signin-password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#dfd6c5] dark:border-[#272d3e] bg-[#fbfaf8] dark:bg-[#161a25] pl-10 pr-11 py-2.5 text-sm text-[#141312] dark:text-[#f5f2eb] placeholder:text-[#a09585] dark:placeholder:text-[#525d75] focus:outline-none focus:border-[#c5a059] focus:ring-2 focus:ring-[#c5a059]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3.5 text-[#9a8d7a] hover:text-[#615442] dark:text-[#6e778b] dark:hover:text-[#c4b59d] transition-colors cursor-pointer"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50">
                <InlineError message={error} />
              </div>
            )}

            {/* CTA Button */}
            <button
              id="signin-submit-btn"
              type="submit"
              disabled={loading}
              className="group relative mt-2 w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-sans text-xs uppercase tracking-[0.16em] font-bold text-[#0c0f17] bg-gradient-to-r from-[#c5a059] via-[#ecd599] to-[#c5a059] hover:brightness-105 active:scale-[0.99] transition-all shadow-[0_4px_18px_rgba(197,160,89,0.35)] hover:shadow-[0_6px_25px_rgba(197,160,89,0.5)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-[#12110f]/30 border-t-[#12110f] rounded-full animate-spin" />
                  <span>Signing in...</span>
                </span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>

          {/* Security */}
          <div className="mt-5 pt-4 border-t border-[#f2ede4] dark:border-[#1d2332] flex items-center justify-center gap-1.5 text-[11px] text-[#8e816e] dark:text-[#727d95]">
            <ShieldCheck size={14} className="text-[#9b8353] dark:text-[#c5a059]" />
            <span>256-Bit SSL Encrypted & Secure Login</span>
          </div>

          {/* Register Link */}
          <div className="mt-4 text-center">
            <p className="text-xs text-[#786b58] dark:text-[#9e978b]">
              Don&apos;t have an account?{' '}
              <Link
                href={`/auth/sign-up${redirectTo !== '/account' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
                id="go-to-signup-link"
                className="font-semibold text-[#9b8353] dark:text-[#d6be90] hover:text-[#7d673b] dark:hover:text-[#f3e5ca] hover:underline underline-offset-4 ml-1 transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-4xl py-12 text-center text-xs tracking-wider text-[#9b8353]">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}


