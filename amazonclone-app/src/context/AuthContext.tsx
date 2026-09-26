'use client';
// ============================================================================
// Auth Context — Phase 2 full implementation
// Listens to Firebase Auth state, fetches RTDB profile, exposes role helpers.
// ============================================================================
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User as AppUser, UserRole } from '@/types';
import type { User as FirebaseUser } from 'firebase/auth';

interface AuthContextValue {
  /** Full application user (from RTDB profile) */
  user: AppUser | null;
  /** Raw Firebase auth user */
  firebaseUser: FirebaseUser | null;
  /** True while Firebase is restoring the session or fetching the profile */
  loading: boolean;
  /** Any error that occurred during auth state init */
  error: string | null;
  /** Sign out */
  signOut: () => Promise<void>;
  /** Convenience role checkers */
  isCustomer: boolean;
  isSeller: boolean;
  isAdmin: boolean;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function init() {
      try {
        const { onAuthChange } = await import('@/lib/firebase/auth');
        const { getUserProfile, profileToAppUser } = await import('@/lib/firebase/database');

        unsubscribe = onAuthChange(async (fbUser) => {
          setFirebaseUser(fbUser);

          if (fbUser) {
            if (typeof document !== 'undefined') {
              document.cookie = 'auth_session=1; path=/; max-age=2592000; SameSite=Lax';
            }
            try {
              // Always fetch profile from RTDB — role comes from the database, not the client
              const profile = await getUserProfile(fbUser.uid);
              if (profile) {
                const appUser = profileToAppUser(profile);
                // If RTDB profile has no displayName, fall back to Firebase Auth displayName
                if (!appUser.displayName && fbUser.displayName) {
                  appUser.displayName = fbUser.displayName;
                }
                setUser(appUser);
              } else {
                // Profile missing (e.g. old test account) — use safe defaults from Firebase Auth
                setUser({
                  uid: fbUser.uid,
                  email: fbUser.email,
                  displayName: fbUser.displayName,
                  photoURL: fbUser.photoURL,
                  phoneNumber: null,
                  emailVerified: fbUser.emailVerified,
                  role: 'customer',
                  addresses: [],
                  createdAt: fbUser.metadata.creationTime ?? new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                });
              }
            } catch (profileErr) {
              console.error('[AuthContext] profile fetch failed, using Firebase Auth fallback:', profileErr);
              // On error, still show the user as logged in using their Firebase Auth data
              setUser({
                uid: fbUser.uid,
                email: fbUser.email,
                displayName: fbUser.displayName,
                photoURL: fbUser.photoURL,
                phoneNumber: null,
                emailVerified: fbUser.emailVerified,
                role: 'customer',
                addresses: [],
                createdAt: fbUser.metadata.creationTime ?? new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              });
            }
          } else {
            if (typeof document !== 'undefined') {
              document.cookie = 'auth_session=; path=/; max-age=0; SameSite=Lax';
            }
            setUser(null);
          }

          setLoading(false);
        });
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    }

    init();
    return () => unsubscribe?.();
  }, []);

  const signOut = useCallback(async () => {
    if (typeof document !== 'undefined') {
      document.cookie = 'auth_session=; path=/; max-age=0; SameSite=Lax';
    }
    const { signOutUser } = await import('@/lib/firebase/auth');
    await signOutUser();
  }, []);

  const hasRole = useCallback(
    (role: UserRole) => user?.role === role,
    [user],
  );

  const value: AuthContextValue = {
    user,
    firebaseUser,
    loading,
    error,
    signOut,
    isCustomer: user?.role === 'customer',
    isSeller: user?.role === 'seller',
    isAdmin: user?.role === 'admin',
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>');
  return ctx;
}
