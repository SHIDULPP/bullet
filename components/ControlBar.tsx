"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ROUTES, type RouteId } from "@/lib/routes";

type ControlBarProps = {
  muted: boolean;
  isFullscreen: boolean;
  routeId: RouteId;
  onHorn: () => void;
  onThrottle: () => void;
  onFullscreen: () => void;
  onMuteToggle: () => void;
  onRouteChange: (id: RouteId) => void;
};

function CtrlBtn({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.95 }}
      className={`flex min-h-11 min-w-[4.5rem] flex-col items-center justify-center gap-1 rounded-xl px-3 py-2 text-[10px] font-oswald uppercase tracking-[0.18em] transition sm:min-w-[5.25rem] sm:text-[11px] ${
        active
          ? "bg-maroon/70 text-warm-white shadow-[0_0_18px_rgba(139,30,30,0.4)]"
          : "bg-white/5 text-warm-white/80 hover:bg-white/10 hover:text-warm-white"
      }`}
      aria-label={label}
    >
      <span className="text-warm-white/90">{children}</span>
      <span>{label}</span>
    </motion.button>
  );
}

/** Immersion controls + route picker. */
export default function ControlBar({
  muted,
  isFullscreen,
  routeId,
  onHorn,
  onThrottle,
  onFullscreen,
  onMuteToggle,
  onRouteChange,
}: ControlBarProps) {
  const [routeOpen, setRouteOpen] = useState(false);

  return (
    <div className="relative flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
      <div className="relative">
        <CtrlBtn
          label="Route"
          onClick={() => setRouteOpen((v) => !v)}
          active={routeOpen}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
          </svg>
        </CtrlBtn>

        <AnimatePresence>
          {routeOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              className="glass absolute bottom-full left-1/2 z-30 mb-2 flex min-w-[13rem] -translate-x-1/2 flex-col gap-1 rounded-xl p-1.5"
            >
              {ROUTES.map((route) => (
                <button
                  key={route.id}
                  type="button"
                  onClick={() => {
                    onRouteChange(route.id);
                    setRouteOpen(false);
                  }}
                  className={`rounded-lg px-3 py-2.5 text-left font-oswald text-[11px] uppercase tracking-wider transition ${
                    routeId === route.id
                      ? "bg-maroon text-warm-white"
                      : "text-warm-white/75 hover:bg-white/10 hover:text-warm-white"
                  }`}
                >
                  {route.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CtrlBtn label="Horn" onClick={onHorn}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
        </svg>
      </CtrlBtn>

      <CtrlBtn label="Throttle" onClick={onThrottle}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M12 2 4 14h5l-2 8 11-14h-5l2-6z" />
        </svg>
      </CtrlBtn>

      <CtrlBtn
        label={isFullscreen ? "Exit" : "Full"}
        onClick={onFullscreen}
        active={isFullscreen}
      >
        {isFullscreen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M7 14H5v5h5v-2H7v-3zm12 0h-2v3h-3v2h5v-5zM7 5h3V3H5v5h2V5zm7-2v2h3v3h2V3h-5z" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M7 14H5v5h5v-2H7v-3zm0-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
          </svg>
        )}
      </CtrlBtn>

      <CtrlBtn label={muted ? "Unmute" : "Mute"} onClick={onMuteToggle} active={muted}>
        {muted ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
          </svg>
        )}
      </CtrlBtn>
    </div>
  );
}
