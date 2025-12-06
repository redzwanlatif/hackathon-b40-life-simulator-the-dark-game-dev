"use client";

import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

interface StatsBarProps {
  money: number;
  debt: number;
  creditScore: number;
  health: number;
  stress: number;
  day: number;
  week: number;
  actionsRemaining: number;
}

export function StatsBar({
  money,
  debt,
  creditScore,
  health,
  stress,
  day,
  week,
  actionsRemaining,
}: StatsBarProps) {
  const getCreditColor = (score: number) => {
    if (score >= 700) return "text-emerald-400";
    if (score >= 650) return "text-green-400";
    if (score >= 600) return "text-yellow-400";
    if (score >= 550) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="bg-slate-800/90 backdrop-blur-sm rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-400">Week {week}, Day {day}</span>
        <span className="text-slate-400">
          Actions: {actionsRemaining}/3
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Money</span>
            <motion.span
              key={money}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className={money < 100 ? "text-red-400" : "text-emerald-400"}
            >
              RM {money.toLocaleString()}
            </motion.span>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Debt</span>
            <span className="text-red-400">RM {debt.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-400">Credit Score</span>
          <motion.span
            key={creditScore}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={getCreditColor(creditScore)}
          >
            {creditScore}
          </motion.span>
        </div>
        <Progress value={(creditScore - 300) / 5.5} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Health</span>
            <span className={health < 30 ? "text-red-400" : "text-white"}>{health}%</span>
          </div>
          <Progress value={health} className="h-2" />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">Stress</span>
            <span className={stress > 70 ? "text-red-400" : "text-white"}>{stress}%</span>
          </div>
          <Progress value={stress} className="h-2 [&>div]:bg-orange-500" />
        </div>
      </div>
    </div>
  );
}
