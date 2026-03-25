import { useEffect, useMemo, useRef, type MouseEvent } from "react";
import { computeGridLayout } from "../../domain/grid/grid-layout";
import { drawGridToCanvas } from "../../engine/image/draw-grid";
import { useEditorStore } from "../../store/editor.store";

export function GridCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const config = useEditorStore((state) => state.config);
    const cells = useEditorStore((state) => state.cells);
    const assets = useEditorStore((state) => state.assets);
    const selectedCellId = useEditorStore((state) => state.selectedCellId);
    const setSelectedCellId = useEditorStore((state) => state.setSelectedCellId);
    const layout = useMemo(() => computeGridLayout(config, cells), [config, cells]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        drawGridToCanvas(canvas, config, cells, assets, selectedCellId);
    }, [config, cells, assets, selectedCellId]);

    function handleCanvasClick(event: MouseEvent<HTMLCanvasElement>) {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const bounds = canvas.getBoundingClientRect();
        const scaleX = canvas.width / bounds.width;
        const scaleY = canvas.height / bounds.height;
        const clickX = (event.clientX - bounds.left) * scaleX;
        const clickY = (event.clientY - bounds.top) * scaleY;

        const clickedCell = layout.cells.find((cell) => {
            const { x, y, width, height } = cell.rect;
            return clickX >= x && clickX <= x + width && clickY >= y && clickY <= y + height;
        });

        setSelectedCellId(clickedCell?.id ?? null);
    }

    return (
        <div className="w-full h-full flex items-center justify-center p-6">
            <canvas
                ref={canvasRef}
                className="max-w-full max-h-full shadow-lg bg-white cursor-pointer"
                onClick={handleCanvasClick}
            />
        </div>
    );
}
