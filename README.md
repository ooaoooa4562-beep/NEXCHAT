# NEXCHAT

NEXCHAT is a cross-platform messaging platform. One pnpm monorepo contains the API and clients for web, Android, iOS, Windows and macOS.

## Applications

| Client | Location | Technology |
| --- | --- | --- |
| Web | `apps/web` | React, TypeScript, Vite |
| Android + iOS | `apps/mobile` | React Native, Expo, SecureStore |
| Windows + macOS | `apps/desktop` | Tauri 2, Rust, shared web UI |
| API | `apps/api` | Fastify, Prisma, PostgreSQL, Socket.IO |
| Shared contracts | `packages/shared` | TypeScript |

## Account system implemented

- Registration with unique username, display name and email.
- Login with username or email.
- Argon2id password hashing.
- Short-lived signed access tokens.
- Rotating opaque refresh tokens, stored as hashes in PostgreSQL.
- Session restoration and logout.
- Rate limits on registration and login.
- Web stores tokens for the current browser tab; mobile stores tokens using Expo SecureStore.

Email verification, password reset, account recovery and full production security review are still pending.

## Development

Requirements: Node.js 20+, pnpm 10+, PostgreSQL. For native builds, Android Studio is needed for Android, Xcode on macOS for iOS, and Rust plus platform build tools for Tauri desktop.

```bash
pnpm install
```

Configure `.env` using `.env.example`, then initialize the database:

```bash
pnpm --filter @nexchat/api db:generate
pnpm --filter @nexchat/api exec prisma db push
```

Run web and API:

```bash
pnpm dev
```

Run mobile:

```bash
pnpm --filter @nexchat/mobile start
```

Run desktop:

```bash
pnpm --filter @nexchat/desktop dev
```

Set `VITE_API_URL` in `apps/web/.env` and `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` to the deployed API URL for device testing. Never commit secrets.

## Current implementation status

The account API and sign-in/register flows are wired into web and mobile clients. The chat list and message view are still preview data; persistent conversations, friends, media, push notifications, calls and production deployment are future stages. Desktop packaging is scaffolded and awaits platform build verification.
