"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Trophy,
  ArrowLeft,
  AlertTriangle,
  MapPin,
  Download,
  RefreshCw,
} from "lucide-react";
import { PERSONAS, LOCATIONS } from "@/lib/constants";

interface GlobalStats {
  totalGames: number;
  avgFinalMoney: number;
  avgCreditScore: number;
  successRate: number;
}

interface PersonaStats {
  persona_id: string;
  total_games: number;
  avg_final_money: number;
  avg_credit_score: number;
  avg_weeks_completed: number;
  success_rate: number;
  most_common_ending: string;
}

interface FailurePattern {
  failure_reason: string;
  count: number;
  persona_id: string;
  avg_week_failed: number;
}

interface DecisionAnalytics {
  location: string;
  total_decisions: number;
  avg_money_change: number;
  avg_credit_change: number;
  most_common_choice: string;
}

interface AnalyticsData {
  global: GlobalStats;
  byPersona: PersonaStats[];
  failures: FailurePattern[];
  decisions: DecisionAnalytics[];
}

export default function AnalyticsPage() {
  const router = useRouter();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analytics/stats");
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      } else {
        setError(result.error || "Failed to fetch analytics");
      }
    } catch (err) {
      setError("Failed to connect to analytics server");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExport = (format: "json" | "csv") => {
    window.open(`/api/analytics/export?format=${format}&includeDecisions=true`, "_blank");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="h-8 w-8 text-purple-400" />
        </motion.div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <BarChart3 className="h-8 w-8 text-purple-400" />
            B40 Life Simulator Analytics
            <BarChart3 className="h-8 w-8 text-purple-400" />
          </h1>
          <p className="text-slate-400">Player Behavior & Financial Literacy Insights</p>
          <p className="text-xs text-purple-400 mt-1">Powered by TiDB</p>
        </motion.div>

        {error ? (
          <Card className="bg-slate-800/50 border-slate-700 mb-6">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
              <p className="text-white mb-2">{error}</p>
              <p className="text-slate-400 text-sm mb-4">
                Make sure TiDB is configured with the correct environment variables.
              </p>
              <Button onClick={fetchAnalytics} variant="outline" className="border-slate-600">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : data ? (
          <>
            {/* Global Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/50">
                <CardContent className="p-6 text-center">
                  <Users className="h-10 w-10 text-blue-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-white">{data.global.totalGames}</p>
                  <p className="text-sm text-blue-300">Total Games Played</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 border-emerald-500/50">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-emerald-400">
                    RM {data.global.avgFinalMoney.toLocaleString()}
                  </p>
                  <p className="text-sm text-emerald-300">Avg Final Money</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 border-amber-500/50">
                <CardContent className="p-6 text-center">
                  <Trophy className="h-10 w-10 text-amber-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-amber-400">{data.global.avgCreditScore}</p>
                  <p className="text-sm text-amber-300">Avg Credit Score</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/50">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-10 w-10 text-green-400 mx-auto mb-3" />
                  <p className="text-3xl font-bold text-green-400">{data.global.successRate}%</p>
                  <p className="text-sm text-green-300">Success Rate</p>
                </CardContent>
              </Card>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Persona Performance */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 h-full">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Users className="h-5 w-5 text-purple-400" />
                      Performance by Persona
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data.byPersona.length === 0 ? (
                      <p className="text-slate-400 text-center py-4">No data yet</p>
                    ) : (
                      data.byPersona.map((stat) => {
                        const persona = PERSONAS[stat.persona_id as keyof typeof PERSONAS];
                        return (
                          <div
                            key={stat.persona_id}
                            className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <p className="text-white font-semibold">
                                  {persona?.name || stat.persona_id}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {persona?.location} • {stat.total_games} games
                                </p>
                              </div>
                              <span
                                className={`text-xs px-2 py-1 rounded ${
                                  stat.success_rate >= 50
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {Math.round(stat.success_rate)}% success
                              </span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center text-sm">
                              <div>
                                <p className="text-emerald-400 font-bold">
                                  RM {Math.round(stat.avg_final_money).toLocaleString()}
                                </p>
                                <p className="text-xs text-slate-500">Avg Money</p>
                              </div>
                              <div>
                                <p className="text-blue-400 font-bold">
                                  {Math.round(stat.avg_credit_score)}
                                </p>
                                <p className="text-xs text-slate-500">Avg Credit</p>
                              </div>
                              <div>
                                <p className="text-purple-400 font-bold">
                                  {stat.avg_weeks_completed.toFixed(1)}
                                </p>
                                <p className="text-xs text-slate-500">Avg Weeks</p>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Failure Patterns */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-slate-800/50 border-slate-700 h-full">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                      Common Failure Patterns
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {data.failures.length === 0 ? (
                      <p className="text-slate-400 text-center py-4">No failures recorded yet</p>
                    ) : (
                      data.failures.slice(0, 5).map((failure, index) => {
                        const persona = PERSONAS[failure.persona_id as keyof typeof PERSONAS];
                        return (
                          <div
                            key={`${failure.failure_reason}-${failure.persona_id}`}
                            className="p-3 bg-red-900/20 rounded-lg border border-red-800/50"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="text-red-300 font-medium">
                                  {failure.failure_reason}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {persona?.location || failure.persona_id} • Avg week:{" "}
                                  {failure.avg_week_failed.toFixed(1)}
                                </p>
                              </div>
                              <span className="text-red-400 font-bold">{failure.count}×</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Location Decision Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="bg-slate-800/50 border-slate-700 mb-8">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-cyan-400" />
                    Decision Analytics by Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.decisions.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No decision data yet</p>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {data.decisions.map((loc) => {
                        const location = LOCATIONS.find((l) => l.id === loc.location);
                        const isPositive = loc.avg_money_change >= 0;
                        return (
                          <div
                            key={loc.location}
                            className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"
                          >
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-2xl">{location?.icon || "📍"}</span>
                              <div>
                                <p className="text-white font-semibold">
                                  {location?.name || loc.location}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {loc.total_decisions} decisions
                                </p>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">Avg Money Impact</span>
                                <span
                                  className={`font-bold ${
                                    isPositive ? "text-emerald-400" : "text-red-400"
                                  }`}
                                >
                                  {isPositive ? "+" : ""}RM{" "}
                                  {Math.round(loc.avg_money_change).toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-400">Avg Credit Impact</span>
                                <span
                                  className={`font-bold ${
                                    loc.avg_credit_change >= 0
                                      ? "text-blue-400"
                                      : "text-orange-400"
                                  }`}
                                >
                                  {loc.avg_credit_change >= 0 ? "+" : ""}
                                  {Math.round(loc.avg_credit_change)}
                                </span>
                              </div>
                              {loc.most_common_choice && (
                                <div className="mt-2 pt-2 border-t border-slate-700">
                                  <p className="text-xs text-slate-500">Most common choice:</p>
                                  <p className="text-xs text-cyan-300 truncate">
                                    {loc.most_common_choice}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Export Options */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center gap-4 mb-8"
            >
              <Button
                onClick={() => handleExport("csv")}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button
                onClick={() => handleExport("json")}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Export JSON
              </Button>
              <Button
                onClick={fetchAnalytics}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </motion.div>
          </>
        ) : null}

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center gap-4"
        >
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            onClick={() => router.push("/leaderboard")}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => router.push("/setup")}
          >
            Play Game
          </Button>
        </motion.div>
      </div>
    </main>
  );
}

