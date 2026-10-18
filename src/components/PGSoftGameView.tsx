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
  QrCode,
  Copy,
  CheckCircle,
  ShieldCheck,
  TrendingUp,
  Flame,
  Minus,
  Plus,
  Coins
} from 'lucide-react';
import { CasinoGame } from '../types';
import { useApp } from '../context/AppContext';
import { sounds } from '../utils/audio';
import { getPGGameConfig, PGSymbolItem } from '../data/pgGameConfigs';

interface PGSoftGameViewProps {
  game: CasinoGame;
  onExit: () => void;
}

type SplashStep = 'cubes' | 'logo' | 'intro' | 'playing';

type SymbolItem = PGSymbolItem;

export const PGSoftGameView: React.FC<PGSoftGameViewProps> = ({ game, onExit }) => {
  const { user, chargeCasinoStake, payoutCasinoWin, depositPix, showToast } = useApp();
  const gameConfig = getPGGameConfig(game.id, game.name);

  // Lifecycle & Screens
  const [splashStep, setSplashStep] = useState<SplashStep>('cubes');
  const [loadProgress, setLoadProgress] = useState(0);
  const [loadStatusText, setLoadStatusText] = useState('A iniciar sessão...');

  // In-Game Modals & Drawers
  const [showInsufficientBalance, setShowInsufficientBalance] = useState(false);
  const [showBetOptions, setShowBetOptions] = useState(false);
  const [showMenuDrawer, setShowMenuDrawer] = useState(false);
  const [showPaytable, setShowPaytable] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showDepositDrawer, setShowDepositDrawer] = useState(false);

  // Sound & Live Clock
  const [soundOn, setSoundOn] = useState(true);
  const [liveTime, setLiveTime] = useState('13:13:42');

  // Bet calculation: Base (0.05, 0.50, 4.00) * Level (1..10) * Lines (10)
  const [baseBet, setBaseBet] = useState(0.05);
  const [betLevel, setBetLevel] = useState(1);
  const [lines] = useState(10);
  const totalStake = baseBet * betLevel * lines;

  // Game Engine State
  const [isSpinning, setIsSpinning] = useState(false);
  const [turboMode, setTurboMode] = useState(false);
  const [autoSpinCount, setAutoSpinCount] = useState<number | null>(null);
  const autoSpinRef = useRef<number | null>(null);
  autoSpinRef.current = autoSpinCount;

  // Marquee announcement
  const marqueeMessages = gameConfig.marqueeMessages;
  const [marqueeIndex, setMarqueeIndex] = useState(0);

  // Big Win celebrations
  const [winAnnouncement, setWinAnnouncement] = useState<{ amount: number; label: string } | null>(null);
  const [winLineActive, setWinLineActive] = useState(false);

  // Deposit Drawer State
  const [depositAmount, setDepositAmount] = useState(35);
  const [depositTab, setDepositTab] = useState<'online' | 'crypto'>('online');
  const [pixGenerated, setPixGenerated] = useState(false);

  // Reels definition (3 columns x 3 rows)
  const [reels, setReels] = useState<SymbolItem[][]>(gameConfig.initialReels);

  // Live clock timer
  useEffect(() => {
    const clockInterval = setInterval(() => {
      const now = new Date();
      setLiveTime(
        now.toLocaleTimeString('pt-BR', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Marquee rotator
  useEffect(() => {
    const marqueeInterval = setInterval(() => {
      setMarqueeIndex(prev => (prev + 1) % marqueeMessages.length);
    }, 3800);
    return () => clearInterval(marqueeInterval);
  }, []);

  // Authentic splash screen loading sequence
  useEffect(() => {
    // 1. Cubes (600ms)
    const t1 = setTimeout(() => {
      setSplashStep('logo');
    }, 700);

    // 2. PG Logo (1400ms)
    const t2 = setTimeout(() => {
      setSplashStep('intro');
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Progress bar sequence in intro
  useEffect(() => {
    if (splashStep !== 'intro') return;

    let p = 0;
    const progressInterval = setInterval(() => {
      p += Math.floor(Math.random() * 25) + 20;
      if (p >= 100) {
        p = 100;
        setLoadProgress(100);
        setLoadStatusText('Pronto para iniciar');
        clearInterval(progressInterval);
        setTimeout(() => {
          setSplashStep('playing');
        }, 500);
      } else {
        setLoadProgress(p);
        if (p < 40) setLoadStatusText('A iniciar sessão...');
        else if (p < 80) setLoadStatusText('A ler informações do jogo...');
        else setLoadStatusText('A carregar recursos [98%]...');
      }
    }, 120);

    return () => clearInterval(progressInterval);
  }, [splashStep]);

  // Spin Engine
  const triggerSpin = () => {
    if (isSpinning) return;

    if (user.balance < totalStake) {
      setShowInsufficientBalance(true);
      setAutoSpinCount(null);
      return;
    }

    const charged = chargeCasinoStake(totalStake, game.name);
    if (!charged) {
      setShowInsufficientBalance(true);
      setAutoSpinCount(null);
      return;
    }

    setIsSpinning(true);
    setWinAnnouncement(null);
    setWinLineActive(false);

    if (soundOn) sounds.playSpin();

    const spinDuration = turboMode ? 400 : 900;
    const stepInterval = 65;
    const totalSteps = Math.floor(spinDuration / stepInterval);
    let step = 0;

    const availableSymbols: SymbolItem[] = gameConfig.availableSymbols;

    const interval = setInterval(() => {
      step++;
      setReels([
        [
          availableSymbols[Math.floor(Math.random() * availableSymbols.length)],
          availableSymbols[Math.floor(Math.random() * availableSymbols.length)],
          availableSymbols[Math.floor(Math.random() * availableSymbols.length)]
        ],
        [
          availableSymbols[Math.floor(Math.random() * availableSymbols.length)],
          availableSymbols[Math.floor(Math.random() * availableSymbols.length)],
          availableSymbols[Math.floor(Math.random() * availableSymbols.length)]
        ],
        [
          availableSymbols[Math.floor(Math.random() * availableSymbols.length)],
          availableSymbols[Math.floor(Math.random() * availableSymbols.length)],
          availableSymbols[Math.floor(Math.random() * availableSymbols.length)]
        ]
      ]);

      if (step >= totalSteps) {
        clearInterval(interval);
        setIsSpinning(false);

        // Win calculation (approx 44% exciting hit-rate)
        const roll = Math.random();
        let win = 0;
        let winTitle = '';

        if (roll < 0.08) {
          // Mega Win (WILDs aligned)
          win = totalStake * 25;
          winTitle = 'MEGA WIN!';
          setWinLineActive(true);
        } else if (roll < 0.22) {
          // Big Win (Ingots aligned)
          win = totalStake * 8;
          winTitle = 'GRANDE PRÊMIO!';
          setWinLineActive(true);
        } else if (roll < 0.44) {
          // Standard hit
          win = totalStake * 2.5;
          winTitle = 'VITÓRIA!';
          setWinLineActive(true);
        }

        if (win > 0) {
          setWinAnnouncement({ amount: win, label: winTitle });
          payoutCasinoWin(win, game.name);
          if (soundOn) sounds.playWin();
        }

        // Auto spin continuation
        if (autoSpinRef.current !== null) {
          if (autoSpinRef.current > 1) {
            setAutoSpinCount(prev => (prev ? prev - 1 : null));
            setTimeout(() => {
              triggerSpin();
            }, turboMode ? 350 : 800);
          } else {
            setAutoSpinCount(null);
          }
        }
      }
    }, stepInterval);
  };

  // Instant Pix Deposit handler
  const handlePixSubmit = () => {
    setPixGenerated(true);
    setTimeout(() => {
      depositPix(depositAmount);
      setShowDepositDrawer(false);
      setShowInsufficientBalance(false);
      setPixGenerated(false);
      showToast(`Depósito de R$ ${depositAmount.toFixed(2)} confirmado via Pix!`);
      if (soundOn) sounds.playCoin();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center select-none overflow-hidden font-sans">
      {/* Fullscreen exit banner notification */}
      <div className="absolute top-1 z-40 bg-black/70 backdrop-blur-md border border-white/10 text-slate-300 text-[11px] px-3 py-1 rounded-full pointer-events-none transition-opacity duration-1000">
        Toque na seta de voltar ou no X para sair do jogo
      </div>

      {/* ============================================================== */}
      {/* PHASE 1: 3D CUBES SPLASH */}
      {/* ============================================================== */}
      {splashStep === 'cubes' && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black">
          <div className="relative w-16 h-16 animate-spin">
            <div className="absolute inset-0 border-2 border-cyan-400 rounded-lg transform rotate-45 animate-pulse" />
            <div className="absolute inset-2 border-2 border-emerald-400 rounded-lg transform -rotate-12" />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PHASE 2: PG "DIFFERENCE MAKES THE DIFFERENCE" SPLASH */}
      {/* ============================================================== */}
      {splashStep === 'logo' && (
        <div className="w-full h-full flex flex-col items-center justify-center bg-black space-y-4">
          <div className="flex items-center gap-1.5 font-mono text-4xl sm:text-5xl font-black tracking-widest text-white animate-pulse">
            <span className="text-white">P</span>
            <span className="text-white">G</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 tracking-[0.25em] uppercase font-bold text-center">
            DIFFERENCE MAKES THE DIFFERENCE
          </p>
        </div>
      )}

      {/* ============================================================== */}
      {/* PHASE 3: COVER ART INTRO WITH LOADING PROGRESS & RULES SLIDE */}
      {/* ============================================================== */}
      {splashStep === 'intro' && (
        <div className="relative w-full h-full max-w-md mx-auto flex flex-col justify-between p-6 bg-slate-950 text-white overflow-hidden">
          {/* Background art poster */}
          {game.posterUrl && (
            <img
              src={game.posterUrl}
              alt={game.name}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-40 blur-[1px]"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Top Logo */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs font-black tracking-widest text-amber-300">
              <Sparkles className="w-4 h-4" />
              <span>PG SOFT OFICIAL</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSplashStep('playing')}
                className="px-2.5 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 text-[10px] font-black tracking-wider transition-all"
              >
                PULAR
              </button>
              <button
                onClick={onExit}
                className="w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Middle Presentation */}
          <div className="relative z-10 text-center space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-amber-300 drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
              {game.name}
            </h1>
            <p className="text-sm font-bold text-white drop-shadow">
              {gameConfig.subtitle}
            </p>
            <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-lg">
              Ganhe até {gameConfig.maxWinText}!
            </div>
          </div>

          {/* Bottom Loading Bar and Start CTA */}
          <div className="relative z-10 space-y-4">
            {loadProgress < 100 ? (
              <div className="space-y-1.5 text-center">
                <div className="w-full bg-slate-900/90 rounded-full h-2.5 overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-400 transition-all duration-200"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 font-medium">
                  {loadStatusText} [{loadProgress}%]
                </p>
              </div>
            ) : (
              <button
                onClick={() => setSplashStep('playing')}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-lg tracking-wider shadow-2xl shadow-amber-950/80 active:scale-95 transition-all flex items-center justify-center gap-2 animate-bounce"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>INICIAR</span>
              </button>
            )}

            {/* Compliance Legal Badges */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-around text-[9px] text-slate-400">
              <span className="font-bold">PG SOFT</span>
              <span>• Licenciado por Malta MGA</span>
              <span>• Certificado BMM</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* PHASE 4: FULL AUTHENTIC 121BET GAMEPLAY ARENA */}
      {/* ============================================================== */}
      {splashStep === 'playing' && (
        <div className="relative w-full h-full max-w-md mx-auto flex flex-col justify-between bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 overflow-hidden shadow-2xl border-x border-slate-800/40">
          {/* Top Bar: Game Title, Trophy, Clock, Close */}
          <div className="relative z-20 flex items-center justify-between px-3 py-1.5 bg-black/60 border-b border-white/10 text-white">
            <div className="flex items-center gap-1.5">
              <button
                onClick={onExit}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                title="Voltar ao lobby"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="font-black text-xs text-amber-300">{game.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-300">{liveTime}</span>
              <button
                onClick={() => setShowPaytable(true)}
                className="p-1 text-amber-400 hover:text-amber-300"
                title="Tabela de Pagamentos"
              >
                <Trophy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Upper Shrine Arena with Animated 3D Character (Matches Video) */}
          <div className="relative flex-1 flex flex-col items-center justify-center p-2 overflow-hidden">
            {/* Background Pagoda and Lanterns */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-black" />

            {/* 3D Shrine Pavilion */}
            <div className="relative z-10 w-full max-w-[340px] flex flex-col items-center">
              {/* Golden Shrine Character Roof */}
              <div className="relative w-48 h-32 flex items-center justify-center">
                {/* Red Shrine Arch */}
                <div className={`absolute inset-0 bg-gradient-to-b ${gameConfig.themeGradient} rounded-t-3xl border-2 border-amber-400/80 shadow-2xl flex items-center justify-center`}>
                  {/* The Mascot Character in Imperial Robe */}
                  <div
                    className={`text-6xl select-none filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] transition-transform duration-300 ${
                      isSpinning ? 'scale-110 -rotate-3 animate-bounce' : 'hover:scale-105'
                    }`}
                  >
                    {gameConfig.mascotEmoji}
                  </div>
                </div>

                {/* Golden Hanging Lanterns */}
                <div className="absolute -left-3 top-4 w-5 h-8 bg-red-600 rounded border border-amber-300 shadow-md animate-pulse flex items-center justify-center text-[10px] font-black text-amber-200">
                  {gameConfig.lanternLeftText}
                </div>
                <div className="absolute -right-3 top-4 w-5 h-8 bg-red-600 rounded border border-amber-300 shadow-md animate-pulse flex items-center justify-center text-[10px] font-black text-amber-200">
                  {gameConfig.lanternRightText}
                </div>
              </div>

              {/* REELS STAGE (3 Columns x 3 Rows with Golden Frame & Numbers) */}
              <div className="relative w-full bg-slate-950/95 rounded-2xl border-4 border-amber-400 p-2 shadow-2xl overflow-hidden mt-[-10px]">
                {/* Payline Numbers on Left and Right borders */}
                <div className="absolute left-1 top-2 bottom-2 flex flex-col justify-around text-[9px] font-black text-purple-300 select-none">
                  <span>2</span>
                  <span>3</span>
                  <span>1</span>
                  <span>6</span>
                  <span>7</span>
                </div>
                <div className="absolute right-1 top-2 bottom-2 flex flex-col justify-around text-[9px] font-black text-purple-300 select-none">
                  <span>4</span>
                  <span>5</span>
                  <span>10</span>
                  <span>8</span>
                  <span>9</span>
                </div>

                {/* 3 Columns Grid */}
                <div className="grid grid-cols-3 gap-2 px-3 py-1">
                  {reels.map((col, colIdx) => (
                    <div
                      key={colIdx}
                      className={`flex flex-col gap-2 transition-transform ${
                        isSpinning ? 'blur-[1px] scale-98' : ''
                      }`}
                    >
                      {col.map((sym, rowIdx) => {
                        const isCenterJackpot = colIdx === 1;

                        return (
                          <div
                            key={rowIdx}
                            className={`h-16 sm:h-20 rounded-xl flex flex-col items-center justify-center relative p-1 shadow-md border ${
                              isCenterJackpot
                                ? 'bg-gradient-to-b from-amber-600/70 via-yellow-700/60 to-slate-900 border-amber-400'
                                : 'bg-gradient-to-b from-purple-950/80 to-slate-950 border-purple-800/60'
                            }`}
                          >
                            {/* Symbol Emoji */}
                            <span className="text-3xl select-none filter drop-shadow">
                              {sym.emoji}
                            </span>

                            {/* Label or Prize Value */}
                            {sym.prizeValue ? (
                              <span className="text-xs font-black text-yellow-300 bg-black/60 px-1.5 py-0.5 rounded-full mt-0.5 border border-amber-400/40">
                                {sym.prizeValue}
                              </span>
                            ) : (
                              <span
                                className={`text-[10px] font-black uppercase tracking-wider truncate px-1 ${
                                  sym.isWild ? 'text-amber-300' : 'text-slate-200'
                                }`}
                              >
                                {sym.name}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Winning line laser overlay */}
                {winLineActive && (
                  <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 shadow-[0_0_12px_rgba(251,191,36,1)] z-30 animate-pulse pointer-events-none" />
                )}
              </div>

              {/* Dynamic Scrolling Marquee Banner with Golden Statues */}
              <div className="w-full mt-2 bg-gradient-to-r from-amber-950/90 via-red-950/90 to-amber-950/90 border border-amber-400/60 rounded-xl px-2 py-1 flex items-center justify-between text-amber-200 shadow-md">
                <span className="text-xs">{gameConfig.bannerEmoji}</span>
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-center truncate px-1 text-amber-300 drop-shadow">
                  {marqueeMessages[marqueeIndex % marqueeMessages.length]}
                </span>
                <span className="text-xs">{gameConfig.bannerEmoji}</span>
              </div>
            </div>

            {/* In-Game Win Floating Celebration Banner */}
            {winAnnouncement && (
              <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 p-4 rounded-2xl border-2 border-white shadow-2xl text-center animate-bounce">
                <p className="text-xs font-black uppercase tracking-widest">{winAnnouncement.label}</p>
                <p className="text-2xl font-black mt-0.5">+R$ {winAnnouncement.amount.toFixed(2)}</p>
              </div>
            )}
          </div>

          {/* Bottom Game Deck & Controls Bar */}
          <div className="relative z-20 bg-slate-950/95 border-t border-amber-500/30 p-2 sm:p-3 space-y-2">
            {/* Status Strip: Profile + Real Balance | PG Logo Button | Stake Display */}
            <div className="flex items-center justify-between px-2 text-white">
              {/* Profile + Real Balance (Clicking opens deposit) */}
              <button
                onClick={() => setShowDepositDrawer(true)}
                className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-amber-400 rounded-full px-2.5 py-1 transition-all active:scale-95"
              >
                <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-slate-300">
                  <Coins className="w-3 h-3 text-amber-400" />
                </div>
                <span className="text-xs font-black text-amber-300">
                  R$ {user.balance.toFixed(2)}
                </span>
              </button>

              {/* Center: Iconic Pixel PG Logo Button */}
              <button
                onClick={() => setShowMenuDrawer(true)}
                className="px-2 py-0.5 rounded-md bg-black border border-white/20 text-white font-mono text-[10px] font-black tracking-widest hover:border-amber-400 transition-colors"
                title="Menu PG Soft"
              >
                PG
              </button>

              {/* Right: Stake Display (Clicking opens Opções de Aposta) */}
              <button
                onClick={() => setShowBetOptions(true)}
                className="flex items-center gap-1 bg-slate-900 border border-slate-800 hover:border-amber-400 rounded-full px-2.5 py-1 text-xs font-black text-white transition-all active:scale-95"
              >
                <span className="text-slate-400 font-normal text-[10px]">Aposta:</span>
                <span className="text-amber-300">R$ {totalStake.toFixed(2)}</span>
              </button>
            </div>

            {/* Spin Deck: Sound | Minus | Huge Green Spin Button | Plus | Turbo | Auto */}
            <div className="flex items-center justify-between gap-1.5 px-1 pt-1">
              {/* Sound Toggle */}
              <button
                onClick={() => setSoundOn(!soundOn)}
                className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center hover:text-white"
                title="Som"
              >
                {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>

              {/* Minus Bet */}
              <button
                onClick={() => setBetLevel(prev => Math.max(1, prev - 1))}
                disabled={isSpinning || betLevel <= 1}
                className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center hover:text-white disabled:opacity-40"
              >
                <Minus className="w-4 h-4" />
              </button>

              {/* HUGE ICONIC GREEN CIRCULAR SPIN BUTTON (Exact Match to Video 00:00 - 00:20) */}
              <button
                onClick={triggerSpin}
                disabled={isSpinning}
                className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-b from-emerald-400 via-emerald-500 to-green-600 border-4 border-amber-300 shadow-[0_0_20px_rgba(16,185,129,0.7)] flex items-center justify-center text-white active:scale-95 transition-transform"
                title="Girar"
              >
                <div
                  className={`w-9 h-9 rounded-full border-2 border-dashed border-white/90 flex items-center justify-center ${
                    isSpinning ? 'animate-spin' : ''
                  }`}
                >
                  <RotateCcw className="w-5 h-5 text-white" />
                </div>
              </button>

              {/* Plus Bet */}
              <button
                onClick={() => setBetLevel(prev => Math.min(10, prev + 1))}
                disabled={isSpinning || betLevel >= 10}
                className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center hover:text-white disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>

              {/* Turbo Mode */}
              <button
                onClick={() => setTurboMode(!turboMode)}
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                  turboMode
                    ? 'bg-amber-400/20 text-amber-300 border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
                title="Modo Turbo"
              >
                <Zap className={`w-4 h-4 ${turboMode ? 'fill-amber-300' : ''}`} />
              </button>

              {/* Auto Spin */}
              <button
                onClick={() => {
                  if (autoSpinCount !== null) {
                    setAutoSpinCount(null);
                  } else {
                    setAutoSpinCount(10);
                    if (!isSpinning) triggerSpin();
                  }
                }}
                className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-black transition-all ${
                  autoSpinCount !== null
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]'
                    : 'bg-slate-900 text-slate-400 border-slate-800'
                }`}
                title="Giro Automático"
              >
                {autoSpinCount !== null ? autoSpinCount : 'Auto'}
              </button>
            </div>
          </div>

          {/* ========================================================== */}
          {/* MODAL 1: "SALDO INSUFICIENTE" (Exact match to video 00:02) */}
          {/* ========================================================== */}
          {showInsufficientBalance && (
            <div className="absolute inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
              <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-6 text-center max-w-xs w-full shadow-2xl space-y-4">
                <h3 className="text-lg font-black text-white">Saldo Insuficiente</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Por favor, carregue a sua carteira de dinheiro. Atualize a sua carteira de dinheiro se o saldo não for atualizado após o carregamento.
                </p>
                <button
                  onClick={() => {
                    setShowInsufficientBalance(false);
                    setShowDepositDrawer(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm transition-all"
                >
                  OK
                </button>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* DRAWER 2: "OPÇÕES DE APOSTA" (Exact match to video 00:06)   */}
          {/* ========================================================== */}
          {showBetOptions && (
            <div className="absolute inset-0 z-50 bg-black/70 flex flex-col justify-end animate-in fade-in">
              <div className="bg-slate-900 border-t-2 border-amber-400/60 rounded-t-3xl p-5 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-black text-sm text-white">Opções de Aposta</h3>
                  <button onClick={() => setShowBetOptions(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 4 columns: Valor de Aposta x Nível x Linhas = Montante */}
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Valor de Aposta</span>
                    <div className="space-y-1">
                      {[0.05, 0.5, 4.0].map(val => (
                        <button
                          key={val}
                          onClick={() => setBaseBet(val)}
                          className={`w-full py-1.5 rounded-lg font-bold text-xs ${
                            baseBet === val ? 'bg-amber-400 text-slate-950' : 'bg-slate-950 text-slate-300'
                          }`}
                        >
                          R$ {val.toFixed(2)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Nível de Aposta</span>
                    <div className="space-y-1">
                      {[1, 2, 3].map(lvl => (
                        <button
                          key={lvl}
                          onClick={() => setBetLevel(lvl)}
                          className={`w-full py-1.5 rounded-lg font-bold text-xs ${
                            betLevel === lvl ? 'bg-amber-400 text-slate-950' : 'bg-slate-950 text-slate-300'
                          }`}
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Linhas</span>
                    <div className="py-1.5 rounded-lg bg-slate-950 text-slate-300 font-bold">10</div>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block mb-1">Montante</span>
                    <div className="py-1.5 rounded-lg bg-amber-400/20 border border-amber-400 text-amber-300 font-black">
                      R$ {totalStake.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => {
                      setBaseBet(4.0);
                      setBetLevel(10);
                    }}
                    className="flex-1 py-3 rounded-full border border-slate-700 text-slate-300 font-bold text-xs hover:border-white"
                  >
                    Aposta Máxima
                  </button>
                  <button
                    onClick={() => setShowBetOptions(false)}
                    className="flex-1 py-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-xs shadow-lg"
                  >
                    Confirmar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* DRAWER 3: "MENU PG / MAIS" (Exact match to video 00:14)     */}
          {/* ========================================================== */}
          {showMenuDrawer && (
            <div className="absolute inset-0 z-50 bg-black/70 flex flex-col justify-end animate-in fade-in">
              <div className="bg-slate-900 border-t-2 border-amber-400/60 rounded-t-3xl p-5 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-amber-400">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase">Carteira de Dinheiro</p>
                      <p className="text-base font-black text-amber-300">R$ {user.balance.toFixed(2)}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowMenuDrawer(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-2 text-center text-slate-300">
                  <button
                    onClick={() => setSoundOn(!soundOn)}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-800"
                  >
                    {soundOn ? <Volume2 className="w-5 h-5 text-amber-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
                    <span className="text-[10px] font-bold">Som</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenuDrawer(false);
                      setShowPaytable(true);
                    }}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-800"
                  >
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <span className="text-[10px] font-bold leading-tight">Pagamento</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenuDrawer(false);
                      setShowRules(true);
                    }}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-800"
                  >
                    <HelpCircle className="w-5 h-5 text-amber-400" />
                    <span className="text-[10px] font-bold">Regras</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenuDrawer(false);
                      setShowHistory(true);
                    }}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-800"
                  >
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span className="text-[10px] font-bold">Histórico</span>
                  </button>
                  <button
                    onClick={onExit}
                    className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-slate-800 text-rose-400"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-[10px] font-bold">Sair</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* DRAWER 4: 121BET IN-GAME PIX DEPOSIT (Matches video 00:36)  */}
          {/* ========================================================== */}
          {showDepositDrawer && (
            <div className="absolute inset-0 z-50 bg-black/85 flex flex-col justify-end animate-in fade-in">
              <div className="bg-slate-900 border-t-2 border-amber-400/80 rounded-t-3xl p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowDepositDrawer(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h3 className="font-black text-base text-white">Depósito</h3>
                  </div>
                  <span className="text-xs font-bold text-amber-300">Fortune VIP</span>
                </div>

                {/* Current game balance indicator */}
                <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Saldo a utilizar atualmente no jogo</span>
                  <span className="text-sm font-black text-emerald-400">R$ {user.balance.toFixed(2)}</span>
                </div>

                {/* Tabs: Depósito online / Criptomoeda */}
                <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
                  <button
                    onClick={() => setDepositTab('online')}
                    className={`flex items-center gap-1.5 text-xs font-bold pb-1 transition-colors ${
                      depositTab === 'online' ? 'text-amber-300 border-b-2 border-amber-400' : 'text-slate-400'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Depósito online</span>
                  </button>
                  <button
                    onClick={() => setDepositTab('crypto')}
                    className={`text-xs font-bold pb-1 transition-colors ${
                      depositTab === 'crypto' ? 'text-amber-300 border-b-2 border-amber-400' : 'text-slate-400'
                    }`}
                  >
                    Criptomoeda
                  </button>
                </div>

                {/* Payment method: PIX (Quente) */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Método de Pagamento</span>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-[10px]">
                        ❖
                      </span>
                      <span className="text-xs font-bold text-white">PIX (Quente)</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">Imediato</span>
                  </div>
                </div>

                {/* Deposit Input Field */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1">Depósito</span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      R$
                    </span>
                    <input
                      type="number"
                      value={depositAmount}
                      onChange={e => setDepositAmount(Number(e.target.value))}
                      placeholder="Mínimo10~Máximo50.000"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-400 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder:text-slate-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Quick Presets Grid (Matches video 00:36) */}
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { val: 15, bonus: '' },
                    { val: 35, bonus: '+1,88' },
                    { val: 55, bonus: '+1,88' },
                    { val: 155, bonus: '+3,88' },
                    { val: 555, bonus: '+8,88' },
                    { val: 1555, bonus: '+18,88' },
                    { val: 5555, bonus: '+58,88' },
                    { val: 15555, bonus: '+88,88' }
                  ].map(preset => (
                    <button
                      key={preset.val}
                      onClick={() => setDepositAmount(preset.val)}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        depositAmount === preset.val
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-xs font-black block">{preset.val}</span>
                      {preset.bonus && (
                        <span className="text-[9px] text-amber-400 font-bold block">{preset.bonus}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Oferta de Depósito Banner */}
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-red-950 to-amber-950 border border-red-500/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold text-[11px]">
                    <Sparkles className="w-3.5 h-3.5 text-red-400" />
                    <span>Oferta de Depósito</span>
                  </div>
                  <span className="text-[10px] font-mono text-red-300 font-bold">10:44:12</span>
                </div>

                {/* Pix Simulated Action Button */}
                <button
                  onClick={handlePixSubmit}
                  disabled={pixGenerated}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {pixGenerated ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Confirmando Pix...</span>
                    </>
                  ) : (
                    <span>Deposite agora (R$ {depositAmount.toFixed(2)})</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ========================================================== */}
          {/* MODAL 5: PAYTABLE RULES                                    */}
          {/* ========================================================== */}
          {showPaytable && (
            <div className="absolute inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
              <div className="bg-slate-900 border border-amber-400/40 rounded-2xl p-5 max-w-sm w-full space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-black text-sm text-white flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    Valores dos Símbolos
                  </h4>
                  <button onClick={() => setShowPaytable(false)} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-slate-950 flex items-center gap-2">
                    <span className="text-2xl">🐰</span>
                    <div>
                      <p className="font-bold text-amber-300">WILD</p>
                      <p className="text-white font-black">200x</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    <div>
                      <p className="font-bold text-yellow-300">Coelho Ouro</p>
                      <p className="text-white font-black">100x</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 flex items-center gap-2">
                    <span className="text-2xl">🪙</span>
                    <div>
                      <p className="font-bold text-amber-300">Lingote</p>
                      <p className="text-white font-black">50x</p>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950 flex items-center gap-2">
                    <span className="text-2xl">🧧</span>
                    <div>
                      <p className="font-bold text-red-300">Envelope</p>
                      <p className="text-white font-black">10x</p>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 italic text-center">
                  RTP Teórico: {game.rtp} • PG Soft Certified
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
