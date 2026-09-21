'use client';
// ============================================================================
// AuthGuard — client-side route guard for authenticated + role-protected pages
// Renders children only when the auth state matches the required conditions.
// ============================================================================
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { FullPageSpinner } from '@/components/ui/Spinner';
import type { UserRole } from '@/types';

interface AuthGuardProps {
  children: React.ReactNode;
  /** If set, user must have one of these roles */
  requiredRole?: UserRole | UserRole[];
  /** Where to redirect unauthenticated users (default: /auth/sign-in) */
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requiredRole,
  redirectTo = '/auth/sign-in',
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowedRoles = Array.isArray(requiredRole)
    ? requiredRole
    : requiredRole
    ? [requiredRole]
    : null;

  const isRoleAuthorized = !allowedRoles || (user && allowedRoles.includes(user.role));

  useEffect(() => {
    if (loading) return;

    // Not signed in → redirect with return URL
    if (!user) {
      const url = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`;
      router.replace(url);
      return;
    }

    // Wrong role → redirect to account overview
    if (!isRoleAuthorized) {
      router.replace('/account');
    }
  }, [loading, user, isRoleAuthorized, router, pathname, redirectTo]);

  // Show spinner while auth state is loading
  if (loading) return <FullPageSpinner />;

  // Not signed in
  if (!user) return null;

  // Wrong role
  if (!isRoleAuthorized) return null;

  return <>{children}</>;
}
