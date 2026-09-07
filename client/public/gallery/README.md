# Galería de fotos del salón

Este directorio contiene las fotos reales del salón (`nailskarent.sevilla`) que
reemplazan las imágenes de stock de Unsplash. **Sin estos archivos, la galería
sigue mostrando las imágenes de Unsplash.**

## Cómo entregar las fotos

1. Descarga las fotos reales del trabajo del salón desde Instagram.
2. Colócalas aquí con los nombres exactos indicados abajo (extensión `.jpg`).
3. Cuando estén todas, avisa para enlazarlas en `src/content.js` y quitar Unsplash.

## Archivos esperados

La web tiene 6 fotos, una por cada entrada del array `photos` en `src/content.js`:

| Archivo                | Título                 | Categoría      |
| ---------------------- | ---------------------- | -------------- |
| `soft-statement.jpg`   | Una declaración sutil  | gel            |
| `little-details.jpg`   | Una pequeña nota de amor | decoración de uñas |
| `modern-muse.jpg`      | Musa moderna           | acrílico       |
| `less-is-more.jpg`     | El ritual de cuidado   | clásica        |
| `gloss-edit.jpg`       | El toque de brillo     | gel            |
| `artful-moment.jpg`    | Un momento creativo    | decoración de uñas |

## Requisitos de las imágenes

- **Formato**: JPG (o WebP si prefieres, ajustando la extensión).
- **Orientación**: retrato (vertical). Se recortan con `object-fit: cover`.
- **Tamaño recomendado**: ~800×1000 px para la galería; ~1000×1200 px para la
  foto hero. No hace falta que sean exactas; el recorte lo hace la hoja de
  estilos.
- **Peso**: idealmente < 300 KB por imagen para mantener el sitio rápido.
- **Autorización**: usa solo fotos que el salón tenga derecho a mostrar.
