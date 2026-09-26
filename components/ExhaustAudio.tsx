"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

const IDLE_VOLUME = 0.38;
const BURST_VOLUME = 0.9;
const FADE_MS = 400;

export type ExhaustAudioHandle = {
  /** Returns true if playback actually started (browser may block autoplay). */
  start: () => Promise<boolean>;
  stop: () => void;
  setMuted: (muted: boolean) => void;
  throttleBurst: () => void;
  playHorn: () => void;
};

type ExhaustAudioProps = {
  onBurst?: () => void;
};

/**
 * Looped Bullet exhaust thump + horn one-shot.
 * Tries to start on open; browsers may still require a gesture.
 */
const ExhaustAudio = forwardRef<ExhaustAudioHandle, ExhaustAudioProps>(
  function ExhaustAudio({ onBurst }, ref) {
    const exhaustRef = useRef<HTMLAudioElement | null>(null);
    const hornRef = useRef<HTMLAudioElement | null>(null);
    const fadeRef = useRef<number | null>(null);
    const burstTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const mutedRef = useRef(false);
    const startedRef = useRef(false);

    const clearFade = () => {
      if (fadeRef.current != null) {
        cancelAnimationFrame(fadeRef.current);
        fadeRef.current = null;
      }
    };

    const fadeTo = useCallback((target: number, ms = FADE_MS) => {
      const el = exhaustRef.current;
      if (!el) return;
      clearFade();
      const start = el.volume;
      const t0 = performance.now();

      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / ms);
        const eased = p * (2 - p);
        el.volume = Math.max(0, Math.min(1, start + (target - start) * eased));
        if (p < 1) fadeRef.current = requestAnimationFrame(tick);
        else fadeRef.current = null;
      };
      fadeRef.current = requestAnimationFrame(tick);
    }, []);

    useEffect(() => {
      const exhaust = new Audio("/exhaust.mp3");
      exhaust.loop = true;
      exhaust.preload = "auto";
      exhaust.volume = 0;
      exhaustRef.current = exhaust;

      const horn = new Audio("/horn.mp3");
      horn.preload = "auto";
      horn.volume = 0.85;
      hornRef.current = horn;

      return () => {
        clearFade();
        if (burstTimer.current) clearTimeout(burstTimer.current);
        exhaust.pause();
        exhaust.src = "";
        horn.pause();
        horn.src = "";
      };
    }, []);

    useImperativeHandle(
      ref,
      () => ({
        async start() {
          const el = exhaustRef.current;
          if (!el) return false;

          if (startedRef.current) {
            if (mutedRef.current) return true;
            try {
              await el.play();
              return true;
            } catch {
              return false;
            }
          }

          startedRef.current = true;
          el.volume = 0;
          try {
            await el.play();
            if (!mutedRef.current) fadeTo(IDLE_VOLUME, 900);
            return true;
          } catch {
            startedRef.current = false;
            return false;
          }
        },
        stop() {
          const el = exhaustRef.current;
          if (!el) return;
          fadeTo(0, 500);
          setTimeout(() => el.pause(), 520);
        },
        setMuted(muted: boolean) {
          mutedRef.current = muted;
          const el = exhaustRef.current;
          if (!el || !startedRef.current) return;
          if (muted) {
            fadeTo(0, 250);
          } else {
            void el.play().catch(() => undefined);
            fadeTo(IDLE_VOLUME, 400);
          }
        },
        throttleBurst() {
          if (!startedRef.current || mutedRef.current) return;
          const el = exhaustRef.current;
          if (!el) return;
          onBurst?.();
          fadeTo(BURST_VOLUME, 120);
          if (burstTimer.current) clearTimeout(burstTimer.current);
          burstTimer.current = setTimeout(() => {
            if (!mutedRef.current) fadeTo(IDLE_VOLUME, 700);
          }, 1400);
        },
        playHorn() {
          const horn = hornRef.current;
          if (!horn || mutedRef.current) return;
          horn.currentTime = 0;
          void horn.play().catch(() => undefined);
        },
      }),
      [fadeTo, onBurst],
    );

    return null;
  },
);

export default ExhaustAudio;
