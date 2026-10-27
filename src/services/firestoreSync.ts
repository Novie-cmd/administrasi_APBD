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
import { cleanBudgetCode, cleanDateValue, extractCode } from '../utils/codeUtils';

export const SHARED_DATA_COLLECTION = 'bfms_shared_state';
export const SHARED_DATA_DOC_ID = 'app_data_v1';
export const REALISASI_CHUNKS_COLLECTION = 'bfms_realisasi_chunks';
export const ANGGARAN_CHUNKS_COLLECTION = 'bfms_anggaran_chunks';

export const FIRESTORE_UPGRADE_URL = 'https://console.firebase.google.com/project/symbolic-lamp-48gvj/firestore/databases/ai-studio-sisteminformasik-8d677004-ee10-4de9-ad02-58f29f9e3339/data?openUpgradeDialog=true';
export const FIRESTORE_PRICING_URL = 'https://firebase.google.com/pricing#cloud-firestore';

const REALISASI_CHUNK_PREFIX = 'realisasi_chunk_';
const ANGGARAN_CHUNK_PREFIX = 'anggaran_chunk_';
const CHUNK_SIZE = 1000;
const QUOTA_STORAGE_KEY = 'bfms_firestore_quota_exceeded_date';

// Soft in-memory cooldown to prevent spamming on transient rate limits
let quotaCooldownUntil = 0;
let lastSavedRealisasiFingerprint = '';
let lastSavedAnggaranFingerprint = '';
let cachedRealisasiList: any[] = [];
let cachedAnggaranList: any[] = [];

export function computeItemsFingerprint(items: any[] | undefined): string {
  if (!items || !items.length) return '0_empty';
  const first = items[0]?.id || items[0]?.noSP2D || items[0]?.kodeBelanja || '';
  const last = items[items.length - 1]?.id || items[items.length - 1]?.noSP2D || items[items.length - 1]?.kodeBelanja || '';
  const mid = items[Math.floor(items.length / 2)]?.id || '';
  return `${items.length}_${first}_${mid}_${last}`;
}

export function getIsFirestoreQuotaExceeded(): boolean {
  if (Date.now() < quotaCooldownUntil) {
    return true;
  }
  return false;
}

export async function markFirestoreQuotaExceeded(cooldownMs: number = 60000): Promise<void> {
  quotaCooldownUntil = Date.now() + cooldownMs;
  try {
    localStorage.removeItem(QUOTA_STORAGE_KEY);
  } catch {}
}

export async function resetFirestoreQuotaFlag(): Promise<void> {
  quotaCooldownUntil = 0;
  try {
    localStorage.removeItem(QUOTA_STORAGE_KEY);
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
  if (getIsFirestoreQuotaExceeded()) return cachedRealisasiList;
  // If explicitly 0, do not load any chunks - data was deleted/emptied
  if (chunkCount === 0) {
    cachedRealisasiList = [];
    return [];
  }
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
        cachedRealisasiList = allRealisasi;
        return allRealisasi;
      }
    }
  } catch (e) {
    if (isQuotaError(e)) {
      await markFirestoreQuotaExceeded();
      return cachedRealisasiList;
    }
    console.warn('Dedicated realisasi chunk load failed:', e);
  }

  return allRealisasi.length > 0 ? allRealisasi : cachedRealisasiList;
}

/**
 * Loads all anggaran chunks from Firestore using dedicated collection.
 */
async function loadAnggaranChunks(chunkCount?: number): Promise<any[]> {
  if (getIsFirestoreQuotaExceeded()) return cachedAnggaranList;
  // If explicitly 0, do not load any chunks - data was deleted/emptied
  if (chunkCount === 0) {
    cachedAnggaranList = [];
    return [];
  }
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
        cachedAnggaranList = allAnggaran;
        return allAnggaran;
      }
    }
  } catch (e) {
    if (isQuotaError(e)) {
      await markFirestoreQuotaExceeded();
      return cachedAnggaranList;
    }
    console.warn('Dedicated anggaran chunk load failed:', e);
  }

  return allAnggaran.length > 0 ? allAnggaran : cachedAnggaranList;
}

/**
 * Subscribes to real-time changes in Firestore shared state.
 */
