import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { App } from "./pages";

function renderApp(entry: string) {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <App />
    </MemoryRouter>,
  );
}

describe("Gallery filters", () => {
  it("exposes every filter as a type=button toggle with exact counts", async () => {
    const user = userEvent.setup();
    renderApp("/gallery");

    const group = screen.getByRole("group", {
      name: "Filtrar la inspiración por estilo",
    });
    const filters = within(group).getAllByRole("button");
    expect(filters).toHaveLength(5);
    for (const filter of filters) {
      expect(filter).toHaveAttribute("type", "button");
    }

    expect(screen.getAllByRole("figure")).toHaveLength(6);
    expect(screen.getByRole("status")).toHaveTextContent(
      "6 imágenes de inspiración",
    );
    expect(
      within(group).getByRole("button", { name: "Toda la inspiración" }),
    ).toHaveAttribute("aria-pressed", "true");

    await user.click(within(group).getByRole("button", { name: "Acrílico" }));
    expect(
      within(group).getByRole("button", { name: "Acrílico" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByRole("figure")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent(
      "1 imagen de inspiración",
    );

    await user.click(within(group).getByRole("button", { name: "Gel" }));
    expect(screen.getAllByRole("figure")).toHaveLength(2);
    expect(screen.getByRole("status")).toHaveTextContent(
      "2 imágenes de inspiración",
    );
  });

  it("pre-selects the category from the query string", () => {
    renderApp("/gallery?category=classic");
    expect(screen.getAllByRole("figure")).toHaveLength(1);
    expect(
      within(
        screen.getByRole("group", {
          name: "Filtrar la inspiración por estilo",
        }),
      ).getByRole("button", { name: "Clásica" }),
    ).toHaveAttribute("aria-pressed", "true");
  });
});

describe("Header navigation", () => {
  it("toggles the mobile menu with the keyboard and closes on Escape", async () => {
    const user = userEvent.setup();
    renderApp("/gallery");

    const toggle = screen.getByRole("button", {
      name: "Abrir menú de navegación",
    });
    expect(toggle).toHaveAttribute("type", "button");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByRole("navigation", { name: "Navegación principal" }),
    ).toBeInTheDocument();

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(
      screen.getByRole("button", { name: "Cerrar menú de navegación" }),
    ).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveFocus();
  });
});

describe("Google Calendar booking copy", () => {
  it("directs service-page visitors to Google Calendar availability", () => {
    renderApp("/services");

    expect(screen.getByText(/Cuando estés lista/)).toHaveTextContent(
      "Usa la galería para explorar formas, colores y detalles. Cuando estés lista, consulta y reserva los horarios disponibles en Google Calendar.",
    );
  });

  it("shows the real contact area, WhatsApp and opening hours", () => {
    renderApp("/contact");

    expect(screen.getByText("Zona Amate")).toBeInTheDocument();
    expect(screen.getByText("De 9:30 a. m. a 6:00 p. m.")).toBeInTheDocument();
    for (const whatsappLink of screen.getAllByRole("link", {
      name: "WhatsApp 643 521 975",
    })) {
      expect(whatsappLink).toHaveAttribute("href", "https://wa.me/34643521975");
    }
    for (const instagramLink of screen.getAllByRole("link", {
      name: "Instagram @nailskarent.sevilla",
    })) {
      expect(instagramLink).toHaveAttribute(
        "href",
        "https://www.instagram.com/nailskarent.sevilla/",
      );
    }
    expect(
      screen.getAllByRole("link", { name: "Solicita tu cita" }),
    ).toHaveLength(2);
  });
});
