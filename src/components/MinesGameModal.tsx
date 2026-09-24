import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Bomb,
  Diamond,
  Flame,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { CasinoGame } from '../types';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';

interface MinesGameModalProps {
  game: CasinoGame;
  onBack: () => void;
}

interface TileState {
  index: number;
  isMine: boolean;
  isRevealed: boolean;
}

export const MinesGameModal: React.FC<MinesGameModalProps> = ({ game, onBack }) => {
  const { user, chargeCasinoStake, payoutCasinoWin, showToast } = useApp();

  const [stake, setStake] = useState<number>(5);
  const [mineCount, setMineCount] = useState<number>(3);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover' | 'cashed_out'>('idle');
  const [tiles, setTiles] = useState<TileState[]>([]);
  const [revealedDiamonds, setRevealedDiamonds] = useState<number>(0);

  const stakePresets = [1, 2, 5, 10, 20, 50, 100];
  const minePresets = [2, 3, 5, 10, 15, 20];

  const getNextMultiplier = (diamonds: number, mines: number): number => {
    if (diamonds === 0) return 1.0;
    let multiplier = 1.0;
    for (let i = 0; i < diamonds; i++) {
      const remainingTiles = 25 - i;
      const safeTiles = remainingTiles - mines;
      if (safeTiles <= 0) break;
      multiplier *= (remainingTiles / safeTiles) * 0.98;
    }
    return Number(multiplier.toFixed(2));
  };

  const currentMultiplier = getNextMultiplier(revealedDiamonds, mineCount);
  const currentPayout = Number((stake * currentMultiplier).toFixed(2));

  const startGame = () => {
    if (stake <= 0 || stake > user.balance) {
      showToast('Saldo insuficiente para iniciar o jogo.');
      return;
    }

    const charged = chargeCasinoStake(stake, 'Mines VIP');
    if (!charged) return;

    const mineIndices = new Set<number>();
    while (mineIndices.size < mineCount) {
      mineIndices.add(Math.floor(Math.random() * 25));
    }

    const newTiles: TileState[] = Array.from({ length: 25 }, (_, i) => ({
      index: i,
      isMine: mineIndices.has(i),
      isRevealed: false,
    }));

    setTiles(newTiles);
    setRevealedDiamonds(0);
    setGameState('playing');
    sounds.playCoin();
  };

  const handleTileClick = (index: number) => {
    if (gameState !== 'playing') return;
    const tile = tiles[index];
    if (tile.isRevealed) return;

    if (tile.isMine) {
      sounds.playExplosion();
      setTiles(prev => prev.map(t => ({ ...t, isRevealed: true })));
      setGameState('gameover');
      showToast('BOMBA! Você perdeu o valor apostado.');
    } else {
      sounds.playCoin();
      const nextDiamonds = revealedDiamonds + 1;
      setRevealedDiamonds(nextDiamonds);

      setTiles(prev => prev.map(t => (t.index === index ? { ...t, isRevealed: true } : t)));

      if (nextDiamonds === 25 - mineCount) {
        handleCashout();
      }
    }
  };

  const handleCashout = () => {
    if (gameState !== 'playing' || revealedDiamonds === 0) return;

    setTiles(prev => prev.map(t => ({ ...t, isRevealed: true })));
    setGameState('cashed_out');
    payoutCasinoWin(currentPayout, 'Mines VIP');
  };

  return (
    <div className="mx-auto max-w-[30rem] space-y-4 rounded-[2rem] bg-[#070d1c] p-3 text-white shadow-[0_30px_90px_rgba(0,0,0,.55)]">
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#111827] px-3 py-2">
        <button onClick={onBack} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-slate-300 hover:bg-white/10">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <div className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-1.5 text-[10px] uppercase tracking-[.16em] text-emerald-200">
          <ShieldCheck className="h-4 w-4" />
          Provably Fair
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.8rem] border border-yellow-300/30 bg-gradient-to-b from-[#19162d] via-[#121827] to-[#0d1321] p-4 shadow-[0_0_28px_rgba(250,204,21,.12)]">
        <div className="mb-3 flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-amber-300">
              <Bomb className="h-4 w-4" />
              Original FortuneGo
            </div>
            <h1 className="mt-1 text-2xl font-black text-white">Mines VIP</h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-right">
              <div className="text-[9px] uppercase tracking-[.14em] text-emerald-200">Multiplicador</div>
              <div className="text-lg font-black text-emerald-400">{currentMultiplier.toFixed(2)}x</div>
            </div>
            {gameState === 'playing' && revealedDiamonds > 0 && (
              <button
                onClick={handleCashout}
                className="rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-2 text-sm font-black text-slate-950 shadow-[0_12px_28px_rgba(16,185,129,.25)]"
              >
                Retirar R$ {currentPayout.toFixed(2)}
              </button>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-md rounded-[1.5rem] border border-white/10 bg-[#070d19] p-3 shadow-inner sm:p-4">
          <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
            {tiles.length === 0
              ? Array.from({ length: 25 }, (_, i) => (
                  <div key={i} className="flex aspect-square items-center justify-center rounded-xl border border-slate-800 bg-slate-900/80 opacity-80" />
                ))
              : tiles.map(tile => {
                  const isRevealed = tile.isRevealed;
                  return (
                    <button
                      key={tile.index}
                      onClick={() => handleTileClick(tile.index)}
                      disabled={gameState !== 'playing' || isRevealed}
                      className={`aspect-square rounded-xl transition-all ${
                        !isRevealed
                          ? 'cursor-pointer border border-slate-700 bg-slate-800 hover:bg-slate-700 active:scale-95 shadow-md'
                          : tile.isMine
                            ? 'border-2 border-rose-500 bg-rose-600/25 text-rose-400 animate-in zoom-in'
                            : 'border-2 border-emerald-400 bg-emerald-600/20 text-emerald-400 animate-in zoom-in'
                      }`}
                    >
                      {isRevealed && (
                        tile.isMine ? <Bomb className="h-6 w-6 sm:h-8 sm:w-8" /> : <Diamond className="h-6 w-6 sm:h-8 sm:w-8 fill-current" />
                      )}
                    </button>
                  );
                })}
          </div>
        </div>

        {gameState !== 'playing' ? (
          <div className="mt-4 space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-[.18em] text-slate-400">
                <span>Valor da Aposta</span>
                <span>Saldo: R$ {user.balance.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
                {stakePresets.map(preset => (
                  <button
                    key={preset}
                    onClick={() => setStake(preset)}
                    className={`rounded-xl py-2 text-xs font-black transition ${
                      stake === preset ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    R$ {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-[.18em] text-slate-400">
                <span>Quantidade de Minas</span>
                <span className="text-amber-300">{mineCount} minas</span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {minePresets.map(count => (
                  <button
                    key={count}
                    onClick={() => setMineCount(count)}
                    className={`rounded-xl py-2 text-xs font-black transition ${
                      mineCount === count ? 'bg-amber-500 text-slate-950' : 'border border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-4 py-3 text-base font-black text-slate-950 shadow-[0_16px_32px_rgba(16,185,129,.25)]"
            >
              Começar Jogo (R$ {stake.toFixed(2)})
            </button>
          </div>
        ) : (
          <div className="mt-4 text-center text-xs uppercase tracking-[.14em] text-slate-400">
            Clique nas peças para encontrar diamantes. Você pode sacar a qualquer momento.
          </div>
        )}
      </div>
    </div>
  );
};
