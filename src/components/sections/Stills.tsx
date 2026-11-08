import type { CSSProperties } from "react";
import { stills } from "@/content/home";
import { Picture } from "@/components/ui/Picture";

/** Stills band under the works: centred heading and text, then a full-width photo mosaic. */
export function Stills() {
  return (
    <section
      id="stills"
      aria-label="צילומי סטילס"
      className="bg-olive-soft px-[var(--gutter)] pt-[clamp(72px,11vw,120px)] pb-[clamp(72px,11vw,140px)]"
    >
      <div data-reveal className="mx-auto w-full max-w-[var(--content-max)]">
        <div className="mx-auto mb-[clamp(36px,5vw,64px)] max-w-[760px] text-center">
          <h3 className="heading-section mb-5">{stills.title}</h3>
          <p className="lead">{stills.text}</p>
        </div>
        <StillsGrid />
      </div>
    </section>
  );
}

/**
 * Mosaic slots, by position (design, not content). Desktop: 12 columns, two rows of equal
 * height and mixed widths — 4·2·4·2 then 3·5·4. Phones: 2 columns; the first photo spans
 * both, the 2nd and 4th are tall (two rows), the rest fill in around them.
 */
const SLOTS = [
  { c: 4, mc: 2, mr: 1 },
  { c: 2, mc: 1, mr: 2 },
  { c: 4, mc: 1, mr: 1 },
  { c: 2, mc: 1, mr: 2 },
  { c: 3, mc: 1, mr: 1 },
  { c: 5, mc: 1, mr: 1 },
  { c: 4, mc: 1, mr: 1 },
];

export function StillsGrid() {
  const slots = Math.ceil(stills.photos.length / SLOTS.length) * SLOTS.length;
  const placeholders = slots - stills.photos.length;
  const slot = (k: number) => {
    const s = SLOTS[k % SLOTS.length]!;
    return { "--c": s.c, "--mc": s.mc, "--mr": s.mr } as CSSProperties;
  };

  return (
    <ul className="stills-grid m-0 list-none p-0" aria-label="דוגמאות לצילומי סטילס">
      {stills.photos.map((p, k) => (
        <li
          key={p.name}
          style={slot(k)}
          className="still img-zoom relative overflow-hidden rounded-[clamp(12px,1.2vw,18px)] bg-beige"
        >
          <figure className="m-0 h-full">
            <Picture photo={p} sizes="(max-width: 640px) 92vw, 40vw" />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 z-[1] h-[45%] bg-gradient-to-t from-[rgb(46_49_40/0.55)] to-transparent"
            />
            <figcaption className="absolute inset-0 z-[2] flex items-end justify-start px-[clamp(12px,1.4vw,18px)] py-[clamp(10px,1.2vw,16px)] text-right text-[clamp(14px,1.1vw,17px)] leading-[1.4] font-light text-cream opacity-[0.92] [text-shadow:0_1px_10px_rgb(0_0_0/0.3)]">
              {p.label}
            </figcaption>
          </figure>
        </li>
      ))}
      {Array.from({ length: placeholders }, (_, k) => (
        <li
          key={`ph-${k}`}
          style={slot(stills.photos.length + k)}
          aria-hidden="true"
          className="relative flex items-end overflow-hidden rounded-[clamp(12px,1.2vw,18px)] bg-beige px-[clamp(12px,1.4vw,18px)] py-[clamp(10px,1.2vw,16px)] text-[13px] tracking-[0.14em] text-ink/60"
        >
          [ תמונה ]
        </li>
      ))}
    </ul>
  );
}
