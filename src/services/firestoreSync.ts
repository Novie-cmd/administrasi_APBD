import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

export const SHARED_DATA_COLLECTION = 'bfms_shared_state';
export const SHARED_DATA_DOC_ID = 'app_data_v1';
const REALISASI_CHUNK_PREFIX = 'realisasi_chunk_';
const ANGGARAN_CHUNK_PREFIX = 'anggaran_chunk_';
const CHUNK_SIZE = 100; // 100 records per document to stay safely under Firestore 1MB limit

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
  realisasiChunkCount?: number;
  anggaranChunkCount?: number;
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * Loads all realisasi chunks from Firestore.
 */
async function loadRealisasiChunks(chunkCount: number): Promise<any[]> {
  const allRealisasi: any[] = [];
  const chunkPromises = [];
  for (let i = 0; i < chunkCount; i++) {
    const chunkDocRef = doc(db, SHARED_DATA_COLLECTION, `${REALISASI_CHUNK_PREFIX}${i}`);
    chunkPromises.push(getDoc(chunkDocRef));
  }

  const chunkSnapshots = await Promise.all(chunkPromises);
  chunkSnapshots.forEach(snap => {
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.items)) {
        allRealisasi.push(...data.items);
      }
    }
  });

  return allRealisasi;
}

/**
 * Loads all anggaran chunks from Firestore.
 */
