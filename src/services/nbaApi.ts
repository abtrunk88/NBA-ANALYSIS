const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export interface Player {
  id: number;
  full_name: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  team?: string;
}

export interface SeasonStats {
  PLAYER_ID: number;
  GP: number;
  MIN: number;
  PTS: number;
  AST: number;
  REB: number;
  STL: number;
  BLK: number;
  FG3M: number;
  PRA: number;
  PA: number;
  PR: number;
  AR: number;
}

export interface GameLog {
  GAME_DATE: string;
  MATCHUP: string;
  WL: string;
  PTS: number;
  REB: number;
  AST: number;
  PRA: number;
  PA: number;
  PR: number;
}

export interface TrendResult {
  current_active_streak: number;
  total_hits: number;
  hit_rate_percent: number;
  message: string;
}

export interface TodayGame {
  gameId: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamId?: string;
  awayTeamId?: string;
  time: string;
  homeScore?: number;
  awayScore?: number;
  status: string;
  gameDate: string;
  isLive: boolean;
}

export interface VsTeamStats {
  GP: number;
  PTS: number;
  AST: number;
  REB: number;
  PRA: number;
  PA: number;
  PR: number;
  AR: number;
  STL: number;
  BLK: number;
  OPPONENT?: string;
}

export interface AbsencesImpact {
  home_total_penalty: number;
  away_total_penalty: number;
}

export interface ContextAnalysis {
  home_fatigue_penalty: number;
  home_fatigue_factors: string[];
  away_fatigue_penalty: number;
  away_fatigue_factors: string[];
}

export interface MatchPrediction {
  predicted_winner: string;
  predicted_margin: number;
  win_probability_home: number;
  predicted_total_points: number;
  confidence_level?: string; // Optionnel selon ton backend
  
  // Le nouveau champ clé du Backend v1.7
  math_breakdown: {
    base_spread: { value: number; desc: string };
    fatigue_adjust: { value: number; desc: string };
    absences_adjust: { value: number; desc: string };
    final_spread: number;
  };
  
  context_analysis: {
    home_fatigue_factors: string[];
    away_fatigue_factors: string[];
  };
  
  details: {
    spread_raw: number;
    home_net_rtg?: number; // Si dispo
    away_net_rtg?: number; // Si dispo
  };
}

export interface PlayerProjection {
  player_id: number;
  player_name: string;
  opponent_team: string;
  projected_pts: number;
  projected_reb: number;
  projected_ast: number;
  season_avg_pts: number;
  season_avg_reb: number;
  season_avg_ast: number;
  pace: number;
  opponent_defense_rating: number;
}

export interface PlayerStats {
  games: number;
  win_percentage: number;
  ppg: number;
  status: string;
}

export interface MissingPlayerAnalysis {
  player_id: number;
  player_name: string;
  team: string;
  stats_with: PlayerStats;
  stats_without: PlayerStats;
}

export interface PlayerPredictedStats {
  PTS: number;
  REB: number;
  AST: number;
  MIN: number;
  FG3M: number;
  STL?: number;
  BLK?: number;
  PTS_RANGE?: string;
}

export interface AdvancedMetricsProjected {
  PRA: number;
}

export interface BlowoutAnalysis {
  risk_level: "LOW" | "HIGH" | "MEDIUM";
  message?: string;
  margin?: number;
}

export interface MatchupAnalysis {
  paint_vulnerability?: number;
  [key: string]: any;
}

export interface PlayerContext {
  boost_applied: string;
  blowout_penalty?: string;
  form_weight?: string;
  reasoning?: string;
}

export interface PlayerFullPrediction {
  player: string;
  position?: string;
  player_id: number;
  team: string;
  predicted_stats: PlayerPredictedStats;
  advanced_metrics_projected: AdvancedMetricsProjected;
  matchup_analysis?: {
    defensive_rating?: number;
    rank?: number;
    description?: string;
  };
  context?: PlayerContext;
  blowout_analysis: BlowoutAnalysis;
}

export interface MatchContext {
  home_usage_boost: number;
  away_usage_boost: number;
  home_absent_count?: number;
  away_absent_count?: number;
  status?: string;
}

