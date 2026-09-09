import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Booking, Reviews } from "./forms";

const GOOGLE_CALENDAR_APPOINTMENTS_URL =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ04lNU9EX8RIuRrbaUyWd8jnH7IAIxq9MIWSebI5lJO05QQSgrpNw6kKg2Yy6okKwVWxi59UHyl";

function configureSupabaseReviews(reviews: unknown[] = []) {
  vi.stubEnv("VITE_SUPABASE_URL", "https://project.supabase.co");
  vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "publishable-key");
  const fetchMock = vi.fn((_url: string, init?: RequestInit) => {
    if (init?.method === "POST") {
      return Promise.resolve(new Response(null, { status: 201 }));
    }
    return Promise.resolve(
      new Response(JSON.stringify(reviews), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

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
      screen.getByText("Escribe un nombre de al menos 2 caracteres.", {
        exact: true,
      }),
    ).toBeInTheDocument();
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
    expect(screen.getByLabelText("Tu nombre (obligatorio)")).toHaveFocus();

    const firstStar = screen.getByRole("radio", { name: "1 estrella" });
    // user-event's keyboard {Space} does not activate radios under jsdom;
    // this keydown -> click -> keyup sequence mirrors the user-agent
    // activation that Playwright's e2e tests exercise in a real browser.
    fireEvent.keyDown(firstStar, { key: " " });
    fireEvent.click(firstStar);
    fireEvent.keyUp(firstStar, { key: " " });
    expect(firstStar).toBeChecked();

    await user.type(screen.getByLabelText("Tu nombre (obligatorio)"), "Lucía");
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

  it("submits a valid review as pending and resets the form", async () => {
    const user = userEvent.setup();
    const fetchMock = configureSupabaseReviews();
    renderReviews();

    await user.type(screen.getByLabelText("Tu nombre (obligatorio)"), "Lucía");
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

    expect(
      await screen.findByText(
        "Gracias por compartir tu reseña. La revisaremos antes de publicarla para cuidar este espacio.",
      ),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "https://project.supabase.co/rest/v1/reviews",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            name: "Lucía",
            rating: 5,
            comment,
            status: "pending",
          }),
        }),
      );
    });
    expect(screen.queryAllByRole("article")).toHaveLength(0);
    expect(screen.getByLabelText("Tu nombre (obligatorio)")).toHaveValue("");
    expect(screen.getByLabelText("Tus comentarios (obligatorios)")).toHaveValue(
      "",
    );
    expect(
      screen.getByRole("radio", { name: "5 estrellas" }),
    ).not.toBeChecked();
  });

  it("renders markup inside an approved comment as plain text, never as HTML", async () => {
    const sample =
      "A beautiful sample <img src=x onerror=alert(1)> experience.";
    configureSupabaseReviews([
      {
        id: "review-1",
        name: "Lucía",
        rating: 5,
        comment: sample,
      },
    ]);
    const { container } = renderReviews();

    const firstReview = within(await screen.findByRole("article"));
    expect(container.querySelectorAll("img")).toHaveLength(0);
    expect(firstReview.getByRole("blockquote")).toHaveTextContent(sample);
  });
});
