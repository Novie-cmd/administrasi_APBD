import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NTBLogo } from '../common/NTBLogo';
import { UserRole } from '../../types';
import { PWAInstallModal } from '../common/PWAInstallModal';
import { GoogleSheetSyncModal } from '../common/GoogleSheetSyncModal';
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
  CloudCheck,
  Radio,
  FileSpreadsheet,
  Trash2
} from 'lucide-react';

export const Navbar: React.FC<{
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}> = ({ sidebarOpen, setSidebarOpen }) => {
  const {
    currentUser,
    switchRole,
    selectedTahun,
    setSelectedTahun,
    tahunList,
    realisasiList,
    anggaranList,
    notifications,
    sheetConfig,
    syncStatus,
    syncWithSpreadsheet,
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

  const roles: UserRole[] = [
    'Administrator',
    'Operator Program',
    'PPK',
    'Kepala Badan',
    'Auditor'
  ];

  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between border-b border-emerald-900/30 bg-slate-900/95 px-4 backdrop-blur-md transition-all md:px-6">
      {/* Left Branding & Logo Section */}
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg bg-slate-800 p-2 text-slate-300 hover:bg-emerald-800 hover:text-white lg:hidden"
          title="Toggle Navigation Menu"
          id="btn-toggle-sidebar"
        >
          <Layers className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-slate-950 p-0.5 border border-emerald-500/50 shadow-md overflow-hidden">
            {opd?.logoUrl ? (
              <img src={opd.logoUrl} alt="Logo NTB" className="h-full w-full object-cover rounded-lg" />
            ) : (
              <NTBLogo className="h-full w-full" />
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="rounded bg-emerald-800/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-200 ring-1 ring-emerald-500/30">
                PROVINSI NTB
              </span>
              <span className="hidden text-xs text-emerald-400/90 sm:inline">
                {opd.singkatan}
              </span>
            </div>
            <h1 className="text-base font-bold tracking-tight text-white sm:text-lg lg:text-xl">
              SISTEM INFORMASI KEUANGAN
            </h1>
            <span className="text-xs font-medium text-emerald-300/80">
              BAKESBANGPOLDAGRI NTB (BFMS)
            </span>
          </div>
        </div>
      </div>

      {/* Right Controls: Install PWA App, Fiscal Year, Role Switcher, Google Sheet Sync, Notifications */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* PWA Install Button with Rusa NTB branding */}
        <button
          onClick={() => setShowPwaModal(true)}
          className="flex items-center gap-1.5 rounded-xl border border-amber-500/50 bg-gradient-to-r from-red-950/80 via-slate-900 to-amber-950/80 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-amber-300 hover:text-white hover:border-amber-400 hover:shadow-lg hover:shadow-red-900/30 transition-all group"
          title="Instal / Tambah Aplikasi ke Layar Utama HP / Laptop"
          id="btn-open-pwa-install"
        >
          <div className="relative flex h-5 w-5 items-center justify-center rounded-md bg-red-600 text-white font-black overflow-hidden shadow">
            <img src="/app-logo.jpg" alt="Rusa Logo" className="h-full w-full object-cover" />
          </div>
          <span className="hidden sm:inline">Instal App</span>
          <span className="inline sm:hidden">App</span>
          <Download className="h-3.5 w-3.5 text-amber-400 group-hover:translate-y-0.5 transition-transform" />
        </button>

        {/* Fiscal Year Dropdown (Multi Tahun Anggaran) */}
        <div className="relative flex items-center rounded-xl bg-slate-800/90 p-1.5 ring-1 ring-emerald-500/20 shadow-inner">
          <div className="flex items-center gap-1.5 px-2 text-xs font-semibold text-emerald-300">
            <Calendar className="h-4 w-4 text-emerald-400" />
            <span className="hidden md:inline">Tahun:</span>
          </div>
          <select
            value={selectedTahun}
            onChange={e => setSelectedTahun(Number(e.target.value))}
            className="cursor-pointer rounded-lg bg-emerald-950 px-2.5 py-1 text-xs font-bold text-emerald-100 border border-emerald-600/50 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            id="select-tahun-anggaran"
          >
            {tahunList.map(t => {
              const count = realisasiList.filter(r => Number(r.tahun) === Number(t.tahun)).length;
              return (
                <option key={t.id} value={t.tahun}>
                  TA {t.tahun} {count > 0 ? `(${count} Data)` : ''} {t.statusAktif ? '★' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Real-time Firebase Cloud Sync Badge */}
        <button
          onClick={() => forceSyncCloud()}
          disabled={cloudSync.status === 'syncing'}
          className={`flex items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all ${
            cloudSync.status === 'syncing'
              ? 'border-cyan-500/50 bg-cyan-950/60 text-cyan-300 animate-pulse'
              : cloudSync.status === 'quota_exceeded'
              ? 'border-amber-500/50 bg-amber-950/40 text-amber-300 hover:border-amber-400'
              : cloudSync.status === 'error'
              ? 'border-rose-500/50 bg-rose-950/40 text-rose-300 hover:border-rose-400'
              : 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:border-emerald-400 hover:text-white'
          }`}
          title={`Status Cloud: ${
            cloudSync.status === 'syncing'
              ? 'Menyinkronkan...'
              : cloudSync.status === 'quota_exceeded'
              ? 'Kuota Cloud Harian Tercapai (Penyimpanan Lokal & Google Sheet Aktif)'
              : cloudSync.status === 'error'
              ? 'Koneksi Cloud Terputus'
              : 'Terhubung Real-Time (Laptop ⇄ HP)'
          }. Klik untuk buka menu sinkronisasi.`}
          id="btn-cloud-sync"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                cloudSync.status === 'syncing'
                  ? 'bg-cyan-400 animate-ping'
                  : cloudSync.status === 'quota_exceeded'
                  ? 'bg-amber-400'
                  : cloudSync.status === 'error'
                  ? 'bg-rose-500 animate-ping'
                  : 'bg-emerald-400 animate-ping'
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                cloudSync.status === 'syncing'
                  ? 'bg-cyan-400'
                  : cloudSync.status === 'quota_exceeded'
                  ? 'bg-amber-400'
                  : cloudSync.status === 'error'
                  ? 'bg-rose-500'
                  : 'bg-emerald-500'
              }`}
            />
          </span>
          <Cloud className={`h-3.5 w-3.5 ${
            cloudSync.status === 'syncing'
              ? 'animate-bounce text-cyan-300'
              : cloudSync.status === 'quota_exceeded'
              ? 'text-amber-400'
              : 'text-emerald-400'
          }`} />
          <span className="hidden lg:inline font-semibold">
            {cloudSync.status === 'syncing'
              ? 'Syncing...'
              : cloudSync.status === 'quota_exceeded'
              ? 'Cloud Quota (Local OK)'
              : 'Cloud Live'}
          </span>
        </button>

        {/* Google Spreadsheet Sync Status & Action */}
        <button
          onClick={() => setShowSheetModal(true)}
          className={`flex items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all ${
            syncStatus === 'syncing'
              ? 'border-emerald-500/50 bg-emerald-900/30 text-emerald-300 animate-pulse'
              : 'border-emerald-700/60 bg-emerald-950/40 text-emerald-300 hover:border-emerald-400 hover:text-white'
          }`}
          title="Buka Menu Sinkronisasi Google Spreadsheet (Kirim / Tarik Data)"
          id="btn-sync-spreadsheet"
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
          <span className="hidden sm:inline font-semibold">Google Sheet</span>
          <span className="inline sm:hidden font-semibold">Sheet</span>
        </button>

        {/* Tombol Kosongkan Transaksi */}
        <button
          onClick={() => {
            if (currentUser.role === 'Auditor') {
              alert('Peran Auditor hanya memiliki izin lihat (Read-Only). Masuk sebagai Administrator/Operator untuk mengosongkan transaksi.');
              return;
            }
            setClearModalType('transaksi');
          }}
          className="flex items-center gap-1.5 rounded-xl border border-rose-700/80 bg-rose-950/70 hover:bg-rose-900 hover:border-rose-500 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-rose-200 hover:text-white transition-all shadow-sm"
          title="Kosongkan Transaksi Realisasi SP2D (TA Aktif atau Semua Tahun)"
          id="btn-navbar-clear-transaksi"
        >
          <Trash2 className="h-3.5 w-3.5 text-rose-400" />
          <span className="hidden sm:inline">Kosongkan Transaksi</span>
          <span className="inline sm:hidden">Transaksi</span>
        </button>

        {/* Tombol Kosongkan Database */}
        <button
          onClick={() => {
            if (currentUser.role === 'Auditor') {
              alert('Peran Auditor hanya memiliki izin lihat (Read-Only). Masuk sebagai Administrator/Operator untuk mengosongkan database.');
              return;
            }
            setClearModalType('database');
          }}
          className="flex items-center gap-1.5 rounded-xl border border-red-700/90 bg-red-950/80 hover:bg-red-900 hover:border-red-500 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-red-200 hover:text-white transition-all shadow-sm"
          title="Kosongkan Seluruh Database Transaksi (Realisasi & Pagu Anggaran)"
          id="btn-navbar-clear-database"
        >
          <Database className="h-3.5 w-3.5 text-rose-400" />
          <span className="hidden sm:inline">Kosongkan Database</span>
          <span className="inline sm:hidden">Database</span>
        </button>

        {/* Notifications Alert Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative rounded-xl border border-slate-700 bg-slate-800/90 p-2 text-slate-300 transition hover:border-amber-500/50 hover:text-white"
            title="Notifikasi Peringatan Keuangan"
            id="btn-notifications-toggle"
          >
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-slate-950 animate-pulse">
                {notifications.length}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl ring-1 ring-emerald-500/20 z-50">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-400" />
                  <h3 className="text-sm font-bold text-white">Notifikasi Keuangan</h3>
                </div>
                <span className="rounded-full bg-amber-950 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-800">
                  {notifications.length} Alert
                </span>
              </div>

              <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-1" />
                    <p className="text-xs">Seluruh realisasi & anggaran tervalidasi lengkap.</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      className={`rounded-xl p-3 text-xs border ${
                        n.type === 'error'
                          ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                          : n.type === 'warning'
                          ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                          : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1.5">
                          {n.type === 'error' ? (
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                          ) : (
                            <Info className="h-3.5 w-3.5 text-amber-400" />
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
            className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-950/60 px-2.5 py-1.5 text-left text-xs transition hover:bg-emerald-900/80"
            id="btn-user-role-dropdown"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-slate-950 font-bold">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="hidden flex-col sm:flex">
              <span className="font-bold text-white max-w-[120px] truncate">
                {currentUser.nama.split(',')[0]}
              </span>
              <span className="text-[10px] font-semibold text-emerald-300">
                {currentUser.role}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-emerald-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-700 bg-slate-900 p-3 shadow-2xl ring-1 ring-emerald-500/30 z-50">
              <div className="border-b border-slate-800 pb-2 mb-2">
                <p className="text-[11px] font-medium text-slate-400">Pengguna Aktif:</p>
                <p className="text-xs font-bold text-white">{currentUser.nama}</p>
                <p className="text-[10px] text-emerald-400 font-mono">Role: {currentUser.role}</p>
              </div>

              <p className="text-[11px] font-semibold text-slate-400 mb-1.5 px-1">
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
                        ? 'bg-emerald-700 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
                      {r}
                    </span>
                    {currentUser.role === r && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <PWAInstallModal isOpen={showPwaModal} onClose={() => setShowPwaModal(false)} />
      <GoogleSheetSyncModal isOpen={showSheetModal} onClose={() => setShowSheetModal(false)} />

      {/* GLOBAL NAVBAR CLEAR MODAL (TRANSAKSI / DATABASE) */}
      {clearModalType !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-rose-900/80 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
              <div className="rounded-xl bg-rose-950 p-2.5 text-rose-400 border border-rose-800">
                {clearModalType === 'database' ? (
                  <Database className="h-6 w-6 text-rose-400" />
                ) : (
                  <Trash2 className="h-6 w-6 text-rose-400" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  {clearModalType === 'database' ? 'Konfirmasi Kosongkan Database' : 'Konfirmasi Kosongkan Transaksi'}
                </h3>
                <p className="text-xs text-rose-300">
                  {clearModalType === 'database'
                    ? 'Penghapusan Seluruh Database Realisasi & Pagu Anggaran'
                    : 'Penghapusan Transaksi Realisasi SP2D'}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p className="font-bold text-rose-300">Peringatan Penting!</p>
              <p>
                {clearModalType === 'database'
                  ? 'Tindakan ini akan mengosongkan seluruh database transaksi (Realisasi SP2D dan Pagu Anggaran) dari sistem lokal dan cloud.'
                  : 'Tindakan ini akan menghapus data transaksi Realisasi SP2D. Data yang terhapus tidak dapat dikembalikan.'}
              </p>

              {sheetConfig.webAppUrl && (
                <label className="flex items-center gap-2 rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-300 cursor-pointer hover:border-slate-700 mt-2">
                  <input
                    type="checkbox"
                    checked={alsoClearSheet}
                    onChange={e => setAlsoClearSheet(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-rose-500 focus:ring-rose-500"
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
                    className="w-full rounded-xl bg-rose-600 hover:bg-rose-500 p-3 text-xs font-bold text-white transition flex items-center justify-between shadow-md"
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
                    className="w-full rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 border border-slate-700 hover:border-rose-800 p-3 text-xs font-bold text-slate-300 transition flex items-center justify-between"
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
                    className="w-full rounded-xl bg-rose-600 hover:bg-rose-500 p-3 text-xs font-bold text-white transition flex items-center justify-between shadow-md"
                  >
                    <span>Kosongkan Database TA {selectedTahun} Saja (Realisasi & Pagu)</span>
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await clearAllDatabase(false, alsoClearSheet);
                      setClearModalType(null);
                      alert('Berhasil mengosongkan SELURUH database transaksi (Realisasi & Pagu) semua Tahun Anggaran.');
                    }}
                    className="w-full rounded-xl bg-red-800 hover:bg-red-700 border border-red-700 p-3 text-xs font-bold text-white transition flex items-center justify-between shadow-md"
                  >
                    <span>Kosongkan TOTAL Database Transaksi (Semua Tahun)</span>
                    <Database className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setClearModalType(null)}
                className="rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-300 transition"
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