export interface FullMatchPrediction {
  home_players: PlayerFullPrediction[];
  away_players: PlayerFullPrediction[];
  blowout_analysis?: {
    risk_level: "LOW" | "HIGH" | "MEDIUM";
  };
}

export interface InteractiveMatchPrediction {
  match_context: MatchContext;
  home_players: PlayerFullPrediction[];
  away_players: PlayerFullPrediction[];
}

// --- NOUVELLES INTERFACES POUR LE POPUP CORRIGÉ ---

export interface RecentFormAvg {
  PTS: number;
  REB: number;
  AST: number;
  PRA: number;
  // AJOUTEZ CES DEUX LIGNES :
  STL?: number;
  BLK?: number;
  
  PA?: number; 
  PR?: number;
  MIN?: number;
  GP?: number;
  [key: string]: number | undefined;
}

export interface H2HAvg {
  GP: number;
  PTS: number;
  REB: number;
  AST: number;
  // AJOUTEZ CES DEUX LIGNES :
  STL?: number;
  BLK?: number;
  
  PRA: number;
  PR: number;
  PA: number;
  AR: number;
  [key: string]: number | undefined | string; // Pour gérer "message" si présent
}

export interface SeasonTrend {
  threshold: number;
  hit_rate: number;
  message: string;
}

// Mise à jour de PlayerDetailsHistory pour correspondre à la réponse du backend
export interface PlayerDetailsHistory {
  // L'API renvoie maintenant des objets de moyennes, plus des tableaux
  recent_form_avg: RecentFormAvg;
  h2h_avg: H2HAvg;
  season_trend?: SeasonTrend;
  
  // On garde ces champs optionnels au cas où vous utiliseriez encore l'ancienne version quelque part
  recent_form?: any[]; 
  h2h_history?: any[];
}

export interface PlayerPopupData {
  recent_form_avg: RecentFormAvg;
  h2h_avg: H2HAvg;
  season_trend: SeasonTrend;
}

export interface CalculatorResult {
  stat: string;
  line: number;
  projection: number;
  probability_over: number;
  probability_under: number;
  advice: string;
  color_code: string;
  probability?: number;
  recommendation?: string;
  confidence?: string;
}

