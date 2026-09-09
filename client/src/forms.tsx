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
import type { Review } from "./models/types";
import { exampleReviews, isServiceId, services } from "./services/content";
import { reviewSchema } from "./services/validators";

interface ReviewFormData {
  rating: number;
  comment: string;
}

const GOOGLE_CALENDAR_APPOINTMENTS_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ04lNU9EX8RIuRrbaUyWd8jnH7IAIxq9MIWSebI5lJO05QQSgrpNw6kKg2Yy6okKwVWxi59UHyl";
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
  const selectedService = isServiceId(preselection)
    ? services.find((service) => service.id === preselection)
    : undefined;

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
          Consulta los horarios disponibles y reserva tu cita directamente en
          Google Calendar.
        </p>
      </PageIntro>
      <section
        className="container booking-layout page-section"
        aria-label="Reserva tu cita"
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
              : "Explora los servicios y elige el horario que mejor te venga en Google Calendar."}
          </p>
          <div className="privacy-note">
            <Sparkle />
            <div>
              <h3>Google Calendar gestiona tu cita.</h3>
              <p>
                Consulta la disponibilidad y completa los datos de tu reserva
                directamente en Google Calendar.
              </p>
            </div>
          </div>
          <Link className="text-link" to="/services">
            Vuelve a ver los servicios <Arrow />
          </Link>
        </aside>
        <div className="form-panel">
          <div className="form-heading">
            <span className="step-label">01 — ELIGE TU HORARIO</span>
            <span className="demo-tag">Google Calendar</span>
          </div>
          <h2>Reserva tu momento.</h2>
          <p className="form-description">
            Google Calendar muestra los horarios disponibles y gestiona los
            datos de tu cita.
          </p>
          <a
            className="button button-full"
            href={GOOGLE_CALENDAR_APPOINTMENTS_URL}
            target="_blank"
            rel="noreferrer"
          >
            Ver disponibilidad en Google Calendar <Arrow diagonal />
          </a>
          <p className="submit-note">
            Se abrirá Google Calendar para elegir y confirmar el horario de tu
            cita.
          </p>
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
