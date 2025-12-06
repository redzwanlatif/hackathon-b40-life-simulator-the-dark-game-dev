import { NextResponse } from "next/server";
import {
  getGlobalStats,
  getPersonaStats,
  getFailurePatterns,
  getDecisionAnalytics,
} from "@/lib/tidb";

// GET /api/analytics/stats
// Returns global statistics and analytics from TiDB
export async function GET() {
  try {
    // Fetch all analytics data in parallel
    const [globalStats, personaStats, failurePatterns, decisionAnalytics] =
      await Promise.all([
        getGlobalStats(),
        getPersonaStats(),
        getFailurePatterns(),
        getDecisionAnalytics(),
      ]);

    return NextResponse.json({
      success: true,
      data: {
        global: globalStats,
        byPersona: personaStats,
        failures: failurePatterns,
        decisions: decisionAnalytics,
      },
    });
  } catch (error) {
    console.error("Analytics stats error:", error);

    // Return empty data structure if TiDB is not configured
    if (String(error).includes("environment variables not configured")) {
      return NextResponse.json({
        success: false,
        error: "TiDB not configured",
        data: {
          global: {
            totalGames: 0,
            avgFinalMoney: 0,
            avgCreditScore: 0,
            successRate: 0,
          },
          byPersona: [],
          failures: [],
          decisions: [],
        },
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch analytics", details: String(error) },
      { status: 500 }
    );
  }
}

