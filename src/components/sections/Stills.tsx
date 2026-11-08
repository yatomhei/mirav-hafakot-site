import { stills } from "@/content/home";
import { Picture } from "@/components/ui/Picture";

/** Photos per row on desktop: the grid shows two full rows, topped up with placeholders. */
const PER_ROW = 4;

/** Stills band under the works: centred heading and text, then two rows of photos. */
export function Stills() {
  return (
    <section
      id="stills"
      aria-label="צילומי סטילס"
      className="bg-olive-soft pt-[clamp(72px,11vw,120px)] pb-[clamp(72px,11vw,140px)]"
    >
      <div data-reveal className="mx-auto max-w-[var(--content-max)] px-[var(--gutter)]">
        <div className="mx-auto mb-[clamp(36px,5vw,64px)] max-w-[760px] text-center">
          <h3 className="heading-section mb-5">{stills.title}</h3>
          <p className="lead">{stills.text}</p>
        </div>
        <StillsGrid />
      </div>
    </section>
  );
}

export function StillsGrid() {
  const slots = Math.max(PER_ROW * 2, Math.ceil(stills.photos.length / PER_ROW) * PER_ROW);
  const placeholders = slots - stills.photos.length;

  return (
    <ul className="stills-grid m-0 list-none p-0" aria-label="דוגמאות לצילומי סטילס">
      {stills.photos.map((p) => (
        <li
          key={p.name}
          className="still img-zoom relative overflow-hidden rounded-[clamp(12px,1.2vw,18px)] bg-beige"
        >
          <figure className="m-0 h-full">
            <Picture photo={p} sizes="(max-width: 640px) 50vw, 25vw" />
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
          aria-hidden="true"
          className="relative flex items-end overflow-hidden rounded-[clamp(12px,1.2vw,18px)] bg-beige px-[clamp(12px,1.4vw,18px)] py-[clamp(10px,1.2vw,16px)] text-[13px] tracking-[0.14em] text-ink/60"
        >
          [ תמונה ]
        </li>
      ))}
    </ul>
  );
}
