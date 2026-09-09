import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Booking, Reviews } from "./forms";

const GOOGLE_CALENDAR_APPOINTMENTS_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ04lNU9EX8RIuRrbaUyWd8jnH7IAIxq9MIWSebI5lJO05QQSgrpNw6kKg2Yy6okKwVWxi59UHyl";

function renderBooking(entry = "/booking") {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Booking />
    </MemoryRouter>,
  );
}

function renderReviews() {
  return render(
    <MemoryRouter initialEntries={["/reviews"]}>
      <Reviews />
    </MemoryRouter>,
  );
}

describe("Booking", () => {
  it("links to Google Calendar for appointment availability", () => {
    renderBooking();

    const calendarLink = screen.getByRole("link", {
      name: "Ver disponibilidad en Google Calendar",
    });
    expect(calendarLink).toHaveAttribute(
      "href",
      GOOGLE_CALENDAR_APPOINTMENTS_URL,
    );
    expect(calendarLink).toHaveAttribute("target", "_blank");
    expect(
      screen.getByText(/Google Calendar muestra los horarios disponibles/),
    ).toBeInTheDocument();
  });

  it("keeps a valid service preselection in the booking copy", () => {
    renderBooking("/booking?service=acrylic");
    expect(
      screen.getByRole("heading", { name: "Acrílicas" }),
    ).toBeInTheDocument();
  });

  it("does not render a local booking form", () => {
    renderBooking("/booking?service=unknown");

    expect(screen.queryByRole("form")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Tu nombre")).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Dirección de correo electrónico"),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Fecha preferida")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Hora preferida")).not.toBeInTheDocument();
  });
});

describe("Reviews", () => {
  it("starts without example reviews and invites the first real review", () => {
    renderReviews();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(
      screen.getByText(
        "Todavía no hay reseñas visibles. Sé la primera persona en dejar unas palabras bonitas sobre tu experiencia.",
      ),
    ).toBeInTheDocument();
  });

  it("rejects an empty review with accessible errors and supports keyboard rating", async () => {
    const user = userEvent.setup();
    renderReviews();

    await user.click(
      screen.getByRole("button", { name: "Compartir mi experiencia" }),
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Hay un detalle que requiere tu atención.",
    );
    expect(
      screen.getByText("Elige una valoración de 1 a 5 estrellas.", {
        exact: true,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Escribe al menos 10 caracteres para tu reseña.", {
        exact: true,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "1 estrella" })).toHaveFocus();

    const firstStar = screen.getByRole("radio", { name: "1 estrella" });
    expect(firstStar).toHaveFocus();
    // user-event's keyboard {Space} does not activate radios under jsdom;
    // this keydown -> click -> keyup sequence mirrors the user-agent
    // activation that Playwright's e2e tests exercise in a real browser.
    fireEvent.keyDown(firstStar, { key: " " });
    fireEvent.click(firstStar);
    fireEvent.keyUp(firstStar, { key: " " });
    expect(firstStar).toBeChecked();

    await user.type(
      screen.getByLabelText("Tus comentarios (obligatorios)"),
      "Short",
    );
    await user.click(
      screen.getByRole("button", { name: "Compartir mi experiencia" }),
    );
    expect(
      screen.getByText("Escribe al menos 10 caracteres para tu reseña.", {
        exact: true,
      }),
    ).toBeInTheDocument();
  });

  it("adds a valid review locally, announces it, and resets the form", async () => {
    const user = userEvent.setup();
    renderReviews();

    await user.click(screen.getByRole("radio", { name: "5 estrellas" }));
    const comment = "Un detalle precioso y muy cuidado.";
    await user.type(
      screen.getByLabelText("Tus comentarios (obligatorios)"),
      comment,
    );
    expect(screen.getByText(`${comment.length}/600`)).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Compartir mi experiencia" }),
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Gracias por compartir tu reseña. Tus palabras ya forman parte de esta experiencia.",
    );
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(1);
    const firstReview = within(articles[0]);
    expect(firstReview.getByRole("blockquote")).toHaveTextContent(comment);
    expect(
      firstReview.getByRole("img", { name: "5 de 5 estrellas" }),
    ).toBeInTheDocument();
    expect(
      firstReview.getByRole("heading", { name: "Tu reseña" }),
    ).toBeInTheDocument();
    expect(firstReview.getByText("Reseña compartida")).toBeInTheDocument();
    expect(screen.getByLabelText("Tus comentarios (obligatorios)")).toHaveValue(
      "",
    );
    expect(
      screen.getByRole("radio", { name: "5 estrellas" }),
    ).not.toBeChecked();
  });

  it("renders markup inside a comment as plain text, never as HTML", async () => {
    const user = userEvent.setup();
    const { container } = renderReviews();

    const sample =
      "A beautiful sample <img src=x onerror=alert(1)> experience.";
    await user.click(screen.getByRole("radio", { name: "5 estrellas" }));
    await user.type(
      screen.getByLabelText("Tus comentarios (obligatorios)"),
      sample,
    );
    await user.click(
      screen.getByRole("button", { name: "Compartir mi experiencia" }),
    );

    expect(container.querySelectorAll("img")).toHaveLength(0);
    const firstReview = within(screen.getAllByRole("article")[0]);
    expect(firstReview.getByRole("blockquote")).toHaveTextContent(sample);
  });
});
