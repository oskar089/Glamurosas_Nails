import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { Footer, Header } from "./layout";

describe("booking layout copy", () => {
  it("describes Google Calendar booking in the banner and navigation", () => {
    render(
      <MemoryRouter>
        <Header />
        <Footer />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Reservas disponibles por Google Calendar"),
    ).toBeInTheDocument();
    expect(
      within(
        screen.getByRole("navigation", { name: "Navegación principal" }),
      ).getByRole("link", { name: "Solicita tu cita" }),
    ).toHaveAttribute("href", "/booking");
    expect(
      within(screen.getByRole("contentinfo")).getByRole("link", {
        name: "Solicita una cita",
      }),
    ).toHaveAttribute("href", "/booking");
  });
});
