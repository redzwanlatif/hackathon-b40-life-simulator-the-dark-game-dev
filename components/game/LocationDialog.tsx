"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LOCATIONS, LocationId } from "@/lib/constants";
import { Scenario } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";

function getLocationName(locationId: string): string {
  const location = LOCATIONS[locationId as LocationId];
  return location ? `${location.icon} ${location.name}` : locationId;
}

interface LocationDialogProps {
  open: boolean;
  onClose: () => void;
  scenario: Scenario | null;
  isLoading: boolean;
  onChoiceSelect: (choiceIndex: number) => void;
  isProcessing: boolean;
}

export function LocationDialog({
  open,
  onClose,
  scenario,
  isLoading,
  onChoiceSelect,
  isProcessing,
}: LocationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg max-h-[90vh] flex flex-col">
        {isLoading ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Loading...</DialogTitle>
              <DialogDescription className="text-slate-400">
                Preparing your scenario
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
              <p className="text-slate-400 mt-4">Generating scenario...</p>
            </div>
          </>
        ) : scenario ? (
          <>
            <DialogHeader className="shrink-0">
              <DialogTitle className="text-xl">{getLocationName(scenario.location)}</DialogTitle>
              <DialogDescription className="text-slate-400">
                {getEmotionEmoji(scenario.emotion)} {scenario.emotion}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 overflow-y-auto flex-1 min-h-0">
              <p className="text-slate-200 leading-relaxed break-words whitespace-pre-wrap">{scenario.narration}</p>

              {scenario.npcDialogue && (
                <div className="bg-slate-700/50 rounded-lg p-3 border-l-4 border-emerald-500">
                  <p className="text-sm text-slate-400 mb-1">
                    {scenario.npcDialogue.speaker}:
                  </p>
                  <p className="text-white italic break-words whitespace-pre-wrap">
                    &ldquo;{scenario.npcDialogue.text}&rdquo;
                  </p>
                </div>
              )}

              <div className="space-y-2 pt-4">
                <p className="text-sm text-slate-400 mb-2">What do you do?</p>
                <AnimatePresence>
                  {scenario.choices.map((choice, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-3 px-4 bg-slate-700/50 border-slate-600 hover:bg-slate-600 hover:border-emerald-500 text-white break-words"
                        onClick={() => onChoiceSelect(index)}
                        disabled={isProcessing}
                      >
                        <div className="flex flex-col items-start gap-1 w-full">
                          <div className="flex items-start gap-2 w-full">
                            <span className="text-emerald-400 shrink-0">{index + 1}.</span>
                            <span className="flex-1">{choice.text}</span>
                            {choice.consequence.money !== 0 && (
                              <span
                                className={`text-xs shrink-0 ${
                                  choice.consequence.money > 0
                                    ? "text-emerald-400"
                                    : "text-red-400"
                                }`}
                              >
                                ({choice.consequence.money > 0 ? "+" : ""}
                                RM{choice.consequence.money})
                              </span>
                            )}
                          </div>
                        </div>
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {isProcessing && (
                <div className="flex items-center justify-center py-2 shrink-0">
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-400 mr-2" />
                  <span className="text-slate-400 text-sm">Processing choice...</span>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl">Error</DialogTitle>
              <DialogDescription className="text-slate-400">
                Unable to load scenario
              </DialogDescription>
            </DialogHeader>
            <div className="py-8 text-center text-slate-400">
              Something went wrong. Please try again.
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function getEmotionEmoji(emotion: string): string {
  const emotionEmojis: Record<string, string> = {
    neutral: "😐",
    happy: "😊",
    sad: "😢",
    stressed: "😰",
    angry: "😠",
    hopeful: "🤞",
    desperate: "😩",
    relieved: "😌",
  };
  return emotionEmojis[emotion] || "😐";
}
