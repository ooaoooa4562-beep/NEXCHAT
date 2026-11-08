# NEXCHAT

NEXCHAT is a cross-platform messaging platform. The repository is a pnpm monorepo: one API and shared contracts power the web, mobile and desktop clients.

## Apps

| Client | Location | Technology |
| --- | --- | --- |
| Web | `apps/web` | React, TypeScript, Vite |
| Android | `apps/mobile` | React Native, Expo |
| iOS | `apps/mobile` | React Native, Expo |
| Windows | `apps/desktop` | Tauri 2, Rust, WebView |
| macOS | `apps/desktop` | Tauri 2, Rust, WebView |
| API | `apps/api` | Node.js, Fastify, Socket.IO |

Shared cross-platform contracts live in `packages/shared`. All clients are intended to use the same accounts, contacts, conversations and message API.

## Requirements

- Node.js 20+
- pnpm 10+
- Rust stable + platform build tools for desktop packaging
- Android Studio for local Android emulator/device builds
- Xcode on macOS for local iOS simulator/device builds

## Install

```bash
pnpm install
```

## Run clients

```bash
# Web + API
pnpm dev

# Mobile (Expo)
pnpm --filter @nexchat/mobile start

# Desktop (starts the web client as its Tauri frontend)
pnpm --filter @nexchat/desktop dev
```

For Android/iOS device builds, configure Expo EAS Build. iOS native builds require macOS/Xcode or EAS cloud build. Windows and macOS desktop installers are produced by Tauri on their respective supported build environments.

## Backend configuration

Copy `.env.example` to `.env` and configure PostgreSQL, Redis and authentication secrets. Never commit real secrets.

## Current implementation status

- Web: initial UI prototype with local-only demo interactions.
- Mobile: initial Expo UI scaffold for Android and iOS.
- Desktop: Tauri 2 scaffold for Windows and macOS, using the web client.
- API: Fastify health endpoint and Socket.IO connection scaffold.
- Database: Prisma schema drafted; database connection and migrations still need to be configured.

Authentication, persistent messaging, media uploads, push notifications, calls and production deployment are not implemented yet.
