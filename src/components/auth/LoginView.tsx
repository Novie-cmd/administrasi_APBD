import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  Building2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  ShieldAlert
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, selectedTahun } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccessNotice, setLoginSuccessNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const res = login(username, password);
      if (!res.success) {
        setErrorMessage(res.message);
        setIsLoading(false);
      } else {
        setLoginSuccessNotice(res.message);
        // Page state will transition smoothly via isAuthenticated
      }
    }, 350);
  };

  const handleSelectQuickAccount = (uname: string, pass: string) => {
    setUsername(uname);
    setPassword(pass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-cyan-500 selection:text-black">
      {/* Dynamic Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[550px] h-[550px] rounded-full bg-emerald-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-amber-500/5 blur-[160px] pointer-events-none" />

      {/* Top Banner Navigation Identity */}
      <header className="relative z-10 w-full border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 border border-amber-500/50 shadow-md shadow-amber-500/10 overflow-hidden flex items-center justify-center">
            <img src="/app-logo.jpg" alt="Logo NTB" className="h-full w-full object-cover" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
              PEMERINTAH PROVINSI NUSA TENGGARA BARAT
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
              BAKESBANGPOLDAGRI NTB • BFMS
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/70 text-[11px] font-bold text-cyan-300">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>NTB MAKMUR MENDUNIA</span>
          </span>
          <span className="text-[11px] font-mono px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
            TA {selectedTahun}
          </span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Card Frame with Glow Border */}
          <div className="relative rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl backdrop-blur-xl p-6 sm:p-8 space-y-6">
            
            {/* Header & Logo Badge */}
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500/20 via-cyan-500/20 to-emerald-500/20 border border-amber-500/40 p-2 shadow-inner">
                <img src="/app-logo.jpg" alt="Logo Pemprov NTB" className="h-full w-full object-contain rounded-xl" />
              </div>

              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-amber-300 bg-amber-950/80 border border-amber-600/40">
                  NTB MAKMUR MENDUNIA
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
                  Login Sistem Keuangan
                </h1>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Silakan masuk menggunakan akun resmi untuk mengakses pengelolaan anggaran &amp; realisasi NTB
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-950/90 border border-rose-600/70 text-rose-200 text-xs shadow-lg animate-fadeIn">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-white">Gagal Masuk:</div>
                  <div className="text-[11px] leading-relaxed text-rose-200">{errorMessage}</div>
                </div>
              </div>
            )}

            {/* Success Message Box */}
            {loginSuccessNotice && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-500/70 text-emerald-200 text-xs shadow-lg animate-fadeIn">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-white">{loginSuccessNotice}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Username Akun:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: Kepala Badan atau Admin"
                    autoFocus
                    className="w-full rounded-xl bg-slate-950 border border-slate-700/80 pl-10 pr-3.5 py-3 text-xs sm:text-sm font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">
                    Kata Sandi (Password):
                  </label>
                  <span className="text-[10px] text-cyan-400/80 font-mono">
                    Sensitif huruf besar/kecil
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full rounded-xl bg-slate-950 border border-slate-700/80 pl-10 pr-11 py-3 text-xs sm:text-sm font-mono font-semibold text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 via-cyan-500 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 p-3.5 text-xs sm:text-sm font-bold text-white shadow-xl shadow-cyan-950 transition active:scale-[0.98] disabled:opacity-60 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 text-emerald-200" />
                    <span>Masuk ke Sistem Keuangan</span>
                    <ArrowRight className="h-4 w-4 text-cyan-200 ml-1" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Access Account Cards */}
            <div className="pt-2 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 px-1">
                <span className="flex items-center gap-1 text-slate-300">
                  <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                  <span>Pilih Akun Cepat (Sesuai Ketetapan):</span>
                </span>
                <span className="text-[10px] text-cyan-400">Klik untuk isi otomatis</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Account 1: Kepala Badan */}
                <button
                  type="button"
                  onClick={() => handleSelectQuickAccount('Kepala Badan', 'Kaban123')}
                  className={`group text-left p-3 rounded-2xl border transition relative overflow-hidden ${
                    username === 'Kepala Badan'
                      ? 'bg-amber-950/60 border-amber-500/80 ring-1 ring-amber-500/40'
                      : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 hover:border-amber-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                      Kepala Badan
                    </span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                      Kaban
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-amber-200 transition">
                    Kepala Badan
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Pass: <span className="text-amber-300 font-bold">Kaban123</span>
                  </div>
                </button>

                {/* Account 2: Admin */}
                <button
                  type="button"
                  onClick={() => handleSelectQuickAccount('Admin', 'Admin123')}
                  className={`group text-left p-3 rounded-2xl border transition relative overflow-hidden ${
                    username === 'Admin'
                      ? 'bg-cyan-950/60 border-cyan-500/80 ring-1 ring-cyan-500/40'
                      : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400">
                      Administrator
                    </span>
                    <span className="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white group-hover:text-cyan-200 transition">
                    Admin
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Pass: <span className="text-cyan-300 font-bold">Admin123</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1">
              <ShieldAlert className="h-3.5 w-3.5 text-emerald-400" />
              <span>Sistem Terotentikasi &amp; Terintegrasi Kasda Pemprov NTB</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-4 py-3 text-center text-xs text-slate-400 space-y-0.5">
        <div>
          <strong className="text-slate-300">BANGKIT BERSAMA! NTB MAKMUR MENDUNIA</strong>
        </div>
        <div className="text-[11px] text-slate-400">
          © {new Date().getFullYear()} Badan Kesatuan Bangsa dan Politik Dalam Negeri • Pemerintah Provinsi Nusa Tenggara Barat
        </div>
      </footer>
    </div>
  );
};
