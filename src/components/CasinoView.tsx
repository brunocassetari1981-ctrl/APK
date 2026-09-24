import React, { useMemo, useState } from 'react';
import {
  Bomb, CircleDot, Coins, Flame, Plane, Search, ShieldCheck, Sparkles,
  Star, Trophy, Wallet, Zap, ChevronRight, Heart, Gift
} from 'lucide-react';
import { CASINO_GAMES } from '../data/casinoGames';
import { CasinoCategory, CasinoGame } from '../types';
import { useApp } from '../context/AppContext';
import { CrashGameModal } from './CrashGameModal';
import { MinesGameModal } from './MinesGameModal';
import { RouletteGameModal } from './RouletteGameModal';
import { SlotGameModal } from './SlotGameModal';

const categories: { id: CasinoCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Popular', icon: <Trophy className="h-4 w-4" /> },
  { id: 'slots', label: 'Slots', icon: <Zap className="h-4 w-4" /> },
  { id: 'crash', label: 'Crash', icon: <Plane className="h-4 w-4" /> },
  { id: 'mines', label: 'Mines', icon: <Bomb className="h-4 w-4" /> },
  { id: 'roulette', label: 'Roleta', icon: <CircleDot className="h-4 w-4" /> },
];

const artwork: Record<string, { emoji: string; gradient: string; glow: string }> = {
  fortune_rabbit: { emoji: '🐰', gradient: 'from-fuchsia-500 via-pink-500 to-orange-400', glow: 'bg-pink-300' },
  fortune_dragon: { emoji: '🐲', gradient: 'from-cyan-400 via-blue-600 to-orange-500', glow: 'bg-cyan-300' },
  fortune_tiger: { emoji: '🐯', gradient: 'from-orange-500 via-red-500 to-yellow-400', glow: 'bg-orange-300' },
  fortune_rabbit_2: { emoji: '🐰', gradient: 'from-violet-600 via-fuchsia-500 to-pink-400', glow: 'bg-fuchsia-300' },
  fortune_ox: { emoji: '🐂', gradient: 'from-red-600 via-orange-500 to-amber-300', glow: 'bg-red-300' },
  pinata_wins: { emoji: '🪅', gradient: 'from-cyan-400 via-blue-500 to-orange-400', glow: 'bg-yellow-300' },
  fortune_snake: { emoji: '🐍', gradient: 'from-emerald-500 via-cyan-500 to-fuchsia-500', glow: 'bg-emerald-300' },
  mr_treasures_fortune: { emoji: '👑', gradient: 'from-indigo-700 via-violet-600 to-slate-700', glow: 'bg-violet-300' },
  treasure_bowl: { emoji: '🐉', gradient: 'from-emerald-500 via-lime-500 to-orange-500', glow: 'bg-lime-300' },
  lucky_cat: { emoji: '🐱', gradient: 'from-yellow-500 via-orange-400 to-rose-500', glow: 'bg-yellow-200' },
  mines: { emoji: '💣', gradient: 'from-amber-500 via-yellow-500 to-emerald-500', glow: 'bg-yellow-200' },
  crash: { emoji: '🚀', gradient: 'from-red-600 via-orange-500 to-rose-600', glow: 'bg-orange-300' },
  roulette: { emoji: '🎯', gradient: 'from-emerald-500 via-green-600 to-yellow-500', glow: 'bg-emerald-200' },
};

