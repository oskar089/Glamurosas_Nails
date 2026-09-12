import { afterEach, describe, expect, it, vi } from "vitest";
import {
  getPendingBookingRequests,
  updateBookingRequestStatus,
} from "./admin-bookings";

const SUPABASE_URL = "https://project.supabase.co";
const PUBLISHABLE_KEY = "publishable-key";
const SESSION = { accessToken: "access-token", email: "admin@example.com" };

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("admin booking request service", () => {
  it("loads only valid pending requests with the admin session", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", SUPABASE_URL);
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", PUBLISHABLE_KEY);
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse([
        {
          id: "request-1",
          name: "Lucía",
          email: "lucia@example.com",
          phone: "643 521 975",
          service: "gel",
          notes: "Prefiero un acabado natural.",
          status: "pending",
          created_at: "2026-04-02T12:00:00.000Z",
        },
        {
          id: "request-2",
          name: "No debe salir",
          email: "invalid",
          phone: "",
          service: "",
          notes: "",
          status: "pending",
          created_at: "2026-04-02T12:00:00.000Z",
        },
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getPendingBookingRequests(SESSION)).resolves.toEqual([
      {
        id: "request-1",
        name: "Lucía",
        email: "lucia@example.com",
        phone: "643 521 975",
        service: "gel",
        notes: "Prefiero un acabado natural.",
        status: "pending",
        createdAt: "2026-04-02T12:00:00.000Z",
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      `${SUPABASE_URL}/rest/v1/booking_requests?select=id,name,email,phone,service,notes,status,created_at&status=eq.pending&order=created_at.asc`,
      expect.objectContaining({
        headers: expect.objectContaining({
          apikey: PUBLISHABLE_KEY,
          Authorization: `Bearer ${SESSION.accessToken}`,
        }),
      }),
    );
  });

  it.each(["followed_up", "closed"] as const)(
    "updates a booking request as %s with the admin session",
    async (status) => {
      vi.stubEnv("VITE_SUPABASE_URL", SUPABASE_URL);
      vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", PUBLISHABLE_KEY);
      const fetchMock = vi
        .fn()
        .mockResolvedValue(new Response(null, { status: 204 }));
      vi.stubGlobal("fetch", fetchMock);

      await expect(
        updateBookingRequestStatus(SESSION, "request/1", status),
      ).resolves.toBeUndefined();

      expect(fetchMock).toHaveBeenCalledWith(
        `${SUPABASE_URL}/rest/v1/booking_requests?id=eq.request%2F1`,
        expect.objectContaining({
          method: "PATCH",
          headers: expect.objectContaining({
            apikey: PUBLISHABLE_KEY,
            Authorization: `Bearer ${SESSION.accessToken}`,
            Prefer: "return=minimal",
          }),
          body: JSON.stringify({ status }),
        }),
      );
    },
  );
});
