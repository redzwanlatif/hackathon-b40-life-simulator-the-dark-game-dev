// Base location IDs used across all maps
export type LocationId = "home" | "shop" | "petrol" | "tnb" | "office" | "bank" | "bus";

export interface Location {
  id: LocationId;
  name: string;
  description: string;
  x: number;
  y: number;
  icon: string;
}

export interface MapConfig {
  locations: Record<LocationId, Location>;
  theme: {
    name: string;
    primaryColor: string;
    bgGradient: string;
    gridColor: string;
    roadStyle: "city" | "island";
  };
  landmarks: Array<{
    icon: string;
    name: string;
    x: number;
    y: number;
    size: "sm" | "md" | "lg";
  }>;
}

// KL Map - Big City Theme with skyscrapers and urban feel
export const KL_MAP: MapConfig = {
  locations: {
    home: {
      id: "home",
      name: "Apartment",
      description: "Your small studio apartment in Bangsar",
      x: 12,
      y: 78,
      icon: "🏢",
    },
    shop: {
      id: "shop",
      name: "Mini Market",
      description: "24-hour convenience store",
      x: 12,
      y: 45,
      icon: "🏪",
    },
    petrol: {
      id: "petrol",
      name: "Petronas",
      description: "Petronas station near the highway",
      x: 85,
      y: 45,
      icon: "⛽",
    },
    tnb: {
      id: "tnb",
      name: "TNB",
      description: "Tenaga Nasional office",
      x: 48,
      y: 18,
      icon: "💡",
    },
    office: {
      id: "office",
      name: "Office",
      description: "Your company in the CBD",
      x: 48,
      y: 78,
      icon: "🏢",
    },
    bank: {
      id: "bank",
      name: "Maybank",
      description: "Maybank branch",
      x: 85,
      y: 18,
      icon: "🏦",
    },
    bus: {
      id: "bus",
      name: "LRT",
      description: "LRT station",
      x: 48,
      y: 45,
      icon: "🚇",
    },
  },
  theme: {
    name: "Kuala Lumpur",
    primaryColor: "#00d4ff",
    bgGradient: "from-slate-900 via-blue-950 to-slate-900",
    gridColor: "rgba(0, 212, 255, 0.1)",
    roadStyle: "city",
  },
  landmarks: [],
};

// Penang Map - Island Paradise Theme with beaches and sea
export const PENANG_MAP: MapConfig = {
  locations: {
    home: {
      id: "home",
      name: "Rumah",
      description: "Your rented house near the beach",
      x: 12,
      y: 78,
      icon: "🏠",
    },
    shop: {
      id: "shop",
      name: "Kedai",
      description: "The friendly neighborhood shop",
      x: 12,
      y: 47,
      icon: "🏪",
    },
    petrol: {
      id: "petrol",
      name: "Shell",
      description: "Shell station on the coast road",
      x: 62,
      y: 47,
      icon: "⛽",
    },
    tnb: {
      id: "tnb",
      name: "TNB",
      description: "TNB office in town",
      x: 40,
      y: 18,
      icon: "💡",
    },
    office: {
      id: "office",
      name: "Pejabat",
      description: "Your office in George Town",
      x: 40,
      y: 78,
      icon: "🏢",
    },
    bank: {
      id: "bank",
      name: "Bank",
      description: "Bank near the jetty",
      x: 62,
      y: 18,
      icon: "🏦",
    },
    bus: {
      id: "bus",
      name: "Bas",
      description: "Komtar bus terminal",
      x: 40,
      y: 47,
      icon: "🚌",
    },
  },
  theme: {
    name: "Pulau Pinang",
    primaryColor: "#06b6d4",
    bgGradient: "from-cyan-900 via-blue-900 to-cyan-950",
    gridColor: "rgba(6, 182, 212, 0.1)",
    roadStyle: "island",
  },
  landmarks: [],
};

// Map persona IDs to their maps
export const PERSONA_MAPS: Record<string, MapConfig> = {
  freshGrad: KL_MAP,
  singleParent: PENANG_MAP,
};

// Default locations for backwards compatibility
export const LOCATIONS = KL_MAP.locations;

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
      "You just graduated with a degree in Business Administration. You landed your first job at a startup in KL. Your PTPTN loan payments start this month. Welcome to the big city life.",
  },
  singleParent: {
    id: "singleParent",
    name: "Single Parent",
    description: "Raising a child alone in Penang, juggling work and family",
    location: "Pulau Pinang",
    monthlySalary: 1800,
    initialMoney: 500,
    initialDebt: 7000,
    debtType: "Personal Loan",
    initialCreditScore: 580,
    backstory:
      "After your divorce, you moved back to your hometown island of Penang. You work as an admin clerk while raising your 8-year-old child. The sea breeze is calming, but money is always tight.",
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
