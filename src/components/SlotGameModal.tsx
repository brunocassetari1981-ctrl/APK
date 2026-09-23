import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ChevronDown,
  Coins,
  Crown,
  FastForward,
  Info,
  Menu,
  Play,
  RotateCcw,
  Settings,
  Sparkles,
  Star,
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
  rabbit: { label: 'Coelho da sorte', icon: '🐰', className: 'from-pink-500 to-violet-700' },
  carrot: { label: 'Cenoura dourada', icon: '🥕', className: 'from-orange-400 to-red-700' },
  coin: { label: 'Moedas da fortuna', icon: '🪙', className: 'from-yellow-300 to-amber-600' },
  ingot: { label: 'Barra de ouro', icon: '🪙', className: 'from-amber-300 to-orange-700' },
  gem: { label: 'Gema brilhante', icon: '💎', className: 'from-cyan-300 to-blue-700' },
  star: { label: 'Estrela premium', icon: '⭐', className: 'from-fuchsia-400 to-purple-800' },
};

const SYMBOL_POOL: SymbolKey[] = ['rabbit', 'carrot', 'coin', 'ingot', 'gem', 'star'];
const BETS = [0.1, 0.2, 0.5, 1, 2, 5, 10];

export const SlotGameModal: React.FC<SlotGameModalProps> = ({ game, onBack }) => {
  const { user, chargeCasinoStake, payoutCasinoWin, showToast } = useApp();
  const [stake, setStake] = useState(0.1);
  const [reels, setReels] = useState<SymbolKey[]>(['ingot', 'carrot', 'carrot']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [autoSpin, setAutoSpin] = useState(false);
  const [turbo, setTurbo] = useState(false);
  const [message, setMessage] = useState('FortuneGo recompensa você com grandes prêmios');
  const autoRef = useRef(false);

  useEffect(() => {
    autoRef.current = autoSpin;
  }, [autoSpin]);

  useEffect(() => () => setAutoSpin(false), []);

  const randomReels = (): SymbolKey[] => [0, 1, 2].map(() => SYMBOL_POOL[Math.floor(Math.random() * SYMBOL_POOL.length)]);

  const spin = () => {
    if (isSpinning) return;
    if (stake < game.minBet || stake > game.maxBet) {
      showToast(`Aposta entre R$ ${game.minBet.toFixed(2)} e R$ ${game.maxBet.toFixed(2)}`);
      return;
    }
    if (!chargeCasinoStake(stake, game.name)) {
      setAutoSpin(false);
      return;
    }

    setIsSpinning(true);
    setMessage('Girando os rolos...');
    sounds.playSpin();
    const duration = turbo ? 450 : 850;
    const timer = window.setTimeout(() => {
      const result = randomReels();
      setReels(result);
      setIsSpinning(false);

      const counts = result.reduce<Record<string, number>>((acc, symbol) => {
        acc[symbol] = (acc[symbol] ?? 0) + 1;
        return acc;
      }, {});
      const best = Math.max(...Object.values(counts));
      const multiplier = best === 3 ? (result[0] === 'rabbit' ? 25 : 10) : best === 2 ? 2 : 0;
      const payout = Number((stake * multiplier).toFixed(2));

      if (payout > 0) {
        payoutCasinoWin(payout, game.name);
        setMessage(`Prêmio de R$ ${payout.toFixed(2)} · ${multiplier}x`);
      } else {
        setMessage('Boa sorte no próximo giro');
      }

      if (autoRef.current) window.setTimeout(() => spin(), 650);
    }, duration);

    return () => window.clearTimeout(timer);
  };

  return (
    <div className="mx-auto min-h-[calc(100vh-8rem)] max-w-3xl overflow-hidden rounded-[2rem] bg-[#17152b] text-white shadow-2xl">
      <header className="bg-gradient-to-r from-[#27105f] via-[#5a0a70] to-[#8b1c66] px-3 pb-3 pt-2 sm:px-5">
        <div className="flex items-center justify-between gap-2">
          <button onClick={() => { setAutoSpin(false); onBack(); }} className="rounded-xl p-2 text-white/80 hover:bg-white/10" aria-label="Voltar">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-200">FortuneGo</div>
            <h1 className="text-xl font-black text-yellow-300 drop-shadow sm:text-2xl">{game.name}</h1>
          </div>
          <button onClick={() => showToast(`RTP demonstrativo: ${game.rtp}`)} className="rounded-xl p-2 text-white/80 hover:bg-white/10" aria-label="Informações">
            <Info className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-2 rounded-xl border-2 border-yellow-300/80 bg-gradient-to-r from-fuchsia-700 via-purple-700 to-fuchsia-700 px-3 py-2 text-center shadow-[0_0_18px_rgba(250,204,21,.25)]">
          <div className="flex items-center justify-center gap-1 text-[10px] font-black uppercase tracking-[0.18em] text-yellow-100"><Crown className="h-3.5 w-3.5" /> Jackpot Fortune</div>
          <div className="text-2xl font-black tracking-wide text-yellow-300 sm:text-3xl">13.523.038,67</div>
        </div>

        <div className="mt-2 grid grid-cols-3 gap-1.5 text-center text-[10px] font-black uppercase">
          <div className="rounded-lg border border-red-300/60 bg-red-600/80 px-1 py-2">Major<br /><span className="text-sm text-yellow-200">975.030,79</span></div>
          <div className="rounded-lg border border-blue-300/60 bg-blue-600/80 px-1 py-2">Minor<br /><span className="text-sm text-yellow-200">2,00</span></div>
          <div className="rounded-lg border border-green-300/60 bg-green-600/80 px-1 py-2">Mini<br /><span className="text-sm text-yellow-200">1,00</span></div>
        </div>
      </header>

      <div className="bg-[#101a3b] px-3 py-2 sm:px-5">
        <div className="flex items-center gap-2 rounded-xl bg-black/25 px-3 py-2 text-xs">
          <Sparkles className="h-4 w-4 text-yellow-300" />
          <span className="font-bold">Tarefa</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/20"><div className="h-full w-0 rounded-full bg-emerald-400" /></div>
          <span className="text-white/80">0/10</span>
          <Menu className="h-5 w-5 text-white/70" />
        </div>

        <div className="relative mt-3 overflow-hidden rounded-[1.5rem] border-4 border-yellow-400/80 bg-gradient-to-b from-[#6b1c9b] via-[#2b075e] to-[#18063f] p-2 shadow-[0_0_28px_rgba(217,70,239,.35)] sm:p-4">
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-cyan-400/30 to-transparent" />
          <div className="relative mb-2 text-center text-4xl drop-shadow-lg sm:text-6xl">🐰</div>
          <div className="relative grid grid-cols-3 gap-1.5 rounded-xl border-2 border-yellow-400 bg-[#26004b] p-2 sm:gap-3 sm:p-3">
            {reels.map((symbol, index) => {
              const item = SYMBOLS[symbol];
              return (
                <div key={`${symbol}-${index}`} className={`flex aspect-[0.72] items-center justify-center rounded-lg border-2 border-fuchsia-300/40 bg-gradient-to-b ${item.className} shadow-inner ${isSpinning ? 'animate-pulse blur-[1px]' : ''}`}>
                  <span className="text-5xl drop-shadow-lg sm:text-7xl" role="img" aria-label={item.label}>{item.icon}</span>
                </div>
              );
            })}
          </div>
          <div className="relative mt-2 rounded-lg bg-blue-700/90 px-2 py-2 text-center text-xs font-black text-white sm:text-sm">{message}</div>
        </div>

        <div className="mt-2 flex items-center justify-between rounded-xl bg-[#292b85] px-3 py-2 text-sm font-black">
          <div className="flex items-center gap-2"><Coins className="h-5 w-5 text-yellow-300" /><span>R$ {user.balance.toFixed(2)}</span><button onClick={() => showToast('Abra a Carteira para depositar via PIX')} className="rounded-lg bg-orange-400 p-1.5 text-slate-950"><Coins className="h-4 w-4" /></button></div>
          <button onClick={() => showToast('Menu do jogo')} className="flex items-center gap-1 text-white/80"><Menu className="h-5 w-5" /> Mais</button>
        </div>

        <div className="grid grid-cols-2 gap-2 py-3 text-center">
          <button onClick={() => setStake(Math.max(game.minBet, Number((stake - 0.1).toFixed(2))))} className="rounded-lg border border-white/40 bg-white/5 py-2 text-lg">−</button>
          <button onClick={() => setStake(Math.min(game.maxBet, Number((stake + 0.1).toFixed(2))))} className="rounded-lg border border-white/40 bg-white/5 py-2 text-lg">+</button>
        </div>
        <div className="grid grid-cols-4 gap-1.5 pb-3 sm:grid-cols-7">
          {BETS.map(value => <button key={value} onClick={() => setStake(value)} className={`rounded-lg py-2 text-[11px] font-black ${stake === value ? 'bg-pink-500 text-white' : 'bg-[#292b85] text-slate-200'}`}>{value.toFixed(2)}</button>)}
        </div>

        <div className="grid grid-cols-2 gap-2 pb-2 sm:grid-cols-4">
          <button onClick={() => setTurbo(value => !value)} className={`flex items-center justify-center gap-1 rounded-xl border py-3 text-xs font-black ${turbo ? 'border-yellow-300 bg-yellow-400 text-slate-950' : 'border-white/30 bg-white/5'}`}><FastForward className="h-4 w-4" /> Rápido</button>
          <button onClick={() => setAutoSpin(value => !value)} className={`flex items-center justify-center gap-1 rounded-xl border py-3 text-xs font-black ${autoSpin ? 'border-pink-300 bg-pink-500' : 'border-white/30 bg-white/5'}`}><RotateCcw className="h-4 w-4" /> Auto</button>
          <button onClick={() => showToast('Linhas de pagamento: 10')} className="flex items-center justify-center gap-1 rounded-xl border border-white/30 bg-white/5 py-3 text-xs font-black"><Settings className="h-4 w-4" /> 10 linhas</button>
          <button onClick={spin} disabled={isSpinning || user.balance < stake} className="flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 py-3 text-xs font-black text-white disabled:cursor-not-allowed disabled:opacity-50"><Play className="h-4 w-4 fill-white" /> {isSpinning ? 'Girando' : 'Girar'}</button>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-2 text-[10px] text-slate-400"><span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-emerald-300" /> RTP {game.rtp}</span><span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 text-yellow-300" /> Jogue com responsabilidade</span></div>
      </div>
    </div>
  );
};
