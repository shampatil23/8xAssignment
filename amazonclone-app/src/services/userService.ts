// ============================================================================
// User Service — reads/writes the RTDB user profile
// ============================================================================
import type { ApiResponse } from '@/types';
import {
  getUserProfile,
  updateUserProfile,
  type UserProfile,
} from '@/lib/firebase/database';

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
    return { success: true, message: 'Profile updated' };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
