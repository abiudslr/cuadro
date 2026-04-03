import { getCanvasAspectRatio } from '../domain/grid'
import { getCellImageMetrics } from '../domain/cellImageTransform'
import { calculateGridLayout } from '../domain/gridLayoutEngine'
import type { GridAspectRatio, GridOrientation } from '../domain/grid'
import type { PlacedImage, PlacedImagesByCellId } from '../domain/placedImage'
import { scheduleObjectUrlRevoke } from './objectUrl'

export type ExportImageFormat = 'png' | 'jpeg'
export type ExportResolution = 'standard' | 'high'

export type EditorExportSnapshot = {
  orientation: GridOrientation
  aspectRatio: GridAspectRatio
  rows: number
  columns: number
  marginWidth: number
  marginColor: string
  emptyCellColor: string
  placedImages: PlacedImagesByCellId
}

export type GridExportSize = {
  width: number
  height: number
  maxEdge: number
}

export type ExportGridImageOptions = {
  format: ExportImageFormat
  resolution?: ExportResolution
  quality?: number
  fileName?: string
}

export type ExportGridImageResult = {
  blob: Blob
  width: number
  height: number
  fileName: string
  mimeType: string
}

const EXPORT_RESOLUTION_MAX_EDGE: Record<ExportResolution, number> = {
  standard: 1600,
  high: 2400,
}

function sanitizeDimension(value: number) {
  return Math.max(1, Math.round(value))
}

function getMimeType(format: ExportImageFormat) {
  return format === 'png' ? 'image/png' : 'image/jpeg'
}

function getFileExtension(format: ExportImageFormat) {
  return format === 'png' ? 'png' : 'jpg'
}

function padTimestampPart(value: number) {
  return String(value).padStart(2, '0')
}

function getLocalTimestampForFileName(date: Date) {
  return [
    date.getFullYear(),
    padTimestampPart(date.getMonth() + 1),
    padTimestampPart(date.getDate()),
    padTimestampPart(date.getHours()),
    padTimestampPart(date.getMinutes()),
    padTimestampPart(date.getSeconds()),
  ].join('')
}

function buildDefaultFileName(
  _snapshot: EditorExportSnapshot,
  format: ExportImageFormat
) {
  return `cuadro_${getLocalTimestampForFileName(new Date())}.${getFileExtension(format)}`
}

async function loadRenderableImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      resolve(image)
    }

    image.onerror = () => {
      reject(new Error('Unable to load one of the placed images for export.'))
    }

    image.src = src
  })
}

type LoadedExportImage = {
  drawable: CanvasImageSource
  cleanup: () => void
}

type ExportImageSource =
  | {
      kind: 'working'
      requiredLongestSide: number
      url: string
    }
  | {
      kind: 'original'
      requiredLongestSide: number
      file: File
    }

async function loadRenderableImageFromFile(file: File): Promise<LoadedExportImage> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file)

    return {
      drawable: bitmap,
      cleanup: () => bitmap.close(),
    }
  }

  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await loadRenderableImage(objectUrl)

    return {
      drawable: image,
      cleanup: () => scheduleObjectUrlRevoke(objectUrl),
    }
  } catch (error) {
    scheduleObjectUrlRevoke(objectUrl)
    throw error
  }
}

async function loadExportImageSource(
  source: ExportImageSource
): Promise<LoadedExportImage> {
  if (source.kind === 'original') {
    return loadRenderableImageFromFile(source.file)
  }

  const image = await loadRenderableImage(source.url)

  return {
    drawable: image,
    cleanup: () => {},
  }
}

function getRequiredExportSourceLongestSide(
  image: PlacedImage,
  cell: { width: number; height: number }
) {
  const metrics = getCellImageMetrics(cell, image, image.transform)

  return Math.max(
    1,
    Math.ceil(Math.max(metrics.renderedWidth, metrics.renderedHeight))
  )
}

