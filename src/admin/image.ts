/** The widths the site's photos come in (see Picture). */
export const PHOTO_WIDTHS = [480, 960, 1600] as const;
export type PhotoWidth = (typeof PHOTO_WIDTHS)[number];

/**
 * Turns a chosen photo into the set the site uses: WebP at 480, 960 and 1600 px wide (never
 * enlarged), straightened by its camera orientation. Phones produce 5–10 MB files; the set
 * together is usually well under 1 MB. Also returns the shape (width ÷ height).
 */
export async function preparePhotoSet(
  file: File,
): Promise<{ files: Record<PhotoWidth, Blob>; ratio: number }> {
  if (!file.type.startsWith("image/")) throw new Error("הקובץ שנבחר אינו תמונה");

  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const ratio = bitmap.width / bitmap.height;
  const files = {} as Record<PhotoWidth, Blob>;
  try {
    for (const target of PHOTO_WIDTHS) {
      const width = Math.min(target, bitmap.width);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = Math.round(width / ratio);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("לא ניתן לעבד את התמונה בדפדפן הזה");
      context.imageSmoothingQuality = "high";
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.82),
      );
      if (!blob || blob.type !== "image/webp") {
        throw new Error("הדפדפן הזה לא יודע לשמור תמונות WebP. נסו בכרום, אדג' או ספארי עדכני");
      }
      files[target] = blob;
    }
  } finally {
    bitmap.close();
  }
  return { files, ratio: Math.round(ratio * 1000) / 1000 };
}
