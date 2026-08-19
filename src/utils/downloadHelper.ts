import * as XLSX from 'xlsx';

/**
 * Downloads an XLSX workbook safely and displays an interactive fallback modal
 * if the browser or iframe sandbox blocks direct downloads ("Need permission to download").
 */
export function safeDownloadExcel(wb: XLSX.WorkBook, filename: string) {
  const cleanFilename = filename.replace(/[^\w\.\-]/g, '_');
  const sheetName = wb.SheetNames[0] || 'Sheet1';
  const ws = wb.Sheets[sheetName];

  // Try direct download first
  let directDownloadFailed = false;
  try {
    XLSX.writeFile(wb, cleanFilename);
  } catch (err) {
    console.warn('Direct XLSX download failed or blocked by iframe permissions:', err);
    directDownloadFailed = true;
  }

  // Generate helper strings for copy & new tab options
  const tsvContent = XLSX.utils.sheet_to_csv(ws, { FS: '\t' });
  const htmlTableContent = XLSX.utils.sheet_to_html(ws);

  // Remove any existing overlay modal
  const existingModal = document.getElementById('excel-download-modal');
  if (existingModal) {
    existingModal.remove();
  }

  // Create Modal Container
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'excel-download-modal';
  modalOverlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn';

  modalOverlay.innerHTML = `
    <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-slate-100 font-sans space-y-5 relative">
      <!-- Close Button -->
      <button id="btn-close-excel-modal" class="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
        ✕
      </button>

      <!-- Header -->
      <div class="flex items-center gap-3">
        <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xl font-bold">
          📊
        </div>
        <div>
          <h3 class="text-base font-bold text-white">Ekspor Data & Template Excel</h3>
          <p class="text-xs text-slate-400 font-mono mt-0.5">${cleanFilename}</p>
        </div>
      </div>

      <!-- Info Alert for Permission / Sandbox issues -->
      <div class="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-200 leading-relaxed">
        <p class="font-bold flex items-center gap-1.5 text-amber-300">
          ⚠️ Notifikasi Browser / Iframe Permission
        </p>
        <p class="mt-1 text-[11px] text-amber-200/90">
          Jika browser Anda memblokir unduhan dengan pesan <i>"Need permission to download"</i>, gunakan opsi <b>"Salin Data ke Excel"</b> atau <b>"Buka di Tab Baru"</b> di bawah ini.
        </p>
      </div>

      <!-- Action Options -->
      <div class="space-y-2.5">
        <!-- Copy to Clipboard -->
        <button id="btn-copy-excel-data" class="w-full flex items-center justify-between rounded-xl border border-emerald-600/50 bg-emerald-950/60 p-3 text-xs font-bold text-emerald-300 hover:bg-emerald-900/80 transition">
          <span class="flex items-center gap-2">
            📋 <span>Salin Data ke Clipboard</span>
          </span>
          <span class="text-[10px] bg-emerald-800/60 text-emerald-200 px-2 py-0.5 rounded-md">Bisa Paste di Excel (Ctrl+V)</span>
        </button>

        <!-- Open in New Tab -->
        <button id="btn-open-new-tab" class="w-full flex items-center justify-between rounded-xl border border-sky-600/50 bg-sky-950/60 p-3 text-xs font-bold text-sky-300 hover:bg-sky-900/80 transition">
          <span class="flex items-center gap-2">
            🌐 <span>Buka Tabel di Tab Baru</span>
          </span>
          <span class="text-[10px] bg-sky-800/60 text-sky-200 px-2 py-0.5 rounded-md">Bypass Iframe Sandbox</span>
        </button>

        <!-- Direct Download Retry -->
        <button id="btn-retry-download" class="w-full flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 p-3 text-xs font-bold text-slate-200 hover:bg-slate-700 transition">
          <span class="flex items-center gap-2">
            💾 <span>Coba Unduh File (.xlsx)</span>
          </span>
          <span class="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-md">Direct Download</span>
        </button>
      </div>

      <!-- Copy Success Toast Notification -->
      <div id="copy-toast" class="hidden rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-2.5 text-center text-xs font-bold text-emerald-300">
        ✅ Data berhasil disalin! Silakan buka MS Excel atau Google Sheets lalu tekan Ctrl + V.
      </div>

      <!-- Footer / Cancel -->
      <div class="pt-2 flex justify-end">
        <button id="btn-cancel-excel-modal" class="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition">
          Tutup
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  // Attach event handlers
  const btnClose = modalOverlay.querySelector('#btn-close-excel-modal');
  const btnCancel = modalOverlay.querySelector('#btn-cancel-excel-modal');
  const btnCopy = modalOverlay.querySelector('#btn-copy-excel-data');
  const btnOpenTab = modalOverlay.querySelector('#btn-open-new-tab');
  const btnRetry = modalOverlay.querySelector('#btn-retry-download');
  const copyToast = modalOverlay.querySelector('#copy-toast');

  const closeModal = () => modalOverlay.remove();

  btnClose?.addEventListener('click', closeModal);
  btnCancel?.addEventListener('click', closeModal);

  // 1. Copy TSV to clipboard
  btnCopy?.addEventListener('click', () => {
    navigator.clipboard.writeText(tsvContent).then(() => {
      if (copyToast) {
        copyToast.classList.remove('hidden');
        setTimeout(() => {
          copyToast.classList.add('hidden');
        }, 4000);
      }
    }).catch(err => {
      // Fallback text area copy
      const textarea = document.createElement('textarea');
      textarea.value = tsvContent;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      if (copyToast) {
        copyToast.classList.remove('hidden');
        setTimeout(() => {
          copyToast.classList.add('hidden');
        }, 4000);
      }
    });
  });

  // 2. Open HTML Table in New Window / Tab
  btnOpenTab?.addEventListener('click', () => {
    const newWin = window.open('', '_blank');
    if (newWin) {
      newWin.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${cleanFilename}</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; background: #0f172a; color: #f8fafc; }
            h2 { color: #10b981; margin-bottom: 5px; }
            p { color: #94a3b8; font-size: 13px; margin-bottom: 20px; }
            table { border-collapse: collapse; width: 100%; margin-top: 10px; background: #1e293b; border-radius: 8px; overflow: hidden; }
            th { background: #0284c7; color: white; padding: 10px; text-align: left; font-size: 13px; border: 1px solid #334155; }
            td { padding: 8px 10px; font-size: 12px; border: 1px solid #334155; }
            tr:nth-child(even) { background: #0f172a; }
            .btn-print { background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer; margin-bottom: 15px; }
            .btn-print:hover { background: #059669; }
          </style>
        </head>
        <body>
          <h2>📊 Data Ekspor: ${cleanFilename}</h2>
          <p>Silakan gunakan Ctrl+A & Ctrl+C untuk menyalin semua tabel di bawah ini ke Excel/Spreadsheet, atau tekan tombol Cetak / Simpan PDF.</p>
          <button class="btn-print" onclick="window.print()">🖨️ Cetak / Simpan PDF</button>
          ${htmlTableContent}
        </body>
        </html>
      `);
      newWin.document.close();
    } else {
      alert('Pop-up terblokir oleh browser. Izinkan pop-up untuk membuka tab baru.');
    }
  });

  // 3. Retry Direct Download using Blob / Data URI
  btnRetry?.addEventListener('click', () => {
    try {
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const blobUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = cleanFilename;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }, 500);
    } catch (e: any) {
      alert('Browser memblokir unduhan langsung dalam mode preview. Gunakan tombol "Salin Data ke Clipboard" atau "Buka di Tab Baru".');
    }
  });
}
