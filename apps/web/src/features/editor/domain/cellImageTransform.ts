import type { GridCellLayout } from './gridLayoutEngine'
import type { CellImageTransform, PlacedImage } from './placedImage'

export type CellViewport = Pick<GridCellLayout, 'width' | 'height'>

export type ZoomAnchor = {
  x: number
  y: number
}

export const MIN_CELL_IMAGE_SCALE = 1
export const MAX_CELL_IMAGE_SCALE = 6

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function round(value: number) {
  return Number(value.toFixed(6))
}

function getSafeImageDimensions(image: Pick<PlacedImage, 'width' | 'height'>) {
  const width = Math.max(image.width ?? 0, 0)
  const height = Math.max(image.height ?? 0, 0)

  return {
    width,
    height,
    isValid: width > 0 && height > 0,
  }
}

export function createInitialCellImageTransform(): CellImageTransform {
  return {
    scale: MIN_CELL_IMAGE_SCALE,
    offsetX: 0,
    offsetY: 0,
  }
}

export function getCoverScale(
  cell: CellViewport,
  image: Pick<PlacedImage, 'width' | 'height'>
) {
  const { width, height, isValid } = getSafeImageDimensions(image)

  if (!isValid || cell.width <= 0 || cell.height <= 0) {
    return 1
  }

  return Math.max(cell.width / width, cell.height / height)
}

export function getCellImageMetrics(
  cell: CellViewport,
  image: Pick<PlacedImage, 'width' | 'height'>,
  transform: CellImageTransform
) {
  const { width, height, isValid } = getSafeImageDimensions(image)
  const safeScale = clamp(transform.scale, MIN_CELL_IMAGE_SCALE, MAX_CELL_IMAGE_SCALE)
  const coverScale = getCoverScale(cell, image)
  const renderedWidth = isValid ? width * coverScale * safeScale : 0
  const renderedHeight = isValid ? height * coverScale * safeScale : 0
  const maxOffsetXPx = Math.max((renderedWidth - cell.width) / 2, 0)
  const maxOffsetYPx = Math.max((renderedHeight - cell.height) / 2, 0)
  const maxOffsetX = cell.width > 0 ? maxOffsetXPx / cell.width : 0
  const maxOffsetY = cell.height > 0 ? maxOffsetYPx / cell.height : 0
  const offsetX = clamp(transform.offsetX, -maxOffsetX, maxOffsetX)
  const offsetY = clamp(transform.offsetY, -maxOffsetY, maxOffsetY)

  return {
    coverScale,
    renderedWidth,
    renderedHeight,
    scale: safeScale,
    offsetX,
    offsetY,
    translateX: offsetX * cell.width,
    translateY: offsetY * cell.height,
    maxOffsetX,
    maxOffsetY,
  }
}

export function clampCellImageTransform(
  cell: CellViewport,
  image: Pick<PlacedImage, 'width' | 'height'>,
  transform: CellImageTransform
) {
  const metrics = getCellImageMetrics(cell, image, transform)

  return {
    scale: round(metrics.scale),
    offsetX: round(metrics.offsetX),
    offsetY: round(metrics.offsetY),
  }
}

export function panCellImage(
  cell: CellViewport,
  image: Pick<PlacedImage, 'width' | 'height'>,
  transform: CellImageTransform,
  deltaX: number,
  deltaY: number
) {
  const nextTransform = {
    ...transform,
    offsetX: transform.offsetX + (cell.width > 0 ? deltaX / cell.width : 0),
    offsetY: transform.offsetY + (cell.height > 0 ? deltaY / cell.height : 0),
  }

  return clampCellImageTransform(cell, image, nextTransform)
}

export function zoomCellImage(
  cell: CellViewport,
  image: Pick<PlacedImage, 'width' | 'height'>,
  transform: CellImageTransform,
  scaleDelta: number,
  anchor?: ZoomAnchor
) {
  const currentMetrics = getCellImageMetrics(cell, image, transform)
  const nextScale = clamp(
    currentMetrics.scale * scaleDelta,
    MIN_CELL_IMAGE_SCALE,
    MAX_CELL_IMAGE_SCALE
  )

  if (
    !anchor ||
    currentMetrics.renderedWidth <= 0 ||
    currentMetrics.renderedHeight <= 0 ||
    cell.width <= 0 ||
    cell.height <= 0
  ) {
    return clampCellImageTransform(cell, image, {
      ...transform,
      scale: nextScale,
    })
  }

  const anchorX = anchor.x - cell.width / 2
  const anchorY = anchor.y - cell.height / 2
  const relativeX =
    currentMetrics.renderedWidth > 0
      ? (anchorX - currentMetrics.translateX) / currentMetrics.renderedWidth
      : 0
  const relativeY =
    currentMetrics.renderedHeight > 0
      ? (anchorY - currentMetrics.translateY) / currentMetrics.renderedHeight
      : 0
  const nextRenderedWidth =
    currentMetrics.renderedWidth * (nextScale / currentMetrics.scale)
  const nextRenderedHeight =
    currentMetrics.renderedHeight * (nextScale / currentMetrics.scale)
  const nextTranslateX = anchorX - relativeX * nextRenderedWidth
  const nextTranslateY = anchorY - relativeY * nextRenderedHeight

  return clampCellImageTransform(cell, image, {
    scale: nextScale,
    offsetX: cell.width > 0 ? nextTranslateX / cell.width : 0,
    offsetY: cell.height > 0 ? nextTranslateY / cell.height : 0,
  })
}
