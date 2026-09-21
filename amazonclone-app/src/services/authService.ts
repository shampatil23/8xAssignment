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

export interface SellerRegisterData extends RegisterData {
  storeName: string;
  phone?: string;
  category?: string;
  description?: string;
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

export async function registerSeller(
  data: SellerRegisterData,
): Promise<ApiResponse<User>> {
  const { registerWithEmail } = await import('@/lib/firebase/auth');
  const { applyForSellerAccount } = await import('@/lib/firebase/database');
  try {
    const cred = await registerWithEmail(data.email, data.password, data.displayName);
    await applyForSellerAccount(cred.user.uid, {
      storeName: data.storeName,
      businessEmail: data.email,
      phone: data.phone,
      category: data.category,
      description: data.description,
      appliedAt: new Date().toISOString(),
      verificationStatus: 'pending',
    });
    if (typeof document !== 'undefined') {
      document.cookie = 'auth_session=1; path=/; max-age=2592000; SameSite=Lax';
    }
    return {
      success: true,
      message: 'Seller account registered! Your store application is submitted for admin review.',
    };
  } catch (error) {
    return { success: false, error: getAuthErrorMessage(error) };
  }
}

export async function applyCurrentCustomerAsSeller(
  uid: string,
  data: { storeName: string; businessEmail: string; phone?: string; category?: string; description?: string },
): Promise<ApiResponse<void>> {
  const { applyForSellerAccount } = await import('@/lib/firebase/database');
  try {
    await applyForSellerAccount(uid, {
      storeName: data.storeName,
      businessEmail: data.businessEmail,
      phone: data.phone,
      category: data.category,
      description: data.description,
      appliedAt: new Date().toISOString(),
      verificationStatus: 'pending',
    });
    return {
      success: true,
      message: 'Application submitted! Your seller store is under review by Amazon Admin.',
    };
  } catch (error) {
    console.error('[applyCurrentCustomerAsSeller] error:', error);
    return { success: false, error: 'Failed to submit seller application.' };
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
