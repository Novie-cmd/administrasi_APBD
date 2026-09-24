import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole, User } from '../../types';
import { FIRESTORE_UPGRADE_URL, FIRESTORE_PRICING_URL } from '../../services/firestoreSync';
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
  Laptop,
  Copy,
  Check,
  FileSpreadsheet,
  ArrowDownCircle,
  ExternalLink,
  Code
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
    pushToGoogleSheet,
    pullFromGoogleSheet,
    cloudSync,
    forceSyncCloud,
    activityLogs,
    deleteActivityLog,
    clearAllActivityLogs,
    clearAllDatabase,
    resetAllData,
    restoreFromBackup,
    importBackupJSON,
    realisasiList,
    anggaranList,
    tahunList,
    opd,
    opdList,
    programs,
    kegiatanList,
    subKegiatanList,
    belanjaList,
    sumberDanaList,
    rekananList,
    selectedTahun,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'cloud' | 'spreadsheet' | 'backup' | 'logs'>('cloud');
  const [backupMessage, setBackupMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [sheetMessage, setSheetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isPushingSheet, setIsPushingSheet] = useState(false);
  const [isPullingSheet, setIsPullingSheet] = useState(false);

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
    const backupObj = {
      appName: 'Sistem Keuangan BAKESBANGPOLDAGRI NTB',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser.nama,
      users,
      tahunList,
      opd,
      opdList,
      programs,
      kegiatanList,
      subKegiatanList,
      belanjaList,
      sumberDanaList,
      rekananList,
      anggaranList,
      realisasiList,
      activityLogs
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
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
          { id: 'cloud', label: 'Cloud Sync (Laptop ⇄ HP)', icon: Cloud },
          { id: 'backup', label: 'Cadangan & Pemulihan JSON (Backup/Restore)', icon: HardDrive },
          { id: 'users', label: 'Manajemen Pengguna (User)', icon: Users },
          { id: 'spreadsheet', label: 'Integrasi Google Spreadsheet', icon: Database },
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
                <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${
                  cloudSync.status === 'syncing'
                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
                    : cloudSync.status === 'quota_exceeded'
                    ? 'bg-amber-950 text-amber-300 border-amber-700'
                    : cloudSync.status === 'error'
                    ? 'bg-rose-950 text-rose-300 border-rose-700'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                }`}>
                  <span className={`h-2 w-2 rounded-full ${
                    cloudSync.status === 'syncing'
                      ? 'bg-cyan-400 animate-ping'
                      : cloudSync.status === 'quota_exceeded'
                      ? 'bg-amber-400'
                      : cloudSync.status === 'error'
                      ? 'bg-rose-400'
                      : 'bg-emerald-400 animate-ping'
                  }`} />
                  Status: {
                    cloudSync.status === 'syncing'
                      ? 'Menyinkronkan...'
                      : cloudSync.status === 'quota_exceeded'
                      ? 'Kuota Cloud Tercapai (Penyimpanan Lokal & Sheet Aktif)'
                      : cloudSync.status === 'error'
                      ? 'Offline'
                      : 'Aktif (Real-Time Live)'
                  }
                </span>
              </div>
            </div>

            {/* Quota Notice Banner if quota exceeded */}
            {cloudSync.status === 'quota_exceeded' && (
              <div className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-4 space-y-3 text-amber-200 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-300">ℹ</span>
                  <span>Batas Kuota Gratis Firestore Harian Tercapai (Free Daily Units Limit)</span>
                </div>
                <p className="text-amber-200/90 leading-relaxed">
                  Batas unit tulis gratis Firestore (*Spark tier*) telah tercapai untuk hari ini. <strong>Seluruh data Anda tetap aman 100%</strong> tersimpan di browser (Local Storage & Backup Permanen) dan Anda dapat terus bekerja, menginput anggaran, mencatat realisasi, maupun mengekspor laporan. Anda juga dapat menggunakan menu <strong>Integrasi Google Spreadsheet</strong> untuk sinkronisasi antar perangkat tanpa batas kuota.
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={FIRESTORE_UPGRADE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold transition"
                  >
                    <span>Buka Upgrade Database Firestore</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href={FIRESTORE_PRICING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-slate-300 hover:text-white underline text-[11px]"
                  >
                    <span>Informasi Kuota Spark & Enterprise</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="text-[11px] text-amber-300/80">
                  * Kuota Firebase akan ter-reset otomatis setiap hari (00:00 UTC).
                </p>
              </div>
            )}

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

            {/* Zona Pengosongan Transaksi */}
            {!isReadonly && (
              <div className="rounded-xl border border-rose-900/60 bg-rose-950/30 p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-rose-300 flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-rose-400" />
                      <span>Manajemen Pembersihan Database (Lokal & Cloud)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Menghapus seluruh transaksi Realisasi SP2D dan Pagu Anggaran secara permanen dari perangkat ini dan Firestore Cloud.
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mengosongkan SELURUH data transaksi (Realisasi & Pagu Anggaran)? Data akan dihapus bersih dari perangkat ini dan juga Firestore Cloud.')) {
                        try {
                          await clearAllDatabase(false);
                          setBackupMessage({
                            type: 'success',
                            text: 'Berhasil mengosongkan seluruh database transaksi (Realisasi & Pagu) secara permanen di lokal dan Cloud.'
                          });
                        } catch (err: any) {
                          setBackupMessage({
                            type: 'error',
                            text: `Gagal mengosongkan database: ${err.message}`
                          });
                        }
                      }
                    }}
                    className="flex items-center justify-center gap-2 rounded-xl border border-rose-600/80 bg-rose-950/80 hover:bg-rose-900 px-4 py-2.5 text-xs font-bold text-rose-200 hover:text-white transition shadow shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-rose-400" />
                    <span>Kosongkan Transaksi (Realisasi & Pagu)</span>
                  </button>
                </div>
              </div>
            )}
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
          {/* Status Alert Banner */}
          {sheetMessage && (
            <div
              className={`flex items-center justify-between rounded-2xl border p-4 text-xs font-semibold ${
                sheetMessage.type === 'success'
                  ? 'border-emerald-700/60 bg-emerald-950/60 text-emerald-300'
                  : 'border-rose-700/60 bg-rose-950/60 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {sheetMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0" />
                )}
                <span>{sheetMessage.text}</span>
              </div>
              <button
                onClick={() => setSheetMessage(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* Quick Push & Pull Actions Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-emerald-700/50 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 p-5 space-y-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">1. Kirim & Simpan Data ke Spreadsheet</h4>
                  <p className="text-xs text-slate-400">Mencadangkan {realisasiList.length} transaksi realisasi & {anggaranList.length} pagu anggaran ke Google Sheet Anda.</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  if (!sheetConfig.webAppUrl) {
                    setSheetMessage({ type: 'error', text: 'Silakan masukkan URL Web App Google Apps Script Anda terlebih dahulu di bawah.' });
                    return;
                  }
                  setIsPushingSheet(true);
                  const res = await pushToGoogleSheet();
                  setIsPushingSheet(false);
                  setSheetMessage({
                    type: res.success ? 'success' : 'error',
                    text: res.message
                  });
                }}
                disabled={isPushingSheet || syncStatus === 'syncing'}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 px-4 text-xs font-bold text-white shadow-lg transition"
              >
                <RefreshCw className={`h-4 w-4 ${isPushingSheet ? 'animate-spin' : ''}`} />
                <span>{isPushingSheet ? 'Sedang Mengirim ke Google Sheet...' : 'Kirim Seluruh Data ke Google Sheet'}</span>
              </button>
            </div>

            <div className="rounded-2xl border border-sky-700/50 bg-gradient-to-br from-sky-950/40 via-slate-900 to-slate-900 p-5 space-y-3 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400">
                  <ArrowDownCircle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">2. Tarik Data dari Spreadsheet ke Aplikasi</h4>
                  <p className="text-xs text-slate-400">Memulihkan data transaksi saat tampilan aplikasi kosong atau setelah ganti perangkat.</p>
                </div>
              </div>
              <button
                onClick={async () => {
                  if (!sheetConfig.webAppUrl) {
                    setSheetMessage({ type: 'error', text: 'Silakan masukkan URL Web App Google Apps Script Anda terlebih dahulu di bawah.' });
                    return;
                  }
                  setIsPullingSheet(true);
                  const res = await pullFromGoogleSheet();
                  setIsPullingSheet(false);
                  setSheetMessage({
                    type: res.success ? 'success' : 'error',
                    text: res.message
                  });
                }}
                disabled={isPullingSheet || syncStatus === 'syncing'}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 py-2.5 px-4 text-xs font-bold text-white shadow-lg transition"
              >
                <Download className={`h-4 w-4 ${isPullingSheet ? 'animate-spin' : ''}`} />
                <span>{isPullingSheet ? 'Sedang Menarik Data dari Google Sheet...' : 'Tarik Data dari Spreadsheet'}</span>
              </button>
            </div>
          </div>

          {/* Konfigurasi URL */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Konfigurasi URL Google Apps Script WebApp</h3>
              </div>
              <span className="rounded-full bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-700">
                Status: {sheetConfig.status}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Google Apps Script Web App URL (Penting):</label>
              <input
                type="text"
                placeholder="https://script.google.com/macros/s/.../exec"
                value={sheetConfig.webAppUrl}
                onChange={e => setSheetConfig({ ...sheetConfig, webAppUrl: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-emerald-300 font-mono focus:border-emerald-500 focus:outline-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Dapatkan URL ini setelah menerapkan (Deploy) kode Google Apps Script di bawah sebagai Web App.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300">Spreadsheet ID (Opsional):</label>
              <input
                type="text"
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                value={sheetConfig.spreadsheetId}
                onChange={e => setSheetConfig({ ...sheetConfig, spreadsheetId: e.target.value })}
                className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 p-2.5 text-xs text-slate-300 font-mono"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Terakhir Sinkronisasi: <strong className="text-white">{sheetConfig.lastSyncedAt || 'Belum pernah'}</strong>
              </span>
              <button
                onClick={async () => {
                  if (!sheetConfig.webAppUrl) {
                    setSheetMessage({ type: 'error', text: 'Masukkan Web App URL terlebih dahulu.' });
                    return;
                  }
                  setIsPushingSheet(true);
                  const res = await pushToGoogleSheet();
                  setIsPushingSheet(false);
                  setSheetMessage({
                    type: res.success ? 'success' : 'error',
                    text: res.message
                  });
                }}
                disabled={isPushingSheet || syncStatus === 'syncing'}
                className="flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-bold text-white border border-slate-700 shadow"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isPushingSheet ? 'animate-spin' : ''}`} />
                <span>Simpan & Tes Koneksi</span>
              </button>
            </div>
          </div>

          {/* PETUNJUK & KODE GOOGLE APPS SCRIPT */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Kode Google Apps Script & Petunjuk Setup 3 Menit</h3>
              </div>
              <button
                onClick={() => {
                  const scriptText = getGoogleAppsScriptCode();
                  navigator.clipboard.writeText(scriptText);
                  setCopiedScript(true);
                  setTimeout(() => setCopiedScript(false), 2500);
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition shadow ${
                  copiedScript
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-600 hover:bg-amber-500 text-white'
                }`}
              >
                {copiedScript ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedScript ? 'Kode Berhasil Disalin!' : 'Salin Seluruh Kode Script'}</span>
              </button>
            </div>

            {/* Langkah-langkah */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">1</span>
                  <h5 className="text-xs font-bold text-white">Buka Apps Script di Sheet</h5>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Buka Google Spreadsheet baru di browser Anda, lalu klik menu <strong className="text-white">Ekstensi (Extensions)</strong> &gt; <strong className="text-white">Apps Script</strong>.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">2</span>
                  <h5 className="text-xs font-bold text-white">Paste Kode & Simpan</h5>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Hapus kode default di editor, klik tombol <strong className="text-amber-300">"Salin Seluruh Kode Script"</strong> di atas, lalu tempelkan (*paste*) kode tersebut dan tekan <strong>Ctrl + S</strong>.
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">3</span>
                  <h5 className="text-xs font-bold text-white">Terapkan (Deploy) Web App</h5>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Klik <strong className="text-white">Deploy &gt; New deployment</strong>. Pilih tipe <strong className="text-white">Web app</strong>, ubah <em>Who has access</em> ke <strong className="text-emerald-400">Anyone (Siapa saja)</strong>, lalu salin Web App URL ke aplikasi ini.
                </p>
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">Code.gs (Google Apps Script)</span>
                <span className="text-[11px] text-slate-500">Mendukung otomatis pembuatan sheet Realisasi_SP2D &amp; Pagu_Anggaran</span>
              </div>
              <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 overflow-x-auto max-h-80 font-mono text-xs text-emerald-300 leading-relaxed">
                <pre>{getGoogleAppsScriptCode()}</pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
          {/* Status Alert Banner */}
          {backupMessage && (
            <div
              className={`flex items-center justify-between rounded-2xl border p-4 text-xs font-semibold ${
                backupMessage.type === 'success'
                  ? 'border-emerald-700/60 bg-emerald-950/60 text-emerald-300'
                  : 'border-rose-700/60 bg-rose-950/60 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {backupMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-rose-400" />
                )}
                <span>{backupMessage.text}</span>
              </div>
              <button
                onClick={() => setBackupMessage(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* Active Data Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow">
              <div className="text-xs text-slate-400">Total Realisasi Aktif</div>
              <div className="text-xl font-bold text-emerald-400 mt-1">
                {realisasiList.length} <span className="text-xs font-normal text-slate-400">transaksi</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex gap-2">
                <span>2025: <strong className="text-white">{realisasiList.filter(r => Number(r.tahun) === 2025).length}</strong></span>
                <span>•</span>
                <span>2026: <strong className="text-white">{realisasiList.filter(r => Number(r.tahun) === 2026).length}</strong></span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow">
              <div className="text-xs text-slate-400">Total Pagu Anggaran</div>
              <div className="text-xl font-bold text-sky-400 mt-1">
                {anggaranList.length} <span className="text-xs font-normal text-slate-400">rekening belanja</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex gap-2">
                <span>2025: <strong className="text-white">{anggaranList.filter(a => Number(a.tahun) === 2025).length}</strong></span>
                <span>•</span>
                <span>2026: <strong className="text-white">{anggaranList.filter(a => Number(a.tahun) === 2026).length}</strong></span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 shadow">
              <div className="text-xs text-slate-400">Status Database Cloud</div>
              <div className="text-xl font-bold text-indigo-400 mt-1 flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${cloudSync.status === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {cloudSync.status === 'connected' ? 'Tersinkron' : 'Menghubungkan'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 truncate">
                Update: {cloudSync.lastSyncedAt ? new Date(cloudSync.lastSyncedAt).toLocaleTimeString('id-ID') : '-'}
              </div>
            </div>
          </div>

          {/* Recovery & Backup Controls */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-emerald-400" />
                  <span>Pemulihan Data (Restore) & Cadangan (Backup)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Gunakan fitur ini untuk memulihkan seluruh data transaksi/anggaran, mengunggah file cadangan JSON, atau menyimpan cadangan baru.
                </p>
              </div>

              {/* Action Buttons Header */}
              <div className="flex flex-wrap items-center gap-2">
                <label className="flex items-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-bold text-white shadow cursor-pointer transition">
                  <Upload className="h-4 w-4" />
                  <span>Pulihkan dari File JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => {
                        const content = ev.target?.result as string;
                        if (content) {
                          const res = importBackupJSON(content);
                          setBackupMessage({
                            type: res.success ? 'success' : 'error',
                            text: res.message
                          });
                        }
                      };
                      reader.readAsText(file);
                      e.target.value = '';
                    }}
                  />
                </label>

                <button
                  onClick={exportBackupJSON}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2 text-xs font-bold text-white shadow transition"
                >
                  <Download className="h-4 w-4" />
                  <span>Unduh Cadangan JSON</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Option 1: Restore Local Snapshot */}
              <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/30 p-5 space-y-3 shadow-inner">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <RefreshCw className="h-4 w-4 text-emerald-400" />
                  <span>1. Pulihkan dari Snapshot Cadangan Lokal</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sistem menyimpan snapshot otomatis setiap kali terjadi impor atau perubahan data. Klik tombol ini untuk memulihkan data jika data di layar sempat nol/hilang.
                </p>
                <button
                  onClick={() => {
                    const res = restoreFromBackup();
                    setBackupMessage({
                      type: res.success ? 'success' : 'error',
                      text: res.message
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Pulihkan Data dari Snapshot Otomatis</span>
                </button>
              </div>

              {/* Option 2: Upload Backup JSON */}
              <div className="rounded-2xl border border-sky-900/60 bg-sky-950/30 p-5 space-y-3 shadow-inner">
                <div className="flex items-center gap-2 text-sky-300 font-bold text-sm">
                  <Upload className="h-4 w-4 text-sky-400" />
                  <span>2. Impor & Pulihkan dari File JSON (.json)</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Punya file cadangan format JSON yang pernah Anda unduh? Klik tombol di bawah untuk memilih file dan memulihkan seluruh data transaksi dan master secara instan.
                </p>
                <label className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg cursor-pointer transition">
                  <Upload className="h-4 w-4" />
                  <span>Pilih & Upload File Backup (.json)</span>
                  <input
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = ev => {
                        const content = ev.target?.result as string;
                        if (content) {
                          const res = importBackupJSON(content);
                          setBackupMessage({
                            type: res.success ? 'success' : 'error',
                            text: res.message
                          });
                        }
                      };
                      reader.readAsText(file);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Additional Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-5">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={async () => {
                    try {
                      await forceSyncCloud();
                      setBackupMessage({
                        type: 'success',
                        text: 'Berhasil mendorong seluruh data lokal saat ini ke Firestore Cloud.'
                      });
                    } catch (e: any) {
                      setBackupMessage({
                        type: 'error',
                        text: `Gagal sinkronisasi cloud: ${e.message}`
                      });
                    }
                  }}
                  className="flex items-center gap-2 rounded-xl border border-indigo-700/50 bg-indigo-950/60 px-4 py-2.5 text-xs font-bold text-indigo-300 hover:bg-indigo-900 transition shadow"
                >
                  <Cloud className="h-4 w-4 text-indigo-400" />
                  <span>Paksa Simpan ke Cloud Database</span>
                </button>
              </div>

              {!isReadonly && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={async () => {
                      if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mengosongkan SELURUH data transaksi (Realisasi & Pagu Anggaran)? Data akan dihapus bersih dari perangkat ini dan juga Firestore Cloud.')) {
                        try {
                          await clearAllDatabase(false);
                          setBackupMessage({
                            type: 'success',
                            text: 'Berhasil mengosongkan seluruh database transaksi (Realisasi & Pagu) secara permanen di lokal dan Cloud.'
                          });
                        } catch (err: any) {
                          setBackupMessage({
                            type: 'error',
                            text: `Gagal mengosongkan database: ${err.message}`
                          });
                        }
                      }
                    }}
                    className="flex items-center gap-2 rounded-xl border border-amber-800/80 bg-amber-950/40 px-4 py-2.5 text-xs font-bold text-amber-300 hover:bg-amber-900/60 hover:text-amber-100 transition shadow"
                  >
                    <Trash2 className="h-4 w-4 text-amber-400" />
                    <span>Kosongkan Transaksi (Realisasi & Pagu)</span>
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data kembali ke setelan pabrik awal? Tindakan ini tidak dapat dibatalkan jika Anda belum mengunduh file cadangan.')) {
                        resetAllData();
                        setBackupMessage({
                          type: 'success',
                          text: 'Seluruh data telah direset ke setelan awal pabrik.'
                        });
                      }
                    }}
                    className="flex items-center gap-2 rounded-xl border border-rose-800/80 bg-rose-950/40 px-4 py-2.5 text-xs font-bold text-rose-400 hover:bg-rose-900/60 hover:text-rose-200 transition shadow"
                  >
                    <Trash2 className="h-4 w-4 text-rose-400" />
                    <span>Reset ke Setelan Pabrik</span>
                  </button>
                </div>
              )}
            </div>
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

// Helper function that returns Google Apps Script code for 2-way sync
function getGoogleAppsScriptCode(): string {
  return `/**
 * ============================================================================
 * GOOGLE APPS SCRIPT - SISTEM INFORMASI KEUANGAN (BFMS NTB)
 * Web App Penghubung Database Google Spreadsheet & Aplikasi Web
 * ============================================================================
 * PETUNJUK PENERAPAN:
 * 1. Buka Google Spreadsheet baru Anda di Google Drive
 * 2. Klik menu 'Extensions' (Ekstensi) > 'Apps Script'
 * 3. Hapus seluruh isi kode bawaan, lalu paste (tempel) kode di bawah ini
 * 4. Klik icon 'Save' (Simpan) atau tekan Ctrl + S
 * 5. Klik tombol biru 'Deploy' (Terapkan) > 'New deployment' (Penerapan baru)
 * 6. Klik ikon roda gigi ⚙️ di sebelah 'Select type' > pilih 'Web app'
 *    - Description: BFMS NTB Sync
 *    - Execute as: Me (email akun Anda)
 *    - Who has access: Anyone (Siapa saja)  <-- PENTING!
 * 7. Klik 'Deploy', izinkan akses (Authorize Access), lalu salin 'Web App URL'
 * 8. Tempelkan URL tersebut ke kolom Pengaturan Google Spreadsheet di Aplikasi
 * ============================================================================
 */

function doGet(e) {
  try {
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'getAll';
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (action === 'ping') {
      return createJsonResponse({ status: 'ok', message: 'Google Apps Script WebApp Aktif & Terhubung', time: new Date().toISOString() });
    }
    
    var realisasiSheet = getOrCreateSheet(ss, 'Realisasi_SP2D');
    var anggaranSheet = getOrCreateSheet(ss, 'Pagu_Anggaran');
    
    var realisasiData = getSheetRowsAsJson(realisasiSheet);
    var anggaranData = getSheetRowsAsJson(anggaranSheet);
    
    return createJsonResponse({
      success: true,
      message: 'Data berhasil ditarik dari Google Spreadsheet',
      timestamp: new Date().toISOString(),
      realisasiCount: realisasiData.length,
      anggaranCount: anggaranData.length,
      realisasiList: realisasiData,
      anggaranList: anggaranData
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err.toString()
    });
  }
}

function doPost(e) {
  try {
    var payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var savedRealisasi = 0;
    var savedAnggaran = 0;
    
    // 1. Simpan Data Realisasi SP2D
    if (payload.realisasiList && Array.isArray(payload.realisasiList)) {
      var sheetRealisasi = getOrCreateSheet(ss, 'Realisasi_SP2D');
      var headers = [
        'ID', 'Tahun', 'Tanggal', 'No_SP2D', 'No_SPM', 
        'Kode_Sub_Kegiatan', 'Kode_Rekening_Belanja', 'Uraian_Belanja', 
        'Nilai_Realisasi_Rp', 'Rekanan_Penerima', 'Status_Validasi', 'Operator'
      ];
      
      sheetRealisasi.clear();
      sheetRealisasi.appendRow(headers);
      formatHeader(sheetRealisasi, '#047857'); // Emerald green
      
      if (payload.realisasiList.length > 0) {
        var rows = payload.realisasiList.map(function(r) {
          return [
            r.id || '',
            r.tahun || '',
            r.tanggal || '',
            r.noSP2D || '',
            r.noSPM || '',
            r.kodeSub || '',
            r.kodeBelanja || '',
            r.uraian || '',
            Number(r.nilai) || 0,
            r.rekanan || '',
            r.statusValidation || 'Disetujui PPK',
            r.operator || ''
          ];
        });
        sheetRealisasi.getRange(2, 1, rows.length, headers.length).setValues(rows);
        sheetRealisasi.getRange(2, 9, rows.length, 1).setNumberFormat('#,##0');
        savedRealisasi = rows.length;
      }
    }
    
    // 2. Simpan Data Pagu Anggaran
    if (payload.anggaranList && Array.isArray(payload.anggaranList)) {
      var sheetAnggaran = getOrCreateSheet(ss, 'Pagu_Anggaran');
      var headersAnggaran = [
        'ID', 'Tahun', 'Kode_Sub_Kegiatan', 'Kode_Rekening_Belanja', 
        'Pagu_Murni_Rp', 'Pagu_Perubahan_Rp', 'Nilai_Pagu_Efektif_Rp', 'Sumber_Dana'
      ];
      
      sheetAnggaran.clear();
      sheetAnggaran.appendRow(headersAnggaran);
      formatHeader(sheetAnggaran, '#0284c7'); // Sky blue
      
      if (payload.anggaranList.length > 0) {
        var rowsAnggaran = payload.anggaranList.map(function(a) {
          return [
            a.id || '',
            a.tahun || '',
            a.kodeSub || '',
            a.kodeBelanja || '',
            Number(a.nilaiMurni) || 0,
            Number(a.nilaiPerubahan) || 0,
            Number(a.nilai) || 0,
            a.sumberDana || 'PAD'
          ];
        });
        sheetAnggaran.getRange(2, 1, rowsAnggaran.length, headersAnggaran.length).setValues(rowsAnggaran);
        sheetAnggaran.getRange(2, 5, rowsAnggaran.length, 3).setNumberFormat('#,##0');
        savedAnggaran = rowsAnggaran.length;
      }
    }
    
    return createJsonResponse({
      success: true,
      message: 'Berhasil menyimpan ' + savedRealisasi + ' data realisasi dan ' + savedAnggaran + ' data anggaran ke Spreadsheet.',
      savedRealisasi: savedRealisasi,
      savedAnggaran: savedAnggaran,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: err.toString()
    });
  }
}

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function formatHeader(sheet, bgColor) {
  var range = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1);
  range.setBackground(bgColor);
  range.setFontColor('#FFFFFF');
  range.setFontWeight('bold');
  range.setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
}

function getSheetRowsAsJson(sheet) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol < 1) return [];
  
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  
  var results = [];
  for (var i = 0; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j].toString().trim();
      obj[key] = row[j];
    }
    
    if (sheet.getName() === 'Realisasi_SP2D') {
      results.push({
        id: String(obj['ID'] || 'R_' + (i + 1)),
        tahun: Number(obj['Tahun']) || new Date().getFullYear(),
        tanggal: obj['Tanggal'] ? (obj['Tanggal'] instanceof Date ? Utilities.formatDate(obj['Tanggal'], Session.getScriptTimeZone(), 'yyyy-MM-dd') : String(obj['Tanggal'])) : '',
        noSP2D: String(obj['No_SP2D'] || ''),
        noSPM: String(obj['No_SPM'] || ''),
        kodeSub: String(obj['Kode_Sub_Kegiatan'] || ''),
        kodeBelanja: String(obj['Kode_Rekening_Belanja'] || ''),
        uraian: String(obj['Uraian_Belanja'] || ''),
        nilai: Number(obj['Nilai_Realisasi_Rp']) || 0,
        rekanan: String(obj['Rekanan_Penerima'] || ''),
        statusValidation: String(obj['Status_Validasi'] || 'Disetujui PPK'),
        operator: String(obj['Operator'] || 'Sistem')
      });
    } else if (sheet.getName() === 'Pagu_Anggaran') {
      results.push({
        id: String(obj['ID'] || 'A_' + (i + 1)),
        tahun: Number(obj['Tahun']) || new Date().getFullYear(),
        kodeSub: String(obj['Kode_Sub_Kegiatan'] || ''),
        kodeBelanja: String(obj['Kode_Rekening_Belanja'] || ''),
        nilaiMurni: Number(obj['Pagu_Murni_Rp']) || 0,
        nilaiPerubahan: Number(obj['Pagu_Perubahan_Rp']) || 0,
        nilai: Number(obj['Nilai_Pagu_Efektif_Rp']) || Number(obj['Pagu_Perubahan_Rp']) || Number(obj['Pagu_Murni_Rp']) || 0,
        sumberDana: String(obj['Sumber_Dana'] || 'PAD')
      });
    }
  }
  return results;
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}`;
}
