import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { nbaApi, TodayGame, Player } from "@/services/nbaApi";
import {
  Brain,
  Zap,
  X,
  ChevronsUpDown,
  AlertCircle,
  Star,
  ChevronRight,
} from "lucide-react";
import { getTeamCode } from "@/lib/teamMapping";
import {
  getFatigueFactor,
  getRestBadge,
} from "@/lib/fatigueUtils";
import { BlowoutBar } from "@/components/BlowoutBar";
import { ShootingBattleCard } from "@/components/ShootingBattleCard";

interface MatchPredictionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game: TodayGame | null;
}

const getLogo = (id: string | undefined) =>
  id ? `https://cdn.nba.com/logos/nba/${id}/global/L/logo.svg` : null;

export function MatchPredictionModal({
  open,
  onOpenChange,
  game,
}: MatchPredictionModalProps) {
  const [homeMissingPlayers, setHomeMissingPlayers] = useState<Player[]>([]);
  const [awayMissingPlayers, setAwayMissingPlayers] = useState<Player[]>([]);
  const [homeSearchQuery, setHomeSearchQuery] = useState("");
  const [awaySearchQuery, setAwaySearchQuery] = useState("");
  const [homePopoverOpen, setHomePopoverOpen] = useState(false);
  const [awayPopoverOpen, setAwayPopoverOpen] = useState(false);
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());

  const homeTeamId = game ? getTeamCode(game.homeTeam) : "";
  const awayTeamId = game ? getTeamCode(game.awayTeam) : "";

  const { data: homeRoster = [] } = useQuery({
    queryKey: ["team-roster", homeTeamId],
    queryFn: () => nbaApi.getTeamRoster(homeTeamId),
    enabled: !!homeTeamId,
  });

  const { data: awayRoster = [] } = useQuery({
    queryKey: ["team-roster", awayTeamId],
    queryFn: () => nbaApi.getTeamRoster(awayTeamId),
    enabled: !!awayTeamId,
  });

  const homePlayerSearchResults = homeRoster.filter((player) =>
    player.full_name.toLowerCase().includes(homeSearchQuery.toLowerCase())
  );

  const awayPlayerSearchResults = awayRoster.filter((player) =>
    player.full_name.toLowerCase().includes(awaySearchQuery.toLowerCase())
  );

  const {
    data: prediction,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "match-prediction",
      homeTeamId,
      awayTeamId,
      homeMissingPlayers.map((p) => p.id).join(","),
      awayMissingPlayers.map((p) => p.id).join(","),
    ],
    queryFn: () =>
      nbaApi.predictMatch(
        homeTeamId,
        awayTeamId,
        homeMissingPlayers.map((p) => p.id),
        awayMissingPlayers.map((p) => p.id)
      ),
    enabled: open && !!homeTeamId && !!awayTeamId,
  });

  const addHomeMissingPlayer = useCallback(
    (player: Player) => {
      if (!homeMissingPlayers.find((p) => p.id === player.id)) {
        setHomeMissingPlayers([...homeMissingPlayers, player]);
      }
      setHomeSearchQuery("");
      setHomePopoverOpen(false);
    },
    [homeMissingPlayers]
  );

  const addAwayMissingPlayer = useCallback(
    (player: Player) => {
      if (!awayMissingPlayers.find((p) => p.id === player.id)) {
        setAwayMissingPlayers([...awayMissingPlayers, player]);
      }
      setAwaySearchQuery("");
      setAwayPopoverOpen(false);
    },
    [awayMissingPlayers]
  );

  const removeHomeMissingPlayer = useCallback(
    (playerId: number) => {
      setHomeMissingPlayers(homeMissingPlayers.filter((p) => p.id !== playerId));
    },
    [homeMissingPlayers]
  );

  const removeAwayMissingPlayer = useCallback(
    (playerId: number) => {
      setAwayMissingPlayers(awayMissingPlayers.filter((p) => p.id !== playerId));
    },
    [awayMissingPlayers]
  );

  const getConfidenceBadgeColor = (level: string | undefined | null) => {
    if (!level) return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    const lower = level.toLowerCase();
    if (lower.includes("indécis") || lower.includes("tight") || lower.includes("serré"))
      return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    if (lower.includes("solid") || lower.includes("solide"))
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (lower.includes("blowout"))
      return "bg-red-500/20 text-red-400 border-red-500/30";
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  const getWinnerGradient = (winner: string) => {
    return winner === game?.homeTeam
      ? "from-purple-600/20 to-purple-500/10"
      : "from-amber-600/20 to-amber-500/10";
  };

  const renderFatigueSection = (
    teamName: string | undefined,
    factors: string[] | undefined
  ) => {
    const factorsList = factors || [];
    const hasFactors = factorsList.length > 0;

    return (
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-foreground">{teamName}</h4>
        <div className="flex flex-wrap gap-1.5">
          {hasFactors ? (
            factorsList.map((factor, idx) => {
              const fatigueInfo = getFatigueFactor(factor);
              return (
                <Badge
                  key={idx}
                  className={`text-[10px] py-0.5 px-2 border ${fatigueInfo.bgColor} ${fatigueInfo.color}`}
                >
                  <AlertCircle className="h-2.5 w-2.5 mr-1" />
                  {fatigueInfo.name}
                </Badge>
              );
            })
          ) : (
            <Badge
              className={`text-[10px] py-0.5 px-2 border ${
                getRestBadge().bgColor
              } ${getRestBadge().color}`}
            >
              {getRestBadge().icon} {getRestBadge().name}
            </Badge>
          )}
        </div>
      </div>
    );
  };

  const handleLogoError = (teamId: string) => {
    setFailedLogos((prev) => new Set([...prev, teamId]));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[95vh] overflow-hidden flex flex-col p-0 gap-0">
        {/* Header */}
        <DialogHeader className="border-b border-blue-500/20 px-6 py-4 bg-gradient-to-r from-slate-900 to-slate-800">
          <DialogTitle className="flex items-center gap-2 text-base">
            <Brain className="h-5 w-5 text-purple-400" />
            <span className="text-foreground">Match Analysis</span>
            <span className="text-muted-foreground text-sm font-normal ml-auto">
              {game?.awayTeam} @ {game?.homeTeam}
            </span>
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="space-y-4 text-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mx-auto"></div>
                  <p className="text-sm text-muted-foreground">Analyzing forecast...</p>
                </div>
              </div>
            ) : prediction ? (
              <div className="space-y-6">
                {/* ============ SECTION 1: MATCH HEADER (SCOREBOARD) ============ */}
                <Card className={`bg-gradient-to-r ${getWinnerGradient(
                  prediction.predicted_winner
                )} border-blue-500/30 overflow-hidden`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between gap-4">
                      {/* Home Team */}
                      <div className="flex-1 flex flex-col items-center text-center space-y-3">
                        <div className="w-20 h-20 flex items-center justify-center">
                          {game?.homeTeamId && !failedLogos.has(`home-${game.gameId}`) ? (
                            <img
                              src={getLogo(game.homeTeamId)}
                              alt={game?.homeTeam}
                              className="h-20 w-20 object-contain drop-shadow-lg"
                              onError={() => handleLogoError(`home-${game.gameId}`)}
                            />
                          ) : (
                            <div className="text-2xl font-bold text-white text-center">
                              {game?.homeTeam}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                            Home
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {game?.homeTeam}
                          </p>
                        </div>
                      </div>

                      {/* Center: Prediction */}
                      <div className="flex-1 flex flex-col items-center justify-center space-y-4 px-4 border-l border-r border-blue-500/20">
                        <div className="text-center space-y-1">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                            Forecast
                          </p>
                          <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                            {prediction.predicted_winner}
                          </p>
                          <p className="text-lg font-bold text-amber-400">
                            +{Math.abs(prediction?.predicted_margin || 0).toFixed(1)}
                          </p>
                        </div>

                        {/* Win Probability Bar */}
                        <div className="w-full space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-muted-foreground">
                              {game?.homeTeam}
                            </span>
                            <Progress
                              value={Math.max(0, prediction?.win_probability_home || 0)}
                              className="flex-1 h-2"
                            />
                            <span className="text-xs font-bold text-purple-400">
                              {Math.max(0, prediction?.win_probability_home || 0).toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-semibold text-muted-foreground">
                              {game?.awayTeam}
                            </span>
                            <Progress
                              value={Math.max(0, 100 - (prediction?.win_probability_home || 0))}
                              className="flex-1 h-2"
                            />
                            <span className="text-xs font-bold text-amber-400">
                              {Math.max(0, 100 - (prediction?.win_probability_home || 0)).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Away Team */}
                      <div className="flex-1 flex flex-col items-center text-center space-y-3">
                        <div className="w-20 h-20 flex items-center justify-center">
                          {game?.awayTeamId && !failedLogos.has(`away-${game.gameId}`) ? (
                            <img
                              src={getLogo(game.awayTeamId)}
                              alt={game?.awayTeam}
                              className="h-20 w-20 object-contain drop-shadow-lg"
                              onError={() => handleLogoError(`away-${game.gameId}`)}
                            />
                          ) : (
                            <div className="text-2xl font-bold text-white text-center">
                              {game?.awayTeam}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                            Away
                          </p>
                          <p className="text-sm font-bold text-foreground">
                            {game?.awayTeam}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* ============ SECTION 2: KEY METRICS ============ */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-blue-500/20 bg-blue-950/30">
                    <CardContent className="p-4">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
                        Confidence
                      </p>
                      <Badge
                        className={`text-xs px-2 py-1 ${getConfidenceBadgeColor(
                          prediction?.confidence_level
                        )}`}
                      >
                        {prediction?.confidence_level || "Analyzing..."}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-500/20 bg-blue-950/30">
                    <CardContent className="p-4">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
                        Projected Total
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-cyan-400">
                          {(prediction?.predicted_total_points || 0).toFixed(0)}
                        </span>
                        <span className="text-xs text-muted-foreground">pts</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-blue-500/20 bg-blue-950/30">
                    <CardContent className="p-4">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
                        Simulation
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {homeMissingPlayers.length + awayMissingPlayers.length} absence{homeMissingPlayers.length + awayMissingPlayers.length !== 1 ? "s" : ""} configured
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* ============ SECTION 3: BLOWOUT BAR & SHOOTING BATTLE ============ */}
                {game?.homeTeam && game?.awayTeam && (
                  <BlowoutBar
                    homeTeamName={game.homeTeam}
                    awayTeamName={game.awayTeam}
                    absentHomePlayerIds={homeMissingPlayers.map((p) => p.id)}
                    absentAwayPlayerIds={awayMissingPlayers.map((p) => p.id)}
                  />
                )}

                {homeTeamId && awayTeamId && (
                  <ShootingBattleCard
                    homeTeamCode={homeTeamId}
                    awayTeamCode={awayTeamId}
                    homeMissingPlayers={homeMissingPlayers}
                    awayMissingPlayers={awayMissingPlayers}
                  />
                )}

                {/* ============ SECTION 4: MATH BREAKDOWN ============ */}
                {prediction.math_breakdown && (
                  <Card className="border-blue-500/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Zap className="h-4 w-4 text-yellow-400" />
                        Impact Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {/* Base Spread */}
                        <div className="grid grid-cols-[1fr_auto_auto] gap-4 p-3 rounded-lg bg-slate-800/50 items-center">
                          <div>
                            <p className="text-xs font-semibold text-foreground">Base Spread</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {prediction.math_breakdown.base_spread.desc}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            Foundation
                          </Badge>
                          <span
                            className={`font-mono font-bold text-sm ${
                              prediction.math_breakdown.base_spread.value > 0
                                ? "text-purple-400"
                                : "text-amber-400"
                            }`}
                          >
                            {prediction.math_breakdown.base_spread.value > 0 ? "+" : ""}
                            {prediction.math_breakdown.base_spread.value.toFixed(1)}
                          </span>
                        </div>

                        {/* Fatigue Adjustment */}
                        <div className="grid grid-cols-[1fr_auto_auto] gap-4 p-3 rounded-lg bg-slate-800/50 items-center">
                          <div>
                            <p className="text-xs font-semibold text-foreground">Fatigue Impact</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {prediction.math_breakdown.fatigue_adjust.desc}
                            </p>
                          </div>
                          {Math.abs(prediction.math_breakdown.fatigue_adjust.value) > 0 ? (
                            <Badge className="text-[10px] bg-red-500/20 text-red-400 border-red-500/30">
                              Significant
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">-</span>
                          )}
                          <span
                            className={`font-mono font-bold text-sm ${
                              prediction.math_breakdown.fatigue_adjust.value === 0
                                ? "text-muted-foreground"
                                : "text-red-400"
                            }`}
                          >
                            {prediction.math_breakdown.fatigue_adjust.value > 0 ? "+" : ""}
                            {prediction.math_breakdown.fatigue_adjust.value.toFixed(1)}
                          </span>
                        </div>

                        {/* Absences Adjustment */}
                        <div className="grid grid-cols-[1fr_auto_auto] gap-4 p-3 rounded-lg bg-slate-800/50 items-center">
                          <div>
                            <p className="text-xs font-semibold text-foreground">
                              Absence Impact
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {homeMissingPlayers.length + awayMissingPlayers.length > 0
                                ? `${homeMissingPlayers.length + awayMissingPlayers.length} player(s) absent`
                                : "Full rosters"}
                            </p>
                          </div>
                          {Math.abs(prediction.math_breakdown.absences_adjust.value) > 2 ? (
                            <Badge className="text-[10px] bg-orange-500/20 text-orange-400 border-orange-500/30">
                              Major
                            </Badge>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">-</span>
                          )}
                          <span
                            className={`font-mono font-bold text-sm ${
                              prediction.math_breakdown.absences_adjust.value === 0
                                ? "text-muted-foreground"
                                : "text-orange-400"
                            }`}
                          >
                            {prediction.math_breakdown.absences_adjust.value > 0 ? "+" : ""}
                            {prediction.math_breakdown.absences_adjust.value.toFixed(1)}
                          </span>
                        </div>

                        {/* Final Spread */}
                        <div className="grid grid-cols-[1fr_auto_auto] gap-4 p-3 rounded-lg bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 items-center mt-3">
                          <div>
                            <p className="text-xs font-bold text-foreground">
                              Final Projection
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              Positive = {game?.homeTeam} favored / Negative = {game?.awayTeam} favored
                            </p>
                          </div>
                          <div></div>
                          <span
                            className={`font-mono font-black text-lg ${
                              prediction.math_breakdown.final_spread > 0
                                ? "text-purple-400"
                                : "text-amber-400"
                            }`}
                          >
                            {prediction.math_breakdown.final_spread > 0 ? "+" : ""}
                            {prediction.math_breakdown.final_spread.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ============ SECTION 5: CONTEXT & FATIGUE ============ */}
                {prediction.context_analysis && (
                  <Card className="border-blue-500/20">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Context Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3 p-4 rounded-lg bg-slate-800/50 border border-purple-500/20">
                          {renderFatigueSection(
                            game?.homeTeam,
                            prediction.context_analysis.home_fatigue_factors
                          )}
                        </div>
                        <div className="space-y-3 p-4 rounded-lg bg-slate-800/50 border border-amber-500/20">
                          {renderFatigueSection(
                            game?.awayTeam,
                            prediction.context_analysis.away_fatigue_factors
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* ============ SECTION 6: SIMULATION CONTROL ============ */}
                <Card className="border-blue-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Simulation Control</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* Home Team Absences */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          {game?.homeTeam} Absences
                        </label>
                        <Popover
                          open={homePopoverOpen}
                          onOpenChange={setHomePopoverOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={homePopoverOpen}
                              className="w-full justify-between text-left font-normal h-9 border-blue-500/30"
                            >
                              <span className="text-muted-foreground text-sm">
                                {homeMissingPlayers.length === 0
                                  ? "Add players..."
                                  : `${homeMissingPlayers.length} selected`}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <Input
                                placeholder="Search by name..."
                                value={homeSearchQuery}
                                onChange={(e) => setHomeSearchQuery(e.target.value)}
                                className="border-0 border-b rounded-none focus-visible:ring-0"
                              />
                              <CommandList>
                                <CommandEmpty>No players found.</CommandEmpty>
                                <CommandGroup>
                                  {homePlayerSearchResults.map((player) => (
                                    <CommandItem
                                      key={player.id}
                                      value={player.full_name}
                                      onSelect={() => addHomeMissingPlayer(player)}
                                      disabled={
                                        homeMissingPlayers.find(
                                          (p) => p.id === player.id
                                        ) !== undefined
                                      }
                                    >
                                      {player.full_name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {homeMissingPlayers.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {homeMissingPlayers.map((player) => (
                              <Badge
                                key={player.id}
                                variant="secondary"
                                className="gap-1 text-xs"
                              >
                                {player.full_name}
                                <button
                                  onClick={() =>
                                    removeHomeMissingPlayer(player.id)
                                  }
                                  className="ml-1 hover:text-foreground"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Away Team Absences */}
                      <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                          {game?.awayTeam} Absences
                        </label>
                        <Popover
                          open={awayPopoverOpen}
                          onOpenChange={setAwayPopoverOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={awayPopoverOpen}
                              className="w-full justify-between text-left font-normal h-9 border-blue-500/30"
                            >
                              <span className="text-muted-foreground text-sm">
                                {awayMissingPlayers.length === 0
                                  ? "Add players..."
                                  : `${awayMissingPlayers.length} selected`}
                              </span>
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <Input
                                placeholder="Search by name..."
                                value={awaySearchQuery}
                                onChange={(e) => setAwaySearchQuery(e.target.value)}
                                className="border-0 border-b rounded-none focus-visible:ring-0"
                              />
                              <CommandList>
                                <CommandEmpty>No players found.</CommandEmpty>
                                <CommandGroup>
                                  {awayPlayerSearchResults.map((player) => (
                                    <CommandItem
                                      key={player.id}
                                      value={player.full_name}
                                      onSelect={() =>
                                        addAwayMissingPlayer(player)
                                      }
                                      disabled={
                                        awayMissingPlayers.find(
                                          (p) => p.id === player.id
                                        ) !== undefined
                                      }
                                    >
                                      {player.full_name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        {awayMissingPlayers.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {awayMissingPlayers.map((player) => (
                              <Badge
                                key={player.id}
                                variant="secondary"
                                className="gap-1 text-xs"
                              >
                                {player.full_name}
                                <button
                                  onClick={() =>
                                    removeAwayMissingPlayer(player.id)
                                  }
                                  className="ml-1 hover:text-foreground"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Player Selection Tabs */}
                    <Tabs defaultValue="home" className="w-full mt-4">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="home">{game?.homeTeam} Roster</TabsTrigger>
                        <TabsTrigger value="away">{game?.awayTeam} Roster</TabsTrigger>
                      </TabsList>

                      <TabsContent value="home" className="mt-4">
                        <div className="grid grid-cols-4 lg:grid-cols-6 gap-2">
                          {homeRoster.slice(0, 14).map((player) => {
                            const isAbsent = homeMissingPlayers.some(
                              (p) => p.id === player.id
                            );
                            return (
                              <Button
                                key={player.id}
                                onClick={() => addHomeMissingPlayer(player)}
                                disabled={isAbsent}
                                variant={isAbsent ? "ghost" : "outline"}
                                size="sm"
                                className={`text-[11px] h-8 px-2 truncate ${
                                  isAbsent
                                    ? "text-muted-foreground opacity-40 line-through cursor-not-allowed"
                                    : "hover:bg-purple-500/20 hover:border-purple-500/50"
                                }`}
                              >
                                {player.full_name}
                              </Button>
                            );
                          })}
                        </div>
                      </TabsContent>

                      <TabsContent value="away" className="mt-4">
                        <div className="grid grid-cols-4 lg:grid-cols-6 gap-2">
                          {awayRoster.slice(0, 14).map((player) => {
                            const isAbsent = awayMissingPlayers.some(
                              (p) => p.id === player.id
                            );
                            return (
                              <Button
                                key={player.id}
                                onClick={() => addAwayMissingPlayer(player)}
                                disabled={isAbsent}
                                variant={isAbsent ? "ghost" : "outline"}
                                size="sm"
                                className={`text-[11px] h-8 px-2 truncate ${
                                  isAbsent
                                    ? "text-muted-foreground opacity-40 line-through cursor-not-allowed"
                                    : "hover:bg-amber-500/20 hover:border-amber-500/50"
                                }`}
                              >
                                {player.full_name}
                              </Button>
                            );
                          })}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                {/* ============ SECTION 7: PLAYER PROJECTIONS ============ */}
                <Card className="border-blue-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      Roster Projections
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="home" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="home" className="text-xs">
                          {game?.homeTeam}
                        </TabsTrigger>
                        <TabsTrigger value="away" className="text-xs">
                          {game?.awayTeam}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="home">
                        <div className="border border-blue-500/20 rounded-lg overflow-hidden">
                          <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr] gap-3 p-3 bg-slate-800/50 border-b border-blue-500/20 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <div>Player</div>
                            <div className="text-right">MIN</div>
                            <div className="text-right">PTS</div>
                            <div className="text-right">REB</div>
                            <div className="text-right">AST</div>
                          </div>
                          <div className="space-y-1 max-h-60 overflow-y-auto">
                            {homeRoster.slice(0, 12).map((player) => {
                              const isAbsent = homeMissingPlayers.some(
                                (p) => p.id === player.id
                              );
                              return (
                                <div
                                  key={player.id}
                                  className={`grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr] gap-3 p-3 border-b border-slate-700/50 text-xs items-center hover:bg-slate-800/30 transition ${
                                    isAbsent ? "opacity-40" : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="font-medium text-foreground truncate"
                                    >
                                      {player.full_name}
                                    </span>
                                    {isAbsent && (
                                      <Badge className="text-[8px] h-5 bg-red-500/20 text-red-400 border-red-500/30">
                                        Out
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-right text-muted-foreground">
                                    32
                                  </div>
                                  <div className="text-right font-bold text-cyan-400">
                                    18.5
                                  </div>
                                  <div className="text-right text-muted-foreground">
                                    4.2
                                  </div>
                                  <div className="text-right text-muted-foreground">
                                    5.1
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="away">
                        <div className="border border-blue-500/20 rounded-lg overflow-hidden">
                          <div className="grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr] gap-3 p-3 bg-slate-800/50 border-b border-blue-500/20 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            <div>Player</div>
                            <div className="text-right">MIN</div>
                            <div className="text-right">PTS</div>
                            <div className="text-right">REB</div>
                            <div className="text-right">AST</div>
                          </div>
                          <div className="space-y-1 max-h-60 overflow-y-auto">
                            {awayRoster.slice(0, 12).map((player) => {
                              const isAbsent = awayMissingPlayers.some(
                                (p) => p.id === player.id
                              );
                              return (
                                <div
                                  key={player.id}
                                  className={`grid grid-cols-[2fr_1fr_1.5fr_1fr_1fr] gap-3 p-3 border-b border-slate-700/50 text-xs items-center hover:bg-slate-800/30 transition ${
                                    isAbsent ? "opacity-40" : ""
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className="font-medium text-foreground truncate"
                                    >
                                      {player.full_name}
                                    </span>
                                    {isAbsent && (
                                      <Badge className="text-[8px] h-5 bg-red-500/20 text-red-400 border-red-500/30">
                                        Out
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="text-right text-muted-foreground">
                                    32
                                  </div>
                                  <div className="text-right font-bold text-cyan-400">
                                    18.5
                                  </div>
                                  <div className="text-right text-muted-foreground">
                                    4.2
                                  </div>
                                  <div className="text-right text-muted-foreground">
                                    5.1
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground text-sm">
                Data unavailable
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="border-t border-blue-500/20 px-6 py-4 bg-slate-900 flex gap-3">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="flex-1 border-blue-500/30 hover:bg-blue-500/10"
          >
            <Zap className="h-3.5 w-3.5 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            size="sm"
            className="flex-1 bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500 hover:to-blue-500"
          >
            Close
            <ChevronRight className="h-3.5 w-3.5 ml-2" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
