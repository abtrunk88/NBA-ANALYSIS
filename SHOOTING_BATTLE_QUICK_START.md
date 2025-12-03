# Shooting Battle Module - Quick Start Guide

## 📦 What's Included

✅ **ShootingBattleCard Component** - Complete, production-ready React component
✅ **TypeScript Interfaces** - Full type safety for shooting predictions
✅ **API Integration** - Ready-to-use API method
✅ **Documentation** - Comprehensive guides and examples
✅ **Example Data** - 3 realistic shooting prediction examples

## 🚀 Quick Setup

### Step 1: Import the Component
```tsx
import { ShootingBattleCard } from "@/components/ShootingBattleCard";
```

### Step 2: Use with Data
```tsx
<ShootingBattleCard data={shootingPredictionData} />
```

### Step 3: Fetch Data from API
```tsx
const { data: shootingPrediction } = useQuery({
  queryKey: ["shooting-prediction", homeTeamId, awayTeamId],
  queryFn: () => nbaApi.getShootingPrediction(homeTeamId, awayTeamId),
  enabled: !!homeTeamId && !!awayTeamId,
});
```

## 📋 Data Structure

```typescript
{
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
}
```

## 🎨 Visual Features

- **Header**: "Duel de Styles" with pace badge
- **2-Point Section**: Green progress bar for winner, gray for loser
- **3-Point Section**: Blue progress bar for winner, gray for loser
- **Fatigue Alert**: Orange warning when fatigue impacts 3PT accuracy
- **Trophy Emoji**: 🏆 marks the category winner

## 📁 Files Created

| File | Purpose |
|------|---------|
| `src/components/ShootingBattleCard.tsx` | Main component (163 lines) |
| `src/services/nbaApi.ts` | 2 interfaces + 1 API method added |
| `src/components/ShootingBattleCard.example.tsx` | Example data for testing |
| `SHOOTING_BATTLE_INTEGRATION.md` | Full integration guide |
| `SHOOTING_BATTLE_IMPLEMENTATION_SUMMARY.md` | Implementation details |

## 🔧 Enable in MatchPredictionModal

Currently, the Shooting Battle card is commented out in `MatchPredictionModal.tsx`. To enable:

1. Open `src/components/MatchPredictionModal.tsx`
2. Add to the query state:
```tsx
const { data: shootingPrediction } = useQuery({
  queryKey: ["shooting-prediction", homeTeamId, awayTeamId],
  queryFn: () => nbaApi.getShootingPrediction(homeTeamId, awayTeamId),
  enabled: open && !!homeTeamId && !!awayTeamId,
});
```

3. Uncomment lines 343-350 in the modal JSX

## 🧪 Test with Example Data

Use the example component to test without API:

```tsx
import { ShootingBattleCardDemo } from "@/components/ShootingBattleCard.example";

// In your test page
<ShootingBattleCardDemo />
```

This renders 3 different shooting prediction scenarios.

## 🌐 API Endpoint

**Expected Backend Route:**
```
GET /predict/shooting/{homeTeamId}/{awayTeamId}
```

**Expected Response:**
```json
{
  "matchup": "string",
  "pace_context": "string",
  "home": { /* ShootingStats */ },
  "away": { /* ShootingStats */ },
  "analysis": {
    "3pt_winner": "string",
    "2pt_winner": "string",
    "fatigue_impact": "Oui|Non"
  }
}
```

## 🎯 Key Features

✅ **Responsive Design** - Works on mobile, tablet, desktop
✅ **Dark Mode** - Full support for dark theme
✅ **Type Safe** - Complete TypeScript support
✅ **Accessible** - Semantic HTML, proper ARIA attributes
✅ **No Hard-Coded Values** - All data-driven
✅ **Auto-Scaling** - Progress bars scale to max values
✅ **Error Handling** - Graceful handling of edge cases

## 📚 Documentation

- **SHOOTING_BATTLE_INTEGRATION.md** - Comprehensive integration guide
- **SHOOTING_BATTLE_IMPLEMENTATION_SUMMARY.md** - Technical details
- **ShootingBattleCard.example.tsx** - Example implementations
- **SHOOTING_BATTLE_QUICK_START.md** - This file

## 🔍 Component API

```tsx
interface ShootingBattleCardProps {
  data: ShootingPrediction;
}

export function ShootingBattleCard({ data }: ShootingBattleCardProps): React.ReactElement
```

## 🐛 Troubleshooting

**Component not showing?**
- Ensure data prop is a valid ShootingPrediction object
- Check that `analysis.2pt_winner` and `analysis.3pt_winner` match team codes

**Progress bars look wrong?**
- Verify FG2M and FG3M values are positive numbers
- Check that team codes in data match analysis winners

**Fatigue alert not showing?**
- Set `analysis.fatigue_impact` to exactly `"Oui"` (case-sensitive)

## 💡 Customization Tips

**Change 2PT Winner Color:**
In `ShootingBattleCard.tsx`, line 69:
```tsx
is2PTHomeWinner ? "bg-green-500" : "bg-gray-400"
```
Replace `"bg-green-500"` with your color class

**Change 3PT Winner Color:**
In `ShootingBattleCard.tsx`, line 142:
```tsx
is3PTHomeWinner ? "bg-blue-500" : "bg-gray-400"
```
Replace `"bg-blue-500"` with your color class

**Modify Section Titles:**
Update French text in component (lines 42-43 and 100-101)

## ✨ Next Steps

1. Verify backend `/predict/shooting/` endpoint is implemented
2. Enable the component in MatchPredictionModal
3. Test with real API data
4. Optionally add to GameDetails page
5. Monitor performance and user feedback

## 📞 Support

See `SHOOTING_BATTLE_INTEGRATION.md` for:
- Detailed usage examples
- Integration patterns
- Backend expectations
- Customization options
