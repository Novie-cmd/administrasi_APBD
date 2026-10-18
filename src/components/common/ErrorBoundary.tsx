import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, LogIn, Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public props: Props;
  public state: State;
  public setState!: (state: Partial<State> | ((prevState: State) => Partial<State>)) => void;

  constructor(props: Props) {
    super(props);
    this.props = props;
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  private handleResetSessionAndLogin = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('bfms_auth_user_session_v1');
        sessionStorage.removeItem('bfms_auth_user_session_v1');
      } catch {}
      window.location.href = window.location.origin + window.location.pathname;
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#E9EEF5] text-[#17324D] flex flex-col justify-between p-4 sm:p-8 font-sans selection:bg-[#079669] selection:text-white">
          {/* Header Identity */}
          <header className="w-full max-w-4xl mx-auto flex items-center justify-between border-b border-[#DFE6EF] pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#FFFFFF] border border-[#DFE6EF] flex items-center justify-center overflow-hidden p-0.5 shadow-xs">
                <img
                  src="./app-logo.jpg"
                  alt="Logo Pemprov NTB"
                  className="h-full w-full object-cover rounded-lg"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#079669]">
                  PEMERINTAH PROVINSI NUSA TENGGARA BARAT
                </div>
                <div className="text-xs sm:text-sm font-extrabold text-[#17324D]">
                  BAKESBANGPOLDAGRI NTB • BFMS
                </div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-[#079669]">
              <Sparkles className="h-3.5 w-3.5 text-[#079669]" />
              <span>NTB MAKMUR</span>
            </span>
          </header>

          {/* Central Error Box */}
          <main className="flex-1 flex items-center justify-center py-8">
            <div className="w-full max-w-lg rounded-2xl border border-[#DFE6EF] bg-[#FFFFFF] p-6 sm:p-8 shadow-xl text-center space-y-5">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 shadow-xs">
                <AlertCircle className="h-8 w-8" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-lg sm:text-xl font-black text-[#17324D]">
                  {this.props.fallbackTitle || 'Pemulihan Tampilan Aplikasi'}
                </h2>
                <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed max-w-md mx-auto">
                  Sistem mendeteksi kendala pada antarmuka. Anda dapat membuka kembali form login atau memuat ulang halaman secara aman tanpa kehilangan data.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={this.handleResetSessionAndLogin}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#079669] hover:bg-[#065f46] py-3 px-4 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Buka Form Login</span>
                </button>

                <button
                  type="button"
                  onClick={this.handleReload}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#F4F7FB] hover:bg-slate-100 border border-[#DFE6EF] py-3 px-4 text-xs font-bold text-[#17324D] transition active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Muat Ulang Halaman</span>
                </button>
              </div>

              {/* Collapsible diagnostic details */}
              {this.state.error && (
                <details className="text-left pt-2 border-t border-[#DFE6EF] text-[11px] text-[#64748B]">
                  <summary className="cursor-pointer text-[#64748B] hover:text-[#17324D] font-semibold select-none">
                    Detail Teknis Sistem
                  </summary>
                  <div className="mt-2 p-3 rounded-xl bg-[#F4F7FB] border border-[#DFE6EF] font-mono text-[10px] text-rose-700 overflow-x-auto whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </div>
                </details>
              )}
            </div>
          </main>

          {/* Footer */}
          <footer className="w-full text-center text-xs text-[#64748B] pt-4 border-t border-[#DFE6EF]">
            BANGKIT BERSAMA! NTB MAKMUR MENDUNIA • Bakesbangpoldagri NTB
          </footer>
        </div>
      );
    }

    return this.props.children;
  }
}
