import { useState } from "react";
import { Player } from "@/services/nbaApi";
import { PlayerSearch } from "@/components/PlayerSearch";
import { Scoreboard } from "@/components/Scoreboard";
import { PlayerDashboard } from "@/components/PlayerDashboard";
import { AppUpdatesModal } from "@/components/AppUpdatesModal";
import { Zap, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | undefined>();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900">
      {/* ============ STICKY HEADER ============ */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-blue-500/20 bg-gradient-to-r from-slate-950/95 to-blue-950/95 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Left: Logo & App Name */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
              <div className="relative px-3 py-2 bg-slate-950 rounded-lg">
                <TrendingUp className="h-6 w-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 font-display">
                NBA Data AI
              </h1>
              <p className="text-xs text-blue-300/60">Sports Performance Analytics</p>
            </div>
          </div>

          {/* Right: Updates Modal Button */}
          <AppUpdatesModal />
        </div>
      </header>

      {/* ============ HERO SECTION ============ */}
      <div className="relative pt-28 pb-12 px-4 overflow-hidden">
        {/* Gradient background effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl opacity-50"></div>

        <div className="container mx-auto relative z-10">
          <div className="text-center space-y-6 mb-8">
            {/* Badge */}
            <div className="flex justify-center">
              <Badge className="bg-gradient-to-r from-purple-500/30 to-blue-500/30 text-purple-200 border-purple-500/50 hover:bg-purple-500/40 text-sm px-4 py-1.5 rounded-full">
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                v1.7 Expert Model Active
              </Badge>
            </div>

            {/* Headline */}
            <div className="space-y-3">
              <h2 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-blue-200 font-display leading-tight">
                Advanced Artificial Intelligence
              </h2>
              <p className="text-xl text-blue-200/70 max-w-3xl mx-auto">
                for Sports Performance
              </p>
            </div>

            {/* Stats Pills */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <div className="px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30 backdrop-blur-sm">
                <p className="text-sm font-medium text-blue-200">
                  <span className="text-white font-bold">Live Data</span>
                  <span className="text-blue-300/60 ml-2">•</span>
                  <span className="text-blue-300/60 ml-2">Real-time Updates</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============ MAIN CONTENT ============ */}
      <main className="relative z-10 container mx-auto px-4 pb-20">
        {/* Conditional Display: Home vs Player Dashboard */}
        {!selectedPlayer ? (
          <>
            {/* Floating Search Bar - Sticky Below Header */}
            <div className="sticky top-24 z-40 mb-8 -mx-4 px-4 py-4 bg-gradient-to-b from-slate-950 to-slate-950/0 backdrop-blur-sm">
              <div className="max-w-2xl mx-auto">
                <PlayerSearch
                  onSelectPlayer={setSelectedPlayer}
                  selectedPlayer={selectedPlayer}
                  placeholder="Search team..."
                />
              </div>
            </div>

            {/* Scoreboard / Games Grid */}
            <Scoreboard />
          </>
        ) : (
          <>
            {/* Back to Search */}
            <div className="mb-8">
              <PlayerSearch
                onSelectPlayer={setSelectedPlayer}
                selectedPlayer={selectedPlayer}
                placeholder="Search team..."
              />
            </div>

            {/* Player Dashboard */}
            <PlayerDashboard player={selectedPlayer} />
          </>
        )}
      </main>

      {/* ============ FOOTER ============ */}
      <footer className="relative z-10 border-t border-blue-500/20 mt-20 bg-gradient-to-t from-slate-950 to-transparent">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-blue-300/40">
          <p>NBA Data AI • Advanced Performance Insights & Predictions</p>
          <p className="mt-2 text-xs text-blue-400/30">Data from NBA Stats API • AI-Powered Analysis</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
