import type { FormEvent } from "react";
import { useEffect, useState } from "react";
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
  const [pendingReviews, setPendingReviews] = useState<AdminReview[]>([]);
  const [publishedReviews, setPublishedReviews] = useState<AdminReview[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    Promise.all([getPendingReviews(session), getPublishedReviews(session)])
      .then(([loadedPendingReviews, loadedPublishedReviews]) => {
        setPendingReviews(loadedPendingReviews);
        setPublishedReviews(loadedPublishedReviews);
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

  const handleLogout = () => {
    clearAdminSession();
    setSession(null);
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
