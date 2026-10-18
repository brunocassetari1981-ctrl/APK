import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Flame,
  Plane,
  RotateCcw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
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
      const current = Number(Math.exp(elapsed * 0.35).toFixed(2));

      if (current >= crashPointRef.current) {
        sounds.playExplosion();
        setMultiplier(crashPointRef.current);
        setGameState('crashed');
        setHistory(prev => [crashPointRef.current, ...prev.slice(0, 8)]);
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        return;
      }

      setMultiplier(current);

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
    <div className="mx-auto max-w-[30rem] space-y-4 rounded-[2rem] bg-[#070d1b] p-3 text-white shadow-[0_30px_90px_rgba(0,0,0,.55)]">
      <div className="flex items-center justify-between gap-2 rounded-2xl border border-white/10 bg-[#101827] px-3 py-2">
        <button
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-slate-300 hover:bg-white/10"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>

        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {history.map((h, i) => (
            <span
              key={i}
              className={`whitespace-nowrap rounded-md border px-2 py-0.5 text-[10px] font-black ${
                h >= 3.0
                  ? 'border-purple-500/30 bg-purple-500/20 text-purple-300'
                  : h >= 2.0
                    ? 'border-emerald-500/30 bg-emerald-500/20 text-emerald-400'
                    : 'border-slate-700 bg-slate-800 text-slate-400'
              }`}
            >
              {h.toFixed(2)}x
            </span>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[1.8rem] border border-yellow-300/30 bg-gradient-to-b from-[#121b34] via-[#0f1730] to-[#0b1126] p-4 shadow-[0_0_28px_rgba(250,204,21,.12)]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-yellow-300">
              <Plane className="h-4 w-4" />
              {game.name}
            </div>
            <h1 className="mt-1 text-2xl font-black text-white">Crash</h1>
          </div>

          <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-2 py-1 text-right">
            <div className="text-[9px] uppercase tracking-[.14em] text-emerald-200">Saldo</div>
            <div className="text-sm font-black text-white">R$ {user.balance.toFixed(2)}</div>
          </div>
        </div>

        <div className="relative h-64 w-full overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#080d1f] shadow-inner sm:h-72">
          <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:2rem_2rem]" />

          {gameState === 'flying' && (
            <div
              className="absolute z-10 flex items-center gap-1.5 transition-all duration-75"
              style={{
                left: `${Math.min(80, 10 + progressPercent * 0.7)}%`,
                bottom: `${Math.min(75, 15 + progressPercent * 0.6)}%`,
              }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-rose-500 bg-rose-500/20 text-rose-400 animate-bounce">
                <Plane className="h-6 w-6 -rotate-45" />
              </div>
            </div>
          )}

          <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
            {gameState === 'crashed' ? (
              <div className="space-y-1 animate-in zoom-in">
                <p className="text-sm font-black uppercase tracking-[.18em] text-rose-500">Voou longe!</p>
                <p className="text-5xl font-black text-rose-500 sm:text-6xl">{multiplier.toFixed(2)}x</p>
              </div>
            ) : gameState === 'cashed_out' ? (
              <div className="space-y-1 animate-in zoom-in">
                <p className="text-xs font-black uppercase tracking-[.18em] text-emerald-400">Você sacou</p>
                <p className="text-5xl font-black text-emerald-400 sm:text-6xl">{multiplier.toFixed(2)}x</p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-5xl font-black tracking-tight text-white sm:text-6xl">{multiplier.toFixed(2)}x</p>
                {gameState === 'flying' ? (
                  <p className="text-xs font-bold uppercase tracking-[.15em] text-amber-400 animate-pulse">Subindo… sacar agora</p>
                ) : (
                  <p className="text-xs font-medium uppercase tracking-[.15em] text-slate-400">Faça sua aposta</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          {gameState === 'flying' ? (
            <button
              onClick={() => handleCashout()}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 px-4 py-4 text-xl font-black text-slate-950 shadow-[0_16px_32px_rgba(16,185,129,.35)]"
            >
              Sacar R$ {(stake * multiplier).toFixed(2)} ({multiplier.toFixed(2)}x)
            </button>
          ) : (
            <>
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

              <div className="rounded-2xl border border-yellow-300/20 bg-yellow-500/5 p-3">
                <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-[.18em] text-slate-300">
                  <span>Auto Cashout</span>
                  <span className="text-yellow-300">{autoCashout.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min={1.1}
                  max={10}
                  step={0.1}
                  value={autoCashout}
                  onChange={event => setAutoCashout(Number(event.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <button
                onClick={startFlight}
                disabled={user.balance < stake}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 px-4 py-3 text-base font-black text-slate-950 shadow-[0_16px_32px_rgba(244,114,182,.25)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plane className="h-5 w-5 fill-slate-950" />
                <span>DECOLAR (R$ {stake.toFixed(2)})</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
