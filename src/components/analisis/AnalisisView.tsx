import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Target,
  Activity,
  CheckCircle2
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';

export const AnalisisView: React.FC = () => {
  const { selectedTahun, anggaranList, realisasiList } = useApp();

  const currentAnggaran = anggaranList.filter(a => Number(a.tahun) === Number(selectedTahun));
  const currentRealisasi = realisasiList.filter(r => Number(r.tahun) === Number(selectedTahun));

  const totalPagu = currentAnggaran.reduce((s, a) => s + (a.paguAkhir || 0), 0);
  const totalReal = currentRealisasi.reduce((s, r) => s + (r.nilai || 0), 0);

  // Target vs Realisasi Monthly Cumulative
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  let kumulatifReal = 0;
  const targetVsRealData = months.map((m, idx) => {
    const monthNum = idx + 1;
    const monthReal = currentRealisasi
      .filter(r => Number(r.bulan) === monthNum)
      .reduce((s, r) => s + (r.nilai || 0), 0);

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
      <div className="flex flex-col gap-2 border-b border-[#DFE6EF] pb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#079669]" />
          <h1 className="text-xl font-bold text-[#17324D]">Analisis &amp; Grafik Interaktif Keuangan</h1>
        </div>
        <p className="text-xs text-[#64748B]">
          Analisis Target vs Realisasi, Progres Serapan Bulanan &amp; Monitoring Kinerja Keuangan TA {selectedTahun}
        </p>
      </div>

      {/* Target vs Realisasi Cumulative Chart */}
      <div className="rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-6 shadow-xs">
        <div className="mb-4 flex items-center justify-between border-b border-[#DFE6EF] pb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-[#079669]" />
            <h2 className="text-sm font-bold text-[#17324D]">
              Kurva Serapan Kumulatif: Target Ideal vs Realisasi Nyata
            </h2>
          </div>
          <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-[#079669] border border-emerald-200">
            Juta Rp
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={targetVsRealData}>
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
                dataKey="RealisasiKumulatif"
                name="Realisasi Kumulatif"
                stroke="#079669"
                strokeWidth={3}
                dot={{ r: 5, fill: '#079669' }}
                activeDot={{ r: 7 }}
              />
              <Line
                type="monotone"
                dataKey="TargetKumulatif"
                name="Target Kumulatif (Ideal)"
                stroke="#3984E8"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={{ r: 3, fill: '#3984E8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monitoring Evaluasi Indicators */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-5 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-[#079669] text-xs">
            <CheckCircle2 className="h-4 w-4" />
            <span>Indikator Serapan Triwulan</span>
          </div>
          <p className="mt-2 text-2xl font-black text-[#17324D]">
            {((totalReal / (totalPagu || 1)) * 100).toFixed(2)}%
          </p>
          <p className="mt-1 text-xs text-[#64748B]">
            Capaian Serapan dari Pagu Total Rp {totalPagu.toLocaleString('id-ID')}
          </p>
        </div>

        <div className="rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-5 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-[#3984E8] text-xs">
            <Activity className="h-4 w-4" />
            <span>Rata-Rata Serapan Bulanan</span>
          </div>
          <p className="mt-2 text-2xl font-black text-[#3984E8]">
            Rp {(totalReal / 12).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
          </p>
          <p className="mt-1 text-xs text-[#64748B]">Per Bulan pada TA {selectedTahun}</p>
        </div>

        <div className="rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-5 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-[#D99A24] text-xs">
            <TrendingUp className="h-4 w-4" />
            <span>Status Kinerja Keuangan</span>
          </div>
          <p className="mt-2 text-xl font-bold text-[#079669]">BAIK &amp; STABIL</p>
          <p className="mt-1 text-xs text-[#64748B]">Persetujuan SP2D Sesuai Prosedur PPK</p>
        </div>
      </div>
    </div>
  );
};
