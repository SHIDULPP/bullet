"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { formatTime, type NowPlaying } from "@/lib/youtube";

type MusicPlayerProps = {
  nowPlaying: NowPlaying | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  ready: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (ratio: number) => void;
  onVolume: (volume: number) => void;
  onToggleMute: () => void;
};

function IconBtn({
  label,
  onClick,
  children,
  className = "",
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      className={`flex h-11 w-11 items-center justify-center rounded-full text-warm-white/90 transition hover:bg-white/10 hover:text-warm-white active:bg-maroon/40 ${className}`}
    >
      {children}
    </motion.button>
  );
}

/**
 * Glassmorphism now-playing bar — custom UI over a hidden YouTube player.
 */
export default function MusicPlayer({
  nowPlaying,
  isPlaying,
  currentTime,
  duration,
  volume,
  muted,
  ready,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onVolume,
  onToggleMute,
}: MusicPlayerProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="glass w-full rounded-2xl px-3 py-3 sm:px-4 sm:py-3.5">
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Thumbnail */}
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-black/50 ring-1 ring-white/10 sm:h-14 sm:w-14">
          {nowPlaying?.thumbnail ? (
            <Image
              src={nowPlaying.thumbnail}
              alt=""
              fill
              sizes="56px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-bebas text-lg text-maroon">
              RE
            </div>
          )}
        </div>

        {/* Meta + progress */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-oswald text-sm tracking-wide text-warm-white sm:text-base">
            {nowPlaying?.title ?? (ready ? "Ready to ride" : "Connecting to YouTube…")}
          </p>
          <p className="truncate text-xs text-warm-white/55 sm:text-sm">
            {nowPlaying?.artist ?? "Road trip playlist"}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="w-9 shrink-0 text-[10px] tabular-nums text-warm-white/45">
              {formatTime(currentTime)}
            </span>
            <div
              className="group relative h-1.5 flex-1 cursor-pointer rounded-full bg-white/15"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                onSeek(Math.min(1, Math.max(0, ratio)));
              }}
              role="slider"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              aria-label="Seek"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight") onSeek(Math.min(1, progress / 100 + 0.05));
                if (e.key === "ArrowLeft") onSeek(Math.max(0, progress / 100 - 0.05));
              }}
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-maroon transition-[width]"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-chrome opacity-0 shadow transition group-hover:opacity-100"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>
            <span className="w-9 shrink-0 text-right text-[10px] tabular-nums text-warm-white/45">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Transport */}
        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          <IconBtn label="Previous" onClick={onPrev}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" />
            </svg>
          </IconBtn>
          <IconBtn
            label={isPlaying ? "Pause" : "Play"}
            onClick={onTogglePlay}
            className="h-12 w-12 bg-maroon/80 text-warm-white shadow-[0_0_20px_rgba(139,30,30,0.45)] hover:bg-maroon"
          >
            {isPlaying ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            )}
          </IconBtn>
          <IconBtn label="Next" onClick={onNext}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 6h2v12h-2V6zM6 18l8.5-6L6 6v12z" />
            </svg>
          </IconBtn>
        </div>

        {/* Volume — desktop */}
        <div className="hidden items-center gap-2 md:flex">
          <IconBtn label={muted ? "Unmute" : "Mute"} onClick={onToggleMute}>
            {muted || volume === 0 ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              </svg>
            )}
          </IconBtn>
          <input
            type="range"
            min={0}
            max={100}
            value={muted ? 0 : volume}
            aria-label="Volume"
            onChange={(e) => onVolume(Number(e.target.value))}
            className="volume-slider w-24"
          />
        </div>
      </div>
    </div>
  );
}
