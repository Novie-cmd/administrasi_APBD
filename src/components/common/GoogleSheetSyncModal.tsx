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
    pullFromGoogleSheet
  } = useApp();

  const [sheetMessage, setSheetMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [showScriptDetails, setShowScriptDetails] = useState(false);

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
                Kirim seluruh <strong>{realisasiList.length}</strong> transaksi & <strong>{anggaranList.length}</strong> pagu anggaran ke Google Sheet.
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
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sky-300 font-bold text-xs">
                <Download className="h-4 w-4" />
                <span>Tarik Data ke Aplikasi</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Tarik kembali seluruh data dari Google Spreadsheet saat data di aplikasi kosong atau setelah ganti laptop/HP.
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
                setIsPulling(true);
                const res = await pullFromGoogleSheet();
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
              <span>{isPulling ? 'Sedang Menarik Data...' : 'Tarik Data dari Spreadsheet'}</span>
            </button>
          </div>
        </div>

        {/* Input Web App URL */}
        <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 space-y-2">
          <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span>Google Apps Script Web App URL:</span>
            <span className="text-[11px] text-slate-400 font-normal">
              Terakhir Sync: {sheetConfig.lastSyncedAt || 'Belum pernah'}
            </span>
          </label>
          <input
            type="text"
            placeholder="https://script.google.com/macros/s/.../exec"
            value={sheetConfig.webAppUrl}
            onChange={e => setSheetConfig({ ...sheetConfig, webAppUrl: e.target.value })}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-emerald-300 font-mono focus:border-emerald-500 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400">
            Dapatkan URL ini dari menu <strong>Deploy &gt; New deployment &gt; Web app (Anyone)</strong> di Google Spreadsheet Anda.
          </p>
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
function getGoogleAppsScriptCode(): string {
  return `function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var realisasiSheet = getOrCreateSheet(ss, 'Realisasi_SP2D');
    var anggaranSheet = getOrCreateSheet(ss, 'Pagu_Anggaran');
    
    var realisasiData = getSheetRowsAsJson(realisasiSheet);
    var anggaranData = getSheetRowsAsJson(anggaranSheet);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data berhasil ditarik dari Google Spreadsheet',
      timestamp: new Date().toISOString(),
      realisasiCount: realisasiData.length,
      anggaranCount: anggaranData.length,
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
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var savedR = 0, savedA = 0;
    
    if (payload.realisasiList && Array.isArray(payload.realisasiList)) {
      var sheetR = getOrCreateSheet(ss, 'Realisasi_SP2D');
      var headersR = ['ID', 'Tahun', 'Tanggal', 'No_SP2D', 'No_SPM', 'Kode_Sub_Kegiatan', 'Kode_Rekening_Belanja', 'Uraian_Belanja', 'Nilai_Realisasi_Rp', 'Rekanan_Penerima', 'Status_Validasi', 'Operator'];
      sheetR.clear();
      sheetR.appendRow(headersR);
      formatHeader(sheetR, '#047857');
      if (payload.realisasiList.length > 0) {
        var rows = payload.realisasiList.map(function(r) {
          return [r.id||'', r.tahun||'', r.tanggal||'', r.noSP2D||'', r.noSPM||'', r.kodeSub||'', r.kodeBelanja||'', r.uraian||'', Number(r.nilai)||0, r.rekanan||'', r.statusValidation||'Disetujui PPK', r.operator||''];
        });
        sheetR.getRange(2, 1, rows.length, headersR.length).setValues(rows);
        sheetR.getRange(2, 9, rows.length, 1).setNumberFormat('#,##0');
        savedR = rows.length;
      }
    }
    
    if (payload.anggaranList && Array.isArray(payload.anggaranList)) {
      var sheetA = getOrCreateSheet(ss, 'Pagu_Anggaran');
      var headersA = ['ID', 'Tahun', 'Kode_Sub_Kegiatan', 'Kode_Rekening_Belanja', 'Pagu_Murni_Rp', 'Pagu_Perubahan_Rp', 'Nilai_Pagu_Efektif_Rp', 'Sumber_Dana'];
      sheetA.clear();
      sheetA.appendRow(headersA);
      formatHeader(sheetA, '#0284c7');
      if (payload.anggaranList.length > 0) {
        var rowsA = payload.anggaranList.map(function(a) {
          return [a.id||'', a.tahun||'', a.kodeSub||'', a.kodeBelanja||'', Number(a.pagu||0), Number(a.revisi||0), Number(a.paguAkhir||0), a.sumberDana||'PAD'];
        });
        sheetA.getRange(2, 1, rowsA.length, headersA.length).setValues(rowsA);
        sheetA.getRange(2, 5, rowsA.length, 3).setNumberFormat('#,##0');
        savedA = rowsA.length;
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Berhasil menyimpan ' + savedR + ' realisasi & ' + savedA + ' anggaran.',
      savedRealisasi: savedR,
      savedAnggaran: savedA
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
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
  return data.map(function(row) {
    var obj = {};
    headers.forEach(function(h, idx) { obj[h.toString().trim()] = row[idx]; });
    if (sheet.getName() === 'Realisasi_SP2D') {
      return {
        id: String(obj['ID'] || ''),
        tahun: Number(obj['Tahun']) || new Date().getFullYear(),
        tanggal: String(obj['Tanggal'] || ''),
        noSP2D: String(obj['No_SP2D'] || ''),
        noSPM: String(obj['No_SPM'] || ''),
        kodeSub: String(obj['Kode_Sub_Kegiatan'] || ''),
        kodeBelanja: String(obj['Kode_Rekening_Belanja'] || ''),
        uraian: String(obj['Uraian_Belanja'] || ''),
        nilai: Number(obj['Nilai_Realisasi_Rp']) || 0,
        rekanan: String(obj['Rekanan_Penerima'] || ''),
        statusValidation: String(obj['Status_Validasi'] || 'Disetujui PPK'),
        operator: String(obj['Operator'] || 'Sistem')
      };
    } else {
      return {
        id: String(obj['ID'] || ''),
        tahun: Number(obj['Tahun']) || new Date().getFullYear(),
        kodeSub: String(obj['Kode_Sub_Kegiatan'] || ''),
        kodeBelanja: String(obj['Kode_Rekening_Belanja'] || ''),
        pagu: Number(obj['Pagu_Murni_Rp']) || 0,
        revisi: Number(obj['Pagu_Perubahan_Rp']) || 0,
        paguAkhir: Number(obj['Nilai_Pagu_Efektif_Rp']) || Number(obj['Pagu_Murni_Rp']) || 0,
        sumberDana: String(obj['Sumber_Dana'] || 'PAD')
      };
    }
  });
}`;
}