function Poster({ game }: { game: CasinoGame }) {
  const art = artwork[game.id] ?? { emoji: '✨', gradient: game.gradient, glow: 'bg-white' };
  return (
    <div className={`relative aspect-[0.78] overflow-hidden rounded-[1.45rem] bg-gradient-to-br ${art.gradient} ring-1 ring-white/20`}>
      <div className={`absolute -left-8 -top-8 h-28 w-28 rounded-full ${art.glow} opacity-40 blur-2xl`} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(255,255,255,.45),transparent_23%),linear-gradient(160deg,transparent_30%,rgba(0,0,0,.75))]" />
      <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-black/30 to-transparent" />
      <div className="relative z-10 flex items-center justify-between p-2">
        <span className="rounded-lg bg-white/90 px-1.5 py-1 text-[9px] font-black tracking-wider text-slate-900 shadow">{game.studio}</span>
        <span className="rounded-full border border-white/30 bg-black/20 p-1.5 text-white backdrop-blur"><Star className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" /></span>
      </div>
      {game.isHot && <span className="absolute left-2 top-10 z-10 inline-flex items-center gap-1 rounded-full bg-orange-500 px-1.5 py-1 text-[9px] font-black uppercase text-white shadow"><Flame className="h-3 w-3 fill-white" />Hot</span>}
      <div className="absolute inset-x-0 top-[20%] flex justify-center">
        <span className="select-none text-[4.5rem] drop-shadow-[0_12px_12px_rgba(0,0,0,.5)] transition duration-300 group-hover:scale-110 sm:text-[5.5rem]" role="img" aria-label={game.name}>{art.emoji}</span>
      </div>
      <div className="absolute bottom-0 inset-x-0 z-10 px-2 pb-2 pt-10 text-center">
        <h3 className="text-[13px] font-black leading-tight text-white drop-shadow-md sm:text-sm">{game.name}</h3>
        <div className="mt-1 flex items-center justify-center gap-1 text-[9px] font-bold text-white/75"><Sparkles className="h-3 w-3 text-yellow-300" /> RTP {game.rtp}</div>
      </div>
    </div>
  );
}

