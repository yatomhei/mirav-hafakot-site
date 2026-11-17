import type { CSSProperties } from "react";
import { photoFile } from "@/lib/asset";
import type { Photo, Video } from "@/content/types";

const WIDTHS = [480, 960, 1600] as const;

type Props = {
  photo: Photo;
  /** The `sizes` attribute: how wide the image is drawn, so the browser picks the right file. */
  sizes: string;
  className?: string;
  style?: CSSProperties;
  /** Above-the-fold images load eagerly with high priority. */
  priority?: boolean;
  /** Decorative images (a caption or title already says what they are). */
  decorative?: boolean;
};

/** Responsive WebP (public/images or an admin upload), filling its (positioned) parent with object-fit: cover. */
export function Picture({ photo, sizes, className = "", style, priority, decorative }: Props) {
  const srcSet = WIDTHS.map((w) => `${photoFile(photo.name, w)} ${w}w`).join(", ");
  return (
    <img
      src={photoFile(photo.name, 960)}
      srcSet={srcSet}
      sizes={sizes}
      alt={decorative ? "" : photo.alt}
      aria-hidden={decorative || undefined}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      style={{ objectPosition: photo.pos ?? "center", ...style }}
    />
  );
}

/**
 * A video's cover: its own photo, or (for a video added in the admin without one) the
 * cover YouTube made for it.
 */
export function VideoThumb({ video, sizes }: { video: Video; sizes: string }) {
  if (video.thumb) return <Picture photo={video.thumb} decorative sizes={sizes} />;
  if (!video.youtubeId) return null;
  return (
    <img
      src={`https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`}
      alt=""
      aria-hidden
      loading="lazy"
      decoding="async"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}
