/**
 * YouTube IFrame API helpers.
 * Docs: https://developers.google.com/youtube/iframe_api_reference
 */

/** Ride playlist — https://www.youtube.com/playlist?list=PLDaLSRN7lcKU */
export const YOUTUBE_PLAYLIST_ID =
  process.env.NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID ?? "PLDaLSRN7lcKU";

export const YT_API_SRC = "https://www.youtube.com/iframe_api";

/** Runtime-safe player state codes. */
export const YTPlayerState = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5,
} as const;

export type NowPlaying = {
  title: string;
  artist: string;
  videoId: string;
  thumbnail: string;
};

export type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  nextVideo: () => void;
  previousVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  setVolume: (volume: number) => void;
  getVolume: () => number;
  mute: () => void;
  unMute: () => void;
  isMuted: () => boolean;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  getDuration: () => number;
  getVideoData: () => {
    title: string;
    video_id: string;
    author: string;
  };
  destroy: () => void;
};

type YTPlayerEvent = { target: YTPlayer; data?: number };

type YTNamespace = {
  Player: new (
    elementId: string | HTMLElement,
    options: {
      height?: string | number;
      width?: string | number;
      videoId?: string;
      playerVars?: Record<string, string | number | undefined>;
      events?: {
        onReady?: (event: YTPlayerEvent) => void;
        onStateChange?: (event: YTPlayerEvent) => void;
        onError?: (event: YTPlayerEvent) => void;
      };
    },
  ) => YTPlayer;
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/** Load the IFrame API script once and resolve when ready. */
export function loadYouTubeAPI(): Promise<YTNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube API requires a browser"));
  }

  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${YT_API_SRC}"]`,
    );

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      if (window.YT) resolve(window.YT);
      else reject(new Error("YouTube API failed to initialize"));
    };

    if (!existing) {
      const tag = document.createElement("script");
      tag.src = YT_API_SRC;
      tag.async = true;
      tag.onerror = () => reject(new Error("Failed to load YouTube API"));
      document.head.appendChild(tag);
    }
  });
}

/** Parse "Artist - Title" style video titles into now-playing fields. */
export function parseVideoTitle(raw: string): Pick<NowPlaying, "title" | "artist"> {
  const cleaned = raw.replace(/\s*\([^)]*official[^)]*\)/gi, "").trim();
  const parts = cleaned.split(/\s+[-–—]\s+/);
  if (parts.length >= 2) {
    return { artist: parts[0]!.trim(), title: parts.slice(1).join(" - ").trim() };
  }
  return { title: cleaned || "Unknown track", artist: "Road Trip Mix" };
}

export function thumbnailFor(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
}

export function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Persist volume between visits. */
export function readStoredVolume(fallback = 70): number {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem("bullet-volume");
  if (raw == null) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : fallback;
}

export function writeStoredVolume(volume: number): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("bullet-volume", String(Math.round(volume)));
}

export {};
