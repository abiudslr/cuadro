import { create } from "zustand";
import type { GridCell, GridConfig } from "../domain/grid/grid-types";
import type { ImageAsset } from "../domain/image/image-types";

type EditorState = {
    config: GridConfig;
    cells: GridCell[];
    assets: ImageAsset[];
    selectedCellId: string | null;

    setConfig: (patch: Partial<GridConfig>) => void;
    setAssets: (assets: ImageAsset[]) => void;
    addAssets: (assets: ImageAsset[]) => void;
    setSelectedCellId: (cellId: string | null) => void;
    assignImageToCell: (cellId: string, imageId: string | null) => void;
    updateCellTransform: (
        cellId: string,
        patch: Partial<Pick<GridCell, "zoom" | "offsetX" | "offsetY" | "fitMode">>
    ) => void;
    rebuildCells: (rows: number, cols: number) => void;
};

function buildCells(rows: number, cols: number): GridCell[] {
    const cells: GridCell[] = [];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            cells.push({
                id: `cell-${row}-${col}`,
                row,
                col,
                imageId: null,
                fitMode: "cover",
                zoom: 1,
                offsetX: 0,
                offsetY: 0,
            });
        }
    }

    return cells;
}

export const useEditorStore = create<EditorState>((set) => ({
    config: {
        orientation: "vertical",
        aspectRatio: "3:4",
        rows: 2,
        cols: 2,
        gap: 8,
        padding: 16,
        maxResolution: 2048,
    },
    cells: buildCells(2, 2),
    assets: [],
    selectedCellId: null,

    setConfig: (patch) =>
        set((state) => ({
            config: { ...state.config, ...patch },
        })),

    setAssets: (assets) => set({ assets }),

    addAssets: (assets) =>
        set((state) => ({
            assets: [...state.assets, ...assets],
        })),

    setSelectedCellId: (cellId) => set({ selectedCellId: cellId }),

    assignImageToCell: (cellId, imageId) =>
        set((state) => ({
            cells: state.cells.map((cell) =>
                cell.id === cellId ? { ...cell, imageId } : cell
            ),
        })),

    updateCellTransform: (cellId, patch) =>
        set((state) => ({
            cells: state.cells.map((cell) =>
                cell.id === cellId ? { ...cell, ...patch } : cell
            ),
        })),

    rebuildCells: (rows, cols) =>
        set((state) => ({
            config: { ...state.config, rows, cols },
            cells: buildCells(rows, cols),
            selectedCellId: null,
        })),
}));