# NEXCHAT architecture

## Principles

- API is the source of truth for identity, authorization, conversations, and message persistence.
- WebSocket events are authenticated and authorized server-side before any room join or message broadcast.
- PostgreSQL stores durable application data. Redis is used for ephemeral presence, rate-limit coordination, and future horizontal Socket.IO scaling.
- Uploaded media is stored in private object storage and delivered through short-lived signed URLs.
- Web, desktop, and mobile clients share API contracts and design tokens; clients never connect directly to the database.

## Monorepo

- `apps/api`: Fastify HTTP API and Socket.IO gateway.
- `apps/web`: React web client.
- `apps/desktop`: planned Electron shell.
- `apps/mobile`: planned React Native app.
- `packages/shared`: planned shared schemas and types.

## Delivery milestones

1. Foundation: workspace, API health endpoint, initial web shell, Prisma data model.
2. Identity: registration, login, email verification, refresh-token rotation, sessions.
3. Messaging: conversations, persisted messages, pagination, delivery/read receipts, authenticated realtime events.
4. Social: user discovery, friend requests, groups, roles, moderation.
5. Media and calls: private uploads, voice messages, WebRTC signaling, TURN infrastructure.
6. Clients: desktop and mobile releases.

## Security gates

Do not expose private rooms or message events until Socket.IO authentication and per-conversation membership checks are implemented. Store password hashes with Argon2id. Keep access tokens short-lived, rotate refresh tokens, validate all input, rate-limit sensitive endpoints, and keep secrets out of Git.
