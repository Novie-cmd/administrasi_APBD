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
    <div className="min-h-screen w-full bg-[#F4F7FB] text-[#17324D] flex flex-col justify-between font-sans selection:bg-[#079669] selection:text-white">
      {/* Top Banner Navigation Identity - Clean Government Terang */}
      <header className="w-full border-b border-[#DFE6EF] bg-[#FFFFFF] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#F4F7FB] border border-[#DFE6EF] overflow-hidden flex items-center justify-center p-0.5 shadow-xs">
            <img
              src="/app-logo.jpg"
              alt="Logo NTB"
              className="h-full w-full object-cover rounded-lg"
              onError={(e) => { e.currentTarget.src = './favicon.png'; }}
            />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#079669]">
              PEMERINTAH PROVINSI NUSA TENGGARA BARAT
            </div>
            <div className="text-xs sm:text-sm font-extrabold text-[#17324D] tracking-tight">
              BAKESBANGPOLDAGRI NTB • BFMS
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-[#079669]">
            <Sparkles className="h-3.5 w-3.5 text-[#079669]" />
            <span>NTB MAKMUR MENDUNIA</span>
          </span>
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-[#F4F7FB] border border-[#DFE6EF] text-[#17324D]">
            TA {selectedTahun}
          </span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 my-auto">
        <div className="w-full max-w-md my-4">
          {/* Pure White Card with Clean Government Border */}
          <div className="rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] shadow-sm p-6 sm:p-8 space-y-6">
            
            {/* Header & Logo Badge */}
            <div className="text-center space-y-2">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 p-2 shadow-xs">
                <img
                  src="/app-logo.jpg"
                  alt="Logo Pemprov NTB"
                  className="h-full w-full object-contain rounded-xl"
                  onError={(e) => { e.currentTarget.src = './favicon.png'; }}
                />
              </div>

              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest text-[#079669] bg-emerald-50 border border-emerald-200">
                  NTB MAKMUR MENDUNIA
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-[#17324D] tracking-tight mt-1.5">
                  Login Sistem Keuangan
                </h1>
                <p className="text-xs text-[#64748B] max-w-xs mx-auto mt-0.5">
                  Masuk menggunakan akun resmi untuk mengakses data anggaran &amp; realisasi keuangan daerah
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs shadow-xs animate-fadeIn">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-rose-900">Gagal Masuk:</div>
                  <div className="text-[11px] leading-relaxed text-rose-700">{errorMessage}</div>
                </div>
              </div>
            )}

            {/* Success Message Box */}
            {loginSuccessNotice && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs shadow-xs animate-fadeIn">
                <CheckCircle2 className="h-4 w-4 text-[#079669] shrink-0" />
                <span className="font-bold text-emerald-900">{loginSuccessNotice}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#17324D]">
                  Username Akun:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: Kepala Badan atau Admin"
                    autoFocus
                    className="w-full rounded-xl bg-[#FFFFFF] border border-[#DFE6EF] pl-10 pr-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#17324D] placeholder:text-[#64748B] focus:outline-none focus:border-[#079669] focus:ring-2 focus:ring-[#079669]/20 transition"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#17324D]">
                    Kata Sandi (Password):
                  </label>
                  <span className="text-[10px] text-[#64748B] font-mono">
                    Sensitif huruf besar/kecil
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full rounded-xl bg-[#FFFFFF] border border-[#DFE6EF] pl-10 pr-11 py-2.5 text-xs sm:text-sm font-mono font-semibold text-[#17324D] placeholder:text-[#64748B] focus:outline-none focus:border-[#079669] focus:ring-2 focus:ring-[#079669]/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] hover:text-[#17324D] transition"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button - Emerald Accent */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#079669] hover:bg-[#065f46] p-3 text-xs sm:text-sm font-bold text-white shadow-xs transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
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
                    <ArrowRight className="h-4 w-4 text-emerald-100 ml-1" />
                  </>
                )}
              </button>
            </form>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#64748B] pt-2 border-t border-[#DFE6EF]">
              <ShieldAlert className="h-3.5 w-3.5 text-[#079669]" />
              <span>Sistem Terotentikasi &amp; Terintegrasi Kasda Pemprov NTB</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#DFE6EF] bg-[#FFFFFF] px-4 py-3 text-center text-xs text-[#64748B] space-y-0.5">
        <div>
          <strong className="text-[#17324D]">BANGKIT BERSAMA! NTB MAKMUR MENDUNIA</strong>
        </div>
        <div className="text-[11px] text-[#64748B]">
          © {new Date().getFullYear()} Badan Kesatuan Bangsa dan Politik Dalam Negeri • Pemerintah Provinsi Nusa Tenggara Barat
        </div>
      </footer>
    </div>
  );
};
