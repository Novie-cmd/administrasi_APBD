import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { NTBLogo } from '../common/NTBLogo';
import * as XLSX from 'xlsx';
import {
  getOPDDetailsBreakdown,
  downloadOPDExcelTemplate,
  downloadAnggaranExcelTemplate,
  downloadRealisasiExcelTemplate,
  downloadSIPDColumnMtoXTemplate,
  exportReportToExcel,
  OPDProgramItem,
  OPDKegiatanItem,
  OPDSubKegiatanItem,
  OPDBelanjaItem
} from '../../data/opdProgramData';
import { safeDownloadExcel } from '../../utils/downloadHelper';
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
  FileCheck,
  LayoutGrid,
  List,
  Tag,
  FileCode,
  Edit3,
  Trash2,
  Save
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
  const [dashboardLayout, setDashboardLayout] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<'pagu' | 'realisasi' | 'serapan' | 'nama'>('serapan');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [laporanSubTab, setLaporanSubTab] = useState<'rekap-opd' | 'per-program' | 'per-kegiatan' | 'per-subkegiatan' | 'per-belanja' | 'hirarki' | 'triwulan' | 'semester' | 'silpa'>('per-program');
  const [laporanOpdId, setLaporanOpdId] = useState<string>('OPD-006'); // Default to Dinas Kesehatan NTB
  const [selectedTriwulan, setSelectedTriwulan] = useState<number>(3); // Q3
  const [selectedSemester, setSelectedSemester] = useState<number>(2); // S2
  const [showAddOpdModal, setShowAddOpdModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<any[]>([]);
  const [importStats, setImportStats] = useState<{ total: number; updated: number; added: number } | null>(null);

  // States khusus Menu Master OPD (Import Anggaran, Realisasi, Kode Rekening & Sub-Tabs)
  const [masterSubTab, setMasterSubTab] = useState<'daftar-opd' | 'kode-rekening' | 'program-kegiatan'>('daftar-opd');
  const [masterRekeningSearch, setMasterRekeningSearch] = useState<string>('');
  const [masterJenisBelanjaFilter, setMasterJenisBelanjaFilter] = useState<string>('ALL');
  const [masterOpdFilter, setMasterOpdFilter] = useState<string>('ALL');
  const [showMasterImportModal, setShowMasterImportModal] = useState<boolean>(false);
  const [masterImportCategory, setMasterImportCategory] = useState<'all' | 'anggaran' | 'realisasi' | 'rekening'>('all');
  const [masterImportTargetOpd, setMasterImportTargetOpd] = useState<string>('ALL');
  const [masterImportOverwrite, setMasterImportOverwrite] = useState<boolean>(false);
  const [masterImportFileName, setMasterImportFileName] = useState<string>('');
  const [masterImportPreviewRows, setMasterImportPreviewRows] = useState<any[]>([]);
  const [masterImportErrors, setMasterImportErrors] = useState<string[]>([]);
  const [masterImportSuccessMsg, setMasterImportSuccessMsg] = useState<string | null>(null);
  const masterFileInputRef = useRef<HTMLInputElement>(null);

  // States khusus Fungsi Edit dan Hapus pada Menu Pelaporan Konsolidasi
  const [editLaporanModal, setEditLaporanModal] = useState<{
    type: 'program' | 'kegiatan' | 'subkegiatan' | 'belanja' | 'opd';
    opdId: string;
    namaOPD?: string;
    data: any;
  } | null>(null);

  const [deleteLaporanModal, setDeleteLaporanModal] = useState<{
    type: 'program' | 'kegiatan' | 'subkegiatan' | 'belanja' | 'opd';
    opdId: string;
    namaOPD?: string;
    id: string;
    kode: string;
    nama: string;
    nominal: number;
  } | null>(null);

  const [laporanActionSuccessMsg, setLaporanActionSuccessMsg] = useState<string | null>(null);
  const [customBreakdownMap, setCustomBreakdownMap] = useState<Record<string, any>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bfms_seluruh_opd_breakdowns_v1');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed === 'object') return parsed;
        } catch (e) {
          console.error('Error loading saved breakdowns:', e);
        }
      }
    }
    return {};
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [opdListState, setOpdListState] = useState<NTBOPDItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bfms_seluruh_opd_data_v1');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          console.error('Error loading saved OPD list:', e);
        }
      }
    }
    return DAFTAR_SELURUH_OPD_NTB;
  });

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
    if (laporanOpdId === 'ALL') {
      return {
        id: 'ALL',
        kodeOPD: '1.00.0.00.0.00.00.0000',
        namaOPD: 'Pemerintah Provinsi Nusa Tenggara Barat (Konsolidasi Seluruh OPD)',
        singkatan: 'PEMPROV NTB',
        kategori: 'Badan Daerah' as const,
        kepalaBadan: 'Drs. H. Lalu Gita Ariadi, M.Si',
        nipKepala: '196505301989031011',
        alamat: 'Jl. Pejanggik No. 12, Mataram, NTB',
        targetPagu: totalPaguDisplay,
        realisasiSP2D: totalRealisasiDisplay,
        jumlahProgram: 40 * 3,
        jumlahKegiatan: 40 * 12,
        jumlahTransaksi: 1200,
        statusKinerja: 'Tinggi' as const
      };
    }
    return opdListState.find(o => o.id === laporanOpdId) || opdListState[0];
  }, [laporanOpdId, opdListState, totalPaguDisplay, totalRealisasiDisplay]);

  const opdBreakdown = useMemo(() => {
    if (!targetLaporanOpd) return null;
    if (targetLaporanOpd.id === 'ALL') return null;
    if (customBreakdownMap[targetLaporanOpd.id]) {
      return customBreakdownMap[targetLaporanOpd.id];
    }
    return getOPDDetailsBreakdown(targetLaporanOpd);
  }, [targetLaporanOpd, customBreakdownMap]);

  // Aggregated or single OPD Program items
  const activeReportPrograms = useMemo(() => {
    if (laporanOpdId === 'ALL') {
      return opdListState.flatMap(opd => {
        const b = customBreakdownMap[opd.id] || getOPDDetailsBreakdown(opd);
        return b.programs.map((p: any) => ({ ...p, namaOPD: opd.singkatan }));
      });
    }
    return opdBreakdown?.programs || [];
  }, [laporanOpdId, opdListState, customBreakdownMap, opdBreakdown]);

  // Aggregated or single OPD Kegiatan items
  const activeReportKegiatans = useMemo(() => {
    if (laporanOpdId === 'ALL') {
      return opdListState.flatMap(opd => {
        const b = customBreakdownMap[opd.id] || getOPDDetailsBreakdown(opd);
        return b.kegiatans.map((k: any) => ({ ...k, namaOPD: opd.singkatan }));
      });
    }
    return opdBreakdown?.kegiatans || [];
  }, [laporanOpdId, opdListState, customBreakdownMap, opdBreakdown]);

  // Aggregated or single OPD Sub Kegiatan items
  const activeReportSubKegiatans = useMemo(() => {
    if (laporanOpdId === 'ALL') {
      return opdListState.flatMap(opd => {
        const b = customBreakdownMap[opd.id] || getOPDDetailsBreakdown(opd);
        return b.subKegiatans.map((s: any) => ({ ...s, namaOPD: opd.singkatan }));
      });
    }
    return opdBreakdown?.subKegiatans || [];
  }, [laporanOpdId, opdListState, customBreakdownMap, opdBreakdown]);

  // Aggregated or single OPD Rekening Belanja items
  const activeReportBelanja = useMemo(() => {
    if (laporanOpdId === 'ALL') {
      return opdListState.flatMap(opd => {
        const b = customBreakdownMap[opd.id] || getOPDDetailsBreakdown(opd);
        return b.belanjaList.map((bItem: any) => ({ ...bItem, namaOPD: opd.singkatan }));
      });
    }
    return opdBreakdown?.belanjaList || [];
  }, [laporanOpdId, opdListState, customBreakdownMap, opdBreakdown]);

  // Reset back to initial default 40 OPD
  const handleResetToDefaultOPD = () => {
    if (window.confirm('Apakah Anda yakin ingin mereset seluruh data kembali ke daftar standar 40 OPD Pemprov NTB?')) {
      localStorage.removeItem('bfms_seluruh_opd_data_v1');
      localStorage.removeItem('bfms_seluruh_opd_breakdowns_v1');
      setOpdListState(DAFTAR_SELURUH_OPD_NTB);
      setCustomBreakdownMap({});
      setImportStats(null);
    }
  };

  // Helper normalisasi nama OPD untuk pencocokan cerdas
  const cleanOpdKeywords = (str: string): string => {
    if (!str) return '';
    return str.toLowerCase()
      .replace(/pemerintah\s+provinsi\s+nusa\s+tenggara\s+barat/g, '')
      .replace(/provinsi\s+nusa\s+tenggara\s+barat/g, '')
      .replace(/pemerintah\s+provinsi\s+ntb/g, '')
      .replace(/provinsi\s+ntb/g, '')
      .replace(/prov\.\s*ntb/g, '')
      .replace(/provinsi/g, '')
      .replace(/ntb/g, '')
      .replace(/dinas\s+daerah/g, '')
      .replace(/badan\s+daerah/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Helper pencocokan OPD yang sangat fleksibel (Kode, Singkatan, Nama Lengkap & Kata Kunci)
  const findMatchingOpdIndex = (kode: string, nama: string, singkatan: string, list: NTBOPDItem[]): number => {
    const cleanKode = (kode || '').trim().replace(/[^0-9]/g, '');
    const cleanNama = cleanOpdKeywords(nama);
    const cleanSingk = (singkatan || '').toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Cocokkan Kode OPD (baik dengan titik maupun tanpa titik)
    if (cleanKode.length >= 3) {
      const idx = list.findIndex(o => {
        const oKodeClean = o.kodeOPD.replace(/[^0-9]/g, '');
        if (cleanKode === oKodeClean) return true;
        if (cleanKode.length >= 4 && oKodeClean.length >= 4 && cleanKode.slice(0, 4) === oKodeClean.slice(0, 4)) return true;
        return false;
      });
      if (idx >= 0) return idx;
    }

    // 2. Cocokkan Singkatan OPD (misal: DINKES, BPKAD, BAPPEDA, DISDIKBUD)
    if (cleanSingk.length >= 3) {
      const idx = list.findIndex(o => {
        const oSingkClean = o.singkatan.toLowerCase().replace(/[^a-z0-9]/g, '');
        return oSingkClean.includes(cleanSingk) || cleanSingk.includes(oSingkClean);
      });
      if (idx >= 0) return idx;
    }

    // 3. Cocokkan Nama OPD yang telah dibersihkan
    if (cleanNama.length >= 3) {
      // Direct string inclusion
      let idx = list.findIndex(o => {
        const oClean = cleanOpdKeywords(o.namaOPD);
        return oClean.includes(cleanNama) || cleanNama.includes(oClean);
      });
      if (idx >= 0) return idx;

      // Word-by-word token inclusion
      const inputWords = cleanNama.split(' ').filter(w => w.length > 3 && !['dinas', 'badan', 'biro', 'dan', 'yang', 'untuk', 'pada'].includes(w));
      if (inputWords.length > 0) {
        idx = list.findIndex(o => {
          const oClean = cleanOpdKeywords(o.namaOPD);
          return inputWords.every(w => oClean.includes(w));
        });
        if (idx >= 0) return idx;

        idx = list.findIndex(o => {
          const oClean = cleanOpdKeywords(o.namaOPD);
          return inputWords.some(w => oClean.includes(w));
        });
        if (idx >= 0) return idx;
      }
    }

    return -1;
  };

  // Clean numerical amounts from Excel (handles Indonesian period/comma formats and text symbols)
  const parseNumeric = (val: any): number => {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    let str = String(val).trim();
    // Hilangkan prefix mata uang seperti Rp, IDR
    str = str.replace(/^(rp|idr)\.?\s*/i, '').trim();

    // Penanganan pemisah ribuan & desimal format Indonesia vs Inggris
    if (str.includes('.') && str.includes(',')) {
      if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
        // Format Indonesia: 15.000.000.000,00 -> titik ribuan, koma desimal
        str = str.replace(/\./g, '').replace(',', '.');
      } else {
        // Format Inggris: 15,000,000.00 -> koma ribuan, titik desimal
        str = str.replace(/,/g, '');
      }
    } else if (str.includes('.')) {
      const parts = str.split('.');
      // Jika memiliki lebih dari 1 titik (15.000.000.000) atau bagian setelah titik 3 digit -> ribuan
      if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
        str = str.replace(/\./g, '');
      }
    } else if (str.includes(',')) {
      const parts = str.split(',');
      if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
        str = str.replace(/,/g, '');
      } else {
        str = str.replace(',', '.');
      }
    }

    str = str.replace(/[^0-9.-]+/g, '');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  // Parser Cerdas untuk Format Kolom A s.d X (Dimulai dari Baris M6 s.d X) maupun Format Standar
  const parseExcelRowsSmart = (wb: XLSX.WorkBook): any[] => {
    let combined: any[] = [];

    wb.SheetNames.forEach(sheetName => {
      const ws = wb.Sheets[sheetName];
      if (!ws) return;

      // 1. Ambil representasi matriks 2D (header: 1)
      const rawMatrix: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
      if (!rawMatrix || rawMatrix.length === 0) return;

      let foundHeaderRowIdx = -1;
      let colMap: Record<string, number> = {};

      // Pindai baris 0 s.d 15 untuk mencari baris header
      for (let r = 0; r < Math.min(15, rawMatrix.length); r++) {
        const rowArr = rawMatrix[r];
        if (!Array.isArray(rowArr)) continue;

        let matchCount = 0;
        const tempColMap: Record<string, number> = {};

        rowArr.forEach((cellVal, cIdx) => {
          if (!cellVal) return;
          const cStr = String(cellVal).trim().toLowerCase().replace(/[\s_\-()/.:]/g, '');

          if (cStr.includes('kodesubskpd') || cStr === 'kodesub' || cStr.includes('subskpd') || (cStr.includes('kode') && cStr.includes('skpd')) || cStr === 'kodeopd' || (cStr.includes('kode') && cStr.includes('opd'))) {
            tempColMap['kodeSubSKPD'] = cIdx;
            matchCount++;
          } else if (cStr.includes('namasubskpd') || (cStr.includes('nama') && cStr.includes('skpd')) || cStr === 'namasub' || cStr.includes('namaopd') || (cStr.includes('nama') && cStr.includes('opd')) || cStr === 'opd' || cStr === 'skpd') {
            tempColMap['namaSubSKPD'] = cIdx;
            matchCount++;
          } else if (cStr.includes('kodeprogram') || cStr === 'kodeprog') {
            tempColMap['kodeProgram'] = cIdx;
            matchCount++;
          } else if (cStr.includes('namaprogram') || cStr === 'namaprog' || cStr === 'program') {
            tempColMap['namaProgram'] = cIdx;
            matchCount++;
          } else if (cStr.includes('kodekegiatan') || cStr === 'kodekeg') {
            tempColMap['kodeKegiatan'] = cIdx;
            matchCount++;
          } else if (cStr.includes('namakegiatan') || cStr === 'namakeg' || cStr === 'kegiatan') {
            tempColMap['namaKegiatan'] = cIdx;
            matchCount++;
          } else if (cStr.includes('kodesubkegiatan') || cStr === 'kodesubkeg') {
            tempColMap['kodeSubKegiatan'] = cIdx;
            matchCount++;
          } else if (cStr.includes('namasubkegiatan') || cStr === 'namasubkeg' || cStr === 'subkegiatan') {
            tempColMap['namaSubKegiatan'] = cIdx;
            matchCount++;
          } else if (cStr.includes('koderekening') || cStr === 'koderek' || cStr.includes('kodebelanja') || cStr === 'kodeakun') {
            tempColMap['kodeRekening'] = cIdx;
            matchCount++;
          } else if (cStr.includes('namarekening') || cStr.includes('uraianbelanja') || cStr.includes('uraianrekening') || cStr.includes('namabelanja') || cStr.includes('uraian')) {
            tempColMap['namaRekening'] = cIdx;
            matchCount++;
          } else if (cStr.includes('alokasi') || cStr.includes('pagu') || cStr.includes('anggaran') || cStr.includes('targetpagu')) {
            tempColMap['alokasiAnggaran'] = cIdx;
            matchCount++;
          } else if (cStr.includes('realisasi') || cStr.includes('sp2d') || cStr.includes('serapan') || cStr.includes('cair')) {
            tempColMap['realisasiAnggaran'] = cIdx;
            matchCount++;
          }
        });

        if (matchCount >= 2) {
          foundHeaderRowIdx = r;
          colMap = tempColMap;
          break;
        }
      }

      // Bila ditemukan baris header eksplisit
      if (foundHeaderRowIdx >= 0) {
        for (let r = foundHeaderRowIdx + 1; r < rawMatrix.length; r++) {
          const rowArr = rawMatrix[r];
          if (!Array.isArray(rowArr) || rowArr.length === 0) continue;

          const getCell = (key: string): any => {
            const cIdx = colMap[key];
            return cIdx !== undefined && cIdx >= 0 ? rowArr[cIdx] : '';
          };

          const kodeSubSKPD = String(getCell('kodeSubSKPD') || '').trim();
          const namaSubSKPD = String(getCell('namaSubSKPD') || '').trim();
          const kodeProg = String(getCell('kodeProgram') || '').trim();
          const namaProg = String(getCell('namaProgram') || '').trim();
          const kodeKeg = String(getCell('kodeKegiatan') || '').trim();
          const namaKeg = String(getCell('namaKegiatan') || '').trim();
          const kodeSub = String(getCell('kodeSubKegiatan') || '').trim();
          const namaSub = String(getCell('namaSubKegiatan') || '').trim();
          const kodeRek = String(getCell('kodeRekening') || '').trim();
          const namaRek = String(getCell('namaRekening') || '').trim();
          const alokasi = parseNumeric(getCell('alokasiAnggaran'));
          const realisasi = parseNumeric(getCell('realisasiAnggaran'));

          if (!kodeSubSKPD && !namaSubSKPD && !kodeRek && alokasi === 0 && realisasi === 0) continue;

          combined.push({
            'Kode Sub SKPD': kodeSubSKPD,
            'Nama Sub SKPD': namaSubSKPD,
            'Kode Program': kodeProg,
            'Nama Program': namaProg,
            'Kode Kegiatan': kodeKeg,
            'Nama Kegiatan': namaKeg,
            'Kode Sub Kegiatan': kodeSub,
            'Nama Sub Kegiatan': namaSub,
            'Kode Rekening': kodeRek,
            'Nama Rekening': namaRek,
            'Alokasi Anggaran': alokasi,
            'Realisasi Anggaran': realisasi,
            _sheetName: sheetName
          });
        }
      } else if (rawMatrix.length >= 6 && rawMatrix[5] && rawMatrix[5].length >= 13) {
        // Deteksi Khusus File SIPD: Kolom A s.d X dengan Baris M6 s.d X
        // Col M (12), N (13), O (14), P (15), Q (16), R (17), S (18), T (19), U (20), V (21), W (22), X (23)
        const row5Cell12 = String(rawMatrix[5][12] || '').toLowerCase();
        const isHeaderAtRow6 = row5Cell12.includes('skpd') || row5Cell12.includes('kode') || String(rawMatrix[5][20] || '').toLowerCase().includes('rekening');
        const startDataRow = isHeaderAtRow6 ? 6 : 5;

        for (let r = startDataRow; r < rawMatrix.length; r++) {
          const rowArr = rawMatrix[r];
          if (!Array.isArray(rowArr) || rowArr.length < 13) continue;

          const kodeSubSKPD = String(rowArr[12] || '').trim();
          const namaSubSKPD = String(rowArr[13] || '').trim();
          const kodeProg = String(rowArr[14] || '').trim();
          const namaProg = String(rowArr[15] || '').trim();
          const kodeKeg = String(rowArr[16] || '').trim();
          const namaKeg = String(rowArr[17] || '').trim();
          const kodeSub = String(rowArr[18] || '').trim();
          const namaSub = String(rowArr[19] || '').trim();
          const kodeRek = String(rowArr[20] || '').trim();
          const namaRek = String(rowArr[21] || '').trim();
          const valW = parseNumeric(rowArr[22]);
          const valX = parseNumeric(rowArr[23]);

          const isRealisasiSheet = sheetName.toLowerCase().includes('realisasi');
          const alokasi = !isRealisasiSheet ? (valW > 0 ? valW : valX) : (valX > 0 && valW === 0 ? valW : 0);
          const realisasi = isRealisasiSheet ? (valW > 0 ? valW : valX) : valX;

          if (!kodeSubSKPD && !namaSubSKPD && !kodeRek && valW === 0 && valX === 0) continue;

          combined.push({
            'Kode Sub SKPD': kodeSubSKPD,
            'Nama Sub SKPD': namaSubSKPD,
            'Kode Program': kodeProg,
            'Nama Program': namaProg,
            'Kode Kegiatan': kodeKeg,
            'Nama Kegiatan': namaKeg,
            'Kode Sub Kegiatan': kodeSub,
            'Nama Sub Kegiatan': namaSub,
            'Kode Rekening': kodeRek,
            'Nama Rekening': namaRek,
            'Alokasi Anggaran': alokasi,
            'Realisasi Anggaran': realisasi,
            _sheetName: sheetName
          });
        }
      } else {
        // Fallback standard JSON
        const jsonRows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
        if (jsonRows && jsonRows.length > 0) {
          jsonRows.forEach(jRow => {
            combined.push({ ...jRow, _sheetName: sheetName });
          });
        }
      }
    });

    return combined;
  };

  // Handle Excel File Upload (Mendukung Kolom A s.d X & M6 s.d X)
  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        
        const combinedRows = parseExcelRowsSmart(wb);
        
        if (combinedRows.length === 0) {
          alert('File Excel kosong atau format kolom tidak dapat dibaca.');
          return;
        }
        setImportPreviewData(combinedRows);
        setShowImportModal(true);
      } catch (err) {
        alert('Gagal membaca file Excel. Pastikan format file .xlsx atau .xls valid.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Apply Imported Excel Data to OPD List and Sub-data (Mendukung Multi-Baris Per OPD & Format Kolom M6 s.d X)
  const handleApplyExcelImport = () => {
    if (importPreviewData.length === 0) return;

    let updatedCount = 0;
    let addedCount = 0;
    const newOpds = [...opdListState];
    const newBreakdowns: Record<string, any> = { ...customBreakdownMap };

    // Kelompokkan baris import berdasarkan OPD untuk agregasi Pagu & Realisasi yang akurat
    interface OpdImportCluster {
      kode: string;
      nama: string;
      singkatan: string;
      kategori: string;
      kepala: string;
      nip: string;
      alamat: string;
      rows: any[];
      paguValues: number[];
      realisasiValues: number[];
      distinctPrograms: Map<string, any>;
      distinctKegiatans: Map<string, any>;
      distinctSubKegiatans: Map<string, any>;
      distinctBelanja: Map<string, any>;
    }

    const clustersMap = new Map<string, OpdImportCluster>();

    importPreviewData.forEach((row, idx) => {
      const nama = String(row['Nama Sub SKPD'] || row['Nama_Sub_SKPD'] || row['Nama_OPD'] || row['nama_opd'] || row['OPD'] || row['Nama OPD'] || row['SKPD'] || row['Nama SKPD'] || '').trim();
      const singkatan = String(row['Singkatan'] || row['singkatan'] || row['SINGKATAN'] || '').trim();
      const kode = String(row['Kode Sub SKPD'] || row['Kode_Sub_SKPD'] || row['Kode_OPD'] || row['kode_opd'] || row['Kode SKPD'] || row['KODE SKPD'] || '').trim();
      const pagu = parseNumeric(row['Alokasi Anggaran'] || row['Alokasi_Anggaran'] || row['Pagu_Anggaran'] || row['pagu'] || row['Pagu'] || row['PAGU ANGGARAN'] || row['Pagu Murni'] || row['Anggaran']);
      const realisasi = parseNumeric(row['Realisasi Anggaran'] || row['Realisasi_Anggaran'] || row['Realisasi_SP2D'] || row['realisasi'] || row['Realisasi'] || row['REALISASI SP2D'] || row['SP2D']);
      const kategori = (row['Kategori'] || row['kategori'] || 'Dinas Daerah') as any;
      const kepala = String(row['Kepala_OPD'] || row['Kepala_Badan'] || row['Kepala Dinas'] || row['Kepala OPD'] || row['NAMA KEPALA'] || '').trim();
      const nip = String(row['NIP_Kepala'] || row['NIP'] || row['NIP Kepala'] || '').trim();
      const alamat = String(row['Alamat'] || row['alamat'] || '').trim();

      if (!nama && !kode && !singkatan && pagu === 0 && realisasi === 0) return;

      // Kunci cluster unik per OPD
      const cleanK = kode ? kode.replace(/[^0-9]/g, '') : '';
      const cleanN = cleanOpdKeywords(nama);
      const clusterKey = cleanK.length >= 4 ? cleanK : (cleanN || singkatan || `row-${idx}`);

      if (!clustersMap.has(clusterKey)) {
        clustersMap.set(clusterKey, {
          kode,
          nama,
          singkatan,
          kategori,
          kepala,
          nip,
          alamat,
          rows: [],
          paguValues: [],
          realisasiValues: [],
          distinctPrograms: new Map(),
          distinctKegiatans: new Map(),
          distinctSubKegiatans: new Map(),
          distinctBelanja: new Map()
        });
      }

      const cluster = clustersMap.get(clusterKey)!;
      if (nama && (!cluster.nama || cluster.nama.length < nama.length)) cluster.nama = nama;
      if (kode && !cluster.kode) cluster.kode = kode;
      if (singkatan && !cluster.singkatan) cluster.singkatan = singkatan;
      if (kepala && !cluster.kepala) cluster.kepala = kepala;
      if (nip && !cluster.nip) cluster.nip = nip;
      if (alamat && !cluster.alamat) cluster.alamat = alamat;

      cluster.rows.push(row);
      if (pagu > 0) cluster.paguValues.push(pagu);
      if (realisasi > 0) cluster.realisasiValues.push(realisasi);

      // Catat Program
      const pName = row['Nama Program'] || row['Nama_Program'] || row['Program'] || row['NAMA PROGRAM'];
      const pCode = row['Kode Program'] || row['Kode_Program'] || row['KODE PROGRAM'] || (pName ? `P-${cluster.distinctPrograms.size + 1}` : '');
      if (pName) {
        const progKey = String(pCode || pName).trim().toLowerCase();
        if (!cluster.distinctPrograms.has(progKey)) {
          cluster.distinctPrograms.set(progKey, {
            kodeProgram: pCode,
            namaProgram: String(pName).toUpperCase(),
            pagu: pagu > 0 ? pagu : 0,
            realisasi: realisasi > 0 ? realisasi : 0
          });
        } else {
          const ep = cluster.distinctPrograms.get(progKey)!;
          if (pagu > 0) ep.pagu += pagu;
          if (realisasi > 0) ep.realisasi += realisasi;
        }
      }

      // Catat Kegiatan
      const kName = row['Nama Kegiatan'] || row['Nama_Kegiatan'] || row['Kegiatan'] || row['NAMA KEGIATAN'];
      const kCode = row['Kode Kegiatan'] || row['Kode_Kegiatan'] || row['KODE KEGIATAN'] || (kName ? `K-${cluster.distinctKegiatans.size + 1}` : '');
      if (kName) {
        const kegKey = String(kCode || kName).trim().toLowerCase();
        if (!cluster.distinctKegiatans.has(kegKey)) {
          cluster.distinctKegiatans.set(kegKey, {
            kodeProgram: pCode || '',
            kodeKegiatan: kCode,
            namaKegiatan: String(kName),
            pagu: pagu > 0 ? pagu : 0,
            realisasi: realisasi > 0 ? realisasi : 0
          });
        } else {
          const ek = cluster.distinctKegiatans.get(kegKey)!;
          if (pagu > 0) ek.pagu += pagu;
          if (realisasi > 0) ek.realisasi += realisasi;
        }
      }

      // Catat Sub Kegiatan
      const sName = row['Nama Sub Kegiatan'] || row['Nama_Sub_Kegiatan'] || row['Sub_Kegiatan'] || row['NAMA SUB KEGIATAN'];
      const sCode = row['Kode Sub Kegiatan'] || row['Kode_Sub_Kegiatan'] || row['KODE SUB KEGIATAN'] || (sName ? `S-${cluster.distinctSubKegiatans.size + 1}` : '');
      if (sName) {
        const subKey = String(sCode || sName).trim().toLowerCase();
        if (!cluster.distinctSubKegiatans.has(subKey)) {
          cluster.distinctSubKegiatans.set(subKey, {
            kodeProgram: pCode || '',
            kodeKegiatan: kCode || '',
            kodeSub: sCode,
            namaSub: String(sName),
            pagu: pagu > 0 ? pagu : 0,
            realisasi: realisasi > 0 ? realisasi : 0
          });
        } else {
          const es = cluster.distinctSubKegiatans.get(subKey)!;
          if (pagu > 0) es.pagu += pagu;
          if (realisasi > 0) es.realisasi += realisasi;
        }
      }

      // Catat Rekening Belanja
      const bName = row['Nama Rekening'] || row['Nama_Rekening'] || row['Nama_Rekening_Belanja'] || row['Nama_Belanja'] || row['Rekening_Belanja'] || row['NAMA REKENING'];
      const bCode = row['Kode Rekening'] || row['Kode_Rekening'] || row['Kode_Rekening_Belanja'] || row['Kode_Belanja'] || (bName ? `B-${cluster.distinctBelanja.size + 1}` : '');
      if (bName || bCode) {
        const belKey = String(bCode || bName).trim().toLowerCase();
        if (!cluster.distinctBelanja.has(belKey)) {
          cluster.distinctBelanja.set(belKey, {
            kodeBelanja: bCode || '5.1.02.01.01.0001',
            namaBelanja: String(bName || `Belanja ${bCode}`),
            jenisBelanja: row['Jenis_Belanja'] || row['JENIS BELANJA'] || (bCode?.startsWith('5.1.01') ? 'Belanja Pegawai' : bCode?.startsWith('5.2') ? 'Belanja Modal' : 'Belanja Operasi'),
            pagu: pagu > 0 ? pagu : 0,
            realisasi: realisasi > 0 ? realisasi : 0
          });
        } else {
          const eb = cluster.distinctBelanja.get(belKey)!;
          if (pagu > 0) eb.pagu += pagu;
          if (realisasi > 0) eb.realisasi += realisasi;
        }
      }
    });

    // Proses dan terapkan setiap Cluster OPD ke state aplikasi
    clustersMap.forEach(cluster => {
      // Hitung akumulasi pagu dan realisasi yang benar
      let totalPagu = 0;
      let totalReal = 0;

      if (cluster.distinctBelanja.size > 0) {
        cluster.distinctBelanja.forEach(b => {
          totalPagu += b.pagu;
          totalReal += b.realisasi;
        });
      } else if (cluster.distinctSubKegiatans.size > 0) {
        cluster.distinctSubKegiatans.forEach(s => {
          totalPagu += s.pagu;
          totalReal += s.realisasi;
        });
      } else if (cluster.distinctPrograms.size > 0) {
        cluster.distinctPrograms.forEach(p => {
          totalPagu += p.pagu;
          totalReal += p.realisasi;
        });
      } else {
        totalPagu = cluster.paguValues.reduce((a, b) => a + b, 0);
        totalReal = cluster.realisasiValues.reduce((a, b) => a + b, 0);
      }

      // Cocokkan OPD dengan database 40 OPD NTB
      const matchedIdx = findMatchingOpdIndex(cluster.kode, cluster.nama, cluster.singkatan, newOpds);

      let targetId = '';
      if (matchedIdx >= 0) {
        const cur = newOpds[matchedIdx];
        targetId = cur.id;

        newOpds[matchedIdx] = {
          ...cur,
          namaOPD: cluster.nama || cur.namaOPD, // Update Nama OPD sesuai file Excel!
          kodeOPD: cluster.kode || cur.kodeOPD, // Update Kode Sub SKPD sesuai file Excel!
          singkatan: cluster.singkatan || cur.singkatan,
          targetPagu: totalPagu > 0 ? totalPagu : cur.targetPagu, // Update Nilai Pagu Anggaran!
          realisasiSP2D: totalReal > 0 ? totalReal : cur.realisasiSP2D, // Update Nilai Realisasi Kasda!
          kepalaBadan: cluster.kepala || cur.kepalaBadan,
          nipKepala: cluster.nip || cur.nipKepala,
          alamat: cluster.alamat || cur.alamat,
          statusKinerja: totalPagu > 0 
            ? ((totalReal / totalPagu) >= 0.8 ? 'Sangat Tinggi' : (totalReal / totalPagu) >= 0.65 ? 'Tinggi' : 'Sedang') 
            : cur.statusKinerja
        };
        updatedCount++;
      } else {
        // Buat entitas OPD baru jika tidak cocok dengan 40 SKPD bawaan
        targetId = `OPD-${String(newOpds.length + 1).padStart(3, '0')}`;
        newOpds.push({
          id: targetId,
          kodeOPD: cluster.kode || `1.01.0.00.0.00.${String(newOpds.length + 1).padStart(2, '0')}.0000`,
          namaOPD: cluster.nama || `OPD ${cluster.singkatan || targetId}`,
          singkatan: cluster.singkatan || (cluster.nama ? cluster.nama.substring(0, 10).toUpperCase() : `OPD ${newOpds.length + 1}`),
          kategori: (cluster.kategori as any) || 'Dinas Daerah',
          kepalaBadan: cluster.kepala || 'Belum Ditetapkan',
          nipKepala: cluster.nip || '-',
          alamat: cluster.alamat || 'Kota Mataram, NTB',
          targetPagu: totalPagu > 0 ? totalPagu : 25000000000,
          realisasiSP2D: totalReal > 0 ? totalReal : 18500000000,
          jumlahProgram: Math.max(cluster.distinctPrograms.size, 4),
          jumlahKegiatan: Math.max(cluster.distinctKegiatans.size, 12),
          jumlahTransaksi: 25,
          statusKinerja: totalPagu > 0 
            ? ((totalReal / totalPagu) >= 0.8 ? 'Sangat Tinggi' : (totalReal / totalPagu) >= 0.65 ? 'Tinggi' : 'Sedang') 
            : 'Sedang'
        });
        addedCount++;
      }

      // Perbarui rincian breakdown (Program, Kegiatan, Sub Kegiatan, Belanja) untuk OPD ini
      const targetOpd = newOpds.find(o => o.id === targetId)!;
      if (!newBreakdowns[targetId]) {
        newBreakdowns[targetId] = getOPDDetailsBreakdown(targetOpd);
      }
      const bd = newBreakdowns[targetId];

      if (cluster.distinctPrograms.size > 0) {
        bd.programs = Array.from(cluster.distinctPrograms.values()).map((p, pIdx) => ({
          id: `IMP-P-${targetId}-${pIdx + 1}`,
          opdId: targetId,
          namaOPD: targetOpd.namaOPD,
          kodeProgram: p.kodeProgram,
          namaProgram: p.namaProgram,
          pagu: p.pagu,
          realisasi: p.realisasi
        }));
      }
      if (cluster.distinctKegiatans.size > 0) {
        bd.kegiatans = Array.from(cluster.distinctKegiatans.values()).map((k, kIdx) => ({
          id: `IMP-K-${targetId}-${kIdx + 1}`,
          opdId: targetId,
          namaOPD: targetOpd.namaOPD,
          kodeProgram: k.kodeProgram,
          kodeKegiatan: k.kodeKegiatan,
          namaKegiatan: k.namaKegiatan,
          pagu: k.pagu,
          realisasi: k.realisasi
        }));
      }
      if (cluster.distinctSubKegiatans.size > 0) {
        bd.subKegiatans = Array.from(cluster.distinctSubKegiatans.values()).map((s, sIdx) => ({
          id: `IMP-S-${targetId}-${sIdx + 1}`,
          opdId: targetId,
          namaOPD: targetOpd.namaOPD,
          kodeProgram: s.kodeProgram,
          kodeKegiatan: s.kodeKegiatan,
          kodeSub: s.kodeSub,
          namaSub: s.namaSub,
          pagu: s.pagu,
          realisasi: s.realisasi
        }));
      }
      if (cluster.distinctBelanja.size > 0) {
        bd.belanjaList = Array.from(cluster.distinctBelanja.values()).map((b, bIdx) => ({
          id: `IMP-B-${targetId}-${bIdx + 1}`,
          opdId: targetId,
          namaOPD: targetOpd.namaOPD,
          kodeBelanja: b.kodeBelanja,
          namaBelanja: b.namaBelanja,
          jenisBelanja: b.jenisBelanja,
          pagu: b.pagu,
          realisasi: b.realisasi
        }));
      }
    });

    setOpdListState(newOpds);
    setCustomBreakdownMap(newBreakdowns);

    // Simpan permanen ke localStorage
    try {
      localStorage.setItem('bfms_seluruh_opd_data_v1', JSON.stringify(newOpds));
      localStorage.setItem('bfms_seluruh_opd_breakdowns_v1', JSON.stringify(newBreakdowns));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    setImportStats({ total: importPreviewData.length, updated: updatedCount, added: addedCount });
    setLaporanActionSuccessMsg(`Berhasil menerapkan import data untuk ${clustersMap.size} OPD (${updatedCount} diperbarui, ${addedCount} OPD baru). Nama OPD dan Anggaran telah disinkronkan.`);
    setShowImportModal(false);
  };

  // Simpan Perubahan Edit pada Menu Pelaporan Konsolidasi
  const handleSaveEditLaporan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editLaporanModal) return;

    const { type, opdId, data } = editLaporanModal;
    const newBreakdowns = { ...customBreakdownMap };
    const newOpds = [...opdListState];

    if (type === 'opd') {
      const idx = newOpds.findIndex(o => o.id === opdId);
      if (idx >= 0) {
        newOpds[idx] = {
          ...newOpds[idx],
          namaOPD: data.namaOPD || newOpds[idx].namaOPD,
          singkatan: data.singkatan || newOpds[idx].singkatan,
          kodeOPD: data.kodeOPD || newOpds[idx].kodeOPD,
          kategori: data.kategori || newOpds[idx].kategori,
          targetPagu: Number(data.targetPagu) || 0,
          realisasiSP2D: Number(data.realisasiSP2D) || 0,
          kepalaBadan: data.kepalaBadan || newOpds[idx].kepalaBadan,
          nipKepala: data.nipKepala || newOpds[idx].nipKepala
        };
        setOpdListState(newOpds);
        try {
          localStorage.setItem('bfms_seluruh_opd_data_v1', JSON.stringify(newOpds));
        } catch (err) {}
        setLaporanActionSuccessMsg(`Data OPD ${newOpds[idx].singkatan} berhasil diperbarui.`);
      }
    } else {
      const opdObj = newOpds.find(o => o.id === opdId);
      if (opdObj) {
        if (!newBreakdowns[opdId]) {
          newBreakdowns[opdId] = getOPDDetailsBreakdown(opdObj);
        }
        const bd = newBreakdowns[opdId];

        if (type === 'program') {
          const pIdx = bd.programs.findIndex((p: any) => p.id === data.id || p.kodeProgram === data.kodeProgram);
          if (pIdx >= 0) {
            bd.programs[pIdx] = {
              ...bd.programs[pIdx],
              kodeProgram: data.kodeProgram,
              namaProgram: data.namaProgram,
              pagu: Number(data.pagu) || 0,
              realisasi: Number(data.realisasi) || 0
            };
          }
          // Re-sum OPD targetPagu & realisasiSP2D
          const totPagu = bd.programs.reduce((s: number, p: any) => s + (Number(p.pagu) || 0), 0);
          const totReal = bd.programs.reduce((s: number, p: any) => s + (Number(p.realisasi) || 0), 0);
          const oIdx = newOpds.findIndex(o => o.id === opdId);
          if (oIdx >= 0 && totPagu > 0) {
            newOpds[oIdx] = {
              ...newOpds[oIdx],
              targetPagu: totPagu,
              realisasiSP2D: totReal,
              statusKinerja: (totReal / totPagu) >= 0.8 ? 'Sangat Tinggi' : (totReal / totPagu) >= 0.65 ? 'Tinggi' : 'Sedang'
            };
            setOpdListState(newOpds);
          }
        } else if (type === 'kegiatan') {
          const kIdx = bd.kegiatans.findIndex((k: any) => k.id === data.id || k.kodeKegiatan === data.kodeKegiatan);
          if (kIdx >= 0) {
            bd.kegiatans[kIdx] = {
              ...bd.kegiatans[kIdx],
              kodeKegiatan: data.kodeKegiatan,
              namaKegiatan: data.namaKegiatan,
              kodeProgram: data.kodeProgram,
              pagu: Number(data.pagu) || 0,
              realisasi: Number(data.realisasi) || 0
            };
          }
        } else if (type === 'subkegiatan') {
          const sIdx = bd.subKegiatans.findIndex((s: any) => s.id === data.id || s.kodeSub === data.kodeSub);
          if (sIdx >= 0) {
            bd.subKegiatans[sIdx] = {
              ...bd.subKegiatans[sIdx],
              kodeSub: data.kodeSub,
              namaSub: data.namaSub,
              kodeKegiatan: data.kodeKegiatan,
              pagu: Number(data.pagu) || 0,
              realisasi: Number(data.realisasi) || 0
            };
          }
        } else if (type === 'belanja') {
          const bIdx = bd.belanjaList.findIndex((b: any) => b.id === data.id || b.kodeBelanja === data.kodeBelanja);
          if (bIdx >= 0) {
            bd.belanjaList[bIdx] = {
              ...bd.belanjaList[bIdx],
              kodeBelanja: data.kodeBelanja,
              namaBelanja: data.namaBelanja,
              jenisBelanja: data.jenisBelanja || bd.belanjaList[bIdx].jenisBelanja,
              pagu: Number(data.pagu) || 0,
              realisasi: Number(data.realisasi) || 0
            };
          }
        }

        setCustomBreakdownMap(newBreakdowns);
        try {
          localStorage.setItem('bfms_seluruh_opd_data_v1', JSON.stringify(newOpds));
          localStorage.setItem('bfms_seluruh_opd_breakdowns_v1', JSON.stringify(newBreakdowns));
        } catch (err) {}
        setLaporanActionSuccessMsg(`Data ${type.toUpperCase()} [${data.kodeProgram || data.kodeKegiatan || data.kodeSub || data.kodeBelanja}] berhasil diperbarui.`);
      }
    }

    setEditLaporanModal(null);
  };

  // Konfirmasi & Hapus Item pada Menu Pelaporan Konsolidasi
  const handleConfirmDeleteLaporan = () => {
    if (!deleteLaporanModal) return;
    const { type, opdId, id, kode, nama } = deleteLaporanModal;
    const newBreakdowns = { ...customBreakdownMap };
    const newOpds = [...opdListState];

    if (type === 'opd') {
      const filtered = newOpds.filter(o => o.id !== opdId);
      setOpdListState(filtered);
      delete newBreakdowns[opdId];
      setCustomBreakdownMap(newBreakdowns);
      try {
        localStorage.setItem('bfms_seluruh_opd_data_v1', JSON.stringify(filtered));
        localStorage.setItem('bfms_seluruh_opd_breakdowns_v1', JSON.stringify(newBreakdowns));
      } catch (err) {}
      setLaporanActionSuccessMsg(`OPD ${nama} berhasil dihapus dari konsolidasi.`);
    } else {
      const opdObj = newOpds.find(o => o.id === opdId);
      if (opdObj) {
        if (!newBreakdowns[opdId]) {
          newBreakdowns[opdId] = getOPDDetailsBreakdown(opdObj);
        }
        const bd = newBreakdowns[opdId];

        if (type === 'program') {
          bd.programs = bd.programs.filter((p: any) => p.id !== id && p.kodeProgram !== kode);
        } else if (type === 'kegiatan') {
          bd.kegiatans = bd.kegiatans.filter((k: any) => k.id !== id && k.kodeKegiatan !== kode);
        } else if (type === 'subkegiatan') {
          bd.subKegiatans = bd.subKegiatans.filter((s: any) => s.id !== id && s.kodeSub !== kode);
        } else if (type === 'belanja') {
          bd.belanjaList = bd.belanjaList.filter((b: any) => b.id !== id && b.kodeBelanja !== kode);
        }

        setCustomBreakdownMap(newBreakdowns);
        try {
          localStorage.setItem('bfms_seluruh_opd_breakdowns_v1', JSON.stringify(newBreakdowns));
        } catch (err) {}
        setLaporanActionSuccessMsg(`Item ${type.toUpperCase()} [${kode}] "${nama}" berhasil dihapus.`);
      }
    }

    setDeleteLaporanModal(null);
  };

  // Master OPD: Daftar Seluruh Rekening Belanja Konsolidasi
  const allMasterRekeningList = useMemo(() => {
    const list: any[] = [];
    opdListState.forEach(opd => {
      if (masterOpdFilter !== 'ALL' && opd.id !== masterOpdFilter) return;
      const bd = customBreakdownMap[opd.id] || getOPDDetailsBreakdown(opd);
      (bd.belanjaList || []).forEach((b: any, idx: number) => {
        list.push({
          id: b.id || `rek-${opd.id}-${idx}`,
          opdId: opd.id,
          namaOPD: opd.namaOPD,
          singkatan: opd.singkatan,
          kodeOPD: opd.kodeOPD,
          kodeBelanja: b.kodeBelanja,
          namaBelanja: b.namaBelanja,
          jenisBelanja: b.jenisBelanja || 'Belanja Operasi',
          pagu: Number(b.pagu) || 0,
          realisasi: Number(b.realisasi) || 0
        });
      });
    });
    return list;
  }, [opdListState, customBreakdownMap, masterOpdFilter]);

  // Master OPD: Filtered Rekening Belanja
  const filteredMasterRekeningList = useMemo(() => {
    return allMasterRekeningList.filter(item => {
      const matchSearch = !masterRekeningSearch.trim() ||
        item.kodeBelanja.toLowerCase().includes(masterRekeningSearch.toLowerCase()) ||
        item.namaBelanja.toLowerCase().includes(masterRekeningSearch.toLowerCase()) ||
        item.singkatan.toLowerCase().includes(masterRekeningSearch.toLowerCase()) ||
        item.namaOPD.toLowerCase().includes(masterRekeningSearch.toLowerCase());

      const matchJenis = masterJenisBelanjaFilter === 'ALL' ||
        item.jenisBelanja.toLowerCase().includes(masterJenisBelanjaFilter.toLowerCase());

      return matchSearch && matchJenis;
    });
  }, [allMasterRekeningList, masterRekeningSearch, masterJenisBelanjaFilter]);

  // Master OPD: Daftar Program & Kegiatan Konsolidasi
  const allMasterProgramList = useMemo(() => {
    const list: any[] = [];
    opdListState.forEach(opd => {
      if (masterOpdFilter !== 'ALL' && opd.id !== masterOpdFilter) return;
      const bd = customBreakdownMap[opd.id] || getOPDDetailsBreakdown(opd);
      (bd.programs || []).forEach((p: any, idx: number) => {
        const kegs = (bd.kegiatans || []).filter((k: any) => k.kodeProgram === p.kodeProgram || k.kodeKegiatan.startsWith(p.kodeProgram));
        list.push({
          id: p.id || `prog-${opd.id}-${idx}`,
          opdId: opd.id,
          namaOPD: opd.namaOPD,
          singkatan: opd.singkatan,
          kodeProgram: p.kodeProgram,
          namaProgram: p.namaProgram,
          pagu: Number(p.pagu) || 0,
          realisasi: Number(p.realisasi) || 0,
          kegiatans: kegs
        });
      });
    });
    return list;
  }, [opdListState, customBreakdownMap, masterOpdFilter]);

  // Download Template Excel Master OPD (Anggaran, Realisasi, Kode Rekening & Format SIPD M6 s.d X)
  const handleDownloadMasterTemplate = (type: 'all' | 'anggaran' | 'realisasi' | 'rekening' | 'sipd') => {
    if (type === 'anggaran') {
      downloadAnggaranExcelTemplate();
      return;
    }
    if (type === 'realisasi') {
      downloadRealisasiExcelTemplate();
      return;
    }
    if (type === 'sipd') {
      downloadSIPDColumnMtoXTemplate();
      return;
    }
    if (type === 'all') {
      downloadOPDExcelTemplate();
      return;
    }

    if (type === 'rekening') {
      const wb = XLSX.utils.book_new();
      const wsRekening = XLSX.utils.json_to_sheet([
        {
          'Kode Rekening Belanja': '5.1.01.01.01.0001',
          'Uraian Belanja': 'Belanja Gaji Pokok ASN / PNS',
          'Jenis Belanja': 'Belanja Pegawai',
          'Kode Program': '1.02.01',
          'Kode Kegiatan': '1.02.01.2.01',
          'Kode Sub Kegiatan': '1.02.01.2.01.01',
          'Nama Sub SKPD': 'Dinas Kesehatan Provinsi NTB'
        },
        {
          'Kode Rekening Belanja': '5.1.02.01.01.0024',
          'Uraian Belanja': 'Belanja Alat Tulis Kantor (ATK)',
          'Jenis Belanja': 'Belanja Barang dan Jasa',
          'Kode Program': '5.01.01',
          'Kode Kegiatan': '5.01.01.2.02',
          'Kode Sub Kegiatan': '5.01.01.2.02.01',
          'Nama Sub SKPD': 'Badan Kesatuan Bangsa dan Politik Dalam Negeri Provinsi NTB'
        },
        {
          'Kode Rekening Belanja': '5.2.02.08.01.0005',
          'Uraian Belanja': 'Belanja Modal Peralatan Komputer dan Server Sekolah',
          'Jenis Belanja': 'Belanja Modal',
          'Kode Program': '1.01.01',
          'Kode Kegiatan': '1.01.01.2.01',
          'Kode Sub Kegiatan': '1.01.01.2.01.01',
          'Nama Sub SKPD': 'Dinas Pendidikan dan Kebudayaan Provinsi NTB'
        }
      ]);
      XLSX.utils.book_append_sheet(wb, wsRekening, 'Master_Kode_Rekening');
      safeDownloadExcel(wb, `Template_Master_Kode_Rekening_Belanja_NTB_${selectedTahun}.xlsx`);
    }
  };

  // Upload Excel Khusus Menu Master OPD
  const handleMasterFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMasterImportFileName(file.name);
    setMasterImportErrors([]);
    setMasterImportSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        const rows: any[] = [];
        const errs: string[] = [];
        const parsedRows = parseExcelRowsSmart(wb);

        parsedRows.forEach((row: any, rowIdx: number) => {
          const sheetName = row._sheetName || 'Sheet1';
          const getVal = (...keys: string[]) => {
            for (const key of keys) {
              const matchedKey = Object.keys(row).find(k => {
                if (!k) return false;
                const cleanK = k.trim().toLowerCase().replace(/[\s_\-()/.:]/g, '');
                const cleanKey = key.toLowerCase().replace(/[\s_\-()/.:]/g, '');
                return cleanK === cleanKey;
              });
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null && String(row[matchedKey]).trim() !== '') {
                return String(row[matchedKey]).trim();
              }
            }
            for (const key of keys) {
              const matchedKey = Object.keys(row).find(k => {
                if (!k) return false;
                const cleanK = k.trim().toLowerCase().replace(/[\s_\-()/.:]/g, '');
                const cleanKey = key.toLowerCase().replace(/[\s_\-()/.:]/g, '');
                return cleanK.includes(cleanKey);
              });
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null && String(row[matchedKey]).trim() !== '') {
                return String(row[matchedKey]).trim();
              }
            }
            return '';
          };

          const namaOpd = getVal('namasubskpd', 'nama_sub_skpd', 'namaopd', 'nama_opd', 'opd', 'skpd', 'namaskpd');
          const kodeOpd = getVal('kodesubskpd', 'kode_sub_skpd', 'kodeopd', 'kode_opd', 'kodeskpd');
          const singkatan = getVal('singkatan');

          let matchedOpd = opdListState.find(o => 
            (kodeOpd && o.kodeOPD.trim() === kodeOpd.trim()) ||
            (singkatan && o.singkatan.toLowerCase() === singkatan.toLowerCase()) ||
            (namaOpd && (o.namaOPD.toLowerCase().includes(namaOpd.toLowerCase()) || namaOpd.toLowerCase().includes(o.namaOPD.toLowerCase())))
          );

          if (!matchedOpd && masterImportTargetOpd !== 'ALL') {
            matchedOpd = opdListState.find(o => o.id === masterImportTargetOpd);
          }

          const kodeRek = getVal('koderekening', 'koderekeningbelanja', 'kodebelanja', 'rekening', 'kodeakun', 'akun', 'koderek');
          const uraianRek = getVal('namarekening', 'uraianbelanja', 'namarekeningbelanja', 'namabelanja', 'uraianrekening', 'uraian');
          let jenisBelanja = getVal('jenisbelanja', 'jenis', 'klasifikasi');
          if (!jenisBelanja && kodeRek) {
            if (kodeRek.startsWith('5.1.01')) jenisBelanja = 'Belanja Pegawai';
            else if (kodeRek.startsWith('5.1.02')) jenisBelanja = 'Belanja Barang dan Jasa';
            else if (kodeRek.startsWith('5.2')) jenisBelanja = 'Belanja Modal';
            else if (kodeRek.startsWith('5.3')) jenisBelanja = 'Belanja Tidak Terduga';
            else if (kodeRek.startsWith('5.4')) jenisBelanja = 'Belanja Transfer';
            else jenisBelanja = 'Belanja Operasi';
          }

          const paguMurni = parseNumeric(getVal('alokasianggaran', 'alokasi', 'pagumurni', 'nilaipagumurni', 'pagu', 'anggaran', 'targetpagu', 'paguanggaran'));
          const revisi = parseNumeric(getVal('revisipergeseran', 'revisi', 'pergeseran', 'perubahan'));
          const nilaiSPD = parseNumeric(getVal('nilaispd', 'spd', 'paguspd')) || (paguMurni + revisi);
          const sumberDana = getVal('sumberdana', 'sumber', 'sd') || 'DAU';

          const realisasi = parseNumeric(getVal('realisasianggaran', 'realisasi', 'nilairealisasi', 'realisasisp2d', 'sp2d', 'nilaisp2d', 'cair', 'nilai'));
          const noSP2D = getVal('nosp2d', 'nomorsp2d', 'sp2d');
          const noSPM = getVal('nospm', 'nomorspm', 'spm');
          const tanggal = getVal('tanggalsp2d', 'tanggal', 'tglsp2d', 'tgl') || new Date().toISOString().split('T')[0];
          const rekanan = getVal('rekanan', 'penerima', 'pihakketiga') || (matchedOpd ? `Bendahara ${matchedOpd.singkatan}` : 'Pihak Ketiga');

          const kodeProg = getVal('kodeprogram', 'kodeprog', 'program');
          const namaProg = getVal('namaprogram', 'namaprog');
          const kodeKeg = getVal('kodekegiatan', 'kodekeg', 'kegiatan');
          const namaKeg = getVal('namakegiatan', 'namakeg');
          const kodeSub = getVal('kodesubkegiatan', 'kodesub', 'subkegiatan');
          const namaSub = getVal('namasubkegiatan', 'namasub');

          // Deteksi jenis baris data
          let rowType: 'anggaran' | 'realisasi' | 'rekening' = 'rekening';
          if (sheetName.toLowerCase().includes('anggaran') || paguMurni > 0 || revisi !== 0 || String(row['Alokasi Anggaran'] || '') !== '') {
            rowType = 'anggaran';
          } else if (sheetName.toLowerCase().includes('realisasi') || realisasi > 0 || noSP2D || String(row['Realisasi Anggaran'] || '') !== '') {
            rowType = 'realisasi';
          } else if (kodeRek) {
            rowType = 'rekening';
          }

          if (masterImportCategory !== 'all' && masterImportCategory !== rowType) {
            return;
          }

          if (!kodeRek && !paguMurni && !realisasi && !namaOpd && !kodeOpd) {
            return;
          }

          let validationErr = '';
          if (!matchedOpd) {
            validationErr = 'OPD tidak dikenali dari nama atau kode di file Excel.';
            errs.push(`Baris ${rowIdx + 1} (${sheetName}): ${validationErr}`);
          }

          rows.push({
            rowNum: rows.length + 1,
            sheetName,
            rowType,
            opd: matchedOpd || { id: 'UNKNOWN', namaOPD: namaOpd || 'Tidak Diketahui', singkatan: singkatan || 'UNK', kodeOPD: kodeOpd || '-' },
            kodeRekening: kodeRek || (rowType === 'rekening' ? '5.1.02.01.01.0001' : '-'),
            namaRekening: uraianRek || (kodeRek ? `Belanja Rekening ${kodeRek}` : (rowType === 'anggaran' ? 'Pagu Anggaran OPD' : 'Realisasi Kasda')),
            jenisBelanja: jenisBelanja || 'Belanja Operasi',
            pagu: paguMurni,
            revisi,
            nilaiSPD,
            sumberDana,
            realisasi,
            noSP2D,
            noSPM,
            tanggal,
            rekanan,
            kodeProgram: kodeProg,
            namaProgram: namaProg,
            kodeKegiatan: kodeKeg,
            namaKegiatan: namaKeg,
            kodeSub,
            namaSub,
            isValid: !validationErr,
            validationError: validationErr
          });
        });

        if (rows.length === 0) {
          alert('Tidak ada baris data yang valid ditemukan di file Excel. Pastikan nama kolom sesuai template.');
          return;
        }

        setMasterImportPreviewRows(rows);
        setMasterImportErrors(errs);
        setShowMasterImportModal(true);
      } catch (err) {
        alert('Gagal membaca file Excel. Pastikan format file .xlsx atau .xls valid.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Eksekusi Terapkan Import Master OPD ke State & LocalStorage
  const handleApplyMasterImport = () => {
    const validRows = masterImportPreviewRows.filter(r => r.isValid);
    if (validRows.length === 0) return;

    const newOpds = [...opdListState];
    const newBreakdowns: Record<string, any> = { ...customBreakdownMap };

    let totalPaguImported = 0;
    let totalRealisasiImported = 0;
    let totalRekeningImported = 0;
    const affectedOpdIds = new Set<string>();

    validRows.forEach(row => {
      const opdId = row.opd.id;
      if (!opdId || opdId === 'UNKNOWN') return;
      affectedOpdIds.add(opdId);

      const opdObj = newOpds.find(o => o.id === opdId);
      if (!opdObj) return;

      if (!newBreakdowns[opdId]) {
        newBreakdowns[opdId] = getOPDDetailsBreakdown(opdObj);
      }
      const bd = newBreakdowns[opdId];

      // Handle Kode Rekening & Belanja
      if (row.kodeRekening && row.kodeRekening !== '-') {
        totalRekeningImported++;
        const existingBel = bd.belanjaList.find((b: any) => b.kodeBelanja.trim() === row.kodeRekening.trim());
        if (existingBel) {
          if (row.namaRekening) existingBel.namaBelanja = row.namaRekening;
          if (row.jenisBelanja) existingBel.jenisBelanja = row.jenisBelanja;
          if (row.pagu > 0) {
            existingBel.pagu = masterImportOverwrite ? row.pagu : Math.max(existingBel.pagu, row.pagu);
            totalPaguImported += row.pagu;
          }
          if (row.realisasi > 0) {
            existingBel.realisasi = masterImportOverwrite ? row.realisasi : (existingBel.realisasi + row.realisasi);
            totalRealisasiImported += row.realisasi;
          }
        } else {
          bd.belanjaList.push({
            id: `BEL-${opdId}-${Date.now().toString().slice(-4)}-${bd.belanjaList.length + 1}`,
            opdId,
            namaOPD: opdObj.namaOPD,
            kodeBelanja: row.kodeRekening,
            namaBelanja: row.namaRekening,
            jenisBelanja: row.jenisBelanja,
            pagu: row.pagu > 0 ? row.pagu : 500000000,
            realisasi: row.realisasi > 0 ? row.realisasi : 0
          });
          if (row.pagu > 0) totalPaguImported += row.pagu;
          if (row.realisasi > 0) totalRealisasiImported += row.realisasi;
        }
      }

      // Handle Program & Kegiatan
      if (row.kodeProgram && row.namaProgram) {
        const existProg = bd.programs.find((p: any) => p.kodeProgram === row.kodeProgram);
        if (existProg) {
          existProg.namaProgram = row.namaProgram;
          if (row.pagu > 0) existProg.pagu = masterImportOverwrite ? row.pagu : (existProg.pagu + row.pagu);
        } else {
          bd.programs.push({
            id: `PROG-${opdId}-${bd.programs.length + 1}`,
            opdId,
            namaOPD: opdObj.namaOPD,
            kodeProgram: row.kodeProgram,
            namaProgram: row.namaProgram,
            pagu: row.pagu > 0 ? row.pagu : 1000000000,
            realisasi: row.realisasi > 0 ? row.realisasi : 0
          });
        }
      }

      // Rekalkulasi total Pagu dan Realisasi OPD
      const sumBelPagu = bd.belanjaList.reduce((acc: number, b: any) => acc + (b.pagu || 0), 0);
      const sumBelReal = bd.belanjaList.reduce((acc: number, b: any) => acc + (b.realisasi || 0), 0);

      if (sumBelPagu > 0) {
        opdObj.targetPagu = sumBelPagu;
      } else if (row.pagu > 0) {
        opdObj.targetPagu = masterImportOverwrite ? row.pagu : (opdObj.targetPagu + row.pagu);
      }

      if (sumBelReal > 0) {
        opdObj.realisasiSP2D = sumBelReal;
      } else if (row.realisasi > 0) {
        opdObj.realisasiSP2D = masterImportOverwrite ? row.realisasi : (opdObj.realisasiSP2D + row.realisasi);
      }

      opdObj.statusKinerja = opdObj.targetPagu > 0
        ? ((opdObj.realisasiSP2D / opdObj.targetPagu) >= 0.8 ? 'Sangat Tinggi' : (opdObj.realisasiSP2D / opdObj.targetPagu) >= 0.65 ? 'Tinggi' : 'Sedang')
        : opdObj.statusKinerja;
    });

    setOpdListState(newOpds);
    setCustomBreakdownMap(newBreakdowns);

    // Simpan ke localStorage
    try {
      localStorage.setItem('bfms_seluruh_opd_data_v1', JSON.stringify(newOpds));
      localStorage.setItem('bfms_seluruh_opd_breakdowns_v1', JSON.stringify(newBreakdowns));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    const msg = `Berhasil mengimpor ${validRows.length} data Master OPD untuk ${affectedOpdIds.size} Satuan Kerja! Terdata ${totalRekeningImported} rekening belanja, total pagu diperbarui ${formatRupiahSingkat(totalPaguImported)}, dan total realisasi ${formatRupiahSingkat(totalRealisasiImported)}.`;
    setMasterImportSuccessMsg(msg);
    setShowMasterImportModal(false);
    setMasterImportPreviewRows([]);
  };

  // Export specific active report to Excel (.xlsx)
  const handleExportActiveReportExcel = () => {
    const opdTitle = targetLaporanOpd ? targetLaporanOpd.namaOPD : 'Seluruh OPD NTB';
    const filenamePrefix = targetLaporanOpd ? targetLaporanOpd.singkatan : 'Konsolidasi_NTB';

    if (laporanSubTab === 'rekap-opd') {
      const headers = ['No', 'Kode SKPD', 'Nama OPD', 'Kategori', 'Kepala OPD / NIP', 'Pagu Anggaran (Rp)', 'Realisasi SP2D (Rp)', 'Sisa Pagu (Rp)', '% Serapan', 'Status Kinerja'];
      const rows = filteredOpds.map((opd, i) => [
        i + 1,
        opd.kodeOPD,
        opd.namaOPD,
        opd.kategori,
        `${opd.kepalaBadan} (${opd.nipKepala})`,
        opd.targetPagu,
        opd.realisasiSP2D,
        opd.targetPagu - opd.realisasiSP2D,
        `${((opd.realisasiSP2D / opd.targetPagu) * 100).toFixed(2)}%`,
        opd.statusKinerja
      ]);
      rows.push([
        'TOTAL',
        '',
        `GABUNGAN ${filteredOpds.length} OPD PEMPROV NTB`,
        '',
        '',
        totalPaguDisplay,
        totalRealisasiDisplay,
        totalSilpaDisplay,
        `${persentaseSerapanDisplay.toFixed(2)}%`,
        ''
      ]);
      exportReportToExcel(`Rekap_Realisasi_Seluruh_OPD_NTB_TA${selectedTahun}`, 'Rekap_OPD', `REKAPITULASI REALISASI ANGGARAN SELURUH OPD PROVINSI NTB TA ${selectedTahun}`, headers, rows);
      return;
    }

    if (laporanSubTab === 'per-program' && opdBreakdown) {
      const headers = ['No', 'Kode Program', 'Nama Program', 'Nama OPD', 'Pagu Anggaran (Rp)', 'Realisasi SP2D (Rp)', 'Sisa Pagu (Rp)', '% Realisasi', 'Status'];
      const rows = opdBreakdown.programs.map((p: OPDProgramItem, i: number) => {
        const pct = p.pagu > 0 ? (p.realisasi / p.pagu) * 100 : 0;
        return [
          i + 1,
          p.kodeProgram,
          p.namaProgram,
          targetLaporanOpd?.namaOPD || 'Pemprov NTB',
          p.pagu,
          p.realisasi,
          p.pagu - p.realisasi,
          `${pct.toFixed(2)}%`,
          pct >= 80 ? 'Sangat Tinggi' : pct >= 65 ? 'Tinggi' : 'Sedang'
        ];
      });
      const totPagu = opdBreakdown.programs.reduce((s: number, p: any) => s + p.pagu, 0);
      const totReal = opdBreakdown.programs.reduce((s: number, p: any) => s + p.realisasi, 0);
      rows.push(['TOTAL', '', 'TOTAL SELURUH PROGRAM', '', totPagu, totReal, totPagu - totReal, `${((totReal / totPagu) * 100).toFixed(2)}%`, '']);
      exportReportToExcel(`Laporan_Realisasi_Program_${filenamePrefix}_TA${selectedTahun}`, 'Realisasi_Program', `LAPORAN REALISASI ANGGARAN PER PROGRAM - ${opdTitle.toUpperCase()}`, headers, rows);
      return;
    }

    if (laporanSubTab === 'per-kegiatan' && opdBreakdown) {
      const headers = ['No', 'Kode Kegiatan', 'Nama Kegiatan', 'Kode Program Induk', 'Pagu Anggaran (Rp)', 'Realisasi SP2D (Rp)', 'Sisa Pagu (Rp)', '% Realisasi', 'Status'];
      const rows = opdBreakdown.kegiatans.map((k: OPDKegiatanItem, i: number) => {
        const pct = k.pagu > 0 ? (k.realisasi / k.pagu) * 100 : 0;
        return [
          i + 1,
          k.kodeKegiatan,
          k.namaKegiatan,
          k.kodeProgram,
          k.pagu,
          k.realisasi,
          k.pagu - k.realisasi,
          `${pct.toFixed(2)}%`,
          pct >= 80 ? 'Sangat Tinggi' : pct >= 65 ? 'Tinggi' : 'Sedang'
        ];
      });
      const totPagu = opdBreakdown.kegiatans.reduce((s: number, k: any) => s + k.pagu, 0);
      const totReal = opdBreakdown.kegiatans.reduce((s: number, k: any) => s + k.realisasi, 0);
      rows.push(['TOTAL', '', 'TOTAL SELURUH KEGIATAN', '', totPagu, totReal, totPagu - totReal, `${((totReal / totPagu) * 100).toFixed(2)}%`, '']);
      exportReportToExcel(`Laporan_Realisasi_Kegiatan_${filenamePrefix}_TA${selectedTahun}`, 'Realisasi_Kegiatan', `LAPORAN REALISASI ANGGARAN PER KEGIATAN - ${opdTitle.toUpperCase()}`, headers, rows);
      return;
    }

    if (laporanSubTab === 'per-subkegiatan' && opdBreakdown) {
      const headers = ['No', 'Kode Sub Kegiatan', 'Nama Sub Kegiatan', 'Kode Kegiatan Induk', 'Pagu Anggaran (Rp)', 'Realisasi SP2D (Rp)', 'Sisa Pagu (Rp)', '% Realisasi', 'Status'];
      const rows = opdBreakdown.subKegiatans.map((s: OPDSubKegiatanItem, i: number) => {
        const pct = s.pagu > 0 ? (s.realisasi / s.pagu) * 100 : 0;
        return [
          i + 1,
          s.kodeSub,
          s.namaSub,
          s.kodeKegiatan,
          s.pagu,
          s.realisasi,
          s.pagu - s.realisasi,
          `${pct.toFixed(2)}%`,
          pct >= 80 ? 'Sangat Tinggi' : pct >= 65 ? 'Tinggi' : 'Sedang'
        ];
      });
      const totPagu = opdBreakdown.subKegiatans.reduce((s: number, sub: any) => s + sub.pagu, 0);
      const totReal = opdBreakdown.subKegiatans.reduce((s: number, sub: any) => s + sub.realisasi, 0);
      rows.push(['TOTAL', '', 'TOTAL SELURUH SUB KEGIATAN', '', totPagu, totReal, totPagu - totReal, `${((totReal / totPagu) * 100).toFixed(2)}%`, '']);
      exportReportToExcel(`Laporan_Realisasi_SubKegiatan_${filenamePrefix}_TA${selectedTahun}`, 'Realisasi_SubKegiatan', `LAPORAN REALISASI ANGGARAN PER SUB KEGIATAN - ${opdTitle.toUpperCase()}`, headers, rows);
      return;
    }

    if (laporanSubTab === 'per-belanja' && opdBreakdown) {
      const headers = ['No', 'Kode Rekening Belanja', 'Nama Rekening Belanja', 'Jenis / Kelompok Belanja', 'Pagu Anggaran (Rp)', 'Realisasi SP2D (Rp)', 'Sisa Pagu (Rp)', '% Realisasi', 'Status'];
      const rows = opdBreakdown.belanjaList.map((b: OPDBelanjaItem, i: number) => {
        const pct = b.pagu > 0 ? (b.realisasi / b.pagu) * 100 : 0;
        return [
          i + 1,
          b.kodeBelanja,
          b.namaBelanja,
          b.jenisBelanja,
          b.pagu,
          b.realisasi,
          b.pagu - b.realisasi,
          `${pct.toFixed(2)}%`,
          pct >= 80 ? 'Sangat Tinggi' : pct >= 65 ? 'Tinggi' : 'Sedang'
        ];
      });
      const totPagu = opdBreakdown.belanjaList.reduce((s: number, b: any) => s + b.pagu, 0);
      const totReal = opdBreakdown.belanjaList.reduce((s: number, b: any) => s + b.realisasi, 0);
      rows.push(['TOTAL', '', 'TOTAL SELURUH REKENING BELANJA', '', totPagu, totReal, totPagu - totReal, `${((totReal / totPagu) * 100).toFixed(2)}%`, '']);
      exportReportToExcel(`Laporan_Realisasi_Belanja_${filenamePrefix}_TA${selectedTahun}`, 'Realisasi_Belanja', `LAPORAN REALISASI ANGGARAN PER REKENING BELANJA - ${opdTitle.toUpperCase()}`, headers, rows);
      return;
    }

    // Default fallback to general export
    handleExportExcel();
  };

  return (
    <div className="space-y-3.5 animate-fadeIn">
      {/* 1. Header Banner Antarmuka Seluruh OPD NTB (Ukuran Ringkas & Kompak) */}
      <div className="relative overflow-hidden rounded-xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-3 sm:p-3.5 shadow-lg shadow-cyan-950/20">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 p-1 border border-cyan-400/80 shadow-sm shadow-cyan-900/40">
              <NTBLogo className="h-full w-full" />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 text-[8px] font-bold text-slate-950 ring-1 ring-slate-900">
                40
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.2 text-[9px] font-bold uppercase tracking-wider text-cyan-300 ring-1 ring-cyan-500/40">
                  PORTAL PEMPROV NTB
                </span>
                <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] font-bold uppercase text-emerald-300 ring-1 ring-emerald-500/40">
                  40 OPD
                </span>
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-bold uppercase text-amber-300 ring-1 ring-amber-500/40">
                  TA {selectedTahun}
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white leading-tight">
                Sistem Informasi Keuangan Konsolidasi Seluruh OPD NTB
              </h1>
            </div>
          </div>

          {/* Tombol Aksi & Navigasi Antarmuka Ringkas */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
            {onSwitchToBakesbang && (
              <button
                type="button"
                onClick={onSwitchToBakesbang}
                className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 border border-slate-700 transition active:scale-95"
                title="Beralih ke Antarmuka Satker BAKESBANGPOLDAGRI NTB"
              >
                <Building className="h-3.5 w-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Ke BAKESBANG</span>
              </button>
            )}

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-800 px-2.5 py-1.5 text-[11px] font-semibold text-slate-300 border border-slate-700 transition"
              title="Cetak Laporan Konsolidasi Seluruh OPD NTB"
            >
              <Printer className="h-3.5 w-3.5 text-cyan-400" />
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
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-md shadow-cyan-950 transition active:scale-95"
              title="Import Data Excel untuk Nama OPD, Pagu Anggaran, dan Realisasi SP2D"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              <span>Import Excel OPD</span>
            </button>

            <button
              type="button"
              onClick={downloadOPDExcelTemplate}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-300 border border-slate-700 transition"
              title="Unduh Format Template Excel Import Seluruh OPD"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Template</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white shadow-md shadow-emerald-950 transition active:scale-95"
              title="Unduh Data Excel Rekapitulasi Seluruh OPD NTB"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Ekspor Rekap</span>
            </button>
          </div>
        </div>

        {/* Baris Pemilih Fokus OPD Aktif / Konsolidasi */}
        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-cyan-300 shrink-0 flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-cyan-400" />
              <span>Fokus OPD:</span>
            </span>
            <div className="relative min-w-[240px] max-w-sm">
              <select
                value={selectedOpdId}
                onChange={e => setSelectedOpdId(e.target.value)}
                className="w-full rounded-lg border border-cyan-500/40 bg-slate-950 py-1 pl-2.5 pr-7 text-xs font-semibold text-white focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
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
                className="rounded-md bg-slate-800 hover:bg-slate-700 px-2 py-1 text-[10px] font-semibold text-cyan-300 transition"
              >
                Reset ke Semua OPD
              </button>
            )}

            <button
              type="button"
              onClick={handleResetToDefaultOPD}
              className="rounded-md bg-slate-800/80 hover:bg-rose-900/40 hover:text-rose-200 px-2 py-1 text-[10px] font-semibold text-slate-400 border border-slate-700/60 transition"
              title="Kembalikan seluruh data daftar OPD ke standar awal 40 OPD NTB"
            >
              Reset ke 40 OPD Awal
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 shrink-0">
            <span className="text-slate-400">Status:</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2 py-0.5 rounded-full text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sinkron Kasda &amp; SIPD NTB</span>
            </span>
          </div>
        </div>
      </div>

      {/* Alert Banner Sukses Import */}
      {importStats && (
        <div className="flex items-center justify-between gap-2.5 p-2.5 px-3 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs shadow-md animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Import File Excel Berhasil! </span>
              <span className="text-[11px]">
                {importStats.total} baris diproses ({importStats.updated} OPD diperbarui, {importStats.added} OPD baru ditambahkan). Data tersimpan aman di browser.
              </span>
            </div>
          </div>
          <button
            onClick={() => setImportStats(null)}
            className="p-1 rounded-md hover:bg-emerald-900/50 text-emerald-300 transition"
            title="Tutup notifikasi"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 2. Navigasi Tab Menu Utama (Ukuran Ringkas) */}
      <div className="sticky top-16 z-20 flex overflow-x-auto gap-1.5 border-b border-slate-800/90 bg-slate-950/90 backdrop-blur-md pb-1.5 pt-0.5 scrollbar-none">
        {[
          { id: 'dashboard', label: 'Dashboard Eksekutif', icon: LayoutDashboard, badge: `${filteredOpds.length} OPD` },
          { id: 'master', label: 'Master OPD', icon: Database, badge: '40 SKPD' },
          { id: 'transaksi', label: 'Pagu & Realisasi', icon: FileSpreadsheet, badge: 'Anggaran' },
          { id: 'laporan', label: 'Pelaporan Konsolidasi', icon: FileText, badge: 'LRA / TW' },
          { id: 'analisis', label: 'Analisis & Ranking', icon: BarChart3, badge: 'Kinerja' },
          { id: 'pengaturan', label: 'Pengaturan Multi-OPD', icon: Settings, badge: 'Sistem' }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as PortalTab)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold transition whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950 border border-cyan-400'
                  : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[9px] font-semibold ${
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

      {/* 3. Ringkasan Eksekutif KPI Cards (Ukuran Ringkas & Kompak) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-2.5 lg:grid-cols-4">
        {/* Card 1: Total Pagu */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 sm:p-3 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
              {currentActiveOpd ? `Pagu ${currentActiveOpd.singkatan}` : 'Total Pagu APBD NTB'}
            </span>
            <div className="rounded-md bg-blue-500/10 p-1 text-blue-400 border border-blue-500/20">
              <DollarSign className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-0.5 text-base sm:text-lg font-black text-white">{formatRupiahSingkat(totalPaguDisplay)}</div>
          <div className="mt-0.5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Nominal:</span>
            <span className="font-mono text-slate-200">{formatRupiah(totalPaguDisplay)}</span>
          </div>
        </div>

        {/* Card 2: Total Realisasi SP2D */}
        <div className="rounded-xl border border-emerald-900/40 bg-gradient-to-br from-slate-900 via-emerald-950/20 to-slate-900 p-2.5 sm:p-3 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-400">
              {currentActiveOpd ? `Realisasi ${currentActiveOpd.singkatan}` : 'Total Realisasi Kasda'}
            </span>
            <div className="rounded-md bg-emerald-500/10 p-1 text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-0.5 text-base sm:text-lg font-black text-emerald-300">{formatRupiahSingkat(totalRealisasiDisplay)}</div>
          <div className="mt-0.5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Cair:</span>
            <span className="font-mono text-emerald-200">{formatRupiah(totalRealisasiDisplay)}</span>
          </div>
        </div>

        {/* Card 3: Sisa Pagu / SiLPA */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-2.5 sm:p-3 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
              Sisa Kas / Potensi SiLPA
            </span>
            <div className="rounded-md bg-amber-500/10 p-1 text-amber-400 border border-amber-500/20">
              <PieChart className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-0.5 text-base sm:text-lg font-black text-amber-300">{formatRupiahSingkat(totalSilpaDisplay)}</div>
          <div className="mt-0.5 flex items-center justify-between text-[10px] text-slate-400">
            <span>Belum Cair:</span>
            <span className="font-mono text-amber-200">{formatRupiah(totalSilpaDisplay)}</span>
          </div>
        </div>

        {/* Card 4: Persentase Serapan */}
        <div className="rounded-xl border border-cyan-900/40 bg-gradient-to-br from-slate-900 via-cyan-950/20 to-slate-900 p-2.5 sm:p-3 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[9.5px] font-bold uppercase tracking-wider text-cyan-400">
              Rata-rata Serapan
            </span>
            <div className="rounded-md bg-cyan-500/10 p-1 text-cyan-400 border border-cyan-500/20">
              <Award className="h-3.5 w-3.5" />
            </div>
          </div>
          <div className="mt-0.5 text-base sm:text-lg font-black text-cyan-300">
            {persentaseSerapanDisplay.toFixed(2)}%
          </div>
          <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-800">
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

      {/* TAB 1: DASHBOARD EKSEKUTIF OPD (UKURAN LEBIH KECIL & KOMPAK) */}
      {activeTab === 'dashboard' && (
        <div className="space-y-3">
          {/* Filter Bar & Layout Switcher Kompak */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 rounded-xl border border-slate-800 bg-slate-900/90 p-2 sm:p-2.5">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative flex-1 min-w-[180px] max-w-sm">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari OPD, singkatan, kode SKPD, Kepala..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 py-1 pl-8 pr-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              {/* Kategori Filter */}
              <select
                value={kategoriFilter}
                onChange={e => setKategoriFilter(e.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
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
                className="rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
              >
                <option value="ALL">Semua Kinerja</option>
                <option value="Sangat Tinggi">Kinerja Sangat Tinggi</option>
                <option value="Tinggi">Kinerja Tinggi</option>
                <option value="Sedang">Kinerja Sedang</option>
                <option value="Perlu Perhatian">Perlu Perhatian</option>
              </select>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Tampilan Switcher: Grid Kompak vs Tabel Kompak */}
              <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setDashboardLayout('grid')}
                  className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-md font-semibold transition ${
                    dashboardLayout === 'grid' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tampilan Grid Kartu Kompak"
                >
                  <LayoutGrid className="h-3 w-3" />
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDashboardLayout('table')}
                  className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded-md font-semibold transition ${
                    dashboardLayout === 'table' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Tampilan Tabel Data Ringkas"
                >
                  <List className="h-3 w-3" />
                  <span className="hidden sm:inline">Tabel</span>
                </button>
              </div>

              {/* Sorting */}
              <div className="flex items-center gap-1 rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setSortBy('serapan');
                    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
                  }}
                  className={`px-2 py-1 text-[10.5px] rounded-md font-semibold transition ${
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
                  className={`px-2 py-1 text-[10.5px] rounded-md font-semibold transition ${
                    sortBy === 'pagu' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pagu {sortBy === 'pagu' && (sortOrder === 'desc' ? '↓' : '↑')}
                </button>
              </div>
            </div>
          </div>

          {/* MODE 1: GRID KARTU OPD NTB (UKURAN LEBIH KECIL & KOMPAK) */}
          {dashboardLayout === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-2">
              {filteredOpds.map(opd => {
                const pct = (opd.realisasiSP2D / opd.targetPagu) * 100;
                const isSelected = selectedOpdId === opd.id;

                return (
                  <div
                    key={opd.id}
                    onClick={() => setSelectedOpdDetail(opd)}
                    className={`group relative rounded-xl border p-2.5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
                      isSelected
                        ? 'border-cyan-400 bg-slate-900 ring-2 ring-cyan-500/40'
                        : 'border-slate-800/90 bg-slate-900/80 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="rounded bg-cyan-950 px-1.5 py-0.2 text-[8.5px] font-bold text-cyan-300 border border-cyan-800/60 shrink-0">
                            {opd.kategori}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400 truncate">{opd.kodeOPD}</span>
                        </div>
                        <h3 className="mt-0.5 text-xs font-bold text-white group-hover:text-cyan-300 transition truncate leading-snug">
                          {opd.singkatan}
                        </h3>
                        <p className="text-[10px] text-slate-400 truncate">{opd.namaOPD}</p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-1.5 py-0.2 text-[9px] font-bold ${
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

                    {/* Progress Bar & Nominal Kompak */}
                    <div className="mt-2 space-y-0.5">
                      <div className="flex items-center justify-between text-[10.5px]">
                        <span className="text-slate-400 text-[10px]">Realisasi:</span>
                        <span className="font-bold text-emerald-400 font-mono">{formatRupiahSingkat(opd.realisasiSP2D)}</span>
                      </div>
                      <div className="h-1 w-full overflow-hidden rounded-full bg-slate-950">
                        <div
                          className={`h-full rounded-full transition-all ${
                            pct >= 80 ? 'bg-emerald-500' : pct >= 65 ? 'bg-cyan-500' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-400">
                        <span>Pagu: {formatRupiahSingkat(opd.targetPagu)}</span>
                        <span>Sisa: {formatRupiahSingkat(opd.targetPagu - opd.realisasiSP2D)}</span>
                      </div>
                    </div>

                    {/* Footer Card Kompak */}
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9.5px] text-slate-400">
                      <div className="flex items-center gap-1 truncate max-w-[130px]">
                        <UserCheck className="h-3 w-3 text-cyan-400 shrink-0" />
                        <span className="truncate">{opd.kepalaBadan}</span>
                      </div>
                      <span className="text-cyan-400 font-semibold group-hover:underline flex items-center gap-0.5 shrink-0">
                        <span>Detail</span>
                        <ChevronRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* MODE 2: TABEL RINGKAS OPD NTB (MAKSIMAL DATA DENSITY) */}
          {dashboardLayout === 'table' && (
            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-md">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/90 text-[10px] font-bold uppercase text-slate-300">
                  <tr>
                    <th className="p-2.5 text-center w-10">No</th>
                    <th className="p-2.5">Organisasi (OPD)</th>
                    <th className="p-2.5">Kategori</th>
                    <th className="p-2.5 text-right">Pagu APBD</th>
                    <th className="p-2.5 text-right">Realisasi Kasda</th>
                    <th className="p-2.5 text-center w-36">% Serapan</th>
                    <th className="p-2.5 text-right">Sisa Pagu</th>
                    <th className="p-2.5">Kepala Badan / Dinas</th>
                    <th className="p-2.5 text-center w-20">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {filteredOpds.map((opd, idx) => {
                    const pct = (opd.realisasiSP2D / opd.targetPagu) * 100;
                    const isSelected = selectedOpdId === opd.id;
                    return (
                      <tr
                        key={opd.id}
                        onClick={() => setSelectedOpdDetail(opd)}
                        className={`hover:bg-slate-800/50 cursor-pointer transition ${
                          isSelected ? 'bg-cyan-950/30' : ''
                        }`}
                      >
                        <td className="p-2 text-center text-slate-400 font-bold text-[11px]">{idx + 1}</td>
                        <td className="p-2">
                          <div className="font-bold text-white text-xs hover:text-cyan-300 transition truncate max-w-xs">
                            {opd.singkatan}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-xs">{opd.namaOPD}</div>
                          <div className="text-[9px] font-mono text-cyan-400/80">{opd.kodeOPD}</div>
                        </td>
                        <td className="p-2">
                          <span className="rounded bg-cyan-950/80 px-1.5 py-0.5 text-[9px] font-bold text-cyan-300 border border-cyan-800/60 whitespace-nowrap">
                            {opd.kategori}
                          </span>
                        </td>
                        <td className="p-2 text-right font-mono text-slate-200 text-xs font-semibold whitespace-nowrap">
                          {formatRupiah(opd.targetPagu)}
                        </td>
                        <td className="p-2 text-right font-mono text-emerald-400 text-xs font-bold whitespace-nowrap">
                          {formatRupiah(opd.realisasiSP2D)}
                        </td>
                        <td className="p-2 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            <span
                              className={`text-[10.5px] font-bold ${
                                pct >= 80 ? 'text-emerald-400' : pct >= 65 ? 'text-cyan-400' : 'text-amber-400'
                              }`}
                            >
                              {pct.toFixed(1)}%
                            </span>
                            <div className="w-16 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  pct >= 80 ? 'bg-emerald-500' : pct >= 65 ? 'bg-cyan-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-2 text-right font-mono text-amber-300/90 text-xs whitespace-nowrap">
                          {formatRupiah(opd.targetPagu - opd.realisasiSP2D)}
                        </td>
                        <td className="p-2 text-[10.5px] text-slate-300 truncate max-w-[160px]">
                          {opd.kepalaBadan}
                        </td>
                        <td className="p-2 text-center" onClick={e => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedOpdDetail(opd)}
                            className="rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white px-2 py-1 text-[10px] font-bold border border-cyan-500/40 transition"
                          >
                            Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MASTER DATA SELURUH OPD */}
      {activeTab === 'master' && (
        <div className="space-y-4">
          {/* Master Success Alert Banner */}
          {masterImportSuccessMsg && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs shadow-lg animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white">Import Master OPD Berhasil Diterapkan! </span>
                  <span className="text-[11.5px] text-emerald-200">{masterImportSuccessMsg}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMasterImportSuccessMsg(null)}
                className="p-1 rounded-md text-emerald-400 hover:text-white hover:bg-emerald-900/50 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Master Control Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5 rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 sm:p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20 shrink-0">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-extrabold text-white">Katalog Master OPD, Anggaran, Realisasi &amp; Kode Rekening</h2>
                <p className="text-xs text-slate-400">
                  Pengelolaan 40 SKPD Pemprov NTB, Pagu Anggaran Murni/Perubahan, Realisasi SP2D Kasda, dan Master Rekening Belanja SIPD
                </p>
              </div>
            </div>

            {/* Action Buttons: Import Excel, Template, Tambah OPD */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <input
                type="file"
                ref={masterFileInputRef}
                onChange={handleMasterFileUpload}
                accept=".xlsx,.xls,.csv"
                className="hidden"
              />

              <button
                type="button"
                onClick={() => setShowMasterImportModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-cyan-950 transition active:scale-95"
                title="Import File Excel Anggaran, Realisasi, dan Kode Rekening Belanja Master OPD"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Import Excel Master</span>
              </button>

              {/* Template Download Dropdown / Buttons */}
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => handleDownloadMasterTemplate('all')}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-cyan-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  title="Unduh Format Excel Lengkap 3-in-1 (Anggaran, Realisasi, Kode Rekening)"
                >
                  <Download className="h-3 w-3" />
                  <span className="hidden sm:inline">Template Lengkap</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadMasterTemplate('anggaran')}
                  className="px-2 py-1.5 text-[10.5px] font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  title="Unduh Template Excel Khusus Pagu Anggaran"
                >
                  Anggaran
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadMasterTemplate('realisasi')}
                  className="px-2 py-1.5 text-[10.5px] font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  title="Unduh Template Excel Khusus Realisasi Kasda / SP2D"
                >
                  Realisasi
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadMasterTemplate('rekening')}
                  className="px-2 py-1.5 text-[10.5px] font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  title="Unduh Template Excel Khusus Master Kode Rekening Belanja"
                >
                  Rekening
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowAddOpdModal(true)}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 border border-slate-700 transition active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah OPD</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Menu di Dalam Master OPD */}
          <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-2">
            {[
              { id: 'daftar-opd', label: 'Daftar SKPD & Organisasi', icon: Building2, badge: `${filteredOpds.length} OPD` },
              { id: 'kode-rekening', label: 'Master Kode Rekening Belanja', icon: Tag, badge: `${allMasterRekeningList.length} Akun` },
              { id: 'program-kegiatan', label: 'Master Program & Kegiatan OPD', icon: FolderKanban, badge: `${allMasterProgramList.length} Program` }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = masterSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setMasterSubTab(tab.id as any)}
                  className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950 border border-cyan-400'
                      : 'bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-cyan-400'}`} />
                  <span>{tab.label}</span>
                  <span
                    className={`rounded-full px-2 py-0.2 text-[10px] font-semibold ${
                      isActive ? 'bg-cyan-700 text-cyan-100' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SUBTAB 1: DAFTAR 40 SKPD NTB */}
          {masterSubTab === 'daftar-opd' && (
            <div className="space-y-3">
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-md">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950/90 text-[10.5px] font-bold uppercase text-slate-300">
                    <tr>
                      <th className="p-3 text-center w-12">No</th>
                      <th className="p-3">Kode SKPD / OPD</th>
                      <th className="p-3">Nama Organisasi &amp; Singkatan</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3">Kepala Badan / Dinas &amp; NIP</th>
                      <th className="p-3 text-right">Pagu TA {selectedTahun}</th>
                      <th className="p-3 text-right">Realisasi SP2D</th>
                      <th className="p-3 text-center">% Serapan</th>
                      <th className="p-3 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredOpds.map((item, index) => {
                      const pct = item.targetPagu > 0 ? (item.realisasiSP2D / item.targetPagu) * 100 : 0;
                      return (
                        <tr key={item.id} className="hover:bg-slate-800/50 transition">
                          <td className="p-3 text-center font-bold text-slate-400">{index + 1}</td>
                          <td className="p-3 font-mono text-cyan-300 font-semibold">{item.kodeOPD}</td>
                          <td className="p-3">
                            <div className="font-bold text-white text-xs">{item.namaOPD}</div>
                            <div className="text-[11px] text-cyan-400 font-semibold">{item.singkatan}</div>
                          </td>
                          <td className="p-3">
                            <span className="rounded-md bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700">
                              {item.kategori}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="font-semibold text-slate-200">{item.kepalaBadan}</div>
                            <div className="font-mono text-[10.5px] text-slate-400">NIP. {item.nipKepala}</div>
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-200">
                            {formatRupiah(item.targetPagu)}
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-emerald-400">
                            {formatRupiah(item.realisasiSP2D)}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                pct >= 80
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : pct >= 65
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              }`}
                            >
                              {pct.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => setSelectedOpdDetail(item)}
                              className="rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1 text-[11px] font-semibold text-cyan-300 transition"
                            >
                              Buka Detail
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SUBTAB 2: MASTER KODE REKENING BELANJA (KONSOLIDASI & PER OPD) */}
          {masterSubTab === 'kode-rekening' && (
            <div className="space-y-3">
              {/* Ringkasan Statistik Rekening */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Akun Terdaftar</span>
                  <div className="text-lg font-black text-white mt-0.5">{allMasterRekeningList.length} Akun</div>
                  <span className="text-[10px] text-cyan-400">Terdistribusi di 40 OPD</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Pagu Rekening</span>
                  <div className="text-lg font-black text-white mt-0.5">
                    {formatRupiahSingkat(filteredMasterRekeningList.reduce((acc, r) => acc + (r.pagu || 0), 0))}
                  </div>
                  <span className="text-[10px] text-slate-400">APBD Murni &amp; Perubahan</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Total Realisasi SP2D</span>
                  <div className="text-lg font-black text-emerald-300 mt-0.5">
                    {formatRupiahSingkat(filteredMasterRekeningList.reduce((acc, r) => acc + (r.realisasi || 0), 0))}
                  </div>
                  <span className="text-[10px] text-emerald-400">Cair Kasda NTB</span>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Sisa Pagu Rekening</span>
                  <div className="text-lg font-black text-amber-300 mt-0.5">
                    {formatRupiahSingkat(
                      filteredMasterRekeningList.reduce((acc, r) => acc + (r.pagu - r.realisasi), 0)
                    )}
                  </div>
                  <span className="text-[10px] text-amber-400">Belum Dicairkan</span>
                </div>
              </div>

              {/* Filter Bar Rekening */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-xl border border-slate-800 bg-slate-900/90 p-2.5">
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Cari kode rekening 5.x.xx, uraian, atau OPD..."
                      value={masterRekeningSearch}
                      onChange={e => setMasterRekeningSearch(e.target.value)}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
                    />
                  </div>

                  <select
                    value={masterJenisBelanjaFilter}
                    onChange={e => setMasterJenisBelanjaFilter(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="ALL">Semua Jenis Belanja</option>
                    <option value="Belanja Pegawai">Belanja Pegawai</option>
                    <option value="Belanja Barang dan Jasa">Belanja Barang &amp; Jasa</option>
                    <option value="Belanja Modal">Belanja Modal</option>
                    <option value="Belanja Tidak Terduga">Belanja Tidak Terduga</option>
                    <option value="Belanja Transfer">Belanja Transfer</option>
                  </select>

                  <select
                    value={masterOpdFilter}
                    onChange={e => setMasterOpdFilter(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none max-w-[220px]"
                  >
                    <option value="ALL">Semua Satuan Kerja (40 OPD)</option>
                    {opdListState.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.singkatan} - {o.namaOPD}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setMasterImportCategory('rekening');
                      setShowMasterImportModal(true);
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 px-3 py-1.5 text-xs font-bold text-white transition active:scale-95"
                  >
                    <UploadCloud className="h-3.5 w-3.5" />
                    <span>Import Rekening</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadMasterTemplate('rekening')}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-xs font-semibold text-cyan-300 border border-slate-700 transition"
                  >
                    <Download className="h-3 w-3" />
                    <span>Template</span>
                  </button>
                </div>
              </div>

              {/* Tabel Master Kode Rekening Belanja */}
              <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900 shadow-md">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950/90 text-[10.5px] font-bold uppercase text-slate-300">
                    <tr>
                      <th className="p-2.5 text-center w-10">No</th>
                      <th className="p-2.5">Kode Rekening</th>
                      <th className="p-2.5">Uraian Rekening Belanja</th>
                      <th className="p-2.5">Jenis Belanja</th>
                      <th className="p-2.5">Satuan Kerja (OPD)</th>
                      <th className="p-2.5 text-right">Pagu Anggaran</th>
                      <th className="p-2.5 text-right">Realisasi SP2D</th>
                      <th className="p-2.5 text-center w-28">% Serapan</th>
                      <th className="p-2.5 text-right">Sisa Pagu</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredMasterRekeningList.slice(0, 100).map((b, idx) => {
                      const pct = b.pagu > 0 ? (b.realisasi / b.pagu) * 100 : 0;
                      return (
                        <tr key={b.id || idx} className="hover:bg-slate-800/40 transition">
                          <td className="p-2.5 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-2.5 font-mono text-cyan-300 font-bold whitespace-nowrap">
                            {b.kodeBelanja}
                          </td>
                          <td className="p-2.5 font-semibold text-white max-w-sm truncate">
                            {b.namaBelanja}
                          </td>
                          <td className="p-2.5 whitespace-nowrap">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[9.5px] font-semibold border ${
                                b.jenisBelanja?.includes('Pegawai')
                                  ? 'bg-blue-950/80 text-blue-300 border-blue-800'
                                  : b.jenisBelanja?.includes('Barang')
                                  ? 'bg-cyan-950/80 text-cyan-300 border-cyan-800'
                                  : b.jenisBelanja?.includes('Modal')
                                  ? 'bg-purple-950/80 text-purple-300 border-purple-800'
                                  : b.jenisBelanja?.includes('Transfer')
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                  : 'bg-amber-950/80 text-amber-300 border-amber-800'
                              }`}
                            >
                              {b.jenisBelanja}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-300 whitespace-nowrap">
                            <span className="font-bold text-white">{b.singkatan}</span>
                          </td>
                          <td className="p-2.5 text-right font-mono font-semibold text-slate-200 whitespace-nowrap">
                            {formatRupiah(b.pagu)}
                          </td>
                          <td className="p-2.5 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                            {formatRupiah(b.realisasi)}
                          </td>
                          <td className="p-2.5 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <span
                                className={`text-[10.5px] font-bold ${
                                  pct >= 80 ? 'text-emerald-400' : pct >= 65 ? 'text-cyan-400' : 'text-amber-400'
                                }`}
                              >
                                {pct.toFixed(1)}%
                              </span>
                              <div className="w-12 h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    pct >= 80 ? 'bg-emerald-500' : pct >= 65 ? 'bg-cyan-500' : 'bg-amber-500'
                                  }`}
                                  style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="p-2.5 text-right font-mono text-amber-300 text-xs whitespace-nowrap">
                            {formatRupiah(b.pagu - b.realisasi)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filteredMasterRekeningList.length > 100 && (
                <p className="text-center text-xs text-slate-400 italic">
                  Menampilkan 100 dari total {filteredMasterRekeningList.length} akun rekening belanja. Gunakan filter pencarian untuk mempersempit data.
                </p>
              )}
            </div>
          )}

          {/* SUBTAB 3: MASTER PROGRAM & KEGIATAN OPD */}
          {masterSubTab === 'program-kegiatan' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/90 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Filter OPD:</span>
                  <select
                    value={masterOpdFilter}
                    onChange={e => setMasterOpdFilter(e.target.value)}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs text-slate-300 focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="ALL">Semua Satuan Kerja (40 OPD)</option>
                    {opdListState.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.singkatan} - {o.namaOPD}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-xs text-slate-400">
                  Total <span className="font-bold text-white">{allMasterProgramList.length}</span> Program Prioritas Terdaftar
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allMasterProgramList.slice(0, 40).map((p, idx) => {
                  const pct = p.pagu > 0 ? (p.realisasi / p.pagu) * 100 : 0;
                  return (
                    <div key={p.id || idx} className="rounded-xl border border-slate-800 bg-slate-900/90 p-3.5 space-y-2.5 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="rounded bg-cyan-950 px-2 py-0.5 text-[9px] font-bold text-cyan-300 border border-cyan-800/60 font-mono">
                              {p.kodeProgram}
                            </span>
                            <span className="text-[10.5px] font-bold text-white bg-slate-800 px-2 py-0.5 rounded">
                              {p.singkatan}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-white mt-1 leading-snug">{p.namaProgram}</h4>
                          <p className="text-[10px] text-slate-400 truncate">{p.namaOPD}</p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold shrink-0 ${
                            pct >= 80 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-cyan-500/20 text-cyan-300'
                          }`}
                        >
                          {pct.toFixed(1)}%
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Pagu Program:</span>
                          <span className="font-bold font-mono text-slate-200">{formatRupiah(p.pagu)}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px]">Realisasi SP2D:</span>
                          <span className="font-bold font-mono text-emerald-400">{formatRupiah(p.realisasi)}</span>
                        </div>
                      </div>

                      {p.kegiatans && p.kegiatans.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/80">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Rincian Kegiatan ({p.kegiatans.length} Kegiatan):
                          </span>
                          <div className="space-y-1">
                            {p.kegiatans.map((k: any) => (
                              <div key={k.id} className="flex items-center justify-between text-[10.5px] text-slate-300 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800/60">
                                <div className="truncate max-w-[240px]">
                                  <span className="font-mono text-cyan-400 font-semibold mr-1">{k.kodeKegiatan}</span>
                                  <span>{k.namaKegiatan}</span>
                                </div>
                                <span className="font-mono text-emerald-400 font-semibold shrink-0">
                                  {formatRupiahSingkat(k.realisasi)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
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

      {/* TAB 4: PELAPORAN KEUANGAN KONSOLIDASI & REALISASI MULTI-OPD */}
      {activeTab === 'laporan' && (
        <div className="space-y-6">
          {/* Laporan Action Notification Banner */}
          {laporanActionSuccessMsg && (
            <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-emerald-950/90 border border-emerald-500/60 text-emerald-200 text-xs shadow-lg animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white">Sukses Pelaporan: </span>
                  <span className="text-[11.5px] text-emerald-200">{laporanActionSuccessMsg}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLaporanActionSuccessMsg(null)}
                className="p-1 rounded-md text-emerald-400 hover:text-white hover:bg-emerald-900/50 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* 1. Bar Pemilih OPD untuk Laporan */}
          <div className="rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 p-4 md:p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-cyan-500/20 p-2.5 text-cyan-300 border border-cyan-500/40 shrink-0">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                  Fokus Pelaporan Berdasarkan Nama OPD:
                </span>
                <div className="text-sm md:text-base font-extrabold text-white">
                  {targetLaporanOpd ? targetLaporanOpd.namaOPD : 'Seluruh OPD NTB'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[260px] sm:min-w-[320px]">
                <select
                  value={laporanOpdId}
                  onChange={e => setLaporanOpdId(e.target.value)}
                  className="w-full rounded-xl border border-cyan-500/50 bg-slate-950 py-2.5 pl-3 pr-8 text-xs font-bold text-cyan-200 focus:border-cyan-400 focus:outline-none shadow-inner"
                >
                  <option value="ALL">🌐 KONSOLIDASI SELURUH OPD PROVINSI NTB (40 OPD)</option>
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

              {laporanOpdId !== 'ALL' && (
                <button
                  type="button"
                  onClick={() => setLaporanOpdId('ALL')}
                  className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-bold text-cyan-300 border border-slate-700 transition"
                >
                  Lihat Semua OPD
                </button>
              )}
            </div>
          </div>

          {/* Quick Metrics OPD Terpilih */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-slate-900/90 p-3.5 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-slate-400">Pagu Anggaran ({targetLaporanOpd?.singkatan || 'OPD'})</span>
              <div className="text-sm md:text-base font-mono font-bold text-white mt-1">
                {formatRupiah(targetLaporanOpd?.targetPagu || totalPaguDisplay)}
              </div>
            </div>
            <div className="rounded-xl bg-slate-900/90 p-3.5 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-emerald-400">Realisasi SP2D Cair</span>
              <div className="text-sm md:text-base font-mono font-bold text-emerald-300 mt-1">
                {formatRupiah(targetLaporanOpd?.realisasiSP2D || totalRealisasiDisplay)}
              </div>
            </div>
            <div className="rounded-xl bg-slate-900/90 p-3.5 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-amber-400">Sisa Pagu / SiLPA</span>
              <div className="text-sm md:text-base font-mono font-bold text-amber-300 mt-1">
                {formatRupiah((targetLaporanOpd?.targetPagu || totalPaguDisplay) - (targetLaporanOpd?.realisasiSP2D || totalRealisasiDisplay))}
              </div>
            </div>
            <div className="rounded-xl bg-slate-900/90 p-3.5 border border-slate-800">
              <span className="text-[10px] font-bold uppercase text-cyan-400">% Realisasi Serapan</span>
              <div className="text-sm md:text-base font-mono font-bold text-cyan-300 mt-1">
                {(((targetLaporanOpd?.realisasiSP2D || totalRealisasiDisplay) / (targetLaporanOpd?.targetPagu || totalPaguDisplay)) * 100).toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Sub Navigation Pelaporan */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto scrollbar-none">
              {[
                { id: 'per-program', label: 'Laporan per Program' },
                { id: 'per-kegiatan', label: 'Laporan per Kegiatan' },
                { id: 'per-subkegiatan', label: 'Laporan per Sub Kegiatan' },
                { id: 'per-belanja', label: 'Laporan per Rekening Belanja' },
                { id: 'hirarki', label: 'Hirarki Lengkap (Prog ➔ Keg ➔ Sub ➔ Bel)' },
                { id: 'rekap-opd', label: 'Rekapitulasi 40 OPD' },
                { id: 'triwulan', label: 'Laporan Triwulan' },
                { id: 'semester', label: 'Laporan Semester & SiLPA' }
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

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-xl bg-cyan-700/80 hover:bg-cyan-600 px-3 py-2 text-xs font-bold text-white shadow transition"
                title="Import File Excel Baru untuk OPD, Anggaran dan Realisasi"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Import Excel OPD</span>
              </button>

              {/* Template Download Shortcuts */}
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={downloadAnggaranExcelTemplate}
                  className="px-2 py-1 text-[10.5px] font-semibold text-cyan-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  title="Unduh Format Excel Template Anggaran Seluruh OPD (Sesuai Kolom M6 s.d X)"
                >
                  Template Anggaran
                </button>
                <button
                  type="button"
                  onClick={downloadRealisasiExcelTemplate}
                  className="px-2 py-1 text-[10.5px] font-semibold text-emerald-300 hover:text-white rounded-lg hover:bg-slate-800 transition"
                  title="Unduh Format Excel Template Realisasi Seluruh OPD (Sesuai Kolom M6 s.d X)"
                >
                  Template Realisasi
                </button>
                <button
                  type="button"
                  onClick={downloadSIPDColumnMtoXTemplate}
                  className="px-2 py-1 text-[10.5px] font-semibold text-amber-300 hover:text-white rounded-lg hover:bg-slate-800 transition hidden sm:inline"
                  title="Unduh Format SIPD Kolom A s.d X Dimulai dari Baris M6"
                >
                  SIPD (M6..X)
                </button>
              </div>

              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-200 border border-slate-700 transition"
              >
                <Printer className="h-3.5 w-3.5 text-cyan-400" />
                <span>Cetak Lembar Resmi</span>
              </button>
              <button
                type="button"
                onClick={handleExportActiveReportExcel}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 text-xs font-bold text-white shadow-lg shadow-emerald-950 transition active:scale-95"
                title="Download Data Laporan yang Sedang Terbuka ke Format Excel (.xlsx)"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Ekspor Excel Laporan Ini</span>
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
                  <h3 className="text-sm md:text-base font-extrabold text-cyan-300 uppercase">
                    {laporanSubTab === 'rekap-opd' && 'LAPORAN REKAPITULASI REALISASI ANGGARAN SELURUH OPD'}
                    {laporanSubTab === 'per-program' && `LAPORAN REALISASI ANGGARAN PER PROGRAM - ${targetLaporanOpd?.namaOPD.toUpperCase()}`}
                    {laporanSubTab === 'per-kegiatan' && `LAPORAN REALISASI ANGGARAN PER KEGIATAN - ${targetLaporanOpd?.namaOPD.toUpperCase()}`}
                    {laporanSubTab === 'per-subkegiatan' && `LAPORAN REALISASI ANGGARAN PER SUB KEGIATAN - ${targetLaporanOpd?.namaOPD.toUpperCase()}`}
                    {laporanSubTab === 'per-belanja' && `LAPORAN REALISASI ANGGARAN PER REKENING BELANJA - ${targetLaporanOpd?.namaOPD.toUpperCase()}`}
                    {laporanSubTab === 'hirarki' && `LAPORAN STRUKTUR HIRARKI PROGRAM, KEGIATAN & BELANJA - ${targetLaporanOpd?.namaOPD.toUpperCase()}`}
                    {laporanSubTab === 'triwulan' && `LAPORAN REALISASI ANGGARAN TRIWULAN (TW I - IV) - ${targetLaporanOpd?.namaOPD.toUpperCase()}`}
                    {laporanSubTab === 'semester' && `LAPORAN REALISASI ANGGARAN SEMESTER & EVALUASI SiLPA - ${targetLaporanOpd?.namaOPD.toUpperCase()}`}
                  </h3>
                  <p className="text-xs text-slate-400">
                    TAHUN ANGGARAN {selectedTahun} | PERIODE BERJALAN S.D BULAN DESEMBER {selectedTahun}
                  </p>
                </div>
              </div>
            </div>

            {/* TABEL 1: LAPORAN PER PROGRAM */}
            {laporanSubTab === 'per-program' && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-700 bg-slate-950/80 text-[11px] font-bold uppercase text-slate-300">
                    <tr>
                      <th className="p-3 text-center w-12">No</th>
                      <th className="p-3">Kode Program</th>
                      <th className="p-3">Nama Nomenklatur Program</th>
                      {laporanOpdId === 'ALL' && <th className="p-3">OPD Pengampu</th>}
                      <th className="p-3 text-right">Pagu Anggaran (Rp)</th>
                      <th className="p-3 text-right">Realisasi SP2D (Rp)</th>
                      <th className="p-3 text-right">Sisa Pagu (Rp)</th>
                      <th className="p-3 text-center">% Realisasi</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center print:hidden">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-sans">
                    {activeReportPrograms.map((prog: any, idx: number) => {
                      const serapan = prog.pagu > 0 ? (prog.realisasi / prog.pagu) * 100 : 0;
                      const sisa = prog.pagu - prog.realisasi;
                      return (
                        <tr key={prog.id || idx} className="hover:bg-slate-800/40">
                          <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-3 font-mono text-cyan-300 font-semibold">{prog.kodeProgram}</td>
                          <td className="p-3 font-bold text-white">{prog.namaProgram}</td>
                          {laporanOpdId === 'ALL' && (
                            <td className="p-3 font-semibold text-cyan-400">{prog.namaOPD}</td>
                          )}
                          <td className="p-3 text-right font-mono text-slate-200">{formatRupiah(prog.pagu)}</td>
                          <td className="p-3 text-right font-mono text-emerald-400 font-bold">{formatRupiah(prog.realisasi)}</td>
                          <td className="p-3 text-right font-mono text-amber-300">{formatRupiah(sisa)}</td>
                          <td className="p-3 text-center font-bold">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                              serapan >= 80 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              serapan >= 65 ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                              'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {serapan.toFixed(2)}%
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                              {serapan >= 80 ? 'Sangat Tinggi' : serapan >= 65 ? 'Tinggi' : 'Sedang'}
                            </span>
                          </td>
                          <td className="p-3 text-center print:hidden whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditLaporanModal({
                                  type: 'program',
                                  opdId: prog.opdId || laporanOpdId,
                                  namaOPD: prog.namaOPD || targetLaporanOpd?.namaOPD,
                                  data: {
                                    id: prog.id,
                                    kodeProgram: prog.kodeProgram,
                                    namaProgram: prog.namaProgram,
                                    pagu: prog.pagu,
                                    realisasi: prog.realisasi
                                  }
                                })}
                                className="p-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-800 text-cyan-300 hover:text-white border border-cyan-700/60 transition shadow-sm"
                                title="Edit Program"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteLaporanModal({
                                  type: 'program',
                                  opdId: prog.opdId || laporanOpdId,
                                  namaOPD: prog.namaOPD || targetLaporanOpd?.namaOPD,
                                  id: prog.id,
                                  kode: prog.kodeProgram,
                                  nama: prog.namaProgram,
                                  nominal: prog.pagu
                                })}
                                className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-800 text-rose-300 hover:text-white border border-rose-700/60 transition shadow-sm"
                                title="Hapus Program"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-600 bg-slate-950 font-black text-xs">
                    <tr>
                      <td colSpan={laporanOpdId === 'ALL' ? 4 : 3} className="p-3.5 text-right uppercase text-slate-300">
                        TOTAL KESELURUHAN PROGRAM:
                      </td>
                      <td className="p-3.5 text-right font-mono text-white">
                        {formatRupiah(activeReportPrograms.reduce((s: number, p: any) => s + p.pagu, 0))}
                      </td>
                      <td className="p-3.5 text-right font-mono text-emerald-400">
                        {formatRupiah(activeReportPrograms.reduce((s: number, p: any) => s + p.realisasi, 0))}
                      </td>
                      <td className="p-3.5 text-right font-mono text-amber-400">
                        {formatRupiah(activeReportPrograms.reduce((s: number, p: any) => s + (p.pagu - p.realisasi), 0))}
                      </td>
                      <td className="p-3.5 text-center font-mono text-cyan-400">
                        {(() => {
                          const totP = activeReportPrograms.reduce((s: number, p: any) => s + p.pagu, 0);
                          const totR = activeReportPrograms.reduce((s: number, p: any) => s + p.realisasi, 0);
                          return totP > 0 ? `${((totR / totP) * 100).toFixed(2)}%` : '0.00%';
                        })()}
                      </td>
                      <td className="p-3.5" />
                      <td className="p-3.5 print:hidden" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* TABEL 2: LAPORAN PER KEGIATAN */}
            {laporanSubTab === 'per-kegiatan' && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-700 bg-slate-950/80 text-[11px] font-bold uppercase text-slate-300">
                    <tr>
                      <th className="p-3 text-center w-12">No</th>
                      <th className="p-3">Kode Kegiatan</th>
                      <th className="p-3">Nama Kegiatan</th>
                      <th className="p-3">Kode Program Induk</th>
                      {laporanOpdId === 'ALL' && <th className="p-3">OPD</th>}
                      <th className="p-3 text-right">Pagu Kegiatan (Rp)</th>
                      <th className="p-3 text-right">Realisasi SP2D (Rp)</th>
                      <th className="p-3 text-right">Sisa Pagu (Rp)</th>
                      <th className="p-3 text-center">% Realisasi</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center print:hidden">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-sans">
                    {activeReportKegiatans.map((keg: any, idx: number) => {
                      const serapan = keg.pagu > 0 ? (keg.realisasi / keg.pagu) * 100 : 0;
                      const sisa = keg.pagu - keg.realisasi;
                      return (
                        <tr key={keg.id || idx} className="hover:bg-slate-800/40">
                          <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-3 font-mono text-cyan-300 font-semibold">{keg.kodeKegiatan}</td>
                          <td className="p-3 font-bold text-white">{keg.namaKegiatan}</td>
                          <td className="p-3 font-mono text-slate-400">{keg.kodeProgram}</td>
                          {laporanOpdId === 'ALL' && (
                            <td className="p-3 font-semibold text-cyan-400">{keg.namaOPD}</td>
                          )}
                          <td className="p-3 text-right font-mono text-slate-200">{formatRupiah(keg.pagu)}</td>
                          <td className="p-3 text-right font-mono text-emerald-400 font-bold">{formatRupiah(keg.realisasi)}</td>
                          <td className="p-3 text-right font-mono text-amber-300">{formatRupiah(sisa)}</td>
                          <td className="p-3 text-center font-bold">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                              serapan >= 80 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              serapan >= 65 ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                              'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {serapan.toFixed(2)}%
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                              {serapan >= 80 ? 'Sangat Tinggi' : serapan >= 65 ? 'Tinggi' : 'Sedang'}
                            </span>
                          </td>
                          <td className="p-3 text-center print:hidden whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditLaporanModal({
                                  type: 'kegiatan',
                                  opdId: keg.opdId || laporanOpdId,
                                  namaOPD: keg.namaOPD || targetLaporanOpd?.namaOPD,
                                  data: {
                                    id: keg.id,
                                    kodeKegiatan: keg.kodeKegiatan,
                                    namaKegiatan: keg.namaKegiatan,
                                    kodeProgram: keg.kodeProgram,
                                    pagu: keg.pagu,
                                    realisasi: keg.realisasi
                                  }
                                })}
                                className="p-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-800 text-cyan-300 hover:text-white border border-cyan-700/60 transition shadow-sm"
                                title="Edit Kegiatan"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteLaporanModal({
                                  type: 'kegiatan',
                                  opdId: keg.opdId || laporanOpdId,
                                  namaOPD: keg.namaOPD || targetLaporanOpd?.namaOPD,
                                  id: keg.id,
                                  kode: keg.kodeKegiatan,
                                  nama: keg.namaKegiatan,
                                  nominal: keg.pagu
                                })}
                                className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-800 text-rose-300 hover:text-white border border-rose-700/60 transition shadow-sm"
                                title="Hapus Kegiatan"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-600 bg-slate-950 font-black text-xs">
                    <tr>
                      <td colSpan={laporanOpdId === 'ALL' ? 5 : 4} className="p-3.5 text-right uppercase text-slate-300">
                        TOTAL KESELURUHAN KEGIATAN:
                      </td>
                      <td className="p-3.5 text-right font-mono text-white">
                        {formatRupiah(activeReportKegiatans.reduce((s: number, k: any) => s + k.pagu, 0))}
                      </td>
                      <td className="p-3.5 text-right font-mono text-emerald-400">
                        {formatRupiah(activeReportKegiatans.reduce((s: number, k: any) => s + k.realisasi, 0))}
                      </td>
                      <td className="p-3.5 text-right font-mono text-amber-400">
                        {formatRupiah(activeReportKegiatans.reduce((s: number, k: any) => s + (k.pagu - k.realisasi), 0))}
                      </td>
                      <td className="p-3.5 text-center font-mono text-cyan-400">
                        {(() => {
                          const totP = activeReportKegiatans.reduce((s: number, k: any) => s + k.pagu, 0);
                          const totR = activeReportKegiatans.reduce((s: number, k: any) => s + k.realisasi, 0);
                          return totP > 0 ? `${((totR / totP) * 100).toFixed(2)}%` : '0.00%';
                        })()}
                      </td>
                      <td className="p-3.5" />
                      <td className="p-3.5 print:hidden" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* TABEL 3: LAPORAN PER SUB KEGIATAN */}
            {laporanSubTab === 'per-subkegiatan' && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-700 bg-slate-950/80 text-[11px] font-bold uppercase text-slate-300">
                    <tr>
                      <th className="p-3 text-center w-12">No</th>
                      <th className="p-3">Kode Sub Kegiatan</th>
                      <th className="p-3">Nama Sub Kegiatan</th>
                      <th className="p-3">Kode Kegiatan Induk</th>
                      {laporanOpdId === 'ALL' && <th className="p-3">OPD</th>}
                      <th className="p-3 text-right">Pagu Sub Kegiatan (Rp)</th>
                      <th className="p-3 text-right">Realisasi SP2D (Rp)</th>
                      <th className="p-3 text-right">Sisa Pagu (Rp)</th>
                      <th className="p-3 text-center">% Realisasi</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center print:hidden">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-sans">
                    {activeReportSubKegiatans.map((sub: any, idx: number) => {
                      const serapan = sub.pagu > 0 ? (sub.realisasi / sub.pagu) * 100 : 0;
                      const sisa = sub.pagu - sub.realisasi;
                      return (
                        <tr key={sub.id || idx} className="hover:bg-slate-800/40">
                          <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-3 font-mono text-cyan-300 font-semibold">{sub.kodeSub}</td>
                          <td className="p-3 font-bold text-white">{sub.namaSub}</td>
                          <td className="p-3 font-mono text-slate-400">{sub.kodeKegiatan}</td>
                          {laporanOpdId === 'ALL' && (
                            <td className="p-3 font-semibold text-cyan-400">{sub.namaOPD}</td>
                          )}
                          <td className="p-3 text-right font-mono text-slate-200">{formatRupiah(sub.pagu)}</td>
                          <td className="p-3 text-right font-mono text-emerald-400 font-bold">{formatRupiah(sub.realisasi)}</td>
                          <td className="p-3 text-right font-mono text-amber-300">{formatRupiah(sisa)}</td>
                          <td className="p-3 text-center font-bold">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                              serapan >= 80 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              serapan >= 65 ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                              'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {serapan.toFixed(2)}%
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                              {serapan >= 80 ? 'Sangat Tinggi' : serapan >= 65 ? 'Tinggi' : 'Sedang'}
                            </span>
                          </td>
                          <td className="p-3 text-center print:hidden whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditLaporanModal({
                                  type: 'subkegiatan',
                                  opdId: sub.opdId || laporanOpdId,
                                  namaOPD: sub.namaOPD || targetLaporanOpd?.namaOPD,
                                  data: {
                                    id: sub.id,
                                    kodeSub: sub.kodeSub,
                                    namaSub: sub.namaSub,
                                    kodeKegiatan: sub.kodeKegiatan,
                                    pagu: sub.pagu,
                                    realisasi: sub.realisasi
                                  }
                                })}
                                className="p-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-800 text-cyan-300 hover:text-white border border-cyan-700/60 transition shadow-sm"
                                title="Edit Sub Kegiatan"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteLaporanModal({
                                  type: 'subkegiatan',
                                  opdId: sub.opdId || laporanOpdId,
                                  namaOPD: sub.namaOPD || targetLaporanOpd?.namaOPD,
                                  id: sub.id,
                                  kode: sub.kodeSub,
                                  nama: sub.namaSub,
                                  nominal: sub.pagu
                                })}
                                className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-800 text-rose-300 hover:text-white border border-rose-700/60 transition shadow-sm"
                                title="Hapus Sub Kegiatan"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-600 bg-slate-950 font-black text-xs">
                    <tr>
                      <td colSpan={laporanOpdId === 'ALL' ? 5 : 4} className="p-3.5 text-right uppercase text-slate-300">
                        TOTAL KESELURUHAN SUB KEGIATAN:
                      </td>
                      <td className="p-3.5 text-right font-mono text-white">
                        {formatRupiah(activeReportSubKegiatans.reduce((s: number, sub: any) => s + sub.pagu, 0))}
                      </td>
                      <td className="p-3.5 text-right font-mono text-emerald-400">
                        {formatRupiah(activeReportSubKegiatans.reduce((s: number, sub: any) => s + sub.realisasi, 0))}
                      </td>
                      <td className="p-3.5 text-right font-mono text-amber-400">
                        {formatRupiah(activeReportSubKegiatans.reduce((s: number, sub: any) => s + (sub.pagu - sub.realisasi), 0))}
                      </td>
                      <td className="p-3.5 text-center font-mono text-cyan-400">
                        {(() => {
                          const totP = activeReportSubKegiatans.reduce((s: number, sub: any) => s + sub.pagu, 0);
                          const totR = activeReportSubKegiatans.reduce((s: number, sub: any) => s + sub.realisasi, 0);
                          return totP > 0 ? `${((totR / totP) * 100).toFixed(2)}%` : '0.00%';
                        })()}
                      </td>
                      <td className="p-3.5" />
                      <td className="p-3.5 print:hidden" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* TABEL 4: LAPORAN PER REKENING BELANJA */}
            {laporanSubTab === 'per-belanja' && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-700 bg-slate-950/80 text-[11px] font-bold uppercase text-slate-300">
                    <tr>
                      <th className="p-3 text-center w-12">No</th>
                      <th className="p-3">Kode Rekening</th>
                      <th className="p-3">Nama Uraian Rekening Belanja</th>
                      <th className="p-3">Kelompok / Jenis Belanja</th>
                      {laporanOpdId === 'ALL' && <th className="p-3">OPD</th>}
                      <th className="p-3 text-right">Pagu Belanja (Rp)</th>
                      <th className="p-3 text-right">Realisasi SP2D (Rp)</th>
                      <th className="p-3 text-right">Sisa Pagu (Rp)</th>
                      <th className="p-3 text-center">% Realisasi</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center print:hidden">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-sans">
                    {activeReportBelanja.map((bel: any, idx: number) => {
                      const serapan = bel.pagu > 0 ? (bel.realisasi / bel.pagu) * 100 : 0;
                      const sisa = bel.pagu - bel.realisasi;
                      return (
                        <tr key={bel.id || idx} className="hover:bg-slate-800/40">
                          <td className="p-3 text-center text-slate-400 font-bold">{idx + 1}</td>
                          <td className="p-3 font-mono text-cyan-300 font-semibold">{bel.kodeBelanja}</td>
                          <td className="p-3 font-bold text-white">{bel.namaBelanja}</td>
                          <td className="p-3">
                            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-cyan-300 border border-slate-700">
                              {bel.jenisBelanja}
                            </span>
                          </td>
                          {laporanOpdId === 'ALL' && (
                            <td className="p-3 font-semibold text-cyan-400">{bel.namaOPD}</td>
                          )}
                          <td className="p-3 text-right font-mono text-slate-200">{formatRupiah(bel.pagu)}</td>
                          <td className="p-3 text-right font-mono text-emerald-400 font-bold">{formatRupiah(bel.realisasi)}</td>
                          <td className="p-3 text-right font-mono text-amber-300">{formatRupiah(sisa)}</td>
                          <td className="p-3 text-center font-bold">
                            <span className={`rounded-full px-2 py-0.5 text-[10px] ${
                              serapan >= 80 ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              serapan >= 65 ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' :
                              'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                              {serapan.toFixed(2)}%
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                              {serapan >= 80 ? 'Sangat Tinggi' : serapan >= 65 ? 'Tinggi' : 'Sedang'}
                            </span>
                          </td>
                          <td className="p-3 text-center print:hidden whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditLaporanModal({
                                  type: 'belanja',
                                  opdId: bel.opdId || laporanOpdId,
                                  namaOPD: bel.namaOPD || targetLaporanOpd?.namaOPD,
                                  data: {
                                    id: bel.id,
                                    kodeBelanja: bel.kodeBelanja,
                                    namaBelanja: bel.namaBelanja,
                                    jenisBelanja: bel.jenisBelanja,
                                    pagu: bel.pagu,
                                    realisasi: bel.realisasi
                                  }
                                })}
                                className="p-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-800 text-cyan-300 hover:text-white border border-cyan-700/60 transition shadow-sm"
                                title="Edit Rekening Belanja"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteLaporanModal({
                                  type: 'belanja',
                                  opdId: bel.opdId || laporanOpdId,
                                  namaOPD: bel.namaOPD || targetLaporanOpd?.namaOPD,
                                  id: bel.id,
                                  kode: bel.kodeBelanja,
                                  nama: bel.namaBelanja,
                                  nominal: bel.pagu
                                })}
                                className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-800 text-rose-300 hover:text-white border border-rose-700/60 transition shadow-sm"
                                title="Hapus Rekening Belanja"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-600 bg-slate-950 font-black text-xs">
                    <tr>
                      <td colSpan={laporanOpdId === 'ALL' ? 5 : 4} className="p-3.5 text-right uppercase text-slate-300">
                        TOTAL KESELURUHAN REKENING BELANJA:
                      </td>
                      <td className="p-3.5 text-right font-mono text-white">
                        {formatRupiah(activeReportBelanja.reduce((s: number, b: any) => s + b.pagu, 0))}
                      </td>
                      <td className="p-3.5 text-right font-mono text-emerald-400">
                        {formatRupiah(activeReportBelanja.reduce((s: number, b: any) => s + b.realisasi, 0))}
                      </td>
                      <td className="p-3.5 text-right font-mono text-amber-400">
                        {formatRupiah(activeReportBelanja.reduce((s: number, b: any) => s + (b.pagu - b.realisasi), 0))}
                      </td>
                      <td className="p-3.5 text-center font-mono text-cyan-400">
                        {(() => {
                          const totP = activeReportBelanja.reduce((s: number, b: any) => s + b.pagu, 0);
                          const totR = activeReportBelanja.reduce((s: number, b: any) => s + b.realisasi, 0);
                          return totP > 0 ? `${((totR / totP) * 100).toFixed(2)}%` : '0.00%';
                        })()}
                      </td>
                      <td className="p-3.5" />
                      <td className="p-3.5 print:hidden" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* TABEL 5: HIRARKI LENGKAP (PROGRAM -> KEGIATAN -> SUB -> BELANJA) */}
            {laporanSubTab === 'hirarki' && (
              <div className="mt-6 space-y-4">
                <div className="text-xs text-slate-400 mb-2">
                  Struktur penjabaran berjenjang DPA/RKA SKPD: Program ➔ Kegiatan ➔ Sub Kegiatan ➔ Rincian Objek Belanja
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-700 bg-slate-950 text-[11px] font-bold uppercase text-slate-300">
                      <tr>
                        <th className="p-3">Kode Nomenklatur</th>
                        <th className="p-3">Uraian Program / Kegiatan / Belanja</th>
                        <th className="p-3 text-right">Pagu Anggaran (Rp)</th>
                        <th className="p-3 text-right">Realisasi SP2D (Rp)</th>
                        <th className="p-3 text-right">Sisa (Rp)</th>
                        <th className="p-3 text-center">% Capaian</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-sans">
                      {activeReportPrograms.map((prog: any, pIdx: number) => {
                        const pSerapan = prog.pagu > 0 ? (prog.realisasi / prog.pagu) * 100 : 0;
                        const relatedKeg = activeReportKegiatans.filter((k: any) => k.kodeProgram === prog.kodeProgram || k.kodeProgram.startsWith(prog.kodeProgram));

                        return (
                          <React.Fragment key={prog.id || pIdx}>
                            {/* LEVEL 1: PROGRAM */}
                            <tr className="bg-cyan-950/40 border-t-2 border-cyan-800/60 font-bold">
                              <td className="p-3 font-mono text-cyan-300">📁 {prog.kodeProgram}</td>
                              <td className="p-3 text-white">
                                <span className="uppercase">{prog.namaProgram}</span>
                                {laporanOpdId === 'ALL' && <span className="ml-2 text-xs text-cyan-400 font-semibold">({prog.namaOPD})</span>}
                              </td>
                              <td className="p-3 text-right font-mono text-white">{formatRupiah(prog.pagu)}</td>
                              <td className="p-3 text-right font-mono text-emerald-400">{formatRupiah(prog.realisasi)}</td>
                              <td className="p-3 text-right font-mono text-amber-300">{formatRupiah(prog.pagu - prog.realisasi)}</td>
                              <td className="p-3 text-center font-mono text-cyan-300">{pSerapan.toFixed(2)}%</td>
                            </tr>

                            {/* LEVEL 2: KEGIATAN */}
                            {relatedKeg.map((keg: any, kIdx: number) => {
                              const kSerapan = keg.pagu > 0 ? (keg.realisasi / keg.pagu) * 100 : 0;
                              const relatedSub = activeReportSubKegiatans.filter((s: any) => s.kodeKegiatan === keg.kodeKegiatan);

                              return (
                                <React.Fragment key={keg.id || kIdx}>
                                  <tr className="bg-slate-900/60 text-slate-200">
                                    <td className="p-2.5 pl-6 font-mono text-slate-300">├── {keg.kodeKegiatan}</td>
                                    <td className="p-2.5 font-semibold text-slate-200">{keg.namaKegiatan}</td>
                                    <td className="p-2.5 text-right font-mono">{formatRupiah(keg.pagu)}</td>
                                    <td className="p-2.5 text-right font-mono text-emerald-400">{formatRupiah(keg.realisasi)}</td>
                                    <td className="p-2.5 text-right font-mono text-amber-300">{formatRupiah(keg.pagu - keg.realisasi)}</td>
                                    <td className="p-2.5 text-center font-mono text-slate-300">{kSerapan.toFixed(2)}%</td>
                                  </tr>

                                  {/* LEVEL 3: SUB KEGIATAN */}
                                  {relatedSub.map((sub: any, sIdx: number) => {
                                    const sSerapan = sub.pagu > 0 ? (sub.realisasi / sub.pagu) * 100 : 0;
                                    return (
                                      <tr key={sub.id || sIdx} className="bg-slate-950/60 text-slate-400 text-[11px]">
                                        <td className="p-2 pl-10 font-mono text-slate-400">└── {sub.kodeSub}</td>
                                        <td className="p-2 text-slate-300">{sub.namaSub}</td>
                                        <td className="p-2 text-right font-mono">{formatRupiah(sub.pagu)}</td>
                                        <td className="p-2 text-right font-mono text-emerald-300">{formatRupiah(sub.realisasi)}</td>
                                        <td className="p-2 text-right font-mono text-amber-200">{formatRupiah(sub.pagu - sub.realisasi)}</td>
                                        <td className="p-2 text-center font-mono text-slate-400">{sSerapan.toFixed(2)}%</td>
                                      </tr>
                                    );
                                  })}
                                </React.Fragment>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TABEL 6: REKAPITULASI 40 OPD */}
            {laporanSubTab === 'rekap-opd' && (
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-700 bg-slate-950/80 text-[11px] font-bold uppercase text-slate-300">
                    <tr>
                      <th className="p-3 text-center w-12">No</th>
                      <th className="p-3">Kode SKPD</th>
                      <th className="p-3">Nama Satuan Kerja (OPD)</th>
                      <th className="p-3">Kategori</th>
                      <th className="p-3 text-right">Target Pagu (Rp)</th>
                      <th className="p-3 text-right">Realisasi (Rp)</th>
                      <th className="p-3 text-right">Sisa Anggaran (Rp)</th>
                      <th className="p-3 text-center">% Realisasi</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center print:hidden">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-sans">
                    {filteredOpds.map((opd, i) => {
                      const serapan = ((opd.realisasiSP2D / opd.targetPagu) * 100).toFixed(2);
                      return (
                        <tr key={opd.id} className="hover:bg-slate-800/40">
                          <td className="p-3 text-center text-slate-400">{i + 1}</td>
                          <td className="p-3 font-mono text-cyan-300">{opd.kodeOPD}</td>
                          <td className="p-3 font-semibold text-slate-200">
                            <div>{opd.namaOPD}</div>
                            <div className="text-[10px] text-cyan-400">{opd.singkatan}</div>
                          </td>
                          <td className="p-3 text-slate-400">{opd.kategori}</td>
                          <td className="p-3 text-right font-mono">{formatRupiah(opd.targetPagu)}</td>
                          <td className="p-3 text-right font-mono text-emerald-400 font-bold">{formatRupiah(opd.realisasiSP2D)}</td>
                          <td className="p-3 text-right font-mono text-amber-300">{formatRupiah(opd.targetPagu - opd.realisasiSP2D)}</td>
                          <td className="p-3 text-center font-bold text-cyan-300">{serapan}%</td>
                          <td className="p-3 text-center">
                            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                              {opd.statusKinerja}
                            </span>
                          </td>
                          <td className="p-3 text-center print:hidden whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditLaporanModal({
                                  type: 'opd',
                                  opdId: opd.id,
                                  namaOPD: opd.namaOPD,
                                  data: {
                                    namaOPD: opd.namaOPD,
                                    singkatan: opd.singkatan,
                                    kodeOPD: opd.kodeOPD,
                                    kategori: opd.kategori,
                                    targetPagu: opd.targetPagu,
                                    realisasiSP2D: opd.realisasiSP2D,
                                    kepalaBadan: opd.kepalaBadan,
                                    nipKepala: opd.nipKepala
                                  }
                                })}
                                className="p-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-800 text-cyan-300 hover:text-white border border-cyan-700/60 transition shadow-sm"
                                title="Edit Data OPD"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteLaporanModal({
                                  type: 'opd',
                                  opdId: opd.id,
                                  namaOPD: opd.namaOPD,
                                  id: opd.id,
                                  kode: opd.kodeOPD,
                                  nama: `${opd.namaOPD} (${opd.singkatan})`,
                                  nominal: opd.targetPagu
                                })}
                                className="p-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-800 text-rose-300 hover:text-white border border-rose-700/60 transition shadow-sm"
                                title="Hapus OPD dari Konsolidasi"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="border-t-2 border-slate-600 bg-slate-950 font-black text-xs">
                    <tr>
                      <td colSpan={4} className="p-3.5 text-right uppercase">
                        JUMLAH TOTAL PEMERINTAH PROVINSI NTB:
                      </td>
                      <td className="p-3.5 text-right font-mono text-white">{formatRupiah(totalPaguDisplay)}</td>
                      <td className="p-3.5 text-right font-mono text-emerald-400">{formatRupiah(totalRealisasiDisplay)}</td>
                      <td className="p-3.5 text-right font-mono text-amber-400">{formatRupiah(totalSilpaDisplay)}</td>
                      <td className="p-3.5 text-center font-mono text-cyan-400">{persentaseSerapanDisplay.toFixed(2)}%</td>
                      <td className="p-3.5" />
                      <td className="p-3.5 print:hidden" />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* TABEL 7: LAPORAN TRIWULAN */}
            {laporanSubTab === 'triwulan' && (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { tw: 'Triwulan I (Jan - Mar)', target: '15.00%', real: `${((((targetLaporanOpd?.realisasiSP2D || totalRealisasiDisplay) * 0.18) / (targetLaporanOpd?.targetPagu || totalPaguDisplay)) * 100).toFixed(2)}%`, nominal: (targetLaporanOpd?.realisasiSP2D || totalRealisasiDisplay) * 0.18 },
                    { tw: 'Triwulan II (Apr - Jun)', target: '40.00%', real: `${((((targetLaporanOpd?.realisasiSP2D || totalRealisasiDisplay) * 0.45) / (targetLaporanOpd?.targetPagu || totalPaguDisplay)) * 100).toFixed(2)}%`, nominal: (targetLaporanOpd?.realisasiSP2D || totalRealisasiDisplay) * 0.27 },
                    { tw: 'Triwulan III (Jul - Sep)', target: '70.00%', real: `${((((targetLaporanOpd?.realisasiSP2D || totalRealisasiDisplay) * 0.78) / (targetLaporanOpd?.targetPagu || totalPaguDisplay)) * 100).toFixed(2)}%`, nominal: (targetLaporanOpd?.realisasiSP2D || totalRealisasiDisplay) * 0.33 },
                    { tw: 'Triwulan IV (Okt - Des)', target: '100.00%', real: `${(((targetLaporanOpd?.realisasiSP2D || totalRealisasiDisplay) / (targetLaporanOpd?.targetPagu || totalPaguDisplay)) * 100).toFixed(2)}%`, nominal: (targetLaporanOpd?.realisasiSP2D || totalRealisasiDisplay) * 0.22 }
                  ].map((item, idx) => (
                    <div key={idx} className="rounded-xl bg-slate-950 p-4 border border-slate-800 space-y-1.5">
                      <span className="text-xs font-bold text-cyan-300">{item.tw}</span>
                      <div className="text-base font-bold text-white font-mono">{formatRupiah(item.nominal)}</div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Target: {item.target}</span>
                        <span className="text-emerald-400 font-bold">Capaian: {item.real}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TABEL 8: LAPORAN SEMESTER & EVALUASI SILPA */}
            {laporanSubTab === 'semester' && (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="rounded-xl bg-slate-950 p-5 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-cyan-300">Semester I (Januari - Juni {selectedTahun})</h4>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Pagu Anggaran Semester I:</span>
                        <span className="font-mono text-white">{formatRupiah((targetLaporanOpd?.targetPagu || totalPaguDisplay) * 0.5)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-400 font-bold">
                        <span>Realisasi Kasda S1:</span>
                        <span className="font-mono">{formatRupiah((targetLaporanOpd?.realisasiSP2D || totalRealisasiDisplay) * 0.45)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Persentase Serapan S1:</span>
                        <span className="font-mono font-bold text-cyan-300">45.00%</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-950 p-5 border border-slate-800 space-y-3">
                    <h4 className="text-sm font-bold text-emerald-300">Semester II & Evaluasi SiLPA Kas ({selectedTahun})</h4>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-300">
                        <span>Total Realisasi Kumulatif:</span>
                        <span className="font-mono text-emerald-400 font-bold">{formatRupiah(targetLaporanOpd?.realisasiSP2D || totalRealisasiDisplay)}</span>
                      </div>
                      <div className="flex justify-between text-amber-400 font-bold">
                        <span>Sisa Anggaran Belum Terserap (SiLPA):</span>
                        <span className="font-mono">{formatRupiah((targetLaporanOpd?.targetPagu || totalPaguDisplay) - (targetLaporanOpd?.realisasiSP2D || totalRealisasiDisplay))}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Tingkat Efisiensi Kasda:</span>
                        <span className="font-mono font-bold text-white">96.8% Terkendali</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Kolom Tanda Tangan Resmi Dinamis Sesuai OPD */}
            <div className="mt-8 pt-6 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-8 text-center text-xs">
              <div>
                <p className="text-slate-400">Mengetahui / Memverifikasi,</p>
                <p className="font-bold text-white mt-1">
                  {laporanOpdId === 'ALL' ? 'SEKRETARIS DAERAH PROVINSI NTB' : 'PEJABAT PELAKSANA TEKNIS KEGIATAN (PPTK)'}
                </p>
                <div className="h-16" />
                <p className="font-bold text-white underline">
                  {laporanOpdId === 'ALL' ? 'Drs. H. Lalu Gita Ariadi, M.Si' : 'H. Ahmad Syaifullah, SE., M.Ak'}
                </p>
                <p className="text-slate-400">
                  {laporanOpdId === 'ALL' ? 'NIP. 196505301989031011' : 'NIP. 197804152005011009'}
                </p>
              </div>
              <div>
                <p className="text-slate-400">
                  Mataram, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p className="font-bold text-white mt-1">
                  {laporanOpdId === 'ALL' ? 'KEPALA BPKAD PROVINSI NTB' : `KEPALA ${targetLaporanOpd?.singkatan || 'OPD'}`}
                </p>
                <div className="h-16" />
                <p className="font-bold text-white underline">
                  {laporanOpdId === 'ALL' ? 'Drs. H. Samsul Rizal, M.M' : (targetLaporanOpd?.kepalaBadan || 'Kepala Satuan Kerja')}
                </p>
                <p className="text-slate-400">
                  NIP. {laporanOpdId === 'ALL' ? '196905141994021003' : (targetLaporanOpd?.nipKepala || '-')}
                </p>
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

      {/* MODAL IMPORT EXCEL PREVIEW & KONFIRMASI */}
      {showImportModal && importPreviewData.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-cyan-500/40 bg-slate-900 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 md:p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/60">
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-extrabold text-white flex items-center gap-2">
                    <span>Pratinjau &amp; Konfirmasi Import Data Excel OPD</span>
                    <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[11px] font-bold text-cyan-300 border border-cyan-500/40">
                      {importPreviewData.length} Baris Data
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Data file Excel berhasil dibaca. Periksa rincian nama OPD, pagu anggaran, realisasi, dan program sebelum diterapkan ke sistem.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5">
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Total Baris File:</span>
                  <div className="text-base font-black text-white mt-1">{importPreviewData.length} Baris</div>
                </div>
                <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-cyan-400">OPD Cocok (Update):</span>
                  <div className="text-base font-black text-cyan-300 mt-1">
                    {importPreviewData.filter(row => {
                      const nama = String(row['Nama Sub SKPD'] || row['Nama_Sub_SKPD'] || row['Nama_OPD'] || row['nama_opd'] || row['OPD'] || row['Nama OPD'] || row['SKPD'] || row['Nama SKPD'] || '');
                      const kode = String(row['Kode Sub SKPD'] || row['Kode_Sub_SKPD'] || row['Kode_OPD'] || row['kode_opd'] || row['Kode SKPD'] || '');
                      const singk = String(row['Singkatan'] || row['singkatan'] || '');
                      return findMatchingOpdIndex(kode, nama, singk, opdListState) >= 0;
                    }).length} OPD
                  </div>
                </div>
                <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-emerald-400">Estimasi Total Pagu:</span>
                  <div className="text-base font-black text-emerald-300 mt-1">
                    {formatRupiahSingkat(
                      importPreviewData.reduce((acc, r) => acc + parseNumeric(r['Alokasi Anggaran'] || r['Alokasi_Anggaran'] || r['Pagu_Anggaran'] || r['pagu'] || r['Pagu'] || r['Anggaran']), 0)
                    )}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-amber-400">Estimasi Realisasi:</span>
                  <div className="text-base font-black text-amber-300 mt-1">
                    {formatRupiahSingkat(
                      importPreviewData.reduce((acc, r) => acc + parseNumeric(r['Realisasi Anggaran'] || r['Realisasi_Anggaran'] || r['Realisasi_SP2D'] || r['realisasi'] || r['Realisasi'] || r['SP2D']), 0)
                    )}
                  </div>
                </div>
              </div>

              {/* Status Pemetaan Kolom */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-300 mr-2">Kolom Terbaca:</span>
                <span className="flex items-center gap-1 rounded-md bg-emerald-950/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-800">
                  <Check className="h-3 w-3" />
                  <span>Nama Sub SKPD / OPD</span>
                </span>
                <span className="flex items-center gap-1 rounded-md bg-emerald-950/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-800">
                  <Check className="h-3 w-3" />
                  <span>Pagu / Alokasi Anggaran</span>
                </span>
                <span className="flex items-center gap-1 rounded-md bg-emerald-950/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-800">
                  <Check className="h-3 w-3" />
                  <span>Realisasi Kasda / SP2D</span>
                </span>
                {importPreviewData.some(r => r['Nama Program'] || r['Nama_Program'] || r['Program']) && (
                  <span className="flex items-center gap-1 rounded-md bg-cyan-950/80 px-2 py-0.5 text-[11px] font-semibold text-cyan-300 border border-cyan-800">
                    <Check className="h-3 w-3" />
                    <span>Nomenklatur Program</span>
                  </span>
                )}
                {importPreviewData.some(r => r['Nama Kegiatan'] || r['Nama_Kegiatan'] || r['Kegiatan']) && (
                  <span className="flex items-center gap-1 rounded-md bg-cyan-950/80 px-2 py-0.5 text-[11px] font-semibold text-cyan-300 border border-cyan-800">
                    <Check className="h-3 w-3" />
                    <span>Nomenklatur Kegiatan</span>
                  </span>
                )}
                {importPreviewData.some(r => r['Nama Sub Kegiatan'] || r['Nama_Sub_Kegiatan'] || r['Sub_Kegiatan']) && (
                  <span className="flex items-center gap-1 rounded-md bg-purple-950/80 px-2 py-0.5 text-[11px] font-semibold text-purple-300 border border-purple-800">
                    <Check className="h-3 w-3" />
                    <span>Sub Kegiatan</span>
                  </span>
                )}
                {importPreviewData.some(r => r['Nama Rekening'] || r['Nama_Rekening'] || r['Nama_Rekening_Belanja'] || r['Nama_Belanja']) && (
                  <span className="flex items-center gap-1 rounded-md bg-amber-950/80 px-2 py-0.5 text-[11px] font-semibold text-amber-300 border border-amber-800">
                    <Check className="h-3 w-3" />
                    <span>Rekening Belanja</span>
                  </span>
                )}
              </div>

              {/* Table Preview */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950 text-[11px] font-bold uppercase text-slate-300">
                    <tr>
                      <th className="p-3 text-center w-10">No</th>
                      <th className="p-3">Nama Satuan Kerja (Sub SKPD)</th>
                      <th className="p-3">Kode Sub SKPD / Singkatan</th>
                      <th className="p-3 text-right">Alokasi Anggaran (Rp)</th>
                      <th className="p-3 text-right">Realisasi SP2D (Rp)</th>
                      <th className="p-3 text-center">% Serapan</th>
                      <th className="p-3 text-center">Status Pemetaan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-sans">
                    {importPreviewData.slice(0, 15).map((row, i) => {
                      const nama = String(row['Nama Sub SKPD'] || row['Nama_Sub_SKPD'] || row['Nama_OPD'] || row['nama_opd'] || row['OPD'] || row['Nama OPD'] || row['SKPD'] || row['Nama SKPD'] || '-');
                      const kode = String(row['Kode Sub SKPD'] || row['Kode_Sub_SKPD'] || row['Kode_OPD'] || row['kode_opd'] || row['Kode SKPD'] || '-');
                      const singk = String(row['Singkatan'] || row['singkatan'] || '');
                      const pagu = parseNumeric(row['Alokasi Anggaran'] || row['Alokasi_Anggaran'] || row['Pagu_Anggaran'] || row['pagu'] || row['Pagu'] || row['Anggaran']);
                      const real = parseNumeric(row['Realisasi Anggaran'] || row['Realisasi_Anggaran'] || row['Realisasi_SP2D'] || row['realisasi'] || row['Realisasi'] || row['SP2D']);
                      const pct = pagu > 0 ? (real / pagu) * 100 : 0;

                      const isMatch = findMatchingOpdIndex(kode, nama, singk, opdListState) >= 0;

                      return (
                        <tr key={i} className="hover:bg-slate-800/40">
                          <td className="p-2.5 text-center text-slate-400 font-bold">{i + 1}</td>
                          <td className="p-2.5 font-bold text-white max-w-xs truncate">{nama}</td>
                          <td className="p-2.5 font-mono text-[11px] text-cyan-400">
                            {kode !== '-' ? kode : singk || '-'}
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-200">{formatRupiah(pagu)}</td>
                          <td className="p-2.5 text-right font-mono text-emerald-400 font-bold">{formatRupiah(real)}</td>
                          <td className="p-2.5 text-center font-bold text-cyan-300">{pct.toFixed(2)}%</td>
                          <td className="p-2.5 text-center">
                            {isMatch ? (
                              <span className="rounded-md bg-emerald-950 px-2 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-800">
                                Perbarui OPD
                              </span>
                            ) : (
                              <span className="rounded-md bg-blue-950 px-2 py-0.5 text-[10px] font-semibold text-blue-300 border border-blue-800">
                                OPD Baru
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {importPreviewData.length > 15 && (
                <p className="text-center text-xs text-slate-400 italic">
                  Menampilkan 15 dari total {importPreviewData.length} baris data yang akan diproses...
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 md:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Data akan tersimpan permanen di memori browser dan tersinkronisasi ke seluruh menu konsolidasi.</span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Batalkan
                </button>
                <button
                  type="button"
                  onClick={handleApplyExcelImport}
                  className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-cyan-950 transition active:scale-95"
                >
                  <Check className="h-4 w-4" />
                  <span>Terapkan Import ({importPreviewData.length} Baris)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL IMPORT EXCEL KHUSUS MASTER OPD: ANGGARAN, REALISASI & KODE REKENING */}
      {showMasterImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl border border-cyan-500/40 bg-slate-900 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/70">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shrink-0">
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                    <span>Import Excel Master: Anggaran, Realisasi &amp; Kode Rekening</span>
                    <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10.5px] font-bold text-cyan-300 border border-cyan-500/40">
                      SIPD &amp; Satker NTB
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Import data Pagu Anggaran Murni/Perubahan, Realisasi SP2D Kasda, dan Master Rekening Belanja berdasarkan OPD terkait (Format sesuai modul Kesbangpoldagri &amp; SIPD RI)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowMasterImportModal(false);
                  setMasterImportPreviewRows([]);
                }}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {/* Category Selector Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'all', label: 'Semua / Auto-Detect', icon: Layers, desc: 'Deteksi otomatis sheet & kolom' },
                  { id: 'anggaran', label: 'Pagu Anggaran OPD', icon: DollarSign, desc: 'Pagu Murni, Revisi, Nilai SPD' },
                  { id: 'realisasi', label: 'Realisasi SP2D Kasda', icon: TrendingUp, desc: 'SP2D, SPM, Tanggal, Nilai' },
                  { id: 'rekening', label: 'Master Kode Rekening', icon: Tag, desc: 'Akun Belanja 5.x.xx & Jenis' }
                ].map(cat => {
                  const Icon = cat.icon;
                  const isSelected = masterImportCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setMasterImportCategory(cat.id as any)}
                      className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition ${
                        isSelected
                          ? 'border-cyan-400 bg-cyan-950/40 text-white shadow-md'
                          : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-xs">
                        <Icon className={`h-3.5 w-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                        <span>{cat.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5">{cat.desc}</span>
                    </button>
                  );
                })}
              </div>

              {/* Controls: Target OPD & Mode Overwrite */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">Target Satuan Kerja (OPD):</label>
                  <select
                    value={masterImportTargetOpd}
                    onChange={e => setMasterImportTargetOpd(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900 py-1.5 px-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none"
                  >
                    <option value="ALL">🌐 Deteksi Otomatis dari File Excel (Multi-OPD NTB)</option>
                    {opdListState.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.singkatan} - {o.namaOPD}
                      </option>
                    ))}
                  </select>
                  <span className="text-[10.5px] text-slate-400 block mt-1">
                    Bila memilih OPD spesifik, seluruh baris di file akan otomatis dialokasikan ke OPD tersebut.
                  </span>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Mode Penerapan Import Data:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setMasterImportOverwrite(false)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                        !masterImportOverwrite
                          ? 'bg-cyan-600/30 text-cyan-300 border-cyan-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      Update &amp; Gabung (Merge)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMasterImportOverwrite(true)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold border transition ${
                        masterImportOverwrite
                          ? 'bg-amber-600/30 text-amber-300 border-amber-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      Timpa Data (Overwrite)
                    </button>
                  </div>
                  <span className="text-[10.5px] text-slate-400 block mt-1">
                    {!masterImportOverwrite
                      ? 'Nilai yang ada akan diperbarui/ditambahkan secara aman tanpa menghapus rekening lainnya.'
                      : 'Data target anggaran/realisasi akan ditimpa penuh sesuai nilai dalam file Excel.'}
                  </span>
                </div>
              </div>

              {/* Upload Dropzone & Template Downloads */}
              <div className="rounded-xl border border-dashed border-cyan-500/40 bg-slate-950/60 p-4 sm:p-5 text-center space-y-3">
                <div className="flex flex-col items-center justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    Pilih atau Tarik File Spreadsheet (.xlsx, .xls, .csv)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 max-w-md">
                    Format file fleksibel mendeteksi kolom Nama OPD, Kode Rekening, Pagu Murni, Realisasi SP2D, Nomor SP2D, Program, dan Kegiatan.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => masterFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-cyan-950 transition active:scale-95"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5" />
                    <span>Pilih File dari Komputer</span>
                  </button>
                </div>

                {masterImportFileName && (
                  <div className="inline-flex items-center gap-2 rounded-lg bg-cyan-950/80 px-3 py-1.5 border border-cyan-700 text-xs text-cyan-300 font-mono">
                    <FileCheck className="h-3.5 w-3.5 text-cyan-400" />
                    <span>File Terpilih: {masterImportFileName}</span>
                  </div>
                )}

                {/* Quick Template Download Links */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-2 text-[11px]">
                  <span className="text-slate-400 font-medium">Unduh Template Contoh:</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadMasterTemplate('anggaran')}
                    className="text-cyan-400 hover:text-cyan-200 underline underline-offset-2 flex items-center gap-1 font-semibold"
                  >
                    <Download className="h-3 w-3" />
                    <span>Template Anggaran</span>
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadMasterTemplate('realisasi')}
                    className="text-emerald-400 hover:text-emerald-200 underline underline-offset-2 flex items-center gap-1 font-semibold"
                  >
                    <Download className="h-3 w-3" />
                    <span>Template Realisasi</span>
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadMasterTemplate('rekening')}
                    className="text-purple-400 hover:text-purple-200 underline underline-offset-2 flex items-center gap-1 font-semibold"
                  >
                    <Download className="h-3 w-3" />
                    <span>Template Rekening</span>
                  </button>
                  <span className="text-slate-600">•</span>
                  <button
                    type="button"
                    onClick={() => handleDownloadMasterTemplate('all')}
                    className="text-amber-400 hover:text-amber-200 underline underline-offset-2 flex items-center gap-1 font-bold"
                  >
                    <Download className="h-3 w-3" />
                    <span>Template Lengkap (3-in-1)</span>
                  </button>
                </div>
              </div>

              {/* Data Preview Section */}
              {masterImportPreviewRows.length > 0 && (
                <div className="space-y-3 pt-2">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                      <span className="text-[9.5px] font-bold uppercase text-slate-400">Total Baris:</span>
                      <div className="text-base font-black text-white mt-0.5">{masterImportPreviewRows.length} Baris</div>
                    </div>
                    <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                      <span className="text-[9.5px] font-bold uppercase text-cyan-400">OPD Terkait:</span>
                      <div className="text-base font-black text-cyan-300 mt-0.5">
                        {new Set(masterImportPreviewRows.map(r => r.opd.id).filter(id => id && id !== 'UNKNOWN')).size} OPD
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                      <span className="text-[9.5px] font-bold uppercase text-emerald-400">Estimasi Pagu:</span>
                      <div className="text-base font-black text-emerald-300 mt-0.5">
                        {formatRupiahSingkat(masterImportPreviewRows.reduce((acc, r) => acc + (r.pagu || 0), 0))}
                      </div>
                    </div>
                    <div className="rounded-xl bg-slate-950 p-2.5 border border-slate-800">
                      <span className="text-[9.5px] font-bold uppercase text-amber-400">Estimasi Realisasi:</span>
                      <div className="text-base font-black text-amber-300 mt-0.5">
                        {formatRupiahSingkat(masterImportPreviewRows.reduce((acc, r) => acc + (r.realisasi || 0), 0))}
                      </div>
                    </div>
                  </div>

                  {/* Errors if any */}
                  {masterImportErrors.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <AlertCircle className="h-4 w-4 text-amber-400" />
                        <span>Peringatan Pemetaan ({masterImportErrors.length} Baris):</span>
                      </div>
                      <ul className="list-disc list-inside text-[11px] text-amber-300 space-y-0.5 max-h-24 overflow-y-auto">
                        {masterImportErrors.slice(0, 5).map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Preview Table */}
                  <div className="overflow-x-auto rounded-xl border border-slate-800 max-h-64 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950 text-[10.5px] font-bold uppercase text-slate-300">
                        <tr>
                          <th className="p-2.5 text-center w-10">No</th>
                          <th className="p-2.5">Tipe</th>
                          <th className="p-2.5">Satuan Kerja (OPD)</th>
                          <th className="p-2.5">Kode Rekening / SP2D</th>
                          <th className="p-2.5">Uraian Transaksi / Belanja</th>
                          <th className="p-2.5 text-right">Pagu (Rp)</th>
                          <th className="p-2.5 text-right">Realisasi (Rp)</th>
                          <th className="p-2.5 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-sans">
                        {masterImportPreviewRows.slice(0, 30).map((r, i) => (
                          <tr key={i} className="hover:bg-slate-800/40">
                            <td className="p-2 text-center text-slate-400 font-bold">{i + 1}</td>
                            <td className="p-2 whitespace-nowrap">
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                  r.rowType === 'anggaran'
                                    ? 'bg-blue-950 text-blue-300 border border-blue-800'
                                    : r.rowType === 'realisasi'
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                    : 'bg-purple-950 text-purple-300 border border-purple-800'
                                }`}
                              >
                                {r.rowType === 'anggaran' ? 'Anggaran' : r.rowType === 'realisasi' ? 'Realisasi' : 'Rekening'}
                              </span>
                            </td>
                            <td className="p-2 font-bold text-white truncate max-w-[140px]">
                              {r.opd.singkatan || r.opd.namaOPD}
                            </td>
                            <td className="p-2 font-mono text-[11px] text-cyan-300 whitespace-nowrap">
                              {r.kodeRekening !== '-' ? r.kodeRekening : (r.noSP2D || '-')}
                            </td>
                            <td className="p-2 text-slate-200 truncate max-w-xs">{r.namaRekening}</td>
                            <td className="p-2 text-right font-mono text-slate-200 whitespace-nowrap">
                              {r.pagu > 0 ? formatRupiah(r.pagu) : '-'}
                            </td>
                            <td className="p-2 text-right font-mono font-bold text-emerald-400 whitespace-nowrap">
                              {r.realisasi > 0 ? formatRupiah(r.realisasi) : '-'}
                            </td>
                            <td className="p-2 text-center whitespace-nowrap">
                              {r.isValid ? (
                                <span className="rounded-md bg-emerald-950 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-300 border border-emerald-800">
                                  Valid
                                </span>
                              ) : (
                                <span className="rounded-md bg-rose-950 px-2 py-0.5 text-[9.5px] font-semibold text-rose-300 border border-rose-800">
                                  Periksa
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {masterImportPreviewRows.length > 30 && (
                    <p className="text-center text-xs text-slate-400 italic">
                      Menampilkan 30 dari total {masterImportPreviewRows.length} baris data yang siap diimpor...
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Sparkles className="h-4 w-4 text-cyan-400 shrink-0" />
                <span>Data otomatis diperbarui ke Pagu Anggaran, Realisasi Kasda, dan Master Rekening seluruh OPD.</span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowMasterImportModal(false);
                    setMasterImportPreviewRows([]);
                  }}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Batalkan
                </button>
                <button
                  type="button"
                  disabled={masterImportPreviewRows.filter(r => r.isValid).length === 0}
                  onClick={handleApplyMasterImport}
                  className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-950 transition active:scale-95"
                >
                  <Check className="h-4 w-4" />
                  <span>
                    Terapkan Import ({masterImportPreviewRows.filter(r => r.isValid).length} Baris Valid)
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT DATA PELAPORAN KONSOLIDASI */}
      {editLaporanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-300">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">
                    {editLaporanModal.type === 'opd' && 'Edit Data OPD / Satuan Kerja'}
                    {editLaporanModal.type === 'program' && 'Edit Nomenklatur Program'}
                    {editLaporanModal.type === 'kegiatan' && 'Edit Nomenklatur Kegiatan'}
                    {editLaporanModal.type === 'subkegiatan' && 'Edit Nomenklatur Sub Kegiatan'}
                    {editLaporanModal.type === 'belanja' && 'Edit Rekening Belanja'}
                  </h3>
                  <p className="text-xs text-cyan-400 font-semibold truncate max-w-xs">
                    {editLaporanModal.namaOPD || 'Pemerintah Provinsi NTB'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditLaporanModal(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSaveEditLaporan} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
              {/* FORM OPD */}
              {editLaporanModal.type === 'opd' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Nama Satuan Kerja (OPD)</label>
                    <input
                      type="text"
                      value={editLaporanModal.data.namaOPD || ''}
                      onChange={(e) => setEditLaporanModal({
                        ...editLaporanModal,
                        data: { ...editLaporanModal.data, namaOPD: e.target.value }
                      })}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Singkatan OPD</label>
                      <input
                        type="text"
                        value={editLaporanModal.data.singkatan || ''}
                        onChange={(e) => setEditLaporanModal({
                          ...editLaporanModal,
                          data: { ...editLaporanModal.data, singkatan: e.target.value }
                        })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Kode Sub SKPD</label>
                      <input
                        type="text"
                        value={editLaporanModal.data.kodeOPD || ''}
                        onChange={(e) => setEditLaporanModal({
                          ...editLaporanModal,
                          data: { ...editLaporanModal.data, kodeOPD: e.target.value }
                        })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-cyan-300 font-mono focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Kategori Organisasi</label>
                    <select
                      value={editLaporanModal.data.kategori || 'Dinas'}
                      onChange={(e) => setEditLaporanModal({
                        ...editLaporanModal,
                        data: { ...editLaporanModal.data, kategori: e.target.value }
                      })}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="Dinas">Dinas Daerah</option>
                      <option value="Badan">Badan Daerah</option>
                      <option value="Sekretariat">Sekretariat Daerah / Dewan</option>
                      <option value="RSUD">Rumah Sakit Umum Daerah (RSUD)</option>
                      <option value="Biro">Biro Setda</option>
                      <option value="Inspektorat">Inspektorat</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Target Pagu Anggaran (Rp)</label>
                      <input
                        type="number"
                        value={editLaporanModal.data.targetPagu ?? 0}
                        onChange={(e) => setEditLaporanModal({
                          ...editLaporanModal,
                          data: { ...editLaporanModal.data, targetPagu: Number(e.target.value) }
                        })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Realisasi SP2D Kasda (Rp)</label>
                      <input
                        type="number"
                        value={editLaporanModal.data.realisasiSP2D ?? 0}
                        onChange={(e) => setEditLaporanModal({
                          ...editLaporanModal,
                          data: { ...editLaporanModal.data, realisasiSP2D: Number(e.target.value) }
                        })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-emerald-400 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Nama Kepala OPD</label>
                      <input
                        type="text"
                        value={editLaporanModal.data.kepalaBadan || ''}
                        onChange={(e) => setEditLaporanModal({
                          ...editLaporanModal,
                          data: { ...editLaporanModal.data, kepalaBadan: e.target.value }
                        })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">NIP Kepala OPD</label>
                      <input
                        type="text"
                        value={editLaporanModal.data.nipKepala || ''}
                        onChange={(e) => setEditLaporanModal({
                          ...editLaporanModal,
                          data: { ...editLaporanModal.data, nipKepala: e.target.value }
                        })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-slate-300 font-mono focus:border-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* FORM PROGRAM */}
              {editLaporanModal.type === 'program' && (
                <>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Kode Program</label>
                    <input
                      type="text"
                      value={editLaporanModal.data.kodeProgram || ''}
                      onChange={(e) => setEditLaporanModal({
                        ...editLaporanModal,
                        data: { ...editLaporanModal.data, kodeProgram: e.target.value }
                      })}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-cyan-300 font-mono focus:border-cyan-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Nama Nomenklatur Program</label>
                    <textarea
                      rows={2}
                      value={editLaporanModal.data.namaProgram || ''}
                      onChange={(e) => setEditLaporanModal({
                        ...editLaporanModal,
                        data: { ...editLaporanModal.data, namaProgram: e.target.value }
                      })}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Pagu Anggaran (Rp)</label>
                      <input
                        type="number"
                        value={editLaporanModal.data.pagu ?? 0}
                        onChange={(e) => setEditLaporanModal({
                          ...editLaporanModal,
                          data: { ...editLaporanModal.data, pagu: Number(e.target.value) }
                        })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Realisasi SP2D (Rp)</label>
                      <input
                        type="number"
                        value={editLaporanModal.data.realisasi ?? 0}
                        onChange={(e) => setEditLaporanModal({
                          ...editLaporanModal,
                          data: { ...editLaporanModal.data, realisasi: Number(e.target.value) }
                        })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-emerald-400 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* FORM KEGIATAN */}
              {editLaporanModal.type === 'kegiatan' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Kode Kegiatan</label>
                      <input
                        type="text"
                        value={editLaporanModal.data.kodeKegiatan || ''}
                        onChange={(e) => setEditLaporanModal({
                          ...editLaporanModal,
                          data: { ...editLaporanModal.data, kodeKegiatan: e.target.value }
                        })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-cyan-300 font-mono focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Kode Program Induk</label>
                      <input
                        type="text"
                        value={editLaporanModal.data.kodeProgram || ''}
                        onChange={(e) => setEditLaporanModal({
                          ...editLaporanModal,
                          data: { ...editLaporanModal.data, kodeProgram: e.target.value }
                        })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-slate-300 font-mono focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Nama Kegiatan</label>
                    <textarea
                      rows={2}
                      value={editLaporanModal.data.namaKegiatan || ''}
                      onChange={(e) => setEditLaporanModal({
                        ...editLaporanModal,
                        data: { ...editLaporanModal.data, namaKegiatan: e.target.value }
                      })}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Pagu Kegiatan (Rp)</label>
                      <input
                        type="number"
                        value={editLaporanModal.data.pagu ?? 0}
                        onChange={(e) => setEditLaporanModal({
                          ...editLaporanModal,
                          data: { ...editLaporanModal.data, pagu: Number(e.target.value) }
                        })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Realisasi SP2D (Rp)</label>
                      <input
                        type="number"
                        value={editLaporanModal.data.realisasi ?? 0}
                        onChange={(e) => setEditLaporanModal({
                          ...editLaporanModal,
                          data: { ...editLaporanModal.data, realisasi: Number(e.target.value) }
                        })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-emerald-400 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* FORM SUB KEGIATAN */}
              {editLaporanModal.type === 'subkegiatan' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Kode Sub Kegiatan</label>
                      <input
                        type="text"
                        value={editLaporanModal.data.kodeSub || ''}
                        onChange={(e) => setEditLaporanModal({
                          ...editLaporanModal,
                          data: { ...editLaporanModal.data, kodeSub: e.target.value }
                        })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-cyan-300 font-mono focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Kode Kegiatan Induk</label>
                      <input
                        type="text"
                        value={editLaporanModal.data.kodeKegiatan || ''}
                        onChange={(e) => setEditLaporanModal({
                          ...editLaporanModal,
                          data: { ...editLaporanModal.data, kodeKegiatan: e.target.value }
                        })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-slate-300 font-mono focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Nama Sub Kegiatan</label>
                    <textarea
                      rows={2}
                      value={editLaporanModal.data.namaSub || ''}
                      onChange={(e) => setEditLaporanModal({
                        ...editLaporanModal,
                        data: { ...editLaporanModal.data, namaSub: e.target.value }
                      })}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Pagu Sub Kegiatan (Rp)</label>
                      <input
                        type="number"
                        value={editLaporanModal.data.pagu ?? 0}
                        onChange={(e) => setEditLaporanModal({
                          ...editLaporanModal,
                          data: { ...editLaporanModal.data, pagu: Number(e.target.value) }
                        })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Realisasi SP2D (Rp)</label>
                      <input
                        type="number"
                        value={editLaporanModal.data.realisasi ?? 0}
                        onChange={(e) => setEditLaporanModal({
                          ...editLaporanModal,
                          data: { ...editLaporanModal.data, realisasi: Number(e.target.value) }
                        })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-emerald-400 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* FORM REKENING BELANJA */}
              {editLaporanModal.type === 'belanja' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Kode Rekening Belanja</label>
                      <input
                        type="text"
                        value={editLaporanModal.data.kodeBelanja || ''}
                        onChange={(e) => setEditLaporanModal({
                          ...editLaporanModal,
                          data: { ...editLaporanModal.data, kodeBelanja: e.target.value }
                        })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-cyan-300 font-mono focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Kelompok Belanja</label>
                      <select
                        value={editLaporanModal.data.jenisBelanja || 'Belanja Operasi'}
                        onChange={(e) => setEditLaporanModal({
                          ...editLaporanModal,
                          data: { ...editLaporanModal.data, jenisBelanja: e.target.value }
                        })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                      >
                        <option value="Belanja Operasi">Belanja Operasi</option>
                        <option value="Belanja Pegawai">Belanja Pegawai</option>
                        <option value="Belanja Barang dan Jasa">Belanja Barang dan Jasa</option>
                        <option value="Belanja Modal">Belanja Modal</option>
                        <option value="Belanja Tidak Terduga">Belanja Tidak Terduga</option>
                        <option value="Belanja Transfer">Belanja Transfer</option>
                        <option value="Belanja Hibah">Belanja Hibah</option>
                        <option value="Bantuan Sosial">Bantuan Sosial</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Nama Uraian Rekening Belanja</label>
                    <textarea
                      rows={2}
                      value={editLaporanModal.data.namaBelanja || ''}
                      onChange={(e) => setEditLaporanModal({
                        ...editLaporanModal,
                        data: { ...editLaporanModal.data, namaBelanja: e.target.value }
                      })}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Pagu Belanja (Rp)</label>
                      <input
                        type="number"
                        value={editLaporanModal.data.pagu ?? 0}
                        onChange={(e) => setEditLaporanModal({
                          ...editLaporanModal,
                          data: { ...editLaporanModal.data, pagu: Number(e.target.value) }
                        })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white font-mono focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Realisasi SP2D (Rp)</label>
                      <input
                        type="number"
                        value={editLaporanModal.data.realisasi ?? 0}
                        onChange={(e) => setEditLaporanModal({
                          ...editLaporanModal,
                          data: { ...editLaporanModal.data, realisasi: Number(e.target.value) }
                        })}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-emerald-400 font-mono font-bold focus:border-cyan-500 focus:outline-none"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditLaporanModal(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Batalkan
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-950 transition active:scale-95"
                >
                  <Save className="h-4 w-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS DATA PELAPORAN KONSOLIDASI */}
      {deleteLaporanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl border border-rose-900/80 bg-slate-900 p-6 shadow-2xl text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 shadow-inner">
              <Trash2 className="h-7 w-7" />
            </div>

            <div>
              <h3 className="text-base font-extrabold text-white">
                Hapus Data {deleteLaporanModal.type.toUpperCase()}?
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Apakah Anda yakin ingin menghapus data item ini dari konsolidasi pelaporan?
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800 text-left space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>Kode:</span>
                <span className="font-mono text-cyan-300 font-bold">{deleteLaporanModal.kode || '-'}</span>
              </div>
              <div className="text-white font-semibold line-clamp-2">
                {deleteLaporanModal.nama}
              </div>
              {deleteLaporanModal.namaOPD && (
                <div className="text-[11px] text-cyan-400">
                  {deleteLaporanModal.namaOPD}
                </div>
              )}
              {deleteLaporanModal.nominal !== undefined && (
                <div className="flex justify-between items-center pt-1.5 border-t border-slate-800/80">
                  <span className="text-slate-400">Pagu Tercatat:</span>
                  <span className="font-mono text-amber-300 font-bold">{formatRupiah(deleteLaporanModal.nominal)}</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-rose-400/90 italic">
              Data yang dihapus akan otomatis diperhitungkan ulang pada rekapitulasi realisasi konsolidasi.
            </p>

            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteLaporanModal(null)}
                className="flex-1 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteLaporan}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-950 transition active:scale-95"
              >
                <Trash2 className="h-4 w-4" />
                <span>Ya, Hapus Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
