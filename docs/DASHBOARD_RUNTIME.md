# Dashboard Runtime

The dashboard uses three independent data paths: canonical REST polling, `WS /api/v1/ws/solana` for read-only overview/program snapshots, and explicit wallet portfolio reads after connection.

The WebSocket never authorizes transactions. Polling and realtime freshness are independent.

Responsive breakpoints are centralized in `apps/web/hooks/use-mobile.ts`: mobile 640 px, tablet 980 px, desktop content target 1180 px.
