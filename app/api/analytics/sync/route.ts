import { NextRequest, NextResponse } from "next/server";
import {
  syncCompletedGame,
  syncPlayerDecisions,
  CompletedGame,
  PlayerDecision,
} from "@/lib/tidb";

// POST /api/analytics/sync
// Syncs completed game data from Convex to TiDB
export async function POST(request: NextRequest) {
  try {
    // Verify internal API key for security
    const apiKey = request.headers.get("X-Internal-Key");
    const expectedKey = process.env.INTERNAL_API_KEY || "dev-key";

    if (apiKey !== expectedKey) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { game, decisions } = body as {
      game: CompletedGame;
      decisions: PlayerDecision[];
    };

    if (!game) {
      return NextResponse.json(
        { error: "Missing game data" },
        { status: 400 }
      );
    }

    // Sync game to TiDB
    const gameInsertId = await syncCompletedGame(game);

    // Sync decisions if provided
    if (decisions && decisions.length > 0) {
      await syncPlayerDecisions(decisions);
    }

    return NextResponse.json({
      success: true,
      gameId: gameInsertId,
      decisionsCount: decisions?.length || 0,
    });
  } catch (error) {
    console.error("TiDB sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync data", details: String(error) },
      { status: 500 }
    );
  }
}

