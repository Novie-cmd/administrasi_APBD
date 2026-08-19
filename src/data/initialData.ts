import {
  User,
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
  GoogleSheetConfig
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'USR-001',
    nama: 'Dr. H. Ruslan, M.Si',
    nip: '19710312 199603 1 002',
    username: 'admin',
    role: 'Administrator',
    status: 'Aktif',
    lastLogin: '2026-07-27 08:30:00'
  },
  {
    id: 'USR-002',
    nama: 'Ahmad Subadri, S.STP',
    nip: '19850614 200802 1 001',
    username: 'operator',
    role: 'Operator Program',
    status: 'Aktif',
    lastLogin: '2026-07-27 09:15:20'
  },
  {
    id: 'USR-003',
    nama: 'Drs. Supriadi, M.M',
    nip: '19680920 199403 1 005',
    username: 'ppk',
    role: 'PPK',
    status: 'Aktif',
    lastLogin: '2026-07-26 16:45:00'
  },
  {
    id: 'USR-004',
    nama: 'H. Lalu Gita Ariadi, M.Si',
    nip: '19651001 199003 1 008',
    username: 'kaban',
    role: 'Kepala Badan',
    status: 'Aktif',
    lastLogin: '2026-07-27 10:00:12'
  },
  {
    id: 'USR-005',
    nama: 'Siti Rahmah, S.E., Ak.',
    nip: '19821125 200604 2 011',
    username: 'auditor',
    role: 'Auditor',
    status: 'Aktif',
    lastLogin: '2026-07-25 14:20:00'
  }
];

export const INITIAL_TAHUN: TahunAnggaran[] = [
  { id: 'THN-2025', tahun: 2025, statusAktif: true, keterangan: 'Tahun Anggaran Berjalan Murni & APBD-P' },
  { id: 'THN-2026', tahun: 2026, statusAktif: false, keterangan: 'Tahun Anggaran Perencanaan' },
  { id: 'THN-2027', tahun: 2027, statusAktif: false, keterangan: 'Tahun Anggaran Proyeksi' },
  { id: 'THN-2028', tahun: 2028, statusAktif: false, keterangan: 'Tahun Anggaran Proyeksi' },
  { id: 'THN-2029', tahun: 2029, statusAktif: false, keterangan: 'Tahun Anggaran Proyeksi' },
  { id: 'THN-2030', tahun: 2030, statusAktif: false, keterangan: 'Tahun Anggaran Proyeksi' }
];

export const INITIAL_OPD: OPD = {
  id: 'OPD-001',
  kodeOPD: '5.01.0.00.0.00.01.0000',
  namaOPD: 'Badan Kesatuan Bangsa dan Politik Dalam Negeri Provinsi Nusa Tenggara Barat',
  singkatan: 'BAKESBANGPOLDAGRI NTB',
  kepalaBadan: 'H. Lalu Gita Ariadi, M.Si',
  nipKepala: '196803121993031008',
  logoUrl: ''
};

export const INITIAL_OPD_LIST: OPD[] = [INITIAL_OPD];

export const INITIAL_PROGRAMS: Program[] = [
  {
    kodeProgram: '5.01.01',
    namaProgram: 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI',
    tahun: 2025
  },
  {
    kodeProgram: '5.01.02',
    namaProgram: 'PROGRAM BINA IDEOLOGI PANCASILA DAN WAWASAN KEBANGSAAN',
    tahun: 2025
  },
  {
    kodeProgram: '5.01.03',
    namaProgram: 'PROGRAM PENYELENGGARAAN POLITIK DALAM NEGERI DAN KEWASPADAAN DINI',
    tahun: 2025
  },
  {
    kodeProgram: '5.01.04',
    namaProgram: 'PROGRAM PEMBINAAN KERUKUNAN UMAT BERAGAMA DAN ORGANISASI MASYARAKAT',
    tahun: 2025
  },
  // 2026
  {
    kodeProgram: '5.01.01',
    namaProgram: 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI',
    tahun: 2026
  },
  {
    kodeProgram: '5.01.02',
    namaProgram: 'PROGRAM BINA IDEOLOGI PANCASILA DAN WAWASAN KEBANGSAAN',
    tahun: 2026
  }
];

