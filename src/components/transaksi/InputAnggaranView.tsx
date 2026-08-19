import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Anggaran } from '../../types';
import * as XLSX from 'xlsx';
import { safeDownloadExcel } from '../../utils/downloadHelper';
import {
  DollarSign,
  Plus,
  Trash2,
  Edit,
  Save,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  Upload,
  Download,
  XCircle,
  FileCheck,
  Sparkles,
  AlertCircle,
  X
} from 'lucide-react';

interface PreviewAnggaranRow {
  rowNum: number;
  tahun: number;
  kodeProgram: string;
  kodeKegiatan: string;
  kodeSub: string;
  kodeBelanja: string;
  namaBelanja: string;
  pagu: number;
  revisi: number;
  nilaiSPD: number;
  sumberDana: string;
  isValid: boolean;
  status: string;
  validationError?: string;
}

export const InputAnggaranView: React.FC = () => {
  const {
    selectedTahun,
    programs,
    kegiatanList,
    subKegiatanList,
    belanjaList,
    sumberDanaList,
    anggaranList,
    addAnggaran,
    updateAnggaran,
    deleteAnggaran,
    clearAnggaranDatabase,
    importAnggaranBatch,
    currentUser
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

  // Edit and Delete Modal States
  const [editingAnggaran, setEditingAnggaran] = useState<Anggaran | null>(null);
  const [deletingAnggaran, setDeletingAnggaran] = useState<Anggaran | null>(null);

  // Edit form state
  const [editPagu, setEditPagu] = useState<number>(0);
  const [editRevisi, setEditRevisi] = useState<number>(0);
  const [editNilaiSPD, setEditNilaiSPD] = useState<number>(0);
  const [editSumberDana, setEditSumberDana] = useState<string>('DAU');

  // Excel Import States
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedFileName, setImportedFileName] = useState('');
  const [previewData, setPreviewData] = useState<PreviewAnggaranRow[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [overwriteMode, setOverwriteMode] = useState<boolean>(true);

  // Form State
  const [kodeProgram, setKodeProgram] = useState(programs[0]?.kodeProgram || '5.01.01');
  const [kodeKegiatan, setKodeKegiatan] = useState(kegiatanList[0]?.kodeKegiatan || '5.01.01.2.01');
  const [kodeSub, setKodeSub] = useState(subKegiatanList[0]?.kodeSub || '5.01.01.2.01.01');
  const [kodeBelanja, setKodeBelanja] = useState(belanjaList[0]?.kodeBelanja || '5.1.02.01.01.0024');
  const [pagu, setPagu] = useState<number>(500000000);
  const [revisi, setRevisi] = useState<number>(0);
  const [nilaiSPD, setNilaiSPD] = useState<number>(500000000);
  const [sumberDana, setSumberDana] = useState('DAU');

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
      k => k.kodeProgram === progCode && (!k.tahun || k.tahun === selectedTahun)
    );
    const kegs = matchingKegs.length > 0 ? matchingKegs : kegiatanList.filter(k => k.kodeProgram === progCode);

    if (kegs.length > 0) {
      const firstKeg = kegs[0].kodeKegiatan;
      setKodeKegiatan(firstKeg);
      const matchingSubs = subKegiatanList.filter(
        s => s.kodeKegiatan === firstKeg && (!s.tahun || s.tahun === selectedTahun)
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
      s => s.kodeKegiatan === kegCode && (!s.tahun || s.tahun === selectedTahun)
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
  const handleOpenEdit = (a: Anggaran) => {
    setEditingAnggaran(a);
    setEditPagu(a.pagu);
    setEditRevisi(a.revisi);
    setEditNilaiSPD(a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir);
    setEditSumberDana(a.sumberDana || 'DAU');
  };

  // Save Edit Anggaran
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAnggaran) return;

    updateAnggaran(editingAnggaran.id, {
      pagu: editPagu,
      revisi: editRevisi,
      nilaiSPD: editNilaiSPD,
      sumberDana: editSumberDana
    });

    setEditingAnggaran(null);
  };

  // Confirm Delete Anggaran
  const handleConfirmDelete = () => {
    if (!deletingAnggaran) return;
    deleteAnggaran(deletingAnggaran.id);
    setDeletingAnggaran(null);
  };

  // Download Excel Template for Anggaran Pagu
  const handleDownloadTemplate = () => {
    const sampleData = [
      {
        'Tahun': selectedTahun,
        'Kode Program': '5.01.01',
        'Kode Kegiatan': '5.01.01.2.01',
        'Kode Sub Kegiatan': '5.01.01.2.01.01',
        'Kode Belanja': '5.1.02.01.01.0024',
        'Nama Belanja': 'Belanja Alat/Bahan untuk Kegiatan Kantor-Alat Tulis Kantor',
        'Pagu Murni': 150000000,
        'Revisi': 0,
        'Nilai SPD': 150000000,
        'Sumber Dana': 'DAU'
      },
      {
        'Tahun': selectedTahun,
        'Kode Program': '5.01.01',
        'Kode Kegiatan': '5.01.01.2.01',
        'Kode Sub Kegiatan': '5.01.01.2.01.01',
        'Kode Belanja': '5.1.02.01.01.0025',
        'Nama Belanja': 'Belanja Kertas dan Cover Cetakan Laporan',
        'Pagu Murni': 75000000,
        'Revisi': 5000000,
        'Nilai SPD': 80000000,
        'Sumber Dana': 'DAU'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Pagu_Anggaran');
    safeDownloadExcel(wb, `Template_Import_Pagu_Anggaran_NTB_${selectedTahun}.xlsx`);
  };

  // Handle Upload Excel File
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

        // Smart Header Finder: detect header row if file has title lines
        const rows2D: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        let headerRowIndex = 0;

        for (let i = 0; i < Math.min(rows2D.length, 20); i++) {
          const rowStr = (rows2D[i] || []).map(c => String(c).toLowerCase()).join(' ');
          if (
            rowStr.includes('kode') ||
            rowStr.includes('belanja') ||
            rowStr.includes('rekening') ||
            rowStr.includes('pagu') ||
            rowStr.includes('uraian') ||
            rowStr.includes('program') ||
            rowStr.includes('kegiatan')
          ) {
            headerRowIndex = i;
            break;
          }
        }

        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, { range: headerRowIndex, defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setImportErrors(['File Excel kosong atau format tabel tidak terdeteksi.']);
          setPreviewData([]);
          return;
        }

        const existingKeys = new Set(
          anggaranList.map(a => `${a.tahun}_${(a.kodeSub || '').trim().toLowerCase()}_${a.kodeBelanja.trim().toLowerCase()}`)
        );
        const parsedRows: PreviewAnggaranRow[] = [];
        const errs: string[] = [];

        const parseNumber = (val: any): number => {
          if (typeof val === 'number') return isNaN(val) ? 0 : val;
          if (val === undefined || val === null) return 0;
          let s = String(val).trim();
          if (!s) return 0;

          s = s.replace(/^(rp|idr)\.?\s*/i, '').replace(/[\s\u00A0]/g, '').trim();

          if (s.includes('.') && s.includes(',')) {
            if (s.lastIndexOf('.') < s.lastIndexOf(',')) {
              s = s.replace(/\./g, '').replace(',', '.');
            } else {
              s = s.replace(/,/g, '');
            }
          } else if (s.includes('.')) {
            const parts = s.split('.');
            if (parts.length > 2) {
              s = s.replace(/\./g, '');
            } else if (parts.length === 2 && parts[1].length === 3) {
              s = s.replace(/\./g, '');
            }
          } else if (s.includes(',')) {
            const parts = s.split(',');
            if (parts.length > 2) {
              s = s.replace(/,/g, '');
            } else if (parts.length === 2) {
              if (parts[1].length === 3) {
                s = s.replace(/,/g, '');
              } else {
                s = s.replace(',', '.');
              }
            }
          }

          const num = parseFloat(s);
          return isNaN(num) ? 0 : num;
        };

        rawJson.forEach((row, idx) => {
          const getVal = (...keys: string[]) => {
            for (const key of keys) {
              const matchedKey = Object.keys(row).find(k => {
                if (!k) return false;
                const cleanK = k.trim().toLowerCase().replace(/[\s_\-()/.:]/g, '').replace(/rp/g, '');
                const cleanKey = key.toLowerCase().replace(/[\s_\-()/.:]/g, '').replace(/rp/g, '');
                return cleanK === cleanKey;
              });
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null && String(row[matchedKey]).trim() !== '') {
                return String(row[matchedKey]).trim();
              }
            }

            for (const key of keys) {
              const matchedKey = Object.keys(row).find(k => {
                if (!k) return false;
                const cleanK = k.trim().toLowerCase().replace(/[\s_\-()/.:]/g, '').replace(/rp/g, '');
                const cleanKey = key.toLowerCase().replace(/[\s_\-()/.:]/g, '').replace(/rp/g, '');
                return cleanK.includes(cleanKey);
              });
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null && String(row[matchedKey]).trim() !== '') {
                return String(row[matchedKey]).trim();
              }
            }
            return '';
          };

          const thn = parseInt(getVal('tahun', 'thn', 'tahunanggaran', 'ta') || String(selectedTahun), 10) || selectedTahun;
          const prog = getVal('kodeprogram', 'kodeprog', 'program', 'prog') || '5.01.01';
          const keg = getVal('kodekegiatan', 'kodekeg', 'kegiatan', 'keg') || '5.01.01.2.01';
          const sub = getVal('kodesubkegiatan', 'kodesubkeg', 'kodesub', 'subkegiatan', 'sub') || '5.01.01.2.01.01';
          const bel = getVal('kodebelanja', 'koderekening', 'koderek', 'rekening', 'kode');
          const belObj = belanjaList.find(b => b.kodeBelanja.trim().toLowerCase() === (bel || '').trim().toLowerCase());
          const namaBel = getVal('namabelanja', 'uraianbelanja', 'uraian', 'namarekening', 'nama') || belObj?.namaBelanja || `Belanja ${bel}`;
          
          const paguMurniRaw = getVal('pagumurni', 'nilaipagumurni', 'anggaranpagumurni', 'murni', 'pagumurni(rp)');
          const paguAkhirRaw = getVal('paguakhir', 'totalpagu', 'pagusetelahpergeseran', 'paguakhir(rp)', 'anggaranakhir');
          const paguGeneralRaw = getVal('pagu', 'nilaipagu', 'anggaranpagu', 'nilai', 'anggaran', 'pagu(rp)');

          let paguVal = parseNumber(paguMurniRaw || paguGeneralRaw);
          const revVal = parseNumber(getVal('revisi', 'pergeseran', 'perubahan', 'revisipergeseran'));
          let paguAkhirVal = parseNumber(paguAkhirRaw);

          if (paguVal === 0 && paguAkhirVal > 0) {
            paguVal = Math.max(0, paguAkhirVal - revVal);
          } else if (paguAkhirVal === 0 && paguVal > 0) {
            paguAkhirVal = paguVal + revVal;
          }

          const spdValRaw = getVal('nilaispd', 'spd', 'paguspd', 'jumlahspd');
          const spdVal = spdValRaw ? parseNumber(spdValRaw) : (paguVal + revVal);
          const sdVal = getVal('sumberdana', 'sumber', 'sd') || 'DAU';

          const compositeKey = `${thn}_${sub.trim().toLowerCase()}_${(bel || '').trim().toLowerCase()}`;
          const isExisting = existingKeys.has(compositeKey);

          let err = '';
          if (!bel) {
            err = 'Kode Belanja/Rekening kosong.';
            errs.push(`Baris ${idx + headerRowIndex + 2}: Kode Belanja kosong.`);
          } else if (paguVal < 0) {
            err = 'Nilai pagu murni tidak boleh negatif.';
            errs.push(`Baris ${idx + headerRowIndex + 2}: Nilai pagu murni negatif.`);
          }

          parsedRows.push({
            rowNum: idx + 1,
            tahun: thn,
            kodeProgram: prog,
            kodeKegiatan: keg,
            kodeSub: sub,
            kodeBelanja: bel,
            namaBelanja: namaBel,
            pagu: paguVal,
            revisi: revVal,
            nilaiSPD: spdVal,
            sumberDana: sdVal,
            isValid: !err,
            status: isExisting ? 'Akan Diperbarui' : 'Data Baru',
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

  // Execute Import
  const handleProcessImportExcel = () => {
    const validRows = previewData.filter(r => r.isValid);
    if (validRows.length === 0) return;

    const res = importAnggaranBatch(
      validRows.map(r => ({
        tahun: r.tahun,
        kodeProgram: r.kodeProgram,
        kodeKegiatan: r.kodeKegiatan,
        kodeSub: r.kodeSub,
        kodeBelanja: r.kodeBelanja,
        namaBelanja: r.namaBelanja,
        pagu: r.pagu,
        revisi: r.revisi,
        nilaiSPD: r.nilaiSPD,
        sumberDana: r.sumberDana
      })),
      importedFileName || 'Import_Pagu_Anggaran.xlsx',
      overwriteMode
    );

    setImportSuccessMsg(
      `Berhasil mengimpor ${res.successCount} data Pagu Anggaran (${overwriteMode ? 'Mode Replace Data TA ' + selectedTahun : 'Mode Update'}). Total Pagu di Sistem Sesuai 100% dengan File Excel!`
    );
    setPreviewData([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const belObj = belanjaList.find(b => b.kodeBelanja === kodeBelanja);
    addAnggaran({
      tahun: selectedTahun,
      kodeProgram,
      kodeKegiatan,
      kodeSub,
      kodeBelanja,
      namaBelanja: belObj?.namaBelanja || 'Belanja Operasional',
      pagu,
      revisi,
      nilaiSPD,
      operator: currentUser.nama,
      sumberDana
    });
    setShowForm(false);
    setPagu(100000000);
    setRevisi(0);
    setNilaiSPD(100000000);
  };

  const currentAnggaran = anggaranList.filter(a => Number(a.tahun) === Number(selectedTahun));
  const totalPaguMurni = currentAnggaran.reduce((s, a) => s + a.pagu, 0);
  const totalRevisi = currentAnggaran.reduce((s, a) => s + a.revisi, 0);
  const totalNilaiSPD = currentAnggaran.reduce((s, a) => s + (a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir), 0);
  const totalPaguAkhir = currentAnggaran.reduce((s, a) => s + a.paguAkhir, 0);

  const validPreviewCount = previewData.filter(r => r.isValid).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Input Anggaran & Pagu Belanja</h1>
          </div>
          <p className="text-xs text-slate-400">
            Penetapan Pagu Murni, Pergeseran / Revisi Anggaran & Nilai SPD Tahun Anggaran {selectedTahun}
          </p>
        </div>

        {!isReadOnly && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowClearModal(true)}
              className="flex items-center gap-2 rounded-xl border border-rose-900/60 bg-rose-950/40 px-3.5 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-900/60 hover:border-rose-700 transition"
              id="btn-clear-db-anggaran"
              title="Kosongkan Database Anggaran Pagu"
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
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs font-bold text-emerald-400 hover:border-emerald-500 hover:bg-slate-800 transition"
              id="btn-import-excel-anggaran"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Import File Excel</span>
            </button>

            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/50"
              id="btn-toggle-add-anggaran"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Pagu Anggaran</span>
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Pagu Murni</span>
          <div className="mt-1 text-base font-black text-white">Rp {totalPaguMurni.toLocaleString('id-ID')}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Revisi / Pergeseran</span>
          <div className="mt-1 text-base font-black text-amber-400">
            {totalRevisi >= 0 ? '+' : ''}Rp {totalRevisi.toLocaleString('id-ID')}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 border-l-4 border-l-sky-500">
          <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">Total Nilai SPD</span>
          <div className="mt-1 text-base font-black text-sky-300">Rp {totalNilaiSPD.toLocaleString('id-ID')}</div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 border-l-4 border-l-emerald-500">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">Total Pagu Akhir</span>
          <div className="mt-1 text-base font-black text-emerald-300">Rp {totalPaguAkhir.toLocaleString('id-ID')}</div>
        </div>
      </div>

      {/* INPUT FORM MODAL / SECTION */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-emerald-600/40 bg-slate-900 p-6 shadow-2xl space-y-4">
          <h2 className="text-sm font-bold text-emerald-300 border-b border-slate-800 pb-2">
            Form Penetapan Pagu Belanja
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-xs font-bold text-slate-300">Pilih Program:</label>
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
              <label className="text-xs font-bold text-slate-300">Pilih Kegiatan:</label>
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
              <label className="text-xs font-bold text-slate-300">Pilih Sub Kegiatan:</label>
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

            <div>
              <label className="text-xs font-bold text-slate-300">Nilai Pagu Murni (Rp):</label>
              <input
                type="number"
                required
                min={0}
                value={pagu}
                onChange={e => {
                  const val = Number(e.target.value);
                  setPagu(val);
                  setNilaiSPD(val + revisi);
                }}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono font-bold text-emerald-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Revisi / Pergeseran (Rp):</label>
              <input
                type="number"
                value={revisi}
                onChange={e => {
                  const val = Number(e.target.value);
                  setRevisi(val);
                  setNilaiSPD(pagu + val);
                }}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono font-bold text-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Nilai SPD (Surat Penyediaan Dana) (Rp):</label>
              <input
                type="number"
                required
                min={0}
                value={nilaiSPD}
                onChange={e => setNilaiSPD(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono font-bold text-sky-400"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Sumber Dana:</label>
              <select
                value={sumberDana}
                onChange={e => setSumberDana(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
              >
                {sumberDanaList.map(sd => (
                  <option key={sd.kodeSumber} value={sd.namaSumber || sd.kodeSumber}>
                    {sd.namaSumber}
                  </option>
                ))}
              </select>
            </div>
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
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow-md"
            >
              Simpan Pagu Anggaran
            </button>
          </div>
        </form>
      )}

      {/* TABLE DATA ANGGARAN */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Rincian Pagu Anggaran TA {selectedTahun}
          </h3>
          <input
            type="text"
            placeholder="Cari kode, sub kegiatan, atau belanja..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder-slate-500 w-64"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Sub Kegiatan</th>
                <th className="px-4 py-3">Kode Belanja</th>
                <th className="px-4 py-3">Uraian Belanja</th>
                <th className="px-4 py-3 text-right">Pagu Murni</th>
                <th className="px-4 py-3 text-right">Revisi</th>
                <th className="px-4 py-3 text-right text-sky-400">Nilai SPD</th>
                <th className="px-4 py-3 text-right">Pagu Akhir</th>
                <th className="px-4 py-3">Sumber Dana</th>
                <th className="px-4 py-3">Operator</th>
                {!isReadOnly && <th className="px-4 py-3 text-center">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {currentAnggaran
                .filter(a => {
                  const subObj = subKegiatanList.find(s => s.kodeSub === a.kodeSub);
                  const subSearchText = subObj ? `${subObj.kodeSub} ${subObj.namaSub}` : a.kodeSub || '';
                  const term = searchTerm.toLowerCase();
                  return (
                    a.kodeBelanja.toLowerCase().includes(term) ||
                    a.namaBelanja.toLowerCase().includes(term) ||
                    (a.kodeSub && a.kodeSub.toLowerCase().includes(term)) ||
                    subSearchText.toLowerCase().includes(term)
                  );
                })
                .map(a => {
                  const subObj = subKegiatanList.find(s => s.kodeSub === a.kodeSub);
                  const namaSub = subObj ? subObj.namaSub : '';
                  return (
                    <tr key={a.id} className="hover:bg-slate-800/50">
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-mono text-[11px] font-bold text-amber-400">{a.kodeSub || '-'}</div>
                        {namaSub && (
                          <div className="text-[11px] text-slate-400 truncate max-w-[220px]" title={namaSub}>
                            {namaSub}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-400">{a.kodeBelanja}</td>
                      <td className="px-4 py-3 font-semibold text-white max-w-xs">{a.namaBelanja}</td>
                      <td className="px-4 py-3 text-right font-mono">Rp {a.pagu.toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 text-right font-mono text-amber-400">
                        {a.revisi >= 0 ? '+' : ''}Rp {a.revisi.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-sky-300">
                        Rp {(a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-300">
                        Rp {a.paguAkhir.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">{a.sumberDana || 'DAU'}</td>
                      <td className="px-4 py-3 text-slate-400">{a.operator}</td>
                      {!isReadOnly && (
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleOpenEdit(a)}
                              className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-amber-400 transition"
                              title="Edit Pagu Anggaran"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeletingAnggaran(a)}
                              className="rounded p-1 text-slate-400 hover:bg-rose-950 hover:text-rose-400 transition"
                              title="Hapus Data"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT ANGGARAN MODAL */}
      {editingAnggaran && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Edit Pagu Anggaran</h3>
              </div>
              <button
                onClick={() => setEditingAnggaran(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block font-mono font-bold text-[11px]">{editingAnggaran.kodeBelanja}</span>
                <span className="text-white font-semibold block mt-0.5">{editingAnggaran.namaBelanja}</span>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Nilai Pagu Murni (Rp):</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editPagu}
                  onChange={e => setEditPagu(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono font-bold text-emerald-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Revisi / Pergeseran (Rp):</label>
                <input
                  type="number"
                  value={editRevisi}
                  onChange={e => setEditRevisi(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono font-bold text-amber-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Nilai SPD (Surat Penyediaan Dana) (Rp):</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={editNilaiSPD}
                  onChange={e => setEditNilaiSPD(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs font-mono font-bold text-sky-400"
                />
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1">Sumber Dana:</label>
                <select
                  value={editSumberDana}
                  onChange={e => setEditSumberDana(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
                >
                  {sumberDanaList.map(sd => (
                    <option key={sd.kodeSumber} value={sd.namaSumber || sd.kodeSumber}>
                      {sd.namaSumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex justify-between font-bold">
                <span>Estimasi Pagu Akhir:</span>
                <span className="text-emerald-400 font-mono">Rp {(editPagu + editRevisi).toLocaleString('id-ID')}</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingAnggaran(null)}
                  className="rounded-xl bg-slate-800 px-4 py-2 font-bold text-slate-300 hover:bg-slate-700 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2 font-bold text-white transition shadow-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingAnggaran && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-rose-800/50 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-950 border border-rose-800/60">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Konfirmasi Hapus Data Pagu</h3>
                <p className="text-xs text-slate-400">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs space-y-1">
              <div className="text-emerald-400 font-mono font-bold">{deletingAnggaran.kodeBelanja}</div>
              <div className="text-white font-semibold">{deletingAnggaran.namaBelanja}</div>
              <div className="text-slate-400">Pagu Akhir: Rp {deletingAnggaran.paguAkhir.toLocaleString('id-ID')}</div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDeletingAnggaran(null)}
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
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Import Pagu Anggaran dari Excel</h3>
                  <p className="text-xs text-slate-400">
                    Upload file spreadsheet (.xlsx/.xls) untuk memperbarui atau menambah Pagu Anggaran TA {selectedTahun}
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
                    Gunakan template standar dengan kolom: Tahun, Kode Program, Kode Kegiatan, Kode Sub, Kode Belanja, Pagu Murni, Revisi, Nilai SPD, Sumber Dana.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="flex items-center justify-center gap-2 w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-300 border border-slate-700 py-2.5 transition"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Template Excel</span>
                </button>
              </div>

              <div className="rounded-2xl border border-dashed border-emerald-600/50 bg-emerald-950/20 hover:bg-emerald-950/30 p-4 flex flex-col items-center justify-center text-center transition">
                <Upload className="h-8 w-8 text-emerald-400 mb-2" />
                <span className="text-xs font-bold text-slate-200">2. Upload File Excel Data Pagu</span>
                <p className="text-[11px] text-slate-400 mt-0.5">Pilih file .xlsx atau .xls dari komputer Anda</p>
                <label className="mt-3 cursor-pointer rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md transition inline-flex items-center gap-2">
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

            {/* Preview Data Table & Summaries */}
            {previewData.length > 0 && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-emerald-400" /> Pratinjau Data File Excel ({previewData.length} baris)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {validPreviewCount} data valid siap diimpor
                  </span>
                </div>

                {/* Summary Totals Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-slate-950 border border-emerald-500/30 text-xs shadow-inner">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Pagu Murni</span>
                    <span className="font-mono font-bold text-white">
                      Rp {previewData.filter(r => r.isValid).reduce((s, r) => s + r.pagu, 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Pergeseran</span>
                    <span className="font-mono font-bold text-amber-400">
                      Rp {previewData.filter(r => r.isValid).reduce((s, r) => s + r.revisi, 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Pagu Akhir</span>
                    <span className="font-mono font-bold text-emerald-400">
                      Rp {previewData.filter(r => r.isValid).reduce((s, r) => s + (r.pagu + r.revisi), 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total SPD</span>
                    <span className="font-mono font-bold text-sky-400">
                      Rp {previewData.filter(r => r.isValid).reduce((s, r) => s + r.nilaiSPD, 0).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>

                {/* Import Mode Selection */}
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
                  <span className="font-bold text-slate-300 block">Pilihan Modus Import Data Pagu:</span>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <label className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer border transition ${
                      overwriteMode ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      <input
                        type="radio"
                        name="importOverwriteMode"
                        checked={overwriteMode}
                        onChange={() => setOverwriteMode(true)}
                        className="text-emerald-500 focus:ring-emerald-500 accent-emerald-500"
                      />
                      <span className="font-semibold">Timpa Seluruh Data Pagu TA {selectedTahun} (Sangat Direkomendasikan)</span>
                    </label>

                    <label className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer border transition ${
                      !overwriteMode ? 'bg-amber-950/50 border-amber-500 text-amber-200' : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      <input
                        type="radio"
                        name="importOverwriteMode"
                        checked={!overwriteMode}
                        onChange={() => setOverwriteMode(false)}
                        className="text-amber-500 focus:ring-amber-500 accent-amber-500"
                      />
                      <span>Gabung / Tambah Data Saja</span>
                    </label>
                  </div>
                </div>

                <div className="max-h-52 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-950 text-xs scrollbar-none">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-300 font-bold sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2">No</th>
                        <th className="px-3 py-2">Sub Kegiatan</th>
                        <th className="px-3 py-2">Kode Belanja</th>
                        <th className="px-3 py-2">Uraian Belanja</th>
                        <th className="px-3 py-2 text-right">Pagu Murni</th>
                        <th className="px-3 py-2 text-right">Revisi</th>
                        <th className="px-3 py-2 text-right text-sky-400">Nilai SPD</th>
                        <th className="px-3 py-2 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {previewData.slice(0, 15).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="px-3 py-2 font-mono text-slate-500">{row.rowNum}</td>
                          <td className="px-3 py-2 font-mono text-slate-400 text-[11px] max-w-[120px] truncate">{row.kodeSub || '-'}</td>
                          <td className="px-3 py-2 font-mono text-emerald-400 font-bold">{row.kodeBelanja || '-'}</td>
                          <td className="px-3 py-2 text-white max-w-xs truncate">{row.namaBelanja}</td>
                          <td className="px-3 py-2 text-right font-mono">Rp {row.pagu.toLocaleString('id-ID')}</td>
                          <td className="px-3 py-2 text-right font-mono text-amber-400">Rp {row.revisi.toLocaleString('id-ID')}</td>
                          <td className="px-3 py-2 text-right font-mono text-sky-300">Rp {row.nilaiSPD.toLocaleString('id-ID')}</td>
                          <td className="px-3 py-2 text-center">
                            {row.isValid ? (
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                row.status === 'Akan Diperbarui' ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              }`}>
                                {row.status}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800" title={row.validationError}>
                                Error
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
                disabled={validPreviewCount === 0}
                onClick={handleProcessImportExcel}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 transition"
              >
                <FileCheck className="h-4 w-4" />
                <span>Proses Import {validPreviewCount} Data Pagu</span>
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
                <h3 className="text-base font-bold text-white">Kosongkan Database Anggaran Pagu</h3>
                <p className="text-xs text-slate-400">Pilih skop penghapusan data Pagu Anggaran.</p>
              </div>
            </div>

            <div className="rounded-xl bg-rose-950/30 border border-rose-900/50 p-3 text-xs text-rose-200 leading-relaxed space-y-1">
              <p className="font-bold text-rose-300">Peringatan Penting!</p>
              <p>
                Tindakan ini akan menghapus data rincian Pagu Murni, Pergeseran, dan Nilai SPD dari database.
                Data yang terhapus tidak dapat dikembalikan.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  clearAnggaranDatabase(selectedTahun);
                  setShowClearModal(false);
                }}
                className="w-full rounded-xl bg-rose-600 hover:bg-rose-500 p-3 text-xs font-bold text-white transition flex items-center justify-between shadow-md"
              >
                <span>Hapus Data Tahun Anggaran {selectedTahun} Saja</span>
                <Trash2 className="h-4 w-4" />
              </button>

              <button
                onClick={() => {
                  clearAnggaranDatabase();
                  setShowClearModal(false);
                }}
                className="w-full rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 border border-slate-700 hover:border-rose-800 p-3 text-xs font-bold text-slate-300 transition flex items-center justify-between"
              >
                <span>Hapus Seluruh Data Pagu (Semua Tahun)</span>
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
