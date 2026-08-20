import { db } from '../lib/firebase';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  collection,
  getDocs
} from 'firebase/firestore';

export const SHARED_DATA_COLLECTION = 'bfms_shared_state';
export const SHARED_DATA_DOC_ID = 'app_data_v1';
export const REALISASI_CHUNKS_COLLECTION = 'bfms_realisasi_chunks';
export const ANGGARAN_CHUNKS_COLLECTION = 'bfms_anggaran_chunks';

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
  realisasiCount?: number;
  anggaranCount?: number;
  realisasiChunkCount?: number;
  anggaranChunkCount?: number;
  updatedAt?: string;
  updatedBy?: string;
}

/**
 * Loads all realisasi chunks from Firestore using collection query with fallback.
 */
async function loadRealisasiChunks(chunkCount?: number): Promise<any[]> {
  const allRealisasi: any[] = [];

  // Strategy 1: Load from dedicated subcollection / collection
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
    console.warn('Strategy 1 chunk load failed, trying Strategy 2:', e);
  }

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
    console.warn('Strategy 1 anggaran chunk load failed, trying Strategy 2:', e);
  }

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
  const docRef = doc(db, SHARED_DATA_COLLECTION, SHARED_DATA_DOC_ID);
  return onSnapshot(
    docRef,
    async snapshot => {
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
          console.error('Error loading realisasi chunks in listener:', e);
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
          console.error('Error loading anggaran chunks in listener:', e);
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
        console.error('Error loading realisasi chunks in fetchOnce:', e);
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
        console.error('Error loading anggaran chunks in fetchOnce:', e);
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

/**
 * Saves or updates shared state to Firestore with automated dual-layer chunking and redundancy.
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
    if (data.realisasiList && Array.isArray(data.realisasiList) && data.realisasiList.length > 0) {
      const realisasiItems = data.realisasiList;
      const numChunks = Math.ceil(realisasiItems.length / CHUNK_SIZE);
      dataToSave.realisasiCount = realisasiItems.length;
      dataToSave.realisasiChunkCount = numChunks;

      const chunkPromises = [];
      for (let i = 0; i < numChunks; i++) {
        const chunkSlice = realisasiItems.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        
        // Save to dedicated collection
        const colDocRef = doc(db, REALISASI_CHUNKS_COLLECTION, `chunk_${i}`);
        chunkPromises.push(
          setDoc(colDocRef, {
            chunkIndex: i,
            totalChunks: numChunks,
            items: chunkSlice,
            updatedAt: nowIso
          })
        );

        // Also save to shared state collection doc for backward compatibility
        const sharedChunkRef = doc(db, SHARED_DATA_COLLECTION, `${REALISASI_CHUNK_PREFIX}${i}`);
        chunkPromises.push(
          setDoc(sharedChunkRef, {
            chunkIndex: i,
            totalChunks: numChunks,
            items: chunkSlice,
            updatedAt: nowIso
          })
        );
      }

      // Clean up obsolete chunks up to 30 chunks
      for (let i = numChunks; i < numChunks + 10; i++) {
        const oldColRef = doc(db, REALISASI_CHUNKS_COLLECTION, `chunk_${i}`);
        const oldSharedRef = doc(db, SHARED_DATA_COLLECTION, `${REALISASI_CHUNK_PREFIX}${i}`);
        chunkPromises.push(deleteDoc(oldColRef).catch(() => {}));
        chunkPromises.push(deleteDoc(oldSharedRef).catch(() => {}));
      }

      await Promise.all(chunkPromises);

      // Keep safe array on main doc (Firestore allows up to 1MB per doc)
      const jsonStr = JSON.stringify(realisasiItems);
      dataToSave.realisasiList = jsonStr.length < 700000 ? realisasiItems : realisasiItems.slice(0, 300);
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

        const sharedChunkRef = doc(db, SHARED_DATA_COLLECTION, `${ANGGARAN_CHUNK_PREFIX}${i}`);
        chunkPromises.push(
          setDoc(sharedChunkRef, {
            chunkIndex: i,
            totalChunks: numChunks,
            items: chunkSlice,
            updatedAt: nowIso
          })
        );
      }

      for (let i = numChunks; i < numChunks + 10; i++) {
        const oldColRef = doc(db, ANGGARAN_CHUNKS_COLLECTION, `chunk_${i}`);
        const oldSharedRef = doc(db, SHARED_DATA_COLLECTION, `${ANGGARAN_CHUNK_PREFIX}${i}`);
        chunkPromises.push(deleteDoc(oldColRef).catch(() => {}));
        chunkPromises.push(deleteDoc(oldSharedRef).catch(() => {}));
      }

      await Promise.all(chunkPromises);
      
      const jsonStr = JSON.stringify(anggaranItems);
      dataToSave.anggaranList = jsonStr.length < 700000 ? anggaranItems : anggaranItems.slice(0, 300);
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


