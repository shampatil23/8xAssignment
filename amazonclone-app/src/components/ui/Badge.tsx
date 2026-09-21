// ============================================================================
// Badge — small label chip for categories, status, discounts, etc.
// ============================================================================
import React from 'react';

type BadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'prime'
  | 'best-seller'
  | 'discount';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-600',
  info: 'bg-blue-100 text-blue-700',
  prime: 'bg-[#00A8E0] text-white font-semibold',
  'best-seller': 'bg-amazon-orange text-white font-semibold',
  discount: 'bg-red-600 text-white font-semibold',
};

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded px-1.5 py-0.5 text-xs leading-tight',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
