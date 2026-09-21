// ============================================================================
// Firebase Auth helpers — Phase 2 full implementation
// Email/password only (no phone/SMS).
// On registration, creates the RTDB user profile.
// ============================================================================
import {
  getAuth,
  type Auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { firebaseApp } from './config';
import { createUserProfile } from './database';

let _auth: Auth | null = null;

export function getFirebaseAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(firebaseApp);
    // Persist session across browser restarts
    setPersistence(_auth, browserLocalPersistence).catch(console.error);
  }
  return _auth;
}

// ── Sign in ───────────────────────────────────────────────────────────────
export async function signInWithEmail(
  email: string,
  password: string,
): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  return signInWithEmailAndPassword(auth, email, password);
}

// ── Register — creates Firebase Auth user + RTDB profile ─────────────────
export async function registerWithEmail(
  email: string,
  password: string,
  displayName: string,
): Promise<UserCredential> {
  const auth = getFirebaseAuth();
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  // Set displayName on the Firebase Auth user object
  await updateProfile(credential.user, { displayName });
  // Create application-level profile in RTDB (role defaults to 'customer')
  await createUserProfile(credential.user.uid, { email, displayName });
  return credential;
}

// ── Sign out ──────────────────────────────────────────────────────────────
export async function signOutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  return signOut(auth);
}

// ── Password reset ────────────────────────────────────────────────────────
export async function resetPassword(email: string): Promise<void> {
  const auth = getFirebaseAuth();
  return sendPasswordResetEmail(auth, email);
}

// ── Auth state listener ───────────────────────────────────────────────────
export function onAuthChange(
  callback: (user: User | null) => void,
): () => void {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
}

// ── Current user (synchronous) ────────────────────────────────────────────
export function getCurrentUser(): User | null {
  return getFirebaseAuth().currentUser;
}

export type { User, UserCredential };
