import { SportEvent } from '../types';

export interface ApiProviderConfig {
  provider: 'the-odds-api' | 'espn' | 'api-football';
  apiKey: string;
  autoSync: boolean;
  syncIntervalSeconds: number;
  remainingRequests?: number;
  lastUsedBookmaker?: string;
}

const STORAGE_API_CONFIG = 'fortunego_api_config_v1';
export const DEFAULT_ODDS_API_KEY = '8ddfb066362e8d8ebd4d0e39fe0c54b3';

export const getSavedApiConfig = (): ApiProviderConfig => {
  try {
    const saved = localStorage.getItem(STORAGE_API_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.apiKey) parsed.apiKey = DEFAULT_ODDS_API_KEY;
      return parsed;
    }
  } catch (e) {}

  return {
    provider: 'the-odds-api',
    apiKey: DEFAULT_ODDS_API_KEY,
    autoSync: true,
    syncIntervalSeconds: 30
  };
};

export const saveApiConfig = (cfg: ApiProviderConfig) => {
  try {
    localStorage.setItem(STORAGE_API_CONFIG, JSON.stringify(cfg));
  } catch (e) {}
};

/**
 * Calculates in-play odds dynamically for live matches
 */
function generateInPlayOdds(homeScore: number, awayScore: number, minute: number) {
  const scoreDiff = homeScore - awayScore;
  let homeOdd = 2.10;
  let awayOdd = 3.20;
  let drawOdd = 3.10;

  if (scoreDiff > 0) {
    homeOdd = Math.max(1.08, 1.70 - (scoreDiff * 0.4) - (minute / 90) * 0.3);
    awayOdd = Math.max(2.50, 3.60 + (scoreDiff * 1.5) + (minute / 90) * 2.0);
    drawOdd = Math.max(2.20, 3.10 + (scoreDiff * 0.8));
  } else if (scoreDiff < 0) {
    const absDiff = Math.abs(scoreDiff);
    awayOdd = Math.max(1.08, 1.70 - (absDiff * 0.4) - (minute / 90) * 0.3);
    homeOdd = Math.max(2.50, 3.60 + (absDiff * 1.5) + (minute / 90) * 2.0);
    drawOdd = Math.max(2.20, 3.10 + (absDiff * 0.8));
  } else {
    drawOdd = Math.max(1.35, 3.00 - (minute / 90) * 1.4);
    homeOdd = Math.max(1.75, 2.30 + (minute / 90) * 0.6);
    awayOdd = Math.max(2.10, 2.80 + (minute / 90) * 0.8);
  }

  const totalGoals = homeScore + awayScore;
  const overOdd = totalGoals >= 3 ? 1.08 : Number((1.55 + (minute / 90) * 0.6).toFixed(2));
  const underOdd = totalGoals >= 3 ? 6.50 : Number((2.20 - (minute / 90) * 0.5).toFixed(2));

  return {
    home: Number(homeOdd.toFixed(2)),
    draw: Number(drawOdd.toFixed(2)),
    away: Number(awayOdd.toFixed(2)),
    over25: overOdd,
    under25: underOdd,
    bttsYes: homeScore > 0 && awayScore > 0 ? 1.05 : 1.85,
    bttsNo: homeScore > 0 && awayScore > 0 ? 7.50 : 1.95
  };
}

/**
 * Fetches real bookmaker odds directly from The Odds API (using the user's provided API key)
 */
