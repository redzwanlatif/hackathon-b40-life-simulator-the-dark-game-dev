import { LocationId, PersonaId, Emotion } from "./constants";

// Game state stored in database
export interface GameState {
  _id: string;
  personaId: PersonaId;
  money: number;
  debt: number;
  creditScore: number;
  health: number;
  stress: number;
  currentDay: number;
  currentWeek: number;
  actionsRemaining: number;
  currentLocation: LocationId;
  isGameOver: boolean;
  createdAt: number;
  updatedAt: number;
}

// Player decision record
export interface Decision {
  _id: string;
  gameId: string;
  location: LocationId;
  scenarioId: string;
  choiceIndex: number;
  choiceText: string;
  moneyChange: number;
  creditChange: number;
  healthChange: number;
  stressChange: number;
  hiddenConsequence?: string;
  consequenceTriggered: boolean;
  day: number;
  week: number;
  timestamp: number;
}

// Claude-generated scenario
export interface Scenario {
  id: string;
  location: LocationId;
  narration: string;
  npcDialogue?: {
    speaker: string;
    text: string;
  };
  emotion: Emotion;
  choices: Choice[];
  foreshadowing?: string;
}

// Choice within a scenario
export interface Choice {
  text: string;
  consequence: {
    money: number;
    credit: number;
    health: number;
    stress: number;
  };
  hiddenConsequence?: string;
  triggerWeek?: number;
}

// Bill tracking
export interface Bill {
  _id: string;
  gameId: string;
  type: "rent" | "electricity" | "water" | "phone" | "ptptn" | "loan";
  amount: number;
  dueDay: number;
  dueWeek: number;
  isPaid: boolean;
  isOverdue: boolean;
}

// Scheduled event (consequence, salary, etc)
export interface ScheduledEvent {
  _id: string;
  gameId: string;
  type: "consequence" | "salary" | "bill" | "random";
  triggerDay: number;
  triggerWeek: number;
  description: string;
  data: Record<string, unknown>;
  isTriggered: boolean;
}

// Credit score event for history
export interface CreditEvent {
  _id: string;
  gameId: string;
  change: number;
  reason: string;
  day: number;
  week: number;
  timestamp: number;
}

// Claude API request/response types
export interface ScenarioRequest {
  gameState: GameState;
  location: LocationId;
  recentDecisions: Decision[];
  pendingConsequences: ScheduledEvent[];
}

export interface ScenarioResponse {
  scenario: Scenario;
}

export interface ChoiceRequest {
  gameId: string;
  scenarioId: string;
  choiceIndex: number;
}

export interface EndingRequest {
  gameState: GameState;
  allDecisions: Decision[];
}

export interface EndingResponse {
  title: string;
  narration: string;
  summary: {
    financialScore: number;
    healthScore: number;
    lessonsLearned: string[];
  };
  epilogue: string;
}
