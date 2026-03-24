import { decodeImageFile } from "../engine/image/decode-image";
import { useEditorStore } from "../store/editor.store";

export function useImageImport() {
    const addAssets = useEditorStore((state) => state.addAssets);

    async function importFiles(files: FileList | File[]) {
        const list = Array.from(files).filter((file) =>
            file.type.startsWith("image/")
        );

        const decoded = await Promise.all(list.map(decodeImageFile));
        addAssets(decoded);
    }

    return { importFiles };
}