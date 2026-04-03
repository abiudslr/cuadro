import type {
  GridAspectRatio,
  GridOrientation,
} from '@/features/editor/domain/grid'
import { getAllowedAspectRatios } from '@/features/editor/domain/grid'

export const orientationOptions: Array<{
  value: GridOrientation
  translationKey: string
}> = [
  { value: 'vertical', translationKey: 'editor.config.orientation.vertical' },
  { value: 'horizontal', translationKey: 'editor.config.orientation.horizontal' },
]

export const aspectRatioOptions: Array<{
  value: GridAspectRatio
  translationKey: string
}> = [
  { value: '1:1', translationKey: 'editor.config.aspectRatio.square' },
  { value: '3:4', translationKey: 'editor.config.aspectRatio.ratio3x4' },
  { value: '4:5', translationKey: 'editor.config.aspectRatio.ratio4x5' },
  { value: '5:4', translationKey: 'editor.config.aspectRatio.ratio5x4' },
  { value: '4:3', translationKey: 'editor.config.aspectRatio.ratio4x3' },
  { value: '9:16', translationKey: 'editor.config.aspectRatio.ratio9x16' },
  { value: '16:9', translationKey: 'editor.config.aspectRatio.ratio16x9' },
]

export function getAspectRatioOptions(orientation: GridOrientation) {
  const allowedAspectRatios = new Set(getAllowedAspectRatios(orientation))

  return aspectRatioOptions.filter((option) => allowedAspectRatios.has(option.value))
}
