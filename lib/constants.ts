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
    roadStyle: "modern" | "heritage" | "industrial";
  };
  landmarks: Array<{
    icon: string;
    name: string;
    x: number;
    y: number;
    size: "sm" | "md" | "lg";
  }>;
}

// KL Map - Modern, organized urban layout with landmarks
export const KL_MAP: MapConfig = {
  locations: {
    home: {
      id: "home",
      name: "Apartment",
      description: "Your small studio apartment in Subang",
      x: 75,
      y: 75,
      icon: "🏢",
    },
    shop: {
      id: "shop",
      name: "7-Eleven",
      description: "24-hour convenience store",
      x: 25,
      y: 45,
      icon: "🏪",
    },
    petrol: {
      id: "petrol",
      name: "Petronas",
      description: "Petronas station near the highway",
      x: 85,
      y: 35,
      icon: "⛽",
    },
    tnb: {
      id: "tnb",
      name: "TNB",
      description: "Tenaga Nasional office",
      x: 45,
      y: 25,
      icon: "💡",
    },
    office: {
      id: "office",
      name: "Office Tower",
      description: "Your company's office in Bangsar South",
      x: 65,
      y: 18,
      icon: "🏢",
    },
    bank: {
      id: "bank",
      name: "Maybank",
      description: "Maybank branch in the mall",
      x: 35,
      y: 55,
      icon: "🏦",
    },
    bus: {
      id: "bus",
      name: "LRT Station",
      description: "Kelana Jaya LRT station",
      x: 15,
      y: 70,
      icon: "🚇",
    },
  },
  theme: {
    name: "Kuala Lumpur",
    primaryColor: "#00d4ff",
    bgGradient: "from-slate-900 via-blue-950 to-slate-900",
    gridColor: "rgba(0, 212, 255, 0.1)",
    roadStyle: "modern",
  },
  landmarks: [
    { icon: "🎢", name: "Sunway Lagoon", x: 50, y: 85, size: "lg" },
    { icon: "🏙️", name: "KLCC", x: 90, y: 10, size: "md" },
    { icon: "🛒", name: "Sunway Pyramid", x: 40, y: 75, size: "md" },
    { icon: "🌳", name: "Lake Gardens", x: 10, y: 25, size: "sm" },
  ],
};

// Penang Map - Heritage town with coastal vibes
export const PENANG_MAP: MapConfig = {
  locations: {
    home: {
      id: "home",
      name: "Rumah",
      description: "Your rented terrace house in Air Itam",
      x: 70,
      y: 70,
      icon: "🏠",
    },
    shop: {
      id: "shop",
      name: "Kedai Ah Hock",
      description: "The old Chinese grocery shop",
      x: 35,
      y: 40,
      icon: "🏪",
    },
    petrol: {
      id: "petrol",
      name: "Shell",
      description: "Shell station on Jalan Burma",
      x: 20,
      y: 65,
      icon: "⛽",
    },
    tnb: {
      id: "tnb",
      name: "TNB",
      description: "TNB office in Komtar",
      x: 50,
      y: 30,
      icon: "💡",
    },
    office: {
      id: "office",
      name: "Pejabat",
      description: "Your office in George Town",
      x: 25,
      y: 25,
      icon: "🏢",
    },
    bank: {
      id: "bank",
      name: "Public Bank",
      description: "Bank branch near the market",
      x: 55,
      y: 50,
      icon: "🏦",
    },
    bus: {
      id: "bus",
      name: "Rapid Penang",
      description: "Bus terminal at Weld Quay",
      x: 15,
      y: 45,
      icon: "🚌",
    },
  },
  theme: {
    name: "Penang",
    primaryColor: "#fbbf24",
    bgGradient: "from-amber-950 via-slate-900 to-cyan-950",
    gridColor: "rgba(251, 191, 36, 0.08)",
    roadStyle: "heritage",
  },
  landmarks: [
    { icon: "🏯", name: "Kek Lok Si", x: 85, y: 55, size: "lg" },
    { icon: "🏖️", name: "Batu Ferringhi", x: 75, y: 15, size: "md" },
    { icon: "🎨", name: "Street Art", x: 30, y: 15, size: "sm" },
    { icon: "⛰️", name: "Penang Hill", x: 90, y: 35, size: "md" },
    { icon: "🌊", name: "Straits", x: 5, y: 80, size: "sm" },
  ],
};

// JB Map - Industrial border town
export const JB_MAP: MapConfig = {
  locations: {
    home: {
      id: "home",
      name: "Rumah Sewa",
      description: "Your rented flat in Tampoi",
      x: 30,
      y: 70,
      icon: "🏠",
    },
    shop: {
      id: "shop",
      name: "Kedai Mamak",
      description: "The 24-hour mamak near your flat",
      x: 45,
      y: 55,
      icon: "🍜",
    },
    petrol: {
      id: "petrol",
      name: "Petronas",
      description: "Petronas station on the way to work",
      x: 70,
      y: 45,
      icon: "⛽",
    },
    tnb: {
      id: "tnb",
      name: "TNB",
      description: "TNB office in Johor Jaya",
      x: 25,
      y: 35,
      icon: "💡",
    },
    office: {
      id: "office",
      name: "Kilang",
      description: "Your factory in Pasir Gudang",
      x: 85,
      y: 25,
      icon: "🏭",
    },
    bank: {
      id: "bank",
      name: "CIMB",
      description: "CIMB bank branch in City Square",
      x: 55,
      y: 75,
      icon: "🏦",
    },
    bus: {
      id: "bus",
      name: "Larkin",
      description: "Larkin bus terminal",
      x: 15,
      y: 50,
      icon: "🚌",
    },
  },
  theme: {
    name: "Johor Bahru",
    primaryColor: "#f97316",
    bgGradient: "from-slate-900 via-orange-950 to-slate-900",
    gridColor: "rgba(249, 115, 22, 0.08)",
    roadStyle: "industrial",
  },
  landmarks: [
    { icon: "🌉", name: "CIQ", x: 75, y: 85, size: "lg" },
    { icon: "🇸🇬", name: "Singapore", x: 90, y: 90, size: "md" },
    { icon: "🏗️", name: "Industrial Zone", x: 90, y: 40, size: "md" },
    { icon: "🛒", name: "City Square", x: 60, y: 65, size: "sm" },
    { icon: "🏟️", name: "Larkin Stadium", x: 10, y: 30, size: "sm" },
  ],
};

// Map persona IDs to their maps
export const PERSONA_MAPS: Record<string, MapConfig> = {
  freshGrad: KL_MAP,
  singleParent: PENANG_MAP,
  factoryWorker: JB_MAP,
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
