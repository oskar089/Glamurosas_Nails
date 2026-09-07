import { z } from "zod";

export const SERVICE_IDS = ["classic", "gel", "acrylic", "nail-art"] as const;
export type ServiceId = (typeof SERVICE_IDS)[number];

export const DEMO_TIMES = [
  "09:00",
  "10:30",
  "12:00",
  "14:00",
  "15:30",
  "17:00",
] as const;
export type DemoTime = (typeof DEMO_TIMES)[number];

export function isServiceId(value: string | null): value is ServiceId {
  return SERVICE_IDS.includes(value as ServiceId);
}

export function isDemoTime(value: string): value is DemoTime {
  return DEMO_TIMES.includes(value as DemoTime);
}

export function localDateString(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function isCalendarDate(value: string) {
  const parsedDate = new Date(`${value}T12:00:00`);
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(parsedDate.getTime()) &&
    localDateString(parsedDate) === value
  );
}

const calendarDateSchema = z.string().refine(isCalendarDate, {
  message: "Elige una fecha válida.",
});

function addPastDateIssue(context: z.RefinementCtx) {
  context.addIssue({
    code: z.ZodIssueCode.custom,
    message: "Elige hoy o una fecha futura.",
    path: ["date"],
  });
}

const bookingFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Introduce un nombre de al menos 2 caracteres." }),
  email: z.email({
    error: "Introduce una dirección de correo electrónico válida.",
  }),
  service: z.string().refine(isServiceId, {
    message: "Elige un servicio.",
  }),
  date: calendarDateSchema,
  time: z.string().refine(isDemoTime, {
    message: "Elige una hora de ejemplo.",
  }),
});

export function createBookingSchema(today = localDateString()) {
  return bookingFieldsSchema.superRefine(({ date }, context) => {
    if (isCalendarDate(date) && date < today) {
      addPastDateIssue(context);
    }
  });
}

export const bookingSchema = createBookingSchema();

export type BookingInput = z.infer<typeof bookingSchema>;

export const bookingRequestSchema = bookingFieldsSchema
  .extend({ clientToday: calendarDateSchema })
  .superRefine(({ clientToday, date }, context) => {
    if (
      isCalendarDate(date) &&
      isCalendarDate(clientToday) &&
      date < clientToday
    ) {
      addPastDateIssue(context);
    }
  });

export type BookingRequest = z.infer<typeof bookingRequestSchema>;

export interface BookingRecord {
  id: number;
  service: string;
  name: string;
  email: string;
  date: string;
  time: string;
  created_at: string;
}
