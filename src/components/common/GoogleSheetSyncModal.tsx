import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileSpreadsheet,
  Upload,
  Download,
  Check,
  Copy,
  Code,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Trash2,
  X
} from 'lucide-react';

interface GoogleSheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleSheetSyncModal: React.FC<GoogleSheetSyncModalProps> = ({ isOpen, onClose }) => {
  const {
    sheetConfig,
    setSheetConfig,
    realisasiList,
    anggaranList,
    syncStatus,
    pushToGoogleSheet,
    pullFromGoogleSheet,
    clearGoogleSheetData
  } = useApp();

  const [sheetMessage, setSheetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [showScriptDetails, setShowScriptDetails] = useState(false);
  const [syncMode, setSyncMode] = useState<'replace' | 'merge'>('replace');

  if (!isOpen) return null;

  const scriptCode = getGoogleAppsScriptCode();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-emerald-500/40 bg-slate-900 p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Sinkronisasi Google Spreadsheet</h3>
              <p className="text-xs text-slate-400">Simpan otomatis atau tarik data transaksi keuangan kapan saja</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Message Alert */}
        {sheetMessage && (
          <div
            className={`flex items-start justify-between rounded-xl border p-3.5 text-xs font-semibold ${
              sheetMessage.type === 'success'
                ? 'border-emerald-700 bg-emerald-950/70 text-emerald-300'
                : 'border-rose-700 bg-rose-950/70 text-rose-300'
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
            <button onClick={() => setSheetMessage(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* 2 Primary Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Push Card */}
          <div className="rounded-xl border border-emerald-700/60 bg-emerald-950/30 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <Upload className="h-4 w-4" />
                <span>Simpan ke Spreadsheet</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Kirim seluruh <strong>{realisasiList.length}</strong> transaksi, <strong>{anggaranList.length}</strong> pagu, serta 4 Master Sheet (Program, Kegiatan, Sub Kegiatan, Rekening Belanja) ke Google Sheet.
              </p>
            </div>
            <button
              onClick={async () => {
                if (!sheetConfig.webAppUrl) {
                  setSheetMessage({
                    type: 'error',
                    text: 'Silakan isi URL Web App Google Apps Script Anda terlebih dahulu di bawah.'
                  });
                  return;
                }
                setIsPushing(true);
                const res = await pushToGoogleSheet();
                setIsPushing(false);
                setSheetMessage({
                  type: res.success ? 'success' : 'error',
                  text: res.message
                });
              }}
              disabled={isPushing || syncStatus === 'syncing'}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 px-3 text-xs font-bold text-white shadow-lg transition"
            >
              <RefreshCw className={`h-4 w-4 ${isPushing ? 'animate-spin' : ''}`} />
              <span>{isPushing ? 'Sedang Mengirim...' : 'Kirim Seluruh Data ke Google Sheet'}</span>
            </button>
          </div>

          {/* Pull Card */}
          <div className="rounded-xl border border-sky-700/60 bg-sky-950/30 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-sky-300 font-bold text-xs">
                <Download className="h-4 w-4" />
                <span>Tarik Data ke Aplikasi</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Sinkronkan data di aplikasi dengan isi Google Spreadsheet terkini.
              </p>
              
              {/* Sync Mode Selector */}
              <div className="pt-1">
                <label className="text-[10px] font-bold text-sky-200 block mb-1">Mode Tarik Data:</label>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-slate-700 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setSyncMode('replace')}
                    className={`py-1 px-1.5 rounded font-bold text-center transition ${
                      syncMode === 'replace'
                        ? 'bg-sky-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Timpa Penuh (Sesuai Sheet)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSyncMode('merge')}
                    className={`py-1 px-1.5 rounded font-bold text-center transition ${
                      syncMode === 'merge'
                        ? 'bg-sky-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Gabungkan Saja
                  </button>
                </div>
                <p className="text-[9.5px] text-slate-400 mt-1">
                  {syncMode === 'replace' 
                    ? '✓ Data yang dihapus di aplikasi/sheet tidak akan muncul kembali.' 
                    : 'Menggabungkan data sheet tanpa menghapus data lokal.'}
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                if (!sheetConfig.webAppUrl) {
                  setSheetMessage({
                    type: 'error',
                    text: 'Silakan isi URL Web App Google Apps Script Anda terlebih dahulu di bawah.'
                  });
                  return;
                }
                setIsPulling(true);
                const res = await pullFromGoogleSheet(undefined, syncMode);
                setIsPulling(false);
                setSheetMessage({
                  type: res.success ? 'success' : 'error',
                  text: res.message
                });
              }}
              disabled={isPulling || syncStatus === 'syncing'}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-500 py-2.5 px-3 text-xs font-bold text-white shadow-lg transition"
            >
              <Download className={`h-4 w-4 ${isPulling ? 'animate-spin' : ''}`} />
              <span>{isPulling ? 'Sedang Menarik Data...' : 'Tarik & Sinkronkan Data'}</span>
            </button>
          </div>
        </div>

        {/* Zona Pengosongan Spreadsheet */}
        <div className="rounded-xl border border-rose-900/60 bg-rose-950/20 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-rose-300 font-bold text-xs">
              <Trash2 className="h-4 w-4 text-rose-400 shrink-0" />
              <span>Kosongkan Seluruh Data di Google Spreadsheet</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Menghapus seluruh baris data di sheet <code className="text-emerald-400">Realisasi_SP2D</code> &amp; <code className="text-sky-400">Pagu_Anggaran</code> sehingga spreadsheet bersih (hanya menyisakan header).
            </p>
          </div>
          <button
            type="button"
            onClick={async () => {
              if (!sheetConfig.webAppUrl) {
                setSheetMessage({
                  type: 'error',
                  text: 'URL Web App Google Apps Script belum diisi.'
                });
                return;
              }
              if (window.confirm('PERINGATAN: Apakah Anda yakin ingin mengosongkan SELURUH baris data di Google Spreadsheet? Tabel Realisasi dan Pagu Anggaran di spreadsheet akan dikosongkan bersih.')) {
                setIsClearing(true);
                const res = await clearGoogleSheetData();
                setIsClearing(false);
                setSheetMessage({
                  type: res.success ? 'success' : 'error',
                  text: res.message
                });
              }
            }}
            disabled={isClearing || isPushing || isPulling || syncStatus === 'syncing'}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-800 bg-rose-950/80 hover:bg-rose-900 px-3.5 py-2 text-xs font-bold text-rose-200 hover:text-white transition shadow shrink-0"
          >
            <Trash2 className={`h-3.5 w-3.5 ${isClearing ? 'animate-spin' : ''}`} />
            <span>{isClearing ? 'Mengosongkan Sheet...' : 'Kosongkan Spreadsheet'}</span>
          </button>
        </div>

        {/* Input Web App URL & Spreadsheet ID */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300">Google Apps Script Web App URL (Aktif):</label>
            <button
              type="button"
              onClick={() => {
                setSheetConfig({
                  ...sheetConfig,
                  webAppUrl: 'https://script.google.com/macros/s/AKfycbxt-sWb1tWsnBmUXaflIgBArl_KIqPnEBUJBxbr-XRhbeTmvRfbuce5QWaz1fsQ4Nw9LQ/exec',
                  spreadsheetId: '1q-ZorXYniIzVy2h6b-WJVGvGanqqn6SBNlhu_upN-DY',
                  status: 'Connected'
                });
                setSheetMessage({
                  type: 'success',
                  text: 'URL WebApp dan Spreadsheet ID resmi berhasil ditetapkan!'
                });
              }}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold"
            >
              Gunakan URL &amp; ID Resmi
            </button>
          </div>
          <input
            type="text"
            placeholder="https://script.google.com/macros/s/AKfycbxt-sWb1tWsnBmUXaflIgBArl_KIqPnEBUJBxbr-XRhbeTmvRfbuce5QWaz1fsQ4Nw9LQ/exec"
            value={sheetConfig.webAppUrl}
            onChange={e => setSheetConfig({ ...sheetConfig, webAppUrl: e.target.value })}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-emerald-300 font-mono focus:border-emerald-500 focus:outline-none"
          />

          <div className="pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300">Spreadsheet ID:</label>
              {sheetConfig.spreadsheetId && (
                <a
                  href={`https://docs.google.com/spreadsheets/d/${sheetConfig.spreadsheetId}/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline font-medium"
                >
                  <span>Buka Spreadsheet ↗</span>
                </a>
              )}
            </div>
            <input
              type="text"
              placeholder="1q-ZorXYniIzVy2h6b-WJVGvGanqqn6SBNlhu_upN-DY"
              value={sheetConfig.spreadsheetId}
              onChange={e => setSheetConfig({ ...sheetConfig, spreadsheetId: e.target.value })}
              className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-slate-300 font-mono focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Terakhir Sync: <strong className="text-white">{sheetConfig.lastSyncedAt || 'Belum pernah'}</strong></span>
            <span>Status: <span className="text-emerald-400 font-bold">{sheetConfig.status || 'Connected'}</span></span>
          </div>
        </div>

        {/* Script Code Collapsible */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Code className="h-4 w-4" />
              <span>Kode Google Apps Script (Code.gs)</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(scriptCode);
                  setCopiedScript(true);
                  setTimeout(() => setCopiedScript(false), 2500);
                }}
                className="flex items-center gap-1 rounded-lg bg-amber-600 hover:bg-amber-500 px-3 py-1 text-xs font-bold text-white transition"
              >
                {copiedScript ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedScript ? 'Tersalin!' : 'Salin Kode'}</span>
              </button>
              <button
                onClick={() => setShowScriptDetails(!showScriptDetails)}
                className="text-xs text-slate-400 hover:text-white underline"
              >
                {showScriptDetails ? 'Sembunyikan' : 'Lihat Kode'}
              </button>
            </div>
          </div>

          {showScriptDetails && (
            <div className="relative rounded-lg border border-slate-800 bg-slate-900 p-3 overflow-x-auto max-h-48 font-mono text-[11px] text-emerald-300">
              <pre>{scriptCode}</pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="rounded-xl bg-slate-800 hover:bg-slate-700 px-5 py-2 text-xs font-bold text-white transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// Return script code
export function getGoogleAppsScriptCode(): string {
  return `var DEFAULT_SPREADSHEET_ID = '1q-ZorXYniIzVy2h6b-WJVGvGanqqn6SBNlhu_upN-DY';

function getTargetSpreadsheet(explicitId) {
  var id = explicitId || DEFAULT_SPREADSHEET_ID;
  if (id) {
    try {
      return SpreadsheetApp.openById(id);
    } catch(err) {}
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function findSheetByNames(ss, names) {
  for (var i = 0; i < names.length; i++) {
    var s = ss.getSheetByName(names[i]);
    if (s) return s;
  }
  return null;
}

function doGet(e) {
  try {
    var sheetId = (e && e.parameter && e.parameter.spreadsheetId) ? e.parameter.spreadsheetId : DEFAULT_SPREADSHEET_ID;
    var ss = getTargetSpreadsheet(sheetId);

    var programSheet = findSheetByNames(ss, ['Master_Program', 'Program']);
    var kegiatanSheet = findSheetByNames(ss, ['Master_Kegiatan', 'Kegiatan']);
    var subKegiatanSheet = findSheetByNames(ss, ['Master_Sub_Kegiatan', 'Sub_Kegiatan', 'SubKegiatan']);
    var belanjaSheet = findSheetByNames(ss, ['Master_Rekening_Belanja', 'Rekening_Belanja', 'Rekening', 'Belanja']);
    var realisasiSheet = findSheetByNames(ss, ['Realisasi_SP2D', 'Realisasi']);
    var anggaranSheet = findSheetByNames(ss, ['Pagu_Anggaran', 'Anggaran']);

    var programData = programSheet ? getSheetRowsAsJson(programSheet) : [];
    var kegiatanData = kegiatanSheet ? getSheetRowsAsJson(kegiatanSheet) : [];
    var subKegiatanData = subKegiatanSheet ? getSheetRowsAsJson(subKegiatanSheet) : [];
    var belanjaData = belanjaSheet ? getSheetRowsAsJson(belanjaSheet) : [];
    var realisasiData = realisasiSheet ? getSheetRowsAsJson(realisasiSheet) : [];
    var anggaranData = anggaranSheet ? getSheetRowsAsJson(anggaranSheet) : [];

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data berhasil ditarik dari Google Spreadsheet',
      timestamp: new Date().toISOString(),
      programCount: programData.length,
      kegiatanCount: kegiatanData.length,
      subKegiatanCount: subKegiatanData.length,
      belanjaCount: belanjaData.length,
      realisasiCount: realisasiData.length,
      anggaranCount: anggaranData.length,
      programList: programData,
      kegiatanList: kegiatanData,
      subKegiatanList: subKegiatanData,
      belanjaList: belanjaData,
      realisasiList: realisasiData,
      anggaranList: anggaranData
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents || '{}');
    var sheetId = payload.spreadsheetId || DEFAULT_SPREADSHEET_ID;
    var ss = getTargetSpreadsheet(sheetId);
    var savedR = 0, savedA = 0, savedP = 0, savedK = 0, savedS = 0, savedB = 0;

    // 1. Dukungan Aksi Kosongkan Data Transaksi Bersih (clearAll / clearDatabase)
    if (payload.action === 'clearAll' || payload.action === 'clearDatabase') {
      var sheetRClear = getOrCreateSheet(ss, 'Realisasi_SP2D');
      var headersRClear = ['ID', 'Tahun', 'Tanggal', 'No_SP2D', 'No_SPM', 'Kode_Program', 'Kode_Kegiatan', 'Kode_Sub_Kegiatan', 'Nama_Sub_Kegiatan', 'Kode_Rekening_Belanja', 'Nama_Rekening_Belanja', 'Uraian_Belanja', 'Nilai_Realisasi_Rp', 'Rekanan_Penerima', 'Status_Validasi', 'Operator'];
      sheetRClear.clear();
      sheetRClear.appendRow(headersRClear);
      formatHeader(sheetRClear, '#047857');

      var sheetAClear = getOrCreateSheet(ss, 'Pagu_Anggaran');
      var headersAClear = ['ID', 'Tahun', 'Kode_Program', 'Kode_Kegiatan', 'Kode_Sub_Kegiatan', 'Nama_Sub_Kegiatan', 'Kode_Rekening_Belanja', 'Nama_Rekening_Belanja', 'Pagu_Murni_Rp', 'Pagu_Perubahan_Rp', 'Nilai_Pagu_Efektif_Rp', 'Sumber_Dana'];
      sheetAClear.clear();
      sheetAClear.appendRow(headersAClear);
      formatHeader(sheetAClear, '#0284c7');

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Seluruh data transaksi di Google Spreadsheet berhasil dikosongkan bersih (Master tetap dipertahankan).',
        savedRealisasi: 0,
        savedAnggaran: 0,
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Simpan Master Program
    if (payload.programList && Array.isArray(payload.programList)) {
      var sheetProg = getOrCreateSheet(ss, 'Master_Program');
      var headersProg = ['Kode_Program', 'Nama_Program', 'Tahun'];
      sheetProg.clear();
      sheetProg.appendRow(headersProg);
      formatHeader(sheetProg, '#1e40af'); // Blue
      if (payload.programList.length > 0) {
        var rowsProg = payload.programList.map(function(p) {
          return [p.kodeProgram || '', p.namaProgram || '', p.tahun || ''];
        });
        ensureRows(sheetProg, rowsProg.length);
        sheetProg.getRange(2, 1, rowsProg.length, headersProg.length).setValues(rowsProg);
        savedP = rowsProg.length;
      }
    }

    // 3. Simpan Master Kegiatan
    if (payload.kegiatanList && Array.isArray(payload.kegiatanList)) {
      var sheetKeg = getOrCreateSheet(ss, 'Master_Kegiatan');
      var headersKeg = ['Kode_Program', 'Kode_Kegiatan', 'Nama_Kegiatan', 'Tahun'];
      sheetKeg.clear();
      sheetKeg.appendRow(headersKeg);
      formatHeader(sheetKeg, '#4338ca'); // Indigo
      if (payload.kegiatanList.length > 0) {
        var rowsKeg = payload.kegiatanList.map(function(k) {
          return [k.kodeProgram || '', k.kodeKegiatan || '', k.namaKegiatan || '', k.tahun || ''];
        });
        ensureRows(sheetKeg, rowsKeg.length);
        sheetKeg.getRange(2, 1, rowsKeg.length, headersKeg.length).setValues(rowsKeg);
        savedK = rowsKeg.length;
      }
    }

    // 4. Simpan Master Sub Kegiatan
    if (payload.subKegiatanList && Array.isArray(payload.subKegiatanList)) {
      var sheetSub = getOrCreateSheet(ss, 'Master_Sub_Kegiatan');
      var headersSub = ['Kode_Program', 'Kode_Kegiatan', 'Kode_Sub_Kegiatan', 'Nama_Sub_Kegiatan', 'Tahun'];
      sheetSub.clear();
      sheetSub.appendRow(headersSub);
      formatHeader(sheetSub, '#0369a1'); // Sky/Cyan
      if (payload.subKegiatanList.length > 0) {
        var rowsSub = payload.subKegiatanList.map(function(s) {
          return [s.kodeProgram || '', s.kodeKegiatan || '', s.kodeSub || '', s.namaSub || '', s.tahun || ''];
        });
        ensureRows(sheetSub, rowsSub.length);
        sheetSub.getRange(2, 1, rowsSub.length, headersSub.length).setValues(rowsSub);
        savedS = rowsSub.length;
      }
    }

    // 5. Simpan Master Rekening Belanja
    if (payload.belanjaList && Array.isArray(payload.belanjaList)) {
      var sheetBel = getOrCreateSheet(ss, 'Master_Rekening_Belanja');
      var headersBel = ['Kode_Rekening_Belanja', 'Nama_Rekening_Belanja', 'Jenis_Belanja', 'Tahun'];
      sheetBel.clear();
      sheetBel.appendRow(headersBel);
      formatHeader(sheetBel, '#6d28d9'); // Purple
      if (payload.belanjaList.length > 0) {
        var rowsBel = payload.belanjaList.map(function(b) {
          return [b.kodeBelanja || '', b.namaBelanja || '', b.jenisBelanja || 'Belanja Barang dan Jasa', b.tahun || ''];
        });
        ensureRows(sheetBel, rowsBel.length);
        sheetBel.getRange(2, 1, rowsBel.length, headersBel.length).setValues(rowsBel);
        savedB = rowsBel.length;
      }
    }

    // 6. Simpan Data Realisasi SP2D
    if (payload.realisasiList && Array.isArray(payload.realisasiList)) {
      var sheetR = getOrCreateSheet(ss, 'Realisasi_SP2D');
      var headersR = ['ID', 'Tahun', 'Tanggal', 'No_SP2D', 'No_SPM', 'Kode_Program', 'Kode_Kegiatan', 'Kode_Sub_Kegiatan', 'Nama_Sub_Kegiatan', 'Kode_Rekening_Belanja', 'Nama_Rekening_Belanja', 'Uraian_Belanja', 'Nilai_Realisasi_Rp', 'Rekanan_Penerima', 'Status_Validasi', 'Operator'];
      sheetR.clear();
      sheetR.appendRow(headersR);
      formatHeader(sheetR, '#047857'); // Emerald green
      if (payload.realisasiList.length > 0) {
        var rowsR = payload.realisasiList.map(function(r) {
          return [
            r.id || '',
            r.tahun || '',
            r.tanggal || '',
            r.noSP2D || '',
            r.noSPM || '',
            r.kodeProgram || '',
            r.kodeKegiatan || '',
            r.kodeSub || '',
            r.namaSub || '',
            r.kodeBelanja || '',
            r.namaBelanja || '',
            r.uraian || '',
            Number(r.nilai) || 0,
            r.rekanan || '',
            r.statusValidation || 'Disetujui PPK',
            r.operator || ''
          ];
        });
        ensureRows(sheetR, rowsR.length);
        sheetR.getRange(2, 1, rowsR.length, headersR.length).setValues(rowsR);
        sheetR.getRange(2, 13, rowsR.length, 1).setNumberFormat('#,##0');
        savedR = rowsR.length;
      }
    }

    // 7. Simpan Data Pagu Anggaran
    if (payload.anggaranList && Array.isArray(payload.anggaranList)) {
      var sheetA = getOrCreateSheet(ss, 'Pagu_Anggaran');
      var headersA = ['ID', 'Tahun', 'Kode_Program', 'Kode_Kegiatan', 'Kode_Sub_Kegiatan', 'Nama_Sub_Kegiatan', 'Kode_Rekening_Belanja', 'Nama_Rekening_Belanja', 'Pagu_Murni_Rp', 'Pagu_Perubahan_Rp', 'Nilai_Pagu_Efektif_Rp', 'Sumber_Dana'];
      sheetA.clear();
      sheetA.appendRow(headersA);
      formatHeader(sheetA, '#0284c7'); // Sky blue
      if (payload.anggaranList.length > 0) {
        var rowsA = payload.anggaranList.map(function(a) {
          var paguMurni = Number(a.pagu || a.nilaiMurni || a.nilai || 0);
          var revisi = Number(a.revisi || a.nilaiPerubahan || 0);
          var paguAkhir = Number(a.paguAkhir || a.nilai || (paguMurni + revisi));
          return [
            a.id || '',
            a.tahun || '',
            a.kodeProgram || '',
            a.kodeKegiatan || '',
            a.kodeSub || '',
            a.namaSub || '',
            a.kodeBelanja || '',
            a.namaBelanja || '',
            paguMurni,
            revisi,
            paguAkhir,
            a.sumberDana || 'PAD'
          ];
        });
        ensureRows(sheetA, rowsA.length);
        sheetA.getRange(2, 1, rowsA.length, headersA.length).setValues(rowsA);
        sheetA.getRange(2, 9, rowsA.length, 3).setNumberFormat('#,##0');
        savedA = rowsA.length;
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Berhasil menyimpan ' + savedR + ' realisasi, ' + savedA + ' anggaran, ' + savedP + ' program, ' + savedK + ' kegiatan, ' + savedS + ' sub kegiatan, ' + savedB + ' rekening.',
      savedRealisasi: savedR,
      savedAnggaran: savedA,
      savedProgram: savedP,
      savedKegiatan: savedK,
      savedSubKegiatan: savedS,
      savedBelanja: savedB,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function ensureRows(sheet, neededCount) {
  var curMax = sheet.getMaxRows();
  if (curMax < neededCount + 5) {
    sheet.insertRowsAfter(curMax, neededCount + 5 - curMax);
  }
}

function getOrCreateSheet(ss, name) {
  var s = ss.getSheetByName(name);
  return s ? s : ss.insertSheet(name);
}

function formatHeader(sheet, bg) {
  var r = sheet.getRange(1, 1, 1, sheet.getLastColumn() || 1);
  r.setBackground(bg).setFontColor('#FFF').setFontWeight('bold').setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
}

function getSheetRowsAsJson(sheet) {
  var lastRow = sheet.getLastRow(), lastCol = sheet.getLastColumn();
  if (lastRow <= 1 || lastCol < 1) return [];
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var data = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
  var sheetName = sheet.getName().toLowerCase();

  return data.map(function(row) {
    var obj = {};
    headers.forEach(function(h, idx) {
      if (h) obj[h.toString().trim()] = row[idx];
    });

    if (sheetName.indexOf('program') !== -1 && sheetName.indexOf('sub') === -1) {
      return {
        kodeProgram: String(obj['Kode_Program'] || obj['kodeProgram'] || ''),
        namaProgram: String(obj['Nama_Program'] || obj['namaProgram'] || ''),
        tahun: Number(obj['Tahun'] || obj['tahun']) || new Date().getFullYear()
      };
    } else if (sheetName.indexOf('kegiatan') !== -1 && sheetName.indexOf('sub') === -1) {
      return {
        kodeProgram: String(obj['Kode_Program'] || obj['kodeProgram'] || ''),
        kodeKegiatan: String(obj['Kode_Kegiatan'] || obj['kodeKegiatan'] || ''),
        namaKegiatan: String(obj['Nama_Kegiatan'] || obj['namaKegiatan'] || ''),
        tahun: Number(obj['Tahun'] || obj['tahun']) || new Date().getFullYear()
      };
    } else if (sheetName.indexOf('sub') !== -1) {
      return {
        kodeProgram: String(obj['Kode_Program'] || obj['kodeProgram'] || ''),
        kodeKegiatan: String(obj['Kode_Kegiatan'] || obj['kodeKegiatan'] || ''),
        kodeSub: String(obj['Kode_Sub_Kegiatan'] || obj['Kode_Sub'] || obj['kodeSub'] || ''),
        namaSub: String(obj['Nama_Sub_Kegiatan'] || obj['Nama_Sub'] || obj['namaSub'] || ''),
        tahun: Number(obj['Tahun'] || obj['tahun']) || new Date().getFullYear()
      };
    } else if (sheetName.indexOf('rekening') !== -1 || sheetName.indexOf('belanja') !== -1) {
      return {
        kodeBelanja: String(obj['Kode_Rekening_Belanja'] || obj['Kode_Rekening'] || obj['Kode_Belanja'] || obj['kodeBelanja'] || ''),
        namaBelanja: String(obj['Nama_Rekening_Belanja'] || obj['Nama_Rekening'] || obj['Nama_Belanja'] || obj['namaBelanja'] || ''),
        jenisBelanja: String(obj['Jenis_Belanja'] || obj['jenisBelanja'] || 'Belanja Barang dan Jasa'),
        tahun: Number(obj['Tahun'] || obj['tahun']) || new Date().getFullYear()
      };
    } else if (sheetName.indexOf('realisasi') !== -1) {
      return {
        id: String(obj['ID'] || ''),
        tahun: Number(obj['Tahun']) || new Date().getFullYear(),
        tanggal: String(obj['Tanggal'] || ''),
        noSP2D: String(obj['No_SP2D'] || ''),
        noSPM: String(obj['No_SPM'] || ''),
        kodeProgram: String(obj['Kode_Program'] || ''),
        kodeKegiatan: String(obj['Kode_Kegiatan'] || ''),
        kodeSub: String(obj['Kode_Sub_Kegiatan'] || obj['Kode_Sub'] || ''),
        namaSub: String(obj['Nama_Sub_Kegiatan'] || obj['Nama_Sub'] || ''),
        kodeBelanja: String(obj['Kode_Rekening_Belanja'] || obj['Kode_Belanja'] || ''),
        namaBelanja: String(obj['Nama_Rekening_Belanja'] || obj['Nama_Belanja'] || ''),
        uraian: String(obj['Uraian_Belanja'] || obj['Uraian'] || ''),
        nilai: Number(obj['Nilai_Realisasi_Rp'] || obj['Nilai']) || 0,
        rekanan: String(obj['Rekanan_Penerima'] || obj['Rekanan'] || ''),
        statusValidation: String(obj['Status_Validasi'] || 'Disetujui PPK'),
        operator: String(obj['Operator'] || 'Sistem')
      };
    } else {
      var paguMurni = Number(obj['Pagu_Murni_Rp']) || Number(obj['Pagu_Murni']) || 0;
      var revisi = Number(obj['Pagu_Perubahan_Rp']) || Number(obj['Pagu_Perubahan']) || 0;
      var paguAkhir = Number(obj['Nilai_Pagu_Efektif_Rp']) || Number(obj['Pagu_Akhir']) || (paguMurni + revisi);
      return {
        id: String(obj['ID'] || ''),
        tahun: Number(obj['Tahun']) || new Date().getFullYear(),
        kodeProgram: String(obj['Kode_Program'] || ''),
        kodeKegiatan: String(obj['Kode_Kegiatan'] || ''),
        kodeSub: String(obj['Kode_Sub_Kegiatan'] || obj['Kode_Sub'] || ''),
        namaSub: String(obj['Nama_Sub_Kegiatan'] || obj['Nama_Sub'] || ''),
        kodeBelanja: String(obj['Kode_Rekening_Belanja'] || obj['Kode_Belanja'] || ''),
        namaBelanja: String(obj['Nama_Rekening_Belanja'] || obj['Nama_Belanja'] || ''),
        pagu: paguMurni,
        revisi: revisi,
        paguAkhir: paguAkhir,
        nilaiMurni: paguMurni,
        nilaiPerubahan: revisi,
        nilai: paguAkhir,
        sumberDana: String(obj['Sumber_Dana'] || 'PAD')
      };
    }
  });
}
`;
}
