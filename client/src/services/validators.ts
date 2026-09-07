import { z } from "zod";
import type { BookingFormValues } from "../models/types";
import type { DemoTime } from "./content";
import { demoTimes, isServiceId, localDateString, services } from "./content";

export function createBookingSchema(today = localDateString()) {
  return z.object({
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
    date: z.string().superRefine((value, context) => {
      const parsedDate = new Date(`${value}T12:00:00`);
      if (
        !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
        Number.isNaN(parsedDate.getTime()) ||
        localDateString(parsedDate) !== value
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Elige una fecha válida.",
        });
      } else if (value < today) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Elige hoy o una fecha futura.",
        });
      }
    }),
    time: z.string().refine((value) => demoTimes.includes(value as DemoTime), {
      message: "Elige una hora de ejemplo.",
    }),
  });
}

export const bookingSchema = createBookingSchema();

export const reviewSchema = z.object({
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
        message:
          "Escribe al menos 10 caracteres para tu reseña de demostración.",
      });
    } else if (length > 600) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Mantén tu reseña de demostración por debajo de 600 caracteres.",
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
