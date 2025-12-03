import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
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
import { useQuery } from "@tanstack/react-query";
import { nbaApi, TodayGame, Player } from "@/services/nbaApi";
import {
  Brain,
  Trophy,
  Zap,
  X,
  ChevronsUpDown,
  AlertCircle,
  TrendingDown,
} from "lucide-react";
import { getTeamCode } from "@/lib/teamMapping";
import {
  getFatigueFactor,
  getRestBadge,
} from "@/lib/fatigueUtils";
import { BlowoutBar } from "@/components/BlowoutBar";

interface MatchPredictionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  game: TodayGame | null;
}

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
    if (!level) return "bg-gray-500 text-white border-gray-600";
    const lower = level.toLowerCase();
    if (lower.includes("indécis") || lower.includes("tight") || lower.includes("serré"))
      return "bg-amber-500/20 text-amber-700 border-amber-500/30";
    if (lower.includes("solid") || lower.includes("solide"))
      return "bg-emerald-500/20 text-emerald-700 border-emerald-500/30";
    if (lower.includes("blowout"))
      return "bg-red-500/20 text-red-700 border-red-500/30";
    return "bg-primary/20";
  };

  const getWinnerColor = (winner: string) => {
    return winner === game?.homeTeam
      ? "text-purple-600 dark:text-purple-400"
      : "text-amber-600 dark:text-amber-400";
  };

  const renderFatigueSection = (
    teamName: string | undefined,
    factors: string[] | undefined,
    position: "home" | "away"
  ) => {
    const factorsList = factors || [];
    const hasFactors = factorsList.length > 0;

    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{teamName}</h3>
          {position === "home" && (
            <span className="text-xs text-muted-foreground">(Domicile)</span>
          )}
          {position === "away" && (
            <span className="text-xs text-muted-foreground">(Extérieur)</span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {hasFactors ? (
            factorsList.map((factor, idx) => {
              const fatigueInfo = getFatigueFactor(factor);
              return (
                <Badge
                  key={idx}
                  className={`text-xs py-1 px-2 border ${fatigueInfo.bgColor} ${fatigueInfo.color}`}
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {fatigueInfo.icon} {fatigueInfo.name}
                </Badge>
              );
            })
          ) : (
            <Badge
              className={`text-xs py-1 px-2 border ${
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-4 gap-4 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-5 w-5 text-purple-600" />
            <span>Analyse IA Pro</span>
            <span className="text-muted-foreground text-sm font-normal ml-auto">
              {game?.awayTeam} @ {game?.homeTeam}
            </span>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : prediction ? (
          <div className="grid gap-4">
            {/* SECTION 1: EN-TÊTE (RÉSULTAT PRINCIPAL) */}
            <div className="space-y-3">
              {/* Vainqueur Prédit */}
              <Card className="bg-gradient-to-r from-purple-500/10 to-amber-500/10 border-purple-200 dark:border-purple-800">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-yellow-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-1">
                        Vainqueur Prédit
                      </p>
                      <p
                        className={`text-2xl font-bold leading-tight ${getWinnerColor(
                          prediction.predicted_winner
                        )}`}
                      >
                        {prediction.predicted_winner}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Marge : +{(Math.abs(prediction?.predicted_margin || 0)).toFixed(1)} pts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Barre de Probabilité Home vs Away */}
              <Card className="p-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      PROBABILITÉ DE VICTOIRE
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                          {game?.homeTeam}
                        </span>
                        <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                          {(Math.max(0, prediction?.win_probability_home || 0)).toFixed(0)}%
                        </span>
                      </div>
                      <Progress
                        value={Math.max(0, prediction?.win_probability_home || 0)}
                        className="h-2"
                      />
                    </div>
                    <div className="text-xs text-muted-foreground font-semibold">VS</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                          {(Math.max(0, 100 - (prediction?.win_probability_home || 0))).toFixed(0)}%
                        </span>
                        <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                          {game?.awayTeam}
                        </span>
                      </div>
                      <Progress
                        value={Math.max(0, 100 - (prediction?.win_probability_home || 0))}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Confiance et Total Estimé */}
              <div className="grid grid-cols-2 gap-3">
                {/* Confiance */}
                <Card className="p-3">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground block">
                      CONFIANCE IA
                    </span>
                    <Badge
                      className={`text-xs px-2 py-1 w-fit ${getConfidenceBadgeColor(
                        prediction?.confidence_level
                      )}`}
                    >
                      {prediction?.confidence_level || "Analyse en cours..."}
                    </Badge>
                  </div>
                </Card>

                {/* Total Estimé */}
                <Card className="p-3">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground block">
                      TOTAL ESTIMÉ
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                        ~{(prediction?.predicted_total_points || 0).toFixed(0)}
                      </span>
                      <span className="text-xs text-muted-foreground">pts</span>
                    </div>
                  </div>
                </Card>
              </div>

            </div>

            {/* SECTION 2: CONTEXTE & FATIGUE */}
            {prediction.context_analysis && (
              <div className="border-t pt-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3 tracking-wider">
                  Contexte & Fatigue
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Card className="p-3 border-l-4 border-l-purple-500">
                    {renderFatigueSection(
                      game?.homeTeam,
                      prediction.context_analysis.home_fatigue_factors,
                      "home"
                    )}
                  </Card>
                  <Card className="p-3 border-l-4 border-l-amber-500">
                    {renderFatigueSection(
                      game?.awayTeam,
                      prediction.context_analysis.away_fatigue_factors,
                      "away"
                    )}
                  </Card>
                </div>
              </div>
            )}

                        {/* SECTION 3 & 4 REVISITÉES : EXPLICATION DU CALCUL (MATH BREAKDOWN) */}
            {prediction.math_breakdown && (
              <div className="border-t pt-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase mb-3 tracking-wider flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  Logique de Prédiction
                </h3>

                <Card className="overflow-hidden">
                  <div className="text-xs grid grid-cols-[1fr_auto_auto] gap-2 p-3 items-center border-b bg-muted/30 font-medium">
                    <span>Facteur</span>
                    <span className="text-right">Impact</span>
                    <span className="text-right w-12">Pts</span>
                  </div>

                  {/* 1. Base Spread (Net Rating + Home Court) */}
                  <div className="grid grid-cols-[1fr_auto_auto] gap-2 p-3 items-center border-b border-dashed">
                    <div>
                      <span className="font-medium block">Écart de Niveau</span>
                      <span className="text-[10px] text-muted-foreground">
                        {prediction.math_breakdown.base_spread.desc}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-[10px] h-5">Base</Badge>
                    <span className={`font-mono font-bold text-right ${prediction.math_breakdown.base_spread.value > 0 ? "text-purple-600" : "text-amber-600"}`}>
                      {prediction.math_breakdown.base_spread.value > 0 ? "+" : ""}
                      {prediction.math_breakdown.base_spread.value}
                    </span>
                  </div>

                  {/* 2. Fatigue Adjustment */}
                  <div className="grid grid-cols-[1fr_auto_auto] gap-2 p-3 items-center border-b border-dashed">
                    <div>
                      <span className="font-medium block">Fatigue & Calendrier</span>
                      <span className="text-[10px] text-muted-foreground">
                        {prediction.math_breakdown.fatigue_adjust.desc}
                      </span>
                    </div>
                    {Math.abs(prediction.math_breakdown.fatigue_adjust.value) > 0 ? (
                      <Badge variant="secondary" className="text-[10px] h-5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Important</Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">-</span>
                    )}
                    <span className={`font-mono font-bold text-right ${prediction.math_breakdown.fatigue_adjust.value === 0 ? "text-muted-foreground" : "text-red-500"}`}>
                      {prediction.math_breakdown.fatigue_adjust.value > 0 ? "+" : ""}
                      {prediction.math_breakdown.fatigue_adjust.value}
                    </span>
                  </div>

                  {/* 3. Absences Adjustment */}
                  <div className="grid grid-cols-[1fr_auto_auto] gap-2 p-3 items-center border-b border-dashed">
                    <div>
                      <span className="font-medium block">Impact Absences</span>
                      <span className="text-[10px] text-muted-foreground">
                        {homeMissingPlayers.length + awayMissingPlayers.length > 0 
                          ? `${homeMissingPlayers.length + awayMissingPlayers.length} joueur(s) manquant(s)` 
                          : "Effectifs complets"}
                      </span>
                    </div>
                    {Math.abs(prediction.math_breakdown.absences_adjust.value) > 2 ? (
                      <Badge variant="secondary" className="text-[10px] h-5 bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">Majeur</Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground">-</span>
                    )}
                    <span className={`font-mono font-bold text-right ${prediction.math_breakdown.absences_adjust.value === 0 ? "text-muted-foreground" : "text-orange-500"}`}>
                      {prediction.math_breakdown.absences_adjust.value > 0 ? "+" : ""}
                      {prediction.math_breakdown.absences_adjust.value}
                    </span>
                  </div>

                  {/* RESULTAT FINAL */}
                  <div className="grid grid-cols-[1fr_auto_auto] gap-2 p-3 items-center bg-primary/5">
                    <div>
                      <span className="font-bold text-sm text-primary">SPREAD FINAL ESTIMÉ</span>
                      <span className="text-[10px] text-muted-foreground block">
                        Positif = {game?.homeTeam} gagne / Négatif = {game?.awayTeam} gagne
                      </span>
                    </div>
                    <div></div>
                    <span className={`font-mono font-black text-lg text-right ${prediction.math_breakdown.final_spread > 0 ? "text-purple-600" : "text-amber-600"}`}>
                      {prediction.math_breakdown.final_spread > 0 ? "+" : ""}
                      {prediction.math_breakdown.final_spread.toFixed(1)}
                    </span>
                  </div>
                </Card>
              </div>
            )}
            {/* SECTION 5: BARRE DE RISQUE DE BLOWOUT */}
            {game?.homeTeam && game?.awayTeam && (
              <div className="border-t pt-4">
                <BlowoutBar
                  homeTeamName={game.homeTeam}
                  awayTeamName={game.awayTeam}
                  absentHomePlayerIds={homeMissingPlayers.map((p) => p.id)}
                  absentAwayPlayerIds={awayMissingPlayers.map((p) => p.id)}
                />
              </div>
            )}

            {/* SECTION 6: SÉLECTION DES JOUEURS ABSENTS */}
            <div className="space-y-4 border-t pt-4">
              {/* Home Missing Players */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">
                  JOUEURS ABSENTS - {game?.homeTeam}
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
                      className="w-full justify-between text-left font-normal"
                    >
                      <span className="text-muted-foreground">
                        {homeMissingPlayers.length === 0
                          ? "Ajouter des joueurs..."
                          : `${homeMissingPlayers.length} joueur(s) sélectionné(s)`}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <Input
                        placeholder="Chercher par nom..."
                        value={homeSearchQuery}
                        onChange={(e) => setHomeSearchQuery(e.target.value)}
                        className="border-0 border-b rounded-none focus-visible:ring-0"
                      />
                      <CommandList>
                        <CommandEmpty>Aucun joueur trouvé.</CommandEmpty>
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
                  <div className="flex flex-wrap gap-2 mt-2">
                    {homeMissingPlayers.map((player) => (
                      <Badge
                        key={player.id}
                        variant="secondary"
                        className="gap-1"
                      >
                        {player.full_name}
                        <button
                          onClick={() => removeHomeMissingPlayer(player.id)}
                          className="ml-1 hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Away Missing Players */}
              <div>
                <label className="text-xs font-semibold text-muted-foreground block mb-2">
                  JOUEURS ABSENTS - {game?.awayTeam}
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
                      className="w-full justify-between text-left font-normal"
                    >
                      <span className="text-muted-foreground">
                        {awayMissingPlayers.length === 0
                          ? "Ajouter des joueurs..."
                          : `${awayMissingPlayers.length} joueur(s) sélectionné(s)`}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <Input
                        placeholder="Chercher par nom..."
                        value={awaySearchQuery}
                        onChange={(e) => setAwaySearchQuery(e.target.value)}
                        className="border-0 border-b rounded-none focus-visible:ring-0"
                      />
                      <CommandList>
                        <CommandEmpty>Aucun joueur trouvé.</CommandEmpty>
                        <CommandGroup>
                          {awayPlayerSearchResults.map((player) => (
                            <CommandItem
                              key={player.id}
                              value={player.full_name}
                              onSelect={() => addAwayMissingPlayer(player)}
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
                  <div className="flex flex-wrap gap-2 mt-2">
                    {awayMissingPlayers.map((player) => (
                      <Badge
                        key={player.id}
                        variant="secondary"
                        className="gap-1"
                      >
                        {player.full_name}
                        <button
                          onClick={() => removeAwayMissingPlayer(player.id)}
                          className="ml-1 hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 7: SÉLECTION RAPIDE DES JOUEURS PAR BOUTONS */}
              <div className="space-y-4 border-t pt-4">
                {/* Home Team Players */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-3">
                    JOUEURS - {game?.homeTeam}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {homeRoster.slice(0, 14).filter((player) => !homeMissingPlayers.some((p) => p.id === player.id)).map((player) => (
                      <Button
                        key={player.id}
                        onClick={() => addHomeMissingPlayer(player)}
                        className="h-9 text-xs truncate bg-secondary hover:bg-secondary/80 text-foreground"
                        variant="outline"
                      >
                        {player.full_name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Away Team Players */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-3">
                    JOUEURS - {game?.awayTeam}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {awayRoster.slice(0, 14).filter((player) => !awayMissingPlayers.some((p) => p.id === player.id)).map((player) => (
                      <Button
                        key={player.id}
                        onClick={() => addAwayMissingPlayer(player)}
                        className="h-9 text-xs truncate bg-secondary hover:bg-secondary/80 text-foreground"
                        variant="outline"
                      >
                        {player.full_name}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-2 pt-2 border-t">
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs"
              >
                Actualiser
              </Button>
              <Button
                onClick={() => onOpenChange(false)}
                size="sm"
                className="flex-1 h-8 text-xs"
              >
                Fermer
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Données indisponibles.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
