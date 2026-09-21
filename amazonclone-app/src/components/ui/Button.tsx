'use client';
// ============================================================================
// Button — reusable button primitive with Amazon-style variants
// ============================================================================
import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'cart' | 'buy-now' | 'outline';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-amazon-yellow hover:bg-amazon-yellow-dark text-amazon-dark border border-amber-400 hover:border-amber-500',
  secondary:
    'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300',
  outline:
    'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm',
  ghost:
    'bg-transparent hover:bg-white/10 text-white border border-transparent hover:border-white/30',
  danger:
    'bg-red-600 hover:bg-red-700 text-white border border-red-700',
  cart:
    'bg-amazon-yellow hover:bg-amazon-yellow-dark text-amazon-dark border border-amber-400 font-semibold rounded-full',
  'buy-now':
    'bg-amazon-orange hover:bg-orange-500 text-white border border-orange-600 font-semibold rounded-full',
};

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  isLoading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const isCurrentlyLoading = loading || isLoading;
  const isDisabled = disabled || isCurrentlyLoading;

  return (
    <button
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 rounded',
        'font-medium transition-colors duration-150 cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amazon-orange focus-visible:ring-offset-1',
        'disabled:opacity-60 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {isCurrentlyLoading ? (
        <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        leftIcon
      )}
      {children}
      {!isCurrentlyLoading && rightIcon}
    </button>
  );
}
