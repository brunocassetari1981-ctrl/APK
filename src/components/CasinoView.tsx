import React, { useState } from 'react';
import {
  Sparkles,
  Flame,
  Search,
  Zap,
  Bomb,
  Plane,
  CircleDot,
  Trophy,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { CASINO_GAMES } from '../data/casinoGames';
import { CasinoGame, CasinoCategory } from '../types';
import { SlotGameModal } from './SlotGameModal';
import { MinesGameModal } from './MinesGameModal';
import { CrashGameModal } from './CrashGameModal';
import { RouletteGameModal } from './RouletteGameModal';

export const CasinoView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<CasinoCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGame, setActiveGame] = useState<CasinoGame | null>(null);

  // If a game is active, render that game's engine
  if (activeGame) {
    if (activeGame.category === 'mines') {
      return <MinesGameModal game={activeGame} onBack={() => setActiveGame(null)} />;
    }
    if (activeGame.category === 'crash') {
      return <CrashGameModal game={activeGame} onBack={() => setActiveGame(null)} />;
    }
    if (activeGame.category === 'roulette') {
      return <RouletteGameModal game={activeGame} onBack={() => setActiveGame(null)} />;
    }
    return <SlotGameModal game={activeGame} onBack={() => setActiveGame(null)} />;
  }

  const filteredGames = CASINO_GAMES.filter(game => {
    const matchesCategory =
      selectedCategory === 'all' || game.category === selectedCategory;
    const matchesSearch = game.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (cat: CasinoCategory) => {
    switch (cat) {
      case 'slots':
        return <Zap className="w-4 h-4" />;
      case 'crash':
        return <Plane className="w-4 h-4" />;
      case 'mines':
        return <Bomb className="w-4 h-4" />;
      case 'roulette':
        return <CircleDot className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Casino Header Banner */}
      <div className="rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 p-5 sm:p-7 overflow-hidden relative shadow-2xl">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-black tracking-widest uppercase mb-2">
            <Flame className="w-4 h-4" />
            <span>FORTUNEGO CASINO VIP</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Slots e Grandes Prêmios
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-lg leading-relaxed">
            Jogue Fortune Tiger, Fortune Rabbit, Mines VIP, Aviator Crash e Roleta. Giros instantâneos com gráficos de alta definição.
          </p>

          <div className="flex items-center gap-3 mt-4 text-xs text-slate-400 font-medium">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              RTP Verificado até 98.5%
            </span>
            <span>•</span>
            <span>{CASINO_GAMES.length} Jogos Prontos</span>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-10 -bottom-20 w-64 h-64 rounded-full border-[36px] border-emerald-500/10 pointer-events-none" />
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'slots', label: 'Slots PG/WG' },
            { id: 'mines', label: 'Mines VIP' },
            { id: 'crash', label: 'Crash / Aviator' },
            { id: 'roulette', label: 'Roleta' }
          ].map(cat => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as CasinoCategory)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                }`}
              >
                {getCategoryIcon(cat.id as CasinoCategory)}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative sm:w-64 shrink-0">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar jogo (Tiger, Mines...)"
            className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Games Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {filteredGames.map(game => (
          <div
            key={game.id}
            onClick={() => setActiveGame(game)}
            className="group relative cursor-pointer rounded-2xl overflow-hidden border border-slate-800 hover:border-slate-700 bg-slate-900 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 flex flex-col"
          >
            {/* Visual Header / Gradient Box */}
            <div
              className={`aspect-[4/3] bg-gradient-to-br ${game.gradient} p-3.5 sm:p-4 flex flex-col justify-between relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/5 transition-colors" />

              <div className="relative z-10 flex items-center justify-between">
                <span className="text-[10px] font-black tracking-wider uppercase px-2 py-0.5 rounded bg-black/40 text-white border border-white/10 backdrop-blur-sm">
                  {game.studio}
                </span>
                {game.isHot && (
                  <span className="flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white shadow-md animate-pulse">
                    <Flame className="w-3 h-3 fill-white" />
                    HOT
                  </span>
                )}
              </div>

              <div className="relative z-10">
                <h3 className="font-black text-white text-base sm:text-lg drop-shadow group-hover:scale-105 transition-transform origin-left">
                  {game.name}
                </h3>
                <p className="text-white/80 text-[11px] mt-0.5 font-medium">RTP {game.rtp}</p>
              </div>
            </div>

            {/* Card Footer Info */}
            <div className="p-3 bg-slate-950 flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                Min: R$ {game.minBet.toFixed(2)}
              </span>
              <button className="text-emerald-400 font-bold flex items-center gap-1 text-[11px] group-hover:translate-x-0.5 transition-transform">
                <span>Jogar</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