export const nbaApi = {
  async get48hGames(): Promise<TodayGame[]> {
    const response = await fetch(`${API_BASE_URL}/games/30h`);
    if (!response.ok) throw new Error("Failed to fetch games");
    return response.json();
  },

  async searchPlayers(query: string): Promise<Player[]> {
    const response = await fetch(`${API_BASE_URL}/players/search?query=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error("Failed to search players");
    return response.json();
  },

  async getTeamRoster(teamId: string): Promise<Player[]> {
    const response = await fetch(`${API_BASE_URL}/team/${teamId}/roster`);
    if (!response.ok) throw new Error("Failed to fetch team roster");
    return response.json();
  },

  async getPlayerSeason(playerId: number): Promise<SeasonStats> {
    const response = await fetch(`${API_BASE_URL}/player/${playerId}/season`);
    if (!response.ok) throw new Error("Failed to fetch player season stats");
    return response.json();
  },

  async getPlayerRecent(playerId: number, limit: number = 10): Promise<GameLog[]> {
    const response = await fetch(`${API_BASE_URL}/player/${playerId}/recent?limit=${limit}`);
    if (!response.ok) throw new Error("Failed to fetch recent games");
    return response.json();
  },

  async getPlayerVsTeam(playerId: number, teamCode: string): Promise<VsTeamStats> {
    const response = await fetch(`${API_BASE_URL}/player/${playerId}/vs/${teamCode}`);
    if (!response.ok) throw new Error("Failed to fetch vs team stats");
    return response.json();
  },

  async analyzeTrend(playerId: number, stat: string, threshold: number): Promise<TrendResult> {
    const response = await fetch(
      `${API_BASE_URL}/player/${playerId}/trend?stat=${stat}&threshold=${threshold}`
    );
    if (!response.ok) throw new Error("Failed to analyze trend");
    return response.json();
  },

  async predictMatch(
    homeTeamId: string,
    awayTeamId: string,
    homeMissingPlayerIds?: number[],
    awayMissingPlayerIds?: number[]
  ): Promise<MatchPrediction> {
    const params = new URLSearchParams();
    if (homeMissingPlayerIds && homeMissingPlayerIds.length > 0) {
      homeMissingPlayerIds.forEach(id => params.append("home_missing_players", id.toString()));
    }
    if (awayMissingPlayerIds && awayMissingPlayerIds.length > 0) {
      awayMissingPlayerIds.forEach(id => params.append("away_missing_players", id.toString()));
    }
    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${API_BASE_URL}/predict/match/${homeTeamId}/${awayTeamId}${queryString}`);
    if (!response.ok) throw new Error("Failed to predict match");
    return response.json();
  },

  async predictPlayerStats(
    playerId: number,
    opponentTeamId: string
  ): Promise<PlayerProjection> {
    const response = await fetch(`${API_BASE_URL}/predict/player/${playerId}/vs/${opponentTeamId}`);
    if (!response.ok) throw new Error("Failed to predict player stats");
    return response.json();
  },

  async analyzeMissingPlayer(
    teamCode: string,
    playerId: number
  ): Promise<MissingPlayerAnalysis> {
    const response = await fetch(`${API_BASE_URL}/analytics/team/${teamCode}/missing-player/${playerId}`);
    if (!response.ok) throw new Error("Failed to analyze missing player impact");
    return response.json();
  },

  async getFullMatchPrediction(
    homeTeamId: string,
    awayTeamId: string
  ): Promise<FullMatchPrediction> {
    const response = await fetch(`${API_BASE_URL}/predict/full-match/${homeTeamId}/${awayTeamId}`);
    if (!response.ok) throw new Error("Failed to fetch full match prediction");
    return response.json();
  },

  async getFullMatchPredictionWithAbsents(
    homeTeamId: string,
    awayTeamId: string,
    homeAbsentIds?: number[],
    awayAbsentIds?: number[]
  ): Promise<InteractiveMatchPrediction> {
    const params = new URLSearchParams();
    // Correction : Ajout du repos par défaut
    params.append("home_rest", "1");
    params.append("away_rest", "1");
    
    if (homeAbsentIds && homeAbsentIds.length > 0) {
      homeAbsentIds.forEach(id => params.append("home_absent", id.toString()));
    }
    if (awayAbsentIds && awayAbsentIds.length > 0) {
      awayAbsentIds.forEach(id => params.append("away_absent", id.toString()));
    }
    const queryString = params.toString() ? `?${params.toString()}` : "";
    const response = await fetch(`${API_BASE_URL}/predict/full-match/${homeTeamId}/${awayTeamId}${queryString}`);
    if (!response.ok) throw new Error("Failed to fetch interactive match prediction");
    return response.json();
  },

  async getPlayerDeepAnalytics(
    playerId: number,
    opponentTeamId: string
  ): Promise<PlayerProjection> {
    const response = await fetch(`${API_BASE_URL}/predict/deep-analytics/${playerId}/vs/${opponentTeamId}`);
    if (!response.ok) throw new Error("Failed to fetch player deep analytics");
    return response.json();
  },

  // CORRECTION CRITIQUE : Pointe maintenant vers l'endpoint qui marche (/popup)
  async getPlayerDetailsHistory(
    playerId: number,
    opponentTeamId: string
  ): Promise<PlayerDetailsHistory> {
    const response = await fetch(`${API_BASE_URL}/analysis/player/${playerId}/popup/${opponentTeamId}`);
    if (!response.ok) throw new Error("Failed to fetch player details history");
    return response.json();
  },

  async getCalculatorAnalysis(
    projection: number,
    line: number,
    statCategory: string
  ): Promise<CalculatorResult> {
    const response = await fetch(
      `${API_BASE_URL}/predict/calculator?projection=${projection}&line=${line}&stat_category=${statCategory}`
    );
    if (!response.ok) throw new Error("Failed to fetch calculator analysis");
    return response.json();
  },

  async getPlayerPopupData(
    playerId: number,
    opponentTeamId: string
  ): Promise<PlayerPopupData> {
    const response = await fetch(
      `${API_BASE_URL}/analysis/player/${playerId}/popup/${opponentTeamId}`
    );
    if (!response.ok) throw new Error("Failed to fetch player popup data");
    return response.json();
  },
};
