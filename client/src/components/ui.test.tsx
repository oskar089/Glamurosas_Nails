import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { Photo as PhotoModel, Review, Service } from "../models/types";
import {
  BookingCallout,
  ErrorSummary,
  FieldError,
  Photo,
  ReviewCard,
  ServiceCard,
} from "./ui";

const service: Service = {
  id: "gel",
  name: "El gel distintivo",
  shortName: "Manicura de gel",
  description: "Tu día a día, realzado. Un acabado de gel brillante.",
  price: 38,
  duration: 60,
  note: "UN BRILLO EXTRA",
};

const photo: PhotoModel = {
  id: "soft-statement",
  image: "photo-1604654894610-df63bc536371",
  title: "Una declaración sutil",
  category: "gel",
  alt: "Manicura negra con uñas de acento carey",
  position: "center",
};

describe("Photo", () => {
  it("renders the image with its alt text and lazy loading by default", () => {
    const { container } = render(<Photo photo={photo} />);
    const image = screen.getByAltText(photo.alt);
    expect(image).toHaveAttribute(
      "src",
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=85",
    );
    expect(image).toHaveAttribute("loading", "lazy");
    expect(image).toHaveAttribute("decoding", "async");
    expect(container.firstChild).toHaveClass("photo");
  });

  it("loads eagerly with high priority for the hero", () => {
    render(<Photo photo={photo} hero />);
    const image = screen.getByAltText(photo.alt);
    expect(image).toHaveAttribute("loading", "eager");
    expect(image).toHaveAttribute("fetchpriority", "high");
  });

  it("swaps to a stable, labeled fallback when the image fails to load", () => {
    const { container } = render(<Photo photo={photo} />);
    fireEvent.error(screen.getByAltText(photo.alt));

    const fallback = screen.getByRole("img", {
      name: `${photo.alt}. La imagen de inspiración no está disponible.`,
    });
    expect(fallback).toBeInTheDocument();
    expect(fallback).toHaveAttribute(
      "aria-label",
      `${photo.alt}. La imagen de inspiración no está disponible.`,
    );
    expect(
      screen.getByText("Inspiración en cada detalle."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("La imagen no está disponible en este momento", {
        exact: true,
      }),
    ).toBeInTheDocument();
    expect(screen.queryByAltText(photo.alt)).not.toBeInTheDocument();
    expect(container.firstChild).toHaveClass("photo-fallback");
  });
});

describe("ServiceCard", () => {
  it("renders service copy without price or duration and a labeled booking link", () => {
    render(
      <MemoryRouter>
        <ServiceCard service={service} index={2} />
      </MemoryRouter>,
    );

    const card = screen.getByRole("article");
    expect(card).toHaveTextContent("Manicura de gel");
    expect(card).toHaveTextContent("UN BRILLO EXTRA");
    expect(card).not.toHaveTextContent(/\$38|USD|desde|60 min|duración/i);
    expect(card).toHaveTextContent("03");

    const link = screen.getByRole("link", {
      name: "Probar la cita para Manicura de gel",
    });
    expect(link).toHaveAttribute("href", "/booking?service=gel");
  });
});

describe("ReviewCard", () => {
  it("exposes the rating through a labeled img role and example tag", () => {
    const review: Review = {
      id: "example-1",
      name: "Una pausa cotidiana",
      rating: 5,
      comment: "Un momento para bajar el ritmo.",
      style: "Manicura clásica",
      example: true,
    };
    render(<ReviewCard review={review} />);

    const card = screen.getByRole("article");
    expect(card).toHaveTextContent("Un momento para bajar el ritmo.");
    expect(card).toHaveTextContent("Una pausa cotidiana");
    expect(card).toHaveTextContent("Manicura clásica");
    expect(card).toHaveTextContent("Reseña de ejemplo");
    expect(
      screen.getByRole("img", { name: "5 de 5 estrellas" }),
    ).toBeInTheDocument();
  });

  it("marks local reviews as demonstrations, not examples", () => {
    const review: Review = {
      id: "local-1",
      name: "Tu reseña de demostración",
      rating: 4,
      comment: "Un detalle precioso.",
      style: "Visible solo en esta sesión del navegador",
      example: false,
    };
    render(<ReviewCard review={review} />);

    expect(screen.getByRole("article")).toHaveTextContent(
      "Tu demostración local",
    );
    expect(
      screen.getByRole("img", { name: "4 de 5 estrellas" }),
    ).toBeInTheDocument();
  });
});

describe("BookingCallout", () => {
  it("directs visitors to Google Calendar availability through the booking page", () => {
    render(
      <MemoryRouter>
        <BookingCallout />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("link", { name: "Solicita una cita" }),
    ).toHaveAttribute("href", "/booking");
    expect(
      screen.getByText(/Consulta y reserva los horarios disponibles/),
    ).toHaveTextContent(
      "Consulta y reserva los horarios disponibles directamente en Google Calendar.",
    );
  });
});

describe("FieldError", () => {
  it("renders nothing when there is no error", () => {
    const { container } = render(<FieldError id="name" />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders the message with the id-derived element id", () => {
    render(<FieldError id="email" error="Un mensaje de prueba" />);
    const message = screen.getByText("Un mensaje de prueba");
    expect(message).toHaveClass("field-error");
    expect(message).toHaveAttribute("id", "email-error");
  });
});

describe("ErrorSummary", () => {
  it("renders nothing without errors", () => {
    const { container } = render(<ErrorSummary errors={{}} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("announces the exact Spanish copy through role alert", () => {
    render(<ErrorSummary errors={{ name: "fallo" }} />);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Hay un detalle que requiere tu atención.");
    expect(alert).toHaveTextContent(
      "Revisa los campos resaltados a continuación.",
    );
  });
});
