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
  AlertCircle
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { NTBLogo } from './NTBLogo';

export const PWAInstallModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isInIframe, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'hp' | 'laptop'>('hp');
  const [copied, setCopied] = useState(false);
  const [, setInstallStatus] = useState<'idle' | 'installing' | 'success' | 'manual'>('idle');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#17324D]/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-5 sm:p-6 shadow-xl overflow-hidden text-[#17324D] max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-xl p-2 bg-[#F4F7FB] text-[#64748B] hover:text-[#17324D] hover:bg-slate-100 transition border border-[#DFE6EF] cursor-pointer"
          aria-label="Tutup"
          id="btn-close-pwa-modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with NTB Official Logo */}
        <div className="flex flex-col items-center text-center space-y-2 pt-1">
          <div className="relative h-20 w-20 rounded-2xl overflow-hidden shadow-xs border border-[#DFE6EF] bg-[#F4F7FB] flex items-center justify-center p-1">
            <NTBLogo size={70} />
          </div>

          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-50 text-[#079669] border border-emerald-200">
              <Sparkles className="h-3 w-3 text-[#079669]" />
              <span>Aplikasi Web Resmi (PWA)</span>
            </span>
            <h2 className="mt-1.5 text-xl font-black tracking-tight text-[#17324D] sm:text-2xl">
              Instal Aplikasi di HP &amp; Laptop
            </h2>
            <p className="mt-1 text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
              Sistem Informasi Keuangan BAKESBANGPOLDAGRI Provinsi NTB — Akses Cepat Langsung dari Layar Utama HP
            </p>
          </div>
        </div>

        {/* In-App Browser Warning Alert */}
        {isInAppBrowser && (
          <div className="mt-3.5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>Membuka di Browser Internal (In-App)</span>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Browser WhatsApp/Instagram membatasi pemasangan aplikasi ke layar HP. Silakan buka halaman ini di browser utama HP Anda:
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleOpenInBrowser}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#079669] hover:bg-[#065f46] text-white font-bold px-3 py-2 text-xs transition shadow-xs cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Buka di Chrome / Safari</span>
              </button>
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#F4F7FB] hover:bg-slate-100 text-[#17324D] px-3 py-2 text-xs transition border border-[#DFE6EF] cursor-pointer"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-[#079669]" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Device Switcher Tabs (HP vs Laptop) */}
        <div className="mt-4 grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#F4F7FB] border border-[#DFE6EF]">
          <button
            type="button"
            onClick={() => setActiveTab('hp')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'hp'
                ? 'bg-[#079669] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#17324D] hover:bg-white'
            }`}
            id="tab-pwa-hp"
          >
            <Smartphone className="h-4 w-4" />
            <span>HP (Android / iOS)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('laptop')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'laptop'
                ? 'bg-[#3984E8] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#17324D] hover:bg-white'
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
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center text-[#079669] space-y-2">
              <CheckCircle2 className="h-10 w-10 text-[#079669] mx-auto" />
              <h3 className="text-sm font-bold text-[#17324D]">Aplikasi Sudah Terpasang!</h3>
              <p className="text-xs text-[#079669] leading-relaxed">
                Aplikasi Sistem Informasi Keuangan BFMS NTB sudah aktif di Layar Utama HP / Laptop Anda sebagai Aplikasi Mandiri (PWA).
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-2 rounded-xl bg-[#079669] hover:bg-[#065f46] text-white font-bold text-xs px-4 py-2 transition shadow-xs cursor-pointer"
              >
                Selesai / Lanjut Menggunakan
              </button>
            </div>
          ) : (
            <>
              {/* PRIMARY ACTION BUTTON */}
              {isInstallable ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#079669] hover:bg-[#065f46] px-5 py-3.5 text-sm font-bold text-white shadow-xs transition group cursor-pointer"
                  id="btn-install-pwa-direct"
                >
                  <Download className="h-5 w-5 text-white" />
                  <span>Pasang Aplikasi ke {activeTab === 'hp' ? 'HP' : 'Laptop'} (1-Klik)</span>
                  <ArrowRight className="h-4 w-4 text-white" />
                </button>
              ) : isInIframe ? (
                <button
                  type="button"
                  onClick={handleOpenInBrowser}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#3984E8] hover:bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-xs transition cursor-pointer"
                  id="btn-open-new-tab-install"
                >
                  <ExternalLink className="h-4 w-4 text-white" />
                  <span>Buka di Tab Baru untuk Pasang</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-[#079669] hover:bg-[#065f46] px-5 py-3 text-sm font-bold text-white shadow-xs transition cursor-pointer"
                  id="btn-install-pwa-trigger"
                >
                  <Download className="h-5 w-5 text-white" />
                  <span>Pasang Aplikasi Sekarang</span>
                </button>
              )}

              {/* Step-by-Step Device Guide */}
              <div className="rounded-xl border border-[#DFE6EF] bg-[#F4F7FB] p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-[#DFE6EF] pb-2">
                  <span className="text-xs font-bold text-[#17324D] uppercase tracking-wide flex items-center gap-1.5">
                    {activeTab === 'hp' ? (
                      <Smartphone className="h-4 w-4 text-[#079669]" />
                    ) : (
                      <Monitor className="h-4 w-4 text-[#3984E8]" />
                    )}
                    <span>
                      {activeTab === 'hp'
                        ? isIOS
                          ? 'Cara Pasang di iPhone / iPad (Safari)'
                          : 'Cara Pasang di HP Android (Chrome / Edge)'
                        : 'Cara Pasang di Laptop / Komputer'}
                    </span>
                  </span>
                  <span className="text-[10px] text-[#079669] font-bold">PWA Native</span>
                </div>

                {activeTab === 'hp' ? (
                  isIOS ? (
                    <div className="space-y-2.5 text-xs text-[#64748B]">
                      <div className="flex items-start gap-2.5 bg-[#FFFFFF] p-2.5 rounded-xl border border-[#DFE6EF]">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#079669] border border-emerald-200 font-bold text-xs">
                          1
                        </span>
                        <p className="text-[#17324D]">
                          Buka link aplikasi di browser <strong className="font-bold">Safari</strong> di iPhone Anda.
                        </p>
                      </div>

                      <div className="flex items-start gap-2.5 bg-[#FFFFFF] p-2.5 rounded-xl border border-[#DFE6EF]">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#079669] border border-emerald-200 font-bold text-xs">
                          2
                        </span>
                        <div className="space-y-1">
                          <p className="text-[#17324D]">
                            Ketuk tombol <strong className="text-[#079669] inline-flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold"><Share className="h-3.5 w-3.5" /> Bagikan (Share)</strong> di bilah bawah Safari.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 bg-[#FFFFFF] p-2.5 rounded-xl border border-[#DFE6EF]">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#079669] border border-emerald-200 font-bold text-xs">
                          3
                        </span>
                        <p className="text-[#17324D]">
                          Gulir ke bawah dan ketuk <strong className="text-[#079669] inline-flex items-center gap-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold"><PlusSquare className="h-3.5 w-3.5" /> Tambah ke Layar Utama (Add to Home Screen)</strong>.
                        </p>
                      </div>

                      <div className="flex items-start gap-2.5 bg-[#FFFFFF] p-2.5 rounded-xl border border-[#DFE6EF]">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#079669] border border-emerald-200 font-bold text-xs">
                          4
                        </span>
                        <p className="text-[#17324D]">
                          Ketuk <strong className="text-[#079669] font-bold">&quot;Tambah&quot; (Add)</strong> di sudut kanan atas. Ikon Lambang NTB akan langsung muncul di Layar Depan iPhone Anda.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2.5 text-xs text-[#64748B]">
                      <div className="flex items-start gap-2.5 bg-[#FFFFFF] p-2.5 rounded-xl border border-[#DFE6EF]">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#079669] border border-emerald-200 font-bold text-xs">
                          1
                        </span>
                        <p className="text-[#17324D]">
                          Buka di aplikasi <strong className="font-bold">Google Chrome</strong> di HP Android Anda.
                        </p>
                      </div>

                      <div className="flex items-start gap-2.5 bg-[#FFFFFF] p-2.5 rounded-xl border border-[#DFE6EF]">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#079669] border border-emerald-200 font-bold text-xs">
                          2
                        </span>
                        <div className="space-y-1">
                          <p className="text-[#17324D]">
                            Jika spanduk instal tidak otomatis muncul, ketuk tombol <strong className="text-[#079669] font-bold">titik tiga (⋮)</strong> di sudut kanan atas Chrome.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5 bg-[#FFFFFF] p-2.5 rounded-xl border border-[#DFE6EF]">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#079669] border border-emerald-200 font-bold text-xs">
                          3
                        </span>
                        <p className="text-[#17324D]">
                          Pilih <strong className="text-[#079669] font-bold">&quot;Instal Aplikasi&quot;</strong> atau <strong className="text-[#079669] font-bold">&quot;Tambahkan ke Layar Utama&quot;</strong>.
                        </p>
                      </div>

                      <div className="flex items-start gap-2.5 bg-[#FFFFFF] p-2.5 rounded-xl border border-[#DFE6EF]">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-[#079669] border border-emerald-200 font-bold text-xs">
                          4
                        </span>
                        <p className="text-[#17324D]">
                          Ketuk <strong className="text-[#079669] font-bold">&quot;Instal&quot;</strong>. Aplikasi akan terpasang seperti aplikasi Android biasa dan dapat dibuka tanpa membuka browser lagi.
                        </p>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="space-y-2.5 text-xs text-[#64748B]">
                    <div className="flex items-start gap-2.5 bg-[#FFFFFF] p-2.5 rounded-xl border border-[#DFE6EF]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#3984E8] border border-blue-200 font-bold text-xs">
                        1
                      </span>
                      <p className="text-[#17324D]">
                        Gunakan browser <strong className="font-bold">Google Chrome</strong> atau <strong className="font-bold">Microsoft Edge</strong> di Laptop.
                      </p>
                    </div>

                    <div className="flex items-start gap-2.5 bg-[#FFFFFF] p-2.5 rounded-xl border border-[#DFE6EF]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#3984E8] border border-blue-200 font-bold text-xs">
                        2
                      </span>
                      <div className="space-y-1">
                        <p className="text-[#17324D]">
                          Perhatikan <strong className="text-[#079669] font-bold">Bilah Alamat URL (Address Bar)</strong> sudut kanan atas laptop Anda.
                        </p>
                        <p className="text-[11px] text-[#64748B]">
                          Klik ikon <Download className="inline h-3.5 w-3.5 text-[#3984E8] mx-0.5" /> <strong className="text-[#079669]">&quot;Instal BFMS NTB&quot;</strong> atau menu titik tiga (⋮) &rarr; <strong className="text-[#079669]">&quot;Simpan dan Bagikan&quot;</strong> &rarr; <strong className="text-[#079669]">&quot;Instal Halaman Sebagai Aplikasi&quot;</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2.5 bg-[#FFFFFF] p-2.5 rounded-xl border border-[#DFE6EF]">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#3984E8] border border-blue-200 font-bold text-xs">
                        3
                      </span>
                      <p className="text-[#17324D]">
                        Klik <strong className="text-[#079669]">&quot;Instal&quot;</strong>. Pintasan aplikasi Lambang NTB akan otomatis muncul di Desktop &amp; Start Menu Laptop.
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
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#F4F7FB] hover:bg-slate-100 px-3 py-2 text-xs font-semibold text-[#17324D] transition border border-[#DFE6EF] cursor-pointer"
                  id="btn-copy-app-link"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-[#079669]" />
                      <span className="text-[#079669] font-bold">Link Berhasil Disalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-[#64748B]" />
                      <span>Salin Link URL Aplikasi</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleOpenInBrowser}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-[#F4F7FB] hover:bg-slate-100 px-3 py-2 text-xs font-semibold text-[#3984E8] transition border border-[#DFE6EF] cursor-pointer"
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
          <div className="pt-2 text-center border-t border-[#DFE6EF]">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#079669] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              BANGKIT BERSAMA! NTB MAKMUR MENDUNIA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
