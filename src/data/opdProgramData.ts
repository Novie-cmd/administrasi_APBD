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

// Download Excel Template for Multi-OPD Import
export function downloadOPDExcelTemplate() {
  // Sheet 1: Format Ringkas (Nama OPD, Anggaran, Realisasi)
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
    },
    {
      'Kode_OPD': '4.01.0.00.0.00.01.0000',
      'Nama_OPD': 'Badan Pengelolaan Keuangan dan Aset Daerah',
      'Singkatan': 'BPKAD NTB',
      'Kategori': 'Badan Daerah',
      'Pagu_Anggaran': 148500000000,
      'Realisasi_SP2D': 122400000000,
      'Kepala_OPD': 'Drs. H. Samsul Rizal, M.M',
      'NIP_Kepala': '196905141994021003',
      'Alamat': 'Jl. Pejanggik No. 12, Mataram'
    },
    {
      'Kode_OPD': '5.01.0.00.0.00.01.0000',
      'Nama_OPD': 'Badan Kesatuan Bangsa dan Politik Dalam Negeri',
      'Singkatan': 'BAKESBANGPOLDAGRI NTB',
      'Kategori': 'Badan Daerah',
      'Pagu_Anggaran': 25450000000,
      'Realisasi_SP2D': 19850000000,
      'Kepala_OPD': 'H. Ruslan Abdul Gani, SH., MH',
      'NIP_Kepala': '196803121993031008',
      'Alamat': 'Jl. Majapahit No. 54, Mataram'
    },
    {
      'Kode_OPD': '1.03.0.00.0.00.01.0000',
      'Nama_OPD': 'Dinas Pekerjaan Umum dan Penataan Ruang',
      'Singkatan': 'PUPR NTB',
      'Kategori': 'Dinas Daerah',
      'Pagu_Anggaran': 520000000000,
      'Realisasi_SP2D': 415000000000,
      'Kepala_OPD': 'Ir. H. Mohammad Rum, MT',
      'NIP_Kepala': '196603161993031004',
      'Alamat': 'Jl. Majapahit No. 5, Mataram'
    }
  ];

  // Sheet 2: Format Rincian (Program, Kegiatan, Sub Kegiatan, dan Rekening Belanja)
  const detailRows = [
    {
      'Nama_OPD': 'Dinas Kesehatan Provinsi NTB',
      'Kode_Program': '1.02.01',
      'Nama_Program': 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI',
      'Pagu_Program': 120000000000,
      'Realisasi_Program': 98000000000,
      'Kode_Kegiatan': '1.02.01.2.01',
      'Nama_Kegiatan': 'Perencanaan, Penganggaran, dan Evaluasi Kinerja SKPD',
      'Pagu_Kegiatan': 45000000000,
      'Realisasi_Kegiatan': 38000000000,
      'Kode_Sub_Kegiatan': '1.02.01.2.01.01',
      'Nama_Sub_Kegiatan': 'Penyusunan Rencana Kerja & Anggaran SKPD',
      'Pagu_Sub_Kegiatan': 20000000000,
      'Realisasi_Sub_Kegiatan': 17500000000,
      'Kode_Rekening_Belanja': '5.1.01.01.01.0001',
      'Nama_Rekening_Belanja': 'Belanja Gaji Pokok ASN / PNS Kesehatan',
      'Jenis_Belanja': 'Belanja Operasi (Pegawai)',
      'Pagu_Belanja': 15000000000,
      'Realisasi_Belanja': 13500000000
    },
    {
      'Nama_OPD': 'Dinas Kesehatan Provinsi NTB',
      'Kode_Program': '1.02.02',
      'Nama_Program': 'PROGRAM PEMENUHAN UPAYA KESEHATAN PERORANGAN DAN MASYARAKAT',
      'Pagu_Program': 292000000000,
      'Realisasi_Program': 231000000000,
      'Kode_Kegiatan': '1.02.02.2.01',
      'Nama_Kegiatan': 'Penyediaan Layanan Kesehatan untuk UKM dan UKP Rujukan Tingkat Provinsi',
      'Pagu_Kegiatan': 180000000000,
      'Realisasi_Kegiatan': 145000000000,
      'Kode_Sub_Kegiatan': '1.02.02.2.01.01',
      'Nama_Sub_Kegiatan': 'Operasional Pelayanan Kesehatan Rumah Sakit & Puskesmas',
      'Pagu_Sub_Kegiatan': 95000000000,
      'Realisasi_Sub_Kegiatan': 78000000000,
      'Kode_Rekening_Belanja': '5.1.02.01.01.0024',
      'Nama_Rekening_Belanja': 'Belanja Bahan Medis Habis Pakai dan Obat-obatan',
      'Jenis_Belanja': 'Belanja Barang dan Jasa',
      'Pagu_Belanja': 55000000000,
      'Realisasi_Belanja': 46000000000
    },
    {
      'Nama_OPD': 'Dinas Pendidikan dan Kebudayaan Provinsi NTB',
      'Kode_Program': '1.01.01',
      'Nama_Program': 'PROGRAM PENGELOLAAN PENDIDIKAN MENENGAH & KHUSUS',
      'Pagu_Program': 450000000000,
      'Realisasi_Program': 365000000000,
      'Kode_Kegiatan': '1.01.01.2.01',
      'Nama_Kegiatan': 'Pengelolaan Sekolah Menengah Atas, SMK, dan SLB se-NTB',
      'Pagu_Kegiatan': 320000000000,
      'Realisasi_Kegiatan': 260000000000,
      'Kode_Sub_Kegiatan': '1.01.01.2.01.01',
      'Nama_Sub_Kegiatan': 'Penyediaan Sarana Pembelajaran dan Praktik Vokasi',
      'Pagu_Sub_Kegiatan': 140000000000,
      'Realisasi_Sub_Kegiatan': 115000000000,
      'Kode_Rekening_Belanja': '5.2.02.08.01.0005',
      'Nama_Rekening_Belanja': 'Belanja Modal Peralatan Laboratorium & Komputer Sekolah',
      'Jenis_Belanja': 'Belanja Modal',
      'Pagu_Belanja': 60000000000,
      'Realisasi_Belanja': 52000000000
    }
  ];

  const wb = XLSX.utils.book_new();

  // Sheet 1
  const ws1 = XLSX.utils.json_to_sheet(opdSummaryRows);
  XLSX.utils.book_append_sheet(wb, ws1, 'Rekap_OPD_Anggaran');

  // Sheet 2
  const ws2 = XLSX.utils.json_to_sheet(detailRows);
  XLSX.utils.book_append_sheet(wb, ws2, 'Rincian_Program_Kegiatan');

  XLSX.writeFile(wb, 'Format_Import_Excel_OPD_NTB_Resmi.xlsx');
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
