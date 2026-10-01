import * as XLSX from 'xlsx';
import { NTBOPDItem } from './daftarOPDNTB';

export interface OPDProgramItem {
  id: string;
  opdId: string;
  namaOPD: string;
  kodeProgram: string;
  namaProgram: string;
  pagu: number;
  realisasi: number;
}

export interface OPDKegiatanItem {
  id: string;
  opdId: string;
  namaOPD: string;
  kodeProgram: string;
  kodeKegiatan: string;
  namaKegiatan: string;
  pagu: number;
  realisasi: number;
}

export interface OPDSubKegiatanItem {
  id: string;
  opdId: string;
  namaOPD: string;
  kodeProgram: string;
  kodeKegiatan: string;
  kodeSub: string;
  namaSub: string;
  pagu: number;
  realisasi: number;
}

export interface OPDBelanjaItem {
  id: string;
  opdId: string;
  namaOPD: string;
  kodeBelanja: string;
  namaBelanja: string;
  jenisBelanja: string;
  pagu: number;
  realisasi: number;
}

// Generate realistic standard Program, Kegiatan, Sub Kegiatan, and Belanja for any given OPD
export function getOPDDetailsBreakdown(opd: NTBOPDItem) {
  const pagu = opd.targetPagu || 10000000000;
  const realisasi = opd.realisasiSP2D || 7500000000;
  const kodeP = opd.kodeOPD.split('.').slice(0, 2).join('.');

  const programs: OPDProgramItem[] = [
    {
      id: `${opd.id}-P1`,
      opdId: opd.id || '',
      namaOPD: opd.namaOPD,
      kodeProgram: `${kodeP}.01`,
      namaProgram: `PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH ${opd.singkatan}`,
      pagu: Math.round(pagu * 0.35),
      realisasi: Math.round(realisasi * 0.36)
    },
    {
      id: `${opd.id}-P2`,
      opdId: opd.id || '',
      namaOPD: opd.namaOPD,
      kodeProgram: `${kodeP}.02`,
      namaProgram: `PROGRAM PENINGKATAN PELAYANAN TEKNIS & KEBIJAKAN STRATEGIS ${opd.singkatan}`,
      pagu: Math.round(pagu * 0.40),
      realisasi: Math.round(realisasi * 0.39)
    },
    {
      id: `${opd.id}-P3`,
      opdId: opd.id || '',
      namaOPD: opd.namaOPD,
      kodeProgram: `${kodeP}.03`,
      namaProgram: `PROGRAM PENGEMBANGAN DAN INOVASI LAYANAN PUBLIK ${opd.singkatan}`,
      pagu: Math.round(pagu * 0.25),
      realisasi: Math.round(realisasi * 0.25)
    }
  ];

  const kegiatans: OPDKegiatanItem[] = [
    {
      id: `${opd.id}-K1`,
      opdId: opd.id || '',
      namaOPD: opd.namaOPD,
      kodeProgram: `${kodeP}.01`,
      kodeKegiatan: `${kodeP}.01.2.01`,
      namaKegiatan: 'Perencanaan, Penganggaran, dan Evaluasi Kinerja Perangkat Daerah',
      pagu: Math.round(pagu * 0.15),
      realisasi: Math.round(realisasi * 0.16)
    },
    {
      id: `${opd.id}-K2`,
      opdId: opd.id || '',
      namaOPD: opd.namaOPD,
      kodeProgram: `${kodeP}.01`,
      kodeKegiatan: `${kodeP}.01.2.02`,
      namaKegiatan: 'Administrasi Keuangan dan Operasional Perkantoran',
      pagu: Math.round(pagu * 0.20),
      realisasi: Math.round(realisasi * 0.20)
    },
    {
      id: `${opd.id}-K3`,
      opdId: opd.id || '',
      namaOPD: opd.namaOPD,
      kodeProgram: `${kodeP}.02`,
      kodeKegiatan: `${kodeP}.02.2.01`,
      namaKegiatan: `Pelaksanaan Program Prioritas Daerah Bidang ${opd.singkatan}`,
      pagu: Math.round(pagu * 0.40),
      realisasi: Math.round(realisasi * 0.39)
    },
    {
      id: `${opd.id}-K4`,
      opdId: opd.id || '',
      namaOPD: opd.namaOPD,
      kodeProgram: `${kodeP}.03`,
      kodeKegiatan: `${kodeP}.03.2.01`,
      namaKegiatan: 'Monitoring, Pengawasan, dan Pelaporan Akuntabilitas Kinerja',
      pagu: Math.round(pagu * 0.25),
      realisasi: Math.round(realisasi * 0.25)
    }
  ];

  const subKegiatans: OPDSubKegiatanItem[] = [
    {
      id: `${opd.id}-S1`,
      opdId: opd.id || '',
      namaOPD: opd.namaOPD,
      kodeProgram: `${kodeP}.01`,
      kodeKegiatan: `${kodeP}.01.2.01`,
      kodeSub: `${kodeP}.01.2.01.01`,
      namaSub: 'Penyusunan Dokumen Perencanaan dan Laporan Keuangan SKPD',
      pagu: Math.round(pagu * 0.15),
      realisasi: Math.round(realisasi * 0.16)
    },
    {
      id: `${opd.id}-S2`,
      opdId: opd.id || '',
      namaOPD: opd.namaOPD,
      kodeProgram: `${kodeP}.01`,
      kodeKegiatan: `${kodeP}.01.2.02`,
      kodeSub: `${kodeP}.01.2.02.01`,
      namaSub: 'Penyediaan Gaji dan Tunjangan ASN serta Operasional Rutin',
      pagu: Math.round(pagu * 0.20),
      realisasi: Math.round(realisasi * 0.20)
    },
    {
      id: `${opd.id}-S3`,
      opdId: opd.id || '',
      namaOPD: opd.namaOPD,
      kodeProgram: `${kodeP}.02`,
      kodeKegiatan: `${kodeP}.02.2.01`,
      kodeSub: `${kodeP}.02.2.01.01`,
      namaSub: `Implementasi Aksi Kegiatan Utama dan Pembinaan Teknis ${opd.singkatan}`,
      pagu: Math.round(pagu * 0.40),
      realisasi: Math.round(realisasi * 0.39)
    },
    {
      id: `${opd.id}-S4`,
      opdId: opd.id || '',
      namaOPD: opd.namaOPD,
      kodeProgram: `${kodeP}.03`,
      kodeKegiatan: `${kodeP}.03.2.01`,
      kodeSub: `${kodeP}.03.2.01.01`,
      namaSub: 'Evaluasi Capaian Kinerja dan Diseminasi Informasi Pelayanan',
      pagu: Math.round(pagu * 0.25),
      realisasi: Math.round(realisasi * 0.25)
    }
  ];

  const belanjaList: OPDBelanjaItem[] = [
    {
      id: `${opd.id}-B1`,
      opdId: opd.id || '',
      namaOPD: opd.namaOPD,
      kodeBelanja: '5.1.01.01.01.0001',
      namaBelanja: 'Belanja Gaji Pokok ASN / PNS',
      jenisBelanja: 'Belanja Operasi (Pegawai)',
      pagu: Math.round(pagu * 0.30),
      realisasi: Math.round(realisasi * 0.32)
    },
    {
      id: `${opd.id}-B2`,
      opdId: opd.id || '',
      namaOPD: opd.namaOPD,
      kodeBelanja: '5.1.02.01.01.0024',
      namaBelanja: 'Belanja Alat Tulis Kantor & Operasional Kegiatan',
      jenisBelanja: 'Belanja Barang dan Jasa',
      pagu: Math.round(pagu * 0.25),
      realisasi: Math.round(realisasi * 0.24)
    },
    {
      id: `${opd.id}-B3`,
      opdId: opd.id || '',
      namaOPD: opd.namaOPD,
      kodeBelanja: '5.1.02.04.01.0001',
      namaBelanja: 'Belanja Perjalanan Dinas Dalam Daerah & Luar Daerah',
      jenisBelanja: 'Belanja Barang dan Jasa',
      pagu: Math.round(pagu * 0.15),
      realisasi: Math.round(realisasi * 0.14)
    },
    {
      id: `${opd.id}-B4`,
      opdId: opd.id || '',
      namaOPD: opd.namaOPD,
      kodeBelanja: '5.2.02.08.01.0005',
      namaBelanja: 'Belanja Modal Peralatan Komputer & Sarana Prasarana',
      jenisBelanja: 'Belanja Modal',
      pagu: Math.round(pagu * 0.20),
      realisasi: Math.round(realisasi * 0.20)
    },
    {
      id: `${opd.id}-B5`,
      opdId: opd.id || '',
      namaOPD: opd.namaOPD,
      kodeBelanja: '5.1.05.01.01.0001',
      namaBelanja: 'Belanja Hibah / Bantuan Kepada Lembaga & Masyarakat',
      jenisBelanja: 'Belanja Hibah',
      pagu: Math.round(pagu * 0.10),
      realisasi: Math.round(realisasi * 0.10)
    }
  ];

  return { programs, kegiatans, subKegiatans, belanjaList };
}

