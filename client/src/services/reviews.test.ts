import { afterEach, describe, expect, it, vi } from "vitest";
import { getApprovedReviews, submitReview } from "./reviews";

const SUPABASE_URL = "https://project.supabase.co";
const PUBLISHABLE_KEY = "publishable-key";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("review service", () => {
  it("returns no reviews without Supabase configuration", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await expect(getApprovedReviews()).resolves.toEqual([]);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("reads only approved reviews and ignores malformed rows", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", SUPABASE_URL);
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", PUBLISHABLE_KEY);
    const fetchMock = vi.fn().mockResolvedValue(
      jsonResponse([
        {
          id: "review-1",
          name: "Lucía",
          rating: 5,
          comment: "Un servicio precioso y muy cuidado.",
        },
        { id: "invalid", name: "Sin nota", rating: 6, comment: "No sirve" },
      ]),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(getApprovedReviews()).resolves.toEqual([
      {
        id: "review-1",
        name: "Lucía",
        rating: 5,
        comment: "Un servicio precioso y muy cuidado.",
        style: "Testimonio compartido",
        example: false,
      },
    ]);
    expect(fetchMock).toHaveBeenCalledWith(
      `${SUPABASE_URL}/rest/v1/reviews?select=id,name,rating,comment&status=eq.approved&order=created_at.desc`,
      expect.objectContaining({
        headers: expect.objectContaining({
          apikey: PUBLISHABLE_KEY,
          Authorization: `Bearer ${PUBLISHABLE_KEY}`,
        }),
      }),
    );
  });

  it("inserts a trimmed pending review", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", SUPABASE_URL);
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", PUBLISHABLE_KEY);
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await submitReview({
      name: "  Lucía  ",
      rating: 4,
      comment: "  Me encantó el cuidado y el resultado final.  ",
    });

    expect(fetchMock).toHaveBeenCalledWith(
      `${SUPABASE_URL}/rest/v1/reviews`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          name: "Lucía",
          rating: 4,
          comment: "Me encantó el cuidado y el resultado final.",
          status: "pending",
        }),
      }),
    );
  });

  it("reports network failures without exposing implementation details", async () => {
    vi.stubEnv("VITE_SUPABASE_URL", SUPABASE_URL);
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", PUBLISHABLE_KEY);
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));

    await expect(getApprovedReviews()).rejects.toThrow(
      "No se pudieron cargar las reseñas.",
    );
    await expect(
      submitReview({
        name: "Lucía",
        rating: 5,
        comment: "Una experiencia muy bonita y delicada.",
      }),
    ).rejects.toThrow(
      "No se pudo enviar tu reseña. Inténtalo de nuevo más tarde.",
    );
  });
});
