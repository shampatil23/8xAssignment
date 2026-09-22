// ============================================================================
// User Service — reads/writes the RTDB user profile & manages user settings
// ============================================================================
import type { ApiResponse, UserPreferences } from '@/types';
import {
  getUserProfile,
  updateUserProfile,
  updateUserPreferencesInDB,
  updateUserPhoneInDB,
  type UserProfile,
} from '@/lib/firebase/database';
import {
  getFirebaseAuth,
} from '@/lib/firebase/auth';
import {
  updatePassword as fbUpdatePassword,
  updateProfile as fbUpdateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';

export type { UserProfile };

// ── Fetch profile by UID ─────────────────────────────────────────────────
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    return await getUserProfile(uid);
  } catch (error) {
    console.error('[userService] fetchUserProfile failed:', error);
    return null;
  }
}

// ── Update display name / photo ───────────────────────────────────────────
export async function updateProfile(
  uid: string,
  data: { displayName?: string; photoURL?: string },
): Promise<ApiResponse> {
  try {
    await updateUserProfile(uid, data);
    const auth = getFirebaseAuth();
    if (auth.currentUser) {
      await fbUpdateProfile(auth.currentUser, {
        displayName: data.displayName ?? auth.currentUser.displayName,
        photoURL: data.photoURL ?? auth.currentUser.photoURL,
      });
    }
    return { success: true, message: 'Profile updated successfully.' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ── Update Phone Number ──────────────────────────────────────────────────
export async function updatePhone(
  uid: string,
  phoneNumber: string,
): Promise<ApiResponse> {
  try {
    if (phoneNumber && !/^\+?[0-9\s\-()]{7,15}$/.test(phoneNumber.trim())) {
      return { success: false, error: 'Please enter a valid phone number.' };
    }
    await updateUserPhoneInDB(uid, phoneNumber.trim());
    return { success: true, message: 'Phone number updated successfully.' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ── Update Preferences ───────────────────────────────────────────────────
export async function updatePreferences(
  uid: string,
  preferences: UserPreferences,
): Promise<ApiResponse> {
  try {
    await updateUserPreferencesInDB(uid, preferences);
    return { success: true, message: 'Preferences updated successfully.' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

// ── Change Password ──────────────────────────────────────────────────────
export async function changeUserPassword(
  currentPassword: string,
  newPassword: string,
): Promise<ApiResponse> {
  try {
    const auth = getFirebaseAuth();
    const user = auth.currentUser;
    if (!user || !user.email) {
      return { success: false, error: 'User is not signed in.' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters.' };
    }

    // Reauthenticate user before changing sensitive credential
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Update password
    await fbUpdatePassword(user, newPassword);
    return { success: true, message: 'Password changed successfully.' };
  } catch (error: any) {
    console.error('[userService.changeUserPassword] error:', error);
    if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
      return { success: false, error: 'Current password entered is incorrect.' };
    }
    return { success: false, error: error.message || 'Failed to change password.' };
  }
}
