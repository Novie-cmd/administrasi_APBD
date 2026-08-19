import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Target,
  Activity,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const AnalisisView: React.FC = () => {
  const { selectedTahun, anggaranList, realisasiList, programs } = useApp();

  const currentAnggaran = anggaranList.filter(a => Number(a.tahun) === Number(selectedTahun));
  const currentRealisasi = realisasiList.filter(r => Number(r.tahun) === Number(selectedTahun));

  const totalPagu = currentAnggaran.reduce((s, a) => s + a.paguAkhir, 0);
  const totalReal = currentRealisasi.reduce((s, r) => s + r.nilai, 0);

  // Target vs Realisasi Monthly Cumulative
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  let kumulatifReal = 0;
  const targetVsRealData = months.map((m, idx) => {
    const monthNum = idx + 1;
    const monthReal = currentRealisasi
      .filter(r => r.bulan === monthNum)
      .reduce((s, r) => s + r.nilai, 0);

    kumulatifReal += monthReal;
    const targetIdeal = Math.round((totalPagu / 12) * monthNum);

    return {
      bulan: m,
      RealisasiKumulatif: Math.round(kumulatifReal / 1000000),
      TargetKumulatif: Math.round(targetIdeal / 1000000)
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-cyan-400" />
          <h1 className="text-xl font-bold text-white">Analisis & Grafik Interaktif Keuangan</h1>
        </div>
        <p className="text-xs text-slate-400">
          Analisis Target vs Realisasi, Progres Serapan Bulanan & Monitoring Kinerja Keuangan TA {selectedTahun}
        </p>
      </div>

      {/* Target vs Realisasi Cumulative Chart */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">
              Kurva Serapan Kumulatif: Target Ideal vs Realisasi Nyata
            </h2>
          </div>
          <span className="rounded-lg bg-cyan-950 px-2.5 py-1 text-xs font-semibold text-cyan-300 border border-cyan-800">
            Juta Rp
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={targetVsRealData}>
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
                dataKey="RealisasiKumulatif"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="TargetKumulatif"
                stroke="#38BDF8"
                strokeDasharray="4 4"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monitoring Evaluasi Indicators */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-2 font-bold text-emerald-400 text-xs">
            <CheckCircle2 className="h-4 w-4" />
            <span>Indikator Serapan Triwulan</span>
          </div>
          <p className="mt-2 text-2xl font-black text-white">
            {((totalReal / (totalPagu || 1)) * 100).toFixed(2)}%
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Capaian Serapan dari Pagu Total Rp {totalPagu.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-2 font-bold text-cyan-400 text-xs">
            <Activity className="h-4 w-4" />
            <span>Rata-Rata Serapan Bulanan</span>
          </div>
          <p className="mt-2 text-2xl font-black text-cyan-400">
            Rp {(totalReal / 12).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
          </p>
          <p className="mt-1 text-xs text-slate-400">Per Bulan pada TA {selectedTahun}</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <div className="flex items-center gap-2 font-bold text-amber-400 text-xs">
            <TrendingUp className="h-4 w-4" />
            <span>Status Kinerja Keuangan</span>
          </div>
          <p className="mt-2 text-xl font-bold text-emerald-300">BAIK & STABIL</p>
          <p className="mt-1 text-xs text-slate-400">Persetujuan SP2D Sesuai Prosedur PPK</p>
        </div>
      </div>
    </div>
  );
};
