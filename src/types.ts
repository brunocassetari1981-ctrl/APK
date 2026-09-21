export interface UserProfile {
  id: string;
  username: string;
  email: string;
  balance: number;
  bonus: number;
  createdAt: string;
}

export interface Sport {
  id: string;
  name: string;
  icon: string;
  slug: string;
  count: number;
}

export type SelectionType = 'home' | 'draw' | 'away' | 'over' | 'under' | 'btts_yes' | 'btts_no';

export interface SportEvent {
  id: string;
  sport_id: string;
  sport_name: string;
  league: string;
  country: string;
  home_team: string;
  away_team: string;
  status: 'live' | 'upcoming' | 'finished';
  minute?: number;
  home_score?: number;
  away_score?: number;
  start_time: string;
  odds_home: number;
  odds_draw: number;
  odds_away: number;
  odds_over_25?: number;
  odds_under_25?: number;
  odds_btts_yes?: number;
  odds_btts_no?: number;
  hot?: boolean;
}

export interface BetSelection {
  event: SportEvent;
  selection: SelectionType;
  odds: number;
  label: string;
}

export interface PlacedBet {
  id: string;
  user_id: string;
  items: BetSelection[];
  stake: number;
  total_odds: number;
  potential_payout: number;
  status: 'pending' | 'won' | 'lost' | 'cashed_out';
  cashout_value?: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win' | 'casino';
  amount: number;
  description: string;
  status: 'completed' | 'pending';
  created_at: string;
}

export type CasinoCategory = 'all' | 'slots' | 'crash' | 'mines' | 'roulette';

export interface CasinoGame {
  id: string;
  name: string;
  studio: 'PG' | 'WG' | 'Original';
  category: 'slots' | 'crash' | 'mines' | 'roulette';
  gradient: string;
  accent: string;
  rtp: string;
  iconType: string;
  isHot?: boolean;
  minBet: number;
  maxBet: number;
}

export type AppTab = 'home' | 'live' | 'casino' | 'wallet' | 'history';
