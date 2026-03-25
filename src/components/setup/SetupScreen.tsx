import { GRID_PRESETS, getGridPreset } from "../../domain/grid/grid-presets";
import type { GridPresetKey, Orientation } from "../../domain/grid/grid-types";
import { useEditorStore } from "../../store/editor.store";

const GRID_SIZE_OPTIONS = [
    { rows: 1, cols: 2, label: "1 x 2" },
    { rows: 2, cols: 2, label: "2 x 2" },
    { rows: 2, cols: 3, label: "2 x 3" },
    { rows: 3, cols: 3, label: "3 x 3" },
];

function OrientationPreview({
    orientation,
    active,
}: {
    orientation: Orientation;
    active: boolean;
}) {
    return (
        <div
            className={`relative mx-auto rounded-[24px] border transition ${
                active
                    ? "border-[var(--accent-strong)] bg-[var(--accent-soft)]"
                    : "border-[var(--border-strong)] bg-[var(--surface-muted)]"
            } ${orientation === "vertical" ? "h-28 w-20" : "h-20 w-28"}`}
        >
            <div className="absolute inset-2 rounded-[18px] border border-white/70" />
        </div>
    );
}

function PresetPreview({ presetKey }: { presetKey: GridPresetKey }) {
    const preset = getGridPreset(presetKey);
    const [width, height] = preset.aspectRatio.split(":").map(Number);
    const isTall = height > width;
    const isWide = width > height;

    return (
        <div className="flex h-28 items-center justify-center rounded-[24px] bg-[var(--surface-muted)]">
            <div
                className={`rounded-[20px] border border-white/80 bg-white/75 shadow-[var(--shadow-soft)] ${
                    isTall ? "h-[5.5rem] w-14" : isWide ? "h-14 w-24" : "h-[4.5rem] w-[4.5rem]"
                }`}
            />
        </div>
    );
}

