import { EditorScreen } from "../components/editor/EditorScreen";
import { SetupScreen } from "../components/setup/SetupScreen";
import { useEditorStore } from "../store/editor.store";

export default function App() {
    const mode = useEditorStore((state) => state.mode);

    return (
        <div className="min-h-full bg-[var(--app-bg)] text-[var(--text-primary)]">
            {mode === "setup" ? <SetupScreen /> : <EditorScreen />}
        </div>
    );
}
