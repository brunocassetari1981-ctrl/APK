import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Coins,
  Crown,
  FastForward,
  Flame,
  Info,
  Menu,
  Play,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  Zap,
} from 'lucide-react';
import { CasinoGame } from '../types';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';

interface SlotGameModalProps {
  game: CasinoGame;
  onBack: () => void;
}

type SymbolKey = 'rabbit' | 'carrot' | 'coin' | 'ingot' | 'gem' | 'star';

const SYMBOLS: Record<SymbolKey, { label: string; icon: string; className: string }> = {
  rabbit: { label: 'Coelho da sorte', icon: '🐰', className: 'from-pink-500 via-violet-500 to-purple-700' },
  carrot: { label: 'Cenoura', icon: '🥕', className: 'from-orange-400 via-orange-500 to-red-600' },
  coin: { label: 'Moedas', icon: '🪙', className: 'from-yellow-300 via-amber-400 to-orange-600' },
  ingot: { label: 'Barra dourada', icon: '🥇', className: 'from-amber-300 via-yellow-500 to-yellow-700' },
  gem: { label: 'Gema', icon: '💎', className: 'from-cyan-300 via-sky-500 to-blue-700' },
  star: { label: 'Estrela', icon: '⭐', className: 'from-fuchsia-400 via-violet-500 to-purple-800' },
};

const SYMBOL_POOL: SymbolKey[] = ['rabbit', 'carrot', 'coin', 'ingot', 'gem', 'star'];
const BETS = [0.1, 0.2, 0.5, 1, 2, 5, 10];

