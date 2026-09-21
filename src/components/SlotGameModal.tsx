import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Zap,
  Volume2,
  Info,
  RotateCcw,
  Trophy,
  Coins,
  Flame,
  Sun,
  Crown,
  Star,
  Gem
} from 'lucide-react';
import { CasinoGame } from '../types';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';

interface SlotGameModalProps {
  game: CasinoGame;
  onBack: () => void;
}

type SymbolKey = 'sun' | 'coin' | 'gem' | 'crown' | 'star' | 'diamond';

const SYMBOL_ICONS: Record<SymbolKey, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  sun: {
    label: 'Sol Dourado',
    icon: <Sun className="w-12 h-12 text-amber-400 fill-amber-400" />,
    color: 'text-amber-400',
    bg: 'from-amber-900/40 to-yellow-950/40'
  },
  coin: {
    label: 'Moeda da Sorte',
    icon: <Coins className="w-12 h-12 text-yellow-400 fill-yellow-400" />,
    color: 'text-yellow-400',
    bg: 'from-yellow-900/40 to-amber-950/40'
  },
  gem: {
    label: 'Gema Real',
    icon: <Gem className="w-12 h-12 text-emerald-400 fill-emerald-400" />,
    color: 'text-emerald-400',
    bg: 'from-emerald-900/40 to-teal-950/40'
  },
  crown: {
    label: 'Coroa Imperial',
    icon: <Crown className="w-12 h-12 text-purple-400 fill-purple-400" />,
    color: 'text-purple-400',
    bg: 'from-purple-900/40 to-indigo-950/40'
  },
  star: {
    label: 'Estrela Cósmica',
    icon: <Star className="w-12 h-12 text-rose-400 fill-rose-400" />,
    color: 'text-rose-400',
    bg: 'from-rose-900/40 to-pink-950/40'
  },
  diamond: {
    label: 'Super Diamante',
    icon: <Sparkles className="w-12 h-12 text-cyan-300 fill-cyan-300" />,
    color: 'text-cyan-300',
    bg: 'from-cyan-900/40 to-blue-950/40'
  }
};

const SYMBOLS_POOL: SymbolKey[] = ['sun', 'coin', 'gem', 'crown', 'star', 'diamond'];