// Download Template Anggaran Seluruh OPD (Sesuai Format Gambar Kolom M6 s.d X)
export function downloadAnggaranExcelTemplate() {
  const data = [
    {
      'Kode Sub SKPD': '1.02.0.00.0.00.01.0000',
      'Nama Sub SKPD': 'Dinas Kesehatan Provinsi NTB',
      'Kode Program': '1.02.01',
      'Nama Program': 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI',
      'Kode Kegiatan': '1.02.01.2.01',
      'Nama Kegiatan': 'Perencanaan, Penganggaran, dan Evaluasi Kinerja SKPD',
      'Kode Sub Kegiatan': '1.02.01.2.01.01',
      'Nama Sub Kegiatan': 'Penyusunan Rencana Kerja & Anggaran SKPD',
      'Kode Rekening': '5.1.01.01.01.0001',
      'Nama Rekening': 'Belanja Gaji Pokok ASN / PNS',
      'Alokasi Anggaran': 15000000000
    },
    {
      'Kode Sub SKPD': '1.02.0.00.0.00.01.0000',
      'Nama Sub SKPD': 'Dinas Kesehatan Provinsi NTB',
      'Kode Program': '1.02.02',
      'Nama Program': 'PROGRAM PEMENUHAN UPAYA KESEHATAN PERORANGAN DAN UPAYA KESEHATAN MASYARAKAT',
      'Kode Kegiatan': '1.02.02.2.01',
      'Nama Kegiatan': 'Penyediaan Fasilitas Pelayanan Kesehatan untuk UKM dan UKP Kewenangan Daerah Provinsi',
      'Kode Sub Kegiatan': '1.02.02.2.01.01',
      'Nama Sub Kegiatan': 'Pengelolaan Pelayanan Kesehatan Rujukan Rumah Sakit & Fasilitas Khusus',
      'Kode Rekening': '5.1.02.01.01.0024',
      'Nama Rekening': 'Belanja Bahan Medis Habis Pakai dan Obat-obatan Terpadu',
      'Alokasi Anggaran': 38000000000
    },
    {
      'Kode Sub SKPD': '1.01.0.00.0.00.01.0000',
      'Nama Sub SKPD': 'Dinas Pendidikan dan Kebudayaan Provinsi NTB',
      'Kode Program': '1.01.01',
      'Nama Program': 'PROGRAM PENGELOLAAN PENDIDIKAN MENENGAH & KHUSUS',
      'Kode Kegiatan': '1.01.01.2.01',
      'Nama Kegiatan': 'Pengelolaan Sekolah Menengah Atas, SMK, dan Pendidikan Khusus se-NTB',
      'Kode Sub Kegiatan': '1.01.01.2.01.01',
      'Nama Sub Kegiatan': 'Penyediaan Sarana Pembelajaran dan Praktik Vokasi Sekolah',
      'Kode Rekening': '5.2.02.08.01.0005',
      'Nama Rekening': 'Belanja Modal Peralatan Laboratorium & Komputer Sekolah',
      'Alokasi Anggaran': 60000000000
    },
    {
      'Kode Sub SKPD': '4.01.0.00.0.00.01.0000',
      'Nama Sub SKPD': 'Badan Pengelolaan Keuangan dan Aset Daerah Provinsi NTB',
      'Kode Program': '4.01.01',
      'Nama Program': 'PROGRAM PENGELOLAAN KEUANGAN DAN ASET DAERAH PROVINSI',
      'Kode Kegiatan': '4.01.01.2.01',
      'Nama Kegiatan': 'Pengelolaan Kas Daerah, Akuntansi dan Pelaporan Keuangan',
      'Kode Sub Kegiatan': '4.01.01.2.01.01',
      'Nama Sub Kegiatan': 'Penyusunan Laporan Pertanggungjawaban Pelaksanaan APBD',
      'Kode Rekening': '5.1.02.02.01.0003',
      'Nama Rekening': 'Belanja Jasa Konsultansi Perencanaan dan Audit Keuangan',
      'Alokasi Anggaran': 8500000000
    },
    {
      'Kode Sub SKPD': '5.01.0.00.0.00.01.0000',
      'Nama Sub SKPD': 'Badan Kesatuan Bangsa dan Politik Dalam Negeri Provinsi NTB',
      'Kode Program': '5.01.02',
      'Nama Program': 'PROGRAM BINA IDEOLOGI DAN WAWASAN KEBANGSAAN',
      'Kode Kegiatan': '5.01.02.2.01',
      'Nama Kegiatan': 'Perumusan Kebijakan Teknis dan Pemantapan Ketahanan Bangsa',
      'Kode Sub Kegiatan': '5.01.02.2.01.01',
      'Nama Sub Kegiatan': 'Penyelenggaraan Pendidikan Karakter Wawasan Kebangsaan Masyarakat',
      'Kode Rekening': '5.1.02.01.01.0024',
      'Nama Rekening': 'Belanja Alat Tulis Kantor dan Bahan Cetak Modul Pembinaan',
      'Alokasi Anggaran': 1200000000
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  // Set explicit column widths
  ws['!cols'] = [
    { wch: 24 }, // Kode Sub SKPD
    { wch: 42 }, // Nama Sub SKPD
    { wch: 16 }, // Kode Program
    { wch: 45 }, // Nama Program
    { wch: 20 }, // Kode Kegiatan
    { wch: 45 }, // Nama Kegiatan
    { wch: 22 }, // Kode Sub Kegiatan
    { wch: 45 }, // Nama Sub Kegiatan
    { wch: 22 }, // Kode Rekening
    { wch: 45 }, // Nama Rekening
    { wch: 20 }  // Alokasi Anggaran
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Anggaran_Seluruh_OPD');
  XLSX.writeFile(wb, 'Template_Anggaran_Seluruh_OPD_NTB.xlsx');
}

// Download Template Realisasi Seluruh OPD (Sesuai Format Gambar Kolom M6 s.d X)
export function downloadRealisasiExcelTemplate() {
  const data = [
    {
      'Kode Sub SKPD': '1.02.0.00.0.00.01.0000',
      'Nama Sub SKPD': 'Dinas Kesehatan Provinsi NTB',
      'Kode Program': '1.02.01',
      'Nama Program': 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI',
      'Kode Kegiatan': '1.02.01.2.01',
      'Nama Kegiatan': 'Perencanaan, Penganggaran, dan Evaluasi Kinerja SKPD',
      'Kode Sub Kegiatan': '1.02.01.2.01.01',
      'Nama Sub Kegiatan': 'Penyusunan Rencana Kerja & Anggaran SKPD',
      'Kode Rekening': '5.1.01.01.01.0001',
      'Nama Rekening': 'Belanja Gaji Pokok ASN / PNS',
      'Realisasi Anggaran': 13500000000
    },
    {
      'Kode Sub SKPD': '1.02.0.00.0.00.01.0000',
      'Nama Sub SKPD': 'Dinas Kesehatan Provinsi NTB',
      'Kode Program': '1.02.02',
      'Nama Program': 'PROGRAM PEMENUHAN UPAYA KESEHATAN PERORANGAN DAN UPAYA KESEHATAN MASYARAKAT',
      'Kode Kegiatan': '1.02.02.2.01',
      'Nama Kegiatan': 'Penyediaan Fasilitas Pelayanan Kesehatan untuk UKM dan UKP Kewenangan Daerah Provinsi',
      'Kode Sub Kegiatan': '1.02.02.2.01.01',
      'Nama Sub Kegiatan': 'Pengelolaan Pelayanan Kesehatan Rujukan Rumah Sakit & Fasilitas Khusus',
      'Kode Rekening': '5.1.02.01.01.0024',
      'Nama Rekening': 'Belanja Bahan Medis Habis Pakai dan Obat-obatan Terpadu',
      'Realisasi Anggaran': 31200000000
    },
    {
      'Kode Sub SKPD': '1.01.0.00.0.00.01.0000',
      'Nama Sub SKPD': 'Dinas Pendidikan dan Kebudayaan Provinsi NTB',
      'Kode Program': '1.01.01',
      'Nama Program': 'PROGRAM PENGELOLAAN PENDIDIKAN MENENGAH & KHUSUS',
      'Kode Kegiatan': '1.01.01.2.01',
      'Nama Kegiatan': 'Pengelolaan Sekolah Menengah Atas, SMK, dan Pendidikan Khusus se-NTB',
      'Kode Sub Kegiatan': '1.01.01.2.01.01',
      'Nama Sub Kegiatan': 'Penyediaan Sarana Pembelajaran dan Praktik Vokasi Sekolah',
      'Kode Rekening': '5.2.02.08.01.0005',
      'Nama Rekening': 'Belanja Modal Peralatan Laboratorium & Komputer Sekolah',
      'Realisasi Anggaran': 52000000000
    },
    {
      'Kode Sub SKPD': '4.01.0.00.0.00.01.0000',
      'Nama Sub SKPD': 'Badan Pengelolaan Keuangan dan Aset Daerah Provinsi NTB',
      'Kode Program': '4.01.01',
      'Nama Program': 'PROGRAM PENGELOLAAN KEUANGAN DAN ASET DAERAH PROVINSI',
      'Kode Kegiatan': '4.01.01.2.01',
      'Nama Kegiatan': 'Pengelolaan Kas Daerah, Akuntansi dan Pelaporan Keuangan',
      'Kode Sub Kegiatan': '4.01.01.2.01.01',
      'Nama Sub Kegiatan': 'Penyusunan Laporan Pertanggungjawaban Pelaksanaan APBD',
      'Kode Rekening': '5.1.02.02.01.0003',
      'Nama Rekening': 'Belanja Jasa Konsultansi Perencanaan dan Audit Keuangan',
      'Realisasi Anggaran': 7100000000
    },
    {
      'Kode Sub SKPD': '5.01.0.00.0.00.01.0000',
      'Nama Sub SKPD': 'Badan Kesatuan Bangsa dan Politik Dalam Negeri Provinsi NTB',
      'Kode Program': '5.01.02',
      'Nama Program': 'PROGRAM BINA IDEOLOGI DAN WAWASAN KEBANGSAAN',
      'Kode Kegiatan': '5.01.02.2.01',
      'Nama Kegiatan': 'Perumusan Kebijakan Teknis dan Pemantapan Ketahanan Bangsa',
      'Kode Sub Kegiatan': '5.01.02.2.01.01',
      'Nama Sub Kegiatan': 'Penyelenggaraan Pendidikan Karakter Wawasan Kebangsaan Masyarakat',
      'Kode Rekening': '5.1.02.01.01.0024',
      'Nama Rekening': 'Belanja Alat Tulis Kantor dan Bahan Cetak Modul Pembinaan',
      'Realisasi Anggaran': 950000000
    }
  ];

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [
    { wch: 24 }, // Kode Sub SKPD
    { wch: 42 }, // Nama Sub SKPD
    { wch: 16 }, // Kode Program
    { wch: 45 }, // Nama Program
    { wch: 20 }, // Kode Kegiatan
    { wch: 45 }, // Nama Kegiatan
    { wch: 22 }, // Kode Sub Kegiatan
    { wch: 45 }, // Nama Sub Kegiatan
    { wch: 22 }, // Kode Rekening
    { wch: 45 }, // Nama Rekening
    { wch: 20 }  // Realisasi Anggaran
  ];
  XLSX.utils.book_append_sheet(wb, ws, 'Realisasi_Seluruh_OPD');
  XLSX.writeFile(wb, 'Template_Realisasi_Seluruh_OPD_NTB.xlsx');
}

// Download Template Format SIPD Asli Kolom A s.d X (Data Mulai dari Baris 6 Kolom M6 s.d X)
export function downloadSIPDColumnMtoXTemplate() {
  const aoa: any[][] = [
    ['PEMERINTAH PROVINSI NUSA TENGGARA BARAT'],
    ['LAPORAN PENJABARAN ANGGARAN & REALISASI KAS DAERAH (SIPD-RI)'],
    ['TAHUN ANGGARAN 2026'],
    [''],
    [''] // row 5 (empty spacing)
  ];

  // Row 6 (Index 5 in 0-based array): Header starting from Column A to X
  // Col A-L: Metatada Urusan & SKPD Induk
  // Col M-X: Target Data yang diambil
  const headerRow: string[] = [
    'Tahun',            // Col A (0)
    'Kode Urusan',      // Col B (1)
    'Nama Urusan',      // Col C (2)
    'Kode Bidang',      // Col D (3)
    'Nama Bidang',      // Col E (4)
    'Kode SKPD Induk',  // Col F (5)
    'Nama SKPD Induk',  // Col G (6)
    'Kode Unit',        // Col H (7)
    'Nama Unit',        // Col I (8)
    'Kode Sub Unit',    // Col J (9)
    'Nama Sub Unit',    // Col K (10)
    'Sumber Dana',      // Col L (11)
    'Kode Sub SKPD',    // Col M (12)
    'Nama Sub SKPD',    // Col N (13)
    'Kode Program',     // Col O (14)
    'Nama Program',     // Col P (15)
    'Kode Kegiatan',    // Col Q (16)
    'Nama Kegiatan',    // Col R (17)
    'Kode Sub Kegiatan',// Col S (18)
    'Nama Sub Kegiatan',// Col T (19)
    'Kode Rekening',    // Col U (20)
    'Nama Rekening',    // Col V (21)
    'Alokasi Anggaran', // Col W (22)
    'Realisasi Anggaran'// Col X (23)
  ];
  aoa.push(headerRow);

  // Sample data rows starting from row 7 (index 6)
  aoa.push([
    2026, '1', 'URUSAN PEMERINTAHAN WAJIB', '1.02', 'KESEHATAN', '1.02.0.00.0.00.01.0000', 'Dinas Kesehatan NTB', '1.02.0.00.0.00.01.0000', 'Dinas Kesehatan', '01', 'Sekretariat Dinkes', 'DAU',
    '1.02.0.00.0.00.01.0000', 'Dinas Kesehatan Provinsi NTB', '1.02.01', 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI',
    '1.02.01.2.01', 'Perencanaan, Penganggaran, dan Evaluasi Kinerja SKPD', '1.02.01.2.01.01', 'Penyusunan Rencana Kerja & Anggaran SKPD',
    '5.1.01.01.01.0001', 'Belanja Gaji Pokok ASN / PNS', 15000000000, 13500000000
  ]);
  aoa.push([
    2026, '1', 'URUSAN PEMERINTAHAN WAJIB', '1.02', 'KESEHATAN', '1.02.0.00.0.00.01.0000', 'Dinas Kesehatan NTB', '1.02.0.00.0.00.01.0000', 'Dinas Kesehatan', '02', 'Bidang Yankes', 'DAK Non Fisik',
    '1.02.0.00.0.00.01.0000', 'Dinas Kesehatan Provinsi NTB', '1.02.02', 'PROGRAM PEMENUHAN UPAYA KESEHATAN PERORANGAN DAN MASYARAKAT',
    '1.02.02.2.01', 'Penyediaan Fasilitas Pelayanan Kesehatan Rujukan', '1.02.02.2.01.01', 'Pengelolaan Pelayanan Kesehatan Rumah Sakit & Fasilitas Khusus',
    '5.1.02.01.01.0024', 'Belanja Bahan Medis Habis Pakai dan Obat-obatan Terpadu', 38000000000, 31200000000
  ]);
  aoa.push([
    2026, '1', 'URUSAN PEMERINTAHAN WAJIB', '1.01', 'PENDIDIKAN', '1.01.0.00.0.00.01.0000', 'Dinas Dikbud NTB', '1.01.0.00.0.00.01.0000', 'Dinas Dikbud', '01', 'Bidang SMA/SMK', 'DAK Fisik',
    '1.01.0.00.0.00.01.0000', 'Dinas Pendidikan dan Kebudayaan Provinsi NTB', '1.01.01', 'PROGRAM PENGELOLAAN PENDIDIKAN MENENGAH & KHUSUS',
    '1.01.01.2.01', 'Pengelolaan Sekolah Menengah Atas, SMK se-NTB', '1.01.01.2.01.01', 'Penyediaan Sarana Pembelajaran dan Praktik Vokasi',
    '5.2.02.08.01.0005', 'Belanja Modal Peralatan Komputer dan Server Sekolah', 60000000000, 52000000000
  ]);
  aoa.push([
    2026, '5', 'URUSAN PEMERINTAHAN UMUM', '5.01', 'KESATUAN BANGSA', '5.01.0.00.0.00.01.0000', 'Bakesbangpoldagri NTB', '5.01.0.00.0.00.01.0000', 'Bakesbangpoldagri', '01', 'Bidang Ideologi', 'PAD',
    '5.01.0.00.0.00.01.0000', 'Badan Kesatuan Bangsa dan Politik Dalam Negeri Provinsi NTB', '5.01.02', 'PROGRAM BINA IDEOLOGI DAN WAWASAN KEBANGSAAN',
    '5.01.02.2.01', 'Perumusan Kebijakan Teknis Ketahanan Bangsa', '5.01.02.2.01.01', 'Penyelenggaraan Pendidikan Karakter Wawasan Kebangsaan',
    '5.1.02.01.01.0024', 'Belanja Alat Tulis Kantor dan Bahan Cetak Modul', 1200000000, 950000000
  ]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  XLSX.utils.book_append_sheet(wb, ws, 'Format_SIPD_M6_sd_X');
  XLSX.writeFile(wb, 'Template_SIPD_Kolom_A_sd_X_NTB.xlsx');
}

// Download Excel Template for Multi-OPD Import (Universal Multi-Sheet)
export function downloadOPDExcelTemplate() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Format Anggaran Seluruh OPD (Sesuai Gambar User Kolom M6 s.d X)
  const wsAnggaran = XLSX.utils.json_to_sheet([
    {
      'Kode Sub SKPD': '1.02.0.00.0.00.01.0000',
      'Nama Sub SKPD': 'Dinas Kesehatan Provinsi NTB',
      'Kode Program': '1.02.01',
      'Nama Program': 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI',
      'Kode Kegiatan': '1.02.01.2.01',
      'Nama Kegiatan': 'Perencanaan, Penganggaran, dan Evaluasi Kinerja SKPD',
      'Kode Sub Kegiatan': '1.02.01.2.01.01',
      'Nama Sub Kegiatan': 'Penyusunan Rencana Kerja & Anggaran SKPD',
      'Kode Rekening': '5.1.01.01.01.0001',
      'Nama Rekening': 'Belanja Gaji Pokok ASN / PNS',
      'Alokasi Anggaran': 15000000000
    },
    {
      'Kode Sub SKPD': '1.01.0.00.0.00.01.0000',
      'Nama Sub SKPD': 'Dinas Pendidikan dan Kebudayaan Provinsi NTB',
      'Kode Program': '1.01.01',
      'Nama Program': 'PROGRAM PENGELOLAAN PENDIDIKAN MENENGAH & KHUSUS',
      'Kode Kegiatan': '1.01.01.2.01',
      'Nama Kegiatan': 'Pengelolaan Sekolah Menengah Atas, SMK, dan SLB se-NTB',
      'Kode Sub Kegiatan': '1.01.01.2.01.01',
      'Nama Sub Kegiatan': 'Penyediaan Sarana Pembelajaran dan Praktik Vokasi',
      'Kode Rekening': '5.2.02.08.01.0005',
      'Nama Rekening': 'Belanja Modal Peralatan Laboratorium & Komputer Sekolah',
      'Alokasi Anggaran': 60000000000
    },
    {
      'Kode Sub SKPD': '4.01.0.00.0.00.01.0000',
      'Nama Sub SKPD': 'Badan Pengelolaan Keuangan dan Aset Daerah Provinsi NTB',
      'Kode Program': '4.01.01',
      'Nama Program': 'PROGRAM PENGELOLAAN KEUANGAN DAN ASET DAERAH',
      'Kode Kegiatan': '4.01.01.2.01',
      'Nama Kegiatan': 'Pengelolaan Kas Daerah dan Akuntansi Keuangan',
      'Kode Sub Kegiatan': '4.01.01.2.01.01',
      'Nama Sub Kegiatan': 'Penyusunan Laporan Pertanggungjawaban APBD',
      'Kode Rekening': '5.1.02.02.01.0003',
      'Nama Rekening': 'Belanja Jasa Konsultansi Perencanaan',
      'Alokasi Anggaran': 8500000000
    },
    {
      'Kode Sub SKPD': '5.01.0.00.0.00.01.0000',
      'Nama Sub SKPD': 'Badan Kesatuan Bangsa dan Politik Dalam Negeri Provinsi NTB',
      'Kode Program': '5.01.02',
      'Nama Program': 'PROGRAM BINA IDEOLOGI DAN WAWASAN KEBANGSAAN',
      'Kode Kegiatan': '5.01.02.2.01',
      'Nama Kegiatan': 'Perumusan Kebijakan Teknis Kebangsaan',
      'Kode Sub Kegiatan': '5.01.02.2.01.01',
      'Nama Sub Kegiatan': 'Penyelenggaraan Pendidikan Karakter Wawasan Kebangsaan',
      'Kode Rekening': '5.1.02.01.01.0024',
      'Nama Rekening': 'Belanja Alat Tulis Kantor dan Bahan Cetak',
      'Alokasi Anggaran': 1200000000
    },
    {
      'Kode Sub SKPD': '1.03.0.00.0.00.01.0000',
      'Nama Sub SKPD': 'Dinas Pekerjaan Umum dan Penataan Ruang Provinsi NTB',
      'Kode Program': '1.03.01',
      'Nama Program': 'PROGRAM PENYELENGGARAAN JALAN DAN JEMBATAN PROVINSI',
      'Kode Kegiatan': '1.03.01.2.01',
      'Nama Kegiatan': 'Pembangunan dan Pemeliharaan Berkala Jalan Provinsi',
      'Kode Sub Kegiatan': '1.03.01.2.01.01',
      'Nama Sub Kegiatan': 'Rekonstruksi dan Rehabilitasi Jalan Koridor Strategis NTB',
      'Kode Rekening': '5.2.04.01.01.0001',
      'Nama Rekening': 'Belanja Modal Jalan, Irigasi dan Jaringan Jalan Aspal Hotmix',
      'Alokasi Anggaran': 85000000000
    }
  ]);
  XLSX.utils.book_append_sheet(wb, wsAnggaran, 'Anggaran_Seluruh_OPD');

  // Sheet 2: Format Realisasi Seluruh OPD (Sesuai Gambar User Kolom M6 s.d X)
  const wsRealisasi = XLSX.utils.json_to_sheet([
    {
      'Kode Sub SKPD': '1.02.0.00.0.00.01.0000',
      'Nama Sub SKPD': 'Dinas Kesehatan Provinsi NTB',
      'Kode Program': '1.02.01',
      'Nama Program': 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI',
      'Kode Kegiatan': '1.02.01.2.01',
      'Nama Kegiatan': 'Perencanaan, Penganggaran, dan Evaluasi Kinerja SKPD',
      'Kode Sub Kegiatan': '1.02.01.2.01.01',
      'Nama Sub Kegiatan': 'Penyusunan Rencana Kerja & Anggaran SKPD',
      'Kode Rekening': '5.1.01.01.01.0001',
      'Nama Rekening': 'Belanja Gaji Pokok ASN / PNS',
      'Realisasi Anggaran': 13500000000
    },
    {
      'Kode Sub SKPD': '1.01.0.00.0.00.01.0000',
      'Nama Sub SKPD': 'Dinas Pendidikan dan Kebudayaan Provinsi NTB',
      'Kode Program': '1.01.01',
      'Nama Program': 'PROGRAM PENGELOLAAN PENDIDIKAN MENENGAH & KHUSUS',
      'Kode Kegiatan': '1.01.01.2.01',
      'Nama Kegiatan': 'Pengelolaan Sekolah Menengah Atas, SMK, dan SLB se-NTB',
      'Kode Sub Kegiatan': '1.01.01.2.01.01',
      'Nama Sub Kegiatan': 'Penyediaan Sarana Pembelajaran dan Praktik Vokasi',
      'Kode Rekening': '5.2.02.08.01.0005',
      'Nama Rekening': 'Belanja Modal Peralatan Laboratorium & Komputer Sekolah',
      'Realisasi Anggaran': 52000000000
    },
    {
      'Kode Sub SKPD': '4.01.0.00.0.00.01.0000',
      'Nama Sub SKPD': 'Badan Pengelolaan Keuangan dan Aset Daerah Provinsi NTB',
      'Kode Program': '4.01.01',
      'Nama Program': 'PROGRAM PENGELOLAAN KEUANGAN DAN ASET DAERAH',
      'Kode Kegiatan': '4.01.01.2.01',
      'Nama Kegiatan': 'Pengelolaan Kas Daerah dan Akuntansi Keuangan',
      'Kode Sub Kegiatan': '4.01.01.2.01.01',
      'Nama Sub Kegiatan': 'Penyusunan Laporan Pertanggungjawaban APBD',
      'Kode Rekening': '5.1.02.02.01.0003',
      'Nama Rekening': 'Belanja Jasa Konsultansi Perencanaan',
      'Realisasi Anggaran': 7100000000
    },
    {
      'Kode Sub SKPD': '5.01.0.00.0.00.01.0000',
      'Nama Sub SKPD': 'Badan Kesatuan Bangsa dan Politik Dalam Negeri Provinsi NTB',
      'Kode Program': '5.01.02',
      'Nama Program': 'PROGRAM BINA IDEOLOGI DAN WAWASAN KEBANGSAAN',
      'Kode Kegiatan': '5.01.02.2.01',
      'Nama Kegiatan': 'Perumusan Kebijakan Teknis Kebangsaan',
      'Kode Sub Kegiatan': '5.01.02.2.01.01',
      'Nama Sub Kegiatan': 'Penyelenggaraan Pendidikan Karakter Wawasan Kebangsaan',
      'Kode Rekening': '5.1.02.01.01.0024',
      'Nama Rekening': 'Belanja Alat Tulis Kantor dan Bahan Cetak',
      'Realisasi Anggaran': 950000000
    },
    {
      'Kode Sub SKPD': '1.03.0.00.0.00.01.0000',
      'Nama Sub SKPD': 'Dinas Pekerjaan Umum dan Penataan Ruang Provinsi NTB',
      'Kode Program': '1.03.01',
      'Nama Program': 'PROGRAM PENYELENGGARAAN JALAN DAN JEMBATAN PROVINSI',
      'Kode Kegiatan': '1.03.01.2.01',
      'Nama Kegiatan': 'Pembangunan dan Pemeliharaan Berkala Jalan Provinsi',
      'Kode Sub Kegiatan': '1.03.01.2.01.01',
      'Nama Sub Kegiatan': 'Rekonstruksi dan Rehabilitasi Jalan Koridor Strategis NTB',
      'Kode Rekening': '5.2.04.01.01.0001',
      'Nama Rekening': 'Belanja Modal Jalan, Irigasi dan Jaringan Jalan Aspal Hotmix',
      'Realisasi Anggaran': 68500000000
    }
  ]);
  XLSX.utils.book_append_sheet(wb, wsRealisasi, 'Realisasi_Seluruh_OPD');

  // Sheet 3: Rekap Ringkas Master OPD
  const opdSummaryRows = [
    {
      'Kode_OPD': '1.02.0.00.0.00.01.0000',
      'Nama_OPD': 'Dinas Kesehatan Provinsi NTB',
      'Singkatan': 'DINKES NTB',
      'Kategori': 'Dinas Daerah',
      'Pagu_Anggaran': 412000000000,
      'Realisasi_SP2D': 329000000000,
      'Kepala_OPD': 'dr. H. Lalu Hamzi Fikri, MM., MARS',
      'NIP_Kepala': '197406152002121006',
      'Alamat': 'Jl. Amir Hamzah No. 103, Mataram'
    },
    {
      'Kode_OPD': '1.01.0.00.0.00.01.0000',
      'Nama_OPD': 'Dinas Pendidikan dan Kebudayaan Provinsi NTB',
      'Singkatan': 'DIKBUD NTB',
      'Kategori': 'Dinas Daerah',
      'Pagu_Anggaran': 685000000000,
      'Realisasi_SP2D': 541000000000,
      'Kepala_OPD': 'Dr. H. Aidy Furqan, M.Pd',
      'NIP_Kepala': '197108171997021001',
      'Alamat': 'Jl. Pendidikan No. 19A, Mataram'
    }
  ];
  const wsSummary = XLSX.utils.json_to_sheet(opdSummaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Rekap_Katalog_OPD');

  XLSX.writeFile(wb, 'Format_Import_Excel_Anggaran_Realisasi_OPD_NTB.xlsx');
}

// Universal Excel Exporter for reports
export function exportReportToExcel(
  filename: string,
  sheetName: string,
  title: string,
  headers: string[],
  rows: (string | number)[][]
) {
  const data: (string | number)[][] = [
    [title.toUpperCase()],
    [`Tanggal Unduh: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`],
    [],
    headers,
    ...rows
  ];

  const ws = XLSX.utils.aoa_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31));
  XLSX.writeFile(wb, `${filename}.xlsx`);
}