export const SlotGameModal: React.FC<SlotGameModalProps> = ({ game, onBack }) => {
  const { user, chargeCasinoStake, payoutCasinoWin, showToast } = useApp();

  const [stake, setStake] = useState<number>(Math.min(Math.max(game.minBet, 0.1), game.maxBet));
  const [isSpinning, setIsSpinning] = useState(false);
  const [reels, setReels] = useState<SymbolKey[]>(['ingot', 'carrot', 'rabbit']);
  const [lastWin, setLastWin] = useState<{ multiplier: number; payout: number } | null>(null);
  const [turbo, setTurbo] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);
  const [message, setMessage] = useState('Fortune Rabbit recompensa você com grandes prêmios');

  const autoSpinRef = useRef(autoSpin);
  useEffect(() => {
    autoSpinRef.current = autoSpin;
  }, [autoSpin]);

  const spin = () => {
    if (isSpinning) return;
    if (stake < game.minBet || stake > game.maxBet) {
      showToast(`Aposta deve estar entre R$ ${game.minBet.toFixed(2)} e R$ ${game.maxBet.toFixed(2)}`);
      return;
    }

    const charged = chargeCasinoStake(stake, game.name);
    if (!charged) {
      setAutoSpin(false);
      return;
    }

    setIsSpinning(true);
    setLastWin(null);
    setMessage('Girando os rolos...');
    sounds.playSpin();

    const spinDuration = turbo ? 420 : 900;
    const intervalTime = 60;
    const iterations = Math.max(1, Math.floor(spinDuration / intervalTime));

    let count = 0;
    const interval = window.setInterval(() => {
      setReels([
        SYMBOL_POOL[Math.floor(Math.random() * SYMBOL_POOL.length)],
        SYMBOL_POOL[Math.floor(Math.random() * SYMBOL_POOL.length)],
        SYMBOL_POOL[Math.floor(Math.random() * SYMBOL_POOL.length)],
      ]);
      count += 1;

      if (count >= iterations) {
        window.clearInterval(interval);

        const finalOutcome = (() => {
          const roll = Math.random();
          if (roll < 0.06) return ['rabbit', 'rabbit', 'rabbit'];
          if (roll < 0.14) return ['gem', 'gem', 'gem'];
          if (roll < 0.30) return ['coin', 'coin', 'coin'];
          if (roll < 0.48) {
            const sym = SYMBOL_POOL[Math.floor(Math.random() * SYMBOL_POOL.length)];
            return [sym, sym, SYMBOL_POOL[Math.floor(Math.random() * SYMBOL_POOL.length)]];
          }
          return ['carrot', 'ingot', 'coin'];
        })();

        setReels(finalOutcome);
        setIsSpinning(false);

        const matchCount = (() => {
          const counts: Record<string, number> = {};
          finalOutcome.forEach(symbol => {
            counts[symbol] = (counts[symbol] ?? 0) + 1;
          });
          return Math.max(...Object.values(counts), 0);
        })();

        const multiplier =
          matchCount === 3
            ? finalOutcome[0] === 'rabbit'
              ? 25
              : 10
            : matchCount === 2
              ? 2
              : 0;

        const payout = Number((stake * multiplier).toFixed(2));
        if (multiplier > 0) {
          setLastWin({ multiplier, payout });
          payoutCasinoWin(payout, game.name);
          setMessage(`Grande prêmio! +R$ ${payout.toFixed(2)} (${multiplier}x)`);
        } else {
          setMessage('Boa sorte no próximo giro');
        }

        if (autoSpinRef.current) {
          window.setTimeout(() => {
            if (autoSpinRef.current) spin();
          }, 700);
        }
      }
    }, intervalTime);
  };

  useEffect(() => {
    return () => setAutoSpin(false);
  }, []);

  return (
    <div className="mx-auto min-h-[calc(100vh-6rem)] max-w-3xl overflow-hidden rounded-[2rem] bg-[#171625] text-white shadow-[0_22px_80px_rgba(0,0,0,0.45)]">
      <header className="bg-gradient-to-r from-[#4d1e8c] via-[#7b195d] to-[#a62b6c] px-3 pb-3 pt-2 sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => {
              setAutoSpin(false);
              onBack();
            }}
            className="rounded-xl p-2 text-white/80 transition hover:bg-white/10"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-200">FortuneGo</div>
            <h1 className="text-xl font-black text-yellow-300 drop-shadow sm:text-2xl">{game.name}</h1>
          </div>

          <button
            onClick={() => showToast(`RTP do jogo: ${game.rtp}`)}
            className="rounded-xl p-2 text-white/80 transition hover:bg-white/10"
            aria-label="Informação do jogo"
          >
            <Info className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 rounded-[1.25rem] border-2 border-yellow-300/80 bg-gradient-to-r from-[#5c2cbc] via-[#221c64] to-[#7f3a9a] p-2 shadow-[0_0_18px_rgba(250,204,21,0.25)]">
          <div className="mb-1 flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-[0.2em] text-yellow-100">
            <Crown className="h-3.5 w-3.5" />
            Jackpot
          </div>
          <div className="text-center text-2xl font-black tracking-[0.08em] text-yellow-300 sm:text-3xl">GRAND 13.523.038,67</div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-[10px] font-black uppercase">
          <div className="rounded-xl border border-red-300/60 bg-red-600/80 px-1 py-2">
            Major
            <div className="mt-1 text-sm text-yellow-200">975.030,79</div>
          </div>
          <div className="rounded-xl border border-blue-300/60 bg-blue-600/80 px-1 py-2">
            Minor
            <div className="mt-1 text-sm text-yellow-200">2,00</div>
          </div>
          <div className="rounded-xl border border-green-300/60 bg-green-600/80 px-1 py-2">
            Mini
            <div className="mt-1 text-sm text-yellow-200">1,00</div>
          </div>
        </div>
      </header>

      <div className="bg-[#1a1c30] px-3 pb-3 pt-2 sm:px-5">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-black/10 px-3 py-2 text-xs font-bold text-slate-100">
          <Sparkles className="h-4 w-4 text-yellow-300" />
          <span>Tarefa</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 rounded-full bg-emerald-400" />
          </div>
          <span className="text-white/70">0/10</span>
          <button onClick={() => setShowPaytable(!showPaytable)} className="ml-auto rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-white/80">
            <Info className="h-4 w-4" />
          </button>
        </div>

        {showPaytable && (
          <div className="mt-3 rounded-2xl border border-yellow-400/40 bg-black/30 p-3 text-xs text-slate-200">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-yellow-300">
                <Trophy className="h-4 w-4" />
                Tabela de Pagamento
              </div>
              <button onClick={() => setShowPaytable(false)} className="text-white/80">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-lg bg-slate-900/90 p-2"><p className="text-cyan-300 font-black">3x Gema</p><p className="mt-1 text-sm font-bold text-white">25x</p></div>
              <div className="rounded-lg bg-slate-900/90 p-2"><p className="text-violet-300 font-black">3x Star</p><p className="mt-1 text-sm font-bold text-white">15x</p></div>
              <div className="rounded-lg bg-slate-900/90 p-2"><p className="text-amber-300 font-black">3x Iguais</p><p className="mt-1 text-sm font-bold text-white">8x</p></div>
              <div className="rounded-lg bg-slate-900/90 p-2"><p className="text-emerald-300 font-black">2x Iguais</p><p className="mt-1 text-sm font-bold text-white">1.5x</p></div>
            </div>
          </div>
        )}

        <div className="relative mt-3 overflow-hidden rounded-[1.65rem] border-4 border-yellow-400/80 bg-gradient-to-b from-[#5d1ea8] via-[#2b0d4f] to-[#170d36] p-2 shadow-[0_0_28px_rgba(250,204,21,0.25)] sm:p-4">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-400/30 to-transparent" />
          <div className="relative mb-2 text-center text-4xl sm:text-6xl">🐰</div>

          <div className="relative grid grid-cols-3 gap-1.5 rounded-[1.1rem] border-2 border-yellow-300/70 bg-[#1a082f] p-2 sm:gap-3 sm:p-3">
            {reels.map((symbol, index) => {
              const tile = SYMBOLS[symbol];
              return (
                <div
                  key={`${symbol}-${index}`}
                  className={`flex aspect-[0.72] items-center justify-center rounded-xl border-2 border-fuchsia-300/40 bg-gradient-to-b ${tile.className} shadow-inner ${isSpinning ? 'animate-pulse blur-[1px]' : ''}`}
                  aria-label={tile.label}
                >
                  <span className="text-5xl drop-shadow-lg sm:text-7xl" role="img" aria-label={tile.label}>{tile.icon}</span>
                </div>
              );
            })}
          </div>

          <div className="relative mt-2 rounded-xl border border-blue-300/50 bg-[#0f3a87]/80 px-2 py-2 text-center text-xs font-black text-white sm:text-sm">{message}</div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-2xl bg-[#1f1d43] px-3 py-2 shadow-inner">
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-300">
              <Coins className="h-4 w-4" />
            </div>
            <span>R$ {user.balance.toFixed(2)}</span>
          </div>
          <button onClick={() => showToast('Menu do jogo')} className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 text-xs font-bold text-white/80">
            <Menu className="h-4 w-4" />
            Mais
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <button onClick={() => setStake(Math.max(game.minBet, Number((stake - 0.1).toFixed(2))))} className="rounded-2xl border border-white/15 bg-[#2b2c46] py-3 text-2xl font-black text-white">−</button>
          <button onClick={() => setStake(Math.min(game.maxBet, Number((stake + 0.1).toFixed(2))))} className="rounded-2xl border border-white/15 bg-[#2b2c46] py-3 text-2xl font-black text-white">+</button>
        </div>

        <div className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-7">
          {BETS.map(value => (
            <button
              key={value}
              onClick={() => setStake(value)}
              className={`rounded-xl py-2 text-[11px] font-black ${
                stake === value ? 'bg-pink-500 text-white shadow-lg shadow-pink-600/30' : 'bg-[#2f2d51] text-slate-200'
              }`}
            >
              {value.toFixed(2)}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 pb-2 sm:grid-cols-4">
          <button
            onClick={() => setTurbo(value => !value)}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-xs font-black ${
              turbo ? 'border-yellow-300 bg-yellow-400 text-slate-950' : 'border-white/20 bg-white/5 text-white/80'
            }`}
          >
            <FastForward className="h-4 w-4" />
            Rápido
          </button>

          <button
            onClick={() => setAutoSpin(value => !value)}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-xs font-black ${
              autoSpin ? 'border-pink-400 bg-pink-500 text-white' : 'border-white/20 bg-white/5 text-white/80'
            }`}
          >
            <RotateCcw className={`h-4 w-4 ${autoSpin ? 'animate-spin' : ''}`} />
            Auto
          </button>

          <button
            onClick={() => showToast('10 linhas ativas')}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-3 py-3 text-xs font-black text-white/80"
          >
            <Zap className="h-4 w-4" />
            10 Lines
          </button>

          <button
            onClick={spin}
            disabled={isSpinning || user.balance < stake}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-violet-500 to-fuchsia-500 px-3 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play className="h-4 w-4 fill-white" />
            {isSpinning ? 'Girando...' : 'Girar'}
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-slate-300">
          <span className="flex items-center gap-1 font-bold">
            <Flame className="h-3.5 w-3.5 text-amber-300" />
            RTP {game.rtp}
          </span>
          <span className="flex items-center gap-1 font-bold">
            <Star className="h-3.5 w-3.5 text-yellow-300" />
            Jogue com responsabilidade
          </span>
        </div>
      </div>
    </div>
  );
};
