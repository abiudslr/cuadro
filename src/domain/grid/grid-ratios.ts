import type { AspectRatioKey } from "./grid-types";

export const GRID_RATIOS: Record<AspectRatioKey, { width: number; height: number }> = {
    "1:1": { width: 1, height: 1 },
    "3:4": { width: 3, height: 4 },
    "4:5": { width: 4, height: 5 },
    "16:9": { width: 16, height: 9 },
    "9:16": { width: 9, height: 16 },
    "2:3": { width: 2, height: 3 },
    "3:2": { width: 3, height: 2 },
};