import { z } from "zod";
import type {
  BookingFormValues,
  BookingRequestFormValues,
} from "../models/types";
import { demoTimes, localDateString, services } from "./content";

export const bookingRequestFormSchema = z.object({
  name: z.string().superRefine((value, context) => {
    const length = value.trim().length;
    if (length < 2) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Introduce un nombre de al menos 2 caracteres.",
      });
    } else if (length > 80) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mantén tu nombre por debajo de 80 caracteres.",
      });
    }
  }),
  email: z
    .string()
    .trim()
    .email("Introduce una dirección de correo electrónico válida."),
  phone: z.string().superRefine((value, context) => {
    if (!/^[0-9+()\s-]{7,30}$/.test(value.trim())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Introduce un teléfono válido.",
      });
    }
  }),
  service: z.string().superRefine((value, context) => {
    if (!services.some((service) => service.id === value)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Elige un servicio.",
      });
    }
  }),
  notes: z.string().superRefine((value, context) => {
    const length = value.trim().length;
    if (length < 10) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Escribe al menos 10 caracteres sobre tu preferencia.",
      });
    } else if (length > 600) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mantén tus notas por debajo de 600 caracteres.",
      });
    }
  }),
}) satisfies z.ZodType<BookingRequestFormValues>;

export const reviewSchema = z.object({
  name: z.string().superRefine((value, context) => {
    if (value.trim().length < 2) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Escribe un nombre de al menos 2 caracteres.",
      });
    } else if (value.trim().length > 80) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mantén tu nombre por debajo de 80 caracteres.",
      });
    }
  }),
  rating: z.number().superRefine((value, context) => {
    if (value < 1 || value > 5) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Elige una valoración de 1 a 5 estrellas.",
      });
    }
  }),
  comment: z.string().superRefine((value, context) => {
    const length = value.trim().length;
    if (length < 10) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Escribe al menos 10 caracteres para tu reseña.",
      });
    } else if (length > 600) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Mantén tu reseña por debajo de 600 caracteres.",
      });
    }
  }),
});

export function validateBooking(
  values: BookingFormValues,
  today = localDateString(),
): Record<string, string> {
  const errors: Record<string, string> = {};
  if (values.name.trim().length < 2) {
    errors.name = "Introduce un nombre de al menos 2 caracteres.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Introduce una dirección de correo electrónico válida.";
  }
  if (!services.some((service) => service.id === values.service)) {
    errors.service = "Elige un servicio.";
  }
  const parsedDate = new Date(`${values.date}T12:00:00`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(values.date) ||
    Number.isNaN(parsedDate.getTime()) ||
    localDateString(parsedDate) !== values.date
  ) {
    errors.date = "Elige una fecha válida.";
  } else if (values.date < today) {
    errors.date = "Elige hoy o una fecha futura.";
  }
  if (!demoTimes.includes(values.time as (typeof demoTimes)[number])) {
    errors.time = "Elige una hora de ejemplo.";
  }
  return errors;
}
