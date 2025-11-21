## Campus Plate Watch API

This folder contains a lightweight Express + TypeScript backend that powers the dashboard widgets found in the front-end (`/src/pages/Index.tsx`). It exposes REST + SSE endpoints for detections, dashboard summaries, and camera heartbeat updates, while persisting state inside `data/store.json`.

### Prerequisites

- Node.js 18+ (works on 20+ as well)
- npm

### Install & Run

```bash
cd campus-plate-watch-main/server
npm install
npm run dev   # starts on http://localhost:4000 with auto-reload
```

Other scripts:

- `npm run build` – compile TypeScript to `dist/`
- `npm start` – run the compiled JS build

### API Surface

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/health` | Basic service heartbeat |
| `GET` | `/api/summary` | Aggregated entry/exit/unique plate counts + camera status |
| `GET` | `/api/detections` | Paginated detections (`page`, `limit`, `search`, `source`, `direction`) |
| `POST` | `/api/detections` | Add a detection `{ plate, confidence, source, direction?, capturedAt?, imageUrl? }` |
| `GET` | `/api/detections/:id` | Fetch a single detection |
| `GET` | `/api/detections/stream/sse` | Server-Sent Events feed for new detections |
| `GET` | `/api/camera` | Current camera heartbeat info |
| `POST` | `/api/camera/heartbeat` | Update camera status `{ status, mode, fps, resolution }` |

### Data Storage

The API writes to `data/store.json`. On first boot it auto-seeds sample detections so the UI has data. Feel free to delete the file to reset the state.

### Connecting the Frontend

Point the Vite app to the API (e.g. `VITE_API_URL=http://localhost:4000`). You can then fetch:

- `/api/summary` to fill the stat tiles
- `/api/detections` for the table
- `/api/detections/stream/sse` to push the "Latest Detection" card in real-time
- `/api/camera` for webcam mode and status badges

The routes default to open CORS (`*`). Adjust `CORS_ORIGIN` in `.env` if you want tighter control.

