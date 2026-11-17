/** What the hero accepts: a short, silent loop that browsers play everywhere. */
export const VIDEO_TYPES = ["video/mp4", "video/webm"] as const;
export const VIDEO_MAX_MB = 30;
export const VIDEO_MAX_SECONDS = 90;

/**
 * Checks a chosen video before it is uploaded (type, size, length, that this browser can
 * play it) and grabs a still from it, so the poster shown while it loads is the same scene.
 */
export async function prepareVideo(file: File): Promise<{ poster: File; extension: string }> {
  if (!VIDEO_TYPES.includes(file.type as (typeof VIDEO_TYPES)[number])) {
    throw new Error("צריך קובץ MP4 (או WebM). אפשר לייצא כך מכל תוכנת עריכה");
  }
  if (file.size > VIDEO_MAX_MB * 1024 * 1024) {
    throw new Error(
      `הקובץ גדול מ־${VIDEO_MAX_MB}MB. כדאי לייצא אותו קצר יותר או באיכות נמוכה יותר (1080p מספיק)`,
    );
  }

  const url = URL.createObjectURL(file);
  try {
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;
    await new Promise<void>((resolve, reject) => {
      video.onloadeddata = () => resolve();
      video.onerror = () =>
        reject(new Error("הדפדפן לא מצליח לנגן את הסרטון הזה. נסו לייצא MP4 (H.264)"));
    });
    if (video.duration > VIDEO_MAX_SECONDS) {
      throw new Error(`הסרטון ארוך מ־${VIDEO_MAX_SECONDS} שניות. בפתיח מספיקה לולאה קצרה`);
    }

    // A frame a moment in, past any fade from black.
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
      video.currentTime = Math.min(0.5, video.duration / 2);
    });
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.92),
    );
    if (!blob) throw new Error("לא ניתן היה להפיק תמונה מהסרטון");

    return {
      poster: new File([blob], "poster.jpg", { type: "image/jpeg" }),
      extension: file.type === "video/webm" ? "webm" : "mp4",
    };
  } finally {
    URL.revokeObjectURL(url);
  }
}
