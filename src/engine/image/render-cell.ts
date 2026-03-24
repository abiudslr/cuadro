type RenderCellParams = {
    ctx: CanvasRenderingContext2D;
    image: CanvasImageSource;
    cellX: number;
    cellY: number;
    cellWidth: number;
    cellHeight: number;
    imageWidth: number;
    imageHeight: number;
    fitMode: "cover" | "contain";
    zoom: number;
    offsetX: number;
    offsetY: number;
};

export function renderCell(params: RenderCellParams) {
    const {
        ctx,
        image,
        cellX,
        cellY,
        cellWidth,
        cellHeight,
        imageWidth,
        imageHeight,
        fitMode,
        zoom,
        offsetX,
        offsetY,
    } = params;

    const scaleX = cellWidth / imageWidth;
    const scaleY = cellHeight / imageHeight;
    const baseScale = fitMode === "cover" ? Math.max(scaleX, scaleY) : Math.min(scaleX, scaleY);
    const finalScale = baseScale * zoom;

    const drawWidth = imageWidth * finalScale;
    const drawHeight = imageHeight * finalScale;

    const x = cellX + (cellWidth - drawWidth) / 2 + offsetX;
    const y = cellY + (cellHeight - drawHeight) / 2 + offsetY;

    ctx.save();
    ctx.beginPath();
    ctx.rect(cellX, cellY, cellWidth, cellHeight);
    ctx.clip();
    ctx.drawImage(image, x, y, drawWidth, drawHeight);
    ctx.restore();
}