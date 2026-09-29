import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { NTBLogo } from '../common/NTBLogo';
import * as XLSX from 'xlsx';
import {
  getOPDDetailsBreakdown,
  downloadOPDExcelTemplate,
  OPDProgramItem,
  OPDKegiatanItem,
  OPDSubKegiatanItem,
  OPDBelanjaItem
} from '../../data/opdProgramData';
import {
  DAFTAR_SELURUH_OPD_NTB,
  NTBOPDItem,
  TOTAL_ANGGARAN_PROVINSI_NTB,
  TOTAL_REALISASI_PROVINSI_NTB,
  TOTAL_SILPA_PROVINSI_NTB,
  PERSENTASE_SERAPAN_PROVINSI_NTB
} from '../../data/daftarOPDNTB';
import {
  LayoutDashboard,
  Building2,
  Database,
  FileSpreadsheet,
  BarChart3,
  Settings,
  Search,
  Filter,
  Download,
  Printer,
  TrendingUp,
  PieChart,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowUpDown,
  ChevronRight,
  Layers,
  Eye,
  RefreshCw,
  FileText,
  Sparkles,
  Plus,
  ExternalLink,
  ShieldCheck,
  Award,
  DollarSign,
  ArrowRight,
  X,
  SlidersHorizontal,
  FolderKanban,
  Check,
  Building,
  UserCheck,
  UploadCloud,
  FileCheck
} from 'lucide-react';

interface PortalSeluruhOPDViewProps {
  onSwitchToBakesbang?: () => void;
}

export type PortalTab = 'dashboard' | 'master' | 'transaksi' | 'laporan' | 'analisis' | 'pengaturan';

