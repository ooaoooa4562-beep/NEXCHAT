# NEXCHAT API

Fastify API and Socket.IO gateway.

## Required environment

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_ACCESS_SECRET`: random secret of at least 32 characters.
- `WEB_ORIGIN`: comma-separated allowed browser origins, including the deployed web app and local development origin.
- `PORT`: supplied by Railway in production.

Do not commit secrets. Configure production values in Railway's service Variables page.

## Database

After setting `DATABASE_URL`, generate the Prisma client and apply the current schema:

```bash
pnpm --filter @nexchat/api db:generate
pnpm --filter @nexchat/api exec prisma db push
```

The schema is currently managed with Prisma DB Push; production migration files have not yet been established. Back up a production database before schema changes.

## Authentication endpoints

- `POST /auth/register` — create account (username, displayName, email, password).
- `POST /auth/login` — sign in with username/email and password.
- `POST /auth/refresh` — rotate refresh token.
- `POST /auth/logout` — revoke refresh token.
- `GET /auth/me` — return the signed-in user (Bearer access token).

Passwords are hashed with Argon2id. Access tokens expire after 15 minutes. Refresh tokens are random opaque tokens stored only as SHA-256 hashes and expire after 30 days. Registration and login are rate-limited.

Email verification, password reset, account recovery and production abuse monitoring are not implemented yet.
