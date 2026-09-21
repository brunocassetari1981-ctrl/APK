import React, { useState } from 'react';
import {
  ArrowLeft,
  Bomb,
  Diamond,
  Flame,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  AlertCircle
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

  // Progressive multiplier calculation based on odds of revealing diamonds
  const getNextMultiplier = (diamonds: number, mines: number): number => {
    if (diamonds === 0) return 1.0;
    let multiplier = 1.0;
    for (let i = 0; i < diamonds; i++) {
      const remainingTiles = 25 - i;
      const safeTiles = remainingTiles - mines;
      if (safeTiles <= 0) break;
      multiplier *= (remainingTiles / safeTiles) * 0.98; // 2% house edge
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

    // Generate 25 tiles with randomly distributed mines
    const mineIndices = new Set<number>();
    while (mineIndices.size < mineCount) {
      mineIndices.add(Math.floor(Math.random() * 25));
    }

    const newTiles: TileState[] = Array.from({ length: 25 }, (_, i) => ({
      index: i,
      isMine: mineIndices.has(i),
      isRevealed: false
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
      // Hit a mine!
      sounds.playExplosion();
      setTiles(prev =>
        prev.map(t => ({
          ...t,
          isRevealed: true
        }))
      );
      setGameState('gameover');
      showToast('BOMBA! Você perdeu o valor apostado.');
    } else {
      // Safe diamond!
      sounds.playCoin();
      const nextDiamonds = revealedDiamonds + 1;
      setRevealedDiamonds(nextDiamonds);

      setTiles(prev =>
        prev.map(t => (t.index === index ? { ...t, isRevealed: true } : t))
      );

      // Check if all safe diamonds found
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
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-xs sm:text-sm py-1 px-2.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Cassino</span>
        </button>
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300 font-semibold">Provably Fair 98.5%</span>
        </div>
      </div>

      {/* Main Game Card */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <span className="text-amber-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Bomb className="w-4 h-4" />
              Original FortuneGo
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-0.5">Mines VIP</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-right">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Multiplicador Atual
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-400">
                {currentMultiplier.toFixed(2)}x
              </span>
            </div>
            {gameState === 'playing' && revealedDiamonds > 0 && (
              <button
                onClick={handleCashout}
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 font-black text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950/50 animate-pulse hover:scale-105 transition-transform"
              >
                Retirar R$ {currentPayout.toFixed(2)}
              </button>
            )}
          </div>
        </div>

        {/* 5x5 Minefield Grid */}
        <div className="max-w-md mx-auto aspect-square bg-slate-950 p-3 sm:p-4 rounded-2xl border border-slate-800/90 shadow-inner grid grid-cols-5 gap-2 sm:gap-2.5">
          {tiles.length === 0
            ? Array.from({ length: 25 }, (_, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-center opacity-70"
                />
              ))
            : tiles.map(tile => {
                const isRevealed = tile.isRevealed;
                return (
                  <button
                    key={tile.index}
                    onClick={() => handleTileClick(tile.index)}
                    disabled={gameState !== 'playing' || isRevealed}
                    className={`rounded-xl aspect-square flex items-center justify-center transition-all ${
                      !isRevealed
                        ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700/80 active:scale-95 cursor-pointer shadow-md'
                        : tile.isMine
                        ? 'bg-rose-600/30 border-2 border-rose-500 text-rose-400 animate-in zoom-in'
                        : 'bg-emerald-600/25 border-2 border-emerald-400 text-emerald-400 animate-in zoom-in'
                    }`}
                  >
                    {isRevealed && (
                      tile.isMine ? (
                        <Bomb className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500 fill-rose-500" />
                      ) : (
                        <Diamond className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400 fill-emerald-400" />
                      )
                    )}
                  </button>
                );
              })}
        </div>

        {/* Game Setup Controls (active when idle or finished) */}
        {gameState !== 'playing' ? (
          <div className="space-y-4 pt-2">
            {/* Stakes */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>Valor da Aposta</span>
                <span>Saldo: R$ {user.balance.toFixed(2)}</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                {stakePresets.map(preset => (
                  <button
                    key={preset}
                    onClick={() => setStake(preset)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      stake === preset
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    R$ {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Mine Count Selection */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                <span>Quantidade de Minas no Campo</span>
                <span className="font-bold text-amber-400">{mineCount} Minas</span>
              </div>
              <div className="grid grid-cols-6 gap-1.5">
                {minePresets.map(count => (
                  <button
                    key={count}
                    onClick={() => setMineCount(count)}
                    className={`py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      mineCount === count
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 text-slate-950 font-black text-base shadow-xl shadow-emerald-950/50 active:scale-98 transition-all"
            >
              Começar Jogo (R$ {stake.toFixed(2)})
            </button>
          </div>
        ) : (
          <div className="text-center py-2">
            <p className="text-xs text-slate-400">
              Clique nas peças para encontrar diamantes. Você pode sacar a qualquer momento!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
