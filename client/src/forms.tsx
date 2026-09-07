import {
  type BookingInput,
  type BookingRequest,
  bookingSchema,
  type DemoTime,
  type ServiceId,
} from "@glamurosas/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import type { FieldError } from "react-hook-form";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { PageIntro } from "./components/layout";
import {
  Arrow,
  ErrorSummary,
  FieldError as FieldErrorMessage,
  NailIcon,
  ReviewCard,
  Sparkle,
} from "./components/ui";
import type { BookingConfirmation, Review } from "./models/types";
import { createBooking } from "./services/api";
import {
  demoTimes,
  exampleReviews,
  isServiceId,
  localDateString,
  services,
} from "./services/content";
import { reviewSchema } from "./services/validators";

interface BookingFormData {
  name: string;
  email: string;
  service: string;
  date: string;
  time: string;
}

interface ReviewFormData {
  rating: number;
  comment: string;
}

const BOOKING_FIELDS = ["name", "email", "service", "date", "time"] as const;
const REVIEW_FIELDS = ["rating", "comment"] as const;

function toErrorRecord<Name extends string>(
  names: readonly Name[],
  errors: Partial<Record<Name, FieldError | undefined>>,
): Record<Name, string> {
  return names.reduce(
    (record, name) => {
      const message = errors[name]?.message;
      if (message) {
        record[name] = message;
      }
      return record;
    },
    {} as Record<Name, string>,
  );
}

