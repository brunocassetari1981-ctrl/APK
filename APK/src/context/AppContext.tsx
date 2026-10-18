import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { UserProfile, SportEvent, BetSelection, PlacedBet, Transaction, AppTab, SelectionType } from '../types';
import { INITIAL_EVENTS } from '../data/sportsData';
import { sounds } from '../utils/audio';
import { fetchAllLiveAndOddsEvents, getSavedApiConfig } from '../services/liveSportsApi';

interface AppContextType {
  user: UserProfile;
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  events: SportEvent[];
  selectedSport: string;
  setSelectedSport: (sport: string) => void;
  // Live API Sync
  isLiveSyncing: boolean;
  lastSyncTime: Date | null;
  oddsSource: string;
  syncRealLiveGames: () => Promise<void>;
  // Betslip
  betslip: BetSelection[];
  stake: number;
  setStake: (val: number) => void;
  toggleSelection: (event: SportEvent, selection: SelectionType) => void;
  removeSelection: (eventId: string, selection: SelectionType) => void;
  clearBetslip: () => void;
  placeBet: () => { success: boolean; message: string };
  isSelectionInSlip: (eventId: string, selection: SelectionType) => boolean;
  // History
  placedBets: PlacedBet[];
  cashoutBet: (betId: string) => void;
  transactions: Transaction[];
  // Wallet operations
  depositPix: (amount: number) => void;
  withdrawPix: (amount: number, key: string, keyType: string) => { success: boolean; message: string };
  // Casino balance interactions
  chargeCasinoStake: (stake: number, gameName: string) => boolean;
  payoutCasinoWin: (payout: number, gameName: string) => void;
  // Toast & Audio
  toast: string | null;
  showToast: (msg: string) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
  resetDemoBalance: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

const USER_STORAGE_KEY = 'fortunego_profile_v1';
const BETS_STORAGE_KEY = 'fortunego_bets_v1';
const TXS_STORAGE_KEY = 'fortunego_txs_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AppTab>('home');
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toast, setToast] = useState<string | null>(null);

  // User Profile
  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
      id: 'usr-vip-101',
      username: 'apostador_vip',
      email: 'jogador@fortunego.com',
      balance: 150.0,
      bonus: 50.0,
      createdAt: new Date().toISOString()
    };
  });

  // Sports Events
  const [events, setEvents] = useState<SportEvent[]>(INITIAL_EVENTS);

  // Betslip
  const [betslip, setBetslip] = useState<BetSelection[]>([]);
  const [stake, setStake] = useState<number>(10);

  // Bets History
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>(() => {
    try {
      const saved = localStorage.getItem(BETS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'bet-demo-1',
        user_id: 'usr-vip-101',
        items: [
          {
            event: INITIAL_EVENTS[0],
            selection: 'home',
            odds: 1.85,
            label: 'Flamengo (Mandante)'
          }
        ],
        stake: 20,
        total_odds: 1.85,
        potential_payout: 37.0,
        status: 'pending',
        cashout_value: 26.5,
        created_at: new Date(Date.now() - 35 * 60000).toISOString()
      }
    ];
  });

  // Transactions
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(TXS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'tx-welcome',
        user_id: 'usr-vip-101',
        type: 'deposit',
        amount: 150.0,
        description: 'Bônus de Boas-Vindas PIX',
        status: 'completed',
        created_at: new Date(Date.now() - 60 * 60000).toISOString()
      }
    ];
  });

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } catch (e) {}
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem(BETS_STORAGE_KEY, JSON.stringify(placedBets));
    } catch (e) {}
  }, [placedBets]);

  useEffect(() => {
    try {
      localStorage.setItem(TXS_STORAGE_KEY, JSON.stringify(transactions));
    } catch (e) {}
  }, [transactions]);

  // Live API Sync State
  const [isLiveSyncing, setIsLiveSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [oddsSource, setOddsSource] = useState<string>('The Odds API');

  const syncRealLiveGames = async () => {
    setIsLiveSyncing(true);
    try {
      const cfg = getSavedApiConfig();
      const { events: freshEvents, source } = await fetchAllLiveAndOddsEvents(cfg.apiKey);
      if (freshEvents && freshEvents.length > 0) {
        setEvents(freshEvents);
        setLastSyncTime(new Date());
        setOddsSource(source);
        showToast(`Cotações reais atualizadas: ${freshEvents.length} partidas disponíveis!`);
      }
    } catch (err) {
      console.error('Failed to sync live sports:', err);
      showToast('Aviso: feed ao vivo atualizado com dados de contingência.');
    } finally {
      setIsLiveSyncing(false);
    }
  };

  // Initial load sync and periodic 30s auto-refresh
  useEffect(() => {
    syncRealLiveGames();
    const timer = setInterval(() => {
      syncRealLiveGames();
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Live match simulator: advance match minutes and simulate occasional score changes
  useEffect(() => {
    const interval = setInterval(() => {
      setEvents(prev =>
        prev.map(evt => {
          if (evt.status !== 'live' || !evt.minute) return evt;
          const nextMinute = evt.minute >= 90 ? 90 : evt.minute + 1;
          
          // Small chance of score update in live soccer
          let nextHomeScore = evt.home_score ?? 0;
          let nextAwayScore = evt.away_score ?? 0;
          
          if (Math.random() < 0.04 && nextMinute < 90 && evt.sport_id === 'futebol') {
            if (Math.random() > 0.5) {
              nextHomeScore += 1;
            } else {
              nextAwayScore += 1;
            }
          }

          return {
            ...evt,
            minute: nextMinute,
            home_score: nextHomeScore,
            away_score: nextAwayScore
          };
        })
      );
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  const toggleSoundState = () => {
    const next = sounds.toggleSound();
    setSoundEnabled(next);
  };

  const toggleSelection = (event: SportEvent, selection: SelectionType) => {
    let odds = 1.0;
    let label = '';

    switch (selection) {
      case 'home':
        odds = event.odds_home;
        label = `${event.home_team} (1)`;
        break;
      case 'draw':
        odds = event.odds_draw;
        label = 'Empate (X)';
        break;
      case 'away':
        odds = event.odds_away;
        label = `${event.away_team} (2)`;
        break;
      case 'over':
        odds = event.odds_over_25 ?? 1.85;
        label = 'Mais de 2.5 gols';
        break;
      case 'under':
        odds = event.odds_under_25 ?? 1.85;
        label = 'Menos de 2.5 gols';
        break;
      case 'btts_yes':
        odds = event.odds_btts_yes ?? 1.75;
        label = 'Ambas Marcam: Sim';
        break;
      case 'btts_no':
        odds = event.odds_btts_no ?? 1.95;
        label = 'Ambas Marcam: Não';
        break;
    }

    setBetslip(prev => {
      const exists = prev.find(item => item.event.id === event.id && item.selection === selection);
      if (exists) {
        return prev.filter(item => !(item.event.id === event.id && item.selection === selection));
      }
      sounds.playCoin();
      // Replace same event different selection or append
      const filtered = prev.filter(item => item.event.id !== event.id);
      return [...filtered, { event, selection, odds, label }];
    });
  };

  const removeSelection = (eventId: string, selection: SelectionType) => {
    setBetslip(prev => prev.filter(item => !(item.event.id === eventId && item.selection === selection)));
  };

  const clearBetslip = () => {
    setBetslip([]);
  };

  const isSelectionInSlip = (eventId: string, selection: SelectionType): boolean => {
    return betslip.some(item => item.event.id === eventId && item.selection === selection);
  };

  const placeBet = (): { success: boolean; message: string } => {
    if (betslip.length === 0) {
      return { success: false, message: 'Seu bilhete está vazio.' };
    }
    if (stake < 1) {
      return { success: false, message: 'O valor mínimo de aposta é R$ 1,00.' };
    }
    if (stake > user.balance) {
      return { success: false, message: 'Saldo insuficiente na carteira.' };
    }

    const totalOdds = Number(betslip.reduce((acc, item) => acc * item.odds, 1).toFixed(2));
    const potentialPayout = Number((stake * totalOdds).toFixed(2));

    const newBet: PlacedBet = {
      id: `bet-${Date.now()}`,
      user_id: user.id,
      items: [...betslip],
      stake,
      total_odds: totalOdds,
      potential_payout: potentialPayout,
      status: 'pending',
      cashout_value: Number((stake * 0.9).toFixed(2)),
      created_at: new Date().toISOString()
    };

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      user_id: user.id,
      type: 'bet',
      amount: -stake,
      description: `Aposta em ${betslip.length} seleção(ões) @ ${totalOdds}x`,
      status: 'completed',
      created_at: new Date().toISOString()
    };

    setUser(prev => ({ ...prev, balance: Number((prev.balance - stake).toFixed(2)) }));
    setPlacedBets(prev => [newBet, ...prev]);
    setTransactions(prev => [newTx, ...prev]);
    setBetslip([]);

    sounds.playBetPlaced();
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
    showToast('Aposta registrada com sucesso!');

    return { success: true, message: 'Aposta realizada!' };
  };

  const cashoutBet = (betId: string) => {
    const bet = placedBets.find(b => b.id === betId);
    if (!bet || bet.status !== 'pending') return;

    const cashoutAmount = bet.cashout_value ?? Number((bet.stake * 0.85).toFixed(2));

    setUser(prev => ({ ...prev, balance: Number((prev.balance + cashoutAmount).toFixed(2)) }));
    setPlacedBets(prev =>
      prev.map(b => (b.id === betId ? { ...b, status: 'cashed_out' } : b))
    );

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      user_id: user.id,
      type: 'win',
      amount: cashoutAmount,
      description: `Encerrar aposta (Cashout)`,
      status: 'completed',
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);

    sounds.playWin();
    showToast(`Cashout realizado! R$ ${cashoutAmount.toFixed(2)} creditados.`);
  };

  const depositPix = (amount: number) => {
    if (amount <= 0) return;
    setUser(prev => ({ ...prev, balance: Number((prev.balance + amount).toFixed(2)) }));
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      user_id: user.id,
      type: 'deposit',
      amount: amount,
      description: 'Depósito PIX Instantâneo',
      status: 'completed',
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
    sounds.playWin();
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
    showToast(`Depósito de R$ ${amount.toFixed(2)} confirmado via PIX!`);
  };

  const withdrawPix = (amount: number, key: string, keyType: string): { success: boolean; message: string } => {
    if (amount < 10) {
      return { success: false, message: 'O valor mínimo para saque via PIX é R$ 10,00.' };
    }
    if (amount > user.balance) {
      return { success: false, message: 'Saldo insuficiente para saque.' };
    }
    if (!key.trim()) {
      return { success: false, message: 'Por favor, informe sua chave PIX.' };
    }

    setUser(prev => ({ ...prev, balance: Number((prev.balance - amount).toFixed(2)) }));
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      user_id: user.id,
      type: 'withdraw',
      amount: -amount,
      description: `Saque PIX (${keyType}: ${key.slice(0, 4)}***)`,
      status: 'completed',
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
    sounds.playCoin();
    showToast(`Saque de R$ ${amount.toFixed(2)} enviado para sua chave PIX!`);
    return { success: true, message: 'Saque processado com sucesso.' };
  };

  const chargeCasinoStake = (casinoStake: number, gameName: string): boolean => {
    if (casinoStake <= 0 || casinoStake > user.balance) {
      showToast('Saldo insuficiente para este giro.');
      return false;
    }
    setUser(prev => ({ ...prev, balance: Number((prev.balance - casinoStake).toFixed(2)) }));
    return true;
  };

  const payoutCasinoWin = (payout: number, gameName: string) => {
    if (payout <= 0) return;
    setUser(prev => ({ ...prev, balance: Number((prev.balance + payout).toFixed(2)) }));
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      user_id: user.id,
      type: 'win',
      amount: payout,
      description: `Prêmio no jogo ${gameName}`,
      status: 'completed',
      created_at: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
    sounds.playWin();
    confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 } });
    showToast(`Você ganhou R$ ${payout.toFixed(2)} no ${gameName}! 🎉`);
  };

  const resetDemoBalance = () => {
    setUser({
      id: 'usr-vip-101',
      username: 'apostador_vip',
      email: 'jogador@fortunego.com',
      balance: 200.0,
      bonus: 50.0,
      createdAt: new Date().toISOString()
    });
    sounds.playWin();
    showToast('Saldo restaurado para R$ 200,00!');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        activeTab,
        setActiveTab,
        events,
        selectedSport,
        setSelectedSport,
        isLiveSyncing,
        lastSyncTime,
        oddsSource,
        syncRealLiveGames,
        betslip,
        stake,
        setStake,
        toggleSelection,
        removeSelection,
        clearBetslip,
        placeBet,
        isSelectionInSlip,
        placedBets,
        cashoutBet,
        transactions,
        depositPix,
        withdrawPix,
        chargeCasinoStake,
        payoutCasinoWin,
        toast,
        showToast,
        soundEnabled,
        toggleSound: toggleSoundState,
        resetDemoBalance
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
