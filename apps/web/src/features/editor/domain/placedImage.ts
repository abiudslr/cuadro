export type CellImageTransform = {
  offsetX: number
  offsetY: number
  scale: number
}

export type PlacedImage = {
  id: string
  cellId: string
  objectUrl: string
  name?: string
  width?: number
  height?: number
  mimeType?: string
  transform: CellImageTransform
}

export type PlacedImagesByCellId = Record<string, PlacedImage | undefined>
