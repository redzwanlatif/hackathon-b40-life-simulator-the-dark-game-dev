"use client";

import { LOCATIONS, LocationId } from "@/lib/constants";
import { motion } from "framer-motion";

interface GameMapProps {
  currentLocation: LocationId;
  onLocationClick: (locationId: LocationId) => void;
  disabled?: boolean;
}

export function GameMap({ currentLocation, onLocationClick, disabled }: GameMapProps) {
  return (
    <div className="relative w-full h-[400px] bg-gradient-to-b from-green-900/30 to-slate-800 rounded-lg overflow-hidden border border-slate-700">
      {/* Road grid background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/2 left-0 right-0 h-4 bg-slate-600" />
        <div className="absolute top-0 bottom-0 left-1/2 w-4 bg-slate-600" />
      </div>

      {/* Locations */}
      {(Object.entries(LOCATIONS) as [LocationId, typeof LOCATIONS[LocationId]][]).map(
        ([id, location]) => (
          <motion.button
            key={id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
              currentLocation === id
                ? "bg-emerald-600/50 ring-2 ring-emerald-400 scale-110"
                : "bg-slate-800/80 hover:bg-slate-700/80"
            } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:scale-105"}`}
            style={{
              left: `${location.x}%`,
              top: `${location.y}%`,
            }}
            onClick={() => !disabled && onLocationClick(id)}
            whileHover={!disabled ? { scale: 1.1 } : undefined}
            whileTap={!disabled ? { scale: 0.95 } : undefined}
            disabled={disabled}
          >
            <span className="text-2xl">{location.icon}</span>
            <span className="text-xs text-white font-medium whitespace-nowrap">
              {location.name}
            </span>
          </motion.button>
        )
      )}

      {/* Player indicator */}
      <motion.div
        className="absolute w-4 h-4 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"
        style={{
          left: `${LOCATIONS[currentLocation].x}%`,
          top: `${LOCATIONS[currentLocation].y}%`,
        }}
        animate={{
          left: `${LOCATIONS[currentLocation].x}%`,
          top: `${LOCATIONS[currentLocation].y}%`,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
      />

      {/* Instructions */}
      <div className="absolute bottom-2 left-2 right-2 text-center">
        <p className="text-slate-400 text-xs">
          Click a location to walk there (uses 1 action)
        </p>
      </div>
    </div>
  );
}
