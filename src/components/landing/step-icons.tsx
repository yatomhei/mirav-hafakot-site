import type { CSSProperties } from "react";
import { image } from "@/lib/asset";

/** One icon per process step, in order (public/images/icons); steps past the fourth reuse the last. */
const STEP_ICONS = ["step-talk", "step-idea", "step-shoot", "step-edit"];

/** The icon of the last card ("the clip is ready"). */
export const FINALE_ICON = "step-ready";

export const stepIcon = (index: number) => STEP_ICONS[Math.min(index, STEP_ICONS.length - 1)]!;

/**
 * An icon drawn in the text colour (the image is used as a shape), so the same file works
 * olive on the white cards and cream on the olive one. Decorative: the title names the step.
 */
export function MaskIcon({
  name,
  className = "",
  size = "h-[clamp(76px,7.8vw,116px)] w-[clamp(76px,7.8vw,116px)]",
}: {
  name: string;
  className?: string;
  /** Height and width classes. */
  size?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={`lp-icon ${size} ${className}`}
      style={{ "--icon": `url(${image(`icons/${name}.webp`)})` } as CSSProperties}
    />
  );
}
