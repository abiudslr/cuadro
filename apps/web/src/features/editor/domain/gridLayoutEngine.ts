import { getCanvasAspectRatio, type GridAspectRatio, type GridOrientation } from './grid'

export type GridLayoutInput = {
  orientation: GridOrientation
  aspectRatio: GridAspectRatio
  rows: number
  columns: number
  marginWidth: number
  containerWidth: number
  containerHeight: number
}

export type GridCellLayout = {
  id: string
  row: number
  column: number
  x: number
  y: number
  width: number
  height: number
}

export type GridLayoutResult = {
  canvasWidth: number
  canvasHeight: number
  cellWidth: number
  cellHeight: number
  marginWidth: number
  cells: GridCellLayout[]
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function round(value: number) {
  return Number(value.toFixed(3))
}

function fitCanvas(containerWidth: number, containerHeight: number, aspectRatio: number) {
  if (containerWidth <= 0 || containerHeight <= 0) {
    return { width: 0, height: 0 }
  }

  const widthFromHeight = containerHeight * aspectRatio

  if (widthFromHeight <= containerWidth) {
    return { width: widthFromHeight, height: containerHeight }
  }

  return { width: containerWidth, height: containerWidth / aspectRatio }
}

export function calculateGridLayout(input: GridLayoutInput): GridLayoutResult {
  const rows = clamp(Math.floor(input.rows), 1, 5)
  const columns = clamp(Math.floor(input.columns), 1, 5)
  const requestedMargin = Math.max(input.marginWidth, 0)
  const canvasAspectRatio = getCanvasAspectRatio(input.aspectRatio, input.orientation)
  const fittedCanvas = fitCanvas(
    Math.max(input.containerWidth, 0),
    Math.max(input.containerHeight, 0),
    canvasAspectRatio
  )

  const maxMarginX = fittedCanvas.width / (columns + 1)
  const maxMarginY = fittedCanvas.height / (rows + 1)
  const safeMargin = Math.min(requestedMargin, maxMarginX, maxMarginY)
  const marginWidth = round(Math.max(safeMargin, 0))
  const cellWidth = round(
    Math.max((fittedCanvas.width - marginWidth * (columns + 1)) / columns, 0)
  )
  const cellHeight = round(
    Math.max((fittedCanvas.height - marginWidth * (rows + 1)) / rows, 0)
  )

  const cells: GridCellLayout[] = []

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      cells.push({
        id: `cell-${row}-${column}`,
        row,
        column,
        x: round(marginWidth + column * (cellWidth + marginWidth)),
        y: round(marginWidth + row * (cellHeight + marginWidth)),
        width: cellWidth,
        height: cellHeight,
      })
    }
  }

  return {
    canvasWidth: round(fittedCanvas.width),
    canvasHeight: round(fittedCanvas.height),
    cellWidth,
    cellHeight,
    marginWidth,
    cells,
  }
}
