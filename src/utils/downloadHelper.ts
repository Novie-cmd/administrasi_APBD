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

  // Create Modal Container with Clean Government terang styling
  const modalOverlay = document.createElement('div');
  modalOverlay.id = 'excel-download-modal';
  modalOverlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-[#17324D]/40 backdrop-blur-xs p-4 animate-fadeIn';

  modalOverlay.innerHTML = `
    <div class="w-full max-w-lg rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-6 shadow-xl text-[#17324D] font-sans space-y-5 relative">
      <!-- Close Button -->
      <button id="btn-close-excel-modal" class="absolute top-4 right-4 text-[#64748B] hover:text-[#17324D] p-1.5 rounded-lg hover:bg-[#F4F7FB] transition cursor-pointer">
        ✕
      </button>

      <!-- Header -->
      <div class="flex items-center gap-3">
        <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-[#079669] border border-emerald-200 text-xl font-bold">
          📊
        </div>
        <div>
          <h3 class="text-base font-bold text-[#17324D]">Ekspor Data & Template Excel</h3>
          <p class="text-xs text-[#64748B] font-mono mt-0.5">${cleanFilename}</p>
        </div>
      </div>

      <!-- Info Alert for Permission / Sandbox issues -->
      <div class="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 leading-relaxed">
        <p class="font-bold flex items-center gap-1.5 text-amber-950">
          ⚠️ Notifikasi Browser / Iframe Permission
        </p>
        <p class="mt-1 text-[11px] text-amber-800">
          Jika browser Anda memblokir unduhan dengan pesan <i>"Need permission to download"</i>, gunakan opsi <b>"Salin Data ke Excel"</b> atau <b>"Buka di Tab Baru"</b> di bawah ini.
        </p>
      </div>

      <!-- Action Options -->
      <div class="space-y-2.5">
        <!-- Copy to Clipboard -->
        <button id="btn-copy-excel-data" class="w-full flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-[#079669] hover:bg-emerald-100 transition cursor-pointer">
          <span class="flex items-center gap-2">
            📋 <span>Salin Data ke Clipboard</span>
          </span>
          <span class="text-[10px] bg-emerald-200/80 text-[#079669] px-2 py-0.5 rounded-md font-bold">Bisa Paste di Excel (Ctrl+V)</span>
        </button>

        <!-- Open in New Tab -->
        <button id="btn-open-new-tab" class="w-full flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs font-bold text-[#3984E8] hover:bg-blue-100 transition cursor-pointer">
          <span class="flex items-center gap-2">
            🌐 <span>Buka Tabel di Tab Baru</span>
          </span>
          <span class="text-[10px] bg-blue-200/80 text-[#3984E8] px-2 py-0.5 rounded-md font-bold">Bypass Iframe Sandbox</span>
        </button>

        <!-- Direct Download Retry -->
        <button id="btn-retry-download" class="w-full flex items-center justify-between rounded-xl border border-[#DFE6EF] bg-[#F4F7FB] p-3 text-xs font-bold text-[#17324D] hover:bg-slate-100 transition cursor-pointer">
          <span class="flex items-center gap-2">
            💾 <span>Coba Unduh File (.xlsx)</span>
          </span>
          <span class="text-[10px] bg-slate-200 text-[#64748B] px-2 py-0.5 rounded-md font-semibold">Direct Download</span>
        </button>
      </div>

      <!-- Copy Success Toast Notification -->
      <div id="copy-toast" class="hidden rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-center text-xs font-bold text-[#079669]">
        ✅ Data berhasil disalin! Silakan buka MS Excel atau Google Sheets lalu tekan Ctrl + V.
      </div>

      <!-- Footer / Cancel -->
      <div class="pt-2 flex justify-end">
        <button id="btn-cancel-excel-modal" class="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#17324D] transition cursor-pointer">
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
  if (btnClose) btnClose.addEventListener('click', closeModal);
  if (btnCancel) btnCancel.addEventListener('click', closeModal);

  // Copy to Clipboard Action
  if (btnCopy) {
    btnCopy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(tsvContent);
        if (copyToast) {
          copyToast.classList.remove('hidden');
          setTimeout(() => {
            copyToast.classList.add('hidden');
          }, 4000);
        }
      } catch (e) {
        // Fallback for clipboard
        const textarea = document.createElement('textarea');
        textarea.value = tsvContent;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
        if (copyToast) {
          copyToast.classList.remove('hidden');
          setTimeout(() => {
            copyToast.classList.add('hidden');
          }, 4000);
        }
      }
    });
  }

  // Open in New Tab Action
  if (btnOpenTab) {
    btnOpenTab.addEventListener('click', () => {
      const newWin = window.open('', '_blank');
      if (newWin) {
        newWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${cleanFilename}</title>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; background: #E9EEF5; color: #17324D; }
                h2 { color: #079669; }
                p { font-size: 13px; color: #64748B; }
                table { border-collapse: collapse; width: 100%; margin-top: 16px; font-size: 12px; background: #ffffff; border: 1px solid #DFE6EF; }
                th, td { border: 1px solid #DFE6EF; padding: 8px 12px; text-align: left; }
                th { background-color: #F8FAFC; color: #17324D; font-weight: bold; }
                tr:hover { background-color: #F8FAFC; }
                .btn-copy { background: #079669; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: bold; }
              </style>
            </head>
            <body>
              <h2>Pratinjau Data: ${cleanFilename}</h2>
              <p>Anda dapat memilih seluruh tabel (Ctrl+A) lalu salin (Ctrl+C) dan tempel ke spreadsheet Microsoft Excel.</p>
              ${htmlTableContent}
            </body>
          </html>
        `);
        newWin.document.close();
      } else {
        alert('Browser memblokir popup. Silakan gunakan opsi "Salin Data ke Clipboard".');
      }
    });
  }

  // Direct Retry Action
  if (btnRetry) {
    btnRetry.addEventListener('click', () => {
      try {
        XLSX.writeFile(wb, cleanFilename);
      } catch (err) {
        console.warn('Retry failed:', err);
      }
    });
  }
}
