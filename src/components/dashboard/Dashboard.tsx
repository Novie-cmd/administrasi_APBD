import React from 'react';
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
  ArrowDownRight,
  Sparkles,
  Info
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
    opd
  } = useApp();

  // Compute metrics for selected fiscal year
  const currentAnggaranList = anggaranList.filter(a => Number(a.tahun) === Number(selectedTahun));
  const currentRealisasiList = realisasiList.filter(r => Number(r.tahun) === Number(selectedTahun));

  const totalAnggaran = currentAnggaranList.reduce((acc, a) => acc + a.paguAkhir, 0);
  const totalRealisasi = currentRealisasiList.reduce((acc, r) => acc + r.nilai, 0);
  const sisaAnggaran = totalAnggaran - totalRealisasi;
  const persentaseRealisasi = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0;

  // Chart Data 1: Realisasi per Bulan (Jan - Des)
  const namaBulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  const realisasiPerBulanData = namaBulan.map((m, idx) => {
    const monthNum = idx + 1;
    const realisasiBulan = currentRealisasiList
      .filter(r => Number(r.bulan) === monthNum)
      .reduce((sum, r) => sum + r.nilai, 0);

    // Target kumulatif ideal ~ (totalAnggaran / 12) * monthNum
    const targetKumulatif = totalAnggaran > 0 ? Math.round((totalAnggaran / 12) * monthNum) : 0;

    return {
      bulan: m,
      Realisasi: Math.round(realisasiBulan / 1000000), // in Millions IDR for display
      TargetIdeal: Math.round((totalAnggaran / 12) / 1000000)
    };
  });

  // Chart Data 2: Pie Program (Distribution of Anggaran by Program)
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
  const programPieData = programs
    .filter(p => Number(p.tahun) === Number(selectedTahun))
    .map((p, idx) => {
      const paguProg = currentAnggaranList
        .filter(a => isCodeEqual(a.kodeProgram, p.kodeProgram))
        .reduce((sum, a) => sum + a.paguAkhir, 0);

      const realProg = currentRealisasiList
        .filter(r => isCodeEqual(r.kodeProgram, p.kodeProgram))
        .reduce((sum, r) => sum + r.nilai, 0);

      return {
        name: p.kodeProgram,
        fullName: p.namaProgram,
        value: paguProg > 0 ? paguProg : 1000000,
        realisasi: realProg,
        color: COLORS[idx % COLORS.length]
      };
    });

  // Chart Data 3: Bar Kegiatan (Anggaran vs Realisasi per Kegiatan)
  const barKegiatanData = kegiatanList
    .filter(k => Number(k.tahun) === Number(selectedTahun))
    .slice(0, 6)
    .map(k => {
      const paguKeg = currentAnggaranList
        .filter(a => isCodeEqual(a.kodeKegiatan, k.kodeKegiatan))
        .reduce((sum, a) => sum + a.paguAkhir, 0);

      const realKeg = currentRealisasiList
        .filter(r => isCodeEqual(r.kodeKegiatan, k.kodeKegiatan))
        .reduce((sum, r) => sum + r.nilai, 0);

      return {
        name: k.kodeKegiatan.replace('5.01.', ''),
        fullTitle: k.namaKegiatan,
        Anggaran: Math.round(paguKeg / 1000000),
        Realisasi: Math.round(realKeg / 1000000)
      };
    });

  // Chart Data 4: Top 10 Belanja (Horizontal Bar)
  const belanjaGroupMap: { [key: string]: { name: string; realisasi: number; pagu: number } } = {};

  currentAnggaranList.forEach(a => {
    const key = a.kodeBelanja.trim().toLowerCase();
    if (!belanjaGroupMap[key]) {
      belanjaGroupMap[key] = {
        name: a.namaBelanja.length > 25 ? a.namaBelanja.substring(0, 25) + '...' : a.namaBelanja,
        pagu: a.paguAkhir,
        realisasi: 0
      };
    } else {
      belanjaGroupMap[key].pagu += a.paguAkhir;
    }
  });

  currentRealisasiList.forEach(r => {
    const matchedKey = Object.keys(belanjaGroupMap).find(k => isCodeEqual(k, r.kodeBelanja));
    if (matchedKey) {
      belanjaGroupMap[matchedKey].realisasi += r.nilai;
    }
  });

  const top10BelanjaData = Object.values(belanjaGroupMap)
    .sort((a, b) => b.realisasi - a.realisasi)
    .slice(0, 8)
    .map(item => ({
      name: item.name,
      Realisasi: Math.round(item.realisasi / 1000000),
      Sisa: Math.round((item.pagu - item.realisasi) / 1000000)
    }));

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER EMBLEM BANNER */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-800/40 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 shadow-2xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-center gap-5">
            <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-950 p-0.5 border border-emerald-500/50 shadow-xl overflow-hidden">
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
                <span className="rounded-full bg-emerald-800/80 px-3 py-1 text-[11px] font-bold text-emerald-200 ring-1 ring-emerald-500/30">
                  DASHBOARD EKSEKUTIF ERP
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  Tahun Anggaran {selectedTahun}
                </span>
              </div>
              <h1 className="mt-1 text-xl font-black text-white sm:text-2xl lg:text-3xl">
                SISTEM INFORMASI KEUANGAN
              </h1>
              <p className="text-sm font-semibold text-emerald-300/90">
                BAKESBANGPOLDAGRI NTB (BFMS)
              </p>
            </div>
          </div>

          {/* Quick Year Selector */}
          <div className="flex items-center gap-3 rounded-2xl bg-slate-900/80 p-3 ring-1 ring-emerald-500/30">
            <Calendar className="h-5 w-5 text-emerald-400" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                Tahun Anggaran
              </span>
              <select
                value={selectedTahun}
                onChange={e => setSelectedTahun(Number(e.target.value))}
                className="cursor-pointer bg-transparent text-sm font-black text-emerald-300 focus:outline-none"
                id="dashboard-year-select"
              >
                {tahunList.map(t => (
                  <option key={t.id} value={t.tahun} className="bg-slate-900 text-white">
                    {t.tahun} {t.statusAktif ? '(Aktif)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 4 STATISTIC SUMMARY CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Anggaran Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition hover:border-emerald-500/50 hover:shadow-emerald-950/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Anggaran Pagu
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400 ring-1 ring-emerald-500/30">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-black tracking-tight text-white sm:text-2xl">
              Rp {totalAnggaran.toLocaleString('id-ID')}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Pagu Akhir APBD TA {selectedTahun}
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Tersebar di {currentAnggaranList.length} Rincian Belanja</span>
          </div>
        </div>

        {/* Total Realisasi Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition hover:border-blue-500/50 hover:shadow-blue-950/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Realisasi
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950 text-blue-400 ring-1 ring-blue-500/30">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-black tracking-tight text-blue-400 sm:text-2xl">
              Rp {totalRealisasi.toLocaleString('id-ID')}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {currentRealisasiList.length} Transaksi SP2D Terbit
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-blue-400">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Tercatat pada Sistem Keuangan</span>
          </div>
        </div>

        {/* Sisa Anggaran Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition hover:border-amber-500/50 hover:shadow-amber-950/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Sisa Anggaran
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-950 text-amber-400 ring-1 ring-amber-500/30">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-black tracking-tight text-amber-400 sm:text-2xl">
              Rp {sisaAnggaran.toLocaleString('id-ID')}
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Sisa Pagu Belanja yang Belum Terserap
            </p>
          </div>
          <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-amber-400">
            <Info className="h-3.5 w-3.5" />
            <span>{((sisaAnggaran / (totalAnggaran || 1)) * 100).toFixed(2)}% Belum Belanja</span>
          </div>
        </div>

        {/* Persentase Realisasi Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-lg transition hover:border-emerald-500/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Persentase Serapan
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-950 text-teal-300 ring-1 ring-teal-500/30">
              <PieIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black tracking-tight text-emerald-400">
              {persentaseRealisasi.toFixed(2)} %
            </div>
            {/* Progress Bar */}
            <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000"
                style={{ width: `${Math.min(persentaseRealisasi, 100)}%` }}
              />
            </div>
          </div>
          <p className="mt-2 text-xs font-medium text-slate-400">
            Target Serapan Triwulan: Ideal 15%-25% per TW
          </p>
        </div>
      </div>

      {/* NOTIFICATIONS & WARNINGS SECTION */}
      <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-5 shadow-xl">
        <div className="flex items-center gap-2 border-b border-amber-900/40 pb-3">
          <AlertTriangle className="h-5 w-5 text-amber-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-200">
            Peringatan & Monitoring Realisasi Keuangan
          </h2>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl bg-slate-900/90 p-3.5 border border-amber-800/40">
            <div className="flex items-center gap-2 font-bold text-amber-300 text-xs">
              <Info className="h-4 w-4" />
              <span>Belanja Belum Direalisasikan</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Terdapat rincian belanja dengan serapan Rp 0. Perlu percepatan pengadaan & SPJ.
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/90 p-3.5 border border-rose-800/40">
            <div className="flex items-center gap-2 font-bold text-rose-300 text-xs">
              <AlertTriangle className="h-4 w-4" />
              <span>SP2D / Data Belum Lengkap</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Pemeriksaan kelengkapan dokumen SPM, SP2D, dan Rekanan wajib tervalidasi PPK.
            </p>
          </div>

          <div className="rounded-xl bg-slate-900/90 p-3.5 border border-emerald-800/40">
            <div className="flex items-center gap-2 font-bold text-emerald-300 text-xs">
              <CheckCircle2 className="h-4 w-4" />
              <span>Kesesuaian Pagu & SP2D</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Deteksi otomatis mencegah nomor SP2D ganda dan pengeluaran melewati pagu.
            </p>
          </div>
        </div>
      </div>

      {/* 4 INTERACTIVE CHARTS GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* CHART 1: Realisasi per Bulan (Line Chart) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Realisasi Keuangan per Bulan</h3>
              <p className="text-xs text-slate-400">Grafik serapan bulanan dalam Jutaan Rupiah (Juta Rp)</p>
            </div>
            <span className="rounded-lg bg-emerald-950 px-2.5 py-1 text-xs font-semibold text-emerald-300 border border-emerald-800">
              TA {selectedTahun}
            </span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={realisasiPerBulanData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="bulan" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')} Juta`, 'Nilai']}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Realisasi"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10B981' }}
                  activeDot={{ r: 7 }}
                />
                <Line
                  type="monotone"
                  dataKey="TargetIdeal"
                  stroke="#64748B"
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: Pie Program (Donut Chart) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Proporsi Anggaran per Program</h3>
              <p className="text-xs text-slate-400">Distribusi Pagu Anggaran menurut Kode Program</p>
            </div>
            <span className="rounded-lg bg-blue-950 px-2.5 py-1 text-xs font-semibold text-blue-300 border border-blue-800">
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
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')}`, 'Pagu']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: Bar Kegiatan (Anggaran vs Realisasi) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Anggaran vs Realisasi per Kegiatan</h3>
              <p className="text-xs text-slate-400">Perbandingan Pagu & Serapan per Sub-Kegiatan (Juta Rp)</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barKegiatanData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')} Juta`, 'Nilai']}
                />
                <Legend />
                <Bar dataKey="Anggaran" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Realisasi" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Top 10 Belanja (Horizontal Bar Chart) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
          <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-white">Top Rincian Belanja Terbesar</h3>
              <p className="text-xs text-slate-400">Peringkat Serapan Realisasi Belanja (Juta Rp)</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={top10BelanjaData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis type="number" stroke="#94A3B8" fontSize={10} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={10} width={130} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`Rp ${Number(val).toLocaleString('id-ID')} Juta`, 'Realisasi']}
                />
                <Bar dataKey="Realisasi" fill="#F59E0B" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