export const SlotGameModal: React.FC<SlotGameModalProps> = ({ game, onBack }) => {
  const { user, chargeCasinoStake, payoutCasinoWin, showToast } = useApp();

  const [stake, setStake] = useState<number>(5);
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<SymbolKey[]>(['sun', 'coin', 'gem']);
  const [lastWin, setLastWin] = useState<{ multiplier: number; payout: number } | null>(null);
  const [turbo, setTurbo] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);

  const autoSpinRef = useRef(autoSpin);
  autoSpinRef.current = autoSpin;

  const stakeOptions = [1, 2, 5, 10, 20, 50, 100];

  const calculateResult = (symbols: SymbolKey[], betAmount: number) => {
    const [s1, s2, s3] = symbols;

    // 3 matching diamonds = 25x
    if (s1 === 'diamond' && s2 === 'diamond' && s3 === 'diamond') {
      return { multiplier: 25, payout: betAmount * 25 };
    }
    // 3 matching crowns = 15x
    if (s1 === 'crown' && s2 === 'crown' && s3 === 'crown') {
      return { multiplier: 15, payout: betAmount * 15 };
    }
    // 3 matching any = 8x
    if (s1 === s2 && s2 === s3) {
      return { multiplier: 8, payout: betAmount * 8 };
    }
    // 2 matching any = 1.5x
    if (s1 === s2 || s2 === s3 || s1 === s3) {
      return { multiplier: 1.5, payout: betAmount * 1.5 };
    }

    return { multiplier: 0, payout: 0 };
  };

  const spin = async () => {
    if (isSpinning) return;
    if (stake < game.minBet || stake > game.maxBet) {
      showToast(`Aposta deve ser entre R$ ${game.minBet} e R$ ${game.maxBet}`);
      return;
    }

    const charged = chargeCasinoStake(stake, game.name);
    if (!charged) {
      setAutoSpin(false);
      return;
    }

    setIsSpinning(true);
    setLastWin(null);

    // Audio spin ticks
    sounds.playSpin();

    // Random outcome generator with slight RTP weight
    const spinDuration = turbo ? 450 : 1000;
    const intervalTime = 60;
    const iterations = spinDuration / intervalTime;
    let count = 0;

    const spinInterval = setInterval(() => {
      setReels([
        SYMBOLS_POOL[Math.floor(Math.random() * SYMBOLS_POOL.length)],
        SYMBOLS_POOL[Math.floor(Math.random() * SYMBOLS_POOL.length)],
        SYMBOLS_POOL[Math.floor(Math.random() * SYMBOLS_POOL.length)]
      ]);
      sounds.playSpin();
      count++;
      if (count >= iterations) {
        clearInterval(spinInterval);

        // Final result determination (approx 40% win hit-rate for thrilling game play)
        let finalOutcome: SymbolKey[];
        const winRoll = Math.random();

        if (winRoll < 0.05) {
          // 3 diamonds
          finalOutcome = ['diamond', 'diamond', 'diamond'];
        } else if (winRoll < 0.12) {
          // 3 crowns or stars
          const matchSym = Math.random() > 0.5 ? 'crown' : 'star';
          finalOutcome = [matchSym, matchSym, matchSym];
        } else if (winRoll < 0.40) {
          // 2 matching symbols
          const sym1 = SYMBOLS_POOL[Math.floor(Math.random() * SYMBOLS_POOL.length)];
          const other = SYMBOLS_POOL.filter(s => s !== sym1)[0];
          finalOutcome = [sym1, sym1, other];
        } else {
          // No match
          finalOutcome = ['sun', 'coin', 'crown'];
        }

        setReels(finalOutcome);
        setIsSpinning(false);

        const result = calculateResult(finalOutcome, stake);
        if (result.payout > 0) {
          setLastWin(result);
          payoutCasinoWin(result.payout, game.name);
        }

        if (autoSpinRef.current) {
          setTimeout(() => {
            if (autoSpinRef.current) spin();
          }, 800);
        }
      }
    }, intervalTime);
  };

  useEffect(() => {
    return () => {
      setAutoSpin(false);
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Back button and quick info */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setAutoSpin(false);
            onBack();
          }}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-xs sm:text-sm transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar aos jogos</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPaytable(!showPaytable)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg"
          >
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            <span>Tabela de Pagamentos</span>
          </button>
        </div>
      </div>

      {/* Paytable Modal / Drawer */}
      {showPaytable && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              Regras e Multiplicadores do {game.name}
            </h4>
            <button onClick={() => setShowPaytable(false)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-slate-300">
            <div className="p-2 bg-slate-950 rounded-lg">
              <p className="font-bold text-cyan-300">3x Diamante</p>
              <p className="text-white font-black text-sm">25x Aposta</p>
            </div>
            <div className="p-2 bg-slate-950 rounded-lg">
              <p className="font-bold text-purple-300">3x Coroa</p>
              <p className="text-white font-black text-sm">15x Aposta</p>
            </div>
            <div className="p-2 bg-slate-950 rounded-lg">
              <p className="font-bold text-amber-300">3x Iguais</p>
              <p className="text-white font-black text-sm">8x Aposta</p>
            </div>
            <div className="p-2 bg-slate-950 rounded-lg">
              <p className="font-bold text-emerald-300">2x Iguais</p>
              <p className="text-white font-black text-sm">1.5x Aposta</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 italic">RTP Teórico: {game.rtp}</p>
        </div>
      )}

      {/* Slot Machine Display Header & Frame */}
      <div
        className={`rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-br ${game.gradient} p-5 sm:p-7 relative shadow-2xl`}
      >
        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />

        <div className="relative z-10 flex items-center justify-between">
          <div>
            <span className="text-white/80 text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded bg-black/40 border border-white/10">
              {game.studio} ORIGINAL
            </span>
            <h1 className="text-2xl sm:text-4xl font-black text-white mt-1 drop-shadow-md">
              {game.name}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-0.5">
              Combine símbolos iguais nos rolos para faturar prêmios!
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-white/70 font-semibold uppercase block">
              Saldo Atual
            </span>
            <span className="text-lg sm:text-2xl font-black text-white">
              R$ {user.balance.toFixed(2)}
            </span>
          </div>
        </div>

        {/* 3 Reels Stage */}
        <div className="relative z-10 mt-6 bg-slate-950/90 rounded-2xl p-4 sm:p-6 border border-white/15 shadow-inner">
          <div className="grid grid-cols-3 gap-3 sm:gap-5">
            {reels.map((symbolKey, index) => {
              const sym = SYMBOL_ICONS[symbolKey];
              return (
                <div
                  key={index}
                  className={`aspect-square rounded-2xl bg-gradient-to-b ${sym.bg} border-2 border-slate-700/80 flex flex-col items-center justify-center p-3 shadow-lg transition-transform ${
                    isSpinning ? 'scale-95 animate-pulse blur-[1px]' : 'scale-100'
                  }`}
                >
                  <div className="transition-transform transform hover:scale-110">
                    {sym.icon}
                  </div>
                  <span className="text-[10px] sm:text-xs font-black text-white/90 mt-2 uppercase tracking-wider text-center truncate w-full">
                    {sym.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Win announcement bar */}
          <div className="mt-4 text-center min-h-[32px] flex items-center justify-center">
            {lastWin ? (
              <div className="px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg animate-bounce">
                <Sparkles className="w-4 h-4" />
                <span>
                  GRANDE PRÊMIO! +R$ {lastWin.payout.toFixed(2)} ({lastWin.multiplier}x)
                </span>
              </div>
            ) : isSpinning ? (
              <span className="text-xs font-bold text-amber-400 tracking-widest animate-pulse">
                ROLANDO OS CARRETÉIS...
              </span>
            ) : (
              <span className="text-xs text-slate-400 tracking-widest font-semibold">
                BOA SORTE • SELECIONE A APOSTA E GIRE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Controls: Stakes, Turbo, Auto, Spin */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4 shadow-xl">
        {/* Stake Buttons */}
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-medium">
            <span>Valor por Giro</span>
            <span>Aposta Atual: R$ {stake.toFixed(2)}</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {stakeOptions.map(amount => (
              <button
                key={amount}
                onClick={() => setStake(amount)}
                disabled={isSpinning}
                className={`py-2 rounded-xl text-xs font-black transition-all ${
                  stake === amount
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                R$ {amount}
              </button>
            ))}
          </div>
        </div>

        {/* Spin Actions Bar */}
        <div className="flex items-center gap-2 sm:gap-3 pt-2">
          {/* Turbo Toggle */}
          <button
            onClick={() => setTurbo(!turbo)}
            className={`p-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-colors ${
              turbo
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Giro Rápido"
          >
            <Zap className={`w-4 h-4 ${turbo ? 'fill-amber-400' : ''}`} />
            <span className="hidden sm:inline">Turbo</span>
          </button>

          {/* Auto Spin Toggle */}
          <button
            onClick={() => {
              const next = !autoSpin;
              setAutoSpin(next);
              if (next && !isSpinning) spin();
            }}
            className={`p-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-colors ${
              autoSpin
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title="Giro Automático"
          >
            <RotateCcw className={`w-4 h-4 ${autoSpin ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Auto</span>
          </button>

          {/* Big Spin Button */}
          <button
            onClick={spin}
            disabled={isSpinning || user.balance < stake}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 hover:from-emerald-400 hover:to-amber-300 text-slate-950 font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/50 transition-all active:scale-95 disabled:opacity-50"
          >
            <Flame className="w-5 h-5 fill-slate-950" />
            <span>{isSpinning ? 'GIRANDO...' : `GIRAR (R$ ${stake.toFixed(2)})`}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
