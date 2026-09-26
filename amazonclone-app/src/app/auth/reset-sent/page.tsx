'use client';
// ============================================================================
// Password Reset Confirmation page — Valenza Maison
// ============================================================================
import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MailCheck, ArrowRight, Sparkles } from 'lucide-react';

function ResetSentContent() {
  const params = useSearchParams();
  const email = params.get('email') ?? 'your client email';

  return (
    <div className="w-full max-w-[420px]">
      <div className="rounded-3xl border border-[#ebe2d1] dark:border-[#262c3d] bg-white/90 dark:bg-[#12151f]/90 backdrop-blur-xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(26,23,20,0.06)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.7)] text-center transition-all duration-300">
        
        {/* Success Icon Crest */}
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f5ede0] dark:bg-[#1f2533] border border-[#dfd6c5] dark:border-[#2e374d] text-[#c5a059] shadow-inner">
          <MailCheck size={32} />
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-light tracking-tight text-[#141312] dark:text-[#f8f5ee] mb-2">
          Dispatch Complete
        </h1>

        <p className="text-xs text-[#786b58] dark:text-[#9e978b] leading-relaxed mb-6">
          We have dispatched confidential passcode reset instructions to{' '}
          <strong className="text-[#141312] dark:text-[#f8f5ee] font-semibold">{email}</strong>. 
          Please review your inbox to complete the authentication sequence.
        </p>

        <Link href="/auth/sign-in" className="block">
          <button
            id="back-to-signin-btn"
            className="group w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-sans text-xs uppercase tracking-[0.18em] font-semibold text-[#12110f] bg-gradient-to-r from-[#c5a059] via-[#d6be90] to-[#b89548] hover:brightness-105 active:scale-[0.99] transition-all shadow-[0_4px_16px_rgba(197,160,89,0.25)] hover:shadow-[0_6px_22px_rgba(197,160,89,0.35)] cursor-pointer"
          >
            <span>Return to Client Sign In</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform duration-200" />
          </button>
        </Link>
      </div>
    </div>
  );
}

export default function ResetSentPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-[420px] mt-8 text-center text-xs tracking-widest uppercase text-[#9b8353]">Loading confirmation...</div>}>
      <ResetSentContent />
    </Suspense>
  );
}
