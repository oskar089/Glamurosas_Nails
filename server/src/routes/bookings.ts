import { bookingRequestSchema } from "@glamurosas/shared";
import type { FastifyInstance } from "fastify";

const GENERIC_ERROR =
  "No se pudo procesar la reserva. Inténtalo de nuevo más tarde.";

export async function bookingRoutes(app: FastifyInstance) {
  app.post("/api/bookings", async (request, reply) => {
    const result = bookingRequestSchema.safeParse(request.body);
    if (!result.success) {
      const firstMessage = result.error.issues[0]?.message ?? GENERIC_ERROR;
      return reply.code(400).send({ error: firstMessage });
    }

    const { name, email, service, date, time } = result.data;
    const created_at = new Date().toISOString();

    const statement = app.db.prepare(
      `INSERT INTO bookings (service, name, email, phone, date, time, notes, created_at)
       VALUES (?, ?, ?, '', ?, ?, NULL, ?)`,
    );
    const info = statement.run(service, name, email, date, time, created_at);

    return reply.code(201).send({ id: Number(info.lastInsertRowid) });
  });
}
