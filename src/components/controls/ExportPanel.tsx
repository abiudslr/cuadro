import { exportGridAsBlob } from "../../engine/image/export-grid";
import { useEditorStore } from "../../store/editor.store";

export function ExportPanel() {
    const config = useEditorStore((state) => state.config);
    const cells = useEditorStore((state) => state.cells);
    const assets = useEditorStore((state) => state.assets);

    async function handleExport() {
        const blob = await exportGridAsBlob(config, cells, assets, "image/png");
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "cuadro-export.png";
        a.click();

        URL.revokeObjectURL(url);
    }

    return (
        <div className="p-4 border-t">
            <button
                className="w-full bg-black text-white rounded px-4 py-2"
                onClick={handleExport}
            >
                Exportar PNG
            </button>
        </div>
    );
}