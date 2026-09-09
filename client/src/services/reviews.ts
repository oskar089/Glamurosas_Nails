import type { Review, ReviewFormValues } from "../models/types";

const REVIEWS_ENDPOINT = "/rest/v1/reviews";

interface SupabaseConfig {
  url: string;
  publishableKey: string;
}

interface ReviewRow {
  id: unknown;
  name: unknown;
  rating: unknown;
  comment: unknown;
}

function getSupabaseConfig(): SupabaseConfig | null {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

  if (!url || !publishableKey) {
    return null;
  }

  return { url: url.replace(/\/$/, ""), publishableKey };
}

function headers(config: SupabaseConfig): HeadersInit {
  return {
    apikey: config.publishableKey,
    Authorization: `Bearer ${config.publishableKey}`,
    "Content-Type": "application/json",
  };
}

function toReview(row: ReviewRow): Review | null {
  if (
    typeof row.id !== "string" ||
    typeof row.name !== "string" ||
    typeof row.rating !== "number" ||
    !Number.isInteger(row.rating) ||
    row.rating < 1 ||
    row.rating > 5 ||
    typeof row.comment !== "string"
  ) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    rating: row.rating,
    comment: row.comment,
    style: "Testimonio compartido",
    example: false,
  };
}

export async function getApprovedReviews(): Promise<Review[]> {
  const config = getSupabaseConfig();
  if (!config) {
    return [];
  }

  let response: Response;
  try {
    response = await fetch(
      `${config.url}${REVIEWS_ENDPOINT}?select=id,name,rating,comment&status=eq.approved&order=created_at.desc`,
      { headers: headers(config) },
    );
  } catch {
    throw new Error("No se pudieron cargar las reseñas.");
  }

  if (!response.ok) {
    throw new Error("No se pudieron cargar las reseñas.");
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("No se pudieron cargar las reseñas.");
  }

  return data.flatMap((row) => toReview(row as ReviewRow) ?? []);
}

export async function submitReview(input: ReviewFormValues): Promise<void> {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("El servicio de reseñas no está disponible.");
  }

  let response: Response;
  try {
    response = await fetch(`${config.url}${REVIEWS_ENDPOINT}`, {
      method: "POST",
      headers: { ...headers(config), Prefer: "return=minimal" },
      body: JSON.stringify({
        name: input.name.trim(),
        rating: input.rating,
        comment: input.comment.trim(),
        status: "pending",
      }),
    });
  } catch {
    throw new Error(
      "No se pudo enviar tu reseña. Inténtalo de nuevo más tarde.",
    );
  }

  if (!response.ok) {
    throw new Error(
      "No se pudo enviar tu reseña. Inténtalo de nuevo más tarde.",
    );
  }
}
