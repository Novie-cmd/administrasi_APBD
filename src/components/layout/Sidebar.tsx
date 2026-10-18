import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PWAInstallModal } from '../common/PWAInstallModal';
import { NTBLogo } from '../common/NTBLogo';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  LayoutDashboard,
  Database,
  FileSpreadsheet,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Layers,
  FileText,
  UploadCloud,
  CheckSquare,
  TrendingUp,
  PieChart,
  CalendarDays,
  Users,
  Shield,
  Activity,
  Award,
  DollarSign,
  Building,
  Building2,
  FolderKanban,
  FileSearch,
  BookOpen,
  Smartphone,
  Download,
  Trash2,
  CheckCircle2
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  // Master Data
  | 'master-tahun'
  | 'master-opd'
  | 'master-program'
  | 'master-kegiatan'
  | 'master-subkegiatan'
  | 'master-belanja'
  | 'master-sumberdana'
  | 'master-rekanan'
  // Transaksi
  | 'transaksi-anggaran'
  | 'transaksi-realisasi'
  | 'transaksi-excel'
  | 'transaksi-koreksi'
  // Pelaporan
  | 'laporan-program'
  | 'laporan-kegiatan'
  | 'laporan-subkegiatan'
  | 'laporan-belanja'
  | 'laporan-hibah'
  | 'laporan-bulanan'
  | 'laporan-triwulan'
  | 'laporan-semester'
  | 'laporan-tahunan'
  | 'laporan-silpa'
  // Analisis
  | 'analisis-grafik'
  | 'analisis-target'
  | 'analisis-progress'
  | 'analisis-monitoring'
  // Pengaturan
  | 'pengaturan';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  interfaceMode?: 'bakesbang' | 'seluruh-opd';
  setInterfaceMode?: (mode: 'bakesbang' | 'seluruh-opd') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  setIsOpen,
  interfaceMode = 'bakesbang',
  setInterfaceMode
}) => {
  const { currentUser, switchRole, logout } = useApp();

  // Accordion state for sidebar sub-menus
  const [openMaster, setOpenMaster] = useState(true);
  const [openTransaksi, setOpenTransaksi] = useState(true);
  const [openPelaporan, setOpenPelaporan] = useState(true);
  const [openAnalisis, setOpenAnalisis] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);

  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handleSidebarInstallClick = async () => {
    if (isInstallable) {
      try {
        const accepted = await install();
        if (!accepted) {
          setShowPwaModal(true);
        }
      } catch {
        setShowPwaModal(true);
      }
    } else {
      setShowPwaModal(true);
    }
  };

  // Auto-expand accordion when activeTab belongs to that category
  React.useEffect(() => {
    if (activeTab.startsWith('master-')) setOpenMaster(true);
    if (activeTab.startsWith('transaksi-')) setOpenTransaksi(true);
    if (activeTab.startsWith('laporan-')) setOpenPelaporan(true);
    if (activeTab.startsWith('analisis-')) setOpenAnalisis(true);
  }, [activeTab]);

  // Role permissions filter helper
  const role = currentUser.role;

  const canAccessMaster = role === 'Administrator' || role === 'Operator Program' || role === 'Auditor';
  const canAccessTransaksi = role === 'Administrator' || role === 'Operator Program' || role === 'PPK' || role === 'Auditor';
  const canAccessPengaturan = role === 'Administrator' || role === 'Auditor';

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-[#DFE6EF] bg-[#FFFFFF] transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      {/* Sidebar Header Brand Badge */}
      <div className="flex h-20 items-center justify-between border-b border-[#DFE6EF] px-5 bg-[#FFFFFF]">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#F4F7FB] border border-[#DFE6EF] shadow-xs overflow-hidden p-0.5">
            <img src="/app-logo.jpg" alt="Rusa Logo NTB" className="h-full w-full object-cover rounded-lg" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-black uppercase tracking-wider text-[#079669]">
              NTB MAKMUR MENDUNIA
            </span>
            <span className="text-[10px] text-[#64748B] font-bold">
              BANGKIT BERSAMA!
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-300">
        
        {/* Antarmuka Mode Switcher Card */}
        {setInterfaceMode && (
          <div className="rounded-xl bg-[#F4F7FB] p-2.5 border border-[#DFE6EF] mb-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] mb-1.5 px-1 flex items-center justify-between">
              <span>Mode Antarmuka:</span>
              <span className="text-[9px] font-bold text-[#079669] bg-emerald-100 px-1.5 py-0.5 rounded">
                PROV NTB
              </span>
            </div>
            <div className="grid grid-cols-1 gap-1">
              <button
                type="button"
                onClick={() => {
                  setInterfaceMode('bakesbang');
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold transition text-left ${
                  interfaceMode === 'bakesbang'
                    ? 'bg-[#079669] text-white shadow-xs'
                    : 'text-[#64748B] hover:bg-[#FFFFFF] hover:text-[#17324D]'
                }`}
              >
                <Building className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">BAKESBANGPOLDAGRI</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setInterfaceMode('seluruh-opd');
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-bold transition text-left ${
                  interfaceMode === 'seluruh-opd'
                    ? 'bg-[#3984E8] text-white shadow-xs'
                    : 'text-[#64748B] hover:bg-[#FFFFFF] hover:text-[#17324D]'
                }`}
              >
                <Building2 className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Seluruh OPD NTB (40 OPD)</span>
              </button>
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        <button
          onClick={() => {
            setActiveTab('dashboard');
            if (window.innerWidth < 1024) setIsOpen(false);
          }}
          className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
            activeTab === 'dashboard'
              ? 'bg-[#079669] text-white shadow-xs font-bold'
              : 'text-[#64748B] hover:bg-[#F4F7FB] hover:text-[#17324D]'
          }`}
          id="menu-dashboard"
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard Utama</span>
        </button>

        {/* MASTER DATA ACCORDION */}
        {canAccessMaster && (
          <div>
            <button
              onClick={() => {
                setOpenMaster(prev => !prev);
                if (!activeTab.startsWith('master-')) {
                  setActiveTab('master-tahun');
                }
              }}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                activeTab.startsWith('master-')
                  ? 'bg-emerald-50 text-[#079669] font-bold border border-emerald-200'
                  : 'text-[#64748B] hover:bg-[#F4F7FB] hover:text-[#17324D]'
              }`}
              id="accordion-master-data"
            >
              <span className="flex items-center gap-3">
                <Database className="h-4 w-4 text-[#079669]" />
                <span>Master Data</span>
              </span>
              {openMaster ? (
                <ChevronDown className="h-4 w-4 text-[#64748B]" />
              ) : (
                <ChevronRight className="h-4 w-4 text-[#64748B]" />
              )}
            </button>

            {openMaster && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#DFE6EF] pl-3">
                {[
                  { id: 'master-tahun', label: 'Tahun Anggaran' },
                  { id: 'master-opd', label: 'OPD / Unit Kerja' },
                  { id: 'master-program', label: 'Program' },
                  { id: 'master-kegiatan', label: 'Kegiatan' },
                  { id: 'master-subkegiatan', label: 'Sub Kegiatan' },
                  { id: 'master-belanja', label: 'Belanja Rekening' },
                  { id: 'master-sumberdana', label: 'Sumber Dana' },
                  { id: 'master-rekanan', label: 'Data Rekanan' }
                ].map(sub => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setActiveTab(sub.id as ActiveTab);
                      if (window.innerWidth < 1024) setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs transition ${
                      activeTab === sub.id
                        ? 'bg-emerald-100 text-[#079669] font-bold'
                        : 'text-[#64748B] hover:bg-[#F4F7FB] hover:text-[#17324D]'
                    }`}
                  >
                    <span>{sub.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TRANSAKSI ACCORDION */}
        {canAccessTransaksi && (
          <div>
            <button
              onClick={() => setOpenTransaksi(!openTransaksi)}
              className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#64748B] hover:bg-[#F4F7FB] hover:text-[#17324D]"
              id="accordion-transaksi"
            >
              <span className="flex items-center gap-3">
                <FileSpreadsheet className="h-4 w-4 text-[#079669]" />
                <span>Transaksi Keuangan</span>
              </span>
              {openTransaksi ? (
                <ChevronDown className="h-4 w-4 text-[#64748B]" />
              ) : (
                <ChevronRight className="h-4 w-4 text-[#64748B]" />
              )}
            </button>

            {openTransaksi && (
              <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#DFE6EF] pl-3">
                {[
                  { id: 'transaksi-anggaran', label: 'Input Anggaran Pagu', icon: DollarSign },
                  { id: 'transaksi-realisasi', label: 'Input Realisasi (SP2D)', icon: FileText },
                  { id: 'transaksi-excel', label: 'Upload / Import Excel', icon: UploadCloud },
                  { id: 'transaksi-koreksi', label: 'Koreksi Data / Approval', icon: CheckSquare }
                ].map(sub => {
                  const Icon = sub.icon;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => {
                        setActiveTab(sub.id as ActiveTab);
                        if (window.innerWidth < 1024) setIsOpen(false);
                      }}
                      className={`flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs transition ${
                        activeTab === sub.id
                          ? 'bg-emerald-100 text-[#079669] font-bold'
                          : 'text-[#64748B] hover:bg-[#F4F7FB] hover:text-[#17324D]'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5 text-[#079669]" />
                      <span>{sub.label}</span>
                    </button>
                  );
                })}

                <div className="pt-2 border-t border-[#DFE6EF] mt-1 space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('transaksi-excel');
                      if (window.innerWidth < 1024) setIsOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                    title="Menu Pembersihan & Kosongkan Data Transaksi/Database"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-rose-600" />
                    <span>Kosongkan Transaksi / DB</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* PELAPORAN ACCORDION */}
        <div>
          <button
            onClick={() => setOpenPelaporan(!openPelaporan)}
            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#64748B] hover:bg-[#F4F7FB] hover:text-[#17324D]"
            id="accordion-pelaporan"
          >
            <span className="flex items-center gap-3">
              <BookOpen className="h-4 w-4 text-[#3984E8]" />
              <span>Pelaporan (Reports)</span>
            </span>
            {openPelaporan ? (
              <ChevronDown className="h-4 w-4 text-[#64748B]" />
            ) : (
              <ChevronRight className="h-4 w-4 text-[#64748B]" />
            )}
          </button>

          {openPelaporan && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#DFE6EF] pl-3">
              {[
                { id: 'laporan-program', label: 'Realisasi Program' },
                { id: 'laporan-kegiatan', label: 'Realisasi Kegiatan' },
                { id: 'laporan-subkegiatan', label: 'Realisasi Sub Kegiatan' },
                { id: 'laporan-belanja', label: 'Realisasi Belanja' },
                { id: 'laporan-hibah', label: 'Semua Belanja Hibah' },
                { id: 'laporan-bulanan', label: 'Laporan Bulanan' },
                { id: 'laporan-triwulan', label: 'Laporan Triwulan' },
                { id: 'laporan-semester', label: 'Laporan Semester' },
                { id: 'laporan-tahunan', label: 'Laporan Tahunan' },
                { id: 'laporan-silpa', label: 'Detail Belanja SiLPA' }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setActiveTab(sub.id as ActiveTab);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs transition ${
                    activeTab === sub.id
                      ? 'bg-blue-50 text-[#3984E8] font-bold'
                      : 'text-[#64748B] hover:bg-[#F4F7FB] hover:text-[#17324D]'
                  }`}
                >
                  <span>{sub.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ANALISIS & GRAFIK ACCORDION */}
        <div>
          <button
            onClick={() => setOpenAnalisis(!openAnalisis)}
            className="flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#64748B] hover:bg-[#F4F7FB] hover:text-[#17324D]"
            id="accordion-analisis"
          >
            <span className="flex items-center gap-3">
              <BarChart3 className="h-4 w-4 text-[#3984E8]" />
              <span>Analisis &amp; Grafik</span>
            </span>
            {openAnalisis ? (
              <ChevronDown className="h-4 w-4 text-[#64748B]" />
            ) : (
              <ChevronRight className="h-4 w-4 text-[#64748B]" />
            )}
          </button>

          {openAnalisis && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-[#DFE6EF] pl-3">
              {[
                { id: 'analisis-grafik', label: 'Grafik Interaktif' },
                { id: 'analisis-target', label: 'Target vs Realisasi' },
                { id: 'analisis-progress', label: 'Progress Bulanan' },
                { id: 'analisis-monitoring', label: 'Monitoring Evaluasi (Monev)' }
              ].map(sub => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setActiveTab(sub.id as ActiveTab);
                    if (window.innerWidth < 1024) setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs transition ${
                    activeTab === sub.id
                      ? 'bg-blue-50 text-[#3984E8] font-bold'
                      : 'text-[#64748B] hover:bg-[#F4F7FB] hover:text-[#17324D]'
                  }`}
                >
                  <span>{sub.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* PENGATURAN */}
        {canAccessPengaturan && (
          <button
            onClick={() => {
              setActiveTab('pengaturan');
              if (window.innerWidth < 1024) setIsOpen(false);
            }}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
              activeTab === 'pengaturan'
                ? 'bg-[#079669] text-white font-bold'
                : 'text-[#64748B] hover:bg-[#F4F7FB] hover:text-[#17324D]'
            }`}
            id="menu-pengaturan"
          >
            <Settings className="h-4 w-4" />
            <span>Pengaturan &amp; Audit</span>
          </button>
        )}

        {/* PWA App Install Banner Card */}
        <div className="mx-1 my-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#17324D]">
          <div className="flex items-center gap-2.5">
            <div className="relative h-9 w-9 shrink-0 rounded-lg bg-[#FFFFFF] border border-[#DFE6EF] flex items-center justify-center p-0.5">
              <NTBLogo size={28} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black uppercase text-[#079669] truncate">
                {isInstalled ? 'Aplikasi Terpasang' : 'Instal Aplikasi'}
              </span>
              <span className="text-xs font-bold text-[#17324D] truncate">
                {isInstalled ? 'BFMS NTB Aktif' : 'Aplikasi Layar Utama'}
              </span>
            </div>
          </div>
          <button
            onClick={handleSidebarInstallClick}
            className="mt-2 w-full flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-2.5 text-xs font-bold text-white bg-[#079669] hover:bg-[#065f46] shadow-xs transition"
            id="btn-sidebar-pwa-install"
          >
            {isInstalled ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                <span>Buka Petunjuk</span>
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5 text-white" />
                <span>{isInstallable ? 'Pasang Sekarang' : 'Pasang ke HP / Laptop'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* User Session Footer & Quick Switch */}
      <div className="border-t border-[#DFE6EF] p-3.5 bg-[#F4F7FB]">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#17324D] truncate max-w-[150px]">
              {currentUser.nama}
            </span>
            <span className="text-[10px] text-[#079669] font-bold">
              Role: {currentUser.role}
            </span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1 rounded-lg bg-[#FFFFFF] hover:bg-rose-50 hover:text-rose-700 p-1.5 text-[#64748B] border border-[#DFE6EF] transition"
            title="Keluar dari Aplikasi (Logout)"
            id="btn-logout-sidebar"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-600" />
            <span className="text-[10px] font-bold">Keluar</span>
          </button>
        </div>
      </div>

      <PWAInstallModal isOpen={showPwaModal} onClose={() => setShowPwaModal(false)} />
    </aside>
  );
};
