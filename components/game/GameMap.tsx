"use client";

import { LocationId, MapConfig, PERSONA_MAPS, KL_MAP, Location } from "@/lib/constants";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

// Pre-computed particle positions to avoid hydration mismatch
const floatingParticles = [
  { x: 10, y: 20, duration: 3, delay: 0 },
  { x: 25, y: 45, duration: 3.5, delay: 0.5 },
  { x: 40, y: 15, duration: 2.8, delay: 1 },
  { x: 55, y: 70, duration: 4, delay: 0.3 },
  { x: 70, y: 35, duration: 3.2, delay: 1.5 },
  { x: 85, y: 60, duration: 3.8, delay: 0.8 },
  { x: 15, y: 80, duration: 2.5, delay: 1.2 },
  { x: 30, y: 55, duration: 3.3, delay: 0.2 },
  { x: 60, y: 25, duration: 4.2, delay: 0.7 },
  { x: 80, y: 85, duration: 2.9, delay: 1.8 },
  { x: 45, y: 40, duration: 3.6, delay: 0.4 },
  { x: 90, y: 30, duration: 3.1, delay: 1.1 },
  { x: 20, y: 65, duration: 3.7, delay: 0.6 },
  { x: 75, y: 50, duration: 2.7, delay: 1.4 },
  { x: 50, y: 90, duration: 3.4, delay: 0.9 },
];

interface GameMapProps {
  currentLocation: LocationId;
  onLocationClick: (locationId: LocationId) => void;
  disabled?: boolean;
  personaId?: string;
}

const locationColors: Record<LocationId, { bg: string; glow: string; border: string }> = {
  home: { bg: "from-blue-600 to-blue-800", glow: "#3b82f6", border: "border-blue-400" },
  shop: { bg: "from-amber-500 to-orange-600", glow: "#f59e0b", border: "border-amber-400" },
  petrol: { bg: "from-red-500 to-red-700", glow: "#ef4444", border: "border-red-400" },
  tnb: { bg: "from-yellow-400 to-yellow-600", glow: "#facc15", border: "border-yellow-400" },
  office: { bg: "from-slate-500 to-slate-700", glow: "#64748b", border: "border-slate-400" },
  bank: { bg: "from-emerald-500 to-emerald-700", glow: "#10b981", border: "border-emerald-400" },
  bus: { bg: "from-purple-500 to-purple-700", glow: "#a855f7", border: "border-purple-400" },
};

