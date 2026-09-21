'use client';
// ============================================================================
// useAuth — convenient hook to consume AuthContext
// ============================================================================
import { useAuthContext } from '@/context/AuthContext';

export function useAuth() {
  return useAuthContext();
}
