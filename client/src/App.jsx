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
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/gallery", label: "Gallery" },
  { to: "/reviews", label: "Reviews" },
  { to: "/contact", label: "Contact" },
];

function Wordmark() {
  return (
    <Link to="/" className="wordmark" aria-label="Glamurosas Nails home">
      <span>
        glamurosas<span className="wordmark-dot">.</span>
      </span>
      <small>NAILS & SELF-CARE</small>
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
        A little preview of something beautiful.{" "}
        <span>Demo website · bookings are not live</span>
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
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setOpen(!open)}
          >
            <span
              className={open ? "menu-lines is-open" : "menu-lines"}
              aria-hidden="true"
            />
            <span>Menu</span>
          </button>
          <nav
            id="main-navigation"
            aria-label="Main navigation"
            className={`main-navigation ${open ? "is-open" : ""}`}
          >
            {navigation.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"}>
                {item.label}
              </NavLink>
            ))}
            <Link className="button button-small" to="/booking">
              Book your moment <Arrow diagonal />
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
            A little polish. A lot of possibility.
            <br />
            Your self-care story starts here.
          </p>
        </div>
        <div>
          <h2>Find your inspiration</h2>
          <nav aria-label="Footer navigation">
            <Link to="/services">The service menu</Link>
            <Link to="/gallery">The inspiration edit</Link>
            <Link to="/booking">Try the booking demo</Link>
          </nav>
        </div>
        <div>
          <h2>Let’s stay in touch</h2>
          <p>Salon contact details are coming soon.</p>
          <Link className="text-link" to="/contact">
            About this preview <Arrow diagonal />
          </Link>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Glamurosas Nails · Visual concept</p>
        <p>Stock inspiration imagery. Example prices & reviews.</p>
        <span>
          MADE FOR YOUR MOMENT <Sparkle />
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
      (pathname === "/booking" ? "Booking demo" : "Page not found");
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
            THE ART OF FEELING GOOD
          </p>
          <h1>
            A little polish.
            <br />A whole new
            <br />
            <em>feeling.</em>
            <Sparkle />
          </h1>
          <p className="hero-description">
            Beautiful nails, thoughtful details, and a moment that’s entirely
            yours. Welcome to Glamurosas Nails.
          </p>
          <div className="hero-actions">
            <Link className="button" to="/booking">
              Find your perfect set <Arrow diagonal />
            </Link>
            <Link className="text-link" to="/gallery">
              Explore the gallery <Arrow />
            </Link>
          </div>
          <div className="hero-footnote">
            <span className="mini-monogram" aria-hidden="true">
              g.
            </span>
            <p>
              A little self-care.
              <br />
              <strong>A beautiful kind of everyday.</strong>
            </p>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-photo-wrap">
            <Photo photo={photos[0]} hero />
            <div className="hero-photo-label">
              <span>THE GLAMUROSAS MOOD</span>
              <p>
                Soft details.
                <br />
                <em>Strong impression.</em>
              </p>
              <Arrow diagonal />
            </div>
          </div>
          <div className="hero-seal" aria-hidden="true">
            <span>NAILS WITH</span>
            <span className="seal-g">g.</span>
            <span>PERSONALITY</span>
          </div>
          <p className="image-disclosure">
            An inspiration image, not salon portfolio work.
          </p>
          <span className="vertical-note" aria-hidden="true">
            YOUR STYLE. YOUR LITTLE RITUAL.
          </span>
        </div>
      </section>
      <div className="values-strip">
        <span>Thoughtful nail care</span>
        <Sparkle />
        <span>Details that feel like you</span>
        <Sparkle />
        <span>A moment to slow down</span>
        <Sparkle />
        <span>Beauty in the everyday</span>
      </div>
      <section className="section container">
        <SectionHeading
          eyebrow="THE SERVICE MENU"
          title={
            <>
              Your hands. <em>Your signature.</em>
            </>
          }
          description="From beautifully simple to a little more expressive. Find your kind of finish."
        >
          <Link className="text-link" to="/services">
            Explore all services <Arrow />
          </Link>
        </SectionHeading>
        <div className="service-grid">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
        <p className="section-note">
          Illustrative prices in USD and estimated durations. Not a live service
          menu.
        </p>
      </section>
      <section className="inspiration-section">
        <div className="container section">
          <SectionHeading
            eyebrow="THE INSPIRATION EDIT"
            title={
              <>
                Small details.
                <br />
                <em>Endless possibilities.</em>
              </>
            }
            description="A mood board for your next little obsession."
          >
            <Link className="text-link" to="/gallery">
              Find your inspiration <Arrow />
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
            Curated stock imagery for visual inspiration. These are not examples
            of our salon’s work.
          </p>
        </div>
      </section>
      <section className="section container">
        <SectionHeading
          eyebrow="LITTLE WORDS, LOVELY FEELINGS"
          title={
            <>
              The kind of feeling <em>we imagine.</em>
            </>
          }
          description="Example stories to show how this space will celebrate your experiences."
        >
          <Link className="text-link" to="/reviews">
            Explore demo reviews <Arrow />
          </Link>
        </SectionHeading>
        <div className="review-grid">
          {exampleReviews.slice(0, 2).map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
        <p className="section-note">
          Demo copy only. No real customer testimonials or verified ratings.
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
        eyebrow="THE SERVICE MENU"
        title={
          <>
            A finish for <em>every feeling.</em>
          </>
        }
      >
        <p>
          Keep it classic, find your signature shade, or make a little
          statement.
          <br />
          This is where your next set begins.
        </p>
      </PageIntro>
      <section className="container page-section" aria-label="Example services">
        <div className="notice">
          <Sparkle />
          <p>
            <strong>A first look at the menu.</strong> All prices are
            illustrative USD amounts; durations are examples, not confirmed
            service details. Nail art is an add-on.
          </p>
        </div>
        <div className="service-grid service-grid-full">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </div>
        <div className="care-note">
          <p className="eyebrow">BEFORE YOUR NEXT SET</p>
          <h2>
            A little thought.
            <br />
            <em>A beautiful beginning.</em>
          </h2>
          <p>
            Use the gallery to explore shapes, colors, and details. The booking
            demo lets you try choosing a service, date, and time without making
            a real appointment.
          </p>
          <Link className="text-link" to="/gallery">
            Build your inspiration <Arrow />
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
        eyebrow="THE INSPIRATION EDIT"
        title={
          <>
            Find your next <em>little obsession.</em>
          </>
        }
      >
        <p>
          Soft neutrals. Playful details. Something a little unexpected.
          <br />A curated mood board, ready for your imagination.
        </p>
      </PageIntro>
      <section
        className="container page-section"
        aria-label="Nail inspiration gallery"
      >
        <div className="gallery-toolbar">
          <div
            className="filters"
            role="group"
            aria-label="Filter inspiration by style"
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
            {filtered.length} inspiration{" "}
            {filtered.length === 1 ? "image" : "images"}
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
                    INSPIRATION
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
            <strong>Inspiration, not a portfolio.</strong> These stock
            photographs illustrate the visual direction. Category labels are
            mood-board groupings, not verified treatment techniques. Some images
            appear in more than one crop.
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
        eyebrow="LET’S CONNECT"
        title={
          <>
            Good things <em>are coming.</em>
          </>
        }
      >
        <p>
          A new space for little rituals and beautiful details.
          <br />
          Here’s what you need to know about this first look.
        </p>
      </PageIntro>
      <section className="container contact-layout page-section">
        <div className="contact-art" aria-hidden="true">
          <span className="contact-monogram">g.</span>
          <Sparkle />
          <p>
            A LITTLE POLISH.
            <br />A LOT OF POSSIBILITY.
          </p>
        </div>
        <div className="contact-details">
          <p className="eyebrow">GLAMUROSAS NAILS</p>
          <h2>
            Let’s make it
            <br />
            <em>personal. Soon.</em>
          </h2>
          <p>
            Salon contact details are coming soon. There is no confirmed
            address, phone number, email, or opening schedule in this preview.
          </p>
          <dl>
            <div>
              <dt>Visit the studio</dt>
              <dd>Location to be announced</dd>
            </div>
            <div>
              <dt>Get in touch</dt>
              <dd>Contact channels coming soon</dd>
            </div>
            <div>
              <dt>Plan your moment</dt>
              <dd>Real booking is not available yet</dd>
            </div>
          </dl>
          <Link className="button" to="/booking">
            Try the booking experience <Arrow diagonal />
          </Link>
          <p className="section-note">
            This is a visual demonstration, not an operating booking service.
          </p>
        </div>
      </section>
    </>
  );
}

function NotFound() {
  return (
    <section className="not-found container">
      <p className="eyebrow">404 · A LITTLE DETOUR</p>
      <h1>
        Let’s get you
        <br />
        <em>back to beautiful.</em>
      </h1>
      <p>
        That page doesn’t exist. Your next bit of inspiration is right here.
      </p>
      <Link className="button" to="/">
        Back to home <Arrow />
      </Link>
    </section>
  );
}

export function App() {
  const [localReviews, setLocalReviews] = useState([]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
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
