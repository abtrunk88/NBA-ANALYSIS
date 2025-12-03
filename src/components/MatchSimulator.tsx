import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { nbaApi, InteractiveMatchPrediction, PlayerFullPrediction } from "@/services/nbaApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AlertCircle, Flame, AlertTriangle, Info } from "lucide-react";
import { PlayerDetailsModal } from "./PlayerDetailsModal";

interface MatchSimulatorProps {
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
}

export function MatchSimulator({
  homeTeamId,
  awayTeamId,
  homeTeamName,
  awayTeamName,
}: MatchSimulatorProps) {
  const [homeAbsentPlayerIds, setHomeAbsentPlayerIds] = useState<number[]>([]);
  const [awayAbsentPlayerIds, setAwayAbsentPlayerIds] = useState<number[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerFullPrediction | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTeam, setModalTeam] = useState<"home" | "away">("home");

  // Initial fetch without absent players
  const { data: initialPrediction, isLoading: initialLoading } = useQuery({
    queryKey: ["interactive-match-prediction-initial", homeTeamId, awayTeamId],
    queryFn: () =>
      nbaApi.getFullMatchPredictionWithAbsents(homeTeamId, awayTeamId),
  });

  // Use player IDs directly (no index mapping needed)
  const homeAbsentIds = homeAbsentPlayerIds;
  const awayAbsentIds = awayAbsentPlayerIds;

  // Fetch with absent players (triggers immediately when absent IDs change)
  const { data: prediction, isLoading: predictionLoading, isFetching: isPredictionFetching } = useQuery({
    queryKey: [
      "interactive-match-prediction",
      homeTeamId,
      awayTeamId,
      homeAbsentIds.length > 0 ? homeAbsentIds.join(",") : "none",
      awayAbsentIds.length > 0 ? awayAbsentIds.join(",") : "none",
    ],
    queryFn: () =>
      nbaApi.getFullMatchPredictionWithAbsents(
        homeTeamId,
        awayTeamId,
        homeAbsentIds.length > 0 ? homeAbsentIds : undefined,
        awayAbsentIds.length > 0 ? awayAbsentIds : undefined
      ),
    enabled: !initialLoading && initialPrediction !== undefined,
  });

  // Use the prediction with absent players if we have any, otherwise use initial
  const displayPrediction =
    (homeAbsentIds.length > 0 || awayAbsentIds.length > 0) && prediction
      ? prediction
      : initialPrediction;

  // Show loading indicator only during recalculation (not on initial load)
  const isRecalculating =
    isPredictionFetching &&
    (homeAbsentIds.length > 0 || awayAbsentIds.length > 0);

  const isLoading = initialLoading;

  const toggleHomePlayerAbsent = useCallback(
    (playerId: number) => {
      setHomeAbsentPlayerIds((prev) =>
        prev.includes(playerId)
          ? prev.filter((id) => id !== playerId)
          : [...prev, playerId]
      );
    },
    []
  );

  const toggleAwayPlayerAbsent = useCallback(
    (playerId: number) => {
      setAwayAbsentPlayerIds((prev) =>
        prev.includes(playerId)
          ? prev.filter((id) => id !== playerId)
          : [...prev, playerId]
      );
    },
    []
  );

  const handlePlayerClick = useCallback(
    (player: PlayerFullPrediction, team: "home" | "away") => {
      setSelectedPlayer(player);
      setModalTeam(team);
      setModalOpen(true);
    },
    []
  );

  const hasHighBlowoutRisk = useMemo(() => {
    if (!displayPrediction) return false;
    const allPlayers = [...displayPrediction.home_players, ...displayPrediction.away_players];
    return allPlayers.some((p) => p.blowout_analysis.risk_level === "HIGH");
  }, [displayPrediction]);

  const getBoostColor = (value?: string): string => {
    if (!value || value === "+0.0%" || value === "0.0%") return "";
    const isPositive = value.startsWith("+");
    return isPositive
      ? "text-green-600 dark:text-green-400 font-semibold"
      : "text-red-600 dark:text-red-400 font-semibold";
  };

  const getPenaltyColor = (value?: string): string => {
    if (!value || value === "+0.0%" || value === "0.0%") return "";
    return "text-red-600 dark:text-red-400 font-semibold";
  };

  const hasFatigue = (reasoning?: string): boolean => {
    return reasoning ? reasoning.toLowerCase().includes("fatigue") : false;
  };

  const renderBoostBadge = (boost?: string) => {
    if (!boost || boost === "+0.0%" || boost === "0.0%") return null;
    const isPositive = boost.startsWith("+");
    return (
      <Badge
        variant="outline"
        className={`text-[10px] ${
          isPositive
            ? "text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-700"
            : "text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-700"
        }`}
      >
        {boost}
      </Badge>
    );
  };

  const renderReasoningTooltip = (player: PlayerFullPrediction) => {
    const reasoning = player.context?.reasoning;
    const boost = player.context?.boost_applied;
    const penalty = player.context?.blowout_penalty;

    if (!reasoning && !boost && !penalty) return null;

    const tooltipContent = [];
    if (boost && boost !== "+0.0%" && boost !== "0.0%") {
      tooltipContent.push(
        <div key="boost" className="text-sm">
          <span className="font-semibold text-green-600">Boost Gravity: {boost}</span>
        </div>
      );
    }
    if (penalty && penalty !== "+0.0%" && penalty !== "0.0%") {
      tooltipContent.push(
        <div key="penalty" className="text-sm">
          <span className="font-semibold text-red-600">Risque Blowout: {penalty}</span>
        </div>
      );
    }
    if (reasoning) {
      tooltipContent.push(
        <div key="reasoning" className="text-sm mt-2">
          {reasoning}
        </div>
      );
    }

    if (tooltipContent.length === 0) return null;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="p-1 hover:opacity-75 transition-opacity">
            <Info className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="bg-slate-950 border-slate-700 text-slate-100">
          <div className="flex flex-col gap-1">{tooltipContent}</div>
        </TooltipContent>
      </Tooltip>
    );
  };

  if (!displayPrediction) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Chargement des prédictions...</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Context Banner */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-amber-500/10 border-purple-200 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="text-lg font-bold text-foreground">{homeTeamName}</div>
                <div className="text-muted-foreground">vs</div>
                <div className="text-lg font-bold text-foreground">{awayTeamName}</div>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {displayPrediction.match_context.home_usage_boost > 0 && (
                  <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30 border gap-1">
                    <Flame className="h-3 w-3" />
                    <span className="text-xs">🔥 Redistribution attaque: +{displayPrediction.match_context.home_usage_boost.toFixed(1)}% ({homeTeamName})</span>
                  </Badge>
                )}
                {displayPrediction.match_context.away_usage_boost > 0 && (
                  <Badge className="bg-emerald-500/20 text-emerald-700 border-emerald-500/30 border gap-1">
                    <Flame className="h-3 w-3" />
                    <span className="text-xs">🔥 Redistribution attaque: +{displayPrediction.match_context.away_usage_boost.toFixed(1)}% ({awayTeamName})</span>
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blowout Alert */}
        {hasHighBlowoutRisk && (
          <Card className="bg-red-500/10 border-red-500/30">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-700 dark:text-red-400 text-sm">
                  ⚠️ Risque de Blowout Détecté
                </p>
                <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                  L'écart prévu est trop grand. Les titulaires pourraient jouer moins (Pénalité appliquée).
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State - Only show during recalculation */}
        {isRecalculating && (
          <Card className="bg-blue-500/10 border-blue-500/30">
            <CardContent className="p-4 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Recalcul de la redistribution en cours...
              </p>
            </CardContent>
          </Card>
        )}

        {/* Player Details Modal */}
        {selectedPlayer && (
          <PlayerDetailsModal
            isOpen={modalOpen}
            onOpenChange={setModalOpen}
            player={selectedPlayer}
            opponentTeamName={modalTeam === "home" ? awayTeamName : homeTeamName}
            opponentTeamId={modalTeam === "home" ? awayTeamId : homeTeamId}
          />
        )}

        {/* Two-Column Layout: Home & Away Teams */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Home Team Players Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                {homeTeamName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">Absent?</TableHead>
                      <TableHead className="max-w-[120px] text-ellipsis">Joueur</TableHead>
                      <TableHead className="text-right text-xs">MIN</TableHead>
                      <TableHead className="text-right text-xs font-bold">PTS</TableHead>
                      <TableHead className="text-right text-xs">REB</TableHead>
                      <TableHead className="text-right text-xs">AST</TableHead>
                      <TableHead className="text-right text-xs">3PM</TableHead>
                      <TableHead className="text-right text-xs bg-amber-500/10 font-bold">PRA</TableHead>
                      <TableHead className="text-center text-xs">Info</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayPrediction.home_players.map((player) => {
                      const isAbsent = homeAbsentPlayerIds.includes(player.player_id);
                      return (
                        <TableRow
                          key={`home-${player.player_id}`}
                          className={`transition-colors`}
                        >
                          <TableCell className="w-10">
                            <Checkbox
                              checked={isAbsent}
                              onCheckedChange={() => toggleHomePlayerAbsent(player.player_id)}
                              disabled={isLoading}
                            />
                          </TableCell>
                          <TableCell
                            className={`font-medium text-xs truncate cursor-pointer transition-colors ${
                              isAbsent
                                ? "text-muted-foreground line-through"
                                : "hover:text-primary hover:underline"
                            }`}
                            onClick={() => handlePlayerClick(player, "home")}
                          >
                            <div className="flex items-center gap-1">
                              {hasFatigue(player.context?.reasoning) && (
                                <span title="Fatigue detected">🪫</span>
                              )}
                              <span>{player.player}</span>
                              {player.position && (
                                <span className={`text-xs ml-1 ${isAbsent ? "text-muted-foreground line-through" : "text-muted-foreground"}`}>
                                  ({player.position})
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {player.predicted_stats.MIN.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-0.5">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-sm">
                                  {player.predicted_stats.PTS.toFixed(1)}
                                </span>
                                {renderBoostBadge(player.context?.boost_applied)}
                              </div>
                              {player.predicted_stats.PTS_RANGE && (
                                <span className="text-[10px] text-muted-foreground">
                                  {player.predicted_stats.PTS_RANGE}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {player.predicted_stats.REB.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {player.predicted_stats.AST.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {player.predicted_stats.FG3M.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right font-bold bg-amber-500/10 text-xs">
                            {player.advanced_metrics_projected.PRA.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-center">
                            {renderReasoningTooltip(player)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Away Team Players Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                {awayTeamName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="text-sm">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">Absent?</TableHead>
                      <TableHead className="max-w-[120px] text-ellipsis">Joueur</TableHead>
                      <TableHead className="text-right text-xs">MIN</TableHead>
                      <TableHead className="text-right text-xs font-bold">PTS</TableHead>
                      <TableHead className="text-right text-xs">REB</TableHead>
                      <TableHead className="text-right text-xs">AST</TableHead>
                      <TableHead className="text-right text-xs">3PM</TableHead>
                      <TableHead className="text-right text-xs bg-amber-500/10 font-bold">PRA</TableHead>
                      <TableHead className="text-center text-xs">Info</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayPrediction.away_players.map((player) => {
                      const isAbsent = awayAbsentPlayerIds.includes(player.player_id);
                      return (
                        <TableRow
                          key={`away-${player.player_id}`}
                          className={`transition-colors`}
                        >
                          <TableCell className="w-10">
                            <Checkbox
                              checked={isAbsent}
                              onCheckedChange={() => toggleAwayPlayerAbsent(player.player_id)}
                              disabled={isLoading}
                            />
                          </TableCell>
                          <TableCell
                            className={`font-medium text-xs truncate cursor-pointer transition-colors ${
                              isAbsent
                                ? "text-muted-foreground line-through"
                                : "hover:text-primary hover:underline"
                            }`}
                            onClick={() => handlePlayerClick(player, "away")}
                          >
                            <div className="flex items-center gap-1">
                              {hasFatigue(player.context?.reasoning) && (
                                <span title="Fatigue detected">🪫</span>
                              )}
                              <span>{player.player}</span>
                              {player.position && (
                                <span className={`text-xs ml-1 ${isAbsent ? "text-muted-foreground line-through" : "text-muted-foreground"}`}>
                                  ({player.position})
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {player.predicted_stats.MIN.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex flex-col items-end gap-0.5">
                              <div className="flex items-center gap-1">
                                <span className="font-bold text-sm">
                                  {player.predicted_stats.PTS.toFixed(1)}
                                </span>
                                {renderBoostBadge(player.context?.boost_applied)}
                              </div>
                              {player.predicted_stats.PTS_RANGE && (
                                <span className="text-[10px] text-muted-foreground">
                                  {player.predicted_stats.PTS_RANGE}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {player.predicted_stats.REB.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {player.predicted_stats.AST.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right text-xs">
                            {player.predicted_stats.FG3M.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-right font-bold bg-amber-500/10 text-xs">
                            {player.advanced_metrics_projected.PRA.toFixed(1)}
                          </TableCell>
                          <TableCell className="text-center">
                            {renderReasoningTooltip(player)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