export function Booking() {
  const [params] = useSearchParams();
  const preselection = params.get("service");
  const today = localDateString();
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(
    null,
  );
  const [isSending, setIsSending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setFocus,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      name: "",
      email: "",
      service: isServiceId(preselection) ? preselection : "",
      date: "",
      time: "",
    },
  });

  const selectedService = services.find(
    (service) => service.id === watch("service"),
  );
  const errorRecord = toErrorRecord(BOOKING_FIELDS, errors);

  const onValidSubmit = async (data: BookingFormData) => {
    setIsSending(true);
    setServerError(null);
    const input: BookingInput = {
      name: data.name,
      email: data.email,
      service: data.service as ServiceId,
      date: data.date,
      time: data.time as DemoTime,
    };
    try {
      const request: BookingRequest = {
        ...input,
        clientToday: localDateString(new Date()),
      };
      await createBooking(request);
      setConfirmation({
        service: selectedService?.shortName ?? "",
        date: data.date,
        time: data.time,
      });
      reset({ name: "", email: "", service: "", date: "", time: "" });
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "No se pudo enviar la reserva. Inténtalo de nuevo más tarde.",
      );
    } finally {
      setIsSending(false);
    }
  };

  const onInvalidSubmit = () => {
    const firstInvalid = BOOKING_FIELDS.find((field) => errorRecord[field]);
    if (firstInvalid) {
      setFocus(firstInvalid);
    }
  };

  const firstError = (field: keyof BookingFormData) => errors[field]?.message;

  return (
    <>
      <PageIntro
        eyebrow="UN MOMENTO PARA TI"
        title={
          <>
            Haz espacio para <em>un poco de autocuidado.</em>
          </>
        }
      >
        <p>
          Elige el servicio, la fecha y la hora que prefieras para tu solicitud.
          <br />
          Confirmaremos la disponibilidad antes de confirmar tu cita.
        </p>
      </PageIntro>
      <section
        className="container booking-layout page-section"
        aria-label="Solicitud de cita"
      >
        <aside className="booking-aside">
          <div className="booking-aside-art">
            <NailIcon variant={selectedService?.id ?? "classic"} />
            <Sparkle />
          </div>
          <p className="eyebrow">TU PEQUEÑO RITUAL</p>
          <h2>
            {selectedService ? (
              selectedService.shortName
            ) : (
              <>
                Un nuevo estilo.
                <br />
                <em>Una sensación renovada.</em>
              </>
            )}
          </h2>
          <p>
            {selectedService
              ? selectedService.description
              : "Elige un servicio para preparar tu solicitud de cita según tu estilo y preferencias."}
          </p>
          {selectedService && (
            <div className="booking-estimate">
              <strong>Desde ${selectedService.price} USD</strong>
              <span>
                {selectedService.duration} min · precio de referencia en USD
              </span>
            </div>
          )}
          <div className="privacy-note">
            <Sparkle />
            <div>
              <h3>Tu solicitud queda registrada.</h3>
              <p>
                Usamos tus datos para registrar tu solicitud de cita. La
                disponibilidad de la fecha y hora queda pendiente de
                confirmación.
              </p>
            </div>
          </div>
          <Link className="text-link" to="/services">
            Vuelve a ver los servicios <Arrow />
          </Link>
        </aside>
        <div className="form-panel">
          {confirmation ? (
            <div className="confirmation" role="status">
              <span className="confirmation-icon" aria-hidden="true">
                ✓
              </span>
              <p className="eyebrow">SOLICITUD RECIBIDA</p>
              <h2>
                Una elección encantadora.
                <br />
                <em>Confirmaremos la disponibilidad.</em>
              </h2>
              <p>
                Recibimos tu solicitud de cita para{" "}
                <strong>{confirmation.service}</strong> el{" "}
                <strong>
                  {new Date(`${confirmation.date}T12:00:00`).toLocaleDateString(
                    "es-ES",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    },
                  )}
                </strong>{" "}
                a las <strong>{confirmation.time}</strong>.
              </p>
              <div className="notice">
                <p>
                  <strong>Tu solicitud se guardó correctamente.</strong> La
                  disponibilidad de la fecha y hora queda pendiente de
                  confirmación.
                </p>
              </div>
              <button
                type="button"
                className="button"
                onClick={() => setConfirmation(null)}
              >
                Enviar otra solicitud <Arrow />
              </button>
            </div>
          ) : (
            <form
              noValidate
              onSubmit={handleSubmit(onValidSubmit, onInvalidSubmit)}
            >
              {serverError && (
                <div className="error-summary" role="alert">
                  <p>{serverError}</p>
                </div>
              )}
              <div className="form-heading">
                <span className="step-label">01 — TU MOMENTO</span>
                <span className="demo-tag">Solicitud pendiente</span>
              </div>
              <h2>Los pequeños detalles</h2>
              <p className="form-description">
                Todos los campos son obligatorios. Completa tus datos para
                enviar la solicitud.
              </p>
              <ErrorSummary errors={errorRecord} />
              <div className="field">
                <label htmlFor="name">Tu nombre</label>
                <input
                  id="name"
                  type="text"
                  placeholder="p. ej., Alex Taylor"
                  autoComplete="off"
                  maxLength={100}
                  {...register("name")}
                  required
                  aria-invalid={Boolean(firstError("name"))}
                  aria-describedby={
                    firstError("name") ? "name-error" : undefined
                  }
                />
                <FieldErrorMessage id="name" error={firstError("name")} />
              </div>
              <div className="field">
                <label htmlFor="email">Dirección de correo electrónico</label>
                <input
                  id="email"
                  type="email"
                  placeholder="alex@example.com"
                  autoComplete="off"
                  maxLength={254}
                  {...register("email")}
                  required
                  aria-invalid={Boolean(firstError("email"))}
                  aria-describedby={
                    firstError("email") ? "email-error" : undefined
                  }
                />
                <FieldErrorMessage id="email" error={firstError("email")} />
              </div>
              <div className="field">
                <label htmlFor="service">Elige tu servicio</label>
                <select
                  id="service"
                  {...register("service")}
                  required
                  aria-invalid={Boolean(firstError("service"))}
                  aria-describedby={
                    firstError("service") ? "service-error" : undefined
                  }
                >
                  <option value="">Encuentra tu acabado ideal</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.shortName} · desde ${service.price} USD
                      {service.id === "nail-art" ? " (complemento)" : ""}
                    </option>
                  ))}
                </select>
                <FieldErrorMessage id="service" error={firstError("service")} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="date">Fecha preferida</label>
                  <input
                    id="date"
                    type="date"
                    min={today}
                    {...register("date")}
                    required
                    aria-invalid={Boolean(firstError("date"))}
                    aria-describedby={
                      firstError("date") ? "date-error" : undefined
                    }
                  />
                  <FieldErrorMessage id="date" error={firstError("date")} />
                </div>
                <div className="field">
                  <label htmlFor="time">Hora preferida</label>
                  <select
                    id="time"
                    {...register("time")}
                    required
                    aria-invalid={Boolean(firstError("time"))}
                    aria-describedby={`${firstError("time") ? "time-error " : ""}time-hint`}
                  >
                    <option value="">Elige una hora</option>
                    {demoTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  <FieldErrorMessage id="time" error={firstError("time")} />
                </div>
              </div>
              <p className="field-hint" id="time-hint">
                La disponibilidad de la hora solicitada se confirmará antes de
                reservar tu cita.
              </p>
              <button
                type="submit"
                className="button button-full"
                disabled={isSending}
              >
                {isSending ? (
                  "Enviando solicitud…"
                ) : (
                  <>
                    Enviar solicitud de cita <Arrow diagonal />
                  </>
                )}
              </button>
              <p className="submit-note">
                La solicitud se registra al enviarla. La disponibilidad se
                confirmará antes de reservar tu cita.
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

export function Reviews() {
  const [localReviews, setLocalReviews] = useState<Review[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const {
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors },
  } = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const rating = watch("rating");
  const comment = watch("comment") ?? "";
  const errorRecord = toErrorRecord(REVIEW_FIELDS, errors);
  const ratingRef = useRef<HTMLInputElement | null>(null);
  const commentRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (errors.rating) {
      ratingRef.current?.focus();
    } else if (errors.comment) {
      commentRef.current?.focus();
    }
  }, [errors.rating, errors.comment]);

  const onValidSubmit = (data: ReviewFormData) => {
    setLocalReviews((current) => [
      {
        id: crypto.randomUUID(),
        name: "Tu reseña de demostración",
        rating: data.rating,
        comment: data.comment.trim(),
        style: "Visible solo en esta sesión del navegador",
        example: false,
      },
      ...current,
    ]);
    reset({ rating: 0, comment: "" });
    setSubmitted(true);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = reviewSchema.safeParse({
      rating,
      comment,
    });
    if (result.success) {
      onValidSubmit(result.data);
    } else {
      void trigger();
    }
  };

  return (
    <>
      <PageIntro
        eyebrow="PEQUEÑAS PALABRAS, SENSACIONES BONITAS"
        title={
          <>
            Un espacio para <em>tus historias.</em>
          </>
        }
      >
        <p>
          Cada pequeño ritual tiene una historia.
          <br />
          Explora los ejemplos a continuación o prueba a dejar una reseña de
          demostración.
        </p>
      </PageIntro>
      <section className="container page-section">
        <div className="notice">
          <Sparkle />
          <p>
            <strong>
              Estas son reseñas de ejemplo, no testimonios reales.
            </strong>{" "}
            No representan clientes verificados ni valoraciones reales. Tu
            reseña de demostración no se publica y desaparece al recargar la
            página.
          </p>
        </div>
        <div className="reviews-layout">
          <ul
            className="reviews-list"
            aria-label="Reseñas de ejemplo y demostraciones locales"
          >
            {[...localReviews, ...exampleReviews].map((review) => (
              <li key={review.id}>
                <ReviewCard review={review} />
              </li>
            ))}
          </ul>
          <div className="form-panel review-form-panel">
            <form noValidate onSubmit={onSubmit}>
              <p className="eyebrow">PRUEBA LA EXPERIENCIA</p>
              <h2>Unas palabras bonitas</h2>
              <p className="form-description">
                Usa solo contenido de ejemplo. Tu valoración y comentario
                permanecen en memoria, nunca se envían y se pierden al recargar.
              </p>
              {submitted && (
                <div className="success-note" role="status">
                  Tu reseña de demostración se añadió solo a esta página. No se
                  publica y desaparecerá al recargar.
                </div>
              )}
              <ErrorSummary errors={errorRecord} />
              <fieldset
                className="rating-field"
                aria-describedby={errors.rating ? "rating-error" : undefined}
              >
                <legend>Tu valoración (obligatoria)</legend>
                <div className="rating-options">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label key={value}>
                      <input
                        type="radio"
                        name="rating"
                        value={value}
                        checked={rating === value}
                        ref={(node) => {
                          if (node && value === 1) {
                            ratingRef.current = node;
                          }
                        }}
                        onChange={() => {
                          setValue("rating", value);
                          setSubmitted(false);
                        }}
                        aria-label={`${value} ${value === 1 ? "estrella" : "estrellas"}`}
                        aria-invalid={Boolean(errors.rating)}
                        required
                      />
                      <span
                        className={value <= rating ? "selected" : ""}
                        aria-hidden="true"
                      >
                        ★
                      </span>
                    </label>
                  ))}
                </div>
                <FieldErrorMessage
                  id="rating"
                  error={errors.rating?.message ?? undefined}
                />
              </fieldset>
              <div className="field">
                <label htmlFor="comment">Tus comentarios (obligatorios)</label>
                <textarea
                  id="comment"
                  ref={commentRef}
                  value={comment}
                  onChange={(event) => {
                    setValue("comment", event.target.value);
                    setSubmitted(false);
                  }}
                  placeholder="¿Qué haría especial tu experiencia ideal de cuidado de uñas?"
                  rows={5}
                  maxLength={600}
                  required
                  aria-invalid={Boolean(errors.comment)}
                  aria-describedby={`comment-hint${errors.comment ? " comment-error" : ""}`}
                />
                <div className="textarea-caption">
                  <span id="comment-hint">
                    10–600 caracteres. No incluyas datos personales.
                  </span>
                  <span>{comment.length}/600</span>
                </div>
                {errors.comment && (
                  <span className="field-error" id="comment-error">
                    {errors.comment.message}
                  </span>
                )}
              </div>
              <button className="button button-full" type="submit">
                Añadir una reseña de demostración <Arrow />
              </button>
              <p className="submit-note">
                Solo una vista previa local. No se publica nada.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
