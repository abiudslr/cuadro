import { create } from "zustand";
import { createGridConfigFromSetup } from "../domain/grid/grid-presets";
import type {
    EditorMode,
    GridCell,
    GridConfig,
    GridSetupDraft,
} from "../domain/grid/grid-types";
import type { ImageAsset } from "../domain/image/image-types";

type EditorState = {
    mode: EditorMode;
    setup: GridSetupDraft;
    config: GridConfig;
    cells: GridCell[];
    assets: ImageAsset[];
    selectedCellId: string | null;

    setMode: (mode: EditorMode) => void;
    updateSetup: (patch: Partial<GridSetupDraft>) => void;
    commitSetup: () => void;
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
    mode: "setup",
    setup: {
        orientation: "vertical",
        presetKey: "portrait",
        rows: 2,
        cols: 2,
    },
    config: {
        orientation: "vertical",
        aspectRatio: "4:5",
        rows: 2,
        cols: 2,
        gap: 12,
        padding: 16,
        maxResolution: 1350,
    },
    cells: buildCells(2, 2),
    assets: [],
    selectedCellId: null,

    setMode: (mode) => set({ mode }),

    updateSetup: (patch) =>
        set((state) => ({
            setup: { ...state.setup, ...patch },
        })),

    commitSetup: () =>
        set((state) => {
            const config = createGridConfigFromSetup(state.setup, state.config);

            return {
                mode: "editor",
                config,
                cells: buildCells(state.setup.rows, state.setup.cols),
                selectedCellId: null,
            };
        }),

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
                cell.id === cellId
                    ? {
                        ...cell,
                        imageId,
                        fitMode: "cover",
                        zoom: 1,
                        offsetX: 0,
                        offsetY: 0,
                    }
                    : cell
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
            setup: { ...state.setup, rows, cols },
            config: { ...state.config, rows, cols },
            cells: buildCells(rows, cols),
            selectedCellId: null,
        })),
}));