async function loadAnggaranChunks(chunkCount: number): Promise<any[]> {
  const allAnggaran: any[] = [];
  const chunkPromises = [];
  for (let i = 0; i < chunkCount; i++) {
    const chunkDocRef = doc(db, SHARED_DATA_COLLECTION, `${ANGGARAN_CHUNK_PREFIX}${i}`);
    chunkPromises.push(getDoc(chunkDocRef));
  }

  const chunkSnapshots = await Promise.all(chunkPromises);
  chunkSnapshots.forEach(snap => {
    if (snap.exists()) {
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
  const docRef = doc(db, SHARED_DATA_COLLECTION, SHARED_DATA_DOC_ID);
  return onSnapshot(
    docRef,
    async snapshot => {
      if (snapshot.exists()) {
        const rawData = snapshot.data() as FirestoreAppData;
        let finalRealisasi = rawData.realisasiList;
        let finalAnggaran = rawData.anggaranList;

        // If realisasi is chunked across multiple documents
        if (rawData.realisasiChunkCount && rawData.realisasiChunkCount > 0) {
          try {
            const chunkedItems = await loadRealisasiChunks(rawData.realisasiChunkCount);
            if (chunkedItems.length > 0) {
              finalRealisasi = chunkedItems;
            }
          } catch (e) {
            console.error('Error loading realisasi chunks in listener:', e);
          }
        }

        // If anggaran is chunked across multiple documents
        if (rawData.anggaranChunkCount && rawData.anggaranChunkCount > 0) {
          try {
            const chunkedAnggaran = await loadAnggaranChunks(rawData.anggaranChunkCount);
            if (chunkedAnggaran.length > 0) {
              finalAnggaran = chunkedAnggaran;
            }
          } catch (e) {
            console.error('Error loading anggaran chunks in listener:', e);
          }
        }

        onData({
          ...rawData,
          realisasiList: finalRealisasi,
          anggaranList: finalAnggaran
        });
      }
    },
    error => {
      console.error('Firestore subscription error:', error);
      if (onError) onError(error);
    }
  );
};

/**
 * Fetches the shared state once from Firestore.
 */
export const fetchSharedDataOnce = async (): Promise<FirestoreAppData | null> => {
  try {
    const docRef = doc(db, SHARED_DATA_COLLECTION, SHARED_DATA_DOC_ID);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const rawData = snap.data() as FirestoreAppData;
      let finalRealisasi = rawData.realisasiList;
      let finalAnggaran = rawData.anggaranList;

      if (rawData.realisasiChunkCount && rawData.realisasiChunkCount > 0) {
        try {
          const chunkedItems = await loadRealisasiChunks(rawData.realisasiChunkCount);
          if (chunkedItems.length > 0) {
            finalRealisasi = chunkedItems;
          }
        } catch (e) {
          console.error('Error loading realisasi chunks:', e);
        }
      }

      if (rawData.anggaranChunkCount && rawData.anggaranChunkCount > 0) {
        try {
          const chunkedAnggaran = await loadAnggaranChunks(rawData.anggaranChunkCount);
          if (chunkedAnggaran.length > 0) {
            finalAnggaran = chunkedAnggaran;
          }
        } catch (e) {
          console.error('Error loading anggaran chunks:', e);
        }
      }

      return {
        ...rawData,
        realisasiList: finalRealisasi,
        anggaranList: finalAnggaran
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching Firestore shared data:', error);
    return null;
  }
};

let previousRealisasiChunkCount = 0;
let previousAnggaranChunkCount = 0;

/**
 * Saves or updates shared state to Firestore with automated chunking for large datasets.
 */
export const saveSharedDataToFirestore = async (
  data: Partial<FirestoreAppData>,
  userIdentifier: string = 'System'
) => {
  try {
    const nowIso = new Date().toISOString();
    const docRef = doc(db, SHARED_DATA_COLLECTION, SHARED_DATA_DOC_ID);

    const dataToSave: any = { ...data };

    // 1. Handle realisasiList chunking
    if (data.realisasiList && Array.isArray(data.realisasiList)) {
      const realisasiItems = data.realisasiList;
      const numChunks = Math.ceil(realisasiItems.length / CHUNK_SIZE);
      dataToSave.realisasiChunkCount = numChunks;

      // Save new chunks
      const chunkPromises = [];
      for (let i = 0; i < numChunks; i++) {
        const chunkSlice = realisasiItems.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const chunkDocRef = doc(db, SHARED_DATA_COLLECTION, `${REALISASI_CHUNK_PREFIX}${i}`);
        chunkPromises.push(
          setDoc(chunkDocRef, {
            chunkIndex: i,
            totalChunks: numChunks,
            items: chunkSlice,
            updatedAt: nowIso
          })
        );
      }

      // Clean up any obsolete old chunks if total chunk count decreased
      if (previousRealisasiChunkCount > numChunks) {
        for (let i = numChunks; i < previousRealisasiChunkCount; i++) {
          const oldDocRef = doc(db, SHARED_DATA_COLLECTION, `${REALISASI_CHUNK_PREFIX}${i}`);
          chunkPromises.push(deleteDoc(oldDocRef).catch(() => {}));
        }
      }
      previousRealisasiChunkCount = numChunks;

      await Promise.all(chunkPromises);

      // Keep empty array on main doc so it clears obsolete monolithic arrays
      dataToSave.realisasiList = [];
    }

    // 2. Handle anggaranList chunking
    if (data.anggaranList && Array.isArray(data.anggaranList) && data.anggaranList.length > 50) {
      const anggaranItems = data.anggaranList;
      const numChunks = Math.ceil(anggaranItems.length / CHUNK_SIZE);
      dataToSave.anggaranChunkCount = numChunks;

      const chunkPromises = [];
      for (let i = 0; i < numChunks; i++) {
        const chunkSlice = anggaranItems.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        const chunkDocRef = doc(db, SHARED_DATA_COLLECTION, `${ANGGARAN_CHUNK_PREFIX}${i}`);
        chunkPromises.push(
          setDoc(chunkDocRef, {
            chunkIndex: i,
            totalChunks: numChunks,
            items: chunkSlice,
            updatedAt: nowIso
          })
        );
      }

      if (previousAnggaranChunkCount > numChunks) {
        for (let i = numChunks; i < previousAnggaranChunkCount; i++) {
          const oldDocRef = doc(db, SHARED_DATA_COLLECTION, `${ANGGARAN_CHUNK_PREFIX}${i}`);
          chunkPromises.push(deleteDoc(oldDocRef).catch(() => {}));
        }
      }
      previousAnggaranChunkCount = numChunks;

      await Promise.all(chunkPromises);
      dataToSave.anggaranList = [];
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
    console.error('Error saving shared data to Firestore:', error);
    throw error;
  }
};

