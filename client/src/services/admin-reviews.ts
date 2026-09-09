import type { Review } from "../models/types";
import { getSupabaseConfig, supabaseHeaders, toReview } from "./reviews";

const ADMIN_SESSION_KEY = "glamurosas-admin-session";
const REVIEWS_ENDPOINT = "/rest/v1/reviews";

interface AuthResponse {
  access_token?: unknown;
  user?: { email?: unknown };
}

interface AdminReviewRow {
  id: unknown;
  name: unknown;
  rating: unknown;
  comment: unknown;
  status: unknown;
  created_at: unknown;
}

export interface AdminSession {
  accessToken: string;
  email: string;
}

export interface AdminReview extends Review {
  createdAt: string;
  status: "pending" | "approved";
}

function getStoredSession(): AdminSession | null {
  const rawSession = sessionStorage.getItem(ADMIN_SESSION_KEY);
  if (!rawSession) return null;

  try {
    const session = JSON.parse(rawSession) as Partial<AdminSession>;
    if (
      typeof session.accessToken === "string" &&
      typeof session.email === "string"
    ) {
      return { accessToken: session.accessToken, email: session.email };
    }
  } catch {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
  }

  return null;
}

function storeSession(session: AdminSession) {
  sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

function adminHeaders(accessToken: string): HeadersInit {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase no está configurado.");
  }

  return supabaseHeaders(config, accessToken);
}

function toAdminReview(
  row: AdminReviewRow,
  status: "pending" | "approved",
): AdminReview | null {
  const review = toReview(row);
  if (!review || row.status !== status || typeof row.created_at !== "string") {
    return null;
  }

  return { ...review, status, createdAt: row.created_at };
}

export function getAdminSession(): AdminSession | null {
  return getStoredSession();
}

export function clearAdminSession() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export async function signInAdmin(
  email: string,
  password: string,
): Promise<AdminSession> {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase no está configurado.");
  }

  let response: Response;
  try {
    response = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: supabaseHeaders(config),
      body: JSON.stringify({ email: email.trim(), password }),
    });
  } catch {
    throw new Error("No se pudo iniciar sesión.");
  }

  if (!response.ok) {
    throw new Error("Email o contraseña incorrectos.");
  }

  const data = (await response.json()) as AuthResponse;
  if (
    typeof data.access_token !== "string" ||
    typeof data.user?.email !== "string"
  ) {
    throw new Error("No se pudo iniciar sesión.");
  }

  const session = { accessToken: data.access_token, email: data.user.email };
  storeSession(session);
  return session;
}

async function getAdminReviewsByStatus(
  session: AdminSession,
  status: "pending" | "approved",
): Promise<AdminReview[]> {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase no está configurado.");
  }

  const errorMessage =
    status === "pending"
      ? "No se pudieron cargar las reseñas pendientes."
      : "No se pudieron cargar las reseñas publicadas.";

  let response: Response;
  try {
    response = await fetch(
      `${config.url}${REVIEWS_ENDPOINT}?select=id,name,rating,comment,status,created_at&status=eq.${status}&order=created_at.asc`,
      { headers: adminHeaders(session.accessToken) },
    );
  } catch {
    throw new Error(errorMessage);
  }

  if (!response.ok) {
    throw new Error(errorMessage);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error(errorMessage);
  }

  return data.flatMap(
    (row) => toAdminReview(row as AdminReviewRow, status) ?? [],
  );
}

export function getPendingReviews(
  session: AdminSession,
): Promise<AdminReview[]> {
  return getAdminReviewsByStatus(session, "pending");
}

export function getPublishedReviews(
  session: AdminSession,
): Promise<AdminReview[]> {
  return getAdminReviewsByStatus(session, "approved");
}

export async function updateReviewStatus(
  session: AdminSession,
  reviewId: string,
  status: "approved" | "rejected",
): Promise<void> {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase no está configurado.");
  }

  let response: Response;
  try {
    response = await fetch(
      `${config.url}${REVIEWS_ENDPOINT}?id=eq.${encodeURIComponent(reviewId)}`,
      {
        method: "PATCH",
        headers: {
          ...adminHeaders(session.accessToken),
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ status }),
      },
    );
  } catch {
    throw new Error("No se pudo actualizar la reseña.");
  }

  if (!response.ok) {
    throw new Error("No se pudo actualizar la reseña.");
  }
}