export const INITIAL_KEGIATAN: Kegiatan[] = [
  {
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.01',
    namaKegiatan: 'Perencanaan, Penganggaran, dan Evaluasi Kinerja Perangkat Daerah',
    tahun: 2025
  },
  {
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.02',
    namaKegiatan: 'Administrasi Keuangan Perangkat Daerah',
    tahun: 2025
  },
  {
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.06',
    namaKegiatan: 'Pengadaan Barang Milik Daerah Penunjang Urusan Pemerintah Daerah',
    tahun: 2025
  },
  {
    kodeProgram: '5.01.02',
    kodeKegiatan: '5.01.02.2.01',
    namaKegiatan: 'Perumusan Kebijakan Teknis dan Pelaksanaan Ideologi Pancasila dan Wawasan Kebangsaan',
    tahun: 2025
  },
  {
    kodeProgram: '5.01.03',
    kodeKegiatan: '5.01.03.2.01',
    namaKegiatan: 'Fasilitasi Organisasi Politik dan Pendidikan Politik Masyarakat NTB',
    tahun: 2025
  },
  {
    kodeProgram: '5.01.04',
    kodeKegiatan: '5.01.04.2.01',
    namaKegiatan: 'Pemberdayaan dan Pengawasan Organisasi Kemasyarakatan serta FKUB',
    tahun: 2025
  }
];

export const INITIAL_SUBKEGIATAN: SubKegiatan[] = [
  {
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.01',
    kodeSub: '5.01.01.2.01.01',
    namaSub: 'Penyusunan Dokumen Perencanaan Perangkat Daerah (Renstra, Renja, RKA)',
    tahun: 2025
  },
  {
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.02',
    kodeSub: '5.01.01.2.02.01',
    namaSub: 'Penyediaan Gaji dan Tunjangan ASN Kesbangpoldagri',
    tahun: 2025
  },
  {
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.06',
    kodeSub: '5.01.01.2.06.02',
    namaSub: 'Pengadaan Sarana dan Prasarana Peralatan Kantor',
    tahun: 2025
  },
  {
    kodeProgram: '5.01.02',
    kodeKegiatan: '5.01.02.2.01',
    kodeSub: '5.01.02.2.01.03',
    namaSub: 'Pelaksanaan Pembinaan Paskibraka dan Pembaruan Nilai-Nilai Kebangsaan',
    tahun: 2025
  },
  {
    kodeProgram: '5.01.03',
    kodeKegiatan: '5.01.03.2.01',
    kodeSub: '5.01.03.2.01.02',
    namaSub: 'Monitoring Evaluasi Penyelenggaraan Pemilu dan Pilkada Serentak NTB',
    tahun: 2025
  },
  {
    kodeProgram: '5.01.04',
    kodeKegiatan: '5.01.04.2.01',
    kodeSub: '5.01.04.2.01.01',
    namaSub: 'Fasilitasi Forum Kerukunan Umat Beragama (FKUB) dan Dialog Tokoh Masyarakat',
    tahun: 2025
  }
];

export const INITIAL_BELANJA: Belanja[] = [
  {
    kodeBelanja: '5.1.01.01.01.0001',
    namaBelanja: 'Belanja Gaji Pokok PNS/PNSD',
    jenisBelanja: 'Belanja Pegawai',
    tahun: 2025
  },
  {
    kodeBelanja: '5.1.02.01.01.0024',
    namaBelanja: 'Belanja Alat/Bahan untuk Kegiatan Kantor - Alat Tulis Kantor (ATK)',
    jenisBelanja: 'Belanja Barang dan Jasa',
    tahun: 2025
  },
  {
    kodeBelanja: '5.1.02.01.01.0052',
    namaBelanja: 'Belanja Makanan dan Minuman Rapat / Operasional Lapangan',
    jenisBelanja: 'Belanja Barang dan Jasa',
    tahun: 2025
  },
  {
    kodeBelanja: '5.1.02.04.01.0001',
    namaBelanja: 'Belanja Perjalanan Dinas Dalam Daerah Kab/Kota NTB',
    jenisBelanja: 'Belanja Barang dan Jasa',
    tahun: 2025
  },
  {
    kodeBelanja: '5.1.02.04.01.0003',
    namaBelanja: 'Belanja Perjalanan Dinas Luar Daerah (Jakarta/Surakarta)',
    jenisBelanja: 'Belanja Barang dan Jasa',
    tahun: 2025
  },
  {
    kodeBelanja: '5.2.02.08.01.0005',
    namaBelanja: 'Belanja Modal Personal Computer / Laptop Operasional',
    jenisBelanja: 'Belanja Modal',
    tahun: 2025
  },
  {
    kodeBelanja: '5.1.05.01.01.0002',
    namaBelanja: 'Belanja Hibah Uang kepada Badan/Lembaga/Ormas Terdaftar NTB',
    jenisBelanja: 'Belanja Hibah',
    tahun: 2025
  }
];

