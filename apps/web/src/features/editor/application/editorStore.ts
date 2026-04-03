import { create } from 'zustand'

type EditorState = {
    rows: number
    columns: number
    setRows: (rows: number) => void
    setColumns: (columns: number) => void
}

export const useEditorStore = create<EditorState>((set) => ({
    rows: 2,
    columns: 2,

    setRows: (rows) => set({ rows }),
    setColumns: (columns) => set({ columns }),
}))