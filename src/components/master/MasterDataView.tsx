import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NTBLogo } from '../common/NTBLogo';
import { OPD, Program, Kegiatan, SubKegiatan, Belanja, TahunAnggaran, SumberDana, Rekanan } from '../../types';
import { INITIAL_OPD } from '../../data/initialData';
import * as XLSX from 'xlsx';
import { safeDownloadExcel } from '../../utils/downloadHelper';
import {
  Database,
  Plus,
  Search,
  Building,
  Calendar,
  Layers,
  FileCode,
  Users,
  CreditCard,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Upload,
  RotateCcw,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  FileCheck,
  AlertCircle,
  Sparkles,
  Info
} from 'lucide-react';

interface MasterDataViewProps {
  initialSubTab?: string;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({ initialSubTab = 'master-program' }) => {
  const {
    selectedTahun,
    tahunList,
    opd,
    opdList,
    programs,
    kegiatanList,
    subKegiatanList,
    belanjaList,
    sumberDanaList,
    rekananList,
    addTahun,
    updateTahun,
    deleteTahun,
    addProgram,
    updateProgram,
    deleteProgram,
    addKegiatan,
    updateKegiatan,
    deleteKegiatan,
    addSubKegiatan,
    updateSubKegiatan,
    deleteSubKegiatan,
    addBelanja,
    updateBelanja,
    deleteBelanja,
    addSumberDana,
    updateSumberDana,
    deleteSumberDana,
    importProgramsBatch,
    importKegiatanBatch,
    importSubKegiatanBatch,
    importBelanjaBatch,
    addRekanan,
    updateRekanan,
    deleteRekanan,
    clearProgramDatabase,
    clearKegiatanDatabase,
    clearSubKegiatanDatabase,
    clearBelanjaDatabase,
    clearSumberDanaDatabase,
    clearRekananDatabase,
    addOpd,
    updateOpd,
    deleteOpd,
    importOpdLogo,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>(initialSubTab);

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    }
  }, [initialSubTab]);

  const [searchTerm, setSearchTerm] = useState('');

  // Modal forms state
  const [showAddModal, setShowAddModal] = useState(false);

  // Edit & Delete Modal States for all master data sub-menus
  const [editingTahun, setEditingTahun] = useState<TahunAnggaran | null>(null);
  const [deletingTahun, setDeletingTahun] = useState<TahunAnggaran | null>(null);

  const [editingOpd, setEditingOpd] = useState<OPD | null>(null);
  const [deletingOpd, setDeletingOpd] = useState<OPD | null>(null);

  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [origProgramKey, setOrigProgramKey] = useState<{ kode: string; tahun: number } | null>(null);
  const [deletingProgram, setDeletingProgram] = useState<Program | null>(null);

  const [editingKegiatan, setEditingKegiatan] = useState<Kegiatan | null>(null);
  const [origKegiatanKey, setOrigKegiatanKey] = useState<{ kode: string; tahun: number } | null>(null);
  const [deletingKegiatan, setDeletingKegiatan] = useState<Kegiatan | null>(null);

  const [editingSub, setEditingSub] = useState<SubKegiatan | null>(null);
  const [origSubKey, setOrigSubKey] = useState<{ kode: string; tahun: number } | null>(null);
  const [deletingSub, setDeletingSub] = useState<SubKegiatan | null>(null);

  const [editingBelanja, setEditingBelanja] = useState<Belanja | null>(null);
  const [origBelanjaKey, setOrigBelanjaKey] = useState<{ kode: string; tahun?: number } | null>(null);
  const [deletingBelanja, setDeletingBelanja] = useState<Belanja | null>(null);

  const [editingSumberDana, setEditingSumberDana] = useState<SumberDana | null>(null);
  const [deletingSumberDana, setDeletingSumberDana] = useState<SumberDana | null>(null);

  const [editingRekanan, setEditingRekanan] = useState<Rekanan | null>(null);
  const [deletingRekanan, setDeletingRekanan] = useState<Rekanan | null>(null);

  // Excel Import States
  const [showImportExcelModal, setShowImportExcelModal] = useState(false);
  const [showClearDbModal, setShowClearDbModal] = useState<
    'program' | 'kegiatan' | 'subkegiatan' | 'belanja' | 'sumberdana' | 'rekanan' | null
  >(null);
  const [clearTargetScope, setClearTargetScope] = useState<'selected' | 'all'>('selected');
  const [importCategory, setImportCategory] = useState<'program' | 'kegiatan' | 'subkegiatan' | 'belanja'>('program');
  const [importedFileName, setImportedFileName] = useState('');
  const [parsedDataPreview, setParsedDataPreview] = useState<any[]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Confirm Clear Database Handler
  const handleConfirmClearDb = () => {
    if (!showClearDbModal) return;
    if (showClearDbModal === 'program') {
      clearProgramDatabase(clearTargetScope === 'selected' ? selectedTahun : undefined);
    } else if (showClearDbModal === 'kegiatan') {
      clearKegiatanDatabase(clearTargetScope === 'selected' ? selectedTahun : undefined);
    } else if (showClearDbModal === 'subkegiatan') {
      clearSubKegiatanDatabase(clearTargetScope === 'selected' ? selectedTahun : undefined);
    } else if (showClearDbModal === 'belanja') {
      clearBelanjaDatabase(clearTargetScope === 'selected' ? selectedTahun : undefined);
    } else if (showClearDbModal === 'sumberdana') {
      clearSumberDanaDatabase();
    } else if (showClearDbModal === 'rekanan') {
      clearRekananDatabase();
    }
    setShowClearDbModal(null);
  };

  // Form states for manual additions
  const [formTahun, setFormTahun] = useState({ id: '', tahun: selectedTahun, keterangan: 'Tahun Anggaran Murni' });
  const [formProgram, setFormProgram] = useState({ kodeProgram: '', namaProgram: '' });
  const [formKegiatan, setFormKegiatan] = useState({ kodeProgram: '', kodeKegiatan: '', namaKegiatan: '' });
  const [formSub, setFormSub] = useState({ kodeProgram: '', kodeKegiatan: '', kodeSub: '', namaSub: '' });
  const [formBelanja, setFormBelanja] = useState({ kodeBelanja: '', namaBelanja: '', jenisBelanja: 'Belanja Barang dan Jasa' });
  const [formSumberDana, setFormSumberDana] = useState({ kodeSumber: '', namaSumber: '', keterangan: '' });
  const [formRekanan, setFormRekanan] = useState({
    namaRekanan: '',
    npwp: '',
    bank: 'Bank NTB Syariah',
    noRekening: '',
    alamat: '',
    kontak: ''
  });
  const [formOpd, setFormOpd] = useState<OPD>({
    kodeOPD: '',
    namaOPD: '',
    singkatan: '',
    kepalaBadan: '',
    nipKepala: '',
    logoUrl: ''
  });

  const isReadonly = currentUser.role === 'Auditor';

  // Logo file upload handler
  const handleFileUploadLogo = (e: React.ChangeEvent<HTMLInputElement>, targetOpd: OPD) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        importOpdLogo(targetOpd.id || targetOpd.kodeOPD, dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Reset to default NTB logo
  const handleResetDefaultLogo = (targetOpd: OPD) => {
    importOpdLogo(targetOpd.id || targetOpd.kodeOPD, '');
  };

  // Save edited OPD
  const handleSaveEditOpd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOpd) return;
    updateOpd(editingOpd.id || editingOpd.kodeOPD, editingOpd);
    setEditingOpd(null);
  };

  // Confirm delete OPD
  const handleConfirmDeleteOpd = () => {
    if (!deletingOpd) return;
    deleteOpd(deletingOpd.id || deletingOpd.kodeOPD);
    setDeletingOpd(null);
  };

  // Tahun Anggaran handlers
  const handleSaveEditTahun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTahun) return;
    updateTahun(editingTahun.id, editingTahun);
    setEditingTahun(null);
  };
  const handleConfirmDeleteTahun = () => {
    if (!deletingTahun) return;
    deleteTahun(deletingTahun.id);
    setDeletingTahun(null);
  };
  const handleSaveAddTahun = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTahun.tahun) return;
    addTahun({
      id: formTahun.id || `TAHUN-${formTahun.tahun}`,
      tahun: Number(formTahun.tahun),
      statusAktif: formTahun.tahun === selectedTahun,
      keterangan: formTahun.keterangan
    });
    setFormTahun({ id: '', tahun: selectedTahun, keterangan: 'Tahun Anggaran Murni' });
    setShowAddModal(false);
  };

  // Program handlers
  const handleSaveEditProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram) return;
    const oldKode = origProgramKey?.kode || editingProgram.kodeProgram;
    const oldTahun = origProgramKey?.tahun || editingProgram.tahun;
    updateProgram(oldKode, oldTahun, editingProgram);
    setEditingProgram(null);
    setOrigProgramKey(null);
  };
  const handleConfirmDeleteProgram = () => {
    if (!deletingProgram) return;
    deleteProgram(deletingProgram.kodeProgram, deletingProgram.tahun);
    setDeletingProgram(null);
  };

  // Kegiatan handlers
  const handleSaveEditKegiatan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKegiatan) return;
    const oldKode = origKegiatanKey?.kode || editingKegiatan.kodeKegiatan;
    const oldTahun = origKegiatanKey?.tahun || editingKegiatan.tahun;
    updateKegiatan(oldKode, oldTahun, editingKegiatan);
    setEditingKegiatan(null);
    setOrigKegiatanKey(null);
  };
  const handleConfirmDeleteKegiatan = () => {
    if (!deletingKegiatan) return;
    deleteKegiatan(deletingKegiatan.kodeKegiatan, deletingKegiatan.tahun);
    setDeletingKegiatan(null);
  };

  // Sub Kegiatan handlers
  const handleSaveEditSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    const oldKode = origSubKey?.kode || editingSub.kodeSub;
    const oldTahun = origSubKey?.tahun || editingSub.tahun;
    updateSubKegiatan(oldKode, oldTahun, editingSub);
    setEditingSub(null);
    setOrigSubKey(null);
  };
  const handleConfirmDeleteSub = () => {
    if (!deletingSub) return;
    deleteSubKegiatan(deletingSub.kodeSub, deletingSub.tahun);
    setDeletingSub(null);
  };

  // Belanja handlers
  const handleSaveEditBelanja = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBelanja) return;
    const oldKode = origBelanjaKey?.kode || editingBelanja.kodeBelanja;
    const oldTahun = origBelanjaKey?.tahun || editingBelanja.tahun || selectedTahun;
    updateBelanja(oldKode, oldTahun, editingBelanja);
    setEditingBelanja(null);
    setOrigBelanjaKey(null);
  };
  const handleConfirmDeleteBelanja = () => {
    if (!deletingBelanja) return;
    deleteBelanja(deletingBelanja.kodeBelanja, deletingBelanja.tahun);
    setDeletingBelanja(null);
  };

  // Sumber Dana handlers
  const handleSaveEditSumberDana = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSumberDana) return;
    const targetKey = editingSumberDana.id || editingSumberDana.kodeSumber;
    if (!targetKey) return;
    updateSumberDana(targetKey, editingSumberDana);
    setEditingSumberDana(null);
  };
  const handleConfirmDeleteSumberDana = () => {
    if (!editingSumberDana && !deletingSumberDana) return;
    const target = deletingSumberDana || editingSumberDana;
    if (!target) return;
    const targetKey = target.id || target.kodeSumber;
    if (!targetKey) return;
    deleteSumberDana(targetKey);
    setDeletingSumberDana(null);
  };
  const handleSaveAddSumberDana = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSumberDana.namaSumber) return;
    addSumberDana({
      kodeSumber: formSumberDana.kodeSumber || `SD-${Date.now().toString().slice(-4)}`,
      namaSumber: formSumberDana.namaSumber,
      keterangan: formSumberDana.keterangan
    });
    setFormSumberDana({ kodeSumber: '', namaSumber: '', keterangan: '' });
    setShowAddModal(false);
  };

  // Rekanan handlers
  const handleSaveEditRekanan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRekanan) return;
    updateRekanan(editingRekanan.id, editingRekanan);
    setEditingRekanan(null);
  };
  const handleConfirmDeleteRekanan = () => {
    if (!deletingRekanan) return;
    deleteRekanan(deletingRekanan.id);
    setDeletingRekanan(null);
  };

  // Save new OPD
  const handleSaveAddOpd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOpd.namaOPD || !formOpd.kodeOPD) return;
    addOpd({
      ...formOpd,
      id: `OPD-${Date.now().toString().slice(-4)}`
    });
    setFormOpd({
      kodeOPD: '',
      namaOPD: '',
      singkatan: '',
      kepalaBadan: '',
      nipKepala: '',
      logoUrl: ''
    });
    setShowAddModal(false);
  };

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProgram.kodeProgram || !formProgram.namaProgram) return;
    addProgram({
      kodeProgram: formProgram.kodeProgram,
      namaProgram: formProgram.namaProgram,
      tahun: selectedTahun
    });
    setFormProgram({ kodeProgram: '', namaProgram: '' });
    setShowAddModal(false);
  };

  const handleSaveKegiatan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formKegiatan.kodeKegiatan || !formKegiatan.namaKegiatan) return;
    addKegiatan({
      kodeProgram: formKegiatan.kodeProgram || (programs[0]?.kodeProgram || '5.01.01'),
      kodeKegiatan: formKegiatan.kodeKegiatan,
      namaKegiatan: formKegiatan.namaKegiatan,
      tahun: selectedTahun
    });
    setFormKegiatan({ kodeProgram: '', kodeKegiatan: '', namaKegiatan: '' });
    setShowAddModal(false);
  };

  const handleSaveSubKegiatan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSub.kodeSub || !formSub.namaSub) return;
    addSubKegiatan({
      kodeProgram: formSub.kodeProgram || (programs[0]?.kodeProgram || '5.01.01'),
      kodeKegiatan: formSub.kodeKegiatan || (kegiatanList[0]?.kodeKegiatan || '5.01.01.2.01'),
      kodeSub: formSub.kodeSub,
      namaSub: formSub.namaSub,
      tahun: selectedTahun
    });
    setFormSub({ kodeProgram: '', kodeKegiatan: '', kodeSub: '', namaSub: '' });
    setShowAddModal(false);
  };

  const handleSaveBelanja = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formBelanja.kodeBelanja || !formBelanja.namaBelanja) return;
    addBelanja({
      kodeBelanja: formBelanja.kodeBelanja,
      namaBelanja: formBelanja.namaBelanja,
      jenisBelanja: formBelanja.jenisBelanja,
      tahun: selectedTahun
    });
    setFormBelanja({ kodeBelanja: '', namaBelanja: '', jenisBelanja: 'Belanja Barang dan Jasa' });
    setShowAddModal(false);
  };

  const handleSaveRekanan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRekanan.namaRekanan) return;
    addRekanan(formRekanan);
    setFormRekanan({
      namaRekanan: '',
      npwp: '',
      bank: 'Bank NTB Syariah',
      noRekening: '',
      alamat: '',
      kontak: ''
    });
    setShowAddModal(false);
  };

  // EXCEL IMPORT FUNCTIONS
  const openImportModalForTab = (cat?: 'program' | 'kegiatan' | 'subkegiatan' | 'belanja') => {
    if (cat) {
      setImportCategory(cat);
    } else {
      if (activeTab === 'master-program') setImportCategory('program');
      else if (activeTab === 'master-kegiatan') setImportCategory('kegiatan');
      else if (activeTab === 'master-subkegiatan') setImportCategory('subkegiatan');
      else if (activeTab === 'master-belanja') setImportCategory('belanja');
      else setImportCategory('program');
    }
    setImportedFileName('');
    setParsedDataPreview([]);
    setImportErrors([]);
    setImportSuccessMsg(null);
    setShowImportExcelModal(true);
  };

  const handleDownloadTemplate = (cat: 'program' | 'kegiatan' | 'subkegiatan' | 'belanja') => {
    let sampleData: any[] = [];
    let filename = '';

    if (cat === 'program') {
      filename = 'Template_Master_Program_NTB.xlsx';
      sampleData = [
        { 'Kode Program': '5.01.01', 'Nama Program': 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI', 'Tahun': selectedTahun },
        { 'Kode Program': '5.01.02', 'Nama Program': 'PROGRAM BINA IDEOLOGI DAN WAWASAN KEBANGSAAN', 'Tahun': selectedTahun },
        { 'Kode Program': '5.01.03', 'Nama Program': 'PROGRAM PENYELENGGARAAN POLITIK DAN PEMERINTAHAN UMUM', 'Tahun': selectedTahun }
      ];
    } else if (cat === 'kegiatan') {
      filename = 'Template_Master_Kegiatan_NTB.xlsx';
      sampleData = [
        { 'Kode Program': '5.01.01', 'Nama Program': 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI', 'Kode Kegiatan': '5.01.01.2.01', 'Nama Kegiatan': 'Perencanaan, Penganggaran, dan Evaluasi Kinerja Perangkat Daerah', 'Tahun': selectedTahun },
        { 'Kode Program': '5.01.01', 'Nama Program': 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI', 'Kode Kegiatan': '5.01.01.2.02', 'Nama Kegiatan': 'Administrasi Keuangan Perangkat Daerah', 'Tahun': selectedTahun },
        { 'Kode Program': '5.01.02', 'Nama Program': 'PROGRAM BINA IDEOLOGI DAN WAWASAN KEBANGSAAN', 'Kode Kegiatan': '5.01.02.2.01', 'Nama Kegiatan': 'Perumusan Kebijakan Teknis Kebangsaan', 'Tahun': selectedTahun }
      ];
    } else if (cat === 'subkegiatan') {
      filename = 'Template_Master_Sub_Kegiatan_NTB.xlsx';
      sampleData = [
        { 'Kode Program': '5.01.01', 'Nama Program': 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI', 'Kode Kegiatan': '5.01.01.2.01', 'Nama Kegiatan': 'Perencanaan, Penganggaran, dan Evaluasi Kinerja Perangkat Daerah', 'Kode Sub Kegiatan': '5.01.01.2.01.0001', 'Nama Sub Kegiatan': 'Penyusunan Dokumen Perencanaan Perangkat Daerah', 'Tahun': selectedTahun },
        { 'Kode Program': '5.01.01', 'Nama Program': 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI', 'Kode Kegiatan': '5.01.01.2.02', 'Nama Kegiatan': 'Administrasi Keuangan Perangkat Daerah', 'Kode Sub Kegiatan': '5.01.01.2.02.0001', 'Nama Sub Kegiatan': 'Penyediaan Gaji dan Tunjangan ASN', 'Tahun': selectedTahun },
        { 'Kode Program': '5.01.01', 'Nama Program': 'PROGRAM PENUNJANG URUSAN PEMERINTAHAN DAERAH PROVINSI', 'Kode Kegiatan': '5.01.01.2.02', 'Nama Kegiatan': 'Administrasi Keuangan Perangkat Daerah', 'Kode Sub Kegiatan': '5.01.01.2.02.0005', 'Nama Sub Kegiatan': 'Koordinasi dan Penyusunan Laporan Keuangan Sub-Sistem', 'Tahun': selectedTahun }
      ];
    } else if (cat === 'belanja') {
      filename = 'Template_Master_Belanja_Rekening_NTB.xlsx';
      sampleData = [
        { 'Kode Rekening': '5.1.01.01.01.0001', 'Uraian Belanja': 'Belanja Gaji Pokok ASN', 'Jenis Belanja': 'Belanja Pegawai', 'Tahun': selectedTahun },
        { 'Kode Rekening': '5.1.02.01.01.0024', 'Uraian Belanja': 'Belanja Alat Tulis Kantor (ATK)', 'Jenis Belanja': 'Belanja Barang dan Jasa', 'Tahun': selectedTahun },
        { 'Kode Rekening': '5.2.02.05.01.0001', 'Uraian Belanja': 'Belanja Modal Peralatan Komputer dan Server', 'Jenis Belanja': 'Belanja Modal', 'Tahun': selectedTahun }
      ];
    }

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Master_Data');
    safeDownloadExcel(wb, filename);
  };

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
        const rawJson: any[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          setImportErrors(['File Excel kosong atau format tabel tidak dapat dibaca.']);
          setParsedDataPreview([]);
          return;
        }

        const normalizedRows: any[] = [];
        const errs: string[] = [];

        rawJson.forEach((row, idx) => {
          // Flexible column reader with multi-alias matching
          const getVal = (...keys: string[]) => {
            for (const key of keys) {
              const matchedKey = Object.keys(row).find(
                k => k.trim().toLowerCase().replace(/[\s_-]/g, '') === key.toLowerCase().replace(/[\s_-]/g, '')
              );
              if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== '') {
                return String(row[matchedKey]).trim();
              }
            }
            return '';
          };

          const rowTahun = parseInt(getVal('tahun', 'tahunanggaran', 'thn') || String(selectedTahun), 10) || selectedTahun;

          if (importCategory === 'program') {
            const kodeProgram = getVal('kodeprogram', 'kodeprog', 'kodeskpd', 'kode');
            const namaProgram = getVal('namaprogram', 'namaprog', 'uraianprogram', 'uraian', 'program', 'nama');

            if (!kodeProgram || !namaProgram) {
              errs.push(`Baris ${idx + 2}: Kode atau Nama Program kosong.`);
            } else {
              normalizedRows.push({
                kodeProgram,
                namaProgram,
                tahun: rowTahun,
                status: 'Valid'
              });
            }
          } else if (importCategory === 'kegiatan') {
            const kodeProgram = getVal('kodeprogram', 'kodeprog', 'kodeprogramskpd') || '5.01.01';
            const namaProgram = getVal('namaprogram', 'namaprog', 'uraianprogram', 'program');
            const kodeKegiatan = getVal('kodekegiatan', 'kodekeg', 'kode');
            const namaKegiatan = getVal('namakegiatan', 'namakeg', 'uraiankegiatan', 'uraian', 'kegiatan', 'nama');

            if (!kodeKegiatan || !namaKegiatan) {
              errs.push(`Baris ${idx + 2}: Kode atau Nama Kegiatan kosong.`);
            } else {
              normalizedRows.push({
                kodeProgram,
                namaProgram,
                kodeKegiatan,
                namaKegiatan,
                tahun: rowTahun,
                status: 'Valid'
              });
            }
          } else if (importCategory === 'subkegiatan') {
            const kodeProgram = getVal('kodeprogram', 'kodeprog') || '5.01.01';
            const namaProgram = getVal('namaprogram', 'namaprog', 'uraianprogram', 'program');
            const kodeKegiatan = getVal('kodekegiatan', 'kodekeg') || '5.01.01.2.01';
            const namaKegiatan = getVal('namakegiatan', 'namakeg', 'uraiankegiatan', 'kegiatan');
            const kodeSub = getVal('kodesubkegiatan', 'kodesub', 'kodesubkeg', 'kode');
            const namaSub = getVal('namasubkegiatan', 'namasub', 'namasubkeg', 'uraiansubkegiatan', 'uraiansub', 'uraian', 'namasub');

            if (!kodeSub || !namaSub) {
              errs.push(`Baris ${idx + 2}: Kode atau Nama Sub Kegiatan kosong.`);
            } else {
              normalizedRows.push({
                kodeProgram,
                namaProgram,
                kodeKegiatan,
                namaKegiatan,
                kodeSub,
                namaSub,
                tahun: rowTahun,
                status: 'Valid'
              });
            }
          } else if (importCategory === 'belanja') {
            const kodeBelanja = getVal('koderekening', 'kodebelanja', 'kode', 'rekening');
            const namaBelanja = getVal('uraianbelanja', 'namabelanja', 'uraian', 'namarekening');
            const jenisBelanja = getVal('jenisbelanja', 'jenis') || 'Belanja Barang dan Jasa';

            if (!kodeBelanja || !namaBelanja) {
              errs.push(`Baris ${idx + 2}: Kode Rekening atau Uraian Belanja kosong.`);
            } else {
              normalizedRows.push({
                kodeBelanja,
                namaBelanja,
                jenisBelanja,
                tahun: rowTahun,
                status: 'Valid'
              });
            }
          }
        });

        setParsedDataPreview(normalizedRows);
        setImportErrors(errs);
      } catch (err: any) {
        console.error('Failed to parse Excel:', err);
        setImportErrors([`Gagal membaca file Excel: ${err?.message || 'Format file salah'}`]);
        setParsedDataPreview([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleProcessImportExcel = () => {
    if (parsedDataPreview.length === 0) return;

    if (importCategory === 'program') {
      const progList: Program[] = parsedDataPreview.map(r => ({
        kodeProgram: r.kodeProgram,
        namaProgram: r.namaProgram,
        tahun: r.tahun
      }));
      const result = importProgramsBatch(progList);
      setImportSuccessMsg(`Berhasil mengimpor ${result.successCount} data Program baru (${result.duplicateCount} data Program diperbarui secara otomatis).`);
    } else if (importCategory === 'kegiatan') {
      // Auto save parent Program data if included in Excel file
      const autoProgramsMap = new Map<string, Program>();
      parsedDataPreview.forEach(r => {
        if (r.kodeProgram && r.namaProgram) {
          const keyP = `${r.kodeProgram}_${r.tahun}`;
          if (!autoProgramsMap.has(keyP)) {
            autoProgramsMap.set(keyP, {
              kodeProgram: r.kodeProgram,
              namaProgram: r.namaProgram,
              tahun: r.tahun
            });
          }
        }
      });

      let progSavedCount = 0;
      if (autoProgramsMap.size > 0) {
        const progRes = importProgramsBatch(Array.from(autoProgramsMap.values()));
        progSavedCount = progRes.successCount + progRes.duplicateCount;
      }

      const kegList: Kegiatan[] = parsedDataPreview.map(r => ({
        kodeProgram: r.kodeProgram,
        kodeKegiatan: r.kodeKegiatan,
        namaKegiatan: r.namaKegiatan,
        tahun: r.tahun
      }));
      const result = importKegiatanBatch(kegList);
      setImportSuccessMsg(`Berhasil mengimpor ${result.successCount} data Kegiatan (${result.duplicateCount} diperbarui). ${progSavedCount > 0 ? `${progSavedCount} data Program terkait otomatis tersimpan!` : ''}`);
    } else if (importCategory === 'subkegiatan') {
      // Auto save parent Program & Kegiatan data if included in Excel file
      const autoProgramsMap = new Map<string, Program>();
      const autoKegiatanMap = new Map<string, Kegiatan>();

      parsedDataPreview.forEach(r => {
        if (r.kodeProgram && r.namaProgram) {
          const keyP = `${r.kodeProgram}_${r.tahun}`;
          if (!autoProgramsMap.has(keyP)) {
            autoProgramsMap.set(keyP, {
              kodeProgram: r.kodeProgram,
              namaProgram: r.namaProgram,
              tahun: r.tahun
            });
          }
        }
        if (r.kodeProgram && r.kodeKegiatan && r.namaKegiatan) {
          const keyK = `${r.kodeKegiatan}_${r.tahun}`;
          if (!autoKegiatanMap.has(keyK)) {
            autoKegiatanMap.set(keyK, {
              kodeProgram: r.kodeProgram,
              kodeKegiatan: r.kodeKegiatan,
              namaKegiatan: r.namaKegiatan,
              tahun: r.tahun
            });
          }
        }
      });

      if (autoProgramsMap.size > 0) {
        importProgramsBatch(Array.from(autoProgramsMap.values()));
      }
      if (autoKegiatanMap.size > 0) {
        importKegiatanBatch(Array.from(autoKegiatanMap.values()));
      }

      const subList: SubKegiatan[] = parsedDataPreview.map(r => ({
        kodeProgram: r.kodeProgram,
        kodeKegiatan: r.kodeKegiatan,
        kodeSub: r.kodeSub,
        namaSub: r.namaSub,
        tahun: r.tahun
      }));
      const result = importSubKegiatanBatch(subList);
      setImportSuccessMsg(`Berhasil mengimpor ${result.successCount} data Sub Kegiatan (${result.duplicateCount} diperbarui). Data Program & Kegiatan terkait otomatis tersimpan!`);
    } else if (importCategory === 'belanja') {
      const result = importBelanjaBatch(parsedDataPreview as Belanja[]);
      setImportSuccessMsg(`Berhasil mengimpor ${result.successCount} data Belanja Rekening baru (${result.duplicateCount} data duplikat diperbarui).`);
    }

    setParsedDataPreview([]);
    setImportedFileName('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Master Data Keuangan</h1>
          </div>
          <p className="text-xs text-slate-400">
            Pengelolaan Referensi Master Tahun, OPD, Program, Kegiatan, Sub-Kegiatan, Rekening Belanja & Rekanan
          </p>
        </div>

        {!isReadonly && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openImportModalForTab()}
              className="flex items-center gap-2 rounded-xl bg-teal-600/90 hover:bg-teal-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-teal-950/50 transition"
              id="btn-import-master-excel"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Import File Excel</span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-lg shadow-emerald-950/50"
              id="btn-add-master"
            >
              <Plus className="h-4 w-4" />
              <span>Tambah Data Manual</span>
            </button>
          </div>
        )}
      </div>

      {/* Sub Tabs Navigation */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-800 pb-2 scrollbar-none">
        {[
          { id: 'master-tahun', label: 'Tahun Anggaran' },
          { id: 'master-opd', label: 'OPD / Unit Kerja' },
          { id: 'master-program', label: 'Program' },
          { id: 'master-kegiatan', label: 'Kegiatan' },
          { id: 'master-subkegiatan', label: 'Sub Kegiatan' },
          { id: 'master-belanja', label: 'Belanja Rekening' },
          { id: 'master-sumberdana', label: 'Sumber Dana' },
          { id: 'master-rekanan', label: 'Data Rekanan' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSearchTerm('');
            }}
            className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar & Quick Import Helper Banner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 flex items-center rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
          <Search className="h-4 w-4 text-slate-400 mr-2" />
          <input
            type="text"
            placeholder="Cari kata kunci di master data..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>


      </div>

      {/* TAB CONTENT: MASTER TAHUN */}
      {activeTab === 'master-tahun' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Tahun Anggaran</th>
                <th className="px-4 py-3">Status Sistem</th>
                <th className="px-4 py-3">Keterangan</th>
                {!isReadonly && <th className="px-4 py-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {tahunList.map(t => (
                <tr key={t.id} className="hover:bg-slate-800/50">
                  <td className="px-4 py-3 font-mono font-bold text-emerald-400">{t.id}</td>
                  <td className="px-4 py-3 text-sm font-bold text-white">{t.tahun}</td>
                  <td className="px-4 py-3">
                    {t.tahun === selectedTahun ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 px-2.5 py-1 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-500">
                        <CheckCircle2 className="h-3 w-3" /> Sedang Dipilih
                      </span>
                    ) : (
                      <span className="text-slate-500">Inaktif</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-400">{t.keterangan}</td>
                  {!isReadonly && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingTahun(t)}
                          className="rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-600/40 p-1.5 text-amber-300 transition"
                          title="Edit Tahun"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingTahun(t)}
                          className="rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-600/40 p-1.5 text-rose-300 transition"
                          title="Hapus Tahun"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: OPD / UNIT KERJA */}
      {activeTab === 'master-opd' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <Building className="h-7 w-7 text-emerald-400" />
              <div>
                <h2 className="text-base font-bold text-white">Daftar OPD & Unit Kerja Sub-Sistem</h2>
                <p className="text-xs text-slate-400">
                  Kelola identitas Organisasi Perangkat Daerah, Pejabat Kepala Badan, Edit/Hapus Data & Import Logo Resmi Provinsi NTB
                </p>
              </div>
            </div>
            {!isReadonly && (
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow transition"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah OPD Baru</span>
              </button>
            )}
          </div>

          {opdList.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center space-y-3">
              <Building className="h-10 w-10 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-400">Belum ada data OPD/Unit Kerja terdaftar.</p>
              <button
                onClick={() => addOpd(INITIAL_OPD)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow"
              >
                Muat Ulang Default BAKESBANGPOLDAGRI NTB
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {opdList
                .filter(
                  item =>
                    item.namaOPD.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.singkatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.kodeOPD.includes(searchTerm)
                )
                .map(item => (
                  <div
                    key={item.id || item.kodeOPD}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-xl hover:border-emerald-500/40 transition"
                  >
                    <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                      <div className="flex items-center gap-4">
                        <div className="relative group flex-shrink-0">
                          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 p-0.5 border border-emerald-500/40 shadow-inner overflow-hidden">
                            {item.logoUrl ? (
                              <img
                                src={item.logoUrl}
                                alt="Logo NTB"
                                className="h-full w-full object-cover rounded-xl"
                              />
                            ) : (
                              <NTBLogo className="h-full w-full" />
                            )}
                          </div>

                          {!isReadonly && (
                            <label
                              className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-slate-950/85 text-emerald-300 opacity-0 group-hover:opacity-100 transition cursor-pointer p-1 text-center"
                              title="Klik untuk Upload Logo Baru"
                            >
                              <Upload className="h-4 w-4 text-emerald-400" />
                              <span className="text-[9px] font-bold mt-0.5">Ubah Logo</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => handleFileUploadLogo(e, item)}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>

                        <div>
                          <span className="rounded bg-emerald-950 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800">
                            {item.singkatan}
                          </span>
                          <h3 className="text-sm font-bold text-white mt-1 leading-snug">
                            {item.namaOPD}
                          </h3>
                          <p className="font-mono text-slate-400 text-[11px] mt-0.5">
                            Kode SKPD: {item.kodeOPD}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="rounded-xl bg-slate-950 p-3 border border-slate-800">
                        <span className="text-slate-400 text-[11px]">Kepala Badan / SKPD:</span>
                        <p className="font-bold text-white mt-0.5">{item.kepalaBadan}</p>
                        <p className="font-mono text-slate-400 text-[10px]">NIP. {item.nipKepala}</p>
                      </div>

                      <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 flex flex-col justify-between">
                        <span className="text-slate-400 text-[11px]">Logo Provinsi NTB:</span>
                        <div className="flex items-center gap-2 mt-1">
                          {item.logoUrl ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Logo Kustom Impor
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-bold text-[11px]">
                              <NTBLogo size={14} /> Vector NTB Default
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {!isReadonly && (
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-4">
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 cursor-pointer rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-1.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30 transition">
                            <Upload className="h-3.5 w-3.5" />
                            <span>Import Logo NTB</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={e => handleFileUploadLogo(e, item)}
                              className="hidden"
                            />
                          </label>

                          {item.logoUrl && (
                            <button
                              onClick={() => handleResetDefaultLogo(item)}
                              className="flex items-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition"
                              title="Reset ke Logo Vector NTB Default"
                            >
                              <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                              <span className="text-[11px]">Reset Logo</span>
                            </button>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingOpd(item)}
                            className="flex items-center gap-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-600/40 px-3 py-1.5 text-xs font-bold text-amber-300 transition"
                            title="Edit Data OPD"
                          >
                            <Edit className="h-3.5 w-3.5" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => setDeletingOpd(item)}
                            className="flex items-center gap-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-600/40 px-3 py-1.5 text-xs font-bold text-rose-300 transition"
                            title="Hapus Data OPD"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: PROGRAM */}
      {activeTab === 'master-program' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300">
              Total Program: {programs.filter(p => p.tahun === selectedTahun).length} item (Tahun {selectedTahun})
            </span>
            {!isReadonly && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowClearDbModal('program');
                    setClearTargetScope('selected');
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-900/60 bg-rose-950/40 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-900/60 hover:border-rose-700 transition"
                  title="Kosongkan Database Master Program"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus Database Program</span>
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Program</span>
                </button>
              </div>
            )}
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Kode Program</th>
                <th className="px-4 py-3">Nama Program</th>
                <th className="px-4 py-3">Tahun</th>
                {!isReadonly && <th className="px-4 py-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {programs
                .filter(
                  p =>
                    p.tahun === selectedTahun &&
                    (p.kodeProgram.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      p.namaProgram.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">{p.kodeProgram}</td>
                    <td className="px-4 py-3 font-semibold text-white">{p.namaProgram}</td>
                    <td className="px-4 py-3">{p.tahun}</td>
                    {!isReadonly && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingProgram({ ...p });
                              setOrigProgramKey({ kode: p.kodeProgram, tahun: p.tahun });
                            }}
                            className="rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-600/40 p-1.5 text-amber-300 transition"
                            title="Edit Program"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingProgram(p)}
                            className="rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-600/40 p-1.5 text-rose-300 transition"
                            title="Hapus Program"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: KEGIATAN */}
      {activeTab === 'master-kegiatan' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300">
              Total Kegiatan: {kegiatanList.filter(k => k.tahun === selectedTahun).length} item (Tahun {selectedTahun})
            </span>
            {!isReadonly && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowClearDbModal('kegiatan');
                    setClearTargetScope('selected');
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-900/60 bg-rose-950/40 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-900/60 hover:border-rose-700 transition"
                  title="Kosongkan Database Master Kegiatan"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus Database Kegiatan</span>
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Kegiatan</span>
                </button>
              </div>
            )}
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Kode Program</th>
                <th className="px-4 py-3">Kode Kegiatan</th>
                <th className="px-4 py-3">Nama Kegiatan</th>
                <th className="px-4 py-3">Tahun</th>
                {!isReadonly && <th className="px-4 py-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {kegiatanList
                .filter(
                  k =>
                    k.tahun === selectedTahun &&
                    (k.kodeKegiatan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      k.namaKegiatan.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map((k, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-slate-400">{k.kodeProgram}</td>
                    <td className="px-4 py-3 font-mono font-bold text-teal-400">{k.kodeKegiatan}</td>
                    <td className="px-4 py-3 font-semibold text-white">{k.namaKegiatan}</td>
                    <td className="px-4 py-3">{k.tahun}</td>
                    {!isReadonly && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingKegiatan({ ...k });
                              setOrigKegiatanKey({ kode: k.kodeKegiatan, tahun: k.tahun });
                            }}
                            className="rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-600/40 p-1.5 text-amber-300 transition"
                            title="Edit Kegiatan"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingKegiatan(k)}
                            className="rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-600/40 p-1.5 text-rose-300 transition"
                            title="Hapus Kegiatan"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: SUB KEGIATAN */}
      {activeTab === 'master-subkegiatan' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300">
              Total Sub Kegiatan: {subKegiatanList.filter(s => s.tahun === selectedTahun).length} item (Tahun {selectedTahun})
            </span>
            {!isReadonly && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowClearDbModal('subkegiatan');
                    setClearTargetScope('selected');
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-900/60 bg-rose-950/40 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-900/60 hover:border-rose-700 transition"
                  title="Kosongkan Database Master Sub Kegiatan"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus Database Sub Kegiatan</span>
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Sub Kegiatan</span>
                </button>
              </div>
            )}
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Kode Kegiatan</th>
                <th className="px-4 py-3">Kode Sub Kegiatan</th>
                <th className="px-4 py-3">Nama Sub Kegiatan</th>
                <th className="px-4 py-3">Tahun</th>
                {!isReadonly && <th className="px-4 py-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {subKegiatanList
                .filter(
                  s =>
                    s.tahun === selectedTahun &&
                    (s.kodeSub.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      s.namaSub.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map((s, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono text-slate-400">{s.kodeKegiatan}</td>
                    <td className="px-4 py-3 font-mono font-bold text-amber-400">{s.kodeSub}</td>
                    <td className="px-4 py-3 font-semibold text-white">{s.namaSub}</td>
                    <td className="px-4 py-3">{s.tahun}</td>
                    {!isReadonly && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingSub({ ...s });
                              setOrigSubKey({ kode: s.kodeSub, tahun: s.tahun });
                            }}
                            className="rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-600/40 p-1.5 text-amber-300 transition"
                            title="Edit Sub Kegiatan"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingSub(s)}
                            className="rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-600/40 p-1.5 text-rose-300 transition"
                            title="Hapus Sub Kegiatan"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: BELANJA */}
      {activeTab === 'master-belanja' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300">
              Total Belanja Rekening: {belanjaList.length} item
            </span>
            {!isReadonly && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowClearDbModal('belanja');
                    setClearTargetScope('selected');
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-900/60 bg-rose-950/40 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-900/60 hover:border-rose-700 transition"
                  title="Kosongkan Database Master Belanja Rekening"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus Database Belanja</span>
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Belanja</span>
                </button>
              </div>
            )}
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Kode Rekening</th>
                <th className="px-4 py-3">Nama Uraian Belanja</th>
                <th className="px-4 py-3">Jenis Belanja</th>
                {!isReadonly && <th className="px-4 py-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {belanjaList
                .filter(
                  b =>
                    b.kodeBelanja.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    b.namaBelanja.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map((b, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">{b.kodeBelanja}</td>
                    <td className="px-4 py-3 font-semibold text-white">{b.namaBelanja}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                        {b.jenisBelanja}
                      </span>
                    </td>
                    {!isReadonly && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingBelanja({ ...b });
                              setOrigBelanjaKey({ kode: b.kodeBelanja, tahun: b.tahun });
                            }}
                            className="rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-600/40 p-1.5 text-amber-300 transition"
                            title="Edit Belanja"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingBelanja(b)}
                            className="rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-600/40 p-1.5 text-rose-300 transition"
                            title="Hapus Belanja"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: SUMBER DANA */}
      {activeTab === 'master-sumberdana' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300">
              Total Sumber Dana: {sumberDanaList.length} item
            </span>
            {!isReadonly && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowClearDbModal('sumberdana');
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-900/60 bg-rose-950/40 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-900/60 hover:border-rose-700 transition"
                  title="Kosongkan Database Master Sumber Dana"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus Database Sumber Dana</span>
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Sumber Dana</span>
                </button>
              </div>
            )}
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Kode / ID</th>
                <th className="px-4 py-3">Nama Sumber Dana</th>
                <th className="px-4 py-3">Keterangan</th>
                {!isReadonly && <th className="px-4 py-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {sumberDanaList
                .filter(
                  sd =>
                    (sd.namaSumber || sd.nama || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (sd.kodeSumber || sd.id || '').toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(sd => (
                  <tr key={sd.id || sd.kodeSumber} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-400">{sd.kodeSumber || sd.id}</td>
                    <td className="px-4 py-3 font-bold text-white">{sd.namaSumber || sd.nama}</td>
                    <td className="px-4 py-3 text-slate-400">{sd.keterangan || '-'}</td>
                    {!isReadonly && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingSumberDana(sd)}
                            className="rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-600/40 p-1.5 text-amber-300 transition"
                            title="Edit Sumber Dana"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingSumberDana(sd)}
                            className="rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-600/40 p-1.5 text-rose-300 transition"
                            title="Hapus Sumber Dana"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT: REKANAN */}
      {activeTab === 'master-rekanan' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
          <div className="flex items-center justify-between p-4 bg-slate-950 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300">
              Total Rekanan: {rekananList.length} item
            </span>
            {!isReadonly && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowClearDbModal('rekanan');
                  }}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-900/60 bg-rose-950/40 px-3 py-1.5 text-xs font-bold text-rose-400 hover:bg-rose-900/60 hover:border-rose-700 transition"
                  title="Kosongkan Database Master Data Rekanan"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus Database Rekanan</span>
                </button>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-500 shadow"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Rekanan</span>
                </button>
              </div>
            )}
          </div>
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Nama Rekanan / Penyedia</th>
                <th className="px-4 py-3">NPWP</th>
                <th className="px-4 py-3">Bank & No Rekening</th>
                <th className="px-4 py-3">Alamat</th>
                <th className="px-4 py-3">Kontak</th>
                {!isReadonly && <th className="px-4 py-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {rekananList
                .filter(
                  r =>
                    r.namaRekanan.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.npwp.includes(searchTerm)
                )
                .map(r => (
                  <tr key={r.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-bold text-white">{r.namaRekanan}</td>
                    <td className="px-4 py-3 font-mono text-amber-300">{r.npwp}</td>
                    <td className="px-4 py-3 font-mono text-emerald-400">
                      {r.bank} - {r.noRekening}
                    </td>
                    <td className="px-4 py-3 text-slate-400">{r.alamat}</td>
                    <td className="px-4 py-3 text-slate-300">{r.kontak}</td>
                    {!isReadonly && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setEditingRekanan(r)}
                            className="rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-600/40 p-1.5 text-amber-300 transition"
                            title="Edit Rekanan"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingRekanan(r)}
                            className="rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-600/40 p-1.5 text-rose-300 transition"
                            title="Hapus Rekanan"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL IMPORT EXCEL MASTER DATA */}
      {showImportExcelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl border border-teal-700/60 bg-slate-900 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto scrollbar-none">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-6 w-6 text-teal-400" />
                <div>
                  <h3 className="text-base font-bold text-white">Import Master Data via File Excel</h3>
                  <p className="text-xs text-slate-400">
                    Unggah file Excel (.xlsx / .xls) untuk memperbarui data Program, Kegiatan, Sub Kegiatan & Belanja
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportExcelModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            {/* Category Switcher Tabs */}
            <div className="flex flex-wrap gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800">
              {[
                { id: 'program', label: 'Program' },
                { id: 'kegiatan', label: 'Kegiatan' },
                { id: 'subkegiatan', label: 'Sub Kegiatan' },
                { id: 'belanja', label: 'Belanja Rekening' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setImportCategory(cat.id as any);
                    setParsedDataPreview([]);
                    setImportedFileName('');
                    setImportErrors([]);
                    setImportSuccessMsg(null);
                  }}
                  className={`flex-1 min-w-[120px] py-2 px-3 text-xs font-bold rounded-xl transition ${
                    importCategory === cat.id
                      ? 'bg-teal-600 text-white shadow'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Download Template Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-teal-950/50 border border-teal-800/50 p-4 text-xs">
              <div className="flex items-start gap-2.5">
                <Info className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-teal-200">
                    Gunakan Format Kolom Baku Master {importCategory.toUpperCase()}
                  </p>
                  <p className="text-[11px] text-teal-300/80 mt-0.5">
                    {importCategory === 'program' && 'Kolom wajib: Kode Program, Nama Program, Tahun'}
                    {importCategory === 'kegiatan' && 'Kolom wajib: Kode Program, Kode Kegiatan, Nama Kegiatan, Tahun'}
                    {importCategory === 'subkegiatan' && 'Kolom wajib: Kode Program, Kode Kegiatan, Kode Sub Kegiatan, Nama Sub Kegiatan, Tahun'}
                    {importCategory === 'belanja' && 'Kolom wajib: Kode Rekening, Uraian Belanja, Jenis Belanja, Tahun'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDownloadTemplate(importCategory)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-teal-800 hover:bg-teal-700 text-white px-3.5 py-2 font-bold shadow text-xs transition flex-shrink-0"
              >
                <Download className="h-4 w-4" />
                <span>Unduh Template Excel</span>
              </button>
            </div>

            {/* Success Alert */}
            {importSuccessMsg && (
              <div className="rounded-2xl border border-emerald-600/60 bg-emerald-950/60 p-4 flex items-start gap-3 text-emerald-200 text-xs">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{importSuccessMsg}</p>
                  <p className="text-[11px] text-emerald-300/80 mt-0.5">Data master berhasil masuk ke dalam sistem dan terkomit di memori lokal.</p>
                </div>
              </div>
            )}

            {/* Error Messages */}
            {importErrors.length > 0 && (
              <div className="rounded-2xl border border-rose-600/60 bg-rose-950/60 p-4 space-y-1 text-rose-200 text-xs">
                <div className="flex items-center gap-2 font-bold text-rose-300">
                  <AlertCircle className="h-4 w-4" />
                  <span>Peringatan / Catatan Parsing Excel:</span>
                </div>
                <ul className="list-disc list-inside text-[11px] space-y-0.5 text-rose-200/90 max-h-24 overflow-y-auto">
                  {importErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* File Upload Drop Zone */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Pilih File Excel (.xlsx / .xls / .csv):
              </label>
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-teal-600/40 hover:border-teal-400 bg-slate-950 p-6 rounded-2xl cursor-pointer transition text-center">
                <Upload className="h-8 w-8 text-teal-400" />
                <div>
                  <p className="text-xs font-bold text-white">
                    {importedFileName ? `File Terpilih: ${importedFileName}` : 'Klik atau Drag & Drop File Excel di sini'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Mendukung format .xlsx, .xls, .csv buatan Microsoft Excel atau Google Spreadsheet
                  </p>
                </div>
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileUploadExcel}
                  className="hidden"
                />
              </label>
            </div>

            {/* Data Preview Table */}
            {parsedDataPreview.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-300 flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4" /> Pratinjau Data Parsed ({parsedDataPreview.length} baris)
                  </span>
                  <span className="text-[11px] text-slate-400">Siap diimpor ke Master {importCategory.toUpperCase()}</span>
                </div>

                <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-2xl bg-slate-950 text-xs scrollbar-none">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-slate-300 font-bold sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2">No</th>
                        {importCategory === 'program' && (
                          <>
                            <th className="px-3 py-2">Kode Program</th>
                            <th className="px-3 py-2">Nama Program</th>
                            <th className="px-3 py-2">Tahun</th>
                          </>
                        )}
                        {importCategory === 'kegiatan' && (
                          <>
                            <th className="px-3 py-2">Kode Prog</th>
                            <th className="px-3 py-2">Nama Program</th>
                            <th className="px-3 py-2">Kode Kegiatan</th>
                            <th className="px-3 py-2">Nama Kegiatan</th>
                            <th className="px-3 py-2">Tahun</th>
                          </>
                        )}
                        {importCategory === 'subkegiatan' && (
                          <>
                            <th className="px-3 py-2">Kode Prog</th>
                            <th className="px-3 py-2">Nama Program</th>
                            <th className="px-3 py-2">Kode Sub</th>
                            <th className="px-3 py-2">Nama Sub Kegiatan</th>
                            <th className="px-3 py-2">Tahun</th>
                          </>
                        )}
                        {importCategory === 'belanja' && (
                          <>
                            <th className="px-3 py-2">Kode Rekening</th>
                            <th className="px-3 py-2">Uraian Belanja</th>
                            <th className="px-3 py-2">Jenis Belanja</th>
                            <th className="px-3 py-2">Tahun</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {parsedDataPreview.slice(0, 15).map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          <td className="px-3 py-2 font-mono text-slate-500">{idx + 1}</td>
                          {importCategory === 'program' && (
                            <>
                              <td className="px-3 py-2 font-mono text-emerald-400 font-bold">{row.kodeProgram}</td>
                              <td className="px-3 py-2 text-white">{row.namaProgram}</td>
                              <td className="px-3 py-2">{row.tahun}</td>
                            </>
                          )}
                          {importCategory === 'kegiatan' && (
                            <>
                              <td className="px-3 py-2 font-mono text-slate-400">{row.kodeProgram}</td>
                              <td className="px-3 py-2 text-emerald-300 font-medium">{row.namaProgram || '-'}</td>
                              <td className="px-3 py-2 font-mono text-teal-400 font-bold">{row.kodeKegiatan}</td>
                              <td className="px-3 py-2 text-white">{row.namaKegiatan}</td>
                              <td className="px-3 py-2">{row.tahun}</td>
                            </>
                          )}
                          {importCategory === 'subkegiatan' && (
                            <>
                              <td className="px-3 py-2 font-mono text-slate-400">{row.kodeProgram}</td>
                              <td className="px-3 py-2 text-emerald-300 font-medium">{row.namaProgram || '-'}</td>
                              <td className="px-3 py-2 font-mono text-amber-400 font-bold">{row.kodeSub}</td>
                              <td className="px-3 py-2 text-white">{row.namaSub}</td>
                              <td className="px-3 py-2">{row.tahun}</td>
                            </>
                          )}
                          {importCategory === 'belanja' && (
                            <>
                              <td className="px-3 py-2 font-mono text-emerald-400 font-bold">{row.kodeBelanja}</td>
                              <td className="px-3 py-2 text-white">{row.namaBelanja}</td>
                              <td className="px-3 py-2 text-slate-300">{row.jenisBelanja}</td>
                              <td className="px-3 py-2">{row.tahun}</td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedDataPreview.length > 15 && (
                    <div className="p-2 text-center text-[11px] text-slate-400 border-t border-slate-800 bg-slate-900">
                      ... dan {parsedDataPreview.length - 15} baris data lainnya
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-3">
              <button
                type="button"
                onClick={() => setShowImportExcelModal(false)}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2.5 text-xs font-bold text-slate-300 transition"
              >
                Tutup
              </button>

              <button
                type="button"
                disabled={parsedDataPreview.length === 0}
                onClick={handleProcessImportExcel}
                className="flex items-center gap-2 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-teal-950/50 transition"
              >
                <FileCheck className="h-4 w-4" />
                <span>Proses Import {parsedDataPreview.length} Data {importCategory.toUpperCase()}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT OPD MODAL */}
      {editingOpd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Edit Data OPD / Unit Kerja</h3>
              </div>
              <button onClick={() => setEditingOpd(null)} className="text-slate-400 hover:text-white">
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditOpd} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300">Kode SKPD / OPD:</label>
                <input
                  type="text"
                  required
                  value={editingOpd.kodeOPD}
                  onChange={e => setEditingOpd({ ...editingOpd, kodeOPD: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300">Nama Resmi OPD / SKPD:</label>
                <input
                  type="text"
                  required
                  value={editingOpd.namaOPD}
                  onChange={e => setEditingOpd({ ...editingOpd, namaOPD: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300">Singkatan OPD:</label>
                  <input
                    type="text"
                    required
                    value={editingOpd.singkatan}
                    onChange={e => setEditingOpd({ ...editingOpd, singkatan: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300">NIP Kepala Badan:</label>
                  <input
                    type="text"
                    required
                    value={editingOpd.nipKepala}
                    onChange={e => setEditingOpd({ ...editingOpd, nipKepala: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300">Nama Kepala Badan / Dinas:</label>
                <input
                  type="text"
                  required
                  value={editingOpd.kepalaBadan}
                  onChange={e => setEditingOpd({ ...editingOpd, kepalaBadan: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 space-y-2">
                <label className="font-bold text-slate-300 block">Logo Resmi Provinsi NTB:</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-900 p-0.5 border border-emerald-500/30 overflow-hidden">
                    {editingOpd.logoUrl ? (
                      <img
                        src={editingOpd.logoUrl}
                        alt="Preview Logo"
                        className="h-full w-full object-cover rounded-lg"
                      />
                    ) : (
                      <NTBLogo className="h-full w-full" />
                    )}
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 px-3 py-2 font-bold text-emerald-300">
                    <Upload className="h-4 w-4" />
                    <span>Unggah File Logo Baru</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => {
                            setEditingOpd({ ...editingOpd, logoUrl: ev.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  {editingOpd.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setEditingOpd({ ...editingOpd, logoUrl: '' })}
                      className="text-slate-400 hover:text-amber-400 text-[11px] underline"
                    >
                      Reset Logo
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingOpd(null)}
                  className="w-1/2 rounded-xl bg-slate-800 py-2.5 font-bold text-slate-300 hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-1/2 rounded-xl bg-amber-600 py-2.5 font-bold text-white hover:bg-amber-500 shadow"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE OPD CONFIRMATION MODAL */}
      {deletingOpd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-rose-800/80 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-3">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus OPD</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus Unit Kerja / OPD{' '}
              <span className="font-bold text-white">"{deletingOpd.namaOPD}"</span> ({deletingOpd.singkatan})?
            </p>

            <div className="rounded-xl bg-rose-950/40 p-3 border border-rose-800/50 text-[11px] text-rose-200">
              Tindakan ini akan menghapus entitas OPD dari daftar master data lokal.
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingOpd(null)}
                className="w-1/2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteOpd}
                className="w-1/2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 shadow"
              >
                Ya, Hapus OPD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TAHUN MODAL */}
      {editingTahun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Edit Tahun Anggaran</h3>
              </div>
              <button onClick={() => setEditingTahun(null)} className="text-slate-400 hover:text-white">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditTahun} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300">Tahun Anggaran:</label>
                <input
                  type="number"
                  required
                  value={editingTahun.tahun}
                  onChange={e => setEditingTahun({ ...editingTahun, tahun: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-300">Keterangan:</label>
                <input
                  type="text"
                  value={editingTahun.keterangan || ''}
                  onChange={e => setEditingTahun({ ...editingTahun, keterangan: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingTahun(null)} className="w-1/2 rounded-xl bg-slate-800 py-2.5 font-bold text-slate-300 hover:bg-slate-700">
                  Batal
                </button>
                <button type="submit" className="w-1/2 rounded-xl bg-amber-600 py-2.5 font-bold text-white hover:bg-amber-500 shadow">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE TAHUN MODAL */}
      {deletingTahun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-rose-800/80 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-3">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus Tahun</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus Master Tahun Anggaran <span className="font-bold text-white">"{deletingTahun.tahun}"</span>?
            </p>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setDeletingTahun(null)} className="w-1/2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700">
                Batal
              </button>
              <button type="button" onClick={handleConfirmDeleteTahun} className="w-1/2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 shadow">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROGRAM MODAL */}
      {editingProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Edit Program Master</h3>
              </div>
              <button onClick={() => setEditingProgram(null)} className="text-slate-400 hover:text-white">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditProgram} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300">Kode Program:</label>
                <input
                  type="text"
                  required
                  value={editingProgram.kodeProgram}
                  onChange={e => setEditingProgram({ ...editingProgram, kodeProgram: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-300">Nama Program:</label>
                <input
                  type="text"
                  required
                  value={editingProgram.namaProgram}
                  onChange={e => setEditingProgram({ ...editingProgram, namaProgram: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingProgram(null)} className="w-1/2 rounded-xl bg-slate-800 py-2.5 font-bold text-slate-300 hover:bg-slate-700">
                  Batal
                </button>
                <button type="submit" className="w-1/2 rounded-xl bg-amber-600 py-2.5 font-bold text-white hover:bg-amber-500 shadow">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE PROGRAM MODAL */}
      {deletingProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-rose-800/80 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-3">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus Program</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus Program <span className="font-bold text-white">"{deletingProgram.kodeProgram} - {deletingProgram.namaProgram}"</span>?
            </p>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setDeletingProgram(null)} className="w-1/2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700">
                Batal
              </button>
              <button type="button" onClick={handleConfirmDeleteProgram} className="w-1/2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 shadow">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT KEGIATAN MODAL */}
      {editingKegiatan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Edit Kegiatan Master</h3>
              </div>
              <button onClick={() => setEditingKegiatan(null)} className="text-slate-400 hover:text-white">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditKegiatan} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300">Kode Program:</label>
                <input
                  type="text"
                  required
                  value={editingKegiatan.kodeProgram}
                  onChange={e => setEditingKegiatan({ ...editingKegiatan, kodeProgram: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-300">Kode Kegiatan:</label>
                <input
                  type="text"
                  required
                  value={editingKegiatan.kodeKegiatan}
                  onChange={e => setEditingKegiatan({ ...editingKegiatan, kodeKegiatan: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-300">Nama Kegiatan:</label>
                <input
                  type="text"
                  required
                  value={editingKegiatan.namaKegiatan}
                  onChange={e => setEditingKegiatan({ ...editingKegiatan, namaKegiatan: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingKegiatan(null)} className="w-1/2 rounded-xl bg-slate-800 py-2.5 font-bold text-slate-300 hover:bg-slate-700">
                  Batal
                </button>
                <button type="submit" className="w-1/2 rounded-xl bg-amber-600 py-2.5 font-bold text-white hover:bg-amber-500 shadow">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE KEGIATAN MODAL */}
      {deletingKegiatan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-rose-800/80 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-3">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus Kegiatan</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus Kegiatan <span className="font-bold text-white">"{deletingKegiatan.kodeKegiatan} - {deletingKegiatan.namaKegiatan}"</span>?
            </p>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setDeletingKegiatan(null)} className="w-1/2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700">
                Batal
              </button>
              <button type="button" onClick={handleConfirmDeleteKegiatan} className="w-1/2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 shadow">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SUB KEGIATAN MODAL */}
      {editingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Edit Sub Kegiatan Master</h3>
              </div>
              <button onClick={() => setEditingSub(null)} className="text-slate-400 hover:text-white">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditSub} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300">Kode Kegiatan:</label>
                <input
                  type="text"
                  required
                  value={editingSub.kodeKegiatan}
                  onChange={e => setEditingSub({ ...editingSub, kodeKegiatan: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-300">Kode Sub Kegiatan:</label>
                <input
                  type="text"
                  required
                  value={editingSub.kodeSub}
                  onChange={e => setEditingSub({ ...editingSub, kodeSub: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-300">Nama Sub Kegiatan:</label>
                <input
                  type="text"
                  required
                  value={editingSub.namaSub}
                  onChange={e => setEditingSub({ ...editingSub, namaSub: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingSub(null)} className="w-1/2 rounded-xl bg-slate-800 py-2.5 font-bold text-slate-300 hover:bg-slate-700">
                  Batal
                </button>
                <button type="submit" className="w-1/2 rounded-xl bg-amber-600 py-2.5 font-bold text-white hover:bg-amber-500 shadow">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE SUB KEGIATAN MODAL */}
      {deletingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-rose-800/80 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-3">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus Sub Kegiatan</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus Sub Kegiatan <span className="font-bold text-white">"{deletingSub.kodeSub} - {deletingSub.namaSub}"</span>?
            </p>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setDeletingSub(null)} className="w-1/2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700">
                Batal
              </button>
              <button type="button" onClick={handleConfirmDeleteSub} className="w-1/2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 shadow">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT BELANJA MODAL */}
      {editingBelanja && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Edit Uraian Belanja</h3>
              </div>
              <button onClick={() => setEditingBelanja(null)} className="text-slate-400 hover:text-white">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditBelanja} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300">Kode Rekening Belanja:</label>
                <input
                  type="text"
                  required
                  value={editingBelanja.kodeBelanja}
                  onChange={e => setEditingBelanja({ ...editingBelanja, kodeBelanja: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-300">Nama Uraian Belanja:</label>
                <input
                  type="text"
                  required
                  value={editingBelanja.namaBelanja}
                  onChange={e => setEditingBelanja({ ...editingBelanja, namaBelanja: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-300">Jenis Belanja:</label>
                <select
                  value={editingBelanja.jenisBelanja}
                  onChange={e => setEditingBelanja({ ...editingBelanja, jenisBelanja: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                >
                  <option value="Belanja Pegawai">Belanja Pegawai</option>
                  <option value="Belanja Barang dan Jasa">Belanja Barang dan Jasa</option>
                  <option value="Belanja Modal">Belanja Modal</option>
                  <option value="Belanja Hibah">Belanja Hibah</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingBelanja(null)} className="w-1/2 rounded-xl bg-slate-800 py-2.5 font-bold text-slate-300 hover:bg-slate-700">
                  Batal
                </button>
                <button type="submit" className="w-1/2 rounded-xl bg-amber-600 py-2.5 font-bold text-white hover:bg-amber-500 shadow">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE BELANJA MODAL */}
      {deletingBelanja && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-rose-800/80 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-3">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus Belanja</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus Rekening Belanja <span className="font-bold text-white">"{deletingBelanja.kodeBelanja} - {deletingBelanja.namaBelanja}"</span>?
            </p>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setDeletingBelanja(null)} className="w-1/2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700">
                Batal
              </button>
              <button type="button" onClick={handleConfirmDeleteBelanja} className="w-1/2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 shadow">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SUMBER DANA MODAL */}
      {editingSumberDana && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Edit Sumber Dana</h3>
              </div>
              <button onClick={() => setEditingSumberDana(null)} className="text-slate-400 hover:text-white">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditSumberDana} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300">Nama Sumber Dana:</label>
                <input
                  type="text"
                  required
                  value={editingSumberDana.namaSumber || editingSumberDana.nama || ''}
                  onChange={e => setEditingSumberDana({ ...editingSumberDana, namaSumber: e.target.value, nama: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="font-bold text-slate-300">Keterangan / Singkatan:</label>
                <input
                  type="text"
                  value={editingSumberDana.keterangan || ''}
                  onChange={e => setEditingSumberDana({ ...editingSumberDana, keterangan: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingSumberDana(null)} className="w-1/2 rounded-xl bg-slate-800 py-2.5 font-bold text-slate-300 hover:bg-slate-700">
                  Batal
                </button>
                <button type="submit" className="w-1/2 rounded-xl bg-amber-600 py-2.5 font-bold text-white hover:bg-amber-500 shadow">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE SUMBER DANA MODAL */}
      {deletingSumberDana && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-rose-800/80 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-3">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus Sumber Dana</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus Sumber Dana <span className="font-bold text-white">"{deletingSumberDana.namaSumber || deletingSumberDana.nama}"</span>?
            </p>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setDeletingSumberDana(null)} className="w-1/2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700">
                Batal
              </button>
              <button type="button" onClick={handleConfirmDeleteSumberDana} className="w-1/2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 shadow">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT REKANAN MODAL */}
      {editingRekanan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Edit Data Rekanan / Penyedia</h3>
              </div>
              <button onClick={() => setEditingRekanan(null)} className="text-slate-400 hover:text-white">
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditRekanan} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-300">Nama Rekanan / Penyedia:</label>
                <input
                  type="text"
                  required
                  value={editingRekanan.namaRekanan}
                  onChange={e => setEditingRekanan({ ...editingRekanan, namaRekanan: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-300">NPWP:</label>
                  <input
                    type="text"
                    value={editingRekanan.npwp}
                    onChange={e => setEditingRekanan({ ...editingRekanan, npwp: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300">Nama Bank:</label>
                  <input
                    type="text"
                    value={editingRekanan.bank}
                    onChange={e => setEditingRekanan({ ...editingRekanan, bank: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="font-bold text-slate-300">Nomor Rekening Bank:</label>
                <input
                  type="text"
                  value={editingRekanan.noRekening}
                  onChange={e => setEditingRekanan({ ...editingRekanan, noRekening: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="font-bold text-slate-300">Alamat Lengkap:</label>
                <input
                  type="text"
                  value={editingRekanan.alamat}
                  onChange={e => setEditingRekanan({ ...editingRekanan, alamat: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                />
              </div>
              <div>
                <label className="font-bold text-slate-300">Kontak HP / Telepon:</label>
                <input
                  type="text"
                  value={editingRekanan.kontak}
                  onChange={e => setEditingRekanan({ ...editingRekanan, kontak: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white font-mono"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditingRekanan(null)} className="w-1/2 rounded-xl bg-slate-800 py-2.5 font-bold text-slate-300 hover:bg-slate-700">
                  Batal
                </button>
                <button type="submit" className="w-1/2 rounded-xl bg-amber-600 py-2.5 font-bold text-white hover:bg-amber-500 shadow">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE REKANAN MODAL */}
      {deletingRekanan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-rose-800/80 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-3">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-base font-bold text-white">Konfirmasi Hapus Rekanan</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Apakah Anda yakin ingin menghapus Rekanan <span className="font-bold text-white">"{deletingRekanan.namaRekanan}"</span>?
            </p>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setDeletingRekanan(null)} className="w-1/2 rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-slate-300 hover:bg-slate-700">
                Batal
              </button>
              <button type="button" onClick={handleConfirmDeleteRekanan} className="w-1/2 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500 shadow">
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD MASTER DATA MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Form Manual Master Data</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            {activeTab === 'master-tahun' && (
              <form onSubmit={handleSaveAddTahun} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-300">Tahun Anggaran:</label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 2026"
                    value={formTahun.tahun}
                    onChange={e => setFormTahun({ ...formTahun, tahun: Number(e.target.value) })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300">Keterangan:</label>
                  <input
                    type="text"
                    placeholder="Contoh: Tahun Anggaran Murni / Perubahan"
                    value={formTahun.keterangan}
                    onChange={e => setFormTahun({ ...formTahun, keterangan: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow mt-2"
                >
                  Simpan Tahun Anggaran Baru
                </button>
              </form>
            )}

            {activeTab === 'master-opd' && (
              <form onSubmit={handleSaveAddOpd} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-300">Kode SKPD / OPD:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 5.01.0.00.0.00.01.0000"
                    value={formOpd.kodeOPD}
                    onChange={e => setFormOpd({ ...formOpd, kodeOPD: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300">Nama Resmi OPD:</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Dinas / Badan"
                    value={formOpd.namaOPD}
                    onChange={e => setFormOpd({ ...formOpd, namaOPD: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-slate-300">Singkatan:</label>
                    <input
                      type="text"
                      required
                      placeholder="BAKESBANGPOLDAGRI NTB"
                      value={formOpd.singkatan}
                      onChange={e => setFormOpd({ ...formOpd, singkatan: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300">NIP Kepala Badan:</label>
                    <input
                      type="text"
                      required
                      placeholder="19680312..."
                      value={formOpd.nipKepala}
                      onChange={e => setFormOpd({ ...formOpd, nipKepala: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-300">Nama Kepala Badan / Dinas:</label>
                  <input
                    type="text"
                    required
                    placeholder="Gelar & Nama Lengkap"
                    value={formOpd.kepalaBadan}
                    onChange={e => setFormOpd({ ...formOpd, kepalaBadan: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">Logo Provinsi NTB (Opsional):</label>
                  <label className="flex items-center justify-center gap-2 cursor-pointer rounded-xl border border-dashed border-emerald-600/50 bg-slate-950 p-3 text-emerald-300 hover:bg-emerald-950/40 transition">
                    <Upload className="h-4 w-4" />
                    <span>{formOpd.logoUrl ? 'Logo Terpilih (Klik untuk Ganti)' : 'Pilih Gambar Logo NTB'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => {
                            setFormOpd({ ...formOpd, logoUrl: ev.target?.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow mt-2"
                >
                  Simpan Data OPD Baru
                </button>
              </form>
            )}

            {activeTab === 'master-program' && (
              <form onSubmit={handleSaveProgram} className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-300">Kode Program:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 5.01.05"
                    value={formProgram.kodeProgram}
                    onChange={e => setFormProgram({ ...formProgram, kodeProgram: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Nama Program:</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Program Lengkap"
                    value={formProgram.namaProgram}
                    onChange={e => setFormProgram({ ...formProgram, namaProgram: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500"
                >
                  Simpan Program Master
                </button>
              </form>
            )}

            {activeTab === 'master-kegiatan' && (
              <form onSubmit={handleSaveKegiatan} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-300">Kode Program Parent:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 5.01.05"
                    value={formKegiatan.kodeProgram}
                    onChange={e => setFormKegiatan({ ...formKegiatan, kodeProgram: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300">Kode Kegiatan Baru:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 5.01.05.2.01"
                    value={formKegiatan.kodeKegiatan}
                    onChange={e => setFormKegiatan({ ...formKegiatan, kodeKegiatan: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300">Nama Kegiatan:</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Uraian Kegiatan"
                    value={formKegiatan.namaKegiatan}
                    onChange={e => setFormKegiatan({ ...formKegiatan, namaKegiatan: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow mt-2"
                >
                  Simpan Kegiatan Baru
                </button>
              </form>
            )}

            {activeTab === 'master-subkegiatan' && (
              <form onSubmit={handleSaveSubKegiatan} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-300">Kode Kegiatan Parent:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 5.01.05.2.01"
                    value={formSub.kodeKegiatan}
                    onChange={e => setFormSub({ ...formSub, kodeKegiatan: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300">Kode Sub Kegiatan Baru:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 5.01.05.2.01.0001"
                    value={formSub.kodeSub}
                    onChange={e => setFormSub({ ...formSub, kodeSub: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300">Nama Sub Kegiatan:</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Uraian Sub Kegiatan"
                    value={formSub.namaSub}
                    onChange={e => setFormSub({ ...formSub, namaSub: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow mt-2"
                >
                  Simpan Sub Kegiatan Baru
                </button>
              </form>
            )}

            {activeTab === 'master-belanja' && (
              <form onSubmit={handleSaveBelanja} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-300">Kode Rekening Belanja:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 5.1.02.01.01.0001"
                    value={formBelanja.kodeBelanja}
                    onChange={e => setFormBelanja({ ...formBelanja, kodeBelanja: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300">Nama Uraian Belanja:</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Rekening Belanja"
                    value={formBelanja.namaBelanja}
                    onChange={e => setFormBelanja({ ...formBelanja, namaBelanja: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300">Jenis Belanja:</label>
                  <select
                    value={formBelanja.jenisBelanja}
                    onChange={e => setFormBelanja({ ...formBelanja, jenisBelanja: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white"
                  >
                    <option value="Belanja Pegawai">Belanja Pegawai</option>
                    <option value="Belanja Barang dan Jasa">Belanja Barang dan Jasa</option>
                    <option value="Belanja Modal">Belanja Modal</option>
                    <option value="Belanja Hibah">Belanja Hibah</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow mt-2"
                >
                  Simpan Belanja Rekening Baru
                </button>
              </form>
            )}

            {activeTab === 'master-sumberdana' && (
              <form onSubmit={handleSaveAddSumberDana} className="mt-4 space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-300">Kode Sumber Dana:</label>
                  <input
                    type="text"
                    placeholder="Contoh: DAU / DAK / DBH"
                    value={formSumberDana.kodeSumber}
                    onChange={e => setFormSumberDana({ ...formSumberDana, kodeSumber: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300">Nama Sumber Dana:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Dana Alokasi Umum (DAU)"
                    value={formSumberDana.namaSumber}
                    onChange={e => setFormSumberDana({ ...formSumberDana, namaSumber: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300">Keterangan:</label>
                  <input
                    type="text"
                    placeholder="Keterangan opsional"
                    value={formSumberDana.keterangan}
                    onChange={e => setFormSumberDana({ ...formSumberDana, keterangan: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow mt-2"
                >
                  Simpan Sumber Dana Baru
                </button>
              </form>
            )}

            {activeTab === 'master-rekanan' && (
              <form onSubmit={handleSaveRekanan} className="mt-4 space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-300">Nama Rekanan / Penyedia:</label>
                  <input
                    type="text"
                    required
                    placeholder="CV / PT / Bank / Lembaga"
                    value={formRekanan.namaRekanan}
                    onChange={e => setFormRekanan({ ...formRekanan, namaRekanan: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-slate-300">NPWP:</label>
                    <input
                      type="text"
                      placeholder="00.000.000.0-000.000"
                      value={formRekanan.npwp}
                      onChange={e => setFormRekanan({ ...formRekanan, npwp: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-300">Bank:</label>
                    <input
                      type="text"
                      value={formRekanan.bank}
                      onChange={e => setFormRekanan({ ...formRekanan, bank: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Nomor Rekening:</label>
                  <input
                    type="text"
                    value={formRekanan.noRekening}
                    onChange={e => setFormRekanan({ ...formRekanan, noRekening: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Alamat Lengkap:</label>
                  <input
                    type="text"
                    value={formRekanan.alamat}
                    onChange={e => setFormRekanan({ ...formRekanan, alamat: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Kontak Telepon / HP:</label>
                  <input
                    type="text"
                    value={formRekanan.kontak}
                    onChange={e => setFormRekanan({ ...formRekanan, kontak: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow mt-2"
                >
                  Simpan Data Rekanan
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL CLEAR DATABASE MASTER DATA */}
      {showClearDbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-rose-900/60 bg-slate-900 p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="rounded-2xl bg-rose-950/80 p-3 border border-rose-800/60">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Konfirmasi Hapus Database Master</h3>
                <p className="text-xs text-rose-300/80">Tindakan ini tidak dapat dibatalkan!</p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 text-xs text-slate-300 space-y-3">
              <p>
                Anda akan menghapus seluruh data pada database{' '}
                <strong className="text-rose-400 uppercase">
                  {showClearDbModal === 'program' && 'Master Program'}
                  {showClearDbModal === 'kegiatan' && 'Master Kegiatan'}
                  {showClearDbModal === 'subkegiatan' && 'Master Sub Kegiatan'}
                  {showClearDbModal === 'belanja' && 'Master Belanja Rekening'}
                  {showClearDbModal === 'sumberdana' && 'Master Sumber Dana'}
                  {showClearDbModal === 'rekanan' && 'Master Data Rekanan'}
                </strong>
                .
              </p>

              {['program', 'kegiatan', 'subkegiatan', 'belanja'].includes(showClearDbModal) && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <label className="text-xs font-bold text-slate-200">Pilih Cakupan Hapus Data:</label>
                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="radio"
                        name="clearScope"
                        checked={clearTargetScope === 'selected'}
                        onChange={() => setClearTargetScope('selected')}
                        className="accent-rose-500"
                      />
                      <span>Hapus Khusus Tahun Anggaran <strong className="text-amber-400">{selectedTahun}</strong></span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                      <input
                        type="radio"
                        name="clearScope"
                        checked={clearTargetScope === 'all'}
                        onChange={() => setClearTargetScope('all')}
                        className="accent-rose-500"
                      />
                      <span>Hapus Seluruh Tahun Anggaran (Kosongkan Total)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowClearDbModal(null)}
                className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmClearDb}
                className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 shadow-lg shadow-rose-950/50"
              >
                <Trash2 className="h-4 w-4" />
                <span>Ya, Hapus Database</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
