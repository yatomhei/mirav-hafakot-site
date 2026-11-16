import { useState, type CSSProperties } from "react";
import { useRise } from "@/hooks/useRise";
import { stills } from "@/content/home";
import { Picture } from "@/components/ui/Picture";
import { PhotoLightbox } from "@/components/ui/PhotoLightbox";
import type { StillPhoto } from "@/content/types";

/** Stills band under the works: centred heading and text, then a full-width photo mosaic. */
export function Stills() {
  const grid = useRise<HTMLDivElement>("ul > li");
  return (
    <section
      id="stills"
      aria-label="צילומי סטילס"
      className="px-[var(--gutter)] pt-[clamp(72px,11vw,120px)] pb-[clamp(72px,11vw,140px)]"
    >
      <div className="mx-auto w-full max-w-[var(--content-max)]">
        <div data-reveal className="mx-auto mb-[clamp(36px,5vw,64px)] max-w-[760px] text-center">
          <h3 className="heading-section mb-5">{stills.title}</h3>
          <p className="lead">{stills.text}</p>
        </div>
        {/* Photos rise in as they scroll into view, like the service cards. */}
        <div ref={grid}>
          <StillsGrid />
        </div>
      </div>
    </section>
  );
}

/**
 * Homepage mosaic slots, by position (design, not content): 3 rows of 3 photos. Desktop: 12
 * columns, rows of equal height with mixed widths — 5·3·4, 4·5·3, 3·4·5. Phones: 2 columns;
 * the 1st, 5th and 9th photos span both, the 2nd and 6th are tall (two rows), the rest fill in.
 */
const SLOTS = [
  { c: 5, mc: 2, mr: 1 },
  { c: 3, mc: 1, mr: 2 },
  { c: 4, mc: 1, mr: 1 },
  { c: 4, mc: 1, mr: 1 },
  { c: 5, mc: 2, mr: 1 },
  { c: 3, mc: 1, mr: 2 },
  { c: 3, mc: 1, mr: 1 },
  { c: 4, mc: 1, mr: 1 },
  { c: 5, mc: 2, mr: 1 },
];

function StillTile({
  p,
  style,
  natural,
  onOpen,
}: {
  p: StillPhoto;
  style?: CSSProperties;
  /** Opens this photo in the lightbox. */
  onOpen: () => void;
  /** Masonry: the tile keeps the photo's own shape. */
  natural?: boolean;
}) {
  return (
    <li style={natural ? { aspectRatio: p.ratio, ...style } : style}>
      {/* The whole tile is the first child, so a rise-in moves the tile, not the photo inside it. */}
      <figure className="still img-zoom relative m-0 h-full overflow-hidden rounded-[clamp(12px,1.2vw,18px)] bg-beige">
        <Picture photo={p} sizes="(max-width: 640px) 92vw, 40vw" />
        <button
          type="button"
          onClick={onOpen}
          aria-haspopup="dialog"
          aria-label={`הגדלת התמונה: ${p.label}`}
          className="absolute inset-0 z-[3] cursor-zoom-in rounded-[inherit]"
        />
      </figure>
    </li>
  );
}

/**
 * The stills photos. "mosaic" (homepage): the first 9 in the 3×3 mosaic above. "masonry"
 * (the stills service page): every photo in its own shape, in up to 3 columns. Clicking a
 * photo opens it in the lightbox.
 */
export function StillsGrid({ layout = "mosaic" }: { layout?: "mosaic" | "masonry" }) {
  // The lightbox steps through the photos this gallery shows.
  const [open, setOpen] = useState<number | null>(null);
  const photos = layout === "masonry" ? stills.photos : stills.photos.slice(0, SLOTS.length);
  const lightbox = <PhotoLightbox photos={photos} index={open} onIndex={setOpen} />;

  if (layout === "masonry") {
    return (
      <>
        <ul className="stills-masonry m-0 list-none p-0" aria-label="דוגמאות לצילומי סטילס">
          {photos.map((p, k) => (
            <StillTile key={p.name} p={p} natural onOpen={() => setOpen(k)} />
          ))}
        </ul>
        {lightbox}
      </>
    );
  }

  const slot = (k: number) => {
    const s = SLOTS[k]!;
    return { "--c": s.c, "--mc": s.mc, "--mr": s.mr } as CSSProperties;
  };

  return (
    <>
      <ul className="stills-grid m-0 list-none p-0" aria-label="דוגמאות לצילומי סטילס">
        {photos.map((p, k) => (
          <StillTile key={p.name} p={p} style={slot(k)} onOpen={() => setOpen(k)} />
        ))}
        {SLOTS.slice(photos.length).map((_, j) => (
          <li
            key={`ph-${j}`}
            style={slot(photos.length + j)}
            aria-hidden="true"
            className="relative flex items-end overflow-hidden rounded-[clamp(12px,1.2vw,18px)] bg-beige px-[clamp(12px,1.4vw,18px)] py-[clamp(10px,1.2vw,16px)] text-[13px] tracking-[0.14em] text-ink/60"
          >
            [ תמונה ]
          </li>
        ))}
      </ul>
      {lightbox}
    </>
  );
}
