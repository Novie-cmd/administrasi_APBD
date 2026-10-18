import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NTBLogo } from '../common/NTBLogo';
import { UserRole } from '../../types';
import { PWAInstallModal } from '../common/PWAInstallModal';
import { GoogleSheetSyncModal } from '../common/GoogleSheetSyncModal';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  Bell,
  Calendar,
  ShieldCheck,
  RefreshCw,
  UserCheck,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Info,
  Layers,
  Database,
  Download,
  Smartphone,
  Cloud,
  FileSpreadsheet,
  Trash2,
  Building,
  Building2,
  LogOut
} from 'lucide-react';

export const Navbar: React.FC<{
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  interfaceMode?: 'bakesbang' | 'seluruh-opd';
  setInterfaceMode?: (mode: 'bakesbang' | 'seluruh-opd') => void;
}> = ({ sidebarOpen, setSidebarOpen, interfaceMode = 'bakesbang', setInterfaceMode }) => {
  const {
    currentUser,
    switchRole,
    logout,
    selectedTahun,
    setSelectedTahun,
    tahunList,
    realisasiList,
    anggaranList,
    notifications,
    sheetConfig,
    syncStatus,
    cloudSync,
    forceSyncCloud,
    clearRealisasiDatabase,
    clearAnggaranDatabase,
    clearAllDatabase,
    opd
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);
  const [showSheetModal, setShowSheetModal] = useState(false);
  const [clearModalType, setClearModalType] = useState<'transaksi' | 'database' | null>(null);
  const [alsoClearSheet, setAlsoClearSheet] = useState(false);

  const { isInstallable, isInstalled, install } = usePWAInstall();

  const handlePwaButtonClick = async () => {
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

  const roles: UserRole[] = [
    'Administrator',
    'Operator Program',
    'PPK',
    'Kepala Badan',
    'Auditor'
  ];

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-[#DFE6EF] bg-[#FFFFFF] px-4 shadow-xs transition-all md:px-6">
      {/* Left Branding & Logo Section */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-xl border border-[#DFE6EF] bg-[#F4F7FB] p-2 text-[#17324D] hover:bg-emerald-50 hover:text-[#079669] lg:hidden transition"
          title="Toggle Navigation Menu"
          id="btn-toggle-sidebar"
        >
          <Layers className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#F4F7FB] p-0.5 border border-[#DFE6EF] shadow-xs overflow-hidden">
            {opd?.logoUrl ? (
              <img src={opd.logoUrl} alt="Logo NTB" className="h-full w-full object-cover rounded-lg" />
            ) : (
              <NTBLogo className="h-full w-full" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#079669] border border-emerald-200">
                PROVINSI NTB
              </span>
              <span className="hidden text-xs font-semibold text-[#64748B] sm:inline">
                {interfaceMode === 'seluruh-opd' ? '40 OPD SE-NTB' : opd.singkatan}
              </span>
            </div>
            <h1 className="text-sm font-extrabold tracking-tight text-[#17324D] sm:text-base lg:text-lg">
              SISTEM INFORMASI KEUANGAN
            </h1>
            <span className="text-[11px] font-semibold text-[#079669]">
              {interfaceMode === 'seluruh-opd'
                ? 'PORTAL KEUANGAN SELURUH OPD PEMPROV NTB'
                : 'BAKESBANGPOLDAGRI NTB (BFMS)'}
            </span>
          </div>
        </div>
      </div>

      {/* Center / Mode Antarmuka Switcher */}
      {setInterfaceMode && (
        <div className="hidden lg:flex items-center rounded-xl bg-[#F4F7FB] p-1 border border-[#DFE6EF]">
          <button
            type="button"
            onClick={() => setInterfaceMode('bakesbang')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              interfaceMode === 'bakesbang'
                ? 'bg-[#079669] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#17324D]'
            }`}
            title="Antarmuka Satuan Kerja BAKESBANGPOLDAGRI NTB"
          >
            <Building className="h-3.5 w-3.5" />
            <span>BAKESBANGPOLDAGRI</span>
          </button>
          <button
            type="button"
            onClick={() => setInterfaceMode('seluruh-opd')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              interfaceMode === 'seluruh-opd'
                ? 'bg-[#3984E8] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#17324D]'
            }`}
            title="Antarmuka Konsolidasi Seluruh 40 OPD Pemerintah Provinsi NTB"
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Seluruh OPD NTB (40 OPD)</span>
          </button>
        </div>
      )}

      {/* Right Controls: Install PWA App, Fiscal Year, Role Switcher, Google Sheet Sync, Notifications */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* PWA Install Button */}
        <button
          onClick={handlePwaButtonClick}
          className={`flex items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-bold transition-all group ${
            isInstalled
              ? 'border-emerald-200 bg-emerald-50 text-[#079669] hover:bg-emerald-100'
              : 'border-[#DFE6EF] bg-[#F4F7FB] text-[#17324D] hover:bg-emerald-50 hover:text-[#079669] hover:border-emerald-200'
          }`}
          title={isInstalled ? "Aplikasi Sudah Terpasang di Perangkat Anda" : "Instal / Tambah Aplikasi ke Layar Utama HP / Laptop"}
          id="btn-open-pwa-install"
        >
          <div className="relative flex h-4 w-4 items-center justify-center rounded overflow-hidden">
            <NTBLogo size={16} />
          </div>
          <span className="hidden sm:inline">{isInstalled ? 'App Terpasang' : 'Instal App'}</span>
          <span className="inline sm:hidden">{isInstalled ? 'Terpasang' : 'Instal'}</span>
          {isInstalled ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-[#079669]" />
          ) : (
            <Download className="h-3.5 w-3.5 text-[#079669]" />
          )}
        </button>

        {/* Fiscal Year Dropdown (Multi Tahun Anggaran) */}
        <div className="relative flex items-center rounded-xl bg-[#F4F7FB] p-1 border border-[#DFE6EF]">
          <div className="flex items-center gap-1.5 px-2 text-xs font-bold text-[#17324D]">
            <Calendar className="h-3.5 w-3.5 text-[#079669]" />
            <span className="hidden md:inline">TA:</span>
          </div>
          <select
            value={selectedTahun}
            onChange={e => setSelectedTahun(Number(e.target.value))}
            className="cursor-pointer rounded-lg bg-[#FFFFFF] px-2.5 py-1 text-xs font-bold text-[#17324D] border border-[#DFE6EF] focus:outline-none focus:ring-1 focus:ring-[#079669]"
            id="select-tahun-anggaran"
          >
            {tahunList.map(t => {
              const count = realisasiList.filter(r => Number(r.tahun) === Number(t.tahun)).length;
              return (
                <option key={t.id} value={t.tahun}>
                  TA {t.tahun} {count > 0 ? `(${count})` : ''} {t.statusAktif ? '★' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Real-time Firebase Cloud Sync Badge */}
        <button
          onClick={() => forceSyncCloud()}
          disabled={cloudSync.status === 'syncing'}
          className={`flex items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${
            cloudSync.status === 'syncing'
              ? 'border-blue-200 bg-blue-50 text-[#3984E8] animate-pulse'
              : cloudSync.status === 'quota_exceeded'
              ? 'border-amber-200 bg-amber-50 text-amber-800'
              : cloudSync.status === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-800'
              : 'border-emerald-200 bg-emerald-50 text-[#079669] hover:bg-emerald-100'
          }`}
          title={`Status Cloud: ${
            cloudSync.status === 'syncing'
              ? 'Menyinkronkan...'
              : cloudSync.status === 'quota_exceeded'
              ? 'Kuota Cloud Harian Tercapai (Penyimpanan Lokal Aktif)'
              : cloudSync.status === 'error'
              ? 'Koneksi Cloud Terputus'
              : 'Terhubung Real-Time (Laptop ⇄ HP)'
          }. Klik untuk sinkronisasi paksa.`}
          id="btn-cloud-sync"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                cloudSync.status === 'syncing'
                  ? 'bg-blue-400 animate-ping'
                  : cloudSync.status === 'quota_exceeded'
                  ? 'bg-amber-400'
                  : cloudSync.status === 'error'
                  ? 'bg-rose-500 animate-ping'
                  : 'bg-emerald-500 animate-ping'
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                cloudSync.status === 'syncing'
                  ? 'bg-blue-500'
                  : cloudSync.status === 'quota_exceeded'
                  ? 'bg-amber-500'
                  : cloudSync.status === 'error'
                  ? 'bg-rose-500'
                  : 'bg-emerald-600'
              }`}
            />
          </span>
          <Cloud className="h-3.5 w-3.5" />
          <span className="hidden lg:inline font-bold">
            {cloudSync.status === 'syncing'
              ? 'Syncing...'
              : cloudSync.status === 'quota_exceeded'
              ? 'Cloud Quota'
              : 'Cloud Live'}
          </span>
        </button>

        {/* Google Spreadsheet Sync Status & Action */}
        <button
          onClick={() => setShowSheetModal(true)}
          className={`flex items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-semibold transition-all ${
            syncStatus === 'syncing'
              ? 'border-emerald-300 bg-emerald-100 text-[#079669] animate-pulse'
              : 'border-[#DFE6EF] bg-[#F4F7FB] text-[#17324D] hover:bg-emerald-50 hover:text-[#079669] hover:border-emerald-200'
          }`}
          title="Buka Menu Sinkronisasi Google Spreadsheet"
          id="btn-sync-spreadsheet"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-[#079669]" />
          <span className="hidden sm:inline font-bold">Google Sheet</span>
          <span className="inline sm:hidden font-bold">Sheet</span>
        </button>

        {/* Tombol Kosongkan Transaksi */}
        <button
          onClick={() => {
            if (currentUser.role === 'Auditor') {
              alert('Peran Auditor hanya memiliki izin lihat (Read-Only).');
              return;
            }
            setClearModalType('transaksi');
          }}
          className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-rose-700 transition shadow-xs"
          title="Kosongkan Transaksi Realisasi SP2D"
          id="btn-navbar-clear-transaksi"
        >
          <Trash2 className="h-3.5 w-3.5 text-rose-600" />
          <span className="hidden sm:inline">Kosongkan Transaksi</span>
          <span className="inline sm:hidden">Transaksi</span>
        </button>

        {/* Notifications Alert Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative rounded-xl border border-[#DFE6EF] bg-[#F4F7FB] p-2 text-[#17324D] transition hover:bg-amber-50 hover:text-amber-700 hover:border-amber-200"
            title="Notifikasi Peringatan Keuangan"
            id="btn-notifications-toggle"
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-4 shadow-xl z-50 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#DFE6EF] pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-bold text-[#17324D]">Notifikasi Keuangan</h3>
                </div>
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                  {notifications.length} Alert
                </span>
              </div>

              <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-[#64748B]">
                    <CheckCircle2 className="h-8 w-8 text-[#079669] mb-1" />
                    <p className="text-xs">Seluruh realisasi &amp; anggaran tervalidasi lengkap.</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`rounded-xl p-3 text-xs border ${
                        n.type === 'error'
                          ? 'bg-rose-50 border-rose-200 text-rose-800'
                          : n.type === 'warning'
                          ? 'bg-amber-50 border-amber-200 text-amber-800'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          {n.type === 'error' ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                          ) : (
                            <Info className="h-3.5 w-3.5 text-amber-600" />
                          )}
                          {n.title}
                        </span>
                        <span className="text-[10px] opacity-70">{n.timestamp}</span>
                      </div>
                      <p className="mt-1 text-[11px] leading-relaxed opacity-90">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-left text-xs transition hover:bg-emerald-100"
            id="btn-user-role-dropdown"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#079669] text-white font-bold">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="font-extrabold text-[#17324D] max-w-[120px] truncate">
                {currentUser.nama.split(',')[0]}
              </span>
              <span className="text-[10px] font-bold text-[#079669]">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[#079669]" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-3 shadow-xl z-50 animate-fadeIn">
              <div className="border-b border-[#DFE6EF] pb-2 mb-2">
                <p className="text-[11px] font-semibold text-[#64748B]">Pengguna Aktif:</p>
                <p className="text-xs font-bold text-[#17324D]">{currentUser.nama}</p>
                <p className="text-[10px] text-[#079669] font-mono font-bold">Role: {currentUser.role}</p>
              </div>

              <p className="text-[11px] font-semibold text-[#64748B] mb-1.5 px-1">
                Simulasi Hak Akses (Ganti Role):
              </p>
              <div className="space-y-1">
                {roles.map(r => (
                  <button
                    key={r}
                    onClick={() => {
                      switchRole(r);
                      setShowRoleMenu(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                      currentUser.role === r
                        ? 'bg-[#079669] text-white font-bold'
                        : 'text-[#17324D] hover:bg-[#F4F7FB]'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <UserCheck className="h-3.5 w-3.5" />
                      {r}
                    </span>
                    {currentUser.role === r && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                    )}
                  </button>
                ))}
              </div>

              <div className="pt-2 mt-2 border-t border-[#DFE6EF]">
                <button
                  type="button"
                  onClick={() => {
                    setShowRoleMenu(false);
                    logout();
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-xs font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                >
                  <span className="flex items-center gap-2">
                    <LogOut className="h-3.5 w-3.5 text-rose-600" />
                    <span>Keluar Akun (Logout)</span>
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Logout Button */}
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 rounded-xl border border-[#DFE6EF] bg-[#F4F7FB] hover:bg-rose-50 hover:border-rose-200 px-2.5 py-2 text-[#64748B] hover:text-rose-700 transition"
            title="Keluar dari Aplikasi (Logout)"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline text-xs font-bold">Keluar</span>
          </button>
        </div>
      </div>

      <PWAInstallModal isOpen={showPwaModal} onClose={() => setShowPwaModal(false)} />
      <GoogleSheetSyncModal isOpen={showSheetModal} onClose={() => setShowSheetModal(false)} />

      {/* GLOBAL NAVBAR CLEAR MODAL (TRANSAKSI / DATABASE) */}
      {clearModalType !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17324D]/40 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-[#DFE6EF] pb-3">
              <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600 border border-rose-200">
                {clearModalType === 'database' ? (
                  <Database className="h-6 w-6 text-rose-600" />
                ) : (
                  <Trash2 className="h-6 w-6 text-rose-600" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#17324D]">
                  {clearModalType === 'database' ? 'Konfirmasi Kosongkan Database' : 'Konfirmasi Kosongkan Transaksi'}
                </h3>
                <p className="text-xs text-[#64748B]">
                  {clearModalType === 'database'
                    ? 'Penghapusan Seluruh Database Realisasi & Pagu Anggaran'
                    : 'Penghapusan Transaksi Realisasi SP2D'}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#64748B]">
              <p className="font-bold text-rose-700">Peringatan Penting!</p>
              <p>
                {clearModalType === 'database'
                  ? 'Tindakan ini akan mengosongkan database transaksi (Realisasi SP2D dan Pagu Anggaran) dari sistem lokal dan cloud.'
                  : 'Tindakan ini akan menghapus data transaksi Realisasi SP2D. Data yang terhapus tidak dapat dikembalikan.'}
              </p>

              {sheetConfig.webAppUrl && (
                <label className="flex items-center gap-2 rounded-xl bg-[#F4F7FB] border border-[#DFE6EF] p-2.5 text-xs text-[#17324D] cursor-pointer hover:border-slate-300 mt-2">
                  <input
                    type="checkbox"
                    checked={alsoClearSheet}
                    onChange={e => setAlsoClearSheet(e.target.checked)}
                    className="h-4 w-4 rounded border-[#DFE6EF] text-rose-600 focus:ring-rose-500"
                  />
                  <span>Sekaligus kosongkan data di Google Spreadsheet yang terhubung</span>
                </label>
              )}
            </div>

            <div className="space-y-2 pt-2">
              {clearModalType === 'transaksi' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      clearRealisasiDatabase(selectedTahun);
                      setClearModalType(null);
                      alert(`Berhasil mengosongkan seluruh transaksi realisasi untuk Tahun Anggaran ${selectedTahun}.`);
                    }}
                    className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 p-3 text-xs font-bold text-white transition flex items-center justify-between shadow-xs"
                  >
                    <span>Hapus Transaksi TA {selectedTahun} Saja ({realisasiList.filter(r => Number(r.tahun) === Number(selectedTahun)).length} Data)</span>
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      clearRealisasiDatabase();
                      setClearModalType(null);
                      alert('Berhasil mengosongkan seluruh transaksi realisasi untuk semua Tahun Anggaran.');
                    }}
                    className="w-full rounded-xl bg-[#F4F7FB] hover:bg-rose-50 hover:text-rose-700 border border-[#DFE6EF] p-3 text-xs font-bold text-[#17324D] transition flex items-center justify-between"
                  >
                    <span>Hapus Transaksi Semua Tahun ({realisasiList.length} Data)</span>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={async () => {
                      clearRealisasiDatabase(selectedTahun);
                      clearAnggaranDatabase(selectedTahun);
                      if (alsoClearSheet && sheetConfig.webAppUrl) {
                        try {
                          await clearAllDatabase(false, true);
                        } catch (e) {
                          console.error(e);
                        }
                      }
                      setClearModalType(null);
                      alert(`Berhasil mengosongkan transaksi Realisasi & Pagu Anggaran TA ${selectedTahun}.`);
                    }}
                    className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 p-3 text-xs font-bold text-white transition flex items-center justify-between shadow-xs"
                  >
                    <span>Kosongkan Database TA {selectedTahun} Saja (Realisasi & Pagu)</span>
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await clearAllDatabase(false, alsoClearSheet);
                      setClearModalType(null);
                      alert('Berhasil mengosongkan database transaksi (Realisasi & Pagu) semua Tahun Anggaran.');
                    }}
                    className="w-full rounded-xl bg-rose-700 hover:bg-rose-800 p-3 text-xs font-bold text-white transition flex items-center justify-between shadow-xs"
                  >
                    <span>Kosongkan TOTAL Database Transaksi (Semua Tahun)</span>
                    <Database className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#DFE6EF]">
              <button
                type="button"
                onClick={() => setClearModalType(null)}
                className="rounded-xl bg-[#F4F7FB] hover:bg-slate-200/80 px-4 py-2 text-xs font-bold text-[#17324D] transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
