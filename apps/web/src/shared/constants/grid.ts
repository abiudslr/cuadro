import type {
  GridAspectRatio,
  GridOrientation,
} from '@/features/editor/application/editorStore'

export const aspectRatioDimensions: Record<GridAspectRatio, [number, number]> = {
  '1:1': [1, 1],
  '3:4': [3, 4],
  '4:5': [4, 5],
  '9:16': [9, 16],
  '16:9': [16, 9],
}

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
  { value: '9:16', translationKey: 'editor.config.aspectRatio.ratio9x16' },
  { value: '16:9', translationKey: 'editor.config.aspectRatio.ratio16x9' },
]

export function getPreviewAspectRatio(
  aspectRatio: GridAspectRatio,
  orientation: GridOrientation
) {
  const [width, height] = aspectRatioDimensions[aspectRatio]

  return orientation === 'vertical' ? `${width} / ${height}` : `${height} / ${width}`
}
