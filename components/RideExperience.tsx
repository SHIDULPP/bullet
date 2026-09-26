"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import Background from "@/components/Background";
import ControlBar from "@/components/ControlBar";
import ExhaustAudio, {
  type ExhaustAudioHandle,
} from "@/components/ExhaustAudio";
import MusicPlayer from "@/components/MusicPlayer";
import TitleOverlay from "@/components/TitleOverlay";
import { getRoute, type RouteId } from "@/lib/routes";
import {
  loadYouTubeAPI,
  parseVideoTitle,
  readStoredVolume,
  thumbnailFor,
  writeStoredVolume,
  YOUTUBE_PLAYLIST_ID,
  YTPlayerState,
  type NowPlaying,
  type YTPlayer,
} from "@/lib/youtube";

/**
 * Full-viewport immersive Bullet ride experience.
 * Route-selectable POV stills + exhaust thump + road-trip music.
 */
export default function RideExperience() {
  const [routeId, setRouteId] = useState<RouteId>("manali-ladakh");
  const [rideLive, setRideLive] = useState(false);
  /** Only shown if the browser blocked autoplay with sound */
  const [needsGesture, setNeedsGesture] = useState(false);
  const [shake, setShake] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showLandscapeHint, setShowLandscapeHint] = useState(false);

  const [ytReady, setYtReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<NowPlaying | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [muted, setMuted] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const exhaustRef = useRef<ExhaustAudioHandle>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const volumeRef = useRef(70);
  /** Always prefer playing as soon as the YT player is ready */
  const wantPlayRef = useRef(true);
  const rideLiveRef = useRef(false);

  const route = getRoute(routeId);

  const syncNowPlaying = useCallback((player: YTPlayer) => {
    try {
      const data = player.getVideoData();
      if (!data?.video_id) return;
      const parsed = parseVideoTitle(data.title || "Now Playing");
      setNowPlaying({
        ...parsed,
        videoId: data.video_id,
        thumbnail: thumbnailFor(data.video_id),
      });
      setDuration(player.getDuration() || 0);
    } catch {
      /* player not ready */
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        setCurrentTime(p.getCurrentTime() || 0);
        setDuration(p.getDuration() || 0);
        const state = p.getPlayerState();
        setIsPlaying(state === YTPlayerState.PLAYING);
        if (
          state === YTPlayerState.PLAYING ||
          state === YTPlayerState.BUFFERING
        ) {
          syncNowPlaying(p);
        }
      } catch {
        /* ignore */
      }
    }, 400);
  }, [syncNowPlaying]);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const YTns = await loadYouTubeAPI();
        if (cancelled) return;

        const host = document.getElementById("yt-host");
        if (!host) return;

        playerRef.current = new YTns.Player("yt-host", {
          height: "1",
          width: "1",
          playerVars: {
            listType: "playlist",
            list: YOUTUBE_PLAYLIST_ID,
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            origin:
              typeof window !== "undefined" ? window.location.origin : undefined,
          },
          events: {
            onReady: (e) => {
              const vol = readStoredVolume(70);
              volumeRef.current = vol;
              setVolume(vol);
              e.target.unMute();
              e.target.setVolume(vol);
              setYtReady(true);
              syncNowPlaying(e.target);
              startPolling();
              // Auto-start playlist as soon as the player is ready
              e.target.playVideo();
            },
            onStateChange: (e) => {
              const playing = e.data === YTPlayerState.PLAYING;
              setIsPlaying(playing);
              if (playing) {
                rideLiveRef.current = true;
                setRideLive(true);
                setNeedsGesture(false);
              }
              if (
                e.data === YTPlayerState.PLAYING ||
                e.data === YTPlayerState.CUED ||
                e.data === YTPlayerState.BUFFERING
              ) {
                syncNowPlaying(e.target);
              }
            },
            onError: () => {
              setYtReady(true);
            },
          },
        });
      } catch {
        setYtReady(false);
      }
    };

    void init();

    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
      try {
        playerRef.current?.destroy();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
    };
  }, [startPolling, syncNowPlaying]);

  useEffect(() => {
    const onFs = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  useEffect(() => {
    const check = () => {
      const portrait = window.matchMedia("(orientation: portrait)").matches;
      const narrow = window.innerWidth < 768;
      setShowLandscapeHint(portrait && narrow);
    };
    check();
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  const beginRide = useCallback(async () => {
    // Already unlocked — do not force play (that would break pause)
    if (rideLiveRef.current) return true;

    wantPlayRef.current = true;
    const exhaustOk = (await exhaustRef.current?.start()) ?? false;
    const player = playerRef.current;

    // YT player object can exist before methods are ready — guard every call
    try {
      if (typeof player?.unMute === "function") player.unMute();
      if (typeof player?.setVolume === "function") {
        player.setVolume(volumeRef.current);
      }
      if (typeof player?.playVideo === "function") player.playVideo();
    } catch {
      /* ignore */
    }

    const ytPlaying =
      typeof player?.getPlayerState === "function" &&
      player.getPlayerState() === YTPlayerState.PLAYING;

    if (exhaustOk || ytPlaying) {
      rideLiveRef.current = true;
      setRideLive(true);
      setNeedsGesture(false);
      return true;
    }
    return false;
  }, []);

  // Auto-start music + exhaust when the site opens
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const tryStart = async () => {
      if (cancelled || rideLiveRef.current) return;
      attempts += 1;
      const ok = await beginRide();
      if (ok || rideLiveRef.current) return;
      // Retry a few times while YT / audio finish loading
      if (attempts < 6) {
        window.setTimeout(() => {
          void tryStart();
        }, 400 * attempts);
      } else {
        setNeedsGesture(true);
      }
    };

    // Small delay so ExhaustAudio refs + YT script can mount
    const t = window.setTimeout(() => {
      void tryStart();
    }, 200);

    // If autoplay was blocked, unlock on first real user gesture anywhere
    const unlock = () => {
      if (!rideLiveRef.current) void beginRide();
    };
    document.addEventListener("pointerdown", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });
    document.addEventListener("touchstart", unlock, { once: true });

    return () => {
      cancelled = true;
      window.clearTimeout(t);
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
      document.removeEventListener("touchstart", unlock);
    };
  }, [beginRide]);

  const onBurst = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 380);
  }, []);

  const togglePlay = () => {
    const p = playerRef.current;
    if (typeof p?.getPlayerState !== "function") {
      void beginRide();
      return;
    }

    const state = p.getPlayerState();
    const playing =
      state === YTPlayerState.PLAYING || state === YTPlayerState.BUFFERING;

    if (playing) {
      wantPlayRef.current = false;
      if (typeof p.pauseVideo === "function") p.pauseVideo();
      setIsPlaying(false);
      return;
    }

    // Resume playback
    wantPlayRef.current = true;
    void exhaustRef.current?.start();
    if (typeof p.unMute === "function") p.unMute();
    if (typeof p.setVolume === "function") p.setVolume(volumeRef.current);
    if (typeof p.playVideo === "function") p.playVideo();
    rideLiveRef.current = true;
    setRideLive(true);
    setNeedsGesture(false);
  };

  const handleVolume = (v: number) => {
    volumeRef.current = v;
    setVolume(v);
    writeStoredVolume(v);
    const p = playerRef.current;
    if (typeof p?.setVolume !== "function") return;
    p.setVolume(v);
    if (v > 0 && muted) {
      if (typeof p.unMute === "function") p.unMute();
      setMuted(false);
      exhaustRef.current?.setMuted(false);
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    const p = playerRef.current;
    if (!p) return;
    if (next) {
      if (typeof p.mute === "function") p.mute();
    } else {
      if (typeof p.unMute === "function") p.unMute();
      if (typeof p.setVolume === "function") p.setVolume(volumeRef.current);
    }
    exhaustRef.current?.setMuted(next);
  };

  const toggleFullscreen = async () => {
    const el = rootRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) await el.requestFullscreen();
      else await document.exitFullscreen();
    } catch {
      /* unsupported */
    }
  };

  return (
    <motion.div
      ref={rootRef}
      className="relative h-[100dvh] w-screen overflow-hidden bg-near-black text-warm-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.1 }}
      onClick={() => {
        if (!rideLiveRef.current) void beginRide();
      }}
    >
      <Background src={route.image} riding={rideLive} shake={shake} />

      <div className="film-grain pointer-events-none absolute inset-0 z-[5]" />

      <motion.div
        className="absolute right-3 top-3 z-20 sm:right-5 sm:top-5"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <div className="glass rounded-full px-3 py-1.5 font-oswald text-[10px] uppercase tracking-[0.28em] text-warm-white/80 sm:text-xs">
          {route.label}
        </div>
      </motion.div>

      <TitleOverlay
        route={route.label}
        visible={!rideLive || !isPlaying}
        riding={rideLive}
      />

      {/* Fallback only when the browser blocks autoplay with sound */}
      <AnimatePresence>
        {needsGesture && !rideLive && (
          <motion.div
            className="absolute inset-0 z-30 flex items-end justify-center pb-36 sm:pb-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                void beginRide();
              }}
              className="glass rounded-full px-8 py-3 font-oswald text-sm uppercase tracking-[0.35em] text-warm-white shadow-[0_0_30px_rgba(139,30,30,0.35)]"
              animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.03, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              Tap to unlock sound
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showLandscapeHint && rideLive && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass absolute left-1/2 top-16 z-40 -translate-x-1/2 rounded-full px-4 py-2 font-oswald text-[10px] uppercase tracking-[0.2em] text-warm-white/75"
          >
            Rotate for best ride
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="absolute inset-x-0 bottom-0 z-20 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-16 sm:px-5"
        style={{
          background:
            "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 55%, transparent 100%)",
        }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
          <ControlBar
            muted={muted}
            isFullscreen={isFullscreen}
            routeId={routeId}
            onHorn={() => {
              void beginRide();
              exhaustRef.current?.playHorn();
            }}
            onThrottle={() => {
              void beginRide();
              exhaustRef.current?.throttleBurst();
            }}
            onFullscreen={() => void toggleFullscreen()}
            onMuteToggle={toggleMute}
            onRouteChange={setRouteId}
          />
          <MusicPlayer
            nowPlaying={nowPlaying}
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            muted={muted}
            ready={ytReady}
            onTogglePlay={togglePlay}
            onPrev={() => {
              void beginRide();
              if (typeof playerRef.current?.previousVideo === "function") {
                playerRef.current.previousVideo();
              }
            }}
            onNext={() => {
              void beginRide();
              if (typeof playerRef.current?.nextVideo === "function") {
                playerRef.current.nextVideo();
              }
            }}
            onSeek={(ratio) => {
              const p = playerRef.current;
              if (typeof p?.getDuration !== "function" || typeof p.seekTo !== "function") {
                return;
              }
              const d = p.getDuration() || 0;
              p.seekTo(d * ratio, true);
            }}
            onVolume={handleVolume}
            onToggleMute={toggleMute}
          />
        </div>
      </motion.div>

      <ExhaustAudio ref={exhaustRef} onBurst={onBurst} />

      <div className="pointer-events-none absolute -left-[9999px] top-0 h-px w-px overflow-hidden opacity-0">
        <div id="yt-host" />
      </div>
    </motion.div>
  );
}
