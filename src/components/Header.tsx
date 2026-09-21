import React, { useState } from 'react';
import {
  Flame,
  Wallet,
  Volume2,
  VolumeX,
  Menu,
  X,
  PlusCircle,
  Smartphone,
  Trophy,
  History,
  Gamepad2,
  Radio,
  Home,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppTab } from '../types';

interface HeaderProps {
  onOpenPlayStoreModal: () => void;
  onOpenLiveApiModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenPlayStoreModal, onOpenLiveApiModal }) => {
  const {
    user,
    activeTab,
    setActiveTab,
    betslip,
    soundEnabled,
    toggleSound,
    resetDemoBalance,
    isLiveSyncing,
    syncRealLiveGames
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Início', icon: <Home className="w-4 h-4" /> },
    { id: 'live', label: 'Ao Vivo', icon: <Radio className="w-4 h-4 animate-pulse text-rose-400" /> },
    { id: 'casino', label: 'Casino & Slots', icon: <Gamepad2 className="w-4 h-4 text-amber-400" /> },
    { id: 'wallet', label: 'Carteira PIX', icon: <Wallet className="w-4 h-4 text-emerald-400" /> },
    { id: 'history', label: 'Minhas Apostas', icon: <History className="w-4 h-4 text-sky-400" /> }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile hamburger & Logo */}
          <div className="flex items-center gap-3">
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              aria-label="Abrir Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <button
              id="header-brand-logo"
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-emerald-500 to-amber-400 flex items-center justify-center shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform">
                <Flame className="w-5 h-5 text-slate-950 fill-slate-950" />
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white flex items-center">
                  Fortune<span className="text-emerald-400">Go</span>
                </span>
                <span className="text-[10px] text-emerald-400/90 font-semibold tracking-wider uppercase block -mt-1">
                  Apostas & Slots
                </span>
              </div>
            </button>
          </div>

          {/* Center: Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-950/50 p-1.5 rounded-xl border border-slate-800/80">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {item.id === 'history' && betslip.length > 0 && (
                    <span className="ml-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center">
                      {betslip.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Balance, Sound, Play Store export */}
          <div className="flex items-center gap-2.5">
            {/* Live Sports API Feed Pill */}
            <button
              id="header-live-api-btn"
              onClick={onOpenLiveApiModal}
              title="Configurações de integração de jogos ao vivo (ESPN / API-Football)"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-xs text-emerald-300 rounded-lg transition-colors font-medium shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="hidden sm:inline">Jogos Ao Vivo (API)</span>
              <span className="sm:hidden">Ao Vivo</span>
              {isLiveSyncing && <RefreshCw className="w-3 h-3 animate-spin text-emerald-400" />}
            </button>

            {/* Android APK Installation Badge */}
            <button
              id="header-play-store-btn"
              onClick={onOpenPlayStoreModal}
              title="Instalar no celular Android ou gerar APK para teste"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-xs text-emerald-300 rounded-lg transition-colors font-bold shadow-sm"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Instalar Android (APK)</span>
              <span className="sm:hidden">APK</span>
            </button>

            {/* Audio Toggle */}
            <button
              id="sound-toggle-btn"
              onClick={toggleSound}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors"
              title={soundEnabled ? 'Desativar Som' : 'Ativar Som'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Wallet Balance Pill */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700/70 rounded-xl p-1 pl-3 gap-2">
              <div
                className="cursor-pointer"
                onClick={() => setActiveTab('wallet')}
                title="Clique para ver sua carteira"
              >
                <span className="text-[10px] text-slate-400 font-medium block uppercase tracking-wider">
                  Saldo PIX
                </span>
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">
                  R$ {user.balance.toFixed(2)}
                </span>
              </div>
              <button
                id="quick-deposit-btn"
                onClick={() => setActiveTab('wallet')}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 p-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-colors"
                title="Depositar via PIX"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden md:inline font-bold">PIX</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-900/98 px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 mb-3">
            <div>
              <p className="text-xs text-slate-400">Usuário Conectado</p>
              <p className="text-sm font-bold text-white">@{user.username}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Bônus Grátis</p>
              <p className="text-sm font-bold text-emerald-400">R$ {user.bonus.toFixed(2)}</p>
            </div>
          </div>

          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-colors text-left ${
                activeTab === item.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {item.icon}
              <span className="font-semibold">{item.label}</span>
            </button>
          ))}

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => {
                onOpenPlayStoreModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs text-emerald-400 font-semibold p-2"
            >
              <Smartphone className="w-4 h-4" />
              Guia Google Play Store APK
            </button>
            <button
              onClick={() => {
                resetDemoBalance();
                setMobileMenuOpen(false);
              }}
              className="text-xs text-slate-400 hover:text-white p-2 underline"
            >
              Restaurar Saldo Demo
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
