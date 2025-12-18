# B40 Life Simulator - Complete Game Flow

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│                    Next.js 16 (App Router)                       │
│                                                                  │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐     │
│  │  Setup   │ → │   Game   │ → │  Ending  │ → │Analytics │     │
│  │  Page    │   │   Page   │   │   Page   │   │   Page   │     │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘     │
└────────────────────────────────────────────────────────────────┘
           │                │                │
           ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      CONVEX (Real-time DB)                       │
│                                                                  │
│  Tables: games, decisions, creditEvents, bills, scheduledEvents │
│                                                                  │
│  Functions: createGame, updateGameState, recordDecision,        │
│             advanceDay, selectWeekendActivity, checkGameOver    │
└─────────────────────────────────────────────────────────────────┘
           │                                │
           ▼                                ▼
┌─────────────────────┐         ┌─────────────────────────────────┐
│   Claude AI (API)   │         │           TiDB Cloud            │
│                     │         │                                  │
│  - Scenario Gen     │         │  Tables:                         │
│  - Ending Gen       │         │  - completed_games              │
│  - NPC Dialogue     │         │  - player_decisions             │
│                     │         │  - weekly_snapshots             │
└─────────────────────┘         └─────────────────────────────────┘
```

---

## Complete Player Journey

### Phase 1: Game Setup (`/setup`)

**Player Actions:**
1. Player enters their name
2. Player selects a persona (character):
   - **Fresh Graduate (KL)**: RM2,200/month salary, RM30,000 PTPTN debt, 650 credit score
   - **Single Parent (Penang)**: RM1,800/month salary, RM7,000 debt, 580 credit score

**System Flow:**
```
User Input → createGame mutation → Convex DB
                                       ↓
                              New game record created:
                              - gameId (unique ID)
                              - playerName
                              - personaId
                              - Initial stats (money, debt, credit, health, stress)
                              - Week 1, Day 1
                              - Energy: 3
                              - Location: home
```

**Database State (Convex):**
```javascript
{
  _id: "abc123...",
  playerName: "Ahmad",
  personaId: "freshGrad",
  money: 500,           // Starting balance
  debt: 30000,          // PTPTN loan
  creditScore: 650,
  health: 80,
  stress: 30,
  currentWeek: 1,
  currentDay: 1,
  energyRemaining: 3,
  currentLocation: "home",
  isGameOver: false,
  weeklyObjectives: {
    workDaysCompleted: 0,
    boughtGroceries: false,
    filledPetrol: false,
    paidDebt: false
  }
}
```

---

### Phase 2: Daily Gameplay Loop (`/game`)

**Game Map Locations:**
- 🏠 Home (starting point)
- 🏢 Office (earn money, complete work)
- 🛒 Kedai Pak Ali (buy groceries)
- ⛽ Petronas (fill petrol)
- 🏦 Bank (pay debt - Week 4 only)

**Daily Flow:**

```
┌─────────────────────────────────────────────────────────────────┐
│                        DAY STARTS                                │
│                    Energy: 3 points                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              PLAYER CLICKS LOCATION ON MAP                       │
│                                                                  │
│   moveToLocation mutation:                                       │
│   - Updates currentLocation                                      │
│   - Decrements energyRemaining by 1                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                 CLAUDE AI GENERATES SCENARIO                     │
│                                                                  │
│   Input:                                                         │
│   - Current location                                             │
│   - Player stats (money, health, stress, credit)                │
│   - Recent decisions history                                     │
│   - Persona context                                              │
│                                                                  │
│   Output (JSON):                                                 │
│   - narration (story text)                                       │
│   - npcDialogue (Manglish dialogue)                             │
│   - emotion (player feeling)                                     │
│   - choices (2-3 options with consequences)                      │
│   - foreshadowing (hints at future)                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              PLAYER SELECTS A CHOICE                             │
│                                                                  │
│   Example choices at Office:                                     │
│   1. "Work overtime" (+RM50, +10 stress)                        │
│   2. "Leave on time" (+RM0, -5 stress)                          │
│   3. "Skip work" (-RM100, -10 stress, -20 credit)               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              DECISION RECORDED & STATS UPDATED                   │
│                                                                  │
│   recordDecision mutation:                                       │
│   - Stores choice in decisions table                             │
│   - Links to gameId, location, week, day                         │
│                                                                  │
│   updateGameState mutation:                                      │
│   - Applies money/health/stress/credit changes                   │
│   - Checks for game over conditions                              │
│                                                                  │
│   completeObjective mutation (if applicable):                    │
│   - Updates weeklyObjectives                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CHECK ENERGY                                  │
│                                                                  │
│   Energy > 0?  ─────▶  YES: Continue playing                    │
│       │                                                          │
│       ▼                                                          │
│      NO: Show "Next Day" button                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### Phase 3: End of Day

