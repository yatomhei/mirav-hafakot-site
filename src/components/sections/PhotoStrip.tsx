import type { CSSProperties } from "react";
import { strip } from "@/content/home";
import { Picture } from "@/components/ui/Picture";

/** Rounded photo strip on cream; widths follow each photo's ratio. Swipeable row on mobile. */
export function PhotoStrip() {
  return (
    <section aria-label="רצועת תמונות" className="bg-cream">
      <ul
        data-reveal
        className="photo-strip no-scrollbar m-0 flex list-none gap-[clamp(8px,0.9vw,14px)] px-[clamp(16px,2vw,28px)] py-[clamp(24px,3vw,44px)]"
      >
        {strip.map((p) => (
          <li
            key={p.name}
            className="strip-ph img-zoom relative h-[clamp(200px,19vw,380px)] min-w-0 overflow-hidden rounded-[clamp(10px,1vw,16px)] bg-beige"
            style={{ flex: `${p.ratio} 1 0`, "--ar": p.ratio } as CSSProperties}
          >
            <Picture photo={p} sizes="(max-width: 760px) 70vw, 25vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}
