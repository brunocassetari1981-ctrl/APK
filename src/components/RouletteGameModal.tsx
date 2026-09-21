import React, { useState } from 'react';
import { ArrowLeft, RotateCw, Trophy, Sparkles, ShieldCheck } from 'lucide-react';
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
      const drawn = Math.floor(Math.random() * 37); // 0 to 36
      setWinningNumber(drawn);
      setIsSpinning(false);
      setRecentNumbers(prev => [drawn, ...prev.slice(0, 7)]);

      // Check win condition
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
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-xs sm:text-sm py-1 px-2.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Cassino</span>
        </button>

        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[280px]">
          {recentNumbers.map((num, idx) => (
            <span
              key={idx}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${getNumberColor(
                num
              )} shadow`}
            >
              {num}
            </span>
          ))}
        </div>
      </div>

      {/* Roulette Stage */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-emerald-400 text-xs font-bold uppercase tracking-wider">
              Ao Vivo VIP
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Roleta Brasileira</h1>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 font-semibold uppercase block">
              Saldo Disponível
            </span>
            <span className="text-lg font-black text-white">R$ {user.balance.toFixed(2)}</span>
          </div>
        </div>

        {/* Wheel Center Display */}
        <div className="flex flex-col items-center justify-center py-6 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
          <div
            className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-amber-400/60 flex items-center justify-center shadow-2xl transition-transform ${
              isSpinning ? 'animate-spin' : ''
            }`}
          >
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-center">
              {winningNumber !== null ? (
                <span
                  className={`text-2xl sm:text-4xl font-black ${
                    winningNumber === 0
                      ? 'text-emerald-400'
                      : RED_NUMBERS.includes(winningNumber)
                      ? 'text-rose-400'
                      : 'text-slate-100'
                  }`}
                >
                  {winningNumber}
                </span>
              ) : (
                <RotateCw className="w-8 h-8 text-amber-400" />
              )}
            </div>
          </div>
          <span className="text-xs text-slate-400 mt-3 font-semibold tracking-wider uppercase">
            {isSpinning ? 'GIRANDO A ROLETA...' : 'ROLETA PRONTA'}
          </span>
        </div>

        {/* Betting Board (Outside Bets) */}
        <div className="space-y-3">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
            Escolha seu Mercado (Pagamento 2x)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'red', label: 'Vermelho', bg: 'bg-rose-600 hover:bg-rose-500' },
              { id: 'black', label: 'Preto', bg: 'bg-slate-950 hover:bg-slate-800' },
              { id: 'even', label: 'Par (Even)', bg: 'bg-slate-800 hover:bg-slate-700' },
              { id: 'odd', label: 'Ímpar (Odd)', bg: 'bg-slate-800 hover:bg-slate-700' },
              { id: 'low', label: '1 ao 18', bg: 'bg-slate-800 hover:bg-slate-700' },
              { id: 'high', label: '19 ao 36', bg: 'bg-slate-800 hover:bg-slate-700' }
            ].map(bet => (
              <button
                key={bet.id}
                onClick={() => setSelectedBet(bet.id as any)}
                className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-black transition-all border ${bet.bg} ${
                  selectedBet === bet.id
                    ? 'ring-2 ring-amber-400 border-amber-400 text-white scale-[1.02] shadow-lg'
                    : 'border-slate-800 text-slate-200 opacity-80'
                }`}
              >
                {bet.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stake and Spin */}
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-6 gap-1.5">
            {stakePresets.map(preset => (
              <button
                key={preset}
                onClick={() => setStake(preset)}
                className={`py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  stake === preset
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                R$ {preset}
              </button>
            ))}
          </div>

          <button
            onClick={spinWheel}
            disabled={isSpinning || user.balance < stake}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 hover:from-emerald-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-950/50 transition-all active:scale-98 disabled:opacity-50"
          >
            {isSpinning ? 'GIRANDO...' : `APOSTAR E GIRAR (R$ ${stake.toFixed(2)})`}
          </button>
        </div>
      </div>
    </div>
  );
};