export const CasinoView: React.FC = () => {
  const { user, setActiveTab, showToast } = useApp();
  const [category, setCategory] = useState<CasinoCategory>('all');
  const [query, setQuery] = useState('');
  const [activeGame, setActiveGame] = useState<CasinoGame | null>(null);

  const games = useMemo(() => CASINO_GAMES.filter(game =>
    (category === 'all' || game.category === category) && game.name.toLowerCase().includes(query.toLowerCase())
  ), [category, query]);

  if (activeGame) {
    if (activeGame.category === 'mines') return <MinesGameModal game={activeGame} onBack={() => setActiveGame(null)} />;
    if (activeGame.category === 'crash') return <CrashGameModal game={activeGame} onBack={() => setActiveGame(null)} />;
    if (activeGame.category === 'roulette') return <RouletteGameModal game={activeGame} onBack={() => setActiveGame(null)} />;
    return <SlotGameModal game={activeGame} onBack={() => setActiveGame(null)} />;
  }

  return (
    <section className="min-h-[calc(100vh-7rem)] space-y-4 rounded-[2rem] bg-[#101116] p-3 text-white sm:p-5">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-yellow-300/40 bg-gradient-to-br from-[#35126e] via-[#21134c] to-[#111b3f] p-4 shadow-[0_18px_55px_rgba(101,49,190,.25)] sm:p-5">
        <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="relative flex items-center justify-between">
          <div><div className="text-[10px] font-black uppercase tracking-[.28em] text-yellow-300">FortuneGo</div><div className="mt-1 text-xl font-black tracking-tight sm:text-2xl">Casino <span className="text-fuchsia-300">Premium</span></div></div>
          <button onClick={() => setActiveTab('wallet')} className="rounded-xl border border-lime-200/70 bg-lime-300 px-3 py-2 text-xs font-black text-slate-950 shadow-lg shadow-lime-500/20">Depósito</button>
        </div>
        <div className="relative mt-4 rounded-2xl border border-yellow-300/60 bg-gradient-to-r from-fuchsia-700/80 via-purple-700/80 to-indigo-700/80 px-3 py-2 text-center shadow-inner">
          <div className="text-[10px] font-black uppercase tracking-[.25em] text-yellow-100">Jackpot Grand</div>
          <div className="text-2xl font-black tracking-wider text-yellow-300 sm:text-3xl">13.523.038,67</div>
        </div>
        <div className="relative mt-3 grid grid-cols-3 gap-2 text-center">
          {[['MAJOR', '975.030,79', 'from-red-600 to-rose-700'], ['MINOR', '2,00', 'from-blue-600 to-indigo-700'], ['MINI', '1,00', 'from-emerald-600 to-green-700']].map(([label, value, color]) => <div key={label} className={`rounded-xl border border-white/20 bg-gradient-to-br ${color} px-1 py-2 shadow-lg`}><div className="text-[9px] font-black tracking-widest text-white/80">{label}</div><div className="mt-1 text-sm font-black text-yellow-100">{value}</div></div>)}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map(item => <button key={item.id} onClick={() => setCategory(item.id)} className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[11px] font-black transition ${category === item.id ? 'bg-yellow-300 text-slate-950 shadow-lg shadow-yellow-400/20' : 'border border-white/10 bg-[#20212a] text-slate-300 hover:bg-[#2b2d39]'}`}>{item.icon}{item.label}</button>)}
      </div>

      <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar jogo, provedor ou categoria" className="w-full rounded-2xl border border-white/10 bg-[#1d1e26] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-yellow-300/70 focus:ring-2 focus:ring-yellow-300/10" /></div>

      <div className="flex items-center justify-between"><div><div className="text-lg font-black">Jogos em destaque</div><div className="text-xs text-slate-500">Escolha seu próximo giro</div></div><button onClick={() => setCategory('all')} className="flex items-center gap-1 text-xs font-bold text-yellow-300">Ver todos <ChevronRight className="h-4 w-4" /></button></div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {games.map(game => <button key={game.id} onClick={() => setActiveGame(game)} className="group rounded-[1.45rem] bg-[#191a21] p-1.5 text-left shadow-[0_12px_28px_rgba(0,0,0,.32)] transition duration-300 hover:-translate-y-1 hover:bg-[#242531] hover:shadow-[0_16px_35px_rgba(0,0,0,.45)]" aria-label={`Abrir ${game.name}`}><Poster game={game} /><div className="flex items-center justify-between px-1.5 pb-1 pt-2 text-[10px]"><span className="text-slate-500">a partir de R$ {game.minBet.toFixed(2)}</span><span className="font-black text-emerald-300">JOGAR</span></div></button>)}
      </div>
      {games.length === 0 && <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-sm text-slate-500">Nenhum jogo encontrado.</div>}

      <div className="flex items-center justify-center gap-2 border-t border-white/10 pt-3 text-[10px] text-slate-500"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Ambiente demonstrativo FortuneGo · jogue com responsabilidade</div>
      <button onClick={() => setActiveTab('wallet')} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-[#1b1c23] p-3 text-left hover:bg-[#242631]"><span className="flex items-center gap-2"><span className="rounded-xl bg-emerald-500/15 p-2 text-emerald-300"><Wallet className="h-5 w-5" /></span><span><span className="block text-[10px] uppercase tracking-widest text-slate-500">Saldo disponível</span><strong className="text-white">R$ {user.balance.toFixed(2)}</strong></span></span><span className="rounded-xl bg-gradient-to-r from-pink-500 to-violet-500 px-3 py-2 text-xs font-black">CARTEIRA</span></button>
      <div className="grid grid-cols-5 rounded-2xl bg-[#1b1c23] p-1 text-[10px] font-bold text-slate-400"><button onClick={() => setActiveTab('home')} className="rounded-xl p-2 hover:bg-white/5">⌂<br />Início</button><button onClick={() => showToast('Ofertas em breve')} className="rounded-xl p-2 hover:bg-white/5"><Gift className="mx-auto h-4 w-4" />Ofertas</button><button onClick={() => setActiveTab('wallet')} className="rounded-xl p-2 hover:bg-white/5"><Coins className="mx-auto h-4 w-4" />Carteira</button><button onClick={() => showToast('Suporte em breve')} className="rounded-xl p-2 hover:bg-white/5">☎<br />Suporte</button><button onClick={() => showToast('Perfil pelo menu principal')} className="rounded-xl p-2 hover:bg-white/5"><Heart className="mx-auto h-4 w-4" />Perfil</button></div>
    </section>
  );
};
