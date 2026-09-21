// ============================================================================
// Firebase error code → user-friendly message mapping
// ============================================================================

const ERROR_MESSAGES: Record<string, string> = {
  // Auth errors
  'auth/email-already-in-use':
    'An account with this email already exists. Try signing in instead.',
  'auth/invalid-email':
    'Please enter a valid email address.',
  'auth/user-not-found':
    'No account found with this email. Please check or create a new account.',
  'auth/wrong-password':
    'Incorrect password. Please try again or reset your password.',
  'auth/invalid-credential':
    'Invalid email or password. Please check your credentials and try again.',
  'auth/weak-password':
    'Password is too weak. Please use at least 6 characters.',
  'auth/user-disabled':
    'This account has been disabled. Please contact support.',
  'auth/too-many-requests':
    'Too many failed attempts. Please wait a moment and try again.',
  'auth/network-request-failed':
    'Network error. Please check your internet connection.',
  'auth/popup-closed-by-user':
    'Sign-in was cancelled. Please try again.',
  'auth/operation-not-allowed':
    'This sign-in method is not enabled. Please contact support.',
  'auth/requires-recent-login':
    'For security, please sign in again before making this change.',
  'auth/missing-email':
    'Please enter your email address.',
  'auth/expired-action-code':
    'This link has expired. Please request a new password reset.',
  'auth/invalid-action-code':
    'This link is invalid or has already been used.',
};

/**
 * Convert a Firebase AuthError code to a friendly message.
 * Falls back to the raw error message if code is unknown.
 */
export function getAuthErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const err = error as { code: string; message?: string };
    return ERROR_MESSAGES[err.code] ?? err.message ?? 'An unexpected error occurred.';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}