export const INITIAL_SUMBER_DANA: SumberDana[] = [
  { kodeSumber: 'SD-01', namaSumber: 'PAD (Pendapatan Asli Daerah NTB)', keterangan: 'Dana Hasil Pajak & Retribusi Provinsi' },
  { kodeSumber: 'SD-02', namaSumber: 'DAU (Dana Alokasi Umum)', keterangan: 'Transfer Pemerintah Pusat' },
  { kodeSumber: 'SD-03', namaSumber: 'DAK (Dana Alokasi Khusus)', keterangan: 'Transfer Spesifik Non-Fisik' },
  { kodeSumber: 'SD-04', namaSumber: 'DBH (Dana Bagi Hasil)', keterangan: 'Bagi Hasil Pajak & Sumber Daya Alam' }
];

export const INITIAL_REKANAN: Rekanan[] = [
  {
    id: 'REK-01',
    namaRekanan: 'PT Bank NTB Syariah Cabang Utama Mataram',
    npwp: '01.234.567.8-911.000',
    bank: 'Bank NTB Syariah',
    noRekening: '001-01-0000123-9',
    alamat: 'Jl. Pejanggik No. 30 Mataram, NTB',
    kontak: '(0370) 632111'
  },
  {
    id: 'REK-02',
    namaRekanan: 'CV Nusa Media Grafindo',
    npwp: '02.987.654.3-912.000',
    bank: 'Bank Mandiri Mataram',
    noRekening: '161-00-0987654-1',
    alamat: 'Jl. Majapahit No. 88 Mataram, NTB',
    kontak: '0819-0712-3456'
  },
  {
    id: 'REK-03',
    namaRekanan: 'PT Lombok Utama Catering & Event',
    npwp: '03.456.789.1-913.000',
    bank: 'Bank BNI Mataram',
    noRekening: '034-567-8910',
    alamat: 'Jl. Langko No. 45 Mataram, NTB',
    kontak: '0812-3456-7890'
  },
  {
    id: 'REK-04',
    namaRekanan: 'FKUB Provinsi NTB',
    npwp: '04.111.222.3-914.000',
    bank: 'Bank NTB Syariah',
    noRekening: '001-02-0009988-1',
    alamat: 'Jl. Udayana No. 12 Mataram',
    kontak: '0878-6543-2109'
  },
  {
    id: 'REK-05',
    namaRekanan: 'CV Teknologi Nusantara Mataram',
    npwp: '05.333.444.5-915.000',
    bank: 'Bank BRI Mataram',
    noRekening: '0054-01-001234-53-1',
    alamat: 'Jl. Sriwijaya No. 102 Mataram',
    kontak: '0818-0361-1223'
  }
];

