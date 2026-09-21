'use client';
// ============================================================================
// Auth Context — provides current user state to the entire component tree.
// Full auth logic implemented in Phase 2.
// ============================================================================
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { User as AppUser } from '@/types';
import type { User as FirebaseUser } from 'firebase/auth';

interface AuthContextValue {
  user: AppUser | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  /** Sign out the current user */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Dynamically import to avoid SSR issues with Firebase
    let unsubscribe: (() => void) | undefined;

    import('@/lib/firebase/auth')
      .then(({ onAuthChange }) => {
        unsubscribe = onAuthChange((fbUser) => {
          setFirebaseUser(fbUser);

          if (fbUser) {
            // Map FirebaseUser → AppUser (Phase 2 will fetch full profile from Firestore)
            setUser({
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName,
              photoURL: fbUser.photoURL,
              phoneNumber: fbUser.phoneNumber,
              emailVerified: fbUser.emailVerified,
              createdAt: fbUser.metadata.creationTime ?? new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              role: 'customer',
              addresses: [],
            });
          } else {
            setUser(null);
          }

          setLoading(false);
        });
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });

    return () => unsubscribe?.();
  }, []);

  const signOut = useCallback(async () => {
    const { signOutUser } = await import('@/lib/firebase/auth');
    await signOutUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, firebaseUser, loading, error, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used inside <AuthProvider>');
  }
  return ctx;
}
