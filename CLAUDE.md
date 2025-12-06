# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

B40 Life Simulator - A 2D walking map game where players navigate a Malaysian neighborhood, make financial decisions, and experience consequences powered by Claude AI. The game teaches financial literacy through lived experience for the B40 demographic (bottom 40% income earners in Malaysia).

## Tech Stack

- **Framework:** Next.js 14 (App Router) with TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui + Framer Motion
- **Database:** Convex (real-time database with server functions)
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)
- **Package Manager:** pnpm (preferred)

## Development Commands

```bash
# Install dependencies
pnpm install

# Start Convex dev server (terminal 1)
npx convex dev

# Start Next.js dev server (terminal 2)
pnpm dev

# Deploy to Vercel
vercel --prod
```

## Architecture

### Core Game Loop
```
Player walks on map → Visits location → Claude generates scenario →
Player makes choice → Credit score/money changes →
Past decisions create future consequences → Emotional impact
```

### Project Structure
```
app/                    # Next.js App Router pages
├── layout.tsx          # Root layout with providers
├── page.tsx            # Landing page
├── setup/page.tsx      # Persona selection
├── game/page.tsx       # Main game screen
└── ending/page.tsx     # Game over / results

components/
├── ui/                 # shadcn components
├── game/               # Game-specific components
│   ├── GameMap.tsx     # Main map with locations
│   ├── PlayerAvatar.tsx
│   ├── LocationDialog.tsx
│   ├── StatsBar.tsx
│   └── CreditScore.tsx
└── providers/          # Context providers

convex/                 # Convex backend
├── schema.ts           # Database schema
├── games.ts            # Game state mutations/queries
├── decisions.ts        # Decision tracking
├── ai.ts               # Claude integration actions
└── creditScore.ts      # Credit calculation logic

lib/
├── prompts.ts          # Claude system prompts
├── constants.ts        # Game constants (locations, personas)
├── utils.ts            # Utility functions
└── types.ts            # TypeScript types
```

### Key Data Models

- **games:** Main game state (money, debt, credit score, bills, relationships, stats)
- **decisions:** Player choice history with hidden consequences
- **creditEvents:** Credit score change tracking
- **scheduledEvents:** Future consequences, bills, salary

### Game Constants

**7 Locations:** home, shop (Kedai Pak Ali), petrol (Petronas), tnb, office (Pejabat), bank, bus (Bas Stop)

**3 Personas:**
- Fresh Grad KL (RM2200/month, RM30k PTPTN debt, 650 credit)
- Single Parent Penang (RM1800/month, RM7k debt, 580 credit)
- Factory Worker JB (RM1600/month, RM500 CC debt, 620 credit)

### Claude Integration

Claude acts as Game Master generating:
- Immersive scenarios with Manglish dialogue
- NPC personalities (Pak Ali, Boss, Roommate, Family)
- Choices with hidden consequences that trigger later
- Personalized endings based on decision history

Output format is JSON with: narration, npcDialogue, emotion, choices (with consequences), foreshadowing.

## Environment Variables

```bash
CONVEX_DEPLOYMENT=your-deployment-name
ANTHROPIC_API_KEY=sk-ant-xxxxx
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

## Design Philosophy

- Show consequences, don't lecture
- Reference past decisions for emotional impact
- NPCs should remember past interactions
- Mix English with Manglish naturally
- Each choice has clear trade-offs (money vs health, now vs later)
