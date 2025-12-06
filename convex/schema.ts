import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Main game state
  games: defineTable({
    playerName: v.optional(v.string()),
    personaId: v.string(),
    money: v.number(),
    debt: v.number(),
    creditScore: v.number(),
    health: v.number(),
    stress: v.number(),
    currentDay: v.number(),
    currentWeek: v.number(),
    actionsRemaining: v.number(),
    currentLocation: v.string(),
    isGameOver: v.boolean(),
    endingType: v.optional(v.string()),
  }),

  // Player decision history
  decisions: defineTable({
    gameId: v.id("games"),
    location: v.string(),
    scenarioId: v.string(),
    choiceIndex: v.number(),
    choiceText: v.string(),
    moneyChange: v.number(),
    creditChange: v.number(),
    healthChange: v.number(),
    stressChange: v.number(),
    hiddenConsequence: v.optional(v.string()),
    consequenceTriggered: v.boolean(),
    day: v.number(),
    week: v.number(),
  }).index("by_game", ["gameId"]),

  // Credit score change history
  creditEvents: defineTable({
    gameId: v.id("games"),
    change: v.number(),
    reason: v.string(),
    day: v.number(),
    week: v.number(),
  }).index("by_game", ["gameId"]),

  // Scheduled events (bills, consequences, salary)
  scheduledEvents: defineTable({
    gameId: v.id("games"),
    type: v.string(), // "consequence" | "salary" | "bill" | "random"
    triggerDay: v.number(),
    triggerWeek: v.number(),
    description: v.string(),
    data: v.any(),
    isTriggered: v.boolean(),
  })
    .index("by_game", ["gameId"])
    .index("by_trigger", ["gameId", "triggerWeek", "triggerDay", "isTriggered"]),

  // Bills tracking
  bills: defineTable({
    gameId: v.id("games"),
    type: v.string(), // "rent" | "electricity" | "water" | "phone" | "ptptn" | "loan"
    amount: v.number(),
    dueDay: v.number(),
    dueWeek: v.number(),
    isPaid: v.boolean(),
    isOverdue: v.boolean(),
  })
    .index("by_game", ["gameId"])
    .index("by_due", ["gameId", "dueWeek", "isPaid"]),

  // Leaderboard for top scores
  leaderboard: defineTable({
    gameId: v.optional(v.id("games")),
    playerName: v.string(),
    personaId: v.string(),
    score: v.number(), // Final cash money in hand
    weeksCompleted: v.number(),
    endingType: v.string(),
    createdAt: v.number(),
  })
    .index("by_score", ["score"])
    .index("by_game", ["gameId"]),
});
