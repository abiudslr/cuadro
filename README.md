# Cuadro — Image Grid Generator (MVP Web)

Cuadro es una aplicación **local-first** para crear cuadrículas de imágenes de forma rápida, optimizada y sin backend.

El objetivo del MVP es construir un **editor visual minimalista** donde el usuario pueda:

* definir una cuadrícula
* cargar imágenes
* ajustarlas dentro de cada celda
* exportar el resultado final

Todo el procesamiento ocurre en el cliente (navegador).

---

# 🎯 Objetivo del MVP

Construir un editor funcional con enfoque en:

* rendimiento (prioridad máxima)
* simplicidad
* arquitectura escalable
* base sólida para futura app móvil (Flutter)

❌ Fuera de alcance (por ahora):

* gestión de múltiples proyectos
* autenticación
* backend
* sincronización en la nube

---

# 🧠 Principios de diseño

## 1. Local-first

Toda la lógica y procesamiento ocurre en el cliente.

## 2. Performance first

* evitar procesamiento innecesario
* reducir tamaño de imágenes desde el inicio
* evitar bloqueos del hilo principal

## 3. Arquitectura limpia (sin overengineering)

Separación clara entre:

* UI
* estado
* dominio
* infraestructura

## 4. Arquitectura espejo (futuro mobile)

La estructura se diseñará para replicarse en Flutter, aunque no se comparta código.

---

# 🧱 Funcionalidades del MVP

## Configuración de cuadrícula

* orientación (vertical / horizontal)
* aspect ratio (1:1, 3:4, 4:5, 9:16, 16:9)
* filas
* columnas
* ancho de margen
* color de margen

## Manejo de imágenes

* cargar múltiples imágenes
* asignar imagen a celda
* reemplazar imagen

## Edición

* mover imagen dentro de celda (pan)
* zoom
* ajuste tipo `cover`

## Exportación

* generar imagen final
* descargar (PNG/JPG)

---

# 🏗️ Arquitectura

## Estructura general

```
src/
  app/
  core/
  features/
  shared/
```

---

## app/

Configuración global de la aplicación.

```
app/
  bootstrap/
  router/
  providers/
  styles/
  config/
```

Responsabilidades:

* inicialización
* providers globales
* estilos base

---

## core/

Núcleo del dominio (NO depende de React).

```
core/
  domain/
  application/
  infrastructure/
  utils/
```

---

### core/domain/

Reglas puras del sistema.

```
domain/
  entities/
  value-objects/
  services/
```

#### Entidades principales

**Project (MVP simplificado: estado único en memoria)**

```ts
type Project = {
  gridConfig: GridConfig
  cells: GridCell[]
  images: PlacedImage[]
}
```

**GridConfig**

```ts
type GridConfig = {
  orientation: 'vertical' | 'horizontal'
  aspectRatio: string
  rows: number
  columns: number
  marginWidth: number
  marginColor: string
  maxResolution: number
}
```

**GridCell**

```ts
type GridCell = {
  id: string
  row: number
  column: number
  imageId?: string
}
```

**PlacedImage**

```ts
type PlacedImage = {
  id: string
  cellId: string
  src: string
  width: number
  height: number
  scale: number
  offsetX: number
  offsetY: number
}
```

---

### core/domain/services/

#### GridLayoutEngine

Calcula:

* tamaño del canvas
* tamaño de celdas
* posiciones

#### ResolutionPolicy

Define:

* resolución máxima
* downscale de imágenes

#### ExportPolicy

Define:

* tamaño final de exportación

---

## core/application/

Casos de uso (orquestación)

```
application/
  use-cases/
  ports/
```

Ejemplos:

* `updateGridConfig`
* `assignImageToCell`
* `updateImageTransform`
* `exportProject`

---

## core/infrastructure/

Implementaciones concretas

```
infrastructure/
  processing/
  platform/
```

### processing/

* Canvas renderer
* Image processor

### platform/

* file picker
* download

---

## features/

Organización por funcionalidades.

```
features/
  editor/
  assets/
  export/
```

---

### features/editor/

```
editor/
  application/
  presentation/
```

#### application/

* estado del editor (Zustand)
* acciones

#### presentation/

* EditorPage
* Canvas
* Toolbar
* Controls

---

### features/assets/

* carga de imágenes
* preview

---

### features/export/

* lógica UI de exportación
* progreso

---

## shared/

Componentes reutilizables

```
shared/
  ui/
  hooks/
  constants/
```

---

# 🧩 Flujo principal

## 1. Inicialización

* crear grid vacío

## 2. Configuración

* usuario ajusta grid
* se recalcula layout

## 3. Importación de imágenes

* se cargan archivos
* se generan versiones optimizadas

## 4. Edición

* usuario mueve/escala imágenes

## 5. Exportación

* render final
* descarga

---

# 🧮 Motor de layout

El layout SIEMPRE se calcula en base a:

* aspect ratio final
* filas/columnas
* márgenes

Salida:

* canvas width/height
* rectángulos de cada celda

---

# 🖼️ Pipeline de imágenes

## Importación

1. leer archivo
2. obtener dimensiones
3. reducir resolución si es necesario
4. guardar versión optimizada

## Edición

* usar versión optimizada

## Exportación

* recomposición final

---

# ⚡ Performance

## Reglas clave

* NO usar imágenes originales grandes en render interactivo
* usar Web Workers para:

  * resize
  * export
* evitar re-render global
* trabajar por celda

---

# 🧠 Estado

Se manejará con **Zustand**.

Separación:

* estado del proyecto
* estado de UI (selección, interacción)

---

# 🎨 UI

## Requisitos

* mobile-first
* minimalista
* sin ruido visual

## Componentes clave

* Canvas editor
* Toolbar inferior
* Panel de configuración
* Selector de imágenes

---

# 📦 Stack tecnológico

* React
* TypeScript
* Vite
* Zustand
* Canvas API
* Web Workers
* IndexedDB (futuro)

---

# 📁 Naming conventions

* componentes: `PascalCase.tsx`
* lógica: `camelCase.ts`
* dominio: `PascalCase.ts`

---

# 🔒 Reglas importantes

## 1

UI NO contiene lógica de negocio

## 2

El dominio NO depende de React

## 3

El procesamiento pesado NO corre en el main thread

## 4

Cada feature es independiente

---

# 🚀 Roadmap MVP

## Fase 1

* grid básico
* canvas render
* configuración

## Fase 2

* carga de imágenes
* asignación a celdas

## Fase 3

* pan / zoom

## Fase 4

* exportación

---

# 📌 Nota sobre Mobile (Flutter)

La app móvil:

* replicará esta arquitectura
* no compartirá código
* sí compartirá estructura y conceptos

---

# 🧭 Filosofía del proyecto

> "Mismo producto, misma arquitectura, distinta implementación"

---

# 🟢 Siguiente paso

1. Crear proyecto con Vite
2. Implementar estructura base
3. Definir GridLayoutEngine
4. Renderizar primer canvas vacío

---

**Cuadro comienza simple, pero con bases sólidas para crecer.**
