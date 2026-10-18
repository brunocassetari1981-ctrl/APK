import React, { useState } from 'react';
import {
  History,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BetHistoryView: React.FC = () => {
  const { placedBets, cashoutBet, setActiveTab } = useApp();
  const [filter, setFilter] = useState<'all' | 'pending' | 'settled'>('all');

  const filteredBets = placedBets.filter(b => {
    if (filter === 'pending') return b.status === 'pending';
    if (filter === 'settled') return b.status !== 'pending';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'won':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            Ganha
          </span>
        );
      case 'cashed_out':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-bold text-xs flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            Cashout Realizado
          </span>
        );
      case 'lost':
        return (
          <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 font-bold text-xs flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            Perdida
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center gap-1 animate-pulse">
            <Clock className="w-3.5 h-3.5" />
            Em Andamento
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-sky-400 text-xs font-bold uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Registro de Apostas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Minhas Apostas</h1>
          <p className="text-xs text-slate-400 mt-1">
            Acompanhe suas apostas esportivas simples e combinadas em tempo real.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'pending', label: 'Em Aberto' },
            { id: 'settled', label: 'Finalizadas' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === f.id
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bets List */}
      <div className="space-y-3.5">
        {filteredBets.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-3">
            <History className="w-12 h-12 text-slate-600 mx-auto" />
            <p className="text-slate-300 font-bold">Nenhuma aposta encontrada nesta categoria</p>
            <button
              onClick={() => setActiveTab('home')}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md inline-flex items-center gap-1.5"
            >
              <span>Explorar Jogos e Apostar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          filteredBets.map(bet => (
            <div
              key={bet.id}
              className="bg-slate-900 rounded-2xl border border-slate-800 p-4 sm:p-5 space-y-3.5 shadow-lg"
            >
              {/* Top metadata */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="text-xs text-slate-400">
                  <span className="font-semibold text-slate-200">Bilhete #{bet.id.slice(-6)}</span>
                  <span className="mx-2">•</span>
                  <span>
                    {new Date(bet.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div>{getStatusBadge(bet.status)}</div>
              </div>

              {/* Items in bet */}
              <div className="space-y-2">
                {bet.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                        {item.event.league}
                      </span>
                      <p className="font-bold text-white mt-0.5">
                        {item.event.home_team} vs {item.event.away_team}
                      </p>
                      <p className="text-slate-400 mt-0.5 font-medium">{item.label}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-semibold uppercase block">
                        Cotação
                      </span>
                      <span className="font-black text-amber-400 text-sm">
                        {item.odds.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Financial summary & Cashout action */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                      Valor Apostado
                    </span>
                    <span className="font-bold text-white text-sm">
                      R$ {bet.stake.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                      Odd Total
                    </span>
                    <span className="font-extrabold text-amber-400 text-sm">
                      {bet.total_odds.toFixed(2)}x
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase font-semibold">
                      Retorno Potencial
                    </span>
                    <span className="font-black text-emerald-400 text-sm">
                      R$ {bet.potential_payout.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Cashout button if active */}
                {bet.status === 'pending' && (
                  <button
                    onClick={() => cashoutBet(bet.id)}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95 shrink-0"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Encerrar Aposta (R$ {bet.cashout_value?.toFixed(2) ?? bet.stake})</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
