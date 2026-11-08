import type { CSSProperties } from "react";
import { image } from "@/lib/asset";
import type { Photo } from "@/content/types";

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

/** Responsive WebP from public/images, filling its (positioned) parent with object-fit: cover. */
export function Picture({ photo, sizes, className = "", style, priority, decorative }: Props) {
  const srcSet = WIDTHS.map((w) => `${image(`${photo.name}-${w}.webp`)} ${w}w`).join(", ");
  return (
    <img
      src={image(`${photo.name}-960.webp`)}
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
