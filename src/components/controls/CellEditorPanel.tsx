import { useEditorStore } from "../../store/editor.store";

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

type NumericControlProps = {
    label: string;
    min: number;
    max: number;
    step: number;
    value: number;
    disabled: boolean;
    onChange: (value: number) => void;
};

function NumericControl({
    label,
    min,
    max,
    step,
    value,
    disabled,
    onChange,
}: NumericControlProps) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <label>{label}</label>
                <span className="text-neutral-500">{value}</span>
            </div>
            <input
                className="w-full"
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(Number(e.target.value))}
            />
            <input
                className="w-full border rounded px-3 py-2 disabled:bg-neutral-100"
                type="number"
                min={min}
                max={max}
                step={step}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(clamp(Number(e.target.value), min, max))}
            />
        </div>
    );
}

export function CellEditorPanel() {
    const selectedCellId = useEditorStore((state) => state.selectedCellId);
    const cells = useEditorStore((state) => state.cells);
    const assets = useEditorStore((state) => state.assets);
    const updateCellTransform = useEditorStore((state) => state.updateCellTransform);
    const assignImageToCell = useEditorStore((state) => state.assignImageToCell);

    const selectedCell = cells.find((cell) => cell.id === selectedCellId) ?? null;
    const selectedAsset = assets.find((asset) => asset.id === selectedCell?.imageId) ?? null;
    const hasSelection = selectedCell !== null;
    const hasImage = selectedAsset !== null;

    return (
        <div className="p-4 border-t space-y-4">
            <div>
                <div className="text-sm font-medium">Edicion de celda</div>
                <div className="text-xs text-neutral-500 mt-1">
                    {selectedCell
                        ? `Celda ${selectedCell.row + 1}, ${selectedCell.col + 1}`
                        : "Selecciona una celda para ajustar su imagen"}
                </div>
            </div>

            {selectedCell && (
                <div className="rounded border bg-neutral-50 px-3 py-2 text-sm">
                    {hasImage ? selectedAsset.name : "Sin imagen asignada"}
                </div>
            )}

            <div className="space-y-2">
                <label className="block text-sm">Ajuste</label>
                <select
                    className="w-full border rounded px-3 py-2 disabled:bg-neutral-100"
                    value={selectedCell?.fitMode ?? "cover"}
                    disabled={!hasSelection || !hasImage}
                    onChange={(e) => {
                        if (!selectedCell) return;
                        updateCellTransform(selectedCell.id, {
                            fitMode: e.target.value as "cover" | "contain",
                        });
                    }}
                >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                </select>
            </div>

            <NumericControl
                label="Zoom"
                min={0.25}
                max={4}
                step={0.01}
                value={selectedCell?.zoom ?? 1}
                disabled={!hasSelection || !hasImage}
                onChange={(value) => {
                    if (!selectedCell) return;
                    updateCellTransform(selectedCell.id, { zoom: value });
                }}
            />

            <NumericControl
                label="Offset X"
                min={-1000}
                max={1000}
                step={1}
                value={selectedCell?.offsetX ?? 0}
                disabled={!hasSelection || !hasImage}
                onChange={(value) => {
                    if (!selectedCell) return;
                    updateCellTransform(selectedCell.id, { offsetX: value });
                }}
            />

            <NumericControl
                label="Offset Y"
                min={-1000}
                max={1000}
                step={1}
                value={selectedCell?.offsetY ?? 0}
                disabled={!hasSelection || !hasImage}
                onChange={(value) => {
                    if (!selectedCell) return;
                    updateCellTransform(selectedCell.id, { offsetY: value });
                }}
            />

            <button
                className="w-full border rounded px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!hasSelection || !hasImage}
                onClick={() => {
                    if (!selectedCell) return;
                    assignImageToCell(selectedCell.id, null);
                }}
            >
                Limpiar imagen
            </button>
        </div>
    );
}