export const subscribeToSharedData = (
  onData: (data: FirestoreAppData) => void,
  onError?: (err: Error) => void
) => {
  const docRef = doc(db, SHARED_DATA_COLLECTION, SHARED_DATA_DOC_ID);
  return onSnapshot(
    docRef,
    async snapshot => {
      if (snapshot.exists()) {
        const rawData = snapshot.data() as FirestoreAppData;
        let finalRealisasi = rawData.realisasiList || [];
        let finalAnggaran = rawData.anggaranList || [];
        let isRealisasiComplete = true;
        let isAnggaranComplete = true;

        // Check chunks and resolve accurate realisasi list
        try {
          if (rawData.realisasiCount === 0 || (rawData.realisasiChunkCount === 0 && (!rawData.realisasiList || rawData.realisasiList.length === 0))) {
            finalRealisasi = [];
            cachedRealisasiList = [];
          } else if (cachedRealisasiList.length > 0 && cachedRealisasiList.length === rawData.realisasiCount) {
            finalRealisasi = cachedRealisasiList;
          } else {
            const chunkedItems = await loadRealisasiChunks(rawData.realisasiChunkCount);
            if (chunkedItems.length > 0) {
              finalRealisasi = chunkedItems;
            } else if (rawData.realisasiChunkCount && rawData.realisasiChunkCount > 1) {
              isRealisasiComplete = false;
            }
          }
        } catch (e) {
          if (isQuotaError(e)) {
            await markFirestoreQuotaExceeded();
          }
          if (rawData.realisasiChunkCount && rawData.realisasiChunkCount > 1) {
            isRealisasiComplete = false;
          }
          console.warn('Error loading realisasi chunks in listener:', e);
        }

        try {
          if (rawData.anggaranCount === 0 || (rawData.anggaranChunkCount === 0 && (!rawData.anggaranList || rawData.anggaranList.length === 0))) {
            finalAnggaran = [];
            cachedAnggaranList = [];
          } else if (cachedAnggaranList.length > 0 && cachedAnggaranList.length === rawData.anggaranCount) {
            finalAnggaran = cachedAnggaranList;
          } else {
            const chunkedAnggaran = await loadAnggaranChunks(rawData.anggaranChunkCount);
            if (chunkedAnggaran.length > 0) {
              finalAnggaran = chunkedAnggaran;
            } else if (rawData.anggaranChunkCount && rawData.anggaranChunkCount > 1) {
              isAnggaranComplete = false;
            }
          }
        } catch (e) {
          if (isQuotaError(e)) {
            await markFirestoreQuotaExceeded();
          }
          if (rawData.anggaranChunkCount && rawData.anggaranChunkCount > 1) {
            isAnggaranComplete = false;
          }
          console.warn('Error loading anggaran chunks in listener:', e);
        }

        const sanitizedPrograms = Array.isArray(rawData.programs)
          ? rawData.programs.map(p => ({
              ...p,
              kodeProgram: cleanBudgetCode(p.kodeProgram)
            }))
          : rawData.programs;

        const sanitizedKegiatan = Array.isArray(rawData.kegiatanList)
          ? rawData.kegiatanList.map(k => ({
              ...k,
              kodeProgram: cleanBudgetCode(k.kodeProgram),
              kodeKegiatan: cleanBudgetCode(k.kodeKegiatan)
            }))
          : rawData.kegiatanList;

        const sanitizedSub = Array.isArray(rawData.subKegiatanList)
          ? rawData.subKegiatanList.map(s => ({
              ...s,
              kodeProgram: cleanBudgetCode(s.kodeProgram),
              kodeKegiatan: cleanBudgetCode(s.kodeKegiatan),
              kodeSub: cleanBudgetCode(s.kodeSub)
            }))
          : rawData.subKegiatanList;

        const sanitizedRealisasi = finalRealisasi.map(r => ({
          ...r,
          kodeProgram: cleanBudgetCode(r.kodeProgram),
          kodeKegiatan: cleanBudgetCode(r.kodeKegiatan),
          kodeSub: cleanBudgetCode(r.kodeSub),
          kodeBelanja: extractCode(r.kodeBelanja),
          tanggal: cleanDateValue(r.tanggal),
          noSPM: cleanDateValue(r.noSPM) || r.noSPM
        }));

        const sanitizedAnggaran = finalAnggaran.map(a => ({
          ...a,
          kodeProgram: cleanBudgetCode(a.kodeProgram),
          kodeKegiatan: cleanBudgetCode(a.kodeKegiatan),
          kodeSub: cleanBudgetCode(a.kodeSub),
          kodeBelanja: extractCode(a.kodeBelanja)
        }));

        const emittedData: any = {
          ...rawData,
          programs: sanitizedPrograms,
          kegiatanList: sanitizedKegiatan,
          subKegiatanList: sanitizedSub
        };

        if (isRealisasiComplete) {
          emittedData.realisasiList = sanitizedRealisasi;
        }
        if (isAnggaranComplete) {
          emittedData.anggaranList = sanitizedAnggaran;
        }

        onData(emittedData);
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

      let isRealisasiComplete = true;
      let isAnggaranComplete = true;

      try {
        if (rawData.realisasiCount === 0 || (rawData.realisasiChunkCount === 0 && (!rawData.realisasiList || rawData.realisasiList.length === 0))) {
          finalRealisasi = [];
        } else {
          const chunkedItems = await loadRealisasiChunks(rawData.realisasiChunkCount);
          if (chunkedItems.length > 0) {
            finalRealisasi = chunkedItems;
          } else if (rawData.realisasiChunkCount && rawData.realisasiChunkCount > 1) {
            isRealisasiComplete = false;
          }
        }
      } catch (e) {
        if (isQuotaError(e)) {
          await markFirestoreQuotaExceeded();
        }
        if (rawData.realisasiChunkCount && rawData.realisasiChunkCount > 1) {
          isRealisasiComplete = false;
        }
        console.warn('Error loading realisasi chunks in fetchOnce:', e);
      }

      try {
        if (rawData.anggaranCount === 0 || (rawData.anggaranChunkCount === 0 && (!rawData.anggaranList || rawData.anggaranList.length === 0))) {
          finalAnggaran = [];
        } else {
          const chunkedAnggaran = await loadAnggaranChunks(rawData.anggaranChunkCount);
          if (chunkedAnggaran.length > 0) {
            finalAnggaran = chunkedAnggaran;
          } else if (rawData.anggaranChunkCount && rawData.anggaranChunkCount > 1) {
            isAnggaranComplete = false;
          }
        }
      } catch (e) {
        if (isQuotaError(e)) {
          await markFirestoreQuotaExceeded();
        }
        if (rawData.anggaranChunkCount && rawData.anggaranChunkCount > 1) {
          isAnggaranComplete = false;
        }
        console.warn('Error loading anggaran chunks in fetchOnce:', e);
      }

      const sanitizedPrograms = Array.isArray(rawData.programs)
        ? rawData.programs.map(p => ({
            ...p,
            kodeProgram: cleanBudgetCode(p.kodeProgram)
          }))
        : rawData.programs;

      const sanitizedKegiatan = Array.isArray(rawData.kegiatanList)
        ? rawData.kegiatanList.map(k => ({
            ...k,
            kodeProgram: cleanBudgetCode(k.kodeProgram),
            kodeKegiatan: cleanBudgetCode(k.kodeKegiatan)
          }))
        : rawData.kegiatanList;

      const sanitizedSub = Array.isArray(rawData.subKegiatanList)
        ? rawData.subKegiatanList.map(s => ({
            ...s,
            kodeProgram: cleanBudgetCode(s.kodeProgram),
            kodeKegiatan: cleanBudgetCode(s.kodeKegiatan),
            kodeSub: cleanBudgetCode(s.kodeSub)
          }))
        : rawData.subKegiatanList;

      const sanitizedRealisasi = finalRealisasi.map(r => ({
        ...r,
        kodeProgram: cleanBudgetCode(r.kodeProgram),
        kodeKegiatan: cleanBudgetCode(r.kodeKegiatan),
        kodeSub: cleanBudgetCode(r.kodeSub),
        kodeBelanja: extractCode(r.kodeBelanja),
        tanggal: cleanDateValue(r.tanggal),
        noSPM: cleanDateValue(r.noSPM) || r.noSPM
      }));

      const sanitizedAnggaran = finalAnggaran.map(a => ({
        ...a,
        kodeProgram: cleanBudgetCode(a.kodeProgram),
        kodeKegiatan: cleanBudgetCode(a.kodeKegiatan),
        kodeSub: cleanBudgetCode(a.kodeSub),
        kodeBelanja: extractCode(a.kodeBelanja)
      }));

      const returnData: any = {
        ...rawData,
        programs: sanitizedPrograms,
        kegiatanList: sanitizedKegiatan,
        subKegiatanList: sanitizedSub
      };

      if (isRealisasiComplete) {
        returnData.realisasiList = sanitizedRealisasi;
      }
      if (isAnggaranComplete) {
        returnData.anggaranList = sanitizedAnggaran;
      }

      return returnData;
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
      dataToSave.realisasiList = realisasiItems.slice(0, 150);

      const realFp = computeItemsFingerprint(realisasiItems);
      const isRealisasiUnchanged = realFp === lastSavedRealisasiFingerprint && realisasiItems.length > 0;

      if (!isRealisasiUnchanged) {
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
          lastSavedRealisasiFingerprint = realFp;
          cachedRealisasiList = realisasiItems;

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
          lastSavedRealisasiFingerprint = '0_empty';
          cachedRealisasiList = [];
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
    }

    // 2. Handle anggaranList chunking
    if (data.anggaranList !== undefined && Array.isArray(data.anggaranList)) {
      const anggaranItems = data.anggaranList;
      const numChunks = Math.ceil(anggaranItems.length / CHUNK_SIZE);
      dataToSave.anggaranCount = anggaranItems.length;
      dataToSave.anggaranChunkCount = numChunks;
      dataToSave.anggaranList = anggaranItems.slice(0, 150);

      const angFp = computeItemsFingerprint(anggaranItems);
      const isAnggaranUnchanged = angFp === lastSavedAnggaranFingerprint && anggaranItems.length > 0;

      if (!isAnggaranUnchanged) {
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
          lastSavedAnggaranFingerprint = angFp;
          cachedAnggaranList = anggaranItems;

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
          lastSavedAnggaranFingerprint = '0_empty';
          cachedAnggaranList = [];
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

export const CONFIG_DOC_ID = 'sheet_config';

/**
 * Saves and broadcasts Google Sheet / Apps Script WebApp configuration instantly
 * across all connected devices in realtime without touching bulky data chunks.
 */
export const saveSheetConfigToFirestore = async (
  sheetConfig: any,
  userIdentifier: string = 'System'
): Promise<void> => {
  if (getIsFirestoreQuotaExceeded()) return;

  const nowIso = new Date().toISOString();
  const cleanConfig = {
    ...sheetConfig,
    updatedAt: nowIso,
    lastUpdatedBy: userIdentifier
  };

  const tasks: Promise<any>[] = [];

  // 1. Update the dedicated fast configuration document
  const cfgDocRef = doc(db, SHARED_DATA_COLLECTION, CONFIG_DOC_ID);
  tasks.push(
    setDoc(cfgDocRef, cleanConfig, { merge: true })
  );

  // 2. Also merge into the main application state document for complete backward compatibility
  const mainDocRef = doc(db, SHARED_DATA_COLLECTION, SHARED_DATA_DOC_ID);
  tasks.push(
    setDoc(
      mainDocRef,
      {
        sheetConfig: cleanConfig,
        updatedAt: nowIso,
        updatedBy: userIdentifier
      },
      { merge: true }
    )
  );

  try {
    await Promise.all(tasks);
  } catch (error) {
    if (isQuotaError(error)) {
      await markFirestoreQuotaExceeded();
    }
    console.warn('Could not save sheetConfig to Firestore:', error);
    throw error;
  }
};

/**
 * Real-time fast listener specifically for Google Sheet / Apps Script WebApp URL changes.
 * Propagates URL and connection changes to all connected devices in < 100ms.
 */
export const subscribeToSheetConfig = (
  onConfig: (cfg: any) => void,
  onError?: (err: any) => void
) => {
  const cfgDocRef = doc(db, SHARED_DATA_COLLECTION, CONFIG_DOC_ID);
  return onSnapshot(
    cfgDocRef,
    snapshot => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && (data.webAppUrl || data.spreadsheetId)) {
          onConfig(data);
        }
      }
    },
    error => {
      if (onError) onError(error);
    }
  );
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



