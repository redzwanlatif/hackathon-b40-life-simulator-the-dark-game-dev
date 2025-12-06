"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { GameMap } from "@/components/game/GameMap";
import { StatsBar } from "@/components/game/StatsBar";
import { LocationDialog } from "@/components/game/LocationDialog";
import { Button } from "@/components/ui/button";
import { LocationId, PERSONA_MAPS, KL_MAP } from "@/lib/constants";
import { Scenario } from "@/lib/types";
import { motion } from "framer-motion";
import { Loader2, RotateCcw } from "lucide-react";

export default function GamePage() {
  const router = useRouter();
  const game = useQuery(api.games.getCurrentGame);
  const recentDecisions = useQuery(
    api.games.getRecentDecisions,
    game ? { gameId: game._id, limit: 5 } : "skip"
  );

  const moveToLocation = useMutation(api.games.moveToLocation);
  const updateGameState = useMutation(api.games.updateGameState);
  const recordDecision = useMutation(api.games.recordDecision);
  const advanceTime = useMutation(api.games.advanceTime);
  const resetGame = useMutation(api.games.resetGame);
  const generateScenario = useAction(api.ai.generateScenario);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if no game
  useEffect(() => {
    if (game === null) {
      router.push("/setup");
    }
  }, [game, router]);

  // Redirect if game over
  useEffect(() => {
    if (game?.isGameOver) {
      router.push("/ending");
    }
  }, [game?.isGameOver, router]);

  const handleLocationClick = useCallback(
    async (locationId: LocationId) => {
      if (!game || game.actionsRemaining <= 0 || isGenerating) return;

      // If clicking current location, trigger scenario without moving
      if (locationId === game.currentLocation) {
        setDialogOpen(true);
        setIsGenerating(true);

        try {
          const scenario = await generateScenario({
            personaId: game.personaId,
            location: locationId,
            money: game.money,
            debt: game.debt,
            creditScore: game.creditScore,
            health: game.health,
            stress: game.stress,
            week: game.currentWeek,
            day: game.currentDay,
            recentDecisions:
              recentDecisions?.map((d) => ({
                choiceText: d.choiceText,
                location: d.location,
                week: d.week,
              })) || [],
          });
          setCurrentScenario(scenario as Scenario);
        } catch (error) {
          console.error("Failed to generate scenario:", error);
        } finally {
          setIsGenerating(false);
        }
        return;
      }

      // Move to new location
      try {
        await moveToLocation({ gameId: game._id, location: locationId });

        // Generate scenario for new location
        setDialogOpen(true);
        setIsGenerating(true);

        const scenario = await generateScenario({
          personaId: game.personaId,
          location: locationId,
          money: game.money,
          debt: game.debt,
          creditScore: game.creditScore,
          health: game.health,
          stress: game.stress,
          week: game.currentWeek,
          day: game.currentDay,
          recentDecisions:
            recentDecisions?.map((d) => ({
              choiceText: d.choiceText,
              location: d.location,
              week: d.week,
            })) || [],
        });
        setCurrentScenario(scenario as Scenario);
      } catch (error) {
        console.error("Failed to move or generate scenario:", error);
      } finally {
        setIsGenerating(false);
      }
    },
    [game, recentDecisions, isGenerating, moveToLocation, generateScenario]
  );

  const handleChoiceSelect = useCallback(
    async (choiceIndex: number) => {
      if (!game || !currentScenario || isProcessing) return;

      const choice = currentScenario.choices[choiceIndex];
      if (!choice) return;

      setIsProcessing(true);

      try {
        // Record the decision
        await recordDecision({
          gameId: game._id,
          location: currentScenario.location,
          scenarioId: currentScenario.id,
          choiceIndex,
          choiceText: choice.text,
          moneyChange: choice.consequence.money,
          creditChange: choice.consequence.credit,
          healthChange: choice.consequence.health,
          stressChange: choice.consequence.stress,
          hiddenConsequence: choice.hiddenConsequence,
        });

        // Update game state
        const result = await updateGameState({
          gameId: game._id,
          moneyChange: choice.consequence.money,
          creditChange: choice.consequence.credit,
          healthChange: choice.consequence.health,
          stressChange: choice.consequence.stress,
        });

        // Close dialog
        setDialogOpen(false);
        setCurrentScenario(null);

        // Check if game over
        if (result.isGameOver) {
          router.push("/ending");
        }
      } catch (error) {
        console.error("Failed to process choice:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [game, currentScenario, isProcessing, recordDecision, updateGameState, router]
  );

  const handleEndDay = useCallback(async () => {
    if (!game) return;

    try {
      const result = await advanceTime({ gameId: game._id });
      if (result.isGameOver) {
        router.push("/ending");
      }
    } catch (error) {
      console.error("Failed to advance time:", error);
    }
  }, [game, advanceTime, router]);

  const handleResetGame = useCallback(async () => {
    if (!game) return;
    if (!confirm("Reset game and start over?")) return;

    try {
      await resetGame({ gameId: game._id });
      router.push("/setup");
    } catch (error) {
      console.error("Failed to reset game:", error);
    }
  }, [game, resetGame, router]);

  if (game === undefined) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!game) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <StatsBar
            money={game.money}
            debt={game.debt}
            creditScore={game.creditScore}
            health={game.health}
            stress={game.stress}
            day={game.currentDay}
            week={game.currentWeek}
            actionsRemaining={game.actionsRemaining}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <GameMap
            currentLocation={game.currentLocation as LocationId}
            onLocationClick={handleLocationClick}
            disabled={game.actionsRemaining <= 0 || isGenerating}
            personaId={game.personaId}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-between items-center"
        >
          <div className="text-slate-400 text-sm">
            Current: {(PERSONA_MAPS[game.personaId] || KL_MAP).locations[game.currentLocation as LocationId].name}
          </div>

          <div className="flex gap-2">
            {game.actionsRemaining <= 0 && (
              <Button
                onClick={handleEndDay}
                className="bg-amber-600 hover:bg-amber-700"
              >
                End Day
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={handleResetGame}
              className="border-slate-600 text-slate-400 hover:text-white hover:border-red-500 hover:bg-red-500/10"
              title="Reset Game"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        <LocationDialog
          open={dialogOpen}
          onClose={() => {
            if (!isProcessing) {
              setDialogOpen(false);
              setCurrentScenario(null);
            }
          }}
          scenario={currentScenario}
          isLoading={isGenerating}
          onChoiceSelect={handleChoiceSelect}
          isProcessing={isProcessing}
          personaId={game.personaId}
        />
      </div>
    </main>
  );
}
