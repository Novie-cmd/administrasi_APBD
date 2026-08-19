import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import * as XLSX from 'xlsx';
import {
  extractCode,
  parseNumber,
  parseExcelDate,
  makeRealisasiCompositeKey,
  parseRealisasiFromExcelData
} from '../../utils/codeUtils';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Download,
  ArrowRight,
  RefreshCw,
  FileCheck,
  Info,
  Trash2,
  Database,
  AlertCircle,
  Plus,
  Layers,
  ArrowDown,
  FileText,
  Search,
  Check,
  Eye,
  ArrowUpRight
} from 'lucide-react';

interface PreviewRow {
  globalRowNum: number;
  fileIndex: number;
  sourceFileName: string;
  localRowNum: number;
  dbTargetRowNum: number;
  tahun: number;
  program: string;
  kegiatan: string;
  sub: string;
  namaSub: string;
  belanja: string;
  namaBelanja: string;
  sp2d: string;
  spm: string;
  nilai: number;
  uraian: string;
  rekanan: string;
  tanggal: string;
  isValid: boolean;
  isDuplicate: boolean;
  validationError?: string;
}

interface QueuedFileInfo {
  index: number;
  fileName: string;
  totalRows: number;
  validRows: number;
  startGlobalRow: number;
  endGlobalRow: number;
}

