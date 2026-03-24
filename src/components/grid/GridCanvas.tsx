import { useEffect, useRef } from "react";
import { drawGridToCanvas } from "../../engine/image/draw-grid";
import { useEditorStore } from "../../store/editor.store";

export function GridCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const config = useEditorStore((state) => state.config);
    const cells = useEditorStore((state) => state.cells);
    const assets = useEditorStore((state) => state.assets);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        drawGridToCanvas(canvas, config, cells, assets);
    }, [config, cells, assets]);

    return (
        <div className="w-full h-full flex items-center justify-center p-6">
            <canvas ref={canvasRef} className="max-w-full max-h-full shadow-lg bg-white" />
        </div>
    );
}