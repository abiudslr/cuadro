import type { GridCell, GridConfig } from "../../domain/grid/grid-types";
import type { ImageAsset } from "../../domain/image/image-types";
import { drawGridToCanvas } from "./draw-grid";

export async function exportGridAsBlob(
    config: GridConfig,
    cells: GridCell[],
    assets: ImageAsset[],
    mimeType: string = "image/png",
    quality?: number
): Promise<Blob> {
    const canvas = document.createElement("canvas");
    await drawGridToCanvas(canvas, config, cells, assets);

    return await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error("No se pudo generar el archivo exportado"));
                return;
            }
            resolve(blob);
        }, mimeType, quality);
    });
}