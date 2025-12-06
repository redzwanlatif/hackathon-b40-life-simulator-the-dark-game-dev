"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, ArrowLeft } from "lucide-react";
import { PERSONAS } from "@/lib/constants";

export default function LeaderboardPage() {
  const router = useRouter();
  const topScores = useQuery(api.leaderboard.getTopScores);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-300" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-slate-400 font-bold">{rank}</span>;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-600/20 to-amber-600/20 border-yellow-500/50";
      case 2:
        return "bg-gradient-to-r from-gray-500/20 to-slate-500/20 border-gray-400/50";
      case 3:
        return "bg-gradient-to-r from-amber-700/20 to-orange-700/20 border-amber-600/50";
      default:
        return "bg-slate-800/50 border-slate-700";
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-400" />
            Leaderboard
            <Trophy className="h-8 w-8 text-yellow-400" />
          </h1>
          <p className="text-slate-400">Top 10 Players by Cash in Hand</p>
        </motion.div>

        <Card className="bg-slate-800/50 border-slate-700 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg flex items-center justify-between">
              <span>Top Scores</span>
              <span className="text-sm text-slate-400 font-normal">Score = Final Cash</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topScores === undefined ? (
              <div className="text-center py-8 text-slate-400">Loading...</div>
            ) : topScores.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No scores yet. Be the first to play!
              </div>
            ) : (
              topScores.map((score: { _id: string; playerName: string; personaId: string; score: number; weeksCompleted: number; endingType: string }, index: number) => {
                const persona = PERSONAS[score.personaId as keyof typeof PERSONAS];
                return (
                  <motion.div
                    key={score._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-4 rounded-lg border ${getRankBg(index + 1)}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {getRankIcon(index + 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold truncate">
                            {score.playerName}
                          </span>
                          <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">
                            {persona?.location || score.personaId}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400">
                          Week {score.weeksCompleted} - {score.endingType}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-400 font-bold">
                          RM {score.score.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
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
