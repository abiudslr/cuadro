import { useEditorStore } from "../../store/editor.store";

export function ConfigPanel() {
    const config = useEditorStore((state) => state.config);
    const setConfig = useEditorStore((state) => state.setConfig);
    const rebuildCells = useEditorStore((state) => state.rebuildCells);

    return (
        <div className="p-4 space-y-4">
            <div>
                <label className="block text-sm mb-1">Orientación</label>
                <select
                    className="w-full border rounded px-3 py-2"
                    value={config.orientation}
                    onChange={(e) =>
                        setConfig({ orientation: e.target.value as "vertical" | "horizontal" })
                    }
                >
                    <option value="vertical">Vertical</option>
                    <option value="horizontal">Horizontal</option>
                </select>
            </div>

            <div>
                <label className="block text-sm mb-1">Formato</label>
                <select
                    className="w-full border rounded px-3 py-2"
                    value={config.aspectRatio}
                    onChange={(e) => setConfig({ aspectRatio: e.target.value as typeof config.aspectRatio })}
                >
                    <option value="1:1">1:1</option>
                    <option value="3:4">3:4</option>
                    <option value="4:5">4:5</option>
                    <option value="16:9">16:9</option>
                    <option value="9:16">9:16</option>
                    <option value="2:3">2:3</option>
                    <option value="3:2">3:2</option>
                </select>
            </div>

            <div>
                <label className="block text-sm mb-1">Filas</label>
                <input
                    className="w-full border rounded px-3 py-2"
                    type="number"
                    min={1}
                    max={10}
                    value={config.rows}
                    onChange={(e) => rebuildCells(Number(e.target.value), config.cols)}
                />
            </div>

            <div>
                <label className="block text-sm mb-1">Columnas</label>
                <input
                    className="w-full border rounded px-3 py-2"
                    type="number"
                    min={1}
                    max={10}
                    value={config.cols}
                    onChange={(e) => rebuildCells(config.rows, Number(e.target.value))}
                />
            </div>

            <div>
                <label className="block text-sm mb-1">Resolución máxima</label>
                <input
                    className="w-full border rounded px-3 py-2"
                    type="number"
                    min={512}
                    max={4096}
                    step={128}
                    value={config.maxResolution}
                    onChange={(e) => setConfig({ maxResolution: Number(e.target.value) })}
                />
            </div>
        </div>
    );
}