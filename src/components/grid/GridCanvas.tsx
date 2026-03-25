import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
    type PointerEvent as ReactPointerEvent,
    type WheelEvent,
} from "react";
import { computeGridLayout } from "../../domain/grid/grid-layout";
import { clampCellTransform } from "../../domain/grid/grid-transforms";
import type { GridCell } from "../../domain/grid/grid-types";
import { drawGridToCanvas } from "../../engine/image/draw-grid";
import { useImageImport } from "../../hooks/useImageImport";
import { useEditorStore } from "../../store/editor.store";

type CanvasPoint = {
    x: number;
    y: number;
};

type PanInteraction = {
    type: "pan";
    cellId: string;
    pointerId: number;
    startPoint: CanvasPoint;
    startOffsetX: number;
    startOffsetY: number;
};

type PinchInteraction = {
    type: "pinch";
    cellId: string;
    pointerA: number;
    pointerB: number;
    startDistance: number;
    startCenter: CanvasPoint;
    startZoom: number;
    startOffsetX: number;
    startOffsetY: number;
};

type InteractionState = PanInteraction | PinchInteraction | null;

function getDistance(a: CanvasPoint, b: CanvasPoint) {
    return Math.hypot(b.x - a.x, b.y - a.y);
}

function getCenter(a: CanvasPoint, b: CanvasPoint): CanvasPoint {
    return {
        x: (a.x + b.x) / 2,
        y: (a.y + b.y) / 2,
    };
}

