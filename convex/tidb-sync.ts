"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { api, internal } from "./_generated/api";

// TiDB sync action - syncs completed game data to TiDB for analytics
// This calls the Next.js API route which handles the actual TiDB connection

export const syncCompletedGame = action({
  args: {
    gameId: v.id("games"),
  },
  handler: async (ctx, args) => {
    // Get the game data from Convex
    const game = await ctx.runQuery(api.games.getGame, { gameId: args.gameId });
    if (!game) {
      throw new Error("Game not found");
    }

    // Get all decisions for this game
    const decisions = await ctx.runQuery(api.games.getAllDecisions, {
      gameId: args.gameId,
    });

    // Prepare the data for TiDB
    const gameData = {
      convex_game_id: args.gameId,
      player_name: game.playerName || "Anonymous",
      persona_id: game.personaId,
      final_money: game.money,
      final_credit_score: game.creditScore,
      final_health: game.health,
      final_stress: game.stress,
      final_debt: game.debt,
      weeks_completed: game.currentWeek,
      ending_type: game.endingType || "unknown",
      failure_reason: game.failureReason || null,
    };

    const decisionsData = decisions.map((d) => ({
      convex_game_id: args.gameId,
      location: d.location,
      scenario_id: d.scenarioId,
      choice_index: d.choiceIndex,
      choice_text: d.choiceText,
      money_change: d.moneyChange,
      credit_change: d.creditChange,
      health_change: d.healthChange,
      stress_change: d.stressChange,
      day: d.day,
      week: d.week,
    }));

    // Call the Next.js API route to sync to TiDB
    // The API route handles the actual database connection
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    try {
      const response = await fetch(`${baseUrl}/api/analytics/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Add an internal API key for security
          "X-Internal-Key": process.env.INTERNAL_API_KEY || "dev-key",
        },
        body: JSON.stringify({
          game: gameData,
          decisions: decisionsData,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error("TiDB sync failed:", error);
        // Don't throw - we don't want to break the game flow if analytics fails
        return { success: false, error };
      }

      const result = await response.json();
      return { success: true, ...result };
    } catch (error) {
      console.error("TiDB sync error:", error);
      // Don't throw - analytics sync failure shouldn't break the game
      return { success: false, error: String(error) };
    }
  },
});

// Helper action to sync a batch of games (useful for backfilling)
export const syncBatchGames = action({
  args: {
    gameIds: v.array(v.id("games")),
  },
  handler: async (ctx, args) => {
    const results = [];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    for (const gameId of args.gameIds) {
      try {
        // Get game and decisions for each game
        const game = await ctx.runQuery(api.games.getGame, { gameId });
        if (!game) {
          results.push({ gameId, success: false, error: "Game not found" });
          continue;
        }

        const decisions = await ctx.runQuery(api.games.getAllDecisions, { gameId });

        const gameData = {
          convex_game_id: gameId,
          player_name: game.playerName || "Anonymous",
          persona_id: game.personaId,
          final_money: game.money,
          final_credit_score: game.creditScore,
          final_health: game.health,
          final_stress: game.stress,
          final_debt: game.debt,
          weeks_completed: game.currentWeek,
          ending_type: game.endingType || "unknown",
          failure_reason: game.failureReason || null,
        };

        const decisionsData = decisions.map((d) => ({
          convex_game_id: gameId,
          location: d.location,
          scenario_id: d.scenarioId,
          choice_index: d.choiceIndex,
          choice_text: d.choiceText,
          money_change: d.moneyChange,
          credit_change: d.creditChange,
          health_change: d.healthChange,
          stress_change: d.stressChange,
          day: d.day,
          week: d.week,
        }));

        const response = await fetch(`${baseUrl}/api/analytics/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Internal-Key": process.env.INTERNAL_API_KEY || "dev-key",
          },
          body: JSON.stringify({ game: gameData, decisions: decisionsData }),
        });

        if (response.ok) {
          results.push({ gameId, success: true });
        } else {
          results.push({ gameId, success: false, error: await response.text() });
        }
      } catch (error) {
        results.push({ gameId, success: false, error: String(error) });
      }
    }

    return results;
  },
});