export function SetupScreen() {
    const setup = useEditorStore((state) => state.setup);
    const updateSetup = useEditorStore((state) => state.updateSetup);
    const commitSetup = useEditorStore((state) => state.commitSetup);

    const selectedPreset = getGridPreset(setup.presetKey);

    return (
        <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-10">
            <div className="grid flex-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
                <section className="rounded-[32px] border border-[var(--border-strong)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-soft)] sm:p-7">
                    <div className="mb-8 space-y-3">
                        <span className="inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                            Cuadro
                        </span>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-5xl">
                                Crea una cuadricula lista para redes en segundos.
                            </h1>
                            <p className="max-w-2xl text-sm leading-6 text-[var(--text-secondary)] sm:text-base">
                                Elige formato, orientacion y cantidad de bloques. Luego entras al
                                editor con una experiencia limpia para tocar, cargar y ajustar cada
                                imagen.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-7">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                                    Orientacion
                                </h2>
                                <span className="text-sm text-[var(--text-secondary)]">
                                    {setup.orientation === "vertical" ? "Vertical" : "Horizontal"}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                {(["vertical", "horizontal"] as const).map((orientation) => {
                                    const isActive = setup.orientation === orientation;
                                    return (
                                        <button
                                            key={orientation}
                                            type="button"
                                            className={`rounded-[28px] border p-4 text-left transition ${
                                                isActive
                                                    ? "border-[var(--accent-strong)] bg-[var(--accent-soft)]"
                                                    : "border-[var(--border-strong)] bg-[var(--surface-muted)] hover:border-[var(--accent-strong)]/50"
                                            }`}
                                            onClick={() => updateSetup({ orientation })}
                                        >
                                            <OrientationPreview
                                                orientation={orientation}
                                                active={isActive}
                                            />
                                            <div className="mt-4 text-base font-semibold">
                                                {orientation === "vertical" ? "Vertical" : "Horizontal"}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                                    Tamano social
                                </h2>
                                <span className="text-sm text-[var(--text-secondary)]">
                                    {selectedPreset.maxResolution}px
                                </span>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                {GRID_PRESETS.map((preset) => {
                                    const isActive = setup.presetKey === preset.key;

                                    return (
                                        <button
                                            key={preset.key}
                                            type="button"
                                            className={`rounded-[28px] border p-4 text-left transition ${
                                                isActive
                                                    ? "border-[var(--accent-strong)] bg-[var(--accent-soft)]"
                                                    : "border-[var(--border-strong)] bg-[var(--surface-muted)] hover:border-[var(--accent-strong)]/50"
                                            }`}
                                            onClick={() => updateSetup({ presetKey: preset.key })}
                                        >
                                            <PresetPreview presetKey={preset.key} />
                                            <div className="mt-4 flex items-center justify-between gap-3">
                                                <div>
                                                    <div className="text-base font-semibold">
                                                        {preset.label}
                                                    </div>
                                                    <div className="mt-1 text-sm text-[var(--text-secondary)]">
                                                        {preset.description}
                                                    </div>
                                                </div>
                                                <div className="rounded-full bg-white/80 px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                                                    {preset.aspectRatio}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                                    Cuadricula
                                </h2>
                                <span className="text-sm text-[var(--text-secondary)]">
                                    {setup.rows} filas · {setup.cols} columnas
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {GRID_SIZE_OPTIONS.map((option) => {
                                    const isActive =
                                        option.rows === setup.rows && option.cols === setup.cols;

                                    return (
                                        <button
                                            key={option.label}
                                            type="button"
                                            className={`rounded-[24px] border px-4 py-5 text-sm font-semibold transition ${
                                                isActive
                                                    ? "border-[var(--accent-strong)] bg-[var(--accent-soft)]"
                                                    : "border-[var(--border-strong)] bg-[var(--surface-muted)] hover:border-[var(--accent-strong)]/50"
                                            }`}
                                            onClick={() =>
                                                updateSetup({ rows: option.rows, cols: option.cols })
                                            }
                                        >
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <label className="rounded-[24px] border border-[var(--border-strong)] bg-[var(--surface-muted)] p-4">
                                    <div className="text-sm font-semibold">Filas</div>
                                    <div className="mt-3 flex items-center gap-3">
                                        <button
                                            type="button"
                                            className="h-11 w-11 rounded-full border border-[var(--border-strong)] bg-white text-xl"
                                            onClick={() =>
                                                updateSetup({ rows: Math.max(1, setup.rows - 1) })
                                            }
                                        >
                                            -
                                        </button>
                                        <div className="flex-1 text-center text-2xl font-semibold">
                                            {setup.rows}
                                        </div>
                                        <button
                                            type="button"
                                            className="h-11 w-11 rounded-full border border-[var(--border-strong)] bg-white text-xl"
                                            onClick={() =>
                                                updateSetup({ rows: Math.min(6, setup.rows + 1) })
                                            }
                                        >
                                            +
                                        </button>
                                    </div>
                                </label>

                                <label className="rounded-[24px] border border-[var(--border-strong)] bg-[var(--surface-muted)] p-4">
                                    <div className="text-sm font-semibold">Columnas</div>
                                    <div className="mt-3 flex items-center gap-3">
                                        <button
                                            type="button"
                                            className="h-11 w-11 rounded-full border border-[var(--border-strong)] bg-white text-xl"
                                            onClick={() =>
                                                updateSetup({ cols: Math.max(1, setup.cols - 1) })
                                            }
                                        >
                                            -
                                        </button>
                                        <div className="flex-1 text-center text-2xl font-semibold">
                                            {setup.cols}
                                        </div>
                                        <button
                                            type="button"
                                            className="h-11 w-11 rounded-full border border-[var(--border-strong)] bg-white text-xl"
                                            onClick={() =>
                                                updateSetup({ cols: Math.min(6, setup.cols + 1) })
                                            }
                                        >
                                            +
                                        </button>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </section>

                <aside className="rounded-[32px] border border-[var(--border-strong)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-soft)] sm:p-6 lg:sticky lg:top-6">
                    <div className="space-y-4">
                        <div>
                            <div className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--text-secondary)]">
                                Resumen
                            </div>
                            <div className="mt-2 text-2xl font-semibold tracking-[-0.02em]">
                                {selectedPreset.label}
                            </div>
                            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
                                {selectedPreset.description}
                            </p>
                        </div>

                        <div className="rounded-[28px] bg-[var(--surface-muted)] p-5">
                            <div className="mb-4 text-sm font-semibold">Vista previa</div>
                            <div className="flex justify-center">
                                <div
                                    className={`grid gap-1 rounded-[24px] bg-white p-3 shadow-[var(--shadow-soft)] ${
                                        setup.orientation === "vertical" ? "w-44" : "w-56"
                                    }`}
                                    style={{
                                        gridTemplateColumns: `repeat(${setup.cols}, minmax(0, 1fr))`,
                                    }}
                                >
                                    {Array.from({ length: setup.rows * setup.cols }, (_, index) => (
                                        <div
                                            key={index}
                                            className="aspect-square rounded-[12px] bg-[var(--accent-soft)]"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 rounded-[24px] border border-[var(--border-strong)] bg-[var(--surface-muted)] p-4 text-sm text-[var(--text-secondary)]">
                            <div>{setup.orientation === "vertical" ? "Vertical" : "Horizontal"}</div>
                            <div>{selectedPreset.aspectRatio} · {selectedPreset.maxResolution}px</div>
                            <div>{setup.rows} x {setup.cols} bloques</div>
                        </div>

                        <button
                            type="button"
                            className="w-full rounded-full bg-[var(--accent-strong)] px-5 py-4 text-base font-semibold text-white shadow-[var(--shadow-soft)] transition hover:translate-y-[-1px]"
                            onClick={() => commitSetup()}
                        >
                            Crear cuadricula
                        </button>
                    </div>
                </aside>
            </div>
        </div>
    );
}
