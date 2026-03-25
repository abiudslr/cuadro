import { computeGridLayout } from "../../domain/grid/grid-layout";
import type { GridCell, GridConfig } from "../../domain/grid/grid-types";
import type { ImageAsset } from "../../domain/image/image-types";
import { renderCell } from "./render-cell";

export async function drawGridToCanvas(
    canvas: HTMLCanvasElement,
    config: GridConfig,
    cells: GridCell[],
    assets: ImageAsset[],
    selectedCellId?: string | null
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

        ctx.fillStyle = "#f5efe9";
        ctx.fillRect(
            layoutCell.rect.x,
            layoutCell.rect.y,
            layoutCell.rect.width,
            layoutCell.rect.height
        );

        if (!cell.imageId) {
            ctx.save();
            ctx.strokeStyle = "#e3d6cd";
            ctx.setLineDash([16, 10]);
            ctx.lineWidth = 3;
            ctx.strokeRect(
                layoutCell.rect.x + 6,
                layoutCell.rect.y + 6,
                layoutCell.rect.width - 12,
                layoutCell.rect.height - 12
            );
            ctx.restore();

            ctx.save();
            ctx.fillStyle = "#aa7f67";
            ctx.font = "600 28px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
                "+",
                layoutCell.rect.x + layoutCell.rect.width / 2,
                layoutCell.rect.y + layoutCell.rect.height / 2 - 10
            );
            ctx.font = "500 13px sans-serif";
            ctx.fillText(
                "Toca para cargar",
                layoutCell.rect.x + layoutCell.rect.width / 2,
                layoutCell.rect.y + layoutCell.rect.height / 2 + 16
            );
            ctx.restore();
            continue;
        }

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

    if (!selectedCellId) {
        return;
    }

    const selectedLayoutCell = layout.cells.find((cell) => cell.id === selectedCellId);
    if (!selectedLayoutCell) {
        return;
    }

    ctx.save();
    ctx.strokeStyle = "#f16349";
    ctx.lineWidth = 4;
    ctx.strokeRect(
        selectedLayoutCell.rect.x,
        selectedLayoutCell.rect.y,
        selectedLayoutCell.rect.width,
        selectedLayoutCell.rect.height
    );
    ctx.restore();
}
