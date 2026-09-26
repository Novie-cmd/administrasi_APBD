import { db } from '../lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  collection,
  getDocs,
  disableNetwork,
  enableNetwork
} from 'firebase/firestore';

export const SHARED_DATA_COLLECTION = 'bfms_shared_state';
export const SHARED_DATA_DOC_ID = 'app_data_v1';
export const REALISASI_CHUNKS_COLLECTION = 'bfms_realisasi_chunks';
export const ANGGARAN_CHUNKS_COLLECTION = 'bfms_anggaran_chunks';

export const FIRESTORE_UPGRADE_URL = 'https://console.firebase.google.com/project/symbolic-lamp-48gvj/firestore/databases/ai-studio-sisteminformasik-8d677004-ee10-4de9-ad02-58f29f9e3339/data?openUpgradeDialog=true';
export const FIRESTORE_PRICING_URL = 'https://firebase.google.com/pricing#cloud-firestore';

const REALISASI_CHUNK_PREFIX = 'realisasi_chunk_';
const ANGGARAN_CHUNK_PREFIX = 'anggaran_chunk_';
const CHUNK_SIZE = 1000; // Increased to 1000 items per doc (~200KB, well under 1MB Firestore limit, reducing write operations by >3x)
const QUOTA_STORAGE_KEY = 'bfms_firestore_quota_exceeded_date';

function getTodayString(): string {
  return new Date().toISOString().slice(0, 10);
}

// Global in-memory & persistent flag to prevent repeated retry loops when daily quota is exhausted
let isFirestoreQuotaExceeded = false;
let lastSavedSignature: string = '';

export function getIsFirestoreQuotaExceeded(): boolean {
  try {
    const saved = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (saved === getTodayString()) {
      return true;
    }
  } catch {}
  return isFirestoreQuotaExceeded;
}

export async function markFirestoreQuotaExceeded(): Promise<void> {
  isFirestoreQuotaExceeded = true;
  try {
    localStorage.setItem(QUOTA_STORAGE_KEY, getTodayString());
  } catch {}
  try {
    if (db) {
      await disableNetwork(db);
      console.info('Firestore network suspended: free tier daily quota reached. Switched to offline/local storage mode.');
    }
  } catch (err) {
    // Already disabled or unavailable
  }
}

export async function resetFirestoreQuotaFlag(): Promise<void> {
  isFirestoreQuotaExceeded = false;
  try {
    localStorage.removeItem(QUOTA_STORAGE_KEY);
  } catch {}
  try {
    if (db) {
      await enableNetwork(db);
      console.info('Firestore network re-enabled.');
    }
  } catch (err) {
    console.warn('Could not re-enable Firestore network:', err);
  }
}

// If quota is already flagged for today, proactively disable Firestore network on startup
if (getIsFirestoreQuotaExceeded()) {
  try {
    if (db) {
      disableNetwork(db).catch(() => {});
    }
  } catch {}
}

