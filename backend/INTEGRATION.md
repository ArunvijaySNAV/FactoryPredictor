# InsForge Backend Integration Notes

## Current architecture

The backend is split into:

- `routes/`: transport layer
- `services/`: business logic for prediction, reports, chat, telemetry, and boss/operator summaries
- `data/store.ts`: in-memory repository used as a demo fallback

## Replacing the fallback store with InsForge

Map each service to InsForge MCP operations:

- `telemetryService.ts`: replace direct `store.telemetry` reads with `telemetry` and `predictions` queries
- `bossService.ts`: aggregate `machines`, `telemetry`, and `predictions`
- `chatService.ts`: persist and stream `messages`
- `reportService.ts`: persist final `summary_json` to `reports`
- `csvIngestionService.ts`: upsert `machines`, batch insert `telemetry`, then invoke prediction generation

## Recommended flow

1. Upload CSV through `POST /api/telemetry/upload`
2. Parse and normalize to telemetry rows
3. Persist telemetry rows into InsForge
4. Run prediction service over newly inserted rows
5. Save outputs to `predictions` and `alerts`
6. Generate daily report on schedule or on-demand

## Production notes

- Add authentication and session management around role access
- Move report generation to a scheduler or queue
- Replace the in-memory websocket fanout with a pub/sub channel
- Store uploaded files in object storage if auditability is required
