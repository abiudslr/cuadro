import { CellEditorPanel } from "../components/controls/CellEditorPanel";
import { AppShell } from "../components/layout/AppShell";
import { ConfigPanel } from "../components/controls/ConfigPanel";
import { ExportPanel } from "../components/controls/ExportPanel";
import { ImageList } from "../components/controls/ImageList";
import { GridCanvas } from "../components/grid/GridCanvas";
import { GridViewport } from "../components/grid/GridViewport";

export default function App() {
    return (
        <AppShell
            toolbar={
                <div className="h-14 flex items-center px-4 font-semibold">
                    Cuadro
                </div>
            }
            sidebar={
                <div>
                    <ConfigPanel />
                    <GridViewport />
                    <CellEditorPanel />
                    <ImageList />
                    <ExportPanel />
                </div>
            }
            content={<GridCanvas />}
        />
    );
}
