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
 * Loads all realisasi chunks from Firestore using collection query with fallback.
 */
async function loadRealisasiChunks(chunkCount?: number): Promise<any[]> {
  if (getIsFirestoreQuotaExceeded()) return [];
  const allRealisasi: any[] = [];

  // Strategy 1: Load from dedicated collection
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
        chunkDocs.forEach(c => allRealisasi.push(...c.items));
        return allRealisasi;
      }
    }
  } catch (e) {
    if (isQuotaError(e)) {
      await markFirestoreQuotaExceeded();
      return [];
    }
    console.warn('Strategy 1 chunk load failed, trying Strategy 2:', e);
  }

  if (getIsFirestoreQuotaExceeded()) return [];

  // Strategy 2: Fallback to SHARED_DATA_COLLECTION prefixed docs
  const maxChunksToScan = Math.max(chunkCount || 0, 10);
  const chunkPromises = [];
  for (let i = 0; i < maxChunksToScan; i++) {
    const chunkDocRef = doc(db, SHARED_DATA_COLLECTION, `${REALISASI_CHUNK_PREFIX}${i}`);
    chunkPromises.push(getDoc(chunkDocRef).catch(() => null));
  }

  const chunkSnapshots = await Promise.all(chunkPromises);
  chunkSnapshots.forEach(snap => {
    if (snap && snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.items)) {
        allRealisasi.push(...data.items);
      }
    }
  });

  return allRealisasi;
}

/**
 * Loads all anggaran chunks from Firestore using collection query with fallback.
 */
async function loadAnggaranChunks(chunkCount?: number): Promise<any[]> {
  if (getIsFirestoreQuotaExceeded()) return [];
  const allAnggaran: any[] = [];

  // Strategy 1: Load from dedicated collection
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
        chunkDocs.forEach(c => allAnggaran.push(...c.items));
        return allAnggaran;
      }
    }
  } catch (e) {
    if (isQuotaError(e)) {
      await markFirestoreQuotaExceeded();
      return [];
    }
    console.warn('Strategy 1 anggaran chunk load failed, trying Strategy 2:', e);
  }

  if (getIsFirestoreQuotaExceeded()) return [];

  // Strategy 2: Fallback to SHARED_DATA_COLLECTION prefixed docs
  const maxChunksToScan = Math.max(chunkCount || 0, 10);
  const chunkPromises = [];
  for (let i = 0; i < maxChunksToScan; i++) {
    const chunkDocRef = doc(db, SHARED_DATA_COLLECTION, `${ANGGARAN_CHUNK_PREFIX}${i}`);
    chunkPromises.push(getDoc(chunkDocRef).catch(() => null));
  }

  const chunkSnapshots = await Promise.all(chunkPromises);
  chunkSnapshots.forEach(snap => {
    if (snap && snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.items)) {
        allAnggaran.push(...data.items);
      }
    }
  });

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

        // Check chunks and merge intelligently
        try {
          const chunkedItems = await loadRealisasiChunks(rawData.realisasiChunkCount);
          if (chunkedItems.length > 0) {
            const map = new Map<string, any>();
            finalRealisasi.forEach(item => { if (item?.id) map.set(item.id, item); });
            chunkedItems.forEach(item => { if (item?.id) map.set(item.id, item); });
            finalRealisasi = Array.from(map.values());
          }
        } catch (e) {
          if (isQuotaError(e)) {
            await markFirestoreQuotaExceeded();
          }
          console.warn('Error loading realisasi chunks in listener:', e);
        }

        try {
          const chunkedAnggaran = await loadAnggaranChunks(rawData.anggaranChunkCount);
          if (chunkedAnggaran.length > 0) {
            const map = new Map<string, any>();
            finalAnggaran.forEach(item => { if (item?.id) map.set(item.id, item); });
            chunkedAnggaran.forEach(item => { if (item?.id) map.set(item.id, item); });
            finalAnggaran = Array.from(map.values());
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
        const chunkedItems = await loadRealisasiChunks(rawData.realisasiChunkCount);
        if (chunkedItems.length > 0) {
          const map = new Map<string, any>();
          finalRealisasi.forEach(item => { if (item?.id) map.set(item.id, item); });
          chunkedItems.forEach(item => { if (item?.id) map.set(item.id, item); });
          finalRealisasi = Array.from(map.values());
        }
      } catch (e) {
        console.warn('Error loading realisasi chunks in fetchOnce:', e);
      }

      try {
        const chunkedAnggaran = await loadAnggaranChunks(rawData.anggaranChunkCount);
        if (chunkedAnggaran.length > 0) {
          const map = new Map<string, any>();
          finalAnggaran.forEach(item => { if (item?.id) map.set(item.id, item); });
          chunkedAnggaran.forEach(item => { if (item?.id) map.set(item.id, item); });
          finalAnggaran = Array.from(map.values());
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
    if (data.realisasiList && Array.isArray(data.realisasiList) && data.realisasiList.length > 0) {
      const realisasiItems = data.realisasiList;
      const numChunks = Math.ceil(realisasiItems.length / CHUNK_SIZE);
      dataToSave.realisasiCount = realisasiItems.length;
      dataToSave.realisasiChunkCount = numChunks;

      const chunkPromises = [];
      for (let i = 0; i < numChunks; i++) {
        const chunkSlice = realisasiItems.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        
        // Save to dedicated collection (single clean destination)
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

      // Keep safe preview array on main doc (< 500KB)
      dataToSave.realisasiList = realisasiItems.slice(0, 150);
    }

    // 2. Handle anggaranList chunking
    if (data.anggaranList && Array.isArray(data.anggaranList) && data.anggaranList.length > 0) {
      const anggaranItems = data.anggaranList;
      const numChunks = Math.ceil(anggaranItems.length / CHUNK_SIZE);
      dataToSave.anggaranCount = anggaranItems.length;
      dataToSave.anggaranChunkCount = numChunks;

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



