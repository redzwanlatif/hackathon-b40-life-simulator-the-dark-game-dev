"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PERSONAS, PersonaId } from "@/lib/constants";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/convex/_generated/api";

export default function SetupPage() {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<PersonaId | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const createGame = useMutation(api.games.createGame);

  const handleStartGame = async () => {
    if (!selectedPersona) return;

    setIsCreating(true);
    try {
      const persona = PERSONAS[selectedPersona];
      await createGame({
        personaId: selectedPersona,
        initialMoney: persona.initialMoney,
        initialDebt: persona.initialDebt,
        initialCreditScore: persona.initialCreditScore,
      });
      router.push("/game");
    } catch (error) {
      console.error("Failed to create game:", error);
      setIsCreating(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">Choose Your Story</h1>
          <p className="text-slate-400">Each path has its own challenges</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {(Object.entries(PERSONAS) as [PersonaId, typeof PERSONAS[PersonaId]][]).map(
            ([id, persona], index) => (
              <motion.div
                key={id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedPersona === id
                      ? "ring-2 ring-emerald-500 bg-slate-800"
                      : "bg-slate-800/50 hover:bg-slate-800"
                  }`}
                  onClick={() => setSelectedPersona(id)}
                >
                  <CardHeader>
                    <CardTitle className="text-white">{persona.name}</CardTitle>
                    <CardDescription className="text-slate-400">
                      {persona.location}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-slate-300 text-sm">{persona.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Monthly Salary</span>
                        <span className="text-emerald-400">RM {persona.monthlySalary}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Starting Cash</span>
                        <span className="text-white">RM {persona.initialMoney}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Debt ({persona.debtType})</span>
                        <span className="text-red-400">RM {persona.initialDebt.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Credit Score</span>
                        <span className={
                          persona.initialCreditScore >= 650 ? "text-emerald-400" :
                          persona.initialCreditScore >= 600 ? "text-yellow-400" :
                          "text-red-400"
                        }>
                          {persona.initialCreditScore}
                        </span>
                      </div>
                    </div>

                    {selectedPersona === id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="pt-2 border-t border-slate-700"
                      >
                        <p className="text-slate-300 text-xs italic">
                          {persona.backstory}
                        </p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          )}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <Button
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50"
            disabled={!selectedPersona || isCreating}
            onClick={handleStartGame}
          >
            {isCreating ? "Starting..." : "Begin Your Journey"}
          </Button>
        </motion.div>
      </div>
    </main>
  );
}
