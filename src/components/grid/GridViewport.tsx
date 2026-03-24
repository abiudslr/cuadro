import { useEditorStore } from "../../store/editor.store";

export function GridViewport() {
    const cells = useEditorStore((state) => state.cells);
    const selectedCellId = useEditorStore((state) => state.selectedCellId);
    const setSelectedCellId = useEditorStore((state) => state.setSelectedCellId);

    return (
        <div className="p-4 border-t">
            <div className="text-sm font-medium mb-2">Seleccionar celda</div>
            <div className="grid grid-cols-2 gap-2">
                {cells.map((cell) => (
                    <button
                        key={cell.id}
                        className={`border rounded px-3 py-2 text-sm ${selectedCellId === cell.id ? "bg-black text-white" : "bg-white"
                            }`}
                        onClick={() => setSelectedCellId(cell.id)}
                    >
                        {cell.row + 1}, {cell.col + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}