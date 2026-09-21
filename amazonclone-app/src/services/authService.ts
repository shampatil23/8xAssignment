// ============================================================================
// Auth Service — full Phase 2 implementation
// Wraps Firebase auth + RTDB profile operations.
// Maps Firebase error codes to friendly messages.
// ============================================================================
import type { User, ApiResponse } from '@/types';
import { getAuthErrorMessage } from '@/lib/firebase/errorMessages';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  displayName: string;
}

// ── Sign in with email/password ───────────────────────────────────────────
export async function loginWithEmail(
  credentials: AuthCredentials,
): Promise<ApiResponse<User>> {
  const { signInWithEmail } = await import('@/lib/firebase/auth');
  try {
    await signInWithEmail(credentials.email, credentials.password);
    if (typeof document !== 'undefined') {
      document.cookie = 'auth_session=1; path=/; max-age=2592000; SameSite=Lax';
    }
    return { success: true, message: 'Signed in successfully' };
  } catch (error) {
    return { success: false, error: getAuthErrorMessage(error) };
  }
}

// ── Register with email/password (creates RTDB profile) ──────────────────
export async function registerUser(
  data: RegisterData,
): Promise<ApiResponse<User>> {
  const { registerWithEmail } = await import('@/lib/firebase/auth');
  try {
    await registerWithEmail(data.email, data.password, data.displayName);
    if (typeof document !== 'undefined') {
      document.cookie = 'auth_session=1; path=/; max-age=2592000; SameSite=Lax';
    }
    return { success: true, message: 'Account created successfully' };
  } catch (error) {
    return { success: false, error: getAuthErrorMessage(error) };
  }
}

// ── Sign out ──────────────────────────────────────────────────────────────
export async function logout(): Promise<ApiResponse> {
  const { signOutUser } = await import('@/lib/firebase/auth');
  try {
    if (typeof document !== 'undefined') {
      document.cookie = 'auth_session=; path=/; max-age=0; SameSite=Lax';
    }
    await signOutUser();
    return { success: true };
  } catch (error) {
    return { success: false, error: getAuthErrorMessage(error) };
  }
}

// ── Send password reset email ─────────────────────────────────────────────
export async function sendPasswordReset(email: string): Promise<ApiResponse> {
  const { resetPassword } = await import('@/lib/firebase/auth');
  try {
    await resetPassword(email);
    return { success: true, message: 'Password reset email sent. Check your inbox.' };
  } catch (error) {
    return { success: false, error: getAuthErrorMessage(error) };
  }
}

// Google auth stub kept for future — not exposed in UI
export async function loginWithGoogle(): Promise<ApiResponse<User>> {
  return { success: false, error: 'Google sign-in is not enabled.' };
}
