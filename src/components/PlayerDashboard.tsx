import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { nbaApi, Player } from "@/services/nbaApi";
import { TrendingUp, Activity, Target, AlertCircle } from "lucide-react";
import { useState } from "react";
import { PlayerProjectionCard } from "./PlayerProjectionCard";
import { getTeamCode } from "@/lib/teamMapping";

interface PlayerDashboardProps {
  player: Player;
}

export function PlayerDashboard({ player }: PlayerDashboardProps) {
  const [vsTeamInput, setVsTeamInput] = useState("");
  const [searchedTeam, setSearchedTeam] = useState<string | null>(null);
  const [trendStat, setTrendStat] = useState("PTS");
  const [trendThreshold, setTrendThreshold] = useState("");
  const [showImpactAnalyzer, setShowImpactAnalyzer] = useState(false);

  const { data: seasonStats, isLoading: seasonLoading } = useQuery({
    queryKey: ["player-season", player.id],
    queryFn: () => nbaApi.getPlayerSeason(player.id),
  });

  const { data: recentGames, isLoading: recentLoading } = useQuery({
    queryKey: ["player-recent", player.id],
    queryFn: () => nbaApi.getPlayerRecent(player.id, 10),
  });

  const { data: vsTeamStats, isLoading: vsTeamLoading } = useQuery({
    queryKey: ["player-vs-team", player.id, searchedTeam],
    queryFn: () => nbaApi.getPlayerVsTeam(player.id, searchedTeam!),
    enabled: searchedTeam !== null && searchedTeam !== undefined && searchedTeam !== "",
  });

  const { data: trendResult, refetch: analyzeTrend, isFetching: trendLoading } = useQuery({
    queryKey: ["player-trend", player.id, trendStat, trendThreshold],
    queryFn: () => nbaApi.analyzeTrend(player.id, trendStat, parseFloat(trendThreshold)),
    enabled: false,
  });

  const { data: missingPlayerAnalysis, isLoading: impactLoading } = useQuery({
    queryKey: ["missing-player-analysis", player.id, player.team],
    queryFn: () => {
      const teamCode = player.team ? getTeamCode(player.team) : "";
      if (!teamCode) throw new Error("Team code not found");
      return nbaApi.analyzeMissingPlayer(teamCode, player.id);
    },
    enabled: showImpactAnalyzer && !!player.team,
  });

  const handleVsTeamSearch = () => {
    const teamCode = vsTeamInput.trim().toUpperCase();
    if (teamCode) {
      setSearchedTeam(teamCode);
    }
  };

  const handleTrendAnalysis = () => {
    if (trendThreshold) {
      analyzeTrend();
    }
  };

  // Helper pour vérifier si on a des données valides à afficher pour VS Team
  const hasVsStats = vsTeamStats && typeof vsTeamStats === 'object';
  const hasGamesPlayed = hasVsStats && (vsTeamStats.GP > 0);

  // --- CALCUL DES MOYENNES SUR LES 7 DERNIERS MATCHS ---
  // On prend les 7 premiers matchs de la liste récente (qui en contient 10)
  const last7Games = recentGames ? recentGames.slice(0, 7) : [];
  const has7Games = last7Games.length > 0;
  
  const avg7 = has7Games ? {
    PTS: last7Games.reduce((acc, game) => acc + game.PTS, 0) / last7Games.length,
    REB: last7Games.reduce((acc, game) => acc + game.REB, 0) / last7Games.length,
    AST: last7Games.reduce((acc, game) => acc + game.AST, 0) / last7Games.length,
    PRA: last7Games.reduce((acc, game) => acc + game.PRA, 0) / last7Games.length,
    PA: last7Games.reduce((acc, game) => acc + game.PA, 0) / last7Games.length,
    PR: last7Games.reduce((acc, game) => acc + game.PR, 0) / last7Games.length,
  } : null;

  return (
    <div className="space-y-6">
      {/* Player Summary Card - Dark Theme */}
      <Card className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-700/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-cyan-400" />
            <div>
              <h2 className="text-3xl font-display font-bold text-white">{player.full_name}</h2>
              {player.team && <p className="text-sm text-slate-400 mt-1">{player.team}</p>}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {seasonLoading ? (
            <p className="text-slate-400 text-center">Loading season stats...</p>
          ) : seasonStats ? (
            <div className="space-y-6">

              {/* --- SECTION 1: MOYENNES SAISON --- */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">MOYENNES SAISON</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center bg-amber-500/20 border border-amber-500/30 p-4 rounded-lg">
                    <p className="text-4xl font-display font-bold text-amber-300">{seasonStats.PTS.toFixed(1)}</p>
                    <p className="text-sm text-slate-400 mt-1 font-semibold">PTS</p>
                  </div>
                  <div className="text-center bg-blue-500/20 border border-blue-500/30 p-4 rounded-lg">
                    <p className="text-4xl font-display font-bold text-blue-300">{seasonStats.REB.toFixed(1)}</p>
                    <p className="text-sm text-slate-400 mt-1 font-semibold">REB</p>
                  </div>
                  <div className="text-center bg-emerald-500/20 border border-emerald-500/30 p-4 rounded-lg">
                    <p className="text-4xl font-display font-bold text-emerald-300">{seasonStats.AST.toFixed(1)}</p>
                    <p className="text-sm text-slate-400 mt-1 font-semibold">AST</p>
                  </div>
                  <div className="text-center bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                    <p className="text-4xl font-display font-bold text-slate-200">{seasonStats.FG3M.toFixed(1)}</p>
                    <p className="text-sm text-slate-400 mt-1 font-semibold">3PM</p>
                  </div>
                  <div className="text-center bg-slate-700/50 border border-slate-600/50 p-4 rounded-lg">
                    <p className="text-4xl font-display font-bold text-slate-200">{seasonStats.MIN.toFixed(1)}</p>
                    <p className="text-sm text-slate-400 mt-1 font-semibold">MIN</p>
                  </div>
                </div>
              </div>

              {/* --- SECTION 2: COMBOS PARIS SPORTIFS --- */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">COMBOS PARIS SPORTIFS</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center bg-gradient-to-br from-purple-500/20 to-purple-500/5 p-4 rounded-lg border border-purple-500/30">
                    <p className="text-3xl font-display font-bold text-purple-300">{seasonStats.PRA.toFixed(1)}</p>
                    <p className="text-sm text-slate-400 mt-1 font-semibold">PTS+REB+AST</p>
                  </div>
                  <div className="text-center bg-gradient-to-br from-pink-500/20 to-pink-500/5 p-4 rounded-lg border border-pink-500/30">
                    <p className="text-3xl font-display font-bold text-pink-300">{seasonStats.PA.toFixed(1)}</p>
                    <p className="text-sm text-slate-400 mt-1 font-semibold">PTS+AST</p>
                  </div>
                  <div className="text-center bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 p-4 rounded-lg border border-indigo-500/30">
                    <p className="text-3xl font-display font-bold text-indigo-300">{seasonStats.PR.toFixed(1)}</p>
                    <p className="text-sm text-slate-400 mt-1 font-semibold">PTS+REB</p>
                  </div>
                  <div className="text-center bg-slate-700/50 p-4 rounded-lg border border-slate-600/50">
                    <p className="text-3xl font-display font-bold text-slate-200">{seasonStats.AR.toFixed(1)}</p>
                    <p className="text-sm text-slate-400 mt-1 font-semibold">AST+REB</p>
                  </div>
                </div>
              </div>

              {/* --- NOUVELLE SECTION: FORME RECENTE (7 MATCHS) --- */}
              {avg7 && (
                <div>
                  <h3 className="text-sm font-semibold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    FORME RÉCENTE (7 DERNIERS MATCHS)
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="text-center bg-amber-500/20 border border-amber-500/30 p-3 rounded-lg">
                      <p className="text-2xl font-display font-bold text-amber-300">{avg7.PTS.toFixed(1)}</p>
                      <p className="text-xs text-slate-400 mt-1 font-bold">PTS</p>
                    </div>
                    <div className="text-center bg-blue-500/20 border border-blue-500/30 p-3 rounded-lg">
                      <p className="text-2xl font-display font-bold text-blue-300">{avg7.REB.toFixed(1)}</p>
                      <p className="text-xs text-slate-400 mt-1 font-bold">REB</p>
                    </div>
                    <div className="text-center bg-emerald-500/20 border border-emerald-500/30 p-3 rounded-lg">
                      <p className="text-2xl font-display font-bold text-emerald-300">{avg7.AST.toFixed(1)}</p>
                      <p className="text-xs text-slate-400 mt-1 font-bold">AST</p>
                    </div>
                    <div className="text-center bg-purple-500/20 border border-purple-500/30 p-3 rounded-lg">
                      <p className="text-2xl font-display font-bold text-purple-300">{avg7.PRA.toFixed(1)}</p>
                      <p className="text-xs text-slate-400 mt-1 font-bold">PRA</p>
                    </div>
                    <div className="text-center bg-pink-500/20 border border-pink-500/30 p-3 rounded-lg">
                      <p className="text-2xl font-display font-bold text-pink-300">{avg7.PA.toFixed(1)}</p>
                      <p className="text-xs text-slate-400 mt-1 font-bold">PA</p>
                    </div>
                     <div className="text-center bg-indigo-500/20 border border-indigo-500/30 p-3 rounded-lg">
                      <p className="text-2xl font-display font-bold text-indigo-300">{avg7.PR.toFixed(1)}</p>
                      <p className="text-xs text-slate-400 mt-1 font-bold">PR</p>
                    </div>
                  </div>
                </div>
              )}

              {/* --- SECTION 3: STATS ADDITIONNELLES --- */}
              <div>
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">STATS ADDITIONNELLES (SAISON)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center bg-slate-700/50 border border-slate-600/50 p-3 rounded-lg">
                    <p className="text-2xl font-display font-bold text-slate-200">{seasonStats.STL.toFixed(1)}</p>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">STL</p>
                  </div>
                  <div className="text-center bg-slate-700/50 border border-slate-600/50 p-3 rounded-lg">
                    <p className="text-2xl font-display font-bold text-slate-200">{seasonStats.BLK.toFixed(1)}</p>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">BLK</p>
                  </div>
                  <div className="text-center bg-slate-700/50 border border-slate-600/50 p-3 rounded-lg">
                    <p className="text-2xl font-display font-bold text-slate-200">{seasonStats.GP}</p>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">GP</p>
                  </div>
                  <div className="text-center bg-slate-700/50 border border-slate-600/50 p-3 rounded-lg">
                    <p className="text-2xl font-display font-bold text-slate-200">{seasonStats.MIN.toFixed(1)}</p>
                    <p className="text-xs text-slate-400 mt-1 font-semibold">MIN</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="recent" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800/50 border-slate-700/50">
          <TabsTrigger value="recent" className="text-slate-300 data-[state=active]:text-white">Matchs Récents</TabsTrigger>
          <TabsTrigger value="vs" className="text-slate-300 data-[state=active]:text-white">Vs Adversaire</TabsTrigger>
          <TabsTrigger value="trend" className="text-slate-300 data-[state=active]:text-white">Analyseur de Streak</TabsTrigger>
          <TabsTrigger value="impact" onClick={() => setShowImpactAnalyzer(true)} className="text-slate-300 data-[state=active]:text-white">Impact Analyzer</TabsTrigger>
        </TabsList>

        {/* Tab 1: Recent Games */}
        <TabsContent value="recent">
          <Card className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Activity className="h-5 w-5 text-cyan-400" />
                Derniers Matchs
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <p className="text-slate-400 text-center">Loading recent games...</p>
              ) : recentGames && recentGames.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700/50">
                        <TableHead className="text-slate-400">Date</TableHead>
                        <TableHead className="text-slate-400">Matchup</TableHead>
                        <TableHead className="text-center text-slate-400">W/L</TableHead>
                        <TableHead className="text-center text-slate-400">PTS</TableHead>
                        <TableHead className="text-center text-slate-400">REB</TableHead>
                        <TableHead className="text-center text-slate-400">AST</TableHead>
                        <TableHead className="text-center font-bold text-slate-400">PRA</TableHead>
                        <TableHead className="text-center font-bold text-slate-400">PA</TableHead>
                        <TableHead className="text-center font-bold text-slate-400">PR</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentGames.map((game, idx) => (
                        <TableRow key={idx} className="hover:bg-slate-800/50 transition-colors border-slate-700/50">
                          <TableCell className="font-medium text-slate-300">{game.GAME_DATE}</TableCell>
                          <TableCell className="font-medium text-slate-300">{game.MATCHUP}</TableCell>
                          <TableCell className="text-center">
                            <span className={`font-bold ${game.WL === "W" ? "text-emerald-400" : "text-red-400"}`}>
                              {game.WL}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-amber-300 font-bold text-lg">{game.PTS}</span>
                          </TableCell>
                          <TableCell className="text-center text-blue-300 font-semibold">{game.REB}</TableCell>
                          <TableCell className="text-center text-emerald-300 font-semibold">{game.AST}</TableCell>
                          <TableCell className="text-center">
                            <span className="text-purple-300 font-bold text-lg">{game.PRA}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-pink-300 font-bold text-lg">{game.PA}</span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-indigo-300 font-bold text-lg">{game.PR}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-slate-400 text-center">No recent games found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Vs Team */}
        <TabsContent value="vs">
          <Card className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Target className="h-5 w-5 text-cyan-400" />
                Stats Contre une Équipe
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-6">
                <Input
                  type="text"
                  placeholder="Ex: LAL, GSW, BOS..."
                  value={vsTeamInput}
                  onChange={(e) => setVsTeamInput(e.target.value.toUpperCase())}
                  onKeyPress={(e) => e.key === "Enter" && handleVsTeamSearch()}
                  className="flex-1 bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-500"
                />
                <Button onClick={handleVsTeamSearch} disabled={vsTeamLoading || !vsTeamInput.trim()} className="bg-cyan-600 hover:bg-cyan-700">
                  {vsTeamLoading ? "Chargement..." : "Rechercher"}
                </Button>
              </div>

              {searchedTeam && (
                <PlayerProjectionCard
                  player={player}
                  opponentTeamCode={searchedTeam}
                  opponentTeamName={vsTeamStats?.OPPONENT || searchedTeam}
                />
              )}

              {vsTeamLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-3"></div>
                  <p className="text-slate-400">Chargement des statistiques...</p>
                </div>
              ) : hasVsStats ? (
                hasGamesPlayed ? (
                  <div className="space-y-6">
                    <div className="text-center mb-6">
                      <h3 className="text-2xl font-display font-bold text-white">
                        Moyennes contre {vsTeamStats.OPPONENT || searchedTeam}
                      </h3>
                      <p className="text-sm text-slate-400 mt-1">sur {vsTeamStats.GP} matchs</p>
                    </div>

                    {/* Individual Stats */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">STATS INDIVIDUELLES</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="text-center bg-amber-500/20 border border-amber-500/30 p-6 rounded-lg">
                          <p className="text-4xl font-display font-bold text-amber-300">{vsTeamStats.PTS?.toFixed(1) ?? '0.0'}</p>
                          <p className="text-sm text-slate-400 mt-2 font-medium">Points (PTS)</p>
                        </div>
                        <div className="text-center bg-blue-500/20 border border-blue-500/30 p-6 rounded-lg">
                          <p className="text-4xl font-display font-bold text-blue-300">{vsTeamStats.REB?.toFixed(1) ?? '0.0'}</p>
                          <p className="text-sm text-slate-400 mt-2 font-medium">Rebounds (REB)</p>
                        </div>
                        <div className="text-center bg-emerald-500/20 border border-emerald-500/30 p-6 rounded-lg">
                          <p className="text-4xl font-display font-bold text-emerald-300">{vsTeamStats.AST?.toFixed(1) ?? '0.0'}</p>
                          <p className="text-sm text-slate-400 mt-2 font-medium">Assists (AST)</p>
                        </div>
                      </div>
                    </div>

                    {/* Combo Stats */}
                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">COMBOS PARIS SPORTIFS</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center bg-gradient-to-br from-purple-500/20 to-purple-500/5 p-6 rounded-lg border border-purple-500/30">
                          <p className="text-3xl font-display font-bold text-purple-300">{vsTeamStats.PRA?.toFixed(1) ?? '0.0'}</p>
                          <p className="text-sm text-slate-400 mt-2 font-medium">PTS+REB+AST</p>
                        </div>
                        <div className="text-center bg-gradient-to-br from-pink-500/20 to-pink-500/5 p-6 rounded-lg border border-pink-500/30">
                          <p className="text-3xl font-display font-bold text-pink-300">{vsTeamStats.PA?.toFixed(1) ?? '0.0'}</p>
                          <p className="text-sm text-slate-400 mt-2 font-medium">PTS+AST</p>
                        </div>
                        <div className="text-center bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 p-6 rounded-lg border border-indigo-500/30">
                          <p className="text-3xl font-display font-bold text-indigo-300">{vsTeamStats.PR?.toFixed(1) ?? '0.0'}</p>
                          <p className="text-sm text-slate-400 mt-2 font-medium">PTS+REB</p>
                        </div>
                         {/* AR: AST + REB */}
                        <div className="text-center bg-slate-700/50 p-6 rounded-lg border border-slate-600/50">
                          <p className="text-3xl font-display font-bold text-slate-200">{vsTeamStats.AR?.toFixed(1) ?? '0.0'}</p>
                          <p className="text-sm text-slate-400 mt-2 font-medium">AST+REB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <p className="text-slate-400 text-center">Aucune donnée trouvée contre l'équipe {searchedTeam}.</p>
                  </div>
                )
              ) : searchedTeam ? (
                // Cas d'attente ou erreur silencieuse
                <div className="flex flex-col items-center justify-center py-12">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-3"></div>
                   <p className="text-slate-400 text-center">Recherche en cours...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-slate-400 text-center">Entrez un code d'équipe (ex: LAL, GSW) pour rechercher</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Trend Analysis */}
        <TabsContent value="trend">
          <Card className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
                Analyseur de Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Stat</label>
                    <Select value={trendStat} onValueChange={setTrendStat}>
                      <SelectTrigger className="bg-slate-800/50 border-slate-700/50 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="PTS">Points</SelectItem>
                        <SelectItem value="REB">Rebounds</SelectItem>
                        <SelectItem value="AST">Assists</SelectItem>
                        <SelectItem value="PRA">PTS+REB+AST</SelectItem>
                        <SelectItem value="PA">PTS+AST</SelectItem>
                        <SelectItem value="PR">PTS+REB</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Seuil</label>
                    <Input
                      type="number"
                      placeholder="Ex: 25.5"
                      value={trendThreshold}
                      onChange={(e) => setTrendThreshold(e.target.value)}
                      step="0.5"
                      className="bg-slate-800/50 border-slate-700/50 text-white placeholder-slate-500"
                    />
                  </div>
                </div>
                <Button onClick={handleTrendAnalysis} disabled={!trendThreshold || trendLoading} className="w-full bg-cyan-600 hover:bg-cyan-700">
                  {trendLoading ? "Analyse en cours..." : "Analyser"}
                </Button>
              </div>

              {trendResult && (
                <div className="bg-cyan-500/20 border border-cyan-500/30 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-cyan-300">{trendResult.current_active_streak}</p>
                      <p className="text-xs text-slate-400 mt-1">Current Streak</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-300">{trendResult.total_hits}</p>
                      <p className="text-xs text-slate-400 mt-1">Total Hits</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-300">{trendResult.hit_rate_percent.toFixed(1)}%</p>
                      <p className="text-xs text-slate-400 mt-1">Hit Rate</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-200 text-center">{trendResult.message}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Impact Analyzer */}
        <TabsContent value="impact">
          <Card className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-slate-700/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <AlertCircle className="h-5 w-5 text-cyan-400" />
                Analyseur d'Impact (Absences)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {impactLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-3"></div>
                  <p className="text-slate-400">Chargement de l'analyse...</p>
                </div>
              ) : missingPlayerAnalysis ? (
                <>
                  {/* Iron Men Case: No missing games */}
                  {missingPlayerAnalysis.stats_without.games === 0 ? (
                    <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="h-6 w-6 text-emerald-400" />
                        <h3 className="text-lg font-semibold text-emerald-400">Iron Man</h3>
                      </div>
                      <p className="text-slate-200 text-center">
                        {player.full_name} n'a manqué aucun match. Ce joueur est un véritable "Iron Man" de l'équipe!
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Split View: With vs Without */}
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <h3 className="text-2xl font-display font-bold text-white">
                            Impact de {player.full_name} sur {player.team}
                          </h3>
                        </div>

                        {/* Stats Comparison Grid */}
                        <div className="grid grid-cols-3 gap-4">
                          {/* With Player (Green Left) */}
                          <div className="bg-emerald-500/20 border border-emerald-500/30 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-emerald-400 mb-4 text-center">
                              {missingPlayerAnalysis.stats_with.status}
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs text-slate-400 mb-1">% de Victoire</p>
                                <p className="text-2xl font-bold text-emerald-300">
                                  {(missingPlayerAnalysis.stats_with.win_percentage * 100).toFixed(1)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400 mb-1">Scoring (PPG)</p>
                                <p className="text-2xl font-bold text-emerald-300">
                                  {missingPlayerAnalysis.stats_with.ppg.toFixed(1)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400">
                                  {missingPlayerAnalysis.stats_with.games} matchs
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Difference Badge (Center) */}
                          <div className="flex items-center justify-center">
                            <div className="bg-slate-700/50 rounded-lg p-4 text-center border border-slate-600/50">
                              <p className="text-xs text-slate-400 mb-2">Différence</p>
                              <Badge
                                variant={
                                  (missingPlayerAnalysis.stats_with.win_percentage - missingPlayerAnalysis.stats_without.win_percentage) >= 0
                                    ? "default"
                                    : "destructive"
                                }
                                className="text-lg py-2 px-3 bg-cyan-600 hover:bg-cyan-700"
                              >
                                {(
                                  (missingPlayerAnalysis.stats_with.win_percentage - missingPlayerAnalysis.stats_without.win_percentage) * 100
                                ).toFixed(0)}%
                              </Badge>
                              <p className="text-xs text-slate-400 mt-2">Victoires</p>
                            </div>
                          </div>

                          {/* Without Player (Red Right) */}
                          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-red-400 mb-4 text-center">
                              {missingPlayerAnalysis.stats_without.status}
                            </h4>
                            <div className="space-y-3">
                              <div>
                                <p className="text-xs text-slate-400 mb-1">% de Victoire</p>
                                <p className="text-2xl font-bold text-red-300">
                                  {(missingPlayerAnalysis.stats_without.win_percentage * 100).toFixed(1)}%
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400 mb-1">Scoring (PPG)</p>
                                <p className="text-2xl font-bold text-red-300">
                                  {missingPlayerAnalysis.stats_without.ppg.toFixed(1)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-400">
                                  {missingPlayerAnalysis.stats_without.games} matchs
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* PPG Difference */}
                        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-xs text-slate-400 mb-2">Écart PPG Équipe</p>
                              <p className={`text-2xl font-bold ${
                                (missingPlayerAnalysis.stats_with.ppg - missingPlayerAnalysis.stats_without.ppg) >= 0
                                  ? "text-emerald-300"
                                  : "text-red-300"
                              }`}>
                                {(missingPlayerAnalysis.stats_with.ppg - missingPlayerAnalysis.stats_without.ppg).toFixed(1)} pts
                              </p>
                            </div>
                            <div className="flex items-center justify-center">
                              <Badge variant="outline" className="text-sm bg-slate-700/50 border-slate-600/50 text-slate-300">
                                {(missingPlayerAnalysis.stats_with.ppg - missingPlayerAnalysis.stats_without.ppg) >= 0 ? "+" : ""}
                                {(
                                  ((missingPlayerAnalysis.stats_with.ppg - missingPlayerAnalysis.stats_without.ppg) /
                                    missingPlayerAnalysis.stats_without.ppg) * 100
                                ).toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <p className="text-slate-400 text-center">Aucune donnée d'analyse disponible pour ce joueur.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
