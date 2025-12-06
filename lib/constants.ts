// Game locations on the map
export const LOCATIONS = {
  home: {
    id: "home",
    name: "Home",
    description: "Your small apartment",
    x: 50,
    y: 80,
    icon: "🏠",
  },
  shop: {
    id: "shop",
    name: "Kedai Pak Ali",
    description: "The neighborhood sundry shop",
    x: 20,
    y: 50,
    icon: "🏪",
  },
  petrol: {
    id: "petrol",
    name: "Petronas",
    description: "Petrol station",
    x: 80,
    y: 50,
    icon: "⛽",
  },
  tnb: {
    id: "tnb",
    name: "TNB",
    description: "Electricity company office",
    x: 35,
    y: 30,
    icon: "💡",
  },
  office: {
    id: "office",
    name: "Pejabat",
    description: "Your workplace",
    x: 70,
    y: 20,
    icon: "🏢",
  },
  bank: {
    id: "bank",
    name: "Bank",
    description: "Local bank branch",
    x: 50,
    y: 40,
    icon: "🏦",
  },
  bus: {
    id: "bus",
    name: "Bas Stop",
    description: "Bus station",
    x: 15,
    y: 70,
    icon: "🚌",
  },
} as const;

export type LocationId = keyof typeof LOCATIONS;

// Character personas
export const PERSONAS = {
  freshGrad: {
    id: "freshGrad",
    name: "Fresh Graduate",
    description: "Just finished university, starting life in KL with PTPTN debt",
    location: "Kuala Lumpur",
    monthlySalary: 2200,
    initialMoney: 800,
    initialDebt: 30000,
    debtType: "PTPTN",
    initialCreditScore: 650,
    backstory:
      "You just graduated with a degree in Business Administration. You landed your first job at a small company in KL. Your PTPTN loan payments start this month.",
  },
  singleParent: {
    id: "singleParent",
    name: "Single Parent",
    description: "Raising a child alone in Penang, juggling work and family",
    location: "Penang",
    monthlySalary: 1800,
    initialMoney: 500,
    initialDebt: 7000,
    debtType: "Personal Loan",
    initialCreditScore: 580,
    backstory:
      "After your divorce, you moved back to Penang to be closer to family. You work as an admin clerk while raising your 8-year-old child. Money is always tight.",
  },
  factoryWorker: {
    id: "factoryWorker",
    name: "Factory Worker",
    description: "Working at a factory in JB, trying to make ends meet",
    location: "Johor Bahru",
    monthlySalary: 1600,
    initialMoney: 300,
    initialDebt: 500,
    debtType: "Credit Card",
    initialCreditScore: 620,
    backstory:
      "You work the night shift at an electronics factory. The pay is low but steady. You have a small credit card debt from when you had to fix your motorcycle.",
  },
} as const;

export type PersonaId = keyof typeof PERSONAS;

// Game configuration
export const GAME_CONFIG = {
  actionsPerDay: 3,
  daysPerWeek: 7,
  totalWeeks: 12,
  startingHealth: 100,
  startingStress: 20,
  billDueDay: 15, // Day of week when bills are due
  salaryDay: 28, // Day of month when salary arrives
  rentAmount: 500,
  electricityBillBase: 80,
  waterBillBase: 30,
  phoneBillBase: 50,
  creditScoreMin: 300,
  creditScoreMax: 850,
} as const;

// NPC names for consistent personality
export const NPCS = {
  pakAli: {
    name: "Pak Ali",
    role: "Shopkeeper",
    personality: "Kind old man who runs the kedai runcit. Gives credit sometimes.",
  },
  boss: {
    name: "Encik Ahmad",
    role: "Boss",
    personality: "Strict but fair. Values punctuality and hard work.",
  },
  roommate: {
    name: "Farid",
    role: "Roommate",
    personality: "Friendly but sometimes borrows money without returning.",
  },
  bankOfficer: {
    name: "Puan Siti",
    role: "Bank Officer",
    personality: "Professional, follows rules strictly.",
  },
  loanShark: {
    name: "Along",
    role: "Loan Shark",
    personality: "Seems friendly at first, but dangerous when you owe money.",
  },
} as const;

// Emotion types for UI display
export const EMOTIONS = [
  "neutral",
  "happy",
  "sad",
  "stressed",
  "angry",
  "hopeful",
  "desperate",
  "relieved",
] as const;

export type Emotion = (typeof EMOTIONS)[number];
