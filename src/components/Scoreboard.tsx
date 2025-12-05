import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { nbaApi, TodayGame } from "@/services/nbaApi";
import { Calendar, Brain, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MatchPredictionModal } from "./MatchPredictionModal";
import { Badge } from "@/components/ui/badge";

const getLogo = (id: any) => `https://cdn.nba.com/logos/nba/${id}/global/L/logo.svg`;

export function Scoreboard() {
  const navigate = useNavigate();
  const [selectedGame, setSelectedGame] = useState<TodayGame | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [failedLogos, setFailedLogos] = useState<Set<string>>(new Set());

  const { data: games, isLoading } = useQuery({
    queryKey: ["48h-games"],
    queryFn: () => nbaApi.get48hGames(),
    refetchInterval: 60000,
  });

  const handleAnalyzeClick = (game: TodayGame) => {
    setSelectedGame(game);
    setModalOpen(true);
  };

  const handleGameCardClick = (game: TodayGame) => {
    navigate(`/game/${game.gameId}`);
  };

  const formatGameTime = (status: string): string => {
    return status.replace(/\sGMT/gi, "").trim();
  };

  const handleLogoError = (teamId: string) => {
    setFailedLogos((prev) => new Set([...prev, teamId]));
  };

  if (isLoading) {
    return (
      <Card className="border-blue-500/30 bg-gradient-to-br from-blue-950/40 to-slate-950/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="h-5 w-5 text-purple-400" />
            Games Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">Loading games...</p>
        </CardContent>
      </Card>
    );
  }

  if (!games || games.length === 0) {
    return (
      <Card className="border-blue-500/30 bg-gradient-to-br from-blue-950/40 to-slate-950/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="h-5 w-5 text-purple-400" />
            Games Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">No games scheduled</p>
        </CardContent>
      </Card>
    );
  }

  const gamesByDate = games.reduce((acc, game) => {
    if (!acc[game.gameDate]) {
      acc[game.gameDate] = [];
    }
    acc[game.gameDate].push(game);
    return acc;
  }, {} as Record<string, typeof games>);

  return (
    <>
      <div className="space-y-8">
        {Object.entries(gamesByDate).map(([date, dateGames]) => (
          <div key={date}>
            {/* Date Section Header */}
            <div className="flex items-center gap-3 mb-6">
              <Badge className="bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-purple-200 border-purple-500/50 text-sm px-4 py-1.5">
                {date}
              </Badge>
              <div className="flex-1 h-[1px] bg-gradient-to-r from-purple-500/30 to-transparent"></div>
              <span className="text-xs font-semibold text-blue-300/60 uppercase">
                {dateGames.length} Game{dateGames.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Games Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {dateGames.map((game) => (
                <div
                  key={game.gameId}
                  className="group relative overflow-hidden rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-950/30 to-slate-950/50 backdrop-blur-md transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer flex flex-col"
                  onClick={() => handleGameCardClick(game)}
                >
                  {/* LIVE Badge */}
                  {game.isLive && (
                    <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full bg-gradient-to-r from-red-500/80 to-red-600/80 backdrop-blur-sm border border-red-400/50">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-300 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-200"></span>
                      </span>
                      <span className="text-xs font-bold text-red-100">LIVE</span>
                    </div>
                  )}

                  {/* Main Content */}
                  <div className="flex-1 p-5">
                    {/* Split Layout: Away Team | Divider | Home Team */}
                    <div className="flex items-center justify-between gap-3 mb-5">
                      {/* Away Team (Left) */}
                      <div className="flex-1 text-center">
                        <p className="text-xs font-semibold text-blue-300/60 uppercase tracking-wide mb-2">
                          Away
                        </p>
                        <div className="flex justify-center mb-2">
                          {game.awayTeamId && !failedLogos.has(`away-${game.gameId}`) ? (
                            <img
                              src={getLogo(game.awayTeamId)}
                              alt={game.awayTeam}
                              className="h-14 w-14 object-contain"
                              onError={() => handleLogoError(`away-${game.gameId}`)}
                            />
                          ) : (
                            <p className="text-lg font-bold text-white truncate">
                              {game.awayTeam}
                            </p>
                          )}
                        </div>
                        {game.awayScore !== undefined && (
                          <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                            {game.awayScore}
                          </p>
                        )}
                      </div>

                      {/* Vertical Divider with Time in Center */}
                      <div className="flex flex-col items-center gap-2 px-2">
                        <div className="w-[2px] h-16 bg-gradient-to-b from-purple-500/30 via-purple-500/10 to-transparent"></div>
                        {game.isLive ? (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] font-bold px-2 py-0.5 whitespace-nowrap">
                            LIVE
                          </Badge>
                        ) : (
                          <span className="text-xs font-medium text-blue-300/70 text-center max-w-[60px] leading-tight">
                            {formatGameTime(game.status)}
                          </span>
                        )}
                        <div className="w-[2px] h-16 bg-gradient-to-t from-purple-500/30 via-purple-500/10 to-transparent"></div>
                      </div>

                      {/* Home Team (Right) */}
                      <div className="flex-1 text-center">
                        <p className="text-xs font-semibold text-blue-300/60 uppercase tracking-wide mb-2">
                          Home
                        </p>
                        <div className="flex justify-center mb-2">
                          {game.homeTeamId && !failedLogos.has(`home-${game.gameId}`) ? (
                            <img
                              src={getLogo(game.homeTeamId)}
                              alt={game.homeTeam}
                              className="h-14 w-14 object-contain"
                              onError={() => handleLogoError(`home-${game.gameId}`)}
                            />
                          ) : (
                            <p className="text-lg font-bold text-white truncate">
                              {game.homeTeam}
                            </p>
                          )}
                        </div>
                        {game.homeScore !== undefined && (
                          <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                            {game.homeScore}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer: View Analysis Button */}
                  <div className="px-5 pb-4 pt-3 border-t border-blue-500/20">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAnalyzeClick(game);
                      }}
                      className="w-full bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:from-purple-500 hover:to-blue-500 text-white border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 h-10 group/btn"
                    >
                      <Brain className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                      View Analysis
                      <ChevronRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>

                  {/* Hover Glow Effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/5 to-blue-600/5"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <MatchPredictionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        game={selectedGame}
      />
    </>
  );
}
