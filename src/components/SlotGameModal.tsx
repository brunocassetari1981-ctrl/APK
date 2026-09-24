import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, Coins, Crown, FastForward, Flame, Info, Menu, Play,
  RotateCcw, Settings, Sparkles, Star, Trophy, Zap,
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

function randomSymbol(): SymbolKey {
  return SYMBOL_POOL[Math.floor(Math.random() * SYMBOL_POOL.length)];
}

function outcomeForSpin(): SymbolKey[] {
  const roll = Math.random();
  if (roll < 0.06) return ['rabbit', 'rabbit', 'rabbit'];
  if (roll < 0.14) return ['gem', 'gem', 'gem'];
  if (roll < 0.3) return ['coin', 'coin', 'coin'];
  if (roll < 0.48) {
    const symbol = randomSymbol();
    return [symbol, symbol, randomSymbol()];
  }
  return ['carrot', 'ingot', 'coin'];
}

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
    <div className="relative h-[19rem] overflow-hidden rounded-[1.15rem] border-2 border-yellow-300/70 bg-[#17052e] shadow-[inset_0_0_28px_rgba(0,0,0,.7)] sm:h-[28rem]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-black/70 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-1 -translate-y-1/2 bg-yellow-200/80 shadow-[0_0_14px_rgba(253,224,71,.9)]" />
      <div
        className="absolute inset-x-1 top-1/2 transition-transform ease-out"
        style={{
          transform: `translateY(calc(-${(position || start) * 100}% / 1.9 + 9.8rem))`,
          transitionDuration: spinning ? '55ms' : '500ms',
          transitionDelay: `${delay}ms`,
        }}
      >
        {reelItems.map((item, index) => {
          const tile = SYMBOLS[item];
          return (
            <div key={`${item}-${index}`} className="flex h-[10rem] items-center justify-center sm:h-[14rem]">
              <div className={`flex h-[9rem] w-full items-center justify-center rounded-xl bg-gradient-to-b ${tile.color} shadow-[inset_0_2px_12px_rgba(255,255,255,.35),inset_0_-14px_24px_rgba(0,0,0,.3)] sm:h-[13rem]`}>
                <span className="select-none text-[4.5rem] drop-shadow-[0_10px_8px_rgba(0,0,0,.45)] sm:text-[7rem]" role="img" aria-label={tile.label}>{tile.icon}</span>
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
  const [stake, setStake] = useState(initial);
  const [reels, setReels] = useState<SymbolKey[]>(['ingot', 'carrot', 'rabbit']);
  const [positions, setPositions] = useState([18, 19, 20]);
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
      showToast(`Aposta entre R$ ${game.minBet.toFixed(2)} e R$ ${game.maxBet.toFixed(2)}`);
      return;
    }
    if (!chargeCasinoStake(stake, game.name)) { setAutoSpin(false); return; }

    setIsSpinning(true);
    setMessage('Os rolos estão girando...');
    sounds.playSpin();
    const duration = turbo ? 700 : 1500;
    const tick = turbo ? 55 : 75;
    let elapsed = 0;
    const interval = window.setInterval(() => {
      setPositions(previous => previous.map((value, index) => value + 1 + index));
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

      const counts = result.reduce<Record<string, number>>((all, symbol) => ({ ...all, [symbol]: (all[symbol] ?? 0) + 1 }), {});
      const matches = Math.max(...Object.values(counts));
      const multiplier = matches === 3 ? (result[0] === 'rabbit' ? 25 : result[0] === 'gem' ? 15 : 8) : matches === 2 ? 2 : 0;
      const payout = Number((stake * multiplier).toFixed(2));
      if (payout > 0) {
        payoutCasinoWin(payout, game.name);
        setMessage(`Grande prêmio! +R$ ${payout.toFixed(2)} (${multiplier}x)`);
      } else setMessage('Boa sorte no próximo giro');

      if (autoRef.current) window.setTimeout(() => { if (autoRef.current) spinRef.current(); }, 850);
    }, tick);
  }, [chargeCasinoStake, game.maxBet, game.minBet, game.name, isSpinning, payoutCasinoWin, showToast, stake, turbo]);

  spinRef.current = spin;
  useEffect(() => () => setAutoSpin(false), []);

  return (
    <div className="mx-auto min-h-[calc(100vh-5rem)] max-w-5xl overflow-hidden rounded-[2rem] bg-[#080b19] text-white shadow-[0_24px_90px_rgba(0,0,0,.55)]">
      <header className="bg-gradient-to-r from-[#4b1b91] via-[#8b236d] to-[#b42d70] px-3 pb-4 pt-2 sm:px-7">
        <div className="flex items-center justify-between">
          <button onClick={() => { setAutoSpin(false); onBack(); }} className="rounded-xl p-2 text-white/90 hover:bg-white/10" aria-label="Voltar"><ArrowLeft className="h-6 w-6" /></button>
          <div className="text-center"><div className="text-[10px] font-black uppercase tracking-[.3em] text-yellow-200">FortuneGo</div><h1 className="text-2xl font-black text-yellow-300 sm:text-4xl">{game.name}</h1></div>
          <button onClick={() => showToast(`RTP do jogo: ${game.rtp}`)} className="rounded-xl p-2 text-white/90 hover:bg-white/10" aria-label="Informações"><Info className="h-6 w-6" /></button>
        </div>
        <div className="mt-4 rounded-2xl border-2 border-yellow-300/80 bg-gradient-to-r from-[#4725b4] via-[#4d2a99] to-[#813a98] px-3 py-3 text-center shadow-[0_0_25px_rgba(250,204,21,.22)]"><div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[.3em] text-yellow-100"><Crown className="h-4 w-4" /> Jackpot</div><div className="text-3xl font-black tracking-wider text-yellow-300 sm:text-5xl">GRAND 13.523.038,67</div></div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs font-black"><div className="rounded-xl border border-red-300/60 bg-red-600 px-2 py-3">MAJOR<div className="mt-1 text-lg text-yellow-100">975.030,79</div></div><div className="rounded-xl border border-blue-300/60 bg-blue-600 px-2 py-3">MINOR<div className="mt-1 text-lg text-yellow-100">2,00</div></div><div className="rounded-xl border border-green-300/60 bg-green-600 px-2 py-3">MINI<div className="mt-1 text-lg text-yellow-100">1,00</div></div></div>
      </header>

      <main className="bg-[#11152b] px-3 py-3 sm:px-7 sm:py-5">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#1b1e32] px-3 py-3"><Sparkles className="h-5 w-5 text-yellow-300" /><span className="font-black">Tarefa</span><div className="h-3 flex-1 overflow-hidden rounded-full bg-black/30"><div className="h-full w-1/2 rounded-full bg-emerald-400" /></div><span className="font-black text-white/70">0/10</span><button onClick={() => setShowPaytable(value => !value)} className="rounded-xl border border-white/10 bg-white/5 p-2"><Info className="h-4 w-4" /></button></div>
        {showPaytable && <div className="mt-3 grid grid-cols-2 gap-2 rounded-2xl border border-yellow-300/30 bg-black/25 p-3 text-xs sm:grid-cols-4"><div><b className="text-yellow-300">🐰 3x Coelho</b><br />25x aposta</div><div><b className="text-cyan-300">💎 3x Gema</b><br />15x aposta</div><div><b className="text-amber-300">🪙 3x Moedas</b><br />8x aposta</div><div><b className="text-emerald-300">2 símbolos</b><br />2x aposta</div></div>}

        <section className="relative mt-4 overflow-hidden rounded-[2rem] border-4 border-yellow-400/90 bg-gradient-to-b from-[#4851c2] via-[#321574] to-[#16052f] p-3 shadow-[0_0_34px_rgba(250,204,21,.22)] sm:p-6">
          <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-cyan-300/25 to-transparent" />
          <div className="relative mb-3 text-center text-6xl drop-shadow-lg sm:text-8xl">🐰</div>
          <div className="relative rounded-[1.5rem] border-2 border-yellow-300/70 bg-[#16052b] p-2 sm:p-4"><div className="grid grid-cols-3 gap-2 sm:gap-4"><Reel symbol={reels[0]} position={positions[0]} spinning={isSpinning} delay={0} /><Reel symbol={reels[1]} position={positions[1]} spinning={isSpinning} delay={40} /><Reel symbol={reels[2]} position={positions[2]} spinning={isSpinning} delay={80} /></div><div className="mt-3 rounded-xl border border-blue-300/50 bg-[#123b88] px-3 py-3 text-center text-sm font-black sm:text-lg">{message}</div></div>
        </section>

        <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-[#202044] px-4 py-3"><div className="flex items-center gap-2 text-lg font-black"><span className="rounded-full bg-emerald-400/15 p-2 text-emerald-300"><Coins className="h-5 w-5" /></span>R$ {user.balance.toFixed(2)}</div><button onClick={() => showToast('Opções do jogo')} className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 font-bold"><Menu className="h-5 w-5" />Mais</button></div>

        <div className="mt-3 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-[#1b1e32] p-2"><button onClick={() => setStake(Math.max(game.minBet, Number((stake - .1).toFixed(2))))} className="rounded-xl bg-[#2b2d4d] py-3 text-2xl font-black">−</button><div className="flex flex-col items-center justify-center"><span className="text-[10px] uppercase tracking-widest text-slate-400">Aposta</span><strong className="text-2xl text-yellow-300">R$ {stake.toFixed(2)}</strong></div><button onClick={() => setStake(Math.min(game.maxBet, Number((stake + .1).toFixed(2))))} className="rounded-xl bg-[#2b2d4d] py-3 text-2xl font-black">+</button></div>
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-7">{BETS.map(value => <button key={value} onClick={() => setStake(Math.min(game.maxBet, Math.max(game.minBet, value)))} className={`rounded-xl py-2 text-xs font-black ${stake === value ? 'bg-pink-500 text-white' : 'bg-[#292b4c] text-slate-300'}`}>{value.toFixed(2)}</button>)}</div>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"><button onClick={() => setTurbo(value => !value)} className={`flex items-center justify-center gap-2 rounded-2xl border py-4 text-sm font-black ${turbo ? 'border-yellow-300 bg-yellow-400 text-slate-950' : 'border-white/15 bg-white/5 text-white/80'}`}><FastForward className="h-5 w-5" />Rápido</button><button onClick={() => setAutoSpin(value => !value)} className={`flex items-center justify-center gap-2 rounded-2xl border py-4 text-sm font-black ${autoSpin ? 'border-pink-300 bg-pink-500' : 'border-white/15 bg-white/5 text-white/80'}`}><RotateCcw className={`h-5 w-5 ${autoSpin ? 'animate-spin' : ''}`} />Auto</button><button onClick={() => showToast('10 linhas ativas')} className="flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/5 py-4 text-sm font-black text-white/80"><Settings className="h-5 w-5" />10 Lines</button><button onClick={spin} disabled={isSpinning || user.balance < stake} className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-violet-500 to-fuchsia-500 py-4 text-sm font-black disabled:opacity-50"><Play className="h-5 w-5 fill-white" />{isSpinning ? 'Girando' : 'GIRAR'}</button></div>
        <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-slate-400"><span className="flex items-center gap-1"><Flame className="h-4 w-4 text-orange-300" />RTP {game.rtp}</span><span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-300" />Jogue com responsabilidade</span></div>
      </main>
    </div>
  );
};
