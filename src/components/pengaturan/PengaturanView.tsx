import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, User } from '../../types';
import {
  Settings,
  Users,
  Database,
  Shield,
  Activity,
  RefreshCw,
  Plus,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  Key,
  Globe,
  HardDrive,
  Edit,
  Trash2,
  Search,
  AlertTriangle,
  FileText,
  Cloud,
  Smartphone,
  Laptop
} from 'lucide-react';

export const PengaturanView: React.FC = () => {
  const {
    users,
    addUser,
    updateUserStatus,
    updateUser,
    deleteUser,
    sheetConfig,
    setSheetConfig,
    syncStatus,
    syncWithSpreadsheet,
    cloudSync,
    forceSyncCloud,
    activityLogs,
    deleteActivityLog,
    clearAllActivityLogs,
    resetAllData,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'cloud' | 'spreadsheet' | 'backup' | 'logs'>('cloud');

  // Search filter
  const [searchTerm, setSearchTerm] = useState('');

  // New User Form State
  const [showAddUser, setShowAddUser] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newNip, setNewNip] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('Operator Program');

  // Edit User State
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Delete User State
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Clear Logs State
  const [showClearLogsModal, setShowClearLogsModal] = useState(false);

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNama || !newUsername) return;
    addUser({
      nama: newNama,
      nip: newNip,
      username: newUsername,
      role: newRole,
      status: 'Aktif'
    });
    setNewNama('');
    setNewNip('');
    setNewUsername('');
    setShowAddUser(false);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUser(editingUser.id, editingUser);
    setEditingUser(null);
  };

  const handleConfirmDeleteUser = () => {
    if (!deletingUser) return;
    deleteUser(deletingUser.id);
    setDeletingUser(null);
  };

  const handleConfirmClearLogs = () => {
    clearAllActivityLogs();
    setShowClearLogsModal(false);
  };

  const exportBackupJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(localStorage));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `BFMS_NTB_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const isReadonly = currentUser.role === 'Auditor';

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-emerald-400" />
          <h1 className="text-xl font-bold text-white">Pengaturan Sistem & Audit Trail</h1>
        </div>
        <p className="text-xs text-slate-400">
          Manajemen Pengguna, Edit & Hapus User, Integrasi Google Spreadsheet API, Cadangan Data & Audit Trail Log Aktivitas
        </p>
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-800 pb-2 scrollbar-none">
        {[
          { id: 'cloud', label: 'Cloud Real-Time Sync (Laptop ⇄ HP)', icon: Cloud },
          { id: 'users', label: 'Manajemen Pengguna (User)', icon: Users },
          { id: 'spreadsheet', label: 'Integrasi Google Spreadsheet', icon: Database },
          { id: 'backup', label: 'Backup & Restore Database', icon: HardDrive },
          { id: 'logs', label: 'Audit Trail (Log Aktivitas)', icon: Activity }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchTerm('');
              }}
              className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB: CLOUD REAL-TIME DATABASE */}
      {activeTab === 'cloud' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Cloud className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Sinkronisasi Cloud Real-Time Firebase</h3>
                  <p className="text-xs text-slate-400">
                    Otomatis menyelaraskan seluruh data anggaran, master, dan realisasi SPJ antara Laptop dan HP secara langsung.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  Status: {cloudSync.status === 'syncing' ? 'Menyinkronkan...' : cloudSync.status === 'error' ? 'Offline' : 'Aktif (Real-Time Live)'}
                </span>
              </div>
            </div>

            {/* Illustration / Card sync */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-200">
                  <Laptop className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold text-white">Input di Laptop</h4>
                <p className="text-[11px] text-slate-400">
                  Semua input pagu anggaran, revisi, import Excel, maupun SPJ realisasi yang dibuat di Laptop langsung dikirim ke Cloud.
                </p>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-2 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg">
                  <Cloud className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold text-emerald-300">Firebase Cloud Database</h4>
                <p className="text-[11px] text-emerald-200/80">
                  Tersimpan di Cloud Firestore berkecepatan tinggi dengan auto-caching dan sinkronisasi real-time instan.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-2 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-200">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h4 className="text-xs font-bold text-white">Otomatis Muncul di HP</h4>
                <p className="text-[11px] text-slate-400">
                  Buka link aplikasi di HP, seluruh data langsung sama persis tanpa perlu ekspor/impor file backup manual.
                </p>
              </div>
            </div>

            {/* Sync details and action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl bg-slate-950 p-4 border border-slate-800">
              <div className="text-xs text-slate-300 space-y-1">
                <div>
                  <span className="text-slate-400">Terakhir Diperbarui: </span>
                  <span className="font-semibold text-white">
                    {cloudSync.lastSyncedAt ? new Date(cloudSync.lastSyncedAt).toLocaleString('id-ID') : 'Hari ini'}
                  </span>
                </div>
                {cloudSync.lastUpdatedBy && (
                  <div>
                    <span className="text-slate-400">Oleh: </span>
                    <span className="font-semibold text-emerald-400">{cloudSync.lastUpdatedBy}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => forceSyncCloud()}
                disabled={cloudSync.status === 'syncing'}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-emerald-900/30 w-full sm:w-auto justify-center"
              >
                <RefreshCw className={`h-4 w-4 ${cloudSync.status === 'syncing' ? 'animate-spin' : ''}`} />
                <span>{cloudSync.status === 'syncing' ? 'Menyinkronkan...' : 'Paksa Sinkronkan Cloud Sekarang'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: MANAJEMEN PENGGUNA */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-400" />
              <span>Daftar Pengguna Sistem & Hak Akses ({users.length} User)</span>
            </h2>

            {!isReadonly && (
              <button
                onClick={() => setShowAddUser(!showAddUser)}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah User Baru</span>
              </button>
            )}
          </div>

          {/* Search Filter User */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Cari nama pengguna, username, atau role..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          {showAddUser && !isReadonly && (
            <form onSubmit={handleAddUserSubmit} className="rounded-2xl border border-emerald-600/40 bg-slate-900 p-5 space-y-3 shadow-xl">
              <h3 className="text-xs font-bold text-emerald-300">Form Tambah User Baru</h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                <div>
                  <label className="text-xs font-bold text-slate-300">Nama Lengkap & Gelar:</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Budi Santoso, S.E."
                    value={newNama}
                    onChange={e => setNewNama(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">NIP (Nomor Induk Pegawai):</label>
                  <input
                    type="text"
                    placeholder="19800101 200501 1 001"
                    value={newNip}
                    onChange={e => setNewNip(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Username Login:</label>
                  <input
                    type="text"
                    required
                    placeholder="username_ntb"
                    value={newUsername}
                    onChange={e => setNewUsername(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300">Role / Hak Akses:</label>
                  <select
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as UserRole)}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2 text-xs text-white font-bold"
                  >
                    <option value="Administrator">Administrator</option>
                    <option value="Operator Program">Operator Program</option>
                    <option value="PPK">PPK</option>
                    <option value="Kepala Badan">Kepala Badan</option>
                    <option value="Auditor">Auditor</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-500 shadow"
                >
                  Simpan User Baru
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Batal
                </button>
              </div>
            </form>
          )}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-300 font-bold uppercase border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">ID User</th>
                  <th className="px-4 py-3">Nama Pengguna & NIP</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Role / Hak Akses</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Aksi & Kelola</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {users
                  .filter(
                    u =>
                      u.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (u.nip && u.nip.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      u.role.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map(u => (
                    <tr key={u.id} className="hover:bg-slate-800/50">
                      <td className="px-4 py-3 font-mono text-emerald-400 font-bold">{u.id}</td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{u.nama}</div>
                        {u.nip ? (
                          <div className="text-[10px] text-slate-400 font-mono">NIP. {u.nip}</div>
                        ) : (
                          <div className="text-[10px] text-slate-600 italic">NIP belum diisi</div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">{u.username}</td>
                      <td className="px-4 py-3 font-bold text-amber-300">{u.role}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            u.status === 'Aktif'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() =>
                              updateUserStatus(u.id, u.status === 'Aktif' ? 'Nonaktif' : 'Aktif')
                            }
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition ${
                              u.status === 'Aktif'
                                ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                : 'bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-600/40'
                            }`}
                            title="Ubah Status Aktif/Inaktif"
                          >
                            {u.status === 'Aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                          </button>

                          {!isReadonly && (
                            <>
                              <button
                                onClick={() => setEditingUser(u)}
                                className="flex items-center gap-1 rounded-lg bg-amber-950/60 hover:bg-amber-900 border border-amber-600/40 px-2.5 py-1 text-[11px] font-bold text-amber-300 transition"
                                title="Edit Data User"
                              >
                                <Edit className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </button>

                              <button
                                onClick={() => setDeletingUser(u)}
                                className="flex items-center gap-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-600/40 px-2.5 py-1 text-[11px] font-bold text-rose-300 transition"
                                title="Hapus User"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Hapus</span>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: GOOGLE SPREADSHEET */}
      {activeTab === 'spreadsheet' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Konfigurasi Google Apps Script WebApp</h3>
              </div>
              <span className="rounded-full bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-700">
                Status: {sheetConfig.status}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Spreadsheet ID:</label>
              <input
                type="text"
                value={sheetConfig.spreadsheetId}
                onChange={e => setSheetConfig({ ...sheetConfig, spreadsheetId: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-emerald-300 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Google Apps Script Web App URL:</label>
              <input
                type="text"
                value={sheetConfig.webAppUrl}
                onChange={e => setSheetConfig({ ...sheetConfig, webAppUrl: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Terakhir Sinkronisasi: {sheetConfig.lastSyncedAt || 'Belum'}
              </span>
              <button
                onClick={syncWithSpreadsheet}
                disabled={syncStatus === 'syncing'}
                className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md"
              >
                <RefreshCw className={`h-4 w-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
                <span>Test & Sinkronkan Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP */}
      {activeTab === 'backup' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white">Cadangan (Backup) & Pemulihan Data Database</h3>
          <p className="text-xs text-slate-400">
            Ekspor seluruh data transaksi anggaran, realisasi, dan master data ke format JSON aman.
          </p>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={exportBackupJSON}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 shadow-md"
            >
              <Download className="h-4 w-4" />
              <span>Unduh Cadangan JSON</span>
            </button>

            {!isReadonly && (
              <button
                onClick={resetAllData}
                className="flex items-center gap-2 rounded-xl border border-rose-800 bg-rose-950/60 px-5 py-2.5 text-xs font-bold text-rose-300 hover:bg-rose-900 transition"
              >
                <span>Reset Seluruh Data</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <span>Log Aktivitas / Audit Trail Pengguna ({activityLogs.length} Catatan)</span>
            </h3>

            {!isReadonly && activityLogs.length > 0 && (
              <button
                onClick={() => setShowClearLogsModal(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/50 px-3.5 py-2 text-xs font-bold text-rose-300 transition"
              >
                <Trash2 className="h-4 w-4" />
                <span>Kosongkan Semua Log Audit</span>
              </button>
            )}
          </div>

          {/* Search Filter Audit Logs */}
          <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400 mr-2" />
            <input
              type="text"
              placeholder="Cari kata kunci aktivitas, user, role, atau tanggal..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
            />
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-300 font-bold uppercase border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Tanggal & Jam</th>
                    <th className="px-4 py-3">User & Role</th>
                    <th className="px-4 py-3">Aktivitas Sistem</th>
                    <th className="px-4 py-3">IP / Device</th>
                    {!isReadonly && <th className="px-4 py-3 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {activityLogs
                    .filter(
                      log =>
                        log.aktivitas.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.tanggal.includes(searchTerm)
                    )
                    .map(log => (
                      <tr key={log.id} className="hover:bg-slate-800/50">
                        <td className="px-4 py-3 font-mono text-slate-400 whitespace-nowrap">
                          {log.tanggal} {log.jam}
                        </td>
                        <td className="px-4 py-3 font-semibold text-white">
                          {log.user} <span className="text-emerald-400 font-normal">({log.role})</span>
                        </td>
                        <td className="px-4 py-3 text-slate-200">{log.aktivitas}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">{log.ip}</td>
                        {!isReadonly && (
                          <td className="px-4 py-3 text-right">
                            <button
                              onClick={() => deleteActivityLog(log.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/50 transition"
                              title="Hapus Catatan Log Ini"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT USER */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <form
            onSubmit={handleSaveEditUser}
            className="w-full max-w-md rounded-3xl border border-amber-600/50 bg-slate-900 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Edit className="h-5 w-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Edit Data Pengguna</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-300">Nama Pengguna & Gelar:</label>
                <input
                  type="text"
                  required
                  value={editingUser.nama}
                  onChange={e => setEditingUser({ ...editingUser, nama: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">NIP (Nomor Induk Pegawai):</label>
                <input
                  type="text"
                  placeholder="Contoh: 19800101 200501 1 001"
                  value={editingUser.nip || ''}
                  onChange={e => setEditingUser({ ...editingUser, nip: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Username Login:</label>
                <input
                  type="text"
                  required
                  value={editingUser.username}
                  onChange={e => setEditingUser({ ...editingUser, username: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Role / Peran Akses:</label>
                <select
                  value={editingUser.role}
                  onChange={e => setEditingUser({ ...editingUser, role: e.target.value as UserRole })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white font-bold"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Operator Program">Operator Program</option>
                  <option value="PPK">PPK</option>
                  <option value="Kepala Badan">Kepala Badan</option>
                  <option value="Auditor">Auditor</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300">Status Akun:</label>
                <select
                  value={editingUser.status}
                  onChange={e => setEditingUser({ ...editingUser, status: e.target.value as 'Aktif' | 'Nonaktif' })}
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-white font-bold"
                >
                  <option value="Aktif">Aktif</option>
                  <option value="Nonaktif">Nonaktif</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white hover:bg-amber-500 shadow"
              >
                Simpan Perubahan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL CONFIRM DELETE USER */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-rose-600/60 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-950 border border-rose-600/40 text-rose-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Konfirmasi Hapus User</h3>
                <p className="text-xs text-slate-400">Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Apakah Anda yakin ingin menghapus pengguna <strong className="text-white">{deletingUser.nama}</strong> ({deletingUser.username}) dari sistem?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setDeletingUser(null)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDeleteUser}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 shadow"
              >
                Ya, Hapus User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRM CLEAR LOGS */}
      {showClearLogsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl border border-rose-600/60 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-rose-950 border border-rose-600/40 text-rose-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Kosongkan Log Audit</h3>
                <p className="text-xs text-slate-400">Hapus semua riwayat aktivitas.</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Apakah Anda yakin ingin menghapus seluruh <strong className="text-white">{activityLogs.length} catatan log audit</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowClearLogsModal(false)}
                className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmClearLogs}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 shadow"
              >
                Ya, Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
