import type { ReactNode } from "react";
import { useState } from "react";
import { Link } from "react-router-dom";
import type {
  Photo as PhotoModel,
  Review,
  Service,
  ServiceId,
} from "../models/types";

interface ArrowProps {
  diagonal?: boolean;
}

export function Arrow({ diagonal = false }: ArrowProps) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h15m-6-6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface SparkleProps {
  className?: string;
}

export function Sparkle({ className = "" }: SparkleProps) {
  return (
    <svg
      className={className}
      width="30"
      height="30"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M16 2c0 9-5 14-14 14 9 0 14 5 14 14 0-9 5-14 14-14C21 16 16 11 16 2Z"
        stroke="currentColor"
        strokeWidth="1.1"
      />
    </svg>
  );
}

interface NailIconProps {
  variant?: ServiceId;
}

export function NailIcon({ variant = "classic" }: NailIconProps) {
  return (
    <svg
      width="48"
      height="60"
      viewBox="0 0 48 60"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 47V20C12 3 36 3 36 20v27c0 10-24 10-24 0Z"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d={variant === "acrylic" ? "M13 20 24 9l11 11" : "M12 22c7 5 17 5 24 0"}
        stroke="currentColor"
        strokeWidth="1.3"
      />
      {variant === "nail-art" ? (
        <path
          d="m24 30 2 6 6 2-6 2-2 6-2-6-6-2 6-2 2-6Z"
          stroke="currentColor"
        />
      ) : (
        <path
          d="M29 31v12"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

interface PhotoProps {
  photo: PhotoModel;
  hero?: boolean;
  className?: string;
}

export function Photo({ photo, hero = false, className = "" }: PhotoProps) {
  const [failed, setFailed] = useState(false);
  const width = hero ? 1400 : 800;
  return (
    <div className={`photo ${className} ${failed ? "photo-fallback" : ""}`}>
      {failed ? (
        <div
          role="img"
          aria-label={`${photo.alt}. La imagen de inspiración no está disponible.`}
        >
          <span className="fallback-monogram" aria-hidden="true">
            g.
          </span>
          <span>Inspiración en cada detalle.</span>
          <small>La imagen no está disponible en este momento</small>
        </div>
      ) : (
        <img
          src={`https://images.unsplash.com/${photo.image}?auto=format&fit=crop&w=${width}&q=85`}
          alt={photo.alt}
          loading={hero ? "eager" : "lazy"}
          fetchPriority={hero ? "high" : "auto"}
          decoding="async"
          width={hero ? 1000 : 800}
          height={hero ? 1200 : 1000}
          style={{ objectPosition: photo.position }}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  children?: ReactNode;
  centered?: boolean;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  children,
  centered = false,
}: SectionHeadingProps) {
  return (
    <div className={`section-heading ${centered ? "centered" : ""}`}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {children}
    </div>
  );
}

interface ServiceCardProps {
  service: Service;
  index: number;
}

export function ServiceCard({ service, index }: ServiceCardProps) {
  return (
    <article className="service-card">
      <div className="service-card-top">
        <NailIcon variant={service.id} />
        <span className="index">0{index + 1}</span>
      </div>
      <p className="micro-label">{service.note}</p>
      <h3>{service.shortName}</h3>
      <p>{service.description}</p>
      <div className="service-card-bottom">
        <div>
          <strong>
            ${service.price}
            <span> / desde</span>
          </strong>
          <small>{service.duration} min · ejemplo</small>
        </div>
        <Link
          className="icon-link"
          to={`/booking?service=${service.id}`}
          aria-label={`Probar la cita para ${service.shortName}`}
        >
          <Arrow diagonal />
        </Link>
      </div>
    </article>
  );
}

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="review-card">
      <div className="review-card-top">
        <span
          className="stars"
          role="img"
          aria-label={`${review.rating} de 5 estrellas`}
        >
          {"★".repeat(review.rating)}
          <span className="empty-stars">{"☆".repeat(5 - review.rating)}</span>
        </span>
        <span className="demo-tag">
          {review.example ? "Reseña de ejemplo" : "Tu demostración local"}
        </span>
      </div>
      <blockquote>“{review.comment}”</blockquote>
      <div className="review-author">
        <span className="review-initial" aria-hidden="true">
          {review.example ? "g" : "y"}
        </span>
        <div>
          <h3>{review.name}</h3>
          <p>{review.style}</p>
        </div>
      </div>
    </article>
  );
}

export function BookingCallout() {
  return (
    <section className="booking-callout">
      <Sparkle />
      <p className="eyebrow">UN MOMENTO PARA TI</p>
      <h2>
        Tu próximo capítulo.
        <br />
        <em>Un nuevo estilo.</em>
      </h2>
      <p>Encuentra tu inspiración. Reserva un pequeño espacio para ti.</p>
      <Link className="button button-light" to="/booking">
        Explora la demostración de cita <Arrow />
      </Link>
      <small>Una vista previa visual. No se crean citas reales.</small>
    </section>
  );
}

interface FieldErrorProps {
  id: string;
  error?: string;
}

export function FieldError({ id, error }: FieldErrorProps) {
  return error ? (
    <span className="field-error" id={`${id}-error`}>
      {error}
    </span>
  ) : null;
}

interface ErrorSummaryProps {
  errors: Record<string, string>;
}

export function ErrorSummary({ errors }: ErrorSummaryProps) {
  return Object.keys(errors).length ? (
    <div className="error-summary" role="alert">
      <strong>Hay un detalle que requiere tu atención.</strong>
      <p>Revisa los campos resaltados a continuación.</p>
    </div>
  ) : null;
}
