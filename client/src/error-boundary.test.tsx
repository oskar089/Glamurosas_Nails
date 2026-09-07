import { render, screen } from "@testing-library/react";
import { ErrorBoundary } from "react-error-boundary";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppErrorFallback } from "./error-boundary";

function ThrowingChild(): never {
  throw new Error("fallo controlado en la prueba");
}

describe("AppErrorFallback", () => {
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the Spanish fallback with role alert when a child throws", () => {
    render(
      <MemoryRouter>
        <ErrorBoundary FallbackComponent={AppErrorFallback}>
          <ThrowingChild />
        </ErrorBoundary>
      </MemoryRouter>,
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("ALGO SE INTERRUMPIÓ");
    expect(alert).toHaveTextContent("Un pequeño tropiezo.");
    expect(alert).toHaveTextContent(
      "Nada que tu próxima visita no pueda arreglar.",
    );
    expect(alert).toHaveTextContent(
      "Algo salió mal al mostrar esta página. Vuelve al inicio para seguir explorando la inspiración.",
    );
    expect(
      screen.getByRole("link", { name: "Volver al inicio" }),
    ).toHaveAttribute("href", "/");
  });
});
