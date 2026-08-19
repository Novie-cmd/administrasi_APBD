import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Realisasi } from '../../types';
import * as XLSX from 'xlsx';
import { safeDownloadExcel } from '../../utils/downloadHelper';
import {
  extractCode,
  findRowValueByKeys,
  parseNumber,
  parseExcelDate,
  makeRealisasiCompositeKey,
  isCodeEqual,
  parseRealisasiFromExcelData
} from '../../utils/codeUtils';
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Check,
  X,
  FileSpreadsheet,
  Download,
  XCircle,
  FileCheck,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface PreviewRealisasiRow {
  rowNum: number;
  tahun: number;
  kodeProgram: string;
  kodeKegiatan: string;
  kodeSub: string;
  kodeBelanja: string;
  namaBelanja: string;
  noSP2D: string;
  noSPM: string;
  nilai: number;
  uraian: string;
  rekanan: string;
  tanggal: string;
  isValid: boolean;
  status: string;
  validationError?: string;
}

export const InputRealisasiView: React.FC = () => {
  const {
    selectedTahun,
    programs,
    kegiatanList,
    subKegiatanList,
    belanjaList,
    rekananList,
    realisasiList,
    anggaranList,
    addRealisasi,
    updateRealisasi,
    deleteRealisasi,
    clearRealisasiDatabase,
    batchImportExcel,
    currentUser
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

  // Edit and Delete Modal States
  const [editingRealisasi, setEditingRealisasi] = useState<Realisasi | null>(null);
  const [deletingRealisasi, setDeletingRealisasi] = useState<Realisasi | null>(null);

  // Edit Form State
  const [editNoSP2D, setEditNoSP2D] = useState('');
  const [editNoSPM, setEditNoSPM] = useState('');
  const [editNilai, setEditNilai] = useState<number>(0);
  const [editUraian, setEditUraian] = useState('');
  const [editRekanan, setEditRekanan] = useState('');
  const [editTanggal, setEditTanggal] = useState('');

  // Excel Import States
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedFileName, setImportedFileName] = useState('');
  const [previewData, setPreviewData] = useState<PreviewRealisasiRow[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Form State
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [kodeProgram, setKodeProgram] = useState(programs[0]?.kodeProgram || '5.01.01');
  const [kodeKegiatan, setKodeKegiatan] = useState(kegiatanList[0]?.kodeKegiatan || '5.01.01.2.01');
  const [kodeSub, setKodeSub] = useState(subKegiatanList[0]?.kodeSub || '5.01.01.2.01.01');
  const [kodeBelanja, setKodeBelanja] = useState(belanjaList[0]?.kodeBelanja || '5.1.02.01.01.0024');
  const [nilai, setNilai] = useState<number>(250000000);
  const [noSP2D, setNoSP2D] = useState(`900/${Math.floor(1000 + Math.random() * 9000)}/SP2D-LS/KESBANG/${selectedTahun}`);
  const [noSPM, setNoSPM] = useState(`900/${Math.floor(1000 + Math.random() * 9000)}/SPM-LS/KESBANG/${selectedTahun}`);
  const [uraian, setUraian] = useState('Pembayaran Kegiatan Operasional BAKESBANGPOLDAGRI NTB');
  const [rekanan, setRekanan] = useState(rekananList[0]?.namaRekanan || 'PT Bank NTB Syariah');
  const [buktiFileName, setBuktiFileName] = useState<string>('');

  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  // Filtered master data based on selected year & cascading parents
  const availablePrograms = programs.filter(p => !p.tahun || Number(p.tahun) === Number(selectedTahun));
  const finalPrograms = availablePrograms.length > 0 ? availablePrograms : programs;

  const filteredKegiatan = kegiatanList.filter(
    k => k.kodeProgram === kodeProgram && (!k.tahun || Number(k.tahun) === Number(selectedTahun))
  );
  const finalKegiatan =
    filteredKegiatan.length > 0
      ? filteredKegiatan
      : kegiatanList.filter(k => k.kodeProgram === kodeProgram);

  const filteredSub = subKegiatanList.filter(
    s => s.kodeKegiatan === kodeKegiatan && (!s.tahun || Number(s.tahun) === Number(selectedTahun))
  );
  const finalSub =
    filteredSub.length > 0
      ? filteredSub
      : subKegiatanList.filter(s => s.kodeKegiatan === kodeKegiatan);

  // Cascade handler when Program changes
  const handleProgramChange = (progCode: string) => {
    setKodeProgram(progCode);
    const matchingKegs = kegiatanList.filter(
      k => k.kodeProgram === progCode && (!k.tahun || Number(k.tahun) === Number(selectedTahun))
    );
    const kegs = matchingKegs.length > 0 ? matchingKegs : kegiatanList.filter(k => k.kodeProgram === progCode);

    if (kegs.length > 0) {
      const firstKeg = kegs[0].kodeKegiatan;
      setKodeKegiatan(firstKeg);
      const matchingSubs = subKegiatanList.filter(
        s => s.kodeKegiatan === firstKeg && (!s.tahun || Number(s.tahun) === Number(selectedTahun))
      );
      const subs = matchingSubs.length > 0 ? matchingSubs : subKegiatanList.filter(s => s.kodeKegiatan === firstKeg);
      if (subs.length > 0) {
        setKodeSub(subs[0].kodeSub);
      } else {
        setKodeSub('');
      }
    } else {
      setKodeKegiatan('');
      setKodeSub('');
    }
  };

  // Cascade handler when Kegiatan changes
  const handleKegiatanChange = (kegCode: string) => {
    setKodeKegiatan(kegCode);
    const matchingSubs = subKegiatanList.filter(
      s => s.kodeKegiatan === kegCode && (!s.tahun || Number(s.tahun) === Number(selectedTahun))
    );
    const subs = matchingSubs.length > 0 ? matchingSubs : subKegiatanList.filter(s => s.kodeKegiatan === kegCode);
    if (subs.length > 0) {
      setKodeSub(subs[0].kodeSub);
    } else {
      setKodeSub('');
    }
  };

  React.useEffect(() => {
    const isProgValid = finalPrograms.some(p => p.kodeProgram === kodeProgram);
    if (!isProgValid && finalPrograms.length > 0) {
      handleProgramChange(finalPrograms[0].kodeProgram);
    } else if (isProgValid) {
      const isKegValid = finalKegiatan.some(k => k.kodeKegiatan === kodeKegiatan);
      if (!isKegValid && finalKegiatan.length > 0) {
        handleKegiatanChange(finalKegiatan[0].kodeKegiatan);
      } else if (!isKegValid) {
        setKodeKegiatan('');
        setKodeSub('');
      } else {
        const isSubValid = finalSub.some(s => s.kodeSub === kodeSub);
        if (!isSubValid && finalSub.length > 0) {
          setKodeSub(finalSub[0].kodeSub);
        } else if (!isSubValid) {
          setKodeSub('');
        }
      }
    }
  }, [selectedTahun, programs, kegiatanList, subKegiatanList]);

  const isReadOnly = currentUser.role === 'Auditor' || currentUser.role === 'Kepala Badan';

  // Open Edit Modal
  const handleOpenEdit = (r: Realisasi) => {
    setEditingRealisasi(r);
    setEditNoSP2D(r.noSP2D);
    setEditNoSPM(r.noSPM || '');
    setEditNilai(r.nilai);
    setEditUraian(r.uraian);
    setEditRekanan(r.rekanan);
    setEditTanggal(r.tanggal);
  };

  // Save Edit Realisasi
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRealisasi) return;

    updateRealisasi(editingRealisasi.id, {
      noSP2D: editNoSP2D,
      noSPM: editNoSPM,
      nilai: editNilai,
      uraian: editUraian,
      rekanan: editRekanan,
      tanggal: editTanggal
    });

    setEditingRealisasi(null);
  };

  // Confirm Delete Realisasi
  const handleConfirmDelete = () => {
    if (!deletingRealisasi) return;
    deleteRealisasi(deletingRealisasi.id);
    setDeletingRealisasi(null);
  };

  // Download Excel Template for Realisasi SP2D
  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();

    // 1. Sheet Layout Q6-AQ6
    const m6Data2D: any[][] = [
      ['PEMERINTAH PROVINSI NUSA TENGGARA BARAT'],
      ['BADAN KESATUAN BANGSA DAN POLITIK DALAM NEGERI (BAKESBANGPOLDAGRI)'],
      [`TEMPLATE IMPLEMENTASI IMPORT REALISASI SP2D - TAHUN ANGGARAN ${selectedTahun}`],
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

    // Row 7 Sample Data
    const row7: any[] = [];
    row7[0] = 1;
    row7[1] = selectedTahun; // Automatic based on selected year
    row7[16] = '5.01.01.2.01.01';
    row7[17] = 'Penyusunan Dokumen Perencanaan dan Evaluasi Kinerja Perangkat Daerah';
    row7[18] = '5.1.02.01.01.0024';
    row7[19] = 'Belanja Alat/Bahan untuk Kegiatan Kantor-Alat Tulis Kantor';
    row7[25] = 'Pembayaran Pengadaan ATK dan Cetak Laporan Triwulan I BAKESBANGPOLDAGRI';
    row7[26] = 15000000;
    row7[29] = 'CV Cahaya Gemilang';
    row7[30] = 'Bank NTB Syariah - NPWP 01.234.567.8-901.000';
    row7[40] = `900/101/SPM-LS/KESBANG/${selectedTahun}`;
    row7[41] = `900/101/SP2D-LS/KESBANG/${selectedTahun}`;
    row7[42] = `${selectedTahun}-02-10`;
    m6Data2D.push(row7);

    const wsM6 = XLSX.utils.aoa_to_sheet(m6Data2D);
    XLSX.utils.book_append_sheet(wb, wsM6, 'Template_Layout_Realisasi');

    safeDownloadExcel(wb, `Template_Import_Realisasi_Q6_AQ6_NTB_${selectedTahun}.xlsx`);
  };

  // Upload Excel Handler for Realisasi
  const handleFileUploadExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportedFileName(file.name);
    setImportSuccessMsg(null);
    setImportErrors([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];

        const rows2D: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        const rowsJson: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        const parsedResults = parseRealisasiFromExcelData(rows2D, rowsJson, selectedTahun);

        if (!parsedResults || parsedResults.length === 0) {
          setImportErrors(['File Excel kosong atau format tidak valid.']);
          setPreviewData([]);
          return;
        }

        const existingKeys = new Set(
          realisasiList
            .filter(r => Number(r.tahun) === Number(selectedTahun))
            .map(r =>
              makeRealisasiCompositeKey(r.noSP2D, r.kodeBelanja, r.kodeSub, r.nilai, r.uraian, r.tahun)
            )
        );
        const seenBatchKeys = new Set<string>();
        const parsedRows: PreviewRealisasiRow[] = [];
        const errs: string[] = [];

        parsedResults.forEach((r, idx) => {
          const key = makeRealisasiCompositeKey(r.noSP2D, r.kodeBelanja, r.kodeSub, r.nilai, r.uraian, r.tahun || selectedTahun);
          const isDup = key ? (existingKeys.has(key) || seenBatchKeys.has(key)) : false;
          if (key && !isDup) {
            seenBatchKeys.add(key);
          }

          let err = '';
          if (r.nilai <= 0) {
            err = 'Nilai realisasi harus lebih dari 0.';
            errs.push(`Baris ${r.rowNum}: Nilai realisasi <= 0.`);
          } else if (isDup) {
            err = 'Data Realisasi ini duplikat dengan database/file ini.';
            errs.push(`Baris ${r.rowNum}: Item "${r.noSP2D}" (${r.kodeBelanja}) duplikat.`);
          }

          parsedRows.push({
            rowNum: r.rowNum,
            tahun: r.tahun || selectedTahun,
            kodeProgram: r.kodeProgram,
            kodeKegiatan: r.kodeKegiatan,
            kodeSub: r.kodeSub,
            kodeBelanja: r.kodeBelanja,
            namaBelanja: r.namaBelanja,
            noSP2D: r.noSP2D,
            noSPM: r.noSPM,
            nilai: r.nilai,
            uraian: r.uraian,
            rekanan: r.rekanan,
            tanggal: r.tanggal,
            isValid: !err,
            status: isDup ? 'Duplikat (Dilewati)' : 'Data Baru',
            validationError: err
          });
        });

        setPreviewData(parsedRows);
        setImportErrors(errs);
      } catch (err: any) {
        console.error('Failed to parse Excel:', err);
        setImportErrors([`Gagal membaca file Excel: ${err?.message || 'Format tidak didukung'}`]);
        setPreviewData([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Process Realisasi Batch Import
  const handleProcessImportExcel = () => {
    const validRows = previewData.filter(r => r.isValid);
    if (validRows.length === 0) return;

    const res = batchImportExcel(
      validRows.map(r => ({
        tahun: r.tahun,
        kodeProgram: r.kodeProgram,
        kodeKegiatan: r.kodeKegiatan,
        kodeSub: r.kodeSub,
        kodeBelanja: r.kodeBelanja,
        namaBelanja: r.namaBelanja,
        sp2d: r.noSP2D,
        spm: r.noSPM,
        nilai: r.nilai,
        uraian: r.uraian,
        rekanan: r.rekanan,
        tanggal: r.tanggal
      })),
      importedFileName || 'Import_Realisasi_SP2D.xlsx',
      false
    );

    setImportSuccessMsg(
      `Berhasil mengimpor ${res.successCount} transaksi SP2D baru (${res.duplicateCount} duplikat dilewati).`
    );
    setPreviewData([]);
  };

  const handleSimpan = (e: React.FormEvent) => {
    e.preventDefault();
    setWarningMsg(null);

    // Validation 1: Check duplicate SP2D
    const isDup = realisasiList.some(r => r.noSP2D.trim().toLowerCase() === noSP2D.trim().toLowerCase());
    if (isDup) {
      setWarningMsg(`PERINGATAN: Nomor SP2D "${noSP2D}" sudah terdaftar dalam sistem! Mohon periksa kembali.`);
      return;
    }

    // Validation 2: Check remaining budget
    const angObj = anggaranList.find(a => a.kodeBelanja === kodeBelanja && Number(a.tahun) === Number(selectedTahun));
    const paguAkhir = angObj ? angObj.paguAkhir : 0;
    const existingRealSum = realisasiList
      .filter(r => r.kodeBelanja === kodeBelanja && Number(r.tahun) === Number(selectedTahun))
      .reduce((s, r) => s + r.nilai, 0);

    if (paguAkhir > 0 && existingRealSum + nilai > paguAkhir) {
      const confirmOver = window.confirm(
        `PERINGATAN: Realisasi (Rp ${(existingRealSum + nilai).toLocaleString('id-ID')}) MELEBIHI PAGU ANGGARAN (Rp ${paguAkhir.toLocaleString('id-ID')}). Apakah Anda yakin tetap ingin menyimpan transaksi ini?`
      );
      if (!confirmOver) return;
    }

    const monthNum = new Date(tanggal).getMonth() + 1;

    addRealisasi({
      tanggal,
      bulan: monthNum,
      tahun: selectedTahun,
      kodeProgram,
      kodeKegiatan,
      kodeSub,
      kodeBelanja,
      nilai,
      noSP2D,
      noSPM,
      uraian,
      rekanan,
      operator: currentUser.nama,
      buktiUrl: buktiFileName || 'Kwitansi_Lampiran_SP2D.pdf'
    });

    setShowForm(false);
    setNilai(100000000);
    setWarningMsg(null);
  };

  const handleFileUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBuktiFileName(e.target.files[0].name);
    }
  };

  const currentRealisasi = realisasiList.filter(r => Number(r.tahun) === Number(selectedTahun));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-teal-400" />
            <h1 className="text-xl font-bold text-white">Input Realisasi Keuangan (SP2D)</h1>
          </div>
          <p className="text-xs text-slate-400">
            Pencatatan Realisasi Belanja, Penerbitan SP2D, SPM & Lampiran Bukti SPJ TA {selectedTahun}
          </p>
        </div>

        {!isReadOnly && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowClearModal(true)}
              className="flex items-center gap-2 rounded-xl border border-rose-900/60 bg-rose-950/40 px-3.5 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-900/60 hover:border-rose-700 transition"
              id="btn-clear-db-realisasi"
              title="Kosongkan Database Realisasi SP2D"
            >
              <Trash2 className="h-4 w-4" />
              <span>Hapus Database</span>
            </button>

            <button
              onClick={() => {
                setShowImportModal(true);
                setImportSuccessMsg(null);
                setImportErrors([]);
                setPreviewData([]);
                setImportedFileName('');
              }}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-teal-400 hover:border-teal-500 hover:bg-slate-800 transition"
              id="btn-import-excel-realisasi"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Import File Excel</span>
            </button>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-500 shadow-lg shadow-teal-950/50"
              id="btn-toggle-add-realisasi"
            >
              <Plus className="h-4 w-4" />
              <span>Input Transaksi Realisasi</span>
            </button>
          </div>
        )}
      </div>

      {/* INPUT FORM */}
      {showForm && (
        <form onSubmit={handleSimpan} className="rounded-2xl border border-teal-600/40 bg-slate-900 p-6 shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-teal-300 border-b border-slate-800 pb-2">
            Formulir Transaksi Realisasi Keuangan
          </h2>

          {warningMsg && (
            <div className="rounded-xl border border-rose-800 bg-rose-950/60 p-3 text-xs font-semibold text-rose-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400" />
              <span>{warningMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="text-xs font-bold text-slate-300">Tanggal SP2D:</label>
              <input
                type="date"
                required
                value={tanggal}
                onChange={e => setTanggal(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Nomor SP2D:</label>
              <input
                type="text"
                required
                value={noSP2D}
                onChange={e => setNoSP2D(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono font-bold text-teal-300"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Nomor SPM:</label>
              <input
                type="text"
                required
                value={noSPM}
                onChange={e => setNoSPM(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono text-slate-300"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-300">Program:</label>
              <select
                value={kodeProgram}
                onChange={e => handleProgramChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
              >
                {finalPrograms.map(p => (
                  <option key={`${p.tahun}_${p.kodeProgram}`} value={p.kodeProgram}>
                    {p.kodeProgram} - {p.namaProgram}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Kegiatan:</label>
              <select
                value={kodeKegiatan}
                onChange={e => handleKegiatanChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
                disabled={finalKegiatan.length === 0}
              >
                {finalKegiatan.length === 0 ? (
                  <option value="">-- Tidak Ada Kegiatan --</option>
                ) : (
                  finalKegiatan.map(k => (
                    <option key={`${k.tahun}_${k.kodeKegiatan}`} value={k.kodeKegiatan}>
                      {k.kodeKegiatan} - {k.namaKegiatan}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Sub Kegiatan:</label>
              <select
                value={kodeSub}
                onChange={e => setKodeSub(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
                disabled={finalSub.length === 0}
              >
                {finalSub.length === 0 ? (
                  <option value="">-- Tidak Ada Sub Kegiatan --</option>
                ) : (
                  finalSub.map(s => (
                    <option key={`${s.tahun}_${s.kodeSub}`} value={s.kodeSub}>
                      {s.kodeSub} - {s.namaSub}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Rekening Belanja:</label>
              <select
                value={kodeBelanja}
                onChange={e => setKodeBelanja(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
              >
                {belanjaList.map(b => (
                  <option key={b.kodeBelanja} value={b.kodeBelanja}>
                    {b.kodeBelanja} - {b.namaBelanja}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-300">Nilai Realisasi SP2D (Rp):</label>
              <input
                type="number"
                required
                min={1}
                value={nilai}
                onChange={e => setNilai(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono font-bold text-teal-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Penyedia / Rekanan / Penerima:</label>
              <select
                value={rekanan}
                onChange={e => setRekanan(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
              >
                {rekananList.map(r => (
                  <option key={r.id} value={r.namaRekanan}>
                    {r.namaRekanan} ({r.bank})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300">Uraian / Keterangan Transaksi:</label>
            <textarea
              required
              rows={2}
              value={uraian}
              onChange={e => setUraian(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:outline-none"
            />
          </div>

          {/* Upload Bukti */}
          <div className="rounded-xl border border-dashed border-slate-700 bg-slate-950 p-4 text-center">
            <Upload className="mx-auto h-6 w-6 text-slate-400" />
            <label className="mt-2 block text-xs font-bold text-teal-400 cursor-pointer">
              <span>Klik Upload File Bukti Kuitansi / SPJ (PDF/JPG)</span>
              <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileUploadSim} className="hidden" />
            </label>
            {buktiFileName && (
              <p className="mt-1 text-xs text-emerald-400 font-semibold">
                Lampiran terpilih: {buktiFileName}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white hover:bg-teal-500 shadow-md"
            >
              Simpan Realisasi & Kirim ke PPK
            </button>
          </div>
        </form>
      )}

      {/* TABLE REALISASI */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Daftar Transaksi Realisasi SP2D ({currentRealisasi.length} Data)
          </h3>
          <input
            type="text"
            placeholder="Cari SP2D, Uraian, Rekanan..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-3 py-3 text-center w-12">No.</th>
                <th className="px-4 py-3">No. SP2D</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Kode Belanja</th>
                <th className="px-4 py-3">Uraian Transaksi</th>
                <th className="px-4 py-3 text-right">Nilai Realisasi (Rp)</th>
                <th className="px-4 py-3">Penyedia / Rekanan</th>
                <th className="px-4 py-3">Status PPK</th>
                {!isReadOnly && <th className="px-4 py-3 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {currentRealisasi
                .filter(r => {
                  if (!searchTerm.trim()) return true;
                  const q = searchTerm.toLowerCase();
                  return (
                    (r.noSP2D || '').toLowerCase().includes(q) ||
                    (r.noSPM || '').toLowerCase().includes(q) ||
                    (r.kodeBelanja || '').toLowerCase().includes(q) ||
                    (r.kodeSub || '').toLowerCase().includes(q) ||
                    (r.uraian || '').toLowerCase().includes(q) ||
                    (r.rekanan || '').toLowerCase().includes(q) ||
                    (r.tanggal || '').toLowerCase().includes(q)
                  );
                })
                .map((r, idx) => (
                  <tr key={r.id} className="hover:bg-slate-800/50">
                    <td className="px-3 py-3 text-center font-mono font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="px-4 py-3 font-mono font-bold text-teal-300">{r.noSP2D || '-'}</td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{r.tanggal || '-'}</td>
                    <td className="px-4 py-3 font-mono text-emerald-400">{r.kodeBelanja || '-'}</td>
                    <td className="px-4 py-3 font-medium text-white max-w-xs">{r.uraian || '-'}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                      Rp {(Number(r.nilai) || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{r.rekanan || '-'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          r.statusValidation === 'Disetujui PPK'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : r.statusValidation === 'Ditolak'
                            ? 'bg-rose-950 text-rose-300 border border-rose-700'
                            : 'bg-amber-950 text-amber-300 border border-amber-700'
                        }`}
                      >
                        {r.statusValidation || 'Disetujui PPK'}
                      </span>
                    </td>
                    {!isReadOnly && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(r)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition"
                            title="Edit Transaksi SP2D"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeletingRealisasi(r)}
                            className="rounded p-1 text-slate-400 hover:bg-rose-950 hover:text-rose-400 transition"
                            title="Hapus Data"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT REALISASI MODAL */}
      {editingRealisasi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Edit Transaksi Realisasi (SP2D)</h3>
              </div>
              <button
                onClick={() => setEditingRealisasi(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-mono font-bold text-[11px]">{editingRealisasi.kodeBelanja}</span>
                <span className="text-white font-semibold block mt-0.5">{editingRealisasi.namaBelanja}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">No SP2D:</label>
                  <input
                    type="text"
                    required
                    value={editNoSP2D}
                    onChange={e => setEditNoSP2D(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-teal-300 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">No SPM:</label>
                  <input
                    type="text"
                    value={editNoSPM}
                    onChange={e => setEditNoSPM(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Tanggal Transaksi:</label>
                  <input
                    type="date"
                    required
                    value={editTanggal}
                    onChange={e => setEditTanggal(e.target.value)}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1">Nilai Realisasi (Rp):</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editNilai}
                    onChange={e => setEditNilai(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono font-bold text-emerald-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Penyedia / Rekanan:</label>
                <select
                  value={editRekanan}
                  onChange={e => setEditRekanan(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
                >
                  {rekananList.map(r => (
                    <option key={r.id} value={r.namaRekanan}>
                      {r.namaRekanan} ({r.bank})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Uraian Transaksi:</label>
                <textarea
                  required
                  rows={2}
                  value={editUraian}
                  onChange={e => setEditUraian(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingRealisasi(null)}
                  className="rounded-xl bg-slate-800 px-4 py-2 font-bold text-slate-300 hover:bg-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 hover:bg-teal-500 px-5 py-2 font-bold text-white transition shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingRealisasi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-rose-800/50 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-950 border border-rose-800/60">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Konfirmasi Hapus Realisasi SP2D</h3>
                <p className="text-xs text-slate-400">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs space-y-1">
              <div className="text-teal-300 font-mono font-bold">{deletingRealisasi.noSP2D}</div>
              <div className="text-white font-semibold">{deletingRealisasi.uraian}</div>
              <div className="text-emerald-400 font-mono font-bold">Nilai: Rp {deletingRealisasi.nilai.toLocaleString('id-ID')}</div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingRealisasi(null)}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-600 hover:bg-rose-500 px-5 py-2.5 text-xs font-bold text-white transition shadow-md"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* IMPORT EXCEL MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Import Transaksi Realisasi (SP2D) dari Excel</h3>
                  <p className="text-xs text-slate-400">
                    Upload file spreadsheet (.xlsx/.xls) berisi transaksi SP2D TA {selectedTahun}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {/* Success Banner */}
            {importSuccessMsg && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-xs font-semibold text-emerald-300 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <span>{importSuccessMsg}</span>
              </div>
            )}

            {/* Error Banner */}
            {importErrors.length > 0 && (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-950/40 p-3.5 text-xs text-rose-300 space-y-1">
                <div className="font-bold flex items-center gap-2 text-rose-400">
                  <AlertCircle className="h-4 w-4" /> Ada kesalahan pada data Excel:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-300/90 max-h-24 overflow-y-auto">
                  {importErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Template Download & Upload Dropzone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">1. Unduh Format Template</span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Gunakan template standar dengan kolom: Tahun, Kode Program, Kode Kegiatan, Kode Sub, Kode Belanja, No SP2D, No SPM, Nilai Realisasi, Uraian, Penyedia/Rekanan, Tanggal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-teal-300 border border-slate-700 py-2.5 transition"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Template Excel</span>
                </button>
              </div>

              <div className="rounded-2xl border border-dashed border-teal-600/50 bg-teal-950/20 hover:bg-teal-950/30 p-4 flex flex-col items-center justify-center text-center transition">
                <Upload className="h-8 w-8 text-teal-400 mb-2" />
                <span className="text-xs font-bold text-slate-200">2. Upload File Excel Realisasi</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Pilih file .xlsx atau .xls dari komputer Anda</p>
                <label className="mt-3 cursor-pointer rounded-xl bg-teal-600 hover:bg-teal-500 px-4 py-2 text-xs font-bold text-white shadow-md transition inline-flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Pilih File Excel</span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUploadExcel}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Preview Data Table */}
            {previewData.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-300 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> Pratinjau Data Parsed ({previewData.length} baris)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {previewData.filter(r => r.isValid).length} data valid siap diimpor
                  </span>
                </div>

                <div className="max-h-56 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-950 text-xs scrollbar-none">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-300 font-bold sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2">No</th>
                        <th className="px-3 py-2">No SP2D</th>
                        <th className="px-3 py-2">Uraian Transaksi</th>
                        <th className="px-3 py-2 text-right">Nilai SP2D</th>
                        <th className="px-3 py-2">Rekanan</th>
                        <th className="px-3 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {previewData.slice(0, 15).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="px-3 py-2 font-mono text-slate-500">{row.rowNum}</td>
                          <td className="px-3 py-2 font-mono text-teal-300 font-bold">{row.noSP2D || '-'}</td>
                          <td className="px-3 py-2 text-white max-w-xs truncate">{row.uraian}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-emerald-400">Rp {row.nilai.toLocaleString('id-ID')}</td>
                          <td className="px-3 py-2 text-slate-300 truncate max-w-[120px]">{row.rekanan}</td>
                          <td className="px-3 py-2 text-center">
                            {row.isValid ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-950 text-teal-300 border border-teal-800">
                                {row.status}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800" title={row.validationError}>
                                {row.status}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {previewData.length > 15 && (
                    <div className="p-2 text-center text-[11px] text-slate-400 border-t border-slate-800 bg-slate-900">
                      ... dan {previewData.length - 15} baris data lainnya
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300 transition"
              >
                Tutup
              </button>

              <button
                type="button"
                disabled={previewData.filter(r => r.isValid).length === 0}
                onClick={handleProcessImportExcel}
                className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-teal-950/50 transition"
              >
                <FileCheck className="h-4 w-4" />
                <span>Proses Import {previewData.filter(r => r.isValid).length} Data Realisasi</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR DATABASE CONFIRMATION MODAL */}
      {showClearModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-rose-800/60 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-3 rounded-2xl bg-rose-950 border border-rose-800/80">
                <AlertCircle className="h-7 w-7 text-rose-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Kosongkan Database Realisasi (SP2D)</h3>
                <p className="text-xs text-slate-400">Pilih skop penghapusan data Transaksi SP2D.</p>
              </div>
            </div>

            <div className="rounded-xl bg-rose-950/30 border border-rose-900/50 p-3 text-xs text-rose-200 leading-relaxed space-y-1">
              <p className="font-bold text-rose-300">Peringatan Penting!</p>
              <p>
                Tindakan ini akan menghapus seluruh data transaksi Realisasi SP2D dari database.
                Data yang terhapus tidak dapat dikembalikan.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  clearRealisasiDatabase(selectedTahun);
                  setShowClearModal(false);
                }}
                className="w-full rounded-xl bg-rose-600 hover:bg-rose-500 p-3 text-xs font-bold text-white transition flex items-center justify-between shadow-md"
              >
                <span>Hapus Data Tahun Anggaran {selectedTahun} Saja</span>
                <Trash2 className="h-4 w-4" />
              </button>

              <button
                onClick={() => {
                  clearRealisasiDatabase();
                  setShowClearModal(false);
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
