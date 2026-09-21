// ============================================================================
// Firebase Client SDK Configuration
// Initialises the Firebase app exactly once (singleton pattern).
// ============================================================================
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAoBqHmKPsI0re0PbkFQhdhTXQvhltBAIk',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'clone-ca65e.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'clone-ca65e',
  databaseURL:
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
    'https://clone-ca65e-default-rtdb.firebaseio.com',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'clone-ca65e.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '299446199788',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:299446199788:web:f012876ff1644bdd510cc9',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-WHC4TRFQ6F',
};

// Prevent re-initialisation on hot reload (Next.js dev mode)
const firebaseApp: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export { firebaseApp };
export default firebaseApp;
