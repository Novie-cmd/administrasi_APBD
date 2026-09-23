import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { MasterDataView } from './components/master/MasterDataView';
import { InputAnggaranView } from './components/transaksi/InputAnggaranView';
import { InputRealisasiView } from './components/transaksi/InputRealisasiView';
import { UploadExcelView } from './components/transaksi/UploadExcelView';
import { KoreksiDataView } from './components/transaksi/KoreksiDataView';
import { PelaporanView } from './components/pelaporan/PelaporanView';
import { AnalisisView } from './components/analisis/AnalisisView';
import { PengaturanView } from './components/pengaturan/PengaturanView';
import { Cloud, AlertCircle, X, ArrowRight } from 'lucide-react';

const MainContent: React.FC = () => {
  const { cloudSync } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dismissQuotaBanner, setDismissQuotaBanner] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col">
      {/* Top Navbar */}
      <Navbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Body Layout: Sidebar + Main Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        {/* Backdrop overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-slate-950/80 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Main Operational Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          <div className="mx-auto max-w-7xl space-y-4">
            {/* Global Friendly Quota Banner */}
            {cloudSync.status === 'quota_exceeded' && !dismissQuotaBanner && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-amber-500/40 bg-amber-950/40 px-4 py-3 text-amber-200 text-xs shadow-lg backdrop-blur-sm animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
                    <Cloud className="h-3.5 w-3.5" />
                  </span>
                  <div>
                    <span className="font-semibold text-white">Mode Offline Aktif (Kuota Tulis Firestore Gratis Hari Ini Tercapai): </span>
                    <span className="text-amber-200/90">
                      Seluruh data tersimpan aman 100% di browser. Aplikasi tetap berjalan normal dan kuota akan otomatis di-reset besok.
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={() => setActiveTab('pengaturan')}
                    className="flex items-center gap-1 font-semibold text-amber-300 hover:text-white underline underline-offset-2 transition"
                  >
                    <span>Detail & Spreadsheet</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => setDismissQuotaBanner(true)}
                    className="p-1 rounded-md text-amber-400/70 hover:text-amber-200 hover:bg-amber-900/40 transition"
                    title="Tutup pemberitahuan"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Tab 1: Dashboard */}
            {activeTab === 'dashboard' && <Dashboard />}

            {/* Tab 2: Master Data */}
            {activeTab.startsWith('master-') && (
              <MasterDataView key={activeTab} initialSubTab={activeTab} />
            )}

            {/* Tab 3: Transaksi */}
            {activeTab === 'transaksi-anggaran' && <InputAnggaranView />}
            {activeTab === 'transaksi-realisasi' && <InputRealisasiView />}
            {activeTab === 'transaksi-excel' && <UploadExcelView />}
            {activeTab === 'transaksi-koreksi' && <KoreksiDataView />}

            {/* Tab 4: Pelaporan */}
            {activeTab.startsWith('laporan-') && (
              <PelaporanView key={activeTab} initialReportType={activeTab} />
            )}

            {/* Tab 5: Analisis */}
            {activeTab.startsWith('analisis-') && <AnalisisView />}

            {/* Tab 6: Pengaturan */}
            {activeTab === 'pengaturan' && <PengaturanView />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
