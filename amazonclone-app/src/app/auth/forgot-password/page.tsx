'use client';
// ============================================================================
// Forgot Password page
// ============================================================================
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { InlineError } from '@/components/ui/ErrorState';
import { sendPasswordReset } from '@/services/authService';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }

    setLoading(true);
    const result = await sendPasswordReset(email.trim());
    setLoading(false);

    if (result.success) {
      router.push(`/auth/reset-sent?email=${encodeURIComponent(email.trim())}`);
    } else {
      setError(result.error ?? 'Failed to send password reset email.');
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded border border-gray-300 p-6 mt-4">
        <h1 className="text-2xl font-medium text-gray-900 mb-2">Password assistance</h1>
        <p className="text-xs text-gray-600 mb-4 leading-relaxed">
          Enter the email address associated with your Amazon Clone account. We will send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            id="forgot-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            autoFocus
          />

          {error && <InlineError message={error} />}

          <Button
            id="forgot-submit-btn"
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
          >
            Continue
          </Button>
        </form>

        <div className="mt-6 border-t pt-4 text-xs text-gray-600">
          Remember your password?{' '}
          <Link
            href="/auth/sign-in"
            className="text-amazon-link hover:text-amazon-link-hover hover:underline font-medium"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
