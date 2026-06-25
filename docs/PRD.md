# MovieAI · Cinema Intelligence

## Problem Statement
Premium AI-powered movie rating prediction platform. Forecasts a film's audience rating before release and fuses test-screening sentiment into the final verdict. Built as a portfolio-grade SaaS experience.

## User Personas
- **Aryan Mehta (creator)** — portfolio / showcase
- **Recruiters / interns** — quick demo, can export branded PDF, share /share/:id link
- **Curious movie buffs / studio teams** — fill metadata + review, get a confident verdict, run head-to-head face-offs

## Tech Stack
- **Frontend**: React 19 (CRA + craco), Tailwind, Framer Motion 11, GSAP, Recharts 3, lucide-react, axios, react-helmet-async, jspdf + html2canvas
- **Backend**: FastAPI 1.2.0, scikit-learn 1.9, TextBlob, pandas, numpy, motor (MongoDB), joblib
- **Data**: curated cinema archive at `/app/backend/data/IMDb_Movies_India.csv` (5,324 clean rows)

## Premium Theme
- Background `#0B0C12` (warm not-pitch black) with radial pearl glows
- Ivory text `#F5F1EA` for body, gradient text for headings
- Pastel neon accents: `#4FE6FF` (electric ice) / `#B98CFF` (orchid) / `#FF74B8` (rose) / `#E7C57B` (gold)
- Pearl glass surfaces (rgba(245,241,234,0.04) + 28px blur)
- Outfit + Figtree + JetBrains Mono fonts

## REST API (v1.2.0)
- `GET  /api/health`
- `POST /api/predict`              — pre-release forecast
- `POST /api/compare`              — head-to-head face-off (NEW)
- `POST /api/sentiment`            — audience sentiment
- `POST /api/final-rating`         — combined verdict
- `GET  /api/analytics`            — live cinema insights
- `GET  /api/suggestions`          — autocomplete
- `GET  /api/model-info`           — engine telemetry
- `POST /api/predictions/share`    — save (strict Pydantic schema, returns id + ttl_days)
- `GET  /api/predictions/{id}`     — retrieve (expires_at hidden)
- `GET  /api/predictions`          — recent list

## What's Implemented
- **Iter 1** — backend ML service + 7 endpoints, full React frontend (7 pages) — 17/17 + 9/9 tests
- **Iter 2** — joblib cache (cold start <1s), MongoDB share links + PDF export — 25/25 + 12/12 tests
- **Iter 3** — POST /api/compare + /compare page (side-by-side gauges, winner reveal), TTL index on `predictions.expires_at` (30 day auto-expiry) + unique constraint on `id`, strict Pydantic schemas on share payload, ivory+pastel premium theme, SEO via `react-helmet-async` with proper H1/H2 hierarchy, all technical jargon stripped from user-facing copy — **37/37 backend** + frontend flows pass

## Backlog
- P2: Rate-limit / IP throttle on `POST /api/predictions/share`
- P3: Bound `ShareResult.features_used` / `feature_importances` dict sizes
- P3: Open Graph image generation for `/share/:id` (1200×630 PNG of gauge + verdict)
- P3: Auth + personal forecast history
