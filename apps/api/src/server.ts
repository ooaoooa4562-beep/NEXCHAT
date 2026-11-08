import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import { Server as SocketIOServer } from "socket.io";
import jwt from "@fastify/jwt";
import authRoutes from "./routes/auth.js";
import { prisma } from "./db.js";
import { z } from "zod";

const env = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default("0.0.0.0"),
  WEB_ORIGIN: z.string().default("http://localhost:5173"),
  JWT_ACCESS_SECRET: z.string().min(32)
}).parse(process.env);

const app = Fastify({ logger: true, trustProxy: true });

await app.register(helmet);
await app.register(jwt, { secret: env.JWT_ACCESS_SECRET });
await app.register(cors, {
  origin: env.WEB_ORIGIN.split(",").map((value) => value.trim()),
  credentials: true
});
await app.register(rateLimit, { max: 120, timeWindow: "1 minute" });

await app.register(authRoutes);

app.get("/", async () => ({
  name: "NEXCHAT API",
  version: "0.1.0",
  status: "online",
  docs: "/health"
}));

app.get("/health", async () => ({
  ok: true,
  service: "nexchat-api",
  timestamp: new Date().toISOString(),
  environment: env.NODE_ENV
}));

const io = new SocketIOServer(app.server, {
  cors: {
    origin: env.WEB_ORIGIN.split(",").map((value) => value.trim()),
    credentials: true
  },
  transports: ["websocket", "polling"]
});

// Authentication middleware will be added before enabling private conversation rooms.
// Never trust a client-supplied userId or conversationId as authorization.
io.on("connection", (socket) => {
  app.log.info({ socketId: socket.id }, "Realtime client connected");
  socket.emit("system:ready", { service: "nexchat-realtime", version: "0.1.0" });
  socket.on("disconnect", (reason) => {
    app.log.info({ socketId: socket.id, reason }, "Realtime client disconnected");
  });
});

const shutdown = async () => {
  await app.close();
  io.close();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

try {
  await app.listen({ port: env.PORT, host: env.HOST });
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
