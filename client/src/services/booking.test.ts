import { afterEach, describe, expect, it, vi } from "vitest";
import { submitBookingRequest } from "./booking";

const SUPABASE_URL = "https://project.supabase.co";
const PUBLISHABLE_KEY = "publishable-key";

const REQUEST = {
  name: "  Lucía Pérez  ",
  email: " lucia@example.com ",
  phone: " 643 521 975 ",
  service: "gel",
  notes: "  Prefiero un acabado natural y brillante.  ",
} as const;

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("booking request service", () => {
  it("inserts a trimmed pending request", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", SUPABASE_URL);
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", PUBLISHABLE_KEY);
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await submitBookingRequest(REQUEST);

    expect(fetchMock).toHaveBeenCalledWith(
      `${SUPABASE_URL}/rest/v1/booking_requests`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Lucía Pérez",
          email: "lucia@example.com",
          phone: "643 521 975",
          service: "gel",
          notes: "Prefiero un acabado natural y brillante.",
          status: "pending",
        }),
      }),
    );
  });

  it("reports missing configuration and request failures safely", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");

    await expect(submitBookingRequest(REQUEST)).rejects.toThrow(
      "El formulario de solicitud no está disponible. Podés continuar en Google Calendar.",
    );

    vi.stubEnv("VITE_SUPABASE_URL", SUPABASE_URL);
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", PUBLISHABLE_KEY);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(submitBookingRequest(REQUEST)).rejects.toThrow(
      "No se pudo enviar tu solicitud. Podés continuar en Google Calendar.",
    );
  });
});
