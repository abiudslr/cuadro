import type { PlacedImage } from '../domain/placedImage'

function createImageId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `placed-image-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function readImageDimensions(objectUrl: string) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
      })
    }

    image.onerror = () => {
      reject(new Error('Unable to read selected image.'))
    }

    image.src = objectUrl
  })
}

export async function loadPlacedImageFile(file: File, cellId: string): Promise<PlacedImage> {
  const objectUrl = URL.createObjectURL(file)

  try {
    const { width, height } = await readImageDimensions(objectUrl)

    return {
      id: createImageId(),
      cellId,
      objectUrl,
      name: file.name,
      width,
      height,
      mimeType: file.type || undefined,
      transform: {
        offsetX: 0,
        offsetY: 0,
        scale: 1,
      },
    }
  } catch (error) {
    URL.revokeObjectURL(objectUrl)
    throw error
  }
}
