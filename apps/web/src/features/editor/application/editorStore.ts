import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { GridAspectRatio, GridOrientation } from '../domain/grid'
import type { PlacedImage, PlacedImagesByCellId } from '../domain/placedImage'

type EditorState = {
  orientation: GridOrientation
  aspectRatio: GridAspectRatio
  rows: number
  columns: number
  marginWidth: number
  marginColor: string
  emptyCellColor: string
  placedImages: PlacedImagesByCellId
  selectedCellId: string | null
  isConfigSheetOpen: boolean
  setOrientation: (orientation: GridOrientation) => void
  setAspectRatio: (aspectRatio: GridAspectRatio) => void
  setRows: (rows: number) => void
  setColumns: (columns: number) => void
  setMarginWidth: (marginWidth: number) => void
  setMarginColor: (marginColor: string) => void
  setEmptyCellColor: (emptyCellColor: string) => void
  placeImage: (image: PlacedImage) => void
  removeImage: (cellId: string) => void
  selectCell: (cellId: string | null) => void
  openConfigSheet: () => void
  closeConfigSheet: () => void
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

function revokeImageUrl(image?: PlacedImage) {
  if (image) {
    URL.revokeObjectURL(image.objectUrl)
  }
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      orientation: 'vertical',
      aspectRatio: '4:5',
      rows: 3,
      columns: 2,
      marginWidth: 12,
      marginColor: '#0f1117',
      emptyCellColor: '#1a1d24',
      placedImages: {},
      selectedCellId: null,
      isConfigSheetOpen: false,
      setOrientation: (orientation) => set({ orientation }),
      setAspectRatio: (aspectRatio) => set({ aspectRatio }),
      setRows: (rows) => set({ rows: clamp(rows, 1, 5) }),
      setColumns: (columns) => set({ columns: clamp(columns, 1, 5) }),
      setMarginWidth: (marginWidth) =>
        set({ marginWidth: clamp(marginWidth, 0, 24) }),
      setMarginColor: (marginColor) => set({ marginColor }),
      setEmptyCellColor: (emptyCellColor) => set({ emptyCellColor }),
      placeImage: (image) =>
        set((state) => {
          revokeImageUrl(state.placedImages[image.cellId])

          return {
            placedImages: {
              ...state.placedImages,
              [image.cellId]: image,
            },
          }
        }),
      removeImage: (cellId) =>
        set((state) => {
          const nextPlacedImages = { ...state.placedImages }
          const image = nextPlacedImages[cellId]

          revokeImageUrl(image)
          delete nextPlacedImages[cellId]

          return {
            placedImages: nextPlacedImages,
            selectedCellId: state.selectedCellId === cellId ? null : state.selectedCellId,
          }
        }),
      selectCell: (cellId) => set({ selectedCellId: cellId }),
      openConfigSheet: () => set({ isConfigSheetOpen: true }),
      closeConfigSheet: () => set({ isConfigSheetOpen: false }),
    }),
    {
      name: 'cuadro-editor-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        orientation: state.orientation,
        aspectRatio: state.aspectRatio,
        rows: state.rows,
        columns: state.columns,
        marginWidth: state.marginWidth,
        marginColor: state.marginColor,
        emptyCellColor: state.emptyCellColor,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Local previews rely on session object URLs, so we always re-enter clean.
          state.placedImages = {}
        }
      },
    }
  )
)
