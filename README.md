# Passday

A passholder-first Orlando theme-park dashboard built with Next.js. The homepage separates Universal Orlando and Walt Disney World, then opens a resort-specific 14-day outlook with weather, crowd recommendations, official events, park news and every posted attraction wait.

## Data sources

- Weather: [NOAA/NWS](https://www.weather.gov/) for days 1–7 and [Open-Meteo](https://open-meteo.com/) for days 8–14 — no API key required
- Posted attraction waits: [Queue-Times.com](https://queue-times.com/) — no API key required
- Events and news: official Universal Orlando, Walt Disney World and Disney Parks Blog sources
- Crowd outlook: Thrill Data anchors for Universal and Queue-Times Magic Kingdom statistics for Disney, combined with events and forecasted weather

The app clearly labels fallback data if an upstream source is unavailable. Crowd outlooks are estimates, not official attendance figures.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Next.js.

## Deploy to Vercel

1. Import this repository into Vercel.
2. Keep the detected framework preset as **Next.js**.
3. Add `NEXT_PUBLIC_SITE_URL` with the final public origin, such as `https://parks.example.com`.
4. Deploy, then add the custom domain in the Vercel project settings.

No private API keys are required for the included data integrations.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Update the resort calendar

The dated resort events and their official source links live in `lib/park-data.ts`. The official news feed and weather/wait integrations refresh automatically.
