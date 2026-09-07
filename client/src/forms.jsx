import { useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Arrow, NailIcon, ReviewCard, Sparkle } from "./components";
import {
  demoTimes,
  exampleReviews,
  localDateString,
  services,
  validateBooking,
} from "./content";

function FormIntro({ eyebrow, title, children }) {
  return (
    <div className="page-intro container">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <div className="page-intro-description">{children}</div>
    </div>
  );
}

function FieldError({ id, error }) {
  return error ? (
    <span className="field-error" id={`${id}-error`}>
      {error}
    </span>
  ) : null;
}

function ErrorSummary({ errors }) {
  return Object.keys(errors).length ? (
    <div className="error-summary" role="alert">
      <strong>Hay un detalle que requiere tu atención.</strong>
      <p>Revisa los campos resaltados a continuación.</p>
    </div>
  ) : null;
}

export function Booking() {
  const [params] = useSearchParams();
  const preselection = params.get("service");
  const [values, setValues] = useState({
    name: "",
    email: "",
    service: services.some((service) => service.id === preselection)
      ? preselection
      : "",
    date: "",
    time: "",
  });
  const [errors, setErrors] = useState({});
  const [confirmation, setConfirmation] = useState(null);
  const formRef = useRef(null);
  const selectedService = services.find(
    (service) => service.id === values.service,
  );
  const today = localDateString();

  function update(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  function submit(event) {
    event.preventDefault();
    const nextErrors = validateBooking(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      formRef.current.elements.namedItem(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    setConfirmation({
      service: selectedService.shortName,
      date: values.date,
      time: values.time,
    });
    setValues({ name: "", email: "", service: "", date: "", time: "" });
  }

  function fieldProps(name) {
    return {
      id: name,
      name,
      value: values[name],
      onChange: update,
      required: true,
      "aria-invalid": Boolean(errors[name]),
      "aria-describedby":
        [errors[name] && `${name}-error`, name === "time" && "time-hint"]
          .filter(Boolean)
          .join(" ") || undefined,
    };
  }

  return (
    <>
      <FormIntro
        eyebrow="UN MOMENTO PARA TI"
        title={
          <>
            Haz espacio para <em>un poco de autocuidado.</em>
          </>
        }
      >
        <p>
          Prueba el recorrido desde la inspiración hasta tu próximo estilo.
          <br />
          Esta es una vista previa de cita, no una solicitud de cita real.
        </p>
      </FormIntro>
      <section
        className="container booking-layout page-section"
        aria-label="Demostración de cita"
      >
        <aside className="booking-aside">
          <div className="booking-aside-art">
            <NailIcon variant={selectedService?.id || "classic"} />
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
              : "Elige un servicio para explorar tu propio momento de cuidado, personalidad y posibilidades."}
          </p>
          {selectedService && (
            <div className="booking-estimate">
              <strong>Desde ${selectedService.price} USD</strong>
              <span>
                {selectedService.duration} min · precio ilustrativo en USD
              </span>
            </div>
          )}
          <div className="privacy-note">
            <Sparkle />
            <div>
              <h3>Solo una vista previa. Siempre privada.</h3>
              <p>
                No se guarda ni se envía ninguna cita. No se crea ningún evento
                de calendario ni correo electrónico. Los datos del formulario
                permanecen en la memoria de esta página y se eliminan tras un
                envío válido o al salir.
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
              <p className="eyebrow">DEMOSTRACIÓN COMPLETADA</p>
              <h2>
                Una elección encantadora.
                <br />
                <em>Solo una vista previa.</em>
              </h2>
              <p>
                Probaste la experiencia de cita para{" "}
                <strong>{confirmation.service}</strong> el{" "}
                <strong>
                  {new Date(`${confirmation.date}T12:00:00`).toLocaleDateString(
                    "es-ES",
                    { month: "long", day: "numeric", year: "numeric" },
                  )}
                </strong>{" "}
                a las <strong>{confirmation.time}</strong>.
              </p>
              <div className="notice">
                <p>
                  <strong>No se guardó, envió ni reservó ninguna cita.</strong>{" "}
                  No se creó ningún evento de calendario ni correo electrónico.
                  Tu nombre y correo electrónico se eliminaron del formulario.
                </p>
              </div>
              <button className="button" onClick={() => setConfirmation(null)}>
                Prueba otra demostración <Arrow />
              </button>
            </div>
          ) : (
            <form ref={formRef} noValidate onSubmit={submit}>
              <div className="form-heading">
                <span className="step-label">01 — TU MOMENTO</span>
                <span className="demo-tag">Solo demostración</span>
              </div>
              <h2>Los pequeños detalles</h2>
              <p className="form-description">
                Todos los campos son obligatorios. Usa datos de ejemplo.
              </p>
              <ErrorSummary
                errors={Object.fromEntries(
                  Object.entries(errors).filter(([, error]) => error),
                )}
              />
              <div className="field">
                <label htmlFor="name">Tu nombre</label>
                <input
                  {...fieldProps("name")}
                  type="text"
                  placeholder="p. ej., Alex Taylor"
                  autoComplete="off"
                  maxLength={100}
                />
                <FieldError id="name" error={errors.name} />
              </div>
              <div className="field">
                <label htmlFor="email">Dirección de correo electrónico</label>
                <input
                  {...fieldProps("email")}
                  type="email"
                  placeholder="alex@example.com"
                  autoComplete="off"
                  maxLength={254}
                />
                <FieldError id="email" error={errors.email} />
              </div>
              <div className="field">
                <label htmlFor="service">Elige tu servicio</label>
                <select {...fieldProps("service")}>
                  <option value="">Encuentra tu acabado ideal</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.shortName} · desde ${service.price} USD
                      {service.id === "nail-art" ? " (complemento)" : ""}
                    </option>
                  ))}
                </select>
                <FieldError id="service" error={errors.service} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="date">Fecha preferida</label>
                  <input {...fieldProps("date")} type="date" min={today} />
                  <FieldError id="date" error={errors.date} />
                </div>
                <div className="field">
                  <label htmlFor="time">Hora de ejemplo</label>
                  <select {...fieldProps("time")}>
                    <option value="">Elige una hora</option>
                    {demoTimes.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  <FieldError id="time" error={errors.time} />
                </div>
              </div>
              <p className="field-hint" id="time-hint">
                Las horas son ejemplos, no horarios del salón ni disponibilidad
                real.
              </p>
              <button type="submit" className="button button-full">
                Ver mi cita de ejemplo <Arrow diagonal />
              </button>
              <p className="submit-note">
                Esto no reserva, envía ni guarda ninguna cita.
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}

