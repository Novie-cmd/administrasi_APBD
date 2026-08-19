export type UserRole = 'Administrator' | 'Operator Program' | 'PPK' | 'Kepala Badan' | 'Auditor';

export interface User {
  id: string;
  nama: string;
  nip?: string;
  username: string;
  password?: string;
  role: UserRole;
  status: 'Aktif' | 'Nonaktif';
  lastLogin: string;
}

export interface TahunAnggaran {
  id: string;
  tahun: number;
  statusAktif: boolean;
  keterangan?: string;
}

export interface OPD {
  id?: string;
  kodeOPD: string;
  namaOPD: string;
  singkatan: string;
  kepalaBadan: string;
  nipKepala: string;
  logoUrl?: string;
}

export interface Program {
  kodeProgram: string;
  namaProgram: string;
  tahun: number;
}

export interface Kegiatan {
  kodeProgram: string;
  kodeKegiatan: string;
  namaKegiatan: string;
  tahun: number;
}

export interface SubKegiatan {
  kodeProgram: string;
  kodeKegiatan: string;
  kodeSub: string;
  namaSub: string;
  tahun: number;
}

export interface Belanja {
  kodeBelanja: string;
  namaBelanja: string;
  jenisBelanja: string; // e.g., 'Belanja Pegawai', 'Belanja Barang dan Jasa', 'Belanja Modal', 'Belanja Hibah'
  tahun: number;
}

export interface SumberDana {
  id?: string;
  kodeSumber: string;
  namaSumber: string;
  keterangan: string;
}

export interface Rekanan {
  id: string;
  namaRekanan: string;
  npwp: string;
  bank: string;
  noRekening: string;
  alamat: string;
  kontak: string;
}

export interface Anggaran {
  id: string;
  tahun: number;
  kodeProgram: string;
  kodeKegiatan: string;
  kodeSub: string;
  kodeBelanja: string;
  namaBelanja: string;
  pagu: number;
  revisi: number;
  nilaiSPD?: number;
  paguAkhir: number;
  tanggalInput: string;
  operator: string;
  sumberDana?: string;
}

export interface Realisasi {
  id: string;
  tanggal: string; // YYYY-MM-DD
  bulan: number; // 1 - 12
  tahun: number;
  kodeProgram: string;
  kodeKegiatan: string;
  kodeSub: string;
  kodeBelanja: string;
  nilai: number;
  noSP2D: string;
  noSPM: string;
  uraian: string;
  rekanan: string;
  operator: string;
  statusValidation?: 'Draft' | 'Disetujui PPK' | 'Ditolak';
  catatanValidation?: string;
  buktiUrl?: string; // Simulated uploaded file name or data
}

export interface ImportLog {
  id: string;
  tanggal: string;
  namaFile: string;
  jumlahData: number;
  operator: string;
  status: 'Berhasil' | 'Gagal' | 'Sebagian';
  catatan?: string;
}

export interface ActivityLog {
  id: string;
  tanggal: string;
  jam: string;
  user: string;
  role: string;
  aktivitas: string;
  ip: string;
  browser: string;
}

export interface SystemNotification {
  id: string;
  type: 'warning' | 'info' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isRead?: boolean;
}

export interface FilterState {
  tahun: number;
  kodeProgram: string;
  kodeKegiatan: string;
  kodeSub: string;
  kodeBelanja: string;
  bulan: number | 'all';
  triwulan: number | 'all'; // 1, 2, 3, 4
  semester: number | 'all'; // 1, 2
  searchQuery: string;
}

export interface GoogleSheetConfig {
  spreadsheetId: string;
  webAppUrl: string;
  autoSync: boolean;
  lastSyncedAt?: string;
  status: 'Connected' | 'Disconnected' | 'Syncing' | 'Error';
}

export interface CloudSyncStatus {
  status: 'connected' | 'syncing' | 'offline' | 'error';
  lastSyncedAt?: string;
  lastUpdatedBy?: string;
}

