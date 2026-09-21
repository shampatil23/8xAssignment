// ============================================================================
// Spinner — loading spinner in various sizes
// ============================================================================
import React from 'react';

type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface SpinnerProps {
  size?: SpinnerSize;
  color?: string;
  className?: string;
  label?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  xs: 'h-3 w-3 border',
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-8 w-8 border-[3px]',
  xl: 'h-12 w-12 border-4',
};

export function Spinner({
  size = 'md',
  color = 'border-amazon-orange',
  className = '',
  label = 'Loading…',
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={['inline-block animate-spin rounded-full border-t-transparent', sizeMap[size], color, className]
        .filter(Boolean)
        .join(' ')}
    />
  );
}

// Full-page loading overlay
export function FullPageSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="xl" />
        <p className="text-sm text-gray-500 animate-pulse">Loading…</p>
      </div>
    </div>
  );
}
