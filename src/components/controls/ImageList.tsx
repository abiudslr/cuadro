import { useImageImport } from "../../hooks/useImageImport";
import { useEditorStore } from "../../store/editor.store";

export function ImageList() {
    const { importFiles } = useImageImport();
    const assets = useEditorStore((state) => state.assets);
    const selectedCellId = useEditorStore((state) => state.selectedCellId);
    const assignImageToCell = useEditorStore((state) => state.assignImageToCell);

    return (
        <div className="p-4 space-y-4">
            <div>
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

            <div className="grid grid-cols-2 gap-2">
                {assets.map((asset) => (
                    <button
                        key={asset.id}
                        className="border rounded p-1 bg-white"
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