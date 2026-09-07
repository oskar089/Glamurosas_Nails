import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Booking, Reviews } from "./forms";
import { localDateString } from "./services/content";

function localDate(dayOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  return localDateString(date);
}

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

async function fillValidBooking(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Tu nombre"), "Alex Example");
  await user.type(
    screen.getByLabelText("Dirección de correo electrónico"),
    "alex@example.com",
  );
  await user.selectOptions(screen.getByLabelText("Elige tu servicio"), "gel");
  fireEvent.change(screen.getByLabelText("Fecha preferida"), {
    target: { value: localDate(1) },
  });
  await user.selectOptions(screen.getByLabelText("Hora preferida"), "10:30");
}

function mockFetchOk(): ReturnType<typeof vi.fn> {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 201,
    json: async () => ({ id: 42 }),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("Booking", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });
  it("pre-selects a valid service from the query string", () => {
    renderBooking("/booking?service=acrylic");
    expect(screen.getByLabelText("Elige tu servicio")).toHaveValue("acrylic");
    expect(
      screen.getByRole("heading", { name: "Extensiones acrílicas" }),
    ).toBeInTheDocument();
  });

  it("ignores unknown service query values", () => {
    renderBooking("/booking?service=unknown");
    expect(screen.getByLabelText("Elige tu servicio")).toHaveValue("");
  });

  it("sets the minimum date to the browser-local day", () => {
    renderBooking();
    expect(screen.getByLabelText("Fecha preferida")).toHaveAttribute(
      "min",
      localDateString(),
    );
  });

  it("rejects empty and invalid data with accessible exact Spanish errors", async () => {
    const user = userEvent.setup();
    renderBooking();

    await user.click(
      screen.getByRole("button", { name: "Enviar solicitud de cita" }),
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Hay un detalle que requiere tu atención.");
    expect(alert).toHaveTextContent(
      "Revisa los campos resaltados a continuación.",
    );
    expect(
      screen.getByText("Introduce un nombre de al menos 2 caracteres.", {
        exact: true,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Introduce una dirección de correo electrónico válida.",
        {
          exact: true,
        },
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Elige un servicio.", { exact: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Elige una fecha válida.", { exact: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Elige una hora de ejemplo.", { exact: true }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Tu nombre")).toHaveFocus();

    await fillValidBooking(user);
    await user.clear(screen.getByLabelText("Dirección de correo electrónico"));
    await user.type(
      screen.getByLabelText("Dirección de correo electrónico"),
      "invalid-email",
    );
    fireEvent.change(screen.getByLabelText("Fecha preferida"), {
      target: { value: localDate(-1) },
    });
    await user.click(
      screen.getByRole("button", { name: "Enviar solicitud de cita" }),
    );

    expect(
      screen.getByText(
        "Introduce una dirección de correo electrónico válida.",
        {
          exact: true,
        },
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Elige hoy o una fecha futura.", { exact: true }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("SOLICITUD RECIBIDA", { exact: true }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByLabelText("Dirección de correo electrónico"),
    ).toHaveFocus();
  });

  it("sends the booking request to the API, confirms it, and resets the form", async () => {
    const user = userEvent.setup();
    const fetchMock = mockFetchOk();
    renderBooking();
    await fillValidBooking(user);

    await user.click(
      screen.getByRole("button", { name: "Enviar solicitud de cita" }),
    );

    expect(fetchMock).toHaveBeenCalledWith("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Alex Example",
        email: "alex@example.com",
        service: "gel",
        date: localDate(1),
        time: "10:30",
        clientToday: localDateString(new Date()),
      }),
    });

    const status = await screen.findByRole("status");
    expect(status).toHaveTextContent("SOLICITUD RECIBIDA");
    expect(status).toHaveTextContent("Una elección encantadora.");
    expect(status).toHaveTextContent("Confirmaremos la disponibilidad.");
    const expectedDate = new Date(
      `${localDate(1)}T12:00:00`,
    ).toLocaleDateString("es-ES", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    expect(status).toHaveTextContent(
      `Recibimos tu solicitud de cita para Manicura de gel el ${expectedDate} a las 10:30`,
    );
    expect(status).toHaveTextContent("Tu solicitud se guardó correctamente.");
    expect(status).toHaveTextContent(
      "La disponibilidad de la fecha y hora queda pendiente de confirmación.",
    );

    await user.click(
      screen.getByRole("button", { name: "Enviar otra solicitud" }),
    );
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Tu nombre")).toHaveValue("");
    expect(
      screen.getByLabelText("Dirección de correo electrónico"),
    ).toHaveValue("");
    expect(screen.getByLabelText("Elige tu servicio")).toHaveValue("");
  });

  it("shows the server error accessibly and keeps the form values", async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: "Elige un servicio." }),
    });
    vi.stubGlobal("fetch", fetchMock);
    renderBooking();
    await fillValidBooking(user);

    await user.click(
      screen.getByRole("button", { name: "Enviar solicitud de cita" }),
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Elige un servicio.");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Tu nombre")).toHaveValue("Alex Example");
    expect(
      screen.getByLabelText("Dirección de correo electrónico"),
    ).toHaveValue("alex@example.com");
    expect(screen.getByLabelText("Elige tu servicio")).toHaveValue("gel");
  });

  it("disables the submit button and announces the pending state while sending", async () => {
    let resolveFetch: (value: {
      ok: boolean;
      status: number;
      json: () => Promise<{ id: number }>;
    }) => void = () => {};
    const pendingFetch = new Promise<{
      ok: boolean;
      status: number;
      json: () => Promise<{ id: number }>;
    }>((resolve) => {
      resolveFetch = resolve;
    });
    const fetchMock = vi.fn().mockReturnValue(pendingFetch);
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    renderBooking();
    await fillValidBooking(user);

    await user.click(
      screen.getByRole("button", { name: "Enviar solicitud de cita" }),
    );

    const sending = await screen.findByRole("button", {
      name: "Enviando solicitud…",
    });
    expect(sending).toBeDisabled();

    resolveFetch({ ok: true, status: 201, json: async () => ({ id: 1 }) });
    await screen.findByRole("status");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe("Reviews", () => {
  it("starts with the three example reviews in a labeled list", () => {
    renderReviews();
    expect(screen.getAllByRole("article")).toHaveLength(3);
    expect(
      screen.getByRole("list", {
        name: "Reseñas de ejemplo y demostraciones locales",
      }),
    ).toBeInTheDocument();
  });

  it("rejects an empty review with accessible errors and supports keyboard rating", async () => {
    const user = userEvent.setup();
    renderReviews();

    await user.click(
      screen.getByRole("button", { name: "Añadir una reseña de demostración" }),
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
      screen.getByText(
        "Escribe al menos 10 caracteres para tu reseña de demostración.",
        { exact: true },
      ),
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
      screen.getByRole("button", { name: "Añadir una reseña de demostración" }),
    );
    expect(
      screen.getByText(
        "Escribe al menos 10 caracteres para tu reseña de demostración.",
        { exact: true },
      ),
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
      screen.getByRole("button", { name: "Añadir una reseña de demostración" }),
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Tu reseña de demostración se añadió solo a esta página. No se publica y desaparecerá al recargar.",
    );
    const articles = screen.getAllByRole("article");
    expect(articles).toHaveLength(4);
    const firstReview = within(articles[0]);
    expect(firstReview.getByRole("blockquote")).toHaveTextContent(comment);
    expect(
      firstReview.getByRole("img", { name: "5 de 5 estrellas" }),
    ).toBeInTheDocument();
    expect(
      firstReview.getByRole("heading", { name: "Tu reseña de demostración" }),
    ).toBeInTheDocument();
    expect(firstReview.getByText("Tu demostración local")).toBeInTheDocument();
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
      screen.getByRole("button", { name: "Añadir una reseña de demostración" }),
    );

    expect(container.querySelectorAll("img")).toHaveLength(0);
    const firstReview = within(screen.getAllByRole("article")[0]);
    expect(firstReview.getByRole("blockquote")).toHaveTextContent(sample);
  });
});
