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
  Info
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<'laptop' | 'hp'>('laptop');
  const [copied, setCopied] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);

  useEffect(() => {
    // Check if running inside iframe
    try {
      setIsInIframe(window.self !== window.top);
    } catch (e) {
      setIsInIframe(true);
    }

    // Detect user device default tab
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isMobile = /iphone|ipad|ipod|android/.test(userAgent);
    if (isMobile) {
      setActiveTab('hp');
    }

    // Check if already installed in standalone mode
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true
    ) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setIsInstalled(true);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.log('Install prompt error:', err);
      }
    } else if (isInIframe) {
      // If inside iframe, open top-level tab where PWA prompt is enabled by Chrome
      window.open(window.location.href, '_blank');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/30 bg-slate-900 p-5 sm:p-6 shadow-2xl ring-1 ring-amber-500/20 overflow-hidden text-white">
        {/* Glow Background Effects */}
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-red-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          id="btn-close-pwa-modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with App Logo */}
        <div className="flex flex-col items-center text-center space-y-2.5 pt-1">
          <div className="relative group">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-red-600 to-amber-500 opacity-75 blur transition group-hover:opacity-100" />
            <img
              src="/app-logo.jpg"
              alt="Logo NTB Bangkit Bersama"
              className="relative h-20 w-20 rounded-2xl object-cover shadow-xl border border-amber-400/50"
              referrerPolicy="no-referrer"
            />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-widest bg-red-950/80 text-red-300 border border-red-700/60 shadow-inner">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Aplikasi Web Terintegrasi (PWA)</span>
            </span>
            <h2 className="mt-2 text-xl font-black tracking-tight text-white sm:text-2xl">
              Instal Aplikasi di Laptop / HP
            </h2>
            <p className="mt-1 text-xs text-slate-300 max-w-xs mx-auto">
              BAKESBANGPOLDAGRI Provinsi NTB — Bangkit Bersama! NTB Makmur Mendunia
            </p>
          </div>
        </div>

        {/* Device Switcher Tabs (Laptop vs HP) */}
        <div className="mt-5 grid grid-cols-2 gap-2 p-1 rounded-2xl bg-slate-950 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('laptop')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'laptop'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            id="tab-pwa-laptop"
          >
            <Monitor className="h-4 w-4" />
            <span>Laptop / PC</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hp')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'hp'
                ? 'bg-gradient-to-r from-amber-600 to-red-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
            id="tab-pwa-hp"
          >
            <Smartphone className="h-4 w-4" />
            <span>HP (Android / iOS)</span>
          </button>
        </div>

        {/* Action Content Area */}
        <div className="mt-4 space-y-3">
          {isInstalled ? (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-4 text-center text-emerald-200">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto mb-2 animate-bounce" />
              <h3 className="text-sm font-bold text-white">Aplikasi Sudah Terpasang!</h3>
              <p className="text-xs text-emerald-300/80 mt-1">
                Aplikasi BFMS NTB sudah aktif di Layar Utama {activeTab === 'laptop' ? 'Laptop' : 'HP'} Anda.
              </p>
            </div>
          ) : (
            <>
              {/* Direct 1-Click Install Button if supported OR open new tab */}
              {deferredPrompt ? (
                <button
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-red-600 via-amber-600 to-amber-500 px-5 py-3.5 text-sm font-black text-white shadow-lg shadow-red-900/40 hover:brightness-110 active:scale-95 transition"
                  id="btn-install-pwa-direct"
                >
                  <Download className="h-5 w-5 text-amber-200" />
                  <span>Pasang Langsung ke {activeTab === 'laptop' ? 'Laptop' : 'HP'} (1-Klik)</span>
                  <ArrowRight className="h-4 w-4 text-white" />
                </button>
              ) : isInIframe ? (
                <button
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/40 hover:brightness-110 active:scale-95 transition"
                  id="btn-open-new-tab-install"
                >
                  <ExternalLink className="h-4 w-4 text-cyan-200" />
                  <span>Buka di Tab Baru untuk Aktifkan Tombol Instal</span>
                </button>
              ) : null}

              {/* Instructions Panel per Device */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950/90 p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                    {activeTab === 'laptop' ? (
                      <Monitor className="h-4 w-4 text-cyan-400" />
                    ) : (
                      <Smartphone className="h-4 w-4 text-amber-400" />
                    )}
                    <span>Panduan Pemasangan {activeTab === 'laptop' ? 'Laptop / PC' : 'HP Android & iPhone'}</span>
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono font-semibold">PWA Native</span>
                </div>

                {activeTab === 'laptop' ? (
                  /* Instructions for Laptop / PC Desktop */
                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono font-bold text-xs">
                        1
                      </span>
                      <p className="text-slate-200">
                        Gunakan browser <strong className="text-white font-bold">Google Chrome</strong> atau <strong className="text-white font-bold">Microsoft Edge</strong> di Laptop Anda.
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
                          Klik ikon <Download className="inline h-3.5 w-3.5 text-cyan-400 mx-0.5" /> <strong className="text-emerald-300">"Instal BFMS BAKESBANGPOLDAGRI NTB"</strong> atau menu titik tiga (⋮) &rarr; <strong className="text-emerald-300">"Simpan dan Bagikan"</strong> &rarr; <strong className="text-emerald-300">"Instal Halaman Sebagai Aplikasi"</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800/60 font-mono font-bold text-xs">
                        3
                      </span>
                      <p className="text-slate-200">
                        Klik <strong className="text-emerald-300">"Instal"</strong>. Ikon aplikasi Rusa NTB akan otomatis muncul di Desktop / Start Menu Laptop Anda.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Instructions for HP (Android / iOS) */
                  <div className="space-y-2.5 text-xs text-slate-300">
                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
                        <Smartphone className="h-3.5 w-3.5" />
                        <span>Di HP Android (Google Chrome / Edge):</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Klik titik tiga <strong className="text-amber-300 font-bold">(⋮)</strong> di sudut kanan atas browser &rarr; pilih <strong className="text-emerald-300 font-bold">"Instal Aplikasi"</strong> atau <strong className="text-emerald-300 font-bold">"Tambah ke Layar Utama"</strong>.
                      </p>
                    </div>

                    <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
                        <Smartphone className="h-3.5 w-3.5" />
                        <span>Di iPhone / iPad (Safari):</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Tekan ikon <strong className="text-amber-300 inline-flex items-center gap-0.5"><Share className="h-3 w-3" /> Bagikan (Share)</strong> di bagian bawah &rarr; pilih <strong className="text-emerald-300 font-bold inline-flex items-center gap-0.5"><PlusSquare className="h-3 w-3" /> Tambah ke Layar Utama (Add to Home Screen)</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Copy Link Helper */}
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
                      <span className="text-emerald-300">Link Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-slate-400" />
                      <span>Salin Link Aplikasi</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.open(window.location.href, '_blank')}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2 text-xs font-semibold text-cyan-300 hover:text-cyan-200 transition border border-slate-700"
                  title="Buka aplikasi dalam jendela penuh di tab baru"
                  id="btn-open-new-tab"
                >
                  <span>Tab Baru</span>
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