export const UploadExcelView: React.FC = () => {
  const {
    selectedTahun,
    batchImportExcel,
    importLogs,
    realisasiList,
    deleteRealisasi,
    clearRealisasiDatabase
  } = useApp();

  const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
  const [fileQueue, setFileQueue] = useState<QueuedFileInfo[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overwriteMode, setOverwriteMode] = useState<boolean>(false);
  const [ignoreDuplicateWarnings, setIgnoreDuplicateWarnings] = useState<boolean>(false);
  const [showClearModal, setShowClearModal] = useState<boolean>(false);
  const [dbSearchQuery, setDbSearchQuery] = useState<string>('');
  const [importResult, setImportResult] = useState<{
    successCount: number;
    duplicateCount: number;
    errors: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const appendFileInputRef = useRef<HTMLInputElement>(null);

  const currentYearRealisasi = realisasiList.filter(
    r => Number(r.tahun) === Number(selectedTahun)
  );

  const totalOtherYearsCount = realisasiList.length - currentYearRealisasi.length;
  const totalRealisasiNominal = currentYearRealisasi.reduce((acc, r) => acc + (Number(r.nilai) || 0), 0);

  // Filtered live database rows
  const filteredDbRealisasi = currentYearRealisasi.filter(r => {
    if (!dbSearchQuery.trim()) return true;
    const q = dbSearchQuery.toLowerCase();
    return (
      (r.noSP2D && r.noSP2D.toLowerCase().includes(q)) ||
      (r.noSPM && r.noSPM.toLowerCase().includes(q)) ||
      (r.kodeBelanja && r.kodeBelanja.toLowerCase().includes(q)) ||
      (r.kodeSub && r.kodeSub.toLowerCase().includes(q)) ||
      (r.uraian && r.uraian.toLowerCase().includes(q)) ||
      (r.rekanan && r.rekanan.toLowerCase().includes(q)) ||
      (r.tanggal && r.tanggal.toLowerCase().includes(q))
    );
  });

  // Existing composite keys for instant duplicate detection in preview
  const existingKeySet = new Set(
    overwriteMode
      ? []
      : currentYearRealisasi.map(r =>
          makeRealisasiCompositeKey(
            r.noSP2D,
            r.kodeBelanja,
            r.kodeSub,
            r.nilai,
            r.uraian,
            r.tahun
          )
        )
  );

  // Process files sequentially
  const processFiles = async (
    files: FileList | File[],
    append: boolean = false
  ) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setImportResult(null);

    try {
      const fileListArray = Array.from(files);
      let existingRows = append ? [...previewData] : [];
      let currentFileQueue: QueuedFileInfo[] = append ? [...fileQueue] : [];
      const seenBatchKeys = new Set<string>();

      // Populate seen keys from existing preview data if appending
      if (append) {
        existingRows.forEach(r => {
          const k = makeRealisasiCompositeKey(
            r.sp2d,
            r.belanja,
            r.sub,
            r.nilai,
            r.uraian,
            r.tahun
          );
          if (k) seenBatchKeys.add(k);
        });
      }

      const startingFileIndex = append ? currentFileQueue.length + 1 : 1;
      let runningGlobalRowNum = existingRows.length;
      const baseDbCount = overwriteMode ? 0 : currentYearRealisasi.length;

      for (let fIdx = 0; fIdx < fileListArray.length; fIdx++) {
        const file = fileListArray[fIdx];
        const actualFileNumber = startingFileIndex + fIdx;

        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const sheet2D: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        const sheetJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        const rawResults = parseRealisasiFromExcelData(sheet2D, sheetJson, selectedTahun);
        const startRowForFile = runningGlobalRowNum + 1;

        const fileParsedRows: PreviewRow[] = rawResults.map(r => {
          runningGlobalRowNum++;
          const rowThn = r.tahun || selectedTahun;
          const key = makeRealisasiCompositeKey(
            r.noSP2D,
            r.kodeBelanja,
            r.kodeSub,
            r.nilai,
            r.uraian,
            rowThn
          );
          const isDup = key ? (existingKeySet.has(key) || seenBatchKeys.has(key)) : false;
          if (key && !isDup) {
            seenBatchKeys.add(key);
          }

          let err = '';
          if (r.nilai <= 0) err = 'Nilai realisasi harus > 0.';
          else if (isDup && !overwriteMode) err = 'Data Realisasi ini duplikat dengan database/file sebelumnya.';

          return {
            globalRowNum: runningGlobalRowNum,
            fileIndex: actualFileNumber,
            sourceFileName: file.name,
            localRowNum: r.rowNum,
            dbTargetRowNum: baseDbCount + runningGlobalRowNum,
            tahun: rowThn,
            program: r.kodeProgram,
            kegiatan: r.kodeKegiatan,
            sub: r.kodeSub,
            namaSub: r.namaSub,
            belanja: r.kodeBelanja,
            namaBelanja: r.namaBelanja,
            sp2d: r.noSP2D,
            spm: r.noSPM,
            nilai: r.nilai,
            uraian: r.uraian,
            rekanan: r.rekanan,
            tanggal: r.tanggal,
            isValid: !err,
            isDuplicate: isDup,
            validationError: err
          };
        });

        existingRows = [...existingRows, ...fileParsedRows];

        currentFileQueue.push({
          index: actualFileNumber,
          fileName: file.name,
          totalRows: fileParsedRows.length,
          validRows: fileParsedRows.filter(r => r.isValid).length,
          startGlobalRow: startRowForFile,
          endGlobalRow: runningGlobalRowNum
        });
      }

      setPreviewData(existingRows);
      setFileQueue(currentFileQueue);
    } catch (error) {
      console.error('Failed to parse Excel files:', error);
      alert('Gagal membaca file Excel. Pastikan format file .xlsx / .xls / .csv valid.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (appendFileInputRef.current) appendFileInputRef.current.value = '';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files, false);
    }
  };

  const handleAppendFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files, true);
    }
  };

  const handleClearPreview = () => {
    setPreviewData([]);
    setFileQueue([]);
    setImportResult(null);
  };

  const handleExecuteImport = () => {
    const validRows = previewData
      .filter(r => (ignoreDuplicateWarnings ? r.nilai > 0 : r.isValid))
      .map(r => ({
        tahun: r.tahun,
        kodeProgram: r.program,
        kodeKegiatan: r.kegiatan,
        kodeSub: r.sub,
        kodeBelanja: r.belanja,
        namaBelanja: r.namaBelanja,
        sp2d: r.sp2d,
        spm: r.spm,
        nilai: r.nilai,
        uraian: r.uraian,
        rekanan: r.rekanan,
        tanggal: r.tanggal
      }));

    if (validRows.length === 0) {
      alert('Tidak ada data valid yang dapat diimpor.');
      return;
    }

    const summaryFileName =
      fileQueue.length === 1
        ? fileQueue[0].fileName
        : fileQueue.length > 1
        ? `${fileQueue.length} File Berurutan (${fileQueue.map(f => f.fileName).join(', ')})`
        : 'Data_Import_Realisasi.xlsx';

    const res = batchImportExcel(
      validRows,
      summaryFileName,
      overwriteMode
    );

    setImportResult(res);
    setPreviewData([]);
    setFileQueue([]);
  };

  const downloadSampleTemplate = () => {
    const wb = XLSX.utils.book_new();

    // 1. Sheet Clean Standard Format (DATABASE_REALISASI_SP2D)
    const cleanStandardData = [
      {
        No: 1,
        Tahun: selectedTahun,
        Tanggal: `${selectedTahun}-01-15`,
        'No SP2D': `900/0101/SP2D-LS/KESBANG/${selectedTahun}`,
        'No SPM': `900/0101/SPM-LS/KESBANG/${selectedTahun}`,
        'Kode Sub Kegiatan': '5.01.01.2.01.01',
        'Nama Sub Kegiatan': 'Penyusunan Dokumen Perencanaan dan Evaluasi Kinerja Perangkat Daerah',
        'Kode Belanja': '5.1.02.01.01.0024',
        'Nama Belanja': 'Belanja Alat/Bahan untuk Kegiatan Kantor-Alat Tulis Kantor',
        'Nilai Realisasi (Rp)': 12500000,
        'Uraian Realisasi': 'Pembayaran Pengadaan ATK dan Cetak Laporan Perencanaan Bulan Januari',
        'Nama Rekanan / Penyedia': 'CV Cahaya Gemilang',
        'Keterangan / Bank': 'Bank NTB Syariah - NPWP 01.234.567.8-901.000'
      },
      {
        No: 2,
        Tahun: selectedTahun,
        Tanggal: `${selectedTahun}-01-25`,
        'No SP2D': `900/0102/SP2D-LS/KESBANG/${selectedTahun}`,
        'No SPM': `900/0102/SPM-LS/KESBANG/${selectedTahun}`,
        'Kode Sub Kegiatan': '5.01.01.2.02.01',
        'Nama Sub Kegiatan': 'Penyediaan Gaji dan Tunjangan ASN',
        'Kode Belanja': '5.1.01.02.01.0001',
        'Nama Belanja': 'Belanja Tambahan Penghasilan berdasarkan Beban Kerja PNS',
        'Nilai Realisasi (Rp)': 450000000,
        'Uraian Realisasi': 'Pembayaran TPP ASN Bakesbangpoldagri NTB Bulan Januari',
        'Nama Rekanan / Penyedia': 'Bendahara Pengeluaran Bakesbangpoldagri',
        'Keterangan / Bank': 'Bank NTB Syariah'
      },
      {
        No: 3,
        Tahun: selectedTahun,
        Tanggal: `${selectedTahun}-02-10`,
        'No SP2D': `900/0201/SP2D-LS/KESBANG/${selectedTahun}`,
        'No SPM': `900/0201/SPM-LS/KESBANG/${selectedTahun}`,
        'Kode Sub Kegiatan': '5.01.01.2.01.01',
        'Nama Sub Kegiatan': 'Penyusunan Dokumen Perencanaan dan Evaluasi Kinerja Perangkat Daerah',
        'Kode Belanja': '5.1.02.01.01.0024',
        'Nama Belanja': 'Belanja Alat/Bahan untuk Kegiatan Kantor-Alat Tulis Kantor',
        'Nilai Realisasi (Rp)': 15000000,
        'Uraian Realisasi': 'Pengadaan ATK Kegiatan Perencanaan Bulan Februari',
        'Nama Rekanan / Penyedia': 'CV Cahaya Gemilang',
        'Keterangan / Bank': 'Bank NTB Syariah'
      },
      {
        No: 4,
        Tahun: selectedTahun,
        Tanggal: `${selectedTahun}-03-18`,
        'No SP2D': `900/0301/SP2D-LS/KESBANG/${selectedTahun}`,
        'No SPM': `900/0301/SPM-LS/KESBANG/${selectedTahun}`,
        'Kode Sub Kegiatan': '5.01.01.2.01.01',
        'Nama Sub Kegiatan': 'Penyusunan Dokumen Perencanaan dan Evaluasi Kinerja Perangkat Daerah',
        'Kode Belanja': '5.1.02.01.01.0025',
        'Nama Belanja': 'Belanja Kertas dan Cover Cetakan Laporan',
        'Nilai Realisasi (Rp)': 22500000,
        'Uraian Realisasi': 'Cetak Laporan Kinerja Instansi Bulan Maret',
        'Nama Rekanan / Penyedia': 'PT Percetakan Grafika NTB',
        'Keterangan / Bank': 'Bank NTB Syariah Mataram'
      },
      {
        No: 5,
        Tahun: selectedTahun,
        Tanggal: `${selectedTahun}-04-20`,
        'No SP2D': `900/0401/SP2D-LS/KESBANG/${selectedTahun}`,
        'No SPM': `900/0401/SPM-LS/KESBANG/${selectedTahun}`,
        'Kode Sub Kegiatan': '5.01.02.2.01.03',
        'Nama Sub Kegiatan': 'Fasilitasi Forum Kerukunan Umat Beragama (FKUB)',
        'Kode Belanja': '5.1.02.04.01.0001',
        'Nama Belanja': 'Belanja Jasa Tenaga Ahli / Narasumber',
        'Nilai Realisasi (Rp)': 35000000,
        'Uraian Realisasi': 'Honorarium dan Fasilitasi Kegiatan Pembinaan FKUB Bulan April',
        'Nama Rekanan / Penyedia': 'Forum Kerukunan Umat Beragama NTB',
        'Keterangan / Bank': 'Bank NTB Syariah'
      }
    ];
    const wsStandard = XLSX.utils.json_to_sheet(cleanStandardData);
    XLSX.utils.book_append_sheet(wb, wsStandard, 'DATABASE_REALISASI_SP2D');

    // 2. Sheet Layout Q6-AQ6 (SIPD NTB Standar)
    const m6Data2D: any[][] = [
      ['PEMERINTAH PROVINSI NUSA TENGGARA BARAT'],
      ['BADAN KESATUAN BANGSA DAN POLITIK DALAM NEGERI (BAKESBANGPOLDAGRI)'],
      [`TEMPLATE IMPLEMENTASI IMPORT REALISASI SP2D SIPD - TAHUN ANGGARAN ${selectedTahun}`],
      ['Format Urutan Kolom: Q6 (Kode Sub) | R6 (Nama Sub) | S6 (Kode Belanja) | T6 (Nama Belanja) | AA6 (Nilai Realisasi) | AP6 (No SP2D) | AQ6 (Tanggal SP2D) | AO6 (No SPM) | Z6 (Uraian) | AD6 (Rekanan) | AE6 (Keterangan)'],
      [''],
      [] // Row 6 (index 5)
    ];

    // Populate Row 6 Header
    m6Data2D[5][0] = 'No';
    m6Data2D[5][1] = 'Tahun';
    m6Data2D[5][16] = 'Kode Sub Kegiatan'; // Col Q (index 16)
    m6Data2D[5][17] = 'Nama Sub Kegiatan'; // Col R (index 17)
    m6Data2D[5][18] = 'Kode Rekening Belanja'; // Col S (index 18)
    m6Data2D[5][19] = 'Nama Rekening Belanja'; // Col T (index 19)
    m6Data2D[5][25] = 'Uraian Transaksi / Pekerjaan'; // Col Z (index 25)
    m6Data2D[5][26] = 'Nilai Realisasi (Rp)'; // Col AA (index 26)
    m6Data2D[5][29] = 'Nama Rekanan / Penyedia'; // Col AD (index 29)
    m6Data2D[5][30] = 'Keterangan Rekanan / Bank / NPWP'; // Col AE (index 30)
    m6Data2D[5][40] = 'Nomor SPM'; // Col AO (index 40)
    m6Data2D[5][41] = 'Nomor SP2D'; // Col AP (index 41)
    m6Data2D[5][42] = 'Tanggal SP2D'; // Col AQ (index 42)

    // Sample Row
    const rowSample: any[] = [];
    rowSample[0] = 1;
    rowSample[1] = selectedTahun;
    rowSample[16] = '5.01.01.2.01.01';
    rowSample[17] = 'Penyusunan Dokumen Perencanaan dan Evaluasi Kinerja Perangkat Daerah';
    rowSample[18] = '5.1.02.01.01.0024';
    rowSample[19] = 'Belanja Alat/Bahan untuk Kegiatan Kantor-Alat Tulis Kantor';
    rowSample[25] = 'Pembayaran Pengadaan ATK dan Cetak Laporan Triwulan I';
    rowSample[26] = 15000000;
    rowSample[29] = 'CV Cahaya Gemilang';
    rowSample[30] = 'Bank NTB Syariah - NPWP 01.234.567.8-901.000';
    rowSample[40] = `900/101/SPM-LS/KESBANG/${selectedTahun}`;
    rowSample[41] = `900/101/SP2D-LS/KESBANG/${selectedTahun}`;
    rowSample[42] = `${selectedTahun}-01-20`;
    m6Data2D.push(rowSample);

    const wsM6 = XLSX.utils.aoa_to_sheet(m6Data2D);
    XLSX.utils.book_append_sheet(wb, wsM6, 'FORMAT_SIPD_Q6_AQ6');

    // 3. Sheet Master Pagu Anggaran (MASTER_PAGU_DPA)
    const masterPaguData = [
      {
        'Kode Program': '5.01.01',
        'Nama Program': 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI',
        'Kode Kegiatan': '5.01.01.2.01',
        'Nama Kegiatan': 'Perencanaan, Penganggaran, dan Evaluasi Kinerja Perangkat Daerah',
        'Kode Sub Kegiatan': '5.01.01.2.01.01',
        'Nama Sub Kegiatan': 'Penyusunan Dokumen Perencanaan dan Evaluasi Kinerja Perangkat Daerah',
        'Kode Belanja': '5.1.02.01.01.0024',
        'Nama Belanja': 'Belanja Alat/Bahan untuk Kegiatan Kantor-Alat Tulis Kantor',
        'Pagu Anggaran (Rp)': 120000000
      },
      {
        'Kode Program': '5.01.01',
        'Nama Program': 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI',
        'Kode Kegiatan': '5.01.01.2.01',
        'Nama Kegiatan': 'Perencanaan, Penganggaran, dan Evaluasi Kinerja Perangkat Daerah',
        'Kode Sub Kegiatan': '5.01.01.2.01.01',
        'Nama Sub Kegiatan': 'Penyusunan Dokumen Perencanaan dan Evaluasi Kinerja Perangkat Daerah',
        'Kode Belanja': '5.1.02.01.01.0025',
        'Nama Belanja': 'Belanja Kertas dan Cover Cetakan Laporan',
        'Pagu Anggaran (Rp)': 85000000
      },
      {
        'Kode Program': '5.01.01',
        'Nama Program': 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI',
        'Kode Kegiatan': '5.01.01.2.02',
        'Nama Kegiatan': 'Administrasi Keuangan Perangkat Daerah',
        'Kode Sub Kegiatan': '5.01.01.2.02.01',
        'Nama Sub Kegiatan': 'Penyediaan Gaji dan Tunjangan ASN',
        'Kode Belanja': '5.1.01.02.01.0001',
        'Nama Belanja': 'Belanja Tambahan Penghasilan berdasarkan Beban Kerja PNS',
        'Pagu Anggaran (Rp)': 5400000000
      },
      {
        'Kode Program': '5.01.02',
        'Nama Program': 'PROGRAM PENGUATAN IDEOLOGI PANCASILA DAN KARAKTER KEBANGSAAN',
        'Kode Kegiatan': '5.01.02.2.01',
        'Nama Kegiatan': 'Perumusan Kebijakan Teknis dan Pemantapan Wawasan Kebangsaan',
        'Kode Sub Kegiatan': '5.01.02.2.01.03',
        'Nama Sub Kegiatan': 'Fasilitasi Forum Kerukunan Umat Beragama (FKUB)',
        'Kode Belanja': '5.1.02.04.01.0001',
        'Nama Belanja': 'Belanja Jasa Tenaga Ahli / Narasumber',
        'Pagu Anggaran (Rp)': 320000000
      }
    ];
    const wsPagu = XLSX.utils.json_to_sheet(masterPaguData);
    XLSX.utils.book_append_sheet(wb, wsPagu, 'MASTER_PAGU_DPA');

    // 4. Sheet Panduan & Petunjuk
    const petunjukData = [
      {
        'No': 1,
        'Nama Kolom': 'Tanggal',
        'Format Data': 'YYYY-MM-DD atau DD/MM/YYYY',
        'Contoh': `${selectedTahun}-01-15`,
        'Keterangan': 'Tanggal terbitnya SP2D / SPM. Menentukan filter bulan pada Laporan Bulanan (misal: 01 = Januari).'
      },
      {
        'No': 2,
        'Nama Kolom': 'No SP2D',
        'Format Data': 'Teks / String',
        'Contoh': `900/0101/SP2D-LS/KESBANG/${selectedTahun}`,
        'Keterangan': 'Nomor Surat Perintah Pencairan Dana resmi dari BPKAD Provinsi NTB.'
      },
      {
        'No': 3,
        'Nama Kolom': 'Kode Sub Kegiatan',
        'Format Data': 'Format Titik: X.XX.XX.X.XX.XX',
        'Contoh': '5.01.01.2.01.01',
        'Keterangan': 'Kode Sub Kegiatan sesuai DPA BAKESBANGPOLDAGRI NTB.'
      },
      {
        'No': 4,
        'Nama Kolom': 'Kode Belanja',
        'Format Data': 'Format Titik: X.X.XX.XX.XX.XXXX',
        'Contoh': '5.1.02.01.01.0024',
        'Keterangan': 'Kode rekening belanja standar 12 digit SIPD.'
      },
      {
        'No': 5,
        'Nama Kolom': 'Nilai Realisasi (Rp)',
        'Format Data': 'Angka Numerik murni (tanpa Rp dan titik ribuan)',
        'Contoh': 15000000,
        'Keterangan': 'Jumlah nominal pencairan SP2D yang terealisasi.'
      },
      {
        'No': 6,
        'Nama Kolom': 'Uraian Realisasi',
        'Format Data': 'Teks / String',
        'Contoh': 'Pembayaran belanja ATK dan penggandaan rapat koordinasi',
        'Keterangan': 'Deskripsi rincian pekerjaan atau belanja keperluan.'
      },
      {
        'No': 7,
        'Nama Kolom': 'Nama Rekanan / Penyedia',
        'Format Data': 'Teks / String',
        'Contoh': 'CV Cahaya Gemilang',
        'Keterangan': 'Pihak ketiga/rekanan penerima pembayaran atau bendahara.'
      }
    ];
    const wsPetunjuk = XLSX.utils.json_to_sheet(petunjukData);
    XLSX.utils.book_append_sheet(wb, wsPetunjuk, 'PANDUAN_PENGISIAN');

    const fileName = `DATABASE_SPREADSHEET_MASTER_SIMKEU_TA_${selectedTahun}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const validCount = previewData.filter(r => r.isValid).length;
  const executableCount = ignoreDuplicateWarnings
    ? previewData.filter(r => r.nilai > 0).length
    : validCount;
  const invalidCount = previewData.length - validCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Upload & Import File Excel Berurutan</h1>
          </div>
          <p className="text-xs text-slate-400">
            Pola Import Berurutan: File pertama diimpor, lalu file kedua diletakkan di bawah baris akhir file pertama, dan seterusnya.
          </p>
        </div>

        <button
          onClick={downloadSampleTemplate}
          className="flex items-center gap-2 rounded-xl border border-emerald-600/60 bg-emerald-950/40 px-4 py-2 text-xs font-bold text-emerald-300 hover:border-emerald-500 hover:bg-emerald-900/60 shadow transition"
          id="btn-download-template"
          title="Unduh Master Template Spreadsheet Database (Multi-Sheet: Realisasi, Pagu DPA, SIPD NTB & Panduan)"
        >
          <Download className="h-4 w-4" />
          <span>Unduh Database Spreadsheet (.xlsx)</span>
        </button>
      </div>

      {/* DATABASE STATUS & CONFIG BANNER */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-950 p-2.5 text-emerald-400 border border-emerald-800/80">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">
                Status Database Realisasi TA {selectedTahun}:
              </span>
              <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-xs font-bold text-emerald-400 border border-emerald-800">
                {currentYearRealisasi.length} Transaksi SP2D
              </span>
              <span className="text-xs font-bold text-emerald-300 font-mono">
                (Rp {totalRealisasiNominal.toLocaleString('id-ID')})
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Mode <strong>Akumulasi & Append</strong> aktif: baris file baru akan disambungkan di baris terakhir (Row #{currentYearRealisasi.length + 1} ke bawah).
              {totalOtherYearsCount > 0 && (
                <span className="text-amber-400 ml-1">
                  (Terdapat juga {totalOtherYearsCount} transaksi di TA lain).
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <label className="flex items-center gap-2 text-xs text-slate-300 font-medium cursor-pointer bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 hover:border-slate-700">
            <input
              type="checkbox"
              checked={overwriteMode}
              onChange={e => setOverwriteMode(e.target.checked)}
              className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500"
            />
            <span>{overwriteMode ? 'Mode Timpa (Hapus data lama TA ini)' : 'Mode Sambung Berurutan (Append)'}</span>
          </label>

          <button
            type="button"
            onClick={() => setShowClearModal(true)}
            className="flex items-center gap-1.5 rounded-xl border border-rose-800/80 bg-rose-950/60 px-3.5 py-2 text-xs font-bold text-rose-300 hover:bg-rose-900/80 hover:text-white transition shadow-sm"
          >
            <Trash2 className="h-4 w-4" />
            <span>Kosongkan Database</span>
          </button>
        </div>
      </div>

      {/* SEQUENTIAL WORKFLOW BANNER */}
      <div className="rounded-2xl border border-teal-900/60 bg-teal-950/30 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-teal-900/50 p-2 text-teal-300 border border-teal-800 mt-0.5">
            <Layers className="h-5 w-5" />
          </div>
          <div className="space-y-1 text-xs">
            <h3 className="font-bold text-teal-200">
              Pola Penyusunan Baris Berurutan (Sequential Row Stacking)
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Anda dapat mengunggah satu atau beberapa file Excel sekaligus (misalnya file SP2D per bulan). Sistem akan menyusun baris secara berurutan:
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[11px]">
              <span className="rounded-lg bg-slate-900 px-2.5 py-1 border border-slate-800 text-teal-300">
                📄 File 1 (Atas)
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-teal-400" />
              <span className="rounded-lg bg-slate-900 px-2.5 py-1 border border-slate-800 text-emerald-300">
                📄 File 2 (Di Bawah Akhir File 1)
              </span>
              <ArrowRight className="h-3.5 w-3.5 text-teal-400" />
              <span className="rounded-lg bg-slate-900 px-2.5 py-1 border border-slate-800 text-amber-300">
                📄 File 3 (Di Bawah Akhir File 2)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* DROPZONE AREA */}
      <div className="rounded-2xl border-2 border-dashed border-emerald-600/40 bg-slate-900/80 p-6 text-center shadow-xl space-y-4">
        <FileSpreadsheet className="mx-auto h-12 w-12 text-emerald-400" />
        <div>
          <h2 className="text-sm font-bold text-white">
            Pilih File Excel Transaksi Realisasi Keuangan (.xlsx, .xls, .csv)
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Dapat memilih satu atau beberapa file sekaligus. Sistem mendukung format SIPD/SIMDA (Urutan Kolom Q6-AQ6) maupun format tabel standar.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {/* Main Upload / New Batch */}
          <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/50 transition">
            <UploadCloud className="h-4 w-4" />
            <span>{isProcessing ? 'Membaca File...' : 'Pilih File Excel (Bisa Multi-File)'}</span>
            <input
              type="file"
              multiple
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="hidden"
              id="input-excel-file"
            />
          </label>

          {/* Append File to Existing Queue */}
          {previewData.length > 0 && (
            <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl border border-teal-600/60 bg-teal-950/50 px-5 py-2.5 text-xs font-bold text-teal-300 hover:bg-teal-900/60 hover:border-teal-500">
              <Plus className="h-4 w-4" />
              <span>Tambah File Berikutnya di Bawah</span>
              <input
                type="file"
                multiple
                accept=".xlsx, .xls, .csv"
                onChange={handleAppendFileUpload}
                ref={appendFileInputRef}
                className="hidden"
                id="input-append-excel-file"
              />
            </label>
          )}

          {previewData.length > 0 && (
            <button
              onClick={handleClearPreview}
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              Reset Pratinjau
            </button>
          )}
        </div>
      </div>

      {/* CALLOUT REMINDER WHEN IN PREVIEW STAGE */}
      {previewData.length > 0 && (
        <div className="rounded-2xl border border-amber-500/60 bg-amber-950/40 p-4 shadow-lg flex items-center justify-between flex-wrap gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-900/80 p-2 text-amber-300 border border-amber-700">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-200">
                Data Telah Selesai Dibaca: {previewData.length} Baris Data Berhasil Dideteksi!
              </h4>
              <p className="text-[11px] text-slate-300">
                Data ini masih berada di <strong>Pratinjau Sementara</strong>. Klik tombol hijau <strong>"Eksekusi Import Berurutan"</strong> di bawah untuk menyimpan seluruhnya ke database.
              </p>
            </div>
          </div>
          <button
            onClick={handleExecuteImport}
            disabled={executableCount === 0}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md disabled:opacity-50"
          >
            <FileCheck className="h-4 w-4" />
            <span>Eksekusi Import ({executableCount} Data)</span>
          </button>
        </div>
      )}

      {/* QUEUED FILES CARDS */}
      {fileQueue.length > 0 && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-4 w-4 text-emerald-400" />
              <span>Urutan File Dalam Antrean Import ({fileQueue.length} File):</span>
            </h3>
            <span className="text-xs text-emerald-400 font-mono font-bold">
              Total {previewData.length} Baris Data
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {fileQueue.map((file, idx) => (
              <div
                key={`${file.index}_${file.fileName}`}
                className="rounded-xl border border-slate-800 bg-slate-950 p-3 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-950 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                      {file.index}
                    </span>
                    <span className="text-xs font-bold text-white truncate max-w-[180px]" title={file.fileName}>
                      {file.fileName}
                    </span>
                  </div>
                  <span className="rounded bg-slate-900 px-2 py-0.5 text-[10px] font-mono text-emerald-400 border border-slate-800">
                    {file.validRows} valid
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-900 pt-2 font-mono">
                  <span>Baris #{file.startGlobalRow} s/d #{file.endGlobalRow}</span>
                  <span className="text-teal-400 font-bold">
                    ➔ Posisi Database: #{ (overwriteMode ? 0 : currentYearRealisasi.length) + file.startGlobalRow }
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RESULT NOTIFICATION BANNER */}
      {importResult && (
        <div className="rounded-2xl border border-emerald-500 bg-emerald-950/60 p-5 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              <div>
                <h3 className="text-sm font-bold text-white">Import Berhasil Disimpan ke Database</h3>
                <p className="text-xs text-emerald-200">
                  <strong>{importResult.successCount}</strong> Transaksi berhasil diimpor berurutan ke database realisasi TA {selectedTahun}.{' '}
                  {importResult.duplicateCount > 0 && `(${importResult.duplicateCount} Duplikat Diabaikan)`}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-900/80 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-600">
              Database Kini: {currentYearRealisasi.length} Transaksi
            </span>
          </div>
        </div>
      )}

      {/* PREVIEW & VALIDATION TABLE */}
      {previewData.length > 0 && (
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Pratinjau Urutan Baris Data Import</h3>
              <p className="text-xs text-slate-400">
                Total: {previewData.length} baris | Valid:{' '}
                <span className="text-emerald-400 font-bold">{validCount}</span> | Duplikat/Peringatan:{' '}
                <span className="text-rose-400 font-bold">{invalidCount}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {invalidCount > 0 && (
                <label className="flex items-center gap-2 text-xs text-amber-300 font-medium cursor-pointer bg-slate-950 border border-amber-900/50 rounded-xl px-3 py-1.5">
                  <input
                    type="checkbox"
                    checked={ignoreDuplicateWarnings}
                    onChange={e => setIgnoreDuplicateWarnings(e.target.checked)}
                    className="h-4 w-4 rounded border-amber-700 bg-slate-900 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Abaikan Duplikat & Import Semua ({previewData.filter(r => r.nilai > 0).length} Baris)</span>
                </label>
              )}

              <button
                onClick={handleExecuteImport}
                disabled={executableCount === 0}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md disabled:opacity-50"
              >
                <FileCheck className="h-4 w-4" />
                <span>Eksekusi Import Berurutan ({executableCount} Data)</span>
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-x-auto overflow-y-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-950 text-slate-300 font-bold uppercase border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2 text-center w-12">No</th>
                  <th className="px-3 py-2">Sumber File</th>
                  <th className="px-3 py-2">Posisi DB</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">No. SP2D</th>
                  <th className="px-3 py-2">Belanja</th>
                  <th className="px-3 py-2 text-right">Nilai (Rp)</th>
                  <th className="px-3 py-2">Uraian / Rekanan</th>
                  <th className="px-3 py-2">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {previewData.map(r => (
                  <tr
                    key={`${r.fileIndex}_${r.globalRowNum}_${r.sp2d}`}
                    className={
                      r.isValid
                        ? 'hover:bg-slate-800/50'
                        : 'bg-rose-950/30 hover:bg-rose-950/50 text-rose-200'
                    }
                  >
                    <td className="px-3 py-2 text-center font-mono font-bold text-slate-400">
                      {r.globalRowNum}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-1 rounded bg-slate-950 px-2 py-0.5 text-[10px] font-medium text-slate-300 border border-slate-800">
                        <FileText className="h-3 w-3 text-teal-400" />
                        <span className="truncate max-w-[120px]" title={r.sourceFileName}>
                          File #{r.fileIndex} (Baris {r.localRowNum})
                        </span>
                      </span>
                    </td>
                    <td className="px-3 py-2 font-mono text-teal-400 font-semibold">
                      Row #{r.dbTargetRowNum}
                    </td>
                    <td className="px-3 py-2">
                      {r.isValid ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                          <CheckCircle2 className="h-3 w-3" /> Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-950 px-2 py-0.5 text-[10px] font-bold text-rose-300 border border-rose-800">
                          <XCircle className="h-3 w-3" /> Peringatan
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-mono font-bold text-emerald-300">{r.sp2d}</td>
                    <td className="px-3 py-2 font-mono">{r.belanja}</td>
                    <td className="px-3 py-2 text-right font-mono font-bold">
                      Rp {r.nilai.toLocaleString('id-ID')}
                    </td>
                    <td className="px-3 py-2 max-w-xs truncate">
                      {r.uraian} ({r.rekanan})
                    </td>
                    <td className="px-3 py-2 text-[11px]">
                      {r.validationError ? (
                        <span className="text-rose-400 font-semibold">{r.validationError}</span>
                      ) : (
                        <span className="text-emerald-400">Siap Disambung</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LIVE DATABASE REALISASI TABLE: DIRECT RESULT OF IMPORT */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-2xl space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">
                Daftar Transaksi Realisasi SP2D di Database (TA {selectedTahun})
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Total {currentYearRealisasi.length} transaksi tersimpan | Total Nominal: Rp {totalRealisasiNominal.toLocaleString('id-ID')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari SP2D, Belanja, Uraian, Rekanan..."
                value={dbSearchQuery}
                onChange={e => setDbSearchQuery(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:outline-none w-64"
              />
            </div>
          </div>
        </div>

        {currentYearRealisasi.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-8 text-center space-y-2">
            <Database className="mx-auto h-10 w-10 text-slate-600" />
            <h4 className="text-xs font-bold text-slate-300">Belum Ada Data Realisasi untuk TA {selectedTahun}</h4>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto">
              Silakan pilih file Excel di atas, lalu klik <strong>"Eksekusi Import Berurutan"</strong> untuk mengisi data ke dalam database.
            </p>
          </div>
        ) : (
          <div className="max-h-96 overflow-x-auto overflow-y-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-950 text-slate-300 font-bold uppercase border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2 text-center w-12">No</th>
                  <th className="px-3 py-2">Tanggal</th>
                  <th className="px-3 py-2">No. SP2D</th>
                  <th className="px-3 py-2">Kode Rekening Belanja</th>
                  <th className="px-3 py-2 text-right">Nilai Realisasi (Rp)</th>
                  <th className="px-3 py-2">Uraian / Keterangan</th>
                  <th className="px-3 py-2">Rekanan</th>
                  <th className="px-3 py-2 text-center">Status</th>
                  <th className="px-3 py-2 text-center w-16">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredDbRealisasi.map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-800/50">
                    <td className="px-3 py-2 text-center font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-300 whitespace-nowrap">
                      {r.tanggal}
                    </td>
                    <td className="px-3 py-2 font-mono font-bold text-emerald-400 whitespace-nowrap">
                      {r.noSP2D}
                    </td>
                    <td className="px-3 py-2 font-mono text-slate-300 whitespace-nowrap">
                      {r.kodeBelanja}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-bold text-white whitespace-nowrap">
                      Rp {Number(r.nilai).toLocaleString('id-ID')}
                    </td>
                    <td className="px-3 py-2 max-w-xs truncate" title={r.uraian}>
                      {r.uraian}
                    </td>
                    <td className="px-3 py-2 max-w-xs truncate text-slate-400" title={r.rekanan}>
                      {r.rekanan}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className="inline-flex items-center rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                        {r.statusValidation || 'Disetujui PPK'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Hapus data realisasi SP2D "${r.noSP2D}"?`)) {
                            deleteRealisasi(r.id);
                          }
                        }}
                        className="rounded p-1 text-slate-500 hover:bg-rose-950 hover:text-rose-400 transition"
                        title="Hapus baris ini"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* IMPORT LOGS AUDIT */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3">
          Riwayat Log Import Excel
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase border-b border-slate-800">
              <tr>
                <th className="px-4 py-2">Waktu Import</th>
                <th className="px-4 py-2">Nama File Excel</th>
                <th className="px-4 py-2">Jumlah Data</th>
                <th className="px-4 py-2">Operator</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {importLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-800/50">
                  <td className="px-4 py-2 font-mono text-slate-400">{log.tanggal}</td>
                  <td className="px-4 py-2 font-semibold text-white">{log.namaFile}</td>
                  <td className="px-4 py-2 font-mono text-emerald-400">{log.jumlahData} data</td>
                  <td className="px-4 py-2 text-slate-300">{log.operator}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CLEAR DATABASE CONFIRMATION MODAL */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-rose-900/80 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="rounded-xl bg-rose-950 p-2.5 text-rose-400 border border-rose-800">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Konfirmasi Kosongkan Database</h3>
                <p className="text-xs text-rose-300">Penghapusan Transaksi Realisasi SP2D</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p className="font-bold text-rose-300">Peringatan Penting!</p>
              <p>
                Tindakan ini akan menghapus data transaksi Realisasi SP2D dari database lokal.
                Setelah dikosongkan, Anda dapat mengunggah file Excel baru mulai dari Baris 1 secara bersih.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  clearRealisasiDatabase(selectedTahun);
                  setPreviewData([]);
                  setFileQueue([]);
                  setShowClearModal(false);
                  alert(`Berhasil mengosongkan seluruh data realisasi untuk Tahun Anggaran ${selectedTahun}.`);
                }}
                className="w-full rounded-xl bg-rose-600 hover:bg-rose-500 p-3 text-xs font-bold text-white transition flex items-center justify-between shadow-md"
              >
                <span>Hapus Data TA {selectedTahun} Saja ({currentYearRealisasi.length} Transaksi)</span>
                <Trash2 className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  clearRealisasiDatabase();
                  setPreviewData([]);
                  setFileQueue([]);
                  setShowClearModal(false);
                  alert('Berhasil mengosongkan seluruh database realisasi untuk semua Tahun Anggaran.');
                }}
                className="w-full rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 border border-slate-700 hover:border-rose-800 p-3 text-xs font-bold text-slate-300 transition flex items-center justify-between"
              >
                <span>Hapus Seluruh Data Realisasi (Semua Tahun)</span>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowClearModal(false)}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-300 transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
