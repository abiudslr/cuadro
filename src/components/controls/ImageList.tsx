import { useImageImport } from "../../hooks/useImageImport";
import { useEditorStore } from "../../store/editor.store";

export function ImageList() {
    const { importFiles } = useImageImport();
    const assets = useEditorStore((state) => state.assets);
    const selectedCellId = useEditorStore((state) => state.selectedCellId);
    const assignImageToCell = useEditorStore((state) => state.assignImageToCell);
    const isSelectionActive = selectedCellId !== null;

    return (
        <div className="p-4 border-t space-y-4">
            <div>
                <div className="text-sm font-medium mb-2">Imagenes</div>
                <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                        if (!e.target.files) return;
                        importFiles(e.target.files);
                    }}
                />
            </div>

            {!isSelectionActive && (
                <div className="text-xs text-neutral-500">
                    Selecciona una celda para asignarle una imagen.
                </div>
            )}

            <div className="grid grid-cols-2 gap-2">
                {assets.map((asset) => (
                    <button
                        key={asset.id}
                        className="border rounded p-1 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!isSelectionActive}
                        onClick={() => {
                            if (!selectedCellId) return;
                            assignImageToCell(selectedCellId, asset.id);
                        }}
                    >
                        <img
                            src={asset.objectUrl}
                            alt={asset.name}
                            className="w-full h-24 object-cover rounded"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