**When player clicks "Next Day" button:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    advanceDay mutation                           │
│                                                                  │
│   1. Increment currentDay                                        │
│   2. Reset energyRemaining to 3                                  │
│   3. Reset workedToday flag                                      │
│                                                                  │
│   If Day > 5 (end of work week):                                 │
│   - Check weeklyObjectives completion                            │
│   - Trigger weekend selection                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

### Phase 4: Weekly Objectives Check

**Weekly Requirements:**
- ✅ Work at least 5 days
- ✅ Buy groceries at least once
- ✅ Fill petrol at least once
- ✅ Pay debt (Week 4 only)

**Objective Completion Flow:**
```
Player visits Office → completeObjective("work") → workDaysCompleted++
Player visits Shop → completeObjective("groceries") → boughtGroceries = true
Player visits Petrol → completeObjective("petrol") → filledPetrol = true
Player visits Bank (Week 4) → completeObjective("debt") → paidDebt = true
```

**Failure Condition:**
If Day 5 ends and objectives incomplete:
- Missing work days → Credit score drops, possible termination
- No groceries → Health drops significantly
- No petrol → Stress increases, transportation issues

---

### Phase 5: Weekend Activity Selection

**Triggered at end of Day 5:**

```
┌─────────────────────────────────────────────────────────────────┐
│                  WEEKEND DIALOG APPEARS                          │
│                                                                  │
│   Options:                                                       │
│   1. Rest at Home (Free, -20 stress, +10 health)                │
│   2. Lepak Mamak (-RM30, -15 stress, +5 health)                 │
│   3. Jogging in Park (Free, -25 stress, +15 health)             │
│   4. Skip Weekend (No change, save time)                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│            selectWeekendActivity mutation                        │
│                                                                  │
│   1. Apply stat changes (health, stress, money)                  │
│   2. Reset weeklyObjectives for new week                         │
│   3. Increment currentWeek                                       │
│   4. Reset currentDay to 1                                       │
│   5. Reset energyRemaining to 3                                  │
│                                                                  │
│   Week 4 Special: Pay salary (RM2200 or RM1800)                 │
│   Week 4 Special: Deduct debt payment (5% of debt, min RM200)   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              SYNC TO TIDB (Weekly Snapshot)                      │
│                                                                  │
│   syncWeeklyProgress action:                                     │
│   1. Fetch game state from Convex                                │
│   2. Fetch week's decisions from Convex                          │
│   3. POST to /api/analytics/sync with:                           │
│      - Weekly snapshot data                                      │
│      - Decisions data                                            │
│   4. TiDB stores in weekly_snapshots & player_decisions          │
└─────────────────────────────────────────────────────────────────┘
```

**TiDB Weekly Snapshot Record:**
```sql
INSERT INTO weekly_snapshots (
  convex_game_id, player_name, persona_id, week,
  money, debt, credit_score, health, stress,
  objectives_completed, work_days_completed,
  bought_groceries, filled_petrol, paid_debt,
  weekend_activity, is_game_over
) VALUES (
  'abc123...', 'Ahmad', 'freshGrad', 1,
  750, 30000, 655, 85, 25,
  TRUE, 5,
  TRUE, TRUE, FALSE,
  'rest', FALSE
);
```

---

### Phase 6: Game Over Conditions

**Game ends when any condition is met:**

```
┌─────────────────────────────────────────────────────────────────┐
│                    GAME OVER TRIGGERS                            │
│                                                                  │
│   1. Health ≤ 0       → "Health Crisis" ending                  │
│   2. Stress ≥ 100     → "Burnout" ending                        │
│   3. Money < -500     → "Bankruptcy" ending                      │
│   4. Credit Score < 300 → "Credit Destroyed" ending             │
│   5. Week 4 completed → "Survived" or "Thrived" ending          │
│   6. Failed objectives → "Objectives Failed" ending              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│           checkGameOverCondition mutation                        │
│                                                                  │
│   1. Evaluate all conditions                                     │
│   2. Set isGameOver = true                                       │
│   3. Set endingType and failureReason                            │
│   4. Calculate final score                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              SYNC TO TIDB (Final Sync)                           │
│                                                                  │
│   Two syncs occur:                                               │
│                                                                  │
│   1. syncWeeklyProgress (current week data)                      │
│      → weekly_snapshots table                                    │
│      → player_decisions table                                    │
│                                                                  │
│   2. syncCompletedGame (final game data)                         │
│      → completed_games table                                     │
│      → All decisions synced                                      │
└─────────────────────────────────────────────────────────────────┘
```

**TiDB Completed Game Record:**
```sql
INSERT INTO completed_games (
  convex_game_id, player_name, persona_id,
  final_money, final_credit_score, final_health, final_stress, final_debt,
  weeks_completed, ending_type, failure_reason
) VALUES (
  'abc123...', 'Ahmad', 'freshGrad',
  250, 620, 65, 55, 29500,
  4, 'survived', NULL
);
```

