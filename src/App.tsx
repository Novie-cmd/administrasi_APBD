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

const MainContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
          <div className="mx-auto max-w-7xl">
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
