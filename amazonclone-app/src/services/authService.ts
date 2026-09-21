// ============================================================================
// Auth Service — business logic layer (stub, implemented in Phase 2)
// Wraps Firebase Auth; keeps UI components free of SDK details.
// ============================================================================
import type { User, ApiResponse } from '@/types';

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends AuthCredentials {
  displayName: string;
}

/**
 * Sign in with Google OAuth popup.
 * Full implementation in Phase 2.
 */
export async function loginWithGoogle(): Promise<ApiResponse<User>> {
  // Dynamically import Firebase to avoid loading it server-side
  const { signInWithGoogle } = await import('@/lib/firebase/auth');
  try {
    await signInWithGoogle();
    return { success: true, message: 'Signed in with Google' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Sign in with email and password.
 */
export async function loginWithEmail(
  credentials: AuthCredentials,
): Promise<ApiResponse<User>> {
  const { signInWithEmail } = await import('@/lib/firebase/auth');
  try {
    await signInWithEmail(credentials.email, credentials.password);
    return { success: true, message: 'Signed in successfully' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Register a new user with email, password, and display name.
 */
export async function registerUser(
  data: RegisterData,
): Promise<ApiResponse<User>> {
  const { registerWithEmail } = await import('@/lib/firebase/auth');
  try {
    await registerWithEmail(data.email, data.password, data.displayName);
    return { success: true, message: 'Account created successfully' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Sign out the current user.
 */
export async function logout(): Promise<ApiResponse> {
  const { signOutUser } = await import('@/lib/firebase/auth');
  try {
    await signOutUser();
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

/**
 * Send a password reset email.
 */
export async function sendPasswordReset(email: string): Promise<ApiResponse> {
  const { resetPassword } = await import('@/lib/firebase/auth');
  try {
    await resetPassword(email);
    return { success: true, message: 'Password reset email sent' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
