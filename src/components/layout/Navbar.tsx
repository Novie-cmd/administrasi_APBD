import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NTBLogo } from '../common/NTBLogo';
import { UserRole } from '../../types';
import { PWAInstallModal } from '../common/PWAInstallModal';
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
  Radio
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
    notifications,
    sheetConfig,
    syncStatus,
    syncWithSpreadsheet,
    cloudSync,
    forceSyncCloud,
    opd
  } = useApp();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showPwaModal, setShowPwaModal] = useState(false);

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
            {tahunList.map(t => (
              <option key={t.id} value={t.tahun}>
                {t.tahun} {t.statusAktif ? '(Aktif)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Real-time Firebase Cloud Sync Badge */}
        <button
          onClick={() => forceSyncCloud()}
          disabled={cloudSync.status === 'syncing'}
          className={`flex items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 py-1.5 text-xs font-medium transition-all ${
            cloudSync.status === 'syncing'
              ? 'border-cyan-500/50 bg-cyan-950/60 text-cyan-300 animate-pulse'
              : cloudSync.status === 'error'
              ? 'border-rose-500/50 bg-rose-950/40 text-rose-300 hover:border-rose-400'
              : 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:border-emerald-400 hover:text-white'
          }`}
          title={`Cloud Real-Time Database: ${cloudSync.status === 'syncing' ? 'Menyinkronkan...' : 'Terhubung Real-Time (Laptop ⇄ HP)'}. Klik untuk paksa sinkronisasi sekarang.`}
          id="btn-cloud-sync"
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                cloudSync.status === 'syncing'
                  ? 'bg-cyan-400 animate-ping'
                  : cloudSync.status === 'error'
                  ? 'bg-rose-500 animate-ping'
                  : 'bg-emerald-400 animate-ping'
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                cloudSync.status === 'syncing'
                  ? 'bg-cyan-400'
                  : cloudSync.status === 'error'
                  ? 'bg-rose-500'
                  : 'bg-emerald-500'
              }`}
            />
          </span>
          <Cloud className={`h-3.5 w-3.5 ${cloudSync.status === 'syncing' ? 'animate-bounce text-cyan-300' : 'text-emerald-400'}`} />
          <span className="hidden lg:inline font-semibold">
            {cloudSync.status === 'syncing' ? 'Syncing...' : 'Cloud Live'}
          </span>
        </button>

        {/* Google Spreadsheet Sync Status */}
        <button
          onClick={syncWithSpreadsheet}
          disabled={syncStatus === 'syncing'}
          className={`hidden items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all xl:flex ${
            syncStatus === 'syncing'
              ? 'border-emerald-500/50 bg-emerald-900/30 text-emerald-300'
              : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-emerald-500 hover:text-white'
          }`}
          title="Sinkronisasi otomatis dengan Google Spreadsheet"
          id="btn-sync-spreadsheet"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 text-emerald-400 ${
              syncStatus === 'syncing' ? 'animate-spin' : ''
            }`}
          />
          <span className="hidden xl:inline">Sheet:</span>
          <span className="font-semibold text-emerald-400">
            {syncStatus === 'syncing' ? 'Syncing...' : 'Connected'}
          </span>
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
    </header>
  );
};
