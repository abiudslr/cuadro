import { GRID_RATIOS } from "./grid-ratios";
import type { ComputedGridLayout, GridConfig, GridCell } from "./grid-types";

export function computeGridLayout(
    config: GridConfig,
    cells: GridCell[]
): ComputedGridLayout {
    const ratio = GRID_RATIOS[config.aspectRatio];

    const isVertical = config.orientation === "vertical";

    const baseWidth = isVertical ? ratio.width : ratio.height;
    const baseHeight = isVertical ? ratio.height : ratio.width;

    const maxSide = config.maxResolution;

    let canvasWidth = maxSide;
    let canvasHeight = Math.round((baseHeight / baseWidth) * canvasWidth);

    if (canvasHeight > maxSide) {
        canvasHeight = maxSide;
        canvasWidth = Math.round((baseWidth / baseHeight) * canvasHeight);
    }

    const totalGapX = config.gap * (config.cols - 1);
    const totalGapY = config.gap * (config.rows - 1);
    const totalPaddingX = config.padding * 2;
    const totalPaddingY = config.padding * 2;

    const usableWidth = canvasWidth - totalGapX - totalPaddingX;
    const usableHeight = canvasHeight - totalGapY - totalPaddingY;

    const cellWidth = Math.floor(usableWidth / config.cols);
    const cellHeight = Math.floor(usableHeight / config.rows);

    return {
        canvasWidth,
        canvasHeight,
        cellWidth,
        cellHeight,
        cells: cells.map((cell) => ({
            id: cell.id,
            row: cell.row,
            col: cell.col,
            rect: {
                x: config.padding + cell.col * (cellWidth + config.gap),
                y: config.padding + cell.row * (cellHeight + config.gap),
                width: cellWidth,
                height: cellHeight,
            },
        })),
    };
}