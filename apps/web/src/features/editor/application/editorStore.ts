import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type GridOrientation = 'vertical' | 'horizontal'
export type GridAspectRatio = '1:1' | '3:4' | '4:5' | '9:16' | '16:9'

type EditorState = {
  orientation: GridOrientation
  aspectRatio: GridAspectRatio
  rows: number
  columns: number
  marginWidth: number
  marginColor: string
  emptyCellColor: string
  isConfigSheetOpen: boolean
  setOrientation: (orientation: GridOrientation) => void
  setAspectRatio: (aspectRatio: GridAspectRatio) => void
  setRows: (rows: number) => void
  setColumns: (columns: number) => void
  setMarginWidth: (marginWidth: number) => void
  setMarginColor: (marginColor: string) => void
  setEmptyCellColor: (emptyCellColor: string) => void
  openConfigSheet: () => void
  closeConfigSheet: () => void
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max)

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
      isConfigSheetOpen: false,
      setOrientation: (orientation) => set({ orientation }),
      setAspectRatio: (aspectRatio) => set({ aspectRatio }),
      setRows: (rows) => set({ rows: clamp(rows, 1, 5) }),
      setColumns: (columns) => set({ columns: clamp(columns, 1, 5) }),
      setMarginWidth: (marginWidth) =>
        set({ marginWidth: clamp(marginWidth, 0, 24) }),
      setMarginColor: (marginColor) => set({ marginColor }),
      setEmptyCellColor: (emptyCellColor) => set({ emptyCellColor }),
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
    }
  )
)
