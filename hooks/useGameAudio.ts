"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface GameState {
  health: number;
  stress: number;
  energy: number;
}

interface UseGameAudioReturn {
  volume: number;
  setVolume: (volume: number) => void;
  isMuted: boolean;
  toggleMute: () => void;
  isPlaying: boolean;
  startMusic: () => void;
}

export function useGameAudio(gameState: GameState | null): UseGameAudioReturn {
  const normalAudioRef = useRef<HTMLAudioElement | null>(null);
  const dangerAudioRef = useRef<HTMLAudioElement | null>(null);
  const [volume, setVolumeState] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<"normal" | "danger">("normal");

  // Initialize audio elements
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Create audio elements
    normalAudioRef.current = new Audio("/normal.mp3");
    dangerAudioRef.current = new Audio("/danger.mp3");

    // Set loop
    normalAudioRef.current.loop = true;
    dangerAudioRef.current.loop = true;

    // Load saved settings from localStorage
    const savedVolume = localStorage.getItem("gameVolume");
    const savedMuted = localStorage.getItem("gameMuted");

    if (savedVolume) {
      const vol = parseFloat(savedVolume);
      setVolumeState(vol);
      normalAudioRef.current.volume = vol;
      dangerAudioRef.current.volume = vol;
    } else {
      normalAudioRef.current.volume = 0.5;
      dangerAudioRef.current.volume = 0.5;
    }

    if (savedMuted === "true") {
      setIsMuted(true);
      normalAudioRef.current.muted = true;
      dangerAudioRef.current.muted = true;
    }

    // Cleanup
    return () => {
      normalAudioRef.current?.pause();
      dangerAudioRef.current?.pause();
      normalAudioRef.current = null;
      dangerAudioRef.current = null;
    };
  }, []);

  // Determine if in danger state
  const isInDanger = useCallback((state: GameState | null): boolean => {
    if (!state) return false;
    return state.health < 30 || state.stress > 70 || state.energy <= 2;
  }, []);

  // Switch tracks based on game state
  useEffect(() => {
    if (!gameState || !isPlaying) return;

    const shouldBeDanger = isInDanger(gameState);
    const newTrack = shouldBeDanger ? "danger" : "normal";

    if (newTrack !== currentTrack) {
      setCurrentTrack(newTrack);

      // Crossfade between tracks
      if (newTrack === "danger") {
        normalAudioRef.current?.pause();
        if (dangerAudioRef.current) {
          dangerAudioRef.current.currentTime = 0;
          dangerAudioRef.current.play().catch(() => {});
        }
      } else {
        dangerAudioRef.current?.pause();
        if (normalAudioRef.current) {
          normalAudioRef.current.currentTime = 0;
          normalAudioRef.current.play().catch(() => {});
        }
      }
    }
  }, [gameState, isPlaying, currentTrack, isInDanger]);

  // Start music (needs user interaction)
  const startMusic = useCallback(() => {
    if (isPlaying) return;

    const audioToPlay = isInDanger(gameState)
      ? dangerAudioRef.current
      : normalAudioRef.current;

    if (audioToPlay) {
      audioToPlay.play().then(() => {
        setIsPlaying(true);
        setCurrentTrack(isInDanger(gameState) ? "danger" : "normal");
      }).catch((error) => {
        console.error("Failed to play audio:", error);
      });
    }
  }, [isPlaying, gameState, isInDanger]);

  // Update volume
  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    localStorage.setItem("gameVolume", String(newVolume));

    if (normalAudioRef.current) {
      normalAudioRef.current.volume = newVolume;
    }
    if (dangerAudioRef.current) {
      dangerAudioRef.current.volume = newVolume;
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    localStorage.setItem("gameMuted", String(newMuted));

    if (normalAudioRef.current) {
      normalAudioRef.current.muted = newMuted;
    }
    if (dangerAudioRef.current) {
      dangerAudioRef.current.muted = newMuted;
    }
  }, [isMuted]);

  return {
    volume,
    setVolume,
    isMuted,
    toggleMute,
    isPlaying,
    startMusic,
  };
}
