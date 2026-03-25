export type Orientation = "vertical" | "horizontal";
export type EditorMode = "setup" | "editor";

export type AspectRatioKey =
    | "1:1"
    | "3:4"
    | "4:5"
    | "16:9"
    | "9:16"
    | "2:3"
    | "3:2";

export type FitMode = "cover" | "contain";

export type GridPresetKey =
    | "story"
    | "portrait"
    | "square"
    | "landscape"
    | "banner";

export type GridSetupDraft = {
    orientation: Orientation;
    presetKey: GridPresetKey;
    rows: number;
    cols: number;
};

export type GridConfig = {
    orientation: Orientation;
    aspectRatio: AspectRatioKey;
    rows: number;
    cols: number;
    gap: number;
    padding: number;
    maxResolution: number;
};

export type GridCell = {
    id: string;
    row: number;
    col: number;
    imageId: string | null;
    fitMode: FitMode;
    zoom: number;
    offsetX: number;
    offsetY: number;
};

export type GridRect = {
    x: number;
    y: number;
    width: number;
    height: number;
};

export type ComputedGridLayout = {
    canvasWidth: number;
    canvasHeight: number;
    cellWidth: number;
    cellHeight: number;
    cells: Array<{
        id: string;
        row: number;
        col: number;
        rect: GridRect;
    }>;
};
