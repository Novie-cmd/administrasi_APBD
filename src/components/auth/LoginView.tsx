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
  Check
} from 'lucide-react';

export type LoginTheme = 'emerald' | 'blue' | 'purple' | 'amber';

interface ThemeConfig {
  id: LoginTheme;
  name: string;
  dotColor: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
  titleText: string;
  subtitleText: string;
  labelText: string;
  inputBorder: string;
  inputFocusBorder: string;
  inputFocusRing: string;
  inputIcon: string;
  buttonBg: string;
  buttonHoverBg: string;
  buttonShadow: string;
  cornerBlobTop: string;
  cornerBlobBottom: string;
  accentBadge: string;
  logoGlow: string;
}

const THEME_CONFIGS: Record<LoginTheme, ThemeConfig> = {
  emerald: {
    id: 'emerald',
    name: 'Hijau NTB Makmur',
    dotColor: 'bg-emerald-600',
    pillBg: 'bg-[#EBFBF3]',
    pillText: 'text-[#15803D]',
    pillBorder: 'border-[#BBF7D0]',
    titleText: 'text-[#064E3B]',
    subtitleText: 'text-[#334155]',
    labelText: 'text-[#14532D]',
    inputBorder: 'border-[#A7F3D0]',
    inputFocusBorder: 'focus:border-[#059669]',
    inputFocusRing: 'focus:ring-[#059669]/15',
    inputIcon: 'text-[#059669]',
    buttonBg: 'bg-[#059669]',
    buttonHoverBg: 'hover:bg-[#047857]',
    buttonShadow: 'shadow-emerald-600/25',
    cornerBlobTop: 'text-emerald-100/80',
    cornerBlobBottom: 'text-emerald-100/80',
    accentBadge: 'text-[#059669]',
    logoGlow: 'border-emerald-200 bg-emerald-50/50'
  },
  blue: {
    id: 'blue',
    name: 'Biru Samudra',
    dotColor: 'bg-blue-600',
    pillBg: 'bg-[#EBF3FF]',
    pillText: 'text-[#1D4ED8]',
    pillBorder: 'border-[#BFDBFE]',
    titleText: 'text-[#1E3A8A]',
    subtitleText: 'text-[#334155]',
    labelText: 'text-[#1E3A8A]',
    inputBorder: 'border-[#BFDBFE]',
    inputFocusBorder: 'focus:border-[#2563EB]',
    inputFocusRing: 'focus:ring-[#2563EB]/15',
    inputIcon: 'text-[#2563EB]',
    buttonBg: 'bg-[#2563EB]',
    buttonHoverBg: 'hover:bg-[#1D4ED8]',
    buttonShadow: 'shadow-blue-600/25',
    cornerBlobTop: 'text-blue-100/80',
    cornerBlobBottom: 'text-blue-100/80',
    accentBadge: 'text-[#2563EB]',
    logoGlow: 'border-blue-200 bg-blue-50/50'
  },
  purple: {
    id: 'purple',
    name: 'Ungu Elegan',
    dotColor: 'bg-indigo-600',
    pillBg: 'bg-[#F3EEFF]',
    pillText: 'text-[#6D28D9]',
    pillBorder: 'border-[#DDD6FE]',
    titleText: 'text-[#4C1D95]',
    subtitleText: 'text-[#334155]',
    labelText: 'text-[#4C1D95]',
    inputBorder: 'border-[#DDD6FE]',
    inputFocusBorder: 'focus:border-[#6366F1]',
    inputFocusRing: 'focus:ring-[#6366F1]/15',
    inputIcon: 'text-[#6366F1]',
    buttonBg: 'bg-[#6366F1]',
    buttonHoverBg: 'hover:bg-[#4F46E5]',
    buttonShadow: 'shadow-indigo-600/25',
    cornerBlobTop: 'text-indigo-100/80',
    cornerBlobBottom: 'text-indigo-100/80',
    accentBadge: 'text-[#6366F1]',
    logoGlow: 'border-indigo-200 bg-indigo-50/50'
  },
  amber: {
    id: 'amber',
    name: 'Oranye Hangat',
    dotColor: 'bg-orange-500',
    pillBg: 'bg-[#FFF7ED]',
    pillText: 'text-[#C2410C]',
    pillBorder: 'border-[#FED7AA]',
    titleText: 'text-[#7C2D12]',
    subtitleText: 'text-[#334155]',
    labelText: 'text-[#7C2D12]',
    inputBorder: 'border-[#FED7AA]',
    inputFocusBorder: 'focus:border-[#F97316]',
    inputFocusRing: 'focus:ring-[#F97316]/15',
    inputIcon: 'text-[#F97316]',
    buttonBg: 'bg-[#F97316]',
    buttonHoverBg: 'hover:bg-[#EA580C]',
    buttonShadow: 'shadow-orange-500/25',
    cornerBlobTop: 'text-amber-100/80',
    cornerBlobBottom: 'text-amber-100/80',
    accentBadge: 'text-[#EA580C]',
    logoGlow: 'border-amber-200 bg-amber-50/50'
  }
};

