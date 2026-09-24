import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  Clock,
  Edit3,
  Search,
  MessageSquare,
  Trash2
} from 'lucide-react';

export const KoreksiDataView: React.FC = () => {
  const {
    selectedTahun,
    realisasiList,
    approveRealisasiPPK,
    updateRealisasi,
    deleteBatchRealisasi,
    currentUser
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [catatan, setCatatan] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const currentList = realisasiList.filter(r => Number(r.tahun) === Number(selectedTahun));

  const isPPK = currentUser.role === 'PPK' || currentUser.role === 'Administrator';

  const filteredItems = currentList.filter(
    r =>
      (filterStatus === 'all' || (r.statusValidation || 'Disetujui PPK') === filterStatus) &&
      (r.noSP2D.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.uraian.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isAllSelected = filteredItems.length > 0 && selectedIds.length === filteredItems.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < filteredItems.length;

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(r => r.id));
    }
  };

  const handleToggleSelectRow = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleApprove = (id: string, isApproved: boolean) => {
    approveRealisasiPPK(id, isApproved, catatan);
    setSelectedId(null);
    setCatatan('');
  };

  const handleBulkApprove = (isApproved: boolean) => {
    if (selectedIds.length === 0) return;
    const actionLabel = isApproved ? 'Setujui' : 'Tolak';
    if (confirm(`${actionLabel} ${selectedIds.length} dokumen SP2D yang dipilih?`)) {
      selectedIds.forEach(id => approveRealisasiPPK(id, isApproved, 'Validasi Massal'));
      setSelectedIds([]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Hapus ${selectedIds.length} data realisasi yang dipilih secara permanen?`)) {
      deleteBatchRealisasi(selectedIds);
      setSelectedIds([]);
    }
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
        <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Daftar Verifikasi Dokumen SP2D PPK
          </h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Cari SP2D, Uraian, Operator..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="rounded-xl border border-slate-700 bg-slate-950 pl-9 pr-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>
        </div>

        {/* Selection Strip */}
        <div className={`px-4 py-2.5 border-b text-xs flex flex-wrap items-center justify-between gap-3 transition-colors ${
          selectedIds.length > 0
            ? 'bg-gradient-to-r from-emerald-950/95 via-slate-900 to-rose-950/80 border-emerald-500/50 text-white shadow-inner animate-fadeIn'
            : 'bg-slate-950/60 border-slate-800 text-slate-400'
        }`}>
          {selectedIds.length > 0 ? (
            <>
              <div className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-300">
                  <CheckSquare className="h-3.5 w-3.5" />
                </span>
                <span className="font-bold text-emerald-200">
                  {selectedIds.length} dokumen SP2D dipilih
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Batal
                </button>
                {isPPK && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleBulkApprove(true)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Setujui ({selectedIds.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkApprove(false)}
                      className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow transition"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Tolak ({selectedIds.length})</span>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Hapus ({selectedIds.length})</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-[11px] text-emerald-300/80">
              <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <strong className="text-emerald-300">Fitur Checklist Aktif:</strong> Centang kotak pada kolom <strong>PILIH</strong> untuk memproses atau menghapus banyak dokumen SP2D sekaligus.
              </span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 font-bold uppercase border-b border-slate-800">
              <tr>
                <th className="px-3 py-3 text-center w-12 bg-slate-900/90 border-r border-slate-800">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      ref={el => {
                        if (el) el.indeterminate = isPartiallySelected;
                      }}
                      onChange={handleToggleSelectAll}
                      className="h-4 w-4 rounded border-2 border-emerald-400 bg-slate-950 text-emerald-500 focus:ring-2 focus:ring-emerald-400 cursor-pointer accent-emerald-500 shadow"
                      title={isAllSelected ? "Batal pilih semua" : "Pilih semua data"}
                    />
                    <span className="text-[9px] font-extrabold text-emerald-300 tracking-wider">PILIH</span>
                  </div>
                </th>
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
              {filteredItems.map(r => {
                const isChecked = selectedIds.includes(r.id);
                return (
                  <tr
                    key={r.id}
                    onClick={() => handleToggleSelectRow(r.id)}
                    className={`transition cursor-pointer select-none ${
                      isChecked
                        ? 'bg-emerald-950/40 hover:bg-emerald-950/60 text-white'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="px-3 py-3 text-center border-r border-slate-800/80 bg-slate-900/30" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => handleToggleSelectRow(r.id, e as any)}
                          className="h-4 w-4 rounded border-2 border-emerald-400 bg-slate-950 text-emerald-500 focus:ring-2 focus:ring-emerald-400 cursor-pointer accent-emerald-500 shadow"
                        />
                      </div>
                    </td>
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
                      <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
