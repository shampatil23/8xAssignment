// ============================================================================
// Firestore helpers (stub — full implementation in Phase 3 for products/orders)
// ============================================================================
import {
  getFirestore,
  type Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  type QueryConstraint,
  type DocumentSnapshot,
  type QuerySnapshot,
  serverTimestamp,
  type FieldValue,
} from 'firebase/firestore';
import { firebaseApp } from './config';

// Firestore collection names
export const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CARTS: 'carts',
  REVIEWS: 'reviews',
  CATEGORIES: 'categories',
} as const;

// Lazy-initialised Firestore instance
let _db: Firestore | null = null;

export function getDB(): Firestore {
  if (!_db) {
    _db = getFirestore(firebaseApp);
  }
  return _db;
}

// Generic get document
export async function getDocument<T>(
  collectionName: string,
  documentId: string,
): Promise<T | null> {
  const db = getDB();
  const docRef = doc(db, collectionName, documentId);
  const snapshot: DocumentSnapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as T;
}

// Generic set document (create/overwrite)
export async function setDocument(
  collectionName: string,
  documentId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const db = getDB();
  const docRef = doc(db, collectionName, documentId);
  await setDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

// Generic update document (partial)
export async function updateDocument(
  collectionName: string,
  documentId: string,
  data: Record<string, unknown>,
): Promise<void> {
  const db = getDB();
  const docRef = doc(db, collectionName, documentId);
  await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
}

// Generic delete document
export async function deleteDocument(
  collectionName: string,
  documentId: string,
): Promise<void> {
  const db = getDB();
  const docRef = doc(db, collectionName, documentId);
  await deleteDoc(docRef);
}

// Generic query
export async function queryDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[],
): Promise<T[]> {
  const db = getDB();
  const colRef = collection(db, collectionName);
  const q = query(colRef, ...constraints);
  const snapshot: QuerySnapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
}

// Re-export query builders for convenience
export {
  collection,
  doc,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  type FieldValue,
};
