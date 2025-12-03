import { ShootingPrediction } from "@/services/nbaApi";
import { ShootingBattleCard } from "@/components/ShootingBattleCard";

// Example 1: LAL vs GSW - Close shooting battle
export const exampleShootingPrediction1: ShootingPrediction = {
  matchup: "LAL vs GSW",
  pace_context: "Rythme Rapide: 100.8",
  home: {
    team: "GSW",
    FG2M: 25.6,
    FG2M_Range: "20-31",
    FG3M: 12.4,
    FG3M_Range: "10-15",
    Total_FG: 38.0,
  },
  away: {
    team: "LAL",
    FG2M: 31.9,
    FG2M_Range: "27-37",
    FG3M: 9.8,
    FG3M_Range: "8-12",
    Total_FG: 41.7,
  },
  analysis: {
    "2pt_winner": "LAL",
    "3pt_winner": "GSW",
    "fatigue_impact": "Oui",
  },
};

// Example 2: Boston vs Miami - Fast pace, balanced
export const exampleShootingPrediction2: ShootingPrediction = {
  matchup: "BOS vs MIA",
  pace_context: "Rythme Normal: 97.2",
  home: {
    team: "BOS",
    FG2M: 28.3,
    FG2M_Range: "24-32",
    FG3M: 11.2,
    FG3M_Range: "9-13",
    Total_FG: 39.5,
  },
  away: {
    team: "MIA",
    FG2M: 26.1,
    FG2M_Range: "22-30",
    FG3M: 10.5,
    FG3M_Range: "8-13",
    Total_FG: 36.6,
  },
  analysis: {
    "2pt_winner": "BOS",
    "3pt_winner": "BOS",
    "fatigue_impact": "Non",
  },
};

// Example 3: Denver vs Phoenix - High scoring potential
export const exampleShootingPrediction3: ShootingPrediction = {
  matchup: "DEN vs PHX",
  pace_context: "Rythme Très Rapide: 103.5",
  home: {
    team: "PHX",
    FG2M: 29.7,
    FG2M_Range: "26-34",
    FG3M: 13.1,
    FG3M_Range: "11-16",
    Total_FG: 42.8,
  },
  away: {
    team: "DEN",
    FG2M: 27.4,
    FG2M_Range: "23-31",
    FG3M: 12.8,
    FG3M_Range: "10-15",
    Total_FG: 40.2,
  },
  analysis: {
    "2pt_winner": "PHX",
    "3pt_winner": "PHX",
    "fatigue_impact": "Oui",
  },
};

// Example usage component for testing
export function ShootingBattleCardDemo() {
  return (
    <div className="space-y-6 p-4">
      <div>
        <h2 className="text-xl font-bold mb-4">Example 1: LAL vs GSW</h2>
        <ShootingBattleCard data={exampleShootingPrediction1} />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Example 2: BOS vs MIA</h2>
        <ShootingBattleCard data={exampleShootingPrediction2} />
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Example 3: DEN vs PHX</h2>
        <ShootingBattleCard data={exampleShootingPrediction3} />
      </div>
    </div>
  );
}