export const LoginView: React.FC = () => {
  const { login, selectedTahun } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginSuccessNotice, setLoginSuccessNotice] = useState<string | null>(null);

  // Theme selection: loads saved preference or defaults to 'emerald' (top-right in user example)
  const [themeKey, setThemeKey] = useState<LoginTheme>(() => {
    try {
      const saved = localStorage.getItem('bfms_login_theme');
      if (saved && saved in THEME_CONFIGS) {
        return saved as LoginTheme;
      }
    } catch {}
    return 'emerald';
  });

  const currentTheme = THEME_CONFIGS[themeKey] || THEME_CONFIGS.emerald;

  const handleSelectTheme = (key: LoginTheme) => {
    setThemeKey(key);
    try {
      localStorage.setItem('bfms_login_theme', key);
    } catch {}
  };

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
    <div className="min-h-screen w-full bg-[#E9EEF5] text-slate-800 flex flex-col justify-between font-sans selection:bg-[#059669] selection:text-white">
      {/* Top Banner Navigation Identity - Clean official dark header with crisp white text */}
      <header className="login-page-header w-full border-b border-[#2D3A4B] bg-[#171F2A] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-md">
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
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-[11px] font-bold text-white">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>NTB MAKMUR MENDUNIA</span>
          </span>
          <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-[#212B36] border border-[#2D3A4B] text-white">
            TA {selectedTahun}
          </span>
        </div>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 my-auto">
        {/* Color Palette Switcher from User's Example Image */}
        <div className="mb-4 flex items-center gap-2 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 mr-1">Warna Form:</span>
          {(Object.keys(THEME_CONFIGS) as LoginTheme[]).map((key) => {
            const th = THEME_CONFIGS[key];
            const isSelected = themeKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectTheme(key)}
                title={`Pilih Warna ${th.name}`}
                className={`relative flex items-center justify-center h-6 w-6 rounded-full ${th.dotColor} transition-transform ${
                  isSelected ? 'scale-110 ring-2 ring-offset-2 ring-slate-400 shadow-sm' : 'opacity-70 hover:opacity-100 hover:scale-105'
                }`}
              >
                {isSelected && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
              </button>
            );
          })}
        </div>

        <div className="w-full max-w-md my-2">
          {/* Form Login Card with Exact Bright Clean Styling Matching the Reference Image */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden transition-all duration-300">
            
            {/* Top-Right Decorative Curve Blob */}
            <svg
              className={`absolute -top-10 -right-10 w-44 h-44 ${currentTheme.cornerBlobTop} pointer-events-none transition-colors duration-300`}
              viewBox="0 0 200 200"
              fill="currentColor"
            >
              <path
                d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C86.9,14.6,81.2,29.1,72.4,41.4C63.6,53.7,51.7,63.7,38.3,70.9C24.9,78.1,10,82.4,-4.4,85C-18.7,87.6,-32.5,88.4,-44.7,82.7C-56.9,77,-67.5,64.8,-74.6,51.2C-81.8,37.5,-85.4,22.5,-85.1,7.9C-84.8,-6.8,-80.6,-21.1,-72.7,-33.2C-64.8,-45.3,-53.2,-55.2,-40.4,-63C-27.6,-70.7,-13.8,-76.3,0.7,-77.5C15.2,-78.7,30.5,-75.6,44.7,-76.4Z"
                transform="translate(100 100)"
              />
            </svg>

            {/* Bottom-Left Decorative Curve Blob */}
            <svg
              className={`absolute -bottom-10 -left-10 w-44 h-44 ${currentTheme.cornerBlobBottom} pointer-events-none transition-colors duration-300`}
              viewBox="0 0 200 200"
              fill="currentColor"
            >
              <path
                d="M48.8,-77.3C61.4,-70.8,68.6,-54.9,73.5,-39.9C78.3,-24.8,80.8,-10.6,79.5,3.3C78.2,17.2,73.2,30.7,65.2,42.4C57.1,54.1,46,64,33.3,70.8C20.6,77.6,6.3,81.4,-7.8,82.2C-21.9,83,-35.8,80.7,-48.1,74.1C-60.5,67.5,-71.4,56.5,-78.7,43.2C-86.1,29.9,-89.9,14.3,-88.9,-1.1C-87.9,-16.5,-82.1,-31.6,-73.2,-44.2C-64.3,-56.8,-52.3,-66.8,-39.1,-73.1C-25.9,-79.4,-11.5,-82,2.7,-86.2C16.9,-90.4,36.2,-83.8,48.8,-77.3Z"
                transform="translate(100 100)"
              />
            </svg>
            
            {/* Header & Logo Badge */}
            <div className="relative z-10 text-center space-y-2.5">
              <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-2xl border ${currentTheme.logoGlow} p-2 shadow-xs transition-colors duration-300`}>
                <img
                  src="/app-logo.jpg"
                  alt="Logo Pemprov NTB"
                  className="h-full w-full object-contain rounded-xl"
                  onError={(e) => { e.currentTarget.src = './favicon.png'; }}
                />
              </div>

              <div>
                <span className={`inline-block px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${currentTheme.pillBg} ${currentTheme.pillText} border ${currentTheme.pillBorder} transition-colors duration-300`}>
                  NTB MAKMUR MENDUNIA
                </span>
                <h1 className={`text-2xl font-black ${currentTheme.titleText} tracking-tight mt-2 transition-colors duration-300`}>
                  Login Sistem Keuangan
                </h1>
                <p className={`text-xs ${currentTheme.subtitleText} max-w-xs mx-auto mt-1 leading-relaxed`}>
                  Masuk menggunakan akun resmi untuk mengakses data anggaran &amp; realisasi keuangan daerah
                </p>
              </div>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="relative z-10 flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs shadow-xs animate-fadeIn">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold text-rose-900">Gagal Masuk:</div>
                  <div className="text-[11px] leading-relaxed text-rose-700">{errorMessage}</div>
                </div>
              </div>
            )}

            {/* Success Message Box */}
            {loginSuccessNotice && (
              <div className="relative z-10 flex items-center gap-2.5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs shadow-xs animate-fadeIn">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span className="font-bold text-emerald-900">{loginSuccessNotice}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
              {/* Username Field */}
              <div className="space-y-1.5">
                <label className={`block text-xs font-bold ${currentTheme.labelText}`}>
                  Username Akun:
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${currentTheme.inputIcon}`}>
                    <UserIcon className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username akun..."
                    autoFocus
                    className={`w-full rounded-2xl bg-white border ${currentTheme.inputBorder} ${currentTheme.inputFocusBorder} focus:ring-4 ${currentTheme.inputFocusRing} pl-10 pr-3.5 py-3 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none transition shadow-xs`}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className={`block text-xs font-bold ${currentTheme.labelText}`}>
                    Kata Sandi (Password):
                  </label>
                  <span className={`text-[10px] ${currentTheme.accentBadge} font-mono font-medium`}>
                    Sensitif huruf besar/kecil
                  </span>
                </div>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${currentTheme.inputIcon}`}>
                    <Lock className="h-4.5 w-4.5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className={`w-full rounded-2xl bg-white border ${currentTheme.inputBorder} ${currentTheme.inputFocusBorder} focus:ring-4 ${currentTheme.inputFocusRing} pl-10 pr-11 py-3 text-xs sm:text-sm font-mono font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none transition shadow-xs`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                    title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-2 rounded-2xl ${currentTheme.buttonBg} ${currentTheme.buttonHoverBg} p-3.5 text-xs sm:text-sm font-bold text-white shadow-lg ${currentTheme.buttonShadow} transition-all duration-200 active:scale-[0.99] disabled:opacity-60 cursor-pointer mt-2`}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4.5 w-4.5 text-white" />
                    <span>Masuk ke Sistem Keuangan</span>
                    <ArrowRight className="h-4.5 w-4.5 text-white/90 ml-1" />
                  </>
                )}
              </button>
            </form>

            {/* Security Badge */}
            <div className="relative z-10 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-3 border-t border-slate-100">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Sistem Terotentikasi &amp; Terintegrasi Kasda Pemprov NTB</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer - Clean official dark footer with crisp white text as requested */}
      <footer className="login-page-footer w-full border-t border-[#2D3A4B] bg-[#171F2A] px-4 py-3 text-center text-xs space-y-1">
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
