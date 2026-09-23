import React, { useMemo, useState } from 'react';
import {
  Bomb,
  CircleDot,
  Coins,
  Flame,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  Wallet,
  Zap,
} from 'lucide-react';
import { CASINO_GAMES } from '../data/casinoGames';
import { CasinoCategory, CasinoGame } from '../types';
import { CrashGameModal } from './CrashGameModal';
import { MinesGameModal } from './MinesGameModal';
import { RouletteGameModal } from './RouletteGameModal';
import { SlotGameModal } from './SlotGameModal';

const categoryList: { id: CasinoCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Popular', icon: <Trophy className="h-4 w-4" /> },
  { id: 'slots', label: 'Slots', icon: <Zap className="h-4 w-4" /> },
  { id: 'crash', label: 'Crash', icon: <Plane className="h-4 w-4" /> },
  { id: 'mines', label: 'Mines', icon: <Bomb className="h-4 w-4" /> },
  { id: 'roulette', label: 'Roleta', icon: <CircleDot className="h-4 w-4" /> },
];

const visualByGame: Record<string, { emoji: string; gradient: string }> = {
  fortune_rabbit: { emoji: '🐰', gradient: 'from-pink-400 via-pink-500 to-orange-400' },
  fortune_dragon: { emoji: '🐲', gradient: 'from-cyan-400 via-sky-500 to-orange-500' },
  fortune_tiger: { emoji: '🐯', gradient: 'from-orange-500 via-amber-500 to-yellow-500' },
  fortune_rabbit_2: { emoji: '🐰', gradient: 'from-violet-500 via-fuchsia-500 to-pink-500' },
  fortune_ox: { emoji: '🐂', gradient: 'from-red-500 via-orange-500 to-amber-400' },
  pinata_wins: { emoji: '🪅', gradient: 'from-cyan-400 via-blue-500 to-orange-400' },
  fortune_snake: { emoji: '🐍', gradient: 'from-pink-500 via-red-400 to-fuchsia-600' },
  mr_treasures_fortune: { emoji: '👑', gradient: 'from-indigo-500 via-violet-600 to-slate-700' },
  treasure_bowl: { emoji: '🐉', gradient: 'from-emerald-500 via-lime-500 to-orange-500' },
  lucky_cat: { emoji: '🐱', gradient: 'from-pink-500 via-purple-500 to-indigo-500' },
  mines: { emoji: '💣', gradient: 'from-amber-500 via-yellow-500 to-emerald-500' },
  crash: { emoji: '🚀', gradient: 'from-red-500 via-orange-500 to-rose-600' },
  roulette: { emoji: '🎯', gradient: 'from-emerald-500 via-green-600 to-yellow-500' },
};

