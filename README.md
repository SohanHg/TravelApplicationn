# Designesthetics Travel App

A beautifully designed, front-end-only travel exploration application built with React. Discover curated destinations worldwide, view real-time weather, interact with dynamic OpenStreetMap maps and nearby tourist attractions, save your favorite spots, chat with an AI travel assistant, and generate personalized day-by-day trip itineraries.

## Features

1. **Destination Explorer** — Browse 12 handpicked destinations (4 Indian + 8 global) with search and region-based filtering
2. **Live Destination Images** — All images fetched dynamically from the Pexels API at render time — zero hardcoded image URLs
3. **Destination Detail Pages** — Rich detail pages with hero images, descriptions, best time to visit, and famous places carousel
4. **Famous Places Carousel** — Horizontally scrollable card carousel with live images for each notable landmark
5. **Real-Time Weather** — Current weather data for every destination using OpenWeather API with an automatic Open-Meteo fallback
6. **Location Awareness** — Geolocation support with manual city search fallback (Nominatim), showing local weather
7. **AI Travel Chat** — Conversational multi-turn chatbot powered by Google Gemini (`gemini-3.6-flash` / `gemini-flash-latest`), contextually grounded in the destination you're viewing
8. **AI Itinerary Planning** — Structured day-by-day trip planner with interest-based customization, rendered as a visual timeline
9. **Interactive Map & Nearby Attractions (Phase 14)** — Leaflet + OpenStreetMap card with click-to-expand modal and live Overpass API integration querying nearby museums, viewpoints, historic sites, and attractions within 10km
10. **Favorites / Saved Destinations (Phase 15)** — Instant bookmarking with Local Storage sync, animated heart buttons on cards and detail heroes, and a dedicated "Favorites" filter toggle with styled empty state

## Architecture

> **Client-side only — no backend.** This is a deliberate architectural choice given the deployment constraints (GitHub Pages / Vercel static hosting). API keys are stored in `.env` (gitignored) and injected at build time via Vite's `import.meta.env`. This is stated plainly as a considered decision, not an oversight.

## APIs Used

| API | Purpose | Notes |
|-----|---------|-------|
| [Pexels](https://www.pexels.com/api/) | Destination & landmark photos + hero video | Free tier, dynamic runtime queries |
| [OpenWeather](https://openweathermap.org/api) | Current weather data | Free tier |
| [Open-Meteo](https://open-meteo.com/) | Weather fallback | Free, keyless — used automatically if OpenWeather key is missing or returns 401 |
| [Google Gemini](https://ai.google.dev/) | AI chat + itinerary generation | Free tier (`gemini-3.6-flash`, `gemini-flash-latest`) |
| [Nominatim (OSM)](https://nominatim.openstreetmap.org/) | Location text-to-coordinates | Free, keyless geocoding |
| [Overpass API (OSM)](https://wiki.openstreetmap.org/wiki/Overpass_API) | Nearby tourist attractions & POIs | Free, keyless queries with mirror failover |

## Tech Stack

- **React 19** + **Vite 6** (JavaScript)
- **React Router** v7 — client-side routing
- **Leaflet & React-Leaflet** — interactive mapping with custom pins & popups
- **Framer Motion** — scroll reveals, hover effects, modal transitions, heart pulses
- **CSS Custom Properties** — design tokens for colors, typography, spacing
- **Google Fonts** — Fraunces (serif display) + Inter (sans body)

## Local Development

```bash
# Install dependencies
npm install

# Configure environment variables in .env
VITE_OPENWEATHER_KEY=your_key
VITE_PEXELS_KEY=your_key
VITE_GEMINI_KEY=your_key

# Start the dev server
npm run dev
```
