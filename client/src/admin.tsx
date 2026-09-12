import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
  type AdminBookingRequest,
  getPendingBookingRequests,
  updateBookingRequestStatus,
} from "./services/admin-bookings";
import {
  type AdminReview,
  type AdminSession,
  clearAdminSession,
  getAdminSession,
  getPendingReviews,
  getPublishedReviews,
  signInAdmin,
  updateReviewStatus,
} from "./services/admin-reviews";

export function AdminReviews() {
  const [session, setSession] = useState<AdminSession | null>(() =>
    getAdminSession(),
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingBookingRequests, setPendingBookingRequests] = useState<
    AdminBookingRequest[]
  >([]);
  const [pendingReviews, setPendingReviews] = useState<AdminReview[]>([]);
  const [publishedReviews, setPublishedReviews] = useState<AdminReview[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    Promise.allSettled([
      getPendingBookingRequests(session),
      getPendingReviews(session),
      getPublishedReviews(session),
    ]).then(
      ([
        bookingRequestsResult,
        pendingReviewsResult,
        publishedReviewsResult,
      ]) => {
        if (bookingRequestsResult.status === "fulfilled") {
          setPendingBookingRequests(bookingRequestsResult.value);
        }
        if (pendingReviewsResult.status === "fulfilled") {
          setPendingReviews(pendingReviewsResult.value);
        }
        if (publishedReviewsResult.status === "fulfilled") {
          setPublishedReviews(publishedReviewsResult.value);
        }

        const firstRejectedResult = [
          bookingRequestsResult,
          pendingReviewsResult,
          publishedReviewsResult,
        ].find((result) => result.status === "rejected");
        setError(
          firstRejectedResult?.status === "rejected"
            ? firstRejectedResult.reason instanceof Error
              ? firstRejectedResult.reason.message
              : "No se pudo cargar una parte del panel de administración."
            : null,
        );
      },
    );
  }, [session]);

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    signInAdmin(email, password)
      .then((adminSession) => {
        setSession(adminSession);
        setPassword("");
      })
      .catch((loginError: unknown) => {
        setError(
          loginError instanceof Error
            ? loginError.message
            : "No se pudo iniciar sesión.",
        );
      });
  };

  const handleModeration = (
    review: AdminReview,
    status: "approved" | "rejected",
  ) => {
    if (!session) return;
    setBusyId(review.id);
    setError(null);
    updateReviewStatus(session, review.id, status)
      .then(() => {
        setPendingReviews((current) =>
          current.filter((item) => item.id !== review.id),
        );
        setPublishedReviews((current) => {
          const withoutReview = current.filter((item) => item.id !== review.id);
          return status === "approved"
            ? [{ ...review, status: "approved" }, ...withoutReview]
            : withoutReview;
        });
        setMessage(
          status === "approved"
            ? "Reseña aprobada y publicada."
            : "Reseña rechazada.",
        );
      })
      .catch((moderationError: unknown) => {
        setError(
          moderationError instanceof Error
            ? moderationError.message
            : "No se pudo actualizar la reseña.",
        );
      })
      .finally(() => setBusyId(null));
  };

  const handleBookingRequestUpdate = (
    request: AdminBookingRequest,
    status: "followed_up" | "closed",
  ) => {
    if (!session) return;
    setBusyId(request.id);
    setError(null);
    setMessage(null);
    updateBookingRequestStatus(session, request.id, status)
      .then(() => {
        setPendingBookingRequests((current) =>
          current.filter((item) => item.id !== request.id),
        );
        setMessage(
          status === "followed_up"
            ? "Solicitud marcada como contactada."
            : "Solicitud cerrada.",
        );
      })
      .catch((bookingRequestError: unknown) => {
        setError(
          bookingRequestError instanceof Error
            ? bookingRequestError.message
            : "No se pudo actualizar la solicitud de reserva.",
        );
      })
      .finally(() => setBusyId(null));
  };

  const handleLogout = () => {
    clearAdminSession();
    setSession(null);
    setPendingBookingRequests([]);
    setPendingReviews([]);
    setPublishedReviews([]);
    setMessage(null);
    setError(null);
  };

  if (!session) {
    return (
      <section className="container page-section">
        <div className="form-panel">
          <p className="eyebrow">PANEL PRIVADO</p>
          <h1>Administrar reseñas y reservas</h1>
          <p className="form-description">
            Iniciá sesión para aprobar o rechazar las reseñas pendientes.
          </p>
          {error && (
            <div className="error-summary" role="alert">
              {error}
            </div>
          )}
          <form noValidate onSubmit={handleLogin}>
            <div className="field">
              <label htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="admin-password">Contraseña</label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            <button className="button button-full" type="submit">
              Entrar al panel
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="container page-section">
      <div className="form-panel">
        <p className="eyebrow">PANEL PRIVADO</p>
        <h1>Panel de administración</h1>
        <p className="form-description">
          Sesión iniciada como {session.email}. Revisá las solicitudes de
          reserva y moderá las reseñas antes de publicarlas.
        </p>
        <button
          className="button button-small"
          type="button"
          onClick={handleLogout}
        >
          Cerrar sesión
        </button>
        {message && (
          <div className="success-note" role="status">
            {message}
          </div>
        )}
        {error && (
          <div className="error-summary" role="alert">
            {error}
          </div>
        )}
        <h2>Solicitudes de reserva pendientes</h2>
        {pendingBookingRequests.length === 0 ? (
          <p className="section-note">
            No hay solicitudes de reserva pendientes.
          </p>
        ) : (
          <ul
            className="booking-request-list"
            aria-label="Solicitudes de reserva pendientes"
          >
            {pendingBookingRequests.map((request) => (
              <li key={request.id}>
                <article className="booking-request-card">
                  <div className="review-card-top">
                    <h3>{request.name}</h3>
                    <span className="demo-tag">Pendiente</span>
                  </div>
                  <dl>
                    <div>
                      <dt>Servicio</dt>
                      <dd>{request.service}</dd>
                    </div>
                    <div>
                      <dt>Contacto</dt>
                      <dd>
                        <a href={`mailto:${request.email}`}>{request.email}</a>
                        <br />
                        <a href={`tel:${request.phone}`}>{request.phone}</a>
                      </dd>
                    </div>
                    <div>
                      <dt>Recibida</dt>
                      <dd>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </dd>
                    </div>
                    <div>
                      <dt>Notas</dt>
                      <dd>{request.notes}</dd>
                    </div>
                  </dl>
                  <div className="form-actions">
                    <button
                      className="button button-small"
                      type="button"
                      disabled={busyId === request.id}
                      onClick={() =>
                        handleBookingRequestUpdate(request, "followed_up")
                      }
                    >
                      Marcar contactada
                    </button>
                    <button
                      className="button button-small button-secondary"
                      type="button"
                      disabled={busyId === request.id}
                      onClick={() =>
                        handleBookingRequestUpdate(request, "closed")
                      }
                    >
                      Cerrar solicitud
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
        <h2>Reseñas pendientes</h2>
        {pendingReviews.length === 0 ? (
          <p className="section-note">No hay reseñas pendientes.</p>
        ) : (
          <ul className="reviews-list" aria-label="Reseñas pendientes">
            {pendingReviews.map((review) => (
              <li key={review.id}>
                <article className="review-card">
                  <div className="review-card-top">
                    <span
                      className="stars"
                      role="img"
                      aria-label={`${review.rating} de 5 estrellas`}
                    >
                      {"★".repeat(review.rating)}
                      <span className="empty-stars">
                        {"☆".repeat(5 - review.rating)}
                      </span>
                    </span>
                    <span className="demo-tag">Pendiente</span>
                  </div>
                  <blockquote>“{review.comment}”</blockquote>
                  <div className="review-author">
                    <span className="review-initial" aria-hidden="true">
                      {review.name.charAt(0).toLowerCase()}
                    </span>
                    <div>
                      <h2>{review.name}</h2>
                      <p>{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button
                      className="button button-small"
                      type="button"
                      disabled={busyId === review.id}
                      onClick={() => handleModeration(review, "approved")}
                    >
                      Aprobar
                    </button>
                    <button
                      className="button button-small button-secondary"
                      type="button"
                      disabled={busyId === review.id}
                      onClick={() => handleModeration(review, "rejected")}
                    >
                      Rechazar
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
        <h2>Reseñas publicadas</h2>
        {publishedReviews.length === 0 ? (
          <p className="section-note">No hay reseñas publicadas.</p>
        ) : (
          <ul className="reviews-list" aria-label="Reseñas publicadas">
            {publishedReviews.map((review) => (
              <li key={review.id}>
                <article className="review-card">
                  <div className="review-card-top">
                    <span
                      className="stars"
                      role="img"
                      aria-label={`${review.rating} de 5 estrellas`}
                    >
                      {"★".repeat(review.rating)}
                      <span className="empty-stars">
                        {"☆".repeat(5 - review.rating)}
                      </span>
                    </span>
                    <span className="demo-tag">Publicada</span>
                  </div>
                  <blockquote>“{review.comment}”</blockquote>
                  <div className="review-author">
                    <span className="review-initial" aria-hidden="true">
                      {review.name.charAt(0).toLowerCase()}
                    </span>
                    <div>
                      <h2>{review.name}</h2>
                      <p>{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="form-actions">
                    <button
                      className="button button-small button-secondary"
                      type="button"
                      disabled={busyId === review.id}
                      onClick={() => handleModeration(review, "rejected")}
                    >
                      Ocultar reseña
                    </button>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
