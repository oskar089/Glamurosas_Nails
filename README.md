# Glamurosas Nails — sitio web de reservas

Sitio web de Glamurosas Nails con diseño editorial crema y borgoña, navegación por servicios, galería de inspiración y reservas mediante Google Calendar. La versión pública se despliega como cliente React/TypeScript en Vercel.

## 🚀 Ejecutar localmente

Requisitos: Node.js **22.x** y pnpm **11.8.0**.

Desde la raíz del proyecto:

```sh
pnpm install
pnpm run dev
```

Esto inicia concurrentemente:

- **Servidor de desarrollo Vite** en http://127.0.0.1:5173 para el cliente React.
- **Servidor Fastify** en http://127.0.0.1:4173 para la API y la vista previa compilada cuando exista `client/dist/`.

En desarrollo, Vite redirige `/api` hacia el servidor Fastify. Detené ambos procesos con `Ctrl+C`.

Para preparar y servir la versión de producción completa:

```sh
pnpm run build
pnpm run start
```

La versión de producción queda en http://127.0.0.1:4173 y sirve la app desde el mismo origen.

Para revisar solo el cliente compilado con Vite:

```sh
pnpm run preview
```

## 🧪 Qué podés probar

| Ruta        | Experiencia                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `/`         | Portada editorial, servicios, inspiración visual y enlaces hacia la reserva.                                                  |
| `/services` | Servicios destacados: manicura refuerzo, acrílicas, semipermanentes y pedicura; los enlaces pueden reflejar el servicio elegido. |
| `/gallery`  | Composiciones de inspiración con filtros: todos, acrílico, gel, arte de uñas y clásico.                                       |
| `/booking`  | Formulario de solicitud para el salón y CTA hacia Google Calendar, que sigue mostrando y confirmando la disponibilidad exacta. |
| `/reviews`  | Formulario accesible de 1–5 estrellas para compartir una reseña.                                                              |
| `/contact`  | Página de contacto con Zona Amate, WhatsApp 643 521 975, Instagram y horario de lunes a viernes, 9:30 a. m. a 6:00 p. m.     |
| Otras rutas | Página de ruta no encontrada con enlace al inicio.                                                                            |

La navegación incluye menú móvil accesible, enlace para saltar al contenido, estados de foco visibles y foco del área principal al cambiar de ruta. Los diseños se adaptan a pantallas pequeñas y respetan la preferencia de movimiento reducido.

## 🔒 Privacidad y alcance

- La página de reserva guarda en Supabase una solicitud `pending` con los datos de contacto, servicio y preferencias para que el salón pueda hacer seguimiento. Esta solicitud no reserva ni bloquea un horario.
- Google Calendar sigue siendo el único lugar donde se muestran, eligen y confirman los horarios. La disponibilidad y los datos enviados allí se rigen por las políticas de Google.
- Las reseñas se guardan en Supabase como `pending` y solo se muestran cuando estén aprobadas.
- No hay analítica ni autenticación en el cliente público.
- El backend Fastify incluido en el repositorio se conserva para desarrollo local y futuras integraciones, pero el despliegue actual de Vercel sirve el cliente estático.

## 🗄️ Supabase

El cliente usa estas variables de entorno de Vite:

