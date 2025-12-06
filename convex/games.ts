import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get the most recent active game
export const getCurrentGame = query({
  args: {},
  handler: async (ctx) => {
    const games = await ctx.db
      .query("games")
      .order("desc")
      .filter((q) => q.eq(q.field("isGameOver"), false))
      .first();
    return games;
  },
});

// Get a specific game by ID
export const getGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.gameId);
  },
});

// Create a new game with selected persona
export const createGame = mutation({
  args: {
    playerName: v.string(),
    personaId: v.string(),
    initialMoney: v.number(),
    initialDebt: v.number(),
    initialCreditScore: v.number(),
  },
  handler: async (ctx, args) => {
    const gameId = await ctx.db.insert("games", {
      playerName: args.playerName,
      personaId: args.personaId,
      money: args.initialMoney,
      debt: args.initialDebt,
      creditScore: args.initialCreditScore,
      health: 100,
      stress: 20,
      currentDay: 1,
      currentWeek: 1,
      actionsRemaining: 3,
      currentLocation: "home",
      isGameOver: false,
    });

    // Schedule initial bills for week 2
    await ctx.db.insert("bills", {
      gameId,
      type: "rent",
      amount: 500,
      dueDay: 7,
      dueWeek: 2,
      isPaid: false,
      isOverdue: false,
    });

    await ctx.db.insert("bills", {
      gameId,
      type: "electricity",
      amount: 80,
      dueDay: 7,
      dueWeek: 2,
      isPaid: false,
      isOverdue: false,
    });

    // Schedule monthly debt payments (every 4 weeks)
    // Calculate monthly payment as debt / 12 (spread over a year)
    const monthlyDebtPayment = Math.ceil(args.initialDebt / 12);

    // Month 1 - Week 4
    await ctx.db.insert("bills", {
      gameId,
      type: "debt",
      amount: monthlyDebtPayment,
      dueDay: 7,
      dueWeek: 4,
      isPaid: false,
      isOverdue: false,
    });

    // Month 2 - Week 8
    await ctx.db.insert("bills", {
      gameId,
      type: "debt",
      amount: monthlyDebtPayment,
      dueDay: 7,
      dueWeek: 8,
      isPaid: false,
      isOverdue: false,
    });

    // Month 3 - Week 12
    await ctx.db.insert("bills", {
      gameId,
      type: "debt",
      amount: monthlyDebtPayment,
      dueDay: 7,
      dueWeek: 12,
      isPaid: false,
      isOverdue: false,
    });

    return gameId;
  },
});

// Update game state after a choice
export const updateGameState = mutation({
  args: {
    gameId: v.id("games"),
    moneyChange: v.number(),
    creditChange: v.number(),
    healthChange: v.number(),
    stressChange: v.number(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    const newMoney = Math.max(0, game.money + args.moneyChange);
    const newCreditScore = Math.min(850, Math.max(300, game.creditScore + args.creditChange));
    const newHealth = Math.min(100, Math.max(0, game.health + args.healthChange));
    const newStress = Math.min(100, Math.max(0, game.stress + args.stressChange));

    // Check for game over conditions
    let isGameOver = false;
    let endingType: string | undefined;

    if (newHealth <= 0) {
      isGameOver = true;
      endingType = "health_crisis";
    } else if (newStress >= 100) {
      isGameOver = true;
      endingType = "burnout";
    } else if (game.currentWeek >= 12 && game.currentDay >= 7) {
      isGameOver = true;
      endingType = newMoney > 0 && newCreditScore > 600 ? "success" : "struggle";
    }

    await ctx.db.patch(args.gameId, {
      money: newMoney,
      creditScore: newCreditScore,
      health: newHealth,
      stress: newStress,
      isGameOver,
      endingType,
    });

    // Log credit score change if significant
    if (args.creditChange !== 0) {
      await ctx.db.insert("creditEvents", {
        gameId: args.gameId,
        change: args.creditChange,
        reason: args.creditChange > 0 ? "Good financial decision" : "Financial setback",
        day: game.currentDay,
        week: game.currentWeek,
      });
    }

    return { isGameOver, endingType };
  },
});

// Move player to a new location (uses an action)
export const moveToLocation = mutation({
  args: {
    gameId: v.id("games"),
    location: v.string(),
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");
    if (game.actionsRemaining <= 0) throw new Error("No actions remaining");

    await ctx.db.patch(args.gameId, {
      currentLocation: args.location,
      actionsRemaining: game.actionsRemaining - 1,
    });

    return { actionsRemaining: game.actionsRemaining - 1 };
  },
});

// Advance time (called when actions run out)
export const advanceTime = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    let newDay = game.currentDay + 1;
    let newWeek = game.currentWeek;

    if (newDay > 7) {
      newDay = 1;
      newWeek += 1;
    }

    // Check for game completion
    const isGameOver = newWeek > 12;
    const endingType = isGameOver ? "completed" : undefined;

    await ctx.db.patch(args.gameId, {
      currentDay: newDay,
      currentWeek: newWeek,
      actionsRemaining: 3,
      currentLocation: "home",
      isGameOver,
      endingType,
    });

    // Check for triggered events
    const events = await ctx.db
      .query("scheduledEvents")
      .withIndex("by_trigger", (q) =>
        q
          .eq("gameId", args.gameId)
          .eq("triggerWeek", newWeek)
          .eq("triggerDay", newDay)
          .eq("isTriggered", false)
      )
      .collect();

    // Mark events as triggered
    for (const event of events) {
      await ctx.db.patch(event._id, { isTriggered: true });
    }

    // Check for overdue bills
    const bills = await ctx.db
      .query("bills")
      .withIndex("by_due", (q) => q.eq("gameId", args.gameId).eq("dueWeek", newWeek).eq("isPaid", false))
      .collect();

    for (const bill of bills) {
      if (bill.dueDay < newDay && !bill.isOverdue) {
        await ctx.db.patch(bill._id, { isOverdue: true });
        // Penalty for overdue bill
        await ctx.db.insert("creditEvents", {
          gameId: args.gameId,
          change: -15,
          reason: `Overdue ${bill.type} bill`,
          day: newDay,
          week: newWeek,
        });
        await ctx.db.patch(args.gameId, {
          creditScore: Math.max(300, game.creditScore - 15),
        });
      }
    }

    return { newDay, newWeek, triggeredEvents: events, isGameOver };
  },
});

