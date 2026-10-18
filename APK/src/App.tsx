import React, { useState } from 'react';
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
import { CheckCircle2, Sparkles, Smartphone, ArrowRight } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, toast, betslip, syncRealLiveGames, isLiveSyncing, lastSyncTime } = useApp();
  const [mobileBetslipOpen, setMobileBetslipOpen] = useState(false);
  const [playStoreModalOpen, setPlayStoreModalOpen] = useState(false);
  const [liveApiModalOpen, setLiveApiModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation Header */}
      <Header
        onOpenPlayStoreModal={() => setPlayStoreModalOpen(true)}
        onOpenLiveApiModal={() => setLiveApiModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-8">
        {/* Android Live Testing Banner */}
        <div className="mb-5 bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                <span>Instalar no celular Android & Testar APK</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                  Atualizações em Tempo Real
                </span>
              </p>
              <p className="text-[11px] text-slate-400">
                Instale no seu Android para ver as alterações instantaneamente sem precisar reinstalar APK.
              </p>
            </div>
          </div>
          <button
            onClick={() => setPlayStoreModalOpen(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-md"
          >
            <span>Instalar no Android</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
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
