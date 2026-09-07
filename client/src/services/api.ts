import type { BookingRequest } from "@glamurosas/shared";

const GENERIC_ERROR =
  "No se pudo enviar la reserva. Inténtalo de nuevo más tarde.";

export async function createBooking(
  input: BookingRequest,
): Promise<{ id: number }> {
  let response: Response;
  try {
    response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error(GENERIC_ERROR);
  }

  if (!response.ok) {
    let message = GENERIC_ERROR;
    try {
      const body = (await response.json()) as { error?: string };
      if (typeof body.error === "string" && body.error.length > 0) {
        message = body.error;
      }
    } catch {
      // Respuesta sin cuerpo JSON: se queda el mensaje genérico.
    }
    throw new Error(message);
  }

  return (await response.json()) as { id: number };
}
