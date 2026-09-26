# BULLET — Immersive Royal Enfield Ride Experience

Full-viewport, no-scroll ride experience inspired by immersive bus/ride sites.
Sit on a Bullet, feel the thump, and roll with a YouTube road-trip playlist.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Framer Motion
- YouTube IFrame API (hidden player + custom UI)
- HTML5 Audio (exhaust + horn)

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Tap anywhere to start music + exhaust.

## Configure playlist

Set your YouTube playlist ID:

```bash
# .env.local
NEXT_PUBLIC_YOUTUBE_PLAYLIST_ID=PLxxxxxxxxxxxxxxxx
```

Or edit the default in `lib/youtube.ts`.

## Assets

Replace placeholders in `/public` — see `public/ASSETS.md`:

- `background.jpg` (+ garage variants)
- `exhaust.mp3` — looping Bullet thump
- `horn.mp3` — short horn

## Deploy

```bash
npm run build
# Deploy the project to Vercel
```

## Controls

| Control   | Action                                      |
|-----------|---------------------------------------------|
| Horn      | Plays horn.mp3                              |
| Throttle  | Boosts exhaust volume + light screen shake  |
| Garage    | Switch Bullet backdrop variants             |
| Full      | Fullscreen API                              |
| Sleep     | Auto-stop after 15 / 30 / 60 min            |
| Mute      | Mutes YouTube + exhaust                     |
