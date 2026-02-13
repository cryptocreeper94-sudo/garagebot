import { useState, useCallback, useRef } from "react";

type SoundType = "search" | "addToCart" | "success" | "click" | "spin";

interface SoundEffectsReturn {
  soundEnabled: boolean;
  toggleSound: () => void;
  playSound: (type: SoundType) => void;
}

const STORAGE_KEY = "garagebotSoundEnabled";

function getStoredPreference(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "true";
  } catch {
    return false;
  }
}

function playSearchSound(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(400, ctx.currentTime);
  osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.15);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

function playAddToCartSound(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.setValueAtTime(1200, ctx.currentTime + 0.06);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

function playSuccessSound(ctx: AudioContext) {
  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  const gain2 = ctx.createGain();
  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(523, ctx.currentTime);
  gain1.gain.setValueAtTime(0.08, ctx.currentTime);
  gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.15);
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(784, ctx.currentTime + 0.12);
  gain2.gain.setValueAtTime(0, ctx.currentTime);
  gain2.gain.setValueAtTime(0.1, ctx.currentTime + 0.12);
  gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc2.start(ctx.currentTime + 0.12);
  osc2.stop(ctx.currentTime + 0.3);
}

function playClickSound(ctx: AudioContext) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "square";
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.setValueAtTime(200, ctx.currentTime + 0.02);
  gain.gain.setValueAtTime(0.06, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

function playSpinSound(ctx: AudioContext) {
  const notes = [400, 500, 600, 750, 900, 1100];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    const startTime = ctx.currentTime + i * 0.04;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.06, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.06);
    osc.start(startTime);
    osc.stop(startTime + 0.06);
  });
}

const HAPTIC_PATTERNS: Record<SoundType, number[]> = {
  search: [15],
  addToCart: [10, 30, 10],
  success: [10, 20, 30],
  click: [8],
  spin: [5, 10, 5, 10, 5, 10, 15, 25],
};

function triggerHaptic(type: SoundType) {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate(HAPTIC_PATTERNS[type] || [10]);
    }
  } catch {}
}

const SOUND_PLAYERS: Record<SoundType, (ctx: AudioContext) => void> = {
  search: playSearchSound,
  addToCart: playAddToCartSound,
  success: playSuccessSound,
  click: playClickSound,
  spin: playSpinSound,
};

export default function useSoundEffects(): SoundEffectsReturn {
  const [soundEnabled, setSoundEnabled] = useState<boolean>(getStoredPreference);
  const ctxRef = useRef<AudioContext | null>(null);

  const getContext = useCallback((): AudioContext | null => {
    try {
      if (!ctxRef.current || ctxRef.current.state === "closed") {
        ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      if (ctxRef.current.state === "suspended") {
        ctxRef.current.resume();
      }
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });
  }, []);

  const playSound = useCallback(
    (type: SoundType) => {
      triggerHaptic(type);
      if (!soundEnabled) return;
      const ctx = getContext();
      if (!ctx) return;
      const player = SOUND_PLAYERS[type];
      if (player) {
        player(ctx);
      }
    },
    [soundEnabled, getContext],
  );

  return { soundEnabled, toggleSound, playSound };
}
