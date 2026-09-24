import React, { useCallback, useEffect, useRef, useState } from 'react';
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
  Settings,
  Sparkles,
  Star,
} from 'lucide-react';
import { CasinoGame } from '../types';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';

interface SlotGameModalProps { game: CasinoGame; onBack: () => void; }
type SymbolKey = 'rabbit' | 'carrot' | 'coin' | 'ingot' | 'gem' | 'star';

const SYMBOLS: Record<SymbolKey, { label: string; icon: string; color: string }> = {
  rabbit: { label: 'Coelho da sorte', icon: '🐰', color: 'from-pink-500 via-fuchsia-500 to-violet-700' },
  carrot: { label: 'Cenoura', icon: '🥕', color: 'from-orange-400 via-orange-500 to-red-600' },
  coin: { label: 'Moedas', icon: '🪙', color: 'from-yellow-300 via-amber-400 to-orange-600' },
  ingot: { label: 'Barra dourada', icon: '🥇', color: 'from-yellow-200 via-yellow-500 to-amber-700' },
  gem: { label: 'Gema', icon: '💎', color: 'from-cyan-300 via-sky-500 to-blue-700' },
  star: { label: 'Estrela', icon: '⭐', color: 'from-fuchsia-400 via-violet-500 to-purple-800' },
};

const SYMBOL_POOL: SymbolKey[] = ['rabbit', 'carrot', 'coin', 'ingot', 'gem', 'star'];
const BETS = [0.1, 0.2, 0.5, 1, 2, 5, 10];
const REEL_SYMBOLS: SymbolKey[] = [...SYMBOL_POOL, ...SYMBOL_POOL, ...SYMBOL_POOL, ...SYMBOL_POOL];

const randomSymbol = (): SymbolKey => SYMBOL_POOL[Math.floor(Math.random() * SYMBOL_POOL.length)];

const outcomeForSpin = (): SymbolKey[] => {
  const roll = Math.random();
  if (roll < 0.06) return ['rabbit', 'rabbit', 'rabbit'];
  if (roll < 0.14) return ['gem', 'gem', 'gem'];
  if (roll < 0.30) return ['coin', 'coin', 'coin'];
  if (roll < 0.48) {
    const symbol = randomSymbol();
    return [symbol, symbol, randomSymbol()];
  }
  return ['carrot', 'ingot', 'coin'];
};

interface ReelProps {
  symbol: SymbolKey;
  position: number;
  spinning: boolean;
  delay: number;
}