```txt
VITE_SUPABASE_URL=https://bnnrfmhavoysycwzzzfa.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

En Vercel se configuran en `Settings → Environment Variables`.

Las migraciones de Supabase están en:

```txt
supabase/migrations/20260402120000_create_reviews.sql
supabase/migrations/20260402123000_add_review_admins.sql
supabase/migrations/20260402130000_create_booking_requests.sql
supabase/migrations/20260402131000_lock_down_rls_auto_enable.sql
```

Para administrar reseñas y solicitudes de reserva:

1. Creá un usuario en `Authentication → Users`.
2. Copiá su `User UID`.
3. Insertalo en `public.review_admins`.
4. Entrá a `/admin` con ese email y contraseña. El panel muestra las solicitudes de reserva pendientes; el horario se confirma siempre en Google Calendar.

## ✅ Verificación

```sh
pnpm run format:check
pnpm --filter @glamurosas/client run typecheck
pnpm --filter @glamurosas/client run test:unit
pnpm --filter @glamurosas/server run typecheck
pnpm run lint
pnpm test
```

La suite de Playwright se ejecuta contra la vista previa de producción en el puerto **4173**, inicia y detiene su propio servidor, y no reutiliza otro servidor en ejecución. Dejá libre el puerto 4173 antes de correrla.

La versión desplegada envía una Política de Seguridad de Contenido restrictiva: scripts y conexiones de mismo origen, con solo los proveedores documentados de imágenes y fuentes permitidos para archivos externos. Vite mantiene su comportamiento normal de recarga en caliente durante desarrollo; Vercel reproduce estos encabezados desde `vercel.json`.

Las pruebas de comportamiento bloquean solicitudes de terceros desde la navegación inicial para aislar la aplicación, incluyendo tráfico observado por software antivirus en páginas HTTP locales. Las pruebas de referencia visual conservan el acceso externo para la fotografía y las fuentes reales.

Las pruebas usan **Microsoft Edge instalado localmente**, con proyectos de escritorio (1440px), móvil emulado (390px) y chequeos de 320px. Para usar Google Chrome instalado en PowerShell:

```powershell
$env:PLAYWRIGHT_CHANNEL = "chrome"
pnpm test
```

Ambos navegadores deben instalarse por separado; este repositorio no los descarga. Las capturas de pantalla y trazas de fallo van a `test-results/`, ignorado por Git.

## 📦 Tecnología y archivos

- **Cliente**: React **19.2.8**, React DOM **19.2.8**, React Router DOM **7.18.3**, React Hook Form, Zod y TypeScript.
- **Servidor**: Fastify **5**, `node:sqlite` y TypeScript.
- **Herramientas**: Vite **8.2.2**, plugin React **6.1.1**, Biome, Playwright **1.63.0**, Vitest + Testing Library.

| Archivo                         | Responsabilidad                                                   |
| ------------------------------- | ----------------------------------------------------------------- |
| `client/src/main.tsx`           | Inicio de React y configuración del router.                       |
| `client/src/pages.tsx`          | Páginas visuales principales.                                     |
| `client/src/forms.tsx`          | Solicitud de reserva, CTA de Google Calendar y formulario de reseñas. |
| `client/src/components/`        | Distribución y componentes UI compartidos.                        |
| `client/src/services/`          | Contenido, validadores y cliente API.                             |
| `client/src/styles.css`         | Sistema visual y estilos adaptables/reduced-motion.               |
| `client/tests/`                 | Pruebas browser y objetos de página de Playwright.                |
| `server/src/index.ts`           | Punto de entrada Fastify, archivos estáticos y fallback SPA.      |
| `server/src/db.ts`              | Configuración y migración mínima de SQLite.                       |
| `server/src/routes/bookings.ts` | API para crear solicitudes de reserva.                            |
| `shared/src/index.ts`           | Tipos y validaciones compartidas entre cliente y servidor.        |
| `playwright.config.js`          | Configuración de verificación browser y ciclo de vida del server. |

## 🖼️ Activos externos

La fotografía se enlaza directamente desde `images.unsplash.com`; **es inspiración de banco, no trabajo de portafolio del salón**. Seis composiciones usan estas cuatro fotografías, incluyendo dos recortes alternos:

- `photo-1604654894610-df63bc536371`
- `photo-1632345031435-8727f6897d53`
- `photo-1610992015732-2449b76344bc`
- `photo-1519014816548-bf5fe059798b`

Las imágenes usan dimensiones explícitas y proporciones de recorte. La imagen principal carga con prioridad; las demás imágenes se cargan de forma diferida. Las imágenes fallidas muestran un reemplazo visual con marca y etiqueta. Las categorías de estilo son agrupaciones de inspiración, no técnicas verificadas.

DM Sans y Playfair Display se cargan desde Google Fonts con alternativas de sistema sans-serif/Georgia. Los proveedores externos de imágenes y fuentes reciben solicitudes ordinarias de archivos externos. Google Calendar recibe los datos que la persona complete al usar el enlace de reserva. Para fortalecer la marca, reemplazá progresivamente la fotografía de banco con activos aprobados del salón y confirmá licencias y requisitos de privacidad.

## 📈 Próximos pasos reales

1. Reemplazar la fotografía de banco por fotos aprobadas del Instagram del salón cuando estén disponibles.
