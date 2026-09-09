import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import {
  type AdminSession,
  clearAdminSession,
  getAdminSession,
  getPendingReviews,
  type PendingReview,
  signInAdmin,
  updateReviewStatus,
} from "./services/admin-reviews";

export function AdminReviews() {
  const [session, setSession] = useState<AdminSession | null>(() =>
    getAdminSession(),
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    getPendingReviews(session)
      .then((pendingReviews) => {
        setReviews(pendingReviews);
        setError(null);
      })
      .catch((loadError: unknown) => {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No se pudieron cargar las reseñas pendientes.",
        );
      });
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
    review: PendingReview,
    status: "approved" | "rejected",
  ) => {
    if (!session) return;
    setBusyId(review.id);
    setError(null);
    updateReviewStatus(session, review.id, status)
      .then(() => {
        setReviews((current) =>
          current.filter((item) => item.id !== review.id),
        );
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

  const handleLogout = () => {
    clearAdminSession();
    setSession(null);
    setReviews([]);
    setMessage(null);
    setError(null);
  };

  if (!session) {
    return (
      <section className="container page-section">
        <div className="form-panel">
          <p className="eyebrow">PANEL PRIVADO</p>
          <h1>Administrar reseñas</h1>
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
        <h1>Reseñas pendientes</h1>
        <p className="form-description">
          Sesión iniciada como {session.email}. Revisá cada reseña antes de
          publicarla.
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
        {reviews.length === 0 ? (
          <p className="section-note">No hay reseñas pendientes.</p>
        ) : (
          <ul className="reviews-list" aria-label="Reseñas pendientes">
            {reviews.map((review) => (
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
      </div>
    </section>
  );
}
