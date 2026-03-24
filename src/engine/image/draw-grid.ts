import { computeGridLayout } from "../../domain/grid/grid-layout";
import type { GridCell, GridConfig } from "../../domain/grid/grid-types";
import type { ImageAsset } from "../../domain/image/image-types";
import { renderCell } from "./render-cell";

export async function drawGridToCanvas(
    canvas: HTMLCanvasElement,
    config: GridConfig,
    cells: GridCell[],
    assets: ImageAsset[]
) {
    const layout = computeGridLayout(config, cells);
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    canvas.width = layout.canvasWidth;
    canvas.height = layout.canvasHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const layoutCell of layout.cells) {
        const cell = cells.find((item) => item.id === layoutCell.id);
        if (!cell) continue;

        ctx.fillStyle = "#f3f4f6";
        ctx.fillRect(
            layoutCell.rect.x,
            layoutCell.rect.y,
            layoutCell.rect.width,
            layoutCell.rect.height
        );

        if (!cell.imageId) continue;

        const asset = assets.find((item) => item.id === cell.imageId);
        if (!asset) continue;

        const img = new Image();
        img.src = asset.objectUrl;
        await img.decode();

        renderCell({
            ctx,
            image: img,
            cellX: layoutCell.rect.x,
            cellY: layoutCell.rect.y,
            cellWidth: layoutCell.rect.width,
            cellHeight: layoutCell.rect.height,
            imageWidth: asset.width,
            imageHeight: asset.height,
            fitMode: cell.fitMode,
            zoom: cell.zoom,
            offsetX: cell.offsetX,
            offsetY: cell.offsetY,
        });
    }
}