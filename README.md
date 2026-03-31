# Machine Health Predictor

Production-ready starter for an AI-powered industrial monitoring and predictive maintenance platform with a custom "Precision Industrial Intelligence UI".

## Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, Framer Motion, Recharts
- Backend: Node.js, Express, TypeScript, WebSocket support
- Data: CSV ingestion, in-memory repository with clean service boundaries, InsForge schema ready

## Workspace Layout

- `frontend/`: React app with landing page, login, operator dashboard, boss dashboard, and role chat
- `backend/`: API server, prediction/report services, CSV ingest, chat delivery, and mock fallback data
- `shared/`: Shared platform types used by both frontend and backend

## Key APIs

- `GET /api/overview/operator`
- `GET /api/overview/boss`
- `GET /api/machines/:machineId`
- `GET /api/chat/messages`
- `POST /api/chat/messages`
- `GET /api/reports/daily`
- `GET /api/telemetry/export`
- `POST /api/telemetry/upload`

## Local Startup

1. Install dependencies:
   `npm install`
2. Start the backend:
   `npm run dev:backend`
3. Start the frontend:
   `npm run dev:frontend`

The backend seeds realistic industrial telemetry if no CSV has been uploaded yet. Upload a telemetry file with the expected columns to replace the fallback dataset.