export async function fetchTheOddsApiEvents(apiKey: string): Promise<SportEvent[]> {
  const sportsToFetch = [
    {
      key: 'soccer_brazil_campeonato',
      league: 'Brasileirão Série A',
      country: 'Brasil',
      sport_id: 'futebol',
      sport_name: 'Futebol'
    },
    {
      key: 'soccer_epl',
      league: 'Premier League',
      country: 'Inglaterra',
      sport_id: 'futebol',
      sport_name: 'Futebol'
    },
    {
      key: 'soccer_uefa_champs_league',
      league: 'UEFA Champions League',
      country: 'Europa',
      sport_id: 'futebol',
      sport_name: 'Futebol'
    },
    {
      key: 'basketball_nba',
      league: 'NBA',
      country: 'EUA',
      sport_id: 'basquete',
      sport_name: 'Basquete'
    }
  ];

  const results: SportEvent[] = [];

  const responses = await Promise.allSettled(
    sportsToFetch.map(async item => {
      const url = `https://api.the-odds-api.com/v4/sports/${item.key}/odds/?apiKey=${apiKey}&regions=eu,us&markets=h2h,totals`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      return { item, data };
    })
  );

  for (const resp of responses) {
    if (resp.status !== 'fulfilled') continue;
    const { item, data } = resp.value;
    if (!Array.isArray(data)) continue;

    for (const match of data) {
      try {
        const homeName = match.home_team;
        const awayName = match.away_team;

        // Find primary bookmaker (Pinnacle, Bet365, 1xBet, or first available)
        const bookmakers = match.bookmakers || [];
        const preferredBookmaker =
          bookmakers.find((b: any) => /pinnacle|bet365|1xbet|betfair/i.test(b.title)) ||
          bookmakers[0];

        let oddsHome = 2.0;
        let oddsDraw = 3.2;
        let oddsAway = 3.4;
        let oddsOver25 = 1.8;
        let oddsUnder25 = 1.95;

        if (preferredBookmaker) {
          const markets = preferredBookmaker.markets || [];
          // H2H (1X2) market
          const h2h = markets.find((m: any) => m.key === 'h2h');
          if (h2h && Array.isArray(h2h.outcomes)) {
            const hOutcome = h2h.outcomes.find((o: any) => o.name === homeName);
            const aOutcome = h2h.outcomes.find((o: any) => o.name === awayName);
            const dOutcome = h2h.outcomes.find((o: any) => o.name.toLowerCase() === 'draw');

            if (hOutcome?.price) oddsHome = Number(hOutcome.price.toFixed(2));
            if (aOutcome?.price) oddsAway = Number(aOutcome.price.toFixed(2));
            if (dOutcome?.price) oddsDraw = Number(dOutcome.price.toFixed(2));
          }

          // Totals (Over / Under 2.5) market
          const totals = markets.find((m: any) => m.key === 'totals');
          if (totals && Array.isArray(totals.outcomes)) {
            const over = totals.outcomes.find(
              (o: any) => o.name.toLowerCase() === 'over' && (o.point === 2.5 || !o.point)
            );
            const under = totals.outcomes.find(
              (o: any) => o.name.toLowerCase() === 'under' && (o.point === 2.5 || !o.point)
            );
            if (over?.price) oddsOver25 = Number(over.price.toFixed(2));
            if (under?.price) oddsUnder25 = Number(under.price.toFixed(2));
          }
        }

        // Format start time in Brazilian locale
        let startTimeLabel = 'Em Breve';
        if (match.commence_time) {
          const date = new Date(match.commence_time);
          const now = new Date();
          const isToday = date.toDateString() === now.toDateString();
          const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
          startTimeLabel = isToday
            ? `Hoje ${timeStr}`
            : `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} ${timeStr}`;
        }

        results.push({
          id: `oddsapi-${match.id}`,
          sport_id: item.sport_id,
          sport_name: item.sport_name,
          league: item.league,
          country: item.country,
          home_team: homeName,
          away_team: awayName,
          status: 'upcoming',
          start_time: startTimeLabel,
          odds_home: oddsHome,
          odds_draw: oddsDraw,
          odds_away: oddsAway,
          odds_over_25: oddsOver25,
          odds_under_25: oddsUnder25,
          odds_btts_yes: Number((oddsOver25 * 0.95).toFixed(2)),
          odds_btts_no: Number((oddsUnder25 * 1.05).toFixed(2)),
          hot: item.league === 'Brasileirão Série A' || item.league === 'UEFA Champions League'
        });
      } catch (err) {
        console.error('Error parsing The Odds API match:', err);
      }
    }
  }

  return results;
}

/**
 * Fetches real in-play games with live clock & scores from ESPN
 */
