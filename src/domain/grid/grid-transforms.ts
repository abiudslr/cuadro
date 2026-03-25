import type { GridCell, GridRect } from "./grid-types";
import type { ImageAsset } from "../image/image-types";

function getRenderedSize(cellRect: GridRect, asset: ImageAsset, zoom: number) {
    const scaleX = cellRect.width / asset.width;
    const scaleY = cellRect.height / asset.height;
    const baseScale = Math.max(scaleX, scaleY);
    const finalScale = baseScale * zoom;

    return {
        width: asset.width * finalScale,
        height: asset.height * finalScale,
    };
}

export function clampCellTransform(
    cell: GridCell,
    asset: ImageAsset | null,
    cellRect: GridRect,
    patch: Partial<Pick<GridCell, "zoom" | "offsetX" | "offsetY">>
) {
    const nextZoom = Math.max(1, patch.zoom ?? cell.zoom);

    if (!asset) {
        return {
            zoom: nextZoom,
            offsetX: 0,
            offsetY: 0,
        };
    }

    const rendered = getRenderedSize(cellRect, asset, nextZoom);
    const maxOffsetX = Math.max(0, (rendered.width - cellRect.width) / 2);
    const maxOffsetY = Math.max(0, (rendered.height - cellRect.height) / 2);

    const requestedOffsetX = patch.offsetX ?? cell.offsetX;
    const requestedOffsetY = patch.offsetY ?? cell.offsetY;

    return {
        zoom: nextZoom,
        offsetX: Math.min(Math.max(requestedOffsetX, -maxOffsetX), maxOffsetX),
        offsetY: Math.min(Math.max(requestedOffsetY, -maxOffsetY), maxOffsetY),
    };
}
