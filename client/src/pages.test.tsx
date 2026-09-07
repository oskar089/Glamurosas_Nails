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

describe("Booking request copy", () => {
  it("describes service-page requests as pending availability confirmation", () => {
    renderApp("/services");

    expect(screen.getByText(/Puedes solicitar una cita/)).toHaveTextContent(
      "Usa la galería para explorar formas, colores y detalles. Puedes solicitar una cita eligiendo un servicio, una fecha y una hora. La solicitud se registra y queda pendiente de confirmación de disponibilidad.",
    );
  });

  it("describes contact-page requests as available and pending confirmation", () => {
    renderApp("/contact");

    expect(
      screen.getByText(
        "Solicitudes de cita disponibles, pendientes de confirmación",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: "Solicita tu cita" }),
    ).toHaveLength(2);
    expect(
      screen.getByText(/Las solicitudes de cita se registran/),
    ).toHaveTextContent(
      "Las solicitudes de cita se registran y quedan pendientes de confirmación de disponibilidad.",
    );
  });
});
