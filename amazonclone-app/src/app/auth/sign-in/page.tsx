'use client';
// ============================================================================
// Sign-In page — Includes Educational Demo Warning & 1-Click Test Credentials
// ============================================================================
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, ShieldAlert, KeyRound, UserCheck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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

  // 1-Click Demo Login Fill
  const handleFillDemoCredentials = (role: 'customer' | 'seller' | 'admin') => {
    if (role === 'customer') {
      setEmail('customer@amazonclone.com');
      setPassword('Customer@123456');
    } else if (role === 'seller') {
      setEmail('seller@amazonclone.com');
      setPassword('Seller@123456');
    } else if (role === 'admin') {
      setEmail('admin@amazonclone.com');
      setPassword('Admin@123456');
    }
    setError(null);
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = await loginWithEmail({ email, password });
    setLoading(false);
    if (result.success) {
      router.push(redirectTo);
    } else {
      setError(result.error ?? 'Sign-in failed. Please try again.');
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Educational Notice Badge */}
      <div className="rounded-lg bg-blue-50 border border-blue-200 p-3 text-xs text-blue-900 mb-4 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-blue-800">
          <ShieldCheck size={16} className="text-blue-600 shrink-0" />
          <span>Educational Portfolio Demo</span>
        </div>
        <p className="text-[11px] text-blue-700 leading-normal">
          This is an independent portfolio demonstration. <strong>Do not enter real Amazon.com passwords.</strong> Use the test accounts below:
        </p>
        <div className="flex flex-wrap gap-1.5 pt-1.5">
          <button
            type="button"
            onClick={() => handleFillDemoCredentials('customer')}
            className="text-[10px] bg-white hover:bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded border border-blue-300 transition-colors cursor-pointer"
          >
            Fill Shopper
          </button>
          <button
            type="button"
            onClick={() => handleFillDemoCredentials('seller')}
            className="text-[10px] bg-white hover:bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded border border-blue-300 transition-colors cursor-pointer"
          >
            Fill Merchant
          </button>
          <button
            type="button"
            onClick={() => handleFillDemoCredentials('admin')}
            className="text-[10px] bg-white hover:bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded border border-blue-300 transition-colors cursor-pointer"
          >
            Fill Admin
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-gray-300 p-6 bg-white shadow-2xs">
        <h1 className="text-2xl font-normal text-gray-900 mb-4">Sign in</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            id="signin-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />

          <div>
            <Input
              id="signin-password"
              label="Password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              rightAddon={
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />
            <div className="mt-1 text-right">
              <Link
                href="/auth/forgot-password"
                className="text-xs text-amazon-link hover:text-amazon-link-hover hover:underline"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          {error && <InlineError message={error} />}

          <Button
            id="signin-submit-btn"
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
          >
            Sign in (Demo)
          </Button>
        </form>

        <p className="mt-4 text-xs text-gray-500 leading-normal">
          By continuing, you agree to Amazon Clone Demo&apos;s educational terms of use.
        </p>
      </div>

      <div className="mt-4 text-center">
        <span className="text-xs text-gray-600">New to Amazon Clone Demo?&nbsp;</span>
        <Link
          href={`/auth/sign-up${redirectTo !== '/account' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
          id="go-to-signup-link"
          className="text-xs font-semibold text-amazon-dark hover:text-amazon-link hover:underline"
        >
          Create your demo account
        </Link>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm mt-8 text-center text-sm text-gray-500">Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
