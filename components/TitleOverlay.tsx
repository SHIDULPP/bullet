"use client";

import { motion } from "framer-motion";

type TitleOverlayProps = {
  route: string;
  visible: boolean;
  /** Once riding, title sits lightly in the fog so the cockpit stays dominant */
  riding?: boolean;
};

/**
 * Brand title sits in the misty upper third —
 * tank, bars, and gauges stay unobstructed below.
 */
export default function TitleOverlay({
  route,
  visible,
  riding = false,
}: TitleOverlayProps) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center px-4 pt-[8vh] text-center sm:pt-[10vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? 1 : riding ? 0.22 : 0.35 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
    >
      <motion.p
        className="mb-2 font-oswald text-[0.65rem] uppercase tracking-[0.45em] text-chrome/75 sm:text-xs"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.8 }}
      >
        {route}
      </motion.p>

      <motion.h1
        className="font-bebas text-[18vw] leading-[0.85] tracking-wide text-warm-white sm:text-[12vw] md:text-[9vw] lg:text-[7.5rem]"
        style={{
          textShadow:
            "0 0 40px rgba(139, 30, 30, 0.35), 0 4px 24px rgba(0,0,0,0.85)",
        }}
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.15, duration: 1, ease: [0.22, 1, 0.36, 1] }}
      >
        BULLET
      </motion.h1>

      <motion.p
        className="mt-1.5 max-w-md font-oswald text-xs uppercase tracking-[0.28em] text-warm-white/65 sm:text-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: riding ? 0 : 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.8 }}
      >
        You are on the saddle
      </motion.p>
    </motion.div>
  );
}