function GamePoster({ game }: { game: CasinoGame }) {
  const visual = visualByGame[game.id] ?? { emoji: '✨', gradient: game.gradient };

  return (
    <div className={`relative aspect-[3/4] overflow-hidden rounded-[1.35rem] bg-gradient-to-br ${visual.gradient}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_20%),linear-gradient(180deg,rgba(0,0,0,0.05),rgba(0,0,0,0.6))]" />
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-[16px] border-white/15" />
      <div className="absolute -bottom-10 left-0 h-20 w-20 rounded-full bg-white/10 blur-2xl" />

      <div className="relative z-10 flex items-start justify-between p-2">
        <span className="rounded-br-xl rounded-tl-xl bg-amber-300 px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-slate-900 shadow-lg shadow-amber-300/20">
          {game.studio}
        </span>
        <span className="rounded-full bg-white/20 p-1.5 text-white backdrop-blur-sm">
          <Star className="h-3.5 w-3.5 fill-white" />
        </span>
      </div>

      {game.isHot && (
        <span className="absolute left-2.5 top-10 z-10 rounded-full bg-amber-400 p-1.5 shadow-md">
          <Flame className="h-3.5 w-3.5 fill-white text-white" />
        </span>
      )}

      <div className="absolute inset-x-0 top-[22%] flex items-center justify-center">
        <span className="select-none text-6xl drop-shadow-[0_10px_12px_rgba(0,0,0,0.35)] sm:text-7xl" role="img" aria-label={game.name}>
          {visual.emoji}
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-2.5 pb-2.5 pt-8">
        <h3 className="text-center text-sm font-black leading-tight text-white drop-shadow sm:text-base">
          {game.name}
        </h3>
      </div>
    </div>
  );
}

export const CasinoView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CasinoCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGame, setActiveGame] = useState<CasinoGame | null>(null);

  if (activeGame) {
    if (activeGame.category === 'mines') return <MinesGameModal game={activeGame} onBack={() => setActiveGame(null)} />;
    if (activeGame.category === 'crash') return <CrashGameModal game={activeGame} onBack={() => setActiveGame(null)} />;
    if (activeGame.category === 'roulette') return <RouletteGameModal game={activeGame} onBack={() => setActiveGame(null)} />;
    return <SlotGameModal game={activeGame} onBack={() => setActiveGame(null)} />;
  }

  const filteredGames = useMemo(
    () =>
      CASINO_GAMES.filter(game => {
        const categoryMatch = selectedCategory === 'all' || game.category === selectedCategory;
        const queryMatch = game.name.toLowerCase().includes(searchQuery.toLowerCase());
        return categoryMatch && queryMatch;
      }),
    [searchQuery, selectedCategory],
  );

  return (
    <section className="min-h-[calc(100vh-7rem)] space-y-3 rounded-[2rem] bg-[#16151C] p-3 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] sm:p-4">
      <div className="overflow-hidden rounded-[1.5rem] border border-yellow-400/35 bg-gradient-to-r from-[#3c1d7d] via-[#220b4d] to-[#2b113f] p-3 shadow-[0_12px_34px_rgba(255,185,0,0.1)]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-full border border-yellow-300/60 bg-yellow-300/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-yellow-200">
              Fortune
            </div>
            <div className="rounded-full bg-black/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-pink-200">
              Rabbit
            </div>
          </div>

          <div className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-200">
            <span className="inline-flex items-center gap-1">
              <Coins className="h-3 w-3 text-yellow-300" />
              0,07
            </span>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 rounded-full border border-yellow-400/40 bg-[#1f1a2f] px-3 py-2 text-[11px] font-bold text-yellow-200 shadow-inner shadow-yellow-500/10">
            <span className="opacity-80">JACKPOT</span>
            <div className="mt-0.5 text-lg font-black tracking-tight text-yellow-300">GRAND 13.523.038,67</div>
          </div>
          <button className="rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 px-3 py-2 text-xs font-black uppercase text-slate-950 shadow-lg shadow-emerald-900/30">
            Depósito
          </button>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-xs font-black">
          {[
            { label: 'MAJOR', value: '975.030,79' },
            { label: 'MINOR', value: '2,00' },
            { label: 'MINI', value: '1,00' },
          ].map(item => (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 px-2 py-2 text-center">
              <div className="text-[10px] uppercase tracking-[0.16em] text-yellow-200/90">{item.label}</div>
              <div className="mt-1 text-sm font-black text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {categoryList.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-2 text-[11px] font-black transition ${
              selectedCategory === category.id
                ? 'bg-yellow-300 text-slate-900 shadow-lg shadow-yellow-500/20'
                : 'bg-[#2a2a31] text-slate-300'
            }`}
          >
            {category.icon}
            {category.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={searchQuery}
          onChange={event => setSearchQuery(event.target.value)}
          placeholder="Buscar jogo"
          className="w-full rounded-2xl border border-white/10 bg-[#23232b] py-3 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-yellow-300"
        />
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
        {filteredGames.map(game => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game)}
            className="group overflow-hidden rounded-[1.4rem] bg-[#1E1E25] p-0 text-left shadow-[0_10px_30px_rgba(0,0,0,0.35)] transition duration-200 hover:-translate-y-0.5 hover:ring-2 hover:ring-yellow-300/60"
            aria-label={`Abrir ${game.name}`}
          >
            <GamePoster game={game} />
            <div className="flex items-center justify-between gap-2 px-2 py-2 text-[10px] text-slate-300">
              <span>Min. R$ {game.minBet.toFixed(2)}</span>
              <span className="inline-flex items-center gap-1 font-black text-emerald-300">
                <Sparkles className="h-3 w-3" />
                Jogar
              </span>
            </div>
          </button>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="rounded-[1.25rem] border border-dashed border-white/10 py-12 text-center text-sm text-slate-400">
          Nenhum jogo encontrado.
        </div>
      )}

      <div className="flex items-center justify-center gap-2 border-t border-white/10 pt-3 text-[10px] text-slate-400">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
        Jogos demonstrativos FortuneGo · game design mobile premium
      </div>

      <div className="grid grid-cols-5 gap-2 rounded-[1.3rem] bg-[#1d1d23] px-2 py-2 text-[10px] font-bold text-slate-300">
        {[
          { label: 'Começar', icon: '⌂' },
          { label: 'Ofertas', icon: '★' },
          { label: 'Depósito', icon: '◫' },
          { label: 'Suporte', icon: '☎' },
          { label: 'Perfil', icon: '◉' },
        ].map(item => (
          <button key={item.label} className="flex flex-col items-center gap-1 rounded-xl py-2 hover:bg-white/5">
            <span className="text-base text-white">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 rounded-[1.3rem] bg-[#1d1d23] p-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-emerald-500/20 p-2 text-emerald-300">
            <Wallet className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">Saldo</div>
            <div className="font-black text-white">R$ 0,08</div>
          </div>
        </div>

        <button className="rounded-full bg-gradient-to-r from-pink-500 to-violet-500 px-3 py-2 text-xs font-black uppercase text-white shadow-lg shadow-pink-500/25">
          Mais
        </button>
      </div>
    </section>
  );
};
