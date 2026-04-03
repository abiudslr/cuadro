export type GridOrientation = 'vertical' | 'horizontal'
export type GridAspectRatio = '1:1' | '3:4' | '4:5' | '9:16' | '16:9'

export const aspectRatioDimensions: Record<GridAspectRatio, [number, number]> = {
  '1:1': [1, 1],
  '3:4': [3, 4],
  '4:5': [4, 5],
  '9:16': [9, 16],
  '16:9': [16, 9],
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