function selectExportImageSource(
  image: PlacedImage,
  cell: { width: number; height: number }
): ExportImageSource {
  const requiredLongestSide = Math.min(
    getRequiredExportSourceLongestSide(image, cell),
    image.original.originalLongestSide
  )

  if (image.working.workingLongestSide >= requiredLongestSide) {
    return {
      kind: 'working',
      requiredLongestSide,
      url: image.working.workingUrl,
    }
  }

  return {
    kind: 'original',
    requiredLongestSide,
    file: image.original.file,
  }
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Unable to generate the exported image.'))
          return
        }

        resolve(blob)
      },
      mimeType,
      quality
    )
  })
}

export function getGridExportSize(
  snapshot: Pick<EditorExportSnapshot, 'aspectRatio' | 'orientation'>,
  resolution: ExportResolution = 'standard'
): GridExportSize {
  const maxEdge = EXPORT_RESOLUTION_MAX_EDGE[resolution]
  const aspectRatio = getCanvasAspectRatio(snapshot.aspectRatio)

  if (aspectRatio >= 1) {
    return {
      width: maxEdge,
      height: sanitizeDimension(maxEdge / aspectRatio),
      maxEdge,
    }
  }

  return {
    width: sanitizeDimension(maxEdge * aspectRatio),
    height: maxEdge,
    maxEdge,
  }
}

export async function exportGridImage(
  snapshot: EditorExportSnapshot,
  options: ExportGridImageOptions
): Promise<ExportGridImageResult> {
  const resolution = options.resolution ?? 'standard'
  const size = getGridExportSize(snapshot, resolution)
  const mimeType = getMimeType(options.format)
  const fileName =
    options.fileName?.trim() || buildDefaultFileName(snapshot, options.format)
  const layout = calculateGridLayout({
    orientation: snapshot.orientation,
    aspectRatio: snapshot.aspectRatio,
    rows: snapshot.rows,
    columns: snapshot.columns,
    marginWidth: snapshot.marginWidth,
    containerWidth: size.width,
    containerHeight: size.height,
  })
  const canvas = document.createElement('canvas')

  canvas.width = sanitizeDimension(layout.canvasWidth)
  canvas.height = sanitizeDimension(layout.canvasHeight)

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas export is not supported in this browser.')
  }

  context.imageSmoothingEnabled = true
  context.imageSmoothingQuality = 'high'
  context.fillStyle = snapshot.marginColor
  context.fillRect(0, 0, canvas.width, canvas.height)

  for (const cell of layout.cells) {
    const image = snapshot.placedImages[cell.id]

    if (!image) {
      context.fillStyle = snapshot.emptyCellColor
      context.fillRect(cell.x, cell.y, cell.width, cell.height)
      continue
    }

    context.fillStyle = snapshot.marginColor
    context.fillRect(cell.x, cell.y, cell.width, cell.height)

    const exportSource = selectExportImageSource(image, cell)
    const renderableImage = await loadExportImageSource(exportSource)
    const metrics = getCellImageMetrics(cell, image, image.transform)
    const drawX = cell.x + cell.width / 2 - metrics.renderedWidth / 2 + metrics.translateX
    const drawY = cell.y + cell.height / 2 - metrics.renderedHeight / 2 + metrics.translateY

    try {
      context.save()
      try {
        context.beginPath()
        context.rect(cell.x, cell.y, cell.width, cell.height)
        context.clip()
        context.drawImage(
          renderableImage.drawable,
          drawX,
          drawY,
          metrics.renderedWidth,
          metrics.renderedHeight
        )
      } finally {
        context.restore()
      }
    } finally {
      renderableImage.cleanup()
    }
  }

  return {
    blob: await canvasToBlob(
      canvas,
      mimeType,
      options.format === 'jpeg' ? options.quality ?? 0.92 : undefined
    ),
    width: canvas.width,
    height: canvas.height,
    fileName,
    mimeType,
  }
}
