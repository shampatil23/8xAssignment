'use client';
// ============================================================================
// useAuth — primary hook for auth state + role helpers
// ============================================================================
import { useAuthContext } from '@/context/AuthContext';

export function useAuth() {
  return useAuthContext();
}
