import { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import { Footer, Header, PageIntro, RouteEffects } from "./components/layout";
import {
  Arrow,
  BookingCallout,
  Photo,
  SectionHeading,
  ServiceCard,
  Sparkle,
} from "./components/ui";
import { AppErrorFallback } from "./error-boundary";
import { Booking, Reviews } from "./forms";
import type { CategoryId } from "./models/types";
import { categories, isCategoryId, photos, services } from "./services/content";

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
            Un espacio privado para ti y muchos mimos para tus uñas.
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
          Elegí el servicio que más va con tu momento y consultá disponibilidad
          para reservar.
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
              Queremos leer <em>tu experiencia.</em>
            </>
          }
          description="Cada reseña real ayuda a que otra persona reserve con más confianza y cercanía."
        >
          <Link className="text-link" to="/reviews">
            Dejar una reseña <Arrow />
          </Link>
        </SectionHeading>
      </section>
      <BookingCallout />
    </>
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
      <section className="container page-section" aria-label="Servicios">
        <div className="notice">
          <Sparkle />
          <p>
            <strong>Elegí tu próximo acabado.</strong> Estos servicios te ayudan
            a encontrar el estilo ideal antes de reservar.
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
            Usa la galería para explorar formas, colores y detalles. Cuando
            estés lista, consulta y reserva los horarios disponibles en Google
            Calendar.
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
  const [category, setCategory] = useState<CategoryId>(
    isCategoryId(initial) ? initial : "all",
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
          {/*
            biome-ignore lint/a11y/useSemanticElements: el e2e exige
            getByRole("group", { name: "Filtrar la inspiración por estilo" }) para los
            filtros; reemplazarlo por fieldset rompería el contrato de los tests.
          */}
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
            Reservá tu cita desde Google Calendar y consultá los canales de
            contacto disponibles para coordinar tu experiencia.
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
              <dd>Reserva disponible mediante Google Calendar</dd>
            </div>
          </dl>
          <Link className="button" to="/booking">
            Solicita tu cita <Arrow diagonal />
          </Link>
          <p className="section-note">
            Google Calendar muestra la disponibilidad y gestiona la reserva de
            tu cita.
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
  const location = useLocation();
  return (
    <>
      <a className="skip-link" href="#main-content">
        Saltar al contenido
      </a>
      <RouteEffects />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <ErrorBoundary
          resetKeys={[location.pathname]}
          FallbackComponent={AppErrorFallback}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/services" element={<Services />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/booking" element={<Booking />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
}
