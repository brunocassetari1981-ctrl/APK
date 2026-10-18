import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Zap,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  HelpCircle,
  Clock,
  LogOut,
  ChevronRight,
  ArrowLeft,
  Coins,
  Minus,
  Plus,
  Settings
} from 'lucide-react';
import { CasinoGame } from '../types';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';
import { getPGGameConfig } from '../data/pgGameConfigs';

interface WGGameViewProps {
  game: CasinoGame;
  onExit: () => void;
}

export const WGGameView: React.FC<WGGameViewProps> = ({ game, onExit }) => {
  const { user, chargeCasinoStake, payoutCasinoWin, depositPix, showToast } = useApp();
  const gameConfig = getPGGameConfig(game.id, game.name);

  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  // Progressive jackpots (matching video values)
  const [grandJackpot, setGrandJackpot] = useState(13057337.35);
  const [majorJackpot, setMajorJackpot] = useState(1477070.3);

  // Bet settings
  const [multiplier, setMultiplier] = useState(1);
  const [coinValue, setCoinValue] = useState(0.01);
  const [lines] = useState(10);
  const totalBet = multiplier * coinValue * lines;

  // Dynamic WG reels
  const [wgReels, setWgReels] = useState<string[][]>([
    [gameConfig.availableSymbols[0]?.emoji || '🥕', gameConfig.availableSymbols[1]?.emoji || '🪙', gameConfig.availableSymbols[2]?.emoji || '✨'],
    [gameConfig.availableSymbols[3]?.emoji || '💰', gameConfig.mascotEmoji, gameConfig.availableSymbols[1]?.emoji || '🪙'],
    [gameConfig.availableSymbols[2]?.emoji || '✨', gameConfig.availableSymbols[0]?.emoji || '🥕', gameConfig.availableSymbols[3]?.emoji || '💰']
  ]);

  // Game state
  const [isSpinning, setIsSpinning] = useState(false);
  const [isFastMode, setIsFastMode] = useState(false);
  const [autoRounds, setAutoRounds] = useState<number | null>(null);
  const [lastWinAmount, setLastWinAmount] = useState(0.05);

  // Modals & Drawers
  const [showBetContext, setShowBetContext] = useState(false);
  const [showMaisMenu, setShowMaisMenu] = useState(false);
  const [showAutoDropdown, setShowAutoDropdown] = useState(false);
  const [showDepositDrawer, setShowDepositDrawer] = useState(false);
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);

  // Deposit drawer
  const [depositAmount, setDepositAmount] = useState(35);
  const [pixPending, setPixPending] = useState(false);

  // Ticker for jackpots
  useEffect(() => {
    const jackpotTimer = setInterval(() => {
      setGrandJackpot(prev => prev + Math.random() * 0.15);
      setMajorJackpot(prev => prev + Math.random() * 0.05);
    }, 1500);
    return () => clearInterval(jackpotTimer);
  }, []);

  // Loading sequence (WG Win Gaming)
  useEffect(() => {
    let p = 0;
    const interval = setInterval(() => {
      p += 15;
      if (p >= 100) {
        setLoadProgress(100);
        setTimeout(() => setIsLoading(false), 400);
        clearInterval(interval);
      } else {
        setLoadProgress(p);
      }
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // Spin Engine
  const spin = () => {
    if (isSpinning) return;

    if (user.balance < totalBet) {
      setShowInsufficientBalance(true);
      setAutoRounds(null);
      return;
    }

    const charged = chargeCasinoStake(totalBet, game.name);
    if (!charged) {
      setShowInsufficientBalance(true);
      setAutoRounds(null);
      return;
    }

    setIsSpinning(true);
    sounds.playSpin();

    setTimeout(() => {
      setIsSpinning(false);

      const syms = gameConfig.availableSymbols.map(s => s.emoji);
      setWgReels([
        [syms[Math.floor(Math.random() * syms.length)], syms[Math.floor(Math.random() * syms.length)], syms[Math.floor(Math.random() * syms.length)]],
        [syms[Math.floor(Math.random() * syms.length)], Math.random() > 0.3 ? gameConfig.mascotEmoji : syms[Math.floor(Math.random() * syms.length)], syms[Math.floor(Math.random() * syms.length)]],
        [syms[Math.floor(Math.random() * syms.length)], syms[Math.floor(Math.random() * syms.length)], syms[Math.floor(Math.random() * syms.length)]]
      ]);

      // Hit rate ~40%
      if (Math.random() < 0.45) {
        const win = totalBet * (Math.random() > 0.7 ? 5 : 1.5);
        setLastWinAmount(win);
        payoutCasinoWin(win, game.name);
        sounds.playWin();
      }

      if (autoRounds !== null) {
        if (autoRounds > 1) {
          setAutoRounds(prev => (prev ? prev - 1 : null));
          setTimeout(spin, isFastMode ? 300 : 700);
        } else {
          setAutoRounds(null);
        }
      }
    }, isFastMode ? 400 : 850);
  };

  const handleDeposit = () => {
    setPixPending(true);
    setTimeout(() => {
      depositPix(depositAmount);
      setPixPending(false);
      setShowDepositDrawer(false);
      setShowInsufficientBalance(false);
      showToast(`Depósito de R$ ${depositAmount.toFixed(2)} confirmado via Pix!`);
      sounds.playCoin();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center select-none overflow-hidden font-sans">
      {/* Fullscreen toast banner */}
      <div className="absolute top-1 z-40 bg-black/70 backdrop-blur-md border border-white/10 text-slate-300 text-[11px] px-3 py-1 rounded-full pointer-events-none">
        Toque na seta de voltar para sair
      </div>

      {/* ============================================================== */}
      {/* WG WIN GAMING LOADING SPLASH (Matches video 00:26 & 01:06)     */}
      {/* ============================================================== */}
      {isLoading ? (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 space-y-4">
          <div className="text-center">
            <div className="text-5xl font-black flex items-center justify-center tracking-tighter">
              <span className="text-emerald-500">W</span>
              <span className="text-blue-500">G</span>
            </div>
            <p className="text-sm font-black tracking-widest text-slate-300 uppercase mt-1">
              Win Gaming
            </p>
          </div>

          <div className="w-48 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-blue-500 transition-all duration-200"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
        </div>
      ) : (
        /* ============================================================== */
        /* WG GAME ARENA (Matches video 00:31 - 02:14)                   */
        /* ============================================================== */
        <div className="relative w-full h-full max-w-md mx-auto flex flex-col justify-between bg-gradient-to-b from-purple-950 via-indigo-950 to-slate-950 overflow-hidden shadow-2xl border-x border-slate-800/40">
          {/* Top 4-Tier Jackpots Bar (GRAND, MAJOR, MINOR, MINI) */}
          <div className="relative z-20 bg-slate-950/90 border-b border-purple-800/60 px-2 py-1 flex items-center justify-between text-[10px] text-white">
            <div className="flex items-center gap-1">
              <button onClick={onExit} className="p-1 text-slate-400 hover:text-white" title="Voltar ao lobby">
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div>
                <span className="text-amber-400 font-bold block text-[8px]">GRAND</span>
                <span className="font-black text-amber-200">
                  R$ {grandJackpot.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="hidden sm:block">
                <span className="text-purple-400 font-bold block text-[8px]">MAJOR</span>
                <span className="font-bold text-slate-200">
                  R$ {majorJackpot.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-cyan-400 font-bold block text-[8px]">MINOR</span>
                <span className="font-bold text-cyan-200">R$ 2,00</span>
              </div>
              <div>
                <span className="text-emerald-400 font-bold block text-[8px]">MINI</span>
                <span className="font-bold text-emerald-200">R$ 1,00</span>
              </div>
            </div>

            <button onClick={() => setShowMaisMenu(true)} className="p-1 text-slate-400 hover:text-white">
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Upper mascot: Rabbit with purple hair & WG cap */}
          <div className="relative flex-1 flex flex-col items-center justify-center p-2">
            <div className="relative w-44 h-32 flex items-center justify-center">
              <div
                className={`text-6xl filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] transition-transform duration-300 ${
                  isSpinning ? 'animate-bounce scale-110' : ''
                }`}
              >
                {gameConfig.mascotEmoji}
              </div>
              {/* WG Cap overlay */}
              <div className="absolute top-2 bg-gradient-to-r from-purple-600 to-indigo-600 px-2 py-0.5 rounded-full border border-amber-300 text-[9px] font-black text-white shadow">
                WG
              </div>
            </div>

            {/* Middle Reels Display with gold multiplier values */}
            <div className="w-full max-w-[320px] bg-slate-950/95 border-2 border-purple-500/70 rounded-2xl p-2.5 shadow-2xl relative">
              <div className="grid grid-cols-3 gap-2">
                {wgReels.map((col, cIdx) => (
                  <div key={cIdx} className="flex flex-col gap-1.5">
                    {col.map((em, rIdx) => (
                      <div
                        key={rIdx}
                        className={`h-14 sm:h-16 rounded-xl bg-gradient-to-b from-purple-900/60 to-slate-900 border border-purple-700/50 flex flex-col items-center justify-center shadow-inner ${
                          isSpinning ? 'animate-pulse blur-[1px]' : ''
                        }`}
                      >
                        <span className="text-2xl">{em}</span>
                        <span className="text-[9px] font-black text-amber-300">0,05</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Animated Win Center Banner (WIN 0,05) */}
              <div className="mt-2 py-1 px-3 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 border border-amber-400 rounded-xl flex items-center justify-between text-white shadow-lg">
                <span className="text-xs font-black text-yellow-300 tracking-wider">
                  WIN {lastWinAmount.toFixed(2)}
                </span>
                <span className="text-[10px] text-amber-200">5 para ganhar!</span>
              </div>
            </div>
          </div>

          {/* Bottom Deck (Matches video 00:31 - 02:14) */}
          <div className="relative z-20 bg-slate-950/95 border-t border-purple-800/80 p-2 sm:p-3 space-y-2">
            {/* Status strip */}
            <div className="flex items-center justify-between px-2 text-white text-xs">
              {/* Balance */}
              <button
                onClick={() => setShowDepositDrawer(true)}
                className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-full px-2.5 py-1 text-xs"
              >
                <span>🇧🇷</span>
                <span className="font-black text-amber-300">R$ {user.balance.toFixed(2)}</span>
              </button>

              {/* Bet configuration context */}
              <button
                onClick={() => setShowBetContext(true)}
                className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-full px-2.5 py-1 text-xs font-bold"
              >
                <span>{multiplier}x + 0,10</span>
                <span className="text-purple-300">10Lines</span>
              </button>

              {/* Mais button */}
              <button
                onClick={() => setShowMaisMenu(true)}
                className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white"
              >
                <span>☰ Mais</span>
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-around gap-2 pt-1">
              {/* Minus */}
              <button
                onClick={() => setMultiplier(prev => Math.max(1, prev - 1))}
                className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 text-white flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* Spin Button with blue & green arrows (WG exact theme) */}
              <button
                onClick={spin}
                disabled={isSpinning}
                className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-indigo-600 border-4 border-amber-300 shadow-[0_0_20px_rgba(59,130,246,0.6)] flex items-center justify-center text-white active:scale-95 transition-transform"
              >
                <RotateCcw className={`w-7 h-7 ${isSpinning ? 'animate-spin' : ''}`} />
              </button>

              {/* Plus */}
              <button
                onClick={() => setMultiplier(prev => Math.min(10, prev + 1))}
                className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 text-white flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Rápido */}
              <button
                onClick={() => setIsFastMode(!isFastMode)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  isFastMode
                    ? 'bg-amber-400 text-slate-950 border-amber-400'
                    : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}
              >
                ⚡ Rápido
              </button>

              {/* Auto */}
              <button
                onClick={() => setShowAutoDropdown(!showAutoDropdown)}
                className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                  autoRounds !== null
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-slate-900 text-slate-300 border-slate-800'
                }`}
              >
                {autoRounds ? `${autoRounds}` : 'Auto'}
              </button>
            </div>
          </div>

          {/* Auto Dropdown Modal */}
          {showAutoDropdown && (
            <div className="absolute bottom-20 right-4 z-40 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl space-y-1 text-xs text-white">
              {[10, 30, 50, 100, 1000].map(count => (
                <button
                  key={count}
                  onClick={() => {
                    setAutoRounds(count);
                    setShowAutoDropdown(false);
                    spin();
                  }}
                  className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-800 font-bold"
                >
                  {count} Rodadas
                </button>
              ))}
            </div>
          )}

          {/* Bet Context Drawer (Matches video 01:28) */}
          {showBetContext && (
            <div className="absolute inset-0 z-50 bg-black/75 flex flex-col justify-end animate-in fade-in">
              <div className="bg-slate-900 border-t-2 border-purple-500 rounded-t-3xl p-5 space-y-4 text-white">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-black text-sm">Contexto</h3>
                  <button onClick={() => setShowBetContext(false)}>
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Aposta</span>
                    <span className="font-bold text-amber-300">0,01</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Linhas</span>
                    <span className="font-bold">10</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Nível</span>
                    <span className="font-bold">{multiplier}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Valor Aposta</span>
                    <span className="font-black text-emerald-400">R$ {totalBet.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowBetContext(false)}
                  className="w-full py-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs"
                >
                  Confirmar
                </button>
              </div>
            </div>
          )}

          {/* Mais Menu (Matches video 01:50) */}
          {showMaisMenu && (
            <div className="absolute bottom-16 right-4 z-40 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl space-y-1 text-xs text-white">
              <button onClick={() => setShowMaisMenu(false)} className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2">
                <span>📋 Registros</span>
              </button>
              <button onClick={() => setShowMaisMenu(false)} className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2">
                <span>📖 Regras</span>
              </button>
              <button onClick={() => setShowMaisMenu(false)} className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2">
                <span>🎵 SFX</span>
              </button>
              <button onClick={onExit} className="w-full text-left px-3 py-2 hover:bg-slate-800 flex items-center gap-2 text-rose-400">
                <span>🚪 Sair</span>
              </button>
            </div>
          )}

          {/* Saldo Insuficiente Modal */}
          {showInsufficientBalance && (
            <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center max-w-xs w-full shadow-2xl space-y-4">
                <h3 className="text-lg font-black text-white">Saldo Insuficiente</h3>
                <p className="text-xs text-slate-300">
                  Por favor, carregue a sua carteira de dinheiro para continuar jogando.
                </p>
                <button
                  onClick={() => {
                    setShowInsufficientBalance(false);
                    setShowDepositDrawer(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-400 text-slate-950 font-black text-sm"
                >
                  OK (Depositar)
                </button>
              </div>
            </div>
          )}

          {/* 121bet Deposit Drawer */}
          {showDepositDrawer && (
            <div className="absolute inset-0 z-50 bg-black/85 flex flex-col justify-end animate-in fade-in">
              <div className="bg-slate-900 border-t-2 border-amber-400 rounded-t-3xl p-5 space-y-4 text-white">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-black text-base">Depósito PIX Imediato</h3>
                  <button onClick={() => setShowDepositDrawer(false)}>
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[15, 35, 55, 155, 555, 1555, 5555, 15555].map(v => (
                    <button
                      key={v}
                      onClick={() => setDepositAmount(v)}
                      className={`p-2 rounded-xl text-center border font-black text-xs ${
                        depositAmount === v ? 'bg-amber-400 text-slate-950' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      R$ {v}
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleDeposit}
                  disabled={pixPending}
                  className="w-full py-3.5 rounded-2xl bg-amber-400 text-slate-950 font-black text-sm"
                >
                  {pixPending ? 'Confirmando...' : `Depositar R$ ${depositAmount.toFixed(2)}`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
