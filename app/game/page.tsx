"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { GameMap } from "@/components/game/GameMap";
import { StatsBar } from "@/components/game/StatsBar";
import { LocationDialog } from "@/components/game/LocationDialog";
import { SpecialEventDialog } from "@/components/game/SpecialEventDialog";
import { WeekendDialog } from "@/components/game/WeekendDialog";
import { GameOverDialog } from "@/components/game/GameOverDialog";
import { TutorialDialog } from "@/components/game/TutorialDialog";
import { LeaveDialog } from "@/components/game/LeaveDialog";
import { Button } from "@/components/ui/button";
import { LocationId, PERSONA_MAPS, KL_MAP, SPECIAL_EVENTS, WEEKEND_ACTIVITIES, PERSONAS } from "@/lib/constants";
import { Scenario, SpecialEvent, WeekendActivity } from "@/lib/types";
import { motion } from "framer-motion";
import { Loader2, RotateCcw, Calendar } from "lucide-react";

export default function GamePage() {
  const router = useRouter();
  const game = useQuery(api.games.getCurrentGame);
  const recentDecisions = useQuery(
    api.games.getRecentDecisions,
    game ? { gameId: game._id, limit: 5 } : "skip"
  );
  const weekComplete = useQuery(
    api.games.checkWeekComplete,
    game ? { gameId: game._id } : "skip"
  );

  const moveToLocation = useMutation(api.games.moveToLocation);
  const updateGameState = useMutation(api.games.updateGameState);
  const recordDecision = useMutation(api.games.recordDecision);
  const completeObjective = useMutation(api.games.completeObjective);
  const triggerRandomEvent = useMutation(api.games.triggerRandomEvent);
  const selectWeekendActivity = useMutation(api.games.selectWeekendActivity);
  const advanceDay = useMutation(api.games.advanceDay);
  const resetGame = useMutation(api.games.resetGame);
  const generateScenario = useAction(api.ai.generateScenario);
  const updateLiveScore = useMutation(api.leaderboard.updateLiveScore);

  // Dialog states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // New game flow states
  const [showSpecialEvent, setShowSpecialEvent] = useState(false);
  const [currentSpecialEvent, setCurrentSpecialEvent] = useState<SpecialEvent | null>(null);
  const [showWeekendDialog, setShowWeekendDialog] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [pendingEventCheck, setPendingEventCheck] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  // Show tutorial on first play (week 1, day 1, full energy)
  useEffect(() => {
    if (game && game.currentWeek === 1 && game.currentDay === 1) {
      const energy = game.energyRemaining ?? 11;
      if (energy === 11) {
        // Check if tutorial was already shown for this game
        const tutorialShown = localStorage.getItem(`tutorial_${game._id}`);
        if (!tutorialShown) {
          setShowTutorial(true);
        }
      }
    }
  }, [game]);

  const handleCloseTutorial = useCallback(() => {
    if (game) {
      localStorage.setItem(`tutorial_${game._id}`, "true");
    }
    setShowTutorial(false);
  }, [game]);

  // Redirect if no game
  useEffect(() => {
    if (game === null) {
      router.push("/setup");
    }
  }, [game, router]);

  // Check for game over
  useEffect(() => {
    if (game?.isGameOver && !showGameOver) {
      setShowGameOver(true);
    }
  }, [game?.isGameOver, showGameOver]);

  // Check if we should show weekend dialog (Day 5 complete, objectives done)
  useEffect(() => {
    const energy = game?.energyRemaining ?? 11;
    if (
      game &&
      game.currentDay === 5 &&
      weekComplete?.complete &&
      energy <= 0 &&
      !showWeekendDialog &&
      !showSpecialEvent &&
      !dialogOpen
    ) {
      setShowWeekendDialog(true);
    }
  }, [game, weekComplete, showWeekendDialog, showSpecialEvent, dialogOpen]);

  // Get random event for current persona
  const getRandomEvent = useCallback((): SpecialEvent | null => {
    if (!game) return null;

    const persona = game.personaId as keyof typeof SPECIAL_EVENTS;
    const events = SPECIAL_EVENTS[persona];
    if (!events) return null;

    // Combine all events and pick randomly
    const allEvents = [...events.negative, ...events.positive, ...(events.neutral || [])];
    const randomIndex = Math.floor(Math.random() * allEvents.length);
    return allEvents[randomIndex] as SpecialEvent;
  }, [game]);

  // Check for random event trigger after action
  const checkForRandomEvent = useCallback(() => {
    if (!game) return;

    const eventDay = game.weeklyEventDay ?? Math.floor(Math.random() * 5) + 1;
    const eventTriggered = game.weeklyEventTriggered ?? false;

    // Only trigger on the designated event day and if not already triggered
    if (
      game.currentDay === eventDay &&
      !eventTriggered &&
      !showSpecialEvent
    ) {
      const event = getRandomEvent();
      if (event) {
        setCurrentSpecialEvent(event);
        setShowSpecialEvent(true);
      }
    }
  }, [game, showSpecialEvent, getRandomEvent]);

  // Handle random event continue
  const handleEventContinue = useCallback(async () => {
    if (!game || !currentSpecialEvent) return;

    try {
      await triggerRandomEvent({
        gameId: game._id,
        eventId: currentSpecialEvent.id,
        moneyChange: currentSpecialEvent.moneyChange,
        stressChange: currentSpecialEvent.stressChange,
        healthChange: currentSpecialEvent.healthChange,
      });

      setShowSpecialEvent(false);
      setCurrentSpecialEvent(null);
    } catch (error) {
      console.error("Failed to process event:", error);
    }
  }, [game, currentSpecialEvent, triggerRandomEvent]);

  // Handle weekend activity selection
  const handleWeekendActivity = useCallback(
    async (activity: WeekendActivity) => {
      if (!game) return;

      try {
        const result = await selectWeekendActivity({
          gameId: game._id,
          activityId: activity.id,
          moneyCost: activity.moneyCost,
          stressChange: activity.stressChange,
          healthChange: activity.healthChange,
        });

        setShowWeekendDialog(false);

        if (result.isGameOver) {
          setShowGameOver(true);
        }
      } catch (error) {
        console.error("Failed to process weekend activity:", error);
      }
    },
    [game, selectWeekendActivity]
  );

  const handleLocationClick = useCallback(
    async (locationId: LocationId) => {
      const energy = game?.energyRemaining ?? 11;
      if (!game || energy <= 0 || isGenerating) return;

      // Get location info to check objective type
      const mapData = PERSONA_MAPS[game.personaId] || KL_MAP;
      const locationInfo = mapData.locations[locationId];

      // Check if this is a weekend-only location on a weekday
      if (locationInfo?.isWeekendOnly && game.currentDay <= 5) {
        return; // Can't visit weekend locations on weekdays
      }

      // If clicking current location, trigger scenario without moving
      if (locationId === game.currentLocation) {
        // Still check if this location completes an objective (e.g., work at office)
        if (locationInfo?.objectiveType) {
          try {
            await completeObjective({
              gameId: game._id,
              objectiveType: locationInfo.objectiveType,
            });
          } catch {
            // Objective might already be complete or not applicable
          }
        }

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

      // Move to new location (costs 1 energy)
      try {
        await moveToLocation({ gameId: game._id, location: locationId });

        // Check if this location completes an objective
        if (locationInfo?.objectiveType) {
          try {
            await completeObjective({
              gameId: game._id,
              objectiveType: locationInfo.objectiveType,
            });
          } catch {
            // Objective might already be complete or not applicable
          }
        }

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

        // Mark that we need to check for event after dialog closes
        setPendingEventCheck(true);
      } catch (error) {
        console.error("Failed to move or generate scenario:", error);
      } finally {
        setIsGenerating(false);
      }
    },
    [game, recentDecisions, isGenerating, moveToLocation, completeObjective, generateScenario]
  );

  const handleChoiceSelect = useCallback(
    async (choiceIndex: number) => {
      if (!game || !currentScenario || isProcessing) return;

      const choice = currentScenario.choices[choiceIndex];
      if (!choice) return;

      setIsProcessing(true);

      try {
        // Record the decision (provide defaults for potentially undefined values)
        const moneyChange = choice.consequence.money ?? 0;
        const creditChange = choice.consequence.credit ?? 0;
        const healthChange = choice.consequence.health ?? 0;
        const stressChange = choice.consequence.stress ?? 0;

        await recordDecision({
          gameId: game._id,
          location: currentScenario.location,
          scenarioId: currentScenario.id,
          choiceIndex,
          choiceText: choice.text,
          moneyChange,
          creditChange,
          healthChange,
          stressChange,
          hiddenConsequence: choice.hiddenConsequence,
        });

        // Update game state
        const result = await updateGameState({
          gameId: game._id,
          moneyChange,
          creditChange,
          healthChange,
          stressChange,
        });

        // Update live leaderboard score
        if (game.playerName) {
          const newMoney = game.money + moneyChange;
          await updateLiveScore({
            gameId: game._id,
            playerName: game.playerName,
            personaId: game.personaId,
            score: Math.max(0, newMoney),
            weeksCompleted: game.currentWeek,
          });
        }

        // Close dialog
        setDialogOpen(false);
        setCurrentScenario(null);

        // Check if game over
        if (result.isGameOver) {
          setShowGameOver(true);
        } else if (pendingEventCheck) {
          // Check for random event after dialog closes
          setPendingEventCheck(false);
          setTimeout(() => checkForRandomEvent(), 500);
        }
      } catch (error) {
        console.error("Failed to process choice:", error);
      } finally {
        setIsProcessing(false);
      }
    },
    [game, currentScenario, isProcessing, pendingEventCheck, recordDecision, updateGameState, updateLiveScore, checkForRandomEvent]
  );

  // Handle Next Day button click
  const handleNextDay = useCallback(async () => {
    if (!game) return;

    try {
      const result = await advanceDay({ gameId: game._id });

      if (!result.canAdvance) {
        // Show leave dialog - work not done
        setShowLeaveDialog(true);
        return;
      }

      if (result.shouldShowWeekendDialog) {
        setShowWeekendDialog(true);
      }

      if (result.isGameOver) {
        setShowGameOver(true);
      }
    } catch (error) {
      console.error("Failed to advance day:", error);
    }
  }, [game, advanceDay]);

  // Handle applying leave (skip work with penalty)
  const handleApplyLeave = useCallback(async () => {
    if (!game) return;

    try {
      const result = await advanceDay({ gameId: game._id, applyLeave: true });
      setShowLeaveDialog(false);

      if (result.shouldShowWeekendDialog) {
        setShowWeekendDialog(true);
      }

      if (result.isGameOver) {
        setShowGameOver(true);
      }
    } catch (error) {
      console.error("Failed to apply leave:", error);
    }
  }, [game, advanceDay]);

  // Handle go to work from leave dialog
  const handleGoToWork = useCallback(() => {
    setShowLeaveDialog(false);
    // User will manually navigate to office
  }, []);

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

  const handleGameOverRestart = useCallback(async () => {
    if (!game) return;
    try {
      await resetGame({ gameId: game._id });
      setShowGameOver(false);
      router.push("/setup");
    } catch (error) {
      console.error("Failed to reset game:", error);
    }
  }, [game, resetGame, router]);

  const handleMainMenu = useCallback(() => {
    router.push("/");
  }, [router]);

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

  // Provide defaults for optional fields (for backwards compatibility with old games)
  // New games have energyRemaining (11), old games should also use 11 as they need new mechanics
  const energyRemaining = game.energyRemaining ?? 11;
  const weeklyObjectives = game.weeklyObjectives ?? {
    workDaysCompleted: 0,
    boughtGroceries: false,
    filledPetrol: false,
    paidDebt: false,
  };
  const weeklyEventDay = game.weeklyEventDay ?? Math.floor(Math.random() * 5) + 1;
  const weeklyEventTriggered = game.weeklyEventTriggered ?? false;

  // Get weekend activities for current persona
  const personaActivities =
    WEEKEND_ACTIVITIES[game.personaId as keyof typeof WEEKEND_ACTIVITIES] ||
    WEEKEND_ACTIVITIES.freshGrad;
  const weekendActivities = Array.isArray(personaActivities) ? personaActivities : [];

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
            energyRemaining={energyRemaining}
            weeklyObjectives={weeklyObjectives}
            workedToday={game.workedToday}
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
            disabled={energyRemaining <= 0 || isGenerating}
            personaId={game.personaId}
            currentDay={game.currentDay}
            weeklyObjectives={weeklyObjectives}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-between items-center"
        >
          <div className="text-slate-400 text-sm">
            Current: {(PERSONA_MAPS[game.personaId] || KL_MAP).locations[game.currentLocation as LocationId]?.name || "Unknown"}
          </div>

          <div className="flex gap-2 items-center">
            {/* Work status indicator */}
            {game.currentDay <= 5 && (
              <div className={`text-xs px-2 py-1 rounded ${
                game.workedToday
                  ? "bg-emerald-500/20 text-emerald-400"
                  : "bg-amber-500/20 text-amber-400"
              }`}>
                {game.workedToday ? "Worked Today" : "Not Worked Yet"}
              </div>
            )}

            {/* Next Day Button */}
            {game.currentDay <= 5 && (
              <Button
                onClick={handleNextDay}
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isGenerating || isProcessing}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Next Day
              </Button>
            )}

            {energyRemaining <= 0 && game.currentDay === 5 && weekComplete?.complete && (
              <Button
                onClick={() => setShowWeekendDialog(true)}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                Weekend Time!
              </Button>
            )}
            {energyRemaining <= 0 && !weekComplete?.complete && (
              <div className="text-red-400 text-sm mr-2 flex items-center">
                Energy depleted! Complete objectives to continue.
              </div>
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

        {/* Location Dialog */}
        <LocationDialog
          open={dialogOpen}
          onClose={() => {
            if (!isProcessing) {
              setDialogOpen(false);
              setCurrentScenario(null);
              if (pendingEventCheck) {
                setPendingEventCheck(false);
                setTimeout(() => checkForRandomEvent(), 500);
              }
            }
          }}
          scenario={currentScenario}
          isLoading={isGenerating}
          onChoiceSelect={handleChoiceSelect}
          isProcessing={isProcessing}
          personaId={game.personaId}
        />

        {/* Special Event Dialog */}
        <SpecialEventDialog
          isOpen={showSpecialEvent}
          event={currentSpecialEvent}
          onContinue={handleEventContinue}
        />

        {/* Weekend Dialog */}
        <WeekendDialog
          isOpen={showWeekendDialog}
          personaId={game.personaId}
          activities={weekendActivities as WeekendActivity[]}
          skipActivity={WEEKEND_ACTIVITIES.skip}
          currentMoney={game.money}
          currentWeek={game.currentWeek}
          onSelectActivity={handleWeekendActivity}
        />

        {/* Game Over Dialog */}
        <GameOverDialog
          isOpen={showGameOver}
          endingType={game.endingType || "game_over"}
          failureReason={game.failureReason || "Game Over"}
          stats={{
            money: game.money,
            debt: game.debt,
            health: game.health,
            stress: game.stress,
            creditScore: game.creditScore,
            weeksCompleted: game.currentWeek,
          }}
          onRestart={handleGameOverRestart}
          onMainMenu={handleMainMenu}
        />

        {/* Tutorial Dialog */}
        <TutorialDialog
          isOpen={showTutorial}
          onClose={handleCloseTutorial}
          personaName={PERSONAS[game.personaId as keyof typeof PERSONAS]?.name || "Player"}
        />

        {/* Leave Dialog */}
        <LeaveDialog
          isOpen={showLeaveDialog}
          onClose={() => setShowLeaveDialog(false)}
          onApplyLeave={handleApplyLeave}
          onGoToWork={handleGoToWork}
        />
      </div>
    </main>
  );
}
