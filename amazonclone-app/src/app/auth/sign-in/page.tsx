'use client';
// ============================================================================
// Sign-In page
// ============================================================================
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
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
      <div className="rounded border border-gray-300 p-6 mt-4">
        <h1 className="text-2xl font-medium text-gray-900 mb-4">Sign in</h1>

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
                  className="text-gray-400 hover:text-gray-600"
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
            Sign in
          </Button>
        </form>

        <p className="mt-4 text-xs text-gray-600 leading-5">
          By continuing, you agree to Amazon Clone&apos;s{' '}
          <a href="#" className="text-amazon-link hover:underline">Conditions of Use</a> and{' '}
          <a href="#" className="text-amazon-link hover:underline">Privacy Notice</a>.
        </p>
      </div>

      <div className="mt-4 text-center">
        <span className="text-sm text-gray-600">New to Amazon Clone?&nbsp;</span>
        <Link
          href={`/auth/sign-up${redirectTo !== '/account' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
          id="go-to-signup-link"
          className="text-sm font-medium text-amazon-dark hover:text-amazon-link hover:underline"
        >
          Create your Amazon Clone account
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
