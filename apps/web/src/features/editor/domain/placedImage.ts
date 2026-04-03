export type CellImageTransform = {
  offsetX: number
  offsetY: number
  scale: number
}

export type OriginalImageMetadata = {
  originalWidth: number
  originalHeight: number
  originalLongestSide: number
  file: File
  mimeType?: string
  name?: string
}

export type WorkingImageMetadata = {
  workingUrl: string
  workingWidth: number
  workingHeight: number
  workingLongestSide: number
}

export type ImagePreparationMetadata = {
  preparedForCellLongestSide: number
  preparedForZoomBudget: number
  effectiveDprUsed: number
  preparationVersion: number
}

export type PlacedImage = {
  id: string
  cellId: string
  original: OriginalImageMetadata
  working: WorkingImageMetadata
  preparation: ImagePreparationMetadata
  transform: CellImageTransform
}

export type PlacedImagesByCellId = Record<string, PlacedImage | undefined>
