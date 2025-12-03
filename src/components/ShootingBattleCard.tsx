import { useQuery } from "@tanstack/react-query";
import { nbaApi, Player } from "@/services/nbaApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Zap, AlertTriangle, Info } from "lucide-react";

interface ShootingBattleCardProps {
  homeTeamCode: string;
  awayTeamCode: string;
  homeMissingPlayers?: Player[];
  awayMissingPlayers?: Player[];
}

export function ShootingBattleCard({
  homeTeamCode,
  awayTeamCode,
  homeMissingPlayers = [],
  awayMissingPlayers = [],
}: ShootingBattleCardProps) {
  const homeMissingIds = homeMissingPlayers.map(p => p.id);
  const awayMissingIds = awayMissingPlayers.map(p => p.id);

  const { data, isLoading } = useQuery({
    queryKey: [
      "shooting-splits",
      homeTeamCode,
      awayTeamCode,
      homeMissingIds.join(","),
      awayMissingIds.join(","),
    ],
    queryFn: () =>
      nbaApi.getShootingSplits(
        homeTeamCode,
        awayTeamCode,
        homeMissingIds.length > 0 ? homeMissingIds : undefined,
        awayMissingIds.length > 0 ? awayMissingIds : undefined
      ),
    enabled: !!homeTeamCode && !!awayTeamCode,
  });

  if (isLoading) {
    return (
      <Card className="border shadow-sm">
        <CardContent className="p-4">
          <div className="p-4 text-center text-xs text-muted-foreground animate-pulse">
            Analyse des tirs...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const getProgress = (val: number) => Math.min(100, (val / 45) * 100);
  const hasAbsences = homeMissingPlayers.length > 0 || awayMissingPlayers.length > 0;

  return (
    <Card className="mt-4 border-l-4 border-l-blue-500 bg-secondary/10">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            DUEL DE STYLES
          </CardTitle>
          <span className="text-[10px] bg-background px-2 py-1 rounded border shadow-sm flex items-center gap-1">
            <Zap className="h-3 w-3 text-yellow-500" />
            {data.pace_context}
          </span>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-6">
        {/* BATAILLE 2 POINTS */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              PANIERS À 2 POINTS (Intérieur)
            </span>
            {data.analysis["2pt_winner"] === data.home.team ? (
              <span className="text-xs font-bold text-green-600">
                Avantage {data.home.team}
              </span>
            ) : (
              <span className="text-xs font-bold text-green-600">
                Avantage {data.away.team}
              </span>
            )}
          </div>

          {/* Home 2PT */}
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 text-xs font-bold">{data.home.team}</span>
            <Progress value={getProgress(data.home.FG2M)} className="h-2 flex-1" />
            <span className="w-12 text-xs font-bold text-right">{data.home.FG2M}</span>
            <span className="w-16 text-[10px] text-muted-foreground text-right">
              ({data.home.FG2M_Range})
            </span>
          </div>

          {/* Away 2PT */}
          <div className="flex items-center gap-2">
            <span className="w-8 text-xs font-bold">{data.away.team}</span>
            <Progress value={getProgress(data.away.FG2M)} className="h-2 flex-1" />
            <span className="w-12 text-xs font-bold text-right">{data.away.FG2M}</span>
            <span className="w-16 text-[10px] text-muted-foreground text-right">
              ({data.away.FG2M_Range})
            </span>
          </div>
        </div>

        {/* BATAILLE 3 POINTS */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-xs font-semibold text-muted-foreground">
              PANIERS À 3 POINTS (Extérieur)
            </span>
            {data.analysis["3pt_winner"] === data.home.team ? (
              <span className="text-xs font-bold text-blue-600">
                Avantage {data.home.team}
              </span>
            ) : (
              <span className="text-xs font-bold text-blue-600">
                Avantage {data.away.team}
              </span>
            )}
          </div>

          {/* Home 3PT */}
          <div className="flex items-center gap-2 mb-1">
            <span className="w-8 text-xs font-bold">{data.home.team}</span>
            <Progress
              value={getProgress(data.home.FG3M)}
              className="h-2 flex-1 bg-blue-100"
              indicatorClassName="bg-blue-500"
            />
            <span className="w-12 text-xs font-bold text-right">{data.home.FG3M}</span>
            <span className="w-16 text-[10px] text-muted-foreground text-right">
              ({data.home.FG3M_Range})
            </span>
          </div>

          {/* Away 3PT */}
          <div className="flex items-center gap-2">
            <span className="w-8 text-xs font-bold">{data.away.team}</span>
            <Progress
              value={getProgress(data.away.FG3M)}
              className="h-2 flex-1 bg-blue-100"
              indicatorClassName="bg-blue-500"
            />
            <span className="w-12 text-xs font-bold text-right">{data.away.FG3M}</span>
            <span className="w-16 text-[10px] text-muted-foreground text-right">
              ({data.away.FG3M_Range})
            </span>
          </div>
        </div>

        {/* Alerte Fatigue */}
        {data.analysis.fatigue_impact === "Oui" && (
          <div className="flex items-center gap-2 text-[10px] text-amber-600 bg-amber-50 p-2 rounded">
            <AlertTriangle className="h-3 w-3" />
            Attention : La fatigue détectée réduit les projections d'adresse.
          </div>
        )}

        {/* Absences Indicator */}
        {hasAbsences && (
          <div className="flex items-center gap-2 text-[10px] text-blue-600 bg-blue-50 p-2 rounded">
            <Info className="h-3 w-3 flex-shrink-0" />
            ℹ️ Projections ajustées selon les absences sélectionnées.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