export function GameMap({ currentLocation, onLocationClick, disabled, personaId }: GameMapProps) {
  const [hoveredLocation, setHoveredLocation] = useState<LocationId | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the correct map based on persona
  const mapConfig: MapConfig = useMemo(() => {
    if (personaId && PERSONA_MAPS[personaId]) {
      return PERSONA_MAPS[personaId];
    }
    return KL_MAP;
  }, [personaId]);

  const { locations, theme, landmarks } = mapConfig;

  // Render road based on style
  const renderRoads = () => {
    switch (theme.roadStyle) {
      case "modern":
        // KL - Modern grid roads with multiple lanes
        return (
          <>
            {/* Main horizontal highway */}
            <motion.div
              className="absolute top-1/2 left-0 right-0 h-10 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700"
              style={{ transform: "translateY(-50%)" }}
            >
              <motion.div
                className="absolute inset-0 flex items-center justify-around"
                animate={{ x: [0, -40] }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
              >
                {[...Array(25)].map((_, i) => (
                  <div key={i} className="w-10 h-1 bg-yellow-400/60" />
                ))}
              </motion.div>
              {/* Double lane lines */}
              <div className="absolute top-1 left-0 right-0 h-0.5 bg-white/20" />
              <div className="absolute bottom-1 left-0 right-0 h-0.5 bg-white/20" />
            </motion.div>

            {/* Vertical road */}
            <div
              className="absolute top-0 bottom-0 left-1/2 w-10 bg-gradient-to-b from-slate-700 via-slate-600 to-slate-700"
              style={{ transform: "translateX(-50%)" }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-around">
                {[...Array(18)].map((_, i) => (
                  <div key={i} className="w-1 h-8 bg-yellow-400/60" />
                ))}
              </div>
            </div>

            {/* Secondary road */}
            <div className="absolute top-0 bottom-0 left-[25%] w-6 bg-gradient-to-b from-slate-800 via-slate-700 to-slate-800 opacity-60">
              <div className="absolute inset-0 flex flex-col items-center justify-around">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-0.5 h-4 bg-white/30" />
                ))}
              </div>
            </div>
          </>
        );

      case "heritage":
        // Penang - Narrow winding streets with old-style markings
        return (
          <>
            {/* Main coastal road - curved feel */}
            <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.8 }}>
              <path
                d="M 0 60% Q 30% 50%, 50% 55% T 100% 45%"
                stroke="#475569"
                strokeWidth="24"
                fill="none"
              />
              <path
                d="M 0 60% Q 30% 50%, 50% 55% T 100% 45%"
                stroke="#fbbf24"
                strokeWidth="1"
                strokeDasharray="8 12"
                fill="none"
                opacity="0.4"
              />
            </svg>

            {/* Narrow heritage street */}
            <div
              className="absolute top-[20%] bottom-[40%] left-[30%] w-5 bg-gradient-to-b from-slate-700 via-stone-600 to-slate-700"
              style={{ transform: "rotate(-10deg)" }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-around">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-0.5 h-3 bg-amber-400/40" />
                ))}
              </div>
            </div>

            {/* Cobblestone texture overlay */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `radial-gradient(circle, #fbbf24 1px, transparent 1px)`,
                backgroundSize: "12px 12px",
              }}
            />
          </>
        );

      case "industrial":
        // JB - Wide industrial roads with truck lanes
        return (
          <>
            {/* Main industrial highway - wider */}
            <motion.div
              className="absolute top-[45%] left-0 right-0 h-14 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800"
            >
              <motion.div
                className="absolute inset-0 flex items-center justify-around"
                animate={{ x: [0, -60] }}
                transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
              >
                {[...Array(20)].map((_, i) => (
                  <div key={i} className="w-12 h-1.5 bg-orange-400/50" />
                ))}
              </motion.div>
              {/* Heavy vehicle lanes */}
              <div className="absolute top-2 left-0 right-0 h-0.5 bg-orange-500/30" />
              <div className="absolute bottom-2 left-0 right-0 h-0.5 bg-orange-500/30" />
            </motion.div>

            {/* Road to factory */}
            <div
              className="absolute top-0 right-[20%] bottom-[55%] w-8 bg-gradient-to-b from-slate-700 to-slate-800"
            >
              <div className="absolute inset-0 flex flex-col items-center justify-around">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="w-1 h-6 bg-orange-400/40" />
                ))}
              </div>
            </div>

            {/* Road to CIQ/Singapore border */}
            <div className="absolute bottom-0 right-[15%] top-[55%] w-10 bg-gradient-to-b from-slate-700 to-slate-600">
              <div className="absolute inset-0 flex flex-col items-center justify-around">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="w-1 h-5 bg-white/30" />
                ))}
              </div>
              {/* Border crossing indicator */}
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-2 bg-orange-500/50"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-[450px] rounded-xl overflow-hidden border-2" style={{ borderColor: `${theme.primaryColor}30` }}>
      {/* Animated background with theme-specific gradient */}
      <div className={`absolute inset-0 bg-gradient-to-b ${theme.bgGradient}`}>
        {/* Grid pattern with theme color */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(${theme.gridColor} 1px, transparent 1px),
              linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Region-specific roads */}
        {renderRoads()}
      </div>

      {/* Floating particles - themed color */}
      {mounted && floatingParticles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            backgroundColor: `${theme.primaryColor}50`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            repeat: Infinity,
            duration: p.duration,
            delay: p.delay,
          }}
        />
      ))}

      {/* Landmarks - decorative background elements */}
      {landmarks.map((landmark, i) => {
        const sizes = { sm: "text-lg", md: "text-2xl", lg: "text-4xl" };
        const opacities = { sm: "opacity-30", md: "opacity-40", lg: "opacity-50" };

        return (
          <motion.div
            key={i}
            className={`absolute ${sizes[landmark.size]} ${opacities[landmark.size]} pointer-events-none select-none`}
            style={{
              left: `${landmark.x}%`,
              top: `${landmark.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: landmark.size === "lg" ? 0.5 : landmark.size === "md" ? 0.4 : 0.3,
              scale: 1,
            }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
          >
            <div className="relative">
              <span className="filter drop-shadow-lg">{landmark.icon}</span>
              <span
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[8px] whitespace-nowrap font-bold tracking-wider"
                style={{ color: `${theme.primaryColor}80` }}
              >
                {landmark.name}
              </span>
            </div>
          </motion.div>
        );
      })}

      {/* Location markers */}
      {(Object.entries(locations) as [LocationId, Location][]).map(
        ([id, location]) => {
          const isCurrentLocation = currentLocation === id;
          const isHovered = hoveredLocation === id;
          const colors = locationColors[id];

          return (
            <motion.button
              key={id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1 transition-all z-10 ${
                disabled ? "cursor-not-allowed" : "cursor-pointer"
              }`}
              style={{
                left: `${location.x}%`,
                top: `${location.y}%`,
              }}
              onClick={() => !disabled && onLocationClick(id)}
              onHoverStart={() => setHoveredLocation(id)}
              onHoverEnd={() => setHoveredLocation(null)}
              whileHover={!disabled ? { scale: 1.15 } : undefined}
              whileTap={!disabled ? { scale: 0.95 } : undefined}
              disabled={disabled}
            >
              {/* Pulse ring for current location */}
              {isCurrentLocation && (
                <>
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{ backgroundColor: colors.glow }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    style={{ backgroundColor: colors.glow }}
                    animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                  />
                </>
              )}

              {/* Location card */}
              <motion.div
                className={`relative px-3 py-2 rounded-xl border-2 ${colors.border} bg-gradient-to-br ${colors.bg}`}
                style={{
                  boxShadow: isCurrentLocation || isHovered
                    ? `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}44, inset 0 0 20px rgba(255,255,255,0.1)`
                    : `0 0 10px ${colors.glow}44`,
                }}
                animate={isCurrentLocation ? {
                  y: [0, -5, 0],
                } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <motion.span
                  className="text-3xl block"
                  animate={isHovered ? { rotate: [0, -10, 10, 0], scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {location.icon}
                </motion.span>
              </motion.div>

              {/* Location name */}
              <motion.span
                className={`text-xs font-bold whitespace-nowrap px-2 py-0.5 rounded-full ${
                  isCurrentLocation
                    ? "bg-white text-slate-900"
                    : "bg-slate-800/90 text-white"
                }`}
                style={{
                  textShadow: isCurrentLocation ? "none" : `0 0 10px ${colors.glow}`,
                }}
              >
                {location.name}
              </motion.span>

              {/* "YOU ARE HERE" indicator */}
              {isCurrentLocation && (
                <motion.div
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span
                    className="text-[10px] font-bold bg-slate-900/90 px-2 py-0.5 rounded animate-pulse"
                    style={{ color: theme.primaryColor }}
                  >
                    HERE
                  </span>
                </motion.div>
              )}
            </motion.button>
          );
        }
      )}

      {/* Player trail/glow at current location */}
      <motion.div
        className="absolute w-6 h-6 rounded-full pointer-events-none"
        style={{
          left: `${locations[currentLocation].x}%`,
          top: `${locations[currentLocation].y}%`,
          background: `radial-gradient(circle, ${theme.primaryColor} 0%, transparent 70%)`,
          filter: "blur(8px)",
        }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.8, 0.4, 0.8],
        }}
        transition={{ repeat: Infinity, duration: 2 }}
      />

      {/* Region name badge */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20">
        <motion.div
          className="px-4 py-1 rounded-full border backdrop-blur-sm"
          style={{
            backgroundColor: `${theme.primaryColor}15`,
            borderColor: `${theme.primaryColor}40`,
          }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span
            className="text-sm font-bold tracking-wider"
            style={{ color: theme.primaryColor }}
          >
            {theme.name.toUpperCase()}
          </span>
        </motion.div>
      </div>

      {/* Instructions overlay */}
      <div className="absolute bottom-3 left-3 right-3">
        <div
          className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-4 py-2 border"
          style={{ borderColor: `${theme.primaryColor}30` }}
        >
          <p className="text-xs text-center font-mono" style={{ color: `${theme.primaryColor}cc` }}>
            {disabled ? (
              <span className="text-yellow-400">NO ACTIONS LEFT - END DAY TO CONTINUE</span>
            ) : (
              <>CLICK A LOCATION TO EXPLORE <span className="text-slate-500">(-1 ACTION)</span></>
            )}
          </p>
        </div>
      </div>

      {/* Corner decorations with theme color */}
      <div className="absolute top-2 left-2 w-8 h-8 border-l-2 border-t-2" style={{ borderColor: `${theme.primaryColor}50` }} />
      <div className="absolute top-2 right-2 w-8 h-8 border-r-2 border-t-2" style={{ borderColor: `${theme.primaryColor}50` }} />
      <div className="absolute bottom-2 left-2 w-8 h-8 border-l-2 border-b-2" style={{ borderColor: `${theme.primaryColor}50` }} />
      <div className="absolute bottom-2 right-2 w-8 h-8 border-r-2 border-b-2" style={{ borderColor: `${theme.primaryColor}50` }} />
    </div>
  );
}
