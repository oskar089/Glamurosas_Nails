import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Arrow, Sparkle } from "./ui";

export const NAVIGATION = [
  { to: "/", label: "Inicio" },
  { to: "/services", label: "Servicios" },
  { to: "/gallery", label: "Galería" },
  { to: "/reviews", label: "Reseñas" },
  { to: "/contact", label: "Contacto" },
] as const;

export function Wordmark() {
  return (
    <Link
      to="/"
      className="wordmark"
      aria-label="Página de inicio de Glamurosas Nails"
    >
      <span>
        glamurosas<span className="wordmark-dot">.</span>
      </span>
      <small>UÑAS Y AUTOCUIDADO</small>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const location = useLocation();
  // biome-ignore lint/correctness/useExhaustiveDependencies: cerrar el menú móvil al navegar es intencional; la ruta es la única razón de este efecto.
  useEffect(() => setOpen(false), [location]);
  useEffect(() => {
    if (!open) return;
    function dismiss(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [open]);
  return (
    <>
      <div className="demo-banner">
        Una pequeña vista previa de algo hermoso.{" "}
        <span>Sitio web de demostración · las reservas no están activas</span>
        <Sparkle />
      </div>
      {/*
        biome-ignore lint/a11y/noStaticElementInteractions: el contenedor detecta
        cuándo el foco abandona el encabezado para cerrar el menú móvil (requisito
        de accesibilidad); el elemento con el manejador no es interactivo por sí mismo.
      */}
      <div
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setOpen(false);
          }
        }}
      >
        <header className="site-header">
          <div className="header-inner">
            <Wordmark />
            <button
              ref={toggleRef}
              type="button"
              className="menu-toggle"
              aria-expanded={open}
              aria-controls="main-navigation"
              aria-label={
                open ? "Cerrar menú de navegación" : "Abrir menú de navegación"
              }
              onClick={() => setOpen(!open)}
            >
              <span
                className={open ? "menu-lines is-open" : "menu-lines"}
                aria-hidden="true"
              />
              <span>Menú</span>
            </button>
            <nav
              id="main-navigation"
              aria-label="Navegación principal"
              className={`main-navigation ${open ? "is-open" : ""}`}
            >
              {NAVIGATION.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.to === "/"}>
                  {item.label}
                </NavLink>
              ))}
              <Link className="button button-small" to="/booking">
                Reserva tu momento <Arrow diagonal />
              </Link>
            </nav>
          </div>
        </header>
      </div>
    </>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div>
          <Wordmark />
          <p>
            Un poco de brillo. Mucha posibilidad.
            <br />
            Tu historia de autocuidado empieza aquí.
          </p>
        </div>
        <div>
          <h2>Encuentra tu inspiración</h2>
          <nav aria-label="Navegación del pie de página">
            <Link to="/services">El menú de servicios</Link>
            <Link to="/gallery">La edición de inspiración</Link>
            <Link to="/booking">Prueba la demostración de cita</Link>
          </nav>
        </div>
        <div>
          <h2>Mantengámonos en contacto</h2>
          <p>Los datos de contacto del salón llegarán pronto.</p>
          <Link className="text-link" to="/contact">
            Acerca de esta vista previa <Arrow diagonal />
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Glamurosas Nails · Concepto visual</p>
        <p>Imágenes de inspiración de stock. Precios y reseñas de ejemplo.</p>
        <span>
          HECHO PARA TU MOMENTO <Sparkle />
        </span>
      </div>
    </footer>
  );
}

export function RouteEffects() {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);
  useEffect(() => {
    const name =
      NAVIGATION.find((item) => item.to === pathname)?.label ||
      (pathname === "/booking"
        ? "Demostración de cita"
        : "Página no encontrada");
    document.title = `${name} | Glamurosas Nails`;
    if (previousPath.current !== pathname) {
      window.scrollTo({ top: 0, behavior: "instant" });
      document.getElementById("main-content")?.focus({ preventScroll: true });
      previousPath.current = pathname;
    }
  }, [pathname]);
  return null;
}

interface PageIntroProps {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
}

export function PageIntro({ eyebrow, title, children }: PageIntroProps) {
  return (
    <div className="page-intro container">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <div className="page-intro-description">{children}</div>
    </div>
  );
}
