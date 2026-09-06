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
      <strong>A little detail needs your attention.</strong>
      <p>Please check the highlighted fields below.</p>
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
        eyebrow="A MOMENT, JUST FOR YOU"
        title={
          <>
            Make room for <em>a little self-care.</em>
          </>
        }
      >
        <p>
          Try the journey from inspiration to your next set.
          <br />
          This is a booking preview, not a real appointment request.
        </p>
      </FormIntro>
      <section
        className="container booking-layout page-section"
        aria-label="Booking demo"
      >
        <aside className="booking-aside">
          <div className="booking-aside-art">
            <NailIcon variant={selectedService?.id || "classic"} />
            <Sparkle />
          </div>
          <p className="eyebrow">YOUR LITTLE RITUAL</p>
          <h2>
            {selectedService ? (
              selectedService.shortName
            ) : (
              <>
                A fresh set.
                <br />
                <em>A fresh feeling.</em>
              </>
            )}
          </h2>
          <p>
            {selectedService
              ? selectedService.description
              : "Choose a service to explore your own moment of polish, personality, and possibility."}
          </p>
          {selectedService && (
            <div className="booking-estimate">
              <strong>From ${selectedService.price}</strong>
              <span>
                {selectedService.duration} min · illustrative USD price
              </span>
            </div>
          )}
          <div className="privacy-note">
            <Sparkle />
            <div>
              <h3>Just a preview. Always private.</h3>
              <p>
                No appointment is saved or sent. No calendar event or email is
                created. Your form details stay in this page’s memory and are
                cleared after a valid submission or when you leave.
              </p>
            </div>
          </div>
          <Link className="text-link" to="/services">
            Take another look at services <Arrow />
          </Link>
        </aside>
        <div className="form-panel">
          {confirmation ? (
            <div className="confirmation" role="status">
              <span className="confirmation-icon" aria-hidden="true">
                ✓
              </span>
              <p className="eyebrow">DEMO COMPLETE</p>
              <h2>
                A lovely choice.
                <br />
                <em>Just a preview.</em>
              </h2>
              <p>
                You tried the booking experience for{" "}
                <strong>{confirmation.service}</strong> on{" "}
                <strong>
                  {new Date(`${confirmation.date}T12:00:00`).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" },
                  )}
                </strong>{" "}
                at <strong>{confirmation.time}</strong>.
              </p>
              <div className="notice">
                <p>
                  <strong>No appointment was saved, sent, or reserved.</strong>{" "}
                  No calendar event or email was created. Your name and email
                  have been cleared from the form.
                </p>
              </div>
              <button className="button" onClick={() => setConfirmation(null)}>
                Try another demo <Arrow />
              </button>
            </div>
          ) : (
            <form ref={formRef} noValidate onSubmit={submit}>
              <div className="form-heading">
                <span className="step-label">01 — YOUR MOMENT</span>
                <span className="demo-tag">Demo only</span>
              </div>
              <h2>The little details</h2>
              <p className="form-description">
                All fields are required. Please use sample details.
              </p>
              <ErrorSummary
                errors={Object.fromEntries(
                  Object.entries(errors).filter(([, error]) => error),
                )}
              />
              <div className="field">
                <label htmlFor="name">Your name</label>
                <input
                  {...fieldProps("name")}
                  type="text"
                  placeholder="e.g. Alex Taylor"
                  autoComplete="off"
                  maxLength={100}
                />
                <FieldError id="name" error={errors.name} />
              </div>
              <div className="field">
                <label htmlFor="email">Email address</label>
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
                <label htmlFor="service">Choose your service</label>
                <select {...fieldProps("service")}>
                  <option value="">Find your perfect finish</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.shortName} · from ${service.price}
                      {service.id === "nail-art" ? " (add-on)" : ""}
                    </option>
                  ))}
                </select>
                <FieldError id="service" error={errors.service} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label htmlFor="date">Preferred date</label>
                  <input {...fieldProps("date")} type="date" min={today} />
                  <FieldError id="date" error={errors.date} />
                </div>
                <div className="field">
                  <label htmlFor="time">Example time</label>
                  <select {...fieldProps("time")}>
                    <option value="">Choose a time</option>
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
                Times are examples, not salon hours or real availability.
              </p>
              <button type="submit" className="button button-full">
                Preview my appointment <Arrow diagonal />
              </button>
              <p className="submit-note">
                This does not book, send, or save an appointment.
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
      nextErrors.rating = "Choose a rating from 1 to 5 stars.";
    if (comment.trim().length < 10)
      nextErrors.comment = "Write at least 10 characters for your demo review.";
    if (comment.trim().length > 600)
      nextErrors.comment = "Keep your demo review under 600 characters.";
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
      name: "Your demo review",
      rating,
      comment: comment.trim(),
      style: "Visible only in this browser session",
      example: false,
    });
    setRating(0);
    setComment("");
    setSubmitted(true);
  }
  return (
    <>
      <FormIntro
        eyebrow="LITTLE WORDS, LOVELY FEELINGS"
        title={
          <>
            A space for <em>your stories.</em>
          </>
        }
      >
        <p>
          Every little ritual has a story.
          <br />
          Explore the examples below, or try leaving a demo review.
        </p>
      </FormIntro>
      <section className="container page-section">
        <div className="notice">
          <Sparkle />
          <p>
            <strong>These are example reviews, not real testimonials.</strong>{" "}
            No verified clients or real customer ratings are represented. Your
            demo review is not published and disappears when the page is
            reloaded.
          </p>
        </div>
        <div className="reviews-layout">
          <div
            className="reviews-list"
            aria-label="Example and local demo reviews"
          >
            {[...localReviews, ...exampleReviews].map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
          <div className="form-panel review-form-panel">
            <form noValidate onSubmit={submit} ref={formRef}>
              <p className="eyebrow">TRY THE EXPERIENCE</p>
              <h2>A few lovely words</h2>
              <p className="form-description">
                Use sample content only. Your rating and comment stay in memory,
                are never sent, and are lost on reload.
              </p>
              {submitted && (
                <div className="success-note" role="status">
                  Your demo review has been added to this page only. It is not
                  published and will disappear on reload.
                </div>
              )}
              <ErrorSummary errors={errors} />
              <fieldset
                className="rating-field"
                aria-describedby={errors.rating ? "rating-error" : undefined}
              >
                <legend>Your rating (required)</legend>
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
                        aria-label={`${value} ${value === 1 ? "star" : "stars"}`}
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
                <label htmlFor="comment">Your thoughts (required)</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={comment}
                  onChange={(event) => {
                    setComment(event.target.value);
                    setSubmitted(false);
                  }}
                  placeholder="What would make your ideal nail-care experience special?"
                  rows={5}
                  maxLength={600}
                  required
                  aria-invalid={Boolean(errors.comment)}
                  aria-describedby={`comment-hint${errors.comment ? " comment-error" : ""}`}
                />
                <div className="textarea-caption">
                  <span id="comment-hint">
                    10–600 characters. Please omit personal details.
                  </span>
                  <span>{comment.length}/600</span>
                </div>
                <FieldError id="comment" error={errors.comment} />
              </div>
              <button className="button button-full" type="submit">
                Add a demo review <Arrow />
              </button>
              <p className="submit-note">
                A local preview only. Nothing is published.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
