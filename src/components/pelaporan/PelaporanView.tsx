import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { isCodeEqual } from '../../utils/codeUtils';
import { NTBLogo } from '../common/NTBLogo';
import * as XLSX from 'xlsx';
import { safeDownloadExcel } from '../../utils/downloadHelper';
import { Realisasi, Belanja, SubKegiatan } from '../../types';
import {
  FileText,
  Printer,
  Download,
  Filter,
  Search,
  BookOpen,
  Calendar,
  Layers,
  Building2,
  ChevronDown,
  Check,
  X,
  Eye,
  Info,
  Sparkles,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  DollarSign,
  CalendarDays
} from 'lucide-react';

interface SubKegiatanComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ kodeSub: string; namaSub: string }>;
}

const SubKegiatanCombobox: React.FC<SubKegiatanComboboxProps> = ({
  value,
  onChange,
  options
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.kodeSub === value);

  const filteredOptions = options.filter(
    o =>
      o.kodeSub.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.namaSub.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayLabel =
    value === 'all'
      ? '-- Semua Sub Kegiatan (Rekapitulasi Global) --'
      : selectedOption
      ? `${selectedOption.kodeSub} - ${selectedOption.namaSub}`
      : value;

  return (
    <div ref={wrapperRef} className="relative max-w-xl w-full">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between bg-slate-900 border border-slate-700 hover:border-amber-500 rounded-xl px-3 py-2 cursor-pointer text-xs transition-colors shadow-sm"
      >
        <span className="font-semibold text-white truncate mr-2">
          {displayLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180 text-amber-400' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-xs">
          <div className="p-2 border-b border-slate-800 flex items-center gap-2 bg-slate-950">
            <Search className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Ketik kode atau nama Sub Kegiatan..."
              className="bg-transparent text-white font-medium text-xs focus:outline-none w-full placeholder:text-slate-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-slate-400 hover:text-white text-[10px] bg-slate-800 px-2 py-0.5 rounded-lg"
              >
                Hapus
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/50 scrollbar-thin">
            <div
              onClick={() => {
                onChange('all');
                setIsOpen(false);
                setSearchTerm('');
              }}
              className={`p-2.5 cursor-pointer font-semibold transition-colors hover:bg-amber-500/10 hover:text-amber-300 ${
                value === 'all'
                  ? 'bg-amber-500/20 text-amber-300 font-bold'
                  : 'text-slate-300'
              }`}
            >
              -- Semua Sub Kegiatan (Rekapitulasi Global) --
            </div>

            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-slate-500 italic">
                Sub Kegiatan dengan pencarian "{searchTerm}" tidak ditemukan.
              </div>
            ) : (
              filteredOptions.map(s => {
                const isSelected = s.kodeSub === value;
                return (
                  <div
                    key={s.kodeSub}
                    onClick={() => {
                      onChange(s.kodeSub);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`p-2.5 cursor-pointer transition-colors hover:bg-amber-500/10 hover:text-amber-300 flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                        : 'text-slate-200'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-semibold text-white text-xs leading-snug">
                        {s.namaSub}
                      </span>
                      <span className="font-mono text-amber-400 text-[11px] font-bold">
                        {s.kodeSub}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface BelanjaComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ kodeBelanja: string; namaBelanja: string }>;
}

const BelanjaCombobox: React.FC<BelanjaComboboxProps> = ({
  value,
  onChange,
  options
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.kodeBelanja === value);

  const filteredOptions = options.filter(
    o =>
      o.kodeBelanja.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.namaBelanja.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayLabel =
    value === 'all'
      ? '-- Semua Rekening Belanja (Rekapitulasi Global) --'
      : selectedOption
      ? `${selectedOption.namaBelanja} (${selectedOption.kodeBelanja})`
      : value;

  return (
    <div ref={wrapperRef} className="relative max-w-xl w-full">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between bg-slate-900 border border-slate-700 hover:border-amber-500 rounded-xl px-3 py-2 cursor-pointer text-xs transition-colors shadow-sm"
      >
        <span className="font-semibold text-white truncate mr-2">
          {displayLabel}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180 text-amber-400' : ''
          }`}
        />
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden text-xs">
          <div className="p-2 border-b border-slate-800 flex items-center gap-2 bg-slate-950">
            <Search className="h-3.5 w-3.5 text-amber-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Ketik nama atau kode Rekening Belanja..."
              className="bg-transparent text-white font-medium text-xs focus:outline-none w-full placeholder:text-slate-500"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="text-slate-400 hover:text-white text-[10px] bg-slate-800 px-2 py-0.5 rounded-lg"
              >
                Hapus
              </button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/50 scrollbar-thin">
            <div
              onClick={() => {
                onChange('all');
                setIsOpen(false);
                setSearchTerm('');
              }}
              className={`p-2.5 cursor-pointer font-semibold transition-colors hover:bg-amber-500/10 hover:text-amber-300 ${
                value === 'all'
                  ? 'bg-amber-500/20 text-amber-300 font-bold'
                  : 'text-slate-300'
              }`}
            >
              -- Semua Rekening Belanja (Rekapitulasi Global) --
            </div>

            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-slate-500 italic">
                Rekening Belanja dengan pencarian "{searchTerm}" tidak ditemukan.
              </div>
            ) : (
              filteredOptions.map(b => {
                const isSelected = b.kodeBelanja === value;
                return (
                  <div
                    key={b.kodeBelanja}
                    onClick={() => {
                      onChange(b.kodeBelanja);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`p-2.5 cursor-pointer transition-colors hover:bg-amber-500/10 hover:text-amber-300 flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-amber-500/20 text-amber-300 font-bold'
                        : 'text-slate-200'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-semibold text-white text-xs leading-snug">
                        {b.namaBelanja}
                      </span>
                      <span className="font-mono text-emerald-400 text-[11px] font-bold">
                        {b.kodeBelanja}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-amber-400 shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface RealisasiDetailFilter {
  title: string;
  subtitle?: string;
  kodeSub?: string;
  kodeBelanja?: string;
  kodeKegiatan?: string;
  kodeProgram?: string;
  bulan?: number;
}

interface RealisasiDetailModalProps {
  filter: RealisasiDetailFilter;
  onClose: () => void;
  currentRealisasi: Realisasi[];
  belanjaList: Belanja[];
  subKegiatanList: SubKegiatan[];
  selectedTahun: number;
}

const RealisasiDetailModal: React.FC<RealisasiDetailModalProps> = ({
  filter,
  onClose,
  currentRealisasi,
  belanjaList,
  subKegiatanList,
  selectedTahun
}) => {
  const [modalSearch, setModalSearch] = useState('');

  const matchingRealisasi = currentRealisasi.filter(r => {
    if (filter.bulan !== undefined && filter.bulan !== null) {
      let m = Number(r.bulan);
      if (!m || isNaN(m)) {
        if (r.tanggal) {
          const parts = r.tanggal.split('-');
          if (parts.length >= 2) m = parseInt(parts[1], 10);
        }
      }
      if (m !== filter.bulan) return false;
    }
    if (filter.kodeSub && !isCodeEqual(r.kodeSub, filter.kodeSub)) return false;
    if (filter.kodeBelanja && !isCodeEqual(r.kodeBelanja, filter.kodeBelanja)) return false;
    if (filter.kodeKegiatan && !isCodeEqual(r.kodeKegiatan, filter.kodeKegiatan)) return false;
    if (filter.kodeProgram && !isCodeEqual(r.kodeProgram, filter.kodeProgram)) return false;
    return true;
  });

  const searchedRealisasi = matchingRealisasi.filter(r => {
    if (!modalSearch.trim()) return true;
    const q = modalSearch.toLowerCase();
    const bObj = belanjaList.find(b => isCodeEqual(b.kodeBelanja, r.kodeBelanja));
    const namaBel = bObj?.namaBelanja || '';
    const sObj = subKegiatanList.find(s => isCodeEqual(s.kodeSub, r.kodeSub));
    const namaSub = sObj?.namaSub || '';
    return (
      (r.uraian && r.uraian.toLowerCase().includes(q)) ||
      (r.noSP2D && r.noSP2D.toLowerCase().includes(q)) ||
      (r.noSPM && r.noSPM.toLowerCase().includes(q)) ||
      (r.rekanan && r.rekanan.toLowerCase().includes(q)) ||
      r.kodeBelanja.toLowerCase().includes(q) ||
      namaBel.toLowerCase().includes(q) ||
      r.kodeSub.toLowerCase().includes(q) ||
      namaSub.toLowerCase().includes(q)
    );
  });

  const totalNilaiModal = searchedRealisasi.reduce((s, r) => s + r.nilai, 0);

  const exportModalExcel = () => {
    const rows = searchedRealisasi.map((r, idx) => {
      const bObj = belanjaList.find(b => isCodeEqual(b.kodeBelanja, r.kodeBelanja));
      const sObj = subKegiatanList.find(s => isCodeEqual(s.kodeSub, r.kodeSub));
      return {
        'No': idx + 1,
        'Tanggal SP2D': r.tanggal,
        'Nomor SP2D': r.noSP2D,
        'Nomor SPM': r.noSPM || '-',
        'Kode Sub Kegiatan': r.kodeSub,
        'Nama Sub Kegiatan': sObj?.namaSub || r.kodeSub,
        'Kode Belanja': r.kodeBelanja,
        'Nama Rekening Belanja': bObj?.namaBelanja || `Belanja ${r.kodeBelanja}`,
        'Uraian Realisasi': r.uraian || '-',
        'Rekanan / Penyedia': r.rekanan || '-',
        'Nilai Realisasi (Rp)': r.nilai
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Uraian_Realisasi');
    safeDownloadExcel(wb, `Rincian_Uraian_Realisasi_${selectedTahun}.xlsx`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 p-5 bg-slate-950">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                Rincian Uraian Realisasi
              </span>
              <span className="text-xs font-semibold text-slate-400">TA {selectedTahun}</span>
            </div>
            <h2 className="text-lg font-bold text-white leading-tight">
              {filter.title}
            </h2>
            {filter.subtitle && (
              <p className="text-xs text-amber-400 font-semibold">
                {filter.subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search & Stat Summary Bar */}
        <div className="flex flex-col gap-3 p-4 bg-slate-900/90 border-b border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* Stat Card 1: Jumlah Transaksi */}
            <div className="flex items-center gap-3 rounded-2xl bg-slate-950 p-3 border border-emerald-500/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Jumlah Transaksi</span>
                <div className="text-lg font-black font-mono text-emerald-400">
                  {searchedRealisasi.length} <span className="text-xs font-normal text-slate-300">Transaksi SP2D</span>
                </div>
              </div>
            </div>

            {/* Stat Card 2: Total Nilai Realisasi */}
            <div className="flex items-center gap-3 rounded-2xl bg-slate-950 p-3 border border-emerald-500/30">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Nilai Realisasi</span>
                <div className="text-lg font-black font-mono text-amber-400">
                  Rp {totalNilaiModal.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            {/* Stat Card 3: Pencarian Uraian */}
            <div className="flex items-center gap-2 sm:col-span-2 lg:col-span-1">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={modalSearch}
                  onChange={e => setModalSearch(e.target.value)}
                  placeholder="Cari uraian, No SP2D, rekanan..."
                  className="w-full bg-slate-950 text-white rounded-xl pl-9 pr-8 py-2.5 text-xs border border-slate-700 focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
                />
                {modalSearch && (
                  <button
                    onClick={() => setModalSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={exportModalExcel}
                disabled={searchedRealisasi.length === 0}
                className="flex items-center gap-1.5 shrink-0 rounded-xl bg-emerald-950 hover:bg-emerald-900 px-3 py-2 text-xs font-bold text-emerald-300 border border-emerald-700 disabled:opacity-50 transition-colors"
                title="Ekspor daftar uraian ke Excel"
              >
                <Download className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {searchedRealisasi.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <FileText className="h-10 w-10 text-slate-600 mx-auto" />
              <p className="font-semibold text-sm">Tidak ada data realisasi yang ditemukan.</p>
              <p className="text-xs text-slate-500">Coba gunakan kata kunci pencarian yang berbeda.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-900 text-slate-300 font-bold uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3 text-center w-12">No</th>
                    <th className="p-3 min-w-[140px]">Tanggal & SP2D</th>
                    <th className="p-3 min-w-[200px]">Sub Kegiatan & Rekening</th>
                    <th className="p-3 min-w-[300px]">Uraian Realisasi Belanja</th>
                    <th className="p-3 min-w-[150px]">Penyedia / Rekanan</th>
                    <th className="p-3 text-right min-w-[140px]">Nilai SP2D (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {searchedRealisasi.map((item, idx) => {
                    const bObj = belanjaList.find(b => isCodeEqual(b.kodeBelanja, item.kodeBelanja));
                    const sObj = subKegiatanList.find(s => isCodeEqual(s.kodeSub, item.kodeSub));
                    return (
                      <tr key={item.id || idx} className="hover:bg-slate-900/80 transition-colors">
                        <td className="p-3 text-center text-slate-500 font-mono font-bold">{idx + 1}</td>
                        <td className="p-3 space-y-1">
                          <div className="font-semibold text-white">{item.tanggal}</div>
                          <div className="font-mono text-[11px] text-amber-400 font-bold">{item.noSP2D}</div>
                          {item.noSPM && (
                            <div className="text-[10px] text-slate-400 font-mono">SPM: {item.noSPM}</div>
                          )}
                        </td>
                        <td className="p-3 space-y-1">
                          <div className="text-[11px] font-bold text-slate-200">
                            {sObj?.namaSub || item.kodeSub}
                          </div>
                          <div className="font-mono text-[10px] text-slate-400">{item.kodeSub}</div>
                          <div className="pt-1 flex items-center gap-1">
                            <span className="font-mono font-bold text-emerald-400 text-[10px] bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/60">
                              {item.kodeBelanja}
                            </span>
                            <span className="text-slate-300 text-[10px] truncate max-w-[160px]">
                              {bObj?.namaBelanja || `Belanja ${item.kodeBelanja}`}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-3 text-slate-100 text-xs font-normal leading-relaxed break-words shadow-inner">
                            <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Uraian Transaksi:</div>
                            {item.uraian || '-'}
                          </div>
                        </td>
                        <td className="p-3 font-medium text-slate-300 text-xs">
                          {item.rekanan || '-'}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-400 text-sm whitespace-nowrap bg-emerald-950/10">
                          Rp {item.nilai.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-800 p-4 bg-slate-950 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-semibold">
            <span className="rounded-lg bg-emerald-950 border border-emerald-700/60 px-2.5 py-1 text-emerald-300 font-mono">
              Total {searchedRealisasi.length} Transaksi
            </span>
            <span className="text-slate-400">Rincian Realisasi SP2D</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-semibold">Total Nilai Realisasi:</span>
            <span className="text-lg font-black font-mono text-emerald-400">
              Rp {totalNilaiModal.toLocaleString('id-ID')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PelaporanViewProps {
  initialReportType?: string;
}

export const PelaporanView: React.FC<PelaporanViewProps> = ({
  initialReportType = 'laporan-program'
}) => {
  const {
    selectedTahun,
    programs,
    kegiatanList,
    subKegiatanList,
    belanjaList,
    anggaranList,
    realisasiList,
    opd,
    users
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>(initialReportType);
  const [selectedRealisasiFilter, setSelectedRealisasiFilter] = useState<RealisasiDetailFilter | null>(null);

  React.useEffect(() => {
    if (initialReportType) {
      setActiveTab(initialReportType);
    }
  }, [initialReportType]);

  // Penandatangan Signatories State (Synced with Data Pengguna)
  const [selectedPpkId, setSelectedPpkId] = useState<string>('');
  const [selectedKabanId, setSelectedKabanId] = useState<string>('');

  React.useEffect(() => {
    if (users.length > 0) {
      if (!selectedPpkId || !users.some(u => u.id === selectedPpkId)) {
        const ppk = users.find(u => u.role === 'PPK');
        if (ppk) setSelectedPpkId(ppk.id);
        else if (users[0]) setSelectedPpkId(users[0].id);
      }
      if (!selectedKabanId || !users.some(u => u.id === selectedKabanId)) {
        const kaban = users.find(u => u.role === 'Kepala Badan');
        if (kaban) setSelectedKabanId(kaban.id);
        else if (users[0]) setSelectedKabanId(users[0].id);
      }
    }
  }, [users, selectedPpkId, selectedKabanId]);

  const activePpkUser = users.find(u => u.id === selectedPpkId) || users.find(u => u.role === 'PPK');
  const activeKabanUser = users.find(u => u.id === selectedKabanId) || users.find(u => u.role === 'Kepala Badan');

  // Filters
  const [filterProgram, setFilterProgram] = useState<string>('all');
  const [filterBulan, setFilterBulan] = useState<number | 'all'>('all');
  const [filterSelectedSub, setFilterSelectedSub] = useState<string>('all');
  const [filterSelectedBelanja, setFilterSelectedBelanja] = useState<string>('all');
  const [hibahSearchTerm, setHibahSearchTerm] = useState<string>('');
  const [hibahFilterStatus, setHibahFilterStatus] = useState<'all' | 'unexecuted' | 'partial' | 'full'>('all');
  const [silpaFilterStatus, setSilpaFilterStatus] = useState<'all' | 'unexecuted' | 'partial' | 'full'>('all');
  const [silpaSearchTerm, setSilpaSearchTerm] = useState<string>('');

  const currentAnggaran = anggaranList.filter(a => Number(a.tahun) === Number(selectedTahun));
  const currentRealisasi = realisasiList.filter(r => Number(r.tahun) === Number(selectedTahun));

  // Helper calculation for Laporan Per Program (Syced with Input Anggaran Pagu & Realisasi)
  const allProgramKodes = Array.from(
    new Set([
      ...programs.filter(p => Number(p.tahun) === Number(selectedTahun)).map(p => p.kodeProgram.trim()),
      ...currentAnggaran.map(a => a.kodeProgram.trim()),
      ...currentRealisasi.map(r => r.kodeProgram.trim())
    ])
  );

  const programReportData = allProgramKodes.map(kode => {
    const pObj = programs.find(p => isCodeEqual(p.kodeProgram, kode));
    const paguMurni = currentAnggaran
      .filter(a => isCodeEqual(a.kodeProgram, kode))
      .reduce((s, a) => s + a.pagu, 0);

    const revisi = currentAnggaran
      .filter(a => isCodeEqual(a.kodeProgram, kode))
      .reduce((s, a) => s + a.revisi, 0);

    const nilaiSPD = currentAnggaran
      .filter(a => isCodeEqual(a.kodeProgram, kode))
      .reduce((s, a) => s + (a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir), 0);

    const paguAkhir = currentAnggaran
      .filter(a => isCodeEqual(a.kodeProgram, kode))
      .reduce((s, a) => s + a.paguAkhir, 0);

    const real = currentRealisasi
      .filter(r => isCodeEqual(r.kodeProgram, kode))
      .reduce((s, r) => s + r.nilai, 0);

    const sisa = paguAkhir - real;
    const pct = paguAkhir > 0 ? (real / paguAkhir) * 100 : 0;

    return {
      kode,
      nama: pObj?.namaProgram || `PROGRAM ${kode}`,
      paguMurni,
      revisi,
      nilaiSPD,
      paguAkhir,
      realisasi: real,
      sisa,
      persen: pct
    };
  });

  // Helper calculation for Laporan Per Kegiatan
  const allKegiatanKodes = Array.from(
    new Set([
      ...kegiatanList.filter(k => Number(k.tahun) === Number(selectedTahun)).map(k => k.kodeKegiatan.trim()),
      ...currentAnggaran.map(a => a.kodeKegiatan.trim()),
      ...currentRealisasi.map(r => r.kodeKegiatan.trim())
    ])
  );

  const kegiatanReportData = allKegiatanKodes.map(kode => {
    const kObj = kegiatanList.find(k => isCodeEqual(k.kodeKegiatan, kode));
    const paguMurni = currentAnggaran
      .filter(a => isCodeEqual(a.kodeKegiatan, kode))
      .reduce((s, a) => s + a.pagu, 0);

    const revisi = currentAnggaran
      .filter(a => isCodeEqual(a.kodeKegiatan, kode))
      .reduce((s, a) => s + a.revisi, 0);

    const nilaiSPD = currentAnggaran
      .filter(a => isCodeEqual(a.kodeKegiatan, kode))
      .reduce((s, a) => s + (a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir), 0);

    const paguAkhir = currentAnggaran
      .filter(a => isCodeEqual(a.kodeKegiatan, kode))
      .reduce((s, a) => s + a.paguAkhir, 0);

    const real = currentRealisasi
      .filter(r => isCodeEqual(r.kodeKegiatan, kode))
      .reduce((s, r) => s + r.nilai, 0);

    const sisa = paguAkhir - real;
    const pct = paguAkhir > 0 ? (real / paguAkhir) * 100 : 0;

    return {
      kodeProg: kObj?.kodeProgram || currentAnggaran.find(a => isCodeEqual(a.kodeKegiatan, kode))?.kodeProgram || '',
      kodeKeg: kode,
      namaKeg: kObj?.namaKegiatan || `Kegiatan ${kode}`,
      paguMurni,
      revisi,
      nilaiSPD,
      paguAkhir,
      realisasi: real,
      sisa,
      persen: pct
    };
  });

  // Helper calculation for Laporan Per Sub Kegiatan
  const allSubKodes = Array.from(
    new Set([
      ...subKegiatanList.filter(s => Number(s.tahun) === Number(selectedTahun)).map(s => s.kodeSub.trim()),
      ...currentAnggaran.map(a => a.kodeSub.trim()),
      ...currentRealisasi.map(r => r.kodeSub.trim())
    ])
  );

  const subReportData = allSubKodes.map(kode => {
    const sObj = subKegiatanList.find(s => isCodeEqual(s.kodeSub, kode));
    const paguMurni = currentAnggaran
      .filter(a => isCodeEqual(a.kodeSub, kode))
      .reduce((s, a) => s + a.pagu, 0);

    const revisi = currentAnggaran
      .filter(a => isCodeEqual(a.kodeSub, kode))
      .reduce((s, a) => s + a.revisi, 0);

    const nilaiSPD = currentAnggaran
      .filter(a => isCodeEqual(a.kodeSub, kode))
      .reduce((s, a) => s + (a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir), 0);

    const paguAkhir = currentAnggaran
      .filter(a => isCodeEqual(a.kodeSub, kode))
      .reduce((s, a) => s + a.paguAkhir, 0);

    const real = currentRealisasi
      .filter(r => isCodeEqual(r.kodeSub, kode))
      .reduce((s, r) => s + r.nilai, 0);

    const sisa = paguAkhir - real;
    const pct = paguAkhir > 0 ? (real / paguAkhir) * 100 : 0;

    return {
      kodeSub: kode,
      namaSub: sObj?.namaSub || `Sub-Kegiatan ${kode}`,
      paguMurni,
      revisi,
      nilaiSPD,
      paguAkhir,
      realisasi: real,
      sisa,
      persen: pct
    };
  });

  // Options & calculation for detailed Rekening Belanja under selected Sub Kegiatan
  const availableSubKegiatanOptions = Array.from(
    new Set([
      ...subKegiatanList.filter(s => Number(s.tahun) === Number(selectedTahun)).map(s => s.kodeSub.trim()),
      ...currentAnggaran.map(a => a.kodeSub.trim()),
      ...currentRealisasi.map(r => r.kodeSub.trim())
    ])
  ).map(kode => {
    const sObj = subKegiatanList.find(s => isCodeEqual(s.kodeSub, kode));
    const aMatch = currentAnggaran.find(a => isCodeEqual(a.kodeSub, kode));
    const kObj = kegiatanList.find(k => isCodeEqual(k.kodeKegiatan, sObj?.kodeKegiatan || aMatch?.kodeKegiatan));
    const pObj = programs.find(p => isCodeEqual(p.kodeProgram, aMatch?.kodeProgram));
    return {
      kodeSub: kode,
      namaSub: sObj?.namaSub || `Sub-Kegiatan ${kode}`,
      kodeKegiatan: sObj?.kodeKegiatan || aMatch?.kodeKegiatan || '',
      namaKegiatan: kObj?.namaKegiatan || '',
      kodeProgram: aMatch?.kodeProgram || '',
      namaProgram: pObj?.namaProgram || ''
    };
  });

  const selectedSubDetail = availableSubKegiatanOptions.find(s => isCodeEqual(s.kodeSub, filterSelectedSub));
  const selectedSubAnggaran = currentAnggaran.filter(a => isCodeEqual(a.kodeSub, filterSelectedSub));

  const selectedSubBelanjaKodes = Array.from(
    new Set([
      ...selectedSubAnggaran.map(a => a.kodeBelanja.trim()),
      ...currentRealisasi.filter(r => isCodeEqual(r.kodeSub, filterSelectedSub)).map(r => r.kodeBelanja.trim())
    ])
  );

  const selectedSubBelanjaData = selectedSubBelanjaKodes.map(kodeBelanja => {
    const bObj = belanjaList.find(b => isCodeEqual(b.kodeBelanja, kodeBelanja));
    const aMatches = selectedSubAnggaran.filter(a => isCodeEqual(a.kodeBelanja, kodeBelanja));
    const aMatch = aMatches[0];

    const paguMurni = aMatches.reduce((s, a) => s + a.pagu, 0);
    const revisi = aMatches.reduce((s, a) => s + a.revisi, 0);
    const nilaiSPD = aMatches.reduce((s, a) => s + (a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir), 0);
    const paguAkhir = aMatches.reduce((s, a) => s + a.paguAkhir, 0);

    const realisasi = currentRealisasi
      .filter(r => isCodeEqual(r.kodeSub, filterSelectedSub) && isCodeEqual(r.kodeBelanja, kodeBelanja))
      .reduce((s, r) => s + r.nilai, 0);

    const sisa = paguAkhir - realisasi;
    const persen = paguAkhir > 0 ? (realisasi / paguAkhir) * 100 : 0;

    return {
      kodeBelanja,
      namaBelanja: aMatch?.namaBelanja || bObj?.namaBelanja || `Belanja ${kodeBelanja}`,
      jenisBelanja: bObj?.jenisBelanja || 'Operasional',
      paguMurni,
      revisi,
      nilaiSPD,
      paguAkhir,
      realisasi,
      sisa,
      persen
    };
  });

  // Helper calculation for Laporan Per Belanja
  const allBelanjaKodes = Array.from(
    new Set([
      ...belanjaList.map(b => b.kodeBelanja.trim()),
      ...currentAnggaran.map(a => a.kodeBelanja.trim()),
      ...currentRealisasi.map(r => r.kodeBelanja.trim())
    ])
  );

  const belanjaReportData = allBelanjaKodes.map(kode => {
    const bObj = belanjaList.find(b => isCodeEqual(b.kodeBelanja, kode));
    const aMatch = currentAnggaran.find(a => isCodeEqual(a.kodeBelanja, kode));

    const paguMurni = currentAnggaran
      .filter(a => isCodeEqual(a.kodeBelanja, kode))
      .reduce((s, a) => s + a.pagu, 0);

    const revisi = currentAnggaran
      .filter(a => isCodeEqual(a.kodeBelanja, kode))
      .reduce((s, a) => s + a.revisi, 0);

    const nilaiSPD = currentAnggaran
      .filter(a => isCodeEqual(a.kodeBelanja, kode))
      .reduce((s, a) => s + (a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir), 0);

    const paguAkhir = currentAnggaran
      .filter(a => isCodeEqual(a.kodeBelanja, kode))
      .reduce((s, a) => s + a.paguAkhir, 0);

    const real = currentRealisasi
      .filter(r => isCodeEqual(r.kodeBelanja, kode))
      .reduce((s, r) => s + r.nilai, 0);

    const sisa = paguAkhir - real;
    const pct = paguAkhir > 0 ? (real / paguAkhir) * 100 : 0;

    return {
      kode,
      nama: aMatch?.namaBelanja || bObj?.namaBelanja || `Belanja ${kode}`,
      jenis: bObj?.jenisBelanja || 'Operasional',
      paguMurni,
      revisi,
      nilaiSPD,
      paguAkhir,
      realisasi: real,
      sisa,
      persen: pct
    };
  });

  // Options & calculation for detailed Sub Kegiatan under selected Rekening Belanja
  const availableBelanjaOptions = Array.from(
    new Set([
      ...belanjaList.map(b => b.kodeBelanja.trim()),
      ...currentAnggaran.map(a => a.kodeBelanja.trim()),
      ...currentRealisasi.map(r => r.kodeBelanja.trim())
    ])
  ).map(kode => {
    const bObj = belanjaList.find(b => isCodeEqual(b.kodeBelanja, kode));
    const aMatch = currentAnggaran.find(a => isCodeEqual(a.kodeBelanja, kode));
    return {
      kodeBelanja: kode,
      namaBelanja: aMatch?.namaBelanja || bObj?.namaBelanja || `Belanja ${kode}`,
      jenisBelanja: bObj?.jenisBelanja || 'Operasional'
    };
  });

  const selectedBelanjaDetail = availableBelanjaOptions.find(b => isCodeEqual(b.kodeBelanja, filterSelectedBelanja));

  const selectedBelanjaSubKodes = Array.from(
    new Set([
      ...currentAnggaran.filter(a => isCodeEqual(a.kodeBelanja, filterSelectedBelanja)).map(a => a.kodeSub.trim()),
      ...currentRealisasi.filter(r => isCodeEqual(r.kodeBelanja, filterSelectedBelanja)).map(r => r.kodeSub.trim())
    ])
  );

  const selectedBelanjaSubData = selectedBelanjaSubKodes.map(kodeSub => {
    const sObj = subKegiatanList.find(s => isCodeEqual(s.kodeSub, kodeSub));
    const aMatches = currentAnggaran.filter(a => isCodeEqual(a.kodeSub, kodeSub) && isCodeEqual(a.kodeBelanja, filterSelectedBelanja));

    const paguMurni = aMatches.reduce((s, a) => s + a.pagu, 0);
    const revisi = aMatches.reduce((s, a) => s + a.revisi, 0);
    const nilaiSPD = aMatches.reduce((s, a) => s + (a.nilaiSPD !== undefined ? a.nilaiSPD : a.paguAkhir), 0);
    const paguAkhir = aMatches.reduce((s, a) => s + a.paguAkhir, 0);

    const realisasi = currentRealisasi
      .filter(r => isCodeEqual(r.kodeSub, kodeSub) && isCodeEqual(r.kodeBelanja, filterSelectedBelanja))
      .reduce((s, r) => s + r.nilai, 0);

    const sisa = paguAkhir - realisasi;
    const persen = paguAkhir > 0 ? (realisasi / paguAkhir) * 100 : 0;

    return {
      kodeSub,
      namaSub: sObj?.namaSub || `Sub-Kegiatan ${kodeSub}`,
      paguMurni,
      revisi,
      nilaiSPD,
      paguAkhir,
      realisasi,
      sisa,
      persen
    };
  });

  // Calculation for Detail Belanja SiLPA (Tidak Tereksekusi)
  const silpaReportData = currentAnggaran.map((ang, idx) => {
    const subObj = subKegiatanList.find(s => isCodeEqual(s.kodeSub, ang.kodeSub));
    const belObj = belanjaList.find(b => isCodeEqual(b.kodeBelanja, ang.kodeBelanja));

    const totalReal = currentRealisasi
      .filter(r => isCodeEqual(r.kodeBelanja, ang.kodeBelanja) && (isCodeEqual(r.kodeSub, ang.kodeSub) || !r.kodeSub))
      .reduce((s, r) => s + r.nilai, 0);

    const paguMurni = ang.pagu;
    const revisi = ang.revisi;
    const paguAkhir = ang.paguAkhir;
    const sisa = paguAkhir - totalReal;
    const persen = paguAkhir > 0 ? (totalReal / paguAkhir) * 100 : 0;

    let status: 'unexecuted' | 'partial' | 'full' = 'full';
    let statusText = 'Terserap Penuh';
    if (totalReal === 0) {
      status = 'unexecuted';
      statusText = '100% Tidak Tereksekusi';
    } else if (sisa > 0) {
      status = 'partial';
      statusText = 'Tereksekusi Sebagian';
    }

    return {
      id: ang.id,
      no: idx + 1,
      kodeSub: ang.kodeSub,
      namaSub: subObj?.namaSub || ang.namaSub || ang.kodeSub,
      kodeBelanja: ang.kodeBelanja,
      namaBelanja: belObj?.namaBelanja || ang.namaBelanja || ang.kodeBelanja,
      sumberDana: ang.sumberDana || 'DAU',
      paguMurni,
      revisi,
      paguAkhir,
      realisasi: totalReal,
      sisa,
      persen,
      status,
      statusText,
      kodeProgram: ang.kodeProgram,
      kodeKegiatan: ang.kodeKegiatan
    };
  });

  const filteredSilpaData = silpaReportData.filter(item => {
    if (silpaFilterStatus === 'unexecuted' && item.status !== 'unexecuted') return false;
    if (silpaFilterStatus === 'partial' && item.status !== 'partial') return false;
    if (silpaFilterStatus === 'full' && item.status !== 'full') return false;
    if (silpaFilterStatus === 'all' && item.sisa <= 0) return false;

    if (silpaSearchTerm) {
      const term = silpaSearchTerm.toLowerCase();
      const matchSub = item.kodeSub.toLowerCase().includes(term) || item.namaSub.toLowerCase().includes(term);
      const matchBel = item.kodeBelanja.toLowerCase().includes(term) || item.namaBelanja.toLowerCase().includes(term);
      if (!matchSub && !matchBel) return false;
    }

    return true;
  });

  // Calculation for Laporan Semua Belanja Hibah
  const isHibahAccount = (kodeBelanja: string, namaBelanja: string, jenisBelanja?: string) => {
    const kb = (kodeBelanja || '').trim();
    const nb = (namaBelanja || '').toLowerCase();
    const jb = (jenisBelanja || '').toLowerCase();
    return (
      kb.startsWith('5.1.05') ||
      kb.startsWith('5.1.5') ||
      kb.startsWith('5.4') ||
      nb.includes('hibah') ||
      jb.includes('hibah')
    );
  };

  const hibahAnggaranList = currentAnggaran.filter(a => {
    const belObj = belanjaList.find(b => isCodeEqual(b.kodeBelanja, a.kodeBelanja));
    return isHibahAccount(a.kodeBelanja, a.namaBelanja || belObj?.namaBelanja || '', belObj?.jenisBelanja);
  });

  // Also include any realisasi that belongs to hibah even if not in anggaran
  const hibahReportData = hibahAnggaranList.map((ang, idx) => {
    const subObj = subKegiatanList.find(s => isCodeEqual(s.kodeSub, ang.kodeSub));
    const belObj = belanjaList.find(b => isCodeEqual(b.kodeBelanja, ang.kodeBelanja));

    const totalReal = currentRealisasi
      .filter(r => isCodeEqual(r.kodeBelanja, ang.kodeBelanja) && (isCodeEqual(r.kodeSub, ang.kodeSub) || !r.kodeSub))
      .reduce((s, r) => s + r.nilai, 0);

    const paguMurni = ang.pagu;
    const revisi = ang.revisi;
    const nilaiSPD = ang.nilaiSPD !== undefined ? ang.nilaiSPD : ang.paguAkhir;
    const paguAkhir = ang.paguAkhir;
    const sisa = paguAkhir - totalReal;
    const persen = paguAkhir > 0 ? (totalReal / paguAkhir) * 100 : 0;

    let status: 'unexecuted' | 'partial' | 'full' = 'full';
    let statusText = 'Terserap Penuh';
    if (totalReal === 0) {
      status = 'unexecuted';
      statusText = '100% Belum Dicairkan';
    } else if (sisa > 0) {
      status = 'partial';
      statusText = 'Dicairkan Sebagian';
    }

    return {
      id: ang.id,
      no: idx + 1,
      kodeSub: ang.kodeSub,
      namaSub: subObj?.namaSub || ang.namaSub || ang.kodeSub,
      kodeBelanja: ang.kodeBelanja,
      namaBelanja: belObj?.namaBelanja || ang.namaBelanja || ang.kodeBelanja,
      sumberDana: ang.sumberDana || 'DAU',
      paguMurni,
      revisi,
      nilaiSPD,
      paguAkhir,
      realisasi: totalReal,
      sisa,
      persen,
      status,
      statusText,
      kodeProgram: ang.kodeProgram,
      kodeKegiatan: ang.kodeKegiatan
    };
  });

  const filteredHibahData = hibahReportData.filter(item => {
    if (hibahFilterStatus === 'unexecuted' && item.status !== 'unexecuted') return false;
    if (hibahFilterStatus === 'partial' && item.status !== 'partial') return false;
    if (hibahFilterStatus === 'full' && item.status !== 'full') return false;

    if (hibahSearchTerm) {
      const term = hibahSearchTerm.toLowerCase();
      const matchSub = item.kodeSub.toLowerCase().includes(term) || item.namaSub.toLowerCase().includes(term);
      const matchBel = item.kodeBelanja.toLowerCase().includes(term) || item.namaBelanja.toLowerCase().includes(term);
      const matchSumber = item.sumberDana.toLowerCase().includes(term);
      if (!matchSub && !matchBel && !matchSumber) return false;
    }

    return true;
  });

  // Calculation for Laporan Bulanan (Target Anggaran vs Realisasi per Bulan)
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const totalPaguTahun = currentAnggaran.reduce((s, a) => s + a.paguAkhir, 0);
  const targetPerBulan = totalPaguTahun / 12;

  let accumRealBulanan = 0;
  const monthlyReportData = monthNames.map((mName, idx) => {
    const monthNum = idx + 1;
    const realBulanIni = currentRealisasi
      .filter(r => Number(r.bulan) === monthNum)
      .reduce((s, r) => s + r.nilai, 0);

    const transCount = currentRealisasi.filter(r => Number(r.bulan) === monthNum).length;

    accumRealBulanan += realBulanIni;
    const sisaPagu = totalPaguTahun - accumRealBulanan;
    const targetKumulatif = targetPerBulan * monthNum;
    const persenSerapanBulanan = targetPerBulan > 0 ? (realBulanIni / targetPerBulan) * 100 : 0;
    const persenSerapanKumulatif = totalPaguTahun > 0 ? (accumRealBulanan / totalPaguTahun) * 100 : 0;

    return {
      no: monthNum,
      bulanNum: monthNum,
      namaBulan: mName,
      targetAnggaranBulanIni: targetPerBulan,
      targetAnggaranKumulatif: targetKumulatif,
      realisasiBulanIni: realBulanIni,
      realisasiKumulatif: accumRealBulanan,
      sisaPagu,
      persenSerapanBulanan,
      persenSerapanKumulatif,
      transCount
    };
  });

  const filteredMonthlyData = filterBulan === 'all'
    ? monthlyReportData
    : monthlyReportData.filter(m => m.bulanNum === Number(filterBulan));

  // Triwulan Calculation
  const triwulanList = [
    { id: 1, nama: 'Triwulan I (Jan - Mar)', bulanStart: 1, bulanEnd: 3 },
    { id: 2, nama: 'Triwulan II (Apr - Jun)', bulanStart: 4, bulanEnd: 6 },
    { id: 3, nama: 'Triwulan III (Jul - Sep)', bulanStart: 7, bulanEnd: 9 },
    { id: 4, nama: 'Triwulan IV (Okt - Des)', bulanStart: 10, bulanEnd: 12 }
  ];

  let accumRealTw = 0;
  const triwulanReportData = triwulanList.map(tw => {
    const targetTw = totalPaguTahun / 4;
    const realTw = currentRealisasi
      .filter(r => Number(r.bulan) >= tw.bulanStart && Number(r.bulan) <= tw.bulanEnd)
      .reduce((s, r) => s + r.nilai, 0);

    accumRealTw += realTw;
    const sisa = totalPaguTahun - accumRealTw;
    const persen = totalPaguTahun > 0 ? (accumRealTw / totalPaguTahun) * 100 : 0;

    return {
      no: tw.id,
      nama: tw.nama,
      bulanList: `Bulan ${tw.bulanStart} s.d ${tw.bulanEnd}`,
      target: targetTw,
      realisasi: realTw,
      realisasiKumulatif: accumRealTw,
      sisa,
      persenSerapan: persen
    };
  });

  // Semester Calculation
  const semesterList = [
    { id: 1, nama: 'Semester I (Jan - Jun)', bulanStart: 1, bulanEnd: 6 },
    { id: 2, nama: 'Semester II (Jul - Des)', bulanStart: 7, bulanEnd: 12 }
  ];

  let accumRealSem = 0;
  const semesterReportData = semesterList.map(sem => {
    const targetSem = totalPaguTahun / 2;
    const realSem = currentRealisasi
      .filter(r => Number(r.bulan) >= sem.bulanStart && Number(r.bulan) <= sem.bulanEnd)
      .reduce((s, r) => s + r.nilai, 0);

    accumRealSem += realSem;
    const sisa = totalPaguTahun - accumRealSem;
    const persen = totalPaguTahun > 0 ? (accumRealSem / totalPaguTahun) * 100 : 0;

    return {
      no: sem.id,
      nama: sem.nama,
      bulanList: `Bulan ${sem.bulanStart} s.d ${sem.bulanEnd}`,
      target: targetSem,
      realisasi: realSem,
      realisasiKumulatif: accumRealSem,
      sisa,
      persenSerapan: persen
    };
  });

  // Helper Export Excel
  const exportToExcel = () => {
    let exportRows: any[] = [];
    let titleName = 'Laporan_Keuangan_BFMS_NTB';

    if (activeTab === 'laporan-hibah') {
      titleName = `Laporan_Semua_Belanja_Hibah_NTB_${selectedTahun}`;
      exportRows = filteredHibahData.map(r => ({
        'No': r.no,
        'Kode Sub Kegiatan': r.kodeSub,
        'Nama Sub Kegiatan': r.namaSub,
        'Kode Rekening Belanja': r.kodeBelanja,
        'Uraian Rekening Hibah': r.namaBelanja,
        'Sumber Dana': r.sumberDana,
        'Pagu Murni (Rp)': r.paguMurni,
        'Pergeseran/Revisi (Rp)': r.revisi,
        'Nilai SPD (Rp)': r.nilaiSPD,
        'Pagu Akhir (Rp)': r.paguAkhir,
        'Realisasi SP2D (Rp)': r.realisasi,
        'Sisa Pagu (Rp)': r.sisa,
        'Persentase Serapan (%)': r.persen.toFixed(2),
        'Status Penyerapan': r.statusText
      }));
    } else if (activeTab === 'laporan-silpa') {
      titleName = `Detail_Belanja_SiLPA_NTB_${selectedTahun}`;
      exportRows = filteredSilpaData.map(r => ({
        'Kode Sub Kegiatan': r.kodeSub,
        'Nama Sub Kegiatan': r.namaSub,
        'Kode Rekening Belanja': r.kodeBelanja,
        'Uraian Rekening Belanja': r.namaBelanja,
        'Sumber Dana': r.sumberDana,
        'Pagu Murni (Rp)': r.paguMurni,
        'Pergeseran/Revisi (Rp)': r.revisi,
        'Pagu Akhir (Rp)': r.paguAkhir,
        'Realisasi SP2D (Rp)': r.realisasi,
        'Sisa Pagu / SiLPA (Rp)': r.sisa,
        'Persentase Serapan (%)': r.persen.toFixed(2),
        'Status Eksekusi': r.statusText
      }));
    } else if (activeTab === 'laporan-bulanan') {
      titleName = `Laporan_Bulanan_Anggaran_Realisasi_${selectedTahun}`;
      exportRows = filteredMonthlyData.map(m => ({
        'No': m.no,
        'Bulan': m.namaBulan,
        'Target Anggaran Bulanan (Rp)': m.targetAnggaranBulanIni,
        'Target Anggaran Kumulatif (Rp)': m.targetAnggaranKumulatif,
        'Realisasi SP2D Bulan Ini (Rp)': m.realisasiBulanIni,
        'Realisasi Kumulatif (Rp)': m.realisasiKumulatif,
        'Sisa Pagu Anggaran / SiLPA (Rp)': m.sisaPagu,
        'Serapan Bulanan (%)': m.persenSerapanBulanan.toFixed(2),
        'Serapan Kumulatif (%)': m.persenSerapanKumulatif.toFixed(2),
        'Jumlah Transaksi SP2D': m.transCount
      }));
    } else if (activeTab === 'laporan-triwulan') {
      titleName = `Laporan_Triwulan_Anggaran_Realisasi_${selectedTahun}`;
      exportRows = triwulanReportData.map(tw => ({
        'No': tw.no,
        'Periode Triwulan': tw.nama,
        'Cakupan Bulan': tw.bulanList,
        'Target Anggaran Triwulan (Rp)': tw.target,
        'Realisasi SP2D Triwulan Ini (Rp)': tw.realisasi,
        'Realisasi Kumulatif (Rp)': tw.realisasiKumulatif,
        'Sisa Pagu Anggaran (Rp)': tw.sisa,
        'Serapan Kumulatif (%)': tw.persenSerapan.toFixed(2)
      }));
    } else if (activeTab === 'laporan-semester') {
      titleName = `Laporan_Semester_Anggaran_Realisasi_${selectedTahun}`;
      exportRows = semesterReportData.map(sem => ({
        'No': sem.no,
        'Periode Semester': sem.nama,
        'Cakupan Bulan': sem.bulanList,
        'Target Anggaran Semester (Rp)': sem.target,
        'Realisasi SP2D Semester Ini (Rp)': sem.realisasi,
        'Realisasi Kumulatif (Rp)': sem.realisasiKumulatif,
        'Sisa Pagu Anggaran (Rp)': sem.sisa,
        'Serapan Kumulatif (%)': sem.persenSerapan.toFixed(2)
      }));
    } else if (activeTab === 'laporan-tahunan') {
      const totalMurni = currentAnggaran.reduce((s, a) => s + a.pagu, 0);
      const totalRev = currentAnggaran.reduce((s, a) => s + a.revisi, 0);
      const totalReal = currentRealisasi.reduce((s, r) => s + r.nilai, 0);
      titleName = `Laporan_Tahunan_Anggaran_Realisasi_${selectedTahun}`;
      exportRows = [{
        'Tahun Anggaran': selectedTahun,
        'Pagu Murni (Rp)': totalMurni,
        'Pergeseran/Revisi (Rp)': totalRev,
        'Pagu Akhir (Rp)': totalPaguTahun,
        'Realisasi Total SP2D (Rp)': totalReal,
        'Sisa Pagu Anggaran / SiLPA (Rp)': totalPaguTahun - totalReal,
        'Persentase Serapan (%)': totalPaguTahun > 0 ? ((totalReal / totalPaguTahun) * 100).toFixed(2) : '0.00'
      }];
    } else if (activeTab === 'laporan-program') {
      titleName = `Realisasi_Program_NTB_${selectedTahun}`;
      exportRows = programReportData.map(r => ({
        'Kode Program': r.kode,
        'Nama Program': r.nama,
        'Pagu Murni (Rp)': r.paguMurni,
        'Pergeseran/Revisi (Rp)': r.revisi,
        'Nilai SPD (Rp)': r.nilaiSPD,
        'Pagu Akhir (Rp)': r.paguAkhir,
        'Realisasi SP2D (Rp)': r.realisasi,
        'Sisa Pagu (Rp)': r.sisa,
        'Persentase (%)': r.persen.toFixed(2)
      }));
    } else if (activeTab === 'laporan-kegiatan') {
      titleName = `Realisasi_Kegiatan_NTB_${selectedTahun}`;
      exportRows = kegiatanReportData.map(r => ({
        'Kode Kegiatan': r.kodeKeg,
        'Nama Kegiatan': r.namaKeg,
        'Pagu Murni (Rp)': r.paguMurni,
        'Pergeseran/Revisi (Rp)': r.revisi,
        'Nilai SPD (Rp)': r.nilaiSPD,
        'Pagu Akhir (Rp)': r.paguAkhir,
        'Realisasi SP2D (Rp)': r.realisasi,
        'Sisa Pagu (Rp)': r.sisa,
        'Persentase (%)': r.persen.toFixed(2)
      }));
    } else if (activeTab === 'laporan-subkegiatan') {
      if (filterSelectedSub !== 'all') {
        titleName = `Realisasi_Rekening_SubKegiatan_${filterSelectedSub}_${selectedTahun}`;
        exportRows = selectedSubBelanjaData.map(r => ({
          'Kode Sub Kegiatan': filterSelectedSub,
          'Nama Sub Kegiatan': selectedSubDetail?.namaSub || filterSelectedSub,
          'Kode Rekening Belanja': r.kodeBelanja,
          'Uraian Rekening Belanja': r.namaBelanja,
          'Jenis Belanja': r.jenisBelanja,
          'Pagu Murni (Rp)': r.paguMurni,
          'Pergeseran/Revisi (Rp)': r.revisi,
          'Nilai SPD (Rp)': r.nilaiSPD,
          'Pagu Akhir (Rp)': r.paguAkhir,
          'Realisasi SP2D (Rp)': r.realisasi,
          'Sisa Pagu (Rp)': r.sisa,
          'Persentase (%)': r.persen.toFixed(2)
        }));
      } else {
        titleName = `Realisasi_SubKegiatan_NTB_${selectedTahun}`;
        exportRows = subReportData.map(r => ({
          'Kode Sub Kegiatan': r.kodeSub,
          'Nama Sub Kegiatan': r.namaSub,
          'Pagu Murni (Rp)': r.paguMurni,
          'Pergeseran/Revisi (Rp)': r.revisi,
          'Nilai SPD (Rp)': r.nilaiSPD,
          'Pagu Akhir (Rp)': r.paguAkhir,
          'Realisasi SP2D (Rp)': r.realisasi,
          'Sisa Pagu (Rp)': r.sisa,
          'Persentase (%)': r.persen.toFixed(2)
        }));
      }
    } else {
      if (filterSelectedBelanja !== 'all') {
        titleName = `Realisasi_SubKegiatan_Belanja_${filterSelectedBelanja}_${selectedTahun}`;
        exportRows = selectedBelanjaSubData.map(r => ({
          'Kode Belanja': filterSelectedBelanja,
          'Uraian Belanja': selectedBelanjaDetail?.namaBelanja || filterSelectedBelanja,
          'Kode Sub Kegiatan': r.kodeSub,
          'Nama Sub Kegiatan': r.namaSub,
          'Pagu Murni (Rp)': r.paguMurni,
          'Pergeseran/Revisi (Rp)': r.revisi,
          'Nilai SPD (Rp)': r.nilaiSPD,
          'Pagu Akhir (Rp)': r.paguAkhir,
          'Realisasi SP2D (Rp)': r.realisasi,
          'Sisa Pagu (Rp)': r.sisa,
          'Persentase (%)': r.persen.toFixed(2)
        }));
      } else {
        titleName = `Realisasi_Belanja_NTB_${selectedTahun}`;
        exportRows = belanjaReportData.map(r => ({
          'Kode Belanja': r.kode,
          'Uraian Belanja': r.nama,
          'Jenis Belanja': r.jenis,
          'Pagu Murni (Rp)': r.paguMurni,
          'Pergeseran/Revisi (Rp)': r.revisi,
          'Nilai SPD (Rp)': r.nilaiSPD,
          'Pagu Akhir (Rp)': r.paguAkhir,
          'Realisasi SP2D (Rp)': r.realisasi,
          'Sisa Pagu (Rp)': r.sisa,
          'Persentase (%)': r.persen.toFixed(2)
        }));
      }
    }

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan_Keuangan');
    safeDownloadExcel(wb, `${titleName}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Controls (Hidden during print) */}
      <div className="print:hidden flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-bold text-white">Laporan Keuangan Eksekutif</h1>
          </div>
          <p className="text-xs text-slate-400">
            Penyusunan Laporan Realisasi Anggaran (LRA) BAKESBANGPOLDAGRI NTB TA {selectedTahun}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Penandatangan Selectors (Synced with Data Pengguna) */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 p-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-bold text-[11px] pl-1">PPK:</span>
              <select
                value={selectedPpkId}
                onChange={e => setSelectedPpkId(e.target.value)}
                className="bg-slate-950 text-white rounded-lg px-2 py-1 border border-slate-700 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.nama} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-bold text-[11px] pl-1">Kepala Badan:</span>
              <select
                value={selectedKabanId}
                onChange={e => setSelectedKabanId(e.target.value)}
                className="bg-slate-950 text-white rounded-lg px-2 py-1 border border-slate-700 text-xs font-semibold focus:outline-none focus:border-emerald-500"
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.nama} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-3.5 py-2 text-xs font-bold text-emerald-400 hover:border-emerald-500 hover:bg-slate-800"
          >
            <Download className="h-4 w-4" />
            <span>Ekspor Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500 shadow-md"
          >
            <Printer className="h-4 w-4" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs Navigation (Hidden during print) */}
      <div className="print:hidden flex overflow-x-auto gap-2 border-b border-slate-800 pb-2 scrollbar-none">
        {[
          { id: 'laporan-program', label: '1. Per Program' },
          { id: 'laporan-kegiatan', label: '2. Per Kegiatan' },
          { id: 'laporan-subkegiatan', label: '3. Per Sub Kegiatan' },
          { id: 'laporan-belanja', label: '4. Per Rekening Belanja' },
          { id: 'laporan-hibah', label: '5. Semua Belanja Hibah' },
          { id: 'laporan-bulanan', label: '6. Laporan Bulanan' },
          { id: 'laporan-triwulan', label: '7. Laporan Triwulan' },
          { id: 'laporan-semester', label: '8. Laporan Semester' },
          { id: 'laporan-tahunan', label: '9. Laporan Tahunan' },
          { id: 'laporan-silpa', label: '10. Detail Belanja SiLPA' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'bg-amber-600 text-white shadow font-bold'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tip Banner for Interactive Realisasi Click */}
      <div className="print:hidden flex items-center justify-between gap-2 bg-emerald-950/40 border border-emerald-500/30 rounded-2xl px-4 py-2.5 text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <Info className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>Petunjuk: Klik pada nilai <strong className="text-emerald-200">Realisasi SP2D (Rp)</strong> pada tabel untuk menampilkan rincian <strong>Uraian Belanja</strong> dari transaksi tersebut.</span>
        </div>
      </div>

      {/* REPORT CANVAS SHEET FOR PRINT & DISPLAY */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-2xl text-slate-100 print:border-none print:p-0 print:bg-white print:text-slate-950">
        
        {/* OFFICIAL GOVERNMENT REPORT KOP SURAT / HEADER */}
        <div className="text-center border-b-2 border-slate-700 print:border-slate-900 pb-4 mb-6">
          <div className="flex justify-center mb-2">
            <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-slate-950 print:bg-transparent p-0.5 border border-emerald-500/40 print:border-none shadow-md overflow-hidden">
              {opd?.logoUrl ? (
                <img
                  src={opd.logoUrl}
                  alt="Logo NTB"
                  className="h-full w-full object-cover rounded-lg"
                />
              ) : (
                <NTBLogo className="h-full w-full" />
              )}
            </div>
          </div>
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 print:text-slate-700">
            PEMERINTAH PROVINSI NUSA TENGGARA BARAT
          </h2>
          <h1 className="text-base font-black uppercase text-white print:text-black sm:text-lg">
            {opd.namaOPD}
          </h1>
          <p className="text-[11px] font-medium text-emerald-400 print:text-slate-600">
            LAPORAN REALISASI ANGGARAN (LRA) TAHUN ANGGARAN {selectedTahun}
          </p>
        </div>

        {/* 1. LAPORAN PER PROGRAM */}
        {activeTab === 'laporan-program' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-amber-400 print:text-slate-900 border-b border-slate-800 pb-1">
              I. Laporan Realisasi Keuangan Per Program
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-slate-900 font-bold uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Kode Program</th>
                    <th className="p-3">Nama Program</th>
                    <th className="p-3 text-right">Pagu Murni (Rp)</th>
                    <th className="p-3 text-right">Pergeseran (Rp)</th>
                    <th className="p-3 text-right">Nilai SPD (Rp)</th>
                    <th className="p-3 text-right">Pagu Akhir (Rp)</th>
                    <th className="p-3 text-right">Realisasi SP2D (Rp)</th>
                    <th className="p-3 text-right">Sisa Pagu (Rp)</th>
                    <th className="p-3 text-center">% Serapan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                  {programReportData.map(r => (
                    <tr key={r.kode} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-amber-400 print:text-slate-900">{r.kode}</td>
                      <td className="p-3 font-semibold text-white print:text-slate-900">{r.nama}</td>
                      <td className="p-3 text-right font-mono text-slate-300 print:text-slate-800">Rp {r.paguMurni.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-mono text-amber-400/80 print:text-slate-800">Rp {r.revisi.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-mono text-blue-300 print:text-slate-800">Rp {r.nilaiSPD.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-mono font-bold text-white print:text-slate-900">Rp {r.paguAkhir.toLocaleString('id-ID')}</td>
                      <td
                        onClick={() => setSelectedRealisasiFilter({
                          title: `Rincian Uraian Realisasi Program`,
                          subtitle: `${r.kode} - ${r.nama}`,
                          kodeProgram: r.kode
                        })}
                        className="p-3 text-right font-mono text-emerald-400 hover:text-emerald-200 hover:underline cursor-pointer print:text-slate-900 font-bold"
                        title="Klik untuk melihat rincian uraian realisasi"
                      >
                        <span className="inline-flex items-center gap-1 justify-end">
                          <span>Rp {r.realisasi.toLocaleString('id-ID')}</span>
                          <Eye className="h-3.5 w-3.5 text-emerald-400/80 print:hidden" />
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-amber-300 print:text-slate-900">
                        Rp {r.sisa.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-center font-bold text-emerald-300 print:text-slate-900">
                        {r.persen.toFixed(2)} %
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-white print:bg-slate-100 print:text-black">
                  {(() => {
                    const totalMurni = programReportData.reduce((s, r) => s + r.paguMurni, 0);
                    const totalRev = programReportData.reduce((s, r) => s + r.revisi, 0);
                    const totalSPD = programReportData.reduce((s, r) => s + r.nilaiSPD, 0);
                    const totalAkhir = programReportData.reduce((s, r) => s + r.paguAkhir, 0);
                    const totalReal = programReportData.reduce((s, r) => s + r.realisasi, 0);
                    const totalSisa = totalAkhir - totalReal;
                    const totalPct = totalAkhir > 0 ? (totalReal / totalAkhir) * 100 : 0;
                    return (
                      <tr>
                        <td colSpan={2} className="p-3 text-right uppercase">TOTAL KESELURUHAN PROGRAM:</td>
                        <td className="p-3 text-right font-mono">Rp {totalMurni.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-amber-300">Rp {totalRev.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-blue-300">Rp {totalSPD.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-emerald-400">Rp {totalAkhir.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-emerald-300">Rp {totalReal.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-amber-300">Rp {totalSisa.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-center text-emerald-300">{totalPct.toFixed(2)} %</td>
                      </tr>
                    );
                  })()}
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 2. LAPORAN PER KEGIATAN */}
        {activeTab === 'laporan-kegiatan' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase text-amber-400 print:text-slate-900 border-b border-slate-800 pb-1">
              II. Laporan Realisasi Keuangan Per Kegiatan
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-slate-900 font-bold uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Kode Kegiatan</th>
                    <th className="p-3">Nama Kegiatan</th>
                    <th className="p-3 text-right">Pagu Murni (Rp)</th>
                    <th className="p-3 text-right">Pergeseran (Rp)</th>
                    <th className="p-3 text-right">Nilai SPD (Rp)</th>
                    <th className="p-3 text-right">Pagu Akhir (Rp)</th>
                    <th className="p-3 text-right">Realisasi SP2D (Rp)</th>
                    <th className="p-3 text-right">Sisa Pagu (Rp)</th>
                    <th className="p-3 text-center">% Serapan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                  {kegiatanReportData.map(r => (
                    <tr key={r.kodeKeg} className="hover:bg-slate-800/40">
                      <td className="p-3 font-mono font-bold text-teal-400 print:text-slate-900">{r.kodeKeg}</td>
                      <td className="p-3 font-semibold text-white print:text-slate-900">{r.namaKeg}</td>
                      <td className="p-3 text-right font-mono text-slate-300 print:text-slate-800">Rp {r.paguMurni.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-mono text-amber-400/80 print:text-slate-800">Rp {r.revisi.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-mono text-blue-300 print:text-slate-800">Rp {r.nilaiSPD.toLocaleString('id-ID')}</td>
                      <td className="p-3 text-right font-mono font-bold text-white print:text-slate-900">Rp {r.paguAkhir.toLocaleString('id-ID')}</td>
                      <td
                        onClick={() => setSelectedRealisasiFilter({
                          title: `Rincian Uraian Realisasi Kegiatan`,
                          subtitle: `${r.kodeKeg} - ${r.namaKeg}`,
                          kodeKegiatan: r.kodeKeg
                        })}
                        className="p-3 text-right font-mono text-emerald-400 hover:text-emerald-200 hover:underline cursor-pointer print:text-slate-900 font-bold"
                        title="Klik untuk melihat rincian uraian realisasi"
                      >
                        <span className="inline-flex items-center gap-1 justify-end">
                          <span>Rp {r.realisasi.toLocaleString('id-ID')}</span>
                          <Eye className="h-3.5 w-3.5 text-emerald-400/80 print:hidden" />
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono text-amber-300 print:text-slate-900">
                        Rp {r.sisa.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-center font-bold text-emerald-300 print:text-slate-900">
                        {r.persen.toFixed(2)} %
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-white print:bg-slate-100 print:text-black">
                  {(() => {
                    const totalMurni = kegiatanReportData.reduce((s, r) => s + r.paguMurni, 0);
                    const totalRev = kegiatanReportData.reduce((s, r) => s + r.revisi, 0);
                    const totalSPD = kegiatanReportData.reduce((s, r) => s + r.nilaiSPD, 0);
                    const totalAkhir = kegiatanReportData.reduce((s, r) => s + r.paguAkhir, 0);
                    const totalReal = kegiatanReportData.reduce((s, r) => s + r.realisasi, 0);
                    const totalSisa = totalAkhir - totalReal;
                    const totalPct = totalAkhir > 0 ? (totalReal / totalAkhir) * 100 : 0;
                    return (
                      <tr>
                        <td colSpan={2} className="p-3 text-right uppercase">TOTAL KESELURUHAN KEGIATAN:</td>
                        <td className="p-3 text-right font-mono">Rp {totalMurni.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-amber-300">Rp {totalRev.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-blue-300">Rp {totalSPD.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-emerald-400">Rp {totalAkhir.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-emerald-300">Rp {totalReal.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-amber-300">Rp {totalSisa.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-center text-emerald-300">{totalPct.toFixed(2)} %</td>
                      </tr>
                    );
                  })()}
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 3. LAPORAN PER SUB KEGIATAN */}
        {activeTab === 'laporan-subkegiatan' && (
          <div className="space-y-4">
            {/* Filter Droplist Sub Kegiatan */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 print:hidden">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-amber-400" />
                <label className="text-xs font-bold text-slate-200">Filter Sub Kegiatan:</label>
              </div>
              <SubKegiatanCombobox
                value={filterSelectedSub}
                onChange={setFilterSelectedSub}
                options={availableSubKegiatanOptions}
              />
            </div>

            <h3 className="text-xs font-bold uppercase text-amber-400 print:text-slate-900 border-b border-slate-800 pb-1">
              {filterSelectedSub === 'all'
                ? 'III. Laporan Realisasi Keuangan Per Sub-Kegiatan (Rekapitulasi)'
                : `III. Laporan Realisasi Rekening Belanja - Sub-Kegiatan ${filterSelectedSub}`}
            </h3>

            {filterSelectedSub !== 'all' && selectedSubDetail && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 print:bg-slate-100 print:border-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold">Kode Sub Kegiatan: </span>
                    <span className="font-mono font-bold text-amber-400 print:text-black">{selectedSubDetail.kodeSub}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold">Nama Sub Kegiatan: </span>
                    <span className="font-bold text-white print:text-black">{selectedSubDetail.namaSub}</span>
                  </div>
                  {selectedSubDetail.namaKegiatan && (
                    <div className="md:col-span-2">
                      <span className="text-slate-400 font-bold">Kegiatan: </span>
                      <span className="text-slate-300 print:text-slate-800">{selectedSubDetail.kodeKegiatan} - {selectedSubDetail.namaKegiatan}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {filterSelectedSub === 'all' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-slate-900 font-bold uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Kode Sub</th>
                      <th className="p-3">Uraian Sub Kegiatan</th>
                      <th className="p-3 text-right">Pagu Murni (Rp)</th>
                      <th className="p-3 text-right">Pergeseran (Rp)</th>
                      <th className="p-3 text-right">Nilai SPD (Rp)</th>
                      <th className="p-3 text-right">Pagu Akhir (Rp)</th>
                      <th className="p-3 text-right">Realisasi SP2D (Rp)</th>
                      <th className="p-3 text-right">Sisa Pagu (Rp)</th>
                      <th className="p-3 text-center">% Serapan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                    {subReportData.map(r => (
                      <tr key={r.kodeSub} className="hover:bg-slate-800/40 cursor-pointer" onClick={() => setFilterSelectedSub(r.kodeSub)}>
                        <td className="p-3 font-mono font-bold text-amber-400 print:text-slate-900">{r.kodeSub}</td>
                        <td className="p-3 font-semibold text-white print:text-slate-900">{r.namaSub}</td>
                        <td className="p-3 text-right font-mono text-slate-300 print:text-slate-800">Rp {r.paguMurni.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-amber-400/80 print:text-slate-800">Rp {r.revisi.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-blue-300 print:text-slate-800">Rp {r.nilaiSPD.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono font-bold text-white print:text-slate-900">Rp {r.paguAkhir.toLocaleString('id-ID')}</td>
                        <td
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRealisasiFilter({
                              title: `Rincian Uraian Realisasi Sub-Kegiatan`,
                              subtitle: `${r.kodeSub} - ${r.namaSub}`,
                              kodeSub: r.kodeSub
                            });
                          }}
                          className="p-3 text-right font-mono text-emerald-400 hover:text-emerald-200 hover:underline cursor-pointer print:text-slate-900 font-bold"
                          title="Klik untuk melihat rincian uraian realisasi belanja"
                        >
                          <span className="inline-flex items-center gap-1 justify-end">
                            <span>Rp {r.realisasi.toLocaleString('id-ID')}</span>
                            <Eye className="h-3.5 w-3.5 text-emerald-400/80 print:hidden" />
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono text-amber-300 print:text-slate-900">
                          Rp {r.sisa.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-300 print:text-slate-900">
                          {r.persen.toFixed(2)} %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-white print:bg-slate-100 print:text-black">
                    {(() => {
                      const totalMurni = subReportData.reduce((s, r) => s + r.paguMurni, 0);
                      const totalRev = subReportData.reduce((s, r) => s + r.revisi, 0);
                      const totalSPD = subReportData.reduce((s, r) => s + r.nilaiSPD, 0);
                      const totalAkhir = subReportData.reduce((s, r) => s + r.paguAkhir, 0);
                      const totalReal = subReportData.reduce((s, r) => s + r.realisasi, 0);
                      const totalSisa = totalAkhir - totalReal;
                      const totalPct = totalAkhir > 0 ? (totalReal / totalAkhir) * 100 : 0;
                      return (
                        <tr>
                          <td colSpan={2} className="p-3 text-right uppercase">TOTAL KESELURUHAN SUB-KEGIATAN:</td>
                          <td className="p-3 text-right font-mono">Rp {totalMurni.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-amber-300">Rp {totalRev.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-blue-300">Rp {totalSPD.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-emerald-400">Rp {totalAkhir.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-emerald-300">Rp {totalReal.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-amber-300">Rp {totalSisa.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-center text-emerald-300">{totalPct.toFixed(2)} %</td>
                        </tr>
                      );
                    })()}
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-slate-900 font-bold uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Kode Rekening</th>
                      <th className="p-3">Nama Uraian Belanja</th>
                      <th className="p-3">Jenis Belanja</th>
                      <th className="p-3 text-right">Pagu Murni (Rp)</th>
                      <th className="p-3 text-right">Pergeseran (Rp)</th>
                      <th className="p-3 text-right">Nilai SPD (Rp)</th>
                      <th className="p-3 text-right">Pagu Akhir (Rp)</th>
                      <th className="p-3 text-right">Realisasi SP2D (Rp)</th>
                      <th className="p-3 text-right">Sisa Pagu (Rp)</th>
                      <th className="p-3 text-center">% Serapan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                    {selectedSubBelanjaData.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-6 text-center text-slate-500 italic">
                          Tidak ada data rekening belanja pada sub kegiatan ini.
                        </td>
                      </tr>
                    ) : (
                      selectedSubBelanjaData.map(r => (
                        <tr key={r.kodeBelanja} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-emerald-400 print:text-slate-900">{r.kodeBelanja}</td>
                          <td className="p-3 font-semibold text-white print:text-slate-900">{r.namaBelanja}</td>
                          <td className="p-3 text-slate-300 print:text-slate-700">{r.jenisBelanja}</td>
                          <td className="p-3 text-right font-mono text-slate-300 print:text-slate-800">Rp {r.paguMurni.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-amber-400/80 print:text-slate-800">Rp {r.revisi.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-blue-300 print:text-slate-800">Rp {r.nilaiSPD.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono font-bold text-white print:text-slate-900">Rp {r.paguAkhir.toLocaleString('id-ID')}</td>
                          <td
                            onClick={() => {
                              setSelectedRealisasiFilter({
                                title: `Rincian Uraian Realisasi Belanja`,
                                subtitle: `Sub Kegiatan: ${selectedSubDetail?.namaSub || filterSelectedSub} (${filterSelectedSub}) | Rekening: ${r.namaBelanja} (${r.kodeBelanja})`,
                                kodeSub: filterSelectedSub,
                                kodeBelanja: r.kodeBelanja
                              });
                            }}
                            className="p-3 text-right font-mono text-emerald-400 hover:text-emerald-200 hover:underline cursor-pointer print:text-slate-900 font-bold"
                            title="Klik untuk melihat rincian uraian realisasi belanja"
                          >
                            <span className="inline-flex items-center gap-1 justify-end">
                              <span>Rp {r.realisasi.toLocaleString('id-ID')}</span>
                              <Eye className="h-3.5 w-3.5 text-emerald-400/80 print:hidden" />
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono text-amber-300 print:text-slate-900">
                            Rp {r.sisa.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3 text-center font-bold text-emerald-300 print:text-slate-900">
                            {r.persen.toFixed(2)} %
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-white print:bg-slate-100 print:text-black">
                    {(() => {
                      const totalMurni = selectedSubBelanjaData.reduce((s, r) => s + r.paguMurni, 0);
                      const totalRev = selectedSubBelanjaData.reduce((s, r) => s + r.revisi, 0);
                      const totalSPD = selectedSubBelanjaData.reduce((s, r) => s + r.nilaiSPD, 0);
                      const totalAkhir = selectedSubBelanjaData.reduce((s, r) => s + r.paguAkhir, 0);
                      const totalReal = selectedSubBelanjaData.reduce((s, r) => s + r.realisasi, 0);
                      const totalSisa = totalAkhir - totalReal;
                      const totalPct = totalAkhir > 0 ? (totalReal / totalAkhir) * 100 : 0;
                      return (
                        <tr>
                          <td colSpan={3} className="p-3 text-right uppercase">TOTAL SUB-KEGIATAN INI:</td>
                          <td className="p-3 text-right font-mono">Rp {totalMurni.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-amber-300">Rp {totalRev.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-blue-300">Rp {totalSPD.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-emerald-400">Rp {totalAkhir.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-emerald-300">Rp {totalReal.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-amber-300">Rp {totalSisa.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-center text-emerald-300">{totalPct.toFixed(2)} %</td>
                        </tr>
                      );
                    })()}
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 4. LAPORAN PER BELANJA */}
        {activeTab === 'laporan-belanja' && (
          <div className="space-y-4">
            {/* Filter Droplist Rekening Belanja */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3.5 rounded-2xl border border-slate-800 print:hidden">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-400" />
                <label className="text-xs font-bold text-slate-200">Filter Rekening Belanja:</label>
              </div>
              <BelanjaCombobox
                value={filterSelectedBelanja}
                onChange={setFilterSelectedBelanja}
                options={availableBelanjaOptions}
              />
            </div>

            <h3 className="text-xs font-bold uppercase text-amber-400 print:text-slate-900 border-b border-slate-800 pb-1">
              {filterSelectedBelanja === 'all'
                ? 'IV. Laporan Realisasi Per Rekening Belanja (Rekapitulasi Global)'
                : `IV. Laporan Realisasi Sub-Kegiatan Per Rekening Belanja - ${filterSelectedBelanja}`}
            </h3>

            {filterSelectedBelanja !== 'all' && selectedBelanjaDetail && (
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 print:bg-slate-100 print:border-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold">Kode Rekening: </span>
                    <span className="font-mono font-bold text-emerald-400 print:text-black">{selectedBelanjaDetail.kodeBelanja}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold">Uraian Belanja: </span>
                    <span className="font-bold text-white print:text-black">{selectedBelanjaDetail.namaBelanja}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold">Jenis Belanja: </span>
                    <span className="text-slate-300 print:text-slate-800">{selectedBelanjaDetail.jenisBelanja}</span>
                  </div>
                </div>
              </div>
            )}

            {filterSelectedBelanja === 'all' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-slate-900 font-bold uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Kode Rekening</th>
                      <th className="p-3">Nama Uraian Belanja</th>
                      <th className="p-3">Jenis Belanja</th>
                      <th className="p-3 text-right">Pagu Murni (Rp)</th>
                      <th className="p-3 text-right">Pergeseran (Rp)</th>
                      <th className="p-3 text-right">Nilai SPD (Rp)</th>
                      <th className="p-3 text-right">Pagu Akhir (Rp)</th>
                      <th className="p-3 text-right">Realisasi SP2D (Rp)</th>
                      <th className="p-3 text-right">Sisa Pagu (Rp)</th>
                      <th className="p-3 text-center">% Serapan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                    {belanjaReportData.map(r => (
                      <tr key={r.kode} className="hover:bg-slate-800/40 cursor-pointer" onClick={() => setFilterSelectedBelanja(r.kode)}>
                        <td className="p-3 font-mono font-bold text-emerald-400 print:text-slate-900">{r.kode}</td>
                        <td className="p-3 font-semibold text-white print:text-slate-900">{r.nama}</td>
                        <td className="p-3 text-slate-300 print:text-slate-700">{r.jenis}</td>
                        <td className="p-3 text-right font-mono text-slate-300 print:text-slate-800">Rp {r.paguMurni.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-amber-400/80 print:text-slate-800">Rp {r.revisi.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono text-blue-300 print:text-slate-800">Rp {r.nilaiSPD.toLocaleString('id-ID')}</td>
                        <td className="p-3 text-right font-mono font-bold text-white print:text-slate-900">Rp {r.paguAkhir.toLocaleString('id-ID')}</td>
                        <td
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRealisasiFilter({
                              title: `Rincian Uraian Realisasi Rekening Belanja`,
                              subtitle: `${r.kode} - ${r.nama}`,
                              kodeBelanja: r.kode
                            });
                          }}
                          className="p-3 text-right font-mono text-emerald-400 hover:text-emerald-200 hover:underline cursor-pointer print:text-slate-900 font-bold"
                          title="Klik untuk melihat rincian uraian realisasi belanja"
                        >
                          <span className="inline-flex items-center gap-1 justify-end">
                            <span>Rp {r.realisasi.toLocaleString('id-ID')}</span>
                            <Eye className="h-3.5 w-3.5 text-emerald-400/80 print:hidden" />
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono text-amber-300 print:text-slate-900">
                          Rp {r.sisa.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-300 print:text-slate-900">
                          {r.persen.toFixed(2)} %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-white print:bg-slate-100 print:text-black">
                    {(() => {
                      const totalMurni = belanjaReportData.reduce((s, r) => s + r.paguMurni, 0);
                      const totalRev = belanjaReportData.reduce((s, r) => s + r.revisi, 0);
                      const totalSPD = belanjaReportData.reduce((s, r) => s + r.nilaiSPD, 0);
                      const totalAkhir = belanjaReportData.reduce((s, r) => s + r.paguAkhir, 0);
                      const totalReal = belanjaReportData.reduce((s, r) => s + r.realisasi, 0);
                      const totalSisa = totalAkhir - totalReal;
                      const totalPct = totalAkhir > 0 ? (totalReal / totalAkhir) * 100 : 0;
                      return (
                        <tr>
                          <td colSpan={3} className="p-3 text-right uppercase">TOTAL KESELURUHAN BELANJA:</td>
                          <td className="p-3 text-right font-mono">Rp {totalMurni.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-amber-300">Rp {totalRev.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-blue-300">Rp {totalSPD.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-emerald-400">Rp {totalAkhir.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-emerald-300">Rp {totalReal.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-amber-300">Rp {totalSisa.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-center text-emerald-300">{totalPct.toFixed(2)} %</td>
                        </tr>
                      );
                    })()}
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-slate-900 font-bold uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Kode Sub</th>
                      <th className="p-3">Uraian Sub Kegiatan</th>
                      <th className="p-3 text-right">Pagu Murni (Rp)</th>
                      <th className="p-3 text-right">Pergeseran (Rp)</th>
                      <th className="p-3 text-right">Nilai SPD (Rp)</th>
                      <th className="p-3 text-right">Pagu Akhir (Rp)</th>
                      <th className="p-3 text-right">Realisasi SP2D (Rp)</th>
                      <th className="p-3 text-right">Sisa Pagu (Rp)</th>
                      <th className="p-3 text-center">% Serapan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                    {selectedBelanjaSubData.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-6 text-center text-slate-500 italic">
                          Tidak ada data sub kegiatan yang memiliki rekening belanja ini.
                        </td>
                      </tr>
                    ) : (
                      selectedBelanjaSubData.map(r => (
                        <tr key={r.kodeSub} className="hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-bold text-amber-400 print:text-slate-900">{r.kodeSub}</td>
                          <td className="p-3 font-semibold text-white print:text-slate-900">{r.namaSub}</td>
                          <td className="p-3 text-right font-mono text-slate-300 print:text-slate-800">Rp {r.paguMurni.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-amber-400/80 print:text-slate-800">Rp {r.revisi.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-blue-300 print:text-slate-800">Rp {r.nilaiSPD.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono font-bold text-white print:text-slate-900">Rp {r.paguAkhir.toLocaleString('id-ID')}</td>
                          <td
                            onClick={() => {
                              setSelectedRealisasiFilter({
                                title: `Rincian Uraian Realisasi Belanja Sub-Kegiatan`,
                                subtitle: `Rekening: ${selectedBelanjaDetail?.namaBelanja || filterSelectedBelanja} (${filterSelectedBelanja}) | Sub Kegiatan: ${r.namaSub} (${r.kodeSub})`,
                                kodeBelanja: filterSelectedBelanja,
                                kodeSub: r.kodeSub
                              });
                            }}
                            className="p-3 text-right font-mono text-emerald-400 hover:text-emerald-200 hover:underline cursor-pointer print:text-slate-900 font-bold"
                            title="Klik untuk melihat rincian uraian realisasi belanja"
                          >
                            <span className="inline-flex items-center gap-1 justify-end">
                              <span>Rp {r.realisasi.toLocaleString('id-ID')}</span>
                              <Eye className="h-3.5 w-3.5 text-emerald-400/80 print:hidden" />
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono text-amber-300 print:text-slate-900">
                            Rp {r.sisa.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3 text-center font-bold text-emerald-300 print:text-slate-900">
                            {r.persen.toFixed(2)} %
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-white print:bg-slate-100 print:text-black">
                    {(() => {
                      const totalMurni = selectedBelanjaSubData.reduce((s, r) => s + r.paguMurni, 0);
                      const totalRev = selectedBelanjaSubData.reduce((s, r) => s + r.revisi, 0);
                      const totalSPD = selectedBelanjaSubData.reduce((s, r) => s + r.nilaiSPD, 0);
                      const totalAkhir = selectedBelanjaSubData.reduce((s, r) => s + r.paguAkhir, 0);
                      const totalReal = selectedBelanjaSubData.reduce((s, r) => s + r.realisasi, 0);
                      const totalSisa = totalAkhir - totalReal;
                      const totalPct = totalAkhir > 0 ? (totalReal / totalAkhir) * 100 : 0;
                      return (
                        <tr>
                          <td colSpan={2} className="p-3 text-right uppercase">TOTAL REKENING BELANJA INI:</td>
                          <td className="p-3 text-right font-mono">Rp {totalMurni.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-amber-300">Rp {totalRev.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-blue-300">Rp {totalSPD.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-emerald-400">Rp {totalAkhir.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-emerald-300">Rp {totalReal.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-right font-mono text-amber-300">Rp {totalSisa.toLocaleString('id-ID')}</td>
                          <td className="p-3 text-center text-emerald-300">{totalPct.toFixed(2)} %</td>
                        </tr>
                      );
                    })()}
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}

        {/* 5. LAPORAN SEMUA BELANJA HIBAH */}
        {activeTab === 'laporan-hibah' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-xs font-bold uppercase text-amber-400 print:text-slate-900 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-400 print:hidden" />
                  <span>V. Laporan Realisasi Semua Belanja Hibah</span>
                </h3>
                <p className="text-[11px] text-slate-400 print:text-slate-700 mt-0.5">
                  Daftar seluruh alokasi dan realisasi anggaran Belanja Hibah (Organisasi Kemasyarakatan, Partai Politik, Lembaga, dan Hibah Lainnya) TA {selectedTahun}.
                </p>
              </div>

              {/* Status filter badge in print */}
              <div className="hidden print:block text-right text-xs">
                <span className="font-bold text-slate-900">
                  Total {filteredHibahData.length} Rekening Belanja Hibah
                </span>
              </div>
            </div>

            {/* STAT CARDS FOR BELANJA HIBAH */}
            {(() => {
              const totalMurni = filteredHibahData.reduce((s, r) => s + r.paguMurni, 0);
              const totalRev = filteredHibahData.reduce((s, r) => s + r.revisi, 0);
              const totalAkhir = filteredHibahData.reduce((s, r) => s + r.paguAkhir, 0);
              const totalReal = filteredHibahData.reduce((s, r) => s + r.realisasi, 0);
              const totalSisa = filteredHibahData.reduce((s, r) => s + r.sisa, 0);
              const pctSerapan = totalAkhir > 0 ? (totalReal / totalAkhir) * 100 : 0;
              const unexecutedCount = filteredHibahData.filter(r => r.status === 'unexecuted').length;
              const partialCount = filteredHibahData.filter(r => r.status === 'partial').length;
              const fullCount = filteredHibahData.filter(r => r.status === 'full').length;

              return (
                <div className="print:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="rounded-2xl border border-emerald-500/30 bg-slate-950 p-3.5 shadow-sm">
                    <div className="text-xs text-emerald-400 font-bold mb-1">Total Pagu Belanja Hibah</div>
                    <div className="text-lg font-black text-white font-mono">
                      Rp {totalAkhir.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Pagu Murni: Rp {totalMurni.toLocaleString('id-ID')} | Rev: {totalRev >= 0 ? '+' : ''}Rp {totalRev.toLocaleString('id-ID')}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-emerald-500/30 bg-slate-950 p-3.5 shadow-sm">
                    <div className="text-xs text-emerald-400 font-bold mb-1">Total Realisasi Hibah (SP2D)</div>
                    <div className="text-lg font-black text-emerald-300 font-mono">
                      Rp {totalReal.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] text-emerald-400/80 mt-1">
                      {pctSerapan.toFixed(2)}% Tercairkan ({fullCount} Terserap Penuh)
                    </div>
                  </div>

                  <div className="rounded-2xl border border-rose-500/30 bg-slate-950 p-3.5 shadow-sm">
                    <div className="text-xs text-rose-400 font-bold mb-1">Sisa Pagu Hibah Belum Cair</div>
                    <div className="text-lg font-black text-rose-300 font-mono">
                      Rp {totalSisa.toLocaleString('id-ID')}
                    </div>
                    <div className="text-[10px] text-rose-300/80 mt-1">
                      {(100 - pctSerapan).toFixed(2)}% Sisa ({unexecutedCount} Belum Cair, {partialCount} Sebagian)
                    </div>
                  </div>

                  <div className="rounded-2xl border border-amber-500/30 bg-slate-950 p-3.5 shadow-sm">
                    <div className="text-xs text-amber-400 font-bold mb-1">Jumlah Rekening Hibah</div>
                    <div className="text-lg font-black text-amber-200 font-mono">
                      {filteredHibahData.length} <span className="text-xs font-sans text-slate-400">Rekening</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Terdaftar di DPA BAKESBANGPOLDAGRI
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* CONTROLS & FILTER BAR */}
            <div className="print:hidden flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-400 font-bold mr-1 flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5 text-emerald-400" />
                  Status Pencairan:
                </span>
                <button
                  type="button"
                  onClick={() => setHibahFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    hibahFilterStatus === 'all'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  Semua Hibah ({hibahReportData.length})
                </button>
                <button
                  type="button"
                  onClick={() => setHibahFilterStatus('unexecuted')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    hibahFilterStatus === 'unexecuted'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-slate-900 text-rose-400 hover:bg-slate-800'
                  }`}
                >
                  100% Belum Cair ({hibahReportData.filter(r => r.status === 'unexecuted').length})
                </button>
                <button
                  type="button"
                  onClick={() => setHibahFilterStatus('partial')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    hibahFilterStatus === 'partial'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-slate-900 text-amber-400 hover:bg-slate-800'
                  }`}
                >
                  Cair Sebagian ({hibahReportData.filter(r => r.status === 'partial').length})
                </button>
                <button
                  type="button"
                  onClick={() => setHibahFilterStatus('full')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    hibahFilterStatus === 'full'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Tercairkan Penuh ({hibahReportData.filter(r => r.status === 'full').length})
                </button>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={hibahSearchTerm}
                  onChange={e => setHibahSearchTerm(e.target.value)}
                  placeholder="Cari Rekening Hibah / Sub Kegiatan / Sumber Dana..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                {hibahSearchTerm && (
                  <button
                    onClick={() => setHibahSearchTerm('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* HIBAH TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-slate-900 font-bold uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-10 text-center">No</th>
                    <th className="p-3 min-w-[200px]">Sub Kegiatan</th>
                    <th className="p-3 min-w-[240px]">Rekening Belanja Hibah</th>
                    <th className="p-3 text-center">Sumber Dana</th>
                    <th className="p-3 text-right">Pagu Murni (Rp)</th>
                    <th className="p-3 text-right">Pergeseran (Rp)</th>
                    <th className="p-3 text-right">Pagu Akhir (Rp)</th>
                    <th className="p-3 text-right">Realisasi SP2D (Rp)</th>
                    <th className="p-3 text-right">Sisa Pagu (Rp)</th>
                    <th className="p-3 text-center">% Serapan</th>
                    <th className="p-3 text-center min-w-[140px]">Status Pencairan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                  {filteredHibahData.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="p-8 text-center text-slate-400">
                        <AlertCircle className="h-8 w-8 text-emerald-500/60 mx-auto mb-2" />
                        <p className="font-semibold text-sm">Tidak ada data Rekening Belanja Hibah yang sesuai filter.</p>
                        <p className="text-xs text-slate-500 mt-1">
                          Pastikan rekening belanja hibah sudah diinput pada menu Input Anggaran atau Master Belanja (dengan kode 5.1.05.x atau memiliki kata "Hibah").
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredHibahData.map((r, idx) => (
                      <tr key={r.id || `${r.kodeSub}-${r.kodeBelanja}-${idx}`} className="hover:bg-slate-800/40">
                        <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3">
                          <div className="text-white print:text-slate-900 font-bold text-xs">{r.namaSub}</div>
                          <div className="font-mono text-[11px] font-semibold text-teal-400 print:text-slate-700 mt-0.5">
                            Kode: {r.kodeSub}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-white print:text-slate-900 font-semibold line-clamp-2">{r.namaBelanja}</div>
                          <div className="font-mono text-[11px] font-bold text-emerald-400 print:text-slate-700 mt-0.5">
                            Kode: {r.kodeBelanja}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-800 print:bg-slate-200 font-mono text-[10px] font-bold text-slate-300 print:text-slate-900">
                            {r.sumberDana}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono text-slate-300 print:text-slate-900">
                          Rp {r.paguMurni.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-right font-mono text-amber-300 print:text-slate-900">
                          {r.revisi >= 0 ? '+' : ''}Rp {r.revisi.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-white print:text-slate-900">
                          Rp {r.paguAkhir.toLocaleString('id-ID')}
                        </td>
                        <td
                          onClick={() =>
                            setSelectedRealisasiFilter({
                              title: `Rincian Realisasi / SP2D Belanja Hibah`,
                              subtitle: `${r.kodeBelanja} - ${r.namaBelanja} (${r.kodeSub})`,
                              kodeBelanja: r.kodeBelanja,
                              kodeSub: r.kodeSub
                            })
                          }
                          className="p-3 text-right font-mono text-emerald-400 hover:text-emerald-200 hover:underline cursor-pointer print:text-slate-900 font-bold"
                          title="Klik untuk melihat rincian SP2D transaksi"
                        >
                          <span className="inline-flex items-center gap-1 justify-end">
                            <span>Rp {r.realisasi.toLocaleString('id-ID')}</span>
                            <Eye className="h-3.5 w-3.5 text-emerald-400/80 print:hidden" />
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-black text-rose-400 print:text-slate-900 bg-rose-950/30 print:bg-transparent">
                          Rp {r.sisa.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-200 print:text-slate-900 font-mono">
                          {r.persen.toFixed(2)} %
                        </td>
                        <td className="p-3 text-center">
                          {r.status === 'unexecuted' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-950/80 text-rose-300 border border-rose-500/40 print:border-slate-800 print:text-slate-900">
                              <XCircle className="h-3 w-3 text-rose-400 shrink-0 print:hidden" />
                              100% Belum Cair
                            </span>
                          ) : r.status === 'partial' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-950/80 text-amber-300 border border-amber-500/40 print:border-slate-800 print:text-slate-900">
                              <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 print:hidden" />
                              Cair Sebagian
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 print:border-slate-800 print:text-slate-900">
                              <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0 print:hidden" />
                              Tercairkan Penuh
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-white print:bg-slate-100 print:text-black">
                  {(() => {
                    const totalMurni = filteredHibahData.reduce((s, r) => s + r.paguMurni, 0);
                    const totalRev = filteredHibahData.reduce((s, r) => s + r.revisi, 0);
                    const totalAkhir = filteredHibahData.reduce((s, r) => s + r.paguAkhir, 0);
                    const totalReal = filteredHibahData.reduce((s, r) => s + r.realisasi, 0);
                    const totalSisa = filteredHibahData.reduce((s, r) => s + r.sisa, 0);
                    const totalPct = totalAkhir > 0 ? (totalReal / totalAkhir) * 100 : 0;

                    return (
                      <tr>
                        <td colSpan={4} className="p-3 text-right uppercase">
                          TOTAL BELANJA HIBAH ({filteredHibahData.length} REKENING):
                        </td>
                        <td className="p-3 text-right font-mono text-slate-300">
                          Rp {totalMurni.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-right font-mono text-amber-300">
                          {totalRev >= 0 ? '+' : ''}Rp {totalRev.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-400">
                          Rp {totalAkhir.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-300">
                          Rp {totalReal.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-right font-mono text-rose-400 font-black">
                          Rp {totalSisa.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-center text-amber-300 font-mono">
                          {totalPct.toFixed(2)} %
                        </td>
                        <td className="p-3 text-center text-xs text-slate-400 font-normal">
                          {filteredHibahData.filter(r => r.status === 'full').length} Terserap Penuh
                        </td>
                      </tr>
                    );
                  })()}
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 10. LAPORAN DETAIL BELANJA SILPA (TIDAK TEREKSEKUSI) */}
        {activeTab === 'laporan-silpa' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-xs font-bold uppercase text-amber-400 print:text-slate-900 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 print:hidden" />
                  <span>X. Laporan Detail Belanja SiLPA (Tidak Tereksekusi / Sisa Pagu Anggaran)</span>
                </h3>
                <p className="text-[11px] text-slate-400 print:text-slate-700 mt-0.5">
                  Rincian seluruh Rekening Belanja yang mengalami sisa pagu anggaran (SiLPA) atau 100% tidak tereksekusi pada TA {selectedTahun}.
                </p>
              </div>
            </div>

            {/* STAT SUMMARY CARDS FOR SILPA */}
            <div className="print:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(() => {
                const totalPaguSilpa = silpaReportData.reduce((s, r) => s + r.paguAkhir, 0);
                const totalRealSilpa = silpaReportData.reduce((s, r) => s + r.realisasi, 0);
                const totalSisaSilpa = silpaReportData.reduce((s, r) => s + r.sisa, 0);
                const countUnexecuted = silpaReportData.filter(r => r.status === 'unexecuted').length;
                const countPartial = silpaReportData.filter(r => r.status === 'partial').length;
                const pctSilpa = totalPaguSilpa > 0 ? (totalSisaSilpa / totalPaguSilpa) * 100 : 0;

                return (
                  <>
                    <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-3.5 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-rose-300 font-bold mb-1">
                        <span>Total Potensi SiLPA (Sisa)</span>
                        <DollarSign className="h-4 w-4 text-rose-400" />
                      </div>
                      <div className="text-lg font-black text-white font-mono">
                        Rp {totalSisaSilpa.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[10px] text-rose-300/80 mt-1">
                        {pctSilpa.toFixed(2)}% dari Total Pagu Akhir
                      </div>
                    </div>

                    <div className="rounded-2xl border border-rose-500/40 bg-slate-950 p-3.5 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-rose-400 font-bold mb-1">
                        <span>100% Tidak Tereksekusi</span>
                        <XCircle className="h-4 w-4 text-rose-500" />
                      </div>
                      <div className="text-lg font-black text-rose-300 font-mono">
                        {countUnexecuted} <span className="text-xs font-sans text-slate-400">Rekening</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Rp {silpaReportData.filter(r => r.status === 'unexecuted').reduce((s, r) => s + r.paguAkhir, 0).toLocaleString('id-ID')} pagu mengendap
                      </div>
                    </div>

                    <div className="rounded-2xl border border-amber-500/30 bg-slate-950 p-3.5 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-1">
                        <span>Tereksekusi Sebagian</span>
                        <AlertTriangle className="h-4 w-4 text-amber-400" />
                      </div>
                      <div className="text-lg font-black text-amber-200 font-mono">
                        {countPartial} <span className="text-xs font-sans text-slate-400">Rekening</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">
                        Memiliki sisa dari penyerapan anggaran
                      </div>
                    </div>

                    <div className="rounded-2xl border border-emerald-500/30 bg-slate-950 p-3.5 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-emerald-400 font-bold mb-1">
                        <span>Realisasi Tereksekusi</span>
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      </div>
                      <div className="text-lg font-black text-emerald-300 font-mono">
                        Rp {totalRealSilpa.toLocaleString('id-ID')}
                      </div>
                      <div className="text-[10px] text-emerald-400/80 mt-1">
                        {(100 - pctSilpa).toFixed(2)}% Terakuisisi via SP2D
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            {/* FILTER & SEARCH BAR FOR SILPA (Hidden during print) */}
            <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                  <Filter className="h-3.5 w-3.5 text-amber-400" />
                  Status:
                </span>
                <button
                  type="button"
                  onClick={() => setSilpaFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    silpaFilterStatus === 'all'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Semua SiLPA (&gt; Rp 0)
                </button>
                <button
                  type="button"
                  onClick={() => setSilpaFilterStatus('unexecuted')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    silpaFilterStatus === 'unexecuted'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-slate-900 text-rose-400 hover:bg-slate-800'
                  }`}
                >
                  100% Tidak Tereksekusi
                </button>
                <button
                  type="button"
                  onClick={() => setSilpaFilterStatus('partial')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    silpaFilterStatus === 'partial'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'bg-slate-900 text-amber-400 hover:bg-slate-800'
                  }`}
                >
                  Tereksekusi Sebagian
                </button>
                <button
                  type="button"
                  onClick={() => setSilpaFilterStatus('full')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    silpaFilterStatus === 'full'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Terserap Penuh (0 SiLPA)
                </button>
              </div>

              <div className="relative max-w-xs w-full">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  value={silpaSearchTerm}
                  onChange={e => setSilpaSearchTerm(e.target.value)}
                  placeholder="Cari Rekening / Sub Kegiatan..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
                {silpaSearchTerm && (
                  <button
                    onClick={() => setSilpaSearchTerm('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-white text-xs font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            {/* SILPA TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-slate-900 font-bold uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-10 text-center">No</th>
                    <th className="p-3 min-w-[220px]">Sub Kegiatan (Nama & Kode)</th>
                    <th className="p-3 min-w-[240px]">Rekening Belanja</th>
                    <th className="p-3 text-center">Sumber Dana</th>
                    <th className="p-3 text-right">Pagu Anggaran (Rp)</th>
                    <th className="p-3 text-right">Realisasi (Rp)</th>
                    <th className="p-3 text-right">Nilai SiLPA / Sisa (Rp)</th>
                    <th className="p-3 text-center">% Serapan</th>
                    <th className="p-3 text-center min-w-[140px]">Status Eksekusi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                  {filteredSilpaData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-slate-400">
                        <AlertCircle className="h-8 w-8 text-amber-500/60 mx-auto mb-2" />
                        <p className="font-semibold">Tidak ada data Rekening Belanja SiLPA yang sesuai filter.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredSilpaData.map((r, idx) => (
                      <tr key={r.id || `${r.kodeSub}-${r.kodeBelanja}-${idx}`} className="hover:bg-slate-800/40">
                        <td className="p-3 text-center font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-3">
                          <div className="text-white print:text-slate-900 font-bold text-xs">{r.namaSub}</div>
                          <div className="font-mono text-[11px] font-semibold text-teal-400 print:text-slate-700 mt-0.5">
                            Kode: {r.kodeSub}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-white print:text-slate-900 font-semibold line-clamp-2">{r.namaBelanja}</div>
                          <div className="font-mono text-[11px] font-bold text-amber-400 print:text-slate-700 mt-0.5">
                            Kode: {r.kodeBelanja}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-800 print:bg-slate-200 font-mono text-[10px] font-bold text-slate-300 print:text-slate-900">
                            {r.sumberDana}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-white print:text-slate-900">
                          Rp {r.paguAkhir.toLocaleString('id-ID')}
                        </td>
                        <td
                          onClick={() =>
                            setSelectedRealisasiFilter({
                              title: `Rincian Realisasi / SP2D Belanja SiLPA`,
                              subtitle: `${r.kodeBelanja} - ${r.namaBelanja} (${r.kodeSub})`,
                              kodeBelanja: r.kodeBelanja,
                              kodeSub: r.kodeSub
                            })
                          }
                          className="p-3 text-right font-mono text-emerald-400 hover:text-emerald-200 hover:underline cursor-pointer print:text-slate-900 font-bold"
                          title="Klik untuk melihat rincian SP2D transaksi"
                        >
                          <span className="inline-flex items-center gap-1 justify-end">
                            <span>Rp {r.realisasi.toLocaleString('id-ID')}</span>
                            <Eye className="h-3.5 w-3.5 text-emerald-400/80 print:hidden" />
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-black text-rose-400 print:text-slate-900 bg-rose-950/30 print:bg-transparent">
                          Rp {r.sisa.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-center font-bold text-slate-200 print:text-slate-900 font-mono">
                          {r.persen.toFixed(2)} %
                        </td>
                        <td className="p-3 text-center">
                          {r.status === 'unexecuted' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-950/80 text-rose-300 border border-rose-500/40 print:border-slate-800 print:text-slate-900">
                              <XCircle className="h-3 w-3 text-rose-400 shrink-0 print:hidden" />
                              100% Tidak Tereksekusi
                            </span>
                          ) : r.status === 'partial' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-950/80 text-amber-300 border border-amber-500/40 print:border-slate-800 print:text-slate-900">
                              <AlertTriangle className="h-3 w-3 text-amber-400 shrink-0 print:hidden" />
                              Tereksekusi Sebagian
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 print:border-slate-800 print:text-slate-900">
                              <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0 print:hidden" />
                              Terserap Penuh
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-white print:bg-slate-100 print:text-black">
                  {(() => {
                    const totalMurni = filteredSilpaData.reduce((s, r) => s + r.paguMurni, 0);
                    const totalRev = filteredSilpaData.reduce((s, r) => s + r.revisi, 0);
                    const totalAkhir = filteredSilpaData.reduce((s, r) => s + r.paguAkhir, 0);
                    const totalReal = filteredSilpaData.reduce((s, r) => s + r.realisasi, 0);
                    const totalSisa = filteredSilpaData.reduce((s, r) => s + r.sisa, 0);
                    const totalPct = totalAkhir > 0 ? (totalReal / totalAkhir) * 100 : 0;

                    return (
                      <tr>
                        <td colSpan={4} className="p-3 text-right uppercase">
                          TOTAL REKENING SILPA DIPILIH ({filteredSilpaData.length} ITEM):
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-400">
                          Rp {totalAkhir.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-300">
                          Rp {totalReal.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-right font-mono text-rose-400 font-black">
                          Rp {totalSisa.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-center text-amber-300 font-mono">
                          {totalPct.toFixed(2)} %
                        </td>
                        <td className="p-3 text-center text-xs text-slate-400 font-normal">
                          {filteredSilpaData.filter(r => r.status === 'unexecuted').length} Unexecuted
                        </td>
                      </tr>
                    );
                  })()}
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* 5. LAPORAN BULANAN */}
        {activeTab === 'laporan-bulanan' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div>
                <h3 className="text-xs font-bold uppercase text-amber-400 print:text-slate-900 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-cyan-400 print:hidden" />
                  <span>V. Laporan Bulanan (Target Anggaran vs Realisasi SP2D Per Bulan)</span>
                </h3>
                <p className="text-[11px] text-slate-400 print:text-slate-700 mt-0.5">
                  Rekapitulasi target alokasi anggaran bulanan, realisasi penyerapan SP2D per bulan, serta capaian serapan kumulatif TA {selectedTahun}.
                </p>
              </div>

              {/* Filter Month Dropdown */}
              <div className="print:hidden flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                <Filter className="h-3.5 w-3.5 text-cyan-400 ml-1" />
                <span className="text-xs text-slate-400 font-semibold">Filter Bulan:</span>
                <select
                  value={filterBulan}
                  onChange={e => setFilterBulan(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="bg-slate-900 border border-slate-700 rounded-lg text-xs text-white px-2 py-1 focus:outline-none focus:border-cyan-500"
                >
                  <option value="all">Semua Bulan (Jan - Des)</option>
                  {monthNames.map((m, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      Bulan {idx + 1} - {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* STAT CARDS FOR MONTHLY REPORT */}
            <div className="print:hidden grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-cyan-500/30 bg-slate-950 p-3.5 shadow-sm">
                <div className="text-xs text-cyan-400 font-bold mb-1">Total Pagu Anggaran TA {selectedTahun}</div>
                <div className="text-lg font-black text-white font-mono">
                  Rp {totalPaguTahun.toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                  Target alokasi: Rp {targetPerBulan.toLocaleString('id-ID', { maximumFractionDigits: 0 })} / bln
                </div>
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-slate-950 p-3.5 shadow-sm">
                <div className="text-xs text-emerald-400 font-bold mb-1">Total Realisasi SP2D</div>
                <div className="text-lg font-black text-emerald-300 font-mono">
                  Rp {currentRealisasi.reduce((s, r) => s + r.nilai, 0).toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-emerald-400/80 mt-1">
                  {totalPaguTahun > 0 ? ((currentRealisasi.reduce((s, r) => s + r.nilai, 0) / totalPaguTahun) * 100).toFixed(2) : 0}% Serapan Total
                </div>
              </div>

              <div className="rounded-2xl border border-rose-500/30 bg-slate-950 p-3.5 shadow-sm">
                <div className="text-xs text-rose-400 font-bold mb-1">Sisa Pagu Anggaran (SiLPA)</div>
                <div className="text-lg font-black text-rose-300 font-mono">
                  Rp {(totalPaguTahun - currentRealisasi.reduce((s, r) => s + r.nilai, 0)).toLocaleString('id-ID')}
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Sisa Anggaran Belum Tereksekusi</div>
              </div>

              <div className="rounded-2xl border border-amber-500/30 bg-slate-950 p-3.5 shadow-sm">
                <div className="text-xs text-amber-400 font-bold mb-1">Total Transaksi SP2D</div>
                <div className="text-lg font-black text-amber-200 font-mono">
                  {currentRealisasi.length} <span className="text-xs font-sans text-slate-400">SP2D</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">Terverifikasi sistem</div>
              </div>
            </div>

            {/* MONTHLY REKAPITULASI TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-slate-900 font-bold uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-10 text-center">No</th>
                    <th className="p-3 min-w-[130px]">Bulan</th>
                    <th className="p-3 text-right">Target Anggaran (Rp)</th>
                    <th className="p-3 text-right">Realisasi Bulan Ini (Rp)</th>
                    <th className="p-3 text-right">Realisasi Kumulatif (Rp)</th>
                    <th className="p-3 text-right">Sisa Pagu / SiLPA (Rp)</th>
                    <th className="p-3 text-center">% Serapan Bulan Ini</th>
                    <th className="p-3 text-center">% Serapan Kumulatif</th>
                    <th className="p-3 text-center">SP2D</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                  {filteredMonthlyData.map((m) => (
                    <tr
                      key={m.bulanNum}
                      className={`hover:bg-slate-800/40 ${
                        filterBulan === m.bulanNum ? 'bg-cyan-950/40 border-l-4 border-cyan-400' : ''
                      }`}
                    >
                      <td className="p-3 text-center font-mono text-slate-400">{m.no}</td>
                      <td className="p-3 font-bold text-white print:text-slate-900">
                        {m.namaBulan}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-300 print:text-slate-900">
                        Rp {m.targetAnggaranBulanIni.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                      </td>
                      <td
                        onClick={() =>
                          setSelectedRealisasiFilter({
                            title: `Rincian SP2D Bulan ${m.namaBulan}`,
                            subtitle: `Daftar Seluruh Transaksi SP2D Pada Bulan ${m.namaBulan} TA ${selectedTahun}`,
                            bulan: m.bulanNum
                          })
                        }
                        className="p-3 text-right font-mono font-bold text-emerald-400 hover:text-emerald-200 hover:underline cursor-pointer print:text-slate-900"
                        title="Klik untuk melihat rincian SP2D transaksi bulan ini"
                      >
                        <span className="inline-flex items-center gap-1 justify-end">
                          <span>Rp {m.realisasiBulanIni.toLocaleString('id-ID')}</span>
                          <Eye className="h-3.5 w-3.5 text-emerald-400/80 print:hidden" />
                        </span>
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-cyan-300 print:text-slate-900">
                        Rp {m.realisasiKumulatif.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-rose-400 print:text-slate-900 bg-rose-950/20 print:bg-transparent">
                        Rp {m.sisaPagu.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-center font-mono font-semibold text-slate-300 print:text-slate-900">
                        {m.persenSerapanBulanan.toFixed(2)} %
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-amber-300 print:text-slate-900">
                        {m.persenSerapanKumulatif.toFixed(2)} %
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded bg-slate-800 print:bg-slate-200 font-mono text-[10px] font-bold text-slate-300 print:text-slate-900">
                          {m.transCount} SP2D
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-950 font-bold border-t-2 border-slate-700 text-white print:bg-slate-100 print:text-black">
                  {(() => {
                    const totalRealAll = currentRealisasi.reduce((s, r) => s + r.nilai, 0);
                    const finalSisa = totalPaguTahun - totalRealAll;
                    const finalPct = totalPaguTahun > 0 ? (totalRealAll / totalPaguTahun) * 100 : 0;

                    return (
                      <tr>
                        <td colSpan={2} className="p-3 text-right uppercase">
                          TOTAL TA {selectedTahun}:
                        </td>
                        <td className="p-3 text-right font-mono text-cyan-400">
                          Rp {totalPaguTahun.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-400">
                          Rp {totalRealAll.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-right font-mono text-cyan-300">
                          Rp {totalRealAll.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-right font-mono text-rose-400 font-black">
                          Rp {finalSisa.toLocaleString('id-ID')}
                        </td>
                        <td className="p-3 text-center text-amber-300 font-mono" colSpan={2}>
                          {finalPct.toFixed(2)} % Total Serapan
                        </td>
                        <td className="p-3 text-center text-slate-300 font-mono">
                          {currentRealisasi.length} SP2D
                        </td>
                      </tr>
                    );
                  })()}
                </tfoot>
              </table>
            </div>

            {/* RINCIAN TRANSAKSI BULAN YBS JIKA BULAN DIPILIH */}
            {filterBulan !== 'all' && (() => {
              const bulanSelectedTransactions = currentRealisasi.filter(r => {
                let m = Number(r.bulan);
                if (!m || isNaN(m)) {
                  if (r.tanggal) {
                    const parts = r.tanggal.split('-');
                    if (parts.length >= 2) m = parseInt(parts[1], 10);
                  }
                }
                return m === Number(filterBulan);
              });

              return (
                <div className="mt-6 space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 print:bg-slate-50">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <h4 className="text-xs font-bold uppercase text-emerald-400 print:text-slate-900 flex items-center gap-2">
                      <Info className="h-4 w-4 text-emerald-400 print:hidden" />
                      <span>Daftar Transaksi SP2D - Bulan {monthNames[Number(filterBulan) - 1]} TA {selectedTahun}</span>
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {bulanSelectedTransactions.length} Transaksi Terdaftar
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-900 print:bg-slate-200 text-slate-400 print:text-slate-900 font-bold uppercase">
                        <tr>
                          <th className="p-2.5 w-8 text-center">No</th>
                          <th className="p-2.5">Tanggal</th>
                          <th className="p-2.5">No SP2D</th>
                          <th className="p-2.5">Kode Belanja</th>
                          <th className="p-2.5">Uraian Transaksi</th>
                          <th className="p-2.5 text-right">Nilai SP2D (Rp)</th>
                          <th className="p-2.5">Rekanan</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                        {bulanSelectedTransactions.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-4 text-center text-slate-500">
                              Tidak ada transaksi SP2D yang tercatat pada Bulan {monthNames[Number(filterBulan) - 1]}.
                            </td>
                          </tr>
                        ) : (
                          bulanSelectedTransactions.map((r, i) => (
                            <tr key={r.id || i} className="hover:bg-slate-900/60">
                              <td className="p-2.5 text-center font-mono text-slate-500">{i + 1}</td>
                              <td className="p-2.5 font-mono text-slate-300 print:text-slate-900">{r.tanggal}</td>
                              <td className="p-2.5 font-mono font-bold text-amber-400 print:text-slate-900">{r.noSP2D}</td>
                              <td className="p-2.5 font-mono text-teal-400 print:text-slate-900">{r.kodeBelanja}</td>
                              <td className="p-2.5 text-white print:text-slate-900">{r.uraian}</td>
                              <td className="p-2.5 text-right font-mono font-bold text-emerald-400 print:text-slate-900">
                                Rp {r.nilai.toLocaleString('id-ID')}
                              </td>
                              <td className="p-2.5 text-slate-400 print:text-slate-900">{r.rekanan || '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* 6. LAPORAN TRIWULAN */}
        {activeTab === 'laporan-triwulan' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase text-amber-400 print:text-slate-900 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-cyan-400 print:hidden" />
                <span>VI. Laporan Triwulan (Target Anggaran vs Realisasi Per Triwulan)</span>
              </h3>
              <p className="text-[11px] text-slate-400 print:text-slate-700 mt-0.5">
                Rekapitulasi target alokasi anggaran dan realisasi SP2D per triwulan (Triwulan I - IV) TA {selectedTahun}.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-slate-900 font-bold uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-10 text-center">No</th>
                    <th className="p-3 min-w-[180px]">Periode Triwulan</th>
                    <th className="p-3">Cakupan Bulan</th>
                    <th className="p-3 text-right">Target Anggaran (Rp)</th>
                    <th className="p-3 text-right">Realisasi Triwulan (Rp)</th>
                    <th className="p-3 text-right">Realisasi Kumulatif (Rp)</th>
                    <th className="p-3 text-right">Sisa Pagu (Rp)</th>
                    <th className="p-3 text-center">% Serapan Kumulatif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                  {triwulanReportData.map(tw => (
                    <tr key={tw.no} className="hover:bg-slate-800/40">
                      <td className="p-3 text-center font-mono text-slate-400">{tw.no}</td>
                      <td className="p-3 font-bold text-white print:text-slate-900">{tw.nama}</td>
                      <td className="p-3 text-slate-400 print:text-slate-700 font-mono">{tw.bulanList}</td>
                      <td className="p-3 text-right font-mono text-slate-300 print:text-slate-900">
                        Rp {tw.target.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400 print:text-slate-900">
                        Rp {tw.realisasi.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-cyan-300 print:text-slate-900">
                        Rp {tw.realisasiKumulatif.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-rose-400 print:text-slate-900 bg-rose-950/20 print:bg-transparent">
                        Rp {tw.sisa.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-amber-300 print:text-slate-900">
                        {tw.persenSerapan.toFixed(2)} %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 7. LAPORAN SEMESTER */}
        {activeTab === 'laporan-semester' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase text-amber-400 print:text-slate-900 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-cyan-400 print:hidden" />
                <span>VII. Laporan Semester (Target Anggaran vs Realisasi Per Semester)</span>
              </h3>
              <p className="text-[11px] text-slate-400 print:text-slate-700 mt-0.5">
                Rekapitulasi target alokasi anggaran dan realisasi SP2D per semester (Semester I - II) TA {selectedTahun}.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 print:bg-slate-200 text-slate-300 print:text-slate-900 font-bold uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-10 text-center">No</th>
                    <th className="p-3 min-w-[180px]">Periode Semester</th>
                    <th className="p-3">Cakupan Bulan</th>
                    <th className="p-3 text-right">Target Anggaran (Rp)</th>
                    <th className="p-3 text-right">Realisasi Semester (Rp)</th>
                    <th className="p-3 text-right">Realisasi Kumulatif (Rp)</th>
                    <th className="p-3 text-right">Sisa Pagu (Rp)</th>
                    <th className="p-3 text-center">% Serapan Kumulatif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 print:divide-slate-300">
                  {semesterReportData.map(sem => (
                    <tr key={sem.no} className="hover:bg-slate-800/40">
                      <td className="p-3 text-center font-mono text-slate-400">{sem.no}</td>
                      <td className="p-3 font-bold text-white print:text-slate-900">{sem.nama}</td>
                      <td className="p-3 text-slate-400 print:text-slate-700 font-mono">{sem.bulanList}</td>
                      <td className="p-3 text-right font-mono text-slate-300 print:text-slate-900">
                        Rp {sem.target.toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-emerald-400 print:text-slate-900">
                        Rp {sem.realisasi.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-cyan-300 print:text-slate-900">
                        Rp {sem.realisasiKumulatif.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-right font-mono font-bold text-rose-400 print:text-slate-900 bg-rose-950/20 print:bg-transparent">
                        Rp {sem.sisa.toLocaleString('id-ID')}
                      </td>
                      <td className="p-3 text-center font-mono font-bold text-amber-300 print:text-slate-900">
                        {sem.persenSerapan.toFixed(2)} %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. LAPORAN TAHUNAN */}
        {activeTab === 'laporan-tahunan' && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold uppercase text-amber-400 print:text-slate-900 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-cyan-400 print:hidden" />
                <span>VIII. Laporan Tahunan (Rekapitulasi Kinerja Keuangan TA {selectedTahun})</span>
              </h3>
              <p className="text-[11px] text-slate-400 print:text-slate-700 mt-0.5">
                Ringkasan eksekutif alokasi anggaran murni, pergeseran/revisi, pagu akhir, total realisasi SP2D, dan sisa pagu anggaran (SiLPA).
              </p>
            </div>

            {(() => {
              const totalMurni = currentAnggaran.reduce((s, a) => s + a.pagu, 0);
              const totalRev = currentAnggaran.reduce((s, a) => s + a.revisi, 0);
              const totalAkhir = totalPaguTahun;
              const totalReal = currentRealisasi.reduce((s, r) => s + r.nilai, 0);
              const totalSisa = totalAkhir - totalReal;
              const pctSerapan = totalAkhir > 0 ? (totalReal / totalAkhir) * 100 : 0;

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Pagu Murni APBD</span>
                    <div className="text-xl font-black text-white font-mono">Rp {totalMurni.toLocaleString('id-ID')}</div>
                    <p className="text-[10px] text-slate-500">Penetapan awal TA {selectedTahun}</p>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 space-y-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Pergeseran / Revisi</span>
                    <div className="text-xl font-black text-amber-300 font-mono">
                      {totalRev >= 0 ? '+' : ''}Rp {totalRev.toLocaleString('id-ID')}
                    </div>
                    <p className="text-[10px] text-slate-500">Akomodasi perubahan pagu</p>
                  </div>

                  <div className="p-5 rounded-2xl border border-cyan-500/30 bg-slate-950 space-y-2">
                    <span className="text-xs font-bold text-cyan-400 uppercase">Pagu Akhir DPA</span>
                    <div className="text-xl font-black text-cyan-300 font-mono">Rp {totalAkhir.toLocaleString('id-ID')}</div>
                    <p className="text-[10px] text-cyan-400/80">Pagu anggaran final</p>
                  </div>

                  <div className="p-5 rounded-2xl border border-emerald-500/30 bg-slate-950 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase">Total Realisasi SP2D</span>
                    <div className="text-xl font-black text-emerald-300 font-mono">Rp {totalReal.toLocaleString('id-ID')}</div>
                    <p className="text-[10px] text-emerald-400/80">{pctSerapan.toFixed(2)}% Serapan Keuangan</p>
                  </div>

                  <div className="p-5 rounded-2xl border border-rose-500/30 bg-slate-950 space-y-2">
                    <span className="text-xs font-bold text-rose-400 uppercase">Sisa Pagu Anggaran (SiLPA)</span>
                    <div className="text-xl font-black text-rose-300 font-mono">Rp {totalSisa.toLocaleString('id-ID')}</div>
                    <p className="text-[10px] text-slate-400">{(100 - pctSerapan).toFixed(2)}% Belum terserap</p>
                  </div>

                  <div className="p-5 rounded-2xl border border-purple-500/30 bg-slate-950 space-y-2">
                    <span className="text-xs font-bold text-purple-400 uppercase">Total SP2D Diterbitkan</span>
                    <div className="text-xl font-black text-purple-300 font-mono">{currentRealisasi.length} Transaksi</div>
                    <p className="text-[10px] text-slate-400">Verifikasi dokumen lengkap</p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* SIGNATURE BLOCK FOR PRINT */}
        <div className="mt-12 grid grid-cols-2 gap-8 text-center text-xs text-slate-300 print:text-slate-900">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold">Pejabat Pembuat Komitmen (PPK)</p>
            <div className="h-16" />
            <p className="font-bold underline">{activePpkUser?.nama || 'Drs. Supriadi, M.M'}</p>
            <p className="text-[10px] font-mono">
              {activePpkUser?.nip ? `NIP. ${activePpkUser.nip}` : 'NIP. -'}
            </p>
          </div>

          <div>
            <p>Mataram, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold">Kepala Badan Kesbangpoldagri NTB</p>
            <div className="h-16" />
            <p className="font-bold underline">
              {activeKabanUser?.nama || opd.kepalaBadan || 'H. Lalu Gita Ariadi, M.Si'}
            </p>
            <p className="text-[10px] font-mono">
              {activeKabanUser?.nip
                ? `NIP. ${activeKabanUser.nip}`
                : opd.nipKepala
                ? `NIP. ${opd.nipKepala}`
                : 'NIP. -'}
            </p>
          </div>
        </div>
      </div>

      {/* MODAL BREAKDOWN DETAIL URAIAN REALISASI */}
      {selectedRealisasiFilter && (
        <RealisasiDetailModal
          filter={selectedRealisasiFilter}
          onClose={() => setSelectedRealisasiFilter(null)}
          currentRealisasi={currentRealisasi}
          belanjaList={belanjaList}
          subKegiatanList={subKegiatanList}
          selectedTahun={selectedTahun}
        />
      )}
    </div>
  );
};