export interface FirestoreAppData {
  users?: any[];
  selectedTahun?: number;
  tahunList?: any[];
  opdList?: any[];
  programs?: any[];
  kegiatanList?: any[];
  subKegiatanList?: any[];
  belanjaList?: any[];
  sumberDanaList?: any[];
  rekananList?: any[];
  anggaranList?: any[];
  realisasiList?: any[];
  importLogs?: any[];
  activityLogs?: any[];
  sheetConfig?: any;
  realisasiCount?: number;
  anggaranCount?: number;
  realisasiChunkCount?: number;
  anggaranChunkCount?: number;
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * Checks if an error is due to Firestore quota exhaustion.
 */
export function isQuotaError(err: any): boolean {
  if (!err) return false;
  const msg = typeof err === 'string' ? err : (err.message || err.code || String(err));
  return (
    msg.includes('resource-exhausted') ||
    msg.includes('Quota limit exceeded') ||
    msg.includes('quota') ||
    msg.includes('Free daily write units per project')
  );
}

/**
 * Checks if an error is due to transient offline / connectivity issues.
 */
export function isOfflineOrUnavailable(err: any): boolean {
  if (!err) return false;
  const msg = typeof err === 'string' ? err : (err.message || err.code || String(err));
  return (
    msg.includes('unavailable') ||
    msg.includes('offline') ||
    msg.includes('Could not reach Cloud Firestore backend') ||
    msg.includes('network')
  );
}

/**
 * Loads all realisasi chunks from Firestore using dedicated collection.
 */
async function loadRealisasiChunks(chunkCount?: number): Promise<any[]> {
  if (getIsFirestoreQuotaExceeded()) return [];
  // If explicitly 0, do not load any chunks - data was deleted/emptied
  if (chunkCount === 0) return [];
  const allRealisasi: any[] = [];

  try {
    const chunksColRef = collection(db, REALISASI_CHUNKS_COLLECTION);
    const snap = await getDocs(chunksColRef);
    if (!snap.empty) {
      const chunkDocs: { index: number; items: any[] }[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        if (Array.isArray(data.items)) {
          chunkDocs.push({
            index: typeof data.chunkIndex === 'number' ? data.chunkIndex : 0,
            items: data.items
          });
        }
      });

      if (chunkDocs.length > 0) {
        chunkDocs.sort((a, b) => a.index - b.index);
        // Only load chunks within active chunkCount if defined
        const validChunks = typeof chunkCount === 'number' && chunkCount > 0
          ? chunkDocs.filter(c => c.index < chunkCount)
          : chunkDocs;
        validChunks.forEach(c => allRealisasi.push(...c.items));
        return allRealisasi;
      }
    }
  } catch (e) {
    if (isQuotaError(e)) {
      await markFirestoreQuotaExceeded();
      return [];
    }
    console.warn('Dedicated realisasi chunk load failed:', e);
  }

  return allRealisasi;
}

/**
 * Loads all anggaran chunks from Firestore using dedicated collection.
 */
async function loadAnggaranChunks(chunkCount?: number): Promise<any[]> {
  if (getIsFirestoreQuotaExceeded()) return [];
  // If explicitly 0, do not load any chunks - data was deleted/emptied
  if (chunkCount === 0) return [];
  const allAnggaran: any[] = [];

  try {
    const chunksColRef = collection(db, ANGGARAN_CHUNKS_COLLECTION);
    const snap = await getDocs(chunksColRef);
    if (!snap.empty) {
      const chunkDocs: { index: number; items: any[] }[] = [];
      snap.forEach(docSnap => {
        const data = docSnap.data();
        if (Array.isArray(data.items)) {
          chunkDocs.push({
            index: typeof data.chunkIndex === 'number' ? data.chunkIndex : 0,
            items: data.items
          });
        }
      });

      if (chunkDocs.length > 0) {
        chunkDocs.sort((a, b) => a.index - b.index);
        // Only load chunks within active chunkCount if defined
        const validChunks = typeof chunkCount === 'number' && chunkCount > 0
          ? chunkDocs.filter(c => c.index < chunkCount)
          : chunkDocs;
        validChunks.forEach(c => allAnggaran.push(...c.items));
        return allAnggaran;
      }
    }
  } catch (e) {
    if (isQuotaError(e)) {
      await markFirestoreQuotaExceeded();
      return [];
    }
    console.warn('Dedicated anggaran chunk load failed:', e);
  }

  return allAnggaran;
}

/**
 * Subscribes to real-time changes in Firestore shared state.
 */
