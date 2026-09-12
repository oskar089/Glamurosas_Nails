import type { AdminSession } from "./admin-reviews";
import { getSupabaseConfig, supabaseHeaders } from "./reviews";

const BOOKING_REQUESTS_ENDPOINT = "/rest/v1/booking_requests";

interface AdminBookingRequestRow {
  id: unknown;
  name: unknown;
  email: unknown;
  phone: unknown;
  service: unknown;
  notes: unknown;
  status: unknown;
  created_at: unknown;
}

export interface AdminBookingRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  notes: string;
  status: "pending";
  createdAt: string;
}

function toAdminBookingRequest(
  row: AdminBookingRequestRow,
): AdminBookingRequest | null {
  if (
    typeof row.id !== "string" ||
    typeof row.name !== "string" ||
    row.name.trim().length < 2 ||
    typeof row.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email) ||
    typeof row.phone !== "string" ||
    row.phone.trim().length < 7 ||
    typeof row.service !== "string" ||
    row.service.trim().length === 0 ||
    typeof row.notes !== "string" ||
    row.notes.trim().length < 10 ||
    row.status !== "pending" ||
    typeof row.created_at !== "string"
  ) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    service: row.service,
    notes: row.notes,
    status: "pending",
    createdAt: row.created_at,
  };
}

export async function getPendingBookingRequests(
  session: AdminSession,
): Promise<AdminBookingRequest[]> {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error("Supabase no está configurado.");
  }

  let response: Response;
  try {
    response = await fetch(
      `${config.url}${BOOKING_REQUESTS_ENDPOINT}?select=id,name,email,phone,service,notes,status,created_at&status=eq.pending&order=created_at.asc`,
      { headers: supabaseHeaders(config, session.accessToken) },
    );
  } catch {
    throw new Error("No se pudieron cargar las solicitudes de reserva.");
  }

  if (!response.ok) {
    throw new Error("No se pudieron cargar las solicitudes de reserva.");
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error("No se pudieron cargar las solicitudes de reserva.");
  }

  return data.flatMap(
    (row) => toAdminBookingRequest(row as AdminBookingRequestRow) ?? [],
  );
}
