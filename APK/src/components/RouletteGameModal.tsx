import React, { useState } from 'react';
import { ArrowLeft, RotateCw, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { CasinoGame } from '../types';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';

interface RouletteGameModalProps {
  game: CasinoGame;
  onBack: () => void;
}

const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export const RouletteGameModal: React.FC<RouletteGameModalProps> = ({ game, onBack }) => {
  const { user, chargeCasinoStake, payoutCasinoWin, showToast } = useApp();

  const [stake, setStake] = useState<number>(5);
  const [selectedBet, setSelectedBet] = useState<'red' | 'black' | 'even' | 'odd' | 'low' | 'high'>('red');
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [recentNumbers, setRecentNumbers] = useState<number[]>([14, 7, 32, 0, 21, 5, 18]);

  const stakePresets = [2, 5, 10, 25, 50, 100];

  const spinWheel = () => {
    if (isSpinning) return;
    if (stake <= 0 || stake > user.balance) {
      showToast('Saldo insuficiente para girar a roleta.');
      return;
    }

    const charged = chargeCasinoStake(stake, 'Roleta Brasileira');
    if (!charged) return;

    setIsSpinning(true);
    sounds.playSpin();

    setTimeout(() => {
      const drawn = Math.floor(Math.random() * 37);
      setWinningNumber(drawn);
      setIsSpinning(false);
      setRecentNumbers(prev => [drawn, ...prev.slice(0, 7)]);

      const isRed = RED_NUMBERS.includes(drawn);
      const isBlack = drawn !== 0 && !isRed;
      const isEven = drawn !== 0 && drawn % 2 === 0;
      const isOdd = drawn !== 0 && drawn % 2 !== 0;
      const isLow = drawn >= 1 && drawn <= 18;
      const isHigh = drawn >= 19 && drawn <= 36;

      let won = false;
      if (selectedBet === 'red' && isRed) won = true;
      if (selectedBet === 'black' && isBlack) won = true;
      if (selectedBet === 'even' && isEven) won = true;
      if (selectedBet === 'odd' && isOdd) won = true;
      if (selectedBet === 'low' && isLow) won = true;
      if (selectedBet === 'high' && isHigh) won = true;

      if (won) {
        const payout = stake * 2;
        payoutCasinoWin(payout, 'Roleta Brasileira');
      } else {
        sounds.playExplosion();
        showToast(`Número sorteado: ${drawn}. Dessa vez não deu prêmio.`);
      }
    }, 1800);
  };

  const getNumberColor = (num: number) => {
    if (num === 0) return 'bg-emerald-600 text-white';
    if (RED_NUMBERS.includes(num)) return 'bg-rose-600 text-white';
    return 'bg-slate-900 text-white';
  };

  return (
    <div className="mx-auto max-w-[30rem] space-y-4 rounded-[2rem] bg-[#070d1b] p-3 text-white shadow-[0_30px_90px_rgba(0,0,0,.55)]">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#0f172a] px-3 py-2">
        <button onClick={onBack} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-slate-300 hover:bg-white/10">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <div className="flex max-w-[280px] items-center gap-1.5 overflow-x-auto py-1">
          {recentNumbers.map((num, idx) => (
            <span
              key={idx}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-black shadow ${getNumberColor(num)}`}
            >
              {num}
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.8rem] border border-yellow-300/30 bg-gradient-to-b from-[#0d1729] via-[#0f1c2c] to-[#0b1120] p-4 shadow-[0_0_28px_rgba(250,204,21,.12)]">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-emerald-300">
              <Sparkles className="h-4 w-4" />
              Ao Vivo VIP
            </div>
            <h1 className="mt-1 text-2xl font-black text-white">Roleta Brasileira</h1>
          </div>

          <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-right">
            <div className="text-[9px] uppercase tracking-[.14em] text-emerald-200">Saldo</div>
            <div className="text-sm font-black text-white">R$ {user.balance.toFixed(2)}</div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-white/10 bg-[#07111f] py-6 shadow-inner">
          <div
            className={`flex h-28 w-28 items-center justify-center rounded-full border-4 border-amber-400/60 shadow-[0_20px_28px_rgba(245,158,11,.2)] transition-transform sm:h-36 sm:w-36 ${
              isSpinning ? 'animate-spin' : ''
            }`}
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-slate-700 bg-slate-900 text-center sm:h-28 sm:w-28">
              {winningNumber !== null ? (
                <span
                  className={`text-2xl font-black sm:text-4xl ${
                    winningNumber === 0 ? 'text-emerald-400' : RED_NUMBERS.includes(winningNumber) ? 'text-rose-400' : 'text-slate-100'
                  }`}
                >
                  {winningNumber}
                </span>
              ) : (
                <RotateCw className="h-8 w-8 text-amber-400" />
              )}
            </div>
          </div>
          <span className="mt-3 text-[10px] font-black uppercase tracking-[.18em] text-slate-400">
            {isSpinning ? 'Girando...' : 'Roleta pronta'}
          </span>
        </div>

        <div className="mt-4 space-y-3">
          <p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">Escolha seu mercado</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {[
              { id: 'red', label: 'Vermelho', bg: 'bg-rose-600 hover:bg-rose-500' },
              { id: 'black', label: 'Preto', bg: 'bg-slate-950 hover:bg-slate-800' },
              { id: 'even', label: 'Par (Even)', bg: 'bg-slate-800 hover:bg-slate-700' },
              { id: 'odd', label: 'Ímpar (Odd)', bg: 'bg-slate-800 hover:bg-slate-700' },
              { id: 'low', label: '1 ao 18', bg: 'bg-slate-800 hover:bg-slate-700' },
              { id: 'high', label: '19 ao 36', bg: 'bg-slate-800 hover:bg-slate-700' },
            ].map(bet => (
              <button
                key={bet.id}
                onClick={() => setSelectedBet(bet.id as any)}
                className={`rounded-xl border px-2 py-3 text-xs font-black transition-all ${bet.bg} ${
                  selectedBet === bet.id ? 'scale-[1.02] border-amber-400 ring-2 ring-amber-400 text-white shadow-lg' : 'border-slate-800 text-slate-200 opacity-85'
                }`}
              >
                {bet.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-6 gap-1.5">
            {stakePresets.map(preset => (
              <button
                key={preset}
                onClick={() => setStake(preset)}
                className={`rounded-xl py-2 text-xs font-black transition ${
                  stake === preset ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800'
                }`}
              >
                R$ {preset}
              </button>
            ))}
          </div>

          <button
            onClick={spinWheel}
            disabled={isSpinning || user.balance < stake}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 px-4 py-3 text-base font-black text-slate-950 shadow-[0_16px_32px_rgba(16,185,129,.2)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trophy className="h-5 w-5" />
            <span>{isSpinning ? 'GIRANDO...' : `APOSTAR E GIRAR (R$ ${stake.toFixed(2)})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
