import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Zap } from "lucide-react";
import { ShootingPrediction } from "@/services/nbaApi";

interface ShootingBattleCardProps {
  data: ShootingPrediction;
}

export function ShootingBattleCard({ data }: ShootingBattleCardProps) {
  const homeTeam = data.home;
  const awayTeam = data.away;
  const analysis = data.analysis;

  // Calculate max values for progress bar scaling
  const max2PT = Math.max(homeTeam.FG2M, awayTeam.FG2M);
  const max3PT = Math.max(homeTeam.FG3M, awayTeam.FG3M);

  const home2PTPercentage = (homeTeam.FG2M / max2PT) * 100;
  const away2PTPercentage = (awayTeam.FG2M / max2PT) * 100;
  const home3PTPercentage = (homeTeam.FG3M / max3PT) * 100;
  const away3PTPercentage = (awayTeam.FG3M / max3PT) * 100;

  const is2PTHomeWinner = analysis["2pt_winner"] === homeTeam.team;
  const is3PTHomeWinner = analysis["3pt_winner"] === homeTeam.team;

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold">Duel de Styles</h3>
          <Badge variant="secondary" className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200">
            <Zap className="h-3 w-3 mr-1" />
            {data.pace_context}
          </Badge>
        </div>

        {/* Section 1: 2-Point Battle */}
        <div className="space-y-4 mb-6 pb-6 border-b">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase">
            Paniers à 2 Points (FGM)
          </h4>

          {/* Home Team 2PT */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{homeTeam.team}</span>
                {is2PTHomeWinner && <span className="text-lg">🏆</span>}
              </div>
              <div className="text-right">
                <span className="text-sm font-bold">{homeTeam.FG2M}</span>
                <span className="text-xs text-muted-foreground ml-2">({homeTeam.FG2M_Range})</span>
              </div>
            </div>
            <Progress
              value={home2PTPercentage}
              className="h-3"
              style={{
                backgroundColor: "hsl(var(--muted))",
              }}
            />
            {/* Custom styled progress bar for home team 2pt */}
            <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  is2PTHomeWinner ? "bg-green-500" : "bg-gray-400"
                }`}
                style={{ width: `${home2PTPercentage}%` }}
              />
            </div>
          </div>

          {/* Away Team 2PT */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{awayTeam.team}</span>
                {!is2PTHomeWinner && <span className="text-lg">🏆</span>}
              </div>
              <div className="text-right">
                <span className="text-sm font-bold">{awayTeam.FG2M}</span>
                <span className="text-xs text-muted-foreground ml-2">({awayTeam.FG2M_Range})</span>
              </div>
            </div>
            <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  !is2PTHomeWinner ? "bg-green-500" : "bg-gray-400"
                }`}
                style={{ width: `${away2PTPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: 3-Point Battle */}
        <div className="space-y-4 mb-6 pb-6 border-b">
          <h4 className="text-sm font-semibold text-muted-foreground uppercase">
            Paniers à 3 Points (FGM)
          </h4>

          {/* Home Team 3PT */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{homeTeam.team}</span>
                {is3PTHomeWinner && <span className="text-lg">🏆</span>}
              </div>
              <div className="text-right">
                <span className="text-sm font-bold">{homeTeam.FG3M}</span>
                <span className="text-xs text-muted-foreground ml-2">({homeTeam.FG3M_Range})</span>
              </div>
            </div>
            <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  is3PTHomeWinner ? "bg-blue-500" : "bg-gray-400"
                }`}
                style={{ width: `${home3PTPercentage}%` }}
              />
            </div>
          </div>

          {/* Away Team 3PT */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{awayTeam.team}</span>
                {!is3PTHomeWinner && <span className="text-lg">🏆</span>}
              </div>
              <div className="text-right">
                <span className="text-sm font-bold">{awayTeam.FG3M}</span>
                <span className="text-xs text-muted-foreground ml-2">({awayTeam.FG3M_Range})</span>
              </div>
            </div>
            <div className="relative h-3 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  !is3PTHomeWinner ? "bg-blue-500" : "bg-gray-400"
                }`}
                style={{ width: `${away3PTPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Fatigue Impact Alert */}
        {analysis.fatigue_impact === "Oui" && (
          <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700 rounded p-3">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              ⚠️ La fatigue réduit l'adresse extérieure estimée.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
