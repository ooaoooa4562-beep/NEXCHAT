import { randomBytes, createHash } from "node:crypto";
import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { hash, verify } from "@node-rs/argon2";
import { prisma } from "../db.js";

const registerSchema = z.object({
  username: z.string().trim().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/, "Username may contain only letters, numbers and underscores"),
  displayName: z.string().trim().min(1).max(40),
  email: z.string().trim().email().max(254),
  password: z.string().min(10).max(128)
});

const loginSchema = z.object({
  identifier: z.string().trim().min(1).max(254),
  password: z.string().min(1).max(128)
});

const refreshSchema = z.object({ refreshToken: z.string().min(32).max(256) });
const refreshLifetimeMs = 30 * 24 * 60 * 60 * 1000;

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function publicUser(user: { id: string; username: string; displayName: string; email: string; avatarUrl: string | null; bio: string | null; status: string; createdAt: Date }) {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    email: user.email,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    status: user.status,
    createdAt: user.createdAt.toISOString()
  };
}

async function issueSession(app: Parameters<FastifyPluginAsync>[0], userId: string) {
  const sessionId = randomBytes(24).toString("hex");
  const refreshToken = randomBytes(48).toString("base64url");
  const expiresAt = new Date(Date.now() + refreshLifetimeMs);

  await prisma.userSession.create({
    data: { id: sessionId, userId, refreshTokenHash: digest(refreshToken), expiresAt }
  });

  const accessToken = app.jwt.sign({ sub: userId, sid: sessionId }, { expiresIn: "15m" });
  return { accessToken, refreshToken, expiresAt: expiresAt.toISOString() };
}

const authRoutes: FastifyPluginAsync = async (app) => {
  app.post("/auth/register", async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "INVALID_INPUT", message: parsed.error.issues[0]?.message ?? "Invalid input" });

    const input = parsed.data;
    const username = input.username.toLowerCase();
    const email = input.email.toLowerCase();
    const existing = await prisma.user.findFirst({ where: { OR: [{ username }, { email }] }, select: { username: true, email: true } });
    if (existing) {
      return reply.code(409).send({
        error: "ACCOUNT_EXISTS",
        message: existing.username === username ? "This username is already taken" : "An account with this email already exists"
      });
    }

    const passwordHash = await hash(input.password, {
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
      outputLen: 32
    });

    try {
      const user = await prisma.user.create({
        data: { username, displayName: input.displayName, email, passwordHash },
        select: { id: true, username: true, displayName: true, email: true, avatarUrl: true, bio: true, status: true, createdAt: true }
      });
      const tokens = await issueSession(app, user.id);
      return reply.code(201).send({ user: publicUser(user), ...tokens });
    } catch (error) {
      if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
        return reply.code(409).send({ error: "ACCOUNT_EXISTS", message: "Username or email is already registered" });
      }
      throw error;
    }
  });

  app.post("/auth/login", async (request, reply) => {
    const parsed = loginSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "INVALID_INPUT", message: "Enter your username/email and password" });

    const identifier = parsed.data.identifier.toLowerCase();
    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] }
    });
    if (!user || !(await verify(user.passwordHash, parsed.data.password))) {
      return reply.code(401).send({ error: "INVALID_CREDENTIALS", message: "Incorrect username/email or password" });
    }

    const tokens = await issueSession(app, user.id);
    const { passwordHash: _passwordHash, ...safeUser } = user;
    return reply.send({ user: publicUser(safeUser), ...tokens });
  });

  app.post("/auth/refresh", async (request, reply) => {
    const parsed = refreshSchema.safeParse(request.body);
    if (!parsed.success) return reply.code(400).send({ error: "INVALID_REFRESH_TOKEN", message: "Refresh token is missing or invalid" });

    const oldHash = digest(parsed.data.refreshToken);
    const session = await prisma.userSession.findUnique({ where: { refreshTokenHash: oldHash } });
    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      return reply.code(401).send({ error: "SESSION_EXPIRED", message: "Session expired. Please sign in again." });
    }

    const nextRefresh = randomBytes(48).toString("base64url");
    const nextExpires = new Date(Date.now() + refreshLifetimeMs);
    const nextHash = digest(nextRefresh);
    await prisma.userSession.update({
      where: { id: session.id },
      data: { refreshTokenHash: nextHash, expiresAt: nextExpires, lastUsedAt: new Date() }
    });
    const accessToken = app.jwt.sign({ sub: session.userId, sid: session.id }, { expiresIn: "15m" });
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, username: true, displayName: true, email: true, avatarUrl: true, bio: true, status: true, createdAt: true }
    });
    if (!user) return reply.code(401).send({ error: "USER_NOT_FOUND", message: "Account no longer exists" });
    return reply.send({ user: publicUser(user), accessToken, refreshToken: nextRefresh, expiresAt: nextExpires.toISOString() });
  });

  app.post("/auth/logout", async (request, reply) => {
    const parsed = refreshSchema.safeParse(request.body);
    if (parsed.success) {
      await prisma.userSession.updateMany({
        where: { refreshTokenHash: digest(parsed.data.refreshToken), revokedAt: null },
        data: { revokedAt: new Date() }
      });
    }
    return reply.code(204).send();
  });

  app.get("/auth/me", { preHandler: async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.code(401).send({ error: "UNAUTHORIZED", message: "Please sign in" });
    }
  } }, async (request, reply) => {
    const claims = request.user as { sub?: string; sid?: string };
    if (!claims.sub || !claims.sid) return reply.code(401).send({ error: "UNAUTHORIZED", message: "Invalid access token" });
    const session = await prisma.userSession.findUnique({ where: { id: claims.sid } });
    if (!session || session.userId !== claims.sub || session.revokedAt || session.expiresAt <= new Date()) {
      return reply.code(401).send({ error: "SESSION_EXPIRED", message: "Session expired" });
    }
    const user = await prisma.user.findUnique({
      where: { id: claims.sub },
      select: { id: true, username: true, displayName: true, email: true, avatarUrl: true, bio: true, status: true, createdAt: true }
    });
    if (!user) return reply.code(401).send({ error: "USER_NOT_FOUND", message: "Account no longer exists" });
    return reply.send({ user: publicUser(user) });
  });
};

export default authRoutes;
