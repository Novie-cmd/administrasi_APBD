import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Edit3,
  Search,
  MessageSquare
} from 'lucide-react';

export const KoreksiDataView: React.FC = () => {
  const {
    selectedTahun,
    realisasiList,
    approveRealisasiPPK,
    updateRealisasi,
    currentUser
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [catatan, setCatatan] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const currentList = realisasiList.filter(r => Number(r.tahun) === Number(selectedTahun));

  const isPPK = currentUser.role === 'PPK' || currentUser.role === 'Administrator';

  const handleApprove = (id: string, isApproved: boolean) => {
    approveRealisasiPPK(id, isApproved, catatan);
    setSelectedId(null);
    setCatatan('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white">Validasi & Koreksi Realisasi (PPK)</h1>
          </div>
          <p className="text-xs text-slate-400">
            Fasilitas Pengawasan Pejabat Pembuat Komitmen (PPK) & Koreksi Transaksi TA {selectedTahun}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {['all', 'Draft', 'Disetujui PPK', 'Ditolak'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                filterStatus === st
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {st === 'all' ? 'Semua Status' : st}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE DATA */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Daftar Verifikasi Dokumen SP2D PPK
          </h3>
          <input
            type="text"
            placeholder="Cari SP2D, Uraian, Operator..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">No. SP2D</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Uraian Realisasi</th>
                <th className="px-4 py-3 text-right">Nilai (Rp)</th>
                <th className="px-4 py-3">Operator Input</th>
                <th className="px-4 py-3">Status PPK</th>
                {isPPK && <th className="px-4 py-3 text-center">Tindakan Validasi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {currentList
                .filter(
                  r =>
                    (filterStatus === 'all' || (r.statusValidation || 'Disetujui PPK') === filterStatus) &&
                    (r.noSP2D.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      r.uraian.toLowerCase().includes(searchTerm.toLowerCase()))
                )
                .map(r => (
                  <tr key={r.id} className="hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-mono font-bold text-teal-300">{r.noSP2D}</td>
                    <td className="px-4 py-3 text-slate-300 whitespace-nowrap">{r.tanggal}</td>
                    <td className="px-4 py-3 font-semibold text-white max-w-xs">{r.uraian}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">
                      Rp {r.nilai.toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-slate-300">{r.operator}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          r.statusValidation === 'Disetujui PPK'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                            : r.statusValidation === 'Ditolak'
                            ? 'bg-rose-950 text-rose-300 border border-rose-700'
                            : 'bg-amber-950 text-amber-300 border border-amber-700'
                        }`}
                      >
                        {r.statusValidation || 'Disetujui PPK'}
                      </span>
                    </td>
                    {isPPK && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleApprove(r.id, true)}
                            className="rounded-lg bg-emerald-900/80 px-2.5 py-1 text-[11px] font-bold text-emerald-200 hover:bg-emerald-700"
                            title="Setujui Dokumen SP2D"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 inline mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleApprove(r.id, false)}
                            className="rounded-lg bg-rose-900/80 px-2.5 py-1 text-[11px] font-bold text-rose-200 hover:bg-rose-700"
                            title="Tolak untuk Revisi"
                          >
                            <XCircle className="h-3.5 w-3.5 inline mr-1" />
                            Tolak
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
