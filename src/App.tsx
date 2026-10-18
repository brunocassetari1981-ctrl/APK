import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { Betslip } from './components/Betslip';
import { SportsbookView } from './components/SportsbookView';
import { LiveMatchesView } from './components/LiveMatchesView';
import { CasinoView } from './components/CasinoView';
import { WalletView } from './components/WalletView';
import { BetHistoryView } from './components/BetHistoryView';
import { PlayStoreInfoModal } from './components/PlayStoreInfoModal';
import { LiveApiModal } from './components/LiveApiModal';
import { CheckCircle2, Download, Smartphone, Check } from 'lucide-react';
import { triggerDirectApkDownload } from './utils/apkDownloader';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, toast, betslip, syncRealLiveGames, isLiveSyncing, lastSyncTime } = useApp();
  const [mobileBetslipOpen, setMobileBetslipOpen] = useState(false);
  const [playStoreModalOpen, setPlayStoreModalOpen] = useState(false);
  const [liveApiModalOpen, setLiveApiModalOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    // If user accesses the page with ?download or #download, start APK download right away
    if (window.location.search.includes('download') || window.location.hash.includes('download')) {
      triggerDirectApkDownload();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 8000);
    }
  }, []);

  const handleDownload = () => {
    triggerDirectApkDownload();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 8000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation Header */}
      <Header
        onOpenPlayStoreModal={() => setPlayStoreModalOpen(true)}
        onOpenLiveApiModal={() => setLiveApiModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-8">
        {/* Direct APK Download Banner */}
        <div className="mb-6 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border-2 border-emerald-500/60 rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 w-full md:w-auto">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Smartphone className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">FortuneGo.apk Oficial com Localização de URL</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
                  7.2 MB • Online + Offline Embutido
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Conecta na URL ativa do servidor e funciona 100% offline se não houver internet. Dê um toque longo de 2s na tela para configurar qualquer URL!
              </p>
            </div>
          </div>
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto shrink-0">
            <button
              id="download-apk-banner-btn"
              onClick={handleDownload}
              className="flex-1 sm:flex-initial px-5 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 transition-transform active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>BAIXAR APK NO CELULAR</span>
            </button>
            <a
              href="/FortuneGo-Android-Source.zip"
              download="FortuneGo-Android-Source.zip"
              className="px-4 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              title="Baixar código-fonte completo do Android para ver/alterar a URL"
            >
              <span>Ver Código Java</span>
            </a>
          </div>
        </div>

        {/* Download Success Notice */}
        {downloadSuccess && (
          <div className="mb-6 bg-emerald-950/90 border border-emerald-500/80 rounded-2xl p-4 flex items-start gap-3 text-emerald-200 shadow-xl">
            <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <strong className="block text-white font-bold">Download iniciado com sucesso!</strong>
              Puxe a barra de notificações do seu celular ou abra seus arquivos em <em>Downloads</em> e toque em <strong>FortuneGo.apk</strong> para instalar.
            </div>
          </div>
        )}

        <div
          className={
            activeTab === 'casino' || activeTab === 'wallet' || activeTab === 'history'
              ? 'w-full'
              : 'grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start'
          }
        >
          {/* Main Active View */}
          <div className="min-w-0">
            {activeTab === 'home' && <SportsbookView />}
            {activeTab === 'live' && <LiveMatchesView />}
            {activeTab === 'casino' && <CasinoView />}
            {activeTab === 'wallet' && <WalletView />}
            {activeTab === 'history' && <BetHistoryView />}
          </div>

          {/* Betslip (Visible on Sports & Live pages on Desktop) */}
          {(activeTab === 'home' || activeTab === 'live') && (
            <Betslip />
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav onOpenBetslipMobile={() => setMobileBetslipOpen(true)} />

      {/* Mobile Slide-in Betslip Drawer */}
      <Betslip
        isOpenMobile={mobileBetslipOpen}
        onCloseMobile={() => setMobileBetslipOpen(false)}
      />

      {/* Google Play Store Export & Info Modal */}
      <PlayStoreInfoModal
        isOpen={playStoreModalOpen}
        onClose={() => setPlayStoreModalOpen(false)}
      />

      {/* Live Sports API Integration Modal */}
      <LiveApiModal
        isOpen={liveApiModalOpen}
        onClose={() => setLiveApiModalOpen(false)}
        onManualSync={syncRealLiveGames}
        isSyncing={isLiveSyncing}
        lastSyncTime={lastSyncTime}
      />

      {/* Global Floating Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center gap-2.5 bg-slate-900 border border-emerald-500/40 text-white px-4 py-3 rounded-2xl shadow-2xl shadow-emerald-950/40 text-xs sm:text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
