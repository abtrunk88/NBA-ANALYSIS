# Shooting Battle Module Integration Guide

## Overview
The Shooting Battle module (`ShootingBattleCard`) displays a visual comparison of 2-point vs 3-point shooting predictions between two teams in an NBA matchup.

## Components & Files

### 1. Interfaces (src/services/nbaApi.ts)
```typescript
export interface ShootingStats {
  team: string;
  FG2M: number;
  FG2M_Range: string; // e.g., "27-37"
  FG3M: number;
  FG3M_Range: string; // e.g., "10-15"
  Total_FG: number;
}

export interface ShootingPrediction {
  matchup: string;
  pace_context: string; // e.g., "Rythme Rapide: 100.8"
  home: ShootingStats;
  away: ShootingStats;
  analysis: {
    "3pt_winner": string; // Team code (e.g., "GSW")
    "2pt_winner": string; // Team code (e.g., "LAL")
    "fatigue_impact": string; // "Oui" or "Non"
  };
}
```

### 2. Component (src/components/ShootingBattleCard.tsx)
The component receives a `ShootingPrediction` object and displays:
- **Header**: "Duel de Styles" title with pace_context badge
- **2-Point Battle Section**: Horizontal progress bars showing FG2M predictions
- **3-Point Battle Section**: Horizontal progress bars showing FG3M predictions
- **Fatigue Alert**: Warning message if fatigue impacts 3-point shooting

### 3. API Method (src/services/nbaApi.ts)
```typescript
async getShootingPrediction(
  homeTeamId: string,
  awayTeamId: string
): Promise<ShootingPrediction>
```

## Usage Example

### Basic Usage
```tsx
import { ShootingBattleCard } from "@/components/ShootingBattleCard";
import { ShootingPrediction } from "@/services/nbaApi";

const shootingData: ShootingPrediction = {
  matchup: "LAL vs GSW",
  pace_context: "Rythme Rapide: 100.8",
  home: {
    team: "GSW",
    FG2M: 25.6,
    FG2M_Range: "20-31",
    FG3M: 12.4,
    FG3M_Range: "10-15",
    Total_FG: 38.0
  },
  away: {
    team: "LAL",
    FG2M: 31.9,
    FG2M_Range: "27-37",
    FG3M: 9.8,
    FG3M_Range: "8-12",
    Total_FG: 41.7
  },
  analysis: {
    "2pt_winner": "LAL",
    "3pt_winner": "GSW",
    "fatigue_impact": "Oui"
  }
};

export function MyComponent() {
  return (
    <ShootingBattleCard data={shootingData} />
  );
}
```

### Integration with React Query
```tsx
import { useQuery } from "@tanstack/react-query";
import { nbaApi } from "@/services/nbaApi";
import { ShootingBattleCard } from "@/components/ShootingBattleCard";

export function MatchAnalysis({ homeTeamId, awayTeamId }) {
  const { data: shootingPrediction, isLoading } = useQuery({
    queryKey: ["shooting-prediction", homeTeamId, awayTeamId],
    queryFn: () => nbaApi.getShootingPrediction(homeTeamId, awayTeamId),
    enabled: !!homeTeamId && !!awayTeamId,
  });

  if (isLoading) return <div>Loading...</div>;
  
  return shootingPrediction ? (
    <ShootingBattleCard data={shootingPrediction} />
  ) : null;
}
```

## Integration in MatchPredictionModal

To enable the Shooting Battle card in the MatchPredictionModal:

1. Add the query in the component:
```tsx
const { data: shootingPrediction } = useQuery({
  queryKey: ["shooting-prediction", homeTeamId, awayTeamId],
  queryFn: () => nbaApi.getShootingPrediction(homeTeamId, awayTeamId),
  enabled: open && !!homeTeamId && !!awayTeamId,
});
```

2. Uncomment the section in the modal (currently commented out):
```tsx
{shootingPrediction && (
  <div className="border-t pt-4">
    <ShootingBattleCard data={shootingPrediction} />
  </div>
)}
```

## Visual Design

### Color Scheme
- **2-Point Winner**: Green (#22c55e)
- **3-Point Winner**: Blue (#3b82f6)
- **Losers**: Gray (#a1a5ab)
- **Pace Context Badge**: Gray background

### Layout
- Horizontal progress bars indicate relative strength
- Trophy emoji (🏆) marks the predicted winner for each category
- Team codes displayed alongside values and ranges
- Optional fatigue alert with amber styling

## Backend API Endpoint

The component expects an API endpoint:
```
GET /predict/shooting/{homeTeamId}/{awayTeamId}
```

Returns a `ShootingPrediction` object with the structure defined in the interfaces above.

## Customization Options

To customize the component, modify `ShootingBattleCard.tsx`:
- Change colors in the `className` attributes (green-500, blue-500, gray-400)
- Adjust spacing with Tailwind classes (mb-6, pb-6, space-y-4)
- Modify emoji indicators (replace 🏆 with other icons)
- Update section titles and labels

## Notes

- Progress bar percentages are calculated relative to the maximum value between teams
- The component handles division by zero if both teams have 0 FG
- Responsive design adapts to mobile screens automatically
- Dark mode support included via Tailwind dark: prefixes