export function Reviews({ localReviews, onAddReview }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const formRef = useRef(null);
  function submit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (rating < 1 || rating > 5)
      nextErrors.rating = "Elige una valoración de 1 a 5 estrellas.";
    if (comment.trim().length < 10)
      nextErrors.comment =
        "Escribe al menos 10 caracteres para tu reseña de demostración.";
    if (comment.trim().length > 600)
      nextErrors.comment =
        "Mantén tu reseña de demostración por debajo de 600 caracteres.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      const target = nextErrors.rating
        ? formRef.current.querySelector('input[name="rating"]')
        : formRef.current.elements.namedItem("comment");
      target?.focus();
      return;
    }
    onAddReview({
      id: crypto.randomUUID(),
      name: "Tu reseña de demostración",
      rating,
      comment: comment.trim(),
      style: "Visible solo en esta sesión del navegador",
      example: false,
    });
    setRating(0);
    setComment("");
    setSubmitted(true);
  }
  return (
    <>
      <FormIntro
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
      </FormIntro>
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
          <div
            className="reviews-list"
            aria-label="Reseñas de ejemplo y demostraciones locales"
          >
            {[...localReviews, ...exampleReviews].map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
          <div className="form-panel review-form-panel">
            <form noValidate onSubmit={submit} ref={formRef}>
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
              <ErrorSummary errors={errors} />
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
                        onChange={() => {
                          setRating(value);
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
                <FieldError id="rating" error={errors.rating} />
              </fieldset>
              <div className="field">
                <label htmlFor="comment">Tus comentarios (obligatorios)</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={comment}
                  onChange={(event) => {
                    setComment(event.target.value);
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
                <FieldError id="comment" error={errors.comment} />
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
