import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { extractCode, isCodeEqual, parseExcelDate, makeRealisasiCompositeKey } from '../utils/codeUtils';
import {
  User,
  UserRole,
  TahunAnggaran,
  OPD,
  Program,
  Kegiatan,
  SubKegiatan,
  Belanja,
  SumberDana,
  Rekanan,
  Anggaran,
  Realisasi,
  ImportLog,
  ActivityLog,
  SystemNotification,
  FilterState,
  GoogleSheetConfig,
  CloudSyncStatus
} from '../types';
import {
  subscribeToSharedData,
  saveSharedDataToFirestore,
  fetchSharedDataOnce
} from '../services/firestoreSync';
import {

  INITIAL_USERS,
  INITIAL_TAHUN,
  INITIAL_OPD,
  INITIAL_PROGRAMS,
  INITIAL_KEGIATAN,
  INITIAL_SUBKEGIATAN,
  INITIAL_BELANJA,
  INITIAL_SUMBER_DANA,
  INITIAL_REKANAN,
  INITIAL_ANGGARAN,
  INITIAL_REALISASI,
  INITIAL_IMPORT_LOGS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_SHEET_CONFIG
} from '../data/initialData';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchRole: (role: UserRole) => void;
  users: User[];
  
  selectedTahun: number;
  setSelectedTahun: (tahun: number) => void;
  tahunList: TahunAnggaran[];
  
  opd: OPD;
  opdList: OPD[];
  programs: Program[];
  kegiatanList: Kegiatan[];
  subKegiatanList: SubKegiatan[];
  belanjaList: Belanja[];
  sumberDanaList: SumberDana[];
  rekananList: Rekanan[];
  
  anggaranList: Anggaran[];
  realisasiList: Realisasi[];
  importLogs: ImportLog[];
  activityLogs: ActivityLog[];
  notifications: SystemNotification[];
  
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  
  sheetConfig: GoogleSheetConfig;
  setSheetConfig: React.Dispatch<React.SetStateAction<GoogleSheetConfig>>;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  syncWithSpreadsheet: () => Promise<void>;
  
  // Cloud Real-Time Firebase Sync
  cloudSync: CloudSyncStatus;
  forceSyncCloud: () => Promise<void>;
  
  // Actions
  addAnggaran: (anggaran: Omit<Anggaran, 'id' | 'paguAkhir' | 'tanggalInput'>) => void;
  updateAnggaran: (id: string, updated: Partial<Anggaran>) => void;
  deleteAnggaran: (id: string) => void;
  clearAnggaranDatabase: (tahun?: number) => void;
  importAnggaranBatch: (
    items: {
      tahun: number;
      kodeProgram: string;
      kodeKegiatan: string;
      kodeSub: string;
      kodeBelanja: string;
      namaBelanja?: string;
      pagu: number;
      revisi?: number;
      nilaiSPD?: number;
      sumberDana?: string;
    }[],
    fileName?: string,
    overwriteExisting?: boolean
  ) => { successCount: number; duplicateCount: number; errors: string[] };
  
  addRealisasi: (realisasi: Omit<Realisasi, 'id'>) => void;
  updateRealisasi: (id: string, updated: Partial<Realisasi>) => void;
  deleteRealisasi: (id: string) => void;
  clearRealisasiDatabase: (tahun?: number) => void;
  approveRealisasiPPK: (id: string, approved: boolean, catatan?: string) => void;
  
  batchImportExcel: (
    importedRows: {
      tahun: number;
      kodeProgram: string;
      kodeKegiatan: string;
      kodeSub: string;
      kodeBelanja: string;
      namaBelanja: string;
      sp2d: string;
      spm?: string;
      nilai: number;
      uraian: string;
      rekanan: string;
      tanggal: string;
    }[],
    fileName: string,
    overwriteExisting?: boolean
  ) => { successCount: number; duplicateCount: number; errors: string[] };

  // Master Data CRUD
  addTahun: (t: TahunAnggaran) => void;
  updateTahun: (id: string, updated: Partial<TahunAnggaran>) => void;
  deleteTahun: (id: string) => void;
  addProgram: (prog: Program) => void;
  updateProgram: (oldKode: string, oldTahun: number, updated: Partial<Program>) => void;
  deleteProgram: (kodeProgram: string, tahun: number) => void;
  clearProgramDatabase: (tahun?: number) => void;
  addKegiatan: (keg: Kegiatan) => void;
  updateKegiatan: (oldKode: string, oldTahun: number, updated: Partial<Kegiatan>) => void;
  deleteKegiatan: (kodeKegiatan: string, tahun: number) => void;
  clearKegiatanDatabase: (tahun?: number) => void;
  addSubKegiatan: (sub: SubKegiatan) => void;
  updateSubKegiatan: (oldKode: string, oldTahun: number, updated: Partial<SubKegiatan>) => void;
  deleteSubKegiatan: (kodeSub: string, tahun: number) => void;
  clearSubKegiatanDatabase: (tahun?: number) => void;
  addBelanja: (bel: Belanja) => void;
  updateBelanja: (oldKode: string, oldTahun: number, updated: Partial<Belanja>) => void;
  deleteBelanja: (kodeBelanja: string, tahun?: number) => void;
  clearBelanjaDatabase: (tahun?: number) => void;
  importProgramsBatch: (items: Program[]) => { successCount: number; duplicateCount: number };
  importKegiatanBatch: (items: Kegiatan[]) => { successCount: number; duplicateCount: number };
  importSubKegiatanBatch: (items: SubKegiatan[]) => { successCount: number; duplicateCount: number };
  importBelanjaBatch: (items: Belanja[]) => { successCount: number; duplicateCount: number };
  addSumberDana: (sd: Omit<SumberDana, 'id'>) => void;
  updateSumberDana: (id: string, updated: Partial<SumberDana>) => void;
  deleteSumberDana: (id: string) => void;
  clearSumberDanaDatabase: () => void;
  addRekanan: (rek: Omit<Rekanan, 'id'>) => void;
  updateRekanan: (id: string, updated: Partial<Rekanan>) => void;
  deleteRekanan: (id: string) => void;
  clearRekananDatabase: () => void;
  addOpd: (newOpd: OPD) => void;
  updateOpd: (idOrKode: string, updated: Partial<OPD>) => void;
  deleteOpd: (idOrKode: string) => void;
  importOpdLogo: (idOrKode: string, logoUrl: string) => void;
  
  // User Management
  addUser: (user: Omit<User, 'id' | 'lastLogin'>) => void;
  updateUserStatus: (id: string, status: 'Aktif' | 'Nonaktif') => void;
  updateUser: (id: string, updated: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Audit Logs
  logActivity: (aktivitas: string) => void;
  deleteActivityLog: (id: string) => void;
  clearAllActivityLogs: () => void;
  resetAllData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'BFMS_NTB_STORE_V1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load initial or local stored data
  const loadStoredData = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (err) {
      console.error('Failed to load local storage:', err);
    }
    return null;
  };

  const storedData = loadStoredData();

  const [currentUser, setCurrentUser] = useState<User>(
    storedData?.currentUser || INITIAL_USERS[0]
  );
  const [users, setUsers] = useState<User[]>(
    storedData?.users || INITIAL_USERS
  );
  const [selectedTahun, setSelectedTahun] = useState<number>(
    storedData?.selectedTahun || 2025
  );
  const [tahunList, setTahunList] = useState<TahunAnggaran[]>(
    storedData?.tahunList || INITIAL_TAHUN
  );
  const [opdList, setOpdList] = useState<OPD[]>(
    storedData?.opdList || (storedData?.opd ? [storedData.opd] : [INITIAL_OPD])
  );
  const opd = opdList[0] || INITIAL_OPD;
  const [programs, setPrograms] = useState<Program[]>(
    storedData?.programs || INITIAL_PROGRAMS
  );
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>(
    storedData?.kegiatanList || INITIAL_KEGIATAN
  );
  const [subKegiatanList, setSubKegiatanList] = useState<SubKegiatan[]>(
    storedData?.subKegiatanList || INITIAL_SUBKEGIATAN
  );
  const [belanjaList, setBelanjaList] = useState<Belanja[]>(
    storedData?.belanjaList || INITIAL_BELANJA
  );
  const [sumberDanaList, setSumberDanaList] = useState<SumberDana[]>(
    storedData?.sumberDanaList || INITIAL_SUMBER_DANA
  );
  const [rekananList, setRekananList] = useState<Rekanan[]>(
    storedData?.rekananList || INITIAL_REKANAN
  );
  const [anggaranList, setAnggaranList] = useState<Anggaran[]>(
    storedData?.anggaranList || INITIAL_ANGGARAN
  );
  const [realisasiList, setRealisasiList] = useState<Realisasi[]>(
    storedData?.realisasiList || INITIAL_REALISASI
  );
  const [importLogs, setImportLogs] = useState<ImportLog[]>(
    storedData?.importLogs || INITIAL_IMPORT_LOGS
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(
    storedData?.activityLogs || INITIAL_ACTIVITY_LOGS
  );
  const [sheetConfig, setSheetConfig] = useState<GoogleSheetConfig>(
    storedData?.sheetConfig || INITIAL_SHEET_CONFIG
  );
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  // Cloud Real-Time Firebase Sync State
  const [cloudSync, setCloudSync] = useState<CloudSyncStatus>({
    status: 'connected',
    lastSyncedAt: new Date().toISOString()
  });

  // Ref to prevent circular updates between Firestore listener and local state
  const isApplyingRemoteChange = useRef(false);
  const isInitialCloudLoad = useRef(true);

  // 1. Subscribe to Firestore Real-Time Updates
  useEffect(() => {
    const unsubscribe = subscribeToSharedData(
      remoteData => {
        if (!remoteData) return;
        isApplyingRemoteChange.current = true;

        if (remoteData.users && Array.isArray(remoteData.users)) {
          setUsers(remoteData.users);
        }
        if (remoteData.selectedTahun) {
          setSelectedTahun(remoteData.selectedTahun);
        }
        if (remoteData.tahunList && Array.isArray(remoteData.tahunList)) {
          setTahunList(remoteData.tahunList);
        }
        if (remoteData.opdList && Array.isArray(remoteData.opdList)) {
          setOpdList(remoteData.opdList);
        }
        if (remoteData.programs && Array.isArray(remoteData.programs)) {
          setPrograms(remoteData.programs);
        }
        if (remoteData.kegiatanList && Array.isArray(remoteData.kegiatanList)) {
          setKegiatanList(remoteData.kegiatanList);
        }
        if (remoteData.subKegiatanList && Array.isArray(remoteData.subKegiatanList)) {
          setSubKegiatanList(remoteData.subKegiatanList);
        }
        if (remoteData.belanjaList && Array.isArray(remoteData.belanjaList)) {
          setBelanjaList(remoteData.belanjaList);
        }
        if (remoteData.sumberDanaList && Array.isArray(remoteData.sumberDanaList)) {
          setSumberDanaList(remoteData.sumberDanaList);
        }
        if (remoteData.rekananList && Array.isArray(remoteData.rekananList)) {
          setRekananList(remoteData.rekananList);
        }
        if (remoteData.anggaranList && Array.isArray(remoteData.anggaranList)) {
          setAnggaranList(remoteData.anggaranList);
        }
        if (remoteData.realisasiList && Array.isArray(remoteData.realisasiList)) {
          setRealisasiList(remoteData.realisasiList);
        }
        if (remoteData.importLogs && Array.isArray(remoteData.importLogs)) {
          setImportLogs(remoteData.importLogs);
        }
        if (remoteData.activityLogs && Array.isArray(remoteData.activityLogs)) {
          setActivityLogs(remoteData.activityLogs);
        }
        if (remoteData.sheetConfig) {
          setSheetConfig(remoteData.sheetConfig);
        }

        setCloudSync({
          status: 'connected',
          lastSyncedAt: remoteData.updatedAt || new Date().toISOString(),
          lastUpdatedBy: remoteData.updatedBy || 'Cloud Sync'
        });

        setTimeout(() => {
          isApplyingRemoteChange.current = false;
        }, 100);
      },
      err => {
        console.warn('Cloud sync offline or error:', err);
        setCloudSync(prev => ({ ...prev, status: 'error' }));
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Initial cloud state check or bootstrap initial data to Firestore
  useEffect(() => {
    const bootstrapFirestore = async () => {
      try {
        const existingData = await fetchSharedDataOnce();
        if (!existingData) {
          // Cloud is empty, push initial dataset
          await saveSharedDataToFirestore(
            {
              users,
              selectedTahun,
              tahunList,
              opdList,
              programs,
              kegiatanList,
              subKegiatanList,
              belanjaList,
              sumberDanaList,
              rekananList,
              anggaranList,
              realisasiList,
              importLogs,
              activityLogs,
              sheetConfig
            },
            'Initial Seed'
          );
        }
      } catch (err) {
        console.warn('Initial cloud seed skipped/cached:', err);
      } finally {
        isInitialCloudLoad.current = false;
      }
    };
    bootstrapFirestore();
  }, []);

  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    tahun: selectedTahun,
    kodeProgram: 'all',
    kodeKegiatan: 'all',
    kodeSub: 'all',
    kodeBelanja: 'all',
    bulan: 'all',
    triwulan: 'all',
    semester: 'all',
    searchQuery: ''
  });

  // Keep filter.tahun synced when selectedTahun changes
  useEffect(() => {
    setFilters(prev => ({ ...prev, tahun: selectedTahun }));
  }, [selectedTahun]);

  // Save to localStorage AND Sync to Cloud Firestore when local data changes
  useEffect(() => {
    const dataToStore = {
      currentUser,
      users,
      selectedTahun,
      tahunList,
      opd,
      opdList,
      programs,
      kegiatanList,
      subKegiatanList,
      belanjaList,
      sumberDanaList,
      rekananList,
      anggaranList,
      realisasiList,
      importLogs,
      activityLogs,
      sheetConfig
    };

    // Save to local cache
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (e) {
      console.error('Error writing to localStorage:', e);
    }

    // Sync to Cloud Firestore if change originated locally (not from remote listener)
    if (!isApplyingRemoteChange.current && !isInitialCloudLoad.current) {
      setCloudSync(prev => ({ ...prev, status: 'syncing' }));
      const timeoutId = setTimeout(() => {
        saveSharedDataToFirestore(
          {
            users,
            selectedTahun,
            tahunList,
            opdList,
            programs,
            kegiatanList,
            subKegiatanList,
            belanjaList,
            sumberDanaList,
            rekananList,
            anggaranList,
            realisasiList,
            importLogs,
            activityLogs,
            sheetConfig
          },
          currentUser.nama || currentUser.username
        )
          .then(() => {
            setCloudSync({
              status: 'connected',
              lastSyncedAt: new Date().toISOString(),
              lastUpdatedBy: currentUser.nama
            });
          })
          .catch(err => {
            console.error('Failed to sync to Cloud Firestore:', err);
            setCloudSync(prev => ({ ...prev, status: 'error' }));
          });
      }, 500); // 500ms debounce to batch rapid edits

      return () => clearTimeout(timeoutId);
    }
  }, [
    currentUser,
    users,
    selectedTahun,
    tahunList,
    opd,
    opdList,
    programs,
    kegiatanList,
    subKegiatanList,
    belanjaList,
    sumberDanaList,
    rekananList,
    anggaranList,
    realisasiList,
    importLogs,
    activityLogs,
    sheetConfig
  ]);

  // Force manual cloud sync trigger
  const forceSyncCloud = async () => {
    setCloudSync(prev => ({ ...prev, status: 'syncing' }));
    try {
      await saveSharedDataToFirestore(
        {
          users,
          selectedTahun,
          tahunList,
          opdList,
          programs,
          kegiatanList,
          subKegiatanList,
          belanjaList,
          sumberDanaList,
          rekananList,
          anggaranList,
          realisasiList,
          importLogs,
          activityLogs,
          sheetConfig
        },
        `${currentUser.nama} (Manual Sync)`
      );
      setCloudSync({
        status: 'connected',
        lastSyncedAt: new Date().toISOString(),
        lastUpdatedBy: currentUser.nama
      });
      logActivity(`Sinkronisasi Database Cloud (Firebase) manual berhasil`);
    } catch (err) {
      setCloudSync(prev => ({ ...prev, status: 'error' }));
      throw err;
    }
  };

  // Log activity helper
  const logActivity = (aktivitas: string) => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];
    const newLog: ActivityLog = {
      id: `LOG-${Date.now()}`,
      tanggal: dateStr,
      jam: timeStr,
      user: currentUser.username,
      role: currentUser.role,
      aktivitas,
      ip: '180.251.12.89 (NTB Govt Net)',
      browser: 'BFMS Web Portal v2.5'
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  // Switch role function
  const switchRole = (role: UserRole) => {
    const targetUser = users.find(u => u.role === role) || {
      id: `USR-${Date.now()}`,
      nama: `User ${role}`,
      username: role.toLowerCase().replace(/\s+/g, '_'),
      role: role,
      status: 'Aktif',
      lastLogin: new Date().toISOString()
    };
    setCurrentUser(targetUser);
    logActivity(`Beralih peran (Role Switch) ke: ${role}`);
  };

  // Compute Notifications dynamically based on actual budget & realisasi state
  const notifications: SystemNotification[] = React.useMemo(() => {
    const notifs: SystemNotification[] = [];

    // Filter budget and realisasi for selected year
    const currentAnggaran = anggaranList.filter(a => Number(a.tahun) === Number(selectedTahun));
    const currentRealisasi = realisasiList.filter(r => Number(r.tahun) === Number(selectedTahun));

    // 1. Check if any budget items have 0 realization
    currentAnggaran.forEach(ang => {
      const realForAng = currentRealisasi
        .filter(r => r.kodeBelanja === ang.kodeBelanja && r.kodeSub === ang.kodeSub)
        .reduce((sum, r) => sum + r.nilai, 0);

      if (realForAng === 0) {
        notifs.push({
          id: `NOTIF-ZERO-${ang.id}`,
          type: 'warning',
          title: 'Belanja belum direalisasikan',
          message: `Kode Belanja ${ang.kodeBelanja} (${ang.namaBelanja}) pagu Rp ${ang.paguAkhir.toLocaleString('id-ID')} belum ada realisasi.`,
          timestamp: 'Hari ini'
        });
      } else if (realForAng > ang.paguAkhir) {
        notifs.push({
          id: `NOTIF-EXCEED-${ang.id}`,
          type: 'error',
          title: 'Belanja Melewati Pagu!',
          message: `Realisasi ${ang.namaBelanja} (Rp ${realForAng.toLocaleString('id-ID')}) melebihi pagu akhir (Rp ${ang.paguAkhir.toLocaleString('id-ID')}).`,
          timestamp: 'Hari ini'
        });
      }
    });

    // 2. Check for duplicate SP2D
    const sp2dMap: { [key: string]: number } = {};
    currentRealisasi.forEach(r => {
      if (r.noSP2D) {
        sp2dMap[r.noSP2D] = (sp2dMap[r.noSP2D] || 0) + 1;
      }
    });

    Object.entries(sp2dMap).forEach(([sp2d, count]) => {
      if (count > 1) {
        notifs.push({
          id: `NOTIF-DUP-${sp2d}`,
          type: 'error',
          title: 'Nomor SP2D Ganda Terdeteksi!',
          message: `Nomor SP2D "${sp2d}" digunakan sebanyak ${count} kali. Periksa transaksi!`,
          timestamp: 'Sistem Alert'
        });
      }
    });

    // 3. Draft Realisasi waiting for PPK approval
    const pendingDrafts = currentRealisasi.filter(r => r.statusValidation === 'Draft');
    if (pendingDrafts.length > 0) {
      notifs.push({
        id: 'NOTIF-PENDING-PPK',
        type: 'info',
        title: 'Terdapat SPJ / Realisasi Belum Di-Approve PPK',
        message: `Ada ${pendingDrafts.length} transaksi realisasi membutuhkan persetujuan PPK.`,
        timestamp: 'Pending Action'
      });
    }

    return notifs;
  }, [anggaranList, realisasiList, selectedTahun]);

  // Actions
  const addAnggaran = (newAng: Omit<Anggaran, 'id' | 'paguAkhir' | 'tanggalInput'>) => {
    const id = `ANG-${selectedTahun}-${Date.now().toString().slice(-4)}`;
    const paguAkhir = newAng.pagu + newAng.revisi;
    const nilaiSPD = newAng.nilaiSPD !== undefined ? newAng.nilaiSPD : paguAkhir;
    const tanggalInput = new Date().toISOString().split('T')[0];
    const fullAnggaran: Anggaran = {
      ...newAng,
      id,
      nilaiSPD,
      paguAkhir,
      tanggalInput
    };

    setAnggaranList(prev => [fullAnggaran, ...prev]);
    logActivity(`Menambah Pagu Anggaran ${fullAnggaran.kodeBelanja}: Rp ${fullAnggaran.paguAkhir.toLocaleString('id-ID')}`);
  };

  const updateAnggaran = (id: string, updated: Partial<Anggaran>) => {
    setAnggaranList(prev =>
      prev.map(item => {
        if (item.id === id) {
          const pagu = updated.pagu !== undefined ? updated.pagu : item.pagu;
          const revisi = updated.revisi !== undefined ? updated.revisi : item.revisi;
          const nilaiSPD = updated.nilaiSPD !== undefined ? updated.nilaiSPD : (item.nilaiSPD !== undefined ? item.nilaiSPD : pagu + revisi);
          return {
            ...item,
            ...updated,
            pagu,
            revisi,
            nilaiSPD,
            paguAkhir: pagu + revisi
          };
        }
        return item;
      })
    );
    logActivity(`Mengubah Anggaran ID ${id}`);
  };

  const deleteAnggaran = (id: string) => {
    setAnggaranList(prev => prev.filter(a => a.id !== id));
    logActivity(`Menghapus data Anggaran ID ${id}`);
  };

  const clearAnggaranDatabase = (tahun?: number) => {
    if (tahun !== undefined && tahun !== null) {
      const targetTahun = Number(tahun);
      setAnggaranList(prev => prev.filter(a => Number(a.tahun) !== targetTahun));
      logActivity(`Kosongkan Database Pagu Anggaran TA ${targetTahun}`);
    } else {
      setAnggaranList([]);
      logActivity('Kosongkan Seluruh Database Pagu Anggaran');
    }
  };

  const importAnggaranBatch = (
    items: {
      tahun: number;
      kodeProgram: string;
      kodeKegiatan: string;
      kodeSub: string;
      kodeBelanja: string;
      namaBelanja?: string;
      pagu: number;
      revisi?: number;
      nilaiSPD?: number;
      sumberDana?: string;
    }[],
    fileName: string = 'Import_Anggaran_Pagu.xlsx',
    overwriteExisting: boolean = true
  ) => {
    let successCount = 0;
    let duplicateCount = 0;
    const errors: string[] = [];

    if (!items || items.length === 0) {
      return { successCount: 0, duplicateCount: 0, errors: ['File tidak berisi data anggaran yang valid.'] };
    }

    setAnggaranList(prev => {
      const targetYears = new Set(items.map(i => i.tahun || selectedTahun));

      let baseList = prev;
      if (overwriteExisting) {
        // Filter out existing data for the imported fiscal year(s) so total matches Excel exactly
        baseList = prev.filter(a => !targetYears.has(a.tahun));
      }

      const existingMap = new Map<string, Anggaran>();
      baseList.forEach(a => {
        const k = `${a.tahun}_${(a.kodeSub || '').trim().toLowerCase()}_${a.kodeBelanja.trim().toLowerCase()}`;
        existingMap.set(k, a);
      });

      const updatedList = [...baseList];

      items.forEach((row, idx) => {
        if (!row.kodeBelanja) return;
        const rowTahun = row.tahun || selectedTahun;
        const subKey = (row.kodeSub || '').trim().toLowerCase();
        const belKey = row.kodeBelanja.trim().toLowerCase();
        const compositeKey = `${rowTahun}_${subKey}_${belKey}`;

        const belObj = belanjaList.find(b => b.kodeBelanja.trim().toLowerCase() === belKey);
        const namaBelanja = row.namaBelanja || belObj?.namaBelanja || `Belanja ${row.kodeBelanja.trim()}`;
        const pagu = Number(row.pagu) || 0;
        const revisi = Number(row.revisi) || 0;
        const nilaiSPD = row.nilaiSPD !== undefined ? Number(row.nilaiSPD) : (pagu + revisi);

        if (!overwriteExisting && existingMap.has(compositeKey)) {
          duplicateCount++;
          successCount++;
          const existingItem = existingMap.get(compositeKey)!;
          const idxInArr = updatedList.findIndex(x => x.id === existingItem.id);
          if (idxInArr !== -1) {
            updatedList[idxInArr] = {
              ...existingItem,
              kodeProgram: row.kodeProgram || existingItem.kodeProgram,
              kodeKegiatan: row.kodeKegiatan || existingItem.kodeKegiatan,
              kodeSub: row.kodeSub || existingItem.kodeSub,
              pagu,
              revisi,
              nilaiSPD,
              paguAkhir: pagu + revisi,
              namaBelanja,
              sumberDana: row.sumberDana || existingItem.sumberDana
            };
          }
        } else {
          successCount++;
          updatedList.push({
            id: `ANG-${rowTahun}-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
            tahun: rowTahun,
            kodeProgram: row.kodeProgram || '5.01.01',
            kodeKegiatan: row.kodeKegiatan || '5.01.01.2.01',
            kodeSub: row.kodeSub || '5.01.01.2.01.01',
            kodeBelanja: row.kodeBelanja.trim(),
            namaBelanja,
            pagu,
            revisi,
            nilaiSPD,
            paguAkhir: pagu + revisi,
            tanggalInput: new Date().toISOString().split('T')[0],
            operator: currentUser.nama,
            sumberDana: row.sumberDana || 'DAU'
          });
        }
      });

      return updatedList;
    });

    const importLogEntry: ImportLog = {
      id: `IMP-${Date.now()}`,
      tanggal: new Date().toISOString().replace('T', ' ').substring(0, 19),
      namaFile: fileName,
      jumlahData: items.length,
      operator: currentUser.nama,
      status: 'Berhasil',
      catatan: `Import Anggaran: Berhasil ${items.length} data (${overwriteExisting ? 'Replace Mode' : 'Update Mode'})`
    };

    setImportLogs(prev => [importLogEntry, ...prev]);
    logActivity(`Import Excel Anggaran Pagu "${fileName}": ${items.length} data berhasil diimpor.`);

    return { successCount: items.length, duplicateCount, errors };
  };

  const addRealisasi = (newReal: Omit<Realisasi, 'id'>) => {
    const id = `REAL-${selectedTahun}-${Date.now().toString().slice(-4)}`;
    const fullReal: Realisasi = {
      ...newReal,
      id,
      statusValidation: currentUser.role === 'PPK' || currentUser.role === 'Administrator' ? 'Disetujui PPK' : 'Draft'
    };
    setRealisasiList(prev => [...prev, fullReal]);
    logActivity(`Menginput Realisasi Baru No SP2D: ${fullReal.noSP2D} Nilai: Rp ${fullReal.nilai.toLocaleString('id-ID')}`);
  };

  const updateRealisasi = (id: string, updated: Partial<Realisasi>) => {
    setRealisasiList(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updated } : item))
    );
    logActivity(`Mengoreksi Transaksi Realisasi ID ${id}`);
  };

  const deleteRealisasi = (id: string) => {
    setRealisasiList(prev => prev.filter(r => r.id !== id));
    logActivity(`Menghapus Transaksi Realisasi ID ${id}`);
  };

  const clearRealisasiDatabase = (tahun?: number) => {
    if (tahun !== undefined && tahun !== null) {
      const targetTahun = Number(tahun);
      setRealisasiList(prev => prev.filter(r => Number(r.tahun) !== targetTahun));
      logActivity(`Kosongkan Database Realisasi SP2D TA ${targetTahun}`);
    } else {
      setRealisasiList([]);
      logActivity('Kosongkan Seluruh Database Realisasi SP2D');
    }
  };

  const approveRealisasiPPK = (id: string, approved: boolean, catatan?: string) => {
    setRealisasiList(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              statusValidation: approved ? 'Disetujui PPK' : 'Ditolak',
              catatanValidation: catatan || (approved ? 'Disetujui oleh PPK' : 'Ditolak untuk revisi')
            }
          : item
      )
    );
    logActivity(`PPK ${approved ? 'Menyetujui' : 'Menolak'} Realisasi ID ${id}`);
  };

  const batchImportExcel = (
    importedRows: {
      tahun: number;
      kodeProgram: string;
      kodeKegiatan: string;
      kodeSub: string;
      kodeBelanja: string;
      namaBelanja: string;
      sp2d: string;
      spm?: string;
      nilai: number;
      uraian: string;
      rekanan: string;
      tanggal: string;
    }[],
    fileName: string,
    overwriteExistingYear: boolean = false
  ) => {
    let successCount = 0;
    let duplicateCount = 0;
    const errors: string[] = [];

    if (!importedRows || importedRows.length === 0) {
      return { successCount: 0, duplicateCount: 0, errors: ['File tidak berisi data realisasi valid.'] };
    }

    setRealisasiList(prev => {
      let baseList = prev;

      if (overwriteExistingYear) {
        const targetYears = new Set(importedRows.map(r => Number(r.tahun) || Number(selectedTahun)));
        baseList = prev.filter(r => !targetYears.has(Number(r.tahun)));
      }

      const existingKeys = new Set(
        baseList.map(r =>
          makeRealisasiCompositeKey(r.noSP2D, r.kodeBelanja, r.kodeSub, r.nilai, r.uraian, r.tahun)
        )
      );

      const newRealisasiItems: Realisasi[] = [];

      importedRows.forEach((row, index) => {
        if (!row.nilai || row.nilai <= 0) {
          errors.push(`Baris ${index + 1}: Data Nilai (${row.nilai}) tidak valid (harus > 0).`);
          return;
        }

        const rowTahun = Number(row.tahun) || Number(selectedTahun);
        const cleanBelanja = extractCode(row.kodeBelanja);
        const cleanSub = extractCode(row.kodeSub);
        const cleanKeg = extractCode(row.kodeKegiatan);
        const cleanProg = extractCode(row.kodeProgram);

        // Auto lookup parent code structure from existing anggaranList or default
        const angMatch = anggaranList.find(a =>
          isCodeEqual(a.kodeBelanja, cleanBelanja) && Number(a.tahun) === rowTahun
        ) || anggaranList.find(a =>
          isCodeEqual(a.kodeBelanja, cleanBelanja)
        );

        const finalBelanja = cleanBelanja || angMatch?.kodeBelanja || '5.1.02.01.01.0024';
        const finalSub = cleanSub || angMatch?.kodeSub || '5.01.01.2.01.01';
        const finalKeg = cleanKeg || angMatch?.kodeKegiatan || '5.01.01.2.01';
        const finalProg = cleanProg || angMatch?.kodeProgram || '5.01.01';
        const sp2dStr = (row.sp2d || '').trim();

        const key = makeRealisasiCompositeKey(sp2dStr, finalBelanja, finalSub, row.nilai, row.uraian, rowTahun);

        if (key && existingKeys.has(key)) {
          duplicateCount++;
          errors.push(`Baris ${index + 1}: Data Realisasi SP2D "${sp2dStr}" (${finalBelanja}) sudah ada (Duplikat).`);
          return;
        }

        const parsedDate = parseExcelDate(row.tanggal, rowTahun);
        const finalMonth = parsedDate.month;
        const finalIsoDate = parsedDate.isoDate;

        newRealisasiItems.push({
          id: `REAL-${rowTahun}-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 6)}`,
          tanggal: finalIsoDate,
          bulan: finalMonth,
          tahun: rowTahun,
          kodeProgram: finalProg,
          kodeKegiatan: finalKeg,
          kodeSub: finalSub,
          kodeBelanja: finalBelanja,
          nilai: row.nilai,
          noSP2D: sp2dStr || `SP2D-${rowTahun}-${index + 1}`,
          noSPM: (row.spm || sp2dStr.replace('SP2D', 'SPM') || `SPM-${rowTahun}-${index + 1}`).trim(),
          uraian: row.uraian || 'Import Excel Realisasi',
          rekanan: row.rekanan || 'Rekanan Penyedia NTB',
          operator: currentUser.nama,
          statusValidation: 'Disetujui PPK'
        });

        if (key) {
          existingKeys.add(key);
        }
        successCount++;
      });

      // Append new items below the existing list to maintain sequential order (File 1 -> File 2 below File 1)
      return [...baseList, ...newRealisasiItems];
    });

    const importLogEntry: ImportLog = {
      id: `IMP-${Date.now()}`,
      tanggal: new Date().toISOString().replace('T', ' ').substring(0, 19),
      namaFile: fileName,
      jumlahData: successCount,
      operator: currentUser.nama,
      status: successCount > 0 ? (errors.length > 0 ? 'Sebagian' : 'Berhasil') : 'Gagal',
      catatan: `Berhasil: ${successCount}, Duplikat: ${duplicateCount}, Error: ${errors.length}`
    };

    setImportLogs(prev => [importLogEntry, ...prev]);
    logActivity(`Import Excel file "${fileName}": ${successCount} data berhasil diimpor.`);

    return { successCount, duplicateCount, errors };
  };

  // Master Data CRUD
  const addTahun = (t: TahunAnggaran) => {
    setTahunList(prev => [...prev, t]);
    logActivity(`Menambah Master Tahun Anggaran: ${t.tahun}`);
  };

  const updateTahun = (id: string, updated: Partial<TahunAnggaran>) => {
    setTahunList(prev => prev.map(t => (t.id === id || String(t.tahun) === String(updated.tahun || id) ? { ...t, ...updated } : t)));
    logActivity(`Memperbarui Master Tahun Anggaran: ${id}`);
  };

  const deleteTahun = (id: string) => {
    setTahunList(prev => prev.filter(t => t.id !== id && String(t.tahun) !== String(id)));
    logActivity(`Menghapus Master Tahun Anggaran ID: ${id}`);
  };

  const addProgram = (prog: Program) => {
    setPrograms(prev => [...prev, prog]);
    logActivity(`Menambah Program Master: ${prog.kodeProgram} - ${prog.namaProgram}`);
  };

  const updateProgram = (oldKode: string, oldTahun: number, updated: Partial<Program>) => {
    const targetTahun = Number(oldTahun);
    setPrograms(prev =>
      prev.map(p =>
        (p.kodeProgram === oldKode || (updated.kodeProgram && p.kodeProgram === updated.kodeProgram)) &&
        Number(p.tahun) === targetTahun
          ? { ...p, ...updated }
          : p
      )
    );
    // Cascade update to Kegiatan and SubKegiatan if kodeProgram changed
    if (updated.kodeProgram && updated.kodeProgram !== oldKode) {
      setKegiatanList(prev =>
        prev.map(k => (k.kodeProgram === oldKode && Number(k.tahun) === targetTahun ? { ...k, kodeProgram: updated.kodeProgram! } : k))
      );
      setSubKegiatanList(prev =>
        prev.map(s => (s.kodeProgram === oldKode && Number(s.tahun) === targetTahun ? { ...s, kodeProgram: updated.kodeProgram! } : s))
      );
    }
    logActivity(`Memperbarui Program Master: ${oldKode} -> ${updated.kodeProgram || oldKode}`);
  };

  const deleteProgram = (kodeProgram: string, tahun: number) => {
    const targetTahun = Number(tahun);
    setPrograms(prev => prev.filter(p => !(p.kodeProgram === kodeProgram && Number(p.tahun) === targetTahun)));
    logActivity(`Menghapus Program Master: ${kodeProgram}`);
  };

  const clearProgramDatabase = (tahun?: number) => {
    if (tahun !== undefined && tahun !== null) {
      const targetTahun = Number(tahun);
      setPrograms(prev => prev.filter(p => Number(p.tahun) !== targetTahun));
      logActivity(`Kosongkan Database Master Program TA ${targetTahun}`);
    } else {
      setPrograms([]);
      logActivity('Kosongkan Seluruh Database Master Program');
    }
  };

  const addKegiatan = (keg: Kegiatan) => {
    setKegiatanList(prev => [...prev, keg]);
    logActivity(`Menambah Kegiatan Master: ${keg.kodeKegiatan}`);
  };

  const updateKegiatan = (oldKode: string, oldTahun: number, updated: Partial<Kegiatan>) => {
    const targetTahun = Number(oldTahun);
    setKegiatanList(prev =>
      prev.map(k =>
        (k.kodeKegiatan === oldKode || (updated.kodeKegiatan && k.kodeKegiatan === updated.kodeKegiatan)) &&
        Number(k.tahun) === targetTahun
          ? { ...k, ...updated }
          : k
      )
    );
    // Cascade update to SubKegiatan if kodeKegiatan changed
    if (updated.kodeKegiatan && updated.kodeKegiatan !== oldKode) {
      setSubKegiatanList(prev =>
        prev.map(s => (s.kodeKegiatan === oldKode && Number(s.tahun) === targetTahun ? { ...s, kodeKegiatan: updated.kodeKegiatan! } : s))
      );
    }
    logActivity(`Memperbarui Kegiatan Master: ${oldKode} -> ${updated.kodeKegiatan || oldKode}`);
  };

  const deleteKegiatan = (kodeKegiatan: string, tahun: number) => {
    const targetTahun = Number(tahun);
    setKegiatanList(prev => prev.filter(k => !(k.kodeKegiatan === kodeKegiatan && Number(k.tahun) === targetTahun)));
    logActivity(`Menghapus Kegiatan Master: ${kodeKegiatan}`);
  };

  const clearKegiatanDatabase = (tahun?: number) => {
    if (tahun !== undefined && tahun !== null) {
      const targetTahun = Number(tahun);
      setKegiatanList(prev => prev.filter(k => Number(k.tahun) !== targetTahun));
      logActivity(`Kosongkan Database Master Kegiatan TA ${targetTahun}`);
    } else {
      setKegiatanList([]);
      logActivity('Kosongkan Seluruh Database Master Kegiatan');
    }
  };

  const addSubKegiatan = (sub: SubKegiatan) => {
    setSubKegiatanList(prev => [...prev, sub]);
    logActivity(`Menambah Sub Kegiatan Master: ${sub.kodeSub}`);
  };

  const updateSubKegiatan = (oldKode: string, oldTahun: number, updated: Partial<SubKegiatan>) => {
    const targetTahun = Number(oldTahun);
    setSubKegiatanList(prev =>
      prev.map(s =>
        (s.kodeSub === oldKode || (updated.kodeSub && s.kodeSub === updated.kodeSub)) &&
        Number(s.tahun) === targetTahun
          ? { ...s, ...updated }
          : s
      )
    );
    logActivity(`Memperbarui Sub Kegiatan Master: ${oldKode} -> ${updated.kodeSub || oldKode}`);
  };

  const deleteSubKegiatan = (kodeSub: string, tahun: number) => {
    const targetTahun = Number(tahun);
    setSubKegiatanList(prev => prev.filter(s => !(s.kodeSub === kodeSub && Number(s.tahun) === targetTahun)));
    logActivity(`Menghapus Sub Kegiatan Master: ${kodeSub}`);
  };

  const clearSubKegiatanDatabase = (tahun?: number) => {
    if (tahun !== undefined && tahun !== null) {
      const targetTahun = Number(tahun);
      setSubKegiatanList(prev => prev.filter(s => Number(s.tahun) !== targetTahun));
      logActivity(`Kosongkan Database Master Sub Kegiatan TA ${targetTahun}`);
    } else {
      setSubKegiatanList([]);
      logActivity('Kosongkan Seluruh Database Master Sub Kegiatan');
    }
  };

  const addBelanja = (bel: Belanja) => {
    setBelanjaList(prev => [...prev, bel]);
    logActivity(`Menambah Belanja Master: ${bel.kodeBelanja}`);
  };

  const updateBelanja = (oldKode: string, oldTahun: number, updated: Partial<Belanja>) => {
    const targetTahun = oldTahun ? Number(oldTahun) : undefined;
    setBelanjaList(prev =>
      prev.map(b => {
        const matchesKode = b.kodeBelanja === oldKode || (updated.kodeBelanja && b.kodeBelanja === updated.kodeBelanja);
        const matchesTahun = targetTahun !== undefined ? (!b.tahun || Number(b.tahun) === targetTahun) : true;
        return matchesKode && matchesTahun ? { ...b, ...updated } : b;
      })
    );
    logActivity(`Memperbarui Belanja Master: ${oldKode} -> ${updated.kodeBelanja || oldKode}`);
  };

  const deleteBelanja = (kodeBelanja: string, tahun?: number) => {
    const targetTahun = tahun ? Number(tahun) : undefined;
    setBelanjaList(prev =>
      prev.filter(b => {
        const matchesKode = b.kodeBelanja === kodeBelanja;
        const matchesTahun = targetTahun !== undefined && b.tahun ? Number(b.tahun) === targetTahun : true;
        return !(matchesKode && matchesTahun);
      })
    );
    logActivity(`Menghapus Belanja Master: ${kodeBelanja}`);
  };

  const clearBelanjaDatabase = (tahun?: number) => {
    if (tahun !== undefined && tahun !== null) {
      const targetTahun = Number(tahun);
      setBelanjaList(prev => prev.filter(b => b.tahun && Number(b.tahun) !== targetTahun));
      logActivity(`Kosongkan Database Master Belanja Rekening TA ${targetTahun}`);
    } else {
      setBelanjaList([]);
      logActivity('Kosongkan Seluruh Database Master Belanja Rekening');
    }
  };

  const importProgramsBatch = (items: Program[]) => {
    let successCount = 0;
    let duplicateCount = 0;

    setPrograms(prev => {
      const updated = [...prev];
      items.forEach(newItem => {
        const index = updated.findIndex(
          p => p.kodeProgram === newItem.kodeProgram && p.tahun === newItem.tahun
        );
        if (index >= 0) {
          updated[index] = newItem;
          duplicateCount++;
        } else {
          updated.push(newItem);
          successCount++;
        }
      });
      return updated;
    });

    logActivity(`Import Excel Program Master: ${successCount} baru, ${duplicateCount} diperbarui.`);
    return { successCount, duplicateCount };
  };

  const importKegiatanBatch = (items: Kegiatan[]) => {
    let successCount = 0;
    let duplicateCount = 0;

    setKegiatanList(prev => {
      const updated = [...prev];
      items.forEach(newItem => {
        const index = updated.findIndex(
          k => k.kodeKegiatan === newItem.kodeKegiatan && k.tahun === newItem.tahun
        );
        if (index >= 0) {
          updated[index] = newItem;
          duplicateCount++;
        } else {
          updated.push(newItem);
          successCount++;
        }
      });
      return updated;
    });

    logActivity(`Import Excel Kegiatan Master: ${successCount} baru, ${duplicateCount} diperbarui.`);
    return { successCount, duplicateCount };
  };

  const importSubKegiatanBatch = (items: SubKegiatan[]) => {
    let successCount = 0;
    let duplicateCount = 0;

    setSubKegiatanList(prev => {
      const updated = [...prev];
      items.forEach(newItem => {
        const index = updated.findIndex(
          s => s.kodeSub === newItem.kodeSub && s.tahun === newItem.tahun
        );
        if (index >= 0) {
          updated[index] = newItem;
          duplicateCount++;
        } else {
          updated.push(newItem);
          successCount++;
        }
      });
      return updated;
    });

    logActivity(`Import Excel Sub Kegiatan Master: ${successCount} baru, ${duplicateCount} diperbarui.`);
    return { successCount, duplicateCount };
  };

  const importBelanjaBatch = (items: Belanja[]) => {
    let successCount = 0;
    let duplicateCount = 0;

    setBelanjaList(prev => {
      const updated = [...prev];
      items.forEach(newItem => {
        const index = updated.findIndex(
          b => b.kodeBelanja === newItem.kodeBelanja && b.tahun === newItem.tahun
        );
        if (index >= 0) {
          updated[index] = newItem;
          duplicateCount++;
        } else {
          updated.push(newItem);
          successCount++;
        }
      });
      return updated;
    });

    logActivity(`Import Excel Belanja Master: ${successCount} baru, ${duplicateCount} diperbarui.`);
    return { successCount, duplicateCount };
  };

  const addSumberDana = (sd: Omit<SumberDana, 'id'>) => {
    const fullSd: SumberDana = { ...sd, id: `SD-${Date.now()}` };
    setSumberDanaList(prev => [...prev, fullSd]);
    logActivity(`Menambah Sumber Dana: ${fullSd.namaSumber}`);
  };

  const updateSumberDana = (idOrKode: string, updated: Partial<SumberDana>) => {
    setSumberDanaList(prev =>
      prev.map(sd =>
        (sd.id === idOrKode || sd.kodeSumber === idOrKode || (updated.kodeSumber && sd.kodeSumber === updated.kodeSumber))
          ? { ...sd, ...updated }
          : sd
      )
    );
    logActivity(`Memperbarui Sumber Dana: ${idOrKode}`);
  };

  const deleteSumberDana = (idOrKode: string) => {
    setSumberDanaList(prev => prev.filter(sd => sd.id !== idOrKode && sd.kodeSumber !== idOrKode));
    logActivity(`Menghapus Sumber Dana: ${idOrKode}`);
  };

  const clearSumberDanaDatabase = () => {
    setSumberDanaList([]);
    logActivity('Kosongkan Seluruh Database Master Sumber Dana');
  };

  const addRekanan = (rek: Omit<Rekanan, 'id'>) => {
    const fullRek: Rekanan = { ...rek, id: `REK-${Date.now()}` };
    setRekananList(prev => [...prev, fullRek]);
    logActivity(`Menambah Rekanan Baru: ${fullRek.namaRekanan}`);
  };

  const updateRekanan = (id: string, updated: Partial<Rekanan>) => {
    setRekananList(prev => prev.map(r => (r.id === id ? { ...r, ...updated } : r)));
    logActivity(`Memperbarui Rekanan ID: ${id}`);
  };

  const deleteRekanan = (id: string) => {
    setRekananList(prev => prev.filter(r => r.id !== id));
    logActivity(`Menghapus Rekanan ID: ${id}`);
  };

  const clearRekananDatabase = () => {
    setRekananList([]);
    logActivity('Kosongkan Seluruh Database Master Data Rekanan');
  };

  // OPD Management
  const addOpd = (newOpd: OPD) => {
    const fullOpd: OPD = {
      ...newOpd,
      id: newOpd.id || `OPD-${Date.now().toString().slice(-4)}`
    };
    setOpdList(prev => [...prev, fullOpd]);
    logActivity(`Menambah Unit Kerja / OPD Baru: ${fullOpd.namaOPD}`);
  };

  const updateOpd = (idOrKode: string, updated: Partial<OPD>) => {
    setOpdList(prev =>
      prev.map(item =>
        (item.id === idOrKode || item.kodeOPD === idOrKode)
          ? { ...item, ...updated }
          : item
      )
    );
    logActivity(`Memperbarui Data OPD / Unit Kerja ID/Kode: ${idOrKode}`);
  };

  const deleteOpd = (idOrKode: string) => {
    setOpdList(prev =>
      prev.filter(item => item.id !== idOrKode && item.kodeOPD !== idOrKode)
    );
    logActivity(`Menghapus Data OPD / Unit Kerja ID/Kode: ${idOrKode}`);
  };

  const importOpdLogo = (idOrKode: string, logoUrl: string) => {
    setOpdList(prev =>
      prev.map(item =>
        (item.id === idOrKode || item.kodeOPD === idOrKode)
          ? { ...item, logoUrl }
          : item
      )
    );
    logActivity(`Mengimpor / Mengunggah Logo Provinsi NTB untuk OPD ID/Kode: ${idOrKode}`);
  };

  const addUser = (newUser: Omit<User, 'id' | 'lastLogin'>) => {
    const fullUser: User = {
      ...newUser,
      id: `USR-${Date.now()}`,
      lastLogin: '-'
    };
    setUsers(prev => [...prev, fullUser]);
    logActivity(`Menambah Pengguna Sistem Baru: ${fullUser.username} (${fullUser.role})`);
  };

  const updateUserStatus = (id: string, status: 'Aktif' | 'Nonaktif') => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, status } : u)));
    logActivity(`Mengubah Status User ID ${id} menjadi ${status}`);
  };

  const updateUser = (id: string, updated: Partial<User>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...updated } : u)));
    logActivity(`Memperbarui Data User ID ${id}: ${updated.nama || updated.username || ''}`);
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    logActivity(`Menghapus User Sistem ID ${id}`);
  };

  const deleteActivityLog = (id: string) => {
    setActivityLogs(prev => prev.filter(log => log.id !== id));
  };

  const clearAllActivityLogs = () => {
    setActivityLogs([]);
  };

  // Google Spreadsheet Sync
  const syncWithSpreadsheet = async () => {
    setSyncStatus('syncing');
    logActivity(`Memulai sinkronisasi data dengan Google Spreadsheet`);

    try {
      // Simulate Apps Script webhook fetch or push
      await new Promise(resolve => setTimeout(resolve, 1200));

      setSheetConfig(prev => ({
        ...prev,
        lastSyncedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        status: 'Connected'
      }));
      setSyncStatus('success');
      logActivity(`Sinkronisasi Google Spreadsheet BERHASIL`);
    } catch (err) {
      setSyncStatus('error');
      setSheetConfig(prev => ({ ...prev, status: 'Error' }));
      logActivity(`Sinkronisasi Google Spreadsheet GAGAL`);
    } finally {
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const resetFilters = () => {
    setFilters({
      tahun: selectedTahun,
      kodeProgram: 'all',
      kodeKegiatan: 'all',
      kodeSub: 'all',
      kodeBelanja: 'all',
      bulan: 'all',
      triwulan: 'all',
      semester: 'all',
      searchQuery: ''
    });
  };

  const resetAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCurrentUser(INITIAL_USERS[0]);
    setUsers(INITIAL_USERS);
    setSelectedTahun(2025);
    setTahunList(INITIAL_TAHUN);
    setOpdList([INITIAL_OPD]);
    setPrograms(INITIAL_PROGRAMS);
    setKegiatanList(INITIAL_KEGIATAN);
    setSubKegiatanList(INITIAL_SUBKEGIATAN);
    setBelanjaList(INITIAL_BELANJA);
    setRekananList(INITIAL_REKANAN);
    setAnggaranList(INITIAL_ANGGARAN);
    setRealisasiList(INITIAL_REALISASI);
    setImportLogs(INITIAL_IMPORT_LOGS);
    setActivityLogs(INITIAL_ACTIVITY_LOGS);
    setSheetConfig(INITIAL_SHEET_CONFIG);
    logActivity(`Reset seluruh data aplikasi ke default awal`);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        switchRole,
        users,
        selectedTahun,
        setSelectedTahun,
        tahunList,
        opd,
        opdList,
        programs,
        kegiatanList,
        subKegiatanList,
        belanjaList,
        sumberDanaList,
        rekananList,
        anggaranList,
        realisasiList,
        importLogs,
        activityLogs,
        notifications,
        filters,
        setFilters,
        resetFilters,
        sheetConfig,
        setSheetConfig,
        syncStatus,
        syncWithSpreadsheet,
        cloudSync,
        forceSyncCloud,
        addAnggaran,
        updateAnggaran,
        deleteAnggaran,
        clearAnggaranDatabase,
        importAnggaranBatch,
        addRealisasi,
        updateRealisasi,
        deleteRealisasi,
        clearRealisasiDatabase,
        approveRealisasiPPK,
        batchImportExcel,
        addTahun,
        updateTahun,
        deleteTahun,
        addProgram,
        updateProgram,
        deleteProgram,
        clearProgramDatabase,
        addKegiatan,
        updateKegiatan,
        deleteKegiatan,
        clearKegiatanDatabase,
        addSubKegiatan,
        updateSubKegiatan,
        deleteSubKegiatan,
        clearSubKegiatanDatabase,
        addBelanja,
        updateBelanja,
        deleteBelanja,
        clearBelanjaDatabase,
        importProgramsBatch,
        importKegiatanBatch,
        importSubKegiatanBatch,
        importBelanjaBatch,
        addSumberDana,
        updateSumberDana,
        deleteSumberDana,
        clearSumberDanaDatabase,
        addRekanan,
        updateRekanan,
        deleteRekanan,
        clearRekananDatabase,
        addOpd,
        updateOpd,
        deleteOpd,
        importOpdLogo,
        addUser,
        updateUserStatus,
        updateUser,
        deleteUser,
        logActivity,
        deleteActivityLog,
        clearAllActivityLogs,
        resetAllData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
