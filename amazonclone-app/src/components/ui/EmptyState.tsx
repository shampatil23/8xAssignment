'use client';
// ============================================================================
// EmptyState — zero-results or empty section placeholder
// ============================================================================
import React from 'react';
import { Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  title = 'Nothing here yet',
  description = 'When items appear they will show here.',
  icon,
  action,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  const resolvedAction =
    action || (actionLabel && onAction ? { label: actionLabel, onClick: onAction } : undefined);
  return (
    <div
      className={[
        'flex flex-col items-center justify-center gap-4 py-16 text-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
        {icon ?? <Package size={32} />}
      </div>
      <div className="max-w-xs">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      {resolvedAction && (
        <Button variant="primary" size="sm" onClick={resolvedAction.onClick}>
          {resolvedAction.label}
        </Button>
      )}
    </div>
  );
}

// Specific empty states
export function EmptyCart() {
  const router = useRouter();
  return (
    <EmptyState
      title="Your cart is empty"
      description="Add items to your cart to continue shopping."
      action={{ label: 'Continue Shopping', onClick: () => router.push('/') }}
    />
  );
}

export function EmptyOrders() {
  return (
    <EmptyState
      title="No orders yet"
      description="Your order history will appear here once you place an order."
    />
  );
}

export function EmptySearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      title={`No results for "${query}"`}
      description="Try different keywords or browse our categories."
    />
  );
}
