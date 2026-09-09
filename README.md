# Glamurosas Nails — vista previa visual con backend persistente

Concepto de estudio de uñas liderado por fotos, con diseño editorial crema y borgoña. Esta versión incluye un cliente React/TypeScript y un backend Fastify que persiste solicitudes de reserva en SQLite local.

## 🚀 Ejecutar localmente

Requisitos: Node.js **22.12+ o 24+** y pnpm. Probado con Node **24.16.0** y pnpm **11.8.0**.

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

La versión de producción queda en http://127.0.0.1:4173 y sirve tanto la app como `/api/bookings` desde el mismo origen.

Para revisar solo el cliente compilado con Vite:

```sh
pnpm run preview
```

## 🧪 Qué podés probar

| Ruta        | Experiencia                                                                                                                   |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `/`         | Portada editorial, servicios, inspiración, reseñas de muestra y enlaces de reserva que envían datos al backend.               |
| `/services` | Cuatro servicios ejemplo con precios y duraciones ilustrativos en USD; los enlaces preseleccionan el formulario de reserva.   |
| `/gallery`  | Seis composiciones de imágenes de banco con filtros: todos, acrílico, gel, arte de uñas y clásico.                            |
| `/booking`  | Formulario de reserva con nombre, email, servicio, fecha local y hora de ejemplo; al enviar, crea una solicitud persistente.   |
| `/reviews`  | Tres reseñas de muestra y formulario accesible de 1–5 estrellas; los comentarios se guardan solo en memoria del cliente.      |
| `/contact`  | Estado honesto de “próximamente”, sin ubicación, canales de contacto u horarios falsificados.                                |
| Otras rutas | Página de ruta no encontrada con enlace al inicio.                                                                            |

La navegación incluye menú móvil accesible, enlace para saltar al contenido, estados de foco visibles y foco del área principal al cambiar de ruta. Los diseños se adaptan a pantallas pequeñas y respetan la preferencia de movimiento reducido.

## 🔒 Límites de demo y privacidad

- Usá **datos personales de ejemplo**. Las reservas se envían al backend local y se almacenan en `server/data/glamurosas.db`, ignorado por Git. No se envían a terceros ni se integran con emails, calendarios o sistemas externos de turnos.
- Las fechas usan el día local del navegador; se rechazan fechas pasadas. Las horas son ejemplos, no disponibilidad real ni horarios de salón.
- Las reseñas son ejemplos ficticios, no testimonios reales. Una reseña enviada se agrega solo a la memoria del cliente, sobrevive a la navegación interna y desaparece al recargar.
- Los precios son importes ilustrativos en USD, las duraciones son estimaciones y el arte de uñas se muestra como complemento. Ninguno representa una oferta confirmada del salón.
- No hay analítica, autenticación ni integraciones de reservas de terceros. El backend es demostrativo y necesitaría endurecimiento antes de producción pública.

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

La vista previa de producción envía una Política de Seguridad de Contenido restrictiva: scripts y conexiones de mismo origen, con solo los proveedores documentados de imágenes y fuentes permitidos para archivos externos. Vite mantiene su comportamiento normal de recarga en caliente durante desarrollo; un host desplegado debe reproducir los encabezados de seguridad definidos en `client/vite.config.js`.

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
| `client/src/forms.tsx`          | Formularios de reserva y reseñas.                                 |
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

DM Sans y Playfair Display se cargan desde Google Fonts con alternativas de sistema sans-serif/Georgia. Los proveedores externos de imágenes y fuentes reciben solicitudes ordinarias de archivos externos, **no valores de formulario**. Antes de un lanzamiento público, reemplazá la fotografía de banco con activos aprobados del salón y confirmá licencias y requisitos de privacidad.

## 📈 Próximos pasos reales

1. Hacer push de los commits locales cuando decidas publicar esta rama.
2. Definir datos reales del salón: fotos aprobadas, servicios, precios, ubicación, horarios y canales de contacto.
3. Antes de producción pública: agregar variables de entorno, protección de abuso, estrategia de backups, base de datos administrada y flujo de despliegue.
4. Para una fase comercial: integrar calendario, emails de confirmación, autenticación de administrador y panel de gestión de reservas.
