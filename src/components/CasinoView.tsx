import React, { useMemo, useState } from 'react';
import {
  Bomb,
  CircleDot,
  Flame,
  Heart,
  Plane,
  Search,
  Sparkles,
  Star,
  Trophy,
  Wallet,
  Zap
} from 'lucide-react';
import { CASINO_GAMES } from '../data/casinoGames';
import { CasinoCategory, CasinoGame } from '../types';
import { SlotGameModal } from './SlotGameModal';
import { MinesGameModal } from './MinesGameModal';
import { CrashGameModal } from './CrashGameModal';
import { RouletteGameModal } from './RouletteGameModal';

const categories: { id: CasinoCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'Popular', icon: <Trophy className="h-4 w-4" /> },
  { id: 'slots', label: 'Slots', icon: <Zap className="h-4 w-4" /> },
  { id: 'crash', label: 'Crash', icon: <Plane className="h-4 w-4" /> },
  { id: 'mines', label: 'Mines', icon: <Bomb className="h-4 w-4" /> },
  { id: 'roulette', label: 'Roleta', icon: <CircleDot className="h-4 w-4" /> }
];

const visualByGame: Record<string, { emoji: string; className: string }> = {
  fortune_rabbit: { emoji: '🐰', className: 'from-fuchsia-500 via-pink-500 to-orange-500' },
  fortune_dragon: { emoji: '🐲', className: 'from-cyan-300 via-sky-500 to-violet-500' },
  fortune_tiger: { emoji: '🐯', className: 'from-orange-500 via-red-500 to-yellow-500' },
  fortune_rabbit_2: { emoji: '🐰', className: 'from-violet-500 via-fuchsia-500 to-pink-500' },
  fortune_ox: { emoji: '🐂', className: 'from-red-500 via-orange-500 to-amber-400' },
  pinata_wins: { emoji: '🪅', className: 'from-cyan-400 via-blue-500 to-orange-400' },
  fortune_snake: { emoji: '🐍', className: 'from-orange-500 via-red-500 to-fuchsia-600' },
  mr_treasures_fortune: { emoji: '👑', className: 'from-indigo-500 via-purple-600 to-slate-700' },
  treasure_bowl: { emoji: '🐂', className: 'from-emerald-500 via-yellow-500 to-orange-500' },
  lucky_cat: { emoji: '🐱', className: 'from-pink-500 via-purple-500 to-indigo-500' },
  mines: { emoji: '💣', className: 'from-amber-500 via-yellow-500 to-emerald-500' },
  crash: { emoji: '🚀', className: 'from-red-500 via-orange-500 to-rose-600' },
  roulette: { emoji: '🎯', className: 'from-emerald-500 via-green-600 to-yellow-500' }
};

function GamePoster({ game }: { game: CasinoGame }) {
  const visual = visualByGame[game.id] ?? { emoji: '✨', className: game.gradient };

  return (
    <div className={`relative aspect-[3/4] overflow-hidden bg-gradient-to-br ${visual.className}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.42),transparent_25%),linear-gradient(145deg,transparent_30%,rgba(0,0,0,.55))]" />
      <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full border-[18px] border-white/20" />
      <div className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-white/10 blur-xl" />

      <div className="relative z-10 flex items-start justify-between p-2.5">
        <span className="rounded-br-xl rounded-tl-xl bg-amber-400 px-2 py-1 text-[10px] font-black text-white shadow-lg">
          {game.studio}
        </span>
        <span className="rounded-full bg-white/25 p-1.5 text-white backdrop-blur-sm">
          <Star className="h-4 w-4 fill-white" />
        </span>
      </div>

      <div className="absolute inset-x-0 top-[25%] flex items-center justify-center">
        <span className="select-none text-7xl drop-shadow-[0_8px_8px_rgba(0,0,0,.35)] sm:text-8xl" role="img" aria-label={game.name}>
          {visual.emoji}
        </span>
      </div>

      {game.isHot && (
        <span className="absolute left-2.5 top-12 z-10 rounded-full bg-amber-400 p-1.5 text-white shadow-lg">
          <Heart className="h-3.5 w-3.5 fill-white" />
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-3 pb-3 pt-10">
        <h3 className="line-clamp-2 text-center text-sm font-black leading-tight text-white drop-shadow sm:text-base">
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

  const filteredGames = useMemo(() => CASINO_GAMES.filter(game => {
    const categoryMatch = selectedCategory === 'all' || game.category === selectedCategory;
    return categoryMatch && game.name.toLowerCase().includes(searchQuery.toLowerCase());
  }), [selectedCategory, searchQuery]);

  return (
    <section className="min-h-[calc(100vh-7rem)] space-y-4 rounded-3xl bg-[#191919] p-3 text-white sm:p-5">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#242424] px-3 py-3 shadow-xl sm:px-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-amber-300">FortuneGo Casino</p>
          <h1 className="text-xl font-black sm:text-2xl">Jogos populares</h1>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-amber-400/40 bg-black/30 px-3 py-2 text-sm font-bold text-amber-300">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">Saldo disponível</span>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition ${selectedCategory === category.id ? 'bg-yellow-300 text-slate-950 shadow-lg shadow-yellow-300/20' : 'bg-[#303030] text-slate-300 hover:bg-[#3c3c3c]'}`}
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
          className="w-full rounded-xl border border-white/10 bg-[#292929] py-3 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-yellow-300"
        />
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:grid-cols-5 xl:grid-cols-6">
        {filteredGames.map(game => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game)}
            className="group overflow-hidden rounded-2xl bg-[#292929] text-left shadow-lg shadow-black/20 transition duration-200 hover:-translate-y-1 hover:ring-2 hover:ring-yellow-300/70"
            aria-label={`Abrir ${game.name}`}
          >
            <GamePoster game={game} />
            <div className="flex items-center justify-between gap-1 px-2 py-2 text-[10px] text-slate-400">
              <span>Min. R$ {game.minBet.toFixed(2)}</span>
              <span className="flex items-center gap-1 font-bold text-emerald-300"><Sparkles className="h-3 w-3" /> Jogar</span>
            </div>
          </button>
        ))}
      </div>

      {filteredGames.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center text-sm text-slate-400">
          Nenhum jogo encontrado.
        </div>
      )}

      <div className="flex items-center justify-center gap-2 border-t border-white/10 pt-4 text-[10px] text-slate-500">
        <Flame className="h-3.5 w-3.5 text-amber-400" />
        Jogos demonstrativos FortuneGo · Jogue com responsabilidade
      </div>
    </section>
  );
};
