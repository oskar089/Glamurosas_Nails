# Glamurosas Nails — visual preview

A photo-led nail studio concept with an editorial cream-and-burgundy design. This first version is a **client-only demo**: it does not create appointments, send emails, publish reviews, or connect to a backend.

## Run locally

Use Node.js **22.12+ or 24+** and npm. The implementation was installed with Node **24.16.0** and npm **11.13.0**.

From the project root:

```sh
npm install
npm run dev
```

Open **http://127.0.0.1:5173**. The port is fixed; Vite exits rather than silently switching if it is occupied. Stop the server with `Ctrl+C`.

```sh
npm run build
npm run preview
```

The production preview runs at **http://127.0.0.1:4173**. Build output is `client/dist/`.

## What you can try

| Route       | Experience                                                                                                 |
| ----------- | ---------------------------------------------------------------------------------------------------------- |
| `/`         | Editorial hero, services, inspiration, sample reviews, and booking links                                   |
| `/services` | Four example services with illustrative USD prices and durations; service links preselect the booking form |
| `/gallery`  | Six stock-image compositions with All, Acrylic, Gel, Nail art, and Classic filters                         |
| `/booking`  | Name, email, service, local date, and example time validation; explicit demo-only confirmation             |
| `/reviews`  | Three labeled sample reviews and a keyboard-accessible 1–5 rating/comment form                             |
| `/contact`  | Honest coming-soon state with no fabricated location, contact channels, or hours                           |
| Other paths | Not-found page with a home link                                                                            |

Navigation includes an accessible mobile menu, a skip link, visible focus states, and main-landmark focus on route changes. Layouts adapt to small screens and respect reduced-motion preferences.

## Demo and privacy boundaries

- Please use **sample personal details**. Booking values stay in component memory, are cleared after success or leaving the route, and are never transmitted or written to browser storage. No calendar, email, reservation, or appointment is created.
- Booking dates use the browser’s local day. Past dates are rejected. Times are **examples**, not availability or salon hours; this demo is not a scheduling engine.
- Reviews are fictional examples, not real testimonials. A submitted demo review is added only to application memory, survives internal navigation, and disappears on reload. Nothing is published. React renders comments as text.
- Prices are illustrative USD amounts, durations are estimates, and nail art is shown as an add-on. None is a confirmed salon offering.
- There is no server, database, authentication, analytics, third-party booking integration, or secret configuration.

## Verify

```sh
npm run format:check
npm run build
npm test
```

The Playwright suite runs against the production build at port **4173**, starts and stops its own preview server, and refuses to reuse another running server. Build before testing and leave port 4173 free.

The production preview sends a restrictive Content Security Policy: scripts and connections are same-origin, with only the documented image/font providers allowed for assets. Vite development mode keeps its normal hot-reload behavior; a deployed host must reproduce the preview security headers in `client/vite.config.js`.

Behavior tests block third-party requests from initial navigation to isolate the application, including an antivirus script observed injecting traffic into local HTTP pages on this machine. Submission listeners still count all attempted requests; no antivirus host is silently excluded from assertions. CSP alone did not prevent the host security software’s traffic. Visual-reference tests retain external access for the real photography and fonts.

Tests use **locally installed Microsoft Edge**, with desktop (1440px) and mobile-emulated (390px) projects plus 320px checks. No browser download is needed on the implementation machine. To use an installed Google Chrome in PowerShell:

```powershell
$env:PLAYWRIGHT_CHANNEL = "chrome"
npm test
```

Both browsers must be installed independently; this repository does not install them. Tests cover gallery filters, image fallback, booking validation and privacy, timezone boundaries, safe local review rendering, reload behavior, keyboard navigation, and overflow. Two visual-reference tests need Unsplash and Google Fonts access; other scenarios block those external assets. Screenshots and failure traces go into ignored `test-results/`.

## Stack and files

- React **18.3.1**, React DOM **18.3.1**, React Router DOM **7.18.3**.
- Vite **8.2.2**, React plugin **6.1.1**, JavaScript/JSX, plain CSS. No React Compiler or React 19-only APIs.
- Playwright **1.63.0** and Prettier **3.6.2**. Exact installed dependencies are locked in `package-lock.json`.

| File                        | Responsibility                                     |
| --------------------------- | -------------------------------------------------- |
| `client/src/App.jsx`        | Routes, header/footer, and visual pages            |
| `client/src/forms.jsx`      | Local-only booking and review interactions         |
| `client/src/components.jsx` | Shared visual components and photo fallback        |
| `client/src/content.js`     | Example content, photo IDs, and date validation    |
| `client/src/styles.css`     | Visual system and responsive/reduced-motion styles |
| `client/tests/`             | Focused browser tests and page objects             |
| `client/vite.config.js`     | Fixed loopback dev and preview ports               |
| `playwright.config.js`      | Bounded browser verification and server lifecycle  |

## External assets

Photography is hotlinked from `images.unsplash.com`; **it is stock inspiration, not salon portfolio work**. Six compositions use these four photographs, including two alternate crops:

- `photo-1604654894610-df63bc536371`
- `photo-1632345031435-8727f6897d53`
- `photo-1610992015732-2449b76344bc`
- `photo-1519014816548-bf5fe059798b`

Images use explicit dimensions and crop ratios. The hero is eager/high-priority; other images are lazy-loaded. Failed images show a branded, labeled fallback. Style categories are mood-board groupings, not verified treatment techniques.

DM Sans and Playfair Display load from Google Fonts with system sans-serif/Georgia fallbacks. External image and font providers receive ordinary asset requests (including network metadata), **not form values**. They need an internet connection and may become unavailable. Before public release, replace stock photography with approved salon assets and confirm applicable image/font licensing and privacy requirements.

## Next step

Review the visual direction and supply approved salon photography, real services/prices, and contact details. Production scheduling, data protection, backend persistence, and integrations are intentionally a later phase. A deployed static host must rewrite application routes to `index.html` for direct URL access.
