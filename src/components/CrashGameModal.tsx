import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Plane,
  Flame,
  Sparkles,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { CasinoGame } from '../types';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';

interface CrashGameModalProps {
  game: CasinoGame;
  onBack: () => void;
}

export const CrashGameModal: React.FC<CrashGameModalProps> = ({ game, onBack }) => {
  const { user, chargeCasinoStake, payoutCasinoWin, showToast } = useApp();

  const [stake, setStake] = useState<number>(5);
  const [autoCashout, setAutoCashout] = useState<number>(2.0);
  const [history, setHistory] = useState<number[]>([1.85, 2.40, 1.25, 4.80, 1.15, 8.20, 1.95]);
  const [gameState, setGameState] = useState<'idle' | 'flying' | 'crashed' | 'cashed_out'>('idle');
  const [multiplier, setMultiplier] = useState<number>(1.0);

  const stakePresets = [1, 2, 5, 10, 20, 50, 100];
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const crashPointRef = useRef<number>(1.0);
  const currentStakeRef = useRef<number>(stake);

  const startFlight = () => {
    if (stake <= 0 || stake > user.balance) {
      showToast('Saldo insuficiente para decolar.');
      return;
    }

    const charged = chargeCasinoStake(stake, 'Aviator Crash');
    if (!charged) return;

    currentStakeRef.current = stake;
    setGameState('flying');
    setMultiplier(1.0);
    sounds.playCoin();

    // Determine crash point using fair exponential curve
    // ~10% instant crash (1.00x - 1.20x), median around 2.0x, can reach 15x+
    const rand = Math.random();
    let crashPoint = 1.01;
    if (rand < 0.12) {
      crashPoint = Number((1.0 + Math.random() * 0.25).toFixed(2));
    } else if (rand < 0.70) {
      crashPoint = Number((1.25 + Math.random() * 2.8).toFixed(2));
    } else if (rand < 0.92) {
      crashPoint = Number((4.0 + Math.random() * 6.0).toFixed(2));
    } else {
      crashPoint = Number((10.0 + Math.random() * 20.0).toFixed(2));
    }

    crashPointRef.current = crashPoint;
    startTimeRef.current = performance.now();

    const loop = (now: number) => {
      const elapsed = (now - startTimeRef.current) / 1000;
      // Exponential rise: multiplier = e^(elapsed * 0.25)
      const current = Number(Math.exp(elapsed * 0.35).toFixed(2));

      if (current >= crashPointRef.current) {
        // Crashed!
        sounds.playExplosion();
        setMultiplier(crashPointRef.current);
        setGameState('crashed');
        setHistory(prev => [crashPointRef.current, ...prev.slice(0, 8)]);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        return;
      }

      setMultiplier(current);

      // Check auto cashout
      if (autoCashout && current >= autoCashout && gameState === 'flying') {
        handleCashout(current);
        return;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
  };

  const handleCashout = (manualMult?: number) => {
    const finalMult = manualMult ?? multiplier;
    if (gameState !== 'flying') return;

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setGameState('cashed_out');
    const payout = Number((currentStakeRef.current * finalMult).toFixed(2));
    payoutCasinoWin(payout, 'Aviator Crash');
    setHistory(prev => [crashPointRef.current, ...prev.slice(0, 8)]);
  };

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  const progressPercent = Math.min(100, ((multiplier - 1) / 10) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-xs sm:text-sm py-1 px-2.5 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Cassino</span>
        </button>
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[280px] sm:max-w-md py-1">
          {history.map((h, i) => (
            <span
              key={i}
              className={`text-[11px] font-black px-2 py-0.5 rounded-md whitespace-nowrap ${
                h >= 3.0
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : h >= 2.0
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {h.toFixed(2)}x
            </span>
          ))}
        </div>
      </div>

      {/* Flight Canvas & Multiplier Screen */}
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-5 sm:p-7 shadow-2xl space-y-5">
        <div className="relative h-64 sm:h-72 w-full bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden flex flex-col items-center justify-center p-6 shadow-inner">
          {/* Background grid lines */}
          <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:2rem_2rem]" />

          {/* Animated Flight Path */}
          {gameState === 'flying' && (
            <div
              className="absolute transition-all duration-75 flex items-center gap-1.5"
              style={{
                left: `${Math.min(80, 10 + progressPercent * 0.7)}%`,
                bottom: `${Math.min(75, 15 + progressPercent * 0.6)}%`
              }}
            >
              <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400 animate-bounce">
                <Plane className="w-6 h-6 transform -rotate-45" />
              </div>
            </div>
          )}

          {/* Multiplier Central Display */}
          <div className="relative z-10 text-center">
            {gameState === 'crashed' ? (
              <div className="space-y-1 animate-in zoom-in">
                <p className="text-sm font-black text-rose-500 tracking-widest uppercase">
                  VOOU PARA LONGE!
                </p>
                <p className="text-5xl sm:text-6xl font-black text-rose-500">
                  {multiplier.toFixed(2)}x
                </p>
              </div>
            ) : gameState === 'cashed_out' ? (
              <div className="space-y-1 animate-in zoom-in">
                <p className="text-xs font-black text-emerald-400 tracking-widest uppercase">
                  VOCÊ SACOU COM SUCESSO!
                </p>
                <p className="text-5xl sm:text-6xl font-black text-emerald-400">
                  {multiplier.toFixed(2)}x
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-5xl sm:text-6xl font-black text-white tracking-tight">
                  {multiplier.toFixed(2)}x
                </p>
                {gameState === 'flying' && (
                  <p className="text-xs text-amber-400 font-bold animate-pulse">
                    SUBINDO... SACAR AGORA!
                  </p>
                )}
                {gameState === 'idle' && (
                  <p className="text-xs text-slate-400 font-medium">
                    Faça sua aposta para decolar
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-4">
          {gameState === 'flying' ? (
            <button
              onClick={() => handleCashout()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 hover:from-emerald-400 text-slate-950 font-black text-xl shadow-2xl shadow-emerald-950/60 transition-transform active:scale-98 animate-pulse"
            >
              SACAR R$ {(stake * multiplier).toFixed(2)} ({multiplier.toFixed(2)}x)
            </button>
          ) : (
            <>
              {/* Stakes buttons */}
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
                      className={`py-2 rounded-xl text-xs font-bold transition-colors ${
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

              {/* Start Flight button */}
              <button
                onClick={startFlight}
                disabled={user.balance < stake}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 hover:opacity-95 text-slate-950 font-black text-base shadow-xl shadow-rose-950/50 transition-transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Plane className="w-5 h-5 fill-slate-950" />
                <span>DECOLAR (R$ {stake.toFixed(2)})</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