export const PortalSeluruhOPDView: React.FC<PortalSeluruhOPDViewProps> = ({ onSwitchToBakesbang }) => {
  const { selectedTahun, sheetConfig, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<PortalTab>('dashboard');
  const [selectedOpdId, setSelectedOpdId] = useState<string>('ALL'); // 'ALL' = Konsolidasi Seluruh OPD NTB
  const [searchQuery, setSearchQuery] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState<string>('ALL');
  const [statusKinerjaFilter, setStatusKinerjaFilter] = useState<string>('ALL');
  const [selectedOpdDetail, setSelectedOpdDetail] = useState<NTBOPDItem | null>(null);
  const [sortBy, setSortBy] = useState<'pagu' | 'realisasi' | 'serapan' | 'nama'>('serapan');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [laporanSubTab, setLaporanSubTab] = useState<'rekap-opd' | 'per-program' | 'per-kegiatan' | 'per-subkegiatan' | 'per-belanja' | 'triwulan' | 'semester' | 'silpa'>('rekap-opd');
  const [laporanOpdId, setLaporanOpdId] = useState<string>('OPD-006'); // Default to Dinas Kesehatan NTB
  const [selectedTriwulan, setSelectedTriwulan] = useState<number>(3); // Q3
  const [selectedSemester, setSelectedSemester] = useState<number>(2); // S2
  const [showAddOpdModal, setShowAddOpdModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<any[]>([]);
  const [importStats, setImportStats] = useState<{ total: number; updated: number; added: number } | null>(null);
  const [customBreakdownMap, setCustomBreakdownMap] = useState<Record<string, any>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [opdListState, setOpdListState] = useState<NTBOPDItem[]>(DAFTAR_SELURUH_OPD_NTB);

  // New OPD Form State
  const [newOpdForm, setNewOpdForm] = useState({
    namaOPD: '',
    singkatan: '',
    kodeOPD: '',
    kategori: 'Dinas Daerah' as const,
    kepalaBadan: '',
    nipKepala: '',
    alamat: '',
    targetPagu: 25000000000,
    realisasiSP2D: 18500000000
  });

  // Active OPD object (if selected specific OPD)
  const currentActiveOpd = useMemo(() => {
    if (selectedOpdId === 'ALL') return null;
    return opdListState.find(o => o.id === selectedOpdId) || null;
  }, [selectedOpdId, opdListState]);

  // Filtered & Sorted OPD list
  const filteredOpds = useMemo(() => {
    return opdListState.filter(item => {
      const matchQuery =
        item.namaOPD.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.singkatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.kodeOPD.includes(searchQuery) ||
        item.kepalaBadan.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchKategori = kategoriFilter === 'ALL' || item.kategori === kategoriFilter;
      const matchStatus = statusKinerjaFilter === 'ALL' || item.statusKinerja === statusKinerjaFilter;

      return matchQuery && matchKategori && matchStatus;
    }).sort((a, b) => {
      const serapanA = (a.realisasiSP2D / a.targetPagu) * 100;
      const serapanB = (b.realisasiSP2D / b.targetPagu) * 100;

      if (sortBy === 'serapan') {
        return sortOrder === 'desc' ? serapanB - serapanA : serapanA - serapanB;
      }
      if (sortBy === 'pagu') {
        return sortOrder === 'desc' ? b.targetPagu - a.targetPagu : a.targetPagu - b.targetPagu;
      }
      if (sortBy === 'realisasi') {
        return sortOrder === 'desc' ? b.realisasiSP2D - a.realisasiSP2D : a.realisasiSP2D - b.realisasiSP2D;
      }
      return sortOrder === 'desc' ? b.namaOPD.localeCompare(a.namaOPD) : a.namaOPD.localeCompare(b.namaOPD);
    });
  }, [opdListState, searchQuery, kategoriFilter, statusKinerjaFilter, sortBy, sortOrder]);

  // Dynamic Aggregations
  const totalPaguDisplay = useMemo(() => {
    if (currentActiveOpd) return currentActiveOpd.targetPagu;
    return filteredOpds.reduce((sum, o) => sum + o.targetPagu, 0);
  }, [currentActiveOpd, filteredOpds]);

  const totalRealisasiDisplay = useMemo(() => {
    if (currentActiveOpd) return currentActiveOpd.realisasiSP2D;
    return filteredOpds.reduce((sum, o) => sum + o.realisasiSP2D, 0);
  }, [currentActiveOpd, filteredOpds]);

  const totalSilpaDisplay = totalPaguDisplay - totalRealisasiDisplay;
  const persentaseSerapanDisplay = totalPaguDisplay > 0 ? (totalRealisasiDisplay / totalPaguDisplay) * 100 : 0;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatRupiahSingkat = (val: number) => {
    if (val >= 1_000_000_000_000) {
      return `Rp ${(val / 1_000_000_000_000).toFixed(2)} T`;
    }
    if (val >= 1_000_000_000) {
      return `Rp ${(val / 1_000_000_000).toFixed(2)} M`;
    }
    if (val >= 1_000_000) {
      return `Rp ${(val / 1_000_000).toFixed(2)} Jt`;
    }
    return formatRupiah(val);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    const csvRows = [
      ['KONSOLIDASI LAPORAN REALISASI ANGGARAN SELURUH OPD PROVINSI NUSA TENGGARA BARAT'],
      [`Tahun Anggaran: ${selectedTahun}`, `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`],
      [],
      ['No', 'Kode SKPD/OPD', 'Nama OPD', 'Kategori', 'Kepala OPD / NIP', 'Pagu Anggaran (Rp)', 'Realisasi SP2D (Rp)', 'Sisa Pagu / SiLPA (Rp)', '% Serapan', 'Status Kinerja']
    ];

    filteredOpds.forEach((opd, idx) => {
      const serapan = ((opd.realisasiSP2D / opd.targetPagu) * 100).toFixed(2);
      const silpa = opd.targetPagu - opd.realisasiSP2D;
      csvRows.push([
        String(idx + 1),
        opd.kodeOPD,
        `"${opd.namaOPD}"`,
        opd.kategori,
        `"${opd.kepalaBadan} (${opd.nipKepala})"`,
        String(opd.targetPagu),
        String(opd.realisasiSP2D),
        String(silpa),
        `${serapan}%`,
        opd.statusKinerja
      ]);
    });

    csvRows.push([]);
    csvRows.push([
      'TOTAL',
      '',
      `GABUNGAN ${filteredOpds.length} OPD PEMPROV NTB`,
      '',
      '',
      String(totalPaguDisplay),
      String(totalRealisasiDisplay),
      String(totalSilpaDisplay),
      `${persentaseSerapanDisplay.toFixed(2)}%`,
      ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.map(e => e.join(';')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Konsolidasi_Keuangan_Seluruh_OPD_NTB_TA${selectedTahun}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveNewOpd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOpdForm.namaOPD || !newOpdForm.kodeOPD) return;

    const newOpd: NTBOPDItem = {
      id: `OPD-${String(opdListState.length + 1).padStart(3, '0')}`,
      kodeOPD: newOpdForm.kodeOPD,
      namaOPD: newOpdForm.namaOPD,
      singkatan: newOpdForm.singkatan || newOpdForm.namaOPD.substring(0, 10).toUpperCase(),
      kategori: newOpdForm.kategori,
      kepalaBadan: newOpdForm.kepalaBadan || 'Belum Ditetapkan',
      nipKepala: newOpdForm.nipKepala || '-',
      alamat: newOpdForm.alamat || 'Kota Mataram, NTB',
      targetPagu: Number(newOpdForm.targetPagu) || 0,
      realisasiSP2D: Number(newOpdForm.realisasiSP2D) || 0,
      jumlahProgram: 4,
      jumlahKegiatan: 12,
      jumlahTransaksi: 10,
      statusKinerja: 'Sedang'
    };

    setOpdListState(prev => [newOpd, ...prev]);
    setShowAddOpdModal(false);
    setNewOpdForm({
      namaOPD: '',
      singkatan: '',
      kodeOPD: '',
      kategori: 'Dinas Daerah',
      kepalaBadan: '',
      nipKepala: '',
      alamat: '',
      targetPagu: 25000000000,
      realisasiSP2D: 18500000000
    });
  };

  // Target OPD for the detailed Program, Kegiatan, Sub, Belanja reports
  const targetLaporanOpd = useMemo(() => {
    return opdListState.find(o => o.id === laporanOpdId) || opdListState[0];
  }, [laporanOpdId, opdListState]);

  const opdBreakdown = useMemo(() => {
    if (!targetLaporanOpd) return null;
    if (customBreakdownMap[targetLaporanOpd.id]) {
      return customBreakdownMap[targetLaporanOpd.id];
    }
    return getOPDDetailsBreakdown(targetLaporanOpd);
  }, [targetLaporanOpd, customBreakdownMap]);

  // Handle Excel File Upload
  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const rawJson: any[] = XLSX.utils.sheet_to_json(ws);
        
        if (rawJson.length === 0) {
          alert('File Excel kosong atau format tidak terbaca.');
          return;
        }
        setImportPreviewData(rawJson);
        setShowImportModal(true);
      } catch (err) {
        alert('Gagal membaca file Excel. Pastikan format file .xlsx atau .xls valid.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Apply Imported Excel Data to OPD List and Sub-data
  const handleApplyExcelImport = () => {
    if (importPreviewData.length === 0) return;

    let updatedCount = 0;
    let addedCount = 0;
    const newOpds = [...opdListState];
    const newBreakdowns: Record<string, any> = { ...customBreakdownMap };

    importPreviewData.forEach((row, idx) => {
      const nama = row['Nama_OPD'] || row['nama_opd'] || row['OPD'] || row['Nama OPD'] || '';
      const singkatan = row['Singkatan'] || row['singkatan'] || '';
      const kode = row['Kode_OPD'] || row['kode_opd'] || row['Kode SKPD'] || '';
      const pagu = Number(row['Pagu_Anggaran'] || row['pagu'] || row['Pagu'] || 0);
      const realisasi = Number(row['Realisasi_SP2D'] || row['realisasi'] || row['Realisasi'] || 0);
      const kategori = row['Kategori'] || row['kategori'] || 'Dinas Daerah';

      if (!nama && !kode && !singkatan) return;

      const existingIndex = newOpds.findIndex(o => 
        (kode && o.kodeOPD.trim() === String(kode).trim()) ||
        (singkatan && o.singkatan.toLowerCase() === String(singkatan).toLowerCase()) ||
        (nama && o.namaOPD.toLowerCase().includes(String(nama).toLowerCase()))
      );

      let targetId = '';
      if (existingIndex >= 0) {
        targetId = newOpds[existingIndex].id;
        newOpds[existingIndex] = {
          ...newOpds[existingIndex],
          targetPagu: pagu > 0 ? pagu : newOpds[existingIndex].targetPagu,
          realisasiSP2D: realisasi > 0 ? realisasi : newOpds[existingIndex].realisasiSP2D,
          statusKinerja: pagu > 0 ? ((realisasi/pagu) >= 0.8 ? 'Sangat Tinggi' : (realisasi/pagu) >= 0.65 ? 'Tinggi' : 'Sedang') : newOpds[existingIndex].statusKinerja
        };
        updatedCount++;
      } else {
        targetId = `OPD-${String(newOpds.length + 1).padStart(3, '0')}`;
        newOpds.push({
          id: targetId,
          kodeOPD: kode || `1.01.0.00.0.00.${String(newOpds.length + 1).padStart(2, '0')}.0000`,
          namaOPD: nama || `OPD ${singkatan}`,
          singkatan: singkatan || (nama ? nama.substring(0, 10).toUpperCase() : `OPD ${newOpds.length + 1}`),
          kategori: kategori as any,
          kepalaBadan: row['Kepala_Badan'] || row['Kepala OPD'] || 'Belum Ditetapkan',
          nipKepala: row['NIP'] || row['NIP Kepala'] || '-',
          alamat: row['Alamat'] || 'Kota Mataram, NTB',
          targetPagu: pagu,
          realisasiSP2D: realisasi,
          jumlahProgram: 4,
          jumlahKegiatan: 12,
          jumlahTransaksi: 15,
          statusKinerja: pagu > 0 ? ((realisasi/pagu) >= 0.8 ? 'Sangat Tinggi' : (realisasi/pagu) >= 0.65 ? 'Tinggi' : 'Sedang') : 'Sedang'
        });
        addedCount++;
      }

      // If program/kegiatan/sub/belanja are provided in the Excel row
      const progName = row['Nama_Program'] || row['Program'];
      if (progName) {
        if (!newBreakdowns[targetId]) {
          const defaultB = getOPDDetailsBreakdown(newOpds.find(o => o.id === targetId) || newOpds[0]);
          newBreakdowns[targetId] = defaultB;
        }
        const pCode = row['Kode_Program'] || `${targetId}.P1`;
        newBreakdowns[targetId].programs.unshift({
          id: `IMP-P-${Date.now()}-${idx}`,
          opdId: targetId,
          namaOPD: nama,
          kodeProgram: pCode,
          namaProgram: progName,
          pagu: pagu > 0 ? pagu : 1000000000,
          realisasi: realisasi > 0 ? realisasi : 750000000
        });
      }
    });

    setOpdListState(newOpds);
    setCustomBreakdownMap(newBreakdowns);
    setImportStats({ total: importPreviewData.length, updated: updatedCount, added: addedCount });
    setShowImportModal(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Header Banner Antarmuka Seluruh OPD NTB */}
      <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 shadow-2xl shadow-cyan-950/20">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start md:items-center gap-4 md:gap-5">
            <div className="relative flex h-16 w-16 md:h-20 md:w-20 shrink-0 items-center justify-center rounded-2xl bg-slate-950 p-1 border-2 border-cyan-400 shadow-xl shadow-cyan-900/40">
              <NTBLogo className="h-full w-full" />
              <span className="absolute -bottom-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950 ring-2 ring-slate-900">
                40
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="rounded-full bg-cyan-500/20 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-cyan-300 ring-1 ring-cyan-500/40">
                  PORTAL PEMERINTAH PROVINSI NUSA TENGGARA BARAT
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-emerald-300 ring-1 ring-emerald-500/40">
                  40 ORGANISASI PERANGKAT DAERAH (OPD)
                </span>
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase text-amber-300 ring-1 ring-amber-500/40">
                  TA {selectedTahun}
                </span>
              </div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight text-white">
                Sistem Informasi Keuangan Konsolidasi Seluruh OPD NTB
              </h1>
              <p className="text-xs md:text-sm text-cyan-200/80 mt-1 max-w-3xl">
                Antarmuka terpadu pengelolaan anggaran, monitoring realisasi SP2D kas daerah, dan pelaporan keuangan terpadu untuk seluruh Dinas, Badan, Sekretariat, dan RSUD di lingkungan Pemerintah Provinsi Nusa Tenggara Barat.
              </p>
            </div>
          </div>

          {/* Tombol Aksi & Navigasi Antarmuka */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {onSwitchToBakesbang && (
              <button
                type="button"
                onClick={onSwitchToBakesbang}
                className="flex items-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-200 border border-slate-700 hover:border-slate-600 shadow-md transition active:scale-95"
                title="Beralih kembali ke Antarmuka Khusus BAKESBANGPOLDAGRI NTB"
              >
                <Building className="h-4 w-4 text-emerald-400" />
                <span>Ke Antarmuka BAKESBANGPOLDAGRI</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 rounded-2xl bg-slate-800/80 hover:bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-slate-300 border border-slate-700 transition"
              title="Cetak Laporan Konsolidasi Seluruh OPD NTB"
            >
              <Printer className="h-4 w-4 text-cyan-400" />
              <span className="hidden sm:inline">Cetak PDF</span>
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleExcelFileUpload}
              accept=".xlsx,.xls,.csv"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-2xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-950 transition active:scale-95"
              title="Import Data Excel untuk Nama OPD, Pagu Anggaran, dan Realisasi SP2D"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Import Excel OPD</span>
            </button>

            <button
              type="button"
              onClick={downloadOPDExcelTemplate}
              className="flex items-center gap-2 rounded-2xl bg-slate-800 hover:bg-slate-700 px-3.5 py-2.5 text-xs font-semibold text-cyan-300 border border-slate-700 transition"
              title="Unduh Format Template Excel Import Seluruh OPD"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">Format Template</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-950 transition active:scale-95"
              title="Unduh Data Excel Rekapitulasi Seluruh OPD NTB"
            >
              <Download className="h-4 w-4" />
              <span>Ekspor Rekap Excel</span>
            </button>
          </div>
        </div>

        {/* Baris Pemilih OPD Aktif / Konsolidasi */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-cyan-300 shrink-0 flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-cyan-400" />
              <span>Pilih Fokus OPD:</span>
            </span>
            <div className="relative flex-1 min-w-[280px] max-w-md">
              <select
                value={selectedOpdId}
                onChange={e => setSelectedOpdId(e.target.value)}
                className="w-full rounded-xl border border-cyan-500/40 bg-slate-950 py-2 pl-3 pr-8 text-xs font-semibold text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
              >
                <option value="ALL">🌐 KONSOLIDASI SELURUH OPD NTB (GABUNGAN 40 OPD)</option>
                <optgroup label="Badan Daerah">
                  {opdListState.filter(o => o.kategori === 'Badan Daerah').map(o => (
                    <option key={o.id} value={o.id}>
                      {o.singkatan} - {o.namaOPD}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Dinas Daerah">
                  {opdListState.filter(o => o.kategori === 'Dinas Daerah').map(o => (
                    <option key={o.id} value={o.id}>
                      {o.singkatan} - {o.namaOPD}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Sekretariat & Inspektorat">
                  {opdListState.filter(o => o.kategori === 'Sekretariat' || o.kategori === 'Inspektorat').map(o => (
                    <option key={o.id} value={o.id}>
                      {o.singkatan} - {o.namaOPD}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Rumah Sakit & Lainnya">
                  {opdListState.filter(o => o.kategori === 'Rumah Sakit' || o.kategori === 'Satuan Polisi' || o.kategori === 'Lainnya').map(o => (
                    <option key={o.id} value={o.id}>
                      {o.singkatan} - {o.namaOPD}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {selectedOpdId !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedOpdId('ALL')}
                className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-300 transition"
              >
                Reset ke Semua OPD
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="text-slate-400">Status Data:</span>
            <span className="flex items-center gap-1.5 font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-1 rounded-full text-[11px]">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sinkron Kasda BPKAD &amp; SIPD NTB</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Navigasi Tab Menu Utama (Sama Persis dengan Aplikasi Utama) */}
      <div className="sticky top-20 z-20 flex overflow-x-auto gap-2 border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md pb-2 pt-1 scrollbar-none">
        {[
          { id: 'dashboard', label: 'Dashboard Eksekutif OPD', icon: LayoutDashboard, badge: `${filteredOpds.length} OPD` },
          { id: 'master', label: 'Master Data Seluruh OPD', icon: Database, badge: '40 SKPD' },
          { id: 'transaksi', label: 'Transaksi & Pagu Anggaran', icon: FileSpreadsheet, badge: 'Murni & Realisasi' },
          { id: 'laporan', label: 'Pelaporan Keuangan Konsolidasi', icon: FileText, badge: 'LRA / TW / Sem' },
          { id: 'analisis', label: 'Analisis & Ranking Kinerja', icon: BarChart3, badge: 'Evaluasi' },
          { id: 'pengaturan', label: 'Pengaturan & Integrasi Multi-OPD', icon: Settings, badge: 'Sistem' }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as PortalTab)}
              className={`flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-950 border border-cyan-400'
                  : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isActive ? 'bg-cyan-700/80 text-cyan-100' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Ringkasan Eksekutif KPI Cards (Top Metrics) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Pagu */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {currentActiveOpd ? `Pagu ${currentActiveOpd.singkatan}` : 'Total Pagu Anggaran (APBD NTB)'}
            </span>
            <div className="rounded-xl bg-blue-500/10 p-2 text-blue-400 border border-blue-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-white">{formatRupiahSingkat(totalPaguDisplay)}</div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>Rincian Lengkap:</span>
            <span className="font-mono text-slate-200">{formatRupiah(totalPaguDisplay)}</span>
          </div>
        </div>

        {/* Card 2: Total Realisasi SP2D */}
        <div className="rounded-2xl border border-emerald-900/40 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              {currentActiveOpd ? `Realisasi ${currentActiveOpd.singkatan}` : 'Total Realisasi SP2D Pemprov'}
            </span>
            <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-300">{formatRupiahSingkat(totalRealisasiDisplay)}</div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>Pencairan Kasda:</span>
            <span className="font-mono text-emerald-200">{formatRupiah(totalRealisasiDisplay)}</span>
          </div>
        </div>

        {/* Card 3: Sisa Pagu / SiLPA */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sisa Anggaran / Potensi SiLPA
            </span>
            <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400 border border-amber-500/20">
              <PieChart className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-amber-300">{formatRupiahSingkat(totalSilpaDisplay)}</div>
          <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
            <span>Sisa Kas Belum Cair:</span>
            <span className="font-mono text-amber-200">{formatRupiah(totalSilpaDisplay)}</span>
          </div>
        </div>

        {/* Card 4: Persentase Serapan */}
        <div className="rounded-2xl border border-cyan-900/40 bg-gradient-to-br from-slate-900 via-cyan-950/20 to-slate-900 p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
              Rata-rata Persentase Serapan
            </span>
            <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-black text-cyan-300">
            {persentaseSerapanDisplay.toFixed(2)}%
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                persentaseSerapanDisplay >= 80 ? 'bg-emerald-500' : persentaseSerapanDisplay >= 65 ? 'bg-cyan-500' : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, persentaseSerapanDisplay))}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. KONTEN TAB SPESIFIK */}

      {/* TAB 1: DASHBOARD EKSEKUTIF OPD */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Filter Bar & Sorting */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari OPD, singkatan, kode SKPD, atau nama Kepala Dinas..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Kategori Filter */}
              <select
                value={kategoriFilter}
                onChange={e => setKategoriFilter(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
              >
                <option value="ALL">Semua Kategori</option>
                <option value="Dinas Daerah">Dinas Daerah</option>
                <option value="Badan Daerah">Badan Daerah</option>
                <option value="Sekretariat">Sekretariat</option>
                <option value="Inspektorat">Inspektorat</option>
                <option value="Rumah Sakit">Rumah Sakit</option>
              </select>

              {/* Status Kinerja Filter */}
              <select
                value={statusKinerjaFilter}
                onChange={e => setStatusKinerjaFilter(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
              >
                <option value="ALL">Semua Kinerja</option>
                <option value="Sangat Tinggi">Kinerja Sangat Tinggi</option>
                <option value="Tinggi">Kinerja Tinggi</option>
                <option value="Sedang">Kinerja Sedang</option>
                <option value="Perlu Perhatian">Perlu Perhatian</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Urutkan:</span>
              <div className="flex items-center gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('serapan');
                    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                  }}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition ${
                    sortBy === 'serapan' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  % Serapan {sortBy === 'serapan' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('pagu');
                    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                  }}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition ${
                    sortBy === 'pagu' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pagu {sortBy === 'pagu' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
              </div>
            </div>
          </div>

          {/* Grid Kartu OPD NTB */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOpds.map(opd => {
              const pct = (opd.realisasiSP2D / opd.targetPagu) * 100;
              const isSelected = selectedOpdId === opd.id;

              return (
                <div
                  key={opd.id}
                  onClick={() => setSelectedOpdDetail(opd)}
                  className={`group relative rounded-2xl border p-5 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl ${
                    isSelected
                      ? 'border-cyan-400 bg-slate-900 ring-2 ring-cyan-500/40'
                      : 'border-slate-800 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-800/60">
                          {opd.kategori}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{opd.kodeOPD}</span>
                      </div>
                      <h3 className="mt-1.5 text-sm font-bold text-white group-hover:text-cyan-300 transition line-clamp-1">
                        {opd.singkatan}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-1">{opd.namaOPD}</p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        pct >= 80
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : pct >= 65
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {pct.toFixed(1)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3.5 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">Realisasi SP2D:</span>
                      <span className="font-bold text-emerald-400">{formatRupiahSingkat(opd.realisasiSP2D)}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950">
                      <div
                        className={`h-full rounded-full transition-all ${
                          pct >= 80 ? 'bg-emerald-500' : pct >= 65 ? 'bg-cyan-500' : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Pagu: {formatRupiahSingkat(opd.targetPagu)}</span>
                      <span>Sisa: {formatRupiahSingkat(opd.targetPagu - opd.realisasiSP2D)}</span>
                    </div>
                  </div>

                  {/* Footer Card */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                      <UserCheck className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{opd.kepalaBadan}</span>
                    </div>
                    <span className="text-cyan-400 font-semibold group-hover:underline flex items-center gap-0.5">
                      <span>Detail</span>
                      <ChevronRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MASTER DATA SELURUH OPD */}
      {activeTab === 'master' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-400 border border-cyan-500/20">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Katalog Master Organisasi Perangkat Daerah (OPD) Pemprov NTB</h2>
                <p className="text-xs text-slate-400">
                  Daftar lengkap 40 Satuan Kerja Perangkat Daerah (SKPD), Pejabat Kepala Dinas/Badan, Kode SIPD, dan Alamat Kantor
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowAddOpdModal(true)}
              className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah OPD Baru</span>
            </button>
          </div>

          {/* Tabel Master OPD */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase text-slate-300">
                <tr>
                  <th className="p-3.5 text-center w-12">No</th>
                  <th className="p-3.5">Kode SKPD / OPD</th>
                  <th className="p-3.5">Nama Organisasi &amp; Singkatan</th>
                  <th className="p-3.5">Kategori</th>
                  <th className="p-3.5">Kepala Badan / Dinas &amp; NIP</th>
                  <th className="p-3.5 text-right">Pagu TA {selectedTahun}</th>
                  <th className="p-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredOpds.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3.5 text-center font-bold text-slate-400">{index + 1}</td>
                    <td className="p-3.5 font-mono text-cyan-300 font-semibold">{item.kodeOPD}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-white">{item.namaOPD}</div>
                      <div className="text-[11px] text-cyan-400 font-medium">{item.singkatan}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="rounded-md bg-slate-800 px-2.5 py-1 text-[10px] font-semibold text-slate-300 border border-slate-700">
                        {item.kategori}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-slate-200">{item.kepalaBadan}</div>
                      <div className="font-mono text-[11px] text-slate-400">NIP. {item.nipKepala}</div>
                    </td>
                    <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                      {formatRupiah(item.targetPagu)}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedOpdDetail(item)}
                        className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 transition"
                      >
                        Buka Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: TRANSAKSI & PAGU ANGGARAN SELURUH OPD */}
      {activeTab === 'transaksi' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-400 border border-emerald-500/20">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Monitoring Pagu Anggaran &amp; Transaksi SP2D Kasda NTB</h2>
                <p className="text-xs text-slate-400">
                  Data realisasi pencairan SP2D (LS, UP, GU, TU) terintegrasi seluruh rekening belanja OPD
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleExportExcel}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition active:scale-95 shrink-0"
            >
              <Download className="h-4 w-4" />
              <span>Ekspor Rekap Transaksi</span>
            </button>
          </div>

          {/* Tabel Transaksi per OPD */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 bg-slate-950/80 text-[11px] font-bold uppercase text-slate-300">
                <tr>
                  <th className="p-3.5 text-center w-12">No</th>
                  <th className="p-3.5">Organisasi Perangkat Daerah</th>
                  <th className="p-3.5 text-center">Jml Program</th>
                  <th className="p-3.5 text-center">Jml Kegiatan</th>
                  <th className="p-3.5 text-right">Pagu Murni (Rp)</th>
                  <th className="p-3.5 text-right">Realisasi SP2D (Rp)</th>
                  <th className="p-3.5 text-right">Sisa Pagu (Rp)</th>
                  <th className="p-3.5 text-center">% Serapan</th>
                  <th className="p-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredOpds.map((opd, idx) => {
                  const pct = (opd.realisasiSP2D / opd.targetPagu) * 100;
                  const sisa = opd.targetPagu - opd.realisasiSP2D;
                  return (
                    <tr key={opd.id} className="hover:bg-slate-800/50 transition">
                      <td className="p-3.5 text-center font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-white">{opd.singkatan}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{opd.namaOPD}</div>
                      </td>
                      <td className="p-3.5 text-center font-mono text-slate-300">{opd.jumlahProgram}</td>
                      <td className="p-3.5 text-center font-mono text-slate-300">{opd.jumlahKegiatan}</td>
                      <td className="p-3.5 text-right font-mono font-bold text-slate-200">
                        {formatRupiah(opd.targetPagu)}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-400">
                        {formatRupiah(opd.realisasiSP2D)}
                      </td>
                      <td className="p-3.5 text-right font-mono font-bold text-amber-300">
                        {formatRupiah(sisa)}
                      </td>
                      <td className="p-3.5 text-center font-bold">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] ${
                            pct >= 80 ? 'text-emerald-400 bg-emerald-950/80 border border-emerald-800' : pct >= 65 ? 'text-cyan-400 bg-cyan-950/80 border border-cyan-800' : 'text-amber-400 bg-amber-950/80 border border-amber-800'
                          }`}
                        >
                          {pct.toFixed(2)}%
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                          {opd.statusKinerja}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-slate-700 bg-slate-950/90 font-bold text-xs">
                <tr>
                  <td colSpan={4} className="p-4 text-right uppercase tracking-wider text-slate-300">
                    TOTAL KONSOLIDASI SELURUH OPD PEMPROV NTB:
                  </td>
                  <td className="p-4 text-right font-mono font-black text-white">
                    {formatRupiah(totalPaguDisplay)}
                  </td>
                  <td className="p-4 text-right font-mono font-black text-emerald-400">
                    {formatRupiah(totalRealisasiDisplay)}
                  </td>
                  <td className="p-4 text-right font-mono font-black text-amber-400">
                    {formatRupiah(totalSilpaDisplay)}
                  </td>
                  <td className="p-4 text-center font-mono font-black text-cyan-400">
                    {persentaseSerapanDisplay.toFixed(2)}%
                  </td>
                  <td className="p-4" />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PELAPORAN KEUANGAN KONSOLIDASI */}
      {activeTab === 'laporan' && (
        <div className="space-y-6">
          {/* Sub Navigation Pelaporan */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto scrollbar-none">
              {[
                { id: 'rekap-opd', label: 'Rekapitulasi 40 OPD' },
                { id: 'per-program', label: 'Laporan per Program' },
                { id: 'per-kegiatan', label: 'Laporan per Kegiatan' },
                { id: 'per-subkegiatan', label: 'Laporan per Sub Kegiatan' },
                { id: 'per-belanja', label: 'Laporan per Rekening Belanja' },
                { id: 'triwulan', label: 'Laporan Triwulan' },
                { id: 'semester', label: 'Laporan Semester' },
                { id: 'silpa', label: 'Laporan SiLPA' }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => setLaporanSubTab(sub.id as any)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                    laporanSubTab === sub.id
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950 border border-cyan-400'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 border border-slate-700"
              >
                <Printer className="h-3.5 w-3.5 text-cyan-400" />
                <span>Cetak Lembar Resmi</span>
              </button>
              <button
                type="button"
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 text-xs font-bold text-white shadow"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Excel</span>
              </button>
            </div>
          </div>

          {/* KOP RESMI LAPORAN PEMPROV NTB (Tampil di Print dan Preview) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8 shadow-xl">
            <div className="border-b-2 border-slate-700 pb-6 text-center">
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="h-16 w-16 flex items-center justify-center">
                  <NTBLogo className="h-full w-full" />
                </div>
                <div>
                  <h2 className="text-base md:text-lg font-black tracking-wide text-white uppercase">
                    PEMERINTAH PROVINSI NUSA TENGGARA BARAT
                  </h2>
                  <h3 className="text-sm md:text-base font-bold text-cyan-300 uppercase">
                    LAPORAN REALISASI ANGGARAN KONSOLIDASI SELURUH OPD
                  </h3>
                  <p className="text-xs text-slate-400">
                    TAHUN ANGGARAN {selectedTahun} | PERIODE BERJALAN S.D BULAN DESEMBER {selectedTahun}
                  </p>
                </div>
              </div>
            </div>

            {/* Rincian Laporan */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-700 bg-slate-950/80 text-[11px] font-bold uppercase text-slate-300">
                  <tr>
                    <th className="p-3 text-center w-12">No</th>
                    <th className="p-3">Kode SKPD</th>
                    <th className="p-3">Nama Satuan Kerja (OPD)</th>
                    <th className="p-3 text-right">Target Pagu (Rp)</th>
                    <th className="p-3 text-right">Realisasi (Rp)</th>
                    <th className="p-3 text-right">Sisa Anggaran (Rp)</th>
                    <th className="p-3 text-center">% Realisasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-sans">
                  {filteredOpds.map((opd, i) => {
                    const serapan = ((opd.realisasiSP2D / opd.targetPagu) * 100).toFixed(2);
                    return (
                      <tr key={opd.id} className="hover:bg-slate-800/40">
                        <td className="p-3 text-center text-slate-400">{i + 1}</td>
                        <td className="p-3 font-mono text-cyan-300">{opd.kodeOPD}</td>
                        <td className="p-3 font-semibold text-slate-200">{opd.namaOPD}</td>
                        <td className="p-3 text-right font-mono">{formatRupiah(opd.targetPagu)}</td>
                        <td className="p-3 text-right font-mono text-emerald-400 font-bold">{formatRupiah(opd.realisasiSP2D)}</td>
                        <td className="p-3 text-right font-mono text-amber-300">{formatRupiah(opd.targetPagu - opd.realisasiSP2D)}</td>
                        <td className="p-3 text-center font-bold text-cyan-300">{serapan}%</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="border-t-2 border-slate-600 bg-slate-950 font-black text-xs">
                  <tr>
                    <td colSpan={3} className="p-3.5 text-right uppercase">
                      JUMLAH TOTAL PEMERINTAH PROVINSI NTB:
                    </td>
                    <td className="p-3.5 text-right font-mono text-white">{formatRupiah(totalPaguDisplay)}</td>
                    <td className="p-3.5 text-right font-mono text-emerald-400">{formatRupiah(totalRealisasiDisplay)}</td>
                    <td className="p-3.5 text-right font-mono text-amber-400">{formatRupiah(totalSilpaDisplay)}</td>
                    <td className="p-3.5 text-center font-mono text-cyan-400">{persentaseSerapanDisplay.toFixed(2)}%</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Kolom Tanda Tangan Resmi */}
            <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
              <div>
                <p className="text-slate-400">Mengetahui,</p>
                <p className="font-bold text-white mt-1">SEKRETARIS DAERAH PROVINSI NTB</p>
                <div className="h-16" />
                <p className="font-bold text-white underline">Drs. H. Lalu Gita Ariadi, M.Si</p>
                <p className="text-slate-400">NIP. 196505301989031011</p>
              </div>
              <div>
                <p className="text-slate-400">Mataram, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold text-white mt-1">KEPALA BPKAD PROVINSI NTB</p>
                <div className="h-16" />
                <p className="font-bold text-white underline">Drs. H. Samsul Rizal, M.M</p>
                <p className="text-slate-400">NIP. 196905141994021003</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: ANALISIS & RANKING KINERJA */}
      {activeTab === 'analisis' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-400 border border-purple-500/20">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Evaluasi &amp; Peringkat Kinerja Serapan Anggaran OPD NTB</h2>
                <p className="text-xs text-slate-400">
                  Analisis perbandingan efektivitas penyerapan anggaran dan identifikasi satuan kerja yang memerlukan percepatan
                </p>
              </div>
            </div>
          </div>

          {/* Top 5 Tertinggi vs 5 Terendah */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top 5 Serapan Tertinggi */}
            <div className="rounded-2xl border border-emerald-900/40 bg-slate-900 p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">5 OPD dengan Serapan Tertinggi</h3>
              </div>
              <div className="space-y-3">
                {filteredOpds.slice(0, 5).map((opd, i) => {
                  const pct = (opd.realisasiSP2D / opd.targetPagu) * 100;
                  return (
                    <div key={opd.id} className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{i + 1}. {opd.singkatan}</span>
                        <span className="text-xs font-bold text-emerald-400">{pct.toFixed(2)}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 5 OPD Perlu Perhatian */}
            <div className="rounded-2xl border border-amber-900/40 bg-slate-900 p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">5 OPD Perlu Akselerasi Serapan</h3>
              </div>
              <div className="space-y-3">
                {[...filteredOpds].reverse().slice(0, 5).map((opd, i) => {
                  const pct = (opd.realisasiSP2D / opd.targetPagu) * 100;
                  return (
                    <div key={opd.id} className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{i + 1}. {opd.singkatan}</span>
                        <span className="text-xs font-bold text-amber-400">{pct.toFixed(2)}%</span>
                      </div>
                      <div className="mt-1.5 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PENGATURAN & INTEGRASI MULTI-OPD */}
      {activeTab === 'pengaturan' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/10 p-2.5 text-cyan-400 border border-cyan-500/20">
                <Settings className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Konfigurasi Sistem Multi-OPD Provinsi NTB</h2>
                <p className="text-xs text-slate-400">
                  Pengaturan jalur integrasi data keuangan, sinkronisasi antar-perangkat, dan hak akses satuan kerja
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-cyan-300">Endpoint Google Apps Script Konsolidasi:</span>
                <p className="text-[11px] text-slate-400">
                  URL sinkronisasi real-time yang sedang aktif di seluruh perangkat:
                </p>
                <div className="rounded-lg bg-slate-900 p-2.5 font-mono text-[11px] text-emerald-400 break-all border border-slate-800">
                  {sheetConfig.webAppUrl || 'https://script.google.com/macros/s/AKfycbxt-sWb1tWsnBmUXaflIgBArl_KIqPnEBUJBxbr-XRhbeTmvRfbuce5QWaz1fsQ4Nw9LQ/exec'}
                </div>
              </div>

              <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-cyan-300">Spreadsheet ID Kasda NTB:</span>
                <p className="text-[11px] text-slate-400">
                  Dokumen Google Sheets tujuan sinkronisasi multi-OPD:
                </p>
                <div className="rounded-lg bg-slate-900 p-2.5 font-mono text-[11px] text-slate-300 break-all border border-slate-800">
                  {sheetConfig.spreadsheetId || '1q-ZorXYniIzVy2h6b-WJVGvGanqqn6SBNlhu_upN-DY'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL OPD */}
      {selectedOpdDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-6 md:p-8 shadow-2xl space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-800">
                      {selectedOpdDetail.kategori}
                    </span>
                    <span className="font-mono text-xs text-slate-400">{selectedOpdDetail.kodeOPD}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{selectedOpdDetail.namaOPD}</h3>
                  <p className="text-xs text-cyan-400 font-semibold">{selectedOpdDetail.singkatan}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOpdDetail(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Rincian Anggaran OPD */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Pagu Total:</span>
                <div className="text-xs font-mono font-bold text-white mt-1">{formatRupiah(selectedOpdDetail.targetPagu)}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase">Realisasi SP2D:</span>
                <div className="text-xs font-mono font-bold text-emerald-300 mt-1">{formatRupiah(selectedOpdDetail.realisasiSP2D)}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase">Sisa / SiLPA:</span>
                <div className="text-xs font-mono font-bold text-amber-300 mt-1">{formatRupiah(selectedOpdDetail.targetPagu - selectedOpdDetail.realisasiSP2D)}</div>
              </div>
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase">% Serapan:</span>
                <div className="text-xs font-mono font-bold text-cyan-300 mt-1">
                  {((selectedOpdDetail.realisasiSP2D / selectedOpdDetail.targetPagu) * 100).toFixed(2)}%
                </div>
              </div>
            </div>

            {/* Informasi Pejabat & Alamat */}
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Kepala Dinas / Badan:</span>
                <span className="font-bold text-white text-right">{selectedOpdDetail.kepalaBadan}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Nomor Induk Pegawai (NIP):</span>
                <span className="font-mono text-slate-200">{selectedOpdDetail.nipKepala}</span>
              </div>
              <div className="flex items-start justify-between border-b border-slate-800/80 pb-2">
                <span className="text-slate-400">Alamat Kantor:</span>
                <span className="text-slate-200 text-right max-w-xs">{selectedOpdDetail.alamat}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Status Kinerja:</span>
                <span className="font-bold text-emerald-400">{selectedOpdDetail.statusKinerja}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedOpdId(selectedOpdDetail.id || 'ALL');
                  setSelectedOpdDetail(null);
                }}
                className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2.5 text-xs font-bold text-white shadow-md transition"
              >
                <Check className="h-4 w-4" />
                <span>Pilih OPD Ini sebagai Fokus Utama</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH OPD BARU */}
      {showAddOpdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl rounded-3xl border border-slate-700 bg-slate-900 p-6 md:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Tambah Data OPD / Unit Kerja Baru</h3>
              <button
                type="button"
                onClick={() => setShowAddOpdModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewOpd} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300">Nama Lengkap OPD:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Dinas Kebudayaan Provinsi NTB"
                  value={newOpdForm.namaOPD}
                  onChange={e => setNewOpdForm({ ...newOpdForm, namaOPD: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300">Singkatan / Nomenklatur:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: DISBUD NTB"
                    value={newOpdForm.singkatan}
                    onChange={e => setNewOpdForm({ ...newOpdForm, singkatan: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300">Kode SKPD / SIPD:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 1.01.0.00.0.00.02.0000"
                    value={newOpdForm.kodeOPD}
                    onChange={e => setNewOpdForm({ ...newOpdForm, kodeOPD: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300">Kategori Instansi:</label>
                  <select
                    value={newOpdForm.kategori}
                    onChange={e => setNewOpdForm({ ...newOpdForm, kategori: e.target.value as any })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="Dinas Daerah">Dinas Daerah</option>
                    <option value="Badan Daerah">Badan Daerah</option>
                    <option value="Sekretariat">Sekretariat</option>
                    <option value="Inspektorat">Inspektorat</option>
                    <option value="Rumah Sakit">Rumah Sakit</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300">Target Pagu Anggaran (Rp):</label>
                  <input
                    type="number"
                    value={newOpdForm.targetPagu}
                    onChange={e => setNewOpdForm({ ...newOpdForm, targetPagu: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300">Nama Kepala Dinas / Badan:</label>
                  <input
                    type="text"
                    placeholder="Nama beserta gelar"
                    value={newOpdForm.kepalaBadan}
                    onChange={e => setNewOpdForm({ ...newOpdForm, kepalaBadan: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300">NIP Kepala:</label>
                  <input
                    type="text"
                    placeholder="18 digit NIP"
                    value={newOpdForm.nipKepala}
                    onChange={e => setNewOpdForm({ ...newOpdForm, nipKepala: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddOpdModal(false)}
                  className="rounded-xl px-4 py-2 text-slate-400 hover:text-white"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 font-bold text-white shadow"
                >
                  Simpan OPD Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
