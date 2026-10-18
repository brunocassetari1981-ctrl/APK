import React from 'react';
import { Home, Radio, Gamepad2, Wallet, ReceiptText } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppTab } from '../types';

interface MobileNavProps {
  onOpenBetslipMobile: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenBetslipMobile }) => {
  const { activeTab, setActiveTab, betslip } = useApp();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800 pb-safe">
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-2">
        <button
          id="mobile-tab-home"
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'home' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Início</span>
        </button>

        <button
          id="mobile-tab-live"
          onClick={() => setActiveTab('live')}
          className={`flex flex-col items-center justify-center gap-1 relative transition-colors ${
            activeTab === 'live' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Radio className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          </div>
          <span className="text-[10px]">Ao Vivo</span>
        </button>

        <button
          id="mobile-tab-casino"
          onClick={() => setActiveTab('casino')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'casino' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gamepad2 className="w-5 h-5" />
          <span className="text-[10px]">Casino</span>
        </button>

        <button
          id="mobile-tab-wallet"
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'wallet' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wallet className="w-5 h-5" />
          <span className="text-[10px]">Carteira</span>
        </button>

        <button
          id="mobile-tab-betslip"
          onClick={onOpenBetslipMobile}
          className="flex flex-col items-center justify-center gap-1 relative text-slate-400 hover:text-slate-200 transition-colors"
        >
          <div className="relative">
            <ReceiptText className="w-5 h-5 text-amber-400" />
            {betslip.length > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] flex items-center justify-center shadow">
                {betslip.length}
              </span>
            )}
          </div>
          <span className="text-[10px] text-amber-400 font-medium">Bilhete</span>
        </button>
      </div>
    </nav>
  );
};
