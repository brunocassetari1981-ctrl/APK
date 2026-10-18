import React from 'react';
import { Radio, Clock, Shield, Zap, TrendingUp, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SportEvent, SelectionType } from '../types';

export const LiveMatchesView: React.FC = () => {
  const { events, toggleSelection, isSelectionInSlip, syncRealLiveGames, isLiveSyncing, lastSyncTime } = useApp();
  const liveEvents = events.filter(e => e.status === 'live');

  const renderMarketButton = (
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
            ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-extrabold shadow-md shadow-emerald-950/50'
            : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800 hover:border-slate-700'
        }`}
      >
        <span
          className={`text-[10px] font-semibold uppercase ${
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
      {/* Live Header Banner */}
      <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-slate-900 border border-rose-500/20 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-rose-400 text-xs font-black tracking-wider uppercase mb-1">
            <Radio className="w-4 h-4 animate-ping" />
            <span>Radar Ao Vivo</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Partidas em Andamento
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Cotações dinâmicas atualizadas em tempo real conforme as jogadas acontecem.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => syncRealLiveGames()}
            disabled={isLiveSyncing}
            className="px-3.5 py-2 bg-slate-950/90 hover:bg-slate-800 border border-slate-700/80 rounded-2xl flex items-center gap-2 text-slate-200 text-xs font-bold transition-all disabled:opacity-50 shadow"
            title="Sincronizar jogos reais agora"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isLiveSyncing ? 'animate-spin' : ''}`} />
            <span>{isLiveSyncing ? 'Sincronizando...' : 'Atualizar Jogos'}</span>
          </button>
          <div className="px-4 py-2 bg-slate-950/80 border border-rose-500/30 rounded-2xl flex items-center gap-2 text-rose-300 text-xs font-bold shrink-0">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>{liveEvents.length} jogos ao vivo</span>
          </div>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="space-y-4">
        {liveEvents.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/60 rounded-3xl border border-slate-800">
            <Radio className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
            <p className="text-slate-300 font-bold">Nenhuma partida ao vivo no momento</p>
            <p className="text-xs text-slate-500 mt-1">
              Confira os próximos jogos no menu Início para agendar suas apostas.
            </p>
          </div>
        ) : (
          liveEvents.map(event => (
            <div
              key={event.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-4 hover:border-slate-700 transition-all shadow-lg shadow-black/20"
            >
              {/* League & Minute */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-semibold text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>{event.league}</span>
                  <span className="text-slate-500">• {event.country}</span>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-500/20 text-rose-400 font-black rounded-lg border border-rose-500/30">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{event.minute ? `${event.minute}'` : 'AO VIVO'}</span>
                </div>
              </div>

              {/* Match Visualizer Scoreboard */}
              <div className="grid grid-cols-7 items-center bg-slate-950/80 rounded-xl p-3 border border-slate-800/80">
                <div className="col-span-3 text-right pr-3">
                  <span className="font-black text-white text-sm sm:text-base block truncate">
                    {event.home_team}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Mandante</span>
                </div>

                <div className="col-span-1 text-center bg-slate-900/90 py-1.5 rounded-lg border border-slate-800 font-black text-lg sm:text-xl text-amber-400">
                  {event.home_score ?? 0} - {event.away_score ?? 0}
                </div>

                <div className="col-span-3 text-left pl-3">
                  <span className="font-black text-white text-sm sm:text-base block truncate">
                    {event.away_team}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">Visitante</span>
                </div>
              </div>

              {/* Market Odds Selection */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Resultado Final (1X2)
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {renderMarketButton(event, 'home', `1 (${event.home_team})`, event.odds_home)}
                  {renderMarketButton(event, 'draw', 'X (Empate)', event.odds_draw)}
                  {renderMarketButton(event, 'away', `2 (${event.away_team})`, event.odds_away)}
                </div>
              </div>

              {/* Extra Live Markets */}
              {event.odds_over_25 && (
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Gols & Ambas Marcam</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {renderMarketButton(event, 'over', '+2.5 Gols', event.odds_over_25)}
                    {renderMarketButton(event, 'under', '-2.5 Gols', event.odds_under_25)}
                    {renderMarketButton(event, 'btts_yes', 'Ambas Sim', event.odds_btts_yes)}
                    {renderMarketButton(event, 'btts_no', 'Ambas Não', event.odds_btts_no)}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
