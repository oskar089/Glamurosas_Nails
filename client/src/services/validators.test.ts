import {
  bookingRequestSchema,
  bookingSchema,
  createBookingSchema,
} from "@glamurosas/shared";
import { describe, expect, it } from "vitest";
import { reviewSchema, validateBooking } from "./validators";

const TODAY = "2026-09-07";

const VALID_BOOKING = {
  name: "Ana Caro",
  email: "ana@example.com",
  service: "acrylic",
  date: "2026-09-08",
  time: "14:00",
} as const;

function issueMessages(result: {
  success: boolean;
  error?: { issues: { message: string }[] };
}) {
  return (result.error?.issues ?? []).map((issue) => issue.message);
}

describe("createBookingSchema", () => {
  const schema = createBookingSchema(TODAY);

  it("accepts a complete valid reservation", () => {
    const result = schema.safeParse(VALID_BOOKING);
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email with the exact Spanish message", () => {
    const result = schema.safeParse({
      ...VALID_BOOKING,
      email: "invalid-email",
    });
    expect(result.success).toBe(false);
    expect(issueMessages(result)).toContain(
      "Introduce una dirección de correo electrónico válida.",
    );
  });

  it("requires a name of at least 2 characters after trimming", () => {
    const short = schema.safeParse({ ...VALID_BOOKING, name: "A" });
    expect(issueMessages(short)).toContain(
      "Introduce un nombre de al menos 2 caracteres.",
    );
    const whitespaceOnly = schema.safeParse({
      ...VALID_BOOKING,
      name: "  A  ",
    });
    expect(issueMessages(whitespaceOnly)).toContain(
      "Introduce un nombre de al menos 2 caracteres.",
    );
  });

  it("requires a known service", () => {
    for (const service of ["", "unknown"]) {
      const result = schema.safeParse({ ...VALID_BOOKING, service });
      expect(issueMessages(result)).toContain("Elige un servicio.");
    }
  });

  it("rejects a past date with the exact Spanish message", () => {
    const result = schema.safeParse({ ...VALID_BOOKING, date: "2026-09-06" });
    expect(result.success).toBe(false);
    expect(issueMessages(result)).toContain("Elige hoy o una fecha futura.");
  });

  it("accepts today and future dates", () => {
    for (const date of ["2026-09-07", "2026-12-31"]) {
      const result = schema.safeParse({ ...VALID_BOOKING, date });
      expect(result.success).toBe(true);
    }
  });

  it("rejects malformed or impossible dates", () => {
    for (const date of ["", "not-a-date", "2026/09/07", "2026-02-30"]) {
      const result = schema.safeParse({ ...VALID_BOOKING, date });
      expect(result.success).toBe(false);
      expect(issueMessages(result)).toContain("Elige una fecha válida.");
    }
  });

  it("requires a demo time", () => {
    for (const time of ["", "08:00"]) {
      const result = schema.safeParse({ ...VALID_BOOKING, time });
      expect(issueMessages(result)).toContain("Elige una hora de ejemplo.");
    }
  });
});

describe("bookingSchema (exported default)", () => {
  it("accepts a clearly future reservation", () => {
    const result = bookingSchema.safeParse({
      ...VALID_BOOKING,
      date: "2099-12-31",
    });
    expect(result.success).toBe(true);
  });
});

describe("bookingRequestSchema", () => {
  it("accepts the browser-local current date without using the server clock", () => {
    const result = bookingRequestSchema.safeParse({
      ...VALID_BOOKING,
      date: "2026-09-06",
      clientToday: "2026-09-06",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid client-local date with the exact Spanish message", () => {
    const result = bookingRequestSchema.safeParse({
      ...VALID_BOOKING,
      clientToday: "2026-02-30",
    });
    expect(result.success).toBe(false);
    expect(issueMessages(result)).toContain("Elige una fecha válida.");
  });

  it("rejects a requested date before the browser-local current date", () => {
    const result = bookingRequestSchema.safeParse({
      ...VALID_BOOKING,
      date: "2026-09-06",
      clientToday: TODAY,
    });
    expect(result.success).toBe(false);
    expect(issueMessages(result)).toContain("Elige hoy o una fecha futura.");
  });
});

const VALID_REVIEW = {
  name: "Lucía",
  rating: 5,
  comment: "Comentario valido",
} as const;

describe("reviewSchema", () => {
  it("rejects ratings outside 1..5 with the exact Spanish message", () => {
    for (const rating of [0, 6]) {
      const result = reviewSchema.safeParse({ ...VALID_REVIEW, rating });
      expect(result.success).toBe(false);
      expect(issueMessages(result)).toContain(
        "Elige una valoración de 1 a 5 estrellas.",
      );
    }
  });

  it("accepts ratings between 1 and 5", () => {
    for (const rating of [1, 3, 5]) {
      const result = reviewSchema.safeParse({ ...VALID_REVIEW, rating });
      expect(result.success).toBe(true);
    }
  });

  it("requires a comment of at least 10 characters after trimming", () => {
    for (const comment of ["", "short", "   abc   "]) {
      const result = reviewSchema.safeParse({ ...VALID_REVIEW, comment });
      expect(result.success).toBe(false);
      expect(issueMessages(result)).toContain(
        "Escribe al menos 10 caracteres para tu reseña.",
      );
    }
  });

  it("rejects comments over 600 characters", () => {
    const result = reviewSchema.safeParse({
      ...VALID_REVIEW,
      comment: "a".repeat(601),
    });
    expect(result.success).toBe(false);
    expect(issueMessages(result)).toContain(
      "Mantén tu reseña por debajo de 600 caracteres.",
    );
  });

  it("accepts comments of exactly 10 and 600 characters", () => {
    for (const comment of ["a".repeat(10), "a".repeat(600)]) {
      const result = reviewSchema.safeParse({ ...VALID_REVIEW, comment });
      expect(result.success).toBe(true);
    }
  });

  it("keeps markup in the comment as plain data (rendering escapes it)", () => {
    const result = reviewSchema.safeParse({
      ...VALID_REVIEW,
      comment: "Un comentario <img src=x onerror=alert(1)> de prueba",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.comment).toContain("<img src=x");
    }
  });
});

describe("validateBooking", () => {
  it("returns no errors for valid values", () => {
    expect(validateBooking(VALID_BOOKING, TODAY)).toEqual({});
  });

  it("returns every exact Spanish message for empty values", () => {
    const errors = validateBooking(
      { name: "", email: "", service: "", date: "", time: "" },
      TODAY,
    );
    expect(errors).toEqual({
      name: "Introduce un nombre de al menos 2 caracteres.",
      email: "Introduce una dirección de correo electrónico válida.",
      service: "Elige un servicio.",
      date: "Elige una fecha válida.",
      time: "Elige una hora de ejemplo.",
    });
  });

  it("flags an invalid email, a past date and an unknown time independently", () => {
    expect(validateBooking({ ...VALID_BOOKING, email: "x" }, TODAY)).toEqual({
      email: "Introduce una dirección de correo electrónico válida.",
    });
    expect(
      validateBooking({ ...VALID_BOOKING, date: "2026-09-06" }, TODAY),
    ).toEqual({
      date: "Elige hoy o una fecha futura.",
    });
    expect(validateBooking({ ...VALID_BOOKING, time: "08:00" }, TODAY)).toEqual(
      {
        time: "Elige una hora de ejemplo.",
      },
    );
  });
});
