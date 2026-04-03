import { preparePlacedImageWorkingCopy } from './imagePreparationService'
import type { PlacedImage } from '../domain/placedImage'

export type LoadPlacedImageFileInput = {
  file: File
  cellId: string
  cellLongestSide: number
  devicePixelRatio?: number
  zoomBudget?: number
}

export async function loadPlacedImageFile(
  input: LoadPlacedImageFileInput
): Promise<PlacedImage> {
  return preparePlacedImageWorkingCopy(input)
}