export const INITIAL_ANGGARAN: Anggaran[] = [
  {
    id: 'ANG-2025-01',
    tahun: 2025,
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.02',
    kodeSub: '5.01.01.2.02.01',
    kodeBelanja: '5.1.01.01.01.0001',
    namaBelanja: 'Belanja Gaji Pokok PNS/PNSD',
    pagu: 22000000000,
    revisi: 0,
    nilaiSPD: 22000000000,
    paguAkhir: 22000000000,
    tanggalInput: '2025-01-05',
    operator: 'Ahmad Subadri, S.STP',
    sumberDana: 'DAU'
  },
  {
    id: 'ANG-2025-02',
    tahun: 2025,
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.01',
    kodeSub: '5.01.01.2.01.01',
    kodeBelanja: '5.1.02.01.01.0024',
    namaBelanja: 'Belanja Alat/Bahan untuk Kegiatan Kantor - ATK',
    pagu: 1500000000,
    revisi: 200000000,
    nilaiSPD: 1700000000,
    paguAkhir: 1700000000,
    tanggalInput: '2025-01-05',
    operator: 'Ahmad Subadri, S.STP',
    sumberDana: 'PAD'
  },
  {
    id: 'ANG-2025-03',
    tahun: 2025,
    kodeProgram: '5.01.02',
    kodeKegiatan: '5.01.02.2.01',
    kodeSub: '5.01.02.2.01.03',
    kodeBelanja: '5.1.02.04.01.0001',
    namaBelanja: 'Belanja Perjalanan Dinas Dalam Daerah Kab/Kota NTB',
    pagu: 4800000000,
    revisi: 0,
    nilaiSPD: 4800000000,
    paguAkhir: 4800000000,
    tanggalInput: '2025-01-06',
    operator: 'Ahmad Subadri, S.STP',
    sumberDana: 'PAD'
  },
  {
    id: 'ANG-2025-04',
    tahun: 2025,
    kodeProgram: '5.01.02',
    kodeKegiatan: '5.01.02.2.01',
    kodeSub: '5.01.02.2.01.03',
    kodeBelanja: '5.1.02.01.01.0052',
    namaBelanja: 'Belanja Makanan dan Minuman Rapat / Operasional Lapangan',
    pagu: 3500000000,
    revisi: -100000000,
    nilaiSPD: 3400000000,
    paguAkhir: 3400000000,
    tanggalInput: '2025-01-06',
    operator: 'Ahmad Subadri, S.STP',
    sumberDana: 'PAD'
  },
  {
    id: 'ANG-2025-05',
    tahun: 2025,
    kodeProgram: '5.01.03',
    kodeKegiatan: '5.01.03.2.01',
    kodeSub: '5.01.03.2.01.02',
    kodeBelanja: '5.1.02.04.01.0003',
    namaBelanja: 'Belanja Perjalanan Dinas Luar Daerah (Jakarta/Surakarta)',
    pagu: 5200000000,
    revisi: 0,
    nilaiSPD: 5200000000,
    paguAkhir: 5200000000,
    tanggalInput: '2025-01-08',
    operator: 'Ahmad Subadri, S.STP',
    sumberDana: 'DAU'
  },
  {
    id: 'ANG-2025-06',
    tahun: 2025,
    kodeProgram: '5.01.04',
    kodeKegiatan: '5.01.04.2.01',
    kodeSub: '5.01.04.2.01.01',
    kodeBelanja: '5.1.05.01.01.0002',
    namaBelanja: 'Belanja Hibah Uang kepada Badan/Lembaga/Ormas Terdaftar NTB',
    pagu: 18500000000,
    revisi: 0,
    nilaiSPD: 18500000000,
    paguAkhir: 18500000000,
    tanggalInput: '2025-01-10',
    operator: 'Ahmad Subadri, S.STP',
    sumberDana: 'PAD'
  },
  {
    id: 'ANG-2025-07',
    tahun: 2025,
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.06',
    kodeSub: '5.01.01.2.06.02',
    kodeBelanja: '5.2.02.08.01.0005',
    namaBelanja: 'Belanja Modal Personal Computer / Laptop Operasional',
    pagu: 2400000000,
    revisi: 0,
    nilaiSPD: 2400000000,
    paguAkhir: 2400000000,
    tanggalInput: '2025-01-12',
    operator: 'Ahmad Subadri, S.STP',
    sumberDana: 'PAD'
  }
];

