import { ExportPanel } from "../controls/ExportPanel";
import { GridCanvas } from "../grid/GridCanvas";
import { useEditorStore } from "../../store/editor.store";

export function EditorScreen() {
    const config = useEditorStore((state) => state.config);
    const cells = useEditorStore((state) => state.cells);
    const selectedCellId = useEditorStore((state) => state.selectedCellId);
    const setMode = useEditorStore((state) => state.setMode);
    const assignImageToCell = useEditorStore((state) => state.assignImageToCell);

    const selectedCell = cells.find((cell) => cell.id === selectedCellId) ?? null;

    return (
        <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-10">
            <header className="mb-4 flex flex-wrap items-start justify-between gap-4 rounded-[30px] border border-[var(--border-strong)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-soft)] sm:p-5">
                <div className="space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                        Editor
                    </div>
                    <div className="text-2xl font-semibold tracking-[-0.03em]">
                        Ajusta cada imagen con gestos directos
                    </div>
                    <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
                        Toca una celda vacia para cargar una imagen. Arrastra para reencuadrar y
                        usa pinch o rueda para acercar sin salir del modo cover.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="rounded-full bg-[var(--surface-muted)] px-3 py-2">
                        {config.orientation === "vertical" ? "Vertical" : "Horizontal"}
                    </span>
                    <span className="rounded-full bg-[var(--surface-muted)] px-3 py-2">
                        {config.aspectRatio}
                    </span>
                    <span className="rounded-full bg-[var(--surface-muted)] px-3 py-2">
                        {config.rows} x {config.cols}
                    </span>
                </div>
            </header>

            <div className="flex flex-1 flex-col gap-4">
                <div className="flex-1 rounded-[32px] border border-[var(--border-strong)] bg-[var(--surface-primary)] p-3 shadow-[var(--shadow-soft)] sm:p-5">
                    <GridCanvas />
                </div>

                <div className="grid gap-3 rounded-[30px] border border-[var(--border-strong)] bg-[var(--surface-primary)] p-3 shadow-[var(--shadow-soft)] sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-center sm:p-4">
                    <div className="rounded-[24px] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--text-secondary)]">
                        {selectedCell
                            ? `Celda ${selectedCell.row + 1}, ${selectedCell.col + 1} seleccionada`
                            : "Selecciona una celda para comenzar"}
                    </div>

                    <button
                        type="button"
                        className="rounded-full border border-[var(--border-strong)] px-4 py-3 text-sm font-semibold"
                        onClick={() => setMode("setup")}
                    >
                        Reconfigurar
                    </button>

                    <button
                        type="button"
                        className="rounded-full border border-[var(--border-strong)] px-4 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                        disabled={!selectedCell?.imageId}
                        onClick={() => {
                            if (!selectedCell) return;
                            assignImageToCell(selectedCell.id, null);
                        }}
                    >
                        Limpiar
                    </button>

                    <ExportPanel />
                </div>
            </div>
        </div>
    );
}
