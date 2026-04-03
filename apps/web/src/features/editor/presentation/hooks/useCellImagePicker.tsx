import { useRef, useState, type ChangeEvent } from 'react'
import { loadPlacedImageFile } from '../../application/loadPlacedImageFile'
import type { PlacedImage } from '../../domain/placedImage'

type UseCellImagePickerOptions = {
  onImageSelected: (image: PlacedImage) => void
}

export function useCellImagePicker({ onImageSelected }: UseCellImagePickerOptions) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const pendingCellIdRef = useRef<string | null>(null)
  const [activeCellId, setActiveCellId] = useState<string | null>(null)

  const openFilePicker = (cellId: string) => {
    pendingCellIdRef.current = cellId

    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.click()
    }
  }

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files ?? [])
    const cellId = pendingCellIdRef.current

    event.target.value = ''

    if (!file || !cellId) {
      pendingCellIdRef.current = null
      setActiveCellId(null)
      return
    }

    pendingCellIdRef.current = null
    setActiveCellId(cellId)

    try {
      const image = await loadPlacedImageFile(file, cellId)
      onImageSelected(image)
    } finally {
      setActiveCellId(null)
    }
  }

  const input = (
    <input
      ref={inputRef}
      accept="image/*"
      hidden
      type="file"
      onChange={handleInputChange}
    />
  )

  return {
    activeCellId,
    input,
    openFilePicker,
  }
}