export const INITIAL_REALISASI: Realisasi[] = [
  {
    id: 'REAL-2025-001',
    tanggal: '2025-01-28',
    bulan: 1,
    tahun: 2025,
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.02',
    kodeSub: '5.01.01.2.02.01',
    kodeBelanja: '5.1.01.01.01.0001',
    nilai: 1830000000,
    noSP2D: '900/0123/SP2D-LS/KESBANG/2025',
    noSPM: '900/0123/SPM-LS/KESBANG/2025',
    uraian: 'Pembayaran Gaji dan Tunjangan ASN Kesbangpoldagri NTB Bulan Januari 2025',
    rekanan: 'PT Bank NTB Syariah Cabang Utama Mataram',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2025-002',
    tanggal: '2025-02-14',
    bulan: 2,
    tahun: 2025,
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.01',
    kodeSub: '5.01.01.2.01.01',
    kodeBelanja: '5.1.02.01.01.0024',
    nilai: 240000000,
    noSP2D: '900/0245/SP2D-GU/KESBANG/2025',
    noSPM: '900/0245/SPM-GU/KESBANG/2025',
    uraian: 'Pengadaan ATK & Bahan Cetak Perencanaan RKA & Renja Triwulan I',
    rekanan: 'CV Nusa Media Grafindo',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2025-003',
    tanggal: '2025-02-25',
    bulan: 2,
    tahun: 2025,
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.02',
    kodeSub: '5.01.01.2.02.01',
    kodeBelanja: '5.1.01.01.01.0001',
    nilai: 1835000000,
    noSP2D: '900/0312/SP2D-LS/KESBANG/2025',
    noSPM: '900/0312/SPM-LS/KESBANG/2025',
    uraian: 'Pembayaran Gaji dan Tunjangan ASN Kesbangpoldagri NTB Bulan Februari 2025',
    rekanan: 'PT Bank NTB Syariah Cabang Utama Mataram',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2025-004',
    tanggal: '2025-03-18',
    bulan: 3,
    tahun: 2025,
    kodeProgram: '5.01.02',
    kodeKegiatan: '5.01.02.2.01',
    kodeSub: '5.01.02.2.01.03',
    kodeBelanja: '5.1.02.01.01.0052',
    nilai: 450000000,
    noSP2D: '900/0418/SP2D-LS/KESBANG/2025',
    noSPM: '900/0418/SPM-LS/KESBANG/2025',
    uraian: 'Belanja Konsumsi Rapat Koordinasi Pembaruan Nilai Kebangsaan Kabupaten/Kota',
    rekanan: 'PT Lombok Utama Catering & Event',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2025-005',
    tanggal: '2025-03-27',
    bulan: 3,
    tahun: 2025,
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.02',
    kodeSub: '5.01.01.2.02.01',
    kodeBelanja: '5.1.01.01.01.0001',
    nilai: 1840000000,
    noSP2D: '900/0510/SP2D-LS/KESBANG/2025',
    noSPM: '900/0510/SPM-LS/KESBANG/2025',
    uraian: 'Pembayaran Gaji dan Tunjangan ASN Bulan Maret 2025',
    rekanan: 'PT Bank NTB Syariah Cabang Utama Mataram',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2025-006',
    tanggal: '2025-04-12',
    bulan: 4,
    tahun: 2025,
    kodeProgram: '5.01.04',
    kodeKegiatan: '5.01.04.2.01',
    kodeSub: '5.01.04.2.01.01',
    kodeBelanja: '5.1.05.01.01.0002',
    nilai: 5500000000,
    noSP2D: '900/0620/SP2D-LS/KESBANG/2025',
    noSPM: '900/0620/SPM-LS/KESBANG/2025',
    uraian: 'Pencairan Dana Hibah Tahap I FKUB & Ormas Kemasyarakatan NTB',
    rekanan: 'FKUB Provinsi NTB',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2025-007',
    tanggal: '2025-04-28',
    bulan: 4,
    tahun: 2025,
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.02',
    kodeSub: '5.01.01.2.02.01',
    kodeBelanja: '5.1.01.01.01.0001',
    nilai: 1838000000,
    noSP2D: '900/0711/SP2D-LS/KESBANG/2025',
    noSPM: '900/0711/SPM-LS/KESBANG/2025',
    uraian: 'Pembayaran Gaji dan Tunjangan ASN Bulan April 2025',
    rekanan: 'PT Bank NTB Syariah Cabang Utama Mataram',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2025-008',
    tanggal: '2025-05-15',
    bulan: 5,
    tahun: 2025,
    kodeProgram: '5.01.02',
    kodeKegiatan: '5.01.02.2.01',
    kodeSub: '5.01.02.2.01.03',
    kodeBelanja: '5.1.02.04.01.0001',
    nilai: 1250000000,
    noSP2D: '900/0830/SP2D-LS/KESBANG/2025',
    noSPM: '900/0830/SPM-LS/KESBANG/2025',
    uraian: 'Perjalanan Dinas Tim Seleksi Paskibraka Tingkat Kabupaten/Kota se-NTB',
    rekanan: 'PT Bank NTB Syariah Cabang Utama Mataram',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2025-009',
    tanggal: '2025-05-28',
    bulan: 5,
    tahun: 2025,
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.02',
    kodeSub: '5.01.01.2.02.01',
    kodeBelanja: '5.1.01.01.01.0001',
    nilai: 1842000000,
    noSP2D: '900/0912/SP2D-LS/KESBANG/2025',
    noSPM: '900/0912/SPM-LS/KESBANG/2025',
    uraian: 'Pembayaran Gaji dan Tunjangan ASN Bulan Mei 2025',
    rekanan: 'PT Bank NTB Syariah Cabang Utama Mataram',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2025-010',
    tanggal: '2025-06-19',
    bulan: 6,
    tahun: 2025,
    kodeProgram: '5.01.03',
    kodeKegiatan: '5.01.03.2.01',
    kodeSub: '5.01.03.2.01.02',
    kodeBelanja: '5.1.02.04.01.0003',
    nilai: 1680000000,
    noSP2D: '900/1015/SP2D-LS/KESBANG/2025',
    noSPM: '900/1015/SPM-LS/KESBANG/2025',
    uraian: 'Perjalanan Dinas Konsultasi Kewaspadaan Dini Pilkada ke Kemendagri Jakarta',
    rekanan: 'PT Bank NTB Syariah Cabang Utama Mataram',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2025-011',
    tanggal: '2025-06-27',
    bulan: 6,
    tahun: 2025,
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.02',
    kodeSub: '5.01.01.2.02.01',
    kodeBelanja: '5.1.01.01.01.0001',
    nilai: 1845000000,
    noSP2D: '900/1102/SP2D-LS/KESBANG/2025',
    noSPM: '900/1102/SPM-LS/KESBANG/2025',
    uraian: 'Pembayaran Gaji dan Tunjangan ASN Bulan Juni 2025',
    rekanan: 'PT Bank NTB Syariah Cabang Utama Mataram',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2025-012',
    tanggal: '2025-07-10',
    bulan: 7,
    tahun: 2025,
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.06',
    kodeSub: '5.01.01.2.06.02',
    kodeBelanja: '5.2.02.08.01.0005',
    nilai: 1200000000,
    noSP2D: '900/1210/SP2D-LS/KESBANG/2025',
    noSPM: '900/1210/SPM-LS/KESBANG/2025',
    uraian: 'Pengadaan PC Desktop & Laptop Operasional Ruang Command Center Kesbangpol',
    rekanan: 'CV Teknologi Nusantara Mataram',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2025-013',
    tanggal: '2025-07-25',
    bulan: 7,
    tahun: 2025,
    kodeProgram: '5.01.04',
    kodeKegiatan: '5.01.04.2.01',
    kodeSub: '5.01.04.2.01.01',
    kodeBelanja: '5.1.05.01.01.0002',
    nilai: 8700000000,
    noSP2D: '900/1325/SP2D-LS/KESBANG/2025',
    noSPM: '900/1325/SPM-LS/KESBANG/2025',
    uraian: 'Pencairan Dana Hibah Tahap II Lembaga Politik & Kemasyarakatan NTB',
    rekanan: 'FKUB Provinsi NTB',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  // Realisasi 2026 (Total: Rp 13.264.888.381)
  {
    id: 'REAL-2026-001',
    tanggal: '2026-01-20',
    bulan: 1,
    tahun: 2026,
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.01',
    kodeSub: '5.01.01.2.01.01',
    kodeBelanja: '5.1.02.01.01.0024',
    nilai: 1117922844,
    noSP2D: '900/0101/SP2D-LS/KESBANG/2026',
    noSPM: '900/0101/SPM-LS/KESBANG/2026',
    uraian: 'Pembayaran Realisasi SP2D Bulan Januari TA 2026',
    rekanan: 'PT Bank NTB Syariah Cabang Utama Mataram',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2026-002',
    tanggal: '2026-02-18',
    bulan: 2,
    tahun: 2026,
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.01',
    kodeSub: '5.01.01.2.01.01',
    kodeBelanja: '5.1.02.01.01.0024',
    nilai: 1050000000,
    noSP2D: '900/0202/SP2D-LS/KESBANG/2026',
    noSPM: '900/0202/SPM-LS/KESBANG/2026',
    uraian: 'Pembayaran Realisasi SP2D Bulan Februari TA 2026',
    rekanan: 'CV Cahaya Gemilang',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2026-003',
    tanggal: '2026-03-22',
    bulan: 3,
    tahun: 2026,
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.02',
    kodeSub: '5.01.01.2.02.01',
    kodeBelanja: '5.1.01.01.01.0001',
    nilai: 1120000000,
    noSP2D: '900/0303/SP2D-LS/KESBANG/2026',
    noSPM: '900/0303/SPM-LS/KESBANG/2026',
    uraian: 'Pembayaran Realisasi SP2D Bulan Maret TA 2026',
    rekanan: 'PT Bank NTB Syariah Cabang Utama Mataram',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2026-004',
    tanggal: '2026-04-15',
    bulan: 4,
    tahun: 2026,
    kodeProgram: '5.01.02',
    kodeKegiatan: '5.01.02.2.01',
    kodeSub: '5.01.02.2.01.03',
    kodeBelanja: '5.1.02.04.01.0001',
    nilai: 1080000000,
    noSP2D: '900/0404/SP2D-LS/KESBANG/2026',
    noSPM: '900/0404/SPM-LS/KESBANG/2026',
    uraian: 'Pembayaran Realisasi SP2D Bulan April TA 2026',
    rekanan: 'PT Lombok Utama Catering & Event',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2026-005',
    tanggal: '2026-05-19',
    bulan: 5,
    tahun: 2026,
    kodeProgram: '5.01.02',
    kodeKegiatan: '5.01.02.2.01',
    kodeSub: '5.01.02.2.01.03',
    kodeBelanja: '5.1.02.01.01.0052',
    nilai: 1150000000,
    noSP2D: '900/0505/SP2D-LS/KESBANG/2026',
    noSPM: '900/0505/SPM-LS/KESBANG/2026',
    uraian: 'Pembayaran Realisasi SP2D Bulan Mei TA 2026',
    rekanan: 'PT Bank NTB Syariah Cabang Utama Mataram',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2026-006',
    tanggal: '2026-06-25',
    bulan: 6,
    tahun: 2026,
    kodeProgram: '5.01.03',
    kodeKegiatan: '5.01.03.2.01',
    kodeSub: '5.01.03.2.01.02',
    kodeBelanja: '5.1.02.04.01.0003',
    nilai: 1200000000,
    noSP2D: '900/0606/SP2D-LS/KESBANG/2026',
    noSPM: '900/0606/SPM-LS/KESBANG/2026',
    uraian: 'Pembayaran Realisasi SP2D Bulan Juni TA 2026',
    rekanan: 'PT Bank NTB Syariah Cabang Utama Mataram',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2026-007',
    tanggal: '2026-07-21',
    bulan: 7,
    tahun: 2026,
    kodeProgram: '5.01.04',
    kodeKegiatan: '5.01.04.2.01',
    kodeSub: '5.01.04.2.01.01',
    kodeBelanja: '5.1.05.01.01.0002',
    nilai: 1100000000,
    noSP2D: '900/0707/SP2D-LS/KESBANG/2026',
    noSPM: '900/0707/SPM-LS/KESBANG/2026',
    uraian: 'Pembayaran Realisasi SP2D Bulan Juli TA 2026',
    rekanan: 'FKUB Provinsi NTB',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2026-008',
    tanggal: '2026-08-14',
    bulan: 8,
    tahun: 2026,
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.06',
    kodeSub: '5.01.01.2.06.02',
    kodeBelanja: '5.2.02.08.01.0005',
    nilai: 1140000000,
    noSP2D: '900/0808/SP2D-LS/KESBANG/2026',
    noSPM: '900/0808/SPM-LS/KESBANG/2026',
    uraian: 'Pembayaran Realisasi SP2D Bulan Agustus TA 2026',
    rekanan: 'CV Teknologi Nusantara Mataram',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2026-009',
    tanggal: '2026-09-28',
    bulan: 9,
    tahun: 2026,
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.01',
    kodeSub: '5.01.01.2.01.01',
    kodeBelanja: '5.1.02.01.01.0024',
    nilai: 1090000000,
    noSP2D: '900/0909/SP2D-LS/KESBANG/2026',
    noSPM: '900/0909/SPM-LS/KESBANG/2026',
    uraian: 'Pembayaran Realisasi SP2D Bulan September TA 2026',
    rekanan: 'CV Nusa Media Grafindo',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2026-010',
    tanggal: '2026-10-16',
    bulan: 10,
    tahun: 2026,
    kodeProgram: '5.01.02',
    kodeKegiatan: '5.01.02.2.01',
    kodeSub: '5.01.02.2.01.03',
    kodeBelanja: '5.1.02.04.01.0001',
    nilai: 1080000000,
    noSP2D: '900/1010/SP2D-LS/KESBANG/2026',
    noSPM: '900/1010/SPM-LS/KESBANG/2026',
    uraian: 'Pembayaran Realisasi SP2D Bulan Oktober TA 2026',
    rekanan: 'PT Bank NTB Syariah Cabang Utama Mataram',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2026-011',
    tanggal: '2026-11-20',
    bulan: 11,
    tahun: 2026,
    kodeProgram: '5.01.03',
    kodeKegiatan: '5.01.03.2.01',
    kodeSub: '5.01.03.2.01.02',
    kodeBelanja: '5.1.02.04.01.0003',
    nilai: 1060000000,
    noSP2D: '900/1111/SP2D-LS/KESBANG/2026',
    noSPM: '900/1111/SPM-LS/KESBANG/2026',
    uraian: 'Pembayaran Realisasi SP2D Bulan November TA 2026',
    rekanan: 'PT Bank NTB Syariah Cabang Utama Mataram',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  },
  {
    id: 'REAL-2026-012',
    tanggal: '2026-12-18',
    bulan: 12,
    tahun: 2026,
    kodeProgram: '5.01.01',
    kodeKegiatan: '5.01.01.2.02',
    kodeSub: '5.01.01.2.02.01',
    kodeBelanja: '5.1.01.01.01.0001',
    nilai: 1076965537,
    noSP2D: '900/1212/SP2D-LS/KESBANG/2026',
    noSPM: '900/1212/SPM-LS/KESBANG/2026',
    uraian: 'Pembayaran Realisasi SP2D Akhir Tahun Bulan Desember TA 2026',
    rekanan: 'PT Bank NTB Syariah Cabang Utama Mataram',
    operator: 'Ahmad Subadri, S.STP',
    statusValidation: 'Disetujui PPK'
  }
];

export const INITIAL_IMPORT_LOGS: ImportLog[] = [
  {
    id: 'IMP-001',
    tanggal: '2025-01-15 10:20:00',
    namaFile: 'Data_Anggaran_Murni_2025_BAKESBANGPOLDAGRI.xlsx',
    jumlahData: 7,
    operator: 'Ahmad Subadri, S.STP',
    status: 'Berhasil',
    catatan: 'Seluruh pagu program dan belanja tervalidasi 100%'
  },
  {
    id: 'IMP-002',
    tanggal: '2025-04-15 14:10:00',
    namaFile: 'Realisasi_SP2D_Triwulan_I_2025.xlsx',
    jumlahData: 5,
    operator: 'Ahmad Subadri, S.STP',
    status: 'Berhasil',
    catatan: 'Import realisasi SP2D Januari-Maret 2025'
  }
];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [
  {
    id: 'LOG-1001',
    tanggal: '2026-07-27',
    jam: '08:30:12',
    user: 'admin',
    role: 'Administrator',
    aktivitas: 'Login ke Sistem Informasi Keuangan BFMS NTB',
    ip: '180.251.12.89',
    browser: 'Chrome 126.0 (Windows NT 10.0)'
  },
  {
    id: 'LOG-1002',
    tanggal: '2026-07-27',
    jam: '09:15:20',
    user: 'operator',
    role: 'Operator Program',
    aktivitas: 'Membuat draf realisasi baru No SP2D 900/1325/SP2D-LS/KESBANG/2025',
    ip: '180.251.12.92',
    browser: 'Firefox 127.0 (Linux)'
  },
  {
    id: 'LOG-1003',
    tanggal: '2026-07-27',
    jam: '10:00:12',
    user: 'kaban',
    role: 'Kepala Badan',
    aktivitas: 'Membuka Dashboard Eksekutif & Eksport Laporan Semester I 2025 PDF',
    ip: '180.251.12.100',
    browser: 'Safari 17.4 (macOS)'
  }
];

export const INITIAL_SHEET_CONFIG: GoogleSheetConfig = {
  spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  webAppUrl: 'https://script.google.com/macros/s/AKfycbx_BAKESBANGPOLDAGRI_NTB_WEBAPP/exec',
  autoSync: true,
  lastSyncedAt: '2026-07-27 20:00:00',
  status: 'Connected'
};
