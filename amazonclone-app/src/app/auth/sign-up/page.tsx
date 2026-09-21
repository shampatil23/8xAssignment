'use client';
// ============================================================================
// Sign-Up / Registration page
// ============================================================================
import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { InlineError } from '@/components/ui/ErrorState';
import { registerUser } from '@/services/authService';

function SignUpContent() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get('redirect') ?? '/account';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Please enter your name.');
      return;
    }
    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (password.length < 6) {
      setError('Passwords must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await registerUser({
      email: email.trim(),
      password,
      displayName: name.trim(),
    });
    setLoading(false);

    if (result.success) {
      router.push(redirectTo);
    } else {
      setError(result.error ?? 'Registration failed. Please try again.');
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded border border-gray-300 p-6 mt-4">
        <h1 className="text-2xl font-medium text-gray-900 mb-4">Create account</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            id="signup-name"
            label="Your name"
            placeholder="First and last name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            autoFocus
          />

          <Input
            id="signup-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <div>
            <Input
              id="signup-password"
              label="Password"
              type={showPw ? 'text' : 'password'}
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="Passwords must be at least 6 characters."
              required
              autoComplete="new-password"
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
          </div>

          <Input
            id="signup-password-confirm"
            label="Re-enter password"
            type={showPw ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          {error && <InlineError message={error} />}

          <Button
            id="signup-submit-btn"
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
          >
            Create your Amazon Clone account
          </Button>
        </form>

        <p className="mt-4 text-xs text-gray-600 leading-5">
          By creating an account, you agree to Amazon Clone&apos;s{' '}
          <a href="#" className="text-amazon-link hover:underline">
            Conditions of Use
          </a>{' '}
          and{' '}
          <a href="#" className="text-amazon-link hover:underline">
            Privacy Notice
          </a>
          .
        </p>

        <div className="mt-4 border-t pt-4 text-xs text-gray-700">
          Already have an account?{' '}
          <Link
            href={`/auth/sign-in${redirectTo !== '/account' ? `?redirect=${encodeURIComponent(redirectTo)}` : ''}`}
            className="text-amazon-link hover:text-amazon-link-hover hover:underline font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm mt-8 text-center text-sm text-gray-500">Loading...</div>}>
      <SignUpContent />
    </Suspense>
  );
}