export const subscribeToSharedData = (
  onData: (data: FirestoreAppData) => void,
  onError?: (err: Error) => void
) => {
  if (getIsFirestoreQuotaExceeded()) {
    console.info('Cloud Firestore: Daily free tier write/read quota reached. Running in robust offline/local storage mode.');
    if (onError) onError(new Error("Quota limit exceeded for free tier."));
    return () => {};
  }

  const docRef = doc(db, SHARED_DATA_COLLECTION, SHARED_DATA_DOC_ID);
  return onSnapshot(
    docRef,
    async snapshot => {
      if (getIsFirestoreQuotaExceeded()) return;
      if (snapshot.exists()) {
        const rawData = snapshot.data() as FirestoreAppData;
        let finalRealisasi = rawData.realisasiList || [];
        let finalAnggaran = rawData.anggaranList || [];

        // Check chunks and resolve accurate realisasi list
        try {
          if (rawData.realisasiCount === 0 || (rawData.realisasiChunkCount === 0 && (!rawData.realisasiList || rawData.realisasiList.length === 0))) {
            finalRealisasi = [];
          } else {
            const chunkedItems = await loadRealisasiChunks(rawData.realisasiChunkCount);
            if (chunkedItems.length > 0) {
              finalRealisasi = chunkedItems;
            } else if (rawData.realisasiChunkCount && rawData.realisasiChunkCount > 0) {
              // Chunks were expected but none found
              finalRealisasi = [];
            }
          }
        } catch (e) {
          if (isQuotaError(e)) {
            await markFirestoreQuotaExceeded();
          }
          console.warn('Error loading realisasi chunks in listener:', e);
        }

        try {
          if (rawData.anggaranCount === 0 || (rawData.anggaranChunkCount === 0 && (!rawData.anggaranList || rawData.anggaranList.length === 0))) {
            finalAnggaran = [];
          } else {
            const chunkedAnggaran = await loadAnggaranChunks(rawData.anggaranChunkCount);
            if (chunkedAnggaran.length > 0) {
              finalAnggaran = chunkedAnggaran;
            } else if (rawData.anggaranChunkCount && rawData.anggaranChunkCount > 0) {
              finalAnggaran = [];
            }
          }
        } catch (e) {
          if (isQuotaError(e)) {
            await markFirestoreQuotaExceeded();
          }
          console.warn('Error loading anggaran chunks in listener:', e);
        }

        onData({
          ...rawData,
          realisasiList: finalRealisasi,
          anggaranList: finalAnggaran
        });
      }
    },
    async error => {
      if (isQuotaError(error)) {
        await markFirestoreQuotaExceeded();
      }
      console.warn('Firestore subscription status:', error.message || error);
      if (onError) onError(error);
    }
  );
};

/**
 * Fetches the shared state once from Firestore.
 */
export const fetchSharedDataOnce = async (): Promise<FirestoreAppData | null> => {
  if (getIsFirestoreQuotaExceeded()) return null;
  try {
    const docRef = doc(db, SHARED_DATA_COLLECTION, SHARED_DATA_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const rawData = snap.data() as FirestoreAppData;
      let finalRealisasi = rawData.realisasiList || [];
      let finalAnggaran = rawData.anggaranList || [];

      try {
        if (rawData.realisasiCount === 0 || (rawData.realisasiChunkCount === 0 && (!rawData.realisasiList || rawData.realisasiList.length === 0))) {
          finalRealisasi = [];
        } else {
          const chunkedItems = await loadRealisasiChunks(rawData.realisasiChunkCount);
          if (chunkedItems.length > 0) {
            finalRealisasi = chunkedItems;
          } else if (rawData.realisasiChunkCount && rawData.realisasiChunkCount > 0) {
            finalRealisasi = [];
          }
        }
      } catch (e) {
        console.warn('Error loading realisasi chunks in fetchOnce:', e);
      }

      try {
        if (rawData.anggaranCount === 0 || (rawData.anggaranChunkCount === 0 && (!rawData.anggaranList || rawData.anggaranList.length === 0))) {
          finalAnggaran = [];
        } else {
          const chunkedAnggaran = await loadAnggaranChunks(rawData.anggaranChunkCount);
          if (chunkedAnggaran.length > 0) {
            finalAnggaran = chunkedAnggaran;
          } else if (rawData.anggaranChunkCount && rawData.anggaranChunkCount > 0) {
            finalAnggaran = [];
          }
        }
      } catch (e) {
        console.warn('Error loading anggaran chunks in fetchOnce:', e);
      }

      return {
        ...rawData,
        realisasiList: finalRealisasi,
        anggaranList: finalAnggaran
      };
    }
    return null;
  } catch (error) {
    if (isQuotaError(error)) {
      await markFirestoreQuotaExceeded();
    }
    console.warn('Error fetching Firestore shared data:', error);
    return null;
  }
};

