import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { nbaApi, PlayerFullPrediction } from "@/services/nbaApi";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TrendingUp, Zap, Calendar, Target, X } from "lucide-react";

interface PlayerDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  player: PlayerFullPrediction;
  opponentTeamName: string;
  opponentTeamId: string;
  homeTeamName?: string;
}

type StatCategory = "PTS" | "REB" | "AST" | "PRA";

const getProjectionValue = (
  player: PlayerFullPrediction,
  stat: StatCategory
): number => {
  if (stat === "PRA") return player.advanced_metrics_projected.PRA;
  return player.predicted_stats[stat] || 0;
};

export function PlayerDetailsModal({
  isOpen,
  onOpenChange,
  player,
  opponentTeamName,
  opponentTeamId,
  homeTeamName,
}: PlayerDetailsModalProps) {
  const [selectedStat, setSelectedStat] = useState<StatCategory>("PTS");
  const [bookmakerLine, setBookmakerLine] = useState("");
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  const projection = getProjectionValue(player, selectedStat);

  const { data: historyData, isLoading: historyLoading } = useQuery({
    queryKey: ["player-details-history", player.player_id, opponentTeamId],
    queryFn: () =>
      nbaApi.getPlayerDetailsHistory(player.player_id, opponentTeamId),
    enabled: isOpen,
  });

  const { data: calculatorResult, refetch: analyzeCalculator } = useQuery({
    queryKey: [
      "calculator-analysis",
      player.player_id,
      projection,
      bookmakerLine,
      selectedStat,
    ],
    queryFn: () =>
      nbaApi.getCalculatorAnalysis(
        player.player_id,
        projection,
        parseFloat(bookmakerLine),
        selectedStat
      ),
    enabled: false,
  });

  const handleAnalyze = () => {
    if (bookmakerLine && parseFloat(bookmakerLine) > 0) {
      analyzeCalculator();
      setCalculatorOpen(true);
    }
  };

  const handleStatChange = (value: string) => {
    setSelectedStat(value as StatCategory);
    setCalculatorOpen(false);
  };

  const recentFormAvg = useMemo(() => {
    return historyData?.recent_form_avg || null;
  }, [historyData]);

  const h2hAverage = useMemo(() => {
    return historyData?.h2h_avg || null;
  }, [historyData]);

  const isPlayerHome = useMemo(() => {
    return homeTeamName && player.team === homeTeamName;
  }, [homeTeamName, player.team]);

  const getSelectedStatValue = (homeOrAway: "home" | "away"): number | null => {
    if (!historyData?.splits) return null;
    const splitData = homeOrAway === "home" ? historyData.splits.home : historyData.splits.away;
    if (!splitData) return null;
    return splitData[selectedStat] ?? null;
  };

  const getRecommendationColor = (advice: string | undefined, colorCode: string | undefined): string => {
    if (colorCode) {
      switch (colorCode.toLowerCase()) {
        case "green":
          return "bg-emerald-500/20 border-emerald-500/30 text-emerald-600";
        case "red":
          return "bg-red-500/20 border-red-500/30 text-red-600";
        case "amber":
        case "yellow":
          return "bg-amber-500/20 border-amber-500/30 text-amber-600";
        default:
          return "bg-muted border-border text-foreground";
      }
    }

    if (!advice) return "bg-muted border-border text-foreground";

    const upper = advice.toUpperCase();
    if (upper.includes("OVER")) return "bg-emerald-500/20 border-emerald-500/30 text-emerald-600";
    if (upper.includes("UNDER")) return "bg-red-500/20 border-red-500/30 text-red-600";
    return "bg-amber-500/20 border-amber-500/30 text-amber-600";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="border-b pb-4">
          <div className="space-y-2">
            <DialogTitle className="text-2xl font-bold">
              {player.player}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Matchup:</span>
              <Badge variant="outline" className="text-sm">
                vs {opponentTeamName}
              </Badge>
              {player.position && (
                <Badge variant="secondary" className="text-sm">
                  {player.position}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Projection Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {player.predicted_stats.MIN.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">MIN Prévues</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {player.predicted_stats.PTS.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PTS Prévus</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">
                    {player.advanced_metrics_projected.PRA.toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">PRA Prévu</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Analyse Contextuelle Section */}
          {(historyData?.fatigue || player.matchup_analysis?.description) && (
            <div className="space-y-3 border-t pt-4">
              <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Analyse Contextuelle
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                {/* Fatigue Badge */}
                {historyData?.fatigue && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        historyData.fatigue.color_code === "green"
                          ? "default"
                          : historyData.fatigue.color_code === "red"
                            ? "destructive"
                            : "secondary"
                      }
                      className={
                        historyData.fatigue.color_code === "green"
                          ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/30"
                          : historyData.fatigue.color_code === "red"
                            ? "bg-red-500/20 border-red-500/30 text-red-700 hover:bg-red-500/30"
                            : "bg-gray-500/20 border-gray-500/30 text-gray-700 hover:bg-gray-500/30"
                      }
                    >
                      {historyData.fatigue.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-medium">
                      {historyData.fatigue.last_min.toFixed(0)} min
                      {historyData.fatigue.days_rest > 0 ? ` (${historyData.fatigue.days_rest} day${historyData.fatigue.days_rest !== 1 ? 's' : ''} rest)` : " (back-to-back)"}
                    </span>
                  </div>
                )}

                {/* Matchup Badge */}
                {player.matchup_analysis?.description && (
                  <Badge
                    variant="outline"
                    className={
                      player.matchup_analysis.description.startsWith("🔴")
                        ? "bg-red-500/20 border-red-500/30 text-red-700 hover:bg-red-500/30"
                        : player.matchup_analysis.description.startsWith("🟢")
                          ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-700 hover:bg-emerald-500/30"
                          : "bg-amber-500/20 border-amber-500/30 text-amber-700 hover:bg-amber-500/30"
                    }
                  >
                    {player.matchup_analysis.description}
                  </Badge>
                )}
              </div>
            </div>
          )}


          {/* HISTORIQUE */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              HISTORIQUE & FORMES
            </h3>
            <Tabs defaultValue="recent" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="recent">Forme Récente (6 matchs)</TabsTrigger>
                <TabsTrigger value="h2h">Face-à-Face (H2H)</TabsTrigger>
              </TabsList>

              {/* --- ONGLETS 1 : FORME RÉCENTE --- */}
              <TabsContent value="recent" className="space-y-4 pt-4">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : recentFormAvg ? (
                  <div className="space-y-4">
                    {/* Home/Away Splits Comparison Card */}
                    {historyData?.splits && (historyData.splits.home || historyData.splits.away) && (
                      <Card className="bg-muted/40 border-muted/60">
                        <CardContent className="pt-6">
                          <div className="space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              Domicile vs Extérieur - {selectedStat}
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                              {/* Home Split */}
                              {historyData.splits.home && (
                                <div
                                  className={`p-4 rounded-lg border transition-all ${
                                    isPlayerHome
                                      ? "bg-blue-50/50 border-blue-200 ring-1 ring-blue-200"
                                      : "bg-background border-border"
                                  }`}
                                >
                                  <p className="text-xs text-muted-foreground font-medium mb-2">
                                    {isPlayerHome ? "🏠 Domicile (Équipe)" : "🏠 Domicile"}
                                  </p>
                                  <p className="text-2xl font-bold text-primary">
                                    {getSelectedStatValue("home")?.toFixed(1) || "-"}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-2">{selectedStat}</p>
                                  {historyData.splits.home.GP && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {historyData.splits.home.GP} matchs
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Away Split */}
                              {historyData.splits.away && (
                                <div
                                  className={`p-4 rounded-lg border transition-all ${
                                    !isPlayerHome
                                      ? "bg-amber-50/50 border-amber-200 ring-1 ring-amber-200"
                                      : "bg-background border-border"
                                  }`}
                                >
                                  <p className="text-xs text-muted-foreground font-medium mb-2">
                                    {!isPlayerHome ? "✈️ Extérieur (Équipe)" : "✈️ Extérieur"}
                                  </p>
                                  <p className="text-2xl font-bold text-primary">
                                    {getSelectedStatValue("away")?.toFixed(1) || "-"}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-2">{selectedStat}</p>
                                  {historyData.splits.away.GP && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {historyData.splits.away.GP} matchs
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <div className="flex items-center gap-2 mb-2">
                      <CalendarDays className="h-4 w-4 text-blue-500" />
                      <p className="text-sm text-muted-foreground font-medium">
                        Moyenne sur les {recentFormAvg.GP || 6} derniers matchs
                      </p>
                    </div>
                    
                    {/* Grille de 8 Stats */}
                    <div className="grid grid-cols-4 gap-3">
                      {/* Ligne 1 : Principales */}
                      <StatBox label="PTS" value={recentFormAvg.PTS} color="text-primary" />
                      <StatBox label="REB" value={recentFormAvg.REB} color="text-blue-600" />
                      <StatBox label="AST" value={recentFormAvg.AST} color="text-emerald-600" />
                      
                      {/* PRA Mis en valeur */}
                      <div className="bg-purple-50 p-2 rounded-lg border border-purple-200 text-center flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-purple-700">PRA</span>
                        <span className="text-xl font-black text-purple-900">
                          {recentFormAvg.PRA?.toFixed(1) || "-"}
                        </span>
                      </div>

                      {/* Ligne 2 : Combos & Défense */}
                      <MiniStatBox label="Pts+Ast" value={recentFormAvg.PA} />
                      <MiniStatBox label="Pts+Reb" value={recentFormAvg.PR} />
                      <StatBox label="STL" value={recentFormAvg.STL} color="text-orange-600" />
                      <StatBox label="BLK" value={recentFormAvg.BLK} color="text-gray-600" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded">
                    Aucune donnée récente disponible
                  </div>
                )}
              </TabsContent>

              {/* --- ONGLETS 2 : H2H --- */}
              <TabsContent value="h2h" className="space-y-4 pt-4">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : h2hAverage && h2hAverage.GP > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="h-4 w-4 text-amber-500" />
                      <p className="text-sm text-muted-foreground font-medium">
                        Moyenne vs {opponentTeamName} ({h2hAverage.GP} matchs)
                      </p>
                    </div>

                    <div className="grid grid-cols-4 gap-3">
                      {/* Ligne 1 : Principales */}
                      <StatBox label="PTS" value={h2hAverage.PTS} />
                      <StatBox label="REB" value={h2hAverage.REB} color="text-blue-600" />
                      <StatBox label="AST" value={h2hAverage.AST} color="text-emerald-600" />
                      
                      {/* PRA Mis en valeur */}
                      <div className="bg-amber-50 p-2 rounded-lg border border-amber-200 text-center flex flex-col justify-center">
                        <span className="text-[10px] font-bold text-amber-700">PRA</span>
                        <span className="text-xl font-black text-amber-900">
                          {h2hAverage.PRA?.toFixed(1) || "-"}
                        </span>
                      </div>

                      {/* Ligne 2 : Combos & Défense */}
                      <MiniStatBox label="Pts+Ast" value={h2hAverage.PA} />
                      <MiniStatBox label="Pts+Reb" value={h2hAverage.PR} />
                      <StatBox label="STL" value={h2hAverage.STL} color="text-orange-600" />
                      <StatBox label="BLK" value={h2hAverage.BLK} color="text-gray-600" />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded">
                    Aucun historique récent contre cette équipe
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Betting Calculator */}
          <div className="border-t pt-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" />
              SIMULATEUR DE PARI
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Statistique</label>
                  <Select value={selectedStat} onValueChange={handleStatChange}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PTS">Points (PTS)</SelectItem>
                      <SelectItem value="REB">Rebounds (REB)</SelectItem>
                      <SelectItem value="AST">Assists (AST)</SelectItem>
                      <SelectItem value="PRA">PRA (Pts+Reb+Ast)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground">Ligne Bookmaker</label>
                  <Input
                    type="number"
                    placeholder="Ex: 22.5"
                    value={bookmakerLine}
                    onChange={(e) => setBookmakerLine(e.target.value)}
                    step="0.5"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="bg-secondary/30 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs text-muted-foreground">Notre Projection</p>
                  <p className="text-2xl font-bold text-primary">{projection.toFixed(1)}</p>
                </div>
                {bookmakerLine && (
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Écart</p>
                    <p className={`text-lg font-bold ${
                      (projection - parseFloat(bookmakerLine)) > 0 ? "text-emerald-600" : "text-red-600"
                    }`}>
                      {(projection - parseFloat(bookmakerLine)) > 0 ? "+" : ""}
                      {(projection - parseFloat(bookmakerLine)).toFixed(1)}
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={!bookmakerLine || parseFloat(bookmakerLine) <= 0}
                className="w-full"
                size="lg"
              >
                Calculer la Probabilité
              </Button>

              {calculatorOpen && calculatorResult && (
                <div className="space-y-4 mt-4 pt-4 border-t animate-in fade-in slide-in-from-top-2">
                  <Card className={getRecommendationColor(calculatorResult.advice, calculatorResult.color_code)}>
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-bold">{calculatorResult.advice}</span>
                        <span className="text-2xl font-bold">{(calculatorResult.probability_over).toFixed(0)}%</span>
                      </div>
                      <Progress value={calculatorResult.probability_over} className="h-2 bg-black/10" />
                      <p className="text-xs text-center mt-2 opacity-80">Probabilité OVER: {calculatorResult.probability_over.toFixed(1)}% | UNDER: {calculatorResult.probability_under.toFixed(1)}%</p>
                      {calculatorResult.confidence && (
                        <p className="text-xs text-center mt-3 opacity-75 italic font-medium">
                          {calculatorResult.confidence}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Petits composants pour le style ---

function StatBox({ label, value, color = "text-foreground" }: { label: string, value: number | undefined, color?: string }) {
  return (
    <div className="bg-background border rounded-lg p-2 text-center">
      <p className="text-[10px] text-muted-foreground font-semibold uppercase">{label}</p>
      <p className={`text-lg font-bold ${color}`}>
        {value?.toFixed(1) || "-"}
      </p>
    </div>
  );
}

function MiniStatBox({ label, value }: { label: string, value: number | undefined }) {
  return (
    <div className="bg-muted/30 border rounded p-2 text-center">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground">
        {value?.toFixed(1) || "-"}
      </p>
    </div>
  );
}
