// ============================================================================
// Skeleton — content placeholder for loading states
// ============================================================================
import React from 'react';

interface SkeletonProps {
  className?: string;
  rounded?: boolean;
  circle?: boolean;
}

export function Skeleton({ className = '', rounded = false, circle = false }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        'animate-pulse bg-gray-200',
        circle ? 'rounded-full' : rounded ? 'rounded-lg' : 'rounded',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  );
}

// Pre-built skeleton layouts
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-100 bg-white p-4">
      <Skeleton className="h-48 w-full" rounded />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-5 w-1/3" />
      <Skeleton className="h-8 w-full" rounded />
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Skeleton className="aspect-square w-full" rounded />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-4/5" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-24 w-full" rounded />
        <Skeleton className="h-10 w-full" rounded />
        <Skeleton className="h-10 w-full" rounded />
      </div>
    </div>
  );
}
