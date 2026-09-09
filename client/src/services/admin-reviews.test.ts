import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clearAdminSession,
  getAdminSession,
  getPendingReviews,
  signInAdmin,
  updateReviewStatus,
} from "./admin-reviews";

const SUPABASE_URL = "https://project.supabase.co";
const PUBLISHABLE_KEY = "publishable-key";
const SESSION = { accessToken: "access-token", email: "admin@example.com" };

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  sessionStorage.clear();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("admin review service", () => {
  it("stores an authenticated admin session", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", SUPABASE_URL);
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", PUBLISHABLE_KEY);
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse({
        access_token: SESSION.accessToken,
        user: { email: SESSION.email },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(signInAdmin(" admin@example.com ", "secret")).resolves.toEqual(
      SESSION,
    );
    expect(getAdminSession()).toEqual(SESSION);
    expect(fetchMock).toHaveBeenCalledWith(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: SESSION.email, password: "secret" }),
      }),
    );
  });

  it("clears a stored admin session", () => {
    sessionStorage.setItem("glamurosas-admin-session", JSON.stringify(SESSION));

    clearAdminSession();

    expect(getAdminSession()).toBeNull();
  });

  it("loads only valid pending reviews", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", SUPABASE_URL);
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", PUBLISHABLE_KEY);
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse([
        {
          id: "review-1",
          name: "Lucía",
          rating: 5,
          comment: "Una experiencia preciosa y cuidada.",
          status: "pending",
          created_at: "2026-04-02T12:00:00.000Z",
        },
        {
          id: "review-2",
          name: "Mala fila",
          rating: 5,
          comment: "No debe salir.",
          status: "approved",
          created_at: "2026-04-02T12:00:00.000Z",
        },
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getPendingReviews(SESSION)).resolves.toEqual([
      {
        id: "review-1",
        name: "Lucía",
        rating: 5,
        comment: "Una experiencia preciosa y cuidada.",
        style: "Testimonio compartido",
        example: false,
        createdAt: "2026-04-02T12:00:00.000Z",
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      `${SUPABASE_URL}/rest/v1/reviews?select=id,name,rating,comment,status,created_at&status=eq.pending&order=created_at.asc`,
      expect.objectContaining({
        headers: expect.objectContaining({
          apikey: PUBLISHABLE_KEY,
          Authorization: `Bearer ${SESSION.accessToken}`,
        }),
      }),
    );
  });

  it("updates review moderation status", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", SUPABASE_URL);
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", PUBLISHABLE_KEY);
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    await updateReviewStatus(SESSION, "review id", "approved");

    expect(fetchMock).toHaveBeenCalledWith(
      `${SUPABASE_URL}/rest/v1/reviews?id=eq.review%20id`,
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ status: "approved" }),
      }),
    );
  });
});
