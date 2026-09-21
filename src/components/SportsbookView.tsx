import React from 'react';
import {
  Flame,
  Radio,
  Trophy,
  Target,
  Activity,
  Gamepad2,
  Zap,
  Clock,
  Sparkles,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { INITIAL_SPORTS } from '../data/sportsData';
import { SportEvent, SelectionType } from '../types';

export const SportsbookView: React.FC = () => {
  const {
    events,
    selectedSport,
    setSelectedSport,
    toggleSelection,
    isSelectionInSlip,
    setActiveTab,
    oddsSource,
    isLiveSyncing,
    syncRealLiveGames
  } = useApp();

  const filteredEvents =
    selectedSport === 'all'
      ? events
      : events.filter(e => e.sport_id === selectedSport);

  const liveEvents = filteredEvents.filter(e => e.status === 'live');
  const upcomingEvents = filteredEvents.filter(e => e.status === 'upcoming');

  const getSportIcon = (icon: string) => {
    switch (icon) {
      case 'Trophy':
        return <Trophy className="w-4 h-4" />;
      case 'Target':
        return <Target className="w-4 h-4" />;
      case 'Activity':
        return <Activity className="w-4 h-4" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-4 h-4" />;
      default:
        return <Flame className="w-4 h-4" />;
    }
  };

  const renderOddsButton = (
    event: SportEvent,
    selection: SelectionType,
    label: string,
    odds: number | undefined
  ) => {
    if (!odds) return null;
    const isSelected = isSelectionInSlip(event.id, selection);

    return (
      <button
        key={`${event.id}-${selection}`}
        onClick={() => toggleSelection(event, selection)}
        className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all border ${
          isSelected
            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-md shadow-emerald-950/50 scale-[1.02]'
            : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-slate-800/80 hover:border-slate-700'
        }`}
      >
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider ${
            isSelected ? 'text-slate-950/80' : 'text-slate-400'
          }`}
        >
          {label}
        </span>
        <span
          className={`text-sm font-black mt-0.5 ${
            isSelected ? 'text-slate-950' : 'text-amber-400'
          }`}
        >
          {odds.toFixed(2)}
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/20 p-5 sm:p-7">
        <div className="relative z-10 max-w-xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-black tracking-wider uppercase mb-2">
            <Sparkles className="w-4 h-4" />
            <span>Bem-vindo à FortuneGo Apostas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            As melhores odds do mundo esportivo.
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-lg leading-relaxed">
            Aposte ao vivo e nos principais campeonatos: Brasileirão Série A, Champions League, Premier League, NBA e E-Sports.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-4">
            <button
              onClick={() => setActiveTab('live')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Ver Jogos Ao Vivo ({liveEvents.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('casino')}
              className="px-4 py-2 bg-slate-800/90 hover:bg-slate-700/90 text-white font-bold text-xs sm:text-sm rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Fortune Tiger & Slots</span>
            </button>
          </div>
        </div>

        {/* Ambient decorative glowing circle */}
        <div className="absolute -right-12 -bottom-20 w-72 h-72 rounded-full border-[40px] border-emerald-500/10 pointer-events-none" />
      </div>

      {/* Sports Categories Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {INITIAL_SPORTS.map(sport => {
          const isActive = selectedSport === sport.id;
          return (
            <button
              key={sport.id}
              onClick={() => setSelectedSport(sport.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-950/40'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {getSportIcon(sport.icon)}
              <span>{sport.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
                  isActive ? 'bg-slate-950/20 text-slate-950' : 'bg-slate-800 text-slate-500'
                }`}
              >
                {sport.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section: Jogos Ao Vivo (Live Now) */}
      {liveEvents.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h2 className="text-base sm:text-lg font-black text-white">Ao Vivo Agora</h2>
              <span className="text-xs px-2 py-0.5 bg-rose-500/15 border border-rose-500/30 text-rose-400 font-bold rounded-md">
                {liveEvents.length} partidas
              </span>
            </div>
            <button
              onClick={() => setActiveTab('live')}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
            >
              <span>Ver painel ao vivo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {liveEvents.map(event => (
              <div
                key={event.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 hover:border-slate-700/80 p-4 transition-all space-y-3.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {event.league}
                  </span>
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-500/15 text-rose-400 font-bold rounded-md">
                    <Clock className="w-3 h-3" />
                    {event.minute ? `${event.minute}'` : 'AO VIVO'}
                  </span>
                </div>

                {/* Teams & Scores */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm sm:text-base">
                      {event.home_team}
                    </span>
                    <span className="font-black text-base text-amber-400">
                      {event.home_score ?? 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm sm:text-base">
                      {event.away_team}
                    </span>
                    <span className="font-black text-base text-amber-400">
                      {event.away_score ?? 0}
                    </span>
                  </div>
                </div>

                {/* Primary 1 X 2 Markets */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80">
                  {renderOddsButton(event, 'home', '1 (Mandante)', event.odds_home)}
                  {renderOddsButton(event, 'draw', 'X (Empate)', event.odds_draw)}
                  {renderOddsButton(event, 'away', '2 (Visitante)', event.odds_away)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section: Próximos Jogos & Campeonatos */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-black text-white">Próximos Destaques</h2>
            <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{oddsSource || 'The Odds API Oficial'}</span>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-medium">Cotações oficiais Pinnacle / Bet365 / 1xBet</span>
        </div>

        <div className="space-y-3">
          {upcomingEvents.map(event => {
            const isFromOddsApi = event.id.startsWith('oddsapi-');
            return (
              <div
                key={event.id}
                className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 transition-all hover:border-slate-700/80 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold">
                      {event.league}
                    </span>
                    <span className="text-slate-400">{event.country}</span>
                    {isFromOddsApi && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold text-[10px]">
                        Odd Real (API)
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-500" />
                    {event.start_time}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-white text-base">
                      {event.home_team} <span className="text-slate-500 font-normal">vs</span>{' '}
                      {event.away_team}
                    </h3>
                    {event.odds_over_25 && (
                      <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                        Mais de 2.5 gols: @{event.odds_over_25.toFixed(2)} | Ambas Marcam: @
                        {event.odds_btts_yes?.toFixed(2)}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:w-80 shrink-0">
                    {renderOddsButton(event, 'home', '1', event.odds_home)}
                    {renderOddsButton(event, 'draw', 'X', event.odds_draw)}
                    {renderOddsButton(event, 'away', '2', event.odds_away)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
