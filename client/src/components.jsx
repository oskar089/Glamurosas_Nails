import { useState } from "react";
import { Link } from "react-router-dom";

export function Arrow({ diagonal = false }) {
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

export function Sparkle({ className = "" }) {
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

export function NailIcon({ variant = "classic" }) {
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

export function Photo({ photo, hero = false, className = "" }) {
  const [failed, setFailed] = useState(false);
  const width = hero ? 1400 : 800;
  return (
    <div className={`photo ${className} ${failed ? "photo-fallback" : ""}`}>
      {failed ? (
        <div
          role="img"
          aria-label={`${photo.alt}. Inspiration photo unavailable.`}
        >
          <span className="fallback-monogram" aria-hidden="true">
            g.
          </span>
          <span>Inspiration, in every detail.</span>
          <small>Photo currently unavailable</small>
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

export function SectionHeading({
  eyebrow,
  title,
  description,
  children,
  centered = false,
}) {
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

export function ServiceCard({ service, index }) {
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
            <span> / from</span>
          </strong>
          <small>{service.duration} min · example</small>
        </div>
        <Link
          className="icon-link"
          to={`/booking?service=${service.id}`}
          aria-label={`Try booking ${service.shortName}`}
        >
          <Arrow diagonal />
        </Link>
      </div>
    </article>
  );
}

export function ReviewCard({ review }) {
  return (
    <article className="review-card">
      <div className="review-card-top">
        <span
          className="stars"
          role="img"
          aria-label={`${review.rating} out of 5 stars`}
        >
          {"★".repeat(review.rating)}
          <span className="empty-stars">{"☆".repeat(5 - review.rating)}</span>
        </span>
        <span className="demo-tag">
          {review.example ? "Example review" : "Your local demo"}
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
      <p className="eyebrow">A MOMENT, JUST FOR YOU</p>
      <h2>
        Your next chapter.
        <br />
        <em>A fresh set.</em>
      </h2>
      <p>Find your inspiration. Make a little space for yourself.</p>
      <Link className="button button-light" to="/booking">
        Explore the booking demo <Arrow />
      </Link>
      <small>A visual preview. No real appointments are created.</small>
    </section>
  );
}
