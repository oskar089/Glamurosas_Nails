import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation } from "react-router-dom";
import {
  Arrow,
  BookingCallout,
  Photo,
  ReviewCard,
  SectionHeading,
  ServiceCard,
  Sparkle,
} from "./components";
import { categories, exampleReviews, photos, services } from "./content";
import { Booking, Reviews } from "./forms";

const navigation = [
  { to: "/", label: "Inicio" },
  { to: "/services", label: "Servicios" },
  { to: "/gallery", label: "Galería" },
  { to: "/reviews", label: "Reseñas" },
  { to: "/contact", label: "Contacto" },
];

function Wordmark() {
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

function Header() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const headerRef = useRef(null);
  const location = useLocation();
  useEffect(() => setOpen(false), [location]);
  useEffect(() => {
    if (!open) return;
    function dismiss(event) {
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
      <header
        className="site-header"
        ref={headerRef}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setOpen(false);
        }}
      >
        <div className="header-inner">
          <Wordmark />
          <button
            ref={toggleRef}
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
            {navigation.map((item) => (
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
    </>
  );
}

function Footer() {
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

function RouteEffects() {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);
  useEffect(() => {
    const name =
      navigation.find((item) => item.to === pathname)?.label ||
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

function Home() {
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="tiny-line" />
            EL ARTE DE SENTIRTE BIEN
          </p>
          <h1>
            Un poco de brillo.
            <br />
            Una nueva forma de
            <br />
            <em>sentir.</em>
            <Sparkle />
          </h1>
          <p className="hero-description">
            Uñas bonitas, detalles cuidados y un momento que es enteramente
            tuyo. Te damos la bienvenida a Glamurosas Nails.
          </p>
          <div className="hero-actions">
            <Link className="button" to="/booking">
              Encuentra tu estilo perfecto <Arrow diagonal />
            </Link>
            <Link className="text-link" to="/gallery">
              Explora la galería <Arrow />
            </Link>
          </div>
          <div className="hero-footnote">
            <span className="mini-monogram" aria-hidden="true">
              g.
            </span>
            <p>
              Un poco de autocuidado.
              <br />
              <strong>Una forma hermosa de cada día.</strong>
            </p>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-photo-wrap">
            <Photo photo={photos[0]} hero />
            <div className="hero-photo-label">
              <span>EL ESTILO GLAMUROSAS</span>
              <p>
                Detalles suaves.
                <br />
                <em>Fuerte impresión.</em>
              </p>
              <Arrow diagonal />
            </div>
          </div>
          <div className="hero-seal" aria-hidden="true">
            <span>UÑAS CON</span>
            <span className="seal-g">g.</span>
            <span>PERSONALIDAD</span>
          </div>
          <p className="image-disclosure">
            Una imagen de inspiración, no trabajo del portafolio del salón.
          </p>
          <span className="vertical-note" aria-hidden="true">
            TU ESTILO. TU PEQUEÑO RITUAL.
          </span>
        </div>
      </section>
      <div className="values-strip">
        <span>Cuidado de uñas pensado</span>
        <Sparkle />
        <span>Detalles que se sienten tuyos</span>
        <Sparkle />
        <span>Un momento para frenar</span>
        <Sparkle />
        <span>La belleza de lo cotidiano</span>
      </div>
      <section className="section container">
        <SectionHeading
          eyebrow="EL MENÚ DE SERVICIOS"
          title={
            <>
              Tus manos. <em>Tu firma.</em>
            </>
          }
          description="De lo bellamente sencillo a algo más expresivo. Encuentra tu tipo de acabado."
        >
          <Link className="text-link" to="/services">
            Explora todos los servicios <Arrow />
          </Link>
        </SectionHeading>
        <div className="service-grid">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
        <p className="section-note">
          Precios ilustrativos en USD y duraciones estimadas. No es un menú de
          servicios en vivo.
        </p>
      </section>
      <section className="inspiration-section">
        <div className="container section">
          <SectionHeading
            eyebrow="LA EDICIÓN DE INSPIRACIÓN"
            title={
              <>
                Pequeños detalles.
                <br />
                <em>Posibilidades infinitas.</em>
              </>
            }
            description="Un panel de inspiración para tu próxima pequeña obsesión."
          >
            <Link className="text-link" to="/gallery">
              Encuentra tu inspiración <Arrow />
            </Link>
          </SectionHeading>
          <div className="home-gallery">
            {photos.slice(0, 3).map((photo, index) => (
              <Link
                key={photo.id}
                className="inspiration-card"
                to={`/gallery?category=${photo.category}`}
              >
                <Photo photo={photo} />
                <div>
                  <span className="index">0{index + 1}</span>
                  <h3>{photo.title}</h3>
                  <Arrow diagonal />
                </div>
              </Link>
            ))}
          </div>
          <p className="section-note">
            Imágenes de stock seleccionadas como inspiración visual. No son
            ejemplos del trabajo de nuestro salón.
          </p>
        </div>
      </section>
      <section className="section container">
        <SectionHeading
          eyebrow="PALABRAS PEQUEÑAS, SENSACIONES BONITAS"
          title={
            <>
              El tipo de sensación <em>que imaginamos.</em>
            </>
          }
          description="Historias de ejemplo para mostrar cómo este espacio celebrará tus experiencias."
        >
          <Link className="text-link" to="/reviews">
            Explora reseñas de demostración <Arrow />
          </Link>
        </SectionHeading>
        <div className="review-grid">
          {exampleReviews.slice(0, 2).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
        <p className="section-note">
          Solo texto de demostración. No hay testimonios reales de clientes ni
          valoraciones verificadas.
        </p>
      </section>
      <BookingCallout />
    </>
  );
}

export function PageIntro({ eyebrow, title, children }) {
  return (
    <div className="page-intro container">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <div className="page-intro-description">{children}</div>
    </div>
  );
}

function Services() {
  return (
    <>
      <PageIntro
        eyebrow="EL MENÚ DE SERVICIOS"
        title={
          <>
            Un acabado para <em>cada sensación.</em>
          </>
        }
      >
        <p>
          Mantén la clásica, encuentra tu tono característico o haz una pequeña
          declaración.
          <br />
          Aquí empieza tu próximo conjunto.
        </p>
      </PageIntro>
      <section
        className="container page-section"
        aria-label="Servicios de ejemplo"
      >
        <div className="notice">
          <Sparkle />
          <p>
            <strong>Un primer vistazo al menú.</strong> Todos los precios son
            montos ilustrativos en USD; las duraciones son ejemplos, no detalles
            de servicio confirmados. La decoración de uñas es un complemento.
          </p>
        </div>
        <div className="service-grid service-grid-full">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
        <div className="care-note">
          <p className="eyebrow">ANTES DE TU PRÓXIMO CONJUNTO</p>
          <h2>
            Un poco de reflexión.
            <br />
            <em>Un bello comienzo.</em>
          </h2>
          <p>
            Usa la galería para explorar formas, colores y detalles. La
            demostración de cita te permite probar a elegir un servicio, una
            fecha y una hora sin hacer una cita real.
          </p>
          <Link className="text-link" to="/gallery">
            Construye tu inspiración <Arrow />
          </Link>
        </div>
      </section>
      <BookingCallout />
    </>
  );
}

function Gallery() {
  const { search } = useLocation();
  const initial = new URLSearchParams(search).get("category");
  const [category, setCategory] = useState(
    categories.some((item) => item.id === initial) ? initial : "all",
  );
  const filtered =
    category === "all"
      ? photos
      : photos.filter((photo) => photo.category === category);
  return (
    <>
      <PageIntro
        eyebrow="LA EDICIÓN DE INSPIRACIÓN"
        title={
          <>
            Encuentra tu próxima <em>pequeña obsesión.</em>
          </>
        }
      >
        <p>
          Neutros suaves. Detalles divertidos. Algo un poco inesperado.
          <br />
          Un panel de inspiración seleccionado, listo para tu imaginación.
        </p>
      </PageIntro>
      <section
        className="container page-section"
        aria-label="Galería de inspiración de uñas"
      >
        <div className="gallery-toolbar">
          <div
            className="filters"
            role="group"
            aria-label="Filtrar la inspiración por estilo"
          >
            {categories.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={category === item.id}
                onClick={() => setCategory(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="gallery-count" role="status">
            {filtered.length} {filtered.length === 1 ? "imagen" : "imágenes"} de
            inspiración
          </p>
        </div>
        <div className="gallery-grid">
          {filtered.map((photo, index) => (
            <figure className="gallery-item" key={photo.id}>
              <Photo photo={photo} />
              <figcaption>
                <div>
                  <span className="micro-label">
                    {
                      categories.find((item) => item.id === photo.category)
                        ?.label
                    }{" "}
                    INSPIRACIÓN
                  </span>
                  <h2>{photo.title}</h2>
                </div>
                <span className="index">0{index + 1}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="notice gallery-notice">
          <Sparkle />
          <p>
            <strong>Inspiración, no un portafolio.</strong> Estas fotografías de
            stock ilustran la dirección visual. Las etiquetas de categoría son
            agrupaciones de panel de inspiración, no técnicas de tratamiento
            verificadas. Algunas imágenes aparecen en más de un recorte.
          </p>
        </div>
      </section>
      <BookingCallout />
    </>
  );
}

function Contact() {
  return (
    <>
      <PageIntro
        eyebrow="CONECTEMOS"
        title={
          <>
            Buenas cosas <em>están por venir.</em>
          </>
        }
      >
        <p>
          Un espacio nuevo para pequeños rituales y detalles bonitos.
          <br />
          Esto es lo que debes saber sobre este primer vistazo.
        </p>
      </PageIntro>
      <section className="container contact-layout page-section">
        <div className="contact-art" aria-hidden="true">
          <span className="contact-monogram">g.</span>
          <Sparkle />
          <p>
            UN POCO DE BRILLO.
            <br />
            MUCHA POSIBILIDAD.
          </p>
        </div>
        <div className="contact-details">
          <p className="eyebrow">GLAMUROSAS NAILS</p>
          <h2>
            Hagámoslo
            <br />
            <em>personal. Pronto.</em>
          </h2>
          <p>
            Los datos de contacto del salón llegarán pronto. No hay una
            dirección, teléfono, correo electrónico ni horario de apertura
            confirmados en esta vista previa.
          </p>
          <dl>
            <div>
              <dt>Visita el estudio</dt>
              <dd>Ubicación por anunciar</dd>
            </div>
            <div>
              <dt>Ponte en contacto</dt>
              <dd>Canales de contacto próximamente</dd>
            </div>
            <div>
              <dt>Planifica tu momento</dt>
              <dd>La reserva real aún no está disponible</dd>
            </div>
          </dl>
          <Link className="button" to="/booking">
            Prueba la experiencia de cita <Arrow diagonal />
          </Link>
          <p className="section-note">
            Esto es una demostración visual, no un servicio de reservas en
            funcionamiento.
          </p>
        </div>
      </section>
    </>
  );
}

function NotFound() {
  return (
    <section className="not-found container">
      <p className="eyebrow">404 · UN PEQUEÑO DESVÍO</p>
      <h1>
        Volvamos
        <br />
        <em>a lo hermoso.</em>
      </h1>
      <p>
        Esa página no existe. Tu próximo toque de inspiración está justo aquí.
      </p>
      <Link className="button" to="/">
        Volver al inicio <Arrow />
      </Link>
    </section>
  );
}

export function App() {
  const [localReviews, setLocalReviews] = useState([]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <RouteEffects />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/booking" element={<Booking />} />
          <Route
            path="/reviews"
            element={
              <Reviews
                localReviews={localReviews}
                onAddReview={(review) =>
                  setLocalReviews((current) => [review, ...current])
                }
              />
            }
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
