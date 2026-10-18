import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { isCodeEqual } from '../../utils/codeUtils';
import { NTBLogo } from '../common/NTBLogo';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  PieChart as PieIcon,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
  Info,
  Trash2,
  Database
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const Dashboard: React.FC = () => {
  const {
    selectedTahun,
    setSelectedTahun,
    tahunList,
    anggaranList,
    realisasiList,
    programs,
    kegiatanList,
    notifications,
    opd,
    currentUser,
    clearRealisasiDatabase,
    clearAnggaranDatabase,
    clearAllDatabase,
    sheetConfig
  } = useApp();

  const [clearModalType, setClearModalType] = useState<'transaksi' | 'database' | null>(null);
  const [alsoClearSheet, setAlsoClearSheet] = useState(false);

  // Compute metrics for selected fiscal year
  const currentAnggaranList = anggaranList.filter(a => Number(a.tahun) === Number(selectedTahun));
  const currentRealisasiList = realisasiList.filter(r => Number(r.tahun) === Number(selectedTahun));

  const totalAnggaran = currentAnggaranList.reduce((acc, a) => acc + (a.paguAkhir || 0), 0);
  const totalRealisasi = currentRealisasiList.reduce((acc, r) => acc + (r.nilai || 0), 0);
  const sisaAnggaran = totalAnggaran - totalRealisasi;
  const persentaseRealisasi = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0;

  // Chart Data 1: Realisasi per Bulan (Jan - Des)
  const namaBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  const realisasiPerBulanData = namaBulan.map((m, idx) => {
    const monthNum = idx + 1;
    const realisasiBulan = currentRealisasiList
      .filter(r => Number(r.bulan) === monthNum)
      .reduce((sum, r) => sum + (r.nilai || 0), 0);

    return {
      bulan: m,
      Realisasi: Math.round(realisasiBulan / 1000000), // in Millions IDR for display
      TargetIdeal: totalAnggaran > 0 ? Math.round((totalAnggaran / 12) / 1000000) : 0
    };
  });

  // Chart Data 2: Pie Program (Distribution of Anggaran by Program)
  // Balanced color palette as requested: #079669, #3984E8, #D99A24, #D94F70, #8493A8
  const CHART_COLORS = ['#079669', '#3984E8', '#D99A24', '#D94F70', '#8493A8'];
  const programPieData = programs
    .filter(p => Number(p.tahun) === Number(selectedTahun))
    .map((p, idx) => {
      const paguProg = currentAnggaranList
        .filter(a => isCodeEqual(a.kodeProgram, p.kodeProgram))
        .reduce((sum, a) => sum + (a.paguAkhir || 0), 0);

      const realProg = currentRealisasiList
        .filter(r => isCodeEqual(r.kodeProgram, p.kodeProgram))
        .reduce((sum, r) => sum + (r.nilai || 0), 0);

      return {
        name: p.kodeProgram,
        fullName: p.namaProgram,
        value: paguProg > 0 ? paguProg : 1000000,
        realisasi: realProg,
        color: CHART_COLORS[idx % CHART_COLORS.length]
      };
    });

  // Chart Data 3: Bar Kegiatan (Anggaran vs Realisasi per Kegiatan)
  const barKegiatanData = kegiatanList
    .filter(k => Number(k.tahun) === Number(selectedTahun))
    .slice(0, 6)
    .map(k => {
      const paguKeg = currentAnggaranList
        .filter(a => isCodeEqual(a.kodeKegiatan, k.kodeKegiatan))
        .reduce((sum, a) => sum + (a.paguAkhir || 0), 0);

      const realKeg = currentRealisasiList
        .filter(r => isCodeEqual(r.kodeKegiatan, k.kodeKegiatan))
        .reduce((sum, r) => sum + (r.nilai || 0), 0);

      return {
        name: k.kodeKegiatan,
        fullName: k.namaKegiatan,
        Anggaran: Math.round(paguKeg / 1000000),
        Realisasi: Math.round(realKeg / 1000000)
      };
    });

  // Chart Data 4: Top Belanja Terbesar
  const belanjaGroupMap: Record<string, { name: string; realisasi: number; pagu: number }> = {};
  currentRealisasiList.forEach(r => {
    const key = r.kodeBelanja || 'Lainnya';
    if (!belanjaGroupMap[key]) {
      belanjaGroupMap[key] = {
        name: r.namaBelanja || key,
        realisasi: 0,
        pagu: 0
      };
    }
    belanjaGroupMap[key].realisasi += r.nilai || 0;
  });

  const top10BelanjaData = Object.values(belanjaGroupMap)
    .sort((a, b) => b.realisasi - a.realisasi)
    .slice(0, 7)
    .map(item => ({
      name: item.name.length > 25 ? `${item.name.slice(0, 25)}...` : item.name,
      Realisasi: Math.round(item.realisasi / 1000000)
    }));

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER EMBLEM BANNER - Clean Government Terang */}
      <div className="rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-6 shadow-xs">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#F4F7FB] p-1 border border-[#DFE6EF] shadow-xs overflow-hidden">
              {opd?.logoUrl ? (
                <img
                  src={opd.logoUrl}
                  alt="Logo NTB"
                  className="h-full w-full object-cover rounded-xl"
                />
              ) : (
                <NTBLogo className="h-full w-full" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-[#079669] border border-emerald-200">
                  DASHBOARD EKSEKUTIF KEUANGAN
                </span>
                <span className="text-xs font-semibold text-[#64748B]">
                  Tahun Anggaran {selectedTahun}
                </span>
              </div>
              <h1 className="mt-1 text-xl font-black text-[#17324D] sm:text-2xl">
                SISTEM INFORMASI KEUANGAN
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-[#079669]">
                BAKESBANGPOLDAGRI NTB (BFMS)
              </p>
            </div>
          </div>

          {/* Quick Year Selector */}
          <div className="flex items-center gap-3 rounded-xl bg-[#F4F7FB] p-3 border border-[#DFE6EF]">
            <Calendar className="h-5 w-5 text-[#079669]" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-[#64748B] font-bold">
                Tahun Anggaran
              </span>
              <select
                value={selectedTahun}
                onChange={e => setSelectedTahun(Number(e.target.value))}
                className="cursor-pointer bg-transparent text-sm font-bold text-[#17324D] focus:outline-none"
                id="dashboard-year-select"
              >
                {tahunList.map(t => {
                  const count = realisasiList.filter(r => Number(r.tahun) === Number(t.tahun)).length;
                  return (
                    <option key={t.id} value={t.tahun}>
                      TA {t.tahun} {count > 0 ? `(${count} Realisasi)` : ''} {t.statusAktif ? '★ Aktif' : ''}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SMART YEAR DATA NOTIFICATION BANNER */}
      {currentRealisasiList.length === 0 && realisasiList.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-amber-900">
                Data Realisasi Terdeteksi di Tahun Anggaran Lain
              </div>
              <div className="text-xs text-amber-800 mt-0.5">
                Terdapat {realisasiList.length} transaksi di database ({Array.from(new Set(realisasiList.map(r => r.tahun))).map(th => `TA ${th}: ${realisasiList.filter(r => Number(r.tahun) === Number(th)).length} data`).join(', ')}).
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {Array.from(new Set(realisasiList.map(r => r.tahun))).map(th => (
              <button
                key={th}
                onClick={() => setSelectedTahun(Number(th))}
                className="rounded-xl bg-[#079669] hover:bg-[#065f46] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition"
              >
                Beralih ke TA {th}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* QUICK DATABASE MANAGEMENT TOOLBAR */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] px-4 py-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Database className="h-4 w-4 text-[#079669]" />
          <span className="text-xs font-bold text-[#17324D]">Status Transaksi TA {selectedTahun}:</span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-[#079669] border border-emerald-200">
            {currentRealisasiList.length} Transaksi Realisasi (Rp {totalRealisasi.toLocaleString('id-ID')})
          </span>
          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-[#3984E8] border border-blue-200">
            {currentAnggaranList.length} Pagu Anggaran
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (currentUser.role === 'Auditor') {
                alert('Peran Auditor hanya memiliki izin lihat (Read-Only).');
                return;
              }
              setClearModalType('transaksi');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 px-3.5 py-2 text-xs font-bold text-rose-700 transition shadow-xs"
            id="btn-dashboard-clear-transaksi"
            title="Kosongkan Data Transaksi Realisasi SP2D"
          >
            <Trash2 className="h-3.5 w-3.5 text-rose-600" />
            <span>Kosongkan Transaksi</span>
          </button>

          <button
            onClick={() => {
              if (currentUser.role === 'Auditor') {
                alert('Peran Auditor hanya memiliki izin lihat (Read-Only).');
                return;
              }
              setClearModalType('database');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-100 hover:bg-rose-200 px-3.5 py-2 text-xs font-bold text-rose-800 transition shadow-xs"
            id="btn-dashboard-clear-database"
            title="Kosongkan Seluruh Database Transaksi (Realisasi & Pagu Anggaran)"
          >
            <Database className="h-3.5 w-3.5 text-rose-600" />
            <span>Kosongkan Database</span>
          </button>
        </div>
      </div>

      {/* 4 STATISTIC SUMMARY CARDS - White Cards with Clean Borders */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Anggaran Card */}
        <div className="rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-5 shadow-xs transition hover:border-[#079669]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Total Anggaran Pagu
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#079669] border border-emerald-200">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold tracking-tight text-[#17324D] tabular-nums sm:text-2xl">
              Rp {totalAnggaran.toLocaleString('id-ID')}
            </div>
            <p className="mt-1 text-xs text-[#64748B]">
              Pagu Akhir APBD TA {selectedTahun}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-[#079669]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Tersebar di {currentAnggaranList.length} Rincian Belanja</span>
          </div>
        </div>

        {/* Total Realisasi Card */}
        <div className="rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-5 shadow-xs transition hover:border-[#3984E8]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Total Realisasi
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#3984E8] border border-blue-200">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold tracking-tight text-[#3984E8] tabular-nums sm:text-2xl">
              Rp {totalRealisasi.toLocaleString('id-ID')}
            </div>
            <p className="mt-1 text-xs text-[#64748B]">
              {currentRealisasiList.length} Transaksi SP2D Terbit
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-[#3984E8]">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Tercatat pada Sistem Keuangan</span>
          </div>
        </div>

        {/* Sisa Anggaran Card */}
        <div className="rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-5 shadow-xs transition hover:border-[#D99A24]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Sisa Anggaran
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-[#D99A24] border border-amber-200">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold tracking-tight text-[#D99A24] tabular-nums sm:text-2xl">
              Rp {sisaAnggaran.toLocaleString('id-ID')}
            </div>
            <p className="mt-1 text-xs text-[#64748B]">
              Sisa Pagu Belanja yang Belum Terserap
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-bold text-[#D99A24]">
            <Info className="h-3.5 w-3.5" />
            <span>{((sisaAnggaran / (totalAnggaran || 1)) * 100).toFixed(2)}% Belum Belanja</span>
          </div>
        </div>

        {/* Persentase Realisasi Card */}
        <div className="rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-5 shadow-xs transition hover:border-[#079669]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
              Persentase Serapan
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-[#079669] border border-emerald-200">
              <PieIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black tracking-tight text-[#079669] tabular-nums">
              {persentaseRealisasi.toFixed(2)} %
            </div>
            {/* Progress Bar */}
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[#F4F7FB] border border-[#DFE6EF]">
              <div
                className="h-full rounded-full bg-[#079669] transition-all duration-1000"
                style={{ width: `${Math.min(persentaseRealisasi, 100)}%` }}
              />
            </div>
          </div>
          <p className="mt-2 text-xs font-medium text-[#64748B]">
            Target Serapan Triwulan: Ideal 15%-25% per TW
          </p>
        </div>
      </div>

      {/* NOTIFICATIONS & WARNINGS SECTION */}
      <div className="rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-[#DFE6EF] pb-3">
          <AlertTriangle className="h-5 w-5 text-[#D99A24]" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#17324D]">
            Peringatan &amp; Monitoring Realisasi Keuangan
          </h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-[#F4F7FB] p-3.5 border border-[#DFE6EF]">
            <div className="flex items-center gap-2 font-bold text-[#D99A24] text-xs">
              <Info className="h-4 w-4" />
              <span>Belanja Belum Direalisasikan</span>
            </div>
            <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
              Terdapat rincian belanja dengan serapan Rp 0. Perlu percepatan pengadaan &amp; SPJ.
            </p>
          </div>

          <div className="rounded-xl bg-[#F4F7FB] p-3.5 border border-[#DFE6EF]">
            <div className="flex items-center gap-2 font-bold text-[#D94F70] text-xs">
              <AlertTriangle className="h-4 w-4" />
              <span>SP2D / Data Belum Lengkap</span>
            </div>
            <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
              Pemeriksaan kelengkapan dokumen SPM, SP2D, dan Rekanan wajib tervalidasi PPK.
            </p>
          </div>

          <div className="rounded-xl bg-[#F4F7FB] p-3.5 border border-[#DFE6EF]">
            <div className="flex items-center gap-2 font-bold text-[#079669] text-xs">
              <CheckCircle2 className="h-4 w-4" />
              <span>Kesesuaian Pagu &amp; SP2D</span>
            </div>
            <p className="mt-1 text-xs text-[#64748B] leading-relaxed">
              Deteksi otomatis mencegah nomor SP2D ganda dan pengeluaran melewati pagu anggaran.
            </p>
          </div>
        </div>
      </div>

      {/* 4 BALANCED INTERACTIVE CHARTS GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* CHART 1: Realisasi per Bulan (Line Chart) */}
        <div className="rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between border-b border-[#DFE6EF] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#17324D]">Realisasi Keuangan per Bulan</h3>
              <p className="text-xs text-[#64748B]">Grafik serapan bulanan dalam Jutaan Rupiah (Juta Rp)</p>
            </div>
            <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-[#079669] border border-emerald-200">
              TA {selectedTahun}
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={realisasiPerBulanData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DFE6EF" />
                <XAxis dataKey="bulan" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DFE6EF', borderRadius: '12px', color: '#17324D' }}
                  formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')} Juta`, 'Nilai']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Realisasi"
                  stroke="#079669"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#079669' }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="TargetIdeal"
                  stroke="#3984E8"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Pie Program (Donut Chart) */}
        <div className="rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between border-b border-[#DFE6EF] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#17324D]">Proporsi Anggaran per Program</h3>
              <p className="text-xs text-[#64748B]">Distribusi Pagu Anggaran menurut Kode Program</p>
            </div>
            <span className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#3984E8] border border-blue-200">
              {programPieData.length} Program
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={programPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {programPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DFE6EF', borderRadius: '12px', color: '#17324D' }}
                  formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`, 'Pagu']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Bar Kegiatan (Anggaran vs Realisasi) */}
        <div className="rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between border-b border-[#DFE6EF] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#17324D]">Anggaran vs Realisasi per Kegiatan</h3>
              <p className="text-xs text-[#64748B]">Perbandingan Pagu &amp; Serapan per Sub-Kegiatan (Juta Rp)</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barKegiatanData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DFE6EF" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DFE6EF', borderRadius: '12px', color: '#17324D' }}
                  formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')} Juta`, 'Nilai']}
                />
                <Legend />
                <Bar dataKey="Anggaran" fill="#3984E8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Realisasi" fill="#079669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Top Belanja (Horizontal Bar Chart) */}
        <div className="rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between border-b border-[#DFE6EF] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#17324D]">Top Rincian Belanja Terbesar</h3>
              <p className="text-xs text-[#64748B]">Peringkat Serapan Realisasi Belanja (Juta Rp)</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={top10BelanjaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DFE6EF" />
                <XAxis type="number" stroke="#64748B" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={10} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#DFE6EF', borderRadius: '12px', color: '#17324D' }}
                  formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')} Juta`, 'Realisasi']}
                />
                <Bar dataKey="Realisasi" fill="#D99A24" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CLEAR MODAL (TRANSAKSI / DATABASE) */}
      {clearModalType !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17324D]/40 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md space-y-4 rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-6 shadow-xl">
            <div className="flex items-center gap-3 border-b border-[#DFE6EF] pb-3">
              <div className="rounded-xl bg-rose-50 p-2.5 text-rose-600 border border-rose-200">
                {clearModalType === 'database' ? (
                  <Database className="h-6 w-6 text-rose-600" />
                ) : (
                  <Trash2 className="h-6 w-6 text-rose-600" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-[#17324D]">
                  {clearModalType === 'database' ? 'Konfirmasi Kosongkan Database' : 'Konfirmasi Kosongkan Transaksi'}
                </h3>
                <p className="text-xs text-[#64748B]">
                  {clearModalType === 'database'
                    ? 'Penghapusan Seluruh Database Realisasi & Pagu Anggaran'
                    : 'Penghapusan Transaksi Realisasi SP2D'}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#64748B]">
              <p className="font-bold text-rose-700">Peringatan Penting!</p>
              <p>
                {clearModalType === 'database'
                  ? 'Tindakan ini akan mengosongkan seluruh database transaksi (Realisasi SP2D dan Pagu Anggaran) dari sistem lokal dan cloud.'
                  : 'Tindakan ini akan menghapus data transaksi Realisasi SP2D. Data yang terhapus tidak dapat dikembalikan.'}
              </p>

              {sheetConfig.webAppUrl && (
                <label className="flex items-center gap-2 rounded-xl bg-[#F4F7FB] border border-[#DFE6EF] p-2.5 text-xs text-[#17324D] cursor-pointer hover:border-slate-300 mt-2">
                  <input
                    type="checkbox"
                    checked={alsoClearSheet}
                    onChange={e => setAlsoClearSheet(e.target.checked)}
                    className="h-4 w-4 rounded border-[#DFE6EF] text-rose-600 focus:ring-rose-500"
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
                    className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 p-3 text-xs font-bold text-white transition flex items-center justify-between shadow-xs"
                  >
                    <span>Hapus Transaksi TA {selectedTahun} Saja ({currentRealisasiList.length} Data)</span>
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      clearRealisasiDatabase();
                      setClearModalType(null);
                      alert('Berhasil mengosongkan seluruh transaksi realisasi untuk semua Tahun Anggaran.');
                    }}
                    className="w-full rounded-xl bg-[#F4F7FB] hover:bg-rose-50 hover:text-rose-700 border border-[#DFE6EF] p-3 text-xs font-bold text-[#17324D] transition flex items-center justify-between"
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
                    className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 p-3 text-xs font-bold text-white transition flex items-center justify-between shadow-xs"
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
                    className="w-full rounded-xl bg-rose-700 hover:bg-rose-800 p-3 text-xs font-bold text-white transition flex items-center justify-between shadow-xs"
                  >
                    <span>Kosongkan TOTAL Database Transaksi (Semua Tahun)</span>
                    <Database className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#DFE6EF]">
              <button
                type="button"
                onClick={() => setClearModalType(null)}
                className="rounded-xl bg-[#F4F7FB] hover:bg-slate-200/80 px-4 py-2 text-xs font-bold text-[#17324D] transition"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
