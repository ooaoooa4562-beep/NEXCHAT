# NEXCHAT API

Fastify + Socket.IO API service.

## Local development

1. Copy the repository root `.env.example` to `.env` and configure values.
2. Install workspace dependencies with `pnpm install`.
3. Start the API with `pnpm --filter @nexchat/api dev`.
4. Check `GET /health`.

The initial realtime gateway only announces connection readiness. It intentionally does not accept chat messages or room joins until authentication and membership authorization are implemented.
