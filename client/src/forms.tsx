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
import type { Review, ReviewFormValues } from "./models/types";
import { GOOGLE_CALENDAR_APPOINTMENTS_URL } from "./services/booking";
import { isServiceId, services } from "./services/content";
import { getApprovedReviews, submitReview } from "./services/reviews";
import { reviewSchema } from "./services/validators";

const REVIEW_FIELDS = ["name", "rating", "comment"] as const;

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const {
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { name: "", rating: 0, comment: "" },
  });

  const name = watch("name") ?? "";
  const rating = watch("rating");
  const comment = watch("comment") ?? "";
  const errorRecord = toErrorRecord(REVIEW_FIELDS, errors);
  const nameRef = useRef<HTMLInputElement | null>(null);
  const ratingRef = useRef<HTMLInputElement | null>(null);
  const commentRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (errors.name) {
      nameRef.current?.focus();
    } else if (errors.rating) {
      ratingRef.current?.focus();
    } else if (errors.comment) {
      commentRef.current?.focus();
    }
  }, [errors.name, errors.rating, errors.comment]);

  useEffect(() => {
    getApprovedReviews()
      .then((approvedReviews) => {
        setReviews(approvedReviews);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        setLoadError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar las reseñas.",
        );
      });
  }, []);

  const onValidSubmit = async (data: ReviewFormValues) => {
    setSubmitError(null);
    try {
      await submitReview(data);
      reset({ name: "", rating: 0, comment: "" });
      setSubmitted(true);
    } catch (error) {
      setSubmitted(false);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "No se pudo enviar tu reseña. Inténtalo de nuevo más tarde.",
      );
    }
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const result = reviewSchema.safeParse({
      name,
      rating,
      comment,
    });
    if (result.success) {
      void onValidSubmit(result.data);
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
          Tus palabras ayudan a que otras personas se animen a vivir la suya.
        </p>
      </PageIntro>
      <section className="container page-section">
        <div className="notice">
          <Sparkle />
          <p>
            <strong>Tu experiencia importa.</strong> Compartí unas palabras
            simples sobre tu visita: qué te gustó, cómo te sentiste o qué
            detalle recomendarías a otra persona.
          </p>
        </div>
        <div className="reviews-layout">
          {reviews.length > 0 ? (
            <ul className="reviews-list" aria-label="Reseñas compartidas">
              {reviews.map((review) => (
                <li key={review.id}>
                  <ReviewCard review={review} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="notice" role="status">
              <Sparkle />
              <p>
                {loadError ??
                  "Todavía no hay reseñas visibles. Sé la primera persona en dejar unas palabras bonitas sobre tu experiencia."}
              </p>
            </div>
          )}
          <div className="form-panel review-form-panel">
            <form noValidate onSubmit={onSubmit}>
              <p className="eyebrow">DEJÁ TU HUELLA</p>
              <h2>Contanos tu experiencia</h2>
              <p className="form-description">
                Tu valoración ayuda a transmitir confianza y cercanía a quienes
                están pensando en reservar.
              </p>
              {submitted && (
                <div className="success-note" role="status">
                  Gracias por compartir tu reseña. La revisaremos antes de
                  publicarla para cuidar este espacio.
                </div>
              )}
              {submitError && (
                <div className="error-summary" role="alert">
                  {submitError}
                </div>
              )}
              <ErrorSummary errors={errorRecord} />
              <div className="field">
                <label htmlFor="review-name">Tu nombre (obligatorio)</label>
                <input
                  id="review-name"
                  ref={nameRef}
                  type="text"
                  value={name}
                  onChange={(event) => {
                    setValue("name", event.target.value);
                    setSubmitted(false);
                    setSubmitError(null);
                  }}
                  maxLength={80}
                  required
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                <FieldErrorMessage
                  id="name"
                  error={errors.name?.message ?? undefined}
                />
              </div>
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
                          setSubmitError(null);
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
                    setSubmitError(null);
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
                Compartir mi experiencia <Arrow />
              </button>
              <p className="submit-note">
                Gracias por tomarte un momento para acompañar este espacio.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