---

### Phase 7: Ending Screen (`/ending`)

**Claude AI generates personalized ending:**

```
┌─────────────────────────────────────────────────────────────────┐
│                   generateEnding action                          │
│                                                                  │
│   Input:                                                         │
│   - Final stats (money, credit, health, stress, debt)           │
│   - Ending type                                                  │
│   - Key decisions made throughout game                           │
│   - Persona context                                              │
│                                                                  │
│   Output:                                                        │
│   - Personalized narrative                                       │
│   - Reflection on choices                                        │
│   - Financial lessons learned                                    │
│   - Future outlook                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LEADERBOARD ENTRY                             │
│                                                                  │
│   Score calculation:                                             │
│   - Weeks completed × 100                                        │
│   - Bonus for positive credit change                             │
│   - Bonus for low stress                                         │
│   - Bonus for good health                                        │
│   - Bonus for debt reduction                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

### Phase 8: Analytics Dashboard (`/analytics`)

**Data Flow from TiDB:**

```
┌─────────────────────────────────────────────────────────────────┐
│                  /api/analytics/stats                            │
│                                                                  │
│   Queries TiDB for:                                              │
│   1. getGlobalStats() → Total players, completion rates          │
│   2. getPersonaStats() → Breakdown by persona                    │
│   3. getDecisionAnalytics() → Choice patterns                    │
│   4. getWeeklyProgression() → Week-over-week data                │
│   5. getKeyInsights() → Behavioral patterns                      │
│   6. getSurvivalFunnel() → Drop-off analysis                     │
└─────────────────────────────────────────────────────────────────┘
```

**Analytics Insights Generated:**

| Metric | Description |
|--------|-------------|
| Total Games Played | Count of all game sessions |
| Completion Rate | % who finished all 4 weeks |
| Avg Credit Score Change | Financial literacy indicator |
| Unhealthy Food Rate | % choosing cheap unhealthy options |
| Weekend Skip Rate | % who skip self-care |
| Survival Funnel | Week 1→2→3→4 retention |

---

## Database Schema Summary

### Convex (Real-time Gameplay)

| Table | Purpose |
|-------|---------|
| `games` | Active game state, player stats |
| `decisions` | Choice history with consequences |
| `creditEvents` | Credit score change log |
| `bills` | Scheduled bills and payments |
| `scheduledEvents` | Future consequences |
| `leaderboard` | High scores |

### TiDB (Analytics)

| Table | Purpose |
|-------|---------|
| `completed_games` | Final game results |
| `player_decisions` | All choices for analysis |
| `weekly_snapshots` | Week-end state captures |

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/analytics/sync` | POST | Sync data to TiDB |
| `/api/analytics/stats` | GET | Fetch analytics data |
| `/api/analytics/export` | GET | Export data (CSV/JSON) |
| `/api/analytics/clear` | POST | Clear TiDB data (dev) |
| `/api/analytics/migrate` | POST | Run TiDB migrations |
| `/api/analytics/simulate` | POST | Simulate game data |

---

## Environment Variables

```bash
# Convex
CONVEX_DEPLOYMENT=prod:ideal-oriole-86
NEXT_PUBLIC_CONVEX_URL=https://ideal-oriole-86.convex.cloud

# AI
ANTHROPIC_API_KEY=sk-ant-...

# TiDB
TIDB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=312XxrbjruCubs2.root
TIDB_PASSWORD=***
TIDB_DATABASE=test

# Internal
INTERNAL_API_KEY=b40-tidb-sync-key-2024
NEXT_PUBLIC_APP_URL=https://hackathon-b40-life-simulator.vercel.app
```

---

## Complete Data Journey

```
1. GAME START
   └── Convex: Create game record

2. DAILY PLAY
   ├── Claude AI: Generate scenarios
   ├── Convex: Record decisions, update stats
   └── Frontend: Display choices

3. WEEK END
   ├── Convex: Weekend activity, advance week
   └── TiDB: Sync weekly_snapshots + player_decisions

4. GAME OVER
   ├── Convex: Mark game complete
   ├── TiDB: Sync weekly data + completed_games
   └── Claude AI: Generate ending narrative

5. ANALYTICS
   └── TiDB: Query aggregated data for insights
```

---

## Key Features

- **Real-time Gameplay**: Convex provides instant updates
- **AI-Powered Scenarios**: Claude generates contextual stories
- **Persistent Analytics**: TiDB stores historical data
- **Weekly Snapshots**: Track player progress over time
- **Dual Database**: Convex (hot) + TiDB (analytical)
- **Fire-and-Forget Sync**: Non-blocking data sync to TiDB
