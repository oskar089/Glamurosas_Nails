import type { BookingRequestFormValues } from "../models/types";
import { getSupabaseConfig, supabaseHeaders } from "./reviews";

const BOOKING_REQUESTS_ENDPOINT = "/rest/v1/booking_requests";

export const GOOGLE_CALENDAR_APPOINTMENTS_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ04lNU9EX8RIuRrbaUyWd8jnH7IAIxq9MIWSebI5lJO05QQSgrpNw6kKg2Yy6okKwVWxi59UHyl";

export async function submitBookingRequest(
  input: BookingRequestFormValues,
): Promise<void> {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error(
      "El formulario de solicitud no está disponible. Podés continuar en Google Calendar.",
    );
  }

  let response: Response;
  try {
    response = await fetch(`${config.url}${BOOKING_REQUESTS_ENDPOINT}`, {
      method: "POST",
      headers: { ...supabaseHeaders(config), Prefer: "return=minimal" },
      body: JSON.stringify({
        name: input.name.trim(),
        email: input.email.trim(),
        phone: input.phone.trim(),
        service: input.service,
        notes: input.notes.trim(),
        status: "pending",
      }),
    });
  } catch {
    throw new Error(
      "No se pudo enviar tu solicitud. Podés continuar en Google Calendar.",
    );
  }

  if (!response.ok) {
    throw new Error(
      "No se pudo enviar tu solicitud. Podés continuar en Google Calendar.",
    );
  }
}
