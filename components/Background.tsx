"use client";

import { AnimatePresence, motion } from "framer-motion";

type BackgroundProps = {
  src: string;
  /** Engine running — idle thump vibration */
  riding?: boolean;
  /** Stronger shake on throttle burst */
  shake?: boolean;
};

/**
 * Full-bleed POV cockpit for the selected route.
 * Landscape ride stills use object-cover so the road fills the screen.
 */
export default function Background({
  src,
  riding = false,
  shake = false,
}: BackgroundProps) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden bg-near-black"
      animate={
        shake
          ? { x: [0, -2, 2, -1, 1, 0], y: [0, 1.5, -1.5, 0.8, 0] }
          : riding
            ? {
                x: [0, 0.4, -0.3, 0.35, -0.2, 0],
                y: [0, 0.5, 0.1, 0.55, 0.05, 0],
              }
            : { x: 0, y: 0 }
      }
      transition={
        shake
          ? { duration: 0.32, ease: "easeOut" }
          : riding
            ? { duration: 0.52, ease: "easeInOut", repeat: Infinity }
            : { duration: 0.25 }
      }
    >
      <AnimatePresence mode="sync" initial={false}>
        <motion.img
          key={src}
          src={src}
          alt="First-person Bullet ride view"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0 h-full w-full object-cover object-center"
          draggable={false}
        />
      </AnimatePresence>

      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/45 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />
    </motion.div>
  );
}
