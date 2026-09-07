import path from "node:path";
import { fileURLToPath } from "node:url";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import { openDatabase } from "./db.js";
import { bookingRoutes } from "./routes/bookings.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = Fastify({ logger: true });
app.decorate("db", openDatabase());

// Registra las rutas /api ANTES del fallback del SPA.
await app.register(bookingRoutes);

const packageRoot = path.resolve(__dirname, "..");
const clientDist = path.resolve(packageRoot, "../client/dist");
await app.register(fastifyStatic, {
  root: clientDist,
  prefix: "/",
  wildcard: false,
});

// Fallback del SPA: cualquier ruta de cliente (/services, /booking, ...)
// devuelve el index.html compilado para que React Router la resuelva.
app.get("/*", async (_request, reply) => {
  return reply.sendFile("index.html");
});

const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? "127.0.0.1";

await app.listen({ host, port });