export function GridCanvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const pointersRef = useRef(new Map<number, CanvasPoint>());
    const interactionRef = useRef<InteractionState>(null);
    const pendingFileCellIdRef = useRef<string | null>(null);
    const [isImporting, setIsImporting] = useState(false);

    const { importFiles } = useImageImport();

    const config = useEditorStore((state) => state.config);
    const cells = useEditorStore((state) => state.cells);
    const assets = useEditorStore((state) => state.assets);
    const selectedCellId = useEditorStore((state) => state.selectedCellId);
    const setSelectedCellId = useEditorStore((state) => state.setSelectedCellId);
    const assignImageToCell = useEditorStore((state) => state.assignImageToCell);
    const updateCellTransform = useEditorStore((state) => state.updateCellTransform);

    const layout = useMemo(() => computeGridLayout(config, cells), [config, cells]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        void drawGridToCanvas(canvas, config, cells, assets, selectedCellId);
    }, [config, cells, assets, selectedCellId]);

    function getCanvasPoint(clientX: number, clientY: number) {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const bounds = canvas.getBoundingClientRect();
        const scaleX = canvas.width / bounds.width;
        const scaleY = canvas.height / bounds.height;

        return {
            x: (clientX - bounds.left) * scaleX,
            y: (clientY - bounds.top) * scaleY,
        };
    }

    function getCellById(cellId: string | null) {
        return cells.find((cell) => cell.id === cellId) ?? null;
    }

    function getAssetByCell(cell: GridCell | null) {
        if (!cell?.imageId) return null;
        return assets.find((asset) => asset.id === cell.imageId) ?? null;
    }

    function getHitCell(point: CanvasPoint) {
        const layoutCell = layout.cells.find((cell) => {
            const { x, y, width, height } = cell.rect;
            return point.x >= x && point.x <= x + width && point.y >= y && point.y <= y + height;
        });

        if (!layoutCell) return null;

        const cell = getCellById(layoutCell.id);
        if (!cell) return null;

        return { cell, rect: layoutCell.rect };
    }

    function openFilePicker(cellId: string) {
        pendingFileCellIdRef.current = cellId;
        setSelectedCellId(cellId);
        fileInputRef.current?.click();
    }

    async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
        const files = event.target.files ? Array.from(event.target.files) : [];
        const cellId = pendingFileCellIdRef.current;
        event.target.value = "";

        if (files.length === 0 || !cellId) {
            pendingFileCellIdRef.current = null;
            return;
        }

        setIsImporting(true);

        try {
            const imported = await importFiles(files);
            const firstAsset = imported[0];

            if (firstAsset) {
                assignImageToCell(cellId, firstAsset.id);
                setSelectedCellId(cellId);
            }
        } finally {
            pendingFileCellIdRef.current = null;
            setIsImporting(false);
        }
    }

    function applyTransform(
        cellId: string,
        patch: Partial<Pick<GridCell, "zoom" | "offsetX" | "offsetY">>
    ) {
        const cell = getCellById(cellId);
        const rect = layout.cells.find((layoutCell) => layoutCell.id === cellId)?.rect;
        const asset = getAssetByCell(cell);

        if (!cell || !rect) return;

        updateCellTransform(cellId, clampCellTransform(cell, asset, rect, patch));
    }

    function beginPinch(cellId: string) {
        const cell = getCellById(cellId);

        if (!cell || pointersRef.current.size < 2) return;

        const entries = Array.from(pointersRef.current.entries());
        const [firstPointer, secondPointer] = entries;
        const firstPoint = firstPointer[1];
        const secondPoint = secondPointer[1];

        interactionRef.current = {
            type: "pinch",
            cellId,
            pointerA: firstPointer[0],
            pointerB: secondPointer[0],
            startDistance: Math.max(getDistance(firstPoint, secondPoint), 1),
            startCenter: getCenter(firstPoint, secondPoint),
            startZoom: cell.zoom,
            startOffsetX: cell.offsetX,
            startOffsetY: cell.offsetY,
        };
    }

    function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
        const point = getCanvasPoint(event.clientX, event.clientY);
        if (!point) return;

        const hit = getHitCell(point);
        if (!hit) {
            setSelectedCellId(null);
            return;
        }

        const { cell } = hit;
        const asset = getAssetByCell(cell);

        if (!asset) {
            openFilePicker(cell.id);
            return;
        }

        setSelectedCellId(cell.id);
        pointersRef.current.set(event.pointerId, point);
        event.currentTarget.setPointerCapture(event.pointerId);

        if (pointersRef.current.size >= 2) {
            beginPinch(cell.id);
            return;
        }

        interactionRef.current = {
            type: "pan",
            cellId: cell.id,
            pointerId: event.pointerId,
            startPoint: point,
            startOffsetX: cell.offsetX,
            startOffsetY: cell.offsetY,
        };
    }

    function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
        if (!interactionRef.current) return;

        const point = getCanvasPoint(event.clientX, event.clientY);
        if (!point) return;

        pointersRef.current.set(event.pointerId, point);
        const interaction = interactionRef.current;

        if (interaction.type === "pan") {
            if (interaction.pointerId !== event.pointerId) return;

            const deltaX = point.x - interaction.startPoint.x;
            const deltaY = point.y - interaction.startPoint.y;

            applyTransform(interaction.cellId, {
                offsetX: interaction.startOffsetX + deltaX,
                offsetY: interaction.startOffsetY + deltaY,
            });
            return;
        }

        const pointA = pointersRef.current.get(interaction.pointerA);
        const pointB = pointersRef.current.get(interaction.pointerB);
        if (!pointA || !pointB) return;

        const distance = Math.max(getDistance(pointA, pointB), 1);
        const center = getCenter(pointA, pointB);
        const zoom = interaction.startZoom * (distance / interaction.startDistance);
        const deltaX = center.x - interaction.startCenter.x;
        const deltaY = center.y - interaction.startCenter.y;

        applyTransform(interaction.cellId, {
            zoom,
            offsetX: interaction.startOffsetX + deltaX,
            offsetY: interaction.startOffsetY + deltaY,
        });
    }

    function finishPointer(pointerId: number) {
        pointersRef.current.delete(pointerId);
        const interaction = interactionRef.current;

        if (!interaction) return;

        if (interaction.type === "pinch" && pointersRef.current.size === 1) {
            const [nextPointerId, nextPoint] = Array.from(pointersRef.current.entries())[0];
            const cell = getCellById(interaction.cellId);

            if (!cell) {
                interactionRef.current = null;
                return;
            }

            interactionRef.current = {
                type: "pan",
                cellId: interaction.cellId,
                pointerId: nextPointerId,
                startPoint: nextPoint,
                startOffsetX: cell.offsetX,
                startOffsetY: cell.offsetY,
            };
            return;
        }

        if (interaction.type === "pan" && interaction.pointerId !== pointerId) {
            return;
        }

        interactionRef.current = null;
    }

    function handleWheel(event: WheelEvent<HTMLCanvasElement>) {
        if (!selectedCellId) return;

        const point = getCanvasPoint(event.clientX, event.clientY);
        if (!point) return;

        const hit = getHitCell(point);
        if (!hit || hit.cell.id !== selectedCellId || !hit.cell.imageId) return;

        event.preventDefault();

        const zoomDelta = event.deltaY > 0 ? 0.92 : 1.08;
        applyTransform(selectedCellId, {
            zoom: hit.cell.zoom * zoomDelta,
        });
    }

    return (
        <div className="relative flex h-full min-h-[55vh] w-full items-center justify-center overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top,_rgba(241,99,73,0.12),_transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(255,247,243,0.82))] p-3 sm:min-h-[70vh] sm:p-5">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            <canvas
                ref={canvasRef}
                className="max-h-full max-w-full touch-none rounded-[24px] bg-white shadow-[var(--shadow-strong)]"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={(event) => finishPointer(event.pointerId)}
                onPointerCancel={(event) => finishPointer(event.pointerId)}
                onPointerLeave={(event) => {
                    if (event.buttons === 0) {
                        finishPointer(event.pointerId);
                    }
                }}
                onWheel={handleWheel}
            />

            <div className="pointer-events-none absolute left-5 top-5 rounded-full bg-white/88 px-3 py-2 text-xs font-medium text-[var(--text-secondary)] shadow-[var(--shadow-soft)] backdrop-blur">
                {isImporting
                    ? "Importando imagen..."
                    : "Tap para cargar · Arrastra para mover · Pinch para zoom"}
            </div>
        </div>
    );
}
