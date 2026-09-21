'use client';
// ============================================================================
// ErrorState — user-facing error display with retry support
// ============================================================================
import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { Button } from './Button';

type ErrorType = 'generic' | 'network' | 'not-found' | 'unauthorized';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

const errorConfig: Record<
  ErrorType,
  { icon: React.ReactNode; defaultTitle: string; defaultMessage: string }
> = {
  generic: {
    icon: <AlertTriangle size={32} />,
    defaultTitle: 'Something went wrong',
    defaultMessage: 'An unexpected error occurred. Please try again.',
  },
  network: {
    icon: <WifiOff size={32} />,
    defaultTitle: 'Connection error',
    defaultMessage: 'Check your internet connection and try again.',
  },
  'not-found': {
    icon: <AlertTriangle size={32} />,
    defaultTitle: 'Page not found',
    defaultMessage: "We couldn't find what you were looking for.",
  },
  unauthorized: {
    icon: <AlertTriangle size={32} />,
    defaultTitle: 'Access denied',
    defaultMessage: 'You need to sign in to view this page.',
  },
};

export function ErrorState({
  type = 'generic',
  title,
  message,
  onRetry,
  className = '',
}: ErrorStateProps) {
  const config = errorConfig[type];

  return (
    <div
      role="alert"
      className={[
        'flex flex-col items-center justify-center gap-4 py-16 text-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-400">
        {config.icon}
      </div>
      <div className="max-w-sm">
        <h3 className="text-base font-semibold text-gray-800">
          {title ?? config.defaultTitle}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {message ?? config.defaultMessage}
        </p>
      </div>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw size={14} />}
          onClick={onRetry}
        >
          Try again
        </Button>
      )}
    </div>
  );
}

// Inline error for form fields / small sections
export function InlineError({ message }: { message: string }) {
  return (
    <p role="alert" className="flex items-center gap-1 text-xs text-red-600">
      <AlertTriangle size={12} />
      {message}
    </p>
  );
}
