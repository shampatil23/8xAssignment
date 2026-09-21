'use client';
// ============================================================================
// Password Reset Confirmation page
// ============================================================================
import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MailCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function ResetSentContent() {
  const params = useSearchParams();
  const email = params.get('email') ?? 'your email address';

  return (
    <div className="w-full max-w-sm">
      <div className="rounded border border-gray-300 p-6 mt-4 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
          <MailCheck size={32} />
        </div>

        <h1 className="text-2xl font-medium text-gray-900 mb-2">Check your email</h1>

        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          We have sent a password reset link to{' '}
          <strong className="text-gray-900">{email}</strong>. Please follow the instructions in the email to set up a new password.
        </p>

        <Link href="/auth/sign-in">
          <Button variant="primary" fullWidth id="back-to-signin-btn">
            Return to Sign in
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function ResetSentPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-sm mt-8 text-center text-sm text-gray-500">Loading...</div>}>
      <ResetSentContent />
    </Suspense>
  );
}
