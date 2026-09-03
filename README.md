# TravelPlanner

## Description
TravelPlanner is an interactive, responsive web application designed for modern travelers seeking curated global and Indian destinations. It combines dynamic media imagery, real-time meteorological data, AI-assisted conversational itinerary planning, and multi-modal transit intelligence in a single, high-performance interface.

## Features

### Core Requirements
- **Hero Section**: Full-viewport responsive hero displaying high-definition dynamic travel video streamed via the Pexels Video API, overlaid with elegant serif typography and an animated scroll-cue indicator.
- **Destination Explorer**: Interactive grid of 12 curated global and domestic destinations featuring real-time search filtering, geographic region filter pills (India, Asia, Europe, Americas, Africa), and staggered entrance animations.
- **Famous Places Carousel**: Horizontal swipe-and-scroll carousel on destination detail views showcasing local landmarks with dynamically fetched imagery and descriptive architectural blurbs.
- **Location Awareness**: Floating weather and location finder modal equipped with one-click browser GPS detection and reverse-geocoding via OpenStreetMap Nominatim.
- **Real-Time Weather Widget**: Real-time atmospheric conditions (temperature in °C, weather condition icons, humidity percentage, wind speed) with seamless automatic fallback to Open-Meteo if OpenWeather is unavailable.
- **Live Images**: Zero static or hardcoded local image assets — all destination cards, hero visuals, and landmark photos are queried on demand from the Pexels API with LRU caching.
- **AI Travel Assistant**: Floating conversational AI chat interface powered by Google Gemini (gemini-flash), grounded in real destination context (best season to visit, famous landmarks, cultural history).
- **AI Itinerary Planning**: Dedicated multi-day trip planner generating structured, day-by-day customized travel itineraries based on user travel duration and personal interests (Culture, Adventure, Food, Relaxation, Nightlife).

### Additional Features (Stretch Additions)
- **Interactive OpenStreetMap with Nearby Attractions (Phase 14)**: Leaflet-powered destination map with custom pins, modal expansion mode, and live Overpass API integration querying nearby tourist attractions, viewpoints, museums, and historic POIs within a 15 km radius.
- **Favorites System (Phase 15)**: Persistent client-side destination bookmarking backed by `localStorage`, complete with animated heart toggle buttons and a dedicated "❤️ Favorites" grid filter.
- **Travel Mode: Public Transit & Private Route (Phase 16)**:
  - **Flight Routes**: Origin-to-destination flight schedule engine with customizable departure cities (defaulting to Delhi), duration tracking, and integration with OpenSky Network live radar for airborne aircraft telemetry.
  - **Train Stations**: Station-specific rail timetables (e.g. Vande Bharat, Shatabdi, Superfast, Shinkansen, Amtrak) with custom source station routing, platform allocations, and strict differentiation between Today's live running status and Future confirmed schedules (no artificial future delays).
  - **Maritime / Ship AIS**: Live marine AIS telemetry stream with customizable origin port routing, tracking vessel coordinates, speed over ground, and navigational heading around destination harbours.
  - **Private Route (OSRM Driving)**: Turn-by-turn road route computation via the Open Source Routing Machine (OSRM) displaying road distance in kilometers, estimated driving time, and a polyline drawn directly onto the Leaflet map.

## Tech Stack
- **React (v19.1.0)**: Modern component architecture, functional hooks, and state management.
- **Vite (v6.0.0)**: Frontend tooling, rapid HMR development, and optimized production bundling.
- **React Router (v7.18.3)**: Declarative client-side routing with route-change scroll restoration.
- **Framer Motion (v13.2.0)**: Fluid page transitions, modal spring animations, and staggered card entrances.
- **Leaflet (v1.9.4) & React Leaflet (v5.0.0)**: Interactive mapping, geographic markers, popups, and route polylines.
- **Lucide React (v1.39.0)**: SVG icons for transit modes and UI navigation affordances.

## APIs Used
- **Pexels API** (Free tier): On-demand high-resolution destination photography and hero background video streaming.
- **OpenWeather API** (Free tier): Real-time live temperature, weather conditions, humidity, and wind speed.
- **Open-Meteo API** (Free tier, no key required): Automatic resilient weather fallback when OpenWeather is delayed or rate-limited.
- **Google Gemini API** (`gemini-flash`, Free tier): Conversational travel assistant and structured JSON day-by-day itinerary generation.
- **OpenStreetMap Nominatim API** (Free tier, public): Forward and reverse geocoding for manual city search and GPS coordinate resolution.
- **Overpass API** (Free tier, public): Querying geographic OpenStreetMap points-of-interest (attractions, viewpoints, museums).
- **OpenSky Network API** (Free tier, public): Real-time airborne flight telemetry in destination airspace.
- **Aviationstack API** (Free tier): Commercial flight search proxy via serverless function.
- **RailRadar API** (Free tier): Railway station live status lookup via serverless function.
- **aisstream.io** (Free tier): Client-side WebSocket stream for live marine vessel AIS positions.
- **OSRM (Open Source Routing Machine)** (Free tier, public): Driving directions, road polyline geometry, and travel time calculation.

## Architecture Notes
The application is built primarily as a client-side single-page application (SPA) with no dedicated backend database server required. To support third-party APIs that enforce CORS restrictions, require secret keys, or run HTTP-only free tiers (such as Aviationstack and RailRadar), lightweight serverless proxy functions are organized inside the `/api` directory for deployment on Vercel. Long-lived streaming connections (such as aisstream.io WebSockets) and public endpoints (Overpass, OpenSky, OSRM, Nominatim) run client-side to maintain performance without proxy latency.

## Screenshots
[Add screenshots here after final deployment]

## Live Demo
[Add live deployed link here]

## Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SohanHg/TravelApplicationn.git
   cd TravelApplicationn
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and supply your API keys:
   ```bash
   cp .env.example .env
   ```
   *Note: Client-side keys must be prefixed with `VITE_` (`VITE_OPENWEATHER_KEY`, `VITE_PEXELS_KEY`, `VITE_GEMINI_KEY`, `VITE_AISSTREAM_KEY`). Server-side proxy keys (`AVIATIONSTACK_KEY`, `RAILRADAR_KEY`) are read by `/api` serverless handlers.*

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:5173/`.
