"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface Ending {
  title: string;
  narration: string;
  summary: {
    financialScore: number;
    healthScore: number;
    lessonsLearned: string[];
  };
  epilogue: string;
}

export default function EndingPage() {
  const router = useRouter();
  const game = useQuery(api.games.getCurrentGame);
  const allDecisions = useQuery(
    api.games.getAllDecisions,
    game ? { gameId: game._id } : "skip"
  );
  const generateEnding = useAction(api.ai.generateEnding);

  const [ending, setEnding] = useState<Ending | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (game === null) {
      router.push("/");
      return;
    }

    if (!game?.isGameOver) {
      router.push("/game");
      return;
    }

    if (game && allDecisions && !ending) {
      setIsLoading(true);
      generateEnding({
        personaId: game.personaId,
        finalMoney: game.money,
        finalDebt: game.debt,
        finalCreditScore: game.creditScore,
        finalHealth: game.health,
        finalStress: game.stress,
        endingType: game.endingType || "completed",
        keyDecisions: allDecisions.slice(-5).map((d) => ({
          choiceText: d.choiceText,
          location: d.location,
          week: d.week,
        })),
      })
        .then((result) => {
          setEnding(result as Ending);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  }, [game, allDecisions, ending, generateEnding, router]);

  if (game === undefined || isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        <p className="text-slate-400 mt-4">Generating your ending...</p>
      </div>
    );
  }

  if (!game || !ending) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-white mb-2">{ending.title}</h1>
          <p className="text-slate-400">Your 12-week journey has ended</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800 border-slate-700">
            <CardContent className="pt-6">
              <p className="text-slate-200 leading-relaxed whitespace-pre-line">
                {ending.narration}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-2 gap-4"
        >
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">Final Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Money</span>
                <span className="text-emerald-400">RM {game.money.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Debt</span>
                <span className="text-red-400">RM {game.debt.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Credit Score</span>
                <span className="text-white">{game.creditScore}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">Scores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Financial</span>
                <span className="text-emerald-400">{ending.summary.financialScore}/100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Health</span>
                <span className="text-white">{ending.summary.healthScore}/100</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white">Lessons Learned</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {ending.summary.lessonsLearned.map((lesson, index) => (
                  <li key={index} className="flex items-start gap-2 text-slate-300">
                    <span className="text-emerald-400">•</span>
                    {lesson}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center"
        >
          <p className="text-slate-400 italic mb-6">{ending.epilogue}</p>

          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => router.push("/")}
          >
            Play Again
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
