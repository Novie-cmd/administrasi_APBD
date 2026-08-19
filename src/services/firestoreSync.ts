import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

export const SHARED_DATA_COLLECTION = 'bfms_shared_state';
export const SHARED_DATA_DOC_ID = 'app_data_v1';

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
  updatedAt?: string;
  updatedBy?: string;
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
    snapshot => {
      if (snapshot.exists()) {
        onData(snapshot.data() as FirestoreAppData);
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
      return snap.data() as FirestoreAppData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching Firestore shared data:', error);
    return null;
  }
};

/**
 * Saves or updates shared state to Firestore.
 */
export const saveSharedDataToFirestore = async (
  data: Partial<FirestoreAppData>,
  userIdentifier: string = 'System'
) => {
  try {
    const docRef = doc(db, SHARED_DATA_COLLECTION, SHARED_DATA_DOC_ID);
    await setDoc(
      docRef,
      {
        ...data,
        updatedAt: new Date().toISOString(),
        updatedBy: userIdentifier
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error saving shared data to Firestore:', error);
    throw error;
  }
};
