import {
  IMAGE_PREPARATION_VERSION,
  calculateWorkingImageTarget,
  type ImagePreparationPolicyConfig,
} from './imagePreparationPolicy'
import { scheduleObjectUrlRevoke } from './objectUrl'
import type {
  ImagePreparationMetadata,
  OriginalImageMetadata,
  PlacedImage,
  WorkingImageMetadata,
} from '../domain/placedImage'

type ImageSource = {
  drawable: CanvasImageSource
  width: number
  height: number
  cleanup: () => void
}

type RenderSurface = {
  width: number
  height: number
  context: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D
  toBlob: (mimeType: string, quality?: number) => Promise<Blob>
}

export type PreparePlacedImageInput = {
  cellId: string
  file: File
  cellLongestSide: number
  devicePixelRatio?: number
  zoomBudget?: number
  config?: Partial<ImagePreparationPolicyConfig>
}

export type UpgradePlacedImageWorkingCopyInput = {
  image: PlacedImage
  cellLongestSide: number
  devicePixelRatio?: number
  zoomBudget?: number
  config?: Partial<ImagePreparationPolicyConfig>
}

export type PreparedWorkingImage = {
  working: WorkingImageMetadata
  preparation: ImagePreparationMetadata
}

function createImageId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `placed-image-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function getLongestSide(width: number, height: number) {
  return Math.max(width, height)
}

function round(value: number) {
  return Math.round(value)
}

function getTargetDimensions(width: number, height: number, targetLongestSide: number) {
  const originalLongestSide = getLongestSide(width, height)

  if (originalLongestSide <= 0) {
    return { width: 0, height: 0 }
  }

  if (targetLongestSide >= originalLongestSide) {
    return {
      width,
      height,
    }
  }

  const scale = targetLongestSide / originalLongestSide

  return {
    width: Math.max(round(width * scale), 1),
    height: Math.max(round(height * scale), 1),
  }
}

async function loadImageSourceFromFile(file: File): Promise<ImageSource> {
  const objectUrl = URL.createObjectURL(file)

  return new Promise<ImageSource>((resolve, reject) => {
    const image = new Image()

    image.decoding = 'async'

    image.onload = () => {
      resolve({
        drawable: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        cleanup: () => URL.revokeObjectURL(objectUrl),
      })
    }

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Unable to read selected image.'))
    }

    image.src = objectUrl
  })
}

function createRenderSurface(width: number, height: number): RenderSurface {
  const canvas = document.createElement('canvas')

  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Canvas image preparation is not supported in this browser.')
  }

  return {
    width: canvas.width,
    height: canvas.height,
    context,
    toBlob: (mimeType, quality) =>
      new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Unable to prepare the selected image.'))
              return
            }

            resolve(blob)
          },
          mimeType,
          quality
        )
      }),
  }
}

async function createWorkingImageFromFile(
  file: File,
  original: Pick<
    OriginalImageMetadata,
    'originalWidth' | 'originalHeight' | 'originalLongestSide' | 'mimeType'
  >,
  targetLongestSide: number
): Promise<WorkingImageMetadata> {
  if (targetLongestSide >= original.originalLongestSide) {
    return {
      workingUrl: URL.createObjectURL(file),
      workingWidth: original.originalWidth,
      workingHeight: original.originalHeight,
      workingLongestSide: original.originalLongestSide,
    }
  }

  const source = await loadImageSourceFromFile(file)

  try {
    const targetDimensions = getTargetDimensions(
      source.width,
      source.height,
      targetLongestSide
    )
    const surface = createRenderSurface(
      targetDimensions.width,
      targetDimensions.height
    )
    const context = surface.context

    context.imageSmoothingEnabled = true
    context.imageSmoothingQuality = 'high'
    context.drawImage(source.drawable, 0, 0, surface.width, surface.height)
    const blob = await surface.toBlob(
      file.type || original.mimeType || 'image/jpeg',
      0.92
    )

    return {
      workingUrl: URL.createObjectURL(blob),
      workingWidth: surface.width,
      workingHeight: surface.height,
      workingLongestSide: getLongestSide(surface.width, surface.height),
    }
  } finally {
    source.cleanup()
  }
}

export async function readOriginalImageMetadata(file: File): Promise<OriginalImageMetadata> {
  const source = await loadImageSourceFromFile(file)

  try {
    return {
      originalWidth: source.width,
      originalHeight: source.height,
      originalLongestSide: getLongestSide(source.width, source.height),
      file,
      mimeType: file.type || undefined,
      name: file.name || undefined,
    }
  } finally {
    source.cleanup()
  }
}

export async function preparePlacedImageWorkingCopy(
  input: PreparePlacedImageInput
): Promise<PlacedImage> {
  const original = await readOriginalImageMetadata(input.file)
  const target = calculateWorkingImageTarget({
    cellLongestSide: input.cellLongestSide,
    originalLongestSide: original.originalLongestSide,
    devicePixelRatio: input.devicePixelRatio,
    zoomBudget: input.zoomBudget,
    config: input.config,
  })
  const working = await createWorkingImageFromFile(
    input.file,
    original,
    target.targetLongestSide
  )

  return {
    id: createImageId(),
    cellId: input.cellId,
    original,
    working,
    preparation: {
      preparedForCellLongestSide: input.cellLongestSide,
      preparedForZoomBudget: target.zoomBudget,
      effectiveDprUsed: target.effectiveDpr,
      preparationVersion: IMAGE_PREPARATION_VERSION,
    },
    transform: {
      offsetX: 0,
      offsetY: 0,
      scale: 1,
    },
  }
}

export async function upgradePlacedImageWorkingCopy(
  input: UpgradePlacedImageWorkingCopyInput
): Promise<PreparedWorkingImage> {
  const target = calculateWorkingImageTarget({
    cellLongestSide: input.cellLongestSide,
    originalLongestSide: input.image.original.originalLongestSide,
    devicePixelRatio: input.devicePixelRatio,
    zoomBudget: input.zoomBudget,
    config: input.config,
  })
  const working = await createWorkingImageFromFile(
    input.image.original.file,
    input.image.original,
    target.targetLongestSide
  )

  return {
    working,
    preparation: {
      preparedForCellLongestSide: input.cellLongestSide,
      preparedForZoomBudget: target.zoomBudget,
      effectiveDprUsed: target.effectiveDpr,
      preparationVersion: IMAGE_PREPARATION_VERSION,
    },
  }
}

export function discardPreparedWorkingImage(working?: Pick<WorkingImageMetadata, 'workingUrl'>) {
  scheduleObjectUrlRevoke(working?.workingUrl)
}
