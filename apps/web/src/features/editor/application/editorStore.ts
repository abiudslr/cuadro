import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { scheduleObjectUrlRevoke } from './objectUrl'
import {
  getDefaultAspectRatioForOrientation,
  normalizeAspectRatioForOrientation,
  type GridAspectRatio,
  type GridOrientation,
} from '../domain/grid'
import {
  clampCellImageTransform,
  createInitialCellImageTransform,
  panCellImage,
  zoomCellImage,
  type CellViewport,
  type ZoomAnchor,
} from '../domain/cellImageTransform'
import type { GridCellLayout } from '../domain/gridLayoutEngine'
import type {
  CellImageTransform,
  ImagePreparationMetadata,
  PlacedImage,
  PlacedImagesByCellId,
  WorkingImageMetadata,
} from '../domain/placedImage'

type EditorState = {
  orientation: GridOrientation
  aspectRatio: GridAspectRatio
  rows: number
  columns: number
  marginWidth: number
  marginColor: string
  emptyCellColor: string
  placedImages: PlacedImagesByCellId
  preparingCellIds: Record<string, boolean>
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
  updateWorkingImage: (
    cellId: string,
    working: WorkingImageMetadata,
    preparation: ImagePreparationMetadata
  ) => void
  setCellPreparing: (cellId: string, isPreparing: boolean) => void
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
    scheduleObjectUrlRevoke(image.working.workingUrl)
  }
}

function isSameTransform(
  current: CellImageTransform,
  next: CellImageTransform
) {
  return (
    current.scale === next.scale &&
    current.offsetX === next.offsetX &&
    current.offsetY === next.offsetY
  )
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
      aspectRatio: getDefaultAspectRatioForOrientation('vertical'),
      rows: 3,
      columns: 2,
      marginWidth: 12,
      marginColor: '#0f1117',
      emptyCellColor: '#1a1d24',
      placedImages: {},
      preparingCellIds: {},
      selectedCellId: null,
      isConfigSheetOpen: false,
      setOrientation: (orientation) =>
        set((state) => ({
          orientation,
          aspectRatio: normalizeAspectRatioForOrientation(
            state.aspectRatio,
            orientation
          ),
        })),
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
            preparingCellIds: {
              ...state.preparingCellIds,
              [image.cellId]: false,
            },
            selectedCellId: image.cellId,
          }
        }),
      updateWorkingImage: (cellId, working, preparation) =>
        set((state) => {
          const image = state.placedImages[cellId]

          if (!image) {
            scheduleObjectUrlRevoke(working.workingUrl)

            return state
          }

          if (image.working.workingUrl === working.workingUrl) {
            return state
          }

          revokeImageUrl(image)

          return {
            placedImages: {
              ...state.placedImages,
              [cellId]: {
                ...image,
                working,
                preparation,
              },
            },
          }
        }),
      setCellPreparing: (cellId, isPreparing) =>
        set((state) => {
          if (state.preparingCellIds[cellId] === isPreparing) {
            return state
          }

          return {
            preparingCellIds: {
              ...state.preparingCellIds,
              [cellId]: isPreparing,
            },
          }
        }),
      removeImage: (cellId) =>
        set((state) => {
          const nextPlacedImages = { ...state.placedImages }
          const nextPreparingCellIds = { ...state.preparingCellIds }
          const image = nextPlacedImages[cellId]

          revokeImageUrl(image)
          delete nextPlacedImages[cellId]
          delete nextPreparingCellIds[cellId]

          return {
            placedImages: nextPlacedImages,
            preparingCellIds: nextPreparingCellIds,
            selectedCellId: state.selectedCellId === cellId ? null : state.selectedCellId,
          }
        }),
      selectCell: (cellId) => set({ selectedCellId: cellId }),
      resetImageTransform: (cellId, cell) =>
        set((state) => ({
          placedImages: updatePlacedImage(state, cellId, (image) => {
            const nextTransform = clampCellImageTransform(
              cell,
              image,
              createInitialCellImageTransform()
            )

            if (isSameTransform(image.transform, nextTransform)) {
              return image
            }

            return {
              ...image,
              transform: nextTransform,
            }
          }),
        })),
      panImage: (cellId, cell, deltaX, deltaY) =>
        set((state) => ({
          placedImages: updatePlacedImage(state, cellId, (image) => {
            const nextTransform = panCellImage(
              cell,
              image,
              image.transform,
              deltaX,
              deltaY
            )

            if (isSameTransform(image.transform, nextTransform)) {
              return image
            }

            return {
              ...image,
              transform: nextTransform,
            }
          }),
        })),
      zoomImage: (cellId, cell, scaleDelta, anchor) =>
        set((state) => ({
          placedImages: updatePlacedImage(state, cellId, (image) => {
            const nextTransform = zoomCellImage(
              cell,
              image,
              image.transform,
              scaleDelta,
              anchor
            )

            if (isSameTransform(image.transform, nextTransform)) {
              return image
            }

            return {
              ...image,
              transform: nextTransform,
            }
          }),
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
          state.preparingCellIds = {}
        }
      },
    }
  )
)

export const selectCellImage = (cellId: string) => (state: EditorState) =>
  state.placedImages[cellId]

export const selectCellIsPreparing = (cellId: string) => (state: EditorState) =>
  Boolean(state.preparingCellIds[cellId])

export const selectCellIsSelected = (cellId: string) => (state: EditorState) =>
  state.selectedCellId === cellId