export async function fetchLiveEspnEvents(): Promise<SportEvent[]> {
  const endpoints = [
    {
      url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard',
      league: 'Brasileirão Série A',
      country: 'Brasil',
      sport_id: 'futebol',
      sport_name: 'Futebol'
    },
    {
      url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/uefa.champions/scoreboard',
      league: 'UEFA Champions League',
      country: 'Europa',
      sport_id: 'futebol',
      sport_name: 'Futebol'
    },
    {
      url: 'https://site.api.espn.com/apis/site/v2/sports/soccer/eng.1/scoreboard',
      league: 'Premier League',
      country: 'Inglaterra',
      sport_id: 'futebol',
      sport_name: 'Futebol'
    },
    {
      url: 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard',
      league: 'NBA',
      country: 'EUA',
      sport_id: 'basquete',
      sport_name: 'Basquete'
    }
  ];

  const results: SportEvent[] = [];

  const responses = await Promise.allSettled(
    endpoints.map(async ep => {
      const res = await fetch(ep.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { ep, data };
    })
  );

  for (const resp of responses) {
    if (resp.status !== 'fulfilled') continue;
    const { ep, data } = resp.value;
    const events = data.events || [];

    for (const evt of events) {
      try {
        const competition = evt.competitions?.[0];
        if (!competition) continue;

        const competitors = competition.competitors || [];
        const homeComp = competitors.find((c: any) => c.homeAway === 'home') || competitors[0];
        const awayComp = competitors.find((c: any) => c.homeAway === 'away') || competitors[1];

        if (!homeComp || !awayComp) continue;

        const homeName = homeComp.team?.displayName || homeComp.team?.name || 'Mandante';
        const awayName = awayComp.team?.displayName || awayComp.team?.name || 'Visitante';
        const homeScore = parseInt(homeComp.score || '0', 10);
        const awayScore = parseInt(awayComp.score || '0', 10);

        const statusType = evt.status?.type?.name || '';
        const isLive = statusType === 'STATUS_IN_PROGRESS' || statusType === 'STATUS_HALFTIME';
        const isFinished = statusType === 'STATUS_FINAL' || statusType === 'STATUS_FULL_TIME';

        let minute: number | undefined = undefined;
        if (isLive) {
          const displayClock = evt.status?.displayClock || '';
          const parsedMin = parseInt(displayClock, 10);
          minute = !isNaN(parsedMin) && parsedMin > 0 ? parsedMin : 42;
        }

        const inPlayOdds = generateInPlayOdds(homeScore, awayScore, minute || 0);

        let startTimeLabel = 'Hoje';
        if (evt.date) {
          const d = new Date(evt.date);
          startTimeLabel = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        }

        results.push({
          id: `espn-${evt.id}`,
          sport_id: ep.sport_id,
          sport_name: ep.sport_name,
          league: ep.league,
          country: ep.country,
          home_team: homeName,
          away_team: awayName,
          status: isLive ? 'live' : isFinished ? 'finished' : 'upcoming',
          minute,
          home_score: homeScore,
          away_score: awayScore,
          start_time: isLive ? 'Ao Vivo' : startTimeLabel,
          odds_home: inPlayOdds.home,
          odds_draw: inPlayOdds.draw,
          odds_away: inPlayOdds.away,
          odds_over_25: inPlayOdds.over25,
          odds_under_25: inPlayOdds.under25,
          odds_btts_yes: inPlayOdds.bttsYes,
          odds_btts_no: inPlayOdds.bttsNo,
          hot: isLive || ep.league === 'Brasileirão Série A'
        });
      } catch (err) {
        console.error('Error parsing ESPN event:', err);
      }
    }
  }

  return results;
}

/**
 * Unified sync: combines live in-play games (ESPN) + real bookmaker odds (The Odds API)
 */
export async function fetchAllLiveAndOddsEvents(apiKey?: string): Promise<{
  events: SportEvent[];
  source: string;
}> {
  const activeKey = apiKey || DEFAULT_ODDS_API_KEY;

  let oddsEvents: SportEvent[] = [];
  let espnEvents: SportEvent[] = [];

  // 1. Fetch real odds from The Odds API
  if (activeKey) {
    try {
      oddsEvents = await fetchTheOddsApiEvents(activeKey);
    } catch (e) {
      console.warn('Could not fetch from The Odds API:', e);
    }
  }

  // 2. Fetch live in-play events
  try {
    espnEvents = await fetchLiveEspnEvents();
  } catch (e) {
    console.warn('Could not fetch ESPN live events:', e);
  }

  // Combine: Live events first, followed by real bookmaker odds matches
  const liveMatches = espnEvents.filter(e => e.status === 'live');
  const finishedMatches = espnEvents.filter(e => e.status === 'finished');

  const combined: SportEvent[] = [];

  // Add live matches first
  combined.push(...liveMatches);

  // Add The Odds API matches (real bookmaker odds)
  if (oddsEvents.length > 0) {
    // Avoid duplicates by team name matching
    for (const oddEvt of oddsEvents) {
      const alreadyAdded = combined.some(
        c =>
          c.home_team.toLowerCase().includes(oddEvt.home_team.toLowerCase().slice(0, 4)) &&
          c.away_team.toLowerCase().includes(oddEvt.away_team.toLowerCase().slice(0, 4))
      );
      if (!alreadyAdded) {
        combined.push(oddEvt);
      }
    }
  }

  // Fallback to remaining ESPN upcoming if odds api returned few
  if (combined.length < 10) {
    const upcomingEspn = espnEvents.filter(e => e.status === 'upcoming');
    combined.push(...upcomingEspn);
  }

  // Add finished at end
  combined.push(...finishedMatches);

  const sourceName =
    oddsEvents.length > 0
      ? `The Odds API (${oddsEvents.length} cotações reais) + Radar Ao Vivo`
      : 'Radar Ao Vivo Integrado';

  return {
    events: combined,
    source: sourceName
  };
}