// Record a decision
export const recordDecision = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game) throw new Error("Game not found");

    const decisionId = await ctx.db.insert("decisions", {
      gameId: args.gameId,
      location: args.location,
      scenarioId: args.scenarioId,
      choiceIndex: args.choiceIndex,
      choiceText: args.choiceText,
      moneyChange: args.moneyChange,
      creditChange: args.creditChange,
      healthChange: args.healthChange,
      stressChange: args.stressChange,
      hiddenConsequence: args.hiddenConsequence,
      consequenceTriggered: false,
      day: game.currentDay,
      week: game.currentWeek,
    });

    return decisionId;
  },
});

// Get recent decisions for a game
export const getRecentDecisions = query({
  args: { gameId: v.id("games"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const decisions = await ctx.db
      .query("decisions")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .order("desc")
      .take(args.limit ?? 5);
    return decisions;
  },
});

// Get all decisions for a game
export const getAllDecisions = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("decisions")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
  },
});

// Get pending bills
export const getPendingBills = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("bills")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .filter((q) => q.eq(q.field("isPaid"), false))
      .collect();
  },
});

// Reset/delete current game
export const resetGame = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, args) => {
    // Delete all related data
    const decisions = await ctx.db
      .query("decisions")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
    for (const d of decisions) {
      await ctx.db.delete(d._id);
    }

    const bills = await ctx.db
      .query("bills")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
    for (const b of bills) {
      await ctx.db.delete(b._id);
    }

    const events = await ctx.db
      .query("scheduledEvents")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
    for (const e of events) {
      await ctx.db.delete(e._id);
    }

    const creditEvents = await ctx.db
      .query("creditEvents")
      .withIndex("by_game", (q) => q.eq("gameId", args.gameId))
      .collect();
    for (const c of creditEvents) {
      await ctx.db.delete(c._id);
    }

    // Delete the game itself
    await ctx.db.delete(args.gameId);

    return { success: true };
  },
});

// Pay a bill
export const payBill = mutation({
  args: { billId: v.id("bills") },
  handler: async (ctx, args) => {
    const bill = await ctx.db.get(args.billId);
    if (!bill) throw new Error("Bill not found");

    const game = await ctx.db.get(bill.gameId);
    if (!game) throw new Error("Game not found");

    if (game.money < bill.amount) {
      throw new Error("Not enough money to pay bill");
    }

    await ctx.db.patch(bill._id, { isPaid: true });
    await ctx.db.patch(bill.gameId, { money: game.money - bill.amount });

    // Small credit boost for paying on time
    if (!bill.isOverdue) {
      await ctx.db.insert("creditEvents", {
        gameId: bill.gameId,
        change: 5,
        reason: `Paid ${bill.type} bill on time`,
        day: game.currentDay,
        week: game.currentWeek,
      });
      await ctx.db.patch(bill.gameId, {
        creditScore: Math.min(850, game.creditScore + 5),
      });
    }

    return { newBalance: game.money - bill.amount };
  },
});