const Reel: React.FC<ReelProps> = ({ symbol, position, spinning, delay }) => {
  const visibleIndex = REEL_SYMBOLS.findIndex(item => item === symbol);
  const start = visibleIndex < 0 ? 0 : visibleIndex + SYMBOL_POOL.length * 2;
  const reelItems = [...REEL_SYMBOLS, ...REEL_SYMBOLS];

  return (
    <div className="relative h-[17rem] overflow-hidden rounded-[1rem] border-2 border-yellow-300/70 bg-[#17052e] shadow-[inset_0_0_30px_rgba(0,0,0,.7)] sm:h-[22rem]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-1 -translate-y-1/2 bg-yellow-200/85 shadow-[0_0_18px_rgba(253,224,71,.9)]" />
      <div
        className="absolute inset-x-1 top-1/2 transition-transform ease-out"
        style={{
          transform: `translateY(calc(-${(position || start) * 100}% / 1.9 + 8.4rem))`,
          transitionDuration: spinning ? '65ms' : '420ms',
          transitionDelay: `${delay}ms`,
        }}
      >
        {reelItems.map((item, index) => {
          const tile = SYMBOLS[item];
          return (
            <div key={`${item}-${index}`} className="flex h-[8.5rem] items-center justify-center sm:h-[10.75rem]">
              <div className={`flex h-[7.4rem] w-full items-center justify-center rounded-[0.9rem] bg-gradient-to-b ${tile.color} border border-white/10 shadow-[inset_0_2px_12px_rgba(255,255,255,.35),inset_0_-14px_24px_rgba(0,0,0,.3)] sm:h-[9.7rem]`}>
                <span className="select-none text-[3.3rem] drop-shadow-[0_10px_8px_rgba(0,0,0,.45)] sm:text-[5.8rem]" role="img" aria-label={tile.label}>{tile.icon}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const SlotGameModal: React.FC<SlotGameModalProps> = ({ game, onBack }) => {
  const { user, chargeCasinoStake, payoutCasinoWin, showToast } = useApp();
  const initial = Math.min(Math.max(game.minBet, 0.1), game.maxBet);

  const [stake, setStake] = useState<number>(initial);
  const [reels, setReels] = useState<SymbolKey[]>(['ingot', 'carrot', 'rabbit']);
  const [positions, setPositions] = useState<number[]>([18, 19, 20]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [turbo, setTurbo] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);
  const [message, setMessage] = useState('Boa sorte no próximo giro');

  const autoRef = useRef(autoSpin);
  const spinRef = useRef<() => void>(() => undefined);

  useEffect(() => { autoRef.current = autoSpin; }, [autoSpin]);

  const spin = useCallback(() => {
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
    setMessage('Girando os rolos...');
    sounds.playSpin();

    const duration = turbo ? 700 : 1400;
    const tick = turbo ? 55 : 75;
    let elapsed = 0;

    const interval = window.setInterval(() => {
      setPositions(previous => previous.map((value, index) => value + 1 + index * 0.7));
      elapsed += tick;
      if (elapsed < duration) return;

      window.clearInterval(interval);
      const result = outcomeForSpin();
      setReels(result);
      setPositions(result.map((symbol, index) => {
        const symbolIndex = REEL_SYMBOLS.findIndex(item => item === symbol);
        return Math.max(0, symbolIndex + SYMBOL_POOL.length * 2 + index * 2);
      }));
      setIsSpinning(false);

      const counts: Record<string, number> = {};
      result.forEach(symbol => {
        counts[symbol] = (counts[symbol] ?? 0) + 1;
      });
      const matches = Math.max(...Object.values(counts), 0);
      const multiplier =
        matches === 3
          ? result[0] === 'rabbit'
            ? 25
            : result[0] === 'gem'
              ? 15
              : 8
          : matches === 2
            ? 2
            : 0;

      const payout = Number((stake * multiplier).toFixed(2));
      if (multiplier > 0) {
        payoutCasinoWin(payout, game.name);
        setMessage(`Grande prêmio! +R$ ${payout.toFixed(2)} (${multiplier}x)`);
      } else {
        setMessage('Boa sorte no próximo giro');
      }

      if (autoRef.current) {
        window.setTimeout(() => {
          if (autoRef.current) spinRef.current();
        }, 850);
      }
    }, tick);
  }, [chargeCasinoStake, game.maxBet, game.minBet, game.name, isSpinning, payoutCasinoWin, showToast, stake, turbo]);

  spinRef.current = spin;

  useEffect(() => () => setAutoSpin(false), []);

  return (
    <div className="mx-auto min-h-[calc(100vh-5rem)] max-w-[30rem] overflow-hidden rounded-[2rem] bg-[#050b1a] text-white shadow-[0_30px_100px_rgba(0,0,0,.6)]">
      <header className="bg-gradient-to-r from-[#431691] via-[#7f255a] to-[#da3d73] px-3 pb-4 pt-2">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => {
              setAutoSpin(false);
              onBack();
            }}
            className="rounded-xl p-2 text-white/90 transition hover:bg-white/10"
            aria-label="Voltar"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <div className="text-[9px] font-black uppercase tracking-[0.28em] text-yellow-200">FortuneGo</div>
            <h1 className="text-[1.35rem] font-black text-yellow-300">{game.name}</h1>
          </div>

          <button
            onClick={() => showToast(`RTP do jogo: ${game.rtp}`)}
            className="rounded-xl p-2 text-white/90 transition hover:bg-white/10"
            aria-label="Informação do jogo"
          >
            <Info className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-2xl border-2 border-yellow-300/80 bg-gradient-to-r from-[#4b2ac0] via-[#6b2a8b] to-[#9b376d] px-3 py-3 text-center shadow-[0_0_18px_rgba(250,204,21,0.22)]">
          <div className="mb-1 flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.28em] text-yellow-100">
            <Crown className="h-4 w-4" />
            Jackpot
          </div>
          <div className="text-[1.8rem] font-black tracking-[0.04em] text-yellow-300">GRAND 13.523.038,67</div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[9px] font-black uppercase tracking-[0.12em] text-white">
          <div className="rounded-xl border border-red-300/60 bg-red-600/90 px-2 py-3">
            Major
            <div className="mt-1 text-[1rem] text-yellow-100">975.030,79</div>
          </div>
          <div className="rounded-xl border border-blue-300/60 bg-blue-600/90 px-2 py-3">
            Minor
            <div className="mt-1 text-[1rem] text-yellow-100">2,00</div>
          </div>
          <div className="rounded-xl border border-green-300/60 bg-green-600/90 px-2 py-3">
            Mini
            <div className="mt-1 text-[1rem] text-yellow-100">1,00</div>
          </div>
        </div>
      </header>

      <main className="bg-[#11152d] px-3 py-3">
        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#1b1e33] px-3 py-2 text-[11px] font-black text-slate-200">
          <Sparkles className="h-4 w-4 text-yellow-300" />
          <span>Tarefa</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 rounded-full bg-emerald-400" />
          </div>
          <span className="text-white/70">0/10</span>
          <button onClick={() => setShowPaytable(!showPaytable)} className="ml-auto rounded-lg border border-white/10 bg-white/5 p-1.5">
            <Info className="h-4 w-4" />
          </button>
        </div>

        {showPaytable && (
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-yellow-300/20 bg-black/20 p-2 text-[10px] text-slate-200 sm:grid-cols-4">
            <div className="rounded-xl bg-slate-900/80 p-2"><div className="text-cyan-300 font-black">3x Gema</div><div className="mt-1 text-sm font-bold text-white">25x</div></div>
            <div className="rounded-xl bg-slate-900/80 p-2"><div className="text-violet-300 font-black">3x Star</div><div className="mt-1 text-sm font-bold text-white">15x</div></div>
            <div className="rounded-xl bg-slate-900/80 p-2"><div className="text-amber-300 font-black">3x Iguais</div><div className="mt-1 text-sm font-bold text-white">8x</div></div>
            <div className="rounded-xl bg-slate-900/80 p-2"><div className="text-emerald-300 font-black">2x Iguais</div><div className="mt-1 text-sm font-bold text-white">2x</div></div>
          </div>
        )}

        <section className="relative mt-4 overflow-hidden rounded-[1.6rem] border-4 border-yellow-400/95 bg-gradient-to-b from-[#6238be] via-[#31116d] to-[#17072a] p-3 shadow-[0_0_28px_rgba(250,204,21,0.2)]">
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-cyan-300/20 to-transparent" />
          <div className="relative mb-2 text-center text-5xl sm:text-7xl">🐰</div>

          <div className="relative grid grid-cols-3 gap-2 rounded-[1.1rem] border-2 border-yellow-300/75 bg-[#18072f] p-2 sm:gap-3 sm:p-3">
            {reels.map((symbol, index) => {
              const tile = SYMBOLS[symbol];
              return (
                <div key={`${symbol}-${index}`} className={`relative overflow-hidden rounded-[0.95rem] border border-fuchsia-200/20 bg-gradient-to-b ${tile.color}`}>
                  <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-white/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/25 to-transparent" />
                  <div className="flex h-[13.5rem] items-center justify-center sm:h-[16.5rem]">
                    <span className="select-none text-[3.4rem] drop-shadow-[0_12px_10px_rgba(0,0,0,0.45)] sm:text-[5.4rem]" role="img" aria-label={tile.label}>{tile.icon}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative mt-3 rounded-xl border border-blue-300/45 bg-[#113a86]/85 px-3 py-3 text-center text-[11px] font-black text-white sm:text-[13px]">
            {message}
          </div>
        </section>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-[#1d2040] px-4 py-3">
          <div className="flex items-center gap-2 text-lg font-black text-white">
            <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-300">
              <Coins className="h-4 w-4" />
            </div>
            <span>R$ {user.balance.toFixed(2)}</span>
          </div>
          <button onClick={() => showToast('Menu do jogo')} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-2 text-[11px] font-bold text-white/80">
            <Menu className="h-4 w-4" />
            Mais
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-[#1d1f35] p-2">
          <button onClick={() => setStake(Math.max(game.minBet, Number((stake - 0.1).toFixed(2))))} className="rounded-xl border border-white/10 bg-[#2b2d4e] py-3 text-2xl font-black text-white">−</button>
          <div className="flex flex-col items-center justify-center rounded-xl bg-[#2b2d4e]">
            <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400">Aposta</span>
            <span className="text-xl font-black text-yellow-300">R$ {stake.toFixed(2)}</span>
          </div>
          <button onClick={() => setStake(Math.min(game.maxBet, Number((stake + 0.1).toFixed(2))))} className="rounded-xl border border-white/10 bg-[#2b2d4e] py-3 text-2xl font-black text-white">+</button>
        </div>

        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">
          {BETS.map(value => (
            <button
              key={value}
              onClick={() => setStake(Math.min(game.maxBet, Math.max(game.minBet, value)))}
              className={`rounded-xl py-2 text-[10px] font-black ${stake === value ? 'bg-pink-500 text-white shadow-lg shadow-pink-600/30' : 'bg-[#2f2d51] text-slate-200'}`}
            >
              {value.toFixed(2)}
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            onClick={() => setTurbo(value => !value)}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-[11px] font-black ${turbo ? 'border-yellow-300 bg-yellow-400 text-slate-950' : 'border-white/15 bg-white/5 text-white/80'}`}
          >
            <FastForward className="h-4 w-4" />
            Rápido
          </button>

          <button
            onClick={() => setAutoSpin(value => !value)}
            className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 text-[11px] font-black ${autoSpin ? 'border-pink-400 bg-pink-500 text-white' : 'border-white/15 bg-white/5 text-white/80'}`}
          >
            <RotateCcw className={`h-4 w-4 ${autoSpin ? 'animate-spin' : ''}`} />
            Auto
          </button>

          <button
            onClick={() => showToast('10 linhas ativas')}
            className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-3 py-3 text-[11px] font-black text-white/80"
          >
            <Settings className="h-4 w-4" />
            10 Lines
          </button>

          <button
            onClick={spin}
            disabled={isSpinning || user.balance < stake}
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-violet-500 to-fuchsia-500 px-3 py-3 text-[11px] font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play className="h-4 w-4 fill-white" />
            {isSpinning ? 'Girando...' : 'Girar'}
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-slate-300">
          <span className="flex items-center gap-1 font-bold">
            <Flame className="h-3.5 w-3.5 text-amber-300" />
            RTP {game.rtp}
          </span>
          <span className="flex items-center gap-1 font-bold">
            <Star className="h-3.5 w-3.5 text-yellow-300" />
            Jogue com responsabilidade
          </span>
        </div>
      </main>
    </div>
  );
};
