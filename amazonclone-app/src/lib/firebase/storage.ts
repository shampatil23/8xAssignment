// ============================================================================
// Firebase Storage helpers (stub — used in Phase 5 for image uploads)
// ============================================================================
import {
  getStorage,
  type FirebaseStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
  type StorageReference,
} from 'firebase/storage';
import { firebaseApp } from './config';

let _storage: FirebaseStorage | null = null;

export function getFirebaseStorage(): FirebaseStorage {
  if (!_storage) {
    _storage = getStorage(firebaseApp);
  }
  return _storage;
}

export type UploadProgressCallback = (progress: number) => void;

/**
 * Upload a file to Firebase Storage with progress tracking.
 * Returns the download URL when complete.
 */
export async function uploadFile(
  file: File,
  path: string,
  onProgress?: UploadProgressCallback,
): Promise<string> {
  const storage = getFirebaseStorage();
  const storageRef: StorageReference = ref(storage, path);
  const task: UploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    task.on(
      'state_changed',
      (snapshot) => {
        const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(pct));
      },
      reject,
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve(url);
        } catch (err) {
          reject(err);
        }
      },
    );
  });
}

/**
 * Delete a file from Firebase Storage by its path.
 */
export async function deleteFile(path: string): Promise<void> {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export { ref, getDownloadURL };