/**
 * Saves or updates shared state to Firestore with optimized single-collection chunking and quota protection.
 */
export const saveSharedDataToFirestore = async (
  data: Partial<FirestoreAppData>,
  userIdentifier: string = 'System'
) => {
  // If quota was exceeded previously, do not spam requests unless manually forced
  if (getIsFirestoreQuotaExceeded()) {
    const quotaErr = new Error("Quota exceeded. Free daily write units per project limit reached.");
    throw quotaErr;
  }

  try {
    const nowIso = new Date().toISOString();
    const docRef = doc(db, SHARED_DATA_COLLECTION, SHARED_DATA_DOC_ID);

    const dataToSave: any = { ...data };

    // 1. Handle realisasiList chunking
    if (data.realisasiList !== undefined && Array.isArray(data.realisasiList)) {
      const realisasiItems = data.realisasiList;
      const numChunks = Math.ceil(realisasiItems.length / CHUNK_SIZE);
      dataToSave.realisasiCount = realisasiItems.length;
      dataToSave.realisasiChunkCount = numChunks;

      if (realisasiItems.length > 0) {
        const chunkPromises = [];
        for (let i = 0; i < numChunks; i++) {
          const chunkSlice = realisasiItems.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
          const colDocRef = doc(db, REALISASI_CHUNKS_COLLECTION, `chunk_${i}`);
          chunkPromises.push(
            setDoc(colDocRef, {
              chunkIndex: i,
              totalChunks: numChunks,
              items: chunkSlice,
              updatedAt: nowIso
            })
          );
        }
        await Promise.all(chunkPromises);
        dataToSave.realisasiList = realisasiItems.slice(0, 150);

        // Clean up any extra orphaned chunks from previous writes
        try {
          const chunksColRef = collection(db, REALISASI_CHUNKS_COLLECTION);
          const snap = await getDocs(chunksColRef);
          if (!snap.empty) {
            const extraDeletes: Promise<any>[] = [];
            snap.forEach(d => {
              const dData = d.data();
              const idx = typeof dData.chunkIndex === 'number' ? dData.chunkIndex : -1;
              if (idx >= numChunks) {
                extraDeletes.push(deleteDoc(d.ref));
              }
            });
            if (extraDeletes.length > 0) await Promise.all(extraDeletes);
          }
        } catch (e) {
          console.warn('Could not clean obsolete realisasi chunks:', e);
        }
      } else {
        // Data is empty: wipe all realisasi chunks
        dataToSave.realisasiList = [];
        dataToSave.realisasiCount = 0;
        dataToSave.realisasiChunkCount = 0;
        try {
          const chunksColRef = collection(db, REALISASI_CHUNKS_COLLECTION);
          const snap = await getDocs(chunksColRef);
          if (!snap.empty) {
            const deletePromises: Promise<any>[] = [];
            snap.forEach(d => deletePromises.push(deleteDoc(d.ref)));
            await Promise.all(deletePromises);
          }
        } catch (err) {
          console.warn('Could not clean realisasi chunks collection:', err);
        }
      }
    }

    // 2. Handle anggaranList chunking
    if (data.anggaranList !== undefined && Array.isArray(data.anggaranList)) {
      const anggaranItems = data.anggaranList;
      const numChunks = Math.ceil(anggaranItems.length / CHUNK_SIZE);
      dataToSave.anggaranCount = anggaranItems.length;
      dataToSave.anggaranChunkCount = numChunks;

      if (anggaranItems.length > 0) {
        const chunkPromises = [];
        for (let i = 0; i < numChunks; i++) {
          const chunkSlice = anggaranItems.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
          const colDocRef = doc(db, ANGGARAN_CHUNKS_COLLECTION, `chunk_${i}`);
          chunkPromises.push(
            setDoc(colDocRef, {
              chunkIndex: i,
              totalChunks: numChunks,
              items: chunkSlice,
              updatedAt: nowIso
            })
          );
        }
        await Promise.all(chunkPromises);
        dataToSave.anggaranList = anggaranItems.slice(0, 150);

        // Clean up any extra orphaned chunks from previous writes
        try {
          const chunksColRef = collection(db, ANGGARAN_CHUNKS_COLLECTION);
          const snap = await getDocs(chunksColRef);
          if (!snap.empty) {
            const extraDeletes: Promise<any>[] = [];
            snap.forEach(d => {
              const dData = d.data();
              const idx = typeof dData.chunkIndex === 'number' ? dData.chunkIndex : -1;
              if (idx >= numChunks) {
                extraDeletes.push(deleteDoc(d.ref));
              }
            });
            if (extraDeletes.length > 0) await Promise.all(extraDeletes);
          }
        } catch (e) {
          console.warn('Could not clean obsolete anggaran chunks:', e);
        }
      } else {
        // Data is empty: wipe all anggaran chunks
        dataToSave.anggaranList = [];
        dataToSave.anggaranCount = 0;
        dataToSave.anggaranChunkCount = 0;
        try {
          const chunksColRef = collection(db, ANGGARAN_CHUNKS_COLLECTION);
          const snap = await getDocs(chunksColRef);
          if (!snap.empty) {
            const deletePromises: Promise<any>[] = [];
            snap.forEach(d => deletePromises.push(deleteDoc(d.ref)));
            await Promise.all(deletePromises);
          }
        } catch (err) {
          console.warn('Could not clean anggaran chunks collection:', err);
        }
      }
    }

    // 3. Save main document with metadata & non-chunked entities
    await setDoc(
      docRef,
      {
        ...dataToSave,
        updatedAt: nowIso,
        updatedBy: userIdentifier
      },
      { merge: true }
    );
  } catch (error) {
    if (isQuotaError(error)) {
      await markFirestoreQuotaExceeded();
    }
    console.warn('Could not save shared data to Firestore:', error);
    throw error;
  }
};

