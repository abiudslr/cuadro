import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  clampCellImageTransform,
  createInitialCellImageTransform,
  panCellImage,
  zoomCellImage,
  type CellViewport,
  type ZoomAnchor,
} from '../domain/cellImageTransform'
import type { GridCellLayout } from '../domain/gridLayoutEngine'
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
  resetImageTransform: (cellId: string, cell: CellViewport) => void
  panImage: (cellId: string, cell: CellViewport, deltaX: number, deltaY: number) => void
  zoomImage: (
    cellId: string,
    cell: CellViewport,
    scaleDelta: number,
    anchor?: ZoomAnchor
  ) => void
  syncPlacedImagesToLayout: (cells: GridCellLayout[]) => void
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

function updatePlacedImage(
  state: Pick<EditorState, 'placedImages'>,
  cellId: string,
  updater: (image: PlacedImage) => PlacedImage
) {
  const image = state.placedImages[cellId]

  if (!image) {
    return state.placedImages
  }

  const nextImage = updater(image)

  if (nextImage === image) {
    return state.placedImages
  }

  return {
    ...state.placedImages,
    [cellId]: nextImage,
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
              [image.cellId]: {
                ...image,
                transform: createInitialCellImageTransform(),
              },
            },
            selectedCellId: image.cellId,
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
      resetImageTransform: (cellId, cell) =>
        set((state) => ({
          placedImages: updatePlacedImage(state, cellId, (image) => ({
            ...image,
            transform: clampCellImageTransform(
              cell,
              image,
              createInitialCellImageTransform()
            ),
          })),
        })),
      panImage: (cellId, cell, deltaX, deltaY) =>
        set((state) => ({
          placedImages: updatePlacedImage(state, cellId, (image) => ({
            ...image,
            transform: panCellImage(cell, image, image.transform, deltaX, deltaY),
          })),
        })),
      zoomImage: (cellId, cell, scaleDelta, anchor) =>
        set((state) => ({
          placedImages: updatePlacedImage(state, cellId, (image) => ({
            ...image,
            transform: zoomCellImage(cell, image, image.transform, scaleDelta, anchor),
          })),
        })),
      syncPlacedImagesToLayout: (cells) =>
        set((state) => {
          const cellsById = new Map(cells.map((cell) => [cell.id, cell]))
          let hasChanged = false
          const nextPlacedImages: PlacedImagesByCellId = { ...state.placedImages }

          for (const [cellId, image] of Object.entries(state.placedImages)) {
            if (!image) {
              continue
            }

            const cell = cellsById.get(cellId)

            if (!cell) {
              continue
            }

            const nextTransform = clampCellImageTransform(cell, image, image.transform)

            if (
              nextTransform.scale !== image.transform.scale ||
              nextTransform.offsetX !== image.transform.offsetX ||
              nextTransform.offsetY !== image.transform.offsetY
            ) {
              nextPlacedImages[cellId] = {
                ...image,
                transform: nextTransform,
              }
              hasChanged = true
            }
          }

          return hasChanged ? { placedImages: nextPlacedImages } : state
        }),
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
