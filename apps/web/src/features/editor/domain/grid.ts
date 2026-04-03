export type GridOrientation = 'vertical' | 'horizontal'
export type GridAspectRatio =
  | '1:1'
  | '3:4'
  | '4:5'
  | '5:4'
  | '4:3'
  | '9:16'
  | '16:9'

export const aspectRatioDimensions: Record<GridAspectRatio, [number, number]> = {
  '1:1': [1, 1],
  '3:4': [3, 4],
  '4:5': [4, 5],
  '5:4': [5, 4],
  '4:3': [4, 3],
  '9:16': [9, 16],
  '16:9': [16, 9],
}

export const aspectRatiosByOrientation: Record<
  GridOrientation,
  GridAspectRatio[]
> = {
  vertical: ['1:1', '3:4', '4:5', '9:16'],
  horizontal: ['1:1', '5:4', '4:3', '16:9'],
}

export function getAllowedAspectRatios(orientation: GridOrientation) {
  return aspectRatiosByOrientation[orientation]
}

export function getDefaultAspectRatioForOrientation(
  orientation: GridOrientation
): GridAspectRatio {
  return orientation === 'vertical' ? '3:4' : '16:9'
}

export function normalizeAspectRatioForOrientation(
  aspectRatio: GridAspectRatio,
  orientation: GridOrientation
): GridAspectRatio {
  return getAllowedAspectRatios(orientation).includes(aspectRatio)
    ? aspectRatio
    : getDefaultAspectRatioForOrientation(orientation)
}

export function getCanvasAspectRatio(
  aspectRatio: GridAspectRatio,
  orientation: GridOrientation
) {
  const [baseWidth, baseHeight] = aspectRatioDimensions[aspectRatio]

  return orientation === 'vertical'
    ? baseWidth / baseHeight
    : baseHeight / baseWidth
}
