# Cuadro Web

Base web del MVP de Cuadro construida con `Vite + React + TypeScript`.

## Convenciones actuales

- La base visual global vive en [src/shared/styles/tokens.css](/C:/Users/ab-iu/Documents/repos/cuadro/apps/web/src/shared/styles/tokens.css).
- El shell principal del editor vive en [src/features/editor/presentation/pages/EditorPage.tsx](/C:/Users/ab-iu/Documents/repos/cuadro/apps/web/src/features/editor/presentation/pages/EditorPage.tsx).
- Los componentes UI reutilizables están en `src/shared/ui`.
- La configuración del editor y el estado del drawer usan Zustand con persistencia en `localStorage`.
- La i18n inicial vive en `src/shared/i18n` y hoy soporta `en` y `es`.

## Comportamiento responsive

- Mobile first.
- En mobile y tablet compacta, la configuración se abre en un bottom sheet.
- En desktop, la configuración vive como panel lateral persistente.

## Alcance de esta base

- Shell visual del editor.
- Placeholder de composición con preview simple de cuadrícula.
- Configuración mínima de grid.
- Cambio de idioma persistente.

Todavía no incluye importación de imágenes, drag, zoom ni exportación.
