import { createId } from "../../lib/ids";
import type { ImageAsset } from "../../domain/image/image-types";

export async function decodeImageFile(file: File): Promise<ImageAsset> {
    const objectUrl = URL.createObjectURL(file);

    const img = new Image();
    img.src = objectUrl;

    await img.decode();

    return {
        id: createId("img"),
        file,
        name: file.name,
        width: img.naturalWidth,
        height: img.naturalHeight,
        objectUrl,
    };
}