# Campus Plate Watch

Full-stack dashboard for monitoring campus vehicle entries/exits. The React front-end is powered by Vite + shadcn-ui, and the backend is an Express API that stores detections/camera heartbeat metadata in a lightweight JSON store.

## Project Structure

```
campus-plate-watch-main/
├── src/                 # Vite + React front-end
├── server/              # Express + TypeScript backend
└── dist/                # Front-end production build output
```

## Getting Started

### 1. Backend API

```bash
cd campus-plate-watch-main/server
npm install
npm run dev        # http://localhost:4000
```

Useful scripts:

- `npm run build` – emit compiled JS into `dist/`
- `npm start` – run the compiled build

### 2. Front-end

```bash
cd campus-plate-watch-main
npm install
cp env.example .env    # or create manually, see below
npm run dev            # http://localhost:5173
```

Create an `.env` file with:

```
VITE_API_URL=http://localhost:4000
```

Point it to wherever the backend runs in your environment (production deployment URL, tunnel, etc.).

## API Overview

The front-end calls the backend through the `src/lib/api.ts` helper:

- `GET /api/summary` – counts for entry/exit/unique plates + camera heartbeat
- `GET /api/detections` – paginated detections (supports `page`, `limit`, `search`, `source`, `direction`)
- `POST /api/detections` – add a detection record
- `GET /api/detections/:id` – fetch a single detection
- `GET /api/detections/stream/sse` – live Server-Sent Events stream used by the “Latest Detection” panel
- `GET /api/camera` / `POST /api/camera/heartbeat` – camera status block in the UI

All dummy UI data has been removed; cards, tables, and side panels hydrate directly from these endpoints. When a new detection arrives via SSE the stat cards refresh automatically.

## Deployment Notes

1. Deploy the Express API (e.g., Render, Railway, Fly.io, Docker, or any Node host).
2. Build the front-end (`npm run build`) and host the contents of `dist/` behind a static host (Netlify, Vercel, S3+CloudFront, etc.).
3. Set `VITE_API_URL` in the front-end environment to the deployed API URL before building.

## Tech Stack

- Front-end: Vite, React 18, TypeScript, Tailwind CSS, shadcn-ui
- Backend: Express, TypeScript, lightweight JSON persistence
- Tooling: ESLint, tsx, npm scripts
