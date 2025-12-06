import mysql from "mysql2/promise";

// TiDB connection configuration
const tidbConfig = {
  host: process.env.TIDB_HOST,
  port: parseInt(process.env.TIDB_PORT || "4000"),
  user: process.env.TIDB_USER,
  password: process.env.TIDB_PASSWORD,
  database: process.env.TIDB_DATABASE,
  ssl: {
    minVersion: "TLSv1.2" as const,
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

// Create connection pool (singleton)
let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    if (!process.env.TIDB_HOST) {
      throw new Error("TiDB environment variables not configured");
    }
    pool = mysql.createPool(tidbConfig);
  }
  return pool;
}

// Helper to execute queries
export async function query<T>(sql: string, params?: unknown[]): Promise<T[]> {
  const connection = await getPool().getConnection();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows as T[];
  } finally {
    connection.release();
  }
}

// Helper to execute single result queries
export async function queryOne<T>(
  sql: string,
  params?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

// Helper to execute insert/update/delete
export async function execute(
  sql: string,
  params?: unknown[]
): Promise<mysql.ResultSetHeader> {
  const connection = await getPool().getConnection();
  try {
    const [result] = await connection.execute(sql, params);
    return result as mysql.ResultSetHeader;
  } finally {
    connection.release();
  }
}

// Types for analytics data
export interface CompletedGame {
  id?: number;
  convex_game_id: string;
  player_name: string;
  persona_id: string;
  final_money: number;
  final_credit_score: number;
  final_health: number;
  final_stress: number;
  final_debt: number;
  weeks_completed: number;
  ending_type: string;
  failure_reason: string | null;
  created_at?: Date;
}

export interface PlayerDecision {
  id?: number;
  convex_game_id: string;
  location: string;
  scenario_id: string;
  choice_index: number;
  choice_text: string;
  money_change: number;
  credit_change: number;
  health_change: number;
  stress_change: number;
  day: number;
  week: number;
  created_at?: Date;
}

export interface PersonaStats {
  persona_id: string;
  total_games: number;
  avg_final_money: number;
  avg_credit_score: number;
  avg_weeks_completed: number;
  success_rate: number;
  most_common_ending: string;
}

export interface FailurePattern {
  failure_reason: string;
  count: number;
  persona_id: string;
  avg_week_failed: number;
}

// Analytics query functions
export async function syncCompletedGame(game: CompletedGame): Promise<number> {
  const result = await execute(
    `INSERT INTO completed_games 
     (convex_game_id, player_name, persona_id, final_money, final_credit_score, 
      final_health, final_stress, final_debt, weeks_completed, ending_type, failure_reason)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       final_money = VALUES(final_money),
       final_credit_score = VALUES(final_credit_score),
       final_health = VALUES(final_health),
       final_stress = VALUES(final_stress),
       final_debt = VALUES(final_debt),
       weeks_completed = VALUES(weeks_completed),
       ending_type = VALUES(ending_type),
       failure_reason = VALUES(failure_reason)`,
    [
      game.convex_game_id,
      game.player_name,
      game.persona_id,
      game.final_money,
      game.final_credit_score,
      game.final_health,
      game.final_stress,
      game.final_debt,
      game.weeks_completed,
      game.ending_type,
      game.failure_reason,
    ]
  );
  return result.insertId;
}

export async function syncPlayerDecisions(
  decisions: PlayerDecision[]
): Promise<void> {
  if (decisions.length === 0) return;

  const values = decisions.map((d) => [
    d.convex_game_id,
    d.location,
    d.scenario_id,
    d.choice_index,
    d.choice_text,
    d.money_change,
    d.credit_change,
    d.health_change,
    d.stress_change,
    d.day,
    d.week,
  ]);

  const placeholders = values.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
  const flatValues = values.flat();

  await execute(
    `INSERT INTO player_decisions 
     (convex_game_id, location, scenario_id, choice_index, choice_text, 
      money_change, credit_change, health_change, stress_change, day, week)
     VALUES ${placeholders}`,
    flatValues
  );
}

export async function getGlobalStats(): Promise<{
  totalGames: number;
  avgFinalMoney: number;
  avgCreditScore: number;
  successRate: number;
}> {
  const result = await queryOne<{
    total_games: number;
    avg_money: number;
    avg_credit: number;
    success_rate: number;
  }>(
    `SELECT 
       COUNT(*) as total_games,
       AVG(final_money) as avg_money,
       AVG(final_credit_score) as avg_credit,
       (SUM(CASE WHEN ending_type = 'survived' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as success_rate
     FROM completed_games`
  );

  return {
    totalGames: result?.total_games || 0,
    avgFinalMoney: Math.round(result?.avg_money || 0),
    avgCreditScore: Math.round(result?.avg_credit || 0),
    successRate: Math.round(result?.success_rate || 0),
  };
}

export async function getPersonaStats(): Promise<PersonaStats[]> {
  return query<PersonaStats>(
    `SELECT 
       persona_id,
       COUNT(*) as total_games,
       AVG(final_money) as avg_final_money,
       AVG(final_credit_score) as avg_credit_score,
       AVG(weeks_completed) as avg_weeks_completed,
       (SUM(CASE WHEN ending_type = 'survived' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)) as success_rate,
       (SELECT ending_type FROM completed_games cg2 
        WHERE cg2.persona_id = completed_games.persona_id 
        GROUP BY ending_type ORDER BY COUNT(*) DESC LIMIT 1) as most_common_ending
     FROM completed_games
     GROUP BY persona_id`
  );
}

export async function getFailurePatterns(): Promise<FailurePattern[]> {
  return query<FailurePattern>(
    `SELECT 
       failure_reason,
       COUNT(*) as count,
       persona_id,
       AVG(weeks_completed) as avg_week_failed
     FROM completed_games
     WHERE failure_reason IS NOT NULL
     GROUP BY failure_reason, persona_id
     ORDER BY count DESC`
  );
}

export async function getEnhancedLeaderboard(limit: number = 50): Promise<
  Array<{
    rank: number;
    player_name: string;
    persona_id: string;
    final_money: number;
    final_credit_score: number;
    weeks_completed: number;
    ending_type: string;
    created_at: Date;
  }>
> {
  return query(
    `SELECT 
       ROW_NUMBER() OVER (ORDER BY final_money DESC) as \`rank\`,
       player_name,
       persona_id,
       final_money,
       final_credit_score,
       weeks_completed,
       ending_type,
       created_at
     FROM completed_games
     ORDER BY final_money DESC
     LIMIT ?`,
    [limit]
  );
}

export async function getDecisionAnalytics(): Promise<
  Array<{
    location: string;
    total_decisions: number;
    avg_money_change: number;
    avg_credit_change: number;
    most_common_choice: string;
  }>
> {
  return query(
    `SELECT 
       location,
       COUNT(*) as total_decisions,
       AVG(money_change) as avg_money_change,
       AVG(credit_change) as avg_credit_change,
       (SELECT choice_text FROM player_decisions pd2 
        WHERE pd2.location = player_decisions.location 
        GROUP BY choice_text ORDER BY COUNT(*) DESC LIMIT 1) as most_common_choice
     FROM player_decisions
     GROUP BY location
     ORDER BY total_decisions DESC`
  );
}

export async function exportResearchData(): Promise<
  Array<CompletedGame & { decisions_count: number }>
> {
  return query(
    `SELECT 
       cg.*,
       (SELECT COUNT(*) FROM player_decisions pd WHERE pd.convex_game_id = cg.convex_game_id) as decisions_count
     FROM completed_games cg
     ORDER BY cg.created_at DESC`
  );
}