/**
 * Directly purges all shared data from Firestore (main doc and all chunks).
 */
export const purgeAllFirestoreData = async (): Promise<void> => {
  try {
    const docRef = doc(db, SHARED_DATA_COLLECTION, SHARED_DATA_DOC_ID);
    await setDoc(docRef, {
      realisasiList: [],
      anggaranList: [],
      realisasiCount: 0,
      anggaranCount: 0,
      realisasiChunkCount: 0,
      anggaranChunkCount: 0,
      updatedAt: new Date().toISOString(),
      updatedBy: 'System Purge'
    }, { merge: true });

    // Clean realisasi chunks
    try {
      const snap = await getDocs(collection(db, REALISASI_CHUNKS_COLLECTION));
      const delPromises: Promise<any>[] = [];
      snap.forEach(d => delPromises.push(deleteDoc(d.ref)));
      if (delPromises.length > 0) await Promise.all(delPromises);
    } catch {}

    // Clean anggaran chunks
    try {
      const snap = await getDocs(collection(db, ANGGARAN_CHUNKS_COLLECTION));
      const delPromises: Promise<any>[] = [];
      snap.forEach(d => delPromises.push(deleteDoc(d.ref)));
      if (delPromises.length > 0) await Promise.all(delPromises);
    } catch {}
  } catch (err) {
    console.warn('purgeAllFirestoreData error:', err);
  }
};



