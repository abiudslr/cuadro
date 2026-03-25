import type {
    AspectRatioKey,
    GridConfig,
    GridPresetKey,
    GridSetupDraft,
} from "./grid-types";

export type GridPresetDefinition = {
    key: GridPresetKey;
    label: string;
    description: string;
    aspectRatio: AspectRatioKey;
    maxResolution: number;
};

export const GRID_PRESETS: GridPresetDefinition[] = [
    {
        key: "story",
        label: "Story",
        description: "Pantalla completa para historias y reels.",
        aspectRatio: "9:16",
        maxResolution: 1920,
    },
    {
        key: "portrait",
        label: "Post vertical",
        description: "El formato mas usado para feeds sociales.",
        aspectRatio: "4:5",
        maxResolution: 1350,
    },
    {
        key: "square",
        label: "Post cuadrado",
        description: "Ideal para grillas limpias en el feed.",
        aspectRatio: "1:1",
        maxResolution: 1440,
    },
    {
        key: "landscape",
        label: "Landscape",
        description: "Perfecto para thumbnails o contenido horizontal.",
        aspectRatio: "16:9",
        maxResolution: 1920,
    },
    {
        key: "banner",
        label: "Banner",
        description: "Formato ancho para portadas o headers.",
        aspectRatio: "3:2",
        maxResolution: 2048,
    },
];

const GRID_PRESET_MAP: Record<GridPresetKey, GridPresetDefinition> = GRID_PRESETS.reduce(
    (acc, preset) => {
        acc[preset.key] = preset;
        return acc;
    },
    {} as Record<GridPresetKey, GridPresetDefinition>
);

export function getGridPreset(presetKey: GridPresetKey): GridPresetDefinition {
    return GRID_PRESET_MAP[presetKey];
}

export function createGridConfigFromSetup(
    setup: GridSetupDraft,
    currentConfig?: GridConfig
): GridConfig {
    const preset = getGridPreset(setup.presetKey);

    return {
        orientation: setup.orientation,
        aspectRatio: preset.aspectRatio,
        rows: setup.rows,
        cols: setup.cols,
        gap: currentConfig?.gap ?? 12,
        padding: currentConfig?.padding ?? 16,
        maxResolution: preset.maxResolution,
    };
}
