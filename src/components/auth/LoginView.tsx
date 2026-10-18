import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
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
      }
    }, 350);
  };

  return (
    <div className="min-h-screen w-full bg-[#171F2A] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#234493]/25 via-[#212B36]/80 to-[#171F2A] text-slate-100 flex flex-col justify-between font-sans selection:bg-[#234493] selection:text-white">
      {/* Top Banner Navigation Identity - Harmonized with NTB Official Colors */}
      <header className="login-page-header w-full border-b border-[#2D3A4B] bg-[#171F2A]/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#212B36] border border-[#2D3A4B] overflow-hidden flex items-center justify-center p-0.5 shadow-xs">
            <img
              src="/app-logo.jpg"
              alt="Logo NTB"
              className="h-full w-full object-cover rounded-lg"
              onError={(e) => { e.currentTarget.src = './favicon.png'; }}
            />
          </div>
          <div>
            <div className="login-identity-title text-[10px] font-bold uppercase tracking-wider text-white">
              PEMERINTAH PROVINSI NUSA TENGGARA BARAT
            </div>
            <div className="login-identity-subtitle text-xs sm:text-sm font-extrabold text-white tracking-tight">
              BAKESBANGPOLDAGRI NTB • BFMS
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[11px] font-bold text-emerald-300">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>NTB MAKMUR MENDUNIA</span>
          </span>
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-[#212B36] border border-[#2D3A4B] text-slate-200">
            TA {selectedTahun}
          </span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 my-auto">
        <div className="w-full max-w-md my-4">
          {/* Form Login Card with background matching the official NTB logo image (#212B36) */}
          <div className="login-card-dark rounded-2xl border border-[#2D3A4B] bg-[#212B36] shadow-2xl p-6 sm:p-8 space-y-6 relative border-t-2 border-t-[#234493]">
            
            {/* Header & Logo Badge */}
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-[#171F2A] border border-[#2D3A4B] p-2 shadow-inner">
                <img
                  src="/app-logo.jpg"
                  alt="Logo Pemprov NTB"
                  className="h-full w-full object-contain rounded-xl"
                  onError={(e) => { e.currentTarget.src = './favicon.png'; }}
                />
              </div>

              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-950/60 border border-emerald-500/40">
                  NTB MAKMUR MENDUNIA
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5">
                  Login Sistem Keuangan
                </h1>
                <p className="text-xs text-slate-300 max-w-xs mx-auto mt-0.5">
                  Masuk menggunakan akun resmi untuk mengakses data anggaran &amp; realisasi keuangan daerah
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-950/70 border border-rose-700/60 text-rose-200 text-xs shadow-xs animate-fadeIn">
                <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-rose-100">Gagal Masuk:</div>
                  <div className="text-[11px] leading-relaxed text-rose-300">{errorMessage}</div>
                </div>
              </div>
            )}

            {/* Success Message Box */}
            {loginSuccessNotice && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 text-xs shadow-xs animate-fadeIn">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-emerald-100">{loginSuccessNotice}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-200">
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
                    placeholder="Masukkan username akun..."
                    autoFocus
                    className="w-full rounded-xl bg-[#171F2A] border border-[#2D3A4B] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:border-[#3984E8] focus:ring-2 focus:ring-[#3984E8]/20 transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-200">
                    Kata Sandi (Password):
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">
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
                    className="w-full rounded-xl bg-[#171F2A] border border-[#2D3A4B] pl-10 pr-11 py-2.5 text-xs sm:text-sm font-mono font-semibold text-white placeholder:text-slate-400 focus:outline-none focus:border-[#3984E8] focus:ring-2 focus:ring-[#3984E8]/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition cursor-pointer"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button - NTB Royal Cobalt Blue (#234493) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#234493] hover:bg-[#1C3675] p-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-[#234493]/30 transition active:scale-[0.99] disabled:opacity-60 cursor-pointer border border-[#3984E8]/40"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 text-white" />
                    <span>Masuk ke Sistem Keuangan</span>
                    <ArrowRight className="h-4 w-4 text-blue-200 ml-1" />
                  </>
                )}
              </button>
            </form>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-2 border-t border-[#2D3A4B]">
              <ShieldAlert className="h-3.5 w-3.5 text-emerald-400" />
              <span>Sistem Terotentikasi &amp; Terintegrasi Kasda Pemprov NTB</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="login-page-footer w-full border-t border-[#2D3A4B] bg-[#171F2A]/90 px-4 py-3 text-center text-xs space-y-1">
        <div>
          <strong className="login-footer-slogan text-white font-extrabold tracking-wide">
            BANGKIT BERSAMA! NTB MAKMUR MENDUNIA
          </strong>
        </div>
        <div className="login-footer-copy text-[11px] text-white">
          © {new Date().getFullYear()} Badan Kesatuan Bangsa dan Politik Dalam Negeri • Pemerintah Provinsi Nusa Tenggara Barat
        </div>
      </footer>
    </div>
  );
};
