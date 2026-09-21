import React from 'react';
import {
  ReceiptText,
  Trash2,
  X,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface BetslipProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Betslip: React.FC<BetslipProps> = ({ isOpenMobile, onCloseMobile }) => {
  const {
    betslip,
    stake,
    setStake,
    removeSelection,
    clearBetslip,
    placeBet,
    user,
    setActiveTab
  } = useApp();

  const totalOdds = Number(
    betslip.reduce((acc, item) => acc * item.odds, 1).toFixed(2)
  );
  const potentialPayout = Number((stake * totalOdds).toFixed(2));
  const hasInsufficientBalance = stake > user.balance;

  const stakePresets = [5, 10, 25, 50, 100];

  const handlePlaceBet = () => {
    const res = placeBet();
    if (res.success && onCloseMobile) {
      setTimeout(() => {
        onCloseMobile();
      }, 500);
    }
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/70 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <ReceiptText className="w-5 h-5 text-emerald-400" />
          <h3 className="font-bold text-white text-base">Bilhete de Apostas</h3>
          {betslip.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              {betslip.length} {betslip.length === 1 ? 'seleção' : 'seleções'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {betslip.length > 0 && (
            <button
              onClick={clearBetslip}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors p-1"
              title="Limpar todas as seleções"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Body: Selections list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5 max-h-[360px] lg:max-h-[480px]">
        {betslip.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-14 h-14 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-500">
              <ReceiptText className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300">Seu bilhete está vazio</p>
              <p className="text-xs text-slate-500 mt-1">
                Clique nas cotações (odds) dos jogos de futebol, basquete ou e-sports para adicionar ao bilhete.
              </p>
            </div>
          </div>
        ) : (
          betslip.map(item => (
            <div
              key={`${item.event.id}-${item.selection}`}
              className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/90 relative group hover:border-slate-700 transition-colors"
            >
              <button
                onClick={() => removeSelection(item.event.id, item.selection)}
                className="absolute top-2 right-2 text-slate-500 hover:text-rose-400 p-1 transition-colors"
                title="Remover seleção"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="pr-6">
                <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wide">
                  {item.event.league}
                </p>
                <p className="text-xs font-bold text-white mt-0.5 truncate">
                  {item.event.home_team} vs {item.event.away_team}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-900">
                  <span className="text-xs text-slate-300 font-medium">
                    {item.label}
                  </span>
                  <span className="text-sm font-extrabold text-amber-400">
                    {item.odds.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer / Bet Placement controls */}
      {betslip.length > 0 && (
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
          {/* Quick Stake presets */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
              <span>Valor da aposta</span>
              <span>Saldo: R$ {user.balance.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 mb-2">
              {stakePresets.map(preset => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setStake(preset)}
                  className={`py-1 rounded-lg text-xs font-bold transition-colors ${
                    stake === preset
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  R${preset}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">
                R$
              </span>
              <input
                type="number"
                min="1"
                step="1"
                value={stake || ''}
                onChange={e => setStake(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 pl-9 pr-3 text-white font-bold text-sm focus:outline-none"
                placeholder="Valor personalizado"
              />
            </div>
          </div>

          {/* Odd and Payout preview */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Odd Total:
              </span>
              <span className="font-extrabold text-amber-400">{totalOdds.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300 font-semibold">Retorno Potencial:</span>
              <span className="font-black text-emerald-400 text-base">
                R$ {potentialPayout.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Insufficient balance warning */}
          {hasInsufficientBalance && (
            <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Saldo insuficiente. Faça um depósito via PIX para continuar.</span>
            </div>
          )}

          {/* Place Bet Action Button */}
          {hasInsufficientBalance ? (
            <button
              onClick={() => {
                setActiveTab('wallet');
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-lg shadow-emerald-950/40"
            >
              <span>Depositar via PIX</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handlePlaceBet}
              disabled={stake <= 0}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-transform active:scale-98 shadow-lg shadow-emerald-950/40 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirmar Aposta (R$ {stake.toFixed(2)})</span>
            </button>
          )}
        </div>
      )}
    </div>
  );

  // Mobile Drawer Mode
  if (isOpenMobile) {
    return (
      <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
        <div className="w-full max-w-sm h-full flex flex-col p-3 animate-in slide-in-from-right duration-200">
          {content}
        </div>
      </div>
    );
  }

  // Desktop Static Mode
  return <div className="hidden lg:block sticky top-20">{content}</div>;
};
