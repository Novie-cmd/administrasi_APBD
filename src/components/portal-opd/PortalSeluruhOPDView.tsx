import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { NTBLogo } from '../common/NTBLogo';
import * as XLSX from 'xlsx';
import {
  getOPDDetailsBreakdown,
  downloadOPDExcelTemplate,
  exportReportToExcel,
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
  FileCheck,
  LayoutGrid,
  List
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

  // Clean numerical amounts from Excel (handles string formatted with currency or commas)
  const parseNumeric = (val: any): number => {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const str = String(val).replace(/[^0-9.-]+/g, '');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  };

  // Handle Excel File Upload
  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        
        let combinedRows: any[] = [];
        // Scan all sheets or main sheets
        wb.SheetNames.forEach(wsname => {
          const ws = wb.Sheets[wsname];
          const sheetJson: any[] = XLSX.utils.sheet_to_json(ws);
          if (sheetJson && sheetJson.length > 0) {
            combinedRows = [...combinedRows, ...sheetJson];
          }
        });
        
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

  // Apply Imported Excel Data to OPD List and Sub-data
  const handleApplyExcelImport = () => {
    if (importPreviewData.length === 0) return;

    let updatedCount = 0;
    let addedCount = 0;
    const newOpds = [...opdListState];
    const newBreakdowns: Record<string, any> = { ...customBreakdownMap };

    importPreviewData.forEach((row, idx) => {
      const nama = String(row['Nama_OPD'] || row['nama_opd'] || row['OPD'] || row['Nama OPD'] || row['SKPD'] || row['Nama SKPD'] || '').trim();
      const singkatan = String(row['Singkatan'] || row['singkatan'] || row['SINGKATAN'] || '').trim();
      const kode = String(row['Kode_OPD'] || row['kode_opd'] || row['Kode SKPD'] || row['KODE SKPD'] || '').trim();
      const pagu = parseNumeric(row['Pagu_Anggaran'] || row['pagu'] || row['Pagu'] || row['PAGU ANGGARAN'] || row['Pagu Murni'] || row['Anggaran']);
      const realisasi = parseNumeric(row['Realisasi_SP2D'] || row['realisasi'] || row['Realisasi'] || row['REALISASI SP2D'] || row['SP2D'] || row['Realisasi Anggaran']);
      const kategori = (row['Kategori'] || row['kategori'] || 'Dinas Daerah') as any;
      const kepala = String(row['Kepala_OPD'] || row['Kepala_Badan'] || row['Kepala Dinas'] || row['Kepala OPD'] || row['NAMA KEPALA'] || '').trim();
      const nip = String(row['NIP_Kepala'] || row['NIP'] || row['NIP Kepala'] || '').trim();
      const alamat = String(row['Alamat'] || row['alamat'] || '').trim();

      if (!nama && !kode && !singkatan) return;

      const existingIndex = newOpds.findIndex(o => 
        (kode && o.kodeOPD.trim() === kode) ||
        (singkatan && o.singkatan.toLowerCase() === singkatan.toLowerCase()) ||
        (nama && (o.namaOPD.toLowerCase().includes(nama.toLowerCase()) || nama.toLowerCase().includes(o.namaOPD.toLowerCase())))
      );

      let targetId = '';
      if (existingIndex >= 0) {
        targetId = newOpds[existingIndex].id;
        const currentTarget = newOpds[existingIndex];
        newOpds[existingIndex] = {
          ...currentTarget,
          targetPagu: pagu > 0 ? pagu : currentTarget.targetPagu,
          realisasiSP2D: realisasi > 0 ? realisasi : currentTarget.realisasiSP2D,
          kepalaBadan: kepala || currentTarget.kepalaBadan,
          nipKepala: nip || currentTarget.nipKepala,
          alamat: alamat || currentTarget.alamat,
          statusKinerja: pagu > 0 ? ((realisasi/pagu) >= 0.8 ? 'Sangat Tinggi' : (realisasi/pagu) >= 0.65 ? 'Tinggi' : 'Sedang') : currentTarget.statusKinerja
        };
        updatedCount++;
      } else {
        targetId = `OPD-${String(newOpds.length + 1).padStart(3, '0')}`;
        newOpds.push({
          id: targetId,
          kodeOPD: kode || `1.01.0.00.0.00.${String(newOpds.length + 1).padStart(2, '0')}.0000`,
          namaOPD: nama || `OPD ${singkatan}`,
          singkatan: singkatan || (nama ? nama.substring(0, 10).toUpperCase() : `OPD ${newOpds.length + 1}`),
          kategori: kategori,
          kepalaBadan: kepala || 'Belum Ditetapkan',
          nipKepala: nip || '-',
          alamat: alamat || 'Kota Mataram, NTB',
          targetPagu: pagu > 0 ? pagu : 25000000000,
          realisasiSP2D: realisasi > 0 ? realisasi : 18500000000,
          jumlahProgram: 4,
          jumlahKegiatan: 12,
          jumlahTransaksi: 15,
          statusKinerja: pagu > 0 ? ((realisasi/pagu) >= 0.8 ? 'Sangat Tinggi' : (realisasi/pagu) >= 0.65 ? 'Tinggi' : 'Sedang') : 'Sedang'
        });
        addedCount++;
      }

      // Initialize breakdown for this OPD if not exists
      const targetOpdObj = newOpds.find(o => o.id === targetId) || newOpds[0];
      if (!newBreakdowns[targetId]) {
        newBreakdowns[targetId] = getOPDDetailsBreakdown(targetOpdObj);
      }

      // If program row is provided
      const progName = row['Nama_Program'] || row['Program'] || row['NAMA PROGRAM'];
      if (progName) {
        const pCode = row['Kode_Program'] || row['KODE PROGRAM'] || `${targetOpdObj.kodeOPD.split('.').slice(0, 2).join('.')}.0${(newBreakdowns[targetId].programs.length + 1)}`;
        const pPagu = parseNumeric(row['Pagu_Program'] || row['PAGU PROGRAM'] || pagu * 0.35 || 5000000000);
        const pReal = parseNumeric(row['Realisasi_Program'] || row['REALISASI PROGRAM'] || realisasi * 0.35 || 3800000000);

        const existingProg = newBreakdowns[targetId].programs.find((p: any) => p.kodeProgram === pCode || p.namaProgram.toLowerCase() === String(progName).toLowerCase());
        if (existingProg) {
          existingProg.pagu = pPagu;
          existingProg.realisasi = pReal;
        } else {
          newBreakdowns[targetId].programs.push({
            id: `IMP-P-${targetId}-${idx}`,
            opdId: targetId,
            namaOPD: targetOpdObj.namaOPD,
            kodeProgram: pCode,
            namaProgram: String(progName).toUpperCase(),
            pagu: pPagu,
            realisasi: pReal
          });
        }
      }

      // If kegiatan row is provided
      const kegName = row['Nama_Kegiatan'] || row['Kegiatan'] || row['NAMA KEGIATAN'];
      if (kegName) {
        const kCode = row['Kode_Kegiatan'] || row['KODE KEGIATAN'] || `${targetOpdObj.kodeOPD.split('.').slice(0, 2).join('.')}.01.2.0${(newBreakdowns[targetId].kegiatans.length + 1)}`;
        const kPagu = parseNumeric(row['Pagu_Kegiatan'] || row['PAGU KEGIATAN'] || pagu * 0.20 || 2000000000);
        const kReal = parseNumeric(row['Realisasi_Kegiatan'] || row['REALISASI KEGIATAN'] || realisasi * 0.20 || 1600000000);

        const existingKeg = newBreakdowns[targetId].kegiatans.find((k: any) => k.kodeKegiatan === kCode || k.namaKegiatan.toLowerCase() === String(kegName).toLowerCase());
        if (existingKeg) {
          existingKeg.pagu = kPagu;
          existingKeg.realisasi = kReal;
        } else {
          newBreakdowns[targetId].kegiatans.push({
            id: `IMP-K-${targetId}-${idx}`,
            opdId: targetId,
            namaOPD: targetOpdObj.namaOPD,
            kodeProgram: row['Kode_Program'] || `${targetOpdObj.kodeOPD.split('.').slice(0, 2).join('.')}.01`,
            kodeKegiatan: kCode,
            namaKegiatan: String(kegName),
            pagu: kPagu,
            realisasi: kReal
          });
        }
      }

      // If sub kegiatan row is provided
      const subName = row['Nama_Sub_Kegiatan'] || row['Sub_Kegiatan'] || row['NAMA SUB KEGIATAN'];
      if (subName) {
        const sCode = row['Kode_Sub_Kegiatan'] || row['KODE SUB KEGIATAN'] || `${targetOpdObj.kodeOPD.split('.').slice(0, 2).join('.')}.01.2.01.0${(newBreakdowns[targetId].subKegiatans.length + 1)}`;
        const sPagu = parseNumeric(row['Pagu_Sub_Kegiatan'] || row['PAGU SUB KEGIATAN'] || pagu * 0.15 || 1000000000);
        const sReal = parseNumeric(row['Realisasi_Sub_Kegiatan'] || row['REALISASI SUB KEGIATAN'] || realisasi * 0.15 || 800000000);

        const existingSub = newBreakdowns[targetId].subKegiatans.find((s: any) => s.kodeSub === sCode || s.namaSub.toLowerCase() === String(subName).toLowerCase());
        if (existingSub) {
          existingSub.pagu = sPagu;
          existingSub.realisasi = sReal;
        } else {
          newBreakdowns[targetId].subKegiatans.push({
            id: `IMP-S-${targetId}-${idx}`,
            opdId: targetId,
            namaOPD: targetOpdObj.namaOPD,
            kodeProgram: row['Kode_Program'] || `${targetOpdObj.kodeOPD.split('.').slice(0, 2).join('.')}.01`,
            kodeKegiatan: row['Kode_Kegiatan'] || `${targetOpdObj.kodeOPD.split('.').slice(0, 2).join('.')}.01.2.01`,
            kodeSub: sCode,
            namaSub: String(subName),
            pagu: sPagu,
            realisasi: sReal
          });
        }
      }

      // If rekening belanja row is provided
      const belanjaName = row['Nama_Rekening_Belanja'] || row['Nama_Belanja'] || row['Rekening_Belanja'] || row['NAMA REKENING'];
      if (belanjaName) {
        const bCode = row['Kode_Rekening_Belanja'] || row['Kode_Belanja'] || `5.1.0${(newBreakdowns[targetId].belanjaList.length + 1)}.01.0001`;
        const bPagu = parseNumeric(row['Pagu_Belanja'] || row['PAGU BELANJA'] || pagu * 0.15 || 1000000000);
        const bReal = parseNumeric(row['Realisasi_Belanja'] || row['REALISASI BELANJA'] || realisasi * 0.15 || 850000000);
        const bJenis = row['Jenis_Belanja'] || row['JENIS BELANJA'] || 'Belanja Operasi';

        const existingBelanja = newBreakdowns[targetId].belanjaList.find((b: any) => b.kodeBelanja === bCode || b.namaBelanja.toLowerCase() === String(belanjaName).toLowerCase());
        if (existingBelanja) {
          existingBelanja.pagu = bPagu;
          existingBelanja.realisasi = bReal;
        } else {
          newBreakdowns[targetId].belanjaList.push({
            id: `IMP-B-${targetId}-${idx}`,
            opdId: targetId,
            namaOPD: targetOpdObj.namaOPD,
            kodeBelanja: bCode,
            namaBelanja: String(belanjaName),
            jenisBelanja: bJenis,
            pagu: bPagu,
            realisasi: bReal
          });
        }
      }
    });

    setOpdListState(newOpds);
    setCustomBreakdownMap(newBreakdowns);

    // Save to localStorage for persistence across reloads
    try {
      localStorage.setItem('bfms_seluruh_opd_data_v1', JSON.stringify(newOpds));
      localStorage.setItem('bfms_seluruh_opd_breakdowns_v1', JSON.stringify(newBreakdowns));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }

    setImportStats({ total: importPreviewData.length, updated: updatedCount, added: addedCount });
    setShowImportModal(false);
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

      {/* TAB 4: PELAPORAN KEUANGAN KONSOLIDASI & REALISASI MULTI-OPD */}
      {activeTab === 'laporan' && (
        <div className="space-y-6">
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
                      const nama = String(row['Nama_OPD'] || row['nama_opd'] || row['OPD'] || row['Nama OPD'] || '').toLowerCase();
                      const kode = String(row['Kode_OPD'] || row['kode_opd'] || '').trim();
                      const singk = String(row['Singkatan'] || row['singkatan'] || '').toLowerCase();
                      return opdListState.some(o => 
                        (kode && o.kodeOPD.trim() === kode) ||
                        (singk && o.singkatan.toLowerCase() === singk) ||
                        (nama && o.namaOPD.toLowerCase().includes(nama))
                      );
                    }).length} OPD
                  </div>
                </div>
                <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-emerald-400">Estimasi Total Pagu:</span>
                  <div className="text-base font-black text-emerald-300 mt-1">
                    {formatRupiahSingkat(
                      importPreviewData.reduce((acc, r) => acc + parseNumeric(r['Pagu_Anggaran'] || r['pagu'] || r['Pagu'] || r['Anggaran']), 0)
                    )}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-950 p-3.5 border border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-amber-400">Estimasi Realisasi:</span>
                  <div className="text-base font-black text-amber-300 mt-1">
                    {formatRupiahSingkat(
                      importPreviewData.reduce((acc, r) => acc + parseNumeric(r['Realisasi_SP2D'] || r['realisasi'] || r['Realisasi'] || r['SP2D']), 0)
                    )}
                  </div>
                </div>
              </div>

              {/* Status Pemetaan Kolom */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-bold text-slate-300 mr-2">Kolom Terbaca:</span>
                <span className="flex items-center gap-1 rounded-md bg-emerald-950/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-800">
                  <Check className="h-3 w-3" />
                  <span>Nama OPD</span>
                </span>
                <span className="flex items-center gap-1 rounded-md bg-emerald-950/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-800">
                  <Check className="h-3 w-3" />
                  <span>Pagu Anggaran</span>
                </span>
                <span className="flex items-center gap-1 rounded-md bg-emerald-950/80 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-800">
                  <Check className="h-3 w-3" />
                  <span>Realisasi SP2D</span>
                </span>
                {importPreviewData.some(r => r['Nama_Program'] || r['Program']) && (
                  <span className="flex items-center gap-1 rounded-md bg-cyan-950/80 px-2 py-0.5 text-[11px] font-semibold text-cyan-300 border border-cyan-800">
                    <Check className="h-3 w-3" />
                    <span>Rincian Program</span>
                  </span>
                )}
                {importPreviewData.some(r => r['Nama_Kegiatan'] || r['Kegiatan']) && (
                  <span className="flex items-center gap-1 rounded-md bg-cyan-950/80 px-2 py-0.5 text-[11px] font-semibold text-cyan-300 border border-cyan-800">
                    <Check className="h-3 w-3" />
                    <span>Rincian Kegiatan</span>
                  </span>
                )}
                {importPreviewData.some(r => r['Nama_Sub_Kegiatan'] || r['Sub_Kegiatan']) && (
                  <span className="flex items-center gap-1 rounded-md bg-purple-950/80 px-2 py-0.5 text-[11px] font-semibold text-purple-300 border border-purple-800">
                    <Check className="h-3 w-3" />
                    <span>Sub Kegiatan</span>
                  </span>
                )}
                {importPreviewData.some(r => r['Nama_Rekening_Belanja'] || r['Rekening_Belanja'] || r['Nama_Belanja']) && (
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
                      <th className="p-3">Nama Organisasi (OPD)</th>
                      <th className="p-3">Kode SKPD / Singkatan</th>
                      <th className="p-3 text-right">Pagu Anggaran</th>
                      <th className="p-3 text-right">Realisasi SP2D</th>
                      <th className="p-3 text-center">% Serapan</th>
                      <th className="p-3 text-center">Status Pemetaan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-sans">
                    {importPreviewData.slice(0, 15).map((row, i) => {
                      const nama = String(row['Nama_OPD'] || row['nama_opd'] || row['OPD'] || row['Nama OPD'] || row['SKPD'] || '-');
                      const kode = String(row['Kode_OPD'] || row['kode_opd'] || row['Kode SKPD'] || '-');
                      const singk = String(row['Singkatan'] || row['singkatan'] || '');
                      const pagu = parseNumeric(row['Pagu_Anggaran'] || row['pagu'] || row['Pagu'] || row['Anggaran']);
                      const real = parseNumeric(row['Realisasi_SP2D'] || row['realisasi'] || row['Realisasi'] || row['SP2D']);
                      const pct = pagu > 0 ? (real / pagu) * 100 : 0;

                      const isMatch = opdListState.some(o => 
                        (kode !== '-' && o.kodeOPD.trim() === kode.trim()) ||
                        (singk && o.singkatan.toLowerCase() === singk.toLowerCase()) ||
                        (nama !== '-' && o.namaOPD.toLowerCase().includes(nama.toLowerCase()))
                      );

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
    </div>
  );
};
