import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  Monitor,
  Download,
  X,
  Share,
  PlusSquare,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { NTBLogo } from './NTBLogo';

export const PWAInstallModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isInIframe, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'hp' | 'laptop'>('hp');
  const [copied, setCopied] = useState(false);
  const [installStatus, setInstallStatus] = useState<'idle' | 'installing' | 'success' | 'manual'>('idle');
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    // Detect mobile device to set default tab
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent.toLowerCase();
      const isMobile = /iphone|ipad|ipod|android|mobile/.test(ua);
      setActiveTab(isMobile ? 'hp' : 'laptop');

      // Detect in-app browsers like WhatsApp, FB, Instagram, Line
      const inApp = /fban|fbav|instagram|line|micromessenger|whatsapp|wv/.test(ua);
      setIsInAppBrowser(inApp);
    }
  }, [isOpen]);

  const handleInstallClick = async () => {
    setInstallStatus('installing');
    try {
      const success = await install();
      if (success) {
        setInstallStatus('success');
      } else {
        // If programmatic prompt is not available or dismissed, fallback to manual instructions
        setInstallStatus('manual');
      }
    } catch (e) {
      console.warn('Install error:', e);
      setInstallStatus('manual');
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      const cleanUrl = window.location.href.split('#')[0];
      navigator.clipboard.writeText(cleanUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const handleOpenInBrowser = () => {
    if (typeof window !== 'undefined') {
      const cleanUrl = window.location.href.split('#')[0];
      window.open(cleanUrl, '_blank');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/30 bg-slate-900 p-5 sm:p-6 shadow-2xl ring-1 ring-amber-500/20 overflow-hidden text-white max-h-[92vh] overflow-y-auto scrollbar-thin">
        {/* Glow Background Effects */}
        <div className="absolute -top-12 -right-12 h-44 w-44 rounded-full bg-emerald-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          aria-label="Tutup"
          id="btn-close-pwa-modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with NTB Official Logo */}
        <div className="flex flex-col items-center text-center space-y-2 pt-1">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-emerald-600 via-amber-500 to-teal-500 opacity-75 blur transition group-hover:opacity-100" />
            <div className="relative h-20 w-20 rounded-2xl overflow-hidden shadow-2xl border border-amber-400/50 bg-slate-950 flex items-center justify-center">
              <NTBLogo size={74} />
            </div>
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-950 text-emerald-300 border border-emerald-700/60 shadow-inner">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Aplikasi Web Resmi (PWA)</span>
            </span>
            <h2 className="mt-1.5 text-xl font-black tracking-tight text-white sm:text-2xl">
              Instal Aplikasi di HP & Laptop
            </h2>
            <p className="mt-1 text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
              Sistem Informasi Keuangan BAKESBANGPOLDAGRI Provinsi NTB — Akses Cepat Langsung dari Layar Utama HP
            </p>
          </div>
        </div>

        {/* In-App Browser Warning Alert (e.g. WhatsApp, Instagram, Telegram) */}
        {isInAppBrowser && (
          <div className="mt-3.5 rounded-2xl border border-amber-500/40 bg-amber-950/40 p-3 text-xs text-amber-200 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" />
              <span>Membuka di Browser Internal (In-App)</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              Browser WhatsApp/Instagram membatasi pemasangan aplikasi ke layar HP. Silakan buka halaman ini di browser utama HP Anda:
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleOpenInBrowser}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-2 text-xs transition shadow"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Buka di Chrome / Safari</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 text-xs transition border border-slate-700"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Device Switcher Tabs (HP vs Laptop) */}
        <div className="mt-4 grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('hp')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'hp'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            id="tab-pwa-hp"
          >
            <Smartphone className="h-4 w-4" />
            <span>HP (Android / iOS)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('laptop')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'laptop'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            id="tab-pwa-laptop"
          >
            <Monitor className="h-4 w-4" />
            <span>Laptop / Komputer</span>
          </button>
        </div>

        {/* Action Content Area */}
        <div className="mt-4 space-y-3">
          {isInstalled ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-center text-emerald-200 space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto animate-bounce" />
              <h3 className="text-sm font-bold text-white">Aplikasi Sudah Terpasang!</h3>
              <p className="text-xs text-emerald-300/90 leading-relaxed">
                Aplikasi Sistem Informasi Keuangan BFMS NTB sudah aktif di Layar Utama HP / Laptop Anda sebagai Aplikasi Mandiri (PWA).
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2 transition shadow"
              >
                Selesai / Lanjut Menggunakan
              </button>
            </div>
          ) : (
            <>
              {/* PRIMARY ACTION BUTTON: Always clickable and responsive */}
              {isInstallable ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 px-5 py-3.5 text-sm font-black text-white shadow-xl shadow-emerald-950/50 hover:brightness-110 active:scale-95 transition group"
                  id="btn-install-pwa-direct"
                >
                  <Download className="h-5 w-5 text-amber-200 group-hover:translate-y-0.5 transition-transform" />
                  <span>Pasang Aplikasi ke {activeTab === 'hp' ? 'HP' : 'Laptop'} (1-Klik)</span>
                  <ArrowRight className="h-4 w-4 text-white" />
                </button>
              ) : isInIframe ? (
                <button
                  type="button"
                  onClick={handleOpenInBrowser}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/40 hover:brightness-110 active:scale-95 transition"
                  id="btn-open-new-tab-install"
                >
                  <ExternalLink className="h-4 w-4 text-cyan-200" />
                  <span>Buka di Tab Baru / Browser Penuh untuk Pasang</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:brightness-110 active:scale-95 transition"
                  id="btn-install-pwa-trigger"
                >
                  <Download className="h-5 w-5 text-teal-200" />
                  <span>Pasang Aplikasi Sekarang</span>
                </button>
              )}

              {/* Step-by-Step Device Guide */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                    {activeTab === 'hp' ? (
                      <Smartphone className="h-4 w-4 text-amber-400" />
                    ) : (
                      <Monitor className="h-4 w-4 text-cyan-400" />
                    )}
                    <span>
                      {activeTab === 'hp'
                        ? isIOS
                          ? 'Cara Pasang di iPhone / iPad (Safari)'
                          : 'Cara Pasang di HP Android (Chrome / Edge)'
                        : 'Cara Pasang di Laptop / Komputer'}
                    </span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold">PWA Native</span>
                </div>

                {activeTab === 'hp' ? (
                  isIOS ? (
                    /* iOS Safari Instructions */
                    <div className="space-y-2.5 text-xs text-slate-300">
                      <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-950 text-amber-300 border border-amber-800 font-mono font-bold text-xs">
                          1
                        </span>
                        <p className="text-slate-200">
                          Buka link aplikasi di browser <strong className="text-white font-bold">Safari</strong> di iPhone Anda.
                        </p>
                      </div>

                      <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-950 text-amber-300 border border-amber-800 font-mono font-bold text-xs">
                          2
                        </span>
                        <div className="space-y-1">
                          <p className="text-slate-200">
                            Ketuk tombol <strong className="text-amber-300 inline-flex items-center gap-1 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 font-bold"><Share className="h-3.5 w-3.5" /> Bagikan (Share)</strong> di bilah bawah Safari.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-950 text-amber-300 border border-amber-800 font-mono font-bold text-xs">
                          3
                        </span>
                        <p className="text-slate-200">
                          Gulir ke bawah dan ketuk <strong className="text-emerald-300 inline-flex items-center gap-1 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800 font-bold"><PlusSquare className="h-3.5 w-3.5" /> Tambah ke Layar Utama (Add to Home Screen)</strong>.
                        </p>
                      </div>

                      <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-amber-950 text-amber-300 border border-amber-800 font-mono font-bold text-xs">
                          4
                        </span>
                        <p className="text-slate-200">
                          Ketuk <strong className="text-emerald-300 font-bold">"Tambah" (Add)</strong> di sudut kanan atas. Ikon Lambang NTB akan langsung muncul di Layar Depan iPhone Anda.
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Android Instructions */
                    <div className="space-y-2.5 text-xs text-slate-300">
                      <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal-950 text-teal-300 border border-teal-800 font-mono font-bold text-xs">
                          1
                        </span>
                        <p className="text-slate-200">
                          Buka di aplikasi <strong className="text-white font-bold">Google Chrome</strong> di HP Android Anda.
                        </p>
                      </div>

                      <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal-950 text-teal-300 border border-teal-800 font-mono font-bold text-xs">
                          2
                        </span>
                        <div className="space-y-1">
                          <p className="text-slate-200">
                            Jika spanduk instal tidak otomatis muncul, ketuk tombol <strong className="text-amber-300 font-bold">titik tiga (⋮)</strong> di sudut kanan atas Chrome.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal-950 text-teal-300 border border-teal-800 font-mono font-bold text-xs">
                          3
                        </span>
                        <p className="text-slate-200">
                          Pilih <strong className="text-emerald-300 font-bold">"Instal Aplikasi"</strong> atau <strong className="text-emerald-300 font-bold">"Tambahkan ke Layar Utama"</strong>.
                        </p>
                      </div>

                      <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal-950 text-teal-300 border border-teal-800 font-mono font-bold text-xs">
                          4
                        </span>
                        <p className="text-slate-200">
                          Ketuk <strong className="text-emerald-300 font-bold">"Instal"</strong>. Aplikasi akan terpasang seperti aplikasi Android biasa dan dapat dibuka tanpa membuka browser lagi.
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  /* Laptop / PC Desktop Instructions */
                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono font-bold text-xs">
                        1
                      </span>
                      <p className="text-slate-200">
                        Gunakan browser <strong className="text-white font-bold">Google Chrome</strong> atau <strong className="text-white font-bold">Microsoft Edge</strong> di Laptop.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono font-bold text-xs">
                        2
                      </span>
                      <div className="space-y-1">
                        <p className="text-slate-200">
                          Perhatikan <strong className="text-amber-300 font-bold">Bilah Alamat URL (Address Bar)</strong> sudut kanan atas laptop Anda.
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Klik ikon <Download className="inline h-3.5 w-3.5 text-cyan-400 mx-0.5" /> <strong className="text-emerald-300">"Instal BFMS NTB"</strong> atau menu titik tiga (⋮) &rarr; <strong className="text-emerald-300">"Simpan dan Bagikan"</strong> &rarr; <strong className="text-emerald-300">"Instal Halaman Sebagai Aplikasi"</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono font-bold text-xs">
                        3
                      </span>
                      <p className="text-slate-200">
                        Klik <strong className="text-emerald-300">"Instal"</strong>. Pintasan aplikasi Lambang NTB akan otomatis muncul di Desktop & Start Menu Laptop.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Copy Link & Open in Browser */}
              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white transition border border-slate-700"
                  id="btn-copy-app-link"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-emerald-400" />
                      <span className="text-emerald-300 font-bold">Link Berhasil Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-slate-400" />
                      <span>Salin Link URL Aplikasi</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleOpenInBrowser}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition border border-slate-700"
                  title="Buka aplikasi langsung di tab baru"
                  id="btn-open-new-tab"
                >
                  <span>Buka Tab Baru</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </>
          )}

          {/* Slogan Banner Footer */}
          <div className="pt-2 text-center border-t border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/70 px-3 py-1 rounded-full border border-amber-700/60">
              BANGKIT BERSAMA! NTB MAKMUR MENDUNIA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
